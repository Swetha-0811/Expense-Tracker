import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function RoommatesList({ roommates, onAdd, onRemove }) {
  const [newRoommate, setNewRoommate] = useState('');

  const handleAdd = () => {
    onAdd(newRoommate);
    setNewRoommate('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Roommates ({roommates.length})
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newRoommate}
          onChange={(e) => setNewRoommate(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add roommate name"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleAdd}
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
                onClick={() => onRemove(name)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}