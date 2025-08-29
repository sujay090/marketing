import { useEffect, useRef } from "react";

const PosterCanvas = ({ posterImage, placeholders = [] }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!posterImage) return;

    const drawPoster = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = posterImage.startsWith("http")
        ? posterImage
        : `http://localhost:3001/${posterImage}`;

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw base image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        // Draw text placeholders
        placeholders.forEach((ph) => {
          const {
            x,
            y,
            text = "",
            textAlign = "left",
            style: {
              fontSize = "20px",
              fontWeight = "normal",
              fontFamily = "Arial",
              color = "#000000",
            } = {},
          } = ph;

          ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
          ctx.fillStyle = color;
          ctx.textAlign = textAlign;
          ctx.fillText(text, x, y + parseInt(fontSize));
        });
      };

      image.onerror = () => {
        console.error("Failed to load image:", posterImage);
      };
    };

    drawPoster();
  }, [posterImage, placeholders]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: "100%",
        border: "1px solid #ccc",
        display: "block",
        margin: "0 auto",
      }}
    />
  );
};

export default PosterCanvas;
