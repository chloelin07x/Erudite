import api from './api.js';

export async function createModule(module_name) {
    const response = await api.post("/modules/", {module_name : module_name})
    return response.data;
}

export async function getAllModules() {
    const response = await api.get("/modules/");
    return response.data;
}

export async function getModule(module_id) {
    const response = await api.get(`/modules/${module_id}`);
    return response.data;
}

export async function getModuleTasks(module_id) {
    const response = await api.get(`/modules/${module_id}/tasks`);
    return response.data;
}

export async function updateModule(module_id, module_name) {
    const response = await api.put(`/modules/${module_id}`, {
        module_name : module_name
    });
    return response.data;
}

export async function deleteModule(module_id) {
    const response = await api.delete(`/modules/${module_id}`);
    return response.data;
}