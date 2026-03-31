# Architecture Reference

## Default architecture

- `apps/web`: Next.js frontend
- `apps/api`: TypeScript API
- `packages/shared`: shared types and contracts
- `services/crawler`: crawler and normalization logic

## MVP guidance

For MVP v1:

- keep logic simple
- avoid microservices complexity
- fixture-based jobs are acceptable
- crawler can remain a skeleton until later milestone