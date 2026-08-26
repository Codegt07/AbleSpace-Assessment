"use client";

import { useRef, useState } from "react";
import { PaperclipIcon } from "@/components/task-details/ui";
import type { Task, TaskResource } from "@/components/task-details/types";


type TaskResourcesProps = {
  task: Task;
  viewOnly: boolean;
  isCreator: boolean;
  setTask: React.Dispatch<React.SetStateAction<Task | null>>;
};

export default function TaskResources({
  task,
  viewOnly,
  isCreator,
  setTask,
}: TaskResourcesProps) {
  const [showResourceMenu, setShowResourceMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [resourceLinkName, setResourceLinkName] = useState("");
  const [resourceLinkUrl, setResourceLinkUrl] = useState("");
  const [addingResource, setAddingResource] = useState(false);
  const [removingResourceId, setRemovingResourceId] = useState<string | null>(
    null,
  );

  const resourceInputRef =
    useRef<HTMLInputElement | null>(null);

  const handleUploadResource = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setAddingResource(true);

      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) return;

      const guest = JSON.parse(storedGuest);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}/resources/file` +
          `?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "RESOURCE UPLOAD ERROR:",
          response.status,
          errorText,
        );

        throw new Error("Failed to upload resource");
      }

      const updatedTask = await response.json();

      setTask(updatedTask);
      setShowResourceMenu(false);
    } catch (error) {
      console.error("Upload Resource Error:", error);
    } finally {
      setAddingResource(false);
      event.target.value = "";
    }
  };

  const handleAddResourceLink = async () => {
    if (
      !resourceLinkName.trim() ||
      !resourceLinkUrl.trim()
    ) {
      return;
    }

    try {
      setAddingResource(true);

      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) return;

      const guest = JSON.parse(storedGuest);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}/resources/link` +
          `?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: resourceLinkName.trim(),
            url: resourceLinkUrl.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "RESOURCE LINK ERROR:",
          response.status,
          errorText,
        );

        throw new Error("Failed to add resource link");
      }

      const updatedTask = await response.json();

      setTask(updatedTask);
      setResourceLinkName("");
      setResourceLinkUrl("");
      setShowLinkModal(false);
    } catch (error) {
      console.error("Add Resource Link Error:", error);
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    try {
      setRemovingResourceId(resourceId);

      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) return;

      const guest = JSON.parse(storedGuest);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}/resources/${resourceId}` +
          `?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "REMOVE RESOURCE ERROR:",
          response.status,
          errorText,
        );

        throw new Error("Failed to remove resource");
      }

      const updatedTask = await response.json();

      setTask(updatedTask);
    } catch (error) {
      console.error("Remove Resource Error:", error);
    } finally {
      setRemovingResourceId(null);
    }
  };

  return (
    <>
      <div className="order-4 mt-4 flex items-start gap-4 sm:gap-7 lg:order-none">
        <span className="w-[58px] shrink-0 pt-[3px] text-[13px] font-medium text-[var(--text)] sm:text-[14px]">
          Resources
        </span>

        <div className="relative min-w-0">
          <input
            ref={resourceInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUploadResource}
          />

          {!viewOnly && (
            <>
              <button
                type="button"
                onClick={() =>
                  setShowResourceMenu(
                    (previous) => !previous,
                  )
                }
                disabled={addingResource}
                className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] disabled:cursor-default disabled:opacity-60 sm:text-[13px]"
              >
                <PaperclipIcon />
                {addingResource
                  ? "Uploading..."
                  : "Add document or link..."}
              </button>

              {showResourceMenu && (
                <div className="absolute left-0 top-8 z-40 w-[180px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResourceMenu(false);
                      resourceInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-[var(--text)] hover:bg-[var(--hover)]"
                  >
                    <span>📄</span>
                    <span>Add document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResourceMenu(false);
                      setShowLinkModal(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] text-[var(--text)] hover:bg-[var(--hover)]"
                  >
                    <span>🔗</span>
                    <span>Add link</span>
                  </button>
                </div>
              )}
            </>
          )}

          {(task.resources?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {(task.resources as TaskResource[]).map(
                (resource) => {
                  const resourceId = resource._id;

                  return (
                    <div
                      key={
                        resourceId ||
                        `${resource.type}-${resource.url}`
                      }
                      className="flex w-fit max-w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-2 hover:opacity-80"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#fff0f0] text-[9px] font-semibold text-[#ff4d4f]">
                          {resource.type === "file"
                            ? resource.mimeType ===
                              "application/pdf"
                              ? "PDF"
                              : "FILE"
                            : "LINK"}
                        </div>

                        <span className="max-w-[220px] truncate text-[12px] text-[var(--text)] sm:max-w-[240px] sm:text-[13px]">
                          {resource.name}
                        </span>
                      </a>

                      {!viewOnly && isCreator && resourceId && (
                        <button
                          type="button"
                          title="Remove resource"
                          disabled={
                            removingResourceId === resourceId
                          }
                          onClick={() =>
                            handleRemoveResource(resourceId)
                          }
                          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[13px] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:cursor-default disabled:opacity-50"
                        >
                          {removingResourceId === resourceId
                            ? "..."
                            : "×"}
                        </button>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[430px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[var(--text)]">
                Add link
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setResourceLinkName("");
                  setResourceLinkUrl("");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[16px] text-[var(--muted)] hover:bg-[var(--hover)]"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Link name"
                value={resourceLinkName}
                onChange={(event) =>
                  setResourceLinkName(event.target.value)
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] text-[var(--text)] outline-none"
              />

              <input
                type="url"
                placeholder="https://example.com"
                value={resourceLinkUrl}
                onChange={(event) =>
                  setResourceLinkUrl(event.target.value)
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] text-[var(--text)] outline-none"
              />

              <button
                type="button"
                onClick={handleAddResourceLink}
                disabled={
                  addingResource ||
                  !resourceLinkName.trim() ||
                  !resourceLinkUrl.trim()
                }
                className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-50"
              >
                {addingResource
                  ? "Adding..."
                  : "Add link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}