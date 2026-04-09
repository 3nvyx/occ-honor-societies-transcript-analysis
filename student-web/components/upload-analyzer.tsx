'use client';

import { useMemo, useState } from 'react';
import { FileUp } from 'lucide-react';
import { useAnalysisStore } from './analysis-provider';
import { extractPdfTextFromFiles, hasUsableTranscriptText } from '../lib/client/extract-pdf-text';

function formatMetric(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
}

export default function UploadAnalyzer() {
  const { files, fileMeta, result, setFiles, setResult } = useAnalysisStore();
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileLabel = useMemo(() => {
    if (!files.length) return 'No PDF selected yet.';
    if (files.length === 1) return files[0].name;
    return `${files.length} transcript PDFs selected`;
  }, [files]);

  const persistedFileLabel = useMemo(() => {
    if (!fileMeta.length) return '';
    if (fileMeta.length === 1) return `${fileMeta[0].name} loaded`;
    return `${fileMeta.length} transcript PDFs loaded`;
  }, [fileMeta]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setResult(null);

    if (!files.length) {
      setErrorMessage('Choose at least one transcript PDF before running the check.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage('Reading the PDF text layer...');

      const extraction = await extractPdfTextFromFiles(files);
      if (!hasUsableTranscriptText(extraction.combinedText)) {
        throw new Error('This upload does not contain a usable text layer. Please upload a text-based PDF export.');
      }

      setStatusMessage('Checking honor society eligibility...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extractedText: extraction.combinedText,
          fileNames: extraction.fileNames
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'The transcript could not be analyzed.');
      }

      setResult(payload);
      setStatusMessage('');
    } catch (error) {
      setStatusMessage('');
      setErrorMessage(error.message || 'The transcript could not be analyzed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="upload-card">
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="upload-box">
            <input
              id="transcript-upload"
              className="upload-input"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => {
                setFiles(Array.from(event.target.files || []));
                setResult(null);
                setErrorMessage('');
              }}
            />
            <label className="upload-dropzone" htmlFor="transcript-upload">
              <FileUp aria-hidden="true" className="upload-drop-icon" strokeWidth={1.6} />
              <span className="upload-sr-only">Upload transcript PDF</span>
            </label>
          </div>

          <div className="upload-meta">
            <p className="upload-file-label">{files.length ? fileLabel : persistedFileLabel || fileLabel}</p>
            <p className="upload-note">
              The checker reads the transcript text layer, detects DD214 language from the transcript itself, checks
              the course catalog, and returns the current society review.
            </p>
          </div>

          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <button className="upload-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Analyzing transcript...' : 'Check eligibility'}
          </button>
        </form>
      </section>

      {result ? (
        <div className="results-shell">
          <section className="result-section summary-section">
            <div className="result-section-header">
              <span className="page-kicker">analysis</span>
              <h2 className="section-title">Transcript summary</h2>
            </div>

            <div className="summary-grid">
              <article className="metric-card">
                <span className="metric-label">Student</span>
                <span className="metric-value">{result.transcript.name}</span>
              </article>
              <article className="metric-card">
                <span className="metric-label">Cumulative GPA</span>
                <span className="metric-value">{formatMetric(result.transcript.gpa)}</span>
              </article>
              <article className="metric-card">
                <span className="metric-label">Earned Hours</span>
                <span className="metric-value">{formatMetric(result.transcript.earnedHours)}</span>
              </article>
              <article className="metric-card">
                <span className="metric-label">Current Enrollment</span>
                <span className="metric-value">{formatMetric(result.transcript.currentEnrollmentHours)}</span>
              </article>
              <article className="metric-card">
                <span className="metric-label">DD214 Mention</span>
                <span className="metric-value">{result.transcript.dd214Detected ? 'Yes' : 'No'}</span>
              </article>
            </div>
          </section>

          <section className="result-section">
            <div className="result-section-header">
              <span className="page-kicker">result</span>
              <h2 className="section-title">Currently qualified</h2>
            </div>

            {result.qualifiedSocieties.length ? (
              <div className="society-grid">
                {result.qualifiedSocieties.map((society) => (
                  <article key={society.code} className="society-card qualifies">
                    <div className="society-topline">
                      <div>
                        <span className="society-code">{society.code}</span>
                        <h3 className="society-name">{society.name}</h3>
                      </div>
                      <span className="status-badge qualifies">Qualified</span>
                    </div>

                    <div className="society-meta">
                      <span className="meta-pill">Level: {society.level || 'Not specified'}</span>
                      <span className="meta-pill">Qual Units: {formatMetric(society.qualifyingUnits)}</span>
                      <span className="meta-pill">Qual GPA: {formatMetric(society.qualifyingGpa)}</span>
                    </div>

                    <p className="society-reason">{society.reason}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No societies are currently qualified from this transcript. The full review below still shows which
                requirements are missing.
              </div>
            )}
          </section>

          <section className="result-section">
            <div className="result-section-header">
              <span className="page-kicker">details</span>
              <h2 className="section-title">Full eligibility review</h2>
            </div>

            <div className="society-grid compact">
              {result.allSocieties.map((society) => (
                <article key={society.code} className={`society-card ${society.qualifies ? 'qualifies' : 'not-qualified'}`}>
                  <div className="society-topline">
                    <div>
                      <span className="society-code">{society.code}</span>
                      <h3 className="society-name">{society.name}</h3>
                    </div>
                    <span className={`status-badge ${society.qualifies ? 'qualifies' : 'not-qualified'}`}>
                      {society.qualifies ? 'Qualified' : 'Not yet'}
                    </span>
                  </div>

                  <p className="society-reason">{society.reason}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
