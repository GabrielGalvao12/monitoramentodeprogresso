import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordResetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PasswordResetDialog({ open, onClose }: PasswordResetDialogProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Digite seu e-mail");
      return;
    }

    requestPasswordReset(email);
    setSent(true);
    toast.success("Link de recuperação enviado!");
  };

  const handleClose = () => {
    setEmail("");
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {sent ? "E-mail enviado!" : "Recuperar senha"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {sent
              ? `Enviamos um link para redefinir sua senha para ${email}`
              : "Digite seu e-mail para receber o link de recuperação"}
          </DialogDescription>
        </DialogHeader>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Enviar Link
            </Button>
          </form>
        ) : (
          <div className="pt-4">
            <Button onClick={handleClose} className="w-full" size="lg">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
