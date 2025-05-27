"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Loader2, Search, ListFilter, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  getMatchingCareers, 
  fetchAllCareers,
  fetchIndustries,
  fetchCareersByIndustry,
  searchCareersByKeyword,
  CareerFromList,
  IndustryItem,
  OnetListResponse
} from "@/utils/onet-service";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

type ViewMode = "interest" | "all" | "industry" | "search";

const ITEMS_PER_PAGE = 20; // Default items per page from O*NET API

// This is the component that uses useSearchParams
function CareerExplorationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract parameters from URL
  const interestArea = searchParams?.get("interest");
  const keyword = searchParams?.get("keyword");
  const industryCode = searchParams?.get("industry");
  const viewModeParam = searchParams?.get("view");
  const pageParam = searchParams?.get("page");
  
  // Set initial states based on URL parameters
  const [careers, setCareers] = useState<CareerFromList[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(industryCode);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(keyword || "");
  const [apiError, setApiError] = useState<string | null>(null);

  // Determine initial view mode from URL parameters
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (interestArea) return "interest";
    if (keyword) return "search";
    if (industryCode || viewModeParam === "industry") return "industry";
    if (viewModeParam === "all") return "all";
    return "interest"; // Default to interest view, but empty if no interest parameter
  });

  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sort and filter options
  const [currentSort, setCurrentSort] = useState<string>("name"); // Default sort for 'all'
  const [industrySort, setIndustrySort] = useState<string>("category"); // Default for 'industry'
  const [industryCategoryFilter, setIndustryCategoryFilter] = useState<"all" | "Most" | "Some">("all");

  // Load industries on component mount (only once)
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await fetchIndustries();
        if (response.industry) {
          setIndustries(response.industry);
          
          // If industry code was provided in URL, find the matching industry
          if (industryCode && response.industry) {
            const found = response.industry.find(ind => ind.code.toString() === industryCode);
            if (found) {
              setSelectedIndustry(found.code.toString());
            }
          }
        }
      } catch (error) {
        console.error("Error loading industries:", error);
      }
    };
    
    loadIndustries();
  }, [industryCode]);

  // Main function to fetch careers based on current view mode
  const fetchCareers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const start = (page - 1) * ITEMS_PER_PAGE + 1;
      const end = page * ITEMS_PER_PAGE;
      
      let response: OnetListResponse<CareerFromList> | null = null;
      
      switch (viewMode) {
        case "interest":
          if (interestArea) {
            response = await getMatchingCareers(interestArea, undefined, start, end);
          } else {
            setCareers([]);
            setTotalResults(0);
            setIsLoading(false);
            return;
          }
          break;
          
        case "all":
          response = await fetchAllCareers({
            sort: currentSort as any,
            start,
            end
          });
          break;
          
        case "industry":
          if (selectedIndustry) {
            response = await fetchCareersByIndustry(selectedIndustry, {
              category: industryCategoryFilter,
              sort: industrySort as any,
              start,
              end
            });
          } else {
            setCareers([]);
            setTotalResults(0);
            setIsLoading(false);
            return;
          }
          break;
          
        case "search":
          if (searchTerm) {
            response = await searchCareersByKeyword(searchTerm, { start, end });
          } else {
            setCareers([]);
            setTotalResults(0);
            setIsLoading(false);
            return;
          }
          break;
      }
      
      if (response) {
        setCareers(response.career || []);
        setTotalResults(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error("Error fetching careers:", error);
      setApiError(error.message || "Failed to load careers.");
      toast.error("Failed to load careers");
      setCareers([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, interestArea, searchTerm, selectedIndustry, currentSort, industrySort, industryCategoryFilter]);

  // Fetch careers whenever view mode or key dependencies change
  useEffect(() => {
    fetchCareers(currentPage);
  }, [fetchCareers, currentPage]);

  // Update URL params when view mode changes
  const updateUrlParams = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    
    // Remove existing params we manage
    ['view', 'interest', 'industry', 'keyword', 'page'].forEach(param => {
      url.searchParams.delete(param);
    });
    
    // Add new params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    router.push(url.pathname + url.search);
  };

  // Handle tab changes
  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    setCurrentPage(1);
    
    // Update URL params based on new view
    const params: Record<string, string | null> = { view: newView };
    
    if (newView === 'interest' && interestArea) {
      params.interest = interestArea;
    } else if (newView === 'industry' && selectedIndustry) {
      params.industry = selectedIndustry;
    } else if (newView === 'search' && searchTerm) {
      params.keyword = searchTerm;
    }
    
    updateUrlParams(params);
  };

  // Handle industry selection
  const handleIndustryChange = (industryCode: string) => {
    setSelectedIndustry(industryCode);
    setCurrentPage(1);
    updateUrlParams({ view: 'industry', industry: industryCode });
  };
  
  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (searchTerm.trim()) {
      setViewMode('search');
      setCurrentPage(1);
      updateUrlParams({ view: 'search', keyword: searchTerm.trim() });
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // Determine which parameters to include based on current view
      const params: Record<string, string | null> = { page: page.toString() };
      
      if (viewMode === 'interest') {
        params.interest = interestArea;
      } else if (viewMode === 'industry') {
        params.view = 'industry';
        params.industry = selectedIndustry;
      } else if (viewMode === 'search') {
        params.view = 'search';
        params.keyword = searchTerm;
      } else {
        params.view = 'all';
      }
      
      updateUrlParams(params);
    }
  };

  // UI helper function for fit badges
  const getFitBadgeColor = (fit?: string) => {
    switch (fit) {
      case "Best":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Great":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Good":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        {/* Back button - Only show when in interest view */}
        {viewMode === 'interest' && interestArea && (
          <Link href="/assessment">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessment
            </Button>
          </Link>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Career Exploration</h1>
            <p className="text-muted-foreground mt-1">
              Browse and search careers to find your perfect match
            </p>
          </div>
          
          {/* Quick stats display */}
          {!isLoading && totalResults > 0 && (
            <div className="bg-muted px-4 py-2 rounded-md text-sm">
              Showing {careers.length} of {totalResults} results
              {currentPage > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>
        
        {/* Main tabs for view modes */}
        <Tabs
          value={viewMode}
          onValueChange={(value) => handleViewChange(value as ViewMode)}
          className="w-full"
        >
          <TabsList className="mb-6 grid grid-cols-4 w-full">
            <TabsTrigger value="all" disabled={isLoading}>
              <Briefcase className="mr-2 h-4 w-4" />
              All Careers
            </TabsTrigger>
            <TabsTrigger value="industry" disabled={isLoading}>
              <Building className="mr-2 h-4 w-4" />
              By Industry
            </TabsTrigger>
            <TabsTrigger value="search" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="interest" disabled={isLoading || !interestArea}>
              <ListFilter className="mr-2 h-4 w-4" />
              By Interest
            </TabsTrigger>
          </TabsList>
          
          {/* View by industry content */}
          <TabsContent value="industry" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Select
                  value={selectedIndustry || ""}
                  onValueChange={handleIndustryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {industries.map((industry) => (
                      <SelectItem key={industry.code} value={industry.code.toString()}>
                        {industry.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedIndustry && (
                <>
                  <div>
                    <Select
                      value={industryCategoryFilter}
                      onValueChange={(value: "all" | "Most" | "Some") => {
                        setIndustryCategoryFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by employment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employed</SelectItem>
                        <SelectItem value="Most">Most Employed (50%+)</SelectItem>
                        <SelectItem value="Some">Some Employed (10-50%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={industrySort}
                      onValueChange={(value) => {
                        setIndustrySort(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Employment Category</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="percent_employed">Percent Employed</SelectItem>
                        <SelectItem value="bright_outlook">Bright Outlook</SelectItem>
                        <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Search content */}
          <TabsContent value="search" className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by keyword, job title or O*NET code..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={!searchTerm.trim()}>
                Search
              </Button>
            </form>
          </TabsContent>
          
          {/* All careers content */}
          <TabsContent value="all" className="space-y-6">
            <div className="flex justify-end">
              <Select
                value={currentSort}
                onValueChange={(value) => {
                  setCurrentSort(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="bright_outlook">Bright Outlook</SelectItem>
                  <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Interest-based content */}
          <TabsContent value="interest" className="space-y-6">
            {interestArea ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-lg">Exploring {interestArea} Careers</h3>
                <p className="text-muted-foreground">
                  Based on your assessment results, these careers match your {interestArea.toLowerCase()} interests.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No Interest Area Selected</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Complete the career assessment to get personalized career suggestions.
                </p>
                <Button asChild>
                  <Link href="/assessment">Take Career Assessment</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Career listing section */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : apiError ? (
        <div className="text-center py-12 text-red-600">
          <h3 className="text-lg font-medium">Failed to Load Careers</h3>
          <p className="text-muted-foreground mt-2">{apiError}</p>
          <Button onClick={() => fetchCareers(1)} className="mt-4">Try Again</Button>
        </div>
      ) : careers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <Card key={career.code}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{career.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {career.code}
                        {career.category && (
                          <Badge variant="outline" className="ml-2">
                            {career.category}
                            {career.percent_employed !== undefined && ` (${career.percent_employed}%)`}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {career.fit && (
                      <Badge className={getFitBadgeColor(career.fit)}>
                        {career.fit} Match
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    View details to learn more about this career.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {career.tags?.bright_outlook && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                        Bright Outlook
                      </Badge>
                    )}
                    {career.tags?.apprenticeship && (
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                        Apprenticeship
                      </Badge>
                    )}
                    {career.tags?.green && (
                      <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700">
                        Green Job
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/career/${career.code}`}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Career Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      handlePageChange(currentPage - 1); 
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(1); }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis after first page */}
                {currentPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Page before current */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Current page */}
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    isActive
                    onClick={(e) => e.preventDefault()}
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                
                {/* Page after current */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    >
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis before last page */}
                {currentPage < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      handlePageChange(currentPage + 1); 
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">
            {(() => {
              if (viewMode === 'interest' && !interestArea) 
                return "Complete an assessment to see careers matching your interests.";
              if (viewMode === 'industry' && !selectedIndustry) 
                return "Please select an industry to view careers.";
              if (viewMode === 'search' && !searchTerm) 
                return "Enter a keyword to search for careers.";
              return "No careers found matching your criteria.";
            })()}
          </h3>
          <p className="text-muted-foreground mt-2 mb-6">
            {viewMode === 'search' && searchTerm ? "Try a different search term or browse by industry." : "Try adjusting your filters or explore a different category."}
          </p>
          {viewMode === 'search' && searchTerm && (
            <Button variant="outline" onClick={() => handleViewChange('all')} className="mr-4">
              Browse All Careers
            </Button>
          )}
          {!interestArea && (
            <Button asChild>
              <Link href="/assessment">Take Career Assessment</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// This is the main page component that wraps the content in a Suspense boundary
export default function CareerExplorationPage() {
  return (
    <Suspense fallback={
      <div className="container py-10 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CareerExplorationContent />
    </Suspense>
  );
}
