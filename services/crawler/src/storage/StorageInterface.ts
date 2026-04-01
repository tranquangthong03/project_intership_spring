import type { JobRecord } from "packages/shared/src/index.js";

export interface StorageInterface {
  /**
   * Initialize the storage (e.g. create file, connect to DB).
   */
  init(): Promise<void>;

  /**
   * Save a single job record.
   * Returns true if saved, false if skipped (e.g., deduplicated).
   */
  save(job: JobRecord): Promise<boolean>;

  /**
   * Save an array of job records.
   * Returns the count of successfully saved new records.
   */
  saveMany(jobs: JobRecord[]): Promise<number>;

  /**
   * List all stored job records.
   */
  list(): Promise<JobRecord[]>;
}