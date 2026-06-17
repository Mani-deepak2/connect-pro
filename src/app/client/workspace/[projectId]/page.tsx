import { ProjectHeader } from "@/components/workspace/ProjectHeader";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { ApplicantCard, Applicant } from "@/components/workspace/ApplicantCard";
import { WorkspaceRightPanel } from "@/components/workspace/WorkspaceRightPanel";
import { createClient } from "@/utils/supabase/server";
import { Search, Filter } from "lucide-react";

// Mock Data for demonstration
const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Nina Ellis",
    location: "Los Angeles, CA",
    hourlyRate: 134,
    rating: 4.3,
    reviewsCount: 15,
    tags: ["Event Manager", "AV Setup"],
    status: "available",
  },
  {
    id: "2",
    name: "Newton Scamander",
    location: "Los Angeles, CA",
    hourlyRate: 134,
    rating: 4.8,
    reviewsCount: 22,
    tags: ["Audio Engineer", "Lighting"],
    status: "hired",
  },
  {
    id: "3",
    name: "Maverick Pandey",
    location: "Los Angeles, CA",
    hourlyRate: 134,
    rating: 5.0,
    reviewsCount: 8,
    tags: ["Project Manager"],
    status: "available",
  },
];

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { tab?: string; status?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const projectId = resolvedParams.projectId;
  const activeTab = resolvedSearchParams.tab || "applicants";

  const supabase = await createClient();

  // Try to fetch real project details (fallback to mock)
  let projectDetails = {
    title: "Audio Visual Meet - Asian Expo 4th edition",
    stats: {
      status: "Active",
      confirmedApplicants: 2,
      totalPositions: 3,
      averageRate: 165,
      hiredContracts: 0,
      unreadMessages: 4,
      startDate: "NOV 18, 2023",
      endDate: "NOV 19, 2023",
      location: "Sector 22, Los Angeles, CA",
      zipCode: "76421",
      manager: "Jalean Alexander Jr",
    }
  };

  try {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (project) {
      projectDetails.title = project.title || projectDetails.title;
      projectDetails.stats.location = project.location || projectDetails.stats.location;
      // Map other fields as needed
    }
  } catch (error) {
    console.error("Supabase project fetch error, using mock data", error);
  }

  // Define tabs
  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "applicants", label: "FREELANCER", count: 18 },
    { id: "questions", label: "QUESTIONS" },
    { id: "offers", label: "OFFERS" },
    { id: "interview", label: "INTERVIEW" },
    { id: "contracts", label: "CONTRACTS", count: 7 },
    { id: "payment", label: "PAYMENT" },
    { id: "compliance", label: "COMPLIANCE" },
  ];

  return (
    <div className="flex h-full max-h-screen overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-10 bg-white">
          <ProjectHeader title={projectDetails.title} stats={projectDetails.stats} />
          <WorkspaceTabs tabs={tabs} activeTab={activeTab} projectId={projectId} />
        </div>

        {/* Dynamic Tab Content */}
        <div className="p-6 bg-gray-50 flex-1">
          {activeTab === "applicants" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">6 FREELANCERS FOUND</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <span className="w-8 h-4 bg-teal-500 rounded-full flex items-center p-0.5 shadow-inner">
                      <span className="w-3 h-3 bg-white rounded-full translate-x-4"></span>
                    </span>
                    Recently Hired
                  </div>
                  <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-500" /> Filters
                  </button>
                </div>
              </div>

              {/* Grid of Applicant Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockApplicants.map(applicant => (
                  <ApplicantCard key={applicant.id} applicant={applicant} />
                ))}
                {mockApplicants.map(applicant => (
                  <ApplicantCard key={applicant.id + "_copy"} applicant={{...applicant, id: applicant.id + "_copy"}} />
                ))}
              </div>
            </div>
          )}

          {activeTab !== "applicants" && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No data available for this tab</h3>
              <p className="text-sm text-gray-500 mt-1">This section is currently under construction.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <WorkspaceRightPanel />
    </div>
  );
}
