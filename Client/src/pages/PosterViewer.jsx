import React from 'react';

const PosterViewer = ({ poster, customer }) => {
  if (!poster || !customer) return <p>Select a poster and customer to preview</p>;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Poster Image */}
      <img 
        src={poster.imageUrl.replace(/\\/g, '/')} 
        alt="Poster" 
        style={{ width: '100%', maxWidth: 600, display: 'block' }} 
      />

      {/* Overlay placeholders with customer data */}
      {poster.placeholders.map((ph, i) => {
        // Determine the text to display based on placeholder key and customer data
        // Assuming placeholder keys match customer fields like 'companyName', 'phone', etc.
        const text = customer[ph.key] || '';

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: ph.y,
              left: ph.x,
              width: ph.width,
              height: ph.height,
              color: ph.style.color,
              fontSize: ph.style.fontSize,
              fontWeight: ph.style.fontWeight,
              fontFamily: ph.style.fontFamily,
              textAlign: ph.textAlign,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              pointerEvents: 'none', 
              userSelect: 'none',
              
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};

export default PosterViewer;
