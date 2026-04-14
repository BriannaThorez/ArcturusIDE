# Implementation Plan: Local Secrets-Safe AI Key Handling for ArcturusIDE

## Metadata
- **Title**: Local Secrets-Safe AI Key Handling for ArcturusIDE
- **Version**: 1.0.0
- **Status**: Active
- **Scope**: Client-side runtime storage and use of user-supplied OpenAI and Gemini API keys for local execution and GitHub Pages deployment
- **Primary Goal**: Allow users to provide their own API keys securely at runtime without exposing them in source control, build artifacts, logs, or deployment output

## Intent Analysis

### Axiomatic Intent
- Secrets must never be embedded in the build, committed to the repository, or injected through Vite config.
- User-owned keys are only acceptable when stored locally on the user's device with explicit user consent.
- Client-side applications cannot fully hide a key from the user’s browser context, so the design must minimize exposure rather than pretend to eliminate it.
- Non-secret configuration and secret storage must remain separate concerns.
- The build pipeline must fail closed if secret-like material appears in output.

### Axiological Intent
- Prioritize user trust, transparency, and safety.
- Favor clear UX over hidden behavior.
- Preserve the usability of the IDE while making security boundaries obvious.
- Keep settings simple, explicit, and reversible.
- Make secure defaults the easiest path.

### Teleological Intent
- Enable an offline-friendly IDE experience where users can supply their own OpenAI or Gemini keys at runtime.
- Ensure the app remains compatible with GitHub Pages as a static deployment.
- Provide a maintainable architecture for runtime key selection, storage, retrieval, and AI client initialization.
- Prevent accidental leakage of secrets into localStorage, build output, documentation, logs, or published bundles.
- Establish a repeatable pattern for future secure client-side integrations.

## Architecture Principles
1. **No build-time secrets**  
   Keys must never pass through `vite.config.ts`, `define`, `loadEnv`, or any compile-time replacement mechanism.

2. **Local-only secret storage**  
   API keys are stored only on the user's device, either in memory, `sessionStorage`, or `localStorage` depending on the chosen mode.

3. **Explicit consent**  
   The user must intentionally enable key storage and understand where it is stored.

4. **Runtime-only client instantiation**  
   AI clients are created only when needed, using the key currently held in state or retrieved from local storage.

5. **Separation of concerns**  
   General user settings remain in `useUserSettings`; secret storage is isolated in a dedicated hook/store.

6. **Defensive UX**  
   The UI should mask keys, support clearing them, and warn the user that the keys remain local to their device.

7. **Defense in depth**  
   Add build-time and repository-level safeguards to detect accidental secret leakage.

## Target User Scenarios
- A user runs ArcturusIDE locally and pastes their OpenAI or Gemini key into settings.
- A user opens the GitHub Pages demo and optionally stores a key locally for their own session.
- A user switches between OpenAI and Gemini without rebuilding the app.
- A user clears stored keys when done.
- A build or commit accidentally includes a secret-like string, and automated checks reject it.

## Proposed Solution Overview

### 1. Dedicated secret hook
Create `useLocalSecrets.ts` to manage:
- selected provider
- provider-specific API key values
- persistence mode:
  - temporary session
  - persistent local storage
- clear/reset behavior
- safe retrieval for runtime use

### 2. Settings UI extension
Extend `SettingsDialog` with a dedicated API Keys section:
- provider selector
  - Gemini
  - OpenAI
- masked input
- show/hide toggle
- “Paste and save locally” button
- “Clear stored key” button
- “Use temporary session only” toggle
- warning text explaining local-only storage

### 3. Runtime client creation
Update AI-related code paths so they:
- read the selected provider and key from the secret store
- create the AI client at runtime only
- gracefully handle missing keys
- avoid module-scope instantiation with secrets

### 4. Build and output safeguards
Maintain or add checks that:
- reject real secret patterns in `dist/`
- keep sourcemaps disabled for public builds
- verify that no environment variables with secret semantics are exposed in client bundles
- keep `.env` files and build artifacts out of version control

