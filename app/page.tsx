import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import {
  GraduationCap,
  Shield,
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
  Globe,
  FileCheck,
  Search,
  BookOpen,
  ArrowRight,
  Users
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden bg-blue-50 dark:bg-slate-950 pt-20 pb-32 md:pt-32 md:pb-48">
          {/* Background Gradient / Image Layer */}
          <div className="absolute inset-0 z-0">
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-950/80 dark:to-slate-950 z-10" />

            {/* Background Image (User provided) - Reduced opacity for subtle texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none flex items-center justify-center">
              <div className="relative w-[800px] h-[800px]">
                <Image
                  src="https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/505180011_1214676324036208_4156852350019206314_n.jpg?_nc_cat=100&_nc_cb=99be929b-f3b7c874&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEbdWqux3AQI3CUmCp32IJSR1yJARlnLNdHXIkBGWcs10t3_56DSa6WvNiY7XpWnImurHmM3XGNDoIS52MdVx1g&_nc_ohc=tz5COX9Bte8Q7kNvwG0ZK5t&_nc_oc=AdnafrQwkK-fvoSuZhwdlFLrglXdQ0yqaGbv93BB4GJ4M633DNQghqIJczYq3iM6m182qzI14p4ogoAEV4-HYupt&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=_US9hIcVh5d1-7ymG4LfZQ&oh=00_Afrk0Dxn9KV6iORGOaDYBBz_5wadL7xnDqs3jJ_0vTGSOQ&oe=696B028A"
                  alt="CILTRA Emblem"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="container relative z-20 mx-auto px-4 text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold mb-8 uppercase tracking-wider dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
              <Shield className="w-3 h-3" /> Official CILTRA Certification Platform
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl mb-6">
              Certified Professional Translator (CPT) Certification Platform <span className="text-primary relative inline-block">
                -
                {/* Underline decoration */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
              Earn the <strong>Certified Professional Translator (CPT)</strong> credential.
              Internationally recognized, institutionally verified, and secured by the Chartered Institute of Language and Translation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25 rounded-full" asChild>
                <Link href="/register">
                  Get Certified Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white rounded-full dark:bg-slate-900/50 dark:border-slate-800" asChild>
                <Link href="/exams">View Requirements</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* --- TRUST BAR --- */}
        <div className="border-y border-slate-200 bg-white/50 backdrop-blur-sm dark:bg-slate-950/50 dark:border-slate-800">
          <div className="container py-8">
            <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
              Recognized Standards & Accreditations
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              {/* Placeholders for Standards - Using text/icons for now as no logos provided */}
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <Globe className="w-5 h-5" /> ISO 17100:2015
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <Shield className="w-5 h-5" /> CILTRA Accredited
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <BookOpen className="w-5 h-5" /> ATS-Compliant
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <FileCheck className="w-5 h-5" /> Global Credential
              </div>
            </div>
          </div>
        </div>

        {/* --- PROCESS SECTION (How It Works) --- */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                Certification Process
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                A rigorous, four-step pathway to verifying your professional expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-slate-800 -z-10" />

              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 z-10 group-hover:-translate-y-2 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Register</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                  Create your professional profile and submit eligibility documents for review.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 z-10 group-hover:-translate-y-2 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                  <Clock className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Schedule</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                  Book your secure exam slot. Available 24/7 with remote proctoring.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 z-10 group-hover:-translate-y-2 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                  <BookOpen className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Assess</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                  Complete practical translation tasks and theoretical knowledge assessments.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 z-10 group-hover:-translate-y-2 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                  <Award className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">4. Certify</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                  Receive your CPT credential, digital badge, and verification ID immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY CHOOSE CILTRA (Features) --- */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-16 items-center">

              {/* Content Side */}
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
                    Why the CPT Credential Matters
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    In a globalized market, trust is everything. The CILTRA CPT certification separates qualified professionals from the crowd, providing a verifiable standard of excellence.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1">Globally Recognized</h4>
                      <p className="text-slate-600 dark:text-slate-400">Accepted by international agencies, governments, and corporations for official document translation.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1">Instant Verification</h4>
                      <p className="text-slate-600 dark:text-slate-400">Every certificate includes a unique QR code and ID, allowing clients to verify authenticity in real-time.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1">Career Advancement</h4>
                      <p className="text-slate-600 dark:text-slate-400">Certified translators earn significantly more and qualify for premium projects.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Side (Card) */}
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 -z-10" />
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur dark:bg-slate-800/90">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Award className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Become a CILTRA Member</h3>
                    <p className="text-slate-500 mb-8">Join a network of elite linguists.</p>

                    <div className="grid grid-cols-2 gap-4 text-left mb-8">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">50k+</div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">Members</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">98%</div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">Pass Rate</div>
                      </div>
                    </div>

                    <Button className="w-full h-12 text-lg" asChild>
                      <Link href="/register">Start Your Application</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* --- VERIFICATION CTA --- */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="container relative z-10 text-center">
            <Search className="w-16 h-16 text-blue-400 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Verify a Certificate</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Employers and institutions can instantly validate a CPT credential using our secure global registry.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 border-0" asChild>
                <Link href="/verify">Go to Verification Portal</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">CILTRA CertifyPro</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md">
                © 2025 Chartered Institute of Language and Translation (CILTRA). <br />
                The official global certification body for professional translators.
              </p>
            </div>

            <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link href="/exams" className="hover:text-primary transition-colors">Examinations</Link>
              <Link href="/verify" className="hover:text-primary transition-colors">Verify Credential</Link>
              <Link href="/login" className="hover:text-primary transition-colors">Examiner Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}