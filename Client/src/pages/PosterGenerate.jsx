import { useEffect, useRef } from 'react';

const PosterGenerate = ({ imageUrl, companyName, whatsapp }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Apply overlay text
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      ctx.fillText(companyName || '', 30, 50);
      ctx.fillText(whatsapp || '', 30, 90);
    };

    img.onerror = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'red';
      ctx.fillText('Failed to load image', 50, 50);
    };
  }, [imageUrl, companyName, whatsapp]);

  return (
    <canvas
      ref={canvasRef}
      className="img-fluid border rounded shadow"
      style={{ maxWidth: '100%', height: 'auto', display: imageUrl ? 'block' : 'none' }}
    />
  );
};

export default PosterGenerate;
