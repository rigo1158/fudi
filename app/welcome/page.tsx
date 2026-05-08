import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'

export default async function WelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <h1 className="text-5xl font-bold tracking-tight text-orange-500 mb-12">
          fudi
        </h1>

        {/* Welcome card */}
        <div className="rounded-2xl bg-orange-50 px-8 py-10 mb-8">
          <div className="mb-4 text-5xl">👋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-sm text-gray-500 break-all">{user.email}</p>
        </div>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 active:scale-[0.98]"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
