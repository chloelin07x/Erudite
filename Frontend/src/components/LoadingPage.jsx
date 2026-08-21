export default function LoadingPage() {
    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center text-xl font-mono font-semibold gap-3">
            <img src="../assets/spinner.gif" />
            <h3>Loading your workspace... Please wait</h3>
        </div>
    )
}