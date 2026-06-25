import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const INITIAL = { title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '', tags: '' };

const TaskForm = ({ onSubmit, initialData, loading }) => {
  const [form, setForm] = useState(INITIAL);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        assignedTo: initialData.assignedTo?._id || '',
        dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    userAPI.getAll({ limit: 100 })
      .then(({ data }) => setUsers(data.data.users))
      .catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      assignedTo: form.assignedTo || null,
      dueDate: form.dueDate || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input name="title" className="form-input" placeholder="Task title" value={form.title} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-textarea" placeholder="Describe the task..." value={form.description} onChange={handleChange} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-select" value={form.status} onChange={handleChange}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select name="assignedTo" className="form-select" value={form.assignedTo} onChange={handleChange}>
            <option value="">— Unassigned —</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input name="dueDate" type="date" className="form-input" value={form.dueDate} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
        <input name="tags" className="form-input" placeholder="frontend, bug, urgent" value={form.tags} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;