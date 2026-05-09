'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

export default function NewPostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please select a photo')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Upload image to storage
    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    // Insert post record
    const { error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        location: location.trim() || null,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/welcome')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-6 py-12 bg-white">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 mr-4 text-xl"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">New post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Photo picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition overflow-hidden
              ${preview ? 'border-transparent' : 'border-gray-200 hover:border-orange-300 bg-gray-50'}`}
          >
            {preview ? (
              <div className="relative w-full h-full">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            ) : (
              <>
                <span className="text-4xl mb-3">📷</span>
                <span className="text-sm text-gray-400">Tap to add a photo</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Location */}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Restaurant or location (optional)"
            maxLength={80}
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 active:scale-[0.98] transition disabled:opacity-40"
          >
            {loading ? 'Posting…' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  )
}
