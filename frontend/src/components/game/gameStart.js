import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImArrowLeft, ImArrowRight } from 'react-icons/im';
import { BiSolidChevronLeft, BiSolidChevronRight } from 'react-icons/bi';

export default function StartScreen({ onStart }) {
    const navigate = useNavigate();

    return (
            <div           
                style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                textAlign: 'center',
                width: '50%', 
                backgroundColor: '#4e7a51',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
                }}
            >

                <button
                    onClick={() => navigate('/home')} 
                    style={{
                    backgroundColor: '#4e7a51',
                    borderRadius: '12px',
                    border: '4px solid white',
                    padding: '12px 16px',
                    fontSize: '1.82vw',
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '5%',
                    cursor: 'pointer'
                    }}
                >
                    <span style={{ marginTop: '1%' }}><ImArrowLeft /></span>
                    <span style={{ color: '#ffcc00' }}>N1</span>
                    <span>Hands UP</span>
                </button>

                <div
                    style={{
                    backgroundColor: '#4e7a51',
                    borderRadius: '12px',
                    border: '4px solid white',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}
                >
                    <span style={{ color: 'white', fontSize: '2.34vw', fontWeight: 'bold' }}>Sign Surfers</span>
                </div>

                <style> {`@keyframes arrowBounce { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); }}`}</style>
                <button
                    onClick={onStart}
                    style={{
                    backgroundColor: '#4e7a51',
                    borderRadius: '12px',
                    border: '4px solid white',
                    padding: '12px 16px',
                    fontSize: '1.82vw',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '25px',
                    }}
                >
                    START <span style={{ fontSize: '1.82vw', marginTop: '1%', display: 'inline-block', animation: "arrowBounce 0.8s infinite ease-in-out" }}><ImArrowRight /></span>
                </button>

                <div
                    style={{
                    height: '4vw',
                    backgroundColor: 'whitesmoke',
                    borderRadius: '12px',
                    border: '4px solid white',
                    color: 'red',
                    fontSize: '2vw',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <BiSolidChevronLeft style={{ height: '100%', fontSize: '6vw' }} />
                        <BiSolidChevronLeft style={{ height: '100%', fontSize: '6vw' }} />
                        <BiSolidChevronLeft style={{ height: '100%', fontSize: '6vw' }} />
                    </span>
                    <span style={{ margin: '0 8vw' }} />
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <BiSolidChevronRight style={{ height: '100%', fontSize: '6vw' }} />
                        <BiSolidChevronRight style={{ height: '100%', fontSize: '6vw' }} />
                        <BiSolidChevronRight style={{ height: '100%', fontSize: '6vw' }} />
                    </span>
                </div>
            </div>
    );
}