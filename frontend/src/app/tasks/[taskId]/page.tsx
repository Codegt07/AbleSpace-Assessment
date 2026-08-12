"use client";

import Sidebar from "@/components/Sidebar";

const subtasks = [
  {
    id: 1,
    title: "Create API endpoint documentation",
    priority: "High",
    member: "G",
    dueDate: "12 Sep 2026",
  },
  {
    id: 2,
    title: "Add request and response examples",
    priority: "Low",
    member: "G",
    dueDate: "15 Sep 2026",
  },
  {
    id: 3,
    title: "Review authentication documentation",
    priority: "Medium",
    member: "G",
    dueDate: "18 Sep 2026",
  },
];

const labels = ["Research", "Design", "Development"];

export default function TaskDetailsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        {/* Top bar */}
        <div className="h-[54px] border-b border-[#e8e8e8]" />

        <div className="flex gap-5 px-6 py-5">
          {/* LEFT / MAIN CONTENT */}
          <section className="min-w-0 flex-1">
            {/* Task title */}
            <h1 className="text-[22px] font-semibold text-[#171717]">
              Write API Documentation
            </h1>

            <p className="mt-1 max-w-[700px] text-[12px] leading-5 text-[#777]">
              Create clear and detailed API documentation to guide developers
              in using the inventory and sales metrics features effectively.
            </p>

            {/* Basic properties */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[12px] font-medium text-[#333]">
                Due Date
              </span>

              <span className="rounded-md bg-[#fff0f0] px-2 py-1 text-[11px] text-[#ff4d4f]">
                31 Jul
              </span>
            </div>

            {/* Labels */}
            <div className="mt-4 flex items-start gap-6">
              <span className="w-[62px] pt-[3px] text-[12px] font-medium text-[#333]">
                Labels
              </span>

              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[#e5e5e5] bg-[#f7f7f7] px-2 py-[3px] text-[10px] text-[#444]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="mt-4 flex items-center gap-6">
              <span className="w-[62px] text-[12px] font-medium text-[#333]">
                Resources
              </span>

              <button
                type="button"
                className="cursor-pointer text-[11px] text-[#888] hover:text-[#171717]"
              >
                + Add document or link...
              </button>
            </div>

            {/* SUBTASKS */}
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px]">⌄</span>

                <h2 className="text-[13px] font-medium text-[#333]">
                  Subtasks
                </h2>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#dedede]">
                {/* Header */}
                <div className="grid grid-cols-[1fr_110px_110px_130px_70px] bg-[#f7f7f7] px-3 py-[10px] text-[11px] font-medium text-[#333]">
                  <span>Task</span>
                  <span>Priority</span>
                  <span>Members</span>
                  <span>Due Date</span>
                  <span className="text-right">Actions</span>
                </div>

                {subtasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr_110px_110px_130px_70px] items-center border-t border-[#e8e8e8] px-3 py-[10px] text-[11px]"
                  >
                    <span className="text-[#333]">{task.title}</span>

                    <span
                      className={
                        task.priority === "High"
                          ? "text-red-500"
                          : task.priority === "Medium"
                            ? "text-orange-500"
                            : "text-[#999]"
                      }
                    >
                      {task.priority}
                    </span>

                    <div className="flex">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eeeeee] text-[9px]">
                        {task.member}
                      </span>
                    </div>

                    <span>{task.dueDate}</span>

                    <button
                      type="button"
                      className="cursor-pointer text-right text-[15px]"
                    >
                      ⋯
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="flex h-[36px] w-full cursor-pointer items-center border-t border-[#e8e8e8] px-3 text-[11px] hover:bg-[#fafafa]"
                >
                  + Add Subtask
                </button>
              </div>
            </div>

            {/* COMMENTS */}
            <div className="mt-6">
              <h2 className="mb-2 text-[13px] font-medium text-[#333]">
                Comments
              </h2>

              <div className="rounded-lg border border-[#dedede]">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                      G
                    </div>

                    <span className="text-[11px] font-medium">Guest</span>

                    <span className="text-[10px] text-[#999]">just now</span>
                  </div>

                  <p className="ml-8 mt-2 text-[11px] text-[#333]">
                    API documentation needs final review.
                  </p>
                </div>

                <div className="flex items-center border-t border-[#e8e8e8] px-3">
                  <input
                    placeholder="Leave a reply..."
                    className="h-[40px] flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#999]"
                  />

                  <button
                    type="button"
                    className="cursor-pointer text-[13px]"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center rounded-lg border border-[#dedede] px-3">
                <input
                  placeholder="Add a comment..."
                  className="h-[42px] flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#999]"
                />

                <button
                  type="button"
                  className="cursor-pointer text-[13px]"
                >
                  Send
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="w-[280px] shrink-0">
            {/* Details */}
            <div className="rounded-xl border border-[#dedede] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#222]">
                  Details
                </h2>

                <button type="button" className="cursor-pointer text-lg">
                  +
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {/* Status */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">Status</span>

                  <button
                    type="button"
                    className="w-fit cursor-pointer rounded-md bg-[#fff5e6] px-2 py-1 text-[11px] text-orange-600"
                  >
                    To Do
                  </button>
                </div>

                {/* Priority */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">Priority</span>

                  <button
                    type="button"
                    className="w-fit cursor-pointer text-[11px] text-red-500"
                  >
                    ↗ High
                  </button>
                </div>

                {/* Member */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">Member</span>

                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                      G
                    </div>

                    <span className="text-[11px]">Guest</span>
                  </div>
                </div>

                {/* Due date */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">Due Date</span>

                  <span className="text-[11px] text-[#555]">31 Jul 2026</span>
                </div>

                {/* Labels */}
                <div className="grid grid-cols-[80px_1fr] items-start">
                  <span className="pt-1 text-[11px] text-[#333]">Labels</span>

                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-full bg-[#f3f3f3] px-2 py-1 text-[9px]">
                      Research
                    </span>

                    <span className="rounded-full bg-[#f3f3f3] px-2 py-1 text-[9px]">
                      Design
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="mt-4 rounded-xl border border-[#dedede] bg-white p-4">
              <h2 className="text-[13px] font-semibold text-[#222]">
                Updates
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[11px] font-medium text-[#333]">Guest</p>

                  <p className="mt-1 text-[10px] leading-4 text-[#888]">
                    changed priority from Medium to High
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-[#333]">Guest</p>

                  <p className="mt-1 text-[10px] leading-4 text-[#888]">
                    created this task
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}