/* eslint-disable */
import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext(null);

const STORAGE_KEY = 'rocas_current_resume';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { resumeId: null, resumeName: null };
  } catch {
    return { resumeId: null, resumeName: null };
  }
};

export const ResumeProvider = ({ children }) => {
  const [current, setCurrent] = useState(load);

  const setCurrentResume = (id, name) => {
    const next = { resumeId: id, resumeName: name };
    setCurrent(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearCurrentResume = () => {
    setCurrent({ resumeId: null, resumeName: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ResumeContext.Provider value={{ ...current, setCurrentResume, clearCurrentResume }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used inside ResumeProvider');
  return ctx;
};
