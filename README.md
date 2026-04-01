# Project Internship Spring - AI Job Matcher

## Overview

This project is an ITViec-first MVP for an AI-assisted IT job matching platform.

The application will:

- accept a candidate CV in PDF format
- extract candidate information
- compare the profile against job descriptions
- rank suitable jobs with scores and reasons
- later support safe ingestion from public job sources such as ITViec

## Current scope

Current scope is limited to MVP v1:

- monorepo scaffold
- web app
- api service
- shared contracts
- fixture-based matching
- gradual milestone-based implementation

## Development mode

This project is built in small milestones.

For each milestone:

1. implement one step only
2. stop after that step
3. review manually
4. git commit and git push are done manually
5. continue only after confirmation

## Local development

### Configuration

To enable the AI-powered matching, set up your OpenAI API Key in the `apps/api` environment. If not provided, the API will safely run in a rule-based matching mode.

```bash
# In apps/api/.env
OPENAI_API_KEY=your_openai_api_key_here
```

Install dependencies at the repo root:

```bash
npm install
```

Start the API service (port 4000):

```bash
npm run dev -w apps/api
```

The health check is available at:

- http://localhost:4000/health

The CV upload endpoint is available at:

- http://localhost:4000/upload-cv

The upload response includes a parsed `candidateProfile` and raw extracted text.

The fixture-based matching endpoint is available at:

- http://localhost:4000/match

Start the web app (port 3000) in another terminal:

```bash
npm run dev -w apps/web
```

Start the crawler service skeleton (this runs ingestion pipeline automatically inside):

```bash
npm run dev -w services/crawler
```

After ingestion, jobs will be persisted to `data/jobs.json`.

Optional environment variable for the web app:

- `NEXT_PUBLIC_API_BASE_URL` (default: http://localhost:4000)

## Check stored jobs

You can view, search, and filter the successfully ingested jobs using the web dashboard:

- http://localhost:3000/jobs

Alternatively, access the raw API endpoint:

- http://localhost:4000/jobs

## Important files

- `SKILL.md`
- `docs/mvp-plan.md`
- `references/schema.md`
- `references/policy.md`
- `references/output-contracts.md`
- `references/git-workflow.md`