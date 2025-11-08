import React from 'react';

export default function Header() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">💰 Expense Tracker</h1>
      <p className="text-sm text-gray-600">Manage your college expenses</p>
    </div>
  );
}