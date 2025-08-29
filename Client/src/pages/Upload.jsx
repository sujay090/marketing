// Upload.js
import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { toast } from "react-toastify";
import { posterAPI } from "../services/api";

const defaultStyle = {
  fontSize: 20,
  fontFamily: "Arial",
  color: "#000000",
  bold: false,
  italic: false,
};

const Upload = () => {
  const [category, setCategory] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [posterSrc, setPosterSrc] = useState("");
  const [imgSize, setImgSize] = useState({ width: 400, height: 560 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);

  const [elements, setElements] = useState({
    companyName: {
      x: 40,
      y: 60,
      width: 200,
      height: 50,
      text: "",
      style: { ...defaultStyle },
    },
    whatsapp: {
      x: 40,
      y: 140,
      width: 200,
      height: 50,
      text: "",
      style: { ...defaultStyle },
    },
    website: {
      x: 40,
      y: 220,
      width: 200,
      height: 50,
      text: "",
      style: { ...defaultStyle },
    },
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePosterChange = (e) => {
    if (!category) {
      toast.error("Please select a category first!");
      e.target.value = "";
      return;
    }

    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 400;
          const ratio = img.width / img.height;
          const width = maxWidth;
          const height = maxWidth / ratio;

          setImgSize({ width, height });
          setOriginalSize({ width: img.width, height: img.height });
          setPosterSrc(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image!");
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!posterSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = posterSrc;

    image.onload = () => {
      canvas.width = imgSize.width;
      canvas.height = imgSize.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      Object.entries(elements).forEach(([key, val]) => {
        if (val.text.trim() !== "") {
          const { fontSize, fontFamily, color, bold, italic } = val.style;
          const fontStyle = `${italic ? "italic " : ""}${
            bold ? "bold " : ""
          }${fontSize}px ${fontFamily}`;
          ctx.font = fontStyle;
          ctx.fillStyle = color;
          ctx.textBaseline = "top";
          ctx.fillText(val.text, val.x + 5, val.y + 5);
        }
      });
    };
  }, [posterSrc, imgSize, elements]);

  const handleStyleChange = (key, prop, value) => {
    let newValue = value;
    if (prop === "fontSize") {
      const parsed = parseInt(value, 10);
      newValue =
        Number.isNaN(parsed) || parsed <= 0 ? defaultStyle.fontSize : parsed;
    }
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        style: {
          ...prev[key].style,
          [prop]: newValue,
        },
      },
    }));
  };

  const handleTextChange = (key, newText) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        text: newText,
      },
    }));
  };

  const onDragStop = (key, e, d) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        x: d.x,
        y: d.y,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!posterSrc || !category) {
      return toast.error("Please upload an image and select category!");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("posters", posterFile);
      formData.append("category", category);

      const xRatio =
        originalSize.width && imgSize.width
          ? originalSize.width / imgSize.width
          : 1;
      const yRatio =
        originalSize.height && imgSize.height
          ? originalSize.height / imgSize.height
          : 1;

      const placeholders = Object.entries(elements).map(([key, val]) => ({
        x: Math.round(val.x * xRatio),
        y: Math.round(val.y * yRatio),
        width: Math.round(val.width * xRatio),
        height: Math.round(val.height * yRatio),
        text: `{${key.toLowerCase()}}`,
        style: {
          fontSize: `${val.style.fontSize}px`,
          fontWeight: val.style.bold ? "bold" : "normal",
          fontStyle: val.style.italic ? "italic" : "normal",
          color: val.style.color,
          fontFamily: val.style.fontFamily,
        },
        textAlign: "left",
      }));

      formData.append("placeholders", JSON.stringify(placeholders));

      await posterAPI.uploadPoster(formData);

      toast.success("Poster uploaded successfully!");
      setCategory("");
      setPosterFile(null);
      setPosterSrc("");
      setElements({
        companyName: {
          x: 40,
          y: 60,
          width: 200,
          height: 50,
          text: "",
          style: { ...defaultStyle },
        },
        whatsapp: {
          x: 40,
          y: 140,
          width: 200,
          height: 50,
          text: "",
          style: { ...defaultStyle },
        },
        website: {
          x: 40,
          y: 220,
          width: 200,
          height: 50,
          text: "",
          style: { ...defaultStyle },
        },
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Upload failed!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Upload Poster Template</h1>
              <p className="text-gray-200 mt-1">Create customizable poster templates with dynamic placeholders</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/60 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-8">{/* Form starts here */}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Category and File Upload */}
          <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/50 to-slate-700/80 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
              Basic Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Poster Category *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-blue-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-800/70 text-white transition-all duration-200 appearance-none"
                  >
                    <option value="">-- Choose Category --</option>
                    <option value="offers">🎯 Offers & Promotions</option>
                    <option value="events">🎪 Events & Announcements</option>
                    <option value="festivals">🎉 Festivals & Celebrations</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Upload Poster Template *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    ref={fileInputRef}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200 bg-slate-800/50 hover:bg-slate-800/70">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Preview and Text Positioning */}
          {posterSrc && (
            <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/50 to-slate-700/80 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Position Text Elements
              </h3>
              
              <div className="bg-slate-800/60 rounded-xl p-6 shadow-inner border border-blue-500/20">
                <p className="text-sm text-gray-300 mb-4 text-center">
                  💡 <strong>Tip:</strong> Drag the text boxes below to position them on your poster template
                </p>
                
                <div className="flex justify-center">
                  <div
                    className="relative border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden"
                    style={{ width: imgSize.width, height: imgSize.height }}
                  >
                    <img
                      src={posterSrc}
                      alt="Poster Preview"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                    {Object.entries(elements).map(([key, val]) => (
                      <Rnd
                        key={key}
                        size={{ width: val.width, height: val.height }}
                        position={{ x: val.x, y: val.y }}
                        onDragStop={(e, d) => onDragStop(key, e, d)}
                        bounds="parent"
                        enableResizing={false}
                      >
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} placeholder`}
                            value={val.text}
                            onChange={(e) => handleTextChange(key, e.target.value)}
                            className="w-full h-full px-2 py-1 border-2 border-dashed border-indigo-400 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all duration-200 rounded"
                            style={{
                              fontSize: val.style.fontSize,
                              fontFamily: val.style.fontFamily,
                              color: val.style.color,
                              fontWeight: val.style.bold ? "bold" : "normal",
                              fontStyle: val.style.italic ? "italic" : "normal",
                            }}
                          />
                          <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </div>
                        </div>
                      </Rnd>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Style Controls */}
          {posterSrc && (
            <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/50 to-slate-700/80 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                Customize Text Styles
              </h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {Object.entries(elements).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/60 rounded-xl shadow-md border border-blue-500/20 p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg p-2 mr-3">
                        {key === 'companyName' && (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {key === 'whatsapp' && (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        )}
                        {key === 'website' && (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                          </svg>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-white capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Sample Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sample Text</label>
                        <input
                          type="text"
                          value={val.text}
                          onChange={(e) => handleTextChange(key, e.target.value)}
                          placeholder={`Enter ${key} sample text`}
                          className="w-full px-3 py-2 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700/60 text-white placeholder-gray-400 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Font Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                          <input
                            type="range"
                            min={10}
                            max={60}
                            value={val.style.fontSize}
                            onChange={(e) => handleStyleChange(key, "fontSize", e.target.value)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="text-xs text-gray-400 text-center mt-1">{val.style.fontSize}px</div>
                        </div>
                        
                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                          <div className="relative">
                            <input
                              type="color"
                              value={val.style.color}
                              onChange={(e) => handleStyleChange(key, "color", e.target.value)}
                              className="w-full h-10 border border-blue-500/30 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                        <select
                          value={val.style.fontFamily}
                          onChange={(e) => handleStyleChange(key, "fontFamily", e.target.value)}
                          className="w-full px-3 py-2 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-700/60 text-white"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Tahoma">Tahoma</option>
                          <option value="Helvetica">Helvetica</option>
                        </select>
                      </div>
                      
                      {/* Style Options */}
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={val.style.bold}
                            onChange={(e) => handleStyleChange(key, "bold", e.target.checked)}
                            className="rounded border-blue-500/30 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                          />
                          <span className="text-sm font-medium text-gray-300">Bold</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={val.style.italic}
                            onChange={(e) => handleStyleChange(key, "italic", e.target.checked)}
                            className="rounded border-blue-500/30 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                          />
                          <span className="text-sm font-medium text-gray-300">Italic</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-slate-800/80 via-blue-900/50 to-slate-700/80 rounded-xl p-6 border border-blue-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-semibold text-white">Ready to Upload?</h4>
                <p className="text-gray-300 text-sm">Your poster template will be saved with all customization options</p>
              </div>
              
              <button
                type="submit"
                disabled={loading || !posterSrc || !category}
                className={`px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 ${
                  loading || !posterSrc || !category
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload Poster Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  </div>
  );
};

export default Upload;
