import { useState, useEffect } from 'react';
import { createModule, getAllModules } from '../services/modules';

import LoadingPage from '../components/LoadingPage';
import SidePanel from '../components/SidePanel';
import MainPanel from '../components/MainPanel';
import ModuleCard from '../components/ModuleCard';

export default function Modules() {
    const [modules, setModules] = useState(null);
    const [moduleName, setModuleName] = useState('');
    const [showAddModule, setShowAddModule] = useState(false);
    const [tasks, setTasks] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        async function fetchModules() {
            try {
                const data = await getAllModules();
                setModules(data);
            } catch (err) {
                console.log(err.response?.data?.detail ?? "Failed to load modules");
            } finally {
                setIsLoading(false);
            }
        }
        fetchModules();
    }, []);
    
    async function addModule(e) {
        e.preventDefault();

        try {
            const newModule = await createModule(moduleName);
            setModules(prevModules => [...prevModules, newModule]);
            setModuleName("");
            setShowAddModule(false);
        } catch (err) {
            console.log(err.response?.data?.detail ?? "Failed to add a module");
            setError(err.response?.data?.detail ?? "Failed to add a module")
        }
    }

    function handleModuleRenamed(module_id, newName) {
        setModules(prevModules =>
            prevModules.map(m =>
                m.module_id === module_id ? { ...m, module_name: newName } : m
            )
        );
    }

    function handleModuleDeleted(module_id) {
        setModules(prevModules =>
            prevModules.filter(m => m.module_id !== module_id)
        );
    }

    return (
        isLoading ? (
            <LoadingPage />
        ) : (
            <div className="flex h-screen bg-white">
                <SidePanel />
                <MainPanel heading="Modules">
                    {/* Modules */}
                    <div className='flex flex-row w-full items-center justify-between px-6 py-1 mt-3'>
                        <p className="text-sm text-[#4B6470]">{modules ? `${modules.length} modules` : "0 modules"}</p>
                        <button className="flex items-center gap-2 bg-[#215561] hover:bg-[#21606E] border rounded-2xl text-sm text-white font-semibold px-3 py-1 transition-colors" onClick={() => setShowAddModule(true)}>
                            <span className="text-lg leading-none">+</span>Add module
                        </button>
                    </div>

                    {error && <p className="text-center text-red-500">{error}</p>}
                    {/* Add Module */}
                    { showAddModule && 
                        <div className="bg-white mx-4 border border-[#bcc1ba] rounded-xl p-5">
                            <form onSubmit={addModule} className="flex items-center gap-4">
                                <input
                                    required
                                    type="text"
                                    className="flex-1 h-10 border-2 rounded-xl border-[#345259] bg-[#F5F5F4] px-2 text-sm"
                                    placeholder='Module name...'
                                    value={moduleName}
                                    onChange={(e) => {setModuleName(e.target.value); setError("");}}
                                />  
                                <button type='submit' className='bg-[#215561] hover:bg-[#21606E] border rounded-xl px-4 h-9 text-white font-semibold'>Add</button>
                                <button type="button" className='w-10 h-10 flex items-center justify-center text-md text-[#345259]' onClick={() => setShowAddModule(false)}>✕</button>
                            </form>
                        </div>
                    }
                    
                    {/* Module Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
                        {modules && modules.map(module => (
                            <ModuleCard
                                key={module.module_id}
                                module_name={module.module_name}
                                module_id={module.module_id}
                                onRenamed={handleModuleRenamed}
                                onDeleted={handleModuleDeleted}
                            />
                        ))}
                    </div>
                </MainPanel>
            </div>
        )
    )
}