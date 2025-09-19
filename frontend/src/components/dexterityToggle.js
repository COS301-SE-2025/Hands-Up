import React from 'react';
import { useDexterity } from '../contexts/dexterityContext';
import '../styles/dexterityToggle.css';

export function DexterityToggle() {
    const { dexterity, toggleDexterity } = useDexterity();

    const isRight = dexterity === 'right';

    return (
        <div className="dexterity-toggle">
            <label className="toggle-label">
                <span className="toggle-text"> Dexterity: {isRight ? 'Right Handed' : 'Left Handed'}</span>
                <div className="toggle-btn">
                    <input
                        type="checkbox"
                        checked={!isRight}
                        onChange={toggleDexterity}
                    />
                    <span className="slider"></span>
                </div>
            </label>
        </div>
    );
}
