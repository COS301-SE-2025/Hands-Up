import React from 'react';

export function renderMediaPreview(url, type){
    if (type === 'video') {
      return (
        <video 
          controls 
          src={url} 
          style={{ 
            width: '100%', 
            height: '250px', 
            objectFit: 'cover',
            border: '2px solid #ddd', 
            borderRadius: '8px' 
          }}
        />
      );
    } else {
      return (
        <img 
          src={url} 
          alt="Captured sign" 
          style={{ 
            width: '100%', 
            height: '250px', 
            objectFit: 'cover', 
            border: '2px solid #ddd', 
            borderRadius: '8px' 
          }}
        />
      );
    }
};

