import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Board, Task, Comment, Tag, Invitation } from "@/types";
import { useAuth } from "./AuthContext";

interface DataContextType {
  boards: Board[];
  tasks: Task[];
  invitations: Invitation[];
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
  getPendingInvitations: () => Invitation[];
  acceptInvitation: (invitationId: string) => void;
  rejectInvitation: (invitationId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const getGlobalKey = (key: string) => `global_${key}`;

  useEffect(() => {
    if (user) {
      const boardsKey = getGlobalKey("boards");
      const tasksKey = getGlobalKey("tasks");
      const invitationsKey = getGlobalKey("invitations");
      
      // Migração de dados antigos (de usuário-específico para global)
      const oldBoardsKey = `${user.email}_boards`;
      const oldTasksKey = `${user.email}_tasks`;
      const oldBoardsData = localStorage.getItem(oldBoardsKey);
      const oldTasksData = localStorage.getItem(oldTasksKey);
      
      let storedBoards = localStorage.getItem(boardsKey);
      let storedTasks = localStorage.getItem(tasksKey);
      const storedInvitations = localStorage.getItem(invitationsKey);
      
      // Se existem dados antigos mas não dados novos, fazer migração
      if (oldBoardsData && !storedBoards) {
        storedBoards = oldBoardsData;
        localStorage.setItem(boardsKey, oldBoardsData);
        localStorage.removeItem(oldBoardsKey);
      }
      
      if (oldTasksData && !storedTasks) {
        storedTasks = oldTasksData;
        localStorage.setItem(tasksKey, oldTasksData);
        localStorage.removeItem(oldTasksKey);
      }
      
      const parsedBoards = storedBoards ? JSON.parse(storedBoards) : [];
      
      // Migrar quadros antigos sem o campo owner
      const migratedBoards = parsedBoards.map((board: Board) => ({
        ...board,
        owner: board.owner || user.email,
        collaborators: board.collaborators || [user.email],
      }));
      
      setBoards(migratedBoards);
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      setInvitations(storedInvitations ? JSON.parse(storedInvitations) : []);
    } else {
      setBoards([]);
      setTasks([]);
      setInvitations([]);
    }
  }, [user]);

  useEffect(() => {
    const boardsKey = getGlobalKey("boards");
    const tasksKey = getGlobalKey("tasks");
    const invitationsKey = getGlobalKey("invitations");
    
    localStorage.setItem(boardsKey, JSON.stringify(boards));
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    localStorage.setItem(invitationsKey, JSON.stringify(invitations));
  }, [boards, tasks, invitations]);

  const createBoard = (name: string) => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      owner: user?.email || "",
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
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newInvitation: Invitation = {
      id: crypto.randomUUID(),
      boardId,
      boardName: board.name,
      from: user?.email || "",
      to: email,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    setInvitations([...invitations, newInvitation]);
  };

  const getPendingInvitations = () => {
    return invitations.filter(
      inv => inv.to === user?.email && inv.status === "pending"
    );
  };

  const acceptInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    // Adicionar colaborador ao quadro
    setBoards(
      boards.map((board) =>
        board.id === invitation.boardId
          ? { ...board, collaborators: [...(board.collaborators || []), invitation.to] }
          : board
      )
    );

    // Marcar convite como aceito
    setInvitations(
      invitations.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: "accepted" as const }
          : inv
      )
    );
  };

  const rejectInvitation = (invitationId: string) => {
    setInvitations(
      invitations.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: "rejected" as const }
          : inv
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        boards,
        tasks,
        invitations,
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
        getPendingInvitations,
        acceptInvitation,
        rejectInvitation,
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
