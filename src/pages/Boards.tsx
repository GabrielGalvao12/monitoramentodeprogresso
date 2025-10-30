import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FolderKanban, Plus, Waves, Mail, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const Boards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { boards, createBoard, getTasksByBoard, deleteBoard, getPendingInvitations, acceptInvitation, rejectInvitation } = useData();
  const [newBoardName, setNewBoardName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  const pendingInvitations = getPendingInvitations();
  const userBoards = boards.filter(board => 
    board.owner === user?.email || board.collaborators?.includes(user?.email || "")
  );

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName);
      setNewBoardName("");
      setIsDialogOpen(false);
      toast.success("Quadro criado com sucesso!");
    } else {
      toast.error("Digite um nome para o quadro");
    }
  };

  const handleDeleteBoard = () => {
    if (boardToDelete) {
      deleteBoard(boardToDelete);
      setBoardToDelete(null);
      toast.success("Quadro excluído com sucesso!");
    }
  };

  const handleAcceptInvitation = (invitationId: string, boardName: string) => {
    acceptInvitation(invitationId);
    toast.success(`Você agora é colaborador do quadro "${boardName}"!`);
  };

  const handleRejectInvitation = (invitationId: string) => {
    rejectInvitation(invitationId);
    toast.info("Convite recusado");
  };

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
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {pendingInvitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Convites Pendentes
              </h3>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <Card key={invitation.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium mb-1">
                            Você foi convidado para colaborar no quadro <strong>"{invitation.boardName}"</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Convidado por: {invitation.from}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.boardName)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectInvitation(invitation.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Meus Quadros</h2>
              <p className="text-muted-foreground">Gerencie seus projetos e tarefas</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="font-semibold">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Novo Quadro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Quadro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="board-name">Nome do Quadro</Label>
                    <Input
                      id="board-name"
                      placeholder="Ex: Projeto X"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                    />
                  </div>
                  <Button onClick={handleCreateBoard} className="w-full">
                    Criar Quadro
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {userBoards.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-muted p-6">
                    <FolderKanban className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum quadro criado</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não tem quadros. Crie o primeiro!
                </p>
                <Button onClick={() => setIsDialogOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeiro Quadro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userBoards.map((board) => {
                const taskCount = getTasksByBoard(board.id).length;
                const isOwner = board.owner === user?.email;
                return (
                  <Card
                    key={board.id}
                    className="board-card-hover relative"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate(`/board/${board.id}`)}>
                          <div className="rounded-lg bg-primary/10 p-3">
                            <FolderKanban className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl">{board.name}</CardTitle>
                            {!isOwner && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Colaborador
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBoardToDelete(board.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="cursor-pointer" onClick={() => navigate(`/board/${board.id}`)}>
                      <p className="text-muted-foreground">
                        {taskCount} {taskCount === 1 ? "tarefa" : "tarefas"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full" onClick={() => navigate(`/board/${board.id}`)}>
                        Abrir Quadro
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <AlertDialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir este quadro?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as tarefas e dados associados a este quadro serão apagados permanentemente. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir Quadro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Boards;
