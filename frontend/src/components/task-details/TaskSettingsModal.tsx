"use client";

import type { Dispatch, SetStateAction } from "react";

type TaskSettings = {
  allowMembersToAddMembers: boolean;
  allowMembersToCreateSubtasks: boolean;
  allowMembersToComment: boolean;
};

type TaskSettingsModalProps = {
  taskSettings: TaskSettings;
  setTaskSettings: Dispatch<SetStateAction<TaskSettings>>;
  savingSettings: boolean;
  handleSaveTaskSettings: () => void | Promise<void>;
  onClose: () => void;
};

export default function TaskSettingsModal({
  taskSettings,
  setTaskSettings,
  savingSettings,
  handleSaveTaskSettings,
  onClose,
}: TaskSettingsModalProps) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
            <div className="w-full max-w-[430px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-semibold text-[var(--text)]">
                  Task Settings
                </h2>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="text-[20px] text-[var(--muted)]"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 divide-y divide-[var(--border)]">
                {[
                  {
                    key: "allowMembersToAddMembers",
                    title: "Allow members to add members",
                    description:
                      "Members can add other workspace members to this task.",
                  },
                  {
                    key: "allowMembersToCreateSubtasks",
                    title: "Allow members to create subtasks",
                    description:
                      "Members can create subtasks under this task.",
                  },
                  {
                    key: "allowMembersToComment",
                    title: "Allow members to comment",
                    description:
                      "Members can add comments and replies.",
                  },
                ].map((setting) => {
                  const enabled =
                    taskSettings[
                      setting.key as keyof typeof taskSettings
                    ];

                  return (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between gap-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[var(--text)]">
                          {setting.title}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
                          {setting.description}
                        </p>
                      </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() =>
                      setTaskSettings((previous) => ({
                        ...previous,
                        [setting.key]: !enabled,
                      }))
                    }
                    className={`relative h-[20px] w-[38px] shrink-0 rounded-full transition-colors ${
                      enabled
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--border)]"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? "translate-x-[18px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="h-[36px] rounded-full border border-[var(--border)] px-5 text-[12px] font-medium text-[var(--muted)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveTaskSettings}
                  disabled={savingSettings}
                  className="h-[36px] rounded-full bg-[var(--accent)] px-5 text-[12px] font-medium text-white disabled:opacity-50"
                >
                  {savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>


  );
}
