export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'
import PostsGrid from '@/app/components/PostsGrid'
import BottomNav from '@/app/components/BottomNav'
import FollowSheet from '@/app/components/FollowSheet'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/setup')

  const { data: posts } = await supabase
    .from('posts')
    .select('id, image_url, location, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-orange-500">fudi</h1>
        <form action={signOut}>
          <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 transition">Sign out</button>
        </form>
      </div>

      {/* Profile header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-gray-900 truncate">{profile.display_name}</p>
              <Link href="/profile/edit" className="text-xs text-orange-500 font-medium flex-shrink-0">Edit</Link>
            </div>
            {profile.bio ? (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{profile.bio}</p>
            ) : (
              <Link href="/profile/edit" className="text-sm text-gray-400 mt-0.5 block">Add a bio…</Link>
            )}
          </div>
        </div>

        {/* Stats — tapping followers/following opens a list sheet */}
        <FollowSheet
          currentUserId={user.id}
          postsCount={posts?.length ?? 0}
          followersCount={followersCount ?? 0}
          followingCount={followingCount ?? 0}
        />
      </div>

      <div className="border-t border-gray-100 mb-1" />

      <PostsGrid posts={posts ?? []} currentUserId={user.id} />

      <BottomNav />
    </div>
  )
}
