---
name: ai-job-matcher
description: build, extend, or review a web app or chatbot that collects publicly accessible it job opportunities from approved sources, parses an uploaded cv, and matches candidates to suitable roles with structured scoring. use this skill when chatgpt is asked to vibe code, architect, scaffold, implement, refactor, or debug a job aggregation and cv matching product, including crawler design, cv parsing, llm-based fit scoring, mongodb schema design, backend apis, frontend flows, and deployment planning. do not use this skill to bypass authentication, captchas, private groups, anti-bot protections, or terms of service.
---

# AI Job Matcher & Reviewer

Follow this skill when building the original project idea: a web app or chatbot that gathers IT job opportunities from approved sources, accepts a user's CV upload, extracts structured profile data, and recommends suitable jobs with clear fit scores and reasons.

Keep the workflow opinionated, incremental, and production-minded. Default to an MVP that can run locally end to end before expanding to more sources or more automation.

## Core objective

Build a system that:
1. Collects job postings from approved job sources.
2. Normalizes and stores job data.
3. Accepts CV upload in PDF format.
4. Extracts and structures candidate profile data.
5. Compares candidate profile against stored jobs.
6. Returns ranked recommendations with a score and concise rationale.

## Product mode selection

When the user asks to build this project, select one of these modes and state the assumption if the user did not specify it:

- **Mode A: Web app MVP** — default choice. Best for upload, dashboard, filtering, and review.
- **Mode B: Chatbot-first assistant** — use when the user explicitly wants chat-based interaction as the primary interface.
- **Mode C: Hybrid** — use when the user explicitly wants both a web UI and a conversational assistant.

Default to **Mode A: Web app MVP** unless the user clearly asks for chatbot-first behavior.

## Scope policy

Always scope work in phases.

### MVP v1
Build only these capabilities unless the user explicitly expands scope:
1. Ingest jobs from **one approved source first**.
2. Upload a single CV PDF.
3. Parse CV into structured candidate data.
4. Store jobs and candidate analysis.
5. Generate top matching jobs with score and explanation.
6. Show results in a clean UI with basic filtering.

### v2
Add one more approved source, richer filtering, saved jobs, and periodic sync.

### v3
Add chatbot workflow, user accounts, notifications, and admin analytics.

## Non-goals for MVP

Do not include these in MVP unless explicitly requested:
- Multi-tenant enterprise account model.
- Real-time scraping from many sources simultaneously.
- Browser automation against login-protected or anti-bot-heavy platforms.
- Full ATS workflow.
- Auto-apply to jobs.
- CV rewriting or cover letter generation unless separately requested.

## Mandatory compliance and data collection policy

Apply these rules strictly.

### Allowed
- Use public job listing pages that are accessible without login and do not require bypassing technical controls.
- Prefer official APIs, feeds, exports, public search pages, or partner integrations when available.
- Use polite crawling with throttling, retries, and deduplication.
- Log failures and mark source health.

### Disallowed
- Do not bypass authentication, captchas, paywalls, or anti-bot systems.
- Do not scrape private communities, private Facebook groups, or any login-gated content.
- Do not automate behavior that violates a site's terms.
- Do not invent unsupported integrations.
- Do not claim a source is approved unless it is explicitly confirmed in the task context.

### Source handling rule
When a requested source is risky, unclear, or likely to be restricted:
1. Flag the risk clearly.
2. Recommend a safer ingestion path such as API, RSS, email digest parsing, manual import, CSV upload, or user-provided export.
3. Continue building the rest of the system with mocks or adapters so the product remains implementable.

### Practical default for this project
Treat sources like ITViec or other public job boards as potentially usable only when public pages can be accessed lawfully and lightly. Treat sources like Facebook Groups as **not approved by default** unless the user explicitly provides a lawful, supported ingestion method.

## Preferred technical architecture

Unless the user explicitly chooses another stack, use this default architecture:

### Recommended stack
- **Frontend:** Next.js with TypeScript
- **Backend API:** Next.js route handlers or FastAPI
- **Crawler/Ingestion:** Python
- **Database:** MongoDB
- **File storage:** local `uploads/` for local development, cloud storage optional later
- **AI integration:** LLM API with strict JSON output

### Architecture rule
Prefer this project layout:

```text
apps/
  web/
services/
  api/
  crawler/
packages/
  shared-types/
  shared-utils/
docs/
```

If keeping the repo simpler for MVP, this fallback is acceptable:

```text
client/
server/
crawler/
shared/
```

### Separation of concerns
- Keep crawler logic separate from the web frontend.
- Keep LLM prompt logic isolated in dedicated services or modules.
- Store shared schemas and types in one place.
- Do not hardcode prompts inside UI components.
- Do not mix scraping logic into request handlers unless the user explicitly wants a minimal demo.

## Build workflow

Use this sequence for implementation unless the user requests a different order:

1. Define stack and scope.
2. Define schemas and API contracts.
3. Scaffold repository and shared types.
4. Implement one ingestion adapter.
5. Implement CV upload and parsing.
6. Implement matching and scoring.
7. Implement UI pages and progress states.
8. Add tests, docs, and run instructions.

