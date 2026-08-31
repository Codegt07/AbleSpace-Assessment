"use client";

import { TaskUpdate } from "./types";

type TaskUpdatesProps = {
  updates: TaskUpdate[];
  getUser: (userId: string) => { name?: string; avatar?: string } | undefined;
  userInitial: (userId: string) => string;
  formatUserName: (userId: string) => string;
  priorityUpdateText: (update: TaskUpdate) => string;
};

export default function TaskUpdates({
  updates,
  getUser,
  userInitial,
  formatUserName,
  priorityUpdateText,
}: TaskUpdatesProps) {
  return (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
             <div className="flex w-full items-center">
                <span className="text-[11px]">▾</span>

                <h2 className="ml-2 text-[14px] font-semibold text-[var(--accent)]">
                  Updates
                </h2>

                <span
                  className="ml-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
                  style={{
                    animation: "livePulse 1.5s ease-in-out infinite",
                  }}
                />

                <span className="ml-auto text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
                  LIVE
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {updates.filter((update) => !/posted an update/i.test(update.message)).length === 0 ? (
                  <p className="text-[11px] text-[var(--muted)]">No updates yet.</p>
                ) : (
                  updates
                    .filter((update) => !/posted an update/i.test(update.message))
                    .slice(0, 5)
                    .map((update) => (
                      <div
                        key={update._id}
                        className="border-b border-[var(--border)] pb-3.5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-[25px] w-[25px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[8px] font-medium text-white">
                            {getUser(update.userId)?.avatar ? (
                              <img
                                src={getUser(update.userId)?.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              userInitial(update.userId)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold leading-4 text-[var(--text)]">
                              {formatUserName(update.userId)}
                            </p>
                            <p className="mt-0.5 text-[10px] leading-4 text-[var(--muted)]">
                              {priorityUpdateText(update)}
                            </p>
                            <p className="mt-1 text-[9px] text-[var(--muted)]">
                              {new Date(update.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

  );
}
