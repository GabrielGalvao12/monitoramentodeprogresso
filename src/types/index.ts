export type Priority = "Alta" | "Média" | "Baixa";

export type TaskStatus = "todo" | "doing" | "done";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  tags: Tag[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  deadline?: string;
  completedAt?: string;
}

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  collaborators: string[];
}

export interface User {
  email: string;
  name: string;
  emailVerified: boolean;
}
