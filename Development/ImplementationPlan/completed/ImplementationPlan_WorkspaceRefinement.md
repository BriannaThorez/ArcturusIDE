# Implementation Plan: Workspace Refinement & Documentation

## Overview
This plan covers the implementation of a documentation engine, typography updates, chat GUI refinements, and dynamic status indicators for local model usage.

## Phase 1: Documentation & Typography (A & C)
*   **Documentation Engine:** Create `/src/features/documentation-engine/` and author the `webGPU_instancing.md` file in APA format.
*   **Typography:** Update `usersettings.json` with the new font defaults and the `options` registry. Update `index.css` to import the required Google Fonts.

## Phase 2: Chat GUI & Input Refinement (D)
*   **Coupling:** Ensure `LexicalChatInput` is a child of the `AgenticChat` component so it follows the panel switching logic.
*   **Visual Cleanup:** Remove the legacy outline in the chat input, adjust the border-radius and padding to match the intended "legacy" shape, and verify the Send button's visibility.
*   **Layout Spanning:** Adjust `Layout.tsx` to ensure the center panel spans to the bottom when the terminal is closed.

## Phase 3: WebGPU Feedback & Status Badge (B & E)
*   **Terminal Mirroring:** Update the `handleSendMessage` logic in `Layout.tsx` to write WebGPU progress reports to the terminal.
*   **Brain Badge:** Implement the `LocalModelBadge` component in `Layout.tsx` with Framer Motion animations (Salmon Pulse for loading, Blue Glow for active).
*   **Logic:** Trigger the badge visibility based on `selectedModel.type === 'webgpu' | 'local'` and its current lifecycle state.
