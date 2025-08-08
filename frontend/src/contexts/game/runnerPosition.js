import React, { createContext, useContext, useRef } from 'react';

const RunnerPosContext = createContext(null);

export function RunnerPosProvider({ children }) {
  const runnerX = useRef(0); 
  return (
    <RunnerPosContext.Provider value={runnerX}>
      {children}
    </RunnerPosContext.Provider>
  );
}

export function useRunnerX() {
  return useContext(RunnerPosContext);
}