When asked to vibe code, prefer producing runnable slices of the system in this order rather than large speculative code dumps.

## Approved source adapter pattern

When building ingestion, implement each source as an adapter with a common interface.

Required adapter responsibilities:
- fetch raw listing pages or records
- extract normalized fields
- return stable external id when possible
- provide source metadata
- report ingestion errors

Suggested interface:

```ts
export interface JobSourceAdapter {
  sourceName: string;
  fetchListings(): Promise<RawJobRecord[]>;
  normalize(record: RawJobRecord): NormalizedJobRecord | null;
}
```

Always start with **one source only** for MVP.

## Crawler rules

Use these rules when implementing a crawler.

### Tooling
- Use `requests` + `BeautifulSoup4` for static HTML.
- Use a browser automation tool only when necessary for publicly accessible JS-rendered pages.
- Use `pandas` only for normalization or export tasks, not for every stage by default.

### Reliability
- Add request timeout.
- Add retry with backoff.
- Add user-agent configuration.
- Add per-source rate limiting.
- Add structured logging.
- Add duplicate detection.
- Save crawl timestamp and source version if relevant.

### Testing rule
Do not rely on live websites in automated tests. Use saved HTML fixtures or mocked responses.

## Database model

Use flexible but structured MongoDB collections.

### jobs collection
Use this shape as the default contract:

```json
{
  "source": "itviec",
  "externalId": "string",
  "url": "string",
  "title": "Senior Frontend Developer",
  "company": "Example Co",
  "location": ["Ho Chi Minh City"],
  "remote": true,
  "hybrid": false,
  "salaryMin": 1000,
  "salaryMax": 2000,
  "currency": "USD",
  "skills": ["React", "TypeScript", "Node.js"],
  "seniority": "mid",
  "employmentType": "full-time",
  "postedAt": "2026-03-31T00:00:00.000Z",
  "descriptionRaw": "string",
  "descriptionClean": "string",
  "requirements": ["string"],
  "benefits": ["string"],
  "status": "active",
  "ingestedAt": "2026-03-31T00:00:00.000Z"
}
```

### candidate_profiles collection

