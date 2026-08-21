import React, { useState, useEffect } from 'react';
import { updateSubtask } from '../services/subtasks';

function priorityBadgeLabel(priority) {
  if (priority <= 3) return "High";
  if (priority <= 7) return "Medium";
  return "Low";
}

export default function EditSubtaskModal({ isOpen, onClose, subtask, onSubtaskUpdated }) {
  if (!isOpen) return null;

  const [description, setDescription] = useState(subtask?.description ?? "");
  const [priority, setPriority] = useState(subtask?.priority ?? 5);
  const [estimatedHours, setEstimatedHours] = useState(subtask?.estimated_hours ?? 1);

  useEffect(() => {
    if (subtask) {
      setDescription(subtask.description ?? "");
      setPriority(subtask.priority ?? 5);
      setEstimatedHours(subtask.estimated_hours ?? 1);
    }
  }, [subtask]);

  async function handleEditSubtask(e) {
    e.preventDefault();

    try {
      // Adjust positional arguments if your updateSubtask backend service uses a different parameter ordering
      const updated = await updateSubtask(
        subtask.subtask_id,
        subtask.task_id,
        Number(priority),
        description,
        Number(estimatedHours),
        subtask.completed,
        subtask.manually_moved ?? false
      );

      if (onSubtaskUpdated) {
        onSubtaskUpdated(updated);
      }
      onClose();
    } catch (err) {
      console.log(err.response?.data?.detail ?? "Failed to update subtask");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Edit Subtask</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none">&times;</button>
        </div>

        <div className="py-4">
          <form onSubmit={handleEditSubtask} className="flex flex-col gap-4 p-2">
            
            {/* Description */}
            <div className="flex flex-col gap-1">
              <label htmlFor="subtaskDesc" className="text-xs font-semibold text-gray-600">Description</label>
              <input
                required
                id="subtaskDesc"
                type="text"
                className="w-full h-10 border border-[#bcc1ba] rounded-lg bg-[#F5F5F4] px-3 text-sm focus:outline-none focus:border-[#345259]"
                placeholder="Subtask description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-row gap-4">
              {/* Priority */}
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="subtaskPriority" className="text-xs font-semibold text-gray-600">Priority</label>
                <select
                  id="subtaskPriority"
                  value={priority}
                  className="h-10 border border-[#bcc1ba] rounded-lg bg-white px-2 text-sm focus:outline-none focus:border-[#345259]"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      {priorityBadgeLabel(p)} ({p})
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Hours */}
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="subtaskHours" className="text-xs font-semibold text-gray-600">Est. Hours</label>
                <input
                  required
                  id="subtaskHours"
                  type="number"
                  min="0"
                  step="0.5"
                  className="h-10 border border-[#bcc1ba] rounded-lg bg-[#F5F5F4] px-3 text-sm focus:outline-none focus:border-[#345259]"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#21606E] rounded-lg hover:bg-[#215561]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}