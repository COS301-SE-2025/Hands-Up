import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/learn.css'; 

export default function SignDisplayPage() {
  const { letter } = useParams();
  const navigate = useNavigate();

  return (
    <div className="sign-display">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      <h1> {letter}</h1>

      <div className="sign-character">
      </div>
    </div>
  );
}
