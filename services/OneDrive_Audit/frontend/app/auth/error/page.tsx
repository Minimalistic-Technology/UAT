export default function AuthError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Failed</h2>
            <p className="text-slate-500 max-w-md mb-6">
                Unable to sign in with your Microsoft account. Please ensure you are using an account authorized for this application.
            </p>
            <a href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium">
                Try Again
            </a>
        </div>
    );
}
