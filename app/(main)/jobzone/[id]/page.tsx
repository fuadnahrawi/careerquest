"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobZoneDetail {
  id: number;
  title: string;
  description: string;
  education: string;
  experience: string;
  training: string;
  examples: string;
  svpRange: string;
}

const JOB_ZONE_DETAILS: Record<number, JobZoneDetail> = {
  1: {
    id: 1,
    title: "Job Zone One: Little or No Preparation Needed",
    description: "Occupations that need little or no preparation",
    education: "Some of these occupations may require a high school diploma or GED certificate.",
    experience: "Little or no previous work-related skill, knowledge, or experience is needed for these occupations. For example, a person can become a waiter or waitress even if he/she has never worked before.",
    training: "Employees in these occupations need anywhere from a few days to a few months of training. Usually, an experienced worker could show you how to do the job.",
    examples: "These occupations involve following instructions and helping others. Examples include agricultural equipment operators, dishwashers, floor sanders and finishers, landscaping and groundskeeping workers, logging equipment operators, baristas, and maids and housekeeping cleaners.",
    svpRange: "Below 4.0"
  },
  2: {
    id: 2,
    title: "Job Zone Two: Some Preparation Needed",
    description: "Occupations that need some preparation",
    education: "These occupations usually require a high school diploma.",
    experience: "Some previous work-related skill, knowledge, or experience is usually needed. For example, a teller would benefit from experience working directly with the public.",
    training: "Employees in these occupations need anywhere from a few months to one year of working with experienced employees. A recognized apprenticeship program may be associated with these occupations.",
    examples: "These occupations often involve using your knowledge and skills to help others. Examples include orderlies, counter and rental clerks, customer service representatives, security guards, upholsterers, tellers, and dental laboratory technicians.",
    svpRange: "4.0 to < 6.0"
  },
  3: {
    id: 3,
    title: "Job Zone Three: Medium Preparation Needed",
    description: "Occupations that need medium preparation",
    education: "Most occupations in this zone require training in vocational schools, related on-the-job experience, or an associate's degree.",
    experience: "Previous work-related skill, knowledge, or experience is required for these occupations. For example, an electrician must have completed three or four years of apprenticeship or several years of vocational training, and often must have passed a licensing exam, in order to perform the job.",
    training: "Employees in these occupations usually need one or two years of training involving both on-the-job experience and informal training with experienced workers. A recognized apprenticeship program may be associated with these occupations.",
    examples: "These occupations usually involve using communication and organizational skills to coordinate, supervise, manage, or train others to accomplish goals. Examples include hydroelectric production managers, desktop publishers, electricians, agricultural technicians, barbers, court reporters and simultaneous captioners, and medical assistants.",
    svpRange: "6.0 to < 7.0"
  },
  4: {
    id: 4,
    title: "Job Zone Four: Considerable Preparation Needed",
    description: "Occupations that need considerable preparation",
    education: "Most of these occupations require a four-year bachelor's degree, but some do not.",
    experience: "A considerable amount of work-related skill, knowledge, or experience is needed for these occupations. For example, an accountant must complete four years of college and work for several years in accounting to be considered qualified.",
    training: "Employees in these occupations usually need several years of work-related experience, on-the-job training, and/or vocational training.",
    examples: "Many of these occupations involve coordinating, supervising, managing, or training others. Examples include real estate brokers, sales managers, database administrators, graphic designers, conservation scientists, art directors, and cost estimators.",
    svpRange: "7.0 to < 8.0"
  },
  5: {
    id: 5,
    title: "Job Zone Five: Extensive Preparation Needed",
    description: "Occupations that need extensive preparation",
    education: "Most of these occupations require graduate school. For example, they may require a master's degree, and some require a Ph.D., M.D., or J.D. (law degree).",
    experience: "Extensive skill, knowledge, and experience are needed for these occupations. Many require more than five years of experience. For example, surgeons must complete four years of college and an additional five to seven years of specialized medical training to be able to do their job.",
    training: "Employees may need some on-the-job training, but most of these occupations assume that the person will already have the required skills, knowledge, work-related experience, and/or training.",
    examples: "These occupations often involve coordinating, training, supervising, or managing the activities of others to accomplish goals. Very advanced communication and organizational skills are required. Examples include pharmacists, lawyers, astronomers, biologists, clergy, physician assistants, and veterinarians.",
    svpRange: "7.0 to < 8.0"
  }
};

export default function JobZoneDetailPage() {
  const { id } = useParams();
  const [jobZone, setJobZone] = useState<JobZoneDetail | null>(null);
  
  useEffect(() => {
    // Parse the job zone ID and fetch details
    const zoneId = parseInt(id as string, 10);
    if (zoneId >= 1 && zoneId <= 5) {
      setJobZone(JOB_ZONE_DETAILS[zoneId]);
    }
  }, [id]);

  if (!jobZone) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Job Zone Not Found</h1>
        <p className="mt-4">
          The job zone you're looking for doesn't exist. Job zones range from 1 to 5.
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

  return (
    <div className="container py-8 px-4 md:px-16 lg:px-32 xl:px-52">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/exploration">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Career Exploration
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold">{jobZone.title}</h1>
        <p className="text-muted-foreground mt-2">{jobZone.description}</p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A Job Zone is a group of occupations that are similar in:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>how much education people need to do the work,</li>
              <li>how much related experience people need to do the work, and</li>
              <li>how much on-the-job training people need to do the work.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobZone.education}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Related Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobZone.experience}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Training</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobZone.training}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobZone.examples}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>SVP Range</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobZone.svpRange}</p>
            <p className="text-sm text-muted-foreground mt-2">
              SVP (Specific Vocational Preparation) is a measure of how much time is required to learn the techniques and skills needed for an occupation.
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">All Job Zones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(JOB_ZONE_DETAILS).map(zone => (
              <Link 
                key={zone.id} 
                href={`/jobzone/${zone.id}`}
                className={`p-4 rounded-md border hover:border-primary transition-colors ${zone.id === jobZone.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="font-medium">Job Zone {zone.id}</div>
                <div className="text-sm text-muted-foreground truncate">{zone.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
