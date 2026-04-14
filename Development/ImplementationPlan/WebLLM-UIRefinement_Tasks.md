# Task List: UI Model Selector Refinement

## Phase I: Model Filter & Selector Logic
- [ ] Refactor `AVAILABLE_MODELS` in `Layout.tsx` to be used with a filter state.
- [ ] Create a `filter` state: `activeFilter` (e.g., 'all', 'local', 'cloud').
- [ ] Implement filter buttons (PC icon for local/webgpu, Cloud icon for cloud) to toggle `activeFilter`.
- [ ] Apply logic to `AVAILABLE_MODELS` mapping: `AVAILABLE_MODELS.filter(m => activeFilter === 'all' || m.type === activeFilter)`.
- [ ] Verify functionality: Dropdown list should update immediately upon filter toggle.
- [ ] [Agent Report]

## Phase II: Visual Unification (Dropdown Aesthetic)
- [ ] Create `src/shared/ui/MenuDropdown.tsx`: A reusable component containing the `canopy-panel`, `shadow-2xl`, and `rounded-sm` styles used by `MainMenu.tsx`.
- [ ] Refactor the `Model Menu` in `Layout.tsx` to use `MenuDropdown`.
- [ ] Refactor the `Center Panel` dropdown in `Layout.tsx` to use `MenuDropdown`.
- [ ] Refactor the `Right Panel` dropdown in `Layout.tsx` to use `MenuDropdown`.
- [ ] Ensure all buttons inside `MenuDropdown` use the `active:scale-[0.98]` and `rounded-sm` styles.
- [ ] [Agent Report]

## Phase III: Status Bar Refinement
- [ ] Locate the "UPLINK_STABLE" status indicator in `Layout.tsx` (the header block).
- [ ] Replace the hardcoded `UPLINK_STABLE` string with the `selectedModel.name`.
- [ ] Add conditional formatting: if `modelLoadingProgress` is present, show "LOADING..." instead of the model name.
- [ ] [Agent Report]

## Phase IV: Final QA
- [ ] Run linting check across `Layout.tsx`, `Sidebar.tsx`, and `MainMenu.tsx`.
- [ ] Verify that clicking outside of any dropdown closes it (ensure `onClose` callbacks are properly wired).
- [ ] Verify that model selection persists and is reflected in the Header status bar.
- [ ] [Agent Report]