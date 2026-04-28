// Dashboard Page

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Footer from '../components/footer';
import TaskList from '../components/tasklist';
import SubscriptionModal from '../components/SubscriptionModal';
import useGreeting from '../hooks/greetings';
import { tasksAPI, subscriptionAPI } from '../services/api';
import { LuAlarmClock, LuCrown } from 'react-icons/lu';

function DashboardPage({ darkMode, onNavigate, sidebarOpen, setSidebarOpen, currentUser, setCurrentUser }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [addingTask, setAddingTask] = useState(false);

    const [showReminderFields, setShowReminderFields] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const greeting = useGreeting(currentUser?.name);

    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser?.token) {
            fetchTasks();
            // Re validate isPremium
            subscriptionAPI.getStatus().then(status => {
                if (status.isPremium !== currentUser.isPremium) {
                    const updatedUser = { ...currentUser, isPremium: status.isPremium };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                }
            }).catch(console.error);
        }
    }, [currentUser?.token]);

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const tasksData = await tasksAPI.getTasks();
            const mappedTasks = tasksData.map(task => ({
                id: task.taskId,
                title: task.title,
                status: task.status,
                dueDateTime: task.dueDateTime
            }));
            setTasks(mappedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add task
    const addTask = async () => {
        if (newTask.trim()) {
            try {
                setAddingTask(true);
                setError('');

                const taskData = { title: newTask.trim(), status: false };

                let effectiveDueTime = dueTime;
                if (dueDate && !dueTime) {
                    effectiveDueTime = '00:00';
                }

                if (dueDate && effectiveDueTime) {
                    taskData.dueDateTime = `${dueDate}T${effectiveDueTime}`;
                }

                const task = await tasksAPI.addTask(taskData.title, taskData.status, taskData.dueDateTime);

                setTasks([...tasks, { id: task.taskId, title: task.title, status: task.status, dueDateTime: task.dueDateTime }]);
                setNewTask(''); setDueDate(''); setDueTime(''); setShowReminderFields(false);

            } catch (err) {
                if (err.response?.status === 402 || err.response?.data?.message?.includes('Free tier limit')) {
                    setShowSubscriptionModal(true);
                } else {
                    console.error('Error adding task:', err.response?.data?.message || err.message);
                    setError(`Failed to add task: ${err.response?.data?.message || err.message}`);
                }
            } finally {
                setAddingTask(false);
            }
        }
    };

    // Toggle task
    const toggleTask = async (id) => {
        try {
            await tasksAPI.toggleTask(id);
            setTasks(tasks.map((task) => task.id === id ? { ...task, status: !task.status } : task));
        } catch (err) {
            console.error('Error toggling task:', err);
        }
    };

    // Delete Task
    const deleteTask = async (id) => {
        try {
            await tasksAPI.deleteTask(id);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    // Update Task
    const updateTask = async (id, newTitle, dueDateTime) => {
        try {
            const taskToUpdate = tasks.find(t => t.id === id);
            await tasksAPI.updateTask(id, newTitle, taskToUpdate.status, dueDateTime);
            setTasks(tasks.map(task =>
                task.id === id ? { ...task, title: newTitle, dueDateTime } : task
            ));
        } catch (err) {
            console.error('Update failed:', err);
        }
    };
    const getFilteredTasks = () => {
        if (filter === 'active') return tasks.filter((t) => !t.status);
        if (filter === 'completed') return tasks.filter((t) => t.status);
        return tasks;
    };

    const hitTaskLimit = tasks.length >= 5 && !currentUser?.premium && !currentUser?.isPremium;

    return (
        <>
            <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-1">
                    {/* Pass setCurrentUser to Sidebar so logout clears in memory state */}
                    <Sidebar
                        darkMode={darkMode}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        currentPage="dashboard"
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        onNavigate={(page) => {
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                            onNavigate(page);
                        }}
                    />

                    <div className={`flex-1 flex flex-col transition-all duration-300`}>
                        <div className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${sidebarOpen ? 'pl-4' : 'pl-24'} lg:pl-8`}>
                            <div className="max-w-5xl mx-auto">
                                <div className="flex items-center justify-end">
                                    {/* Subscription button */}
                                    <button
                                        onClick={() => setShowSubscriptionModal(true)}
                                        title={currentUser?.isPremium ? 'Premium Active' : 'Go Premium'}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all mb-8 ${currentUser?.isPremium
                                            ? 'text-yellow-500 border border-yellow-400 bg-yellow-50'
                                            : darkMode
                                                ? 'text-gray-300 border border-gray-600 hover:border-blue-400 hover:text-blue-400'
                                                : 'text-gray-600 border border-gray-300 hover:border-blue-600 hover:text-blue-600'
                                            }`}
                                    >
                                        <LuCrown className="text-lg" />
                                        <span className="hidden sm:inline">{currentUser?.isPremium ? 'Premium' : 'Upgrade'}</span>
                                    </button>
                                </div>

                                <h1 className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-12" style={{ color: darkMode ? '#FFFFFF' : '#1F41BB' }}>
                                    {greeting}
                                </h1>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <div className="max-w-3xl mx-auto">
                                    <h2 className={`text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        My Tasks
                                    </h2>

                                    {/* Add task section */}
                                    {hitTaskLimit ? (
                                        // If user hits limit
                                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'} text-center shadow-sm mb-4`}>
                                            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                You've reached your free limit!
                                            </h3>
                                            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Free accounts are limited to 5 active tasks. Upgrade to Premium to unlock unlimited tasks.
                                            </p>
                                            <button
                                                onClick={() => setShowSubscriptionModal(true)}
                                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg shadow-md transition-all"
                                            >
                                                Upgrade to Premium
                                            </button>
                                        </div>
                                    ) : (
                                        // If user is under limit
                                        <div className={`p-4 rounded-xl shadow-sm mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newTask}
                                                    onChange={(e) => setNewTask(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                                    placeholder="What needs to be done?"
                                                    className={`flex-1 px-4 py-3 rounded-lg border ${darkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                                />
                                                <button
                                                    onClick={() => setShowReminderFields(!showReminderFields)}
                                                    className={`px-4 py-3 font-semibold rounded-lg transition-all ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                                    aria-label="Set reminder"
                                                >
                                                    {showReminderFields ? '−' : <LuAlarmClock className="text-xl" />}
                                                </button>
                                                <button
                                                    onClick={addTask}
                                                    disabled={addingTask}
                                                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50`}
                                                >
                                                    {addingTask ? 'Adding...' : 'Add'}
                                                </button>
                                            </div>

                                            {/* The date time picker */}
                                            {showReminderFields && (
                                                <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                                                            <input
                                                                type="date"
                                                                id="due-date"
                                                                name="dueDate"
                                                                value={dueDate}
                                                                onChange={(e) => setDueDate(e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                                                                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Time</label>
                                                            <input
                                                                type="time"
                                                                id="due-time"
                                                                name="dueTime"
                                                                value={dueTime}
                                                                onChange={(e) => setDueTime(e.target.value)}
                                                                style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                                                                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Filters */}
                                    <div className="flex justify-start gap-4 mb-6 px-2 text-sm lg:text-base">
                                        <button onClick={() => setFilter('all')} className={`transition-colors ${filter === 'all' ? darkMode ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold' : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
                                        <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                                        <button onClick={() => setFilter('active')} className={`transition-colors ${filter === 'active' ? darkMode ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold' : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Active</button>
                                        <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                                        <button onClick={() => setFilter('completed')} className={`transition-colors ${filter === 'completed' ? darkMode ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold' : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Completed</button>
                                    </div>

                                    {loading ? (
                                        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading tasks...</div>
                                    ) : (
                                        <TaskList tasks={getFilteredTasks()} darkMode={darkMode} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <Footer darkMode={darkMode} />
                    </div>
                </div>
            </div>

            {/* Subscription modal */}
            {showSubscriptionModal && (
                <SubscriptionModal
                    darkMode={darkMode}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    onClose={() => setShowSubscriptionModal(false)}
                />
            )}
        </>
    );
}

export default DashboardPage;