"use client";

import { useMemo, useState } from "react";
import type {
  ApiResponse,
  CandidateProfile,
  JobMatch,
  UploadCvData,
} from "packages/shared/src/index";
import { ResultsView } from "../components/ResultsView";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type AnalysisResult = {
  candidateProfile: CandidateProfile;
  matches: JobMatch[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  }, []);

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setAnalysisResult(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please choose a PDF file.");
      return;
    }

    setStatus("uploading");
    setMessage("Analyzing CV and matching jobs...");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiBaseUrl}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      const payload: ApiResponse<UploadCvData & AnalysisResult> =
        await response.json();

      if (!response.ok || !payload.success) {
        setStatus("error");
        setMessage(payload?.error?.message || "Analysis failed.");
        return;
      }

      setStatus("success");
      setMessage(`Analysis complete for ${payload.data.fileName}.`);
      setAnalysisResult({
        candidateProfile: payload.data.candidateProfile,
        matches: payload.data.matches,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Analysis failed.");
    }
  };

  if (status === "success" && analysisResult) {
    return (
      <main>
        <ResultsView
          profile={analysisResult.candidateProfile}
          matches={analysisResult.matches}
        />
        <div className="reset-container">
          <button onClick={handleReset}>Analyze Another CV</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>AI Job Matcher</h1>
      <p>Upload a PDF CV to find the best job matches for you.</p>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-input">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <span>{file ? file.name : "Choose PDF file"}</span>
        </label>
        <button type="submit" disabled={status === "uploading"}>
          {status === "uploading" ? "Analyzing..." : "Analyze CV"}
        </button>
      </form>

      {status !== "idle" && (
        <div className={`status status-${status}`}>
          <strong>Status:</strong> {message || status}
        </div>
      )}
    </main>
  );
}
