'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { login, verifyOtp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lockTimeLeft, setLockTimeLeft] = useState(0)
  const [requireOtp, setRequireOtp] = useState(false)
  const [otp, setOtp] = useState('')


  useEffect(() => {
    let timer: NodeJS.Timeout
    if (lockTimeLeft > 0) {
      timer = setInterval(() => {
        setLockTimeLeft((prev) => (prev > 1000 ? prev - 1000 : 0))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [lockTimeLeft])

  const formatLockTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockTimeLeft > 0) return

    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)

    if ('error' in result && result.error) {
      if ((result as any).requireOtp) {
        setRequireOtp(true)
        setError(result.error)
        return
      }
      if ((result as any).lockTimeMs) {
        setLockTimeLeft((result as any).lockTimeMs)
      }
      setError(result.error)
      return
    }
    router.push('/dashboard')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockTimeLeft > 0) return

    setLoading(true)
    setError('')
    const result = await verifyOtp(email, otp)
    setLoading(false)

    if ('error' in result && result.error) {
      if ((result as any).lockTimeMs) {
        setLockTimeLeft((result as any).lockTimeMs)
      }
      setError(result.error)
      return
    }
    router.push('/dashboard')
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    const result = await api.resendOtp({ email })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      if ((result as any).lockTimeMs) {
        setLockTimeLeft((result as any).lockTimeMs)
      }
    } else {
      setError('OTP resent to your email.')
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <div className="min-h-screen flex ambient-bg relative overflow-hidden">
      {/* Background blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      {/* Visual brand side */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative z-10 glass-accent border-r border-white/40">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-violet-900 drop-shadow-sm flex items-center gap-3">
            <div className="w-[40px] h-[40px] bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl text-white flex items-center justify-center text-[18px] font-black shadow-lg shadow-purple-500/30">
              ∞
            </div>
            {process.env.WEB_NAME || 'Infilink'}
          </h1>
        </div>
        <div className="max-w-[400px]">
          <h2 className="text-[42px] font-black leading-[1.1] mb-6 text-gray-900 tracking-tight">
            Welcome back to your audience.
          </h2>
          <p className="text-[16px] text-gray-600 font-medium leading-relaxed">
            Monitor your traffic, update your links, and grow your audience all from the most beautiful dashboard on the web.
          </p>
        </div>
        <p className="text-[13px] font-bold text-gray-400">© {new Date().getFullYear()} {process.env.WEB_NAME || 'Infilink'} Technologies.</p>
      </div>

      {/* Auth side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px] glass-card rounded-[32px] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 shadow-2xl shadow-purple-900/5">

          {/* Mobile logo */}
          <div className="lg:hidden w-[48px] h-[48px] bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl text-white flex items-center justify-center text-[22px] font-black shadow-lg shadow-purple-500/30 mb-8 mx-auto">
            ∞
          </div>

          <h2 className="text-[26px] md:text-[30px] font-black text-gray-900 mb-2 tracking-tight">
            {requireOtp ? 'Verify your email' : 'Sign In'}
          </h2>
          <p className="text-[14px] text-gray-500 font-medium tracking-[0.2px] mb-8">
            {requireOtp ? `We sent an OTP to ${email}` : 'Enter your details to access your dashboard.'}
          </p>

          <form onSubmit={requireOtp ? handleVerifyOtp : handleLogin} className="space-y-5">
            {!requireOtp ? (
              <>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  disabled={lockTimeLeft > 0}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  disabled={lockTimeLeft > 0}
                />
              </>
            ) : (
              <Input
                label="OTP Code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                required
                disabled={lockTimeLeft > 0}
                maxLength={6}
              />
            )}

            {error && (
              <p className="text-[13px] font-bold text-red-500">
                {error}
                {lockTimeLeft > 0 && ` Please try again in ${formatLockTime(lockTimeLeft)}.`}
              </p>
            )}

            {/* Sample Button - Functionality Disabled as requested */}
            <Button type="button" variant="purple" full className="mt-4 py-4 text-[15px]" onClick={(e) => { e.preventDefault(); alert("Button is in sample mode and temporarily disabled."); }}>
              {lockTimeLeft > 0 ? `Locked (${formatLockTime(lockTimeLeft)})` : requireOtp ? 'Verify & Login' : 'Login to Dashboard'}
            </Button>

            {!requireOtp && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}

            {requireOtp && (
              <div className="text-center mt-3">
                <button type="button" onClick={handleResendOtp} disabled={loading || lockTimeLeft > 0} className="text-violet-600 text-sm font-bold hover:underline">
                  Resend OTP
                </button>
              </div>
            )}
          </form>

          <p className="text-center text-[13.5px] font-medium text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-violet-700 font-extrabold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
