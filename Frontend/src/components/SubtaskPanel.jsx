import { useState } from 'react';
import { setToAutoSchedule } from '../services/subtasks.js';
import { getModuleColour } from '../utils/moduleColour.js';

export default function SubtaskPanel({ subtasks, tasks, modules, onClose, onAddSlot, onSubtasksChanged }) {
    const [addingFor, setAddingFor] = useState(null); // subtask_id currently showing the add-slot form
    const [slotDate, setSlotDate] = useState("");
    const [slotHours, setSlotHours] = useState(1);

    function taskFor(subtask) {
        return tasks?.find(t => t.task_id === subtask.task_id);
    }
    function moduleFor(task) {
        return modules?.find(m => m.module_id === task?.module_id);
    }

    async function handleResumeAuto(subtaskId) {
        try {
            await setToAutoSchedule(subtaskId);
            onSubtasksChanged();
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to resume auto-scheduling");
        }
    }

    function submitAddSlot(e, subtaskId) {
        e.preventDefault();
        onAddSlot(subtaskId, slotDate, Number(slotHours));
        setAddingFor(null);
        setSlotDate("");
        setSlotHours(1);
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
            <div className="w-[420px] h-full bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#bcc1ba]">
                    <h2 className="font-semibold text-[#13373F] text-lg">Manage Subtasks</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:font-semibold">✕</button>
                </div>

                <div className="flex flex-col divide-y divide-[#eee]">
                    {subtasks && subtasks.map(subtask => {
                        const task = taskFor(subtask);
                        const module = moduleFor(task);

                        return (
                            <div key={subtask.subtask_id} className="p-4 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[#13373F] text-lg">{subtask.description} 
                                        <span className='text-xs text-gray-600'>{task && ` (${task.due_date} ${task.due_time?.slice(0, 5)})`}</span></span>
                                    <span className="font-bold text-xs text-[#4B6470]">{subtask.estimated_hours}h</span>
                                </div>
                                <div className="text-sm font-semibold" style={{ color: getModuleColour(task?.module_id) }}>
                                    {module?.module_name ?? ""} — <span className="text-black font-normal">{task?.task_name ?? ""}</span>
                                </div>

                                <div className="flex items-center gap-3 mt-2">
                                    {subtask.manually_moved ? (
                                        <button
                                            type="button"
                                            onClick={() => handleResumeAuto(subtask.subtask_id)}
                                            className="text-sm font-semibold text-[#215561] hover:text-[#21606E] hover:-translate-y-1"
                                        >
                                            Resume auto-schedule
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-400">Auto-scheduled</span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setAddingFor(addingFor === subtask.subtask_id ? null : subtask.subtask_id)}
                                        className="text-sm font-semibold text-[#215561] hover:text-[#21606E] hover:-translate-y-1"
                                    >+ Add to calendar</button>
                                </div>

                                {addingFor === subtask.subtask_id && (
                                    <form onSubmit={(e) => submitAddSlot(e, subtask.subtask_id)} className="flex items-center gap-2 mt-2">
                                        <input
                                            required
                                            type="date"
                                            value={slotDate}
                                            onChange={(e) => setSlotDate(e.target.value)}
                                            className="border rounded-lg px-2 py-1 text-xs flex-1"
                                        />
                                        <input
                                            required
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={slotHours}
                                            onChange={(e) => setSlotHours(e.target.value)}
                                            className="border rounded-lg px-2 py-1 text-xs w-16"
                                        />
                                        <button type="submit" className="text-green-600 hover:text-green-800 text-sm">✓</button>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}