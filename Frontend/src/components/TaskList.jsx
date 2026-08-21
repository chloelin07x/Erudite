import api from '../services/api.js';

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function formatTime(timeStr) {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
}

function TaskRow({ task, onToggle }) {
    return (
        <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f2f9fa] transition-colors">
            <label className="relative flex items-center justify-center w-5 h-5 shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggle(task.task_id, e.target.checked)}
                    className="peer absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="w-5 h-5 rounded-full border-2 border-[#bcc1ba] peer-checked:bg-[#215561] peer-checked:border-[#215561] transition-colors" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                    className="absolute w-3 h-3 hidden peer-checked:block pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            </label>

            <span className={`flex-1 text-sm font-medium truncate ${task.completed ? "line-through text-gray-400" : "text-[#13373F]"}`}>
                {task.task_name}
            </span>

            <span className="flex items-center gap-1 text-xs text-[#4B6470] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {formatDate(task.due_date)}
            </span>

            <span className="flex items-center gap-1 text-xs text-[#4B6470] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {formatTime(task.due_time)}
            </span>
        </div>
    );
}

export function TaskList({ title, taskList, stat, onToggle }) {
    const tasks = taskList || [];

    return (
        <div className="w-full h-full bg-white border-2 rounded-xl border-[#bcc1ba] pt-2 shadow-md shadow-[#bcc1ba] overflow-hidden">
            <div className="flex flex-row justify-between items-center border-b border-[#bcc1ba] px-4 pb-2">
                <h2 className="text-md font-semibold font-mono pt-2">{title}</h2>
                {typeof stat === "number" && (
                    <p className="font-mono text-sm text-[#345259] bg-[#f2f9fa] border rounded-xl px-2 py-1">
                        {stat} remaining
                    </p>
                )}
            </div>
            <div className="flex flex-col gap-0.5 mt-1 px-2 pb-2">
                {tasks.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">Nothing here 🎉</p>
                ) : (
                    tasks.map(task => (
                        <TaskRow key={task.task_id} task={task} onToggle={onToggle} />
                    ))
                )}
            </div>
        </div>
    );
}