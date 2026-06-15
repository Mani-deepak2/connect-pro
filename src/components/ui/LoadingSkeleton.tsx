export function ProjectCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
          <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
        </div>
        <div className="h-8 bg-white/10 rounded-lg w-24"></div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-white/10 rounded-lg w-full"></div>
        <div className="h-4 bg-white/10 rounded-lg w-5/6"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-white/10 rounded-full w-16"></div>
        <div className="h-6 bg-white/10 rounded-full w-20"></div>
        <div className="h-6 bg-white/10 rounded-full w-24"></div>
      </div>
    </div>
  )
}
