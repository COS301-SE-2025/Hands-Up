import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/learn.css';

async function getLandmarks(letter) {
  const response = await fetch(`/landmarks/${letter}.json`);
  const data = await response.json();
  return data.frames;
}

export function SignLearn() {
  const { letter } = useParams();
  const canvasRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      const frames = await getLandmarks(letter);
      setLandmarks(frames);
      setFrameIndex(0);
    }
    loadData();
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let animationId;

    function drawFrame() {
    if (!ctx || landmarks.length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frame = landmarks[frameIndex];
    if (!frame) return;

    const getCoord = ({ x, y, z = 0 }) => ({
      x: x * canvas.width,
      y: y * canvas.height,
      z,
    });

    const points = frame.map(getCoord);
    const light = { x: canvas.width * 0.5, y: canvas.height * 0.5 };

    const getShadedColor = (p) => {
      const dx = p.x - light.x;
      const dy = p.y - light.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const intensity = Math.max(0.4, 1 - dist / 300 - p.z * 2);
      const alpha = 0.8;
      const r = 220 * intensity;
      const g = 160 * intensity;
      const b = 130 * intensity;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const palmIndices = [0, 1, 5, 9, 13, 17];
    ctx.beginPath();
    for (let i = 0; i < palmIndices.length; i++) {
      const current = points[palmIndices[i]];
      const next = points[palmIndices[(i + 1) % palmIndices.length]];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;

      if (i === 0) {
        ctx.moveTo(current.x, current.y);
      }
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    ctx.closePath();
    ctx.fillStyle = getShadedColor(points[0]);
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.fill();

    const fingers = [
      [1, 2, 3, 4], [5, 6, 7, 8],
      [9, 10, 11, 12], [13, 14, 15, 16],
      [17, 18, 19, 20]
    ];

    for (const finger of fingers) {
      ctx.beginPath();
      const start = points[finger[0]];
      ctx.moveTo(start.x, start.y);

      for (let i = 0; i < finger.length - 1; i++) {
        const cp = points[finger[i]];
        const ep = points[finger[i + 1]];
        const midX = (cp.x + ep.x) / 2;
        const midY = (cp.y + ep.y) / 2;
        ctx.quadraticCurveTo(cp.x, cp.y, midX, midY);
      }

      ctx.strokeStyle = getShadedColor(start);
      ctx.lineWidth = 25 - start.z * 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Add a rounded fingertip
      // const tip = points[finger[finger.length - 1]];
      // ctx.beginPath();
      // ctx.arc(tip.x, tip.y, 5 - tip.z * 3, 0, 2 * Math.PI);
      // ctx.fillStyle = getShadedColor(tip);
      // ctx.fill();
    }

    // Animate next frame
    setFrameIndex((prev) => (prev + 1) % landmarks.length);
    animationId = requestAnimationFrame(drawFrame);
  }

      animationId = requestAnimationFrame(drawFrame);

      return () => cancelAnimationFrame(animationId);
    }, [landmarks, frameIndex]);

  return (
    <div className="sign-learn-container">
      <h1>Learning Sign: {letter}</h1>
      <canvas ref={canvasRef} width={640} height={480} className="sign-canvas" />
    </div>
  );
}
