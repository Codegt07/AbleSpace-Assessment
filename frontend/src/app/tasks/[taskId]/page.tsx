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

type TaskComment = {
  _id: string;
  taskId: string;
  userId: string;
  message: string;
  parentCommentId?: string | null;
  createdAt: string;
};


function PriorityIcon({ priority }: { priority?: string }) {
  const className =
    priority === "Urgent" || priority === "High"
      ? "text-[#ff5b5b]"
      : priority === "Low" || !priority
        ? "text-[#aab2bd]"
        : "text-[#f59e0b]";

  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={className}>
      <path d="M2 10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 10.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 10.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 3.2V7.1L6.7 11.5L11.2 7L6.8 2.5H2V3.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="4.1" cy="4.4" r="0.8" fill="currentColor" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.2 6.7L7.8 3.1C8.8 2.1 10.4 2.1 11.3 3C12.2 3.9 12.2 5.4 11.3 6.4L6.2 11.5C4.9 12.8 2.8 12.8 1.5 11.5C0.2 10.2 0.2 8.1 1.5 6.8L6.4 1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1.7" y="2.7" width="9.6" height="8.1" rx="1.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 1.5V4M9 1.5V4M1.8 5.2H11.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="5" cy="4.3" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.8 10.8C1.8 8.8 3.1 7.5 5 7.5C6.9 7.5 8.2 8.8 8.2 10.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8.4 3.1C9.8 3.3 10.7 4.4 10.7 5.8M9 8C10.5 8.4 11.2 9.3 11.3 10.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function formatShortDate(date?: string) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function priorityTextClass(priority?: string) {
  if (priority === "Urgent" || priority === "High") return "text-[#ff5b5b]";
  if (priority === "Low" || !priority) return "text-[#aab2bd]";
  return "text-[#f59e0b]";
}

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
const [comments, setComments] = useState<TaskComment[]>([]);
const [commentText, setCommentText] = useState("");
const [addingComment, setAddingComment] = useState(false);
const [replyingTo, setReplyingTo] = useState<string | null>(null);
const [replyText, setReplyText] = useState("");
const [addingReply, setAddingReply] = useState(false);

const [memberSearch, setMemberSearch] = useState("");
const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
const [showPriorityMenu, setShowPriorityMenu] = useState(false);
const [showAllComments, setShowAllComments] = useState(false);
const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
const [openSubtaskAction, setOpenSubtaskAction] = useState<string | null>(null);
const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);

const handleCreateSubtask = async () => {
  if (!subtaskTitle.trim()) return;

  try {
    setCreatingSubtask(true);

    const storedGuest = localStorage.getItem("guest");
    if (!storedGuest) return;

    const guest = JSON.parse(storedGuest);
    const workspaceId = guest.workspaceId;
    const userId = guest.guestId;

    const isEditing = Boolean(editingSubtaskId);
    const url = isEditing
      ? `http://localhost:5000/tasks/${editingSubtaskId}?workspaceId=${workspaceId}&userId=${userId}`
      : `http://localhost:5000/tasks/${taskId}/subtasks?workspaceId=${workspaceId}&userId=${userId}`;

    const response = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isEditing
          ? {
              title: subtaskTitle.trim(),
              description: subtaskDescription.trim(),
              status: subtaskStatus,
              priority: subtaskPriority,
              dueDate: subtaskDueDate || undefined,
              labels: subtaskLabels
                .split(",")
                .map((label: string) => label.trim())
                .filter(Boolean),
            }
          : {
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
            },
      ),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SUBTASK SAVE ERROR:", response.status, errorText);
      throw new Error("Failed to save subtask");
    }

    const savedSubtask = await response.json();

    setSubtasks((previous) =>
      isEditing
        ? previous.map((item) =>
            item._id === editingSubtaskId ? savedSubtask : item,
          )
        : [savedSubtask, ...previous],
    );

    setSubtaskTitle("");
    setSubtaskDescription("");
    setSubtaskStatus("To Do");
    setSubtaskPriority("Medium");
    setSubtaskDueDate("");
    setSubtaskLabels("");
    setEditingSubtaskId(null);
    setShowSubtaskModal(false);
  } catch (error) {
    console.error("Subtask Save Error:", error);
  } finally {
    setCreatingSubtask(false);
  }
};

const handleEditSubtask = (subtask: Task) => {
  setEditingSubtaskId(subtask._id);
  setSubtaskTitle(subtask.title || "");
  setSubtaskDescription(subtask.description || "");
  setSubtaskStatus(subtask.status || "To Do");
  setSubtaskPriority(subtask.priority || "Medium");
  setSubtaskDueDate(
    subtask.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 10) : "",
  );
  setSubtaskLabels((subtask.labels || []).join(", "));
  setOpenSubtaskAction(null);
  setShowSubtaskModal(true);
};

const handleDeleteSubtask = async (subtaskId: string) => {
  if (!window.confirm("Delete this subtask?")) return;

  try {
    const storedGuest = localStorage.getItem("guest");
    if (!storedGuest) return;

    const guest = JSON.parse(storedGuest);
    const response = await fetch(
      `http://localhost:5000/tasks/${subtaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw new Error("Failed to delete subtask");
    }

    setSubtasks((previous) =>
      previous.filter((item) => item._id !== subtaskId),
    );
    setOpenSubtaskAction(null);
  } catch (error) {
    console.error("Delete Subtask Error:", error);
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

const handleAddComment = async (
  parentCommentId: string | null = null,
  messageOverride?: string,
) => {
  const message = (
    messageOverride ??
    (parentCommentId ? replyText : commentText)
  ).trim();

  if (!message) {
    return;
  }

  try {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      return;
    }

    const guest = JSON.parse(storedGuest);

    const workspaceId = guest.workspaceId;
    const userId = guest.guestId;

    if (!workspaceId || !userId || !taskId) {
      return;
    }

    if (parentCommentId) {
      setAddingReply(true);
    } else {
      setAddingComment(true);
    }

    const response = await fetch(
      `http://localhost:5000/tasks/${taskId}/comments` +
        `?workspaceId=${workspaceId}&userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          parentCommentId,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "ADD COMMENT ERROR:",
        response.status,
        errorText,
      );

      throw new Error("Failed to add comment");
    }

    const newComment = await response.json();

    setComments((previous) => [
      ...previous,
      newComment,
    ]);

    if (parentCommentId) {
      setReplyText("");
      setReplyingTo(null);
    } else {
      setCommentText("");
    }
  } catch (error) {
    console.error("Add Comment Error:", error);
  } finally {
    setAddingComment(false);
    setAddingReply(false);
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

  const commentsUrl =
  `http://localhost:5000/tasks/${taskId}/comments` +
  `?workspaceId=${workspaceId}&userId=${userId}`;

console.log("SUBTASKS URL:", subtasksUrl);

const [
  taskResponse,
  updatesResponse,
  subtasksResponse,
  commentsResponse,
] = await Promise.all([
  fetch(taskUrl),
  fetch(updatesUrl),
  fetch(subtasksUrl),
  fetch(commentsUrl),
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
if (!commentsResponse.ok) {
  const errorText = await commentsResponse.text();

  console.error(
    "COMMENTS API ERROR:",
    commentsResponse.status,
    errorText,
  );

  throw new Error("Failed to fetch comments");
}
const taskData = await taskResponse.json();
const updatesData = await updatesResponse.json();
const subtasksData = await subtasksResponse.json();
const commentsData = await commentsResponse.json();
setTask(taskData);
setUpdates(updatesData);
setSubtasks(subtasksData);
setComments(commentsData);
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

  const getUser = (userId: string) =>
    workspaceUsers.find((user) => user.userId === userId);

  const userInitial = (userId: string) =>
    getUser(userId)?.name?.charAt(0)?.toUpperCase() || "G";

  const formatUserName = (userId: string) =>
    getUser(userId)?.name || userId;

  const rootComments = comments.filter((comment) => !comment.parentCommentId);
  const visibleComments = showAllComments ? rootComments : rootComments.slice(0, 2);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((previous) => {
      const next = new Set(previous);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const priorityOptions = ["No Priority", "Urgent", "High", "Medium", "Low"];

  const priorityUpdateText = (update: TaskUpdate) => {
    const metadata = update.metadata || {};
    const oldPriority =
      metadata.fromPriority ??
      metadata.previousPriority ??
      metadata.oldPriority ??
      metadata.from;
    const newPriority =
      metadata.toPriority ??
      metadata.nextPriority ??
      metadata.newPriority ??
      metadata.to;

    if (
      (metadata.type === "priority" || metadata.field === "priority") &&
      oldPriority !== undefined &&
      newPriority !== undefined
    ) {
      return `changed priority from ${oldPriority || "No priority"} to ${newPriority}`;
    }

    return update.message;
  };

  const handlePriorityChange = async (nextPriority: string) => {
    setShowPriorityMenu(false);

    const previousPriority = task.priority || "No priority";
    if (nextPriority === previousPriority) return;

    try {
      const storedGuest = localStorage.getItem("guest");
      if (!storedGuest) return;

      const guest = JSON.parse(storedGuest);

      const response = await fetch(
        `http://localhost:5000/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: nextPriority === "No Priority" ? undefined : nextPriority,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PRIORITY UPDATE ERROR:", response.status, errorText);
        throw new Error("Failed to update priority");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
    } catch (error) {
      console.error("Priority Update Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <div className="h-[54px] border-b border-[#e8e8e8]" />

        <div className="flex gap-7 px-7 py-6">
          <section className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-[25px] font-semibold leading-8 text-[#151515]">
                  {task.title}
                </h1>
                <p className="mt-1.5 max-w-[720px] text-[14px] leading-5.5 text-[#666]">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" title="Lock" className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[#dedede] bg-white text-[#444] hover:bg-[#f8f8f8]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4.5 6V4.5C4.5 2.57 9.5 2.57 9.5 4.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
                <button type="button" title="Views" className="flex h-[30px] items-center gap-1 rounded-md border border-[#dedede] bg-white px-2 text-[#666] hover:bg-[#f8f8f8]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 7C2.8 4.8 4.6 3.7 7 3.7C9.4 3.7 11.2 4.8 12.5 7C11.2 9.2 9.4 10.3 7 10.3C4.6 10.3 2.8 9.2 1.5 7Z" stroke="currentColor" strokeWidth="1.1" />
                    <circle cx="7" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                  <span className="text-[10px]">1</span>
                </button>
                <button type="button" title="Share" className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[#dedede] bg-white text-[#555] hover:bg-[#f8f8f8]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="4" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.1" />
                    <circle cx="10" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
                    <circle cx="10" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M5.3 6.3L8.7 4.2M5.3 7.7L8.7 9.8" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </button>
                <button type="button" title="More" className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[#dedede] bg-white text-[11px] text-[#555] hover:bg-[#f8f8f8]">
                  •••
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[14px] font-medium text-[#2b2b2b]">Properties</span>
              <div className="flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[9px] font-medium text-white">
                {getUser(task.createdBy)?.avatar ? (
                  <img src={getUser(task.createdBy)?.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  userInitial(task.createdBy)
                )}
              </div>
              <span className="flex items-center gap-1.5 rounded-md bg-[#fff0f0] px-2.5 py-1 text-[11px] font-medium text-[#ff4d4f]">
                <span>▣</span>
                {formatShortDate(task.dueDate)}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-7">
              <span className="w-[58px] pt-[3px] text-[14px] font-medium text-[#2b2b2b]">Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {task.labels?.length ? task.labels.map((label) => (
                  <span key={label} className="flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[10px] font-medium text-[#444]">
                    <TagIcon />
                    {label}
                  </span>
                )) : (
                  <span className="text-[13px] text-[#888]">No labels</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-7">
              <span className="w-[58px] text-[14px] font-medium text-[#2b2b2b]">Resources</span>
              <button type="button" className="flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#555]">
                <PaperclipIcon />
                Add document or link...
              </button>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[12px] text-[#333]">▾</span>
                <h2 className="text-[14px] font-medium text-[#2b2b2b]">Subtasks</h2>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#dedede]">
                <div className="grid grid-cols-[2fr_1.1fr_1.2fr_1.3fr_48px] border-b border-[#e8e8e8] px-3">
                  <div className="py-3.5 text-[13px] font-semibold text-[#2b2b2b]">Task</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[#2b2b2b]">Priority</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[#2b2b2b]">Members</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[#2b2b2b]">Due Date</div>
                  <div />
                </div>

                {subtasks.length === 0 ? (
                  <div className="flex h-[62px] items-center justify-center">
                    <span className="text-[13px] text-[#888]">No subtasks yet</span>
                  </div>
                ) : subtasks.map((subtask) => {
                  const members = subtask.members || [];
                  const visible = members.slice(0, 3);
                  const remaining = Math.max(members.length - 3, 0);

                  return (
                    <div key={subtask._id} className="grid min-h-[55px] grid-cols-[2fr_1.1fr_1.2fr_1.3fr_48px] items-center border-b border-[#e8e8e8] px-3 last:border-b-0 hover:bg-[#fcfcfc]">
                      <span className="block truncate text-[13px] font-medium text-[#222]">{subtask.title}</span>

                      <div className={`flex items-center gap-1.5 text-[12px] font-medium ${priorityTextClass(subtask.priority)}`}>
                        <PriorityIcon priority={subtask.priority} />
                        {subtask.priority || "Medium"}
                      </div>

                      <div className="flex items-center">
                        {members.length === 0 ? (
                          <button type="button" className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#e1e1e1] bg-white text-[15px] text-[#777]">+</button>
                        ) : (
                          <>
                            {visible.map((member, index) => (
                              <div key={member._id} className={`flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#171717] text-[8px] font-medium text-white ${index > 0 ? "-ml-1.5" : ""}`}>
                                {getUser(member.userId)?.avatar ? (
                                  <img src={getUser(member.userId)?.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  userInitial(member.userId)
                                )}
                              </div>
                            ))}
                            {remaining > 0 && (
                              <div className="-ml-1 flex h-[25px] min-w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#f1f1f1] px-1 text-[9px] font-medium text-[#666]">+{remaining}</div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-[12px] text-[#444]">{formatShortDate(subtask.dueDate)}</div>

                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSubtaskAction((previous) =>
                              previous === subtask._id ? null : subtask._id,
                            )
                          }
                          className="flex h-[28px] w-[28px] items-center justify-center rounded-md text-[14px] text-[#777] hover:bg-[#f2f2f2]"
                        >
                          ···
                        </button>

                        {openSubtaskAction === subtask._id && (
                          <div className="absolute right-0 top-[32px] z-20 w-[112px] overflow-hidden rounded-lg border border-[#dedede] bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => handleEditSubtask(subtask)}
                              className="flex w-full px-3 py-2 text-left text-[11px] font-medium text-[#333] hover:bg-[#f6f6f6]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubtask(subtask._id)}
                              className="flex w-full px-3 py-2 text-left text-[11px] font-medium text-[#ef4444] hover:bg-[#fff5f5]"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button type="button" onClick={() => setShowSubtaskModal(true)} className="flex h-[42px] w-full items-center gap-2 px-3 text-[12px] font-medium text-[#333] hover:bg-[#fafafa]">
                  <span className="text-[18px] leading-none">+</span>
                  Add Subtasks
                </button>
              </div>
            </div>

            <div className="mt-9">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#222]">Comments</h2>
                {rootComments.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllComments((previous) => !previous)}
                    className="rounded-md px-2 py-1 text-[11px] font-medium text-[#777] transition-colors hover:bg-[#f5f7fb] hover:text-[#2563eb]"
                  >
                    {showAllComments ? "Show less" : `View more (${rootComments.length - 2})`}
                  </button>
                )}
              </div>

              {visibleComments.map((comment) => {
                const replies = comments.filter(
                  (reply) => reply.parentCommentId === comment._id,
                );
                const repliesOpen = expandedReplies.has(comment._id);

                return (
                  <div
                    key={comment._id}
                    className="mb-3.5 overflow-hidden rounded-lg border border-[#dedede] bg-white"
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[9px] font-medium text-white">
                          {getUser(comment.userId)?.avatar ? (
                            <img
                              src={getUser(comment.userId)?.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            userInitial(comment.userId)
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#222]">
                              {formatUserName(comment.userId)}
                            </span>
                            <span className="text-[10px] text-[#999]">
                              {new Date(comment.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] leading-5 text-[#303030]">
                            {comment.message}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="rounded-md px-1.5 py-1 text-[13px] text-[#777] hover:bg-[#f5f5f5]"
                        >
                          ···
                        </button>
                      </div>
                    </div>

                    <div className="flex h-[43px] items-center gap-2.5 border-t border-[#eeeeee] px-4">
                      <div className="flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[8px] text-white">
                        {getUser(task.createdBy)?.avatar ? (
                          <img
                            src={getUser(task.createdBy)?.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInitial(task.createdBy)
                        )}
                      </div>
                      <input
                        value={replyingTo === comment._id ? replyText : ""}
                        onFocus={() => setReplyingTo(comment._id)}
                        onChange={(e) => {
                          setReplyingTo(comment._id);
                          setReplyText(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(comment._id);
                        }}
                        placeholder="Leave a reply..."
                        className="h-full flex-1 bg-transparent text-[12px] text-[#333] outline-none placeholder:text-[#aaa]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(comment._id)}
                        disabled={
                          addingReply ||
                          !replyText.trim() ||
                          replyingTo !== comment._id
                        }
                        className="text-[14px] text-[#555] transition-colors hover:text-[#2563eb] disabled:opacity-40"
                      >
                        ➤
                      </button>
                    </div>

                    {replies.length > 0 && (
                      <div className="border-t border-[#eeeeee] px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleReplies(comment._id)}
                          className="ml-[40px] text-[11px] font-medium text-[#777] transition-colors hover:text-[#2563eb]"
                        >
                          {repliesOpen
                            ? "Hide replies"
                            : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                        </button>

                        {repliesOpen && (
                          <div className="mt-2.5 ml-[40px] border-l border-[#e5e5e5] pl-3.5">
                            {replies.map((reply) => (
                              <div key={reply._id} className="flex gap-2.5 py-2">
                                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[7px] text-white">
                                  {getUser(reply.userId)?.avatar ? (
                                    <img
                                      src={getUser(reply.userId)?.avatar}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    userInitial(reply.userId)
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-[#444]">
                                      {formatUserName(reply.userId)}
                                    </span>
                                    <span className="text-[9px] text-[#aaa]">
                                      {new Date(reply.createdAt).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-[11px] leading-4 text-[#555]">
                                    {reply.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex h-[48px] items-center gap-2.5 rounded-lg border border-[#dedede] px-4">
                <div className="flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[8px] text-white">
                  {getUser(task.createdBy)?.avatar ? (
                    <img
                      src={getUser(task.createdBy)?.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitial(task.createdBy)
                  )}
                </div>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment(null);
                  }}
                  placeholder="Add a comment..."
                  className="h-full flex-1 bg-transparent text-[12px] text-[#333] outline-none placeholder:text-[#aaa]"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(null)}
                  disabled={addingComment || !commentText.trim()}
                  className="text-[14px] text-[#555] transition-colors hover:text-[#2563eb] disabled:opacity-40"
                >
                  ➤
                </button>
              </div>
            </div>
          </section>

          <aside className="w-[285px] shrink-0">
            <div className="rounded-xl border border-[#dedede] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">▾</span>
                  <h2 className="text-[13px] font-semibold text-[#222]">Details</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="text-[17px] text-[#333]">+</button>
                  <button type="button" className="text-[14px] text-[#777]">⚙</button>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-[65px_1fr] items-center">
                  <span className="text-[11px] text-[#555]">Status</span>
                  <span className="flex w-fit items-center gap-1.5 rounded-md bg-[#fff5e6] px-2.5 py-1.5 text-[12px] font-medium text-orange-600">
                    <span className="h-[6px] w-[6px] rounded-full bg-orange-500" />
                    {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-[65px_1fr] items-start">
                  <span className="pt-1 text-[12px] font-medium text-[#555]">Priority</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPriorityMenu((previous) => !previous)}
                      className={`flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[12px] font-medium transition-colors hover:bg-[#f7f7f7] ${priorityTextClass(task.priority)}`}
                    >
                      <PriorityIcon priority={task.priority} />
                      {task.priority || "No Priority"}
                      <span className="text-[9px] text-[#888]">⌄</span>
                    </button>

                    {showPriorityMenu && (
                      <div className="absolute left-0 top-[30px] z-30 w-[150px] overflow-hidden rounded-lg border border-[#dedede] bg-white py-1.5 shadow-lg">
                        <p className="px-3 py-1.5 text-[9px] font-medium text-[#999]">
                          Priority
                        </p>
                        {priorityOptions.map((option) => {
                          const isSelected =
                            option === (task.priority || "No Priority");

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handlePriorityChange(option)}
                              className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors hover:bg-[#f7f7f7] ${
                                isSelected
                                  ? priorityTextClass(
                                      option === "No Priority" ? undefined : option,
                                    )
                                  : "text-[#555]"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <PriorityIcon
                                  priority={option === "No Priority" ? undefined : option}
                                />
                                {option}
                              </span>
                              {isSelected && <span className="text-[11px]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[65px_1fr] items-start">
                  <span className="pt-1 text-[12px] font-medium text-[#555]">Members</span>
                  <div>
                    {task.members?.length ? (
                      <div className="flex items-center gap-1.5">
                        {task.members.slice(0, 3).map((member, index) => (
                          <div
                            key={member._id}
                            className={`flex h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#171717] text-[8px] text-white ${index > 0 ? "-ml-2" : ""}`}
                          >
                            {getUser(member.userId)?.avatar ? (
                              <img
                                src={getUser(member.userId)?.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial(member.userId)
                            )}
                          </div>
                        ))}
                        {task.members.length > 3 && (
                          <div className="-ml-1 flex h-[25px] min-w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#f1f1f1] px-1 text-[9px] font-medium text-[#666]">
                            +{task.members.length - 3}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowMemberModal(true)}
                          className="ml-1 flex items-center gap-1.5 text-[11px] font-medium text-[#555] hover:text-[#222]"
                        >
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#dedede] text-[14px]">
                            +
                          </span>
                          <PeopleIcon />
                          Add members
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowMemberModal(true)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-[#555] hover:text-[#222]"
                      >
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#dedede] text-[14px]">
                          +
                        </span>
                        <PeopleIcon />
                        Add members
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[65px_1fr] items-center">
                  <span className="text-[11px] text-[#555]">Dates</span>
                  <span className="text-[11px] text-[#777]">{formatShortDate(task.dueDate)}</span>
                </div>

                <div className="grid grid-cols-[65px_1fr] items-start">
                  <span className="pt-1 text-[12px] font-medium text-[#555]">Labels</span>
                  <div className="flex flex-wrap gap-1">
                    {task.labels?.length ? task.labels.map((label) => (
                      <span key={label} className="flex items-center gap-1 rounded-full bg-[#f3f3f3] px-2 py-1 text-[9px]">
                        <TagIcon />
                        {label}
                      </span>
                    )) : <span className="text-[10px] text-[#999]">None</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#dedede] bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px]">▾</span>
                <h2 className="text-[13px] font-semibold text-[#222]">Updates</h2>
              </div>

              <div className="mt-4 space-y-3.5">
                {updates.filter((update) => !/posted an update/i.test(update.message)).length === 0 ? (
                  <p className="text-[11px] text-[#999]">No updates yet.</p>
                ) : (
                  updates
                    .filter((update) => !/posted an update/i.test(update.message))
                    .slice(0, 5)
                    .map((update) => (
                      <div
                        key={update._id}
                        className="border-b border-[#f0f0f0] pb-3.5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-[25px] w-[25px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[8px] font-medium text-white">
                            {getUser(update.userId)?.avatar ? (
                              <img
                                src={getUser(update.userId)?.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial(update.userId)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold leading-4 text-[#2b2b2b]">
                              {formatUserName(update.userId)}
                            </p>
                            <p className="mt-0.5 text-[10px] leading-4 text-[#777]">
                              {priorityUpdateText(update)}
                            </p>
                            <p className="mt-1 text-[9px] text-[#aaa]">
                              {new Date(update.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
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
          {editingSubtaskId ? "Edit Subtask" : "Add Subtask"}
        </h2>

        <button
          type="button"
          onClick={() => {
            setShowSubtaskModal(false);
            setEditingSubtaskId(null);
            setSubtaskTitle("");
            setSubtaskDescription("");
            setSubtaskStatus("To Do");
            setSubtaskPriority("Medium");
            setSubtaskDueDate("");
            setSubtaskLabels("");
          }}
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
            ? editingSubtaskId
              ? "Saving..."
              : "Creating..."
            : editingSubtaskId
              ? "Save Changes"
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