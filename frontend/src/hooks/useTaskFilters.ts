"use client";

import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "./useTaskBoard";

export type ViewMode = "board" | "list";

export const statuses: TaskStatus[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

export const fieldOptions = [
  "Priority",
  "Members",
  "Due Date",
  "Labels",
  "Status",
  "Reporter",
] as const;

export default function useTaskFilters(tasks: Task[] = []) {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");

  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">(
    "All",
  );
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterMember, setFilterMember] = useState("All");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterLabel, setFilterLabel] = useState("All");

  const [visibleFields, setVisibleFields] = useState<string[]>([
    "Priority",
    "Members",
    "Due Date",
    "Labels",
  ]);

  const filteredTasks = useMemo(() => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return safeTasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(normalizedSearch);

    const matchesStatus =
      filterStatus === "All" || task.status === filterStatus;

    const matchesPriority =
      filterPriority === "All" ||
      task.priority === filterPriority;

    const matchesMember =
      filterMember === "All" ||
      task.assignee === filterMember;

    const matchesDueDate =
      !filterDueDate ||
      (task.dueDate &&
        new Date(task.dueDate).toISOString().split("T")[0] ===
          filterDueDate);

    const matchesLabel =
      filterLabel === "All" ||
      task.labels?.includes(filterLabel);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesMember &&
      matchesDueDate &&
      matchesLabel
    );
  });
}, [
  tasks,
  searchQuery,
  filterStatus,
  filterPriority,
  filterMember,
  filterDueDate,
  filterLabel,
]);

  const memberOptions = useMemo(() => {
    return [
      ...new Set(
        tasks
          .map((task) => task.assignee)
          .filter((member): member is string => Boolean(member)),
      ),
    ];
  }, [tasks]);

  const labelOptions = useMemo(() => {
    return [
      ...new Set(tasks.flatMap((task) => task.labels || [])),
    ];
  }, [tasks]);

  const clearFilters = () => {
    setFilterStatus("All");
    setFilterPriority("All");
    setFilterMember("All");
    setFilterDueDate("");
    setFilterLabel("All");
  };

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterMember,
    setFilterMember,
    filterDueDate,
    setFilterDueDate,
    filterLabel,
    setFilterLabel,
    visibleFields,
    setVisibleFields,
    filteredTasks,
    memberOptions,
    labelOptions,
    clearFilters,
  };
}
