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
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
const [memberId, setMemberId] = useState("");
const [addingMember, setAddingMember] = useState(false);

const [subtaskTitle, setSubtaskTitle] = useState("");
const [subtaskDescription, setSubtaskDescription] = useState("");
const [subtaskStatus, setSubtaskStatus] =
  useState<TaskStatus>("To Do");
const [subtaskPriority, setSubtaskPriority] = useState("Medium");
const [subtaskDueDate, setSubtaskDueDate] = useState("");
const [subtaskLabels, setSubtaskLabels] = useState("");
const [creatingSubtask, setCreatingSubtask] = useState(false);
const [workspaceUsers, setWorkspaceUsers] = useState<
  {
    userId: string;
    name: string;
    username: string;
    avatar: string;
    title: string;
  }[]
>([]);

const [memberSearch, setMemberSearch] = useState("");
const [addingMemberId, setAddingMemberId] = useState<string | null>(null);

const handleCreateSubtask = async () => {
  if (!subtaskTitle.trim()) {
    return;
  }

  try {
    setCreatingSubtask(true);

    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      console.error("Guest not found");
      return;
    }

    const guest = JSON.parse(storedGuest);

    const workspaceId = guest.workspaceId;
    const userId = guest.guestId;

    const response = await fetch(
      `http://localhost:5000/tasks/${taskId}/subtasks` +
        `?workspaceId=${workspaceId}&userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: subtaskTitle.trim(),
          description: subtaskDescription.trim(),
          type: "subtask",
          parentTaskId: taskId,
          status: subtaskStatus,
          priority: subtaskPriority,
          members: [],
          createdBy: userId,
          workspaceId,
          dueDate: subtaskDueDate || undefined,
          labels: subtaskLabels
            .split(",")
            .map((label: string) => label.trim())
            .filter(Boolean),
          resources: [],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "CREATE SUBTASK ERROR:",
        response.status,
        errorText,
      );

      throw new Error("Failed to create subtask");
    }

    const newSubtask = await response.json();

    setSubtasks((previous) => [
      newSubtask,
      ...previous,
    ]);

    setSubtaskTitle("");
    setSubtaskDescription("");
    setSubtaskStatus("To Do");
    setSubtaskPriority("Medium");
    setSubtaskDueDate("");
    setSubtaskLabels("");

    setShowSubtaskModal(false);
  } catch (error) {
    console.error("Create Subtask Error:", error);
  } finally {
    setCreatingSubtask(false);
  }
};

const handleAddWorkspaceMember = async (userId: string) => {
  try {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) return;

    const guest = JSON.parse(storedGuest);

    if (!guest.workspaceId || !task?._id) return;

    setAddingMemberId(userId);

    const response = await fetch(
      `http://localhost:5000/tasks/${task._id}/members` +
        `?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: userId,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "ADD MEMBER ERROR:",
        response.status,
        errorText,
      );

      throw new Error("Failed to add member");
    }

    const updatedTask = await response.json();

    // Task ko immediately update karo
    setTask(updatedTask);

  } catch (error) {
    console.error("Add Member Error:", error);
  } finally {
    setAddingMemberId(null);
  }
};

const handleAddMember = async () => {
  if (!memberId.trim()) {
    return;
  }

  try {
    setAddingMember(true);

    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      console.error("Guest not found");
      return;
    }

    const guest = JSON.parse(storedGuest);

    const workspaceId = guest.workspaceId;
    const userId = guest.guestId;

    const response = await fetch(
      `http://localhost:5000/tasks/${taskId}/members` +
        `?workspaceId=${workspaceId}&userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: memberId.trim(),
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "ADD MEMBER ERROR:",
        response.status,
        errorText,
      );

      throw new Error("Failed to add member");
    }

    const updatedTask = await response.json();

    setTask(updatedTask);

    setMemberId("");
    setShowMemberModal(false);
  } catch (error) {
    console.error("Add Member Error:", error);
  } finally {
    setAddingMember(false);
  }
};

useEffect(() => {
  if (!showMemberModal) return;

  const loadWorkspaceUsers = async () => {
    try {
      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) return;

      const guest = JSON.parse(storedGuest);

      if (!guest.workspaceId) return;

      const response = await fetch(
        `http://localhost:5000/workspace-members/users?workspaceId=${guest.workspaceId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workspace users");
      }

      const users = await response.json();

      setWorkspaceUsers(users);
    } catch (error) {
      console.error("Load Workspace Users Error:", error);
    }
  };

  loadWorkspaceUsers();
}, [showMemberModal]);


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

const subtasksUrl =
  `http://localhost:5000/tasks/${taskId}/subtasks` +
  `?workspaceId=${workspaceId}&userId=${userId}`;

console.log("SUBTASKS URL:", subtasksUrl);

