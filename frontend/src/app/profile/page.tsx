"use client";

import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-[240px] min-h-screen border-t border-[#e8e8e8]">
        <div className="mx-auto max-w-[760px] px-8 py-10">
          <h1 className="text-[22px] font-semibold text-[#171717]">
            Profile
          </h1>

          <div className="mt-7 rounded-xl border border-[#e5e5e5] bg-white px-5">
            {/* Profile picture */}
            <div className="flex min-h-[62px] items-center justify-between border-b border-[#eeeeee]">
              <span className="text-[12px] font-medium text-[#333]">
                Profile picture
              </span>

              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#171717] text-[10px] font-medium text-white">
                G
              </div>
            </div>

            {/* Email */}
            <div className="flex min-h-[58px] items-center justify-between border-b border-[#eeeeee]">
              <span className="text-[12px] font-medium text-[#333]">
                Email
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#171717]">
                  guest@example.com
                </span>

                <button
                  type="button"
                  className="cursor-pointer text-[#777]"
                >
                  ✎
                </button>
              </div>
            </div>

            {/* Full name */}
            <div className="flex min-h-[60px] items-center justify-between border-b border-[#eeeeee]">
              <span className="text-[12px] font-medium text-[#333]">
                Full name
              </span>

              <input
                defaultValue="Guest"
                className="h-8 w-[180px] rounded-lg bg-[#f3f3f3] px-3 text-[12px] text-[#555] outline-none"
              />
            </div>

            {/* Title */}
            <div className="flex min-h-[70px] items-center justify-between border-b border-[#eeeeee]">
              <div>
                <p className="text-[12px] font-medium text-[#333]">
                  Title
                </p>

                <p className="mt-1 text-[10px] text-[#777]">
                  Your job title or role
                </p>
              </div>

              <input
                defaultValue="Designer"
                className="h-8 w-[180px] rounded-lg bg-[#f3f3f3] px-3 text-[12px] text-[#555] outline-none"
              />
            </div>

            {/* Username */}
            <div className="flex min-h-[70px] items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-[#333]">
                  Username
                </p>

                <p className="mt-1 text-[10px] text-[#777]">
                  One word, like a nickname or first name
                </p>
              </div>

              <input
                defaultValue="guest"
                className="h-8 w-[180px] rounded-lg bg-[#f3f3f3] px-3 text-[12px] text-[#555] outline-none"
              />
            </div>
          </div>

          <h2 className="mt-8 text-[15px] font-semibold text-[#333]">
            Workspace access
          </h2>

          <div className="mt-4 flex min-h-[60px] items-center justify-between rounded-xl border border-[#e5e5e5] bg-white px-5">
            <span className="text-[11px] text-[#888]">
              Remove yourself from the workspace
            </span>

            <button
              type="button"
              className="h-8 cursor-pointer rounded-md bg-[#fff0f0] px-4 text-[11px] font-medium text-red-500 hover:bg-[#ffe8e8]"
            >
              Leave Workspace
            </button>
          </div>
            <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="h-[36px] cursor-pointer rounded-lg bg-[#171717] px-5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}