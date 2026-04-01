import type { JobMatch } from "packages/shared/src/index";

type Props = {
  match: JobMatch;
};

function getPillClass(fit: string) {
  switch (fit) {
    case "high":
      return "pill-success";
    case "medium":
      return "pill-warning";
    case "low":
      return "pill-danger";
    default:
      return "";
  }
}

export function JobMatchCard({ match }: Props) {
  const borderClass = `border-${match.recommendation}`;
  const badgeClass = `rec-${match.recommendation}`;

  return (
    <div className={`card match-card ${borderClass}`}>
      <span className={`recommendation-badge ${badgeClass}`}>
        {match.recommendation.replace("-", " ")}
      </span>

      <div className="match-header-info">
        <div className="match-score-lg">
          {match.matchScore}%
        </div>
        <div>
          <h3 className="card-title">
            {match.title}
          </h3>
          <div style={{ color: "#4b5563", marginTop: "4px" }}>
            @ {match.company}
          </div>
        </div>
      </div>

      <p className="reasoning">{match.reasoning}</p>

      {match.isAIAssisted && (
        <div className="ai-assisted-badge">
          ✨ AI Evaluated
        </div>
      )}

      <div className="fit-pills">
        <span className={`pill ${getPillClass(match.experienceFit)}`}>
          Experience: {match.experienceFit}
        </span>
        <span className={`pill ${getPillClass(match.roleFit)}`}>
          Role: {match.roleFit}
        </span>
      </div>

      <div className="pills-container">
        <strong>Matched Skills:</strong>
        <div className="pills">
          {match.matchedSkills.length > 0 ? (
            match.matchedSkills.map((skill) => (
              <span key={skill} className="pill pill-success">
                {skill}
              </span>
            ))
          ) : (
            <span className="pill">None</span>
          )}
        </div>
      </div>

      {match.missingSkills.length > 0 && (
        <div className="pills-container">
          <strong>Missing Skills:</strong>
          <div className="pills">
            {match.missingSkills.map((skill) => (
              <span key={skill} className="pill pill-danger">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}