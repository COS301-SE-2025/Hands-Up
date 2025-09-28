import React from 'react';
import { useDexterity } from '../contexts/dexterityContext';
import '../styles/dexterityToggle.css';

export function DexterityToggle() {
    const { dexterity, toggleDexterity } = useDexterity();

    const isRight = dexterity === 'right';

    return (
        <div className="dexterity-toggle">
            <label className="toggle-label">
                <span className="toggle-text"><b>Handedness</b>: {isRight ? 'Right' : 'Left'}</span>
                <div className="toggle-btn">
                    <input
                        type="checkbox"
                        checked={isRight}
                        onChange={toggleDexterity}
                    />
                    <span className="slider"></span>
                </div>
            </label>
        </div>
    );
}
