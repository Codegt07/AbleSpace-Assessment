"use client";

import { useCallback, useEffect, useState } from "react";

type WorkspaceUser = {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
};

export default function useWorkspaceUsers(showMemberModal: boolean) {
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);

  useEffect(() => {
    const loadWorkspaceUsers = async () => {
      try {
        const storedGuest = localStorage.getItem("guest");
        if (!storedGuest) return;

        const guest = JSON.parse(storedGuest);
        if (!guest.workspaceId) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/workspace-members/users?workspaceId=${guest.workspaceId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch workspace users");
        }

        setWorkspaceUsers(await response.json());
      } catch (error) {
        console.error("Load Workspace Users Error:", error);
      }
    };

    loadWorkspaceUsers();
  }, [showMemberModal]);

  const getUser = useCallback(
    (userId: string) => {
      const workspaceUser = workspaceUsers.find(
        (user) => user.userId === userId,
      );

      if (workspaceUser) return workspaceUser;

      try {
        const storedGuest = localStorage.getItem("guest");
        if (storedGuest) {
          const guest = JSON.parse(storedGuest);

          if (guest.guestId === userId) {
            return {
              userId: guest.guestId,
              name: guest.name || "Guest",
              username: guest.username || "",
              avatar: guest.avatar || "",
              title: guest.title || "",
            };
          }
        }
      } catch (error) {
        console.error("User fallback error:", error);
      }

      return undefined;
    },
    [workspaceUsers],
  );

  const userInitial = useCallback(
    (userId: string) =>
      getUser(userId)?.name?.charAt(0)?.toUpperCase() || "G",
    [getUser],
  );

  const formatUserName = useCallback(
    (userId: string) => getUser(userId)?.name || userId,
    [getUser],
  );

  return {
    workspaceUsers,
    getUser,
    userInitial,
    formatUserName,
  };
}