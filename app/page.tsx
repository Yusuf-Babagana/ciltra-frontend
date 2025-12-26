import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { GraduationCap, Shield, Award, Clock, CheckCircle, TrendingUp, Users, FileCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Professional Certification Platform
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Advance your career with industry-recognized certifications. Take secure online exams and earn verified
              credentials trusted by employers worldwide.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 bg-transparent">
                <Link href="/exams">Browse Exams</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="mt-4 text-3xl font-bold">50,000+</div>
                <div className="mt-1 text-sm text-muted-foreground">Certified Professionals</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-primary" />
                <div className="mt-4 text-3xl font-bold">200+</div>
                <div className="mt-1 text-sm text-muted-foreground">Available Certifications</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="mt-4 text-3xl font-bold">98%</div>
                <div className="mt-1 text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-8 w-8 text-primary" />
                <div className="mt-4 text-3xl font-bold">100%</div>
                <div className="mt-1 text-sm text-muted-foreground">Secure & Verified</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Why Choose CertifyPro</h2>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
              Industry-leading certification platform trusted by professionals and organizations worldwide
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Flexible Scheduling</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Take exams on your schedule with our 24/7 online testing platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Secure Testing</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Advanced proctoring and security measures ensure exam integrity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Instant Results</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Get your exam results immediately after completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Verified Certificates</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Download official certificates with unique verification codes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Expert Content</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Exams designed by industry experts and updated regularly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Career Growth</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Boost your career with industry-recognized credentials
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Certified?</h2>
              <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
                Join thousands of professionals who have advanced their careers with our certifications
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild className="h-12 px-8">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 bg-transparent">
                  <Link href="/verify">Verify Certificate</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2025 CertifyPro. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/verify" className="text-sm text-muted-foreground hover:text-foreground">
                Verify Certificate
              </Link>
              <Link href="/exams" className="text-sm text-muted-foreground hover:text-foreground">
                Examinations
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
