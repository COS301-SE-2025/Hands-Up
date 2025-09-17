import React, { createContext, useState, useContext } from 'react';

const DexterityContext = createContext();

export function DexterityProvider({ children }) {
    const [dexterity, setDexterity] = useState('right'); 

    const toggleDexterity = () => {
        setDexterity(prev => (prev === 'right' ? 'left' : 'right'));
    };

    return (
        <DexterityContext.Provider value={{ dexterity, setDexterity, toggleDexterity }}>
            {children}
        </DexterityContext.Provider>
    );
}

export function useDexterity() {
    return useContext(DexterityContext);
}
