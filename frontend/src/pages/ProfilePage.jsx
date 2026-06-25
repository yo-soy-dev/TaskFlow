import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badge';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', department: user?.department || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateMe(profileForm);
      updateUser(data.data.user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match.');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters.');
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setChangingPw(false); }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Profile</h1>
        <p className="text-muted text-sm mt-2">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div className="avatar avatar-xl" style={{ background: user?.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>{user?.email}</div>
            <RoleBadge role={user?.role} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24, padding: 16, background: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
          <div>
            <div className="form-label">Department</div>
            <div style={{ fontSize: 14 }}>{user?.department || '—'}</div>
          </div>
          <div>
            <div className="form-label">Member Since</div>
            <div style={{ fontSize: 14 }}>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}</div>
          </div>
          <div>
            <div className="form-label">Account Status</div>
            <div style={{ fontSize: 14, color: 'var(--success)' }}>● Active</div>
          </div>
          <div>
            <div className="form-label">Role</div>
            <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Edit Profile</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={profileForm.department} onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering" />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <span className="text-xs text-muted mt-2">Email cannot be changed from profile</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="••••••••" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Repeat new password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={changingPw}>{changingPw ? 'Changing...' : 'Change Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;