```json
{
  "candidateId": "string",
  "cvFileName": "cv.pdf",
  "cvStoragePath": "uploads/cv.pdf",
  "rawText": "string",
  "language": "en",
  "candidateSummary": "string",
  "yearsOfExperience": 2,
  "roles": ["Frontend Developer"],
  "skills": ["React", "TypeScript", "Node.js"],
  "strengths": ["UI development", "API integration"],
  "gaps": ["Automated testing"],
  "preferredLocations": ["Ho Chi Minh City"],
  "preferredWorkModes": ["remote", "hybrid"],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "techStack": ["string"],
      "summary": "string"
    }
  ],
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

### job_matches collection

```json
{
  "candidateId": "string",
  "jobId": "string",
  "matchScore": 82,
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["Docker"],
  "experienceFit": "good",
  "roleFit": "strong",
  "workModeFit": "good",
  "reasoning": "Strong frontend alignment with minor tooling gaps.",
  "recommendation": "apply",
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

## CV parsing rules

Use these rules whenever the user uploads a CV.

### Input support
- PDF is the required MVP input.
- Prefer text-based PDF extraction first.
- Only use OCR as a fallback when text extraction fails.
- Support Vietnamese and English CVs.

### Extraction goals
Extract these fields when available:
- summary
- years of experience
- current or recent roles
- technical skills
- projects
- companies worked at
- education
- certifications if clearly present
- preferred location or work mode if clearly stated

### Parsing behavior
- Preserve raw extracted text for debugging.
- Normalize common skill synonyms such as `js` to `javascript` only when confidence is high.
- Do not invent missing data.
- Use `unknown` or empty arrays instead of hallucinating fields.
- Keep structured output deterministic.

## Matching logic

Compare CV data against jobs using explicit rubric-driven scoring.

### Required scoring rubric
Use this default weight distribution unless the user asks for another rubric:
- **Tech stack fit:** 40%
- **Role fit:** 25%
- **Years of experience fit:** 20%
- **Location and work mode fit:** 10%
- **Domain bonus or nice-to-have alignment:** 5%

### Scoring rules
- Score from 0 to 100.
- Penalize missing must-have skills more than missing nice-to-have skills.
- Do not over-score a role that mismatches seniority.
- Keep reasoning concise and evidence-based.
- If data is missing, state uncertainty in the reasoning.

### Recommendation buckets
Use one of these values:
- `strong_apply`
- `apply`
- `consider`
- `weak_fit`
- `not_recommended`

## LLM output contract

Whenever using an LLM for parsing or matching, require strict JSON output.

### CV analysis output

```json
{
  "candidateSummary": "string",
  "yearsOfExperience": 2,
  "roles": ["Frontend Developer"],
  "skills": ["React", "TypeScript"],
  "strengths": ["string"],
  "gaps": ["string"],
  "preferredLocations": ["string"],
  "preferredWorkModes": ["remote", "hybrid"],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "techStack": ["string"],
      "summary": "string"
    }
  ]
}
```

### Job match output

```json
{
  "jobId": "string",
  "matchScore": 82,
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["Docker"],
  "experienceFit": "good",
  "roleFit": "strong",
  "workModeFit": "good",
  "reasoning": "Strong alignment with frontend responsibilities and required stack.",
  "recommendation": "apply"
}
```

### Prompting requirements
- Explicitly tell the model to return valid JSON only.
- Validate JSON before saving.
- Retry with a repair step if parsing fails.
- Never let frontend parse raw natural-language-only responses.

## Backend API requirements

Expose APIs that are easy for frontend and chatbot clients to consume.

### Minimum MVP endpoints
- `POST /api/upload-cv`
- `GET /api/candidates/:id`
- `POST /api/jobs/sync`
- `GET /api/jobs`
- `POST /api/match/:candidateId`
- `GET /api/matches/:candidateId`

### API behavior
- Validate file type and size.
- Return structured error responses.
- Return IDs and status for async workflows.
- Support pagination on jobs.
- Support filtering by skills, location, remote, seniority, and source.

## Frontend requirements

Use React functional components and hooks.

### Required MVP screens
- upload CV page
- candidate summary page
- jobs list page
- match results page

### UX requirements
- Show upload state and analysis progress.
- Show empty, loading, success, and error states.
- Provide filtering and sorting for matched jobs.
- Display clear score badges and concise explanation text.
- Keep the visual direction clean and professional.

### UI rule
Do not block the whole application while matching runs. Prefer async progress and status updates.

## Chatbot requirements

Only implement chatbot flow if the user explicitly wants it.

If chatbot mode is requested:
- keep the same backend matching contracts
- let the bot accept a CV upload or a previously saved profile
- let the bot explain top matches using the stored JSON result
- do not let the bot fabricate unsupported job details

## Security and privacy requirements

Treat CV data as sensitive.

Required safeguards:
- validate MIME type and file extension
- enforce size limits
- sanitize filenames
- avoid logging raw CV content unless debug mode is explicitly enabled
- avoid exposing personally identifiable information in client logs
- store secrets in environment variables
- provide `.env.example`

For MVP, local file storage is acceptable. For production-oriented code, keep storage abstraction ready.

## Testing requirements

Always add tests for the most failure-prone logic.

### Minimum tests
- CV parser unit tests
- job normalization unit tests
- match scoring unit tests
- API integration test for CV upload and match flow
- frontend smoke test for upload and results rendering

### Test fixtures
Use sample CV files and saved HTML fixtures. Do not depend on live external sites in CI.

## Observability requirements

Include basic operational visibility.

Required:
- structured logs
- crawl status tracking
- ingestion failure counts
- duplicate counts
- health endpoint or equivalent

Optional for later:
- dashboard metrics
- admin monitoring page

## Git and delivery workflow

Follow these repository rules whenever the user asks for implementation guidance.

1. Never commit directly to `main`.
2. Create feature branches from `develop`.
3. Use conventional commits.
4. Push completed work and open a PR when repository operations are in scope.
5. Pull latest remote changes before starting new work if repository access exists.
6. Prefer rebase before merge unless preserving merge context is important.

If the user only asks for local code generation, still structure commits and PR suggestions as if the project will later be pushed.

## Coding style rules

Follow these implementation rules:
- prefer TypeScript for frontend and Node backend code
- keep modules small and typed
- favor readable code over clever abstractions
- add comments only where reasoning is not obvious
- avoid placeholder code when a runnable implementation is feasible
- if a complete production solution is not feasible, produce a working MVP slice and state assumptions clearly

## Definition of done for MVP

Treat the MVP as complete only when all of these are true:
1. A user can upload one PDF CV.
2. The system extracts structured candidate data.
3. The system ingests jobs from one approved public source.
4. Duplicates are handled.
5. The system computes and stores match results.
6. The UI displays top recommended jobs with score and reasoning.
7. The project has local run instructions.
8. The project includes basic tests and sample fixtures.

## Response pattern when using this skill

When the user asks to build or extend the project, respond in this order unless they ask otherwise:
1. state the assumed product mode and stack
2. state the current milestone
3. produce the most useful runnable code slice
4. explain how to run it locally
5. list next recommended milestone

## Example milestone sequence

### Milestone 1
Scaffold repo, shared types, Mongo connection, and job schema.

### Milestone 2
Implement one approved source adapter and normalization pipeline.

### Milestone 3
Implement CV upload, extraction, and candidate profile storage.

### Milestone 4
Implement match scoring and result persistence.

### Milestone 5
Implement frontend upload flow and results dashboard.

### Milestone 6
Add tests, docs, and deployment notes.

## Failure handling

If a requested source or feature cannot be implemented safely or lawfully:
- say so plainly
- propose a supported alternative
- continue building the rest of the system around adapters, mocks, or import pipelines

## Final quality bar

This skill exists to help ChatGPT generate code that is:
- legally safer
- more modular
- easier to run locally
- easier to extend later
- grounded in strict schemas and deterministic contracts

Prefer a working, narrow MVP over a broad but fragile demo.
