/**
 * Utility functions for interacting with O*NET Web Services API
 */

// Using our proxy API route instead of calling O*NET directly
const API_BASE_URL = '/api/onet';

interface OnetQuestion {
  index: number;
  area: string;
  text: string;
}

interface OnetAnswerOption {
  value: number;
  name: string;
}

interface OnetResult {
  area: string;
  score: number;
  description: string;
}

// Interface for the main career overview from mnm/careers/{code}
export interface CareerOverview {
  code: string;
  title: string;
  tags?: {
    bright_outlook?: boolean;
    green?: boolean;
    apprenticeship?: boolean;
  };
  also_called?: {
    title?: string[];
  };
  what_they_do?: string; // Main description
  on_the_job?: {
    task?: string[];
  };
  career_video?: boolean;
  resources?: {
    resource?: {
      href: string;
      title: string;
    }[];
  };
}

// Updated Interface for careers list from various endpoints
export interface CareerFromList {
  href: string;
  fit?: "Best" | "Great" | "Good"; // From interest profiler
  code: string;
  title: string;
  tags?: {
    bright_outlook?: boolean;
    green?: boolean;
    apprenticeship?: boolean;
  };
  // Fields from careers by industry
  percent_employed?: number;
  category?: "Most" | "Some" | string; // Category for industry-based results
}

// Interface for API list responses (common structure)
export interface OnetListResponse<T> {
  sort?: string;
  start: number;
  end: number;
  total: number;
  link?: { href: string; rel: "next" | "prev" }[];
  career?: T[]; // For career lists
  industry?: T[]; // For industry list
  keyword?: string; // For keyword search response
  error?: string; // For API errors
}

// Interface for Industry item
export interface IndustryItem {
  href: string;
  code: number;
  title: string;
}

interface OnetTitleIdName {
  id: string;
  name: string;
}

interface OnetElementIdName {
  id: string;
  name: string;
}

export interface OnetDataGroup {
  title: OnetTitleIdName;
  element: OnetElementIdName[];
}

export interface KnowledgeReport {
  code?: string; // Usually matches the top-level code
  group?: OnetDataGroup[];
}

export interface SkillsReport {
  code?: string;
  group?: OnetDataGroup[];
}

export interface AbilitiesReport {
  code?: string;
  group?: OnetDataGroup[];
}

export interface PersonalityReport {
  code?: string;
  top_interest?: {
    id: string;
    title: string;
    description: string;
  };
  work_styles?: {
    element: OnetElementIdName[];
  };
}

export interface TechnologyExample {
  hot_technology?: string; // Can be a flag or an ID string
  name: string;
}

export interface TechnologyCategory {
  unspsc?: number;
  title: {
    name: string;
    hot_technology?: string; // Can be a flag or an ID string
  };
  example?: TechnologyExample[];
}

export interface TechnologyReport {
  code?: string;
  category?: TechnologyCategory[];
}

export interface EducationReport {
  code?: string;
  job_zone?: number;
  education_usually_needed?: {
    category?: string[];
  };
  apprenticeships?: { // As per documentation text, though not in example
    title: string;
    rapids_code: string; // Assuming this field name
  }[];
}

export interface JobOutlookReport {
  code?: string;
  outlook?: {
    description: string;
    category: "Bright" | "Average" | "Below Average";
  };
  bright_outlook?: {
    description: string;
    category?: string[]; // e.g., ["Grow Rapidly"]
  };
  salary?: {
    soc_code?: string;
    annual_10th_percentile?: number;
    annual_median?: number;
    annual_90th_percentile?: number;
    hourly_10th_percentile?: number;
    hourly_median?: number;
    hourly_90th_percentile?: number;
    annual_median_over?: number; // For values exceeding BLS max
    // Add other _over fields if needed: annual_10th_percentile_over, etc.
  };
}

export interface ExploreMoreCareerItem {
  href: string;
  code: string;
  title: string;
  tags?: {
    bright_outlook?: boolean;
    green?: boolean;
    apprenticeship?: boolean;
  };
}

export interface ExploreMoreIndustryItem {
  href: string;
  percent_employed: number;
  code: number; // industry code
  title: string;
}

export interface ExploreMoreReport {
  code?: string;
  careers?: {
    career?: ExploreMoreCareerItem[];
  };
  industries?: {
    soc_code?: string;
    industry?: ExploreMoreIndustryItem[];
  };
}

