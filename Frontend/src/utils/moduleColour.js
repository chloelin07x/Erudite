const MODULE_COLOURS = [
    "#55a4bb",
    "#8b69ca",
    "#e1844b",
    "#47b280",
    "#ccb265",
    "#d55c75"
];

export function getModuleColour(moduleId) {
    if (moduleId === null || moduleId === undefined) return "#215561";
    return MODULE_COLOURS[moduleId % MODULE_COLOURS.length];
}