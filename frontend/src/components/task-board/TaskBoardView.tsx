"use client";

import BoardColumn from "../BoardColumn";
import TaskList from "../TaskList";
import type { Task, TaskStatus } from "@/hooks/useTaskBoard";
import { useEffect, useState } from "react";

const statuses: TaskStatus[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

type TaskBoardViewProps = {
  tasks: Task[];
  searchQuery: string;
  visibleFields: string[];
  viewMode: "board" | "list";
  openAddTask: (status: TaskStatus) => void;
  openTask: (taskId: string) => void;
  openEditTask: (taskId: string) => void;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleDropTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  handleLeaveTask: (taskId: string) => Promise<void>;
};



export default function TaskBoardView({
  tasks,
  searchQuery,
  visibleFields,
  viewMode,
  openAddTask,
  openTask,
  openEditTask,
  handleDeleteTask,
  handleDropTask,
  handleLeaveTask,
}: TaskBoardViewProps) {
  if (viewMode === "list") {
    return (
      <TaskList
        tasks={tasks}
        onAddTask={openAddTask}
        onOpenTask={openTask}
        onEditTask={openEditTask}
        onDeleteTask={handleDeleteTask}
        isSearching={searchQuery.trim().length > 0}
        visibleFields={visibleFields}
      />
    );
  }
  const [currentUserId, setCurrentUserId] =
  useState<string | null>(null);

    useEffect(() => {
      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) return;

      try {
        const guest = JSON.parse(storedGuest);

        setCurrentUserId(guest.guestId || null);
      } catch {
        setCurrentUserId(null);
      }
    }, []);

  return (
    <div className="mt-4 w-full pb-2 sm:mt-5 lg:mt-8">
      <div className="grid w-full grid-cols-1 items-start gap-3 lg:grid-cols-4">
        {statuses.map((status) => {
          const columnTasks = tasks.filter(
            (task) => task.status === status,
          );

          if (searchQuery.trim() && columnTasks.length === 0) {
            return null;
          }

          return (
            <BoardColumn
              key={status}
              title={status}
              tasks={columnTasks.map((task) => ({
                  _id: task._id,
                  title: task.title,
                  assignee: task.assignee || "Guest",
                  avatar: task.avatar || "",
                  dueDate: task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "No date",
                  labels: task.labels || [],
                  priority: task.priority || "Medium",
                  createdBy: task.createdBy,
                  members: task.members || [],
                  currentUserId,
                }))}
              onAddTask={() => openAddTask(status)}
              onOpenTask={openTask}
              onEditTask={openEditTask}
              onDeleteTask={handleDeleteTask}
              onDropTask={handleDropTask}
              visibleFields={visibleFields}
              onLeaveTask={handleLeaveTask}
            />
          );
        })}
      </div>
    </div>
  );
}
