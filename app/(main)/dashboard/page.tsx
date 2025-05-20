import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const features = [
    {
      title: "Take Career Assessment",
      description: "Discover your strengths and interests",
      image: "/join.svg",
      link: "/assessment"
    },
    {
      title: "Explore Career Paths",
      description: "Find careers that match your profile",
      image: "/ideaFlow.svg",
      link: "/exploration"
    },
    {
      title: "View Your Skill Roadmap",
      description: "See what skills you need to develop",
      image: "/hello.svg",
      link: "/roadmap"
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-slate-700 to-slate-300 px-54">
        <div className="container py-18 md:py-28 md:pb-58">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <p className="text-sm md:text-base font-medium text-white/90">Our Vision</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Unlock Your Career Potential
              </h1>
              <p className="text-sm md:text-base text-white/80 max-w-md">
                Explore your interests, discover potential career paths, and unlock
                your future with our intuitive web-based career assessment tool.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Discover your passion</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Personalized career insight</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Guided career pathways</span>
                </li>
              </ul>

              <Button asChild size="lg" className="mt-4">
                <Link href="/assessment">
                  Start Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="hidden md:flex justify-center">
              <div className=" px-6">
                <img 
                  src="/happy-news.svg" 
                  alt="Career Assessment" 
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-18 px-44">
        <div className="text-center mb-12">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Features</h2>
          <h3 className="text-2xl md:text-3xl font-bold">State the art of Passion</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-muted/40 border-0">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-muted aspect-square w-full max-w-[200px] rounded-md mb-6 flex items-center justify-center">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-3/4 h-3/4 object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <Button asChild variant="outline" size="sm" className="mt-auto">
                  <Link href={feature.link}>
                    Start Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
