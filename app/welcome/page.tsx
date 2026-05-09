import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'
import PostsGrid from '@/app/components/PostsGrid'

export default async function WelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/setup')
  }

  // Fetch posts (most recent first)
  const { data: posts } = await supabase
    .from('posts')
    .select('id, image_url, location, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-orange-500">fudi</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Greeting */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-lg font-semibold text-gray-900">
          Hey, {profile.display_name} 👋
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          {posts && posts.length > 0
            ? `${posts.length} post${posts.length === 1 ? '' : 's'} so far`
            : 'Share your first food photo!'}
        </p>
      </div>

      {/* Posts grid with delete */}
      <PostsGrid posts={posts ?? []} currentUserId={user.id} />

      {/* FAB */}
      <Link
        href="/post/new"
        className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-orange-500 shadow-lg flex items-center justify-center text-white text-2xl hover:bg-orange-600 active:scale-95 transition"
      >
        +
      </Link>
    </div>
  )
}
