import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-surface text-content-muted py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">

          <p className="text-sm text-content-muted leading-relaxed">
            AI-powered resume analysis and career recommendation portal for students and professionals.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            <li><Link to="/upload" className="hover:text-primary transition-colors">Upload Resume</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-primary transition-colors cursor-pointer">Resume Parsing</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Skills Analysis</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Career Recommendations</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Learning Paths</span></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-primary transition-colors cursor-pointer">About Us</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Contact</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Terms & Conditions</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-content-muted">© 2026 AI Resume Analyzer. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-content-muted">Built with ❤️ for students</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
