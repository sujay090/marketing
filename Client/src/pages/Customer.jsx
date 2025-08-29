import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';

const Customer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    logo: null,
    website: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const validateForm = () => {
    const { companyName, whatsapp } = formData;
    if (!companyName || !whatsapp) {
      toast.error('Company name and WhatsApp number are required.');
      return false;
    }
    const whatsappRegex = /^[0-9]{10}$/;
    if (!whatsappRegex.test(whatsapp)) {
      toast.error('Please enter a valid 10-digit WhatsApp number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await customerAPI.add(data);
      toast.success('Customer added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-10">
      <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 w-full max-w-xl p-6 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">➕ Add New Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g. Amazon"
              className="w-full border border-blue-400/30 bg-slate-800/50 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Logo */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
              Company Logo
            </label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30 border border-blue-400/30 rounded-md bg-slate-800/50 transition-all duration-200"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full border border-blue-400/30 bg-slate-800/50 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">
              WhatsApp Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="10-digit WhatsApp number"
              className="w-full border border-blue-400/30 bg-slate-800/50 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-md transition-all duration-200 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Adding Customer...' : 'Add Customer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Customer;
