"use client";

import type { Dispatch, SetStateAction } from "react";

import { Task } from "./types";
import { CalendarIcon, PeopleIcon, PriorityIcon, TagIcon, formatShortDate, priorityTextClass } from "./ui";

type TaskDetailsSidebarProps = {
  task: Task;
  currentUserId: string;
  canAddMembers: boolean;
  showPriorityMenu: boolean;
  setShowPriorityMenu: Dispatch<SetStateAction<boolean>>;
  priorityOptions: string[];
  handlePriorityChange: (priority: string) => void | Promise<void>;
  handleStartDateChange: (date: string) => void | Promise<void>;
  handleDueDateChange: (date: string) => void | Promise<void>;
  onAddMembers: () => void;
  getUser: (userId: string) => { name?: string; avatar?: string } | undefined;
  userInitial: (userId: string) => string;
  formatUserName: (userId: string) => string;
};

export default function TaskDetailsSidebar({
  task,
  currentUserId,
  canAddMembers,
  showPriorityMenu,
  setShowPriorityMenu,
  priorityOptions,
  handlePriorityChange,
  handleStartDateChange,
  handleDueDateChange,
  onAddMembers,
  getUser,
  userInitial,
  formatUserName,
}: TaskDetailsSidebarProps) {
  return (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[11px]">▾</span>
                  <h2 className="text-[14px] font-semibold text-[var(--accent)]">
                    Details
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="text-[17px] text-[var(--text)]">+</button>
                  <button type="button" className="text-[17px] text-[var(--muted)]">⚙</button>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-[58px_minmax(0,1fr)] items-center sm:grid-cols-[65px_1fr]">
                  <span className="text-[12px] text-[var(--muted)]">Status</span>
                  <span className="flex w-fit items-center gap-1.5 rounded-md bg-[#fff5e6] px-2.5 py-1.5 text-[12px] font-medium text-orange-600">
                    <span className="h-[6px] w-[6px] rounded-full bg-orange-500" />
                    {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-[58px_minmax(0,1fr)] items-start sm:grid-cols-[65px_1fr]">
                  <span className="pt-1 text-[12px] font-medium text-[var(--muted)]">Priority</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPriorityMenu((previous) => !previous)}
                      className={`flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[12px] font-medium transition-colors hover:bg-[var(--hover)] ${priorityTextClass(task.priority)}`}
                    >
                      <PriorityIcon priority={task.priority} />
                      {task.priority || "No Priority"}
                      <span className="text-[9px] text-[var(--muted)]">⌄</span>
                    </button>

                    {showPriorityMenu && (
                      <div className="absolute left-0 top-[30px] z-30 w-[150px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-lg">
                        <p className="px-3 py-1.5 text-[9px] font-medium text-[var(--muted)]">
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
                              className={`flex w-full items-center cursor-pointer justify-between px-3 py-2 text-left text-[11px] transition-colors hover:bg-[var(--hover)] ${
                                isSelected
                                  ? priorityTextClass(
                                      option === "No Priority" ? undefined : option,
                                    )
                                  : "text-[var(--muted)]"
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

                <div className="grid grid-cols-[58px_minmax(0,1fr)] items-start sm:grid-cols-[65px_1fr]">
                  <span className="pt-1 text-[12px] font-medium text-[var(--muted)]">Members</span>
                  <div>
                    {task.members?.length ? (
                      <div className="flex items-center gap-1.5">
                        {task.members.slice(0, 3).map((member, index) => (
                          <div
                            key={member._id}
                            className={`flex h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[var(--surface-strong)] text-[8px] text-white ${index > 0 ? "-ml-2" : ""}`}
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
                          <div className="-ml-1 flex h-[25px] min-w-[25px] items-center justify-center rounded-full border-2 border-white bg-[var(--hover)] px-1 text-[9px] font-medium text-[var(--muted)]">
                            +{task.members.length - 3}
                          </div>
                        )}

                        {canAddMembers ? (
                          <button
                            type="button"
                            onClick={() => onAddMembers()}
                            className="flex shrink-0 !cursor-pointer items-center gap-1.5 text-[11px] text-[var(--muted)]"
                          >
                            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--border)] cursor-pointer text-[14px]">
                              +
                            </span>
                            <PeopleIcon />
                             <span className="leading-4 text-[11px]">
                              <span className="block">Add</span>
                              <span className="block">Members</span>
                            </span>
                          </button>
                        ) : (
                          <span className="ml-1 text-[10px] text-[var(--muted)]">
                            Adding members disabled
                          </span>
                        )}
                      </div>
                    ) : (
                      canAddMembers ? (
                        <button
                          type="button"
                          onClick={() => onAddMembers()}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]"
                        >
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--border)] text-[14px]">
                            +
                          </span>

                          <PeopleIcon />

                          <span className="leading-4 text-[11px]">
                            <span className="block">Add</span>
                            <span className="block">Members</span>
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--muted)]">
                          Adding members disabled
                        </span>
                      )
                    )}
                  </div>
                </div>

<div className="grid grid-cols-[58px_minmax(0,1fr)] items-center sm:grid-cols-[65px_1fr]">
  <span className="text-[12px] text-[var(--muted)]">
    Dates
  </span>

  <div className="flex items-center gap-2">
    {/* Start Date */}
    {currentUserId === task.createdBy ? (
      <div className="relative flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[10px] text-[var(--text)]">
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

        <span>
          {task.startDate
            ? formatShortDate(task.startDate)
            : "Start"}
        </span>

        <input
          type="date"
          value={
            task.startDate
              ? new Date(task.startDate)
                  .toISOString()
                  .slice(0, 10)
              : ""
          }
          onChange={(event) =>
            handleStartDateChange(event.target.value)
          }
          onClick={(event) => {
            event.currentTarget.showPicker?.();
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    ) : (
      <div className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[10px] text-[var(--text)]">
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

        {task.startDate
          ? formatShortDate(task.startDate)
          : "Start"}
      </div>
    )}

    <span className="text-[11px] text-[var(--muted)]">
      →
    </span>

    {/* End Date */}
    {currentUserId === task.createdBy ? (
      <div className="relative flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[10px] text-[var(--text)]">
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

        <span>
          {task.dueDate
            ? formatShortDate(task.dueDate)
            : "End"}
        </span>

        <input
          type="date"
          value={
            task.dueDate
              ? new Date(task.dueDate)
                  .toISOString()
                  .slice(0, 10)
              : ""
          }
          onChange={(event) =>
            handleDueDateChange(event.target.value)
          }
          onClick={(event) => {
            event.currentTarget.showPicker?.();
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    ) : (
      <div className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[10px] text-[var(--muted)]">
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

        {task.dueDate
          ? formatShortDate(task.dueDate)
          : "End"}
      </div>
    )}
  </div>
</div>

  <div className="grid grid-cols-[58px_minmax(0,1fr)] items-start sm:grid-cols-[65px_1fr]">
            <span className="pt-1 text-[12px] font-medium text-[var(--muted)]">
                    Labels
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {task.labels?.length ? task.labels.map((label) => (
                      <span key={label} className="flex items-center gap-1 rounded-full bg-[var(--hover)] px-2 py-1 text-[11px]">
                        <TagIcon />
                        {label}
                      </span>
                    )) : <span className="text-[10px] text-[var(--muted)]">None</span>}
                  </div>
                </div>
                {/* Reporter */}
<div className="grid grid-cols-[58px_minmax(0,1fr)] items-center sm:grid-cols-[65px_1fr]">
  <span className="text-[12px] text-[var(--muted)]">
    Reporter
  </span>

  <div className="flex items-center gap-2">
    <div className="flex h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[8px] text-white">
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

    <span className="text-[12px] text-[var(--text)]">
      {formatUserName(task.createdBy)}
    </span>
  </div>
</div>
 </div>
 </div>

  );
}
