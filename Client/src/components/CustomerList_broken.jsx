import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../services/api.js";
import { toast } from "react-toastify";
import { useTheme } from '../context/ThemeContext';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { getCurrentTheme } = useTheme();
  const currentTheme = getCurrentTheme();

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
      <div 
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: currentTheme.background }}
      >
        <div 
          className="text-center p-5 rounded-4 shadow-lg"
          style={{
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div 
            className="spinner-border mb-3"
            role="status" 
            style={{ 
              width: '3rem', 
              height: '3rem',
              color: currentTheme.primary
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0" style={{ color: currentTheme.text }}>
            Fetching customers...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="col-12 col-lg-6">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-3 p-3 shadow-sm"
                style={{ background: currentTheme.primary }}
              >
                <i className="fas fa-users h-8 w-8" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
              </div>
              <div>
                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                  Customer Management
                </h1>
                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                  Manage and organize your customer relationships
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-6">
            <div className="row g-2">
              <div className="col-12 col-sm-8">
                <div className="position-relative">
                  <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                    <i className="fas fa-search" style={{ color: currentTheme.textSecondary }}></i>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control ps-5 py-3 rounded-3"
                    style={{
                      background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    placeholder="Search customers..."
                  />
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <button
                  onClick={() => navigate("/customers")}
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
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      
      {/* Customer Data Section */}
      {customers.length === 0 ? (
        <div 
          className="rounded-4 shadow-lg p-5 text-center"
          style={{
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: currentTheme.shadow
          }}
        >
          <div 
            className="rounded-circle p-4 mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{ 
              background: currentTheme.primary + '20',
              border: `2px solid ${currentTheme.primary}30`,
              width: '120px', 
              height: '120px' 
            }}
          >
            <i className="fas fa-users" style={{ fontSize: '3rem', color: currentTheme.primary }}></i>
          </div>
          <h3 className="fs-4 fw-bold mb-3" style={{ color: currentTheme.text }}>
            No customers found
          </h3>
          <p className="mb-4" style={{ color: currentTheme.textSecondary }}>
            Get started by adding your first customer to the system.
          </p>
          <button 
            onClick={() => navigate("/customers")}
            className="btn px-4 py-2 fw-semibold rounded-3 shadow-sm"
            style={{
              background: currentTheme.primary,
              border: 'none',
              color: '#ffffff',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Add First Customer
          </button>
        </div>
      ) : (
        <div 
          className="rounded-4 shadow-lg overflow-hidden"
          style={{
            background: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: currentTheme.shadow
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead 
                className="border-bottom"
                style={{ 
                  background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: currentTheme.border 
                }}
              >
                <tr>
                  <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>#</th>
                  <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Company</th>
                  <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Contact</th>
                  <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Website</th>
                  <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Logo</th>
                  <th className="px-4 py-4 fw-semibold text-end" style={{ color: currentTheme.text }}>Actions</th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-bottom"
                      style={{ 
                        borderColor: currentTheme.border,
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-4 py-4">
                        <div 
                          className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                          style={{
                            width: '40px',
                            height: '40px',
                            background: currentTheme.primary + '20',
                            color: currentTheme.primary,
                            fontSize: '0.9rem'
                          }}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-3 d-flex align-items-center justify-content-center me-3 fw-bold"
                            style={{
                              width: '50px',
                              height: '50px',
                              background: currentTheme.success + '20',
                              color: currentTheme.success,
                              fontSize: '1.2rem'
                            }}
                          >
                            {customer.companyName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ color: currentTheme.text }}>
                              {customer.companyName}
                            </div>
                            <small style={{ color: currentTheme.textSecondary }}>
                              Customer #{index + 1}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="d-flex align-items-center">
                          <i 
                            className="fas fa-phone me-2" 
                            style={{ color: currentTheme.success }}
                          ></i>
                          <span style={{ color: currentTheme.text }}>{customer.whatsapp}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {customer.website ? (
                          <a
                            href={customer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm rounded-3 d-flex align-items-center"
                            style={{
                              background: currentTheme.primary + '20',
                              border: `1px solid ${currentTheme.primary}40`,
                              color: currentTheme.primary,
                              textDecoration: 'none'
                            }}
                            title={`Visit ${customer.companyName} website`}
                          >
                            <i className="fas fa-external-link-alt me-1" style={{ fontSize: '0.8rem' }}></i>
                            Visit
                          </a>
                        ) : (
                          <span 
                            className="badge rounded-3"
                            style={{
                              background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              color: currentTheme.textSecondary
                            }}
                          >
                            No website
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {customer.logoUrl ? (
                          <img
                            src={customer.logoUrl}
                            alt={`${customer.companyName} logo`}
                            className="rounded-3 shadow-sm"
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              border: `2px solid ${currentTheme.border}`
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/vite.svg";
                            }}
                          />
                        ) : (
                          <div 
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '50px',
                              height: '50px',
                              background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              border: `2px solid ${currentTheme.border}`
                            }}
                          >
                            <i className="fas fa-image" style={{ color: currentTheme.textSecondary }}></i>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleEdit(customer._id)}
                            className="btn btn-sm rounded-3 shadow-sm"
                            style={{
                              background: currentTheme.warning + '20',
                              border: `1px solid ${currentTheme.warning}40`,
                              color: currentTheme.warning,
                              transition: 'all 0.3s ease'
                            }}
                            title={`Edit ${customer.companyName}`}
                            onMouseEnter={(e) => {
                              e.target.style.background = currentTheme.warning + '30';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = currentTheme.warning + '20';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="btn btn-sm rounded-3 shadow-sm"
                            style={{
                              background: currentTheme.danger + '20',
                              border: `1px solid ${currentTheme.danger}40`,
                              color: currentTheme.danger,
                              transition: 'all 0.3s ease'
                            }}
                            title={`Delete ${customer.companyName}`}
                            onMouseEnter={(e) => {
                              e.target.style.background = currentTheme.danger + '30';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = currentTheme.danger + '20';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            <i className="fas fa-trash"></i>
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
  );
};

export default CustomerList;
