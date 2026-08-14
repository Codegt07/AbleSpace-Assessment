"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

type TaskMember = {
  _id: string;
  userId: string;
  status: TaskStatus;
};

type Task = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  parentTaskId?: string | null;
  status: TaskStatus;
  priority?: string;
  members?: TaskMember[];
  createdBy: string;
  workspaceId: string;
  labels?: string[];
  resources?: any[];
  dueDate?: string;
  allowMembersToAddMembers?: boolean;
};

type TaskUpdate = {
  _id: string;
  taskId: string;
  userId: string;
  message: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
};

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const storedGuest = localStorage.getItem("guest");

        if (!storedGuest) {
          console.error("Guest not found");
          return;
        }

        const guest = JSON.parse(storedGuest);

        const workspaceId = guest.workspaceId;
        const userId = guest.guestId;

        console.log("GUEST:", guest);
        console.log("workspaceId:", workspaceId);
        console.log("userId:", userId);
        console.log("taskId:", taskId);

        if (!workspaceId || !userId || !taskId) {
          console.error("Missing task information");
          return;
        }

       const taskUrl =
  `http://localhost:5000/tasks/${taskId}` +
  `?workspaceId=${workspaceId}&userId=${userId}`;

const updatesUrl =
  `http://localhost:5000/tasks/${taskId}/updates` +
  `?workspaceId=${workspaceId}&userId=${userId}`;

console.log("TASK URL:", taskUrl);
console.log("UPDATES URL:", updatesUrl);

const [taskResponse, updatesResponse] =
  await Promise.all([
    fetch(taskUrl),
    fetch(updatesUrl),
  ]);

        if (!taskResponse.ok) {
  const errorText = await taskResponse.text();

  console.error(
    "TASK API ERROR:",
    taskResponse.status,
    errorText,
  );

  throw new Error("Failed to fetch task");
}

if (!updatesResponse.ok) {
  const errorText = await updatesResponse.text();

  console.error(
    "UPDATES API ERROR:",
    updatesResponse.status,
    errorText,
  );

  throw new Error("Failed to fetch updates");
}
        const taskData = await taskResponse.json();
        const updatesData = await updatesResponse.json();

        setTask(taskData);
        setUpdates(updatesData);
      } catch (error) {
        console.error("Task Details Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />

        <main className="ml-[240px] min-h-screen">
          <div className="flex items-center justify-center px-6 py-10">
            <p className="text-[12px] text-[#888]">
              Loading task...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />

        <main className="ml-[240px] min-h-screen">
          <div className="flex items-center justify-center px-6 py-10">
            <p className="text-[12px] text-[#888]">
              Task not found
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <div className="h-[54px] border-b border-[#e8e8e8]" />

        <div className="flex gap-5 px-6 py-5">
          {/* LEFT / MAIN CONTENT */}
          <section className="min-w-0 flex-1">
            {/* Task title */}
            <h1 className="text-[22px] font-semibold text-[#171717]">
              {task.title}
            </h1>

            <p className="mt-1 max-w-[700px] text-[12px] leading-5 text-[#777]">
              {task.description || "No description provided."}
            </p>

            {/* Due Date */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[12px] font-medium text-[#333]">
                Due Date
              </span>

              <span className="rounded-md bg-[#fff0f0] px-2 py-1 text-[11px] text-[#ff4d4f]">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "No date"}
              </span>
            </div>

            {/* Labels */}
            <div className="mt-4 flex items-start gap-6">
              <span className="w-[62px] pt-[3px] text-[12px] font-medium text-[#333]">
                Labels
              </span>

              <div className="flex flex-wrap gap-2">
                {task.labels?.length ? (
                  task.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-[#e5e5e5] bg-[#f7f7f7] px-2 py-[3px] text-[10px] text-[#444]"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-[#999]">
                    No labels
                  </span>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="mt-4 flex items-center gap-6">
              <span className="w-[62px] text-[12px] font-medium text-[#333]">
                Resources
              </span>

              {task.resources?.length ? (
                <span className="text-[11px] text-[#555]">
                  {task.resources.length} resource
                  {task.resources.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-[11px] text-[#999]">
                  No resources
                </span>
              )}
            </div>

            {/* SUBTASKS */}
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px]">⌄</span>

                <h2 className="text-[13px] font-medium text-[#333]">
                  Subtasks
                </h2>
              </div>

              <div className="rounded-lg border border-[#dedede]">
                <div className="flex h-[50px] items-center justify-center">
                  <span className="text-[11px] text-[#999]">
                    No subtasks yet
                  </span>
                </div>

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
                <div className="flex h-[80px] items-center justify-center">
                  <span className="text-[11px] text-[#999]">
                    No comments yet
                  </span>
                </div>

                <div className="flex items-center border-t border-[#e8e8e8] px-3">
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

                <button
                  type="button"
                  className="cursor-pointer text-lg"
                >
                  +
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {/* Status */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">
                    Status
                  </span>

                  <span className="w-fit rounded-md bg-[#fff5e6] px-2 py-1 text-[11px] text-orange-600">
                    {task.status}
                  </span>
                </div>

                {/* Priority */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">
                    Priority
                  </span>

                  <span className="w-fit text-[11px] text-red-500">
                    ↗ {task.priority || "Medium"}
                  </span>
                </div>

                {/* Members */}
                <div className="grid grid-cols-[80px_1fr] items-start">
                  <span className="text-[11px] text-[#333]">
                    Members
                  </span>

                  <div className="space-y-2">
                    {task.members?.length ? (
                      task.members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-2"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                            G
                          </div>

                          <div>
                            <p className="max-w-[150px] truncate text-[10px] text-[#333]">
                              {member.userId}
                            </p>

                            <p className="text-[9px] text-[#999]">
                              {member.status}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#999]">
                        No members
                      </span>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-[11px] text-[#333]">
                    Due Date
                  </span>

                  <span className="text-[11px] text-[#555]">
                    {task.dueDate
                      ? new Date(
                          task.dueDate,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No date"}
                  </span>
                </div>

                {/* Labels */}
                <div className="grid grid-cols-[80px_1fr] items-start">
                  <span className="pt-1 text-[11px] text-[#333]">
                    Labels
                  </span>

                  <div className="flex flex-wrap gap-1">
                    {task.labels?.length ? (
                      task.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-[#f3f3f3] px-2 py-1 text-[9px]"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#999]">
                        None
                      </span>
                    )}
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
                {updates.length === 0 ? (
                  <p className="text-[10px] text-[#999]">
                    No updates yet.
                  </p>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update._id}
                      className="border-b border-[#f0f0f0] pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-[10px] font-medium text-[#333]">
                        {update.userId}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-[#777]">
                        {update.message}
                      </p>

                      <p className="mt-1 text-[9px] text-[#aaa]">
                        {new Date(
                          update.createdAt,
                        ).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}