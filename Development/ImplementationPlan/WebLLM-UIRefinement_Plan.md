# Implementation Plan: UI Model Selector Refinement

## Objective
To enhance the IDE's model selection experience by implementing a dual-filter (Local/Cloud) system, aligning all dropdown menus with the "Main Menu" visual aesthetic, and updating the status bar to display the active model name.

---

## Task List

### Phase I: Model Filter & Selector Logic
- [ ] Create a filterable model state in `Layout.tsx` that separates `AVAILABLE_MODELS` by type (cloud, webgpu, local).
- [ ] Add PC and Cloud icons to the left of the model selection trigger to allow users to filter the visible list.
- [ ] Refactor the dropdown trigger to use the new filter state.
- [ ] [Agent Report]

### Phase II: Visual Unification (Dropdown Aesthetic)
- [ ] Extract the `MainMenu` dropdown styling (canopy-panel, glass-border, rounded-sm buttons) into a reusable `MenuDropdown` component.
- [ ] Update all dropdowns (Model Menu, Center Panel, Right Panel) to use this unified `MenuDropdown` aesthetic.
- [ ] Ensure all hover states, haptic-feedback scaling, and padding match the Main Menu.
- [ ] [Agent Report]

### Phase III: Status Bar Refinement
- [ ] Modify the "UPLINK_STABLE" indicator in the Header to dynamically display the `selectedModel.name` instead of static text.
- [ ] Ensure the font and alignment match the surrounding UI elements.
- [ ] [Agent Report]

---

## Environmental Constraints
- **Zero Backend:** Maintain current architecture.
- **Consistency:** All menus must look identical to the "System Menu" Main Menu.
- **Minimalism:** Use existing component library (Lucide, Motion).

---

## Success Criteria
1. **Filter Functionality:** Users can toggle between "Cloud" and "Local" to restrict the dropdown results.
2. **Visual Consistency:** All dropdown menus in the header look and behave like the "System Menu".
3. **Information Density:** The status bar correctly displays the active model in real-time.