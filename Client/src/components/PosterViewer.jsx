import React from 'react';

const PosterViewer = ({ poster, customer }) => {
  if (!poster) return null;

  // Get the customer data for each placeholder
  const getPlaceholderText = (key) => {
    if (!customer) return '';
    switch (key) {
      case 'companyName':
        return customer.companyName || '';
      case 'whatsapp':
        return customer.whatsapp || '';
      case 'website':
        return customer.website || '';
      default:
        return '';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Poster Image */}
      <img 
        src={poster.imageUrl.replace(/\\/g, '/')} 
        alt="Poster" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          maxWidth: 300,
          display: 'block',
          objectFit: 'contain',
          backgroundColor: '#f3f4f6'
        }} 
      />

      {/* Overlay placeholders with customer data */}
      {poster.placeholders?.map((ph, i) => {
        const text = getPlaceholderText(ph.key);
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${ph.y}px`,
              left: `${ph.x}px`,
              width: `${ph.width}px`,
              height: `${ph.height}px`,
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
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'left top'
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
