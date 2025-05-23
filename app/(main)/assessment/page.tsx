"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  fetchInterestProfilerQuestions, 
  submitInterestProfilerAnswers,
  mockQuestions, 
  mockAnswerOptions,
  mockResults
} from "@/utils/onet-service";

interface Question {
  index: number;
  area: string;
  text: string;
}

interface AnswerOption {
  value: number;
  name: string;
}

interface InterestResult {
  area: string;
  score: number;
  description: string;
}

const InterestProfiler = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<InterestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch questions from O*NET Web Services API
  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Fetch questions and answer options from O*NET Web Services
        const { questions, answerOptions } = await fetchInterestProfilerQuestions();
        
        setQuestions(questions);
        setAnswerOptions(answerOptions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setApiError("Could not load assessment questions. Using fallback questions.");
        toast.error("Could not connect to assessment service. Using fallback questions.");
        
        // Use mock data as fallback
        setQuestions(mockQuestions);
        setAnswerOptions(mockAnswerOptions);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadQuestions();
  }, []);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].index]: value,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let resultsData: InterestResult[];
      
      if (apiError) {
        // If we had an API error earlier, use mock results
        resultsData = [...mockResults].sort((a, b) => b.score - a.score);
      } else {
        // Submit answers to O*NET Web Services
        resultsData = await submitInterestProfilerAnswers(answers);
        
        // Sort results by score (highest to lowest)
        resultsData.sort((a, b) => b.score - a.score);
      }
      
      setResults(resultsData);
      setShowResults(true);
      
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("There was an error processing your assessment");
      
      // Use mock results as fallback
      const mockResultsData = [...mockResults].sort((a, b) => b.score - a.score);
      setResults(mockResultsData);
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToCareerList = (interestArea: string) => {
    router.push(`/exploration?interest=${interestArea}`);
  };

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  if (isLoading) {
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
          <h3 className="font-medium text-lg">Loading your career assessment</h3>
          <p className="text-muted-foreground mt-2">Preparing personalized questions...</p>
        </motion.div>
      </div>
    );
  }
  
  if (showResults) {
    const topInterests = results.slice(0, 3);
    
    return (
      <div className="container py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Your Career Assessment Results</h1>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Your Top 3 Interest Areas</h2>
          <p className="text-muted-foreground mb-6">
            Based on your responses, here are your strongest interest areas. Click on each to explore matching careers.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {topInterests.map((interest, index) => (
              <Card 
                key={interest.area} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigateToCareerList(interest.area)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{interest.area}</h3>
                  <p className="text-sm text-muted-foreground">{interest.description}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => navigateToCareerList(interest.area)}
                  >
                    Explore Careers <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Button onClick={() => setShowResults(false)}>Retake Assessment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-22 max-w-4xl mx-auto">
      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-md mb-6">
          <p>{apiError}</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</h2>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="mb-10">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-full mb-8">
            <h1 className="text-3xl font-bold mb-6">QUESTION?</h1>
            <p className="text-xl">
              {currentQuestion?.text || "Loading question..."}
            </p>
          </div>

          <div className="flex justify-between w-full space-x-2">
            {answerOptions.map((option) => (
              <Button
                key={option.value}
                variant={answers[currentQuestion?.index] === option.value ? "default" : "outline"}
                className="flex flex-col items-center p-4 h-auto gap-2 transition-all flex-1 mt-8"
                onClick={() => handleAnswer(option.value)}
              >
                <div className="flex items-center justify-center">
                  {option.value === 1 && (
                    <span className="text-2xl md:text-3xl">😡</span>
                  )}
                  {option.value === 2 && (
                    <span className="text-2xl md:text-3xl">🙁</span>
                  )}
                  {option.value === 3 && (
                    <span className="text-2xl md:text-3xl">😐</span>
                  )}
                  {option.value === 4 && (
                    <span className="text-2xl md:text-3xl">🙂</span>
                  )}
                  {option.value === 5 && (
                    <span className="text-2xl md:text-3xl">😃</span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium">{option.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        {currentQuestionIndex === questions.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion?.index]}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function AssessmentPage() {
  return <InterestProfiler />;
}
