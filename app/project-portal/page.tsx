"use client";

import React, { useState, useEffect } from 'react';
import { getState, logActionServer, checkInTaskServer } from '../actions';

const todayStr = new Date().toISOString().split('T')[0];

const defaultState = {
  view: 'PROJECT_USER', cmdSub: 'tasks', repSub: 'consolidated', repSelectedProj: null,
  projectUser: '',
  projects: [] as any[], tasks: [] as any[], users: [] as any[], auditLog: [] as any[]
};

export default function ProjectPortal() {
  const [state, setState] = useState<any>(defaultState);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = async () => {
    try {
      const data = await getState();
      setState((prev: any) => ({
        ...prev,
        projects: data.projects,
        tasks: data.tasks,
        users: data.users
      }));
    } catch (err) {
      console.error("Failed to load state", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const loggedUser = sessionStorage.getItem('pcc_pu_logged_in');
      
      try {
        const data = await getState();
        setState({ ...defaultState, projects: data.projects, tasks: data.tasks, users: data.users });
      } catch (err) {
        console.error("Failed to fetch state", err);
      }

      if (loggedUser) {
        setLoggedInUser(loggedUser);
      }
      setIsLoaded(true);
    };
    init();
  }, []);

  const logAction = async (action: string, details: string) => {
    const u = sessionStorage.getItem('pcc_pu_logged_in') || 'System';
    const timestamp = new Date().toLocaleString();
    await logActionServer(timestamp, u, action, details);
    await refreshData();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = state.users.find((x: any) => x.email === email.trim() && x.password === password.trim() && x.role === 'PROJECT_USER');
    if (u) {
      sessionStorage.setItem('pcc_pu_logged_in', u.name);
      setLoggedInUser(u.name);
      logAction('USER_LOGIN', `Project User ${u.name} logged in.`);
    } else {
      alert("Access Denied. Invalid credentials or you are not a Project User.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem('pcc_pu_logged_in');
    setLoggedInUser(null);
  };

  const projectCheckIn = async (taskId: string, statusKey: string, comment: string) => {
    // Optimistic Update
    const completedAt = statusKey === 'COMPLETED' ? todayStr : null;
    setState((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: statusKey, comment, completedAt } : t)
    }));
    
    await checkInTaskServer(taskId, statusKey, comment, completedAt);
    const taskName = state.tasks.find((t: any) => t.id === taskId)?.name;
    await logAction('TASK_CHECKIN', `Project check-in for task ${taskName} to ${statusKey}`);
  };

  if (!isLoaded) return null;

  if (!loggedInUser) {
    return (
      <div className="antialiased text-gray-800 min-h-screen flex flex-col relative bg-slate-50">
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">PU</div>
            <h2 className="text-2xl font-bold mb-2">Project Agent Portal</h2>
            <p className="text-sm text-gray-500 mb-8">Login to access your assigned tasks</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required placeholder="Project User Email" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" required placeholder="Password" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-emerald-700 transition-all hover:scale-[1.02]">Login to Project App</button>
            </form>
          </div>
        </div>
        <img src="/logo.png" alt="Company Logo" className="fixed bottom-4 right-4 h-16 w-auto z-[100] opacity-90 shadow-md rounded-md bg-white p-1 pointer-events-none" />
      </div>
    );
  }

  const assignedTasks = state.tasks.filter((t: any) => t.assignee === loggedInUser);

  return (
    <div className="antialiased text-gray-800 min-h-screen flex flex-col relative bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold">PU</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">Project check-in App</h1>
        </div>
        <div className="flex gap-3 items-center">
           <span className="text-sm font-bold text-gray-700">{loggedInUser}</span>
           <button onClick={logout} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 font-medium">Logout</button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto h-full">
          <div className="max-w-md mx-auto bg-gray-50 min-h-[700px] sm:border-8 border-gray-200 sm:rounded-[2.5rem] rounded-xl shadow-2xl relative overflow-hidden flex flex-col sm:mt-8">
            <div className="bg-white px-6 py-5 border-b shadow-sm">
              <h2 className="text-xl font-extrabold mb-2">My Project Tasks</h2>
            </div>
            <div className="px-4 py-6 overflow-y-auto flex-1 pb-24">
              {assignedTasks.length > 0 ? assignedTasks.map((t: any) => {
                const p = state.projects.find((pr: any) => pr.id === t.projectId);
                return (
                  <TaskCard key={t.id} task={t} project={p} onCheckIn={projectCheckIn} />
                );
              }) : (
                <p className="text-center text-sm text-gray-500 mt-10">No tasks assigned to you right now.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <img src="/logo.png" alt="Company Logo" className="fixed bottom-4 right-4 h-16 w-auto z-[100] opacity-90 shadow-md rounded-md bg-white p-1 pointer-events-none" />
    </div>
  );
}

function TaskCard({ task, project, onCheckIn }: { task: any, project: any, onCheckIn: any }) {
  const [comment, setComment] = useState(task.comment || '');
  const btns = [
    { k: 'NOT_STARTED', l: 'to-do', a: 'bg-gray-200 text-gray-800' },
    { k: 'IN_PROGRESS', l: 'in-progress', a: 'bg-blue-500 text-white shadow-md' },
    { k: 'COMPLETED', l: 'completed', a: 'bg-emerald-500 text-white shadow-md' }
  ];

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 mb-4 transition-transform ${task.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">{project?.name || 'Unknown Project'}</div>
        <div className="text-[10px] text-gray-400 font-medium">{task.startDate} ➔ {task.endDate}</div>
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-4 mt-2">{task.name}</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {btns.map(s => (
          <button 
            key={s.k}
            className={`py-3 rounded-xl text-[10px] sm:text-xs font-medium w-full transition-colors ${task.status === s.k ? s.a : 'bg-gray-50 text-gray-500 border'}`} 
            onClick={() => onCheckIn(task.id, s.k, comment)}
          >
            {s.l}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
         <label className="text-xs font-bold text-gray-500 block mb-1">Project Notes / Comments</label>
         <textarea className="w-full bg-transparent resize-none outline-none text-sm text-gray-700 placeholder-gray-400" rows={2} placeholder="Write updates here..." value={comment} onChange={e => setComment(e.target.value)}></textarea>
         <div className="flex justify-between items-center mt-2">
           <span className="text-[10px] sm:text-xs font-medium text-emerald-600">{task.completedAt ? 'Completed: ' + task.completedAt : ''}</span>
           <button onClick={() => onCheckIn(task.id, task.status, comment)} className="bg-emerald-600 text-white text-[10px] sm:text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm hover:bg-emerald-700">Save Update</button>
         </div>
      </div>
    </div>
  );
}
