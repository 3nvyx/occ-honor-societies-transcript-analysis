import { TRANSCRIPT_SCHEMAS, WORKFLOW_STEPS } from '../../lib/site-data';

export const metadata = {
  title: 'How This Program Works',
  description: 'See how the OCC honor society checker reads transcripts and evaluates eligibility.'
};

export default function HowItWorksPage() {
  return (
    <section className="page-section">
      <div className="page-frame">
        <div className="page-header">
          <div>
            <h1 className="page-title">Transcript review, step by step</h1>
          </div>
          <p className="page-description full-width-intro with-top-padding">
            The app only works from text-based transcript PDFs. It extracts the text layer, parses transcript facts,
            checks the OCC catalog mapping, and runs the current society logic to return the review.
          </p>
        </div>

        <div className="steps-grid">
          {WORKFLOW_STEPS.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h2 className="step-title">{step.title}</h2>
              <p className="step-copy">
                {step.descriptionBefore ? step.descriptionBefore : ''}
                {step.linkHref ? (
                  <a
                    className="inline-link"
                    href={step.linkHref}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {step.linkLabel}
                  </a>
                ) : null}
                {step.descriptionAfter ? step.descriptionAfter : step.description}
              </p>
            </article>
          ))}
        </div>

        <section className="schema-section">
          <div className="result-section-header">
            <h2 className="section-title">Schema pulled from the transcript</h2>
            <p className="page-description schema-intro">
              These are the main fields the review pulls out from the uploaded transcript before the honor society
              rules are checked.
            </p>
          </div>

          <div className="schema-grid">
            {TRANSCRIPT_SCHEMAS.map((schema) => (
              <article className="schema-card" key={schema.name}>
                <h3 className="schema-title">{schema.name}</h3>
                <p className="step-copy">{schema.description}</p>
                <pre className="schema-code">
                  <code>{schema.code}</code>
                </pre>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
