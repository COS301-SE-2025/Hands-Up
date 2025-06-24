import React from 'react';

export function renderHistoryItem(capture){
  if (capture.type === 'video') {
    return (
      <video 
        src={capture.url} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted
      />
    );
  } else {
    return (
      <img 
        src={capture.url} 
        alt={`Capture`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
};

