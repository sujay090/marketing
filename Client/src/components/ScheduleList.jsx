import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDateTimeIST } from '../utils/timezone';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getAll();
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
      console.error('Schedule fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(schedules)

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    if (sortConfig.key === 'customer') {
      return sortConfig.direction === 'asc'
        ? a.customer.companyName.localeCompare(b.customer.companyName)
        : b.customer.companyName.localeCompare(a.customer.companyName);
    }
    if (sortConfig.key === 'category') {
      return sortConfig.direction === 'asc'
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const formData = new FormData(e.target);
      const updatedData = {
        date: formData.get('date'),
        category: formData.get('category'),
        status: formData.get('status')
      };

      await scheduleAPI.update(editingSchedule._id, updatedData);
      toast.success('Schedule updated successfully');
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to update schedule');
      console.error('Schedule update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setUpdating(true);
      await scheduleAPI.updateStatus(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
      toast.success(`Schedule ${currentStatus === 'Active' ? 'deactivated' : 'activated'} successfully`);
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to update schedule status');
      console.error('Schedule status update error:', error);
    } finally {
      setUpdating(false);
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
    <div className="card">
      <div className="card-body">
        <h2 className="card-title mb-4">
          <i className="bi bi-calendar-check me-2"></i>
          Scheduled Posters
        </h2>
        {schedules.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortConfig.key === 'date' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('customer')}
                    >
                      Customer
                      {sortConfig.key === 'customer' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('category')}
                    >
                      Category
                      {sortConfig.key === 'category' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Posters</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((schedule) => (
                    <tr key={schedule._id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{schedule.dateUTC}</div>
                          <small className="text-muted">{schedule.timeUTC}</small>
                        </div>
                      </td>
                      <td>{schedule.customer.companyName}</td>
                      <td>{schedule.category}</td>
                      <td>{schedule.posters.length}</td>
                      <td>
                        <span className={`badge bg-${schedule.status === 'Active' ? 'success' : 'secondary'}`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="btn btn-sm btn-outline-primary"
                            disabled={updating}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(schedule._id, schedule.status)}
                            className={`btn btn-sm btn-outline-${schedule.status === 'Active' ? 'danger' : 'success'}`}
                            disabled={updating}
                          >
                            <i className={`bi bi-${schedule.status === 'Active' ? 'pause' : 'play'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x display-1 text-muted"></i>
            <p className="mt-3 text-muted">No schedules found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSchedule && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Schedule</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingSchedule(null)}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editDate" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="editDate"
                      name="date"
                      defaultValue={editingSchedule.date}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCategory" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="editCategory"
                      name="category"
                      defaultValue={editingSchedule.category}
                      required
                    >
                      <option value="offers">Offers</option>
                      <option value="events">Events</option>
                      <option value="festivals">Festivals</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editStatus" className="form-label">Status</label>
                    <select
                      className="form-select"
                      id="editStatus"
                      name="status"
                      defaultValue={editingSchedule.status}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingSchedule(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;