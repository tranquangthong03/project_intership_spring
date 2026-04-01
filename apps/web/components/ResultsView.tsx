import type { CandidateProfile, JobMatch } from "packages/shared/src/index";
import { CandidateProfileCard } from "./CandidateProfileCard";
import { JobMatchCard } from "./JobMatchCard";

type Props = {
  profile: CandidateProfile;
  matches: JobMatch[];
};

export function ResultsView({ profile, matches }: Props) {
  return (
    <div className="results-view">
      <CandidateProfileCard profile={profile} />
      <h2 className="results-header">Top Job Matches</h2>
      <div className="matches-grid">
        {matches.map((match) => (
          <JobMatchCard key={match.jobId} match={match} />
        ))}
      </div>
    </div>
  );
}