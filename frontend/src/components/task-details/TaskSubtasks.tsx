"use client";

import type { Dispatch, SetStateAction } from "react";

import { Task, TaskStatus } from "./types";
import { PriorityIcon, priorityTextClass, formatShortDate } from "./ui";

type TaskSubtasksProps = {
  subtasks: Task[];
  viewOnly: boolean;
  canCreateSubtasks: boolean;
  getUser: (userId: string) => { name?: string; avatar?: string } | undefined;
  userInitial: (userId: string) => string;
  onEditSubtask: (subtask: Task) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  openSubtaskAction: string | null;
  setOpenSubtaskAction: Dispatch<SetStateAction<string | null>>;
  onAddSubtask: () => void;
};

export default function TaskSubtasks({
  subtasks,
  viewOnly,
  canCreateSubtasks,
  getUser,
  userInitial,
  onEditSubtask,
  onDeleteSubtask,
  openSubtaskAction,
  setOpenSubtaskAction,
  onAddSubtask,
}: TaskSubtasksProps) {
  return (
            <div className="order-6 mt-7 lg:order-none">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[12px] text-[var(--text)]">▾</span>
                  <h2 className="text-[14px] font-medium text-[var(--accent)]">
                    Subtasks
                  </h2>
                                </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border)] lg:overflow-visible">
                <div className="grid min-w-[500px] grid-cols-[1.5fr_.9fr_1fr_1.1fr_32px] border-b border-[var(--border)] px-3 lg:min-w-0 lg:grid-cols-[2fr_1.1fr_1.2fr_1.3fr_48px]">
                  <div className="min-w-0 truncate py-3 text-[10px] font-semibold text-[var(--text)] sm:py-3.5 sm:text-[13px]">Task</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[var(--text)]">Priority</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[var(--text)]">Members</div>
                  <div className="py-3.5 text-[13px] font-semibold text-[var(--text)]">Due Date</div>
                  <div />
                </div>

                {subtasks.length === 0 ? (
                  <div className="flex h-[62px] items-center justify-center">
                    <span className="text-[13px] text-[var(--muted)]">No subtasks yet</span>
                  </div>
                ) : subtasks.map((subtask) => {
                  const members = subtask.members || [];
                  const visible = members.slice(0, 3);
                  const remaining = Math.max(members.length - 3, 0);

                  return (
                    <div key={subtask._id} className="grid min-h-[55px] min-w-[500px] grid-cols-[1.5fr_.9fr_1fr_1.1fr_32px] items-center border-b border-[var(--border)] px-3 last:border-b-0 hover:bg-[var(--hover)] lg:min-w-0 lg:grid-cols-[2fr_1.1fr_1.2fr_1.3fr_48px]">
                      <span className="block min-w-0 truncate text-[11px] font-medium text-[var(--text)] sm:text-[13px]">{subtask.title}</span>

                      <div className={`flex min-w-0 items-center gap-1 text-[10px] font-medium sm:gap-1.5 sm:text-[12px] ${priorityTextClass(subtask.priority)}`}>
                        <PriorityIcon priority={subtask.priority} />
                        {subtask.priority || "Medium"}
                      </div>

                      <div className="flex items-center">
                        {members.length === 0 ? (
                          viewOnly ? (
                            <span className="text-[10px] text-[var(--muted)]">—</span>
                          ) : (
                            <button type="button" className="flex h-[24px] w-[24px] items-center cursor-pointer justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[16px] text-[var(--muted)]">+</button>
                          )
                        ) : (
                          <>
                            {visible.map((member, index) => (
                              <div key={member._id} className={`flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[var(--surface-strong)] text-[8px] font-medium text-white ${index > 0 ? "-ml-1.5" : ""}`}>
                                {getUser(member.userId)?.avatar ? (
                                  <img src={getUser(member.userId)?.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  userInitial(member.userId)
                                )}
                              </div>
                            ))}
                            {remaining > 0 && (
                              <div className="-ml-1 flex h-[25px] min-w-[25px] items-center justify-center rounded-full border-2 border-white bg-[var(--hover)] px-1 text-[9px] font-medium text-[var(--muted)]">+{remaining}</div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="min-w-0 truncate text-[12px] text-[var(--text)]">{formatShortDate(subtask.dueDate)}</div>

                      <div className="relative flex min-w-0 justify-end">
                        {!viewOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenSubtaskAction((previous) =>
                                  previous === subtask._id ? null : subtask._id,
                                )
                              }
                              className="flex h-[28px] w-[28px] items-center justify-center rounded-md text-[14px] text-[var(--muted)] hover:bg-[var(--hover)]"
                            >
                              ···
                            </button>

                            {openSubtaskAction === subtask._id && (
                              <div className="absolute right-0 top-[32px] z-20 w-[112px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => onEditSubtask(subtask)}
                                  className="flex w-full cursor-pointer px-3 py-2 text-left text-[11px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteSubtask(subtask._id)}
                                  className="flex w-full cursor-pointer px-3 py-2 text-left text-[11px] font-medium text-[#ef4444] hover:bg-[#fff5f5]"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {canCreateSubtasks ? (
                  <button
                    type="button"
                    onClick={() => onAddSubtask()}
                    className="flex h-[42px] w-full items-center gap-2 px-3 text-[12px] cursor-pointer font-medium text-[var(--text)] hover:bg-[var(--hover)]"
                  >
                    <span className="text-[18px] leading-none">+</span>
                    Add Subtasks
                  </button>
                ) : (
                  <div className="flex h-[42px] w-full items-center px-3 text-[11px] text-[var(--muted)]">
                    Adding subtask disabled
                  </div>
                )}
              </div>
            </div>
  );
}
