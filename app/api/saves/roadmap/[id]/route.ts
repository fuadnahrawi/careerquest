import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import SavedRoadmap from '@/models/SavedRoadmap';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing roadmap ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Find the saved roadmap
    const savedRoadmap = await SavedRoadmap.findOne({ 
      _id: id, 
      userId: userId 
    });
    
    if (!savedRoadmap) {
      return NextResponse.json({ error: 'Saved roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json({ savedRoadmap });
  } catch (error: any) {
    console.error('Error getting saved roadmap:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}

// Update completedSkills
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing roadmap ID' }, { status: 400 });
    }
    
    const { completedSkills } = await request.json();
    if (!completedSkills || typeof completedSkills !== 'object') {
      return NextResponse.json({ error: 'Invalid completed skills data' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Find and update the saved roadmap
    const updatedRoadmap = await SavedRoadmap.findOneAndUpdate(
      { _id: id, userId: userId },
      { $set: { completedSkills: completedSkills } },
      { new: true }
    );
    
    if (!updatedRoadmap) {
      return NextResponse.json({ error: 'Saved roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Completed skills updated', savedRoadmap: updatedRoadmap });
  } catch (error: any) {
    console.error('Error updating completed skills:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}
