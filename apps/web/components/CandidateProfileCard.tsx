import type { CandidateProfile } from "packages/shared/src/index";

type Props = {
  profile: CandidateProfile;
};

export function CandidateProfileCard({ profile }: Props) {
  return (
    <section className="card" style={{ borderTop: "4px solid #2563eb", background: "#f8fafc", marginBottom: "24px" }}>
      <h2 className="card-title" style={{ color: "#1e3a8a", marginBottom: "16px" }}>Candidate Profile Summary</h2>
      <div className="profile-grid">
        <div>
          <strong style={{ color: "#475569" }}>Full Name:</strong> {profile.fullName || "N/A"}
        </div>
        <div>
          <strong style={{ color: "#475569" }}>Email:</strong> {profile.email || "N/A"}
        </div>
        <div>
          <strong style={{ color: "#475569" }}>Location:</strong> {profile.location || "N/A"}
        </div>
        <div>
          <strong style={{ color: "#475569" }}>Experience:</strong> {profile.yearsOfExperience} years
        </div>
      </div>
      <div className="summary" style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
        <strong style={{ color: "#475569" }}>Summary:</strong>
        <p style={{ marginTop: "8px", fontStyle: "italic", color: "#334155" }}>
          {profile.summary || "No summary provided"}
        </p>
      </div>
      <div className="pills-container" style={{ marginTop: "16px" }}>
        <strong style={{ color: "#475569" }}>Key Roles:</strong>
        <div className="pills">
          {profile.roles.length > 0 ? (
            profile.roles.map((role) => (
              <span key={role} className="pill" style={{ background: "#e2e8f0", color: "#0f172a" }}>
                {role}
              </span>
            ))
          ) : (
            <span style={{ color: "#64748b", fontSize: "14px" }}>No roles extracted</span>
          )}
        </div>
      </div>
      <div className="pills-container">
        <strong style={{ color: "#475569" }}>Extracted Skills:</strong>
        <div className="pills">
          {profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <span key={skill} className="pill" style={{ background: "#dbeafe", color: "#1e40af" }}>
                {skill}
              </span>
            ))
          ) : (
            <span style={{ color: "#64748b", fontSize: "14px" }}>No skills extracted</span>
          )}
        </div>
      </div>
    </section>
  );
}
