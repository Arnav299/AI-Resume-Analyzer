import React from 'react';
import classNames from 'classnames';

const StatusBadge = ({ status, className }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'pending';
  
  let bgClass = "bg-surface-hover text-content-secondary";
  
  if (normalizedStatus === 'shortlisted') bgClass = "bg-green-100 text-green-700";
  else if (normalizedStatus === 'rejected') bgClass = "bg-red-100 text-red-700";
  else if (normalizedStatus === 'processing') bgClass = "bg-blue-100 text-blue-700";
  else if (normalizedStatus === 'interview') bgClass = "bg-purple-100 text-purple-700";
  else if (normalizedStatus === 'active') bgClass = "bg-blue-100 text-blue-700";
  else if (normalizedStatus === 'archived') bgClass = "bg-surface-hover text-content-secondary";
  else if (normalizedStatus === 'draft') bgClass = "bg-orange-100 text-orange-700";

  return (
    <span className={classNames("px-2.5 py-1 text-xs font-semibold rounded-full", bgClass, className)}>
      {status || "Pending"}
    </span>
  );
};

export default StatusBadge;
