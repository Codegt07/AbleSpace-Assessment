"use client";

import { useState } from "react";
import TaskActionMenu from "@/components/TaskActionMenu";

type TaskHeaderProps = {
  title: string;
  description?: string;
  viewOnly: boolean;
  isCreator: boolean;
  isTaskMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSettings: () => void;
  onLeave: () => void;
};

export default function TaskHeader({
  title,
  description,
  viewOnly,
  isCreator,
  isTaskMember,
  onEdit,
  onDelete,
  onSettings,
  onLeave,
}: TaskHeaderProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);

  const closeMenu = () => setShowActionMenu(false);

  return (
    <div className="order-1 flex items-start justify-between gap-3 sm:gap-6 lg:order-none">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-7 text-[var(--text)] sm:text-[25px] sm:leading-8">
          {title}
        </h1>
        <p className="mt-1.5 max-w-[720px] text-[13px] leading-5 text-[var(--muted)] sm:text-[14px] sm:leading-5.5">
          {description || "No description provided."}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 self-start">
        <button
          type="button"
          title={viewOnly ? "View only" : "Task settings"}
          onClick={() => {
            if (!viewOnly) {
              onSettings();
            }
          }}
          disabled={viewOnly}
          className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)] disabled:cursor-default disabled:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect
              x="3"
              y="6"
              width="8"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M4.5 6V4.5C4.5 2.57 9.5 2.57 9.5 4.5V6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          type="button"
          title="Views"
          className="flex h-[30px] cursor-pointer items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--accent)] hover:bg-[var(--hover)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1.5 7C2.8 4.8 4.6 3.7 7 3.7C9.4 3.7 11.2 4.8 12.5 7C11.2 9.2 9.4 10.3 7 10.3C4.6 10.3 2.8 9.2 1.5 7Z"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle
              cx="7"
              cy="7"
              r="1.7"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </svg>
          <span className="text-[10px]">1</span>
        </button>

        <button
          type="button"
          title="Share"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle
              cx="4"
              cy="7"
              r="1.5"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle
              cx="10"
              cy="3.5"
              r="1.5"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle
              cx="10"
              cy="10.5"
              r="1.5"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="M5.3 6.3L8.7 4.2M5.3 7.7L8.7 9.8"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </svg>
        </button>

        {!viewOnly && (
          <div className="relative">
            <button
              type="button"
              title="More"
              onClick={() =>
                setShowActionMenu((previous) => !previous)
              }
              className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[11px] text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              •••
            </button>

            <TaskActionMenu
              open={showActionMenu}
              onEdit={
                isCreator
                  ? () => {
                      closeMenu();
                      onEdit();
                    }
                  : undefined
              }
              onDelete={
                isCreator
                  ? () => {
                      closeMenu();
                      onDelete();
                    }
                  : undefined
              }
              onSettings={
                isCreator
                  ? () => {
                      closeMenu();
                      onSettings();
                    }
                  : undefined
              }
              onLeave={
                !isCreator && isTaskMember
                  ? () => {
                      closeMenu();
                      onLeave();
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}