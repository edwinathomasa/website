# `@portfolio/mobile`

Placeholder workspace reserved for the future mobile application (React Native or Kotlin Multiplatform).

## Integration Plan
- **Shared Contracts**: Consume TypeScript types and API DTOs from `@portfolio/shared` (for React Native) or mirror the REST DTO contracts in `packages/shared/src/types/api.ts` (for Kotlin Multiplatform).
- **Backend API**: Connect to the same `apps/backend` AWS API Gateway HTTP API endpoints:
  - `GET /api/health`
  - `GET /api/profile`
  - `POST /api/chat`
  - `POST /api/transcribe`
  - `POST /api/speak`
