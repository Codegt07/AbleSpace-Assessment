"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";

export type TaskStatus =
  | "To Do"
  | "Doing"
  | "Completed"
  | "On Hold";

export type TaskMember = {
  userId: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];

  createdBy?: string;
  members?: TaskMember[];
};

type Guest = {
  guestId: string;
  workspaceId: string;
  name?: string;
};

export type UseTaskBoardResult = {
  tasks: Task[];
  loading: boolean;

  addingTask: boolean;
  showAddTaskWaitMessage: boolean;

  showTaskModal: boolean;
  editingTaskId: string | null;

  title: string;
  description: string;
  selectedStatus: TaskStatus;
  priority: string;
  dueDate: string;
  labels: string;

  setShowTaskModal: Dispatch<SetStateAction<boolean>>;
  setEditingTaskId: Dispatch<SetStateAction<string | null>>;
  setTitle: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setSelectedStatus: Dispatch<SetStateAction<TaskStatus>>;
  setPriority: Dispatch<SetStateAction<string>>;
  setDueDate: Dispatch<SetStateAction<string>>;
  setLabels: Dispatch<SetStateAction<string>>;

  resetTaskForm: () => void;
  openAddTask: (status: TaskStatus) => void;
  openEditTask: (taskId: string) => void;

  handleDropTask: (
    taskId: string,
    newStatus: TaskStatus,
  ) => Promise<void>;

  handleAddTask: () => Promise<Task | null>;
  handleUpdateTask: () => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleLeaveTask: (taskId: string) => Promise<void>;
};

type UseTaskBoardOptions = {
  refreshNotifications?: (
    silent?: boolean,
  ) => Promise<void>;
};

export default function useTaskBoard({
  refreshNotifications,
}: UseTaskBoardOptions = {}): UseTaskBoardResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("To Do");

  const [priority, setPriority] = useState("No Priority");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");

  const [addingTask, setAddingTask] =
    useState(false);

  const [
    showAddTaskWaitMessage,
    setShowAddTaskWaitMessage,
  ] = useState(false);

  const getGuest = useCallback((): Guest | null => {
    const storedGuest =
      localStorage.getItem("guest");

    if (!storedGuest) {
      return null;
    }

    try {
      return JSON.parse(storedGuest) as Guest;
    } catch {
      return null;
    }
  }, []);

  const parseLabels = useCallback(() => {
    return labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
  }, [labels]);

  const resetTaskForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setSelectedStatus("To Do");
    setPriority("No Priority");
    setDueDate("");
    setLabels("");
    setEditingTaskId(null);
    setShowTaskModal(false);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const guest = getGuest();

      if (!guest) {
        console.error("Guest not found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch tasks",
        );
      }

      const data = await response.json();

      setTasks(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.error(
        "Fetch Tasks Error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, [getGuest]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const openAddTask = useCallback(
    (status: TaskStatus) => {
      setEditingTaskId(null);
      setTitle("");
      setDescription("");
      setSelectedStatus(status);
      setPriority("No Priority");
      setDueDate("");
      setLabels("");
      setShowTaskModal(true);
    },
    [],
  );

  const openEditTask = useCallback(
    (taskId: string) => {
      const task = tasks.find(
        (item) => item._id === taskId,
      );

      if (!task) {
        return;
      }

      setEditingTaskId(task._id);
      setTitle(task.title);
      setDescription(task.description || "");
      setSelectedStatus(task.status);
      setPriority(task.priority || "No Priority");

      setDueDate(
        task.dueDate
          ? new Date(task.dueDate)
              .toISOString()
              .split("T")[0]
          : "",
      );

      setLabels(
        (task.labels || []).join(", "),
      );

      setShowTaskModal(true);
    },
    [tasks],
  );


    const handleLeaveTask = useCallback(
      async (taskId: string) => {
        try {
          const guest = getGuest();

          if (!guest) return;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/leave?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
            {
              method: "POST",
            },
          );

          if (!response.ok) {
            throw new Error("Failed to leave task");
          }

          setTasks((previousTasks) =>
            previousTasks.filter(
              (task) => task._id !== taskId,
            ),
          );

          toast.success("You left the task");
        } catch (error) {
          console.error(
            "Leave Task Error:",
            error,
          );

          toast.error("Failed to leave task");
        }
      },
      [getGuest],
    );

  const handleDropTask = useCallback(
    async (
      taskId: string,
      newStatus: TaskStatus,
    ) => {
      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        const task = tasks.find(
          (item) => item._id === taskId,
        );

        if (!task) {
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: task.title,
              status: newStatus,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to update task status",
          );
        }

        const updatedTask =
          await response.json();

        setTasks((previousTasks) =>
          previousTasks.map((item) =>
            item._id === taskId
              ? updatedTask
              : item,
          ),
        );
      } catch (error) {
        console.error(
          "Drag and Drop Status Error:",
          error,
        );

        toast.error(
          "Failed to move task",
        );
      }
    },
    [getGuest, tasks],
  );

  const handleAddTask = useCallback(
    async (): Promise<Task | null> => {
      if (!title.trim()) {
        toast.error(
          "Task title is required",
        );
        return null;
      }

      if (addingTask) {
        return null;
      }

      setAddingTask(true);
      setShowAddTaskWaitMessage(false);

      const waitMessageTimer =
        window.setTimeout(() => {
          setShowAddTaskWaitMessage(true);
        }, 3000);

      try {
        const guest = getGuest();

        if (!guest) {
          return null;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: title.trim(),
              description:
                description.trim(),
              type: "main",
              parentTaskId: null,
              status: selectedStatus,
              priority,
              members: [
                guest.guestId,
              ],
              createdBy: guest.guestId,
              workspaceId:
                guest.workspaceId,
              dueDate:
                dueDate || undefined,
              labels: parseLabels(),
              resources: [],
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to create task",
          );
        }

        const newTask =
          await response.json();

        setTasks((previousTasks) => [
          newTask,
          ...previousTasks,
        ]);

        resetTaskForm();

        toast.success(
          "Task created successfully",
        );

        await refreshNotifications?.(
          true,
        );

        return newTask as Task;
      } catch (error) {
        console.error(
          "Add Task Error:",
          error,
        );

        toast.error(
          "Failed to create task",
        );
        return null;
      } finally {
        window.clearTimeout(
          waitMessageTimer,
        );

        setAddingTask(false);
        setShowAddTaskWaitMessage(false);
      }
    },
    [
      addingTask,
      description,
      dueDate,
      getGuest,
      labels,
      parseLabels,
      priority,
      refreshNotifications,
      resetTaskForm,
      selectedStatus,
      title,
    ],
  );

  const handleUpdateTask = useCallback(
    async () => {
      if (
        !editingTaskId ||
        !title.trim()
      ) {
        return;
      }

      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: title.trim(),
              status: selectedStatus,
              description:
                description.trim(),
              priority,
              dueDate:
                dueDate || undefined,
              labels: parseLabels(),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to update task",
          );
        }

        const updatedTask =
          await response.json();

        setTasks((previousTasks) =>
          previousTasks.map((item) =>
            item._id === editingTaskId
              ? updatedTask
              : item,
          ),
        );

        resetTaskForm();

        toast.success(
          "Task updated successfully",
        );

        await refreshNotifications?.(
          true,
        );
      } catch (error) {
        console.error(
          "Update Task Error:",
          error,
        );

        toast.error(
          "Failed to update task",
        );
      }
    },
    [
      description,
      dueDate,
      editingTaskId,
      getGuest,
      parseLabels,
      priority,
      refreshNotifications,
      resetTaskForm,
      selectedStatus,
      title,
    ],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to delete task",
          );
        }

        setTasks((previousTasks) =>
          previousTasks.filter(
            (item) => item._id !== taskId,
          ),
        );

        toast.success(
          "Task deleted successfully",
        );

        await refreshNotifications?.(
          true,
        );
      } catch (error) {
        console.error(
          "Delete Task Error:",
          error,
        );

        toast.error(
          "Failed to delete task",
        );
      }
    },
    [getGuest, refreshNotifications],
  );

  return {
    tasks,
    loading,

    addingTask,
    showAddTaskWaitMessage,

    showTaskModal,
    editingTaskId,

    title,
    description,
    selectedStatus,
    priority,
    dueDate,
    labels,

    setShowTaskModal,
    setEditingTaskId,
    setTitle,
    setDescription,
    setSelectedStatus,
    setPriority,
    setDueDate,
    setLabels,
    resetTaskForm,
    openAddTask,
    openEditTask,
    handleDropTask,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleLeaveTask,
  };
}