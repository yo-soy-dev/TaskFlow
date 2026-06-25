import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    footer={
      <>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </>
    }
  >
    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message || 'Are you sure? This action cannot be undone.'}</p>
  </Modal>
);

export default ConfirmDialog;