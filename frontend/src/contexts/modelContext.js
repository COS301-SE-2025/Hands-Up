import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const modelSwitchContext = createContext();

const MODEL_LIST = ["alpha", "num"];

export function ModelSwitchProvider({ children }) {
  const [modelIndex, setModelIndex] = useState(0);

  const switchModel = () => {
    setModelIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % MODEL_LIST.length;
      console.log(`Switching model to: ${MODEL_LIST[newIndex]}`);
      return newIndex;
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
