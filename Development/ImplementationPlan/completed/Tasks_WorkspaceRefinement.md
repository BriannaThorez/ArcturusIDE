# Tasks Checklist: Workspace Refinement & Documentation

## Phase 1: Documentation & Typography
- [x] Create `/src/features/documentation-engine/webGPU_instancing.md`.
- [x] Document Qwen 3.5 9B WebGPU instantiation in APA format.
- [x] Update `src/usersettings.json` with new fonts and `options` registry.
- [x] Update `src/index.css` with Google Fonts imports for Lexend Deca and Atkinson Hyperlegible.
- [x] Run linting and verification/QA checks.

## Phase 2: Chat GUI & Input Refinement
- [x] Move `LexicalChatInput` into `AgenticChat.tsx` (if not already there) to ensure it follows the panel.
- [x] Fix the "double outline" bug in `LexicalChatInput.tsx`.
- [x] Adjust input box border-radius and size to match the legacy design.
- [x] Ensure the Send button is visible and functional.
- [x] Update `Layout.tsx` to ensure center panel spans to bottom when terminal is closed.
- [x] Run linting and verification/QA checks.

## Phase 3: WebGPU Feedback & Status Badge
- [x] Update `Layout.tsx` to pipe WebGPU loading progress to the terminal.
- [x] Create the `LocalModelBadge` component in `Layout.tsx`.
- [x] Implement Salmon Pulse animation for loading state.
- [x] Implement Blue Glow for active/instantiated state.
- [x] Position badge next to the model selection dropdown.
- [x] Run linting and verification/QA checks.
