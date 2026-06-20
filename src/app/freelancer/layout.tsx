import { TopNavBar } from '@/components/dashboard/TopNavBar'
import { GlobalFreelancerSidebar } from '@/components/dashboard/GlobalFreelancerSidebar'

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <GlobalFreelancerSidebar />
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 h-full">
        <TopNavBar userType="freelancer" />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  )
}
