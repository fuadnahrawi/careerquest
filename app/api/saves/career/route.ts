import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import SavedCareer from '@/models/SavedCareer';

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
    
    const { careerCode, careerTitle, notes } = await request.json();
    
    if (!careerCode || !careerTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Check if the career is already saved by this user
    const existingSave = await SavedCareer.findOne({ userId, careerCode });

    if (existingSave) {
      // Update existing save with new notes
      existingSave.notes = notes;
      existingSave.updatedAt = new Date();
      await existingSave.save();
      
      return NextResponse.json({ 
        message: 'Career updated', 
        savedCareer: existingSave 
      });
    }
    
    // Create new saved career
    const newSavedCareer = new SavedCareer({
      userId,
      careerCode,
      careerTitle,
      notes,
      savedAt: new Date(),
    });
    
    await newSavedCareer.save();
    
    return NextResponse.json({ 
      message: 'Career saved', 
      savedCareer: newSavedCareer 
    });
  } catch (error: any) {
    console.error('Error saving career:', error);
    
    // Handle duplicate key error (user already saved this career)
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'You have already saved this career' 
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
    
    // Get the careers saved by this user
    const userSavedCareers = await SavedCareer.find({ userId }).sort({ savedAt: -1 });
    
    return NextResponse.json({ savedCareers: userSavedCareers });
  } catch (error: any) {
    console.error('Error getting saved careers:', error);
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
    
    // Find and delete the saved career
    const result = await SavedCareer.findOneAndDelete({ 
      _id: id, 
      userId: userId 
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Saved career not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Saved career deleted' });
  } catch (error: any) {
    console.error('Error deleting saved career:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
}
