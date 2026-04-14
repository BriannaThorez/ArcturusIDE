# Tasks: IDE UI Refinement & Documentation Engine

## Phase 1: Documentation Engine Integration
- [x] Add `Book` icon from `lucide-react` to `Layout.tsx` header.
- [x] Add `isDocViewerOpen` state to `Layout.tsx`.
- [x] Integrate `DocumentationViewer` component in `Layout.tsx`.
- [x] Verify `DocumentationViewer` indexes `/src/features/documentation-engine/main/`.

## Phase 2: GUI Cleanup & Fixes
- [x] Remove "OP" and "webGL2_active" pill from `Layout.tsx`.
- [x] Fix `LexicalChatInput.tsx` styling:
    - [x] Change `border-radius` to `0.75rem` (more squared).
    - [x] Adjust padding and flex layout to prevent clipping.
- [x] Fix `AgenticChat.tsx` empty state buttons:
    - [x] Ensure `flex-col` or `flex-row` alignment is centered.
    - [x] Fix overflow issues on text labels.
- [x] Update `Layout.tsx` icons:
    - [x] File Tree toggle -> `Folder`.
    - [x] Add `Menu` (hamburger) icon for Main Menu.

## Phase 3: Main Menu & Settings System
- [x] Create `src/widgets/menu/MainMenu.tsx`.
- [x] Create `src/widgets/settings/SettingsDialog.tsx`.
- [x] Implement settings persistence logic.
- [x] Add "Settings" option to Main Menu.

## Phase 4: Verification
- [x] Run `lint_applet`.
- [x] Run `compile_applet`.
- [x] Final visual check.
