import api from './api.js';

export async function createSchedule() {
    const response = await api.post("/schedule/");
    return response.data;
}

export async function createManualSlot(subtask_id, scheduled_date, allocated_hours) {
    const response = await api.post("/schedule/manual", {
        subtask_id: subtask_id,
        scheduled_date: scheduled_date,
        allocated_hours: allocated_hours
    });
    return response.data;
}

export async function getSchedule() {
    const response = await api.get("/schedule/");
    return response.data;
}

export async function updateScheduledSubtask(scheduled_subtask_id, assigned_date, assigned_hours) {
    const response = await api.put(`/schedule/${scheduled_subtask_id}`, {
        assigned_date : assigned_date,
        assigned_hours : assigned_hours
    });
    return response.data;
}

export async function deleteSchedule() {
    const response = await api.delete("/schedule/");
    return response.data;
}

export async function deleteScheduledSlot(scheduled_subtask_id) {
    const response = await api.delete(`/schedule/${scheduled_subtask_id}`);
    return response.data;
}