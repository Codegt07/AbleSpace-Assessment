"use client";

type TaskActionMenuProps = {
  open: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onLeave?: () => void;
};

export default function TaskActionMenu({
  open,
  onEdit,
  onDelete,
  onSettings,
  onLeave,
}: TaskActionMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-0 top-6 z-20 w-[110px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-md">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-[var(--text)] hover:bg-[var(--hover)]"
        >
          Edit
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-red-500 hover:bg-[#fff2f2]"
        >
          Delete
        </button>
      )}

      {onSettings && (
        <button
          type="button"
          onClick={onSettings}
          className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-[var(--text)] hover:bg-[var(--hover)]"
        >
          Task Settings
        </button>
      )}

      {onLeave && (
        <button
          type="button"
          onClick={onLeave}
          className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-red-500 hover:bg-[#fff2f2]"
        >
          Leave Task
        </button>
      )}
    </div>
  );
}