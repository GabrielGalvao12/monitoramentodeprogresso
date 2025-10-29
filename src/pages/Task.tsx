import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Save, Waves, X, Trash2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Priority, TaskStatus, Tag } from "@/types";
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

const Task = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTaskById, updateTask, addComment, deleteTask, getBoardById } = useData();
  
  const task = getTaskById(id!);
  const board = task ? getBoardById(task.boardId) : null;
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState("#3B82F6");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task || !editedTask) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tarefa não encontrada</p>
      </div>
    );
  }

  const handleSave = () => {
    if (editedTask) {
      // Se mudou para "done" e não tinha completedAt, adicionar
      if (editedTask.status === "done" && !editedTask.completedAt) {
        editedTask.completedAt = new Date().toISOString();
      }
      // Se mudou de "done" para outro status, remover completedAt
      if (editedTask.status !== "done" && editedTask.completedAt) {
        editedTask.completedAt = undefined;
      }
      updateTask(id!, editedTask);
      toast.success("Tarefa atualizada com sucesso!");
    }
  };

  const handleDelete = () => {
    deleteTask(id!);
    toast.success("Tarefa excluída!");
    navigate(`/board/${task!.boardId}`);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(id!, newComment);
      setNewComment("");
      toast.success("Comentário adicionado!");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: tagInput,
        color: tagColor,
      };
      setEditedTask({ ...editedTask, tags: [...editedTask.tags, newTag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setEditedTask({ ...editedTask, tags: editedTask.tags.filter((t) => t.id !== tagId) });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "priority-high";
      case "Média": return "priority-medium";
      case "Baixa": return "priority-low";
      default: return "";
    }
  };

  const deadlineStatus = editedTask ? getDeadlineStatus(editedTask) : "none";

  return (
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
            <Button variant="outline" onClick={() => navigate(`/board/${task.boardId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Quadro
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detalhes da Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {deadlineStatus !== "none" && (
                <Badge className={getDeadlineStatusColor(deadlineStatus)} variant="outline">
                  {getDeadlineStatusText(deadlineStatus)}
                </Badge>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as Priority })}
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(value) => setEditedTask({ ...editedTask, status: value as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="doing">Em Andamento</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Prazo de Entrega
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={editedTask.deadline ? new Date(editedTask.deadline).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">
                    <User className="inline h-4 w-4 mr-1" />
                    Atribuído a
                  </Label>
                  <Select
                    value={editedTask.assignedTo || "none"}
                    onValueChange={(value) => setEditedTask({ ...editedTask, assignedTo: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguém</SelectItem>
                      {board?.collaborators?.map((email) => (
                        <SelectItem key={email} value={email}>
                          {email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2 mb-2">
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
                <div className="flex flex-wrap gap-2">
                  {editedTask.tags.map((tag) => (
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

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" size="lg">
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Alterações
                </Button>
                <Button 
                  onClick={() => setShowDeleteDialog(true)} 
                  variant="destructive" 
                  size="lg"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Comentários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.comments.length > 0 ? (
                <div className="space-y-3">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-l-primary pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">({comment.date})</span>
                      </div>
                      <p className="text-muted-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              )}

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="new-comment">Adicionar Comentário</Label>
                <Textarea
                  id="new-comment"
                  placeholder="Escreva seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} className="w-full">
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Task;
