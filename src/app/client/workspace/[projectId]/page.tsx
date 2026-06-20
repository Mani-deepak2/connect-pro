import { ProjectHeader } from "@/components/workspace/ProjectHeader";
import { WorkspaceTabs } from "@/components/workspace/WorkspaceTabs";
import { ApplicantCard, Applicant } from "@/components/workspace/ApplicantCard";
import { WorkspaceRightPanel } from "@/components/workspace/WorkspaceRightPanel";
import { createClient } from "@/utils/supabase/server";
import { Search, Filter } from "lucide-react";

// Real Applicant interface based on DB
export interface DBApplicant {
  id: string; // application id
  freelancer_id: string;
  name: string;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  status: string; // application status
}

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string; status?: string }>;
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

  let applicants: DBApplicant[] = [];
  
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (project) {
      projectDetails.title = project.title || projectDetails.title;
      projectDetails.stats.location = project.location || projectDetails.stats.location;
    }

    // Fetch applications with freelancer profiles
    const { data: appsData, error: appsError } = await supabase
      .from('applications')
      .select(`
        id,
        freelancer_id,
        status,
        freelancer_id
      `)
      .eq('project_id', projectId);

    if (appsData && appsData.length > 0) {
      const freelancerIds = appsData.map(a => a.freelancer_id);
      
      const { data: profiles } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .in('user_id', freelancerIds);
        
      const { data: stats } = await supabase
        .from('freelancer_stats')
        .select('*')
        .in('freelancer_id', freelancerIds);

      applicants = appsData.map(app => {
        const profile = profiles?.find(p => p.user_id === app.freelancer_id);
        const stat = stats?.find(s => s.freelancer_id === app.freelancer_id);
        
        return {
          id: app.id,
          freelancer_id: app.freelancer_id,
          name: profile?.full_name || 'Unknown Freelancer',
          location: profile?.location || 'Remote',
          hourlyRate: Number(profile?.hourly_rate || 0),
          rating: Number(stat?.average_rating || 0),
          reviewsCount: Number(stat?.total_reviews || 0),
          tags: profile?.skills || [],
          status: app.status
        };
      });
    }

    // Fetch contracts for this project
    const { data: contractsData } = await supabase
      .from('contracts')
      .select(`
        *,
        freelancer:users!contracts_freelancer_id_fkey(
          freelancer_profiles(full_name, hourly_rate)
        )
      `)
      .eq('project_id', projectId);
      
    if (contractsData) {
      projectDetails.stats.hiredContracts = contractsData.length;
      // We'll pass contractsData down to render them
    }

    var projectContracts = contractsData || [];

  } catch (error) {
    console.error("Supabase data fetch error", error);
  }

  // Define tabs
  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "applicants", label: "FREELANCER", count: applicants.length },
    { id: "questions", label: "QUESTIONS" },
    { id: "offers", label: "OFFERS" },
    { id: "interview", label: "INTERVIEW" },
    { id: "contracts", label: "CONTRACTS", count: projectDetails.stats.hiredContracts },
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
                {applicants.length > 0 ? (
                  applicants.map(applicant => (
                    <ApplicantCard key={applicant.id} applicant={applicant} projectId={projectId} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <p>No applicants yet for this project.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Project Contracts</h2>
              {projectContracts && projectContracts.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Freelancer</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Amount</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projectContracts.map((contract: any) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {contract.freelancer?.freelancer_profiles?.[0]?.full_name || 'Unknown Freelancer'}
                          </td>
                          <td className="py-3 px-4">${contract.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              contract.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              contract.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {contract.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-sm">
                            {new Date(contract.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No contracts have been created for this project yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== "applicants" && activeTab !== "contracts" && (
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
