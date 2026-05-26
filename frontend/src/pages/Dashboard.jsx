import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]); // NEW: State for members

    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState(''); // NEW: State for assignment
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    // When a team is selected, fetch both its tasks AND its members
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
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        }
    };

    const fetchTasks = async (teamId) => {
        try {
            const response = await api.get(`/tasks/team/${teamId}`);
            setTasks(response.data || []);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    // NEW: Fetch members from our new route
    const fetchTeamMembers = async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}/members`);
            setTeamMembers(response.data || []);
        } catch (err) {
            console.error('Failed to fetch members:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setStatusMessage('');
        try {
            const response = await api.post('/teams', { name: teamName, description: teamDescription });
            setStatusMessage(`Success! Team "${response.data.team.name}" created.`);
            setTeamName('');
            setTeamDescription('');
            fetchTeams();
        } catch (err) {
            setStatusMessage(err.response?.data?.error || 'Error creating team');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedTeamId) return alert('Please select a team first!');
        try {
            // Updated to include assigned_to
            await api.post('/tasks', {
                title: taskTitle,
                description: taskDescription,
                team_id: selectedTeamId,
                assigned_to: assignedTo || null
            });
            setTaskTitle('');
            setTaskDescription('');
            setAssignedTo('');
            fetchTasks(selectedTeamId);
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks(selectedTeamId);
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const handleUpdateStatus = async (task, newStatus) => {
        try {
            await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
            fetchTasks(selectedTeamId);
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // Helper to find the username of the assignee
    const getAssigneeName = (userId) => {
        if (!userId) return 'Unassigned';
        const member = teamMembers.find(m => m.id === userId);
        return member ? member.username : 'Unknown';
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                <h2>Glacier Task Workspace</h2>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Log Out</button>
            </div>

            {statusMessage && (
                <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e2f0d9', color: '#385723', borderRadius: '4px' }}>{statusMessage}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>Select Workspace</h3>
                        <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px' }}>
                            <option value="">-- Choose a Team --</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>Create a Team</h3>
                        <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required style={{ padding: '8px' }} />
                            <textarea placeholder="Description" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} rows="2" style={{ padding: '8px' }} />
                            <button type="submit" style={{ padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
                        </form>
                    </div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                    {selectedTeamId ? (
                        <div>
                            <h3>Team Tasks</h3>
                            <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <input type="text" placeholder="New Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required style={{ flex: 2, padding: '8px', minWidth: '150px' }} />
                                <input type="text" placeholder="Task details..." value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} style={{ flex: 3, padding: '8px', minWidth: '200px' }} />

                                {/* NEW: Assignee Dropdown */}
                                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '120px' }}>
                                    <option value="">Unassigned</option>
                                    {teamMembers.map(member => (
                                        <option key={member.id} value={member.id}>{member.username}</option>
                                    ))}
                                </select>

                                <button type="submit" style={{ flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', minWidth: '100px' }}>Add Task</button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tasks.length === 0 ? <p style={{ color: '#777' }}>No tasks found for this team.</p> : null}
                                {tasks.map(task => (
                                    <div key={task.id} style={{ padding: '15px', backgroundColor: task.status === 'completed' ? '#f8f9fa' : '#f1f3f5', borderRadius: '6px', borderLeft: `5px solid ${task.status === 'completed' ? '#28a745' : '#007bff'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: task.status === 'completed' ? 0.7 : 1 }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h4>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>{task.description}</p>
                                            {/* NEW: Display who is assigned */}
                                            <small style={{ color: '#888', fontWeight: 'bold' }}>👤 {getAssigneeName(task.assigned_to)}</small>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: '12px', fontWeight: 'bold', color: '#495057' }}>
                                                {task.status.toUpperCase()}
                                            </span>
                                            {task.status !== 'completed' && (
                                                <button onClick={() => handleUpdateStatus(task, 'completed')} style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                            )}
                                            <button onClick={() => handleDeleteTask(task.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#777' }}>
                            <h3>No Team Selected</h3>
                            <p>Select a team from the sidebar dropdown or create a new one to view and manage tasks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;