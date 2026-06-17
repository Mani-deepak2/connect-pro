"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Users, 
  FileSignature, 
  MessageSquare, 
  CreditCard, 
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

export function WorkspaceSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: `/client/workspace/${projectId}`, icon: LayoutDashboard },
    { name: "Company Profile", href: `/client/profile`, icon: Building2 },
    { 
      name: "My Projects", 
      href: `/client/workspace/${projectId}`, 
      icon: Briefcase,
      isActive: true, // Typically would match route
      subItems: [
        { name: "Active", href: `/client/workspace/${projectId}?status=active`, isSubActive: true },
        { name: "Closed", href: `/client/workspace/${projectId}?status=closed` },
        { name: "Expired", href: `/client/workspace/${projectId}?status=expired` },
        { name: "Draft", href: `/client/workspace/${projectId}?status=draft` },
      ]
    },
    { name: "Applicants", href: `/client/workspace/${projectId}?tab=applicants`, icon: Users },
    { name: "Contracts", href: `/client/workspace/${projectId}?tab=contracts`, icon: FileSignature },
    { name: "Messages", href: `/client/workspace/${projectId}?tab=messages`, icon: MessageSquare },
    { name: "Payments", href: `/client/workspace/${projectId}?tab=payments`, icon: CreditCard },
    { name: "Settings", href: `/client/workspace/${projectId}?tab=settings`, icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-64px)] hidden md:block">
      <div className="py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.name} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.isActive 
                    ? "bg-teal-50 text-teal-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.isActive ? "text-teal-700" : "text-gray-400"}`} />
                {item.name}
              </Link>
              
              {/* Sub items for My Projects */}
              {item.subItems && (
                <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`block px-2 py-1.5 text-xs font-medium rounded-md ${
                        subItem.isSubActive
                          ? "text-teal-600 bg-teal-50/50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto pt-6 px-4 pb-6 border-t border-gray-100">
        <nav className="space-y-1">
          <Link href="/help" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            Help
          </Link>
          <Link href="/logout" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
            <LogOut className="h-5 w-5 text-gray-400" />
            Logout
          </Link>
        </nav>
      </div>
    </aside>
  );
}
