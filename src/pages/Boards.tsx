import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FolderKanban, Plus, Waves } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";

const Boards = () => {
  const navigate = useNavigate();
  const { boards, createBoard, getTasksByBoard } = useData();
  const [newBoardName, setNewBoardName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

          {boards.length === 0 ? (
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
              {boards.map((board) => {
                const taskCount = getTasksByBoard(board.id).length;
                return (
                  <Card
                    key={board.id}
                    className="cursor-pointer board-card-hover"
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{board.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {taskCount} {taskCount === 1 ? "tarefa" : "tarefas"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        Abrir Quadro
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Boards;
