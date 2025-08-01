import React, { createContext, useContext, useState } from "react";

const modelSwitchContext = createContext();

const MODEL_LIST = ["alpha", "gloss", "num"];

export function ModelSwitchProvider({ children }) {
  const [modelIndex, setModelIndex] = useState(0);

  const switchModel = (direction = "right") => {
    setModelIndex((prevIndex) => {
      if (direction === "right") {
        return (prevIndex + 1) % MODEL_LIST.length;
      } else if (direction === "left") {
        return (prevIndex - 1 + MODEL_LIST.length) % MODEL_LIST.length;
      }
      return prevIndex; 
    });
  };

  const modelState = {
    model: MODEL_LIST[modelIndex]
  };

  return (
    <modelSwitchContext.Provider value={{ modelState, switchModel }}>
      {children}
    </modelSwitchContext.Provider>
  );
}

export const useModelSwitch = () => {
  return useContext(modelSwitchContext);
};

ModelSwitchProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
