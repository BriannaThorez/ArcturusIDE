features_vector = {
    "app_name": "Fruitbox",
    "description": "A gamified, agent-first AI coding interface using Gemini and DeepSeek local models.",
    "features": {
        "chat_interface": {
            "description": "Main interface for interacting with the AI.",
            "status": "implemented",
            "components": ["ChatWindow", "MessageInput", "ModelSelector"]
        },
        "directory_vibe": {
            "description": "Ability to read and understand the codebase directory.",
            "status": "mocked",
            "components": ["FileExplorer"]
        },
        "juicy_ui": {
            "description": "Gamified UI feedback loops using framer-motion.",
            "status": "implemented",
            "components": ["AnimatedButton", "FeedbackToast"]
        },
        "vector_visualizer": {
            "description": "UI button and modal to visualize the features vector and assets.",
            "status": "implemented",
            "components": ["VectorVisualizerModal"]
        },
        "codemirror6_editor": {
            "description": "Integrated CodeMirror 6 editor with AI-driven autocomplete, LSP-ready bridge, and real-time linting.",
            "status": "implemented",
            "components": ["CodeMirrorEditor", "AICompletionSource", "LinterExtension"]
        },
        "agent_drawer": {
            "description": "Right-hand page-height drawer for the agent, toggleable via a glowing bar.",
            "status": "implemented",
            "components": ["Layout", "GlowingBarToggle"]
        }
    }
}
