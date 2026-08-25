"use client";

import type { Dispatch, SetStateAction } from "react";

import type {
  Task,
  TaskComment,
  TaskSettings,
  TaskStatus,
} from "@/components/task-details/types";

import { useState } from "react";

type UseTaskMutationsParams = {
  taskId: string;
  task: Task | null;
  currentUserId: string;
  isCreator: boolean;
  taskSettings: TaskSettings;

  editingSubtaskId: string | null;
  subtaskTitle: string;
  subtaskDescription: string;
  subtaskStatus: TaskStatus;
  subtaskPriority: string;
  subtaskDueDate: string;
  subtaskLabels: string;

  editingTaskId: string | null;
  taskTitle: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  taskPriority: string;
  taskDueDate: string;
  taskLabels: string;

  commentText: string;
  replyText: string;

  setTask: Dispatch<SetStateAction<Task | null>>;
  setSubtasks: Dispatch<SetStateAction<Task[]>>;
  setComments: Dispatch<SetStateAction<TaskComment[]>>;
  setTaskSettings: Dispatch<SetStateAction<TaskSettings>>;

  setShowSubtaskModal: Dispatch<SetStateAction<boolean>>;
  setSubtaskTitle: Dispatch<SetStateAction<string>>;
  setSubtaskDescription: Dispatch<SetStateAction<string>>;
  setSubtaskStatus: Dispatch<SetStateAction<TaskStatus>>;
  setSubtaskPriority: Dispatch<SetStateAction<string>>;
  setSubtaskDueDate: Dispatch<SetStateAction<string>>;
  setSubtaskLabels: Dispatch<SetStateAction<string>>;
  setEditingSubtaskId: Dispatch<SetStateAction<string | null>>;
  setOpenSubtaskAction: Dispatch<SetStateAction<string | null>>;

  setEditingTaskId: Dispatch<SetStateAction<string | null>>;
  setTaskTitle: Dispatch<SetStateAction<string>>;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  setTaskStatus: Dispatch<SetStateAction<TaskStatus>>;
  setTaskPriority: Dispatch<SetStateAction<string>>;
  setTaskDueDate: Dispatch<SetStateAction<string>>;
  setTaskLabels: Dispatch<SetStateAction<string>>;
  setShowTaskFormModal: Dispatch<SetStateAction<boolean>>;
  setShowTaskSettingsModal: Dispatch<SetStateAction<boolean>>;
  


  setReplyText: Dispatch<SetStateAction<string>>;
  setReplyingTo: Dispatch<SetStateAction<string | null>>;
  setCommentText: Dispatch<SetStateAction<string>>;

  setShowPriorityMenu: Dispatch<SetStateAction<boolean>>;
};

type UseTaskMutationsResult = {
  creatingSubtask: boolean;
  updatingTask: boolean;
  addingMemberId: string | null;
  addingComment: boolean;
  addingReply: boolean;
  savingSettings: boolean;
  handleCreateSubtask: () => Promise<void>;
  handleUpdateTask: () => Promise<void>;
  handleDeleteSubtask: (subtaskId: string) => Promise<void>;
  handleDeleteTask: () => Promise<void>;
  handleAddWorkspaceMember: (userId: string) => Promise<void>;
  handleRemoveMember: (memberId: string) => Promise<void>;
  handleAddComment: (
    parentCommentId?: string | null,
    messageOverride?: string,
  ) => Promise<void>;
  handlePriorityChange: (nextPriority: string) => Promise<void>;
  handleStartDateChange: (nextDate: string) => Promise<void>;
  handleDueDateChange: (nextDate: string) => Promise<void>;
  handleLeaveTask: () => Promise<void>;
  handleSaveTaskSettings: () => Promise<void>;
};

const getGuest = () => {
  const storedGuest = localStorage.getItem("guest");
  if (!storedGuest) return null;
  return JSON.parse(storedGuest) as { guestId: string; workspaceId: string };
};

export default function useTaskMutations({
  taskId,
  task,
  currentUserId,
  isCreator,
  taskSettings,
  editingSubtaskId,
  subtaskTitle,
  subtaskDescription,
  subtaskStatus,
  subtaskPriority,
  subtaskDueDate,
  subtaskLabels,
  editingTaskId,
  taskTitle,
  taskDescription,
  taskStatus,
  taskPriority,
  taskDueDate,
  taskLabels,
  commentText,
  replyText,
  setTask,
  setSubtasks,
  setComments,
  setTaskSettings,
  setShowSubtaskModal,
  setSubtaskTitle: resetSubtaskTitle,
  setSubtaskDescription: resetSubtaskDescription,
  setSubtaskStatus: resetSubtaskStatus,
  setSubtaskPriority: resetSubtaskPriority,
  setSubtaskDueDate: resetSubtaskDueDate,
  setSubtaskLabels: resetSubtaskLabels,
  setEditingSubtaskId,
  setOpenSubtaskAction,
  setEditingTaskId,
  setTaskTitle,
  setTaskDescription,
  setTaskStatus,
  setTaskPriority,
  setTaskDueDate,
  setTaskLabels,
  setShowTaskFormModal,
  setShowTaskSettingsModal,
  setReplyText,
  setReplyingTo,
  setCommentText,
  setShowPriorityMenu,
}: UseTaskMutationsParams): UseTaskMutationsResult {
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [addingReply, setAddingReply] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const setSubtaskFormClosed = () => {
    resetSubtaskTitle("");
    resetSubtaskDescription("");
    resetSubtaskStatus("To Do");
    resetSubtaskPriority("Medium");
    resetSubtaskDueDate("");
    resetSubtaskLabels("");
    setEditingSubtaskId(null);
    setShowSubtaskModal(false);
  };

  const handleCreateSubtask = async () => {
    if (!subtaskTitle.trim()) return;

    try {
      setCreatingSubtask(true);

      const guest = getGuest();
      if (!guest) return;

      const isEditing = Boolean(editingSubtaskId);
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingSubtaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/subtasks?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
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
                  .map((label) => label.trim())
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
                createdBy: guest.guestId,
                workspaceId: guest.workspaceId,
                dueDate: subtaskDueDate || undefined,
                labels: subtaskLabels
                  .split(",")
                  .map((label) => label.trim())
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

      setSubtaskFormClosed();
    } catch (error) {
      console.error("Subtask Save Error:", error);
    } finally {
      setCreatingSubtask(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !taskTitle.trim()) return;

    try {
      setUpdatingTask(true);

      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            status: taskStatus,
            priority: taskPriority,
            dueDate: taskDueDate || undefined,
            labels: taskLabels
              .split(",")
              .map((label) => label.trim())
              .filter(Boolean),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TASK UPDATE ERROR:", response.status, errorText);
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      setEditingTaskId(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskStatus("To Do");
      setTaskPriority("Medium");
      setTaskDueDate("");
      setTaskLabels("");
      setShowTaskFormModal(false);
    } catch (error) {
      console.error("Update Task Error:", error);
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${subtaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete subtask");

      setSubtasks((previous) =>
        previous.filter((item) => item._id !== subtaskId),
      );
      setOpenSubtaskAction(null);
    } catch (error) {
      console.error("Delete Subtask Error:", error);
    }
  };

  const handleDeleteTask = async () => {

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete task");

      window.location.href = "/tasks";
    } catch (error) {
      console.error("Delete Task Error:", error);
    }
  };

  const handleAddWorkspaceMember = async (userId: string) => {
    try {
      const guest = getGuest();
      if (!guest || !task?._id) return;

      setAddingMemberId(userId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}/members?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: userId }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ADD MEMBER ERROR:", response.status, errorText);
        throw new Error("Failed to add member");
      }

      setTask(await response.json());
    } catch (error) {
      console.error("Add Member Error:", error);
    } finally {
      setAddingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isCreator || !task || memberId === task.createdBy) return;

    const member = task.members?.find((item) => item.userId === memberId);
    if (!member) return;


    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/members/${memberId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("REMOVE MEMBER ERROR:", response.status, errorText);
        throw new Error("Failed to remove member");
      }

      setTask(await response.json());
    } catch (error) {
      console.error("Remove Member Error:", error);
    }
  };

  const handleAddComment = async (
    parentCommentId: string | null = null,
    messageOverride?: string,
  ) => {
    const message = (
      messageOverride ?? (parentCommentId ? replyText : commentText)
    ).trim();

    if (!message) return;

    try {
      const guest = getGuest();
      if (!guest || !guest.workspaceId || !guest.guestId || !taskId) return;

      if (parentCommentId) setAddingReply(true);
      else setAddingComment(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/comments?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, parentCommentId }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ADD COMMENT ERROR:", response.status, errorText);
        throw new Error("Failed to add comment");
      }

      const newComment = await response.json();
      setComments((previous) => [...previous, newComment]);

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

  const handlePriorityChange = async (nextPriority: string) => {
    setShowPriorityMenu(false);

    if (!task) return;

    const previousPriority = task.priority || "No Priority";
    if (nextPriority === previousPriority) return;

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priority:
              nextPriority === "No Priority" ? undefined : nextPriority,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PRIORITY UPDATE ERROR:", response.status, errorText);
        throw new Error("Failed to update priority");
      }

      setTask(await response.json());
    } catch (error) {
      console.error("Priority Update Error:", error);
    }
  };

  const handleStartDateChange = async (nextDate: string) => {
    if (!task || currentUserId !== task.createdBy) return;

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate: nextDate || undefined }),
        },
      );

      if (!response.ok) throw new Error("Failed to update start date");

      setTask(await response.json());
    } catch (error) {
      console.error("Start Date Update Error:", error);
    }
  };

  const handleDueDateChange = async (nextDate: string) => {
    if (!task || currentUserId !== task.createdBy) return;

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: nextDate || undefined }),
        },
      );

      if (!response.ok) throw new Error("Failed to update due date");

      setTask(await response.json());
    } catch (error) {
      console.error("Due Date Update Error:", error);
    }
  };

  const handleLeaveTask = async () => {
    if (isCreator) return;

    try {
      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/leave?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        { method: "POST" },
      );

      if (!response.ok) throw new Error("Failed to leave task");

      window.location.href = "/tasks";
    } catch (error) {
      console.error("Leave Task Error:", error);
    }
  };

  const handleSaveTaskSettings = async () => {
    try {
      setSavingSettings(true);

      const guest = getGuest();
      if (!guest) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/settings?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskSettings),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TASK SETTINGS ERROR:", response.status, errorText);
        throw new Error("Failed to update task settings");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      setTaskSettings({
        allowMembersToAddMembers:
          updatedTask.allowMembersToAddMembers ?? false,
        allowMembersToCreateSubtasks:
          updatedTask.allowMembersToCreateSubtasks ?? true,
        allowMembersToComment:
          updatedTask.allowMembersToComment ?? true,
      });
      setShowTaskSettingsModal(false);
    } catch (error) {
      console.error("Task Settings Error:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  return {
    creatingSubtask,
    updatingTask,
    addingMemberId,
    addingComment,
    addingReply,
    savingSettings,
    handleCreateSubtask,
    handleUpdateTask,
    handleDeleteSubtask,
    handleDeleteTask,
    handleAddWorkspaceMember,
    handleRemoveMember,
    handleAddComment,
    handlePriorityChange,
    handleStartDateChange,
    handleDueDateChange,
    handleLeaveTask,
    handleSaveTaskSettings,
  };
}