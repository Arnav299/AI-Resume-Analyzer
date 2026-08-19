import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

/**
 * DashboardLayout — standard layout with Navbar + Sidebar + main content.
 * @param {React.ReactNode} children
 * @param {boolean} [showSidebar=true]
 * @param {boolean} [showFooter=false]
 * @param {string} [className] — additional class for main content area
 */
const DashboardLayout = ({
  children,
  showSidebar = true,
  showFooter = false,
  className = '',
}) => {
  return (
    <div className="flex min-h-screen bg-background">
      {showSidebar && (
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className={`flex-1 p-6 md:p-10 ${className}`}>
          {children}
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default DashboardLayout;
