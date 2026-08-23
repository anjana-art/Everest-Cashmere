// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // ✅ Check if user is authenticated (not admin, just logged in)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to upload images' },
        { status: 401 }
      );
    }

    // Parse user to verify they're logged in
    let user;
    try {
      user = JSON.parse(userCookie);
    } catch {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'reviews';
    const productId = formData.get('productId') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // ✅ Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed' },
        { status: 400 }
      );
    }

    // ✅ Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Upload to Cloudinary with review-specific settings
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `himkash/${folder}`, // Organized folder: himkash/reviews
          resource_type: 'image',
          tags: ['review', `user_${user.id}`, productId].filter(Boolean),
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Max 800x800
            { quality: 'auto:good' }, // Auto optimize quality
            { fetch_format: 'auto' } // Auto convert to WebP/AVIF
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = (result as any).secure_url;
    
    console.log(`✅ Review image uploaded to Cloudinary: ${imageUrl}`);
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      publicId: (result as any).public_id,
    });
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}