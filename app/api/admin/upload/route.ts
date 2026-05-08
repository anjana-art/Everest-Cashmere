import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to check admin access (using your existing cookie/session logic)
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) cookies[name] = decodeURIComponent(value);
    });

    if (cookies['admin-check'] === 'true') return true;
    
    const userCookie = cookies['user'];
    if (!userCookie) return false;

    let user;
    try {
      user = JSON.parse(userCookie);
    } catch {
      return false;
    }
    
    if (!user?.id) return false;

    // If you have a database user check (optional)
    // const { prisma } = await import('@/lib/prisma');
    // const dbUser = await prisma.user.findUnique({
    //   where: { id: user.id },
    //   select: { isAdmin: true }
    // });
    // return dbUser?.isAdmin || false;
    
    return true; // Return true if you trust the cookie
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'products', // Images will be stored in a 'products' folder
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Resize to max 800x800
            { quality: 'auto' }, // Auto optimize quality
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
    
    console.log(`✅ Image uploaded to Cloudinary: ${imageUrl}`);
    
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