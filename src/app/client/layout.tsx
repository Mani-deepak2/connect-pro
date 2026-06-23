import { GlobalClientSidebar } from '@/components/dashboard/GlobalClientSidebar'
import { TopNavBar } from '@/components/dashboard/TopNavBar'
import React, { Suspense } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#F7F6F3] min-h-screen">
      <Suspense fallback={<div className="w-64 bg-white" />}>
        <GlobalClientSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        <TopNavBar />
        <main className="flex-1 w-full max-w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
