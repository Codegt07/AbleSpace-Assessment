"use client";

type TaskCardProps = {
  taskId: string;
  title: string;
  assignee: string;
  dueDate: string;
  labels: string[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskCard({
  taskId,
  title,
  assignee,
  dueDate,
  labels,
  onOpen,
  onEdit,
  onDelete,
}: TaskCardProps) {
  return (
    <div
      onClick={onOpen}
      className="relative cursor-pointer rounded-lg border border-[#e4e4e4] bg-white p-3 hover:border-[#cfcfcf]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-medium text-[#171717]">
          {title}
        </h3>

        <div
          className="relative"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="cursor-pointer text-[#777]"
            onClick={(event) => {
              event.stopPropagation();

              const menu = event.currentTarget.nextElementSibling;

              if (menu) {
                menu.classList.toggle("hidden");
              }
            }}
          >
            •••
          </button>

          <div className="absolute right-0 top-6 z-20 hidden w-[100px] rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-md">
            <button
              type="button"
              onClick={() => {
                onEdit();
              }}
              className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-[#333] hover:bg-[#f3f3f3]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete();
              }}
              className="w-full cursor-pointer rounded-md px-2 py-[6px] text-left text-[11px] text-red-500 hover:bg-[#fff2f2]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eeeeee] text-[9px]">
            {assignee.charAt(0)}
          </div>

          <span className="text-[11px] text-[#333]">
            {assignee}
          </span>
        </div>

        <span className="flex items-center gap-[4px] rounded-full bg-[#fff0f0] px-[7px] py-[3px] text-[10px] font-medium text-[#ff4d4f]">
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

          {dueDate}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-[6px]">
        {labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="flex items-center gap-[4px] rounded-full bg-[#f1f1f1] px-[7px] py-[3px] text-[10px] font-medium leading-none text-[#333333]"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82l-3.36-3.36a2 2 0 0 0-2.82 0Z" />
              <circle cx="7.5" cy="6.5" r="1" />
            </svg>

            {label}
          </span>
        ))}
      </div>
    </div>
  );
}