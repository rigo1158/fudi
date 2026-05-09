'use client'

import { useState } from 'react'
import { createProfile } from './actions'

export default function SetupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createProfile(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <h1 className="text-5xl font-bold tracking-tight text-orange-500 text-center mb-12">
          fudi
        </h1>

        {/* Card */}
        <div className="rounded-2xl bg-orange-50 px-8 py-10 mb-6">
          <div className="mb-4 text-4xl text-center">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Set up your profile
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            What should we call you?
          </p>

          <form action={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="display_name"
              placeholder="Your name"
              maxLength={32}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 active:scale-[0.98] transition disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
