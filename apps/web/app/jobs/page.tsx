"use client";

import { useEffect, useMemo, useState } from "react";
import type { JobFixture, ApiResponse } from "packages/shared/src/index";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("");
  const [selectedSeniority, setSelectedSeniority] = useState<string>("");

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBaseUrl}/jobs`);
        const payload: ApiResponse<{ jobs: JobFixture[] }> = await res.json();
        
        if (!payload.success) {
          throw new Error(payload.error.message || "Failed to load jobs");
        }
        
        setJobs(payload.data.jobs);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiBaseUrl]);

  // Derived filtered data
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search term
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchCompany = job.company.toLowerCase().includes(query);
        const matchSkills = job.skills.some(s => s.toLowerCase().includes(query));
        if (!matchTitle && !matchCompany && !matchSkills) return false;
      }
      
      // Work mode
      if (selectedWorkMode && job.workMode !== selectedWorkMode) {
        return false;
      }

      // Seniority
      if (selectedSeniority && job.seniority !== selectedSeniority) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedWorkMode, selectedSeniority]);

  // Unique options for filters
  const workModeOptions = useMemo(() => Array.from(new Set(jobs.map(j => j.workMode).filter(Boolean))), [jobs]);
  const seniorityOptions = useMemo(() => Array.from(new Set(jobs.map(j => j.seniority).filter(Boolean))), [jobs]);

  if (loading) {
    return (
      <main className="jobs-page">
        <h1>Jobs Directory</h1>
        <div className="status">Loading jobs...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="jobs-page">
        <h1>Jobs Directory</h1>
        <div className="status status-error">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="jobs-page">
      <h1>Jobs Directory</h1>
      <p>Browse and filter all collected IT job opportunities.</p>

      {jobs.length > 0 ? (
        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            value={selectedWorkMode} 
            onChange={(e) => setSelectedWorkMode(e.target.value)}
          >
            <option value="">All Work Modes</option>
            {workModeOptions.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
          <select 
            value={selectedSeniority} 
            onChange={(e) => setSelectedSeniority(e.target.value)}
          >
            <option value="">All Seniorities</option>
            {seniorityOptions.map(sen => (
              <option key={sen} value={sen}>{sen}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="empty-state">No jobs found in the system. Run the crawler to ingest jobs.</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">No jobs match your current filters.</div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h2>{job.title}</h2>
              </div>
              <div className="job-card-meta">
                <strong>{job.company}</strong>
                <span>•</span>
                <span>{job.location || "Location unknown"}</span>
                <span>•</span>
                <span>{job.workMode || "Work mode unknown"}</span>
                <span>•</span>
                <span>{job.seniority || "Seniority unknown"}</span>
                <span>•</span>
                <span>Source: {job.source}</span>
              </div>
              <div className="job-card-desc">
                {job.description.length > 250 
                  ? job.description.slice(0, 250) + "..." 
                  : job.description}
              </div>
              <div className="pills">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="pill">{skill}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
