import React from "react";
import { DollarSign, Clock, Briefcase, Users, Activity, FileText, MessageSquare } from "lucide-react";

export function WorkspaceRightPanel() {
  return (
    <div className="w-80 flex-shrink-0 hidden lg:block border-l border-gray-200 bg-white min-h-[calc(100vh-64px)]">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Project Summary</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">$5,000 - $10,000</div>
              <div className="text-xs text-gray-500">Estimated Budget</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Nov 18, 2023</div>
              <div className="text-xs text-gray-500">Deadline</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Event Planning, AV Setup</div>
              <div className="text-xs text-gray-500">Skills Required</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">24 Total Applicants</div>
              <div className="text-xs text-gray-500">Active hiring</div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          Recent Activity
        </h3>
        
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-4">
          <div className="relative pl-6">
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-teal-500"></span>
            <div className="text-sm font-medium text-gray-900">New Application</div>
            <div className="text-xs text-gray-500 mt-1">Nina Ellis applied for "Event Manager" position.</div>
            <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
          </div>
          
          <div className="relative pl-6">
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></span>
            <div className="text-sm font-medium text-gray-900">Message Received</div>
            <div className="text-xs text-gray-500 mt-1">Newton Scamander sent a message regarding the contract.</div>
            <div className="text-xs text-gray-400 mt-1">5 hours ago</div>
          </div>
          
          <div className="relative pl-6">
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-purple-500"></span>
            <div className="text-sm font-medium text-gray-900">Contract Updated</div>
            <div className="text-xs text-gray-500 mt-1">Contract for Maverick Pandey was signed.</div>
            <div className="text-xs text-gray-400 mt-1">Yesterday</div>
          </div>
        </div>
      </div>
    </div>
  );
}
