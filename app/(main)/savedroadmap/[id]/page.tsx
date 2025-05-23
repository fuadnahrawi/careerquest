"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Check, ExternalLink, Sparkles, Info, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface RoadmapData {
  careerTitle: string;
  skillNodes: SkillNode[];
}

interface SavedRoadmap {
  _id: string;
  userId: string;
  careerCode: string;
  careerTitle: string;
  careerDescription?: string;
  interests?: string[];
  roadmapData: RoadmapData;
  completedSkills: Record<string, boolean>;
  notes?: string;
  savedAt: string;
}

export default function SavedRoadmapPage() {
  const { id } = useParams();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<SavedRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the saved roadmap data
  useEffect(() => {
    async function fetchSavedRoadmap() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/saves/roadmap/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load saved roadmap");
        }
        
        const data = await response.json();
        setRoadmap(data.savedRoadmap);
        
        // Initialize completed skills
        if (data.savedRoadmap.completedSkills) {
          setCompletedSkills(data.savedRoadmap.completedSkills);
        }
      } catch (error: any) {
        console.error("Error loading saved roadmap:", error);
        setError(error.message || "Failed to load saved roadmap");
        toast.error("Failed to load saved roadmap");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSavedRoadmap();
  }, [id]);
  
  // Save completed skills when they change
  useEffect(() => {
    const saveCompletedSkills = async () => {
      if (!id || !roadmap) return;
      
      try {
        const response = await fetch(`/api/saves/roadmap/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completedSkills }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save progress");
        }
      } catch (error) {
        console.error("Error saving progress:", error);
        // Don't show toast error to avoid spamming the user
      }
    };
    
    // Save after a short delay to avoid too many API calls
    const timeoutId = setTimeout(saveCompletedSkills, 1000);
    return () => clearTimeout(timeoutId);
  }, [completedSkills, id, roadmap]);
  
  const toggleSkillCompletion = (skillId: string) => {
    setCompletedSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Advanced":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop" 
            }}
            className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <h3 className="font-medium text-lg">Loading your saved roadmap</h3>
          <p className="text-muted-foreground mt-2">Just a moment...</p>
        </motion.div>
      </div>
    );
  }
  
  if (error || !roadmap) {
    return (
      <div className="container py-10 px-4 md:px-8 lg:px-16 xl:px-24">
        <h1 className="text-2xl font-bold">Could not load roadmap</h1>
        <p className="mt-4 text-muted-foreground">
          {error || "The roadmap you're looking for couldn't be found."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/saved">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Saved Items
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 px-4 md:px-8 lg:px-16 xl:px-24">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <Link href="/saved">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Saved Items
            </Button>
          </Link>
          
          {roadmap.notes && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNotesDialog(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> View Notes
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="md:w-1/2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Saved Skill Roadmap</h2>
              <Badge variant="secondary" className="text-xs">Saved</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Skill Development Roadmap</h1>
            <p className="text-muted-foreground">
              Track your progress on this saved roadmap to enhance your abilities and achieve your career goals.
            </p>

            <div className="mt-4 text-sm text-muted-foreground">
              Saved on {new Date(roadmap.savedAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="md:w-1/2 p-6 bg-background rounded-lg border">
            <div className="flex items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{roadmap.careerTitle}</h2>
                <p className="text-muted-foreground text-sm mb-3">{roadmap.careerDescription || roadmap.careerCode}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {roadmap.interests && roadmap.interests.map((interest: string) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
              <Bookmark className="h-5 w-5 text-primary fill-primary flex-shrink-0 ml-4" />
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-muted/30 rounded-lg p-4 md:p-8 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          {/* Vertical timeline line */}
          <motion.div 
            className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-700 transform -translate-x-1/2"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          ></motion.div>
          
          <div className="space-y-12 md:space-y-20">
            {roadmap.roadmapData.skillNodes.map((skill, index) => {
              const isCompleted = completedSkills[skill.id];
              const isEven = index % 2 === 0;
              
              return (
                <motion.div 
                  key={skill.id} 
                  className="relative"
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {/* Timeline node */}
                  <motion.div 
                    className={`absolute left-1/2 w-6 h-6 transform -translate-x-1/2 rounded-full border-4 z-10 ${isCompleted ? 'bg-primary border-primary' : 'bg-background border-gray-300 dark:border-gray-700'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.3 + (0.1 * index),
                      type: "spring"
                    }}
                  >
                    {isCompleted && <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}
                  </motion.div>
                  
                  {/* Content layout - alternating left and right */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Empty space for alternating layout */}
                    {isEven ? (
                      <div className="hidden md:block"></div>
                    ) : null}
                    
                    {/* Skill box */}
                    <motion.div 
                      className={`relative ${isCompleted ? 'border-primary/40' : ''} bg-background border rounded-lg p-5 shadow-sm`}
                      whileHover={{ 
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        y: -5
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={!!isCompleted}
                          onChange={() => toggleSkillCompletion(skill.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                      <div className="pl-8">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{skill.title}</h3>
                          <Badge className={getDifficultyColor(skill.difficulty)}>
                            {skill.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{skill.timeframe}</span>
                        </div>
                        
                        {skill.resources && skill.resources.length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            <h4 className="text-sm font-medium mb-2">Learning Resources:</h4>
                            <ul className="space-y-1">
                              {skill.resources.map((resource, idx) => (
                                <li key={idx} className="text-sm">
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center"
                                  >
                                    {resource.name}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Empty space for alternating layout */}
                    {!isEven ? (
                      <div className="hidden md:block"></div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="flex justify-between items-center mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Button asChild variant="outline">
          <Link href="/saved">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Saved Items
          </Link>
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline">
                <Link href={`/career/${roadmap.careerCode}`}>
                  <Info className="mr-2 h-4 w-4" />
                  View Career Details
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View complete career information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Notes
            </DialogTitle>
            <DialogDescription>
              Your notes for this saved roadmap
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{roadmap.notes}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
