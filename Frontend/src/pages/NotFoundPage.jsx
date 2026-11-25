import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-light flex items-center justify-center">
    <div className="text-center">
      <div className="font-serif text-9xl font-bold text-secondary mb-4">404</div>
      <h1 className="font-serif text-4xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-8">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-block">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
