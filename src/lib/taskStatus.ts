import { Task } from "@/types";

export type DeadlineStatus = "completed" | "early" | "today" | "approaching" | "overdue" | "none";

export function getDeadlineStatus(task: Task): DeadlineStatus {
  if (!task.deadline) return "none";
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Se já está concluída
  if (task.status === "done") {
    if (task.completedAt) {
      const completed = new Date(task.completedAt);
      return completed <= deadline ? "early" : "completed";
    }
    return "completed";
  }

  // Se não está concluída
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 2) return "approaching";
  
  return "none";
}

export function getDeadlineStatusColor(status: DeadlineStatus): string {
  switch (status) {
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "early":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "today":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "approaching":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "overdue":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "";
  }
}

export function getDeadlineStatusText(status: DeadlineStatus): string {
  switch (status) {
    case "completed":
      return "✓ Concluída";
    case "early":
      return "✓ Antecipada";
    case "today":
      return "⚠️ Último dia!";
    case "approaching":
      return "⏰ Prazo se aproximando";
    case "overdue":
      return "⏰ Prazo expirado";
    default:
      return "";
  }
}
