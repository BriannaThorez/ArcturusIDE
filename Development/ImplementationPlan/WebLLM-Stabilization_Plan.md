# Industry-Leading Implementation Plan: WebLLM Integration & Stabilization

## Objective
To stabilize the WebLLM runtime in `ArcturusIDE`, resolve browser compatibility/initialization errors (`crypto.randomUUID`, `caches`), and implement a robust "Engine-as-a-Service" pattern that aligns with official `web-llm` reference architectures.

---

## Task List

### Phase I: Runtime Stabilization (The "Shim" Layer)
- [ ] Create `src/services/web-llm/runtime-shims.ts` to centralize `crypto.randomUUID` and `caches` shimming.
- [ ] Move crypto fallback logic here, ensuring it exports a `patchRuntime()` function.
- [ ] Call `patchRuntime()` in `src/main.tsx` **before** any other WebLLM imports.
- [ ] [Agent Report]

### Phase II: The "Engine-as-a-Service" Manager
- [ ] Create `src/services/web-llm/EngineManager.tsx` to handle background Engine boot (Worker init without model).
- [ ] Implement `unloadCurrentModel()` and `loadModel(modelId)` methods in the manager.
- [ ] Wire the "Brain" UI icon to trigger `loadModel(modelId)` with a pulse/beckoning animation state.
- [ ] Ensure model switching correctly calls `unload()` before the new `reload()` to prevent memory leaks.
- [ ] [Agent Report]

### Phase III: Model Registry & Configuration
- [ ] Create `src/services/web-llm/registry.ts` to map UI model IDs to official `webllm.ModelRecord` objects.
- [ ] Replace hardcoded model IDs in `webLLMService.ts` with lookup calls to this registry.
- [ ] Ensure `appConfig` in `webLLMService.ts` is generated dynamically based on the requested model record rather than a hardcoded override.
- [ ] [Agent Report]

### Phase IV: Performance & Visibility
- [ ] Implement a global "WebLLM Status" UI component in the Sidebar to surface engine state (`Loading`, `Ready`, `Error`).
- [ ] Surface progress events from `webLLMService` to this global status indicator.
- [ ] [Agent Report]

### Phase V: Maintenance & Cleanup
- [ ] Add a "Clear Cache" button in `SettingsDialog` triggering `deleteModelAllInfoInCache`.
- [ ] Remove all temporary debug logging (the `[WebLLM]` logs) to clean up terminal output.
- [ ] Final production build check against the `secret-safe-guard` plugin to ensure no build artifacts were corrupted during the refactor.
- [ ] [Agent Report]

---

## Environmental Constraints
- **Zero Backend:** The solution must remain 100% in-browser.
- **GitHub Pages:** Deployment must remain static-site compatible.
- **Chrome/Windows:** Must be performant and stable in the specified target environment.
- **Minimalism:** Use WebLLM-official APIs; avoid custom WASM/library builds unless absolutely required.

---

## Success Criteria
1. **Zero Initialization Crashes:** App loads and initializes engine without `crypto` or `caches` errors.
2. **Stable Lifecycle:** Engine remains alive across UI navigation and does not re-init on every chat message.
3. **Visibility:** User sees a loading bar or status indicator rather than a silent hang.
4. **Verifiable Cache:** Users can clear model cache via Settings if inference issues arise.