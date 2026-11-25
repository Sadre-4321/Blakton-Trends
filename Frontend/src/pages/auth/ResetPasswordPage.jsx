import React from 'react';

const ResetPasswordPage = () => (
  <div className="min-h-screen bg-light flex items-center justify-center py-12 px-4">
    <div className="max-w-md w-full card p-8">
      <h1 className="font-serif text-3xl font-bold mb-2">Reset Password</h1>
      <p className="text-gray-600 mb-6">Enter your new password</p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">New Password</label>
          <input type="password" className="input-field" placeholder="••••••••" required />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Confirm Password</label>
          <input type="password" className="input-field" placeholder="••••••••" required />
        </div>

        <button type="submit" className="btn-primary w-full">
          Reset Password
        </button>
      </form>
    </div>
  </div>
);

export default ResetPasswordPage;
