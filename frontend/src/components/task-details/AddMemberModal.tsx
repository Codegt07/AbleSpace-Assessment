"use client";

import type { Dispatch, SetStateAction } from "react";

import { Task, WorkspaceUser } from "./types";

type AddMemberModalProps = {
  task: Task;
  workspaceUsers: WorkspaceUser[];
  memberSearch: string;
  setMemberSearch: Dispatch<SetStateAction<string>>;
  addingMemberId: string | null;
  currentUserId: string;
  isCreator: boolean;
  canAddMembers: boolean;
  handleAddWorkspaceMember: (userId: string) => void | Promise<void>;
  handleRemoveMember: (memberId: string) => void | Promise<void>;
  onClose: () => void;
};

export default function AddMemberModal({
  task,
  workspaceUsers,
  memberSearch,
  setMemberSearch,
  addingMemberId,
  currentUserId,
  isCreator,
  canAddMembers,
  handleAddWorkspaceMember,
  handleRemoveMember,
  onClose,
}: AddMemberModalProps) {
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
    <div className="w-full max-w-[400px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">
          Add Member
        </h2>

        <button
          type="button"
          onClick={() => {
            onClose();
          }}
          className="text-[20px] text-[var(--muted)]"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <input
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search members..."
          className="h-[40px] w-full rounded-[10px] border border-[var(--border)] px-3 text-[12px] outline-none focus:border-[var(--muted)]"
        />
      </div>

      {/* Users */}
      <div className="hide-scrollbar mt-4 max-h-[280px] overflow-y-auto rounded-[10px] border border-[var(--border)]">
        {workspaceUsers
          .filter((user) => {
            const search = memberSearch.toLowerCase().trim();

            if (!search) return true;

            return (
              user.name?.toLowerCase().includes(search) ||
              user.username?.toLowerCase().includes(search)
            );
          })
          .map((user) => {
            const alreadyMember =
              task.members?.some(
                (member) => member.userId === user.userId
              ) ?? false;

            return (
              <div
                key={user.userId}
                className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3 last:border-b-0"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-medium text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "G"}
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-[var(--text)]">
                      {user.name || "Guest"}
                    </p>

                    {user.username && (
                      <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add / Already Added */}
                {alreadyMember ? (
                  user.userId === task.createdBy ? (
                    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--hover)] text-[14px] font-medium text-[var(--muted)]">
                      ✓
                    </div>
                  ) : isCreator ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMember(user.userId)
                      }
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--border)] text-[16px] font-medium text-[var(--muted)] cursor-pointer transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                    >
                      −
                    </button>
                  ) : user.userId === currentUserId ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMember(user.userId)
                      }
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--border)] text-[16px] font-medium cursor-pointer text-[var(--muted)] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                    >
                      −
                    </button>
                  ) : (
                    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--hover)] text-[14px] font-medium text-[var(--muted)]">
                      ✓
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleAddWorkspaceMember(user.userId)
                    }
                    disabled={
                      addingMemberId === user.userId ||
                      !canAddMembers
                    }
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--border)] text-[16px] text-[var(--muted)] transition-colors cursor-pointer hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingMemberId === user.userId
                      ? "..."
                      : "+"}
                  </button>
                )}
              </div>
            );
          })}

        {/* No users */}
        {workspaceUsers.filter((user) => {
          const search = memberSearch.toLowerCase().trim();

          if (!search) return true;

          return (
            user.name?.toLowerCase().includes(search) ||
            user.username?.toLowerCase().includes(search)
          );
        }).length === 0 && (
          <div className="flex h-[70px] items-center justify-center">
            <span className="text-[11px] text-[var(--muted)]">
              No members found
            </span>
          </div>
        )}
      </div>

      {/* Done */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            onClose();
          }}
          className="h-[36px] rounded-full border cursor-pointer  border-[var(--border)] px-5 text-[12px] font-medium text-[var(--muted)]"
        >
          Done
        </button>
      </div>

    </div>
  </div>
  );
}
