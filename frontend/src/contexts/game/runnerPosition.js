import React, { createContext, useContext, useRef } from 'react';

const RunnerPosContext = createContext(null);

export function RunnerPosProvider({ children }) {
  const runnerX = useRef(0); 
  const runnerY = useRef(0);
  return (
    <RunnerPosContext.Provider value={{runnerX, runnerY}}>
      {children}
    </RunnerPosContext.Provider>
  );
}

export function useRunnerX() {
  const context = useContext(RunnerPosContext);
  if (!context) throw new Error("useRunnerX must be used within RunnerPosProvider");
  return context.runnerX;
}

export function useRunnerY() {
  const context = useContext(RunnerPosContext);
  if (!context) throw new Error("useRunnerY must be used within RunnerPosProvider");
  return context.runnerY;
}