"use client";

import { useState } from "react";

type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

type Task = {
  _id: string;
  title: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  status?: TaskStatus;
};

type TaskListProps = {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

const sections: TaskStatus[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

export default function TaskList({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const [collapsed, setCollapsed] = useState<
    Record<string, boolean>
  >({});

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case "High":
        return {
          text: "High",
          color: "text-red-500",
          bars: [4, 7, 10],
        };

      case "Low":
        return {
          text: "Low",
          color: "text-[#a0a0a0]",
          bars: [3, 4, 5],
        };

      case "Medium":
      default:
        return {
          text: "Medium",
          color: "text-orange-500",
          bars: [3, 6, 8],
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {sections.map((status) => {
        const sectionTasks = tasks.filter(
          (task) => task.status === status
        );
        if (sectionTasks.length === 0) {
          return null;
        }

        const isCollapsed = collapsed[status];

        return (
          <div key={status}>
            {/* Section Header */}
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [status]: !prev[status],
                }))
              }
              className="mb-2 flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#171717]"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`transition-transform ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>{status}</span>
            </button>

            {!isCollapsed && (
              <div className="overflow-visible rounded-lg border border-[#dedede] bg-white">
                {/* Table Header */}
                <div className="grid h-[34px] grid-cols-[2fr_90px_100px_120px_60px] items-center rounded-t-lg bg-[#f5f5f5] px-3 text-[11px] font-medium text-[#171717]">
                  <span>Task</span>
                  <span>Priority</span>
                  <span>Members</span>
                  <span>Due Date</span>
                  <span className="text-right">Actions</span>
                </div>

                {/* Task Rows */}
                {sectionTasks.map((task) => {
                  const priority = getPriorityStyle(task.priority);

                  return (
                    <div
                      key={task._id}
                      className="grid min-h-[36px] grid-cols-[2fr_90px_100px_120px_60px] items-center border-t border-[#e5e5e5] px-3 text-[11px]"
                    >
                      {/* Task */}
                      <span className="text-[#171717]">
                        {task.title}
                      </span>

                      {/* Priority */}
                      <div
                        className={`flex items-center gap-[5px] ${priority.color}`}
                      >
                        <div className="flex h-[12px] items-end gap-[1px]">
                          {priority.bars.map((height, index) => (
                            <span
                              key={index}
                              className="w-[1.5px] rounded-sm bg-current"
                              style={{ height }}
                            />
                          ))}
                        </div>

                        <span>{priority.text}</span>
                      </div>

                      {/* Member */}
                      <div className="flex items-center">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eeeeee] text-[9px] font-medium text-[#333]">
                          {(task.assignee || "Guest")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </div>

                      {/* Due Date */}
                      <span className="text-[#333]">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "No date"}
                      </span>

                      {/* Actions */}
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === task._id ? null : task._id
                            )
                          }
                          className="cursor-pointer text-[14px] text-[#555]"
                        >
                          ···
                        </button>

                        {openMenuId === task._id && (
                          <div className="absolute right-0 top-5 z-40 w-[100px] rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-md">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onEditTask(task._id);
                              }}
                              className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-[#333] hover:bg-[#f3f3f3]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteTask(task._id);
                              }}
                              className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-red-500 hover:bg-[#fff2f2]"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Task */}
                <button
                  type="button"
                  onClick={() => onAddTask(status)}
                  className="flex h-[34px] w-full cursor-pointer items-center rounded-b-lg border-t border-[#e5e5e5] px-3 text-[11px] text-[#171717] hover:bg-[#fafafa]"
                >
                  + Add Task
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}