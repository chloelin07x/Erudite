import React, { useState, useEffect } from 'react';
import { updateTask } from '../services/tasks';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from 'dayjs';

export default function EditTaskModal({ isOpen, onClose, task, modules = [], onTaskUpdated }) {
  if (!isOpen) return null;

  const [taskName, setTaskName] = useState(task?.task_name ?? "");
  const [moduleId, setModuleId] = useState(task ? (task?.module_id) : null);
  const [dueDate, setDueDate] = useState(task?.due_date ? dayjs(task.due_date) : null);
  const [dueTime, setDueTime] = useState(task?.due_time ? dayjs(`1970-01-01T${task.due_time}`) : null);

  useEffect(() => {
    if (task) {
      setTaskName(task.task_name ?? undefined);
      setModuleId(task.module_id ?? modules[0]?.module_id ?? undefined);
      setDueDate(task.due_date ? dayjs(task.due_date) : undefined);
      setDueTime(task.due_time ? dayjs(`1970-01-01T${task.due_time}`) : undefined);
    }
  }, [task, modules]);

  async function handleEditTask(e) {
    e.preventDefault();

    try {
      const formattedDate = dueDate ? dayjs(dueDate).format("YYYY-MM-DD") : undefined;
      const formattedTime = dueTime ? dayjs(dueTime).format("HH:mm:ss") : undefined;

      // Update all fields together in a single API call
      const updated = await updateTask(
        task.task_id,
        moduleId,
        taskName,
        formattedDate,
        formattedTime,
        task.completed
      );

      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
      onClose();
    } catch (err) {
      console.log(err.response?.data?.detail ?? "Failed to update task");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Edit Task: {task?.task_name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none">&times;</button>
        </div>

        <div className="py-4">
          <form onSubmit={handleEditTask} className="flex flex-col gap-6 justify-center p-2">
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
                {modules.map((m) => (
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

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#21606E] rounded-lg hover:bg-[#215561]" >Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}