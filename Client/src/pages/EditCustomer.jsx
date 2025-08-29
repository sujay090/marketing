import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    whatsapp: '',
    website: '',
    logo: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentLogo, setCurrentLogo] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // Try to fetch individual customer first, fallback to getting all customers
        let customer;
        try {
          const response = await customerAPI.getCustomer(id);
          customer = response.data;
        } catch (error) {
          // If individual fetch fails, get all customers and find the one we need
          const response = await customerAPI.getCustomers();
          customer = response.data.find(c => c._id === id);
        }
        
        if (customer) {
          setFormData({
            companyName: customer.companyName || '',
            contactPerson: customer.contactPerson || '',
            email: customer.email || '',
            whatsapp: customer.whatsapp || '',
            website: customer.website || '',
            logo: null,
          });
          setCurrentLogo(customer.logoUrl || '');
        } else {
          toast.error('Customer not found');
          navigate('/customers-list');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to fetch customer details');
        navigate('/customers-list');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, navigate]);

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
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });

      await customerAPI.update(id, data);
      toast.success('Customer updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
      navigate('/customers-list');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to update customer',
        { position: 'top-right', autoClose: 3000 }
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading customer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Edit Customer</h1>
                <p className="text-gray-300">Update customer information</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customers-list')}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              ← Back to Customers
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-200 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-200 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  placeholder="Enter contact person name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  placeholder="Enter email address"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-200 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  placeholder="Enter 10-digit WhatsApp number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-200 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                  placeholder="https://example.com"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label htmlFor="logo" className="block text-sm font-semibold text-gray-200 mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-400/30 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                />
                {currentLogo && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-300 mb-2">Current logo:</p>
                    <img
                      src={currentLogo}
                      alt="Current logo"
                      className="h-16 w-16 object-cover rounded-lg border border-blue-400/30"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-blue-400/30">
              <button
                type="button"
                onClick={() => navigate('/customers-list')}
                className="px-6 py-3 border border-blue-400/30 text-gray-300 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Customer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
