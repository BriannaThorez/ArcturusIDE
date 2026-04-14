# Tasks: Local Secrets-Safe AI Key Handling for ArcturusIDE

## Phase 1: Secret Store Foundation
- [ ] Define the secret store interface for provider-specific API keys.
- [ ] Choose the persistence modes:
  - [ ] temporary session storage
  - [ ] persistent local storage
  - [ ] in-memory fallback when storage is unavailable
- [ ] Create `useLocalSecrets.ts` as a dedicated hook/store for secrets.
- [ ] Add provider identifiers for:
  - [ ] Gemini
  - [ ] OpenAI
- [ ] Add helper functions:
  - [ ] `setApiKey(provider, key)`
  - [ ] `getApiKey(provider)`
  - [ ] `clearApiKey(provider)`
  - [ ] `hasApiKey(provider)`
- [ ] Normalize and trim key input before saving.
- [ ] Ensure no key values are logged to console or telemetry.
- [ ] Ensure the secret store never serializes into the general settings payload.
- [ ] Ensure the secret store can be cleared without reloading the app.

## Phase 2: Settings UI for Secrets
- [ ] Add a dedicated `API Keys` section to `SettingsDialog`.
- [ ] Add a provider selector with:
  - [ ] Gemini
  - [ ] OpenAI
- [ ] Add a masked input field for the selected provider key.
- [ ] Add a reveal/hide toggle for the input value.
- [ ] Add a `Paste and save locally` button.
- [ ] Add a `Clear stored key` button.
- [ ] Add a `Use temporary session only` toggle.
- [ ] Show whether the selected provider currently has a stored key.
- [ ] Add warning copy:
  - [ ] `Keys are stored only on this device and never sent to the build system.`
- [ ] Keep the modal responsive on smaller screens.
- [ ] Make sure the secrets UI does not appear in the raw JSON settings editor.
- [ ] Keep the settings modal behavior consistent with the existing main menu flow.

## Phase 3: Runtime AI Client Wiring
- [ ] Remove remaining client-side key reads from all AI modules.
- [ ] Remove any placeholder API key values from source code.
- [ ] Create runtime AI client factory functions for:
  - [ ] Gemini
  - [ ] OpenAI
- [ ] Update AI entry points to obtain the current key from the secret store at runtime.
- [ ] Instantiate provider clients only when a request is made.
- [ ] Handle missing keys gracefully with user-friendly messaging.
- [ ] Handle invalid or rejected keys gracefully with user-friendly messaging.
- [ ] Keep provider selection separate from secret persistence.
- [ ] Ensure switching providers works without a page reload.
- [ ] Keep secret values out of long-lived component state wherever possible.

## Phase 4: Build and Deployment Safeguards
- [ ] Keep source maps disabled for public builds unless explicitly needed.
- [ ] Keep `dist/` out of version control.
- [ ] Keep `.env*` out of version control except placeholder examples.
- [ ] Add or retain a build-time scan for real secret-like patterns in production output.
- [ ] Ensure the build guard checks for actual secret material, not harmless text references.
- [ ] Confirm the GitHub Pages deployment only publishes secret-free artifacts.
- [ ] Add or update scripts for local verification.
- [ ] Verify that no secret-like strings appear in generated assets.
- [ ] Verify that no `.map` files are published unless explicitly intended.

## Phase 5: Documentation and User Guidance
- [ ] Update the README with local key entry instructions.
- [ ] Explain how to use user-supplied keys on GitHub Pages.
- [ ] Explain how to use user-supplied keys in a local run.
- [ ] Clarify that keys are stored locally only when the user opts in.
- [ ] Clarify that the app never needs a build-time API key.
- [ ] Explain how to clear stored keys.
- [ ] Explain the difference between session-only and persistent storage.
- [ ] Update architecture documentation to reflect secure runtime-only usage.
- [ ] Add a clear note that browser-based apps cannot fully hide secrets from the local runtime.

## Phase 6: Verification and QA
- [ ] Run linting after each major phase.
- [ ] Run a production build after each major phase.
- [ ] Validate that the secret guard passes only when no real secret patterns are present.
- [ ] Test local key save and reload behavior.
- [ ] Test session-only mode behavior.
- [ ] Test clear key behavior.
- [ ] Test provider switching behavior.
- [ ] Test AI request failure behavior when keys are missing.
- [ ] Test the app under GitHub Pages-compatible runtime assumptions.
- [ ] Verify that the settings UI remains usable and understandable.
- [ ] Verify that no secrets are embedded into source-controlled files or build artifacts.

## Acceptance Criteria
- [ ] Users can safely enter and manage OpenAI and Gemini keys locally.
- [ ] The settings UI is clear, masked, and reversible.
- [ ] No build-time secret injection remains.
- [ ] No real secrets appear in the production bundle.
- [ ] The app continues to work for both local usage and static hosting.
- [ ] Linting and build verification pass successfully.