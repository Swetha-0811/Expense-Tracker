import React, { useState } from 'react';

export default function AddSharedExpenseModal({ roommates, onClose, onAdd }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');

  const handleAdd = () => {
    onAdd(description, amount, paidBy);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add Shared Expense</h3>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (e.g., Dinner, Groceries)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
        />
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
        >
          {roommates.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
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