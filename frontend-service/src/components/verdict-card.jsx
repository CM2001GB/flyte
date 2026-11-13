export default function VerdictCard({ name, verdict }) {
  const isPassed = verdict.verdict === 'pass';

  return (
    <div className={`verdict-card ${isPassed ? 'pass' : 'fail'}`}>
      <div className="verdict-header">
        <span className="verdict-icon">{isPassed ? '✓ ' : '✗ '}</span>
        <strong>{name.toUpperCase()}</strong>
        <span className="verdict-label">{isPassed ? ' PASS' : ' FAIL'}</span>
      </div>

      {verdict.breached_conditions && verdict.breached_conditions.length > 0 && (
        <ul className="breached-list">
          {verdict.breached_conditions.map((condition, i) => {
            // find matching notam detail if available
            const detail = verdict.notams?.find(n => n.notam_id === condition);
            return (
              <li key={i}>
                <strong>{condition}</strong>
                {detail?.label && <span>: {detail.label.toUpperCase()}</span>}
                {detail?.description && (
                  <p className="notam-description">{detail.description}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {verdict.uas_exemptions && verdict.uas_exemptions.length > 0 && (
        <div className="uas-exemptions">
          <p>UAS exemptions apply:</p>
          <ul>
            {verdict.uas_exemptions.map((id, i) => (
              <li key={i}>{id}: UAS may fly in accordance with guidelines</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}