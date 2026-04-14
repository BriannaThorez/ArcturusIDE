# SynCom WebLLM Caches Investigation Compendium

## Subject Overview
This compendium documents the investigation into WebLLM as a whole, with specific focus on the recurring cache/runtime failure that surfaced during local browser execution of the WebGPU path.

Primary observed failure:
- `WebGPU Error: caches is not defined`
- later related runtime failures included:
  - `WebGPU Error: crypto.randomUUID is not a function`
  - `ModelNotFoundError: Cannot find model record in appConfig for ...`

The work was performed in the context of a Vite-based React application running entirely in-browser, with no backend service introduced, and with the goal of remaining deployable via GitHub Pages and usable in a standard Google Chrome environment on Windows.

---

## 1) Initial application state and target constraints

### Existing architecture
- The app already used Vite for local development and build output.
- The local inference path was triggered from `Layout.tsx`.
- WebLLM initialization was encapsulated in `src/services/webLLMService.ts`.
- The app already had separate UI paths for:
  - cloud API models
  - local simulated models
  - WebGPU/WebLLM models

### Constraints established early
- [kept] No backend introduction
- [kept] Must run entirely in-browser
- [kept] Must remain compatible with GitHub Pages as an initial deployment target
- [kept] Must work in a standard Google Chrome browser environment
- [kept] Must preserve a “known model” path for first functional validation
- [kept] Must avoid architectural rewrites unless required

### Additional security constraint work
- The repo was audited for secret leakage risks.
- Build-time injection of a Gemini API key was removed.
- Client-side secret usage was replaced with local runtime secret handling.
- This is adjacent context because it established a preference for minimal, safer, browser-local behavior rather than server-side rearchitecture.

---

## 2) First WebLLM failure: Cache API / `caches is not defined`

### Original symptom
The first major runtime error observed in the local WebGPU path was:
- `WebGPU Error: caches is not defined`

### What we confirmed
- The app code itself did **not** directly reference `caches`.
- The error originated inside `CreateMLCEngine(...)` / WebLLM internals.
- The issue was not a React state problem or a bad `CreateMLCEngine` call shape.

### Doc-driven investigation
We checked the official WebLLM README and confirmed:
- `AppConfig.cacheBackend` exists
- supported values include:
  - `"cache"` [default]
  - `"indexeddb"`
  - `"cross-origin"` [experimental]

### Initial mitigation attempted
- [changed] `webLLMService.ts` was updated to pass `appConfig` into `CreateMLCEngine(...)`
- [changed] `cacheBackend: "indexeddb"` was selected
- [kept] the rest of the architecture intact

### Result
- [didn't work] The `indexeddb` override did not fully solve the runtime issue
- The investigation moved from cache backend selection to broader runtime compatibility and integration shape

---

## 3) WebLLM integration model exploration

### Direct in-page initialization
The app originally used:
- `CreateMLCEngine(...)` directly in the main UI flow

### What we learned
- This path is valid
- But it is more sensitive to runtime context differences
- It does not isolate browser/worker compatibility issues well

### Official WebLLM alternatives confirmed in docs
The README documents:
- `CreateWebWorkerMLCEngine(...)`
- `CreateServiceWorkerMLCEngine(...)`

This indicated that the worker-based path was the next best documented approach.

### Decision taken
- [changed] The service was modularized under a new `src/services/web-llm/` subtree
- [changed] A worker-based WebLLM integration was implemented
- [kept] the browser-only constraint
- [kept] the no-backend constraint

### Outcome
- [helped] Worker-based execution became the preferred path for further debugging
- [didn't fully work yet] It exposed new runtime compatibility issues during worker bootstrap

---

## 4) Modularization of WebLLM service code

### Refactor intent
To make the WebLLM integration more maintainable and isolated, the code was reorganized into a dedicated folder:

- `src/services/web-llm/`

### What was created
- `src/services/web-llm/config/appConfig.ts`
- `src/services/web-llm/worker.ts`
- `src/services/web-llm/index.ts`

### What was changed
- [changed] The service-level WebLLM configuration was moved out of the top-level service file
- [changed] The worker entrypoint was separated from the UI code
- [changed] `Layout.tsx` was updated to use the modular WebLLM service import

### What helped
- [helped] This made the WebLLM surface easier to isolate and reason about
- [helped] It made worker-related debugging more explicit

### What did not immediately solve the issue
- [didn't work] Modularization alone did not resolve the runtime failures
- [didn't work] The browser/runtime incompatibilities remained

---

## 5) Worker path debugging and Vite module-loading issue

### Problem observed
The app produced a worker load failure:
- `Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html"`

### Root cause
This was caused by the worker file being referenced at a path that Vite could not resolve to a real JavaScript module file.

### Fix applied
- [changed] the worker file was moved to the correct location
- [changed] the Vite worker URL import was aligned with the actual file location

### Result
- [worked] The module-loading failure was resolved
- [helped] WebLLM worker initialization could proceed further

---

## 6) Worker-channel debug instrumentation and its side effects

### What was added
To understand runtime state, worker preflight logs were added for:
- IndexedDB presence
- `crypto` presence
- `crypto.randomUUID` presence
- WebGPU availability
- cross-origin isolation status

### What happened
Those debug messages were initially sent through the same message channel WebLLM uses internally.

### Side effect
- [didn't work] WebLLM treated the debug messages as invalid control messages
- This caused:
  - `UnknownMessageKindError: Unknown message kind`
- The worker debug transport itself became a new failure source

### Resolution
- [removed/didn't keep] worker debug messages were no longer sent through the WebLLM control channel
- [kept] the crypto fallback and worker compatibility work
- [helped] this removed accidental message-channel corruption

---

## 7) `crypto.randomUUID` failures

### New runtime symptom
After the worker/bootstrap changes, another error emerged:
- `WebGPU Error: crypto.randomUUID is not a function`

### What the stack trace showed
The error originated inside WebLLM worker engine initialization:
- `WebWorkerMLCEngine.setAppConfig(...)`
- `CreateWebWorkerMLCEngine(...)`

### Interpretation
This indicated the runtime environment was missing `crypto.randomUUID` in the execution context WebLLM was using.

### Attempts made
#### Attempt A: worker-side fallback
- [changed] Added a worker-side `crypto.randomUUID` fallback
- [helped somewhat] confirmed the worker itself could patch its crypto object

#### Attempt B: main-thread fallback
- [changed] Added a top-level fallback before WebLLM imports in the service module
- [helped conceptually] ensured the app tried to normalize the runtime earlier

#### Attempt C: worker bootstrap order changes
- [changed] adjusted worker loading so the fallback executed before WebLLM handler construction
- [helped] improved initialization ordering
- [didn't fully work] the error still recurred in some runs

### Important observation
The presence of this error did **not** mean the chosen model was invalid. It meant the runtime environment and/or initialization order was still unstable.

---

## 8) Model record mismatch and model selection confusion

### UI model selection mismatch
The UI originally contained a WebGPU model entry that did not match WebLLM’s prebuilt model list.

### Observed error
- `ModelNotFoundError: Cannot find model record in appConfig for qwen-3.5-9b-webgpu`

### What this meant
- [didn't work] the UI was requesting a model ID that WebLLM did not know about in `model_list`
- [helped] this confirmed the problem was partly model registration, not only cache behavior

### Official docs used
We queried the official WebLLM config source and documentation and confirmed:
- prebuilt WebLLM model IDs are the authoritative source for browser support
- custom models must be explicitly registered with:
  - `model`
  - `model_id`
  - `model_lib`

### Attempted custom-model path
A custom Hugging Face model was explored:
- `https://huggingface.co/Mitiskuma/Qwen3.5-9B-q4f16_1-MLC`

We verified the model config and README:
- it is MLC-formatted
- it is a Qwen3.5 hybrid model
- it uses `mlc_llm chat HF://...` successfully in CLI form

### Important conclusion
- [helped] The docs confirmed custom browser registration is possible in principle
- [didn't fully work] the correct browser-side `model_lib` compatibility was not established with certainty
- [didn't keep] the custom Qwen3.5 browser path became too unstable for a minimal first-functioning browser target

---

## 9) Reversion to the official Qwen 2.5 prebuilt model

### Why this was done
Because the custom model path introduced ambiguity and the user wanted a known good browser path, the app was reverted to an official prebuilt model.

### Final chosen “function now” model
- `Qwen2.5-7B-Instruct-q4f16_1-MLC`

### What was changed
- [changed] `Layout.tsx` WebGPU option was renamed to the official Qwen 2.5 7B model
- [changed] `webLLMService.ts` default model was set to the official Qwen 2.5 7B ID
- [removed/didn't keep] the custom Qwen3.5 Hugging Face `model_list` override
- [kept] `indexeddb` cache backend override
- [kept] worker-based execution path

### Result
- [helped] This returned the model selection to a valid, official WebLLM prebuilt record
- [didn't fully solve] the `crypto.randomUUID` runtime issue still remained in the latest runs

---

## 10) Final runtime state and open issue

### Current failing symptom
- `WebGPU Error: crypto.randomUUID is not a function`

### What this means now
The system is back on a valid model, but the WebLLM runtime still needs a reliable browser-compatible initialization environment.

### Current unresolved condition
The issue is no longer model registration.
The issue is now the runtime/bootstrap compatibility of WebLLM in this browser context, particularly with:
- worker initialization
- `crypto.randomUUID`
- and possibly the order in which WebLLM imports are evaluated

---

## 11) What helped vs. what did not

### Helped
- [helped] official docs lookup
- [helped] moving from default cache backend to `indexeddb`
- [helped] modularizing the WebLLM service
- [helped] switching to worker-based execution
- [helped] fixing the Vite worker path issue
- [helped] restoring the official prebuilt Qwen 2.5 7B model ID
- [helped] confirming that model mismatch and runtime mismatch were separate problems

### Did not help
- [didn't work] relying on default Cache API behavior
- [didn't work] `cacheBackend: "indexeddb"` alone
- [didn't work] custom worker debug messages via the WebLLM control channel
- [didn't work] custom Qwen3.5 model registration without a fully confirmed compatible `model_lib`
- [didn't work] repeated structural changes without returning to a known-good baseline
- [didn't work] assuming the model was the source of `crypto.randomUUID` failures

### Removed / not kept
- [removed/didn't keep] client-side secret injection
- [removed/didn't keep] custom debug message transport inside the WebLLM worker control channel
- [removed/didn't keep] custom Qwen3.5 `model_list` override
- [removed/didn't keep] unsupported or uncertain model IDs in the WebGPU picker

### Kept
- [kept] browser-only architecture
- [kept] GitHub Pages compatibility goal
- [kept] no-backend constraint
- [kept] worker-based WebLLM architecture
- [kept] IndexedDB backend intent
- [kept] valid official WebLLM prebuilt Qwen 2.5 model ID

---

## 12) Source Reference List

### User-provided sources / URLs
1. `https://huggingface.co/Mitiskuma/Qwen3.5-9B-q4f16_1-MLC`
2. `https://llm.mlc.ai/docs/deploy/webllm.html#verify-installation-for-adding-models`

### Official sources located during investigation
1. `https://raw.githubusercontent.com/mlc-ai/web-llm/main/README.md`
2. `https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/index.ts`
3. `https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/web_worker.ts`
4. `https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts`
5. `https://raw.githubusercontent.com/mlc-ai/mlc-llm/main/README.md`
6. `https://huggingface.co/Mitiskuma/Qwen3.5-9B-q4f16_1-MLC/raw/main/mlc-chat-config.json`
7. `https://huggingface.co/Mitiskuma/Qwen3.5-9B-q4f16_1-MLC/raw/main/README.md`

### Project-local context sources
- `ArcturusIDE/src/services/webLLMService.ts`
- `ArcturusIDE/src/services/web-llm/worker.ts`
- `ArcturusIDE/src/services/web-llm/config/appConfig.ts`
- `ArcturusIDE/src/services/web-llm/index.ts`
- `ArcturusIDE/src/app/Layout.tsx`
- `ArcturusIDE/vite.config.ts`

---

## 13) Final model references

### Ideal model:
`https://huggingface.co/Mitiskuma/Qwen3.5-9B-q4f16_1-MLC`

### For now, to function model:
`Qwen2.5-7B-Instruct-q4f16_1-MLC`

---

## 14) Suggestions, suppositions, and path forward

### Suggestions
- Keep the browser-only, no-backend architecture.
- Keep the official Qwen 2.5 7B prebuilt model until the runtime is stable.
- Keep worker-based WebLLM only if it can be made stable without custom message transport.
- Keep `indexeddb` if it is functioning, but only as part of a known-good baseline.
- Avoid more model churn until the runtime path is stable.

### Suppositions
- The repeated `crypto.randomUUID` errors likely stem from WebLLM’s initialization order or browser context assumptions rather than the model itself.
- The `caches is not defined` issue likely originated in the default cache backend path and/or runtime context assumptions in the browser environment.
- The custom Qwen3.5 HF model may be valid for CLI/MLC usage but still require a more carefully matched browser `model_lib` setup than was practical in this pass.

### Ideas for making the environment work
1. Start from the known functioning official Qwen 2.5 prebuilt model.
2. Minimize WebLLM wrapper logic around engine creation.
3. Keep worker bootstrap as simple as possible.
4. Avoid custom message channels in the WebLLM worker.
5. If worker mode still fails, temporarily validate the main-thread engine path with the same model and same cache backend.
6. Once stable, reintroduce custom model support one step at a time.
7. Maintain GitHub Pages compatibility by avoiding backend dependencies or service assumptions that require a server.
8. Ensure any future custom model path has:
   - verified `model_id`
   - verified `model_lib`
   - verified model architecture compatibility
   - verified WebGPU browser support

### Environmental constraints to preserve
- Must run entirely in-browser
- Must work without introducing a backend
- Must be suitable for GitHub Pages deployment
- Must work in Chrome on Windows as a first target
- Must be maintainable with a known model baseline
- Must avoid destabilizing experimental plumbing unless specifically required

### Final note
The most important conceptual lesson from this investigation is that the app now has two separate concerns:
- **model correctness**
- **runtime/browser compatibility**

Those are not the same problem. The model issue can be solved by selecting a valid WebLLM model ID. The runtime issue requires a stable browser-compatible WebLLM bootstrap path, and that is where the cache/worker/UUID failures have been concentrated.
