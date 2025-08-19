import React from 'react';
import PropTypes from "prop-types";
import { ImArrowLeft, ImArrowRight } from 'react-icons/im';
import { BsExclamationTriangle } from "react-icons/bs";

export default function StopScreen({ onResume, onQuit }) {
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
                    <BsExclamationTriangle
                        style={{
                        color: 'red',      
                        backgroundColor: '#ffc542',
                        padding: '5px', 
                        width: '20%',
                        height: '20%'
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <span style={{ color: 'black', fontSize: '2vw', fontWeight: 'bold' }}>Sign Surfers</span>
                        <span style={{ color: 'black', fontSize: '2.34vw', fontWeight: 'bold' }}>QUIT GAME ?</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <style> {`@keyframes arrowBounce { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); }}`}</style>
                    <button
                        onClick={onQuit}
                        style={{
                        backgroundColor: 'red',
                        borderRadius: '12px',
                        border: '4px solid black',
                        padding: '12px 16px',
                        fontSize: '1.82vw',
                        color: 'black',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '25px',
                        marginTop: '1%',
                        width: '49.5%'
                        }}
                    >
                        <span style={{ fontSize: '1.82vw', marginTop: '1%', display: 'inline-block'}}><ImArrowLeft /></span> QUIT 
                    </button>
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
                        gap: '25px',
                        marginTop: '1%',
                        width: '49.5%'
                        }}
                    >
                        RESUME <span style={{ fontSize: '1.82vw', marginTop: '1%', display: 'inline-block', animation: "arrowBounce 0.8s infinite ease-in-out" }}><ImArrowRight /></span>
                    </button>
                </div>

            </div>
    );
}

StopScreen.propTypes = {
  onResume: PropTypes.func.isRequired,
  onQuit: PropTypes.func.isRequired,
};