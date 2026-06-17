import React from "react";
import { Star, MapPin, Heart, Plus } from "lucide-react";
import Image from "next/image";

export interface Applicant {
  id: string;
  name: string;
  avatarUrl?: string;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  status: 'available' | 'busy' | 'hired';
}

export function ApplicantCard({ applicant }: { applicant: Applicant }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
              {applicant.avatarUrl ? (
                <Image src={applicant.avatarUrl} alt={applicant.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 font-bold text-lg">
                  {applicant.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                {applicant.name}
                <span className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </span>
              </h3>
              <div className="flex items-center text-sm text-gray-500 gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-700">{applicant.rating}</span>
                <span>({applicant.reviewsCount} Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 border-t border-gray-50 pt-4">
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Location</div>
            <div className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {applicant.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Hourly Rate</div>
            <div className="text-sm font-medium text-gray-900 mt-1">${applicant.hourlyRate}/h</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-gray-400" /> Wishlist
          </button>
          <button className="flex-1 py-2 px-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Invite
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs">
        <span className="text-gray-500">Recently Hired</span>
        <span className={`font-medium ${
          applicant.status === 'available' ? 'text-teal-600' : 'text-gray-500'
        }`}>
          • {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
        </span>
      </div>
    </div>
  );
}
