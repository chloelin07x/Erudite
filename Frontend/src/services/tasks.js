import api from './api.js';

export async function createTask(module_id, task_name, due_date, due_time) {
    const response = await api.post("/tasks/", {
        module_id : module_id,
        task_name : task_name,
        due_date : due_date,
        due_time : due_time
    });
    return response.data;
}

export async function getAllTasks() {
    const response = await api.get("/tasks/");
    return response.data;
}

export async function getTask(task_id) {
    const response = await api.get(`/tasks/${task_id}`);
    return response.data;
}

export async function getTaskSubtasks(task_id) {
    const response = await api.get(`/tasks/${task_id}/subtasks`);
    return response.data;
}

export async function updateTask(task_id, module_id, task_name, due_date, due_time, completed) {
    const response = await api.put(`/tasks/${task_id}`, {
        module_id : module_id,
        task_name : task_name,
        due_date : due_date,
        due_time : due_time,
        completed : completed
    });
    return response.data;
}

export async function deleteTask(task_id) {
    const response = await api.delete(`/tasks/${task_id}`);
    return response.data;
}

