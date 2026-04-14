# Fruitbox Technical Blueprint Document (TBD)

## Overview
Fruitbox is a ReactJS WebGL2 FSD (Feature-Sliced Design) application. It serves as an agent-first AI coding interface, integrating Google Gemini for heavy lifting and a local DeepSeek model (DeepSeek-R1-Distill-Qwen-7B) for lightwork.

## Architecture
- **Frontend**: React 19, Vite, Tailwind CSS v4.
- **Styling**: Centralized in `GlobalStyles.css`. 1rem = 14px scaling. Fonts: Lexend Light, Atkinson Hyperlegible Mono.
- **State Management**: React Hooks, decoupled from UI components.
- **Animations**: `motion/react` for "Juicy" gamified feedback loops.
- **Design Pattern**: Feature-Sliced Design (FSD).

## Core Modules
1. **Agent Interface**: Chat UI for Gemini and DeepSeek.
2. **Directory Vibe**: Codebase context awareness.
3. **Vector Visualizer**: UI to inspect the `features.py` dictionary and asset vectors.

## AI Instructions
- The AI must continuously update `features.py` as new features are requested.
- The AI must adhere to `GeminiPrompting:EliteFidelity.md` protocols.
