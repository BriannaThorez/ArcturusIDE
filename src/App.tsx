/** * --- Fruitbox IDE
 * Axiomatic intent of the program: To construct a self-sufficient, self-improving, agent-first IDE (Fruitbox) leveraging WebGPU for local LLM execution (e.g., Qwen 3.5 9B), API integrations (Gemini), an intuitive GUI with antigravity features, and a neurosymbolic vector-state persona avatar.
 * Author: Brianna Thorez
 */
import { Layout } from "./app/Layout";

import { WebLLMProvider } from "./services/web-llm/manager/useWebLLMEngine";

export default function App() {
  return (
    <WebLLMProvider>
      <Layout />
    </WebLLMProvider>
  );
}
