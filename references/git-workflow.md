```md
# Git Workflow

## Branching rules

- never work directly on `main`
- use `develop` as integration branch
- create a feature branch for each milestone

Examples:

- `feature/scaffold-monorepo`
- `feature/cv-upload`
- `feature/candidate-parser`
- `feature/match-engine`
- `feature/results-ui`
- `feature/itviec-adapter`

## Commit rules

Use Conventional Commits.

## Required stop rule

After each milestone:

1. summarize changes
2. list changed files
3. propose one branch name
4. propose one commit message
5. stop and wait for the user to manually run git commands