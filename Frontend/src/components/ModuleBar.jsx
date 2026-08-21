function ModuleButton({ moduleId, moduleName, numTasks, isSelected, onSelect }) {
    const colours = ["#55a4bb", "#8b69ca", "#e1844b", "#47b280", "#ccb265", "#d55c75"];
    const colour = moduleId === null ? "#215561" : colours[moduleId % colours.length];

    return (
        <button
            onClick={() => onSelect(moduleId)}
            className={`h-8 text-white text-xs font-semibold px-3 py-1 rounded-full items-center transition-opacity ${isSelected ? "opacity-100" : "opacity-50"}`}
            style={{ background: colour }}
        >
            {moduleName}
            <span className="text-xs ml-3">{numTasks}</span>
        </button>
    );
}

export default function ModuleBar({ modules, allTasks, selectedModuleId, onSelect, addTask }) {
    const totalTasks = allTasks ? allTasks.length : 0;

    function countForModule(moduleId) {
        if (!allTasks) return 0;
        return allTasks.filter(task => task.module_id === moduleId).length;
    }

    return (
        <div className="w-full h-14 bg-white border-b-2 border-gray-300">
            <header className="flex flex-row w-full h-full items-center">
                <div className="flex flex-row flex-1 h-full mx-5 gap-4 justify-start items-center">
                    <ModuleButton
                        moduleId={null}
                        moduleName="All tasks"
                        numTasks={totalTasks}
                        isSelected={selectedModuleId === null}
                        onSelect={onSelect}
                    />
                    {modules && modules.map(m => (
                        <ModuleButton
                            key={m.module_id}
                            moduleId={m.module_id}
                            moduleName={m.module_name}
                            numTasks={countForModule(m.module_id)}
                            isSelected={selectedModuleId === m.module_id}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
                <button className="h-8 flex gap-2 whitespace-nowrap bg-[#215561] hover:bg-[#21606E] border rounded-2xl text-sm text-white font-semibold mr-5 px-3 py-1 transition-colors" onClick={addTask}>
                    <span className="text-lg leading-none">+</span>Add task
                </button>
            </header>
        </div>
    );
}