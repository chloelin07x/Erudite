import api from './api.js';

export async function createSubtask(task_id, priority, description, estimated_hours, completed, manually_moved) {
    const response = await api.post("/subtasks/", {
        task_id : task_id,
        priority : priority,
        description : description,
        estimated_hours : estimated_hours,
        completed : completed,
        manually_moved : manually_moved
    });
    return response.data;
}

export async function getSubtask(subtask_id) {
    const response = await api.get(`/subtasks/${subtask_id}`);
    return response.data;
}

export async function getAllSubtasks() {
    const response = await api.get(`/subtasks/`);
    return response.data;
}

export async function updateSubtask(subtask_id, task_id, priority, description, estimated_hours, completed, manually_moved) {
    const response = await api.put(`/subtasks/${subtask_id}`,{
        task_id : task_id,
        priority : priority,
        description : description,
        estimated_hours : estimated_hours,
        completed : completed,
        manually_moved : manually_moved
    });
    return response.data;
}

export async function deleteSubtask(subtask_id) {
    const response = await api.delete(`/subtasks/${subtask_id}`);
    return response.data;
}

export async function setToAutoSchedule(subtask_id) {
    const response = await api.patch(`/subtasks/${subtask_id}/auto-schedule`);
    return response.data;
}