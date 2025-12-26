import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const certificateId = resolvedParams.id

  // In a real implementation, this would:
  // 1. Verify the user has access to this certificate
  // 2. Generate or fetch the PDF from the backend
  // 3. Return the PDF file

  // For now, redirect to the backend API
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  return NextResponse.redirect(`${backendUrl}/api/certificates/${certificateId}/download/`)
}
