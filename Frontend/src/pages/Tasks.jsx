import { useState, useEffect } from 'react';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import SidePanel from '../components/SidePanel.jsx';
import MainPanel from '../components/MainPanel.jsx';
import LoadingPage from '../components/LoadingPage.jsx';
import ModuleBar from '../components/ModuleBar.jsx';
import TaskDropdown from '../components/TaskDropdown.jsx';

import { getAllModules } from '../services/modules.js';
import { createTask, getAllTasks } from '../services/tasks.js';

export default function Tasks() {
    const [moduleId, setModuleId] = useState(null);
    const [taskName, setTaskName] = useState("");
    const [dueDate, setDueDate] = useState(null);
    const [dueTime, setDueTime] = useState(null);

    const [allTasks, setAllTasks] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const moduleData = await getAllModules();
                setModules(moduleData);
                if (moduleData.length > 0) {
                    setModuleId(moduleData[0].module_id);
                }

                const taskData = await getAllTasks();
                setAllTasks(taskData);
            } catch (err) {
                console.log(err.response?.data?.detail ?? "Something unexpected happened");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    async function AddTask(e) {
        e.preventDefault();
        try {
            const newTask = await createTask(
                moduleId,
                taskName,
                dueDate ? dueDate.format("YYYY-MM-DD") : null,
                dueTime ? dueTime.format("HH:mm:ss") : null
            );
            setAllTasks(prevTasks => [...(prevTasks || []), newTask]);
            setTaskName("");
            setShowAddTask(false);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to add task");
        }
    };

    function handleTaskUpdated(updatedTask) {
        setAllTasks(prevTasks =>
            prevTasks.map(t => (t.task_id === updatedTask.task_id ? updatedTask : t))
        );
    };

    function handleTaskDeleted(taskId) {
        setAllTasks(prevTasks => prevTasks.filter(t => t.task_id !== taskId));
    };

    function handleSubtaskUpdated(updatedSubtask) {
        setAllTasks(prevTasks => prevTasks.map(task => {
            if (task.task_id === updatedSubtask.task_id && task.subtasks) {
                return {...task, subtasks: task.subtasks.map(s => s.subtask_id === updatedSubtask.subtask_id ? updatedSubtask : s)};
            }
            return task;
        }))
    };

    const visibleTasks = allTasks
        ? (selectedModuleId === null
            ? allTasks
            : allTasks.filter(task => task.module_id === selectedModuleId))
        : null;

    if (isLoading) return <LoadingPage />;

    return (
        <div className="flex h-screen bg-white">
            <SidePanel />
            <MainPanel heading="Tasks">
                <ModuleBar
                    modules={modules}
                    allTasks={allTasks}
                    selectedModuleId={selectedModuleId}
                    onSelect={setSelectedModuleId}
                    addTask={() => setShowAddTask(true)}
                />

                {/* Add Task Form */}
                {showAddTask && (
                    <div className="bg-white mx-5 mt-4 border border-[#bcc1ba] rounded-xl p-5">
                        <h1 className="font-mono text-[#13373F] mb-2">NEW TASK</h1>
                        <form onSubmit={AddTask} className="flex flex-col gap-6 justify-center p-2">
                            <div className="flex flex-row gap-6">
                                <input
                                    required
                                    id="taskName"
                                    className="w-1/2 h-12 border-2 rounded-xl border-[#345259] bg-[#F5F5F4] px-2 text-sm"
                                    placeholder="Task name..."
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                />

                                <select
                                    name="selectedModule"
                                    value={moduleId ?? ''}
                                    className="w-1/2 h-12 border-2 rounded-xl border-[#345259] bg-[#F5F5F4] px-2 text-sm"
                                    onChange={(e) => setModuleId(Number(e.target.value))}
                                >
                                    {modules.map(m => (
                                        <option key={m.module_id} value={m.module_id}>{m.module_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-row gap-6">
                                <DatePicker
                                    label="dd/mm/yyyy"
                                    className="flex-1"
                                    format="DD/MM/YYYY"
                                    value={dueDate}
                                    onChange={(newValue) => setDueDate(newValue)}
                                />
                                <TimePicker
                                    label="--/--"
                                    className="flex-1"
                                    value={dueTime}
                                    onChange={(newValue) => setDueTime(newValue)}
                                />
                            </div>

                            <div className="flex flex-row justify-end gap-4">
                                <button
                                    type="button"
                                    className="border border-[#bcc1ba] text-[#646B61] hover:text-[#A1A89F] rounded-xl px-2 py-1"
                                    onClick={() => setShowAddTask(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#215561] hover:bg-[#21606E] border rounded-xl text-white font-semibold px-2 py-1"
                                >
                                    Add task
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Task List */}
                <div className="flex flex-col w-full mt-4 gap-3 px-5 pb-5">
                    {visibleTasks && visibleTasks.map(task => (
                        <TaskDropdown
                            key={task.task_id}
                            task={task}
                            modules={modules}
                            onTaskUpdated={handleTaskUpdated}
                            onTaskDeleted={handleTaskDeleted}
                            onSubtaskUpdated={handleSubtaskUpdated}
                        />
                    ))}
                </div>
            </MainPanel>
        </div>
    );
}