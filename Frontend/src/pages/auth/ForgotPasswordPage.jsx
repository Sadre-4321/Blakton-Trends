import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => (
  <div className="min-h-screen bg-light flex items-center justify-center py-12 px-4">
    <div className="max-w-md w-full card p-8">
      <h1 className="font-serif text-3xl font-bold mb-2">Forgot Password</h1>
      <p className="text-gray-600 mb-6">Enter your email to reset your password</p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input type="email" className="input-field" placeholder="you@example.com" required />
        </div>

        <button type="submit" className="btn-primary w-full">
          Send Reset Link
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        <Link to="/auth/login" className="text-secondary font-bold hover:text-accent">
          Back to Login
        </Link>
      </p>
    </div>
  </div>
);

export default ForgotPasswordPage;
