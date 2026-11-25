import React from 'react';

const AdminUsersPage = () => (
  <div>
    <h1 className="font-serif text-4xl font-bold mb-8">Users Management</h1>

    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead className="bg-light border-b">
          <tr>
            <th className="px-6 py-3 text-left">User Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Phone</th>
            <th className="px-6 py-3 text-left">Total Orders</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-light">
            <td className="px-6 py-3">John Doe</td>
            <td className="px-6 py-3">john@example.com</td>
            <td className="px-6 py-3">+91 9999999999</td>
            <td className="px-6 py-3">5</td>
            <td className="px-6 py-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
            </td>
            <td className="px-6 py-3">
              <button className="text-secondary hover:text-accent mr-2">Edit</button>
              <button className="text-error">Block</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminUsersPage;
