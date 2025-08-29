import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { scheduleAPI, customerAPI, posterAPI } from "../services/api";
import { toast } from "react-toastify";
import PosterViewer from "../components/PosterViewer";

const Schedule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: "",
    schedules: [
      {
        category: "",
        posters: [],
        selectedPosterIds: [],
        date:"",
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
  // const baseUrl = "https://poster-generetorapp-backend.onrender.com/";
  const baseUrl="https://marketing.gs3solution.us/api"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Create Schedule</h1>
                <p className="text-gray-300 mt-1">Plan and schedule your poster campaigns</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addScheduleRow}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl px-6 py-3 font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Schedule</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Selector */}
          <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Select Customer</h3>
                <p className="text-gray-300 text-sm">Choose the customer for this schedule</p>
              </div>
            </div>
            <div className="relative">
              <select
                className="w-full border border-purple-400/30 bg-slate-800/50 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 appearance-none font-medium transition-all duration-200"
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
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Schedule Rows */}
          {formData.schedules.map((sched, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8 hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl p-3 text-white">
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Schedule {index + 1}</h4>
                    <p className="text-gray-300 text-sm">Configure your poster campaign details</p>
                  </div>
                </div>
                {formData.schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleRow(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-3 rounded-xl transition-all duration-200 transform hover:scale-105 border border-red-500/30 hover:border-red-400/50"
                    title="Remove this schedule"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full border border-purple-400/30 bg-slate-800/50 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 appearance-none transition-all duration-200"
                      value={sched.category}
                      onChange={(e) =>
                        handleScheduleChange(index, "category", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'Offers' && '🎯'} {cat === 'Events' && '🎪'} {cat === 'Festivals' && '🎉'} {cat}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                    </svg>
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-purple-400/30 bg-slate-800/50 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200"
                    value={sched.date}
                    onChange={(e) =>
                      handleScheduleChange(index, "date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <button
                  type="button"
                  onClick={() => generatePosters(index)}
                  disabled={!formData.customerId || !sched.category}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-8 py-4 font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Generate Posters</span>
                </button>
              </div>

              {/* Poster Grid */}
              {sched.posters.length > 0 && (
                <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/30 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">Generated Posters</h5>
                        <p className="text-sm text-gray-300">Select posters for this schedule</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-purple-400/30">
                      <span className="text-sm font-medium text-gray-200">
                        {sched.selectedPosterIds.length} of {sched.posters.length} selected
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sched.posters.map((poster) => {
                      let imageUrl = poster.imageUrl.replace(/\\/g, "/");
                      if (!/^https?:\/\//.test(imageUrl)) {
                        imageUrl = baseUrl + imageUrl;
                      }
                      const isSelected = sched.selectedPosterIds.includes(
                        poster._id
                      );

                      return (
                        <div
                          key={poster._id}
                          className={`relative bg-gradient-to-br from-slate-800/60 to-purple-900/40 border-2 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 transform hover:scale-105 backdrop-blur-sm ${
                            isSelected 
                              ? "border-green-400 ring-4 ring-green-400/30 shadow-green-400/20" 
                              : "border-purple-400/30 hover:border-purple-400/60 hover:shadow-purple-500/20 hover:shadow-xl"
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-3 left-3 z-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePosterSelect(index, poster._id)}
                              className="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                          </div>
                          
                          {/* Selection Badge */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-green-500 text-white rounded-full p-1">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                          
                          {/* Poster Content */}
                          <div className="p-4">
                            <PosterViewer
                              poster={poster}
                              customer={customers.find(
                                (c) => c._id === formData.customerId
                              )}
                            />
                          </div>
                          
                          {/* Download Button */}
                          <div className="absolute bottom-3 right-3">
                            <button
                              type="button"
                              onClick={() => downloadPoster(poster.imageUrl)}
                              className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                              title="Download poster"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Submit Section */}
          <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h4 className="text-xl font-semibold text-white mb-2">Ready to Schedule?</h4>
                <p className="text-gray-300">
                  {formData.schedules.reduce((total, s) => total + s.selectedPosterIds.length, 0)} poster(s) selected across {formData.schedules.length} schedule(s)
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-purple-400/30 text-gray-300 rounded-xl hover:bg-purple-900/20 transition-all duration-200 font-medium hover:border-purple-400/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.customerId || formData.schedules.every(s => s.selectedPosterIds.length === 0)}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center space-x-3 ${
                    loading || !formData.customerId || formData.schedules.every(s => s.selectedPosterIds.length === 0)
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Schedule...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                      </svg>
                      <span>Create Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Schedule;
