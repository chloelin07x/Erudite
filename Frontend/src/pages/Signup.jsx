import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import InfoBar from "../components/InfoBar";

import { createUser } from "../services/user.js";

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [hours, setHours] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPass) {
            console.log("Passwords do not match.");
            setError("Passwords do not match.");
            return;
        } 

        try {
            const responseData = await createUser(username, email, password, Number(hours));
            console.log(responseData);
            navigate("/");
        } catch (err) {
            if (err.response == undefined) {
                console.log("Something unexpected happened");
                setError("Something unexpected happened");
            } else if (err.response?.status === 422) {
                console.table(err.response.data.detail);
                const errors = err.response.data.detail;
                setError(errors.map(e => e.msg).join(", "));
            }
            else {
                setError(err.response?.data?.detail ?? "Sign up failed.");
            }
        } 
    }
    return (
        <div className='flex flex-row h-screen overflow-hidden bg-[#F5F5F4]'>
            {/* Info Bar */}
            <InfoBar />
            <div className='flex h-full w-full bg-[#F5F5F4] justify-center items-center overflow-y-auto'>
                <div className='flex-1 flex flex-col w-full max-w-lg gap-2 p-10 my-auto'>
                    <h1 className='text-[#13373F] text-4xl font-bold'>Create an account</h1>
                    <p className='text-[#345259] text-sm mb-4'>Join now to stay on top of your studies.</p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username" className="font-semibold ml-1">Username</label>
                        <input
                            required
                            id="username"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type="text"
                            value={username}
                            onChange={(e) => {setUsername(e.target.value); setError("");}} />
                        
                        <label htmlFor="email" className="font-semibold ml-1">Email</label>
                        <input
                            required
                            id="email"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type = "email"
                            value = {email}
                            onChange = {(e) => {setEmail(e.target.value); setError("");}} />

                        <label htmlFor="hours" className="font-semibold ml-1">Study Hours per Day</label>
                        <input
                            id="hours"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type="number"
                            min="0"
                            value={hours}
                            onChange={(e) => {setHours(e.target.value);
                                                setError("");}} />

                        <label htmlFor='password' className="font-semibold ml-1">Password</label>
                        <input
                            required
                            id="password"
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type = "password"
                            value = {password}
                            onChange = {(e) => {setPassword(e.target.value); setError("");}} />

                        <label htmlFor='confirmpass' className="font-semibold ml-1">Confirm password</label>
                        <input
                            required
                            id='confirmpass'
                            className="w-full h-10 border-2 rounded-xl border-gray-300 mt-1 mb-5 px-2"
                            type = "password"
                            value = {confirmPass}
                            onChange = {(e) => {setConfirmPass(e.target.value); setError("");}} />

                        {error && <p className="text-center text-red-500 mb-2">{error}</p>}
                        <button className="w-full h-12 bg-[#215561] border rounded-lg text-white hover:bg-[#21606E]" type="submit">Create account →</button>
                        <div className="flex flex-row justify-center items-center gap-2 mt-2 mb-2">
                            <p className='text-[#345259] text-sm'>Already have an account?</p>
                            <button type="button" className="text-[#13373F] text-md font-semibold hover:text-[#21606E]" onClick={() => navigate("/")}>Sign in</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}