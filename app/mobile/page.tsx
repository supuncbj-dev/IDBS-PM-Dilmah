import React from 'react';

const MOCK_TASKS = [
  { id: 't1', name: 'Material Inspection', status: 'IN_PROGRESS' },
  { id: 't2', name: 'Site Clearing', status: 'COMPLETED' },
  { id: 't3', name: 'Foundation Pouring', status: 'BLOCKED' },
];

export default function MobileCheckIn() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 dark:bg-zinc-950 min-h-[calc(100vh-4rem)] pt-6 pb-24 relative">
      <div className="px-4 mb-6">
        <h2 className="text-2xl font-bold mb-1">My Tasks</h2>
        <p className="text-sm text-gray-500">Site B Server Expansion</p>
      </div>

      <div className="px-4 space-y-4">
        {MOCK_TASKS.map(task => (
          <div key={task.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="font-semibold text-lg mb-4">{task.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className={`py-3 rounded-xl text-sm font-medium transition-colors ${task.status === 'NOT_STARTED' ? 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-white' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800/50 hover:bg-gray-100'}`}>
                Not Started
              </button>
              <button className={`py-3 rounded-xl text-sm font-medium transition-colors ${task.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800/50 hover:bg-gray-100'}`}>
                In Progress
              </button>
              <button className={`py-3 rounded-xl text-sm font-medium transition-colors ${task.status === 'BLOCKED' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800/50 hover:bg-gray-100'}`}>
                Blocked
              </button>
              <button className={`py-3 rounded-xl text-sm font-medium transition-colors ${task.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800/50 hover:bg-gray-100'}`}>
                Completed
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-3">
          <a href="/" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-xl mb-1">📊</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
          </a>
          <a href="#" className="flex flex-col items-center p-2 text-blue-500">
            <span className="text-xl mb-1">📋</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">My Tasks</span>
          </a>
          <a href="#" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <span className="text-xl mb-1">📷</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
          </a>
        </div>
      </div>
    </div>
  );
}
