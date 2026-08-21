import api from './api.js';

export async function login(email, password) {
    const response = await api.post("/login/", {
        email : email,
        password : password
    })

    return response.data;
}

export async function getMe() {
    const response = await api.get("/login/me");
    return response.data;
}