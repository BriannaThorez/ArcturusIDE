# Implementation Plan: IDE UI Refinement & Documentation Engine Integration

## Metadata
- **Title**: IDE UI Refinement & Documentation Engine Integration
- **Version**: 1.0.0
- **Intents**:
    - **Axiomatic**: Documentation is a first-class citizen; UI must be precise and noise-free.
    - **Axiological**: High-performance rendering (Lexical/CodeMirror) across all modules; craftsmanship in alignment and layout.
    - **Teleological**: A unified, persistent settings system and a seamless documentation browsing experience.

## Phase 1: Documentation Engine Integration
- **Goal**: Integrate the `DocumentationViewer` into the IDE layout.
- **Tasks**:
    - Add "Book" icon to the header.
    - Implement state for documentation visibility.
    - Render `DocumentationViewer` as an overlay or dedicated panel.
    - Ensure it correctly indexes files in `/src/features/documentation-engine/main/`.

## Phase 2: GUI Cleanup & Fixes
- **Goal**: Remove layout noise and fix component alignment.
- **Tasks**:
    - Remove "OP" label and "webGL2_active" pill from header.
    - Fix `LexicalChatInput` styling:
        - Square the corners (reduce border-radius).
        - Fix padding/margin to prevent icon/button clipping.
        - Ensure the Send button is fully visible.
    - Fix `AgenticChat` empty state buttons:
        - Center text and icons.
        - Prevent overflow/clipping.
    - Update header icons:
        - File Tree toggle -> `Folder` icon.
        - Add Hamburger menu icon for "Main Menu".

## Phase 3: Main Menu & Settings System
- **Goal**: Implement a persistent settings system with a dedicated UI.
- **Tasks**:
    - Create `MainMenu` component.
    - Create `SettingsDialog` component using Lexical/CodeMirror for advanced configuration.
    - Integrate with `useUserSettings` for persistence.
    - Add "Settings" entry to the Main Menu.

## Phase 4: Verification & QA
- **Goal**: Ensure stability and performance.
- **Tasks**:
    - Run `lint_applet`.
    - Run `compile_applet`.
    - Verify all UI fixes in the preview.
