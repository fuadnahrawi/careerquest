// Base URL for the Gemini API - using gemini-2.0-flash model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  timeframe: string; // e.g., "0-3 months", "3-6 months", etc.
  resources?: {
    name: string;
    url: string;
  }[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface SkillRoadmapResponse {
  careerTitle: string;
  skillNodes: SkillNode[];
}

/**
 * Generate a skill roadmap using Gemini API
 * @param careerDetails - The career details to generate a roadmap for
 * @returns Promise<SkillRoadmapResponse> - The generated roadmap
 */
export async function generateSkillRoadmap(careerDetails: any): Promise<SkillRoadmapResponse> {
  try {
    // If no API key is provided, return a mock response
    if (!API_KEY || API_KEY === '') {
      console.warn('Using mock response because no API key was provided');
      return mockGenerateSkillRoadmap(careerDetails.title);
    }
    
    const url = `${GEMINI_API_URL}?key=${API_KEY}`;
    
    // Construct the prompt for the Gemini API
    const prompt = `
    You are a career development expert specializing in creating personalized skill development roadmaps.
    
    Please analyze the career details below and create a comprehensive skill development roadmap for someone pursuing this career.
    
    Career Details:
    ${JSON.stringify(careerDetails, null, 2)}
    
    Please respond with ONLY a JSON object (no explanations, preambles, or additional text) that follows this structure:
    
    {
      "careerTitle": "The career title",
      "skillNodes": [
        {
          "id": "skill-1",
          "title": "Skill name",
          "description": "Brief description of the skill and why it's important",
          "timeframe": "0-3 months",
          "resources": [
            {
              "name": "Resource name",
              "url": "Resource URL"
            }
          ],
          "difficulty": "Beginner" | "Intermediate" | "Advanced"
        },
        // ... more skills
      ]
    }
    
    Create 8-10 skill nodes total, organized in a logical progression from fundamental to advanced skills.
    Make sure skills build upon one another where appropriate.
    The roadmap should cover both technical and soft skills required for the career.
    Provide realistic timeframes for each skill (0-3 months, 3-6 months, 6-12 months, 1-2 years).
    For resources, include a mix of online courses, books, and practice opportunities.
    Make sure the JSON is valid and properly formatted.
    Return ONLY the JSON object with no additional text.
    `;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };
    
    // Log request details for debugging (sanitized API key)
    console.log('Request URL:', GEMINI_API_URL);
    
    // Make the API request
    console.log('Making request to Gemini API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    
    // Log the complete API response for debugging
    console.log('Full Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected API response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Log the extracted text response
    console.log('Gemini API text response:', responseText);
    
    // Extract the JSON object from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from response:', responseText);
      throw new Error("Failed to extract valid JSON from the API response");
    }

    console.log('Extracted JSON from response:', jsonMatch[0]);

    const roadmapData = JSON.parse(jsonMatch[0]) as SkillRoadmapResponse;
    
    // Log the parsed roadmap data
    console.log('Parsed roadmap data:', JSON.stringify(roadmapData, null, 2));
    
    return roadmapData;
  } catch (error) {
    console.error("Error generating skill roadmap:", error);
    throw error;
  }
}

// Mock function for development when API isn't available
export async function mockGenerateSkillRoadmap(careerTitle: string): Promise<SkillRoadmapResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return {
    careerTitle: careerTitle,
    skillNodes: [
      {
        id: "skill-1",
        title: "Learn Basic Programming Concepts",
        description: "Master fundamental programming concepts including variables, data types, control structures, and functions.",
        timeframe: "0-3 months",
        resources: [
          {
            name: "Codecademy - Learn Programming",
            url: "https://www.codecademy.com/"
          },
          {
            name: "CS50: Introduction to Computer Science",
            url: "https://cs50.harvard.edu/college/2023/fall/"
          }
        ],
        difficulty: "Beginner"
      },
      {
        id: "skill-2",
        title: "Object-Oriented Programming",
        description: "Understand OOP principles including classes, objects, inheritance, polymorphism, and encapsulation.",
        timeframe: "0-3 months",
        resources: [
          {
            name: "Object-Oriented Programming in Java",
            url: "https://www.coursera.org/learn/object-oriented-java"
          }
        ],
        difficulty: "Beginner"
      },
      {
        id: "skill-3",
        title: "Version Control with Git",
        description: "Learn to manage code repositories, track changes, and collaborate using Git and GitHub.",
        timeframe: "0-3 months",
        resources: [
          {
            name: "Git - The Simple Guide",
            url: "https://rogerdudler.github.io/git-guide/"
          },
          {
            name: "GitHub Learning Lab",
            url: "https://lab.github.com/"
          }
        ],
        difficulty: "Beginner"
      },
      {
        id: "skill-4",
        title: "Frontend Development",
        description: "Master HTML, CSS, and JavaScript to build interactive user interfaces.",
        timeframe: "3-6 months",
        resources: [
          {
            name: "MDN Web Docs",
            url: "https://developer.mozilla.org/"
          },
          {
            name: "Frontend Masters",
            url: "https://frontendmasters.com/"
          }
        ],
        difficulty: "Intermediate"
      },
      {
        id: "skill-5",
        title: "Backend Development",
        description: "Learn server-side programming, API design, and database management.",
        timeframe: "3-6 months",
        resources: [
          {
            name: "Node.js Documentation",
            url: "https://nodejs.org/en/docs/"
          },
          {
            name: "MongoDB University",
            url: "https://university.mongodb.com/"
          }
        ],
        difficulty: "Intermediate"
      },
      {
        id: "skill-6",
        title: "Software Testing",
        description: "Understand different testing methodologies and tools to ensure code quality.",
        timeframe: "6-12 months",
        resources: [
          {
            name: "Test Automation University",
            url: "https://testautomationu.applitools.com/"
          }
        ],
        difficulty: "Intermediate"
      },
      {
        id: "skill-7",
        title: "System Design",
        description: "Learn to design scalable, resilient software systems and architectures.",
        timeframe: "1-2 years",
        resources: [
          {
            name: "System Design Primer",
            url: "https://github.com/donnemartin/system-design-primer"
          }
        ],
        difficulty: "Advanced"
      },
      {
        id: "skill-8",
        title: "DevOps and Deployment",
        description: "Master CI/CD pipelines, containerization, and cloud deployment.",
        timeframe: "1-2 years",
        resources: [
          {
            name: "Docker Documentation",
            url: "https://docs.docker.com/"
          },
          {
            name: "AWS Training and Certification",
            url: "https://aws.amazon.com/training/"
          }
        ],
        difficulty: "Advanced"
      }
    ]
  };
}