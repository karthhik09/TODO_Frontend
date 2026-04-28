// Task List Component

import React from 'react';
import TaskItem from './taskitem';

function TaskList({ tasks, darkMode, onToggle, onDelete, onUpdate }) {
    // If there are no tasks
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Empty as my motivation on Tuesday :)
                    <br />
                    Let's start adding stuff!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}

export default TaskList;