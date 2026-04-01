import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { JobRecord } from "packages/shared/src/index.js";
import type { StorageInterface } from "./StorageInterface.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// e:/WORK SPACE/project_sh_intership/services/crawler/src/storage
const rootDir = path.resolve(__dirname, "../../../../"); // root of project
export const JOB_DATA_FILE = path.join(rootDir, "data", "jobs.json");

export class JsonFileJobStorage implements StorageInterface {
  async init(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(JOB_DATA_FILE), { recursive: true });
      await fs.access(JOB_DATA_FILE);
    } catch {
      // File doesn't exist, create an empty array as fallback
      await fs.writeFile(JOB_DATA_FILE, JSON.stringify([]), "utf8");
    }
  }

  async list(): Promise<JobRecord[]> {
    await this.init();
    try {
      const data = await fs.readFile(JOB_DATA_FILE, "utf8");
      return JSON.parse(data) as JobRecord[];
    } catch (error) {
      console.warn("Failed to read items from storage", error);
      return [];
    }
  }

  async save(job: JobRecord): Promise<boolean> {
    const jobs = await this.list();

    const exists = jobs.find((j) => j.id === job.id || j.url === job.url);
    if (exists) {
      return false; // deduplicate
    }

    jobs.push(job);
    await fs.writeFile(JOB_DATA_FILE, JSON.stringify(jobs, null, 2), "utf8");
    return true;
  }

  async saveMany(jobs: JobRecord[]): Promise<number> {
    const existingJobs = await this.list();
    const urlSet = new Set(existingJobs.map((j) => j.url));
    const idSet = new Set(existingJobs.map((j) => j.id));

    let savedCount = 0;

    for (const job of jobs) {
      if (!urlSet.has(job.url) && !idSet.has(job.id)) {
        existingJobs.push(job);
        urlSet.add(job.url);
        idSet.add(job.id);
        savedCount++;
      }
    }

    if (savedCount > 0) {
      await fs.writeFile(
        JOB_DATA_FILE,
        JSON.stringify(existingJobs, null, 2),
        "utf8"
      );
    }

    return savedCount;
  }
}