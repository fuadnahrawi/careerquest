"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  Route, 
  Briefcase, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  Search,
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedCareer {
  _id: string; // Changed from id to _id
  careerCode: string;
  careerTitle: string;
  savedAt: string;
  notes?: string;
}

interface SavedRoadmap {
  _id: string; // Changed from id to _id
  careerCode: string;
  careerTitle: string;
  savedAt: string;
  roadmapData: any;
  notes?: string;
}

export default function SavedItemsPage() {
  const [savedCareers, setSavedCareers] = useState<SavedCareer[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'career' | 'roadmap' } | null>(null);

  // Fetch saved items
  useEffect(() => {
    async function fetchSavedItems() {
      setIsLoading(true);
      try {
        // Fetch saved careers
        const careersResponse = await fetch("/api/saves/career");
        const careersData = await careersResponse.json();
        
        if (careersData.savedCareers) {
          setSavedCareers(careersData.savedCareers);
        }
        
        // Fetch saved roadmaps
        const roadmapsResponse = await fetch("/api/saves/roadmap");
        const roadmapsData = await roadmapsResponse.json();
        
        if (roadmapsData.savedRoadmaps) {
          setSavedRoadmaps(roadmapsData.savedRoadmaps);
        }
      } catch (error) {
        console.error("Error fetching saved items:", error);
        toast.error("Failed to load saved items");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSavedItems();
  }, []);

  // Filter saved items based on search term
  const filteredCareers = savedCareers.filter(career => 
    career.careerTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredRoadmaps = savedRoadmaps.filter(roadmap => 
    roadmap.careerTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete a saved item
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const endpoint = itemToDelete.type === 'career' ? '/api/saves/career' : '/api/saves/roadmap';
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemToDelete.id }), // Keep 'id' here as the API expects 'id' in body
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Update UI state
      if (itemToDelete.type === 'career') {
        setSavedCareers(careers => careers.filter(career => career._id !== itemToDelete.id)); // Use _id for filtering
      } else {
        setSavedRoadmaps(roadmaps => roadmaps.filter(roadmap => roadmap._id !== itemToDelete.id)); // Use _id for filtering
      }
      
      toast.success(`${itemToDelete.type === 'career' ? 'Career' : 'Roadmap'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="w-full py-8 px-54">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Saved Items</h1>
          <p className="text-muted-foreground mt-1">Access your saved careers and skill roadmaps.</p>
        </div>
        
        <div className="relative mt-4 md:mt-0 md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="careers">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="careers" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Saved Careers ({filteredCareers.length}) {/* Optional: Show count */}
          </TabsTrigger>
          <TabsTrigger value="roadmaps" className="flex items-center">
            <Route className="mr-2 h-4 w-4" />
            Saved Roadmaps ({filteredRoadmaps.length}) {/* Optional: Show count */}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="careers">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCareers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCareers.map((career) => (
                <motion.div
                  key={career._id} // Use _id for key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{career.careerTitle}</CardTitle>
                          <CardDescription>{career.careerCode}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={() => setItemToDelete({ id: career._id, type: 'career' })} // Pass _id
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {career.notes ? (
                        <div className="mb-3">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <FileText className="mr-1 h-4 w-4" />
                            <span>Notes</span>
                          </div>
                          <p className="text-sm">{career.notes}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No notes added</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-4 flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Saved on {new Date(career.savedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/career/${career.careerCode}`}>
                          View Career
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bookmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No saved careers found</h3>
              <p className="text-muted-foreground mt-1 mb-6">
                {searchTerm ? "Try adjusting your search term." : "Start exploring and save careers you're interested in."}
              </p>
              <Button asChild>
                <Link href="/exploration">Explore Careers</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="roadmaps">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRoadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap._id} // Use _id for key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Roadmap for {roadmap.careerTitle}</CardTitle>
                          <CardDescription>{roadmap.careerCode}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={() => setItemToDelete({ id: roadmap._id, type: 'roadmap' })} // Pass _id
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            {roadmap.roadmapData?.skillNodes?.length || 0} skills
                          </Badge>
                        </div>
                        
                        {roadmap.notes ? (
                          <div className="mt-3">
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <FileText className="mr-1 h-4 w-4" />
                              <span>Notes</span>
                            </div>
                            <p className="text-sm">{roadmap.notes}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic mt-3">No notes added</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-4 flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Saved on {new Date(roadmap.savedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/savedroadmap/${roadmap._id}`}> {/* Use _id here */}
                          View Roadmap
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Route className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No saved roadmaps found</h3>
              <p className="text-muted-foreground mt-1 mb-6">
                {searchTerm ? "Try adjusting your search term." : "Build and save skill roadmaps for your career goals."}
              </p>
              <Button asChild>
                <Link href="/exploration">Find Careers</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved {itemToDelete?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
