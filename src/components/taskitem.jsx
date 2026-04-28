// Task Item Component

import React, { useState } from 'react';
import { MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';

function TaskItem({ task, darkMode, onToggle, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDueDateTime, setEditDueDateTime] = useState(task.dueDateTime ? task.dueDateTime.slice(0, 16) : '');

    const handleSave = () => {
        if (editTitle.trim()) {
            onUpdate(task.id, editTitle, editDueDateTime || null);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDueDateTime(task.dueDateTime ? task.dueDateTime.slice(0, 16) : '');
        setIsEditing(false);
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow hover:shadow-md`}
        >
            {isEditing ? (
                // Edit Mode
                <>
                    <div className="flex flex-col flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={task.status}
                                onChange={() => onToggle(task.id)}
                                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                className={`flex-1 px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                    ? 'bg-gray-700 text-white border-gray-600'
                                    : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center pl-8">
                            <input
                                type="datetime-local"
                                value={editDueDateTime}
                                onChange={(e) => setEditDueDateTime(e.target.value)}
                                style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                                className={`px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode
                                    ? 'bg-gray-700 text-white border-gray-600'
                                    : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-2 ml-2 self-start mt-1">
                        <button
                            onClick={handleSave}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            aria-label="Save"
                        >
                            <MdCheck className="text-xl" />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            aria-label="Cancel"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>
                </>
            ) : (
                // View Mode
                <>
                    <div className="flex items-center space-x-3 flex-1">
                        <input
                            type="checkbox"
                            checked={task.status}
                            onChange={() => onToggle(task.id)}
                            className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                        />
                        <div className="flex-1">
                            <span
                                className={`${task.status ? 'line-through opacity-50' : ''} ${darkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                {task.title}
                            </span>
                            {task.dueDateTime && (
                                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Due: {(() => {
                                        const date = new Date(task.dueDateTime);
                                        const day = date.getDate().toString().padStart(2, '0');
                                        const month = date.toLocaleString('en-US', { month: 'short' });
                                        const year = date.getFullYear();
                                        const time = date.toLocaleString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        });
                                        return `${day} ${month} ${year} at ${time}`;
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {/* Edit button */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`p-2 rounded-lg transition-colors ${darkMode
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            aria-label="Edit task"
                        >
                            <MdEdit className="text-xl" />
                        </button>

                        {/* Delete button */}
                        <button
                            onClick={() => onDelete(task.id)}
                            className={`p-2 rounded-lg transition-colors ${darkMode
                                ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                                : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                                }`}
                            aria-label="Delete task"
                        >
                            <MdDelete className="text-xl" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TaskItem;