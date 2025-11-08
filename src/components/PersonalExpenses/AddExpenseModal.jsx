import React, { useState } from 'react';

export default function AddExpenseModal({ category, onClose, onAdd }) {
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    onAdd(amount);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add to {category?.name}</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}