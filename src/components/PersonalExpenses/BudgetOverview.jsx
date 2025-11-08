import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

export default function BudgetOverview({ budget, setBudget, totalSpent, remaining }) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  const handleSetBudget = () => {
    if (tempBudget && parseFloat(tempBudget) > 0) {
      setBudget(parseFloat(tempBudget));
      setEditingBudget(false);
      setTempBudget('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Budget Overview</h2>
        <button
          onClick={() => {
            setEditingBudget(true);
            setTempBudget(budget.toString());
          }}
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>
      
      {editingBudget ? (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={tempBudget}
            onChange={(e) => setTempBudget(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter budget"
          />
          <button
            onClick={handleSetBudget}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Set
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-xl font-bold text-gray-800">₹{budget}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-xl font-bold text-red-600">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{remaining.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                (totalSpent / budget) * 100 > 90 ? 'bg-red-500' :
                (totalSpent / budget) * 100 > 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}