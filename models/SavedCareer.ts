import mongoose, { Schema, model } from "mongoose";

export interface SavedCareerDocument {
  _id: string;
  userId: string;
  careerCode: string;
  careerTitle: string;
  notes?: string;
  savedAt: Date;
}

const SavedCareerSchema = new Schema<SavedCareerDocument>(
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

// Compound index to ensure a user can't save the same career twice
SavedCareerSchema.index({ userId: 1, careerCode: 1 }, { unique: true });

const SavedCareer = mongoose.models?.SavedCareer || model<SavedCareerDocument>("SavedCareer", SavedCareerSchema);
export default SavedCareer;
