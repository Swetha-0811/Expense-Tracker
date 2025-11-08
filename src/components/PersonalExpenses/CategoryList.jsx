import React from 'react';

export default function CategoryList({ categories, onAddExpense }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Categories</h2>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                <span className="font-semibold text-gray-800">{cat.name}</span>
              </div>
              <span className="font-bold text-gray-800">₹{cat.spent.toFixed(2)}</span>
            </div>
            <button
              onClick={() => onAddExpense(cat)}
              className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100"
            >
              + Add Expense
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}