### 5. Documentation updates
Update README and architecture docs to describe:
- local-only key entry
- optional session-only persistence
- safe usage on GitHub Pages
- no build-time secret injection

## Implementation Phases

### Phase 1: Secret Store Foundation
**Goal**: Add a secure client-side store for user-supplied API keys.

#### Deliverables
- New `useLocalSecrets.ts` hook
- Storage schema for OpenAI and Gemini keys
- Persistence strategy supporting session and local modes
- Clear/reset APIs
- Initial validation helpers

#### Tasks
- [ ] Define the secret store interface.
- [ ] Decide whether keys are stored in `sessionStorage`, `localStorage`, or in-memory based on user preference.
- [ ] Add provider identifiers for OpenAI and Gemini.
- [ ] Add helper functions to set, retrieve, and clear keys safely.
- [ ] Add key normalization and input trimming.
- [ ] Ensure the store never logs key values.
- [ ] Ensure the store never serializes secrets into non-secret settings objects.

#### Safety Checks
- [ ] Confirm no secrets are read from build-time env variables.
- [ ] Confirm no secrets are exported from the store module at import time.
- [ ] Confirm the store can be cleared without reload.

---

### Phase 2: Settings UI for Secrets
**Goal**: Add a secure, user-friendly settings interface for API key entry.

#### Deliverables
- Settings tab or section for secrets
- Provider selector
- Masked input
- Save/clear controls
- Local-only warning copy

#### Tasks
- [ ] Add a dedicated “API Keys” section to `SettingsDialog`.
- [ ] Add provider selector for Gemini and OpenAI.
- [ ] Add a masked input field with a reveal toggle.
- [ ] Add a “Paste and save locally” action.
- [ ] Add a “Clear stored key” action.
- [ ] Add a “Use temporary session only” toggle.
- [ ] Show whether a key is currently configured for the selected provider.
- [ ] Add clear warning text:
  - “Keys are stored only on this device and never sent to the build system.”
- [ ] Ensure the UI does not echo the key into logs or debug text.
- [ ] Ensure the modal layout remains usable on smaller screens.

#### Safety Checks
- [ ] Verify the settings UI does not serialize keys into the general settings JSON view.
- [ ] Verify masked display is used by default.
- [ ] Verify the clear action removes all local traces for the selected mode.

---

### Phase 3: Runtime AI Client Wiring
**Goal**: Make AI features use runtime-provided keys safely.

#### Deliverables
- Runtime AI client factory
- Provider-specific client wiring
- Graceful missing-key handling
- Removal of module-scope key usage

#### Tasks
- [ ] Remove any remaining `process.env` key reads from client modules.
- [ ] Remove placeholder API key values from client code.
- [ ] Create runtime factory functions for OpenAI and Gemini clients.
- [ ] Update `Layout.tsx` and related AI code paths to obtain the current key from the secret store.
- [ ] Update code completion or chat flows to fail gracefully when no key is present.
- [ ] Ensure model/provider selection is independent of secret persistence.
- [ ] Keep non-secret model metadata in the application state.
- [ ] Handle invalid key errors with user-friendly messages.
- [ ] Avoid storing the key in component state longer than necessary.

#### Safety Checks
- [ ] Confirm there are no client-side key placeholders left in AI modules.
- [ ] Confirm no runtime client is constructed at module load with a secret value.
- [ ] Confirm provider switching works without page reload.

---

### Phase 4: Build and Deployment Safeguards
**Goal**: Prevent secret leakage into build outputs and deployments.

#### Deliverables
- Secret scanning build guard
- No sourcemaps in public output
- Build artifact hygiene
- GitHub Pages compatibility preserved

#### Tasks
- [ ] Keep source maps disabled for public builds unless explicitly needed.
- [ ] Validate production output for real secret patterns only.
- [ ] Keep `dist/` excluded from version control.
- [ ] Keep `.env*` excluded from version control except placeholders.
- [ ] Ensure build guard fails on real secret-like values, not harmless text references.
- [ ] Confirm GitHub Pages deployment only publishes secret-free artifacts.
- [ ] Add or update scripts for local verification.
- [ ] Document that the demo expects user-supplied keys at runtime.

#### Safety Checks
- [ ] Run a full production build and inspect output for keys.
- [ ] Verify no `.map` files are published unless intentionally permitted.
- [ ] Verify no secret-like string appears in generated assets.

---

### Phase 5: Documentation and User Guidance
**Goal**: Make the security model obvious and self-service.

#### Deliverables
- README update
- Runtime key usage instructions
- Security guidance for users

#### Tasks
- [ ] Document local key entry workflow.
- [ ] Document GitHub Pages usage with user-supplied runtime keys.
- [ ] Clarify that keys are stored locally only when the user opts in.
- [ ] Clarify that the app never requires a build-time API key.
- [ ] Explain how to clear stored keys.
- [ ] Explain the difference between temporary and persistent storage.
- [ ] Update architecture docs to reflect secure client-side or runtime-only usage.
- [ ] Add a note that client-side apps cannot fully hide secrets from the local browser environment.

#### Safety Checks
- [ ] Verify docs do not contain real API key values.
- [ ] Verify docs do not instruct users to place secrets in build-time env vars.

---

### Phase 6: Verification and QA
**Goal**: Ensure the feature is stable, secure, and shippable.

#### Deliverables
- Lint pass
- Build pass
- Secret scan pass
- Manual UX validation checklist

#### Tasks
- [ ] Run linting.
- [ ] Run production build verification.
- [ ] Validate that the secret guard passes only when no real secret patterns are present.
- [ ] Test local key save/reload behavior.
- [ ] Test session-only mode behavior.
- [ ] Test clear key behavior.
- [ ] Test provider switching.
- [ ] Test AI request failure when keys are missing.
- [ ] Test GitHub Pages-compatible runtime behavior.

#### Acceptance Criteria
- [ ] No client-side build-time secret injection remains.
- [ ] Users can enter OpenAI and Gemini keys locally.
- [ ] Keys are never written into source-controlled files.
- [ ] Keys are never embedded into the production bundle.
- [ ] Settings UI is clear, masked, and reversible.
- [ ] Build output remains secret-free.
- [ ] App continues to function for local use and static hosting.

## Risk Register

### Risk: XSS could expose local keys
**Mitigation**:
- Minimize key persistence duration
- Avoid unnecessary DOM exposure
- Keep CSP strong where possible
- Never inject user-provided HTML into settings or secret views

### Risk: Keys become part of build artifacts
**Mitigation**:
- No env-based secret injection
- Secret scanning in build output
- Sourcemaps disabled by default

### Risk: Users misunderstand local storage trust boundaries
**Mitigation**:
- Clear warning text
- Transparent settings labels
- Explicit storage mode selection

### Risk: AI provider SDK changes break runtime usage
**Mitigation**:
- Encapsulate client creation in a factory
- Keep provider-specific logic isolated
- Add tests around provider switching and missing-key behavior

## Suggested File Additions / Changes
- `src/hooks/useLocalSecrets.ts`
- `src/widgets/settings/SettingsDialog.tsx`
- `src/app/Layout.tsx`
- `src/features/codemirror6/CodeMirrorEditor.tsx`
- `src/services/aiClientFactory.ts`
- `vite.config.ts`
- `README.md`
- `Development/ImplementationPlan/Tasks_LocalSecretsSafe.md`

## Completion Definition
This plan is complete when:
- users can safely enter and manage OpenAI/Gemini keys locally
- the settings UI is polished and explicit
- runtime AI usage consumes local keys without build-time injection
- production builds contain no real secret material
- docs clearly explain the storage and security model
- linting and build verification pass successfully

## Final Note
This implementation intentionally favors practical local-device safety for a static frontend application. It does not claim to make secrets invisible to the user’s own browser runtime; instead, it ensures secrets are not leaked into source, build artifacts, or deployment outputs.