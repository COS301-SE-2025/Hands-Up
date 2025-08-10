import React from 'react';
import { Link } from 'react-router-dom';
import { ImArrowLeft, ImArrowRight } from 'react-icons/im';
import { BiSolidChevronLeft, BiSolidChevronRight } from 'react-icons/bi';

export default function StartScreen({ onStart }) {
    return (
            <div
                style={{
                position: 'absolute',
                top: '23%',
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
                <div
                    style={{
                    backgroundColor: '#4e7a51',
                    borderRadius: '12px',
                    border: '4px solid white',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '5%',
                    }}
                >
                    <Link to="/home" style={{ textDecoration: 'none', cursor: 'pointer', marginTop: '2%' }}><span style={{ color: 'white', fontSize: '2.34vw', fontWeight: 'bold', marginTop: '3%' }}><ImArrowLeft /></span></Link>
                    <span style={{ color: '#ffcc00', fontSize: '2.34vw', fontWeight: 'bold' }}>G12</span>
                    <span style={{ color: 'white', fontSize: '2.34vw', fontWeight: 'bold' }}>Sign Surfers</span>
                </div>

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
                    START <span style={{ fontSize: '1.82vw', marginTop: '1%' }}><ImArrowRight /></span>
                </button>

                <div
                    style={{
                    backgroundColor: 'whitesmoke',
                    borderRadius: '12px',
                    border: '4px solid white',
                    // padding: '0',
                    color: 'red',
                    fontSize: '2vw',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // gap: '12px',
                    }}
                >
                    <span><BiSolidChevronLeft /><BiSolidChevronLeft /><BiSolidChevronLeft /></span>
                    <span style={{ margin: '0 16vw' }} />
                    <span><BiSolidChevronRight /><BiSolidChevronRight /><BiSolidChevronRight /></span>
                </div>
            </div>
    );
}