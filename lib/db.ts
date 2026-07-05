// lib/db.ts
// 先ほど作成した client.ts から直接 supabase インスタンスをインポートします
import { createClient as supabase } from './supabase/client'

// postsテーブルの型定義
export interface Post {
  id?: string
  user_id?: string
  mountain_name: string
  mountain_comment: string
  hot_spring_name: string
  hot_spring_comment: string
  restaurant_name: string
  restaurant_comment: string
  image_url?: string
  created_at?: string
}

/**
 * 1. 【READ】最新投稿一覧の取得
 */
export async function getLatestPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    throw error
  }
  return data as Post[]
}

/**
 * 2. 【READ】山名での部分一致検索
 */
export async function searchPostsByMountain(keyword: string) {
  if (!keyword.trim()) return getLatestPosts()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    // バックォート `` と % でキーワードを囲むように修正しました
    .ilike('mountain_name', `%${keyword}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching posts:', error)
    throw error
  }
  return data as Post[]
}

/**
 * 3. 【READ】投稿詳細の取得
 */
export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post detail:', error)
    throw error
  }
  return data as Post
}

/**
 * 4. 【READ】ログインユーザー自身の投稿一覧取得
 */
export async function getMyPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my posts:', error)
    throw error
  }
  return data as Post[]
}

/**
 * 5. 【CREATE】新規投稿の作成
 */
export async function createPost(postData: Omit<Post, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()

  if (error) {
    console.error('Error creating post:', error)
    throw error
  }
  return data
}

/**
 * 6. 【UPDATE】投稿の編集
 */
export async function updatePost(id: string, postData: Partial<Post>) {
  const { data, error } = await supabase
    .from('posts')
    .update(postData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating post:', error)
    throw error
  }
  return data
}

/**
 * 7. 【DELETE】投稿の削除
 */
export async function deletePost(id: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    throw error
  }
  return true
}