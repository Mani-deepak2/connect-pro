"use client"
import { useState, useEffect } from 'react'
import { Star, MessageSquare, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function Reviews() {
  const [activeTab, setActiveTab] = useState('given')
  const [reviewsGiven, setReviewsGiven] = useState<any[]>([])
  const [reviewsReceived, setReviewsReceived] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Reviews given by the client
    const { data: given } = await supabase
      .from('reviews')
      .select('*, reviewee:users!reviews_reviewee_id_fkey(full_name, role), contract:contracts(project:projects(title))')
      .eq('reviewer_id', user.id)
      .order('created_at', { ascending: false })

    if (given) setReviewsGiven(given)

    // Reviews received by the client
    const { data: received } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviews_reviewer_id_fkey(full_name, role), contract:contracts(project:projects(title))')
      .eq('reviewee_id', user.id)
      .order('created_at', { ascending: false })

    if (received) setReviewsReceived(received)

    setIsLoading(false)
  }

  const averageRating = reviewsReceived.length > 0
    ? (reviewsReceived.reduce((acc, rev) => acc + rev.rating, 0) / reviewsReceived.length).toFixed(1)
    : '0.0'

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Reviews & Ratings</h1>
        <p className="text-gray-500">Manage feedback given to freelancers and view your company's reputation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Summary Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Company Average Rating</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{averageRating}</span>
            <div className="flex flex-col items-start">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Number(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}
              </div>
              <span className="text-sm font-medium text-gray-500">out of 5</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Based on <span className="font-bold text-gray-900">{reviewsReceived.length} reviews</span> from freelancers.</p>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Breakdown</h3>
          <div className="space-y-3">
            {[
              { stars: 5, count: 20, pct: 83 },
              { stars: 4, count: 3, pct: 12 },
              { stars: 3, count: 1, pct: 5 },
              { stars: 2, count: 0, pct: 0 },
              { stars: 1, count: 0, pct: 0 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-12 flex items-center">{row.stars} <Star className="w-3 h-3 ml-1" /></span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${row.pct}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-500 w-8">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & List */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm">
        <div className="flex px-2 pt-2 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
          {[
            { id: 'given', label: 'Reviews You Gave' },
            { id: 'received', label: 'Reviews You Received' },
            { id: 'pending', label: 'Pending Reviews' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 flex justify-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          ) : activeTab === 'given' && reviewsGiven.length > 0 ? reviewsGiven.map((review) => (
            <div key={review.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">
                    {review.reviewee?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer">{review.reviewee?.full_name || 'Unknown User'}</h4>
                    <p className="text-sm text-gray-500">{review.reviewee?.role || 'Freelancer'} <span className="mx-1">•</span> {review.contract?.project?.title || 'Unknown Project'}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              <div className="ml-16">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm mb-4">"{review.comment}"</p>

                <div className="mt-4 flex gap-3">
                  <button className="text-xs font-semibold text-teal-600 hover:text-teal-700">Edit Review</button>
                  <button className="text-xs font-semibold text-gray-500 hover:text-gray-700">Delete</button>
                </div>
              </div>
            </div>
          )) : activeTab === 'given' && reviewsGiven.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No given reviews</h3>
              <p className="text-sm text-gray-500">You haven't left any reviews for freelancers yet.</p>
            </div>
          ) : null}

          {!isLoading && activeTab === 'received' && reviewsReceived.length > 0 ? reviewsReceived.map((review) => (
            <div key={review.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">
                    {review.reviewer?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer">{review.reviewer?.full_name || 'Unknown User'}</h4>
                    <p className="text-sm text-gray-500">{review.reviewer?.role || 'Freelancer'} <span className="mx-1">•</span> {review.contract?.project?.title || 'Unknown Project'}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              <div className="ml-16">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm mb-4">"{review.comment}"</p>
              </div>
            </div>
          )) : !isLoading && activeTab === 'received' && reviewsReceived.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No received reviews</h3>
              <p className="text-sm text-gray-500">Freelancers haven't left any reviews for your company yet.</p>
            </div>
          ) : null}

          {activeTab === 'pending' && (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-sm text-gray-500">You don't have any pending reviews to write for completed contracts.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
