import mongoose, { Schema, model } from "mongoose";

export interface SavedRoadmapDocument {
  _id: mongoose.Types.ObjectId;
  userId: string;
  careerCode: string;
  careerTitle: string;
  careerDescription?: string;
  interests?: string[];
  roadmapData: {
    careerTitle: string;
    skillNodes: {
      id: string;
      title: string;
      description: string;
      timeframe: string;
      resources?: {
        name: string;
        url: string;
      }[];
      difficulty: "Beginner" | "Intermediate" | "Advanced";
    }[];
  };
  completedSkills?: Record<string, boolean>;
  notes?: string;
  savedAt: Date;
}

const SavedRoadmapSchema = new Schema<SavedRoadmapDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    careerCode: {
      type: String,
      required: [true, "Career code is required"],
    },
    careerTitle: {
      type: String,
      required: [true, "Career title is required"],
    },
    careerDescription: {
      type: String,
    },
    interests: {
      type: [String],
    },
    roadmapData: {
      type: Schema.Types.Mixed, // Allow for complex JSON structures
      required: [true, "Roadmap data is required"],
    },
    completedSkills: {
      type: Map,
      of: Boolean,
      default: {},
    },
    notes: {
      type: String,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can't save the same roadmap twice
SavedRoadmapSchema.index({ userId: 1, careerCode: 1 }, { unique: true });

const SavedRoadmap =
  mongoose.models?.SavedRoadmap ||
  model<SavedRoadmapDocument>("SavedRoadmap", SavedRoadmapSchema);
export default SavedRoadmap;
