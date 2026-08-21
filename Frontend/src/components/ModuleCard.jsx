import { useState, useEffect } from 'react';

import { getModuleTasks, updateModule, deleteModule as deleteModuleRequest } from '../services/modules.js';
import { getModuleColour } from '../utils/moduleColour.js';

export default function ModuleCard({ module_name, module_id, onRenamed, onDeleted}) {
    const [tasks, setTasks] = useState(null);
    const [moduleName, setModuleName] = useState(module_name);
    const [showEditName, setShowEditName] = useState(false);

    const colour = getModuleColour(module_id);

    useEffect(() => {
        async function fetchTasks(module_id) {
            try {
                const data = await getModuleTasks(module_id);
                setTasks(data);
            } catch (err) {
                console.log(err.response?.data?.detail ?? `Could not fetch ${module_name}'s task`);
            }
        }
        fetchTasks(module_id);
    }, [module_id]);

    if (!tasks) {
        return <p>Loading...</p>;
    }

    async function editName(e) {
        e.preventDefault();

        try {
            const data = await updateModule(module_id, moduleName);
            console.log(data);
            onRenamed(module_id, moduleName);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to edit module name");
        } finally {
            setShowEditName(false);
        }
    }

    async function deleteModule(e) {
        e.preventDefault();
        try {
            const data = await deleteModuleRequest(module_id);
            console.log(data);
            onDeleted(Number(module_id));
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to delete module");
        }
    }

    const completeTasks = tasks.filter(task => task.completed == true);
    const incompleteTasks = tasks.filter(task => task.completed == false);

    return (
        <div className='group relative border-2 bg-white space-y-2 border-[#bcc1ba] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 min-h-[120px]' style={{borderTop: `6px solid ${colour}`}}>
            <div className="flex items-center justify-between p-2">
                <div className="group/title flex flex-row items-center hover:cursor-pointer" onClick={() => setShowEditName(true)}>
                    { showEditName ? (
                        <form onSubmit={editName} className='flex flex-row'>
                            <input
                                required
                                id="moduleName"
                                className="w-4/5 h-8 border-2 rounded-md border-[#21606E] bg-[#F5F5F4] mt-2 ml-2 px-4"
                                type="text"
                                value={moduleName}
                                onChange={(e) => {setModuleName(e.target.value);}} />
                            <button type="button" className='w-10 h-10 flex mt-1 justify-center items-center text-md text-[#345259]' onClick={(e) => {e.stopPropagation(); setShowEditName(false);}}>✕</button>
                        </form>
                    ) : (
                        <>
                            <h1 style={{ color: colour }} className='p-2 ml-4 text-lg font-semibold hover:opacity-80'>{module_name}</h1>
                            {/* Edit Name */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 opacity-0 group-hover/title:opacity-100 transition-opacity text-[#7F979C] hover:text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                        </>
                    )}
                </div>

                {/* Delete Module */}
                <button className="mr-2" onClick={deleteModule}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4 items-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
    
            <div className="grid grid-cols-3 min-h-[100px] text-center">
                <div>
                    <p className="text-5xl font-bold font-mono text-sky-900">
                        {tasks.length}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Tasks
                    </p>
                </div>
                <div>
                    <p className="text-5xl font-bold font-mono text-green-700">
                        {completeTasks.length}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Complete
                    </p>
                </div>
                <div>
                    <p className="text-5xl font-bold font-mono text-sky-900">
                        {incompleteTasks.length}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Remaining
                    </p>
                </div>
            </div>
        </div>
    )
}