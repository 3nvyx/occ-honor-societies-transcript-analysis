import UploadAnalyzer from '../components/upload-analyzer';

export default function HomePage() {
  return (
    <section className="page-section">
      <div className="page-frame">
        <div className="hero-grid">
          <div className="hero-copy-block">
            <span className="page-kicker">home</span>
            <h1 className="hero-title">
              <span className="hero-title-line first">Honors</span>
              <span className="hero-title-line second">Eligibility</span>
            </h1>
            <p className="pt-20 page-description">
              Upload a transcript PDF and get a clear readout of which OCC honor societies currently qualify. This
              tool reads the transcript text layer, checks the OCC catalog mapping, and returns the current rule
              results without OCR or machine learning.
            </p>
          </div>

          <UploadAnalyzer />
        </div>
      </div>
    </section>
  );
}
