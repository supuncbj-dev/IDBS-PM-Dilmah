import React from 'react';

// Mock data to demonstrate the deviation logic and UI
const MOCK_PROJECTS = [
  { id: '1', name: 'Alpha Reactor Setup', type: 'RND', status: 'Active', plannedDays: 100, actualDays: 115, manager: 'Alice' },
  { id: '2', name: 'Site B Server Expansion', type: 'CAPEX', status: 'Active', plannedDays: 60, actualDays: 58, manager: 'Bob' },
  { id: '3', name: 'Hydraulics Redesign', type: 'RND', status: 'Active', plannedDays: 45, actualDays: 60, manager: 'Charlie' },
];

export default function Dashboard() {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Global Portfolio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of all active Engineering and CAPEX projects</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium shadow-md hover:scale-105 transition-transform">All Projects</button>
          <button className="px-4 py-2 rounded-full bg-white text-gray-700 dark:bg-zinc-800 dark:text-gray-200 shadow hover:bg-gray-50 transition-colors">Red Flags</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((proj) => {
          const deviation = (proj.actualDays - proj.plannedDays) / proj.plannedDays;
          const deviationPercent = (deviation * 100).toFixed(1);
          
          let alertState = 'green';
          if (deviation > 0.1) alertState = 'red';
          else if (deviation > 0) alertState = 'yellow';

          // Progress bar widths
          const plannedWidth = Math.min((proj.plannedDays / Math.max(proj.plannedDays, proj.actualDays)) * 100, 100);
          const overrunWidth = alertState !== 'green' ? Math.min((proj.actualDays - proj.plannedDays) / Math.max(proj.plannedDays, proj.actualDays) * 100, 100) : 0;

          return (
            <div key={proj.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block ${proj.type === 'RND' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {proj.type === 'RND' ? 'Tech R&D' : 'CAPEX Build'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{proj.name}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">{proj.manager[0]}</div>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Timeline Progress</span>
                  <span className={`font-semibold ${alertState === 'red' ? 'text-red-500' : alertState === 'yellow' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {MOCK_PROJECTS.length > 0 && deviation > 0 ? `+${deviationPercent}% Overrun` : 'On Track'}
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800 rounded-full flex overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${plannedWidth}%` }}></div>
                  {alertState === 'red' && (
                    <div className="h-full bg-red-500 striped-bg transition-all duration-1000" style={{ width: `${overrunWidth}%` }}></div>
                  )}
                  {alertState === 'yellow' && (
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${overrunWidth}%` }}></div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Planned: {proj.plannedDays}d</span>
                  <span>Actual: <b className="text-gray-700 dark:text-gray-300">{proj.actualDays}d</b></span>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 dark:border-zinc-800 pt-4 flex gap-2">
                <a href={`/mobile?projectId=${proj.id}`} className="flex-1 text-center py-2 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  Check-in View
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
