import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { WebLLMEngineManager, EngineState } from './EngineManager';
import { InitProgressReport } from '@mlc-ai/web-llm';

interface WebLLMContextType {
  manager: WebLLMEngineManager;
  state: EngineState;
  progress: InitProgressReport | null;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: () => Promise<void>;
}

const WebLLMContext = createContext<WebLLMContextType | undefined>(undefined);

export const WebLLMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EngineState>('idle');
  const [progress, setProgress] = useState<InitProgressReport | null>(null);

  const manager = useMemo(() => new WebLLMEngineManager((report) => {
    setProgress(report);
  }), []);

  useEffect(() => {
    manager.bootEngine().then(() => setState(manager.getState()));
    return () => manager.terminate();
  }, [manager]);

  const loadModel = async (modelId: string) => {
    setState('loading');
    try {
      await manager.loadModel(modelId);
      setState('ready');
    } catch (err) {
      setState('error');
      throw err;
    }
  };

  const unloadModel = async () => {
    await manager.unloadCurrentModel();
    setState('ready');
  };

  const contextValue: WebLLMContextType = { manager, state, progress, loadModel, unloadModel };

  return (
    <WebLLMContext.Provider value={contextValue}>
      {children}
    </WebLLMContext.Provider>
  );
};

export const useWebLLMEngine = (): WebLLMContextType => {
  const context = useContext(WebLLMContext);
  if (!context) {
    throw new Error('useWebLLMEngine must be used within a WebLLMProvider');
  }
  return context;
};
