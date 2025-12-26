import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function LogoHeader() {
    return (
        <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">CertifyPro</span>
        </Link>
    )
}
