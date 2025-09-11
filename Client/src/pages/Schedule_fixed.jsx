import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { scheduleAPI, customerAPI, posterAPI } from "../services/api";
import { toast } from "react-toastify";
import PosterViewer from "../components/PosterViewer";
import { useTheme } from "../context/ThemeContext";

const Schedule = () => {
    const navigate = useNavigate();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [formData, setFormData] = useState({
        customerId: "",
        schedules: [
            {
                category: "",
                posters: [],
                selectedPosterIds: [],
                date: "",
                selectedPosterUrls: [
                    "https://cdn.pixabay.com/photo/2015/04/23/22/00/new-year-background-736885_1280.jpg",
                ],
            },
        ],
        customerPhoneNumber: "",
    });

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectCustomer, setselectCustomer] = useState("");
    const categories = ["Offers", "Events", "Festivals"];
    const baseUrl = "https://marketing.gs3solution.us/api"

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await customerAPI.getCustomers();
                setCustomers(res.data || []);
            } catch (error) {
                toast.error("Failed to fetch customers", { autoClose: 3000 });
            }
        };
        fetchCustomers();
    }, []);

    const handleCustomerChange = (e) => {
        const { value } = e.target;

        let _value = JSON.parse(value);
        console.log("ABC", _value);
        setselectCustomer(value);
        setFormData((prev) => ({
            ...prev,
            customerId: _value?._id,
            customerPhoneNumber: `91${_value?.whatsapp}`,
            schedules: prev.schedules.map((s) => ({
                ...s,
                posters: [],
                selectedPosterIds: [],
            })),
        }));
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...formData.schedules];
        newSchedules[index][field] = value;
        setFormData((prev) => ({ ...prev, schedules: newSchedules }));
    };

    const handlePosterSelect = (scheduleIndex, posterId) => {
        const newSchedules = [...formData.schedules];
        const selected = newSchedules[scheduleIndex].selectedPosterIds;
        const isSelected = selected.includes(posterId);

        newSchedules[scheduleIndex].selectedPosterIds = isSelected
            ? selected.filter((id) => id !== posterId)
            : [...selected, posterId];

        setFormData((prev) => ({ ...prev, schedules: newSchedules }));
    };

    const generatePosters = async (index) => {
        const sched = formData.schedules[index];
        if (!formData.customerId || !sched.category) {
            console.log("Error", formData);
            toast.warn("Please select customer and category first", {
                autoClose: 3000,
            });
            return;
        }

        const customer = customers.find((c) => c._id === formData.customerId);
        if (!customer) {
            toast.error("Customer not found.", { autoClose: 3000 });
            return;
        }

        try {
            const res = await posterAPI.getByCategory(
                sched.category.toLowerCase(),
                formData.customerId
            );
            const posters = Array.isArray(res.data.posters) ? res.data.posters : [];

            const postersWithPlaceholders = posters.map((poster) => {
                const populatedPoster = { ...poster };

                if (poster.placeholders && Array.isArray(poster.placeholders)) {
                    populatedPoster.placeholders = poster.placeholders.map(
                        (placeholder) => {
                            const value = customer[placeholder.key] || placeholder.text || "";
                            return {
                                ...placeholder,
                                text: value,
                            };
                        }
                    );
                }

                return populatedPoster;
            });

            const newSchedules = [...formData.schedules];
            newSchedules[index].posters = postersWithPlaceholders;
            newSchedules[index].selectedPosterIds = [];

            setFormData((prev) => ({ ...prev, schedules: newSchedules }));
        } catch (err) {
            toast.error("Failed to fetch posters", { autoClose: 3000 });
        }
    };

    const downloadPoster = (url) => {
        const link = document.createElement("a");
        link.href = /^https?:\/\//.test(url)
            ? url
            : baseUrl + url.replace(/\\/g, "/");
        link.download = "poster.jpg";
        link.target = "_blank";
        link.click();
    };

    const addScheduleRow = () => {
        setFormData((prev) => ({
            ...prev,
            schedules: [
                ...prev.schedules,
                { category: "", posters: [], selectedPosterIds: [], date: "" },
            ],
        }));
    };

    const removeScheduleRow = (index) => {
        if (formData.schedules.length === 1) return;
        const newSchedules = formData.schedules.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, schedules: newSchedules }));
    };

    const validateForm = () => {
        const today = new Date().toISOString().split("T")[0];
        for (let i = 0; i < formData.schedules.length; i++) {
            const sched = formData.schedules[i];
            if (
                !sched.category ||
                !sched.date ||
                sched.selectedPosterIds.length === 0
            ) {
                toast.error(
                    `Please complete all fields and select posters in schedule ${i + 1}`,
                    { autoClose: 3000 }
                );
                return false;
            }
            if (sched.date < today) {
                toast.error(`Schedule date must be in the future (Row ${i + 1})`, {
                    autoClose: 3000,
                });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const data = {
            customerId: formData.customerId,
            customerPhoneNumber: formData.customerPhoneNumber,
            schedules: formData.schedules.flatMap((s) =>
                s.selectedPosterIds.map((posterId) => ({
                    posterId,
                    categories: [s.category],
                    dates: [s.date],
                    selectedPosterUrls: s.selectedPosterUrls,
                }))
            ),
        };

        try {
            await scheduleAPI.create(data);
            toast.success("Schedule created successfully!", { autoClose: 2000 });
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create schedule", {
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header Section */}
            <div
                className="rounded-4 shadow-lg p-4 mb-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: currentTheme.shadow
                }}
            >
                <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-8">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-calendar-alt" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Create Schedule
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Plan and schedule your poster campaigns
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <button
                            type="button"
                            onClick={addScheduleRow}
                            className="btn w-100 py-3 fw-semibold rounded-3 shadow-sm"
                            style={{
                                background: currentTheme.success,
                                border: 'none',
                                color: '#ffffff',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = currentTheme.shadow;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Add Schedule
                        </button>
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
            >
                <form onSubmit={handleSubmit} className="row g-4">
                    {/* Customer Selector */}
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
                                    className="rounded-3 p-3 me-3 shadow-sm"
                                    style={{ background: currentTheme.primary }}
                                >
                                    <i className="fas fa-user" style={{ color: '#ffffff', fontSize: '1.2rem' }}></i>
                                </div>
                                <div>
                                    <h3 className="fs-5 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                        Select Customer
                                    </h3>
                                    <p className="mb-0 small" style={{ color: currentTheme.textSecondary }}>
                                        Choose the customer for this schedule
                                    </p>
                                </div>
                            </div>
                            <select
                                className="form-select py-3 rounded-3"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.text,
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)'
                                }}
                                value={selectCustomer}
                                onChange={handleCustomerChange}
                                required
                            >
                                <option value="">-- Select Customer --</option>
                                {customers.map((c) => (
                                    <option key={c._id} value={JSON.stringify(c)}>
                                        {c.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12">
                        <div
                            className="rounded-4 shadow-sm p-4 text-center"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className={`btn px-5 py-3 fw-semibold rounded-3 shadow-sm ${loading ? 'disabled' : ''}`}
                                style={{
                                    background: loading ?
                                        currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' :
                                        currentTheme.primary,
                                    border: 'none',
                                    color: loading ? currentTheme.textSecondary : '#ffffff',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Creating Schedule...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        Create Schedule
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Schedule;
