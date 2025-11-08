import React from 'react';
import { User, Users } from 'lucide-react';

export default function TabNavigation({ activeTab, setActiveTab }) {
  return (
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
  );
}