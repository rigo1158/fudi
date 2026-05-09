'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, updateAvatar } from './actions'

export default function EditProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', user.id)
        .single()
      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? null)
      }
    })
  }, [router])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    setError(null)
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await updateAvatar(fd)
    if (result.error) {
      setError(result.error)
      setAvatarPreview(null)
    } else if (result.avatarUrl) {
      setAvatarUrl(result.avatarUrl)
    }
    setUploadingAvatar(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData()
    fd.append('display_name', displayName)
    fd.append('bio', bio)
    const result = await updateProfile(fd)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const currentAvatar = avatarPreview || avatarUrl

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Edit profile</h1>
      </div>

      <div className="px-6 py-8 max-w-sm mx-auto space-y-8">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center cursor-pointer overflow-hidden"
          >
            {currentAvatar ? (
              <Image src={currentAvatar} alt="Avatar" fill className="object-cover" sizes="96px" />
            ) : (
              <span className="text-4xl">🍽️</span>
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded-full">
              <span className="text-white text-xl">📷</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="text-sm text-orange-500 font-medium disabled:opacity-50"
          >
            {uploadingAvatar ? 'Uploading…' : 'Change photo'}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              placeholder="Tell people about yourself…"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/150</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 active:scale-[0.98] transition disabled:opacity-60"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
