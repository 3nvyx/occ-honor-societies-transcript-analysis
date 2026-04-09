import { SOCIETY_RULES } from '../../lib/site-data';

export const metadata = {
  title: 'OCC Honor Society Rules',
  description: 'Current OCC honor society rules and prerequisites shown from the active code logic.'
};

export default function RulesPage() {
  return (
    <section className="page-section">
      <div className="page-frame">
        <div className="page-header">
          <h1 className="page-title">Current rules and prerequisites</h1>
          <p className="page-description full-width-intro">
            These summaries mirror the current society rule logic in the codebase. The actual qualifying courses still
            come from the OCC course catalog mapping used by the analyzer. The app only works from text-based
            transcript PDFs. It extracts the text layer, parses transcript facts, checks the OCC catalog mapping, and
            runs the current society logic to return the review.
          </p>
        </div>

        <div className="rules-grid">
          {SOCIETY_RULES.map((society) => (
            <article className="rule-card" key={society.code}>
              <div className="rule-card-top">
                <div>
                  <span className="society-code">{society.code}</span>
                  <h2 className="rule-card-title">{society.name}</h2>
                </div>
                <span className="rule-track">{society.track}</span>
              </div>

              {society.occOnly ? <p className="rule-badge">OCC catalog courses only</p> : null}

              <ul className="rule-list">
                {society.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
