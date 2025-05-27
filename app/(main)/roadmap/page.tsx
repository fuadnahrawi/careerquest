"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bookmark, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateSkillRoadmap, mockGenerateSkillRoadmap } from "@/utils/gemini-service";
import { toast } from "sonner";
import { SaveRoadmapModal } from "@/components/save-roadmap-modal";

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

interface CareerDetails {
  code: string;
  title: string;
  description: string;
  interests: string[];
}

// Create a client component that uses useSearchParams
function RoadmapContent() {
  const searchParams = useSearchParams();
  const careerCode = searchParams?.get("career") || "";
  const careerTitle = searchParams?.get("title") || "Software Developer";
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<SkillRoadmap | null>(null);
  const [careerDetails, setCareerDetails] = useState<CareerDetails | null>(null);
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Mock career details - in a real app, you would fetch this based on careerCode
  useEffect(() => {
    const fetchCareerDetails = async () => {
      // In a real app, call your API here
      // const response = await fetch(`/api/career/${careerCode}`);
      // const data = await response.json();
      
      // For now, use mock data
      const mockCareerDetails: CareerDetails = {
        code: careerCode || "15-1252.00",
        title: careerTitle || "Software Developer",
        description: "Research, design, and develop computer and network software or specialized utility programs. Analyze user needs and develop software solutions, applying principles and techniques of computer science, engineering, and mathematical analysis.",
        interests: ["Investigative", "Conventional", "Realistic"]
      };
      
      setCareerDetails(mockCareerDetails);
      return mockCareerDetails;
    };
    
    const generateRoadmap = async () => {
      try {
        setLoading(true);
        const details = await fetchCareerDetails();
        
        // Call the Gemini API with career details
        try {
          const roadmapData = await generateSkillRoadmap(details);
          setRoadmap(roadmapData);
        } catch (error) {
          console.error("Error with Gemini API:", error);
          toast.error("Failed to generate roadmap with AI. Using fallback data.");
          
          // Fallback to mock data if the API call fails
          const mockData = await mockGenerateSkillRoadmap(details.title);
          setRoadmap(mockData);
        }
      } catch (error) {
        console.error("Error generating roadmap:", error);
        toast.error("Failed to generate skill roadmap");
      } finally {
        setLoading(false);
      }
    };
    
    generateRoadmap();
  }, [careerCode, careerTitle]);
  
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
          <h3 className="font-medium text-lg">AI is crafting your personalized skill roadmap</h3>
          <p className="text-muted-foreground mt-2">This may take a few moments</p>
        </motion.div>
      </div>
    );
  }
  
  if (!roadmap) {
    return (
      <div className="container py-10 px-52">
        <h1 className="text-2xl font-bold">Could not generate roadmap</h1>
        <p className="mt-4">
          We encountered an issue while creating your skill development roadmap.
        </p>
        <Button asChild className="mt-6">
          <Link href="/exploration">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Career Exploration
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 px-52">
      {careerDetails && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={`/career/${careerDetails.code}`}>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Career Details
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="md:w-1/2">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Skill Roadmap</h2>
              <h1 className="text-3xl font-bold mb-4">Your Personalized Skill Development Roadmap</h1>
              <p className="text-muted-foreground">
                This roadmap is tailored to help you acquire the skills needed for your chosen 
                career path. Follow the steps to enhance your abilities and achieve your goals.
              </p>
            </div>
            
            <div className="md:w-1/2 p-6 bg-background rounded-lg border">
              <div className="flex items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{careerDetails.title}</h2>
                  <p className="text-muted-foreground text-sm mb-3">{careerDetails.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {careerDetails.interests && careerDetails.interests.map((interest: string) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
                <Bookmark className="h-5 w-5 text-primary flex-shrink-0 ml-4" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="bg-muted/30 rounded-lg p-8 mb-8"
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
          
          <div className="space-y-20">
            {roadmap.skillNodes.map((skill, index) => {
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
                    className={`absolute left-1/2 w-6 h-6 transform -translate-x-1/2 rounded-full border-4 ${isCompleted ? 'bg-primary border-primary' : 'bg-background border-gray-300 dark:border-gray-700'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.3 + (0.1 * index),
                      type: "spring"
                    }}
                  ></motion.div>
                  
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
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 ml-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
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
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button onClick={() => setIsSaveModalOpen(true)}>
          Save Roadmap <Bookmark className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      {/* Save Roadmap Modal */}
      {roadmap && careerDetails && ( // Ensure careerDetails is available
        <SaveRoadmapModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          careerCode={careerCode}
          careerTitle={careerTitle}
          roadmapData={roadmap}
          careerDescription={careerDetails.description} // Pass description
          interests={careerDetails.interests} // Pass interests
        />
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingRoadmap() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium text-lg">Loading roadmap data...</h3>
        <p className="text-muted-foreground mt-2">Please wait a moment</p>
      </div>
    </div>
  );
}

// Main component that wraps RoadmapContent with Suspense
export default function SkillRoadmapPage() {
  return (
    <Suspense fallback={<LoadingRoadmap />}>
      <RoadmapContent />
    </Suspense>
  );
}
