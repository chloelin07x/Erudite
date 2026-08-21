import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { TaskList } from '../components/TaskList.jsx';
import LoadingPage from '../components/LoadingPage.jsx';

import { getDashboard } from '../services/dashboard.js';
import MainPanel from '../components/MainPanel.jsx';
import SidePanel from '../components/SidePanel.jsx';
import StatisticsBox from '../components/StatisticsBox.jsx';

export default function Dashboard() {
    const [incompleteTasks, setIncompleteTasks]   = useState(null);
    const [tasksDueToday, setTasksDueToday]       = useState(null);
    const [tasksDueThisWeek, setTasksDueThisWeek] = useState(null);

    const [incompleteSubtasks, setIncompleteSubtasks] = useState(null);

    const [totalTasks, setTotalTasks]                     = useState(null);
    const [totalCompleteTasks, setTotalCompleteTasks]     = useState(null);
    const [totalIncompleteTasks, setTotalIncompleteTasks] = useState(null);
    const [totalTasksToday, setTotalTasksToday]           = useState(null);
    const [totalTasksWeek, setTotalTasksWeek]             = useState(null);

    const [totalSubtasks, setTotalSubtasks]                     = useState(null);
    const [totalCompletedSubtasks, setTotalCompletedSubtasks]   = useState(null);
    const [totalIncompleteSubtasks, setTotalIncompleteSubtasks] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getDashboard();
                setIncompleteTasks(data["all_incomplete_tasks"]);
                setTasksDueToday(data["all_tasks_due_today"]);
                setTasksDueThisWeek(data["all_tasks_due_this_week"]);

                setIncompleteSubtasks(data["all_incomplete_subtasks"]);

                setTotalTasks(data["total_tasks"]);
                setTotalCompleteTasks(data["complete_tasks"]);
                setTotalIncompleteTasks(data["incomplete_tasks"]);
                setTotalTasksToday(data["tasks_due_today"]);
                setTotalTasksWeek(data["tasks_due_this_week"]);

                setTotalSubtasks(data["total_subtasks"]);
                setTotalCompletedSubtasks(data["completed_subtasks"]);
                setTotalIncompleteSubtasks(data["incomplete_subtasks"]);
            } catch (err) {
                console.log(err.response?.data?.detail ?? "Failed to load dashboard");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    async function handleToggleTask(taskId, checked) {
        // Update every list that might contain this task — keeps all three in sync
        const applyToggle = (list) =>
            list ? list.map(t => (t.task_id === taskId ? { ...t, completed: checked } : t)) : list;

        setTasksDueToday(prev => applyToggle(prev));
        setTasksDueThisWeek(prev => applyToggle(prev));
        setIncompleteTasks(prev => applyToggle(prev));

        try {
            await api.put(`/tasks/${taskId}`, { completed: checked });
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to update task");
            // Roll back all three lists on failure
            const rollback = (list) =>
                list ? list.map(t => (t.task_id === taskId ? { ...t, completed: !checked } : t)) : list;

            setTasksDueToday(prev => rollback(prev));
            setTasksDueThisWeek(prev => rollback(prev));
            setIncompleteTasks(prev => rollback(prev));
        }
    }

    return (
           isLoading ? (
            <LoadingPage />
        ) : (
            <div className="flex h-screen bg-white">
            {/* Side bar */}
            <SidePanel />

            {/* Main Panel */}
            <MainPanel heading="Dashboard">
                {/* Statistics Row */}
                <div className="flex flex-row flex-wrap w-full gap-5 justify-around mt-4">
                    <StatisticsBox stat="TOTAL TASKS" num={totalTasks}/>
                    <StatisticsBox stat="COMPLETE" num={totalCompleteTasks}/>
                    <StatisticsBox stat="INCOMPLETE" num={totalIncompleteTasks}/>
                    <StatisticsBox stat="DUE TODAY" num={totalTasksToday}/>
                    <StatisticsBox stat="DUE THIS WEEK" num={totalTasksWeek}/>
                    <StatisticsBox stat="SUBTASKS" num={totalSubtasks}/>
                </div>

                {/* Main Box */}
                <div className="flex flex-row flex-wrap h-screen gap-7 mt-4">
                    {/* Left side */}
                    <div className="flex flex-col flex-1 w-full gap-4 ml-7 mb-3">
                        {/* Tasks due Today */}
                        <TaskList title="Due Today" taskList={tasksDueToday} onToggle={handleToggleTask} />
                        {/* Tasks due this Week */}
                        <TaskList title="Due This Week" taskList={tasksDueThisWeek} onToggle={handleToggleTask} />
                    </div>
                    {/* Right Side */}
                    <div className="flex flex-col flex-1 w-full gap-4 mr-7 mb-3">
                        {/* Incomplete Tasks */}
                        <TaskList title="Incomplete Tasks" taskList={incompleteTasks} onToggle={handleToggleTask} stat={totalIncompleteTasks}/>
                    </div>
                </div>
            </MainPanel>
        </div>
    ))
}

function NavItem({ route, text, icon }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === route;

    return (
        <li>
            <button
                onClick={() => navigate(route)}
                className={`w-full flex flex-row items-center justify-left gap-4 py-2 pr-2 font-semibold text-md text-white rounded-xl
                    ${isActive ? "bg-[#21606E]" : "hover:bg-[#215561] hover:border hover:border-[#21606E]"}`}
            >
                {icon}
                <span>{text}</span>
            </button>
        </li>
    );
}