"use client"
import { useParams } from "next/navigation"
import { studentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle } from "lucide-react"

export default function CertificateDetailPage() {
  const { id } = useParams() // This needs to be the Session ID

  const handleDownload = async () => {
    try {
      const blob = await studentAPI.downloadCertificate(Number(id))
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Certificate could not be generated. Ensure you passed the exam.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-2xl font-bold">Your Certificate</h1>
      <p className="text-slate-500">Click below to generate and download your official document.</p>
      <Button onClick={handleDownload} size="lg" className="bg-indigo-600">
        <Download className="mr-2 h-4 w-4" /> Download PDF
      </Button>
    </div>
  )
}