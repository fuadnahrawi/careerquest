"use client";

import { useState } from "react";
import { Bookmark, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  resources?: {
    name: string;
    url: string;
  }[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface SkillRoadmap {
  careerTitle: string;
  skillNodes: SkillNode[];
}

interface SaveRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerCode: string;
  careerTitle: string;
  roadmapData: SkillRoadmap;
  careerDescription?: string; // New prop
  interests?: string[]; // New prop
  onSaveSuccess?: (savedRoadmap: any) => void;
}

export function SaveRoadmapModal({
  isOpen,
  onClose,
  careerCode,
  careerTitle,
  roadmapData,
  careerDescription, // Destructure new prop
  interests, // Destructure new prop
  onSaveSuccess,
}: SaveRoadmapModalProps) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/saves/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          careerCode,
          careerTitle,
          roadmapData,
          notes,
          careerDescription, // Include in payload
          interests, // Include in payload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save roadmap");
      }

      const data = await response.json();
      toast.success(data.message || "Roadmap saved successfully");

      if (onSaveSuccess) {
        onSaveSuccess(data.savedRoadmap);
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving roadmap:", error);
      toast.error(error.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bookmark className="mr-2 h-5 w-5" />
            Save Roadmap for {careerTitle}
          </DialogTitle>
          <DialogDescription>
            Add notes to your saved roadmap for future reference.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="notes" className="text-right mb-2 block">
            Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any personal notes, goals, or reminders related to this roadmap..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Roadmap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
