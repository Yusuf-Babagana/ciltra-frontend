import { ExaminerSidebar } from '@/components/examiner-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function ExaminerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-slate-50/50">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden md:block fixed inset-y-0 left-0 h-full w-64 z-30">
                <ExaminerSidebar />
            </div>

            {/* Main Content Area */}
            {/* We add pl-64 to push content to the right on desktop */}
            <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">

                {/* Mobile Header - Visible only on Mobile */}
                <div className="md:hidden sticky top-0 z-40 flex h-16 items-center border-b bg-white px-6 shadow-sm">
                    <Sheet>
                        <SheetTrigger>
                            <Menu className="h-6 w-6 text-slate-600" />
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r-0 w-64 focus-visible:outline-none">
                            <ExaminerSidebar />
                        </SheetContent>
                    </Sheet>
                    <div className="ml-4 font-semibold text-lg">Examiner Portal</div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
