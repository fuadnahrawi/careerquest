import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import SavedCareer from '@/models/SavedCareer';
import SavedRoadmap from '@/models/SavedRoadmap';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get userId from session
    const userId = (session.user as any).userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const careerCode = searchParams.get('careerCode');
    const type = searchParams.get('type') || 'career'; // Default to 'career'
    
    if (!careerCode) {
      return NextResponse.json({ error: 'Missing careerCode parameter' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    let isSaved = false;
    let savedId = null;
    
    // Check if the item is saved based on type
    if (type === 'career') {
      const savedCareer = await SavedCareer.findOne({ userId, careerCode });
      isSaved = !!savedCareer;
      savedId = savedCareer?._id;
    } else if (type === 'roadmap') {
      const savedRoadmap = await SavedRoadmap.findOne({ userId, careerCode });
      isSaved = !!savedRoadmap;
      savedId = savedRoadmap?._id;
    }
    
    return NextResponse.json({ 
      isSaved,
      savedId
    });
  } catch (error: any) {
    console.error(`Error checking if ${type} is saved:`, error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}
