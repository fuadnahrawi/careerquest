import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import SavedRoadmap from '@/models/SavedRoadmap';

export async function POST(request: NextRequest) {
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
    
    const { 
      careerCode, 
      careerTitle, 
      roadmapData, 
      notes,
      careerDescription, // New field
      interests // New field
    } = await request.json();
    
    if (!careerCode || !careerTitle || !roadmapData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Check if the roadmap is already saved by this user
    const existingSave = await SavedRoadmap.findOne({ userId, careerCode });

    if (existingSave) {
      // Update existing save with new data
      existingSave.roadmapData = roadmapData;
      existingSave.notes = notes;
      existingSave.careerDescription = careerDescription; // Update
      existingSave.interests = interests; // Update
      // existingSave.updatedAt = new Date(); // Handled by timestamps: true
      await existingSave.save();
      
      return NextResponse.json({ 
        message: 'Roadmap updated', 
        savedRoadmap: existingSave 
      });
    }
    
    // Create new saved roadmap
    const newSavedRoadmap = new SavedRoadmap({
      userId,
      careerCode,
      careerTitle,
      roadmapData,
      notes,
      careerDescription, // Add to new save
      interests, // Add to new save
      savedAt: new Date(),
    });
    
    await newSavedRoadmap.save();
    
    return NextResponse.json({ 
      message: 'Roadmap saved', 
      savedRoadmap: newSavedRoadmap 
    });
  } catch (error: any) {
    console.error('Error saving roadmap:', error);
    
    // Handle duplicate key error (user already saved this roadmap)
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'You have already saved a roadmap for this career' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}

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
    
    // Connect to database
    await connectDB();
    
    // Get the roadmaps saved by this user
    const userSavedRoadmaps = await SavedRoadmap.find({ userId }).sort({ savedAt: -1 });
    
    return NextResponse.json({ savedRoadmaps: userSavedRoadmaps });
  } catch (error: any) {
    console.error('Error getting saved roadmaps:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing save ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Find and delete the saved roadmap
    const result = await SavedRoadmap.findOneAndDelete({ 
      _id: id, 
      userId: userId 
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Saved roadmap not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Saved roadmap deleted' });
  } catch (error: any) {
    console.error('Error deleting saved roadmap:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}
