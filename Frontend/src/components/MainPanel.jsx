
export default function MainPanel({children, heading}) {
    return (
        <div className="flex flex-col flex-1 h-screen bg-[#F5F5F4]">
                {/* Heading */}
                <div className="h-16 shrink-0 border-b-2 bg-white border-gray-300">
                    <h1 className="font-bold ml-5 py-3 text-3xl text-[#13373F]">{heading}</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
        </div>
    )
}