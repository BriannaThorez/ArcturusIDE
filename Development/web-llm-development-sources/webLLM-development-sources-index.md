# WEBLLM development sources index
CONTAINS URLS, SOURCES, AND SOURCE OF TRUTH LOCATIONS USED IN THE DEVELOPMENT OF OUR WEBLLM VIA WEBGPU FEATURE/SERVICE
Refer to these sources for troubleshooting
## Source URLS
**WebLLM source and documentation**
https://github.com/mlc-ai/web-llm
Description:
Official source repository for webLLM from which we use webGPU to instantiate an LLM model in our WebGL2.
See documentation directly below.
https://llm.mlc.ai/docs/deploy/webllm.html
Decription:
Official documentation for webLLM(llm.mlc.ai)
WebLLM is a high-performance in-browser LLM inference engine, aiming to be the backend of 
AI-powered web applications and agents. It provides a specialized runtime for the web backend 
of MLCEngine, leverages WebGPU for local acceleration, offers OpenAI-compatible API, and provides 
built-in support for web workers to separate heavy computation from the UI flow.
**functional webchat**
https://chat.webllm.ai/ 
Description: 
Fully functional web implementation example instantiates numerous models flawlessly. 
Verified functional and responsive on my chrome version/settings, os, and 3090 34gb GPU

https://github.com/mlc-ai/web-llm-chat
Description:
source repository for the above functional web implementation 
example, from which we use webGPU to instantiate an LLM model in our WebGL2

## Important Notes
**Caches undefined or unavailable:**
The Issue: If you are running your app over a standard http:// connection-->192.168.x.x (as opposed to localhost), 
the caches object will present error as undefined or unavailable, leading to "not defined" errors when WebLLM tries to initialize the engine.
Solution: Use locahost in your browser for development and Always serve your application via HTTPS. 

**Browser issues**
Web Worker Scope:
If you are using a Web Worker to run WebLLM, ensure your environment supports the Cache API within workers. 
While most modern Chrome versions do, certain "Private" or "Incognito" modes can restrict caches access inside workers.
Solution: Ensure there is an error handler capable of expressing this failure to the user and any remediations they can make.

Browser graphics acceleration disabled in browser:
WebGPU will fail to initialize or cache if "Use graphics acceleration when available" is toggled off in chrome://settings/system.
Solution: Ensure there is an error handler capable of expressing this failure to the user and any remediations they can make.

**Performance notes**
Handle Model Caching: 
Upon first load, the engine fetches model parameters into the IndexedDB cache. 
Subsequent runs will load significantly faster from local storage.
Streaming Responses: Use an asynchronous loop to stream output directly into your UI

Quantization: Use 4-bit quantized models (e.g., q4f16_1) to reduce VRAM usage and download times, 
making them viable for consumer-grade hardware.