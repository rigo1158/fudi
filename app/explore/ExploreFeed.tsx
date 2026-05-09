'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

type Profile = { display_name: string; avatar_url: string | null }
type Post = {
  id: string
  image_url: string
  location: string | null
  created_at: string
  user_id: string
  profiles: Profile
  likeCount: number
  commentCount: number
}

type Comment = {
  id: string
  body: string
  created_at: string
  profiles: { display_name: string; avatar_url: string | null }
}

export default function ExploreFeed({
  posts: initialPosts,
  likedPostIds,
  followingIds,
  currentUserId,
}: {
  posts: Post[]
  likedPostIds: string[]
  followingIds: string[]
  currentUserId: string
}) {
  const [liked, setLiked] = useState<Set<string>>(new Set(likedPostIds))
  const [following, setFollowing] = useState<Set<string>>(new Set(followingIds))
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(initialPosts.map(p => [p.id, p.likeCount]))
  )
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  const supabase = createClient()

  async function toggleFollow(userId: string) {
    const isFollowing = following.has(userId)
    setFollowing(prev => { const s = new Set(prev); isFollowing ? s.delete(userId) : s.add(userId); return s })
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId })
    }
  }

  async function toggleLike(postId: string) {
    const isLiked = liked.has(postId)
    // Optimistic update
    setLiked(prev => { const s = new Set(prev); isLiked ? s.delete(postId) : s.add(postId); return s })
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + (isLiked ? -1 : 1) }))

    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId })
    }
  }

  async function openComments(post: Post) {
    setSelectedPost(post)
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, profiles(display_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments((data as unknown as Comment[]) ?? [])
    setLoadingComments(false)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !selectedPost) return
    setCommentLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: selectedPost.id, user_id: currentUserId, body: commentText.trim() })
      .select('id, body, created_at, profiles(display_name, avatar_url)')
      .single()
    if (!error && data) {
      setComments(prev => [...prev, data as unknown as Comment])
      setCommentText('')
    }
    setCommentLoading(false)
  }

  if (initialPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <span className="text-6xl mb-4">🍜</span>
        <p className="text-gray-400 text-sm">No posts yet. Be the first to share!</p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {initialPosts.map(post => (
          <div key={post.id} className="bg-white">
            {/* Post header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative w-9 h-9 rounded-full bg-orange-100 overflow-hidden flex-shrink-0">
                {post.profiles.avatar_url ? (
                  <Image src={post.profiles.avatar_url} alt={post.profiles.display_name} fill className="object-cover" sizes="36px" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-sm">🍽️</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{post.profiles.display_name}</p>
                {post.location && <p className="text-xs text-gray-400">📍 {post.location}</p>}
              </div>
              {post.user_id !== currentUserId && (
                <button
                  onClick={() => toggleFollow(post.user_id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                    following.has(post.user_id)
                      ? 'border-gray-200 text-gray-500'
                      : 'border-orange-500 text-orange-500'
                  }`}
                >
                  {following.has(post.user_id) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-100">
              <Image src={post.image_url} alt={post.location ?? 'Food post'} fill className="object-cover" sizes="100vw" />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-4">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 transition ${liked.has(post.id) ? 'text-red-500' : 'text-gray-400'}`}
              >
                <span className="text-xl">{liked.has(post.id) ? '❤️' : '🤍'}</span>
                <span className="text-sm font-medium">{likeCounts[post.id] ?? 0}</span>
              </button>
              <button
                onClick={() => openComments(post)}
                className="flex items-center gap-1.5 text-gray-400"
              >
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">{post.commentCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comments bottom sheet */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedPost(null)} />
          <div className="relative bg-white rounded-t-2xl flex flex-col max-h-[75vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <p className="text-sm font-bold text-gray-900 px-5 pb-3 border-b border-gray-100">Comments</p>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {loadingComments ? (
                <p className="text-gray-400 text-sm text-center py-4">Loading…</p>
              ) : comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <div className="relative w-7 h-7 rounded-full bg-orange-100 overflow-hidden flex-shrink-0 mt-0.5">
                      {c.profiles?.avatar_url ? (
                        <Image src={c.profiles.avatar_url} alt={c.profiles.display_name} fill className="object-cover" sizes="28px" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-xs">🍽️</span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-900">{c.profiles?.display_name} </span>
                      <span className="text-xs text-gray-700">{c.body}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <form onSubmit={submitComment} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 pb-safe">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentLoading}
                className="text-orange-500 font-semibold text-sm disabled:opacity-40"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
