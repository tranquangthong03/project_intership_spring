import type { JobRecord } from "packages/shared/src/index.js";
import { JsonFileJobStorage } from "./storage/JsonFileStorage.js";

const storage = new JsonFileJobStorage();

export const ingestJobPipeline = async (job: JobRecord) => {
  // Validate shape (minimal validation)
  if (!job.id || !job.url || !job.title || !job.company) {
    console.error("[Ingestion] Failed validation: Missing required fields", job);
    return false;
  }

  try {
    const saved = await storage.save(job);
    if (saved) {
      console.log(`[Ingestion] Ingested successfully: ${job.title} at ${job.company}`);
    } else {
      console.log(`[Ingestion] Deduplicated (already exists): ${job.title} at ${job.company}`);
    }
    return saved;
  } catch (error) {
    console.error("[Ingestion] Error while trying to save into storage", error);
    return false;
  }
};

export const listIngestedJobs = async (): Promise<JobRecord[]> => {
  return await storage.list();
};