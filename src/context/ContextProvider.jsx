import React, { createContext, useState } from "react";

export const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [someState, setSomeState] = useState(null); // Replace with your actual state

  return (
    <AppContext.Provider value={{ someState, setSomeState }}>
      {children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
