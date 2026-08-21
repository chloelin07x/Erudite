import { useState, useEffect } from 'react';

import SidePanel from '../components/SidePanel.jsx';
import MainPanel from '../components/MainPanel.jsx';
import LoadingPage from '../components/LoadingPage.jsx';
import SubtaskPanel from '../components/SubtaskPanel.jsx';

import { getSchedule, createSchedule, updateScheduledSubtask, deleteSchedule, deleteScheduledSlot, createManualSlot } from '../services/schedule.js';
import { getAllSubtasks } from '../services/subtasks.js';
import { getAllTasks } from '../services/tasks.js';
import { getAllModules } from '../services/modules.js';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toISODate(d) {
    // avoids UTC off-by-one issues from toISOString
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function buildMonthGrid(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(year, month, 1 - startOffset);

    const days = [];
    for (let i = 0; i < 42; i++) {
        days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    return days;
}

function SlotCard({ slot, onDelete }) {
    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(slot.scheduled_task_id))}
            className="group flex items-center justify-between gap-1 bg-[#e8f1f3] border border-[#215561] rounded-md px-1.5 py-0.5 text-xs cursor-grab active:cursor-grabbing"
        >
            <span className="truncate text-[#13373F] font-medium">{slot.subtask_desc}</span>
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-[#4B6470]">{slot.assigned_hours}h</span>
                <button
                    type="button"
                    onClick={() => onDelete(slot.scheduled_task_id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

function DayCell({ date, isCurrentMonth, isToday, slots, onDrop }) {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const scheduledTaskId = e.dataTransfer.getData("text/plain");
                onDrop(Number(scheduledTaskId), toISODate(date));
            }}
            className={`flex flex-col min-h-[110px] border border-[#e5e7eb] p-1 gap-1 overflow-y-auto
                ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                ${isDragOver ? "bg-[#f2f9fa]" : ""}`}
        >
            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? "bg-[#215561] text-white" : isCurrentMonth ? "text-[#13373F]" : "text-gray-400"}`}>
                {date.getDate()}
            </span>
            {slots.map(slot => (
                <SlotCard key={slot.scheduled_task_id} slot={slot} onDelete={() => onDrop(null, null, slot.scheduled_task_id, true)} />
            ))}
        </div>
    );
}

export default function Calendar() {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const [schedule, setSchedule] = useState(null);
    const [subtasks, setSubtasks] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [modules, setModules] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isRunningScheduler, setIsRunningScheduler] = useState(false);
    const [showSubtaskPanel, setShowSubtaskPanel] = useState(false);

    const [error, setError] = useState('');

    async function loadAll() {
        try {
            const [scheduleData, subtaskData, taskData, moduleData] = await Promise.all([
                getSchedule(), getAllSubtasks(), getAllTasks(), getAllModules()
            ]);
            setSchedule(scheduleData.schedule);
            setSubtasks(subtaskData);
            setTasks(taskData);
            setModules(moduleData);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to load calendar data");
            setError("Failed to load calendar data");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function handleRunScheduler() {
        setError("");
        setIsRunningScheduler(true);
        try {
            const result = await createSchedule();
            setSchedule(result.schedule);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to run scheduler");
            setError("Failed to run scheduler");
        } finally {
            setIsRunningScheduler(false);
        }
    }

    // Handles drag-to-move and delete
    async function handleSlotChange(scheduledTaskId, newDate, deleteId, isDelete) {
        setError("");
        if (isDelete) {
            try {
                await deleteScheduledSlot(deleteId);
                setSchedule(prev => prev.filter(s => s.scheduled_task_id !== deleteId));
            } catch (err) {
                console.log(err.response?.data?.detail ?? "Failed to delete slot");
                setError("Failed to delete slot");
            }
            return;
        }

        if (!scheduledTaskId || !newDate) return;

        // Optimistic move
        setSchedule(prev => prev.map(s =>
            s.scheduled_task_id === scheduledTaskId ? { ...s, assigned_date: newDate } : s
        ));

        try {
            await updateScheduledSubtask(scheduledTaskId, newDate, undefined);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to move slot");
            setError("Failed to move slot");
            loadAll(); // fall back to a full refresh if the move failed
        }
    }

    async function handleAddSlot(subtaskId, scheduledDate, hours) {
        setError("");
        try {
            const created = await createManualSlot(subtaskId, scheduledDate, hours);
            loadAll();
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to add slot");
            setError("Failed to add slot");
        }
    }

    async function handleSubtasksChanged() {
        // called by SubtaskPanel after toggling auto-schedule, so schedule/subtask lists stay fresh
        loadAll();
    }

    async function handleDeleteSchedule() {
        setError("");
        try {
            const data = await deleteSchedule();
            setSchedule([]);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to delete schedule");
            setError("Failed to delete schedule");
        }
    }

    function goToPrevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else { setViewMonth(m => m - 1); }
    }
    function goToNextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else { setViewMonth(m => m + 1); }
    }
    function goToPrevYear() { setViewYear(y => y - 1); }
    function goToNextYear() { setViewYear(y => y + 1); }

    if (isLoading) return <LoadingPage />;

    const gridDays = buildMonthGrid(viewYear, viewMonth);
    const slotsByDate = {};
    (schedule || []).forEach(slot => {
        const key = slot.assigned_date;
        if (!slotsByDate[key]) slotsByDate[key] = [];
        slotsByDate[key].push(slot);
    });

    const todayISO = toISODate(today);

    return (
        <div className="flex h-screen bg-white">
            <SidePanel />
            <MainPanel heading="Calendar">
                <div className="flex flex-col w-full px-5 pb-5 gap-4 mt-3">

                    {/* Controls */}
                    <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                        <button
                            onClick={handleRunScheduler}
                            disabled={isRunningScheduler}
                            className="bg-[#215561] hover:bg-[#21606E] disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-2 text-sm"
                        >
                            {isRunningScheduler ? "Running..." : "Run Auto-Scheduler"}
                        </button>

                        <div className="flex items-center gap-2">
                            <button onClick={goToPrevYear} className="px-2 py-1 border rounded-lg text-sm text-[#4B6470] hover:bg-gray-50">«</button>
                            <button onClick={goToPrevMonth} className="px-2 py-1 border rounded-lg text-sm text-[#4B6470] hover:bg-gray-50">‹</button>
                            <span className="font-semibold text-[#13373F] w-40 text-center">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                            <button onClick={goToNextMonth} className="px-2 py-1 border rounded-lg text-sm text-[#4B6470] hover:bg-gray-50">›</button>
                            <button onClick={goToNextYear} className="px-2 py-1 border rounded-lg text-sm text-[#4B6470] hover:bg-gray-50">»</button>
                        </div>

                        <button
                            onClick={() => setShowSubtaskPanel(true)}
                            className="border border-[#bcc1ba] hover:bg-gray-50 text-[#13373F] font-semibold rounded-xl px-4 py-2 text-sm"
                        >
                            Manage Subtasks
                        </button>
                    </div>

                    {/* Weekday header */}
                    <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#4B6470]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-7 border-l border-t border-[#e5e7eb]">
                        {gridDays.map(date => {
                            const iso = toISODate(date);
                            return (
                                <DayCell
                                    key={iso}
                                    date={date}
                                    isCurrentMonth={date.getMonth() === viewMonth}
                                    isToday={iso === todayISO}
                                    slots={slotsByDate[iso] || []}
                                    onDrop={handleSlotChange}
                                />
                            );
                        })}
                    </div>
                </div>

                {showSubtaskPanel && (
                    <SubtaskPanel
                        subtasks={subtasks}
                        tasks={tasks}
                        modules={modules}
                        onClose={() => setShowSubtaskPanel(false)}
                        onAddSlot={handleAddSlot}
                        onSubtasksChanged={handleSubtasksChanged}
                    />
                )}

                <div className='flex flex-row justify-between mx-6'>
                    <p className='text-red-500 text-sm font-semibold'>{error}</p>
                    <button onClick={handleDeleteSchedule} className='bg-white border rounded-lg border-red-500 text-red-500 font-bold p-2 mb-10'>Delete Schedule</button>
                </div>
            </MainPanel>
        </div>
    );
}