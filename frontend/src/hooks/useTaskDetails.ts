"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  Task,
  TaskComment,
  TaskSettings,
  TaskUpdate,
} from "@/components/task-details/types";
import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type UseTaskDetailsResult = {
  task: Task | null;
  updates: TaskUpdate[];
  subtasks: Task[];
  comments: TaskComment[];
  loading: boolean;
  currentUserId: string;
  taskSettings: TaskSettings;
  setTask: Dispatch<SetStateAction<Task | null>>;
  setSubtasks: Dispatch<SetStateAction<Task[]>>;
  setComments: Dispatch<SetStateAction<TaskComment[]>>;
  setTaskSettings: Dispatch<SetStateAction<TaskSettings>>;
};

export default function useTaskDetails(
  taskId: string,
  viewOnly: boolean,
): UseTaskDetailsResult {
  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [taskSettings, setTaskSettings] = useState<TaskSettings>({
    allowMembersToAddMembers: false,
    allowMembersToCreateSubtasks: true,
    allowMembersToComment: true,
  });

const fetchTaskData = useCallback(async (showLoader = false) => {
  try {
    if (showLoader) {
      setLoading(true);
    }

      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) {
        console.error("Guest not found");
        return;
      }

      const guest = JSON.parse(storedGuest);

      setCurrentUserId(guest.guestId);

      const workspaceId = guest.workspaceId;
      const userId = guest.guestId;

      if (!workspaceId || !userId || !taskId) {
        console.error("Missing task information");
        return;
      }

      const modeQuery = viewOnly ? "&mode=view" : "";
      const base = process.env.NEXT_PUBLIC_API_URL;

      const taskUrl =
        `${base}/tasks/${taskId}` +
        `?workspaceId=${workspaceId}` +
        `&userId=${userId}` +
        modeQuery;

      const updatesUrl =
        `${base}/tasks/${taskId}/updates` +
        `?workspaceId=${workspaceId}` +
        `&userId=${userId}` +
        modeQuery;

      const subtasksUrl =
        `${base}/tasks/${taskId}/subtasks` +
        `?workspaceId=${workspaceId}` +
        `&userId=${userId}` +
        modeQuery;

      const commentsUrl =
        `${base}/tasks/${taskId}/comments` +
        `?workspaceId=${workspaceId}` +
        `&userId=${userId}` +
        modeQuery;

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

      const responses = [
        [taskResponse, "TASK"],
        [updatesResponse, "UPDATES"],
        [subtasksResponse, "SUBTASKS"],
        [commentsResponse, "COMMENTS"],
      ] as const;

      for (const [response, label] of responses) {
        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            `${label} API ERROR:`,
            response.status,
            errorText,
          );

          throw new Error(
            `Failed to fetch ${label.toLowerCase()}`,
          );
        }
      }

      const taskData = await taskResponse.json();
      const updatesData = await updatesResponse.json();
      const subtasksData = await subtasksResponse.json();
      const commentsData = await commentsResponse.json();

      setTask(taskData);
      setUpdates(updatesData);
      setSubtasks(subtasksData);
      setComments(commentsData);

      setTaskSettings({
        allowMembersToAddMembers:
          taskData.allowMembersToAddMembers ?? false,
        allowMembersToCreateSubtasks:
          taskData.allowMembersToCreateSubtasks ?? true,
        allowMembersToComment:
          taskData.allowMembersToComment ?? true,
      });
    } catch (error) {
      console.error("Task Details Error:", error);
    } finally {
     if (showLoader) {
    setLoading(false);
  }
}
  }, [taskId, viewOnly]);

  useEffect(() => {
  void fetchTaskData(true);
}, [fetchTaskData]);

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBase) {
      console.error("NEXT_PUBLIC_API_URL is not configured");
      return;
    }

    const socketUrl = apiBase.replace(/\/api\/?$/, "");

    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.emit("join-task", taskId);

   socket.on(
    "task-updated",
    (payload: { taskId?: string }) => {
      if (payload?.taskId !== taskId) {
        return;
      }

      void fetchTaskData(false);
    },
  );

    return () => {
      socket.off("task-updated");
      socket.disconnect();
    };
  }, [taskId, fetchTaskData]);

  return {
    task,
    updates,
    subtasks,
    comments,
    loading,
    currentUserId,
    taskSettings,
    setTask,
    setSubtasks,
    setComments,
    setTaskSettings,
  };
}