import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-content">
          Coming <span className="gradient-text">Soon</span>
        </h1>
        <p className="text-xl text-content-secondary mb-10 max-w-2xl mx-auto">
          We're working hard to bring this feature to you. Stay tuned for updates!
        </p>
        <Link to="/">
          <button className="btn-neon text-base py-3 px-8 text-white font-bold rounded-xl">
            Return to Home
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default ComingSoonPage;
