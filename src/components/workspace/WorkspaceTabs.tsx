import React from "react";
import Link from "next/link";

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function WorkspaceTabs({ 
  tabs, 
  activeTab, 
  projectId 
}: { 
  tabs: TabItem[]; 
  activeTab: string;
  projectId: string;
}) {
  return (
    <div className="border-b border-gray-200 bg-white px-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/client/workspace/${projectId}?tab=${tab.id}`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${isActive 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-900'}
                `}>
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
