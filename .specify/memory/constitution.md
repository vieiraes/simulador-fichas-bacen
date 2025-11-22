<!--
SYNC IMPACT REPORT

Version: 1.0.0 → 2.0.0 (MAJOR AMENDMENT)
Date: 2025-11-22

BREAKING CHANGES - Critical policy updates

Added Principles:
- VI. Clean Code Practices (new principle)
- VII. Simple User Experience (new principle for frontend)
- VIII. Responsive Design (new principle for frontend)
- IX. Minimal Dependencies (new principle)
- X. NO TESTING POLICY (new principle - SUPERSEDES ALL TESTING GUIDANCE)

Modified Principles:
- Principle IV: "Independent Component Testing" → "Independent Component Operation" (removed testing, kept independence)

Removed Sections:
- All testing requirements removed from Development Workflow
- Testing validation removed from feature development process

Templates Requiring Updates:
- ✅ plan-template.md - Updated Constitution Check section with all 10 principles + NO TESTING warning
- ✅ spec-template.md - Changed "Testing" to "Manual Validation", removed test terminology
- ✅ tasks-template.md - Removed all test tasks, phases, and examples; updated to manual validation
- ✅ checklist-template.md - No test references found (validated)
- ✅ agent-file-template.md - No test references found (validated)

Follow-up TODOs:
- ✅ All critical templates have been updated successfully
- ✅ README.md validated - only mentions "testes" (Portuguese) in context of simulation/training scenarios, not automated testing
- No further action required

Rationale for Version 2.0.0:
- MAJOR version bump due to removal of testing requirements (breaking change)
- Addition of 5 new core principles
- Fundamental shift in development approach: manual validation over automated testing
- This is a BACKWARD INCOMPATIBLE change to project governance
-->

# Simulador de Fichas BACEN Constitution

## Core Principles

### I. API Simulation-First

Every feature in this project MUST simulate real DICT/PIX behavior accurately without performing actual transactions. Simulations MUST:
- Model authentic Bacen bucket consumption rules precisely (fichas/tokens)
- Respect real-world constraints: ISPB bucket (300 fichas max), client buckets (100 fichas max)
- Return realistic error responses and success scenarios
- Never connect to real payment systems or live APIs

**Rationale**: This is a learning and testing tool. Accuracy in simulation ensures users understand real system behavior, while isolation prevents accidental production impacts.

### II. API-First Development

All business logic MUST be exposed through REST API endpoints before frontend integration. Requirements:
- Backend APIs (`/api/*`) provide core simulation functionality
- BFF layer (`/bff/*`) aggregates and optimizes for frontend consumption
- Frontend consumes only BFF endpoints, never direct API
- Each endpoint MUST have clear input/output contracts
- API responses MUST be JSON with consistent error formats

**Rationale**: Clear separation enables independent testing, allows multiple client interfaces, and maintains clean architectural boundaries between presentation and business logic.

### III. Type Safety and Configuration

TypeScript MUST be used throughout the codebase with strict typing enabled. Configuration MUST follow these rules:
- All environment variables defined with defaults in code
- Type-safe models for wallets, buckets, and transactions
- No implicit `any` types except when absolutely necessary (must be justified)
- Runtime validation for external inputs (query parameters, request bodies)
- Configuration changes MUST NOT require code redeployment

**Rationale**: Type safety prevents runtime errors in simulation logic. Flexible configuration allows easy adjustment of bucket limits and behavior without code changes.

### IV. Independent Component Operation

Each component (API, BFF, Frontend, Worker) MUST be independently runnable. Requirements:
- API can run without frontend or BFF
- Frontend development mode can run against mock BFF
- Worker can operate independently of HTTP server
- Each component MUST document its dependencies and startup requirements
- Scripts MUST support running components individually or together
- Manual validation through browser/Postman/curl is the verification method

**Rationale**: Independent operation enables focused development, easier debugging, and parallel team workflows. Developers can work on frontend without backend running, or validate API logic in isolation through manual testing.

### V. Observable Simulation State

All bucket state changes and simulation operations MUST be observable and traceable. Requirements:
- Endpoint responses include current bucket states after operations
- Worker logs each recarga operation with timestamp
- Error responses clearly indicate which bucket limit was violated
- Dashboard provides real-time visibility into all wallet states
- Console logs MUST show operation type, wallet ID, and result

