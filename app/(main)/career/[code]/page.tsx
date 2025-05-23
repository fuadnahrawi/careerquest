"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Share2,
  Loader2,
  Briefcase,
  Lightbulb,
  Zap,
  Brain,
  UserCheck,
  Laptop,
  GraduationCap,
  TrendingUp,
  Building,
  MapPin,
  ExternalLink,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchCareerDetail,
  CareerFullReport,
  OnetDataGroup,
} from "@/utils/onet-service";
import { toast } from "sonner";
import { SaveCareerModal } from "@/components/save-career-modal";

// Mapping for job zones
const JOB_ZONE_DESCRIPTIONS: Record<number, string> = {
  1: "Job Zone One: Little or No Preparation Needed",
  2: "Job Zone Two: Some Preparation Needed",
  3: "Job Zone Three: Medium Preparation Needed",
  4: "Job Zone Four: Considerable Preparation Needed",
  5: "Job Zone Five: Extensive Preparation Needed",
};

// Helper component to render grouped O*NET data (Knowledge, Skills, Abilities)
const OnetGroupDataDisplay: React.FC<{
  data?: { group?: OnetDataGroup[] };
  title: string;
  icon?: React.ReactNode;
}> = ({ data, title, icon }) => {
  if (!data?.group || data.group.length === 0) {
    return (
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-muted-foreground">
            No {title.toLowerCase()} information available for this career.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {data.group.map((groupItem, index) => (
          <div key={groupItem.title.id || index}>
            <h4 className="font-medium text-primary">{groupItem.title.name}</h4>
            <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-muted-foreground">
              {groupItem.element.map((elementItem) => (
                <li key={elementItem.id}>{elementItem.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function CareerDetailPage() {
  const { code } = useParams();
  const [career, setCareer] = useState<CareerFullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Check if this career is already saved by the user
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        if (!code) return;

        const response = await fetch(
          `/api/saves/check?careerCode=${code}&type=career`
        );
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
          setSavedId(data.savedId);
        }
      } catch (error) {
        console.error("Error checking if career is saved:", error);
      }
    };

    checkIfSaved();
  }, [code]);

  useEffect(() => {
    const loadCareerDetails = async () => {
      if (!code) return;
      setLoading(true);
      setApiError(null);
      try {
        const fetchedCareer = await fetchCareerDetail(code as string);
        setCareer(fetchedCareer);
      } catch (error: any) {
        console.error("Error fetching career details:", error);
        setApiError(error.message || "Could not load career details.");
        toast.error(error.message || "Failed to load career details.");
        setCareer(null);
      } finally {
        setLoading(false);
      }
    };

    loadCareerDetails();
  }, [code]);

  // Handle career save/unsave
  const handleSaveAction = () => {
    if (isSaved && savedId) {
      // If already saved, ask for confirmation to remove from saved
      if (confirm("Remove this career from your saved items?")) {
        deleteSavedCareer(savedId);
      }
    } else {
      // If not saved, open the save modal
      setIsSaveModalOpen(true);
    }
  };

  // Function to delete a saved career
  const deleteSavedCareer = async (id: string) => {
    try {
      const response = await fetch("/api/saves/career", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setIsSaved(false);
        setSavedId(null);
        toast.success("Career removed from saved items");
      } else {
        throw new Error("Failed to remove from saved items");
      }
    } catch (error: any) {
      console.error("Error deleting saved career:", error);
      toast.error(error.message || "Failed to remove from saved items");
    }
  };

  // Callback when save is successful
  const onSaveSuccess = (savedData: any) => {
    setIsSaved(true);
    setSavedId(savedData._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (apiError || !career) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">
          {apiError ? "Error Loading Career" : "Career not found"}
        </h1>
        <p className="mt-4">
          {apiError ||
            "The career you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/exploration">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Career Exploration
          </Link>
        </Button>
      </div>
    );
  }

  // Destructure for easier access, using the 'career' object from the full report
  const {
    career: careerOverview,
    knowledge,
    skills,
    abilities,
    personality,
    technology,
    education,
    job_outlook,
    explore_more,
    where_do_they_work,
  } = career;

  return (
    <div className="container py-8 px-4 md:px-16 lg:px-32 xl:px-52">
      <div className="mb-8">
        <Link href="/exploration">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Career List
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{careerOverview.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {careerOverview.code}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={handleSaveAction}
            >
              <Bookmark className="mr-2 h-4 w-4" /> {isSaved ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground">
          {careerOverview.what_they_do || "No description available."}
        </p>
        {careerOverview.tags?.bright_outlook && (
          <Badge className="mt-2 mr-2">Bright Outlook</Badge>
        )}
        {careerOverview.tags?.apprenticeship && (
          <Badge variant="secondary" className="mt-2">
            Apprenticeship
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="educationOutlook">
            Education & Outlook
          </TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="explore">Explore More</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-semibold">
                What They Do
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p>
                {careerOverview.what_they_do ||
                  "Detailed description not available."}
              </p>
            </CardContent>
          </Card>

          {careerOverview.on_the_job?.task &&
            careerOverview.on_the_job.task.length > 0 && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold">
                    On The Job (Sample Tasks)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {careerOverview.on_the_job.task.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {careerOverview.also_called?.title &&
            careerOverview.also_called.title.length > 0 && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Also Called
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-wrap gap-2">
                    {careerOverview.also_called.title.map((title, index) => (
                      <Badge key={index} variant="outline">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          {careerOverview.career_video && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Career Video
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  A video for this career is available. Visit
                  <a
                    href="https://www.careeronestop.org/Videos/CareerVideos/career-videos.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    CareerOneStop
                  </a>{" "}
                  for options to view or embed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-8">
          <OnetGroupDataDisplay
            data={knowledge}
            title="Knowledge"
            icon={<Lightbulb size={20} />}
          />
          <OnetGroupDataDisplay
            data={skills}
            title="Skills"
            icon={<Zap size={20} />}
          />
          <OnetGroupDataDisplay
            data={abilities}
            title="Abilities"
            icon={<Brain size={20} />}
          />

          {personality &&
            (personality.top_interest || personality.work_styles?.element) && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <UserCheck size={20} className="mr-2" />
                    Personality
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {personality.top_interest && (
                    <div>
                      <h4 className="font-medium text-primary">
                        Top Interest: {personality.top_interest.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {personality.top_interest.description}
                      </p>
                    </div>
                  )}
                  {personality.work_styles?.element &&
                    personality.work_styles.element.length > 0 && (
                      <div>
                        <h4 className="font-medium text-primary mt-3">
                          Work Styles
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-muted-foreground">
                          {personality.work_styles.element.map((style) => (
                            <li key={style.id}>{style.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="educationOutlook" className="space-y-8">
          {education &&
            (education.job_zone ||
              education.education_usually_needed?.category) && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <GraduationCap size={20} className="mr-2" />
                    Education & Preparation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  {education.job_zone && (
                    <div className="text-sm">
                      <strong className="text-primary">Job Zone:</strong>{" "}
                      <Link
                        href={`/jobzone/${education.job_zone}`}
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        {education.job_zone} -{" "}
                        {JOB_ZONE_DESCRIPTIONS[education.job_zone] ||
                          `Job Zone ${education.job_zone}`}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  )}
                  {education.education_usually_needed?.category &&
                    education.education_usually_needed.category.length > 0 && (
                      <div>
                        <strong className="text-primary text-sm">
                          Education Usually Needed:
                        </strong>
                        <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-muted-foreground">
                          {education.education_usually_needed.category.map(
                            (cat, idx) => (
                              <li key={idx}>{cat}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {education.apprenticeships &&
                    education.apprenticeships.length > 0 && (
                      <div>
                        <strong className="text-primary text-sm">
                          Apprenticeships:
                        </strong>
                        <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-muted-foreground">
                          {education.apprenticeships.map((app, idx) => (
                            <li key={idx}>
                              {app.title} (Code: {app.rapids_code})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          {job_outlook &&
            (job_outlook.outlook ||
              job_outlook.bright_outlook ||
              job_outlook.salary) && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp size={20} className="mr-2" />
                    Job Outlook & Salary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3 text-sm">
                  {job_outlook.outlook && (
                    <div>
                      <strong className="text-primary">Outlook:</strong>{" "}
                      {job_outlook.outlook.category}
                      <p className="text-muted-foreground text-xs">
                        {job_outlook.outlook.description}
                      </p>
                    </div>
                  )}
                  {job_outlook.bright_outlook?.category &&
                    job_outlook.bright_outlook.category.length > 0 && (
                      <div>
                        <strong className="text-primary">
                          Bright Outlook Details:
                        </strong>
                        <ul className="list-disc pl-5 space-y-1 mt-1 text-muted-foreground text-xs">
                          {job_outlook.bright_outlook.category.map(
                            (cat, idx) => (
                              <li key={idx}>{cat}</li>
                            )
                          )}
                        </ul>
                        <p className="text-muted-foreground text-xs mt-1">
                          {job_outlook.bright_outlook.description}
                        </p>
                      </div>
                    )}
                  {job_outlook.salary && (
                    <div className="mt-2">
                      <strong className="text-primary">Salary (Annual):</strong>
                      <ul className="list-disc pl-5 space-y-1 mt-1 text-muted-foreground">
                        {job_outlook.salary.annual_10th_percentile && (
                          <li>
                            10th Percentile: $
                            {job_outlook.salary.annual_10th_percentile.toLocaleString()}
                          </li>
                        )}
                        {job_outlook.salary.annual_median && (
                          <li>
                            Median: $
                            {job_outlook.salary.annual_median.toLocaleString()}
                          </li>
                        )}
                        {job_outlook.salary.annual_90th_percentile && (
                          <li>
                            90th Percentile: $
                            {job_outlook.salary.annual_90th_percentile.toLocaleString()}
                          </li>
                        )}
                        {job_outlook.salary.annual_median_over && (
                          <li className="text-amber-600">
                            Median: Over $
                            {job_outlook.salary.annual_median_over.toLocaleString()}{" "}
                            (Exceeds BLS reporting limit)
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="technology" className="space-y-8">
          {technology?.category && technology.category.length > 0 ? (
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Laptop size={20} className="mr-2" />
                  Technology Used
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {technology.category.map((cat, index) => (
                  <div key={cat.unspsc || index}>
                    <h4 className="font-medium text-primary flex items-center">
                      {cat.title.name}
                      {cat.title.hot_technology && (
                        <span className="ml-2 cursor-help" title="Hot Tech">
                          🔥
                        </span>
                      )}
                    </h4>
                    {cat.example && cat.example.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-muted-foreground">
                        {cat.example.map((ex, exIdx) => (
                          <li key={exIdx} className="flex items-center">
                            {ex.name}
                            {ex.hot_technology && (
                              <span
                                className="ml-2 cursor-help"
                                title="Hot Tech"
                              >
                                🔥
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Laptop size={20} className="mr-2" />
                  Technology Used
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  No specific technology information available for this career.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="explore" className="space-y-8">
          {explore_more?.careers?.career &&
            explore_more.careers.career.length > 0 && (
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Briefcase size={20} className="mr-2" />
                    Related Careers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {explore_more.careers.career.map((relatedCareer) => (
                    <Link
                      key={relatedCareer.code}
                      href={`/career/${relatedCareer.code}`}
                      className="block p-3 border rounded-md hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium text-primary">
                        {relatedCareer.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {relatedCareer.code}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          {where_do_they_work?.industry &&
          where_do_they_work.industry.length > 0 ? ( // Using where_do_they_work as primary source for industries
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Building size={20} className="mr-2" />
                  Top Industries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2">
                  {where_do_they_work.industry.map((ind) => (
                    <li key={ind.code} className="text-sm p-2 border-b">
                      <span className="font-medium">{ind.title}</span>
                      <span className="text-muted-foreground ml-2">
                        ({ind.percent_employed}% employed)
                      </span>
                      <Link
                        href={`/exploration?view=industry&industry=${ind.code}`}
                        className="text-primary hover:underline ml-2 text-xs inline-flex items-center"
                      >
                        Explore Industry{" "}
                        <ExternalLink size={12} className="ml-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            explore_more?.industries?.industry &&
            explore_more.industries.industry.length > 0 && ( // Fallback to explore_more for industries
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Building size={20} className="mr-2" />
                    Top Industries
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-2">
                    {explore_more.industries.industry.map((ind) => (
                      <li key={ind.code} className="text-sm p-2 border-b">
                        <span className="font-medium">{ind.title}</span>
                        <span className="text-muted-foreground ml-2">
                          ({ind.percent_employed}% employed)
                        </span>
                        <Link
                          href={`/exploration?view=industry&industry=${ind.code}`}
                          className="text-primary hover:underline ml-2 text-xs inline-flex items-center"
                        >
                          Explore Industry{" "}
                          <ExternalLink size={12} className="ml-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          )}
          {(!explore_more?.careers?.career ||
            explore_more.careers.career.length === 0) &&
            (!where_do_they_work?.industry ||
              where_do_they_work.industry.length === 0) &&
            (!explore_more?.industries?.industry ||
              explore_more.industries.industry.length === 0) && (
              <Card className="p-6">
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    No related careers or industry information available.
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-8">
          <Card className="p-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">Job Postings</h2>
              <p className="text-muted-foreground mb-6">
                Find job openings for this career on external job boards.
              </p>
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedTitle = careerOverview.title.replace(
                      /\s+/g,
                      "+"
                    );
                    const indeedUrl = `https://malaysia.indeed.com/jobs?q=${formattedTitle}&l=&from=searchOnHP%2Cwhatautocomplete%2CwhatautocompleteSourceStandard`;
                    window.open(indeedUrl, "_blank");
                  }}
                >
                  <img
                    src="/jobportallogo/svg-indeed.svg"
                    alt="Indeed"
                    className="h-4 mr-2"
                  />
                  Search on Indeed <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedTitle = careerOverview.title
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const jobstreetUrl = `https://my.jobstreet.com/${formattedTitle}-jobs`;
                    window.open(jobstreetUrl, "_blank");
                  }}
                >
                  <img
                    src="/jobportallogo/svg-jobstreet.svg"
                    alt="JobStreet"
                    className="h-4 mr-2"
                  />
                  Search on JobStreet <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const formattedTitle = careerOverview.title
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const myFutureJobs = `https://candidates.myfuturejobs.gov.my/search-jobs/description?jobId=db800e1b5e84412da83ef1cad437a7b3&what=${formattedTitle}`;
                    window.open(myFutureJobs, "_blank");
                  }}
                >
                  <img
                    src="/jobportallogo/svg-myfuturejobs.svg"
                    alt="MyFutureJobs"
                    className="h-4 mr-2"
                  />
                  Search on MyFutureJobs{" "}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="default"
                  onClick={() => {
                    const formattedTitle = careerOverview.title
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const mauKerjaUrl = `https://www.maukerja.my/en/jobsearch/${formattedTitle}-jobs?sortBy=relevance`;
                    window.open(mauKerjaUrl, "_blank");
                  }}
                >
                  <img
                    src="https://files.ajobthing.com/assets/logo/maukerja/v6-logo-desktop.svg"
                    alt="MauKerja"
                    className="h-4 mr-2"
                  />
                  Search on MauKerja <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button asChild>
          <Link
            href={`/roadmap?career=${
              careerOverview.code
            }&title=${encodeURIComponent(careerOverview.title)}`}
          >
            Build Your Skill Roadmap for {careerOverview.title}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Save Career Modal */}
      <SaveCareerModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        careerCode={career?.career?.code || ""}
        careerTitle={career?.career?.title || ""}
        onSaveSuccess={onSaveSuccess}
      />
    </div>
  );
}
