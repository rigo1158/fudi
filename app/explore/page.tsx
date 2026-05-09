export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import BottomNav from '@/app/components/BottomNav'
import ExploreFeed from './ExploreFeed'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all posts — left join on profiles so posts without a profile still appear
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, image_url, location, created_at, user_id,
      profiles(display_name, avatar_url),
      likes(count),
      comments(count)
    `)
    .order('created_at', { ascending: false })

  if (error) console.error('Explore fetch error:', error)

  // Fetch current user's likes and follows
  const [{ data: myLikes }, { data: myFollows }] = await Promise.all([
    supabase.from('likes').select('post_id').eq('user_id', user.id),
    supabase.from('follows').select('following_id').eq('follower_id', user.id),
  ])

  const likedPostIds = (myLikes ?? []).map(l => l.post_id)
  const followingIds = (myFollows ?? []).map(f => f.following_id)

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-orange-500">explore</h1>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ExploreFeed posts={(posts ?? []) as any} likedPostIds={likedPostIds} followingIds={followingIds} currentUserId={user.id} />

      <BottomNav />
    </div>
  )
}
