import { Media, Merchant, User } from "@prisma/client"

export const uploadImages = async (files: File[]): Promise<Media[] | null> => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append(`files`, file)
  })
  const result = await fetch('/api/v1/media/upload', {
    method: 'POST',
    body: formData,
  })
  if (result.ok) {
    const data = await result.json()
    return data.data.files
  }
  return null
}

export const getMediaById = async (mediaId: string, token: string): Promise<string | null> => {
  const media = await fetch(`/api/v1/media/${mediaId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (media.ok) {
    const url = await media.json()
    return url.mediaUrl
  }
  return null
}

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await fetch(`/api/v1/users/${id}`, {
    method: 'GET',
  })
  if (!user.ok) {
    return null
  }
  const res = await user.json()
  return res.data.user
}

export const setUser = async (data: unknown) => {
  const user = await fetch(`/api/v1/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const res = await user.json()

  if (res.success) {
    return res.data
  }
  return null
}

export const getUserMerchants = async (userId: string): Promise<Merchant[]> => {
  const user = await fetch(`/api/v1/users/${userId}`)
  if (!user.ok) {
    return []
  }
  const res = await user.json()
  return res.data.merchants

}

