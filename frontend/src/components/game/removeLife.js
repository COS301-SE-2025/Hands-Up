import React from 'react';
import { FaHeartBroken } from 'react-icons/fa';

export default function LifeLostSign() {
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0.8;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 80, height: 80, pointerEvents: 'none', zIndex: 9999, animation: 'pulse 1.5s ease-in-out infinite', transformOrigin: 'center'
      }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ cursor: 'default', display: 'block' }}>
            <polygon points="10,15 70,15 40,65" fill="white" stroke="red" strokeWidth={8} />
          </svg>

          <FaHeartBroken style={{ 
              position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -55%)', color: 'red', fontSize: 24, pointerEvents: 'none'
          }}/>
      </div>
    </>
  );
}