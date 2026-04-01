import type { JobRecord } from "packages/shared/src/index";

/**
 * Represents raw, unprocessed data scraped from a source.
 * The structure is flexible and depends on the source.
 */
export type RawJobData = {
  source: string;
  html: string;
  url: string;
};

/**
 * Defines the contract for a job source adapter.
 * Each adapter is responsible for fetching, parsing, and normalizing
 * job data from a specific source.
 */
export interface JobSourceAdapter {
  sourceName: string;

  /**
   * Fetches raw job listings from the source.
   * This could be from a live URL or a local fixture.
   */
  fetch(): Promise<RawJobData[]>;

  /**
   * Parses the raw data (e.g., HTML) to extract job details.
   * @param rawData The raw data to parse.
   */
  parse(rawData: RawJobData): Partial<JobRecord>;

  /**
   * Normalizes the parsed data into the standard JobRecord format.
   * @param parsedData The partially structured data from the parse step.
   */
  normalize(parsedData: Partial<JobRecord>): JobRecord | null;
}