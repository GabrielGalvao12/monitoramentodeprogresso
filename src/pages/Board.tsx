import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, Plus, Waves, X, UserPlus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { Priority, Tag } from "@/types";
import { getDeadlineStatus, getDeadlineStatusColor, getDeadlineStatusText } from "@/lib/taskStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TaskCard({ task, onClick, onDelete }: { task: any; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "priority-high";
      case "Média":
        return "priority-medium";
      case "Baixa":
        return "priority-low";
      default:
        return "";
    }
  };

  const deadlineStatus = getDeadlineStatus(task);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move task-card-hover"
      onClick={onClick}
    >
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold flex-1">{task.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        {task.assignedTo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>👤</span>
            <span>{task.assignedTo}</span>
          </div>
        )}

        {task.deadline && (
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.deadline).toLocaleDateString("pt-BR")}</span>
          </div>
        )}

        {deadlineStatus !== "none" && (
          <Badge className={getDeadlineStatusColor(deadlineStatus)} variant="outline">
            {getDeadlineStatusText(deadlineStatus)}
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
          {task.tags.length > 0 && (
            <div className="flex gap-1">
              {task.tags.slice(0, 2).map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBoardById, getTasksByBoard, createTask, moveTask, deleteTask, addCollaborator } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");

  const board = getBoardById(id!);
  const tasks = getTasksByBoard(id!);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Média" as Priority,
    tags: [] as Tag[],
  });
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState("#3B82F6");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: "todo", title: "A FAZER", color: "bg-muted" },
    { id: "doing", title: "EM ANDAMENTO", color: "bg-secondary/10" },
    { id: "done", title: "CONCLUÍDO", color: "bg-success/10" },
  ];

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Digite um título para a tarefa");
      return;
    }

    createTask(id!, newTask.title, newTask.description, newTask.priority, newTask.tags);
    setNewTask({ title: "", description: "", priority: "Média", tags: [] });
    setIsDialogOpen(false);
    toast.success("Tarefa criada com sucesso!");
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: tagInput,
        color: tagColor,
      };
      setNewTask({ ...newTask, tags: [...newTask.tags, newTag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter((t) => t.id !== tagId) });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as "todo" | "doing" | "done";

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      const updates: any = { status: newStatus };
      
      // Se movendo para "done", adicionar completedAt
      if (newStatus === "done" && !task.completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      
      moveTask(taskId, newStatus);
      toast.success("Tarefa movida!");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setTaskToDelete(null);
    toast.success("Tarefa excluída!");
  };

  const handleAddCollaborator = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!collaboratorEmail.trim() || !emailRegex.test(collaboratorEmail)) {
      toast.error("Digite um e-mail válido");
      return;
    }

    if (board?.collaborators?.includes(collaboratorEmail)) {
      toast.error("Este colaborador já foi adicionado");
      return;
    }

    addCollaborator(id!, collaboratorEmail);
    setCollaboratorEmail("");
    setIsCollabDialogOpen(false);
    toast.success(`Convite enviado para ${collaboratorEmail}!`);
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quadro não encontrado</p>
      </div>
    );
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2">
                  <Waves className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Monitoramento De Progresso</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCollabDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
                <Button variant="outline" onClick={() => navigate("/progress")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Progresso
                </Button>
                <Button variant="outline" onClick={() => navigate("/boards")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quadros
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{board.name}</h2>
                <p className="text-muted-foreground">{tasks.length} tarefas no total</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Título *</Label>
                      <Input
                        id="task-title"
                        placeholder="Nome da tarefa"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-description">Descrição</Label>
                      <Textarea
                        id="task-description"
                        placeholder="Descrição da tarefa (opcional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Prioridade</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, priority: value as Priority })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Etiquetas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome da etiqueta"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <input
                          type="color"
                          value={tagColor}
                          onChange={(e) => setTagColor(e.target.value)}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Button type="button" onClick={handleAddTag}>
                          Adicionar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTask.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color + "20", color: tag.color }}
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag.id)}
                          >
                            {tag.name}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleCreateTask} className="w-full">
                      Criar Tarefa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {columns.map((column) => {
                const columnTasks = tasks.filter((t) => t.status === column.id);
                return (
                  <SortableContext
                    key={column.id}
                    id={column.id}
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      <Card className={column.color}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{column.title}</span>
                            <Badge variant="secondary">{columnTasks.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                      </Card>

                      <div className="space-y-3 min-h-[200px]">
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => navigate(`/task/${task.id}`)}
                            onDelete={(e) => {
                              e.stopPropagation();
                              setTaskToDelete(task.id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </SortableContext>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeTask ? (
          <Card className="cursor-move rotate-3 shadow-lg">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">{activeTask.title}</h3>
              <Badge variant="outline">{activeTask.priority}</Badge>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>

      <Dialog open={isCollabDialogOpen} onOpenChange={setIsCollabDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collab-email">E-mail do colaborador</Label>
              <Input
                id="collab-email"
                type="email"
                placeholder="colaborador@email.com"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
              />
            </div>
            {board && board.collaborators && board.collaborators.length > 1 && (
              <div className="space-y-2">
                <Label>Colaboradores atuais:</Label>
                <div className="space-y-1">
                  {board.collaborators.map((email, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>👤</span>
                      <span>{email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleAddCollaborator} className="w-full">
              Enviar Convite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
};

export default Board;
