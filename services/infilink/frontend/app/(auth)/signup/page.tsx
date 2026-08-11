'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useState, useEffect, useRef } from 'react'
import ReCAPTCHA from "react-google-recaptcha"

export default function SignupPage() {
  const router = useRouter()
  const { register, verifyOtp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [otp, setOtp] = useState('')
  const [lockTimeLeft, setLockTimeLeft] = useState(0)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setError('Please complete the recaptcha verification.')
      return
    }

    setLoading(true)
    setError('')
    const result = await register({ name, email, password, handle, recaptchaToken }) as any
    recaptchaRef.current?.reset()
    setLoading(false)
    if (result && 'error' in result && result.error) { setError(result.error); return }
    if (result && result.requireOtp) {
      setStep(3);
      return;
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

  const handleGoogleLogin = () => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <div className="min-h-screen flex ambient-bg relative overflow-hidden">
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60vh] bg-violet-500/5 blur-[100px] rounded-full -z-10" />

      <div className="hidden lg:flex w-[45%] flex-col justify-center px-16 relative z-10 glass-accent border-r border-white/40">
        <h1 className="text-[28px] font-black tracking-tight text-violet-900 drop-shadow-sm flex items-center gap-3 absolute top-12 left-12">
          <div className="w-[40px] h-[40px] bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl text-white flex items-center justify-center text-[18px] font-black shadow-lg shadow-purple-500/30">∞</div>
          {process.env.WEB_NAME || 'Infilink'}
        </h1>
        <div className="max-w-[400px]">
          <h2 className="text-[44px] font-black leading-[1.1] mb-6 text-gray-900 tracking-tight">One link to rule them all.</h2>
          <p className="text-[17px] text-gray-600 font-medium leading-relaxed">Join thousands of creators who use {process.env.WEB_NAME || 'Infilink'} to beautifully share their content, grow their audience, and track deep analytics.</p>
          <div className="mt-10 flex -space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-violet-200"></div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-pink-200"></div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-200"></div>
            <div className="w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold shadow-sm">+9k</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[450px] glass-card rounded-[32px] p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-700 shadow-2xl shadow-purple-900/10">

          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-violet-600' : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-violet-600' : 'bg-gray-200'}`} />
          </div>

          <h2 className="text-[28px] md:text-[34px] font-black text-gray-900 mb-2 tracking-tight">
            {step === 1 ? 'Claim your link' : step === 2 ? 'Create an account' : 'Verify Email'}
          </h2>
          <p className="text-[14px] text-gray-500 font-medium tracking-[0.2px] mb-8">
            {step === 1 ? 'Choose an awesome handle for your public page.' : step === 2 ? 'Just a few details to get your page live.' : `We sent a code to ${email}`}
          </p>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : step === 2 ? handleSignup : handleVerifyOtp} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="relative">
                  <span className="absolute left-4 top-[35px] text-gray-400 font-bold select-none">infilink.in/</span>
                  <Input
                    label="Your unique handle"
                    placeholder="myawesomepage"
                    className="pl-[95px] font-bold text-violet-900"
                    value={handle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" variant="purple" full className="mt-4 py-4 text-[15px]">Continue →</Button>

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
                    Sign up with Google
                  </button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <Input label="Full Name" placeholder="Alex Developer" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required autoFocus />
                <Input label="Email Address" type="email" placeholder="you@email.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
                <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
                {error && <p className="text-[13px] font-bold text-red-500">{error}</p>}

                <div className="flex justify-center my-4 overflow-hidden rounded-xl">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    ref={recaptchaRef}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" variant="purple" full loading={loading}>Create Account & Send OTP</Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  label="OTP Code"
                  placeholder="123456"
                  value={otp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                  required
                  autoFocus
                  disabled={lockTimeLeft > 0}
                  maxLength={6}
                />
                {error && (
                  <p className="text-[13px] font-bold text-red-500">
                    {error}
                    {lockTimeLeft > 0 && ` Please wait ${formatLockTime(lockTimeLeft)}.`}
                  </p>
                )}
                <Button type="submit" variant="purple" full loading={loading} disabled={lockTimeLeft > 0}>
                  {lockTimeLeft > 0 ? `Locked (${formatLockTime(lockTimeLeft)})` : 'Verify & Dashboard'}
                </Button>
              </>
            )}
          </form>

          <p className="text-center text-[13.5px] font-medium text-gray-500 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-700 font-extrabold hover:underline">Log in instead</Link>
          </p>
        </div>
      </div>
    </div>
  )
}