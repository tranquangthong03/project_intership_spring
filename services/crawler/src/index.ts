import { ItviecAdapter } from "./adapters/itviec/index.js";
import { ingestJobPipeline, listIngestedJobs } from "./pipeline.js";

async function main() {
  console.log("--- Starting Crawler Skeleton & Ingestion Pipeline ---");

  const itviecAdapter = new ItviecAdapter();

  try {
    // 1. Fetch raw data
    const rawJobs = await itviecAdapter.fetch();
    console.log(`Fetched ${rawJobs.length} raw job(s) from ${itviecAdapter.sourceName}.`);

    // 2. Process and Ingest
    for (const rawJob of rawJobs) {
      const parsedJob = itviecAdapter.parse(rawJob);
      const normalizedJob = itviecAdapter.normalize(parsedJob);

      if (normalizedJob) {
        await ingestJobPipeline(normalizedJob);
      } else {
        console.log("Normalization failed or skipped.");
      }
    }

    // 3. Test Deduplication
    console.log("\n--- Testing Deduplication (Running again) ---");
    for (const rawJob of rawJobs) {
      const parsedJob = itviecAdapter.parse(rawJob);
      const normalizedJob = itviecAdapter.normalize(parsedJob);
      if (normalizedJob) {
        await ingestJobPipeline(normalizedJob);
      }
    }

    // 4. Read to verify storage
    console.log("\n--- Listing Ingested Jobs in Storage ---");
    const jobs = await listIngestedJobs();
    console.log(`Total jobs currently in storage: ${jobs.length}`);

  } catch (error) {
    console.error("\n--- An error occurred during the crawl process ---");
    console.error(error);
  } finally {
    console.log("\n--- Crawler Skeleton Finished ---");
  }
}

main();