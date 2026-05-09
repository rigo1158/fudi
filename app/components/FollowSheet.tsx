'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

type UserRow = {
  id: string
  display_name: string
  avatar_url: string | null
}

export default function FollowSheet({
  currentUserId,
  postsCount,
  followersCount,
  followingCount,
}: {
  currentUserId: string
  postsCount: number
  followersCount: number
  followingCount: number
}) {
  const [sheet, setSheet] = useState<'followers' | 'following' | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function openSheet(type: 'followers' | 'following') {
    setSheet(type)
    setLoading(true)
    setUsers([])

    if (type === 'followers') {
      // People who follow me: follows.following_id = me → get follower_id profiles
      const { data: rows } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentUserId)

      const ids = (rows ?? []).map(r => r.follower_id)
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', ids)
        setUsers(profiles ?? [])
      }
    } else {
      // People I follow: follows.follower_id = me → get following_id profiles
      const { data: rows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)

      const ids = (rows ?? []).map(r => r.following_id)
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', ids)
        setUsers(profiles ?? [])
      }
    }

    setLoading(false)
  }

  return (
    <>
      {/* Stats row */}
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">{postsCount}</p>
          <p className="text-xs text-gray-400">posts</p>
        </div>
        <button onClick={() => openSheet('followers')} className="text-center">
          <p className="text-base font-bold text-gray-900">{followersCount}</p>
          <p className="text-xs text-gray-400">followers</p>
        </button>
        <button onClick={() => openSheet('following')} className="text-center">
          <p className="text-base font-bold text-gray-900">{followingCount}</p>
          <p className="text-xs text-gray-400">following</p>
        </button>
      </div>

      {/* Bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(null)} />
          <div className="relative bg-white rounded-t-2xl flex flex-col max-h-[70vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <p className="text-sm font-bold text-gray-900 px-5 pb-3 border-b border-gray-100 capitalize">
              {sheet}
            </p>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
              ) : users.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  {sheet === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                </p>
              ) : (
                <ul className="space-y-4">
                  {users.map(u => (
                    <li key={u.id} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex-shrink-0">
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt={u.display_name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-base">🍽️</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{u.display_name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
