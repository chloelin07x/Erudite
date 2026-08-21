import api from '../services/api.js'

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import {login as loginRequest} from '../services/login.js'
import InfoBar from '../components/InfoBar.jsx';

export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const {token, login, logout} = useAuth();

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault(); // Prevent browser from reloading the page on each submit

        try {
            const data = await loginRequest(email, password)
            console.log(data)

            login(data["access_token"]);
            navigate("/dashboard");

        } catch (err) {
            if (err.response == undefined) {
                console.log("Something unexpected happened");
                setError("Something unexpected happened");
            } else {
                // where FastAPI's error detail lives on
                console.log(err.response?.data);
                setError(err.response?.data?.detail ?? "Sign in failed. Please try again.");
            }
        }

    }
    return (
        <div className='flex flex-row h-screen bg-[#F5F5F4]'>
            {/* Info Bar */}
            <InfoBar />

            {/* Login/Sign-in */}
            <div className='flex h-full w-full bg-[#F5F5F4] justify-center items-center'>
                <div className='flex-1 flex-col overflow-y-auto w-full max-w-lg gap-2 p-10'>
                    <h1 className='text-[#13373F] text-4xl font-bold'>Welcome back</h1>
                    <p className='text-[#345259] text-sm mb-4'>Sign in to your account to continue.</p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email" className="font-semibold ml-1">Email:</label>
                        <input
                            required
                            id="email"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type="email"
                            value={email}
                            onChange={(e) => {setEmail(e.target.value); setError("");}} />
                                                
                        <label htmlFor="password" className='font-semibold ml-1'>Password:</label>
                        <input
                            required
                            id="password"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type = "password"
                            value = {password}
                            onChange = {(p) => {setPassword(p.target.value);
                                                setError("");}} />
                        
                        {error && <p className="text-center text-red-500">{error}</p>}
                        <button className="w-full h-12 bg-[#215561] border rounded-lg text-white hover:bg-[#21606E]" type="submit">Sign in →</button>
                        <div className="flex flex-row justify-center items-center gap-2 mt-2 mb-2">
                            <p className='text-[#345259] text-sm'>Don't have an account?</p>
                            <button type="button" className="text-[#13373F] text-md font-semibold hover:text-[#21606E]" onClick={() => navigate("/signup")}>Sign up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}