import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, resetToSystemTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      alert(`Logging in with Email: ${formData.email}`);
      navigate('/dashboard');
      setFormData({ email: '', password: '' });
    } else {
      alert('Please fill out all fields');
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-header bg-primary text-white text-center py-4 position-relative">
                <div className="theme-toggle position-absolute end-0 top-50 translate-middle-y">
                  <button
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="btn btn-link text-white theme-toggle-btn"
                    title="Toggle Theme"
                  >
                    <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'} theme-icon`}></i>
                  </button>
                  {showThemeMenu && (
                    <div className="theme-menu">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setShowThemeMenu(false);
                        }}
                        className="theme-menu-item"
                      >
                        <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => {
                          resetToSystemTheme();
                          setShowThemeMenu(false);
                        }}
                        className="theme-menu-item"
                      >
                        <i className="bi bi-display"></i>
                        System Theme
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="mb-0 fw-light">
                  <i className="bi bi-shield-lock me-2"></i>
                  Super Admin Login
                </h3>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                    <label htmlFor="email">Email address</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3">
                <div className="small">
                  <a href="#" className="text-decoration-none">Forgot Password?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;