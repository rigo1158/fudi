import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'

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

      {/* Posts grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-1 px-1">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square bg-gray-100">
              <Image
                src={post.image_url}
                alt={post.location ?? 'Food post'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              {post.location && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                  <p className="text-white text-xs font-medium truncate">
                    📍 {post.location}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <span className="text-6xl mb-4">🍜</span>
          <p className="text-gray-400 text-sm">
            Tap + to share your first food photo
          </p>
        </div>
      )}

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
