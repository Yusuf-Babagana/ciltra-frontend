export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar - Hidden on mobile by default (to be enhanced later with Menu Sheet), 
               but for now valid for desktop and basic mobile stacking or visibility */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <StudentSidebar />
            </aside>

            {/* Main Content */}
            <main className="md:pl-64 flex-1">
                {/* Mobile Header Placeholder (could be a component) */}
                <div className="md:hidden flex items-center p-4 bg-white border-b sticky top-0 z-40">
                    <span className="font-bold">Ciltra Student</span>
                    {/* Add Mobile Menu Trigger Here Later */}
                </div>

                {children}
            </main>
        </div>
    )
}

import { StudentSidebar } from "@/components/student-sidebar"
