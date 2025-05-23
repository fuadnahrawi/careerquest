export interface SavedCareer {
  id: string;
  userId: string;
  careerCode: string;
  careerTitle: string;
  savedAt: Date;
  notes?: string;
}

export interface SavedRoadmap {
  id: string;
  userId: string;
  careerCode: string;
  careerTitle: string;
  savedAt: Date;
  roadmapData: any; // This will store the entire roadmap JSON
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Lecturer' | 'Admin';
  userId: string;
}
