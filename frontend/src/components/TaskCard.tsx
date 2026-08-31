"use client";
import TaskActionMenu from "./TaskActionMenu";
import { useState } from "react";

type TaskCardProps = {
  taskId: string;
  title: string;
  assignee: string;
  avatar?: string;
  dueDate: string;
  labels: string[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  priority: string;
  visibleFields: string[];
  createdBy?: string;
  members: { userId: string }[];
  currentUserId: string | null;
  onLeave: () => void;
};


export default function TaskCard({
  taskId,
  title,
  assignee,
  avatar,
  dueDate,
  labels,
  priority,
  visibleFields,
  onOpen,
  onEdit,
  onDelete,
  createdBy,
  members,
  currentUserId,
  onLeave,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const normalizeId = (value: unknown) =>
  value ? String(value) : "";

  const isCreator = Boolean(
    currentUserId &&
      normalizeId(createdBy) === currentUserId,
  );

  const isTaskMember = Boolean(
    currentUserId &&
      members.some(
        (member) =>
          normalizeId(member.userId) === currentUserId,
      ),
  );

  return (
       <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("taskId", taskId);
        }}
        onClick={onOpen}
        className="relative cursor-grab rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--accent)]"
      >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-medium text-[var(--text)]">
          {title}
        </h3>

        <div
          className="relative"
          onClick={(event) => event.stopPropagation()}
         >
          <button
            type="button"
            className="cursor-pointer text-[var(--muted)]"
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            •••
          </button>

          <TaskActionMenu
            open={menuOpen}
            onEdit={
              isCreator
                ? () => {
                    setMenuOpen(false);
                    onEdit();
                  }
                : undefined
            }
            onDelete={
              isCreator
                ? () => {
                    setMenuOpen(false);
                    onDelete();
                  }
                : undefined
            }
            onLeave={
              !isCreator && isTaskMember
                ? () => {
                    setMenuOpen(false);
                    onLeave();
                  }
                : undefined
            }
          />
       </div>
      </div>

      {(visibleFields.includes("Members") ||
      visibleFields.includes("Due Date")) && (
      <div className="mt-3 flex items-center justify-between">
       {visibleFields.includes("Members") && (
       <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--hover)] text-[10px] text-[var(--text)]">
          {avatar ? (
            <img
              src={avatar}
              alt={assignee}
              className="h-full w-full object-cover"
            />
          ) : (
            assignee.charAt(0).toUpperCase()
          )}
        </div>

        <span className="text-[12px] text-[var(--text)]">
          {assignee}
        </span>
      </div>
    )}

    {visibleFields.includes("Due Date") && (
      <span className="flex items-center gap-[4px] rounded-full bg-[#fff0f0] px-[7px] py-[3px] text-[10px] font-medium text-[#ff4d4f]">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
        {dueDate}
      </span>
    )}
  </div>
)}

    {visibleFields.includes("Labels") && (
      <div className="mt-3 flex flex-wrap gap-[6px]">
        {labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="flex items-center gap-[5px] rounded-full bg-[var(--hover)] px-[7px] py-[3px] text-[11px] font-medium leading-none text-[var(--text)]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82l-3.36-3.36a2 2 0 0 0-2.82 0Z" />
              <circle cx="7.5" cy="6.5" r="1" />
            </svg>
            {label}
          </span>
        ))}
      </div>
      )}
      {visibleFields.includes("Priority") && (
      <div className="mt-3 text-[11px] font-medium text-[var(--muted)]">
        Priority:{" "}
        <span className="text-[var(--text)]">
          {priority}
        </span>
      </div>
    )}
    </div>
  );
}