**Rationale**: Observability is critical for understanding simulation behavior, debugging issues, and validating that bucket consumption rules are working correctly.

### VI. Clean Code Practices

Code MUST be readable, maintainable, and self-documenting. Requirements:
- Functions/methods MUST have a single, clear responsibility
- Variable and function names MUST be descriptive and meaningful (no `x`, `data`, `temp` unless context is obvious)
- Avoid deep nesting (max 3 levels) - extract functions when needed
- No commented-out code in commits
- Magic numbers MUST be named constants with clear purpose
- Complex logic MUST have explanatory comments
- Keep files focused - one controller per file, one model per file
- DRY principle: Extract repeated logic into reusable functions

**Rationale**: Clean code reduces bugs, speeds up development, and makes onboarding easier. Self-documenting code is more valuable than extensive external documentation.

### VII. Simple User Experience (Frontend)

Frontend interfaces MUST prioritize simplicity and clarity over feature density. Requirements:
- Dashboard shows only essential information at a glance
- Forms have minimal required fields with sensible defaults
- Actions have immediate visual feedback (loading states, success/error messages)
- No hidden features - everything discoverable without documentation
- Error messages MUST be user-friendly and actionable (not stack traces)
- Navigation MUST be intuitive - max 2 clicks to any feature
- Avoid modal dialogs except for confirmations/alerts
- One primary action per screen/section

**Rationale**: This is an educational tool. Users should understand bucket behavior through interaction, not by reading manuals. Simple UX reduces cognitive load and learning curve.

### VIII. Responsive Design

Frontend MUST work seamlessly across devices. Requirements:
- Bootstrap grid system for responsive layouts
- Mobile-first approach: design for small screens, enhance for larger
- Touch-friendly targets (min 44x44px for buttons)
- Forms stack vertically on mobile, can be multi-column on desktop
- Tables MUST be responsive (stack, scroll, or simplify on mobile)
- No horizontal scrolling except for data tables
- Text MUST be readable without zooming (min 16px base font)
- Test on: mobile (375px), tablet (768px), desktop (1440px+)

**Rationale**: Users may access the simulator from various devices. Responsive design ensures consistent experience and eliminates device-specific bugs.

### IX. Minimal Dependencies

Introduce new dependencies only when absolutely necessary. Requirements:
- Core dependencies: Express, React, Bootstrap, TypeScript, Vite, node-cron (as defined)
- Before adding new dependency, justify: "What would implementation cost without it?"
- Prefer standard library/platform APIs over utility libraries
- No dependencies for tasks solvable in <50 lines of code
- Security: Fewer dependencies = smaller attack surface
- Bundle size: Each frontend dependency adds to load time
- Document each dependency's purpose in package.json description

**Rationale**: Dependencies introduce maintenance burden, security risks, and complexity. Minimal dependencies keep the project lightweight, secure, and easier to maintain long-term.

### X. NO TESTING POLICY (NON-NEGOTIABLE)

This project DOES NOT use automated tests of any kind. This principle SUPERSEDES any testing guidance in templates or documentation. Requirements:
- NO unit tests
- NO integration tests
- NO end-to-end tests
- NO test frameworks (Jest, Mocha, Cypress, etc.)
- NO test directories (`tests/`, `__tests__/`, `*.test.ts`)
- NO test-related dependencies
- Validation is done manually through:
  - Browser interaction with frontend
  - API testing with Postman/curl/Thunder Client
  - Visual inspection of console logs
  - Manual workflow validation

**Rationale**: This is a simulation tool for learning and demonstration, not production financial software. Manual validation is sufficient for the project's scope and allows faster iteration without test maintenance overhead.

## Technical Standards

### Stack Requirements

- **Runtime**: Node.js with TypeScript (strict mode enabled)
- **Backend Framework**: Express.js for REST APIs
- **Frontend Framework**: React 19+ with React Router and Bootstrap
- **Build Tool**: Vite for frontend, tsc for backend
- **Process Management**: Concurrently for multi-process orchestration
- **Scheduled Tasks**: node-cron for bucket recarga worker
- **Environment**: dotenv for configuration management
- **Testing**: NONE - No test frameworks or test runners
- **Validation**: Manual testing via browser, Postman, curl

### Project Structure

```
src/
├── api/              # Core simulation API (controllers, models, routes)
├── bff/              # Backend for Frontend aggregation layer
├── frontend/         # React UI (components, pages, services)
├── cron.ts           # Worker for automatic bucket recarga
├── routes.ts         # Main API route definitions
└── server.ts         # HTTP server entry point
```

### Environment Configuration

All deployments MUST support these variables:
- `ISPB`: Bank identifier (default: 03311443)
- `BALDE_ISPB`: ISPB bucket limit (default: 300)
- `BALDE_CNPJ`: Client bucket limit (default: 100)
- `PORT`: HTTP server port (default: 3000)
- `URL`: Base application URL (default: http://localhost:3000)
- `CRON`: Worker interval in minutes (default: 2)

### Code Quality Standards

- No TypeScript compilation errors permitted in commits
- ESLint/Prettier configured and followed (when added)
- Consistent naming: camelCase for variables/functions, PascalCase for components/classes
- Error handling MUST use try-catch with meaningful messages
- HTTP responses MUST follow REST conventions (200, 400, 404, 500)
- Clean code practices: descriptive names, single responsibility, DRY principle
- No test files or test-related code
- Code review focuses on readability, correctness, and adherence to principles

## Development Workflow

### Feature Development Process

1. **Specification**: Document feature in `.specify/specs/[###-feature-name]/spec.md` with user scenarios
2. **Planning**: Generate implementation plan with `/speckit.plan` command
3. **API First**: Implement backend API endpoints before frontend
4. **Manual Validation (API)**: Test endpoints with Postman/curl, verify responses and error handling
5. **BFF Layer**: Add BFF aggregation if frontend needs optimized data
6. **Frontend**: Build UI components consuming BFF endpoints
7. **Manual Validation (Frontend)**: Test in browser across different screen sizes, verify UX
8. **Documentation**: Update README.md and DOCUMENTACAO_ARQUITETURA.md

**Note**: NO automated tests are written or maintained. All validation is manual.

### Branching Strategy

- `main`: Production-ready code, always deployable
- `feat/*`: Feature branches (e.g., `feat/docker`, `feat/monitoring`)
- Features merged to `main` via pull request after validation
- Merge commits MUST include clear description of changes

### Running the Application

**Development Mode** (with hot-reload):
```bash
npm run dev:server    # Backend API + BFF
npm run dev:worker    # Bucket recarga worker
npm run dev:frontend  # React frontend
```

**Production Mode**:
```bash
npm run build           # Compile TypeScript backend
npm run build:frontend  # Build React frontend
npm start               # Run worker + server together
```

### Adding New Endpoints

1. Define route in `src/routes.ts` or `src/bff/routes.ts`
2. Create/update controller in respective `controllers/` directory
3. Update models if new data structures needed
4. Document endpoint in README.md
5. Add frontend integration if UI component required

## Governance

### Constitutional Authority

This constitution defines the architectural and operational standards for the Simulador de Fichas BACEN project. All code changes, feature additions, and refactoring MUST comply with these principles.

### Amendment Process

1. **Proposal**: Document proposed change with rationale
2. **Review**: Assess impact on existing templates (plan, spec, tasks)
3. **Version Bump**: 
   - MAJOR: Breaking changes to core principles (e.g., removing API-first requirement)
   - MINOR: New principles or expanded guidance (e.g., adding security principle)
   - PATCH: Clarifications, typos, non-semantic improvements
4. **Update**: Modify constitution and sync dependent templates
5. **Migration**: Update existing code/docs to comply (if breaking change)

### Compliance Validation

- Pull requests MUST verify compliance with constitution principles
- Architecture decisions that deviate from principles MUST be explicitly justified
- New features MUST follow the documented workflow in Development Workflow section
- Complexity additions (new layers, patterns, dependencies) MUST be justified with clear rationale

### Conflict Resolution

If constitution conflicts with practical requirements:
1. Document the conflict and constraint causing it
2. Propose amendment or exception with justification
3. Update constitution if pattern is broadly applicable
4. Document exception in code/PR if truly one-off case

**Version**: 2.0.0 | **Ratified**: 2025-11-22 | **Last Amended**: 2025-11-22
