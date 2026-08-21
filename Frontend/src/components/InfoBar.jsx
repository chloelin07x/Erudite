
export default function InfoBar() {
    return (
        <aside className='w-[34%] bg-[#13373F] flex flex-col'>
            {/* Logo/Title */}
            <div className="flex h-16 flex-row gap-2 items-end justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="size-9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <div className="items-center justify-center">
                    <h1 className="text-wrap font-bold font-sans text-4xl text-white">Erudite</h1>
                </div>
            </div>
            {/* Information */}
            <div className='flex-1 flex flex-col w-full h-full justify-center px-10'>
                <h2 className='text-white text-4xl font-extrabold leading-tight'>Study smarter, not harder.</h2> <br/>
                <p className='text-sm leading-6 text-[#B8C6C9] max-w-md'>Track tasks, manage deadlines, and keep every subject organised - all in one place.</p>
            </div>
            {/* Footer */}
            <div className="text-[#7F979C] text-sm mb-10 ml-10">© 2026 Erudite</div>
        </aside>
    )
}