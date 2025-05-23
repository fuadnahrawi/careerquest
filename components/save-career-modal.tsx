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

interface SaveCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerCode: string;
  careerTitle: string;
  onSaveSuccess?: (savedCareer: any) => void;
}

export function SaveCareerModal({
  isOpen,
  onClose,
  careerCode,
  careerTitle,
  onSaveSuccess,
}: SaveCareerModalProps) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch("/api/saves/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          careerCode,
          careerTitle,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save career");
      }

      const data = await response.json();
      
      toast.success("Career saved successfully");
      
      // Call the onSaveSuccess callback if provided
      if (onSaveSuccess) {
        onSaveSuccess(data.savedCareer);
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error saving career:", error);
      toast.error(error.message || "Failed to save career");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bookmark className="mr-2 h-5 w-5 text-primary" />
            Save Career
          </DialogTitle>
          <DialogDescription>
            Save this career to your profile for easy access later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <div className="font-medium mb-1">{careerTitle}</div>
            <div className="text-sm text-muted-foreground">{careerCode}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add your notes about this career..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Career"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
