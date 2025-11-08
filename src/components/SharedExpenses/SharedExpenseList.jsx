import React from 'react';
import { Trash2 } from 'lucide-react';

export default function SharedExpenseList({ expenses, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Shared Expenses</h2>
      {expenses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No shared expenses yet</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((exp) => (
            <div key={exp.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{exp.description}</h3>
                  <p className="text-sm text-gray-600">Paid by {exp.paidBy}</p>
                  <p className="text-xs text-gray-500">{exp.date}</p>
                </div>
                <button
                  onClick={() => onDelete(exp.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-gray-800">₹{exp.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Your Share:</span>
                  <span className="font-bold text-indigo-600">₹{exp.splitAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Split among {exp.roommates} people</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}