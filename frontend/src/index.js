import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './/utils/reportWebVitals';
import { useGLTF } from '@react-three/drei';

useGLTF.preload('/models/angieLoad.glb');
useGLTF.preload('/models/angieWaving.glb');
useGLTF.preload('/models/game_models/angieWaving.glb');
useGLTF.preload('/models/game_models/angieWaving.glb');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
