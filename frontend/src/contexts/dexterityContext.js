import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types'

const DexterityContext = createContext();

DexterityProvider.propTypes = {
  children: PropTypes.node, 
};

export function DexterityProvider({ children }) {
    
    const [dexterity, setDexterity] = useState(() => {
        return localStorage.getItem('dexterity') || 'right';
    });

    const toggleDexterity = () => {
        setDexterity(prev => (prev === 'right' ? 'left' : 'right'));
        localStorage.setItem('dexterity', dexterity === 'right' ? 'left' : 'right');
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
