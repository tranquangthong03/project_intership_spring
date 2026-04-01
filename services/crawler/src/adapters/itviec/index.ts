import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import type { JobRecord } from "packages/shared/src/index";
import type {
  JobSourceAdapter,
  RawJobData,
} from "src/adapters/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_NAME = "itviec";

export class ItviecAdapter implements JobSourceAdapter {
  public sourceName = SOURCE_NAME;

  /**
   * Fetches raw job data.
   * For this skeleton, it reads from a local HTML fixture.
   *
   * TODO: Implement live fetching from itviec.com with rate limiting
   * and proper error handling. Be mindful of their terms of service.
   */
  async fetch(): Promise<RawJobData[]> {
    console.log(`[${this.sourceName}] Fetching from local fixture...`);
    const filePath = path.join(__dirname, "fixture.html");
    const html = await fs.readFile(filePath, "utf-8");

    return [
      {
        source: this.sourceName,
        html,
        url: "https://itviec.com/jobs/senior-golang-developer-backend-sample",
      },
    ];
  }

  /**
   * Parses the raw HTML to extract job details.
   */
  parse(rawData: RawJobData): Partial<JobRecord> {
    const $ = cheerio.load(rawData.html);

    const title = $(".job-title").text().trim();
    const company = $(".employer-name a").text().trim();
    const location = $(".job-address span").first().text().trim();

    const skills = $(".job-tags .tag")
      .map((_, el) => $(el).text().trim())
      .get();

    const description = $(".job-description").text().trim();

    // In a real scenario, you would extract more fields like seniority,
    // work mode, salary, etc. This is a simplified example.
    const parsedData: Partial<JobRecord> = {
      source: this.sourceName,
      url: rawData.url,
      title,
      company,
      location,
      skills,
      description,
    };

    return parsedData;
  }

  /**
   * Normalizes the parsed data into the standard JobRecord format.
   */
  normalize(parsedData: Partial<JobRecord>): JobRecord | null {
    if (!parsedData.title || !parsedData.company || !parsedData.url) {
      console.error(
        `[${this.sourceName}] Missing required fields during normalization.`,
        parsedData
      );
      return null;
    }

    // This is where you would clean data, map seniority levels,
    // parse salaries, etc.
    const normalizedRecord: JobRecord = {
      id: `itviec-${Date.now()}`, // A more stable ID should be generated
      source: this.sourceName,
      url: parsedData.url,
      title: parsedData.title,
      company: parsedData.company,
      location: parsedData.location || null,
      description: parsedData.description || "",
      skills: parsedData.skills || [],
      // Set default values for fields not easily parsed from the fixture
      workMode: "unknown",
      seniority: "unknown",
      salaryMin: null,
      salaryMax: null,
      currency: null,
      roleKeywords: [], // Could be derived from title/description
    };

    return normalizedRecord;
  }
}