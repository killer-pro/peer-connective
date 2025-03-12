
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className={cn("flex-1 overflow-auto p-6", className)}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
