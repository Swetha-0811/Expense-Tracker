import React, { useState, useEffect } from 'react';
import { Plus, Users, User, Trash2, Edit2 } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('personal');
  const [budget, setBudget] = useState(5000);
  const [tempBudget, setTempBudget] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const defaultCategories = [
    { id: 1, name: 'Food', spent: 0, color: 'bg-orange-500' },
    { id: 2, name: 'Transport', spent: 0, color: 'bg-blue-500' },
    { id: 3, name: 'Groceries', spent: 0, color: 'bg-green-500' },
    { id: 4, name: 'Entertainment', spent: 0, color: 'bg-purple-500' },
    { id: 5, name: 'Other', spent: 0, color: 'bg-gray-500' }
  ];
  
  const [categories, setCategories] = useState(defaultCategories);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  
  const [roommates, setRoommates] = useState(['You']);
  const [newRoommate, setNewRoommate] = useState('');
  const [sharedExpenses, setSharedExpenses] = useState([]);
  const [showAddShared, setShowAddShared] = useState(false);
  const [sharedAmount, setSharedAmount] = useState('');
  const [sharedDescription, setSharedDescription] = useState('');
  const [sharedPaidBy, setSharedPaidBy] = useState('You');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedBudget = localStorage.getItem('budget');
      if (savedBudget) setBudget(parseFloat(savedBudget));

      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedRoommates = localStorage.getItem('roommates');
      if (savedRoommates) setRoommates(JSON.parse(savedRoommates));

      const savedExpenses = localStorage.getItem('sharedExpenses');
      if (savedExpenses) setSharedExpenses(JSON.parse(savedExpenses));
    } catch (error) {
      console.log('Error loading data:', error);
    }
    setDataLoaded(true);
  }, []);

  // Save budget to localStorage
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('budget', budget.toString());
    }
  }, [budget, dataLoaded]);

  // Save categories to localStorage
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, dataLoaded]);

  // Save roommates to localStorage
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('roommates', JSON.stringify(roommates));
    }
  }, [roommates, dataLoaded]);

  // Save shared expenses to localStorage
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('sharedExpenses', JSON.stringify(sharedExpenses));
    }
  }, [sharedExpenses, dataLoaded]);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = budget - totalSpent;

  const handleSetBudget = () => {
    if (tempBudget && parseFloat(tempBudget) > 0) {
      setBudget(parseFloat(tempBudget));
      setEditingBudget(false);
      setTempBudget('');
    }
  };

  const handleAddExpense = () => {
    if (selectedCategory && expenseAmount && parseFloat(expenseAmount) > 0) {
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...cat, spent: cat.spent + parseFloat(expenseAmount) }
          : cat
      ));
      setExpenseAmount('');
      setShowAddExpense(false);
      setSelectedCategory(null);
    }
  };

  const addRoommate = () => {
    if (newRoommate.trim() && !roommates.includes(newRoommate.trim())) {
      setRoommates([...roommates, newRoommate.trim()]);
      setNewRoommate('');
    }
  };

  const removeRoommate = (name) => {
    if (name !== 'You' && roommates.length > 1) {
      setRoommates(roommates.filter(r => r !== name));
    }
  };

  const addSharedExpense = () => {
    if (sharedAmount && parseFloat(sharedAmount) > 0 && sharedDescription.trim()) {
      const amount = parseFloat(sharedAmount);
      const splitAmount = amount / roommates.length;
      const newExpense = {
        id: Date.now(),
        description: sharedDescription,
        totalAmount: amount,
        splitAmount: splitAmount,
        paidBy: sharedPaidBy,
        date: new Date().toLocaleString(),
        roommates: roommates.length
      };
      setSharedExpenses([newExpense, ...sharedExpenses]);
      setSharedAmount('');
      setSharedDescription('');
      setShowAddShared(false);
    }
  };

  const deleteSharedExpense = (id) => {
    setSharedExpenses(sharedExpenses.filter(exp => exp.id !== id));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('budget');
      localStorage.removeItem('categories');
      localStorage.removeItem('roommates');
      localStorage.removeItem('sharedExpenses');
      
      setBudget(5000);
      setCategories(defaultCategories);
      setRoommates(['You']);
      setSharedExpenses([]);
      
      alert('All data has been reset!');
    }
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">💰 Expense Tracker</h1>
              <p className="text-sm text-gray-600">Manage your college expenses</p>
            </div>
            <button
              onClick={clearAllData}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'personal'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600'
            }`}
          >
            <User className="inline w-5 h-5 mr-2" />
            Personal
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'shared'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600'
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            Shared
          </button>
        </div>

        {/* Personal Expenses Tab */}
        {activeTab === 'personal' && (
          <>
            {/* Budget Overview */}
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

            {/* Categories */}
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
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowAddExpense(true);
                      }}
                      className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100"
                    >
                      + Add Expense
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Add to {selectedCategory?.name}</h3>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddExpense(false);
                        setExpenseAmount('');
                        setSelectedCategory(null);
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddExpense}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Shared Expenses Tab */}
        {activeTab === 'shared' && (
          <>
            {/* Roommates Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Roommates ({roommates.length})</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newRoommate}
                  onChange={(e) => setNewRoommate(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRoommate()}
                  placeholder="Add roommate name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addRoommate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {roommates.map((name) => (
                  <div key={name} className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-semibold text-indigo-700">{name}</span>
                    {name !== 'You' && (
                      <button
                        onClick={() => removeRoommate(name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Shared Expense Button */}
            <button
              onClick={() => setShowAddShared(true)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg mb-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Add Shared Expense
            </button>

            {/* Shared Expenses List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Shared Expenses</h2>
              {sharedExpenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No shared expenses yet</p>
              ) : (
                <div className="space-y-3">
                  {sharedExpenses.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{exp.description}</h3>
                          <p className="text-sm text-gray-600">Paid by {exp.paidBy}</p>
                          <p className="text-xs text-gray-500">{exp.date}</p>
                        </div>
                        <button
                          onClick={() => deleteSharedExpense(exp.id)}
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

            {/* Add Shared Expense Modal */}
            {showAddShared && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Add Shared Expense</h3>
                  <input
                    type="text"
                    value={sharedDescription}
                    onChange={(e) => setSharedDescription(e.target.value)}
                    placeholder="Description (e.g., Dinner, Groceries)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    value={sharedAmount}
                    onChange={(e) => setSharedAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
                  />
                  <select
                    value={sharedPaidBy}
                    onChange={(e) => setSharedPaidBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                  >
                    {roommates.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddShared(false);
                        setSharedAmount('');
                        setSharedDescription('');
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addSharedExpense}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}