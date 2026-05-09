'use client'

import { useState } from 'react'
import Image from 'next/image'
import { deletePost } from '@/app/welcome/deletePost'

type Post = {
  id: string
  image_url: string
  location: string | null
  created_at: string
}

export default function PostsGrid({ posts, currentUserId }: { posts: Post[]; currentUserId: string }) {
  const [selected, setSelected] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    await deletePost(selected.id, selected.image_url)
    setDeleting(false)
    setSelected(null)
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <span className="text-6xl mb-4">🍜</span>
        <p className="text-gray-400 text-sm">Tap + to share your first food photo</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-1 px-1">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 cursor-pointer active:opacity-80 transition"
            onClick={() => setSelected(post)}
          >
            <Image
              src={post.image_url}
              alt={post.location ?? 'Food post'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
            {post.location && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                <p className="text-white text-xs font-medium truncate">📍 {post.location}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setSelected(null)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-6 pt-5 pb-10 space-y-3">
            {/* Preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
              <Image
                src={selected.image_url}
                alt={selected.location ?? 'Post'}
                fill
                className="object-cover"
                sizes="100vw"
              />
              {selected.location && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-white text-sm font-medium">📍 {selected.location}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl bg-red-50 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-100 active:scale-[0.98] transition disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : '🗑 Delete post'}
            </button>

            <button
              onClick={() => setSelected(null)}
              disabled={deleting}
              className="w-full rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-500 hover:border-gray-300 active:scale-[0.98] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
