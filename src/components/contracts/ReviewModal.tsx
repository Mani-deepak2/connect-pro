"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Star, Loader2, X } from 'lucide-react'

interface ReviewModalProps {
  contractId: string
  revieweeId: string
  onClose: () => void
}

export function ReviewModal({ contractId, revieweeId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return alert('Please select a rating')
    
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('reviews').insert({
        contract_id: contractId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: rating,
        comment: comment
      })
    }
    
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-[#15171C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8A8D96] hover:text-[#15171C] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-display font-bold text-[#15171C] mb-2">Leave a Review</h2>
        <p className="text-[#5B5E68] mb-8">How was your experience working on this project?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'fill-[#ECEAE5] text-[#ECEAE5]'
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#15171C] mb-2">Written Feedback</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all h-32 resize-none"
              placeholder="What went well? What could be improved?"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-[#15171C] hover:bg-[#2563EB] text-white font-bold py-4 px-6 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
