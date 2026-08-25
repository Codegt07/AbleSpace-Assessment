export function PriorityIcon({ priority }: { priority?: string }) {
  const className =
    priority === "Urgent" || priority === "High"
      ? "text-[#ff5b5b]"
      : priority === "Low" || !priority
        ? "text-[#aab2bd]"
        : "text-[#f59e0b]";

  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={className}>
      <path d="M2 10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 10.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 10.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
      <path d="M2 3.2V7.1L6.7 11.5L11.2 7L6.8 2.5H2V3.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="4.1" cy="4.4" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function PaperclipIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.2 6.7L7.8 3.1C8.8 2.1 10.4 2.1 11.3 3C12.2 3.9 12.2 5.4 11.3 6.4L6.2 11.5C4.9 12.8 2.8 12.8 1.5 11.5C0.2 10.2 0.2 8.1 1.5 6.8L6.4 1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1.7" y="2.7" width="9.6" height="8.1" rx="1.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 1.5V4M9 1.5V4M1.8 5.2H11.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="5" cy="4.3" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.8 10.8C1.8 8.8 3.1 7.5 5 7.5C6.9 7.5 8.2 8.8 8.2 10.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8.4 3.1C9.8 3.3 10.7 4.4 10.7 5.8M9 8C10.5 8.4 11.2 9.3 11.3 10.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function formatShortDate(date?: string) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function priorityTextClass(priority?: string) {
  if (priority === "Urgent" || priority === "High") return "text-[#ff5b5b]";
  if (priority === "Low" || !priority) return "text-[#aab2bd]";
  return "text-[#f59e0b]";
}
