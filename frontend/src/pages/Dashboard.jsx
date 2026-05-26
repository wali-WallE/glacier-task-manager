import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [teamSearchQuery, setTeamSearchQuery] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [memberStatusMessage, setMemberStatusMessage] = useState('');

    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => { fetchTeams(); }, []);

    useEffect(() => {
        if (selectedTeamId) {
            fetchTasks(selectedTeamId);
            fetchTeamMembers(selectedTeamId);
        } else {
            setTasks([]);
            setTeamMembers([]);
        }
    }, [selectedTeamId]);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams');
            setTeams(response.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async (teamId) => {
        try {
            const response = await api.get(`/tasks/team/${teamId}`);
            setTasks(response.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchTeamMembers = async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}/members`);
            setTeamMembers(response.data || []);
        } catch (err) { console.error(err); }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) { console.error(err); }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setStatusMessage('');
        try {
            const response = await api.post('/teams', { name: teamName, description: teamDescription });
            setStatusMessage(`Workspace "${response.data.team.name}" established.`);
            setTeamName(''); setTeamDescription(''); fetchTeams();
        } catch (err) { setStatusMessage(err.response?.data?.error || 'Error creating team'); }
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        if (!selectedTeamId) return;
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask.id}`, {
                    ...editingTask,
                    title: taskTitle,
                    description: taskDescription,
                    assigned_to: assignedTo || null
                });
            } else {
                await api.post('/tasks', {
                    title: taskTitle, description: taskDescription,
                    team_id: selectedTeamId, assigned_to: assignedTo || null
                });
            }
            closeTaskModal();
            fetchTasks(selectedTeamId);
        } catch (err) { console.error(err); }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setMemberStatusMessage('');
        try {
            await api.post(`/teams/${selectedTeamId}/members`, { email: newMemberEmail });
            setNewMemberEmail('');
            setIsMemberModalOpen(false);
            fetchTeamMembers(selectedTeamId);
            setStatusMessage('Colleague added successfully.');
        } catch (err) {
            setMemberStatusMessage(err.response?.data?.error || 'Error adding member.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try { await api.delete(`/tasks/${taskId}`); fetchTasks(selectedTeamId); }
        catch (err) { console.error(err); }
    };

    const handleQuickStatusUpdate = async (task, newStatus) => {
        try { await api.put(`/tasks/${task.id}`, { ...task, status: newStatus }); fetchTasks(selectedTeamId); }
        catch (err) { console.error(err); }
    };

    const openTaskModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTaskTitle(task.title);
            setTaskDescription(task.description || '');
            setAssignedTo(task.assigned_to || '');
        } else {
            setEditingTask(null);
            setTaskTitle('');
            setTaskDescription('');
            setAssignedTo('');
        }
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setTaskTitle('');
        setTaskDescription('');
        setAssignedTo('');
    };

    const getAssigneeName = (userId) => {
        if (!userId) return 'Unassigned';
        const member = teamMembers.find(m => m.id === userId);
        return member ? member.username : 'Unknown';
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesAssignee = filterAssignee ? task.assigned_to === parseInt(filterAssignee) : true;
        return matchesSearch && matchesAssignee;
    });

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#EDE9E6] text-[#5C4F4A] font-sans selection:bg-[#5C766D] selection:text-white">

            {/* LEFT SIDEBAR: Earth/Sage Palette */}
            <div className="w-1/3 max-w-sm bg-white border-r border-[#EDE9E6] p-8 flex flex-col h-full z-10">
                <h1 className="text-2xl font-semibold text-[#5C4F4A] mb-8 tracking-tight shrink-0">Glacier.</h1>

                {statusMessage && (
                    <div className="mb-6 p-3 bg-[#5C766D]/10 text-[#5C766D] border border-[#5C766D]/20 rounded-lg text-sm font-medium shrink-0">
                        {statusMessage}
                    </div>
                )}

                <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-4 shrink-0">Workspaces</h3>

                    <input
                        type="text"
                        placeholder="Filter workspaces..."
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 mb-4 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all shrink-0 placeholder-[#5C4F4A]/70"
                    />

                    <div className="space-y-1 overflow-y-auto flex-1 pr-2 pb-4 scrollbar-hide">
                        {filteredTeams.length === 0 && <p className="text-[#5C4F4A]/50 text-sm">No workspaces found.</p>}
                        {filteredTeams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${selectedTeamId === team.id ? 'bg-[#5C766D] text-white shadow-md' : 'text-[#5C4F4A] hover:bg-[#EDE9E6]'}`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-[#EDE9E6] shrink-0">
                    <h3 className="text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-4">New Workspace</h3>
                    <form onSubmit={handleCreateTeam} className="space-y-3">
                        <input type="text" placeholder="Workspace Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all placeholder-[#5C4F4A]/70" />
                        <textarea placeholder="Optional description..." value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} rows="2" className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all resize-none placeholder-[#5C4F4A]/70" />
                        <button type="submit" className="w-full bg-[#5C4F4A] hover:bg-[#463c38] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">Initialize</button>
                    </form>
                </div>
            </div>

            {/* RIGHT MAIN AREA */}
            <div className="flex-1 flex flex-col p-10 overflow-y-auto">
                <div className="flex justify-end mb-8">
                    <button onClick={handleLogout} className="text-sm font-medium text-[#5C4F4A]/60 hover:text-[#5C4F4A] transition-colors">Log Out</button>
                </div>

                {selectedTeamId ? (
                    <div className="max-w-5xl mx-auto w-full">

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-semibold text-[#5C4F4A] tracking-tight mb-2">
                                    {teams.find(t => t.id === selectedTeamId)?.name || 'Workspace Tasks'}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-[#5C4F4A]/70">
                                    <span className="font-medium">Members:</span>
                                    {teamMembers.length > 0 ? (
                                        <div className="flex gap-2">
                                            {teamMembers.map(m => (
                                                <span key={m.id} className="bg-[#EDE9E6] text-[#5C4F4A] px-2 py-0.5 rounded-md">
                                                    {m.username}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span>Just you</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setIsMemberModalOpen(true)} className="bg-white border border-[#EDE9E6] hover:border-[#C9996B] text-[#5C4F4A] px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
                                    + Invite
                                </button>
                                <button onClick={() => openTaskModal()} className="bg-[#5C766D] hover:bg-[#4a6159] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
                                    New Task
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-[#EDE9E6] rounded-lg text-sm focus:border-[#5C766D] focus:ring-1 focus:ring-[#5C766D] outline-none shadow-sm transition-all placeholder-[#5C4F4A]/70" />
                            <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="px-4 py-2.5 bg-white border border-[#EDE9E6] rounded-lg text-sm focus:border-[#5C766D] focus:ring-1 focus:ring-[#5C766D] outline-none shadow-sm transition-all cursor-pointer text-[#5C4F4A]">
                                <option value="">Anyone</option>
                                {teamMembers.map(member => (
                                    <option key={member.id} value={member.id}>{member.username}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-16"><p className="text-[#5C4F4A]/50">The board is clear.</p></div>
                            ) : null}

                            {filteredTasks.map(task => (
                                <div key={task.id} className={`group bg-white p-5 rounded-xl border flex justify-between items-center transition-all duration-200 ${task.status === 'completed' ? 'border-[#EDE9E6] opacity-60 bg-[#EDE9E6]/30' : 'border-[#EDE9E6] hover:shadow-md hover:border-[#5C766D]/30'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className={`text-base font-semibold text-[#5C4F4A] ${task.status === 'completed' ? 'line-through text-[#5C4F4A]/50' : ''}`}>{task.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${task.status === 'completed' ? 'bg-[#EDE9E6] text-[#5C4F4A]/60' : 'bg-[#5C766D]/10 text-[#5C766D]'}`}>
                                                {task.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-[#5C4F4A]/70 text-sm mb-3 max-w-2xl">{task.description}</p>
                                        <span className="inline-flex items-center text-xs font-medium text-[#5C4F4A]/80 bg-[#EDE9E6]/80 px-2.5 py-1 rounded-md">
                                            {getAssigneeName(task.assigned_to)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {task.status !== 'completed' && (
                                            <>
                                                <button onClick={() => openTaskModal(task)} className="p-2 text-[#5C4F4A]/60 hover:text-[#5C766D] bg-white hover:bg-[#5C766D]/10 rounded-lg transition-colors border border-transparent hover:border-[#5C766D]/20" title="Edit Task">
                                                    ✎
                                                </button>
                                                <button onClick={() => handleQuickStatusUpdate(task, 'completed')} className="p-2 text-[#5C4F4A]/60 hover:text-[#5C766D] bg-white hover:bg-[#5C766D]/10 rounded-lg transition-colors border border-transparent hover:border-[#5C766D]/20" title="Mark Done">
                                                    ✓
                                                </button>
                                            </>
                                        )}

                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-[#5C4F4A]/60 hover:text-[#C9996B] bg-white hover:bg-[#C9996B]/10 rounded-lg transition-colors border border-transparent hover:border-[#C9996B]/30" title="Delete">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#5C4F4A]/40">
                        <div className="w-16 h-16 mb-6 rounded-2xl bg-[#EDE9E6] flex items-center justify-center">
                            <span className="text-2xl text-[#5C4F4A]/30">⌘</span>
                        </div>
                        <h3 className="text-xl font-medium text-[#5C4F4A]/60 mb-2">No Workspace Selected</h3>
                        <p className="text-sm">Choose a workspace from the sidebar to begin.</p>
                    </div>
                )}
            </div>

            {/* TASK (CREATE/EDIT) MODAL */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-[#5C4F4A]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#EDE9E6]">
                        <h2 className="text-xl font-semibold text-[#5C4F4A] mb-6">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                        <form onSubmit={handleSubmitTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-1.5">Title</label>
                                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-1.5">Details</label>
                                <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows="3" className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-1.5">Assignee</label>
                                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all text-[#5C4F4A]">
                                    <option value="">Unassigned</option>
                                    {teamMembers.map(member => (
                                        <option key={member.id} value={member.id}>{member.username}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeTaskModal} className="flex-1 bg-[#EDE9E6] hover:bg-[#dfd7d0] text-[#5C4F4A] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-[#5C766D] hover:bg-[#4a6159] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm">{editingTask ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MEMBER MODAL */}
            {isMemberModalOpen && (
                <div className="fixed inset-0 bg-[#5C4F4A]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#EDE9E6]">
                        <h2 className="text-xl font-semibold text-[#5C4F4A] mb-2">Invite Colleague</h2>
                        <p className="text-[#5C4F4A]/70 text-sm mb-6">Add a registered user to this workspace.</p>

                        {memberStatusMessage && (
                            <div className="mb-6 p-3 bg-[#C9996B]/10 text-[#5C4F4A] border border-[#C9996B]/30 rounded-lg text-sm font-medium">
                                {memberStatusMessage}
                            </div>
                        )}

                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#5C4F4A]/60 uppercase tracking-widest mb-1.5">Email Address</label>
                                <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required placeholder="colleague@example.com" className="w-full px-4 py-2.5 bg-[#EDE9E6]/30 border border-[#EDE9E6] rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#5C766D] focus:border-[#5C766D] outline-none transition-all placeholder-[#5C4F4A]/70" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setIsMemberModalOpen(false); setMemberStatusMessage(''); setNewMemberEmail(''); }} className="flex-1 bg-[#EDE9E6] hover:bg-[#dfd7d0] text-[#5C4F4A] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-[#5C4F4A] hover:bg-[#463c38] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;