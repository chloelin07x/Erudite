
export default function StatisticsBox({ stat, num }) {

    return (
        <div className="flex-1 flex flex-col max-w-40 h-28 bg-white border rounded-lg border-[#bcc1ba] text-center shadow-sm shadow-[#bcc1ba] gap-2">
            <p className="mt-5 text-sm text-[#345259] font-bold font-mono">{stat}</p>
            <p className="text-3xl text-[#13373F] font-semibold font-mono justify-center">{num}</p>
        </div>
    )
}