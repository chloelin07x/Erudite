
export default function ProfileBox({ stat, num, subtext }) {

    return (
        <div className="flex-1 flex flex-col bg-white border rounded-lg border-[#bcc1ba] text-center shadow-sm shadow-[#bcc1ba] gap-2">
            <p className="mt-5 text-[#345259] font-bold font-mono">{stat}</p>
            <p className="text-3xl text-[#13373F] font-semibold font-mono justify-center">{num}</p>
            <p className="mb-5 text-sm text-[]">{subtext}</p>
        </div>
    )
}