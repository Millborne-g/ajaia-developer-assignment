import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { DocsyncLogo } from '@/shared/ui/DocsyncLogo'
import { useSignIn, useSignUp } from '../model/useAuth'

export function AuthForm() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signedUp, setSignedUp] = useState(false)

  const navigate = useNavigate()
  const { signIn, loading: signInLoading, error: signInError } = useSignIn()
  const { signUp, loading: signUpLoading, error: signUpError } = useSignUp()

  const loading = signInLoading || signUpLoading
  const error = tab === 'login' ? signInError : signUpError

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (tab === 'login') {
      const ok = await signIn(email, password)
      if (ok) navigate('/')
    } else {
      const { ok, hasSession } = await signUp(email, password)
      if (!ok) return
      if (hasSession) {
        navigate('/', { replace: true })
      } else {
        setSignedUp(true)
      }
    }
  }

  if (signedUp) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center gap-3 p-4 bg-background">
        <div className="text-5xl text-success w-[72px] h-[72px] rounded-full bg-success/10 flex items-center justify-center">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-foreground font-display">
          Account created!
        </h2>
        <p className="text-muted max-w-[280px] text-sm">
          Check your email to confirm your account, then{' '}
          <button
            type="button"
            className="text-primary bg-transparent border-none cursor-pointer underline text-sm"
            onClick={() => {
              setTab('login')
              setSignedUp(false)
            }}
          >
            sign in
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-3 sm:p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Hero panel */}
        <section className="hidden md:flex flex-col justify-between rounded-2xl border border-border bg-surface shadow-auth p-8 lg:p-10 min-h-[520px]">
          <DocsyncLogo />
          <div className="flex flex-col gap-4 max-w-md">
            <h1 className="font-display text-4xl lg:text-[2.75rem] leading-tight font-semibold text-foreground tracking-tight">
              Write together, in sync.
            </h1>
            <p className="text-muted text-[0.9375rem] leading-relaxed">
              A calm space for notes and drafts — share with your team and keep
              every edit saved automatically.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-subtle/80 p-4 max-w-xs">
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mb-3">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-4/5 rounded bg-border/80" />
              <div className="h-2 w-3/5 rounded bg-border/60" />
              <div className="h-2 w-2/3 rounded bg-border/50" />
            </div>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex flex-col justify-center rounded-2xl border border-border bg-surface shadow-auth p-8 sm:p-10 min-h-[480px]">
          <div className="md:hidden mb-8">
            <DocsyncLogo />
          </div>

          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-muted mb-8">
            {tab === 'login'
              ? 'Sign in to continue to your documents.'
              : 'Start writing in a few seconds.'}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-left"
            noValidate
          >
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={tab === 'signup' ? 6 : undefined}
            />

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center mt-2 h-11 rounded-lg"
            >
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-muted mt-8 text-center">
            {tab === 'login' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  className="text-foreground underline bg-transparent border-none cursor-pointer text-sm p-0"
                  onClick={() => setTab('signup')}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-foreground underline bg-transparent border-none cursor-pointer text-sm p-0"
                  onClick={() => setTab('login')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  )
}
