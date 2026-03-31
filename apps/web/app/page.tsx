"use client";

import { useMemo, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please choose a PDF file.");
      return;
    }

    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiBaseUrl}/upload-cv`, {
        method: "POST",
        body: formData
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setStatus("error");
        setMessage(payload?.error?.message || "Upload failed.");
        return;
      }

      setStatus("success");
      setMessage(`Uploaded: ${payload.data.fileName}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  return (
    <main>
      <h1>AI Job Matcher</h1>
      <p>Upload a PDF CV to begin.</p>

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
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className={`status status-${status}`}>
        <strong>Status:</strong> {status}
        {message ? <span> - {message}</span> : null}
      </div>
    </main>
  );
}
