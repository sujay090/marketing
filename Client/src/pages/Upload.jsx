// Upload.js
import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { toast } from "react-toastify";
import { posterAPI } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const defaultStyle = {
    fontSize: 20,
    fontFamily: "Arial",
    color: "#000000",
    bold: false,
    italic: false,
};

const Upload = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

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
                    const fontStyle = `${italic ? "italic " : ""}${bold ? "bold " : ""
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
        <div className="container-fluid py-4">
            {/* Header Section */}
            <div
                className="rounded-4 shadow-lg p-5 mb-4 text-center"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: currentTheme.shadow
                }}
            >
                <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                    <div
                        className="rounded-3 p-3 shadow-sm"
                        style={{ background: currentTheme.primary }}
                    >
                        <i className="fas fa-upload h-8 w-8" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                    </div>
                    <div>
                        <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                            Upload Poster Template
                        </h1>
                        <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                            Create customizable poster templates with dynamic placeholders
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className="rounded-4 shadow-lg p-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: currentTheme.shadow
                }}
            >        {/* Form starts here */}
                <form onSubmit={handleSubmit} className="row g-4">
                    {/* Step 1: Category and File Upload */}
                    <div className="col-12">
                        <div
                            className="rounded-4 shadow-sm p-4"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="d-flex align-items-center mb-4">
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: currentTheme.primary,
                                        color: '#ffffff'
                                    }}
                                >
                                    1
                                </div>
                                <h3 className="fs-5 fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    Basic Information
                                </h3>
                            </div>

                            <div className="row g-4">
                                {/* Category Selection */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                        Poster Category *
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                        className="form-select py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <option value="">-- Choose Category --</option>
                                        <option value="offers">🎯 Offers & Promotions</option>
                                        <option value="events">🎪 Events & Announcements</option>
                                        <option value="festivals">🎉 Festivals & Celebrations</option>
                                    </select>
                                </div>

                                {/* File Upload */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                        Upload Poster Template *
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePosterChange}
                                            ref={fileInputRef}
                                            required
                                            className="position-absolute w-100 h-100 opacity-0"
                                            style={{ cursor: 'pointer', zIndex: 2 }}
                                        />
                                        <div
                                            className="rounded-3 p-4 text-center border-dashed"
                                            style={{
                                                border: `2px dashed ${currentTheme.border}`,
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
                                            }}
                                        >
                                            <i className="fas fa-cloud-upload-alt mb-3" style={{ fontSize: '2rem', color: currentTheme.primary }}></i>
                                            <p className="mb-1" style={{ color: currentTheme.text }}>
                                                <span className="fw-semibold" style={{ color: currentTheme.primary }}>Click to upload</span> or drag and drop
                                            </p>
                                            <p className="small mb-0" style={{ color: currentTheme.textSecondary }}>
                                                PNG, JPG, JPEG up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Preview and Text Positioning */}
                    {posterSrc && (
                        <div className="col-12">
                            <div
                                className="rounded-4 shadow-sm p-4"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: `1px solid ${currentTheme.border}`,
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)'
                                }}
                            >
                                <div className="d-flex align-items-center mb-4">
                                    <div
                                        className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: currentTheme.info,
                                            color: '#ffffff'
                                        }}
                                    >
                                        2
                                    </div>
                                    <h3 className="fs-5 fw-bold mb-0" style={{ color: currentTheme.text }}>
                                        Position Text Elements
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 p-4 mb-4"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <p className="text-center mb-0" style={{ color: currentTheme.textSecondary }}>
                                        <i className="fas fa-info-circle me-2" style={{ color: currentTheme.primary }}></i>
                                        <strong>Tip:</strong> Drag the text boxes below to position them on your poster template
                                    </p>
                                </div>

                                <div className="d-flex justify-content-center">
                                    <div
                                        className="position-relative rounded-3 overflow-hidden shadow-lg"
                                        style={{
                                            width: imgSize.width,
                                            height: imgSize.height,
                                            border: `2px solid ${currentTheme.border}`
                                        }}
                                    >
                                        <img
                                            src={posterSrc}
                                            alt="Poster Preview"
                                            className="w-100 h-100"
                                            style={{ objectFit: 'contain' }}
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
                                                <div className="position-relative">
                                                    <input
                                                        type="text"
                                                        placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} placeholder`}
                                                        value={val.text}
                                                        onChange={(e) => handleTextChange(key, e.target.value)}
                                                        className="form-control border-dashed"
                                                        style={{
                                                            fontSize: val.style.fontSize,
                                                            fontFamily: val.style.fontFamily,
                                                            color: val.style.color,
                                                            fontWeight: val.style.bold ? "bold" : "normal",
                                                            fontStyle: val.style.italic ? "italic" : "normal",
                                                            background: 'rgba(255, 255, 255, 0.95)',
                                                            border: `2px dashed ${currentTheme.primary}`,
                                                            backdropFilter: 'blur(10px)',
                                                            WebkitBackdropFilter: 'blur(10px)',
                                                            height: '100%'
                                                        }}
                                                    />
                                                    <div
                                                        className="position-absolute top-0 start-0 translate-middle badge rounded-3"
                                                        style={{
                                                            background: currentTheme.primary,
                                                            color: '#ffffff',
                                                            fontSize: '0.7rem',
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: 10
                                                        }}
                                                    >
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
                        <div className="col-12">
                            <div
                                className="rounded-4 shadow-sm p-4"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: `1px solid ${currentTheme.border}`,
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)'
                                }}
                            >
                                <div className="d-flex align-items-center mb-4">
                                    <div
                                        className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: currentTheme.success,
                                            color: '#ffffff'
                                        }}
                                    >
                                        3
                                    </div>
                                    <h3 className="fs-5 fw-bold mb-0" style={{ color: currentTheme.text }}>
                                        Customize Text Styles
                                    </h3>
                                </div>

                                <div className="row g-4">
                                    {Object.entries(elements).map(([key, val]) => (
                                        <div key={key} className="col-12 col-lg-4">
                                            <div
                                                className="rounded-4 shadow-sm p-4 h-100"
                                                style={{
                                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)'
                                                }}
                                            >
                                                <div className="d-flex align-items-center mb-3">
                                                    <div
                                                        className="rounded-3 p-2 me-2"
                                                        style={{ background: currentTheme.primary }}
                                                    >
                                                        <i
                                                            className={`fas ${key === 'companyName' ? 'fa-building' :
                                                                    key === 'whatsapp' ? 'fa-phone' : 'fa-globe'
                                                                }`}
                                                            style={{ color: '#ffffff', fontSize: '1rem' }}
                                                        ></i>
                                                    </div>
                                                    <h5 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                                                    </h5>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label small fw-semibold" style={{ color: currentTheme.text }}>
                                                        Sample Text
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={val.text}
                                                        onChange={(e) => handleTextChange(key, e.target.value)}
                                                        placeholder={`Enter ${key} sample text`}
                                                        className="form-control rounded-3"
                                                        style={{
                                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                            border: `1px solid ${currentTheme.border}`,
                                                            color: currentTheme.text,
                                                            backdropFilter: 'blur(10px)',
                                                            WebkitBackdropFilter: 'blur(10px)'
                                                        }}
                                                    />
                                                </div>

                                                <div className="row g-3 mb-3">
                                                    {/* Font Size */}
                                                    <div className="col-6">
                                                        <label className="form-label small fw-semibold" style={{ color: currentTheme.text }}>
                                                            Font Size
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min={10}
                                                            max={60}
                                                            value={val.style.fontSize}
                                                            onChange={(e) => handleStyleChange(key, "fontSize", e.target.value)}
                                                            className="form-range"
                                                            style={{
                                                                accentColor: currentTheme.primary
                                                            }}
                                                        />
                                                        <div className="text-center small" style={{ color: currentTheme.textSecondary }}>
                                                            {val.style.fontSize}px
                                                        </div>
                                                    </div>

                                                    {/* Color */}
                                                    <div className="col-6">
                                                        <label className="form-label small fw-semibold" style={{ color: currentTheme.text }}>
                                                            Color
                                                        </label>
                                                        <input
                                                            type="color"
                                                            value={val.style.color}
                                                            onChange={(e) => handleStyleChange(key, "color", e.target.value)}
                                                            className="form-control form-control-color rounded-3 w-100"
                                                            style={{ height: '40px' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Font Family */}
                                                <div className="mb-3">
                                                    <label className="form-label small fw-semibold" style={{ color: currentTheme.text }}>
                                                        Font Family
                                                    </label>
                                                    <select
                                                        value={val.style.fontFamily}
                                                        onChange={(e) => handleStyleChange(key, "fontFamily", e.target.value)}
                                                        className="form-select rounded-3"
                                                        style={{
                                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                            border: `1px solid ${currentTheme.border}`,
                                                            color: currentTheme.text,
                                                            backdropFilter: 'blur(10px)',
                                                            WebkitBackdropFilter: 'blur(10px)'
                                                        }}
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
                                                <div className="d-flex gap-3">
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            checked={val.style.bold}
                                                            onChange={(e) => handleStyleChange(key, "bold", e.target.checked)}
                                                            className="form-check-input"
                                                            id={`bold-${key}`}
                                                            style={{ accentColor: currentTheme.primary }}
                                                        />
                                                        <label className="form-check-label small" htmlFor={`bold-${key}`} style={{ color: currentTheme.text }}>
                                                            Bold
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            checked={val.style.italic}
                                                            onChange={(e) => handleStyleChange(key, "italic", e.target.checked)}
                                                            className="form-check-input"
                                                            id={`italic-${key}`}
                                                            style={{ accentColor: currentTheme.primary }}
                                                        />
                                                        <label className="form-check-label small" htmlFor={`italic-${key}`} style={{ color: currentTheme.text }}>
                                                            Italic
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="col-12">
                        <div
                            className="rounded-4 shadow-sm p-4"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                                <div className="text-center text-sm-start">
                                    <h5 className="fw-bold mb-1" style={{ color: currentTheme.text }}>
                                        Ready to Upload?
                                    </h5>
                                    <p className="mb-0 small" style={{ color: currentTheme.textSecondary }}>
                                        Your poster template will be saved with all customization options
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !posterSrc || !category}
                                    className={`btn px-4 py-3 fw-semibold rounded-3 shadow-sm d-flex align-items-center gap-2 ${loading || !posterSrc || !category ? 'disabled' : ''
                                        }`}
                                    style={{
                                        background: (loading || !posterSrc || !category) ?
                                            currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' :
                                            currentTheme.primary,
                                        border: 'none',
                                        color: (loading || !posterSrc || !category) ? currentTheme.textSecondary : '#ffffff',
                                        cursor: (loading || !posterSrc || !category) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading && posterSrc && category) {
                                            e.target.style.transform = 'scale(1.02)';
                                            e.target.style.boxShadow = currentTheme.shadow;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-upload"></i>
                                            <span>Upload Poster Template</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </div>
    );
};

export default Upload;
