export default function AuthError() {
    return (
        <div className="flex flex-col min-h-screen bg-[#030014] text-white overflow-hidden relative items-center justify-center p-6">
            {/* Deep Galaxy Glowing Orbs */}
            <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-rose-700/20 blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-700/10 blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="animate-in fade-in zoom-in duration-500 max-w-md w-full relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_80px_rgba(244,63,94,0.15)] text-center">
                    <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="text-rose-400" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-3">Authentication Failed</h2>
                    <p className="text-gray-400 text-sm mb-8 font-medium">
                        Unable to sign in securely. This usually happens if your session has expired, Microsoft denied access, or you used an invalid account.
                    </p>

                    <a href="/" className="inline-flex w-full h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-700 to-rose-500 px-8 text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                        Return to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
