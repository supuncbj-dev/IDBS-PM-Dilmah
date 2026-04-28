"use client";

import React, { useState, useEffect } from 'react';

const todayStr = new Date().toISOString().split('T')[0];

const defaultState = {
  view: 'command_center', cmdSub: 'tasks', repSub: 'consolidated', repSelectedProj: null,
  projectUser: 'Alice',
  auditLog: [],
  projects: [
    { id: '1', name: 'Alpha Reactor Setup', type: 'RND', status: 'Active' },
    { id: '2', name: 'Site B Server Expansion', type: 'CAPEX', status: 'Active' }
  ],
  tasks: [
    { id: 't1', projectId: '1', name: 'Design Blueprints', status: 'COMPLETED', assignee: 'Alice', startDate: '2026-05-01', endDate: '2026-05-05', dependsOn: '', comment: 'Draft verified by team lead.', completedAt: '2026-05-04' },
    { id: 't2', projectId: '1', name: 'Procure Parts', status: 'IN_PROGRESS', assignee: 'Bob', startDate: '2026-05-06', endDate: '2026-05-15', dependsOn: 't1', comment: 'Vendor shipments delayed.', completedAt: null },
    { id: 't3', projectId: '1', name: 'Assembly', status: 'NOT_STARTED', assignee: 'Charlie', startDate: '2026-05-16', endDate: '2026-05-25', dependsOn: 't2', comment: '', completedAt: null },
    { id: 't4', projectId: '2', name: 'Network Layout', status: 'IN_PROGRESS', assignee: 'Alice', startDate: '2026-05-03', endDate: '2026-05-08', dependsOn: '', comment: 'Running initial cable traces.', completedAt: null },
  ],
  users: [
    { name: 'Alice', email: 'alice@corp.com', mobile: '+1 555-0101', role: 'SUPER_USER', password: 'admin123' },
    { name: 'Bob', email: 'bob@corp.com', mobile: '+1 555-0202', role: 'PROJECT_USER', password: 'field123' },
    { name: 'Charlie', email: 'charlie@corp.com', mobile: '+1 555-0303', role: 'PROJECT_USER', password: 'field123' },
    { name: 'David', email: 'david@corp.com', mobile: '+1 555-0404', role: 'VIEWER', password: 'viewer123' }
  ]
};

export default function AdminPortal() {
  const [state, setState] = useState(defaultState);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [role, setRole] = useState<string>('SUPER_USER');
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState('alice@corp.com');
  const [password, setPassword] = useState('admin123');

  // Modals state
  const [showProjModal, setShowProjModal] = useState(false);
  const [projFormData, setProjFormData] = useState({ id: '', name: '', type: 'RND' });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ id: '', projectId: '', name: '', startDate: todayStr, endDate: todayStr, assignee: '', dependsOn: '', status: 'NOT_STARTED', comment: '' });

  const [editUserForm, setEditUserForm] = useState({ origName: '', name: '', email: '', mobile: '', password: '', role: 'PROJECT_USER' });

  useEffect(() => {
    let loadedState = JSON.parse(localStorage.getItem('pcc_state') || 'null') || defaultState;
    if (!loadedState.auditLog) loadedState.auditLog = [];
    if (!loadedState.users || loadedState.users.length === 0) loadedState.users = defaultState.users;
    
    loadedState.users.forEach((u: any) => {
      if(u.name === 'Alice' && !u.role) u.role = 'SUPER_USER';
      if(!u.role) u.role = 'PROJECT_USER';
      if(!u.password) {
        if(u.role === 'SUPER_USER') u.password = 'admin123';
        else if(u.role === 'VIEWER') u.password = 'viewer123';
        else u.password = 'field123';
      }
    });
    if(!loadedState.users.find((u: any) => u.email === 'alice@corp.com')) {
       loadedState.users.push({ name: 'Alice', email: 'alice@corp.com', mobile: '+1 555-0101', role: 'SUPER_USER', password: 'admin123' });
    }
    if(!loadedState.users.find((u: any) => u.email === 'david@corp.com')) {
       loadedState.users.push({ name: 'David', email: 'david@corp.com', mobile: '+1 555-0404', role: 'VIEWER', password: 'viewer123' });
    }

    setState(loadedState);
    setLoggedInUser(sessionStorage.getItem('pcc_su_logged_in'));
    setRole(sessionStorage.getItem('pcc_role') || 'SUPER_USER');
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pcc_state' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistState = (newState: any) => {
    setState(newState);
    localStorage.setItem('pcc_state', JSON.stringify(newState));
  };

  const logAction = (action: string, details: string, currentState: any) => {
    const u = sessionStorage.getItem('pcc_su_logged_in') || 'System';
    const newLog = { timestamp: new Date().toLocaleString(), user: u, action: action, details: details };
    const updatedState = { ...currentState, auditLog: [newLog, ...(currentState.auditLog || [])].slice(0, 500) };
    persistState(updatedState);
  };

  const showToast = (message: string) => {
    alert(message.replace(/<[^>]*>?/gm, '')); // Simplified toast for React port
  };

  const triggerNotifications = (projectName: string, taskName: string, assigneeName: string) => {
    if(!assigneeName) return;
    const u = state.users.find((x: any) => x.name === assigneeName);
    if(u) {
      showToast(`Assignment Triggered: ${projectName} - ${taskName} assigned to ${u.name}`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = state.users.find((x: any) => x.email === email.trim() && x.password === password.trim() && (x.role === 'SUPER_USER' || x.role === 'VIEWER'));
    if (u) {
      sessionStorage.setItem('pcc_su_logged_in', u.name);
      sessionStorage.setItem('pcc_role', u.role);
      setLoggedInUser(u.name);
      setRole(u.role);
      const newState = { ...state, view: u.role === 'VIEWER' ? 'dashboard' : 'command_center' };
      logAction('USER_LOGIN', `User ${u.name} (${u.role}) logged in.`, newState);
    } else {
      alert("Access Denied. Invalid credentials or insufficient permissions.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem('pcc_su_logged_in');
    sessionStorage.removeItem('pcc_role');
    setLoggedInUser(null);
    persistState({ ...state, view: 'command_center' });
  };

  const navigate = (viewName: string) => {
    const newState = { ...state, view: viewName };
    if (viewName === 'reports') {
      newState.repSub = 'consolidated';
      newState.repSelectedProj = null;
    }
    persistState(newState);
  };

  const deleteProject = (id: string) => {
    if(window.confirm("Are you sure you want to delete this project and all of its tasks?")) {
      const p = state.projects.find((x: any) => x.id === id);
      const n = p ? p.name : id;
      const newState = {
        ...state,
        projects: state.projects.filter((x: any) => x.id !== id),
        tasks: state.tasks.filter((t: any) => t.projectId !== id)
      };
      logAction('DELETE_PROJECT', `Deleted project: ${n}`, newState);
    }
  };

  const deleteTask = (id: string) => {
    if(window.confirm("Are you sure you want to delete this task?")) {
      const t = state.tasks.find((x: any) => x.id === id);
      const n = t ? t.name : id;
      const newState = { ...state, tasks: state.tasks.filter((x: any) => x.id !== id) };
      logAction('DELETE_TASK', `Deleted task: ${n}`, newState);
    }
  };

  const openProjModalFn = (projectId: string | null = null) => {
    if(projectId) {
      const p = state.projects.find((x: any) => x.id === projectId);
      if (p) setProjFormData({ id: p.id, name: p.name, type: p.type });
    } else {
      setProjFormData({ id: '', name: '', type: 'RND' });
    }
    setShowProjModal(true);
  };

  const saveProjectData = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, type } = projFormData;
    if(id) {
       const updatedProjects = state.projects.map((p: any) => p.id === id ? { ...p, name, type } : p);
       logAction('UPDATE_PROJECT', `Updated project details: ${name}`, { ...state, projects: updatedProjects });
    } else {
       const newProj = { id: Date.now().toString(), name, type, status: 'Active' };
       logAction('CREATE_PROJECT', `Created new project: ${name}`, { ...state, projects: [...state.projects, newProj] });
    }
    setShowProjModal(false);
  };

  const openTaskModalFn = (projectId: string, taskId: string | null = null) => {
    if(taskId) {
      const t = state.tasks.find((x: any) => x.id === taskId);
      if (t) setTaskFormData({ ...t, projectId });
    } else {
      setTaskFormData({ id: '', projectId, name: '', startDate: todayStr, endDate: todayStr, assignee: '', dependsOn: '', status: 'NOT_STARTED', comment: '' });
    }
    setShowTaskModal(true);
  };

  const saveTaskData = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, projectId, name, startDate, endDate, assignee, dependsOn, status, comment } = taskFormData;
    if(id) {
      const t = state.tasks.find((x: any) => x.id === id);
      if (!t) return;
      const assigneeChanged = t.assignee !== assignee;
      const completedAt = status === 'COMPLETED' ? (t.status !== 'COMPLETED' ? todayStr : t.completedAt) : null;
      
      const updatedTasks = state.tasks.map((x: any) => x.id === id ? { ...x, name, startDate, endDate, assignee, dependsOn, status, comment, completedAt } : x);
      const newState = { ...state, tasks: updatedTasks };
      logAction('UPDATE_TASK', `Updated task details: ${name} (${status})`, newState);
      if(assigneeChanged) {
        const p = state.projects.find((pr: any) => pr.id === projectId);
        triggerNotifications(p ? p.name : 'Unknown Project', name, assignee);
      }
    } else {
      const newId = 't_' + Date.now();
      const completedAt = status === 'COMPLETED' ? todayStr : null;
      const newTask = { id: newId, projectId, name, startDate, endDate, assignee, dependsOn, comment, status, completedAt };
      const newState = { ...state, tasks: [...state.tasks, newTask] };
      logAction('CREATE_TASK', `Created new task: ${name}`, newState);
      const p = state.projects.find((pr: any) => pr.id === projectId);
      triggerNotifications(p ? p.name : 'Unknown Project', name, assignee);
    }
    setShowTaskModal(false);
  };

  const saveManualUser = (e: React.FormEvent) => {
    e.preventDefault();
    const { origName, name, email, mobile, password, role } = editUserForm;
    if(name && email && password) {
      if(origName) {
         const updatedUsers = state.users.map((x: any) => x.name === origName ? { ...x, name, email, mobile, role, password } : x);
         const updatedTasks = origName !== name ? state.tasks.map((t: any) => t.assignee === origName ? { ...t, assignee: name } : t) : state.tasks;
         logAction('UPDATE_USER', `Updated profile for user: ${name}`, { ...state, users: updatedUsers, tasks: updatedTasks });
      } else {
         const newUser = { name, email, mobile, role, password };
         logAction('CREATE_USER', `Created new user: ${name} (${role})`, { ...state, users: [...state.users, newUser] });
      }
      setEditUserForm({ origName: '', name: '', email: '', mobile: '', password: '', role: 'PROJECT_USER' });
    }
  };

  const editUser = (name: string) => {
    const u = state.users.find((x: any) => x.name === name);
    if(u) setEditUserForm({ origName: u.name, name: u.name, email: u.email, mobile: u.mobile || '', password: u.password || '', role: u.role || 'PROJECT_USER' });
  };

  const deleteUser = (name: string) => {
    if(window.confirm(`Are you sure you want to delete user ${name}?`)) {
      const updatedUsers = state.users.filter((x: any) => x.name !== name);
      const updatedTasks = state.tasks.map((t: any) => t.assignee === name ? { ...t, assignee: '' } : t);
      logAction('DELETE_USER', `Deleted user: ${name}`, { ...state, users: updatedUsers, tasks: updatedTasks });
    }
  };

  const updateTaskField = (taskId: string, field: string, val: string) => {
    const t = state.tasks.find((x: any) => x.id === taskId);
    if(t) {
      const updatedTasks = state.tasks.map((x: any) => x.id === taskId ? { ...x, [field]: val } : x);
      const newState = { ...state, tasks: updatedTasks };
      logAction('UPDATE_TASK_FIELD', `Inline updated ${field} for task: ${t.name}`, newState);
      if(field === 'assignee') {
         const p = state.projects.find((pr: any) => pr.id === t.projectId);
         triggerNotifications(p ? p.name : 'Unknown Project', t.name, val);
      }
    }
  };

  if (!isLoaded) return null;

  if (!loggedInUser) {
    return (
      <div className="antialiased text-gray-800 min-h-screen flex flex-col relative bg-slate-50">
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-sm">C</div>
            <h2 className="text-2xl font-bold mb-2">Command Center</h2>
            <p className="text-sm text-gray-500 mb-8">Admin Access Restricted</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required placeholder="Email Address" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" required placeholder="Password" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all hover:scale-[1.02]">Login</button>
            </form>
          </div>
        </div>
        <img src="/logo.png" alt="Company Logo" className="fixed bottom-4 right-4 h-16 w-auto z-[100] opacity-90 shadow-md rounded-md bg-white p-1 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="antialiased text-gray-800 min-h-screen flex flex-col relative bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Project Command Center</h1>
        </div>
        <nav className="hidden md:flex bg-gray-100 p-1 rounded-lg">
          {role !== 'VIEWER' && <button onClick={() => navigate('command_center')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${state.view === 'command_center' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Super User Config</button>}
          <button onClick={() => navigate('dashboard')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${state.view === 'dashboard' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Gantt Dashboard</button>
          <button onClick={() => navigate('reports')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${state.view === 'reports' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Reports</button>
          <button onClick={() => navigate('audit_log')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${state.view === 'audit_log' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>Audit Log</button>
        </nav>
        <div className="flex gap-3 items-center">
           <span className="text-sm font-bold text-gray-700">{loggedInUser} ({role})</span>
           <button onClick={logout} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 font-medium">Logout</button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 md:p-8 max-w-7xl mx-auto h-full w-full">
        {state.view === 'audit_log' && <AuditLogView auditLog={state.auditLog} />}
        {state.view === 'command_center' && (
           <CommandCenterView state={state} persistState={persistState} openProjModalFn={openProjModalFn} deleteProject={deleteProject} openTaskModalFn={openTaskModalFn} deleteTask={deleteTask} updateTaskField={updateTaskField} editUserForm={editUserForm} setEditUserForm={setEditUserForm} saveManualUser={saveManualUser} editUser={editUser} deleteUser={deleteUser} />
        )}
        {state.view === 'dashboard' && <GanttDashboardView state={state} />}
        {state.view === 'reports' && <ReportsView state={state} persistState={persistState} />}
      </main>

      {/* Modals */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{projFormData.id ? 'Edit Project' : 'Create New Project'}</h3><button onClick={() => setShowProjModal(false)} className="text-gray-400 hover:text-gray-900 text-2xl">&times;</button></div>
            <form onSubmit={saveProjectData}>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label><input type="text" required className="w-full border rounded-lg p-2.5 text-sm" value={projFormData.name} onChange={e => setProjFormData({...projFormData, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label><select className="w-full border rounded-lg p-2.5 text-sm" value={projFormData.type} onChange={e => setProjFormData({...projFormData, type: e.target.value})}><option value="RND">Engineering R&D</option><option value="CAPEX">CAPEX Build</option></select></div>
              </div>
              <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => setShowProjModal(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{taskFormData.id ? 'Edit Task' : 'Create New Task'}</h3><button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-900 text-2xl">&times;</button></div>
            <form onSubmit={saveTaskData}>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label><input type="text" required className="w-full border rounded-lg p-2.5 text-sm font-medium text-gray-900" value={taskFormData.name} onChange={e => setTaskFormData({...taskFormData, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" required className="w-full border rounded-lg p-2.5 text-sm" value={taskFormData.startDate} onChange={e => setTaskFormData({...taskFormData, startDate: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" required className="w-full border rounded-lg p-2.5 text-sm" value={taskFormData.endDate} onChange={e => setTaskFormData({...taskFormData, endDate: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label><select className="w-full border rounded-lg p-2.5 text-sm" value={taskFormData.assignee} onChange={e => setTaskFormData({...taskFormData, assignee: e.target.value})}><option value="">Select User</option>{state.users.map((u: any) => <option key={u.name} value={u.name}>{u.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Dependency</label><select className="w-full border rounded-lg p-2.5 text-sm" value={taskFormData.dependsOn} onChange={e => setTaskFormData({...taskFormData, dependsOn: e.target.value})}><option value="">None</option>{state.tasks.filter((t: any) => t.projectId === taskFormData.projectId && t.id !== taskFormData.id).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="w-full border rounded-lg p-2.5 text-sm" value={taskFormData.status} onChange={e => setTaskFormData({...taskFormData, status: e.target.value})}><option value="NOT_STARTED">to-do</option><option value="IN_PROGRESS">in-progress</option><option value="COMPLETED">completed</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Field Comments</label><textarea rows={2} className="w-full border rounded-lg p-2.5 text-sm text-gray-700" value={taskFormData.comment} onChange={e => setTaskFormData({...taskFormData, comment: e.target.value})}></textarea></div>
              </div>
              <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Save Task Details</button></div>
            </form>
          </div>
        </div>
      )}

      <img src="/logo.png" alt="Company Logo" className="fixed bottom-4 right-4 h-16 w-auto z-[100] opacity-90 shadow-md rounded-md bg-white p-1 pointer-events-none" />
    </div>
  );
}

function AuditLogView({ auditLog }: { auditLog: any[] }) {
  return (
    <div className="w-full fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500">System Audit Trail</h2>
        <p className="text-gray-500 text-sm">Real-time log of all administrative and field activities.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {auditLog.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr><th className="p-3">Timestamp</th><th className="p-3">User</th><th className="p-3">Action</th><th className="p-3">Details</th></tr>
            </thead>
            <tbody>
              {auditLog.map((log: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                  <td className="p-3 text-gray-500">{log.timestamp}</td>
                  <td className="p-3 font-bold text-gray-800">{log.user}</td>
                  <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{log.action}</span></td>
                  <td className="p-3 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">No activity logged yet.</div>
        )}
      </div>
    </div>
  );
}

function CommandCenterView({ state, persistState, openProjModalFn, deleteProject, openTaskModalFn, deleteTask, updateTaskField, editUserForm, setEditUserForm, saveManualUser, editUser, deleteUser }: any) {
  return (
    <div className="w-full fade-in">
      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500">Super User Config</h2>
        <button onClick={() => openProjModalFn()} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:scale-105 transition-transform">+ New Project</button>
      </div>
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button onClick={() => persistState({...state, cmdSub: 'tasks'})} className={`pb-2 font-medium text-sm transition-colors ${state.cmdSub==='tasks'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500 hover:text-gray-800'}`}>Per-Project Tasks</button>
        <button onClick={() => persistState({...state, cmdSub: 'users'})} className={`pb-2 font-medium text-sm transition-colors ${state.cmdSub==='users'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500 hover:text-gray-800'}`}>User Management</button>
      </div>
      {state.cmdSub === 'tasks' ? (
        state.projects.map((p: any) => {
          const pTasks = state.tasks.filter((t: any) => t.projectId === p.id);
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">{p.name} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">{p.type}</span></h3>
                <div className="flex gap-2">
                  <button onClick={() => openTaskModalFn(p.id)} className="text-blue-600 bg-white border border-blue-200 px-3 py-1 rounded shadow-sm text-sm font-bold hover:bg-blue-50 transition-colors">+ Add Task</button>
                  <button onClick={() => openProjModalFn(p.id)} className="text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded shadow-sm text-sm font-bold hover:bg-gray-50 transition-colors">Edit Project ✏️</button>
                  <button onClick={() => deleteProject(p.id)} className="text-red-600 bg-white border border-red-200 px-3 py-1 rounded shadow-sm text-sm font-bold hover:bg-red-50 transition-colors">Delete Project 🗑️</button>
                </div>
              </div>
              {pTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead><tr className="bg-white text-gray-400 text-xs uppercase border-b border-gray-200"><th className="p-3 font-semibold">Task</th><th className="p-3 font-semibold">Assignee (Inline)</th><th className="p-3 font-semibold">Start (Inline)</th><th className="p-3 font-semibold">End (Inline)</th><th className="p-3 font-semibold">Actions</th></tr></thead>
                    <tbody>
                      {pTasks.map((t: any) => (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm font-bold text-gray-900">{t.name}</td>
                          <td className="p-3"><select className="text-sm border-gray-300 rounded p-1.5 w-full outline-none focus:border-blue-500" value={t.assignee} onChange={e => updateTaskField(t.id, 'assignee', e.target.value)}><option value="">None</option>{state.users.map((u: any) => <option key={u.name} value={u.name}>{u.name}</option>)}</select></td>
                          <td className="p-3"><input type="date" className="border border-gray-300 outline-none focus:border-blue-500 rounded p-1.5 text-sm" value={t.startDate} onChange={e => updateTaskField(t.id, 'startDate', e.target.value)} /></td>
                          <td className="p-3"><input type="date" className="border border-gray-300 outline-none focus:border-blue-500 rounded p-1.5 text-sm" value={t.endDate} onChange={e => updateTaskField(t.id, 'endDate', e.target.value)} /></td>
                          <td className="p-3 flex gap-2"><button onClick={() => openTaskModalFn(p.id, t.id)} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 font-medium">Edit Details ✏️</button><button onClick={() => deleteTask(t.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 font-medium">Delete ❌</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="p-6 text-center text-sm text-gray-500">No tasks mapped to this project yet.</div>}
            </div>
          )
        })
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200"><h3 className="font-semibold">Registered Users</h3></div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-gray-400 text-xs uppercase border-b"><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Mobile (WA)</th><th className="p-3">Role</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {state.users.map((u: any) => (
                  <tr key={u.name} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-3 text-sm font-medium text-gray-900">{u.name}</td><td className="p-3 text-sm text-gray-600">{u.email}</td><td className="p-3 text-sm text-gray-600">{u.mobile || '-'}</td><td className="p-3 text-xs"><span className={`${u.role==='SUPER_USER'?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-600'} px-2 py-1 rounded font-bold`}>{u.role || 'PROJECT_USER'}</span></td><td className="p-3 flex gap-2"><button onClick={() => editUser(u.name)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button><button onClick={() => deleteUser(u.name)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold mb-4">{editUserForm.origName ? 'Edit User' : 'Add User Manually'}</h3>
              <form onSubmit={saveManualUser} className="space-y-3">
                <input type="text" placeholder="Name" required className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} />
                <input type="email" placeholder="Email" required className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} />
                <input type="text" placeholder="Mobile (WhatsApp)" className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" value={editUserForm.mobile} onChange={e => setEditUserForm({...editUserForm, mobile: e.target.value})} />
                <input type="password" placeholder="Password" required className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" value={editUserForm.password} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} />
                <select className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" value={editUserForm.role} onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}><option value="PROJECT_USER">Project User</option><option value="SUPER_USER">Super User</option><option value="VIEWER">Viewer</option></select>
                <div className="flex gap-2">
                  {editUserForm.origName && <button type="button" onClick={() => setEditUserForm({ origName: '', name: '', email: '', mobile: '', password: '', role: 'PROJECT_USER' })} className="w-1/3 bg-gray-200 text-gray-700 text-sm font-bold py-2 rounded hover:bg-gray-300">Cancel</button>}
                  <button type="submit" className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded hover:bg-blue-700 transition-colors">{editUserForm.origName ? 'Update' : 'Add User'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GanttDashboardView({ state }: { state: any }) {
  let minDate = new Date("2099-01-01"); let maxDate = new Date("1970-01-01");
  state.tasks.forEach((t: any) => { let s = new Date(t.startDate); let e = new Date(t.endDate); if (s < minDate) minDate = s; if (e > maxDate) maxDate = e; });
  if (minDate > maxDate) { minDate = new Date(); maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 15); }
  minDate.setDate(minDate.getDate() - 1); maxDate.setDate(maxDate.getDate() + 2);
  const totalMs = maxDate.getTime() - minDate.getTime(); 
  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  
  const headers = [];
  for (let i = 0; i < totalDays; i++) {
     let d = new Date(minDate); d.setDate(d.getDate() + i);
     headers.push(<div key={i} className="border-l border-gray-200 text-center text-[10px] text-gray-500 py-1" style={{width: '40px', flexShrink: 0}}>{d.getDate()}/{d.getMonth()+1}</div>);
  }

  return (
    <div className="fade-in w-full">
      <div className="mb-8"><h2 className="text-2xl font-bold text-gray-900">Portfolio Timeline</h2></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-hidden">
           <div className="w-48 shrink-0 py-2 px-4 shadow-sm z-10 text-xs font-bold text-gray-500 uppercase">Tasks</div>
           <div className="flex overflow-x-auto" style={{minWidth: `${totalDays * 40}px`}}>{headers}</div>
         </div>
         <div className="overflow-y-auto max-h-[600px] overflow-x-auto">
           {state.projects.map((p: any) => {
             const projTasks = state.tasks.filter((t: any) => t.projectId === p.id);
             return (
               <div key={p.id} className="mb-6">
                 <div className="bg-gray-100 font-bold px-4 py-2 border-y border-gray-200 text-sm flex justify-between"><span>{p.name}</span><span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">{p.type}</span></div>
                 {projTasks.map((t: any) => {
                   let s = new Date(t.startDate); let e = new Date(t.endDate);
                   let leftPct = ((s.getTime() - minDate.getTime()) / totalMs) * 100; 
                   let widthPct = (((e.getTime() - s.getTime()) + (1000*60*60*24)) / totalMs) * 100;
                   let color = t.status === 'COMPLETED' ? 'bg-emerald-500 border border-emerald-600' : t.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300';
                   return (
                     <div key={t.id} className="flex items-center h-10 border-b border-gray-50 hover:bg-slate-50 transition-colors">
                       <div className="w-48 shrink-0 px-4 text-sm font-medium truncate flex justify-between items-center">
                         <span className={t.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-700'}>{t.name}</span>
                         <span className="text-xs">{t.status === 'COMPLETED' ? '✅' : ''}</span>
                       </div>
                       <div className="relative flex-1 h-full shadow-inner bg-gray-50/50" style={{minWidth: `${totalDays * 40}px`}}>
                         <div className={`absolute h-6 rounded-md top-2 flex items-center px-2 shadow-sm text-[10px] font-bold text-white overflow-hidden whitespace-nowrap ${color}`} style={{left: `${leftPct}%`, width: `${widthPct}%`}}>
                           <span className={t.status === 'COMPLETED' ? 'line-through opacity-80 text-emerald-100' : ''}>{t.name}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}

function ReportsView({ state, persistState }: any) {
  return (
    <div className="fade-in w-full">
      <div className="mb-4"><h2 className="text-2xl font-bold text-blue-700">Reports Directory</h2></div>
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button onClick={() => persistState({...state, repSub: 'consolidated'})} className={`pb-2 text-sm ${state.repSub==='consolidated'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`}>Consolidated View</button>
        <button onClick={() => persistState({...state, repSub: 'list'})} className={`pb-2 text-sm ${state.repSub==='list'?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`}>Individual Project Reports</button>
      </div>
      {state.repSub === 'consolidated' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-blue-500"><h4 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Projects</h4><p className="text-4xl font-extrabold text-gray-900">{state.projects.length}</p></div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center"><button onClick={() => alert("Simulated Export! CSV/PDF downloaded.")} className="bg-black text-white w-full py-3 rounded-xl font-bold shadow hover:scale-[1.02] transition-transform">Extract Master Report (CSV)</button></div>
        </div>
      ) : (
        state.repSelectedProj ? (
          <div>
            <button onClick={() => persistState({...state, repSub: 'list', repSelectedProj: null})} className="text-sm text-gray-500 hover:underline mb-4">&larr; Back</button>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4"><h3 className="text-2xl font-bold">Detailed Analytics Extract</h3><button onClick={() => alert("Export!")} className="bg-emerald-50 text-emerald-700 px-4 py-2 border rounded hover:bg-emerald-100 font-bold text-sm shadow-sm">Export Data</button></div>
              <table className="w-full text-left border-collapse"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr className="border-b"><th className="p-2">Task</th><th className="p-2">Plan Dates</th><th className="p-2">Status</th><th className="p-2">Completed On</th><th className="p-2">Field Comment</th></tr></thead>
              <tbody>
                {state.tasks.filter((t: any) => t.projectId === state.repSelectedProj).map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-3 text-sm font-bold">{t.name}</td><td className="p-3 text-xs text-gray-500">{t.startDate} to {t.endDate}</td><td className={`p-3 text-sm font-bold ${t.status==='COMPLETED'?'text-emerald-600':'text-amber-500'}`}>{t.status}</td><td className="p-3 text-xs text-gray-500">{t.completedAt || '-'}</td><td className="p-3 text-sm italic text-gray-600">"{t.comment || ''}"</td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {state.projects.map((p: any) => (
              <div key={p.id} onClick={() => persistState({...state, repSub: 'list', repSelectedProj: p.id})} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow cursor-pointer font-bold transition-all text-gray-800">{p.name} &rarr;</div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