export interface WhereDoTheyWorkReport {
  code?: string;
  industry?: ExploreMoreIndustryItem[]; // Structure is similar to ExploreMore industries
}

// This is the Career Overview part, as previously defined but renamed for clarity
export interface CareerSimpleOverview {
  code: string;
  title: string;
  tags?: {
    bright_outlook?: boolean;
    green?: boolean;
    apprenticeship?: boolean;
  };
  also_called?: {
    title?: string[];
  };
  what_they_do?: string;
  on_the_job?: {
    task?: string[];
  };
  career_video?: boolean;
  resources?: { // These are links to other O*NET detail pages
    resource?: {
      href: string;
      title: string;
    }[];
  };
}

// The Full Career Report structure from mnm/careers/{code}/report
export interface CareerFullReport {
  code: string; // Top-level O*NET-SOC code
  career: CareerSimpleOverview; // The main overview data
  knowledge?: KnowledgeReport;
  skills?: SkillsReport;
  abilities?: AbilitiesReport;
  personality?: PersonalityReport;
  technology?: TechnologyReport;
  education?: EducationReport;
  job_outlook?: JobOutlookReport;
  check_out_my_state?: any; // Structure not fully defined in provided snippets
  explore_more?: ExploreMoreReport;
  where_do_they_work?: WhereDoTheyWorkReport;
}

/**
 * Fetches questions for the O*NET Interest Profiler
 * @returns Promise<{questions: OnetQuestion[], answerOptions: OnetAnswerOption[]}>
 */
export async function fetchInterestProfilerQuestions() {
  try {
    // We'll fetch in batches of 12 questions, starting with the first batch
    const questions: OnetQuestion[] = [];
    let start = 1;
    let end = 12;
    let hasMore = true;
    
    while (hasMore) {
      const url = `${API_BASE_URL}?path=mnm/interestprofiler/questions&start=${start}&end=${end}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add questions from this batch
      if (data.question && Array.isArray(data.question)) {
        questions.push(...data.question);
      }
      
      // Check if there are more questions to fetch
      hasMore = data.link && data.link.some((link: any) => link.rel === 'next');
      
      // Update start and end for next batch
      if (hasMore) {
        start += 12;
        end += 12;
      }
    }
    
    // Extract answer options from the first response (they're the same for all questions)
    const firstUrl = `${API_BASE_URL}?path=mnm/interestprofiler/questions&start=1&end=12`;
    const firstResponse = await fetch(firstUrl);
    
    if (!firstResponse.ok) {
      throw new Error(`Failed to fetch answer options: ${firstResponse.status} ${firstResponse.statusText}`);
    }
    
    const firstData = await firstResponse.json();
    // Ensure answer_options and answer_option exist before trying to access
    const answerOptions: OnetAnswerOption[] = 
      firstData.answer_options && firstData.answer_options.answer_option 
      ? firstData.answer_options.answer_option 
      : [];
    
    return { questions, answerOptions };
  } catch (error) {
    console.error('Error fetching O*NET Interest Profiler questions:', error);
    throw error;
  }
}

/**
 * Submits answers to the O*NET Interest Profiler and gets results
 * @param answers - A record of question indices and their answer values
 * @returns Promise<OnetResult[]>
 */
export async function submitInterestProfilerAnswers(answers: Record<number, number>) {
  try {
    // Convert answers object to a string of 60 digits
    const answerString = Array.from({ length: 60 }, (_, i) => 
      answers[i + 1] ? answers[i + 1].toString() : '3' // Default to 'Unsure' (3) for unanswered questions
    ).join('');
    
    const url = `${API_BASE_URL}?path=mnm/interestprofiler/results&answers=${answerString}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to submit answers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.result || !Array.isArray(data.result)) {
      // Check for O*NET API error structure
      if (data.error) {
        throw new Error(`O*NET API Error: ${data.error}`);
      }
      throw new Error('Invalid response structure from O*NET Web Services for results');
    }
    
    return data.result as OnetResult[];
  } catch (error) {
    console.error('Error submitting O*NET Interest Profiler answers:', error);
    throw error;
  }
}

/**
 * Gets careers matching a given interest area
 * @param interestArea - The interest area (e.g., "Realistic", "Investigative", etc.)
 * @param jobZone - Optional job zone filter (1-5)
 * @param start - Starting index for pagination (default: 1)
 * @param end - Ending index for pagination (default: 20)
 * @returns Promise<OnetListResponse<CareerFromList>>
 */
