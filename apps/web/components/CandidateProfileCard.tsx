import type { CandidateProfile } from "packages/shared/src/index";

type Props = {
  profile: CandidateProfile;
};

export function CandidateProfileCard({ profile }: Props) {
  return (
    <section className="card">
      <h2 className="card-title">Candidate Profile</h2>
      <div className="profile-grid">
        <div>
          <strong>Full Name:</strong> {profile.fullName || "N/A"}
        </div>
        <div>
          <strong>Email:</strong> {profile.email || "N/A"}
        </div>
        <div>
          <strong>Location:</strong> {profile.location || "N/A"}
        </div>
        <div>
          <strong>Experience:</strong> {profile.yearsOfExperience} years
        </div>
      </div>
      <div className="summary">
        <strong>Summary:</strong>
        <p>{profile.summary || "N/A"}</p>
      </div>
      <div className="pills-container">
        <strong>Roles:</strong>
        <div className="pills">
          {profile.roles.map((role) => (
            <span key={role} className="pill">
              {role}
            </span>
          ))}
        </div>
      </div>
      <div className="pills-container">
        <strong>Skills:</strong>
        <div className="pills">
          {profile.skills.map((skill) => (
            <span key={skill} className="pill">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}