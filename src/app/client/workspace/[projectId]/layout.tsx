import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import React from "react";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const resolvedParams = await params;

  return (
    <div className="flex bg-[#f8f9fc] min-h-screen">
      <WorkspaceSidebar projectId={resolvedParams.projectId} />
      <main className="flex-1 w-full max-w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
