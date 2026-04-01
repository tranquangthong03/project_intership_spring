import { useState, useMemo } from "react";
import type { CandidateProfile, JobMatch } from "packages/shared/src/index";
import { CandidateProfileCard } from "./CandidateProfileCard";
import { JobMatchCard } from "./JobMatchCard";import { ChatAssistant } from "./ChatAssistant";
type Props = {
  profile: CandidateProfile;
  matches: JobMatch[];
};

export function ResultsView({ profile, matches }: Props) {
  const [filterRec, setFilterRec] = useState<string>("all");
  const [limit, setLimit] = useState<number>(0); // 0 means all
  
  const processedMatches = useMemo(() => {
    let result = [...matches];
    
    // Sort logic (assuming initially sorted by score, but let's enforce it)
    result.sort((a, b) => b.matchScore - a.matchScore);
    
    if (filterRec !== "all") {
      result = result.filter(m => m.recommendation === filterRec);
    }
    
    if (limit > 0) {
      result = result.slice(0, limit);
    }
    
    return result;
  }, [matches, filterRec, limit]);

  return (
    <div className="results-view">
      <CandidateProfileCard profile={profile} />

      <section className="scoring-explainer">
        <h4>How Scoring Works</h4>
        <ul>
          <li><strong>Score:</strong> Based on skills match, role fit, experience overlap, and location.</li>
          <li><strong>Recommendation:</strong> <em>Apply</em> (&ge; 75%), <em>Consider</em> (50 - 74%), <em>Low Fit</em> (&lt; 50%).</li>
          <li><strong>AI Evaluated:</strong> Uses OpenAI if enabled to enhance semantic matching. Fallbacks to strict rules otherwise.</li>
        </ul>
      </section>

      <div>
        <h2 className="results-header" style={{ marginBottom: "16px", borderBottom: "none" }}>Job Recommendations</h2>
        <div className="results-controls">
          <label htmlFor="filter-rec">Filter by:</label>
          <select 
            id="filter-rec" 
            value={filterRec} 
            onChange={(e) => setFilterRec(e.target.value)}
            style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="all">All Recommendations</option>
            <option value="apply">Apply Only (High Fit)</option>
            <option value="consider">Consider (Medium Fit)</option>
            <option value="low-fit">Low Fit</option>
          </select>

          <label htmlFor="limit-res" style={{ marginLeft: "16px" }}>Show:</label>
          <select 
            id="limit-res" 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value={0}>All matches</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      <div className="matches-grid">
        {processedMatches.length > 0 ? (
          processedMatches.map((match) => (
            <JobMatchCard key={match.jobId} match={match} />
          ))
        ) : (
          <div className="empty-state">
            <p>No jobs found matching the current filters.</p>
            <button onClick={() => { setFilterRec("all"); setLimit(0); }} style={{ marginTop: "16px" }}>Clear Filters</button>
          </div>
        )}
      </div>

      <ChatAssistant profile={profile} matches={matches} />
    </div>
  );
}