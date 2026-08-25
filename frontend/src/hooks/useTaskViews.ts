"use client";

import { useEffect, useState } from "react";

export type TaskViewer = {
  userId: string;
  viewedAt?: string;
};

type UseTaskViewsResult = {
  viewCount: number;
  viewers: TaskViewer[];
  loadingViews: boolean;
  showViewers: boolean;
  setShowViewers: React.Dispatch<React.SetStateAction<boolean>>;
  toggleViewers: () => void;
};

export default function useTaskViews(
  taskId: string,
  currentUserId: string,
  viewOnly: boolean,
): UseTaskViewsResult {
  const [viewers, setViewers] = useState<TaskViewer[]>([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [showViewers, setShowViewers] = useState(false);

  useEffect(() => {
    if (!taskId || !currentUserId) return;

    const loadViews = async () => {
      try {
        setLoadingViews(true);

        const storedGuest = localStorage.getItem("guest");
        if (!storedGuest) return;

        const guest = JSON.parse(storedGuest);

        if (!guest.workspaceId || !guest.guestId) {
          return;
        }

        const query = new URLSearchParams({
          workspaceId: guest.workspaceId,
          userId: currentUserId,
        });

        if (viewOnly) {
          query.set("mode", "view");
        }

        const base = process.env.NEXT_PUBLIC_API_URL;

        // Record the current user's first unique view.
        await fetch(
          `${base}/tasks/${taskId}/views?${query.toString()}`,
          {
            method: "POST",
          },
        );

        // Load all unique viewers.
        const response = await fetch(
          `${base}/tasks/${taskId}/views?${query.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch task viewers");
        }

        const data = await response.json();

        setViewers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Task Views Error:", error);
      } finally {
        setLoadingViews(false);
      }
    };

    loadViews();
  }, [taskId, currentUserId, viewOnly]);

  const toggleViewers = () => {
    setShowViewers((previous) => !previous);
  };

  return {
    viewCount: viewers.length,
    viewers,
    loadingViews,
    showViewers,
    setShowViewers,
    toggleViewers,
  };
}