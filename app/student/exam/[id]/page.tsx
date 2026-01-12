"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic" // <--- 1. Import Dynamic
import { studentAPI, paymentAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock, Play, CheckCircle } from "lucide-react"

// 2. Dynamically Import the Paystack Component (Disable SSR)
const PaystackTrigger = dynamic(
  () => import("@/components/PaystackTrigger"),
  { ssr: false }
)

export default function ExamLobbyPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)

  // REPLACE THIS WITH YOUR REAL KEY
  const PUBLIC_KEY = ""

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const exams = await studentAPI.getExams()
        const foundExam = exams.find((e: any) => e.id === Number(id))

        if (foundExam) {
          setExam(foundExam)
          if (foundExam.has_paid) {
            setHasPaid(true)
          }
        } else {
          toast({ title: "Error", description: "Exam not found", variant: "destructive" })
          router.push("/student/dashboard")
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
  }, [id, router, toast])

  const handlePaystackSuccess = async (reference: any) => {
    setVerifying(true)
    try {
      await paymentAPI.verifyPayment(reference.reference, Number(id))
      setHasPaid(true)
      toast({ title: "Payment Successful", description: "Starting exam now..." })
      handleStart()
    } catch (error) {
      toast({ title: "Verification Error", description: "Payment recorded but verification failed.", variant: "destructive" })
    } finally {
      setVerifying(false)
    }
  }

  const handlePaystackClose = () => {
    toast({ title: "Payment Cancelled", variant: "destructive" })
  }

  const handleStart = async () => {
    setStarting(true)
    try {
      const sessionData = await studentAPI.startExam(Number(id))
      router.push(`/student/session/${sessionData.id}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setStarting(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!exam) return null

  const canStart = exam.price == 0 || hasPaid

  return (
    <div className="container mx-auto py-20 px-4 max-w-2xl">
      <Card className="shadow-lg border-t-4 border-t-indigo-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">{exam.title}</CardTitle>
          <p className="text-muted-foreground mt-2">{exam.description || "Certification Exam"}</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-lg">
              <span className="block text-xs font-bold text-muted-foreground uppercase">Duration</span>
              <span className="text-xl font-mono font-bold">{exam.duration_minutes} Mins</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <span className="block text-xs font-bold text-muted-foreground uppercase">Price</span>
              <span className={`text-xl font-bold ${Number(exam.price) === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                {Number(exam.price) === 0 ? "FREE" : `₦${exam.price}`}
              </span>
            </div>
          </div>

          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
            {verifying ? (
              <div className="py-6">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-muted-foreground">Confirming Payment...</p>
              </div>
            ) : canStart ? (
              <>
                <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center justify-center gap-2 border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Access Granted.</span>
                </div>
                <Button size="lg" className="w-full h-14 text-lg shadow-lg shadow-indigo-200" onClick={handleStart} disabled={starting}>
                  {starting ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                  Start Exam Now
                </Button>
              </>
            ) : (
              <div className="space-y-4 border p-6 rounded-xl bg-indigo-50/30 border-indigo-100">
                <div className="flex items-center justify-center gap-2 text-indigo-900 font-bold mb-2">
                  <Lock className="w-5 h-5" /> Payment Required
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to pay securely via Paystack. The exam will start automatically after payment.
                </p>

                {/* 3. USE THE DYNAMIC COMPONENT */}
                <PaystackTrigger
                  email={user?.email || ""}
                  amount={(exam?.price || 0) * 100}
                  publicKey={PUBLIC_KEY}
                  onSuccess={handlePaystackSuccess}
                  onClose={handlePaystackClose}
                />

              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}