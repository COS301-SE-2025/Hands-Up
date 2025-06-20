import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/learn.css';

function SignDisplayPage() {
  const { letter } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataPath = '/landmarks.json';

    fetch(dataPath)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const signData = data.find(item => item.label === letter.toUpperCase());
        if (signData) {
          setLandmarks(signData.landmarks);
          setError(null);
        } else {
          setLandmarks([]);
          setError(`No data for '${letter.toUpperCase()}' found.`);
        }
      })
      .catch(err => {
        console.error("Error fetching landmarks:", err);
        setError(`Failed to load data: ${err.message}`);
        setLandmarks([]);
      });
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;

    // Draw simplified palm fill
    const palmIndices = [0, 5, 9, 13, 17];
    if (palmIndices.every(i => landmarks[i])) {
      ctx.beginPath();
      const start = landmarks[palmIndices[0]];
      ctx.moveTo(start.x * w, start.y * h);
      for (let i = 1; i < palmIndices.length; i++) {
        const p = landmarks[palmIndices[i]];
        ctx.lineTo(p.x * w, p.y * h);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(135, 206, 250, 0.3)';
      ctx.fill();
    }

    // Draw bone connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17]                               // Outer palm
    ];

    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // 🟦 Draw accurate hand outline (custom anatomical path)
    const outlineIndices = [0, 1, 2, 3, 4, 8, 12, 16, 20, 17, 13, 9, 5, 0];
    const outlinePoints = outlineIndices.map(i => {
      const p = landmarks[i];
      return [p.x * w, p.y * h];
    });

    ctx.beginPath();
    ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
    for (let i = 1; i < outlinePoints.length; i++) {
      ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
    }
    ctx.closePath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.fill();

    // Draw landmarks as circles
    landmarks.forEach(point => {
      if (typeof point.x === 'number' && typeof point.y === 'number') {
        const x = point.x * w;
        const y = point.y * h;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'deepskyblue';
        ctx.fill();
      }
    });
  }, [landmarks]);

  return (
    <div className="sign-display">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      <h1>{letter.toUpperCase()}</h1>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      <div className="sign-character">
        <canvas
          ref={canvasRef}
          style={{ border: '1px solid #ccc', backgroundColor: 'white' }}
        />
      </div>
    </div>
  );
}

export default SignDisplayPage;