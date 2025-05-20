"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  contact: z.string().min(5, { message: "Contact information is required" }),
  role: z.enum(["Student", "Lecturer", "Admin"], { 
    required_error: "Role is required" 
  }).default("Student"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

// Helper function to generate user ID from name with random numbers
const generateUserId = (name: string): string => {
  const namePart = name.trim().toLowerCase().split(' ')[0]; // Take first name
  const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
  return `${namePart}${randomNumbers}`;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showAdminUnlock, setShowAdminUnlock] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      contact: "",
      role: "Student",
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    
    try {
      // Generate userId from name with 4 random numbers
      const userId = generateUserId(data.name);
      
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId // Add the generated userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to register")
      }

      toast.success("Registration successful! Please sign in.")
      router.push("/login")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="relative hidden bg-muted md:block">
            <img
              src="/welcome.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your details to create a new account
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  disabled={isLoading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  type="text"
                  disabled={isLoading}
                  {...register("contact")}
                />
                {errors.contact && (
                  <p className="text-xs text-red-500">{errors.contact.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("role")}
                  onChange={e => setShowAdminUnlock(e.target.value === "Admin")}
                >
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Admin" disabled>Admin</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch id="show-admin-unlock" checked={showAdminUnlock} onCheckedChange={setShowAdminUnlock} />
                <Label htmlFor="show-admin-unlock" className="text-sm">Show Admin Unlock Code</Label>
              </div>
              
              {showAdminUnlock && (
                <div className="grid gap-2">
                  <Label htmlFor="adminPassword">Admin Unlock Code</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Required only for Admin role"
                    disabled={isLoading}
                    onChange={(e) => {
                      const selectElement = document.getElementById("role") as HTMLSelectElement;
                      if (selectElement) {
                        const adminOption = selectElement.querySelector('option[value="Admin"]');
                        if (adminOption) {
                          (adminOption as HTMLOptionElement).disabled = e.target.value !== "0000";
                        }
                      }
                    }}
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4 text-primary hover:underline">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}