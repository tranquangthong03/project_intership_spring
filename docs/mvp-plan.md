# MVP Plan

## Goal

Build an ITViec-first MVP for AI-assisted IT job matching.

The first version should prove the user journey:

1. user uploads a CV
2. system extracts candidate information
3. system compares the profile against sample jobs
4. system returns ranked job matches
5. UI displays scores and reasons

## Milestone order

### Milestone 1 - Repository scaffold
- apps/web
- apps/api
- packages/shared
- health route
- minimal run instructions

### Milestone 2 - CV upload flow
- upload form in web
- upload endpoint in api
- temporary local file handling
- PDF validation

### Milestone 3 - Candidate profile extraction
- basic PDF text extraction or mock parsing
- structured candidate profile JSON

### Milestone 4 - Fixture-based job matching
- load sample jobs
- compare candidate profile against jobs
- produce ranked results

### Milestone 5 - Results UI
- upload page
- loading state
- ranked job cards

### Milestone 6 - ITViec adapter skeleton
- crawler service structure
- adapter interface
- normalization skeleton

## Rules

- only one milestone per cycle
- stop after each milestone
- manual git commit and push
- do not jump ahead