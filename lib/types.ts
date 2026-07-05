export type PostImage = {
  id: string
  post_id: string
  image_url: string
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  mountain_name: string
  mountain_comment: string | null
  hot_spring_name: string | null
  hot_spring_comment: string | null
  restaurant_name: string | null
  restaurant_comment: string | null
  created_at: string
  updated_at: string
}

export type PostWithImages = Post & {
  post_images: PostImage[]
}
