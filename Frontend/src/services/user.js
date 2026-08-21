import api from './api.js';

export async function createUser(username, email, password, hours_per_day) {
    const response = await api.post("/user/", {
        username : username,
        email : email,
        password : password,
        hours_per_day : hours_per_day
    });
    return response.data;
}

export async function getUserDetails() {
    const response = await api.get(`/user/`);
    return response.data;
}

export async function updateUserDetails(username, email, password, hours_per_day) {
    const response = await api.put(`/user/`, {
        username : username,
        email : email,
        password : password,
        hours_per_day : hours_per_day
    });
    return response.data;
}

export async function deleteUser() {
    const response = await api.delete(`/user/`);
    return response.data;
}