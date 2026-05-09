'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const displayName = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()

  if (!displayName) return { error: 'Display name is required' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, bio: bio || null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/welcome')
  revalidatePath('/profile/edit')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'No file selected' }

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${ext}`

  // Delete old avatar first (ignore errors)
  await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`])

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/welcome')
  revalidatePath('/profile/edit')
  return { success: true, avatarUrl: publicUrl }
}
