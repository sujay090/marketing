import { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { scheduleAPI, customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { posters } from '../constants';

const ScheduleForm = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [customer, setCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const fp = flatpickr(datePickerRef.current, {
      mode: 'multiple',
      dateFormat: 'Y-m-d',
      minDate: 'today',
      onChange: (dates) => {
        setSelectedDates(dates);
      },
      onOpen: () => {
        document.querySelector('.flatpickr-calendar').classList.add('shadow-lg');
      },
      onClose: () => {
        document.querySelector('.flatpickr-calendar')?.classList.remove('shadow-lg');
      }
    });

    return () => fp.destroy();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Customer fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    setCustomer(e.target.value);
  };

  const loadPosters = (dateId, category) => {
    const posterContainer = document.getElementById(`poster_${dateId}`);
    if (!category) {
      posterContainer.classList.add('d-none');
      return;
    }

    const categoryPosters = posters[category];
    if (categoryPosters) {
      const gridContainer = posterContainer.querySelector('.poster-grid');
      gridContainer.innerHTML = '';

      categoryPosters.forEach((poster) => {
        const posterHTML = `
          <div class="col-md-4 col-lg-3 mb-3">
            <div class="card h-100 poster-card">
              <div class="card-body p-2">
                <div class="form-check">
                  <input type="checkbox" 
                         class="form-check-input" 
                         name="selected_posters[${dateId}][${poster}]" 
                         value="${poster}" 
                         id="poster_${dateId}_${poster}">
                  <label class="form-check-label w-100" for="poster_${dateId}_${poster}">
                    <img src="/images/${poster}" 
                         alt="${poster}" 
                         class="img-fluid rounded mb-2 poster-thumbnail">
                    <span class="d-block text-center small text-truncate">${poster}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        `;
        gridContainer.innerHTML += posterHTML;
      });
      posterContainer.classList.remove('d-none');
    }
  };

  const handleSchedule = async () => {
    if (!customer) {
      toast.error('Please select a customer');
      return;
    }

    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    const selectedPosters = [];
    selectedDates.forEach((date) => {
      const dateId = date.toISOString().split('T')[0];
      const category = document.querySelector(`#category_${dateId}`)?.value;
      const postersForDate = Array.from(
        document.querySelectorAll(`#poster_${dateId} input:checked`)
      ).map((p) => p.value);

      if (category && postersForDate.length > 0) {
        selectedPosters.push({
          date: dateId,
          category,
          posters: postersForDate,
        });
      }
    });

    if (selectedPosters.length === 0) {
      toast.error('Please select at least one poster for each date');
      return;
    }

    try {
      setSubmitting(true);
      const scheduleData = {
        customerId: customer,
        schedules: selectedPosters
      };

      await scheduleAPI.create(scheduleData);
      toast.success('Schedule created successfully');
      
      // Reset form
      setCustomer('');
      setSelectedDates([]);
      const fp = datePickerRef.current._flatpickr;
      fp.clear();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
      console.error('Schedule creation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-4">
          <i className="bi bi-calendar-plus me-2"></i>
          Schedule Posters
        </h2>
        <div className="mb-4">
          <label htmlFor="customer" className="form-label fw-bold">
            Select Customer
          </label>
          <select
            id="customer"
            name="customer"
            value={customer}
            onChange={handleCustomerChange}
            className="form-select form-select-lg"
            required
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="schedule_date" className="form-label fw-bold">
            Select Dates
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-calendar3"></i>
            </span>
            <input
              type="text"
              id="schedule_date"
              name="schedule_date"
              ref={datePickerRef}
              className="form-control form-control-lg"
              placeholder="Select dates..."
            />
          </div>
          <small className="text-muted d-block mt-2">
            <i className="bi bi-info-circle me-1"></i>
            Click on the calendar to select multiple dates
          </small>
        </div>
        <div id="dateCategories" className={`mb-4 ${selectedDates.length > 0 ? '' : 'd-none'}`}>
          <h3 className="h4 mb-3">
            <i className="bi bi-images me-2"></i>
            Select Posters for Each Date
          </h3>
          <div id="categoriesContainer">
            {selectedDates.map((date) => {
              const dateId = date.toISOString().split('T')[0];
              const categoryId = `category_${dateId}`;
              const posterId = `poster_${dateId}`;

              return (
                <div key={dateId} className="card mb-4 border-0 bg-light">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-calendar-date fs-4 me-2 text-primary"></i>
                      <h4 className="h5 mb-0">{new Date(dateId).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</h4>
                    </div>
                    <div className="mb-3">
                      <label htmlFor={categoryId} className="form-label fw-bold">
                        Select Category
                      </label>
                      <select
                        id={categoryId}
                        name={`categories[${dateId}]`}
                        className="form-select"
                        onChange={(e) => loadPosters(dateId, e.target.value)}
                        required
                      >
                        <option value="">-- Choose Category --</option>
                        <option value="offers">Offers</option>
                        <option value="events">Events</option>
                        <option value="festivals">Festivals</option>
                      </select>
                    </div>
                    <div id={posterId} className="mt-4 d-none">
                      <h5 className="h6 mb-3">
                        <i className="bi bi-grid me-2"></i>
                        Select Posters
                      </h5>
                      <div className="row g-3 poster-grid"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleSchedule}
            className="btn btn-primary btn-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Schedule...
              </>
            ) : (
              <>
                <i className="bi bi-calendar-plus me-2"></i>
                Create Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;