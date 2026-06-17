import React from "react";
import { CheckCircle2, ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";

interface ProjectStats {
  status: string;
  confirmedApplicants: number;
  totalPositions: number;
  averageRate: number;
  hiredContracts: number;
  unreadMessages: number;
  startDate: string;
  endDate: string;
  location: string;
  zipCode: string;
  manager: string;
}

export function ProjectHeader({ 
  title, 
  stats 
}: { 
  title: string;
  stats: ProjectStats;
}) {
  return (
    <div className="bg-white px-6 pt-6 pb-0 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/client/workspace" className="text-gray-500 hover:text-gray-900 text-sm flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {title}
            <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              {stats.status}
            </span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Event Planning</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8 border-b border-gray-100">
        <button className="text-teal-600 font-medium pb-3 border-b-2 border-teal-600 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> PROJECT DETAILS
        </button>
        <button className="text-gray-500 hover:text-gray-900 font-medium pb-3 text-sm flex items-center gap-2">
          POSITION DETAILS
        </button>
        <button className="text-gray-500 hover:text-gray-900 font-medium pb-3 text-sm flex items-center gap-2">
          PREFERENCE
        </button>
      </div>

      <div className="py-6">
        <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100">
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-gray-900">{stats.confirmedApplicants}/{stats.totalPositions}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">CONFIRMED</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-gray-900">${stats.averageRate}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">AVERAGE RATE</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-gray-900">{stats.hiredContracts}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">HIRED CONTRACTS</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">AVERAGE TEAM RATING</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">UNREAD MESSAGES</div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 text-sm">
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">DEPARTURE DATE</div>
            <div className="font-medium text-gray-900">{stats.startDate}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">END DATE</div>
            <div className="font-medium text-gray-900">{stats.endDate}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">LOCATION</div>
            <div className="font-medium text-gray-900">{stats.location}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">ZIPCODE</div>
            <div className="font-medium text-gray-900">{stats.zipCode}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">PROJECT MANAGER</div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200"></div>
              {stats.manager}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
