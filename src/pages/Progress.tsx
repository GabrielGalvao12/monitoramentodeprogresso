import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Waves, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useData } from "@/contexts/DataContext";
import { getDeadlineStatus } from "@/lib/taskStatus";

const Progress = () => {
  const navigate = useNavigate();
  const { tasks } = useData();

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const doingCount = tasks.filter((t) => t.status === "doing").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const overdueCount = tasks.filter((t) => getDeadlineStatus(t) === "overdue").length;
  const todayCount = tasks.filter((t) => getDeadlineStatus(t) === "today").length;
  const approachingCount = tasks.filter((t) => getDeadlineStatus(t) === "approaching").length;
  const earlyCount = tasks.filter((t) => getDeadlineStatus(t) === "early").length;

  const barData = [
    { name: "A Fazer", tarefas: todoCount },
    { name: "Em Andamento", tarefas: doingCount },
    { name: "Concluído", tarefas: doneCount },
  ];

  const pieData = [
    { name: "A Fazer", value: todoCount },
    { name: "Em Andamento", value: doingCount },
    { name: "Concluído", value: doneCount },
  ];

  const COLORS = ["hsl(33, 100%, 50%)", "hsl(211, 100%, 50%)", "hsl(142, 76%, 36%)"];

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
            <Button variant="outline" onClick={() => navigate("/boards")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard de Progresso</h2>
            <p className="text-muted-foreground">Visualize o andamento das suas tarefas</p>
          </div>

          {tasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa criada</h3>
                <p className="text-muted-foreground mb-6">
                  Crie tarefas nos seus quadros para visualizar o progresso aqui.
                </p>
                <Button onClick={() => navigate("/boards")} size="lg">
                  Ir para Quadros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tarefas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Tarefas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Estatístico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <div className="text-3xl font-bold text-primary">{tasks.length}</div>
                      <div className="text-sm text-muted-foreground mt-1">Total de Tarefas</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/10">
                      <div className="text-3xl font-bold text-secondary">{todoCount}</div>
                      <div className="text-sm text-muted-foreground mt-1">A Fazer</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-primary/10">
                      <div className="text-3xl font-bold text-primary">{doingCount}</div>
                      <div className="text-sm text-muted-foreground mt-1">Em Progresso</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-success/10">
                      <div className="text-3xl font-bold text-success">{doneCount}</div>
                      <div className="text-sm text-muted-foreground mt-1">Concluídas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tasks.some(t => t.deadline) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Status de Prazos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      {overdueCount > 0 && (
                        <div className="text-center p-4 rounded-lg bg-destructive/10">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <div className="text-3xl font-bold text-destructive">{overdueCount}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">Atrasadas</div>
                        </div>
                      )}
                      {todayCount > 0 && (
                        <div className="text-center p-4 rounded-lg bg-amber-500/10">
                          <div className="text-3xl font-bold text-amber-500">{todayCount}</div>
                          <div className="text-sm text-muted-foreground mt-1">Vencem Hoje</div>
                        </div>
                      )}
                      {approachingCount > 0 && (
                        <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                          <div className="text-3xl font-bold text-yellow-600">{approachingCount}</div>
                          <div className="text-sm text-muted-foreground mt-1">Prazo Próximo</div>
                        </div>
                      )}
                      {earlyCount > 0 && (
                        <div className="text-center p-4 rounded-lg bg-blue-500/10">
                          <div className="text-3xl font-bold text-blue-500">{earlyCount}</div>
                          <div className="text-sm text-muted-foreground mt-1">Antecipadas</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Progress;
