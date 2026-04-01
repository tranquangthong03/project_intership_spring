import { ItviecAdapter } from "./adapters/itviec/index.js";

async function main() {
  console.log("--- Starting Crawler Skeleton ---");

  // Initialize the adapter for ITViec
  const itviecAdapter = new ItviecAdapter();

  try {
    // 1. Fetch raw data (from local fixture in this skeleton)
    const rawJobs = await itviecAdapter.fetch();
    console.log(`Fetched ${rawJobs.length} raw job(s) from ${itviecAdapter.sourceName}.`);

    // 2. Process each raw job through the parse and normalize pipeline
    for (const rawJob of rawJobs) {
      console.log("\n--- Processing raw job ---");
      console.log("URL:", rawJob.url);

      // 2a. Parse the raw HTML
      const parsedJob = itviecAdapter.parse(rawJob);
      console.log("\n[Parsed Data]:");
      console.log(parsedJob);

      // 2b. Normalize the parsed data into a standard format
      const normalizedJob = itviecAdapter.normalize(parsedJob);
      if (normalizedJob) {
        console.log("\n[Normalized JobRecord]:");
        console.log(normalizedJob);
      } else {
        console.log("\nNormalization failed or skipped.");
      }
    }
  } catch (error) {
    console.error("\n--- An error occurred during the crawl process ---");
    console.error(error);
  } finally {
    console.log("\n--- Crawler Skeleton Finished ---");
  }
}

main();