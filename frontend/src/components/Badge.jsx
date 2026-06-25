import React from 'react';

const Badge = ({ value, type }) => {
  const cls = type ? `badge badge-${value?.replace(' ', '-')}` : `badge badge-${value?.replace(' ', '-')}`;
  const label = value?.replace('-', ' ') || '';
  return <span className={cls}>{label}</span>;
};

export const StatusBadge = ({ status }) => <Badge value={status} />;
export const PriorityBadge = ({ priority }) => <Badge value={priority} />;
export const RoleBadge = ({ role }) => <Badge value={role} />;
export const ActiveBadge = ({ isActive }) => (
  <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

export default Badge;