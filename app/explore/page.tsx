export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import BottomNav from '@/app/components/BottomNav'
import ExploreFeed from './ExploreFeed'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch posts, likes counts, and comment counts separately to avoid join issues
  const { data: posts } = await supabase
    .from('posts')
    .select('id, image_url, location, created_at, user_id')
    .order('created_at', { ascending: false })

  // Get unique user_ids from posts
  const userIds = [...new Set((posts ?? []).map(p => p.user_id))]

  // Fetch profiles, likes counts, and comment counts in parallel
  const [
    { data: profiles },
    { data: likesData },
    { data: commentsData },
    { data: myLikes },
    { data: myFollows },
  ] = await Promise.all([
    userIds.length > 0
      ? supabase.from('profiles').select('id, display_name, avatar_url').in('id', userIds)
      : Promise.resolve({ data: [] }),
    supabase.from('likes').select('post_id'),
    supabase.from('comments').select('post_id'),
    supabase.from('likes').select('post_id').eq('user_id', user.id),
    supabase.from('follows').select('following_id').eq('follower_id', user.id),
  ])

  // Build lookup maps
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const likeCountMap: Record<string, number> = {}
  const commentCountMap: Record<string, number> = {}
  for (const l of likesData ?? []) {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] ?? 0) + 1
  }
  for (const c of commentsData ?? []) {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] ?? 0) + 1
  }

  // Merge into feed items
  const feedPosts = (posts ?? []).map(post => ({
    ...post,
    profiles: profileMap[post.user_id] ?? { display_name: 'Unknown', avatar_url: null },
    likeCount: likeCountMap[post.id] ?? 0,
    commentCount: commentCountMap[post.id] ?? 0,
  }))

  const likedPostIds = (myLikes ?? []).map(l => l.post_id)
  const followingIds = (myFollows ?? []).map(f => f.following_id)

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-orange-500">explore</h1>
      </div>

      <ExploreFeed
        posts={feedPosts}
        likedPostIds={likedPostIds}
        followingIds={followingIds}
        currentUserId={user.id}
      />

      <BottomNav />
    </div>
  )
}
