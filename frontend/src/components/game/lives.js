import React from 'react';
import { FaHeartBroken } from 'react-icons/fa';

export default function LifeLostSign() {
  return (
    <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 80, height: 80, pointerEvents: 'none', zIndex: 9999,
    }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ cursor: 'default', display: 'block' }}>
            <polygon points="10,15 70,15 40,65" fill="white" stroke="red" strokeWidth={8} />
        </svg>

        <FaHeartBroken style={{ 
            position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -55%)', color: 'red', fontSize: 24, pointerEvents: 'none',
        }}/>
    </div>
  );
}