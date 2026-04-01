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
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {match.title} @ {match.company}
        </h3>
        <div className="score-badge">{match.matchScore}%</div>
      </div>
      <p className="reasoning">{match.reasoning}</p>

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
          {match.matchedSkills.map((skill) => (
            <span key={skill} className="pill pill-success">
              {skill}
            </span>
          ))}
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