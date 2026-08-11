"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isTasksActive = pathname.startsWith("/tasks");
  const isProjectsActive = pathname.startsWith("/projects");
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-[#e8e8e8] bg-[#fafafa] px-[8px] py-[14px]">
\      <Link
        href="/profile"
        className="flex cursor-pointer items-center justify-between rounded-[8px] px-[8px] py-[4px] hover:bg-[#f1f1f1]"
      >
        <div className="flex items-center gap-[7px]">
          <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold text-white">
            G
          </div>

          <span className="text-[13px] font-semibold text-[#171717]">
            Guest
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-[2px]">
          <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
            <path
              d="M1.5 3.8L4.5 1L7.5 3.8"
              stroke="#171717"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
            <path
              d="M1.5 1.2L4.5 4L7.5 1.2"
              stroke="#171717"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Link>
      <div className="mt-[24px]">
        <div className="flex items-center justify-between px-[8px]">
          <span className="text-[12px] font-medium text-[#171717]">
            Workspace
          </span>

          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M2 2L5 5L8 2"
              stroke="#171717"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <nav className="mt-[5px] space-y-[2px]">
          <Link
            href="/tasks"
            className={`flex h-[31px] cursor-pointer items-center gap-[8px] rounded-[8px] px-[8px] text-[12px] font-medium ${
              isTasksActive
                ? "bg-[#eeeeee] text-[#171717]"
                : "text-[#292929] hover:bg-[#f1f1f1]"
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>

            Tasks
          </Link>

          <Link
            href="/projects"
            className={`flex h-[31px] cursor-pointer items-center gap-[8px] rounded-[8px] px-[8px] text-[12px] font-medium ${
              isProjectsActive
                ? "bg-[#eeeeee] text-[#171717]"
                : "text-[#292929] hover:bg-[#f1f1f1]"
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8h16" />
              <path d="M5 8l1-4h12l1 4" />
              <rect x="4" y="8" width="16" height="12" rx="1.5" />
            </svg>

            Projects
          </Link>
        </nav>
      </div>
      <Link
        href="/profile"
        aria-label="Open profile"
        className={`absolute bottom-[20px] left-[16px] z-50 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border text-[12px] font-medium transition-colors ${
          isProfileActive
            ? "border-[#171717] bg-[#171717] text-white"
            : "border-[#d8d8d8] bg-[#2b2b2b] text-white hover:bg-[#171717]"
        }`}
      >
        G
      </Link>
    </aside>
  );
}