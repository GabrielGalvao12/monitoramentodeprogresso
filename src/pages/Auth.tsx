import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { EmailVerificationDialog } from "@/components/EmailVerificationDialog";
import { PasswordResetDialog } from "@/components/PasswordResetDialog";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();
  const { user, login, signup, verifyEmail } = useAuth();

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await signup(name, email, password);
      if (result.success) {
        setPendingEmail(email);
        setShowVerification(true);
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleVerifyEmail = () => {
    verifyEmail();
    setShowVerification(false);
    toast.success("E-mail verificado! Agora você pode fazer login.");
    setIsLogin(true);
    setName("");
    setPassword("");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary p-3">
                <Waves className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">Monitoramento De Progresso</CardTitle>
              <CardDescription className="text-base mt-2">
                {isLogin ? "Entre na sua conta" : "Crie sua conta"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter no mínimo 8 caracteres
                  </p>
                )}
              </div>
              
              {isLogin && (
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary p-0"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    Esqueci a senha
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-semibold">
                {isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary font-semibold p-0 h-auto"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EmailVerificationDialog
        open={showVerification}
        onVerify={handleVerifyEmail}
        email={pendingEmail}
      />

      <PasswordResetDialog
        open={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </>
  );
};

export default Auth;
