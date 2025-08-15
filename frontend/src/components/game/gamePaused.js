import React from 'react';
import PropTypes from "prop-types";
import { ImArrowRight } from 'react-icons/im';
import { FaCirclePause } from "react-icons/fa6";

export default function PauseScreen({ onResume }) {
    return (
            <div           
                style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                textAlign: 'center',
                width: '40%', 
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
                }}
            >

                <div
                    style={{
                    backgroundColor: '#ffc542',
                    borderRadius: '12px',
                    border: '4px solid black',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    }}
                >
                    <FaCirclePause
                        style={{
                        color: '#ffc542',      
                        backgroundColor: 'red',
                        border: '4px solid red', 
                        borderRadius: '50%',
                        padding: '5px', 
                        width: '20%',
                        height: '20%'
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <span style={{ color: 'black', fontSize: '2vw', fontWeight: 'bold' }}>Sign Surfers</span>
                        <span style={{ color: 'black', fontSize: '2.34vw', fontWeight: 'bold' }}>GAME PAUSED</span>
                    </div>
                </div>

                <style> {`@keyframes arrowBounce { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); }}`}</style>
                <button
                    onClick={onResume}
                    style={{
                    backgroundColor: 'whitesmoke',
                    borderRadius: '12px',
                    border: '4px solid black',
                    padding: '12px 16px',
                    fontSize: '1.82vw',
                    color: 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '1%',
                    gap: '25px',
                    }}
                >
                    RESUME <span style={{ fontSize: '1.82vw', marginTop: '1%', display: 'inline-block', animation: "arrowBounce 0.8s infinite ease-in-out" }}><ImArrowRight /></span>
                </button>

            </div>
    );
}

PauseScreen.propTypes = {
  onResume: PropTypes.func.isRequired,
};