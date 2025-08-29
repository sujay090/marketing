import React, { useEffect, useState } from "react";
import { scheduleAPI } from "../services/api";
import { toast } from "react-toastify";

// ✅ IST time formatter
const formatDateTimeIST = (utcDateStr) => {
  const date = new Date(utcDateStr);

  const dateStr = date.toLocaleDateString("en-IN", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-IN", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { dateStr, timeStr };
};

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [posterDetails, setPosterDetails] = useState({});

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let url = "/schedules?includePosters=true";
      const params = new URLSearchParams();

      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (searchName) params.append("name", searchName);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await scheduleAPI.getAllSchedules(url);
      
      console.log("Full API Response:", response); // Debug log
      console.log("Response data:", response.data); // Debug response data
      
      // Extract schedules data from axios response
      const schedulesData = Array.isArray(response.data) ? response.data : [];
      
      console.log("Schedules data extracted:", schedulesData); // Debug extracted data
      console.log("Poster details check:", schedulesData.map(s => ({
        id: s._id, 
        posterId: s.posterId, 
        poster: s.poster,
        customerName: s.customerId?.companyName
      }))); // Debug poster data
      
      // Sort schedules - upcoming schedules first, then past schedules (latest first)
      const sortedSchedules = schedulesData.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
        const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
        const now = new Date();
        
        // If both are in future, show nearest first
        if (dateA >= now && dateB >= now) {
          return dateA - dateB;
        }
        // If both are in past, show latest first  
        if (dateA < now && dateB < now) {
          return dateB - dateA;
        }
        // Future dates come before past dates
        return dateA >= now ? -1 : 1;
      });
      
      setSchedules(sortedSchedules);
      
      // Store poster details for quick access
      const posterMap = {};
      sortedSchedules.forEach(schedule => {
        // Check for poster in the enhanced response from backend
        if (schedule.poster) {
          posterMap[schedule._id] = schedule.poster;
        }
      });
      setPosterDetails(posterMap);
      
      console.log("Final schedules with poster info:", sortedSchedules); // Debug final schedules
      console.log("Final poster map:", posterMap); // Debug final poster mapping

    } catch (error) {
      console.error("Error fetching schedules:", error);
      console.error("Error details:", error.response?.data); // Log error response details
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getStatus = (date, scheduleStatus) => {
    // If we have actual schedule status from API, use that
    if (scheduleStatus) {
      return scheduleStatus;
    }
    
    // Otherwise, calculate based on date
    const scheduleDate = new Date(date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    if (scheduleDate === today) return "Live";
    return scheduleDate > today ? "Upcoming" : "Expired";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Live":
      case "Sent":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Upcoming":
      case "Pending":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Expired":
      case "Failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule({
      ...schedule,
      date: new Date(schedule.date).toISOString().split('T')[0],
      time: schedule.time
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedSchedule = {
        ...editingSchedule,
        date: new Date(editingSchedule.date + 'T' + editingSchedule.time),
      };

      await scheduleAPI.updateSchedule(editingSchedule._id, updatedSchedule);
      setIsEditModalOpen(false);
      setEditingSchedule(null);
      fetchSchedules();
      alert("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Error updating schedule");
    }
  };

  const downloadPoster = async (posterImageUrl, posterName = 'poster') => {
    try {
      // If the posterImageUrl is a full URL (starts with http), use it directly
      // Otherwise, construct the full URL
      const fullUrl = posterImageUrl.startsWith('http') 
        ? posterImageUrl 
        : `${window.location.origin}${posterImageUrl}`;
      
      console.log('Downloading poster from:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${posterName || 'poster'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Poster downloaded successfully!');
    } catch (error) {
      console.error('Error downloading poster:', error);
      toast.error(`Error downloading poster: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      await scheduleAPI.deleteSchedule(id);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setFromDate("");
    setToDate("");
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
    const matchesName = schedule.customerId?.companyName
      ?.toLowerCase()
      .includes(searchName.toLowerCase());
    const withinRange =
      (!fromDate || scheduleDate >= fromDate) &&
      (!toDate || scheduleDate <= toDate);
    return matchesName && withinRange;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            📅 Schedule Management
          </h1>
          <p className="text-gray-300">
            Manage and monitor your poster schedules
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Filter Schedules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search customer..."
                className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading schedules...</p>
            </div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Schedules Found
              </h3>
              <p className="text-gray-300">
                Try adjusting your search filters or create a new schedule.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left font-semibold">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Poster
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Time</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => {
                    const { dateStr, timeStr } = formatDateTimeIST(
                      schedule.date
                    );
                    const status = getStatus(schedule.date, schedule.status);
                    return (
                      <tr
                        key={schedule._id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {schedule.customerId?.companyName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {schedule.poster ? (
                            <div className="flex items-center space-x-2">
                              <img
                                src={schedule.poster.imageUrl}
                                alt="Poster"
                                className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => downloadPoster(schedule.poster.imageUrl, schedule.customerId?.companyName)}
                              />
                              <button
                                onClick={() => downloadPoster(schedule.poster.imageUrl, schedule.customerId?.companyName)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                title="Download poster"
                              >
                                📥
                              </button>
                            </div>
                          ) : schedule.posterId ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">🖼️</span>
                              </div>
                              <span className="text-yellow-400 text-sm">Poster ID: {schedule.posterId}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center border border-red-500/30">
                                <span className="text-red-400 text-lg">❌</span>
                              </div>
                              <span className="text-red-400 text-sm font-medium">No poster assigned</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                            {schedule.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {schedule.date}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {schedule.time}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 text-sm"
                              title="Edit schedule"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(schedule._id)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 text-sm"
                              title="Delete schedule"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredSchedules.map((schedule) => {
                const { dateStr, timeStr } = formatDateTimeIST(schedule.date);
                const status = getStatus(schedule.date, schedule.status);
                return (
                  <div
                    key={schedule._id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2">
                          {schedule.customerId?.companyName || "N/A"}
                        </h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {schedule.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {schedule.poster ? (
                          <img
                            src={schedule.poster.imageUrl}
                            alt="Poster"
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => downloadPoster(schedule.poster.imageUrl, schedule.customerId?.companyName)}
                          />
                        ) : schedule.posterId ? (
                          <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xl">🖼️</span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-red-900/30 rounded-lg flex items-center justify-center border border-red-500/30">
                            <span className="text-red-400 text-xl">❌</span>
                          </div>
                        )}
                        <div className="flex flex-col items-center space-y-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                          {!schedule.poster && !schedule.posterId && (
                            <span className="text-red-400 text-xs">No poster</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <p className="text-white font-medium">
                          {schedule.date}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Time:</span>
                        <p className="text-white font-medium">
                          {schedule.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Edit Schedule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer
                  </label>
                  <input
                    type="text"
                    value={editingSchedule?.customerId?.companyName || ''}
                    disabled
                    className="w-full p-3 rounded-xl bg-gray-600 text-gray-300 border border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingSchedule?.date || ''}
                    onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editingSchedule?.time || ''}
                    onChange={(e) => setEditingSchedule({...editingSchedule, time: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingSchedule?.customerId?.phoneNumber || ''}
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule, 
                      customerId: {...editingSchedule.customerId, phoneNumber: e.target.value}
                    })}
                    className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
