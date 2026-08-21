import { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Switch from '@mui/material/Switch';

import LoadingPage from '../components/LoadingPage.jsx';
import SidePanel from '../components/SidePanel.jsx';
import MainPanel from '../components/MainPanel.jsx';
import ProfileBox from '../components/ProfileBox.jsx';

import { getUserDetails, updateUserDetails } from '../services/user.js';
import { getAllModules } from '../services/modules.js';
import { getAllTasks } from '../services/tasks.js';
import { getAllSubtasks } from '../services/subtasks.js';
import { useAuth } from '../context/AuthContext.jsx';

function getErrorMessage(err, fallback) {
    const detail = err.response?.data?.detail;
    if (!detail) return fallback;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
    return fallback;
}

export default function Profile() {
    const { logout, isDarkMode, toggleDarkMode } = useAuth();

    const [hoursError, setHoursError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [hoursPerDay, setHoursPerDay] = useState(null);
    const [dateCreated, setDateCreated] = useState(null);
    const [modules, setModules] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [subtasks, setSubtasks] = useState(null);

    const [newHours, setNewHours] = useState(null);
    const [newEmail, setNewEmail] = useState(null);
    const [newUsername, setNewUsername] = useState(null);

    const [showEditHours, setShowEditHours] = useState(false);
    const [showEditEmail, setShowEditEmail] = useState(false);
    const [showEditUsername, setShowEditUsername] = useState(false);
    const [isLoading, setisLoading] = useState(true);

    const [remindersEnabled, setRemindersEnabled] = useState(false);

    // Request Notification Permissions for Task Reminders
    const handleRemindersToggle = async (e) => {
        const checked = e.target.checked;
        if (checked) {
            if ("Notification" in window) {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    setRemindersEnabled(true);
                } else {
                    alert("Notification permissions were denied by your browser.");
                    setRemindersEnabled(false);
                }
            } else {
                alert("This browser does not support desktop notifications.");
            }
        } else {
            setRemindersEnabled(false);
        }
    };

    const dataset = modules?.map(module => {
        const moduleTasks = tasks?.filter(
            task => task.module_id === module.module_id
        ) ?? [];

        return {
            module: module.module_name,
            total: moduleTasks.length,
            complete: moduleTasks.filter(
                task => task.completed
            ).length
        };
    }) ?? [];

    useEffect(() => {
        async function loadPage() {
            try {
                const [user, modules, tasks, subtasks] = await Promise.all([
                    getUserDetails(), getAllModules(), getAllTasks(), getAllSubtasks()
                ]);

                setUsername(user.username);
                setEmail(user.email);
                setHoursPerDay(user.hours_per_day);
                setDateCreated(user.date_created);

                setModules(modules);
                setTasks(tasks);
                setSubtasks(subtasks);

            } catch (err) {
                console.log(err.response?.data?.detail ?? "Something unexpected happened");
            } finally {
                setisLoading(false);
            }
        }

        loadPage();
    }, []);

    const completeTasks = tasks ? tasks.filter(t => t.completed === true) : [];
    const completeSubtasks = subtasks ? subtasks.filter(st => st.completed === true) : [];
    const totalEstimatedHours = subtasks ? subtasks.reduce((sum, st) => sum + st.estimated_hours, 0) : 0;

    async function updateUsername(e) {
        e.preventDefault();
        try {
            await updateUserDetails(newUsername, undefined, undefined, undefined);
            setUsername(newUsername);
            setNewUsername(null);
            setShowEditUsername(false);
        } catch (err) {
            setUsernameError(getErrorMessage(err, "Failed to update username"));
        }
    }

    async function updateEmail(e) {
        e.preventDefault();
        try {
            await updateUserDetails(undefined, newEmail, undefined, undefined);
            setEmail(newEmail);
            setNewEmail(null);
            setShowEditEmail(false);
        } catch (err) {
            setEmailError(getErrorMessage(err, "Failed to update email"));
        }
    }

    async function updateHours(e) {
        e.preventDefault();
        try {
            await updateUserDetails(undefined, undefined, undefined, newHours);
            setHoursPerDay(newHours);
            setNewHours(null);
            setShowEditHours(false);
        } catch (err) {
            setHoursError(getErrorMessage(err, "Failed to update hours"));
        }
    }

    return (
        isLoading ? (
            <LoadingPage />
        ) : (
            <div className='flex h-screen bg-white text-slate-900'>
                <SidePanel />
                <MainPanel heading="Profile">
                    <div className='flex flex-row gap-6 p-6'>  
                        {/* Profile Box */}
                        <div className='flex-[1] flex-col p-6 bg-white border border-[#bcc1ba] rounded-lg shadow-sm'>
                            {/* Username initial */}
                            <div className='flex flex-row w-full justify-center'>
                                <span className='w-16 h-16 text-center content-center bg-[#13373F] border rounded-xl text-4xl text-white font-bold'>
                                    {username ? username[0] : ''}
                                </span> 
                            </div>

                            {/* Username */}
                            <div className='flex w-full justify-center items-center gap-2 cursor-pointer' onClick={() => setShowEditUsername(true)}>
                                { showEditUsername ? (
                                    <div className='flex flex-col'>
                                        <form onSubmit={updateUsername} className='flex flex-row justify-center'>
                                            <input 
                                                required
                                                type="text"
                                                placeholder='New Username...'
                                                className='px-2 my-2 h-8 w-40 bg-[#F5F5F4] border rounded-lg border-[#345259]'
                                                value={newUsername || ''}
                                                onChange={(e) => {setNewUsername(e.target.value); setUsernameError("");}}
                                            />
                                            <button type="button" className='mx-2 text-gray-400 hover:text-gray-600' onClick={(e) => {e.stopPropagation(); setShowEditUsername(false); setNewUsername(""); setUsernameError("")}}>✕</button>
                                        </form>
                                        {usernameError && <p className="text-center text-xs text-red-500">{usernameError}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <span className='text-2xl text-center my-2'>{username}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-[#7F979C] hover:text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                        </svg>
                                    </>
                                )}
                            </div>
                            
                            {/* Email */}
                            { showEditEmail ? (
                                <div className='flex flex-col border-b border-[#bcc1ba]'>
                                    <form onSubmit={updateEmail} className='flex flex-row justify-center'>
                                        <input 
                                            required
                                            type="email"
                                            className='px-2 w-32 h-6 mb-2 bg-[#F5F5F4] border rounded-lg border-[#345259]'
                                            placeholder='New email...'
                                            value={newEmail || ''}
                                            onChange={(e) => {setEmailError(""); setNewEmail(e.target.value)}}
                                        />
                                        <button type="button" className='mx-2 text-gray-400 hover:text-gray-600' onClick={(e) => {e.stopPropagation(); setShowEditEmail(false); setNewEmail(""); setEmailError("")}}>✕</button>
                                    </form>
                                    {emailError && <p className="text-center text-xs text-red-500">{emailError}</p>}
                                </div>
                            ) : (
                                <div className='flex flex-row w-full justify-center items-center gap-2 text-gray-500 pb-3 border-b border-[#bcc1ba] cursor-pointer' onClick={() => setShowEditEmail(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 content-center">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    <span className='text-sm'>{email}</span>
                                </div>
                            )}
                            

                            {/* Some user info */}
                            <div className='flex flex-col gap-2 mt-2'>
                                <div className='flex flex-row justify-between items-center'>
                                    <p className='text-gray-500 text-sm'>Member Since</p>
                                    <p className='text-gray-700 text-sm font-bold'>{dateCreated}</p>
                                </div>
                                <div className='flex flex-row justify-between items-center'>
                                    <p className='text-gray-500 text-sm'>Modules Enrolled</p>
                                    <p className='text-gray-700 text-sm font-bold'>{modules ? `${modules.length}` : "0"}</p>
                                </div>
                                <div className='flex flex-row justify-between items-center'>
                                    <p className='text-gray-500 text-sm'>Hours Per Day</p>
                                    { showEditHours ? (
                                        <form onSubmit={updateHours}>
                                            <input 
                                                type="number"
                                                className='w-16 px-2 border rounded-lg border-[#345259]'
                                                value={newHours || ''}
                                                min="0"
                                                placeholder={hoursPerDay}
                                                onChange={(e) => {setNewHours(e.target.value); setHoursError("")}}
                                            />
                                        </form>
                                    ) : (
                                        <p className='text-gray-700 text-sm font-bold hover:cursor-pointer hover:-translate-y-1' onClick={() => setShowEditHours(true)}>{hoursPerDay}h</p>
                                    )}
                                </div>
                                {hoursError && <p className="text-center text-xs text-red-500">{hoursError}</p>}
                            </div>
                        </div>

                        {/* Statistics Boxes */}
                        <div className='flex-[2] grid grid-cols-2 gap-4 justify-center content-center'>
                            <ProfileBox stat="tasks complete" num={ tasks ? `${completeTasks.length}/${tasks.length}` : "0/0"} subtext={tasks && tasks.length > 0 ? `${Math.round((completeTasks.length / tasks.length)*100)}% done` : "0% done"}/>
                            <ProfileBox stat="subtasks complete" num={ subtasks ? `${completeSubtasks.length}/${subtasks.length}` : "0/0"} subtext={subtasks ? `${subtasks.length - completeSubtasks.length} remaining` : "0 remaining"}/>
                            <ProfileBox stat="estimated hours" num={totalEstimatedHours.toFixed(1)} subtext="total study time"/>
                            <ProfileBox stat="modules active" num={modules ? `${modules.length}` : "0"} subtext={tasks ? `${tasks.length} tasks across all` : "0 tasks across all"}/>
                        </div>
                    </div>

                    {/* Graph of tasks x modules*/}
                    <div className='w-full px-6'>
                        <div className='bg-white border rounded-xl border-[#bcc1ba] shadow-sm p-6'>
                            <h1 className='text-lg text-[#13373F] mb-2'>Tasks by Module</h1>
                            <p className='text-sm text-gray-600 font-thin'>Completed vs total tasks per module</p>
                            <BarChart
                                dataset={dataset}
                                xAxis={[
                                    {scaleType:"band", dataKey:"module"}
                                ]}
                                series={[
                                    {dataKey:"total", label:"Total Tasks", color:"#2A6F84"},
                                    {dataKey:"complete", label:"Completed", color:"#2E7D32"}
                                ]}
                                height={350}
                                borderRadius={8}
                            />
                        </div>
                    </div>
                    
                    {/* Preferences area */}
                    <div className='flex flex-col w-full p-6 gap-6'>
                        <div className='bg-white border rounded-xl border-[#bcc1ba] shadow-sm'>
                            <h1 className='w-full text-lg text-[#13373F] text-left justify-center border-b-2 px-4 py-2'>Preferences</h1>

                            {/* Task reminders */}
                            <div className='flex flex-row w-full justify-between items-center px-4'>
                                <div className='flex flex-row m-2 gap-4'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 border rounded-lg my-2 bg-[#e8f1f3] text-[#215561]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                    <div className='flex flex-col'>
                                        <h2>Task reminders</h2>
                                        <p className='text-sm text-gray-600 font-thin'>Receive notifications before tasks are due</p>
                                    </div>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <p className='text-sm font-semibold text-red-500'>under construction!</p>
                                    <Switch checked={remindersEnabled} onChange={handleRemindersToggle} />
                                </div>
                            </div>

                            {/* Dark mode */}
                            <div className='flex flex-row w-full justify-between items-center px-4'>
                                <div className='flex flex-row m-2 gap-4'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 border rounded-lg my-2 bg-[#e8f1f3] text-[#215561]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                    </svg>
                                    <div className='flex flex-col'>
                                        <h2>Dark Mode</h2>
                                        <p className='text-sm text-gray-600 font-thin'>Switch to a darker colour scheme</p>
                                    </div>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <p className='text-sm font-semibold text-red-500'>under construction!</p>
                                    <Switch checked={isDarkMode} onChange={toggleDarkMode} />
                                </div>
                            </div>
                        </div>  

                        <div className='bg-white border rounded-xl border-[#bcc1ba] shadow-sm'>
                            <h1 className='w-full text-lg text-[#13373F] text-left justify-center border-b-2 px-4 py-2'>Account</h1>

                            <div className='flex flex-row w-full justify-between items-center px-4 py-2'>           
                                <div className='flex flex-col m-2'>
                                    <h2>Sign out of all devices</h2>
                                    <p className='text-sm text-gray-600 font-thin'>Ends your session on this device</p>
                                </div>

                                <button onClick={logout} className='flex flex-row w-24 gap-1 items-center border border-[#aeb2ad] rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-slate-700'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-gray-500 dark:text-gray-300 font-bold ml-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                    </svg>
                                    <p className='text-gray-500 font-semibold'>Sign out</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </MainPanel>
            </div>
        )  
    )
}