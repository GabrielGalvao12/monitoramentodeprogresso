import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Board, Task, Comment, Tag } from "@/types";
import { useAuth } from "./AuthContext";

interface DataContextType {
  boards: Board[];
  tasks: Task[];
  createBoard: (name: string) => void;
  deleteBoard: (id: string) => void;
  createTask: (boardId: string, title: string, description: string, priority: Task["priority"], tags: Tag[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  addComment: (taskId: string, text: string) => void;
  getTasksByBoard: (boardId: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getBoardById: (boardId: string) => Board | undefined;
  addCollaborator: (boardId: string, email: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const getUserKey = (key: string) => user ? `${user.email}_${key}` : null;

  useEffect(() => {
    if (user) {
      const boardsKey = getUserKey("boards");
      const tasksKey = getUserKey("tasks");
      
      if (boardsKey && tasksKey) {
        const storedBoards = localStorage.getItem(boardsKey);
        const storedTasks = localStorage.getItem(tasksKey);
        
        setBoards(storedBoards ? JSON.parse(storedBoards) : []);
        setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      }
    } else {
      setBoards([]);
      setTasks([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const boardsKey = getUserKey("boards");
      const tasksKey = getUserKey("tasks");
      
      if (boardsKey && tasksKey) {
        localStorage.setItem(boardsKey, JSON.stringify(boards));
        localStorage.setItem(tasksKey, JSON.stringify(tasks));
      }
    }
  }, [boards, tasks, user]);

  const createBoard = (name: string) => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      collaborators: user ? [user.email] : [],
    };
    setBoards([...boards, newBoard]);
  };

  const deleteBoard = (id: string) => {
    setBoards(boards.filter((b) => b.id !== id));
    setTasks(tasks.filter((t) => t.boardId !== id));
  };

  const createTask = (
    boardId: string,
    title: string,
    description: string,
    priority: Task["priority"],
    tags: Tag[]
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      boardId,
      title,
      description,
      priority,
      status: "todo",
      tags,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    updateTask(taskId, { status: newStatus });
  };

  const addComment = (taskId: string, text: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && user) {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        author: user.name,
        text,
        date: new Date().toLocaleString("pt-BR"),
      };
      updateTask(taskId, { comments: [...task.comments, newComment] });
    }
  };

  const getTasksByBoard = (boardId: string) => {
    return tasks.filter((task) => task.boardId === boardId);
  };

  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  const getBoardById = (boardId: string) => {
    return boards.find((board) => board.id === boardId);
  };

  const addCollaborator = (boardId: string, email: string) => {
    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? { ...board, collaborators: [...board.collaborators, email] }
          : board
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        boards,
        tasks,
        createBoard,
        deleteBoard,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        addComment,
        getTasksByBoard,
        getTaskById,
        getBoardById,
        addCollaborator,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}
