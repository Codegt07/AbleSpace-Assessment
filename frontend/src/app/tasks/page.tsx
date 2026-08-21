import Sidebar from "@/components/Sidebar";
import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <main className="ml-0 min-h-screen pb-16 lg:ml-[240px] lg:pb-0">
        <div className="h-[52px] border-b border-[var(--border)]" />

        <div className="px-3 pt-4 sm:px-4 sm:pt-5 lg:px-6 lg:pt-6">
          <div className="mt-2 sm:mt-3 lg:mt-4">
            <TaskBoard />
          </div>
        </div>
      </main>
    </div>
  );
}