const [taskResponse, updatesResponse, subtasksResponse] =
  await Promise.all([
    fetch(taskUrl),
    fetch(updatesUrl),
    fetch(subtasksUrl),
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

if (!subtasksResponse.ok) {
  const errorText = await subtasksResponse.text();

  console.error(
    "SUBTASKS API ERROR:",
    subtasksResponse.status,
    errorText,
  );

  throw new Error("Failed to fetch subtasks");
}
        const taskData = await taskResponse.json();
        const updatesData = await updatesResponse.json();
        const subtasksData = await subtasksResponse.json();

        setTask(taskData);
        setUpdates(updatesData);
        setSubtasks(subtasksData);
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
                <div>
                {subtasks.length === 0 ? (
                  <div className="flex h-[50px] items-center justify-center">
                    <span className="text-[11px] text-[#999]">
                      No subtasks yet
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e8e8e8]">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask._id}
                        className="flex items-center justify-between px-3 py-3"
                      >
                        <div>
                          <p className="text-[11px] font-medium text-[#333]">
                            {subtask.title}
                          </p>

                          <p className="mt-1 text-[9px] text-[#999]">
                            {subtask.status} · {subtask.priority}
                          </p>
                        </div>

                        <span className="text-[9px] text-[#999]">
                          {subtask.members?.length || 0} member
                          {subtask.members?.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <button
                  type="button"
                  onClick={() => setShowSubtaskModal(true)}
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
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#333]">
                      Members
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowMemberModal(true)}
                      className="text-[15px] leading-none text-[#333]"
                    >
                      +
                    </button>
                  </div>

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
        {showSubtaskModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
    <div className="w-full max-w-[430px] rounded-[22px] border border-[#dedede] bg-white p-6 shadow-xl">

      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[#171717]">
          Add Subtask
        </h2>

        <button
          type="button"
          onClick={() => setShowSubtaskModal(false)}
          className="text-[20px] text-[#888]"
        >
          ×
        </button>
      </div>

      <div className="mt-5 space-y-4">

        {/* Title */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Title
          </label>

          <input
            value={subtaskTitle}
            onChange={(e) =>
              setSubtaskTitle(e.target.value)
            }
            placeholder="Enter subtask title"
            className="mt-1.5 h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[13px] outline-none focus:border-[#999]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Description
          </label>

          <textarea
            value={subtaskDescription}
            onChange={(e) =>
              setSubtaskDescription(e.target.value)
            }
            placeholder="Add a description"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-[10px] border border-[#dedede] px-3 py-2.5 text-[13px] outline-none focus:border-[#999]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Status
          </label>

          <select
            value={subtaskStatus}
            onChange={(e) =>
              setSubtaskStatus(
                e.target.value as TaskStatus
              )
            }
            className="mt-1.5 h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[13px] outline-none"
          >
            <option>To Do</option>
            <option>Doing</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Priority
          </label>

          <select
            value={subtaskPriority}
            onChange={(e) =>
              setSubtaskPriority(e.target.value)
            }
            className="mt-1.5 h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[13px] outline-none"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Due Date
          </label>

          <input
            type="date"
            value={subtaskDueDate}
            onChange={(e) =>
              setSubtaskDueDate(e.target.value)
            }
            className="mt-1.5 h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[13px] outline-none"
          />
        </div>

        {/* Labels */}
        <div>
          <label className="text-[12px] font-medium text-[#444]">
            Labels
          </label>

          <input
            value={subtaskLabels}
            onChange={(e) =>
              setSubtaskLabels(e.target.value)
            }
            placeholder="Design, Frontend"
            className="mt-1.5 h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[13px] outline-none"
          />

          <p className="mt-1 text-[10px] text-[#999]">
            Separate multiple labels with commas.
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            setShowSubtaskModal(false)
          }
          className="h-[38px] rounded-full border border-[#dedede] px-5 text-[12px] font-medium text-[#555]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreateSubtask}
          disabled={creatingSubtask}
          className="h-[38px] rounded-full bg-[#171717] px-5 text-[12px] font-medium text-white disabled:opacity-50"
        >
          {creatingSubtask
            ? "Creating..."
            : "Add Subtask"}
        </button>
      </div>

    </div>
  </div>
)}

{showMemberModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
    <div className="w-full max-w-[400px] rounded-[20px] border border-[#dedede] bg-white p-6 shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-[#171717]">
          Add Member
        </h2>

        <button
          type="button"
          onClick={() => {
            setShowMemberModal(false);
            setMemberSearch("");
          }}
          className="text-[20px] text-[#888]"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <input
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search members..."
          className="h-[40px] w-full rounded-[10px] border border-[#dedede] px-3 text-[12px] outline-none focus:border-[#999]"
        />
      </div>

      {/* Users */}
      <div className="mt-4 max-h-[280px] overflow-y-auto rounded-[10px] border border-[#eeeeee]">
        {workspaceUsers
          .filter((user) => {
            const search = memberSearch.toLowerCase().trim();

            if (!search) return true;

            return (
              user.name?.toLowerCase().includes(search) ||
              user.username?.toLowerCase().includes(search)
            );
          })
          .map((user) => {
            const alreadyMember =
              task.members?.some(
                (member) => member.userId === user.userId
              ) ?? false;

            return (
              <div
                key={user.userId}
                className="flex items-center justify-between border-b border-[#eeeeee] px-3 py-3 last:border-b-0"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#171717] text-[10px] font-medium text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "G"}
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-[#333]">
                      {user.name || "Guest"}
                    </p>

                    {user.username && (
                      <p className="mt-0.5 text-[9px] text-[#999]">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add / Already Added */}
                {alreadyMember ? (
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#f3f3f3] text-[14px] font-medium text-[#777]">
                    ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleAddWorkspaceMember(user.userId)
                    }
                    disabled={addingMemberId === user.userId}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#dedede] text-[16px] text-[#555] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingMemberId === user.userId
                      ? "..."
                      : "+"}
                  </button>
                )}
              </div>
            );
          })}

        {/* No users */}
        {workspaceUsers.filter((user) => {
          const search = memberSearch.toLowerCase().trim();

          if (!search) return true;

          return (
            user.name?.toLowerCase().includes(search) ||
            user.username?.toLowerCase().includes(search)
          );
        }).length === 0 && (
          <div className="flex h-[70px] items-center justify-center">
            <span className="text-[11px] text-[#999]">
              No members found
            </span>
          </div>
        )}
      </div>

      {/* Done */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowMemberModal(false);
            setMemberSearch("");
          }}
          className="h-[36px] rounded-full border border-[#dedede] px-5 text-[12px] font-medium text-[#555]"
        >
          Done
        </button>
      </div>

    </div>
  </div>
)}
      </main>
    </div>
  );
}