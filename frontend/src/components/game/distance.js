import { useEffect, useState } from 'react';

export default function Distance(gameStarted) {
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    let interval;

    if (gameStarted) {
      interval = setInterval(() => {
        setDistance(prev => prev + 10);
      }, 1000);
    } else {
      setDistance(0);
    }

    return () => clearInterval(interval);
  }, [gameStarted]);

  return distance;
}