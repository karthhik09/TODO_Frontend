// Sidebar Component

import React from 'react';
import { MdChecklist, MdSettings, MdLogout } from 'react-icons/md';
import { FiMenu } from "react-icons/fi";
import { IoClose } from 'react-icons/io5';

function Sidebar({ darkMode, sidebarOpen, setSidebarOpen, currentPage, onNavigate, currentUser, setCurrentUser }) {
    return (
        <>
            {/* Overlay for mobile: Only show when sidebar is expanded */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar: Always visible, changes width based on sidebarOpen */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'
                    } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } min-h-screen border-r shadow-lg`}
            >
                <div className={`${sidebarOpen ? 'p-6' : 'p-4'} transition-all duration-300`}>
                    {/* Hamburger Icon */}
                    <div
                        className={`hamburger mb-6 cursor-pointer hover:opacity-70 transition-opacity ${sidebarOpen ? '' : 'flex justify-center'}`}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <IoClose size={24} className={darkMode ? 'text-white' : 'text-gray-800'} />
                        ) : (
                            <FiMenu size={24} className={darkMode ? 'text-white' : 'text-gray-800'} />
                        )}
                    </div>

                    {/* User Info: only show when expanded */}
                    {sidebarOpen && (
                        <div className={`mb-8 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                            <h2
                                title={currentUser?.name || 'User'}
                                className={`font-bold text-lg mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-800'
                                    }`}
                            >
                                {currentUser?.name || 'User'}
                            </h2>
                            <p
                                title={currentUser?.email || 'user@example.com'}
                                className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                                {currentUser?.email || 'user@example.com'}
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="space-y-3">
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentPage === 'dashboard'
                                ? darkMode
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                : darkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            title={!sidebarOpen ? 'My Tasks' : ''}
                        >
                            <MdChecklist className="text-2xl flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">My Tasks</span>}
                        </button>

                        <button
                            onClick={() => onNavigate('settings')}
                            className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${currentPage === 'settings'
                                ? darkMode
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                : darkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            title={!sidebarOpen ? 'Settings' : ''}
                        >
                            <MdSettings className="text-2xl flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">Settings</span>}
                        </button>

                        {/* Clear persisted user data:
                            Also clear the in memory react state so App.jsx immediately
                            reflects the logged out state without a hard refresh
                        */}
                        <button
                            onClick={() => {
                                localStorage.removeItem('currentUser');
                                setCurrentUser(null);
                                onNavigate('login');
                            }}
                            className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${darkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            title={!sidebarOpen ? 'Logout' : ''}
                        >
                            <MdLogout className="text-2xl flex-shrink-0 text-red-500" />
                            {sidebarOpen && <span className="font-medium text-red-500">Logout</span>}
                        </button>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default Sidebar;