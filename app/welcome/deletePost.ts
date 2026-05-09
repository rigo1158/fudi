'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function deletePost(postId: string, imageUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Extract storage path from public URL
  const storagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/`
  const filePath = imageUrl.replace(storagePrefix, '')

  // Delete from storage
  await supabase.storage.from('post-images').remove([filePath])

  // Delete from posts table (RLS ensures only owner can delete)
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/welcome')
  return { success: true }
}
