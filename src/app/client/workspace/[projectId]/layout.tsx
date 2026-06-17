import React from "react";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full max-h-screen">
      {children}
    </div>
  );
}
