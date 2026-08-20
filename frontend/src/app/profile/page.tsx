"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
const [leavingWorkspace, setLeavingWorkspace] = useState(false);

  useEffect(() => {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      return;
    }


    const guest = JSON.parse(storedGuest);



if (!guest.guestId || !guest.workspaceId) {
  return;
}

    setName(guest.name || "");
    setEmail(guest.email || "");
    setTitle(guest.title || "");
    setUsername(guest.username || "");
  }, []);

  const handleSaveChanges = async () => {
    try {
      const storedGuest = localStorage.getItem("guest");

      if (!storedGuest) {
        return;
      }

      const guest = JSON.parse(storedGuest);

      if (!guest.guestId) {
        return;
      }

      setSaving(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/auth/profile?guestId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            username: username.trim(),
            title: title.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedGuest = await response.json();

      localStorage.setItem(
        "guest",
        JSON.stringify({
          ...guest,
          ...updatedGuest,
        })
      );

      setMessage("Changes saved");
    } catch (error) {
      console.error("Update Profile Error:", error);
      setMessage("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

const handleLeaveWorkspace = async () => {
  try {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) return;

    const guest = JSON.parse(storedGuest);

    if (!guest.guestId || !guest.workspaceId) {
      return;
    }

    setLeavingWorkspace(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workspace-members/leave` +
        `?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to leave workspace");
    }

    localStorage.clear();

    window.location.href = "/login";
  } catch (error) {
    console.error("Leave Workspace Error:", error);
    setLeavingWorkspace(false);
  }
};
  
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors">
      <Sidebar />

      <main className="ml-[240px] min-h-screen border-t border-[var(--border)]">
        <div className="mx-auto max-w-[760px] px-8 py-10">
          {/* Page heading */}
          <h1 className="text-[22px] font-semibold text-[var(--text)]">
            Profile
          </h1>

          {/* Profile card */}
          <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5">
            {/* Profile picture */}
            <div className="flex min-h-[62px] items-center justify-between border-b border-[var(--border)]">
              <span className="text-[12px] font-medium text-[var(--text)]">
                Profile picture
              </span>

              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-medium text-white">
                {name?.charAt(0)?.toUpperCase() || "G"}
              </div>
            </div>

            {/* Email */}
            <div className="flex min-h-[58px] items-center justify-between border-b border-[var(--border)]">
              <span className="text-[12px] font-medium text-[var(--text)]">
                Email
              </span>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 w-[180px] rounded-lg border border-[var(--border)] bg-[var(--hover)] px-3 text-[12px] text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>

            {/* Full name */}
            <div className="flex min-h-[60px] items-center justify-between border-b border-[var(--border)]">
              <span className="text-[12px] font-medium text-[var(--text)]">
                Full name
              </span>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-[180px] rounded-lg border border-[var(--border)] bg-[var(--hover)] px-3 text-[12px] text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>

            {/* Title */}
            <div className="flex min-h-[70px] items-center justify-between border-b border-[var(--border)]">
              <div>
                <p className="text-[12px] font-medium text-[var(--text)]">
                  Title
                </p>

                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  Your job title or role
                </p>
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-[180px] rounded-lg border border-[var(--border)] bg-[var(--hover)] px-3 text-[12px] text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>

            {/* Username */}
            <div className="flex min-h-[70px] items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-[var(--text)]">
                  Username
                </p>

                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  One word, like a nickname or first name
                </p>
              </div>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-8 w-[180px] rounded-lg border border-[var(--border)] bg-[var(--hover)] px-3 text-[12px] text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Workspace access */}
          <h2 className="mt-8 text-[15px] font-semibold text-[var(--text)]">
            Workspace access
          </h2>

          <div className="mt-4 flex min-h-[60px] items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5">
            <span className="text-[11px] text-[var(--muted)]">
              Remove yourself from the workspace
            </span>

           <button
            type="button"
            onClick={() => {
              setShowLeaveModal(false);
              window.location.href = "/tasks";
            }}
            className="h-8 cursor-pointer rounded-md bg-red-500 px-4 text-[11px] font-medium text-white hover:bg-red-600"
          >
            Leave Workspace
          </button>
          </div>

          {/* Save */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {message && (
              <span
                className={`text-[11px] ${
                  message === "Changes saved"
                    ? "text-[var(--accent)]"
                    : "text-red-500"
                }`}
              >
                {message}
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="h-[36px] cursor-pointer rounded-lg bg-[var(--accent)] px-5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        {showLeaveModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-[380px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
      <h2 className="text-[15px] font-semibold text-[var(--text)]">
        Leave Workspace?
      </h2>

      <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
        Are you sure you want to leave this workspace?
        This will remove your data from the workspace
        records.
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowLeaveModal(false)}
          disabled={leavingWorkspace}
          className="h-8 cursor-pointer rounded-md border border-[var(--border)] px-4 text-[11px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleLeaveWorkspace}
          disabled={leavingWorkspace}
          className="h-8 cursor-pointer rounded-md bg-red-500 px-4 text-[11px] font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {leavingWorkspace ? "Leaving..." : "Leave Workspace"}
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}