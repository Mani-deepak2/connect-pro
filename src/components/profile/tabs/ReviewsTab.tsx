"use client"
import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'

export function ReviewsTab({ reviews }: { reviews: any[] }) {
  const [visibleCount, setVisibleCount] = useState(5)

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center shadow-sm">
        <MessageSquare className="w-12 h-12 text-[#8A8D96] mx-auto mb-4" />
        <p className="text-[#5B5E68]">No reviews yet.</p>
      </div>
    )
  }

  const visibleReviews = reviews.slice(0, visibleCount)

  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-display font-bold text-[#15171C]">Client Reviews</h2>
      </div>

      <div className="space-y-6">
        {visibleReviews.map((review) => (
          <div key={review.id} className="border-b border-[#ECEAE5] pb-6 last:border-0 last:pb-0">
            <div className="flex items-start gap-4">
              {/* Client Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#ECEAE5]">
                {review.reviewer?.profile_image ? (
                  <img src={review.reviewer.profile_image} alt="Client" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#2563EB] font-bold text-lg">{review.reviewer?.company_name?.charAt(0) || 'C'}</span>
                )}
              </div>
              
              {/* Review Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-[#15171C]">{review.reviewer?.company_name || 'Anonymous Client'}</h4>
                    <p className="text-xs text-[#8A8D96]">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-[#ECEAE5] text-[#ECEAE5]'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#5B5E68] text-sm mt-3 leading-relaxed">"{review.comment}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {reviews.length > visibleCount && (
        <div className="mt-8 pt-6 border-t border-[#ECEAE5] text-center">
          <button 
            onClick={() => setVisibleCount(c => c + 5)}
            className="text-[#2563EB] font-semibold hover:underline"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  )
}