export async function getMatchingCareers(
  interestArea: string, 
  jobZone?: number,
  start: number = 1,
  end: number = 20
): Promise<OnetListResponse<CareerFromList>> {
  try {
    let url = `${API_BASE_URL}?path=mnm/interestprofiler/careers&area=${encodeURIComponent(interestArea)}&start=${start}&end=${end}`;
    
    if (jobZone) {
      url += `&job_zone=${jobZone}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch matching careers: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch matching careers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Normalize empty results
    if (data.career === null) {
      data.career = [];
    }
    
    return data as OnetListResponse<CareerFromList>;
  } catch (error) {
    console.error('Error fetching matching careers:', error);
    throw error;
  }
}

/**
 * Fetches all careers with pagination and sorting.
 * @param params - Object containing sort, start, end.
 * @returns Promise<OnetListResponse<CareerFromList>>
 */
export async function fetchAllCareers(params: {
  sort?: "name" | "bright_outlook" | "apprenticeship";
  start?: number;
  end?: number;
}): Promise<OnetListResponse<CareerFromList>> {
  try {
    const query = new URLSearchParams({
      sort: params.sort || "name",
      start: (params.start || 1).toString(),
      end: (params.end || 20).toString(),
    });
    const url = `${API_BASE_URL}?path=mnm/careers&${query.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch all careers: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch all careers: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`O*NET API Error: ${data.error}`);
    if (data.career === null) data.career = []; // Normalize null to empty array
    return data as OnetListResponse<CareerFromList>;
  } catch (error) {
    console.error('Error fetching all careers:', error);
    throw error;
  }
}

/**
 * Fetches the list of industries.
 * @returns Promise<OnetListResponse<IndustryItem>>
 */
export async function fetchIndustries(): Promise<OnetListResponse<IndustryItem>> {
  try {
    const url = `${API_BASE_URL}?path=mnm/browse`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch industries: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch industries: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`O*NET API Error: ${data.error}`);
    return data as OnetListResponse<IndustryItem>;
  } catch (error) {
    console.error('Error fetching industries:', error);
    throw error;
  }
}

/**
 * Fetches careers within a specific industry.
 * @param industryCode - The code of the industry.
 * @param params - Object containing category, sort, start, end.
 * @returns Promise<OnetListResponse<CareerFromList>>
 */
export async function fetchCareersByIndustry(
  industryCode: string | number,
  params: {
    category?: "all" | "Most" | "Some";
    sort?: "category" | "name" | "bright_outlook" | "apprenticeship" | "percent_employed";
    start?: number;
    end?: number;
  } = {}
): Promise<OnetListResponse<CareerFromList>> {
  try {
    const query = new URLSearchParams({
      category: params.category || "all",
      sort: params.sort || "category",
      start: (params.start || 1).toString(),
      end: (params.end || 20).toString(),
    });
    const url = `${API_BASE_URL}?path=mnm/browse/${industryCode}&${query.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch careers by industry: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch careers by industry: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`O*NET API Error: ${data.error}`);
    if (data.career === null) data.career = []; // Normalize null to empty array
    return data as OnetListResponse<CareerFromList>;
  } catch (error) {
    console.error(`Error fetching careers for industry ${industryCode}:`, error);
    throw error;
  }
}

/**
 * Searches careers by keyword.
 * @param keyword - The search term.
 * @param params - Object containing start, end.
 * @returns Promise<OnetListResponse<CareerFromList>>
 */
export async function searchCareersByKeyword(
  keyword: string,
  params: {
    start?: number;
    end?: number;
  } = {}
): Promise<OnetListResponse<CareerFromList>> {
  try {
    const query = new URLSearchParams({
      keyword: keyword,
      start: (params.start || 1).toString(),
      end: (params.end || 20).toString(),
    });
    const url = `${API_BASE_URL}?path=mnm/search&${query.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to search careers: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to search careers: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`O*NET API Error: ${data.error}`);
    if (data.career === null) data.career = []; // Normalize null to empty array
    return data as OnetListResponse<CareerFromList>;
  } catch (error) {
    console.error(`Error searching careers with keyword "${keyword}":`, error);
    throw error;
  }
}

/**
 * Fetches detailed information for a specific career using the full report endpoint.
 * @param code - The O*NET-SOC code for the career.
 * @returns Promise<CareerFullReport>
 */
