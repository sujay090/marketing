import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../services/api.js";
import { toast } from "react-toastify";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerAPI.getCustomers();
        setCustomers(response.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to fetch customers",
          { position: "top-right", autoClose: 3000 }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
 const handleEdit = (id) => {
    navigate(`/customers/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const customer = customers.find((c) => c._id === id);
    const customerName = customer?.companyName || "this customer";

    if (
      !window.confirm(
        `Are you sure you want to delete "${customerName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      await customerAPI.delete(id);
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
      toast.success(`${customerName} deleted successfully!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete customer",
        { position: "top-right", autoClose: 3000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 min-h-screen flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3 text-gray-300">Fetching customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Customer Management
                </h1>
                <p className="text-gray-300">
                  Manage and organize your customer relationships
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:w-96">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-blue-400/30 bg-slate-800/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 placeholder-gray-400"
                  placeholder="Search customers..."
                />
              </div>
              <button
                onClick={() => navigate("/customers")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium transform hover:scale-105"
              >
                + Add Customer
              </button>
            </div>
          </div>
        </div>
        {/* Customer Data */}
        {customers.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl p-12 text-center">
            <div className="bg-blue-900/30 border border-blue-400/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="h-12 w-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No customers found
            </h3>
            <p className="text-gray-300 mb-6">
              Get started by adding your first customer to the system.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg font-medium">
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-800/80 via-blue-900/60 to-slate-700/80 border-b border-blue-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/20">
                  {customers
                    .filter(
                      (customer) =>
                        customer.companyName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.contactPerson
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((customer, index) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-slate-700/50 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-900/30 text-blue-400 rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl flex items-center justify-center mr-4">
                              <span className="text-blue-400 font-bold text-lg">
                                {customer.companyName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {customer.companyName}
                              </div>
                              <div className="text-sm text-gray-400">
                                Customer #{index + 1}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-white">
                            <svg
                              className="h-4 w-4 text-green-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {customer.whatsapp}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.website ? (
                            <a
                              href={customer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                              title={`Visit ${customer.companyName} website`}
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              Visit
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-gray-400">
                              No website
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.logoUrl ? (
                            <div className="flex items-center">
                              <img
                                src={customer.logoUrl}
                                alt={`${customer.companyName} logo`}
                                className="h-10 w-10 rounded-lg object-cover border border-blue-500/30"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/vite.svg";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(customer._id)}
                              className="group p-2 text-amber-500 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                              title={`Edit ${customer.companyName}`}
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="group p-2 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                              title={`Delete ${customer.companyName}`}
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
