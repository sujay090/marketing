import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => { 
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: isProduction
            ? "https://poster-generetorapp-backend.onrender.com" 
            : "http://localhost:5000", 
          changeOrigin: true,
          secure: false, 
        },
      },
    },
  };
});