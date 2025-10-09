import cloudinary from '@/lib/cloudinary'
import { normalizeFileName } from '@/lib/utils'
import { Media } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData()
    const uploadSource = request.headers.get('X-Upload-Source')
    const files = formData.getAll('files')

    if (!files)
      NextResponse.json({ error: 'Internal error. Files image are empty' }, { status: 500 })

    const responses = await Promise.all(
      files.map(async (file: unknown) => {
        const buffer = Buffer.from(await (file as File).arrayBuffer())
        const fileName = normalizeFileName((file as File).name)

        // Upload to Cloudinary
        const uploadResponse = await new Promise(async (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `users/guest`,
                public_id: fileName.split('.')[0],
                resource_type: 'auto',
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error)
                  reject(error)
                } else {
                  resolve(result)
                }
              },
            )
            .end(buffer)
        })
        const cloudinaryResponse = uploadResponse as any
        const mediaUrl = cloudinaryResponse.secure_url

        // Generate blur data URL for images
        const { getPlaiceholder } = await import('plaiceholder')
        const { base64 } = !((file as File).type.startsWith('image/'))
          ? { base64: null }
          : await getPlaiceholder(buffer)

        const media: Media = {
            fileName: fileName,
            url: mediaUrl,
            blurDataUrl: base64,
            creatorId: 'guest',
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        return media
      }),
    )

    if (uploadSource === 'froala-editor') {
      return NextResponse.json({
        link: responses[0].url,
      })
    }
    if (uploadSource === 'jodit-editor') {
      return NextResponse.json(
        {
          success: true,
          files: responses.map(file => {
            return {
              file: {
                name: file.fileName,
                url: file.url,
                id: uuidv4(),
              },
            }
          }),
        },
        { status: 200 },
      )
    }
    return NextResponse.json(
      {
        success: true,
        data: {
          files: responses,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[upload_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}