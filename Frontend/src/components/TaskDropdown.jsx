import { useState, useEffect } from 'react';
import { getTaskSubtasks, updateTask, deleteTask } from '../services/tasks.js';
import { createSubtask, updateSubtask, deleteSubtask } from '../services/subtasks.js';
import { getModuleColour } from '../utils/moduleColour.js';
import EditTaskModal from './EditTaskModal.jsx';
import EditSubtaskModal from './EditSubtaskModal.jsx';

function priorityBadge(priority) {
    if (priority <= 3) return { label: "High", classes: "bg-red-100 text-red-700" };
    if (priority <= 7) return { label: "Medium", classes: "bg-amber-100 text-amber-700" };
    return { label: "Low", classes: "bg-green-100 text-green-700" };
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function formatTime(timeStr) {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
}

export default function TaskDropdown({ task, modules, onTaskUpdated, onTaskDeleted, onSubtaskUpdated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [subtasks, setSubtasks] = useState(null);
    const [showAddSubtask, setShowAddSubtask] = useState(false);

    const [newDescription, setNewDescription] = useState("");
    const [newPriority, setNewPriority] = useState(5);
    const [newHours, setNewHours] = useState(1);

    const [showEditTask, setShowEditTask] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState(false);

    const moduleName = modules?.find(m => m.module_id === task.module_id)?.module_name ?? "";
    const moduleColour = getModuleColour(task.module_id);

    useEffect(() => {
        async function fetchSubtasks() {
            try {
                const data = await getTaskSubtasks(task.task_id);
                setSubtasks(data);
            } catch (err) {
                console.log(err.response?.data?.detail ?? "Failed to load subtasks");
            }
        }
        fetchSubtasks();
    }, [task.task_id]);

    const completedCount = subtasks ? subtasks.filter(s => s.completed).length : 0;
    const totalCount = subtasks ? subtasks.length : 0;

    async function handleToggleTaskCompleted(e) {
        const checked = e.target.checked;
        try {
            const updated = await updateTask(task.task_id, undefined, undefined, undefined, undefined, checked);
            onTaskUpdated(updated);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to update task");
        }
    }

    async function handleDeleteTask() {
        try {
            await deleteTask(task.task_id);
            onTaskDeleted(task.task_id);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to delete task");
        }
    }

    async function handleToggleSubtaskCompleted(subtask_id, checked) {
        try {
            const updated = await updateSubtask(subtask_id, undefined, undefined, undefined, undefined, checked, undefined);
            setSubtasks(prev => prev.map(s => (s.subtask_id === subtask_id ? updated : s)));
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to update subtask");
        }
    }

    async function handleDeleteSubtask(subtask_id) {
        try {
            await deleteSubtask(subtask_id);
            setSubtasks(prev => prev.filter(s => s.subtask_id !== subtask_id));
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to delete subtask");
        }
    }

    async function handleAddSubtask(e) {
        e.preventDefault();
        try {
            const created = await createSubtask(task.task_id, Number(newPriority), newDescription, Number(newHours), false, false);
            setSubtasks(prev => [...prev, created]);
            setNewDescription("");
            setNewPriority(5);
            setNewHours(1);
            setShowAddSubtask(false);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to add subtask");
        }
    }

    function handleSubtaskUpdatedLocal(updatedSubtask) {
        setSubtasks(prev =>
            prev.map(s => (s.subtask_id === updatedSubtask.subtask_id ? updatedSubtask : s))
        );
        if (onSubtaskUpdated) {
            onSubtaskUpdated(updatedSubtask);
        }
    }

    return (
        <div className="w-full bg-white border border-[#bcc1ba] rounded-xl shadow-sm">
            {/* Collapsed row */}
            <div className="group flex items-center gap-3 px-4 py-3">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleToggleTaskCompleted}
                    className="w-5 h-5 rounded-full"
                />

                <div>      
                    <h2 className="font-semibold text-[#13373F]">{task.task_name}</h2>
                </div>

                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: moduleColour, backgroundColor: `${moduleColour}22` }}>
                    {moduleName}
                </span>

                <span className="flex items-center gap-1 text-sm text-[#4B6470]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    {formatDate(task.due_date)}
                </span>

                <span className="flex items-center gap-1 text-sm text-[#4B6470]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {formatTime(task.due_time)}
                </span>

                <span className="text-sm text-[#4B6470]">
                    {completedCount}/{totalCount} subtasks
                </span>

                <button
                    type="button"
                    className="text-sm font-semibold text-[#215561] hover:text-[#21606E]"
                    onClick={() => setShowAddSubtask(true)}
                >
                    + Add subtask
                </button>

                <div className="flex-1" />
                <button type="button" onClick={() => setShowEditTask(true)} className='opacity-0 group-hover:opacity-100 transition-opacity'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-gray-400 transition-transform hover:text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </button>

                <button type="button" onClick={() => setIsOpen(!isOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                        className={`size-5 text-[#4B6470] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                <button
                    type="button"
                    onClick={handleDeleteTask}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4 text-gray-400 hover:text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>

            {/* Edit Task Modal */}
            <EditTaskModal 
                isOpen={showEditTask} 
                onClose={() => setShowEditTask(false)} 
                task={task} 
                modules={modules}
                onTaskUpdated={onTaskUpdated}
            />

            <EditSubtaskModal
                isOpen={Boolean(editingSubtask)}
                onClose={() => setEditingSubtask(null)}
                subtask={editingSubtask}
                onSubtaskUpdated={handleSubtaskUpdatedLocal}
            />

            {/* Add subtask inline form */}
            {showAddSubtask && (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-3 px-4 pb-3">
                    <input
                        required
                        autoFocus
                        type="text"
                        placeholder="Subtask description..."
                        className="flex-1 h-10 border rounded-lg border-[#bcc1ba] bg-[#F5F5F4] px-2 text-sm ml-6"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <div className='flex flex-col'>
                        <label htmlFor='priority' className='text-[10px] text-gray-500'>Priority</label>
                        <select
                            id="priority"
                            className="h-6 border rounded-lg border-[#bcc1ba] bg-white px-2 text-sm"
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value)}
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(p => (
                                <option key={p} value={p}>{priorityBadge(p).label} ({p})</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor='hours' className='text-[10px] text-gray-500'>Est. hours</label>
                        <input
                            required
                            id='hours'
                            type="number"
                            min="0.0"
                            step="0.5"
                            className="w-16 h-5 border rounded-lg border-[#bcc1ba] bg-[#F5F5F4] px-2 text-sm"
                            value={newHours}
                            onChange={(e) => setNewHours(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="text-green-600 hover:text-green-800">✓</button>
                    <button type="button" onClick={() => setShowAddSubtask(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </form>
            )}

            {/* Expanded subtasks */}
            {isOpen && subtasks && (
                <div className="border-t border-[#bcc1ba]">
                    {subtasks.map(subtask => {
                        const badge = priorityBadge(subtask.priority);
                        return (
                            <div key={subtask.subtask_id} className="group flex items-center gap-3 ml-6 px-4 py-2 border-b border-[#eee] last:border-b-0">
                                <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={(e) => handleToggleSubtaskCompleted(subtask.subtask_id, e.target.checked)}
                                    className="w-4 h-4 rounded-full"
                                />
                                <span className="font-medium text-[#13373F]">{subtask.description}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.classes}`}>{badge.label}</span>
                                <span className="flex items-center gap-1 text-sm text-[#4B6470]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    {subtask.estimated_hours}h
                                </span>

                                <div className="flex-1" />
                                <button type="button" onClick={() => setEditingSubtask(subtask)} className='opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-gray-400 transition-transform hover:text-gray-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                                <button type="button" onClick={() => handleDeleteSubtask(subtask.subtask_id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4 text-gray-400 hover:text-red-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}