export async function fetchCareerDetail(code: string): Promise<CareerFullReport> {
  try {
    // Use the /report endpoint to get all details in one call
    const url = `${API_BASE_URL}?path=mnm/careers/${encodeURIComponent(code)}/report`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch career full report: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch career full report: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) { // Check for O*NET API error structure
        throw new Error(`O*NET API Error: ${data.error}`);
    }
    // The top-level 'code' in the response should match the requested code.
    // The actual career overview data is nested under a 'career' property.
    return data as CareerFullReport;
  } catch (error) {
    console.error(`Error fetching career full report for code ${code}:`, error);
    throw error;
  }
}

/**
 * Fetches information about O*NET Job Zones.
 * @returns Promise<any> - The job zones data.
 */
export async function fetchJobZones(): Promise<any> {
  try {
    const url = `${API_BASE_URL}?path=mnm/interestprofiler/job_zones`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Failed to fetch job zones: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch job zones: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.error) { // Check for O*NET API error structure
        throw new Error(`O*NET API Error: ${data.error}`);
    }
    return data;
  } catch (error) {
    console.error('Error fetching job zones:', error);
    throw error;
  }
}

/**
 * Mock data to use as fallback if the API call fails
 */
export const mockQuestions: OnetQuestion[] = [
  { index: 1, area: "Realistic", text: "Build kitchen cabinets" },
  { index: 2, area: "Realistic", text: "Lay brick or tile" },
  { index: 3, area: "Investigative", text: "Study animal behavior" },
  { index: 4, area: "Investigative", text: "Develop a new medicine" },
  { index: 5, area: "Artistic", text: "Write books or plays" },
  { index: 6, area: "Artistic", text: "Play a musical instrument" },
  { index: 7, area: "Social", text: "Teach children how to read" },
  { index: 8, area: "Social", text: "Help people with personal problems" },
  { index: 9, area: "Enterprising", text: "Sell merchandise at a department store" },
  { index: 10, area: "Enterprising", text: "Manage a retail store" },
  { index: 11, area: "Conventional", text: "Organize and file records" },
  { index: 12, area: "Conventional", text: "Keep track of inventory" },
  { index: 13, area: "Realistic", text: "Repair household appliances" },
  { index: 14, area: "Investigative", text: "Study ways to reduce water pollution" },
  { index: 15, area: "Artistic", text: "Design artwork for magazines" },
  { index: 16, area: "Social", text: "Help conduct a group therapy session" },
  { index: 17, area: "Enterprising", text: "Buy and sell stocks and bonds" },
  { index: 18, area: "Conventional", text: "Develop a spreadsheet using computer software" },
  { index: 19, area: "Realistic", text: "Assemble electronic parts" },
  { index: 20, area: "Investigative", text: "Conduct chemical experiments" },
];

export const mockAnswerOptions: OnetAnswerOption[] = [
  { value: 1, name: "STRONGLY DISLIKE" },
  { value: 2, name: "DISLIKE" },
  { value: 3, name: "UNSURE" },
  { value: 4, name: "LIKE" },
  { value: 5, name: "STRONGLY LIKE" },
];

export const mockResults: OnetResult[] = [
  {
    area: "Realistic",
    score: 15,
    description: "People with Realistic interests like work that includes practical, hands-on problems and answers. They like working with plants, animals, and materials like wood, tools, and machinery. They often enjoy working outdoors."
  },
  {
    area: "Investigative",
    score: 20,
    description: "People with Investigative interests like work that has to do with ideas and thinking rather than physical activity. They like searching for facts and figuring out problems."
  },
  {
    area: "Artistic",
    score: 18,
    description: "People with Artistic interests like work that deals with the artistic side of things, such as acting, music, art, and design. They like creativity in their work and work that can be done without following a clear set of rules."
  },
  {
    area: "Social",
    score: 25,
    description: "People with Social interests like working with others to help them learn and grow. They like working with people more than working with objects, machines, or information."
  },
  {
    area: "Enterprising",
    score: 22,
    description: "People with Enterprising interests like work that has to do with starting up and carrying out business projects. They like taking action rather than thinking about things."
  },
  {
    area: "Conventional",
    score: 12,
    description: "People with Conventional interests like work that follows set procedures and routines. They prefer working with information and paying attention to details rather than working with ideas."
  },
];
