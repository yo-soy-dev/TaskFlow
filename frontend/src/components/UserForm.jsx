import React, { useState, useEffect } from 'react';

const INITIAL = { name: '', email: '', password: '', role: 'employee', department: '', isActive: true };

const UserForm = ({ onSubmit, initialData, loading, isEdit }) => {
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'employee',
        department: initialData.department || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input name="email" type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{isEdit ? 'New Password' : 'Password *'}</label>
          <input
            name="password" type="password" className="form-input"
            placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 6 characters'}
            value={form.password} onChange={handleChange}
            required={!isEdit}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Role *</label>
          <select name="role" className="form-select" value={form.role} onChange={handleChange}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Department</label>
          <input name="department" className="form-input" placeholder="e.g. Engineering" value={form.department} onChange={handleChange} />
        </div>
        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
              <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
              <label htmlFor="isActive" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>Account is Active</label>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;