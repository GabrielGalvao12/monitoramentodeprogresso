import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, LayoutGrid, TrendingUp, Waves, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { getDeadlineStatus } from "@/lib/taskStatus";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks } = useData();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "doing").length,
    completed: tasks.filter((t) => t.status === "done").length,
    progress: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0,
    overdue: tasks.filter((t) => getDeadlineStatus(t) === "overdue").length,
    today: tasks.filter((t) => getDeadlineStatus(t) === "today").length,
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
              onClick={() => {
                logout();
                navigate("/auth");
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name || "Usuário"}
            </p>
          </div>

          {stats.overdue > 0 && (
            <Card className="border-l-4 border-l-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-lg">Atenção!</h3>
                    <p className="text-muted-foreground">
                      Você tem {stats.overdue} {stats.overdue === 1 ? "tarefa atrasada" : "tarefas atrasadas"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.today > 0 && stats.overdue === 0 && (
            <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Último dia!</h3>
                    <p className="text-muted-foreground">
                      {stats.today} {stats.today === 1 ? "tarefa vence" : "tarefas vencem"} hoje
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Todas as tarefas</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">Tarefas ativas</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{stats.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">Tarefas finalizadas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progresso do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Conclusão Geral</span>
                  <span className="text-2xl font-bold text-primary">{stats.progress}%</span>
                </div>
                <Progress value={stats.progress} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.total === 0
                  ? "Crie seu primeiro quadro e comece a adicionar tarefas!"
                  : stats.progress === 100
                  ? "Parabéns! Todas as tarefas foram concluídas!"
                  : "Continue progredindo para concluir todas as tarefas."}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="text-base font-semibold px-8"
              onClick={() => navigate("/boards")}
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
              Ver Quadros
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
