import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailVerificationDialogProps {
  open: boolean;
  onVerify: () => void;
  email: string;
}

export function EmailVerificationDialog({ open, onVerify, email }: EmailVerificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Verifique seu e-mail</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Enviamos um link de verificação para <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Clique no botão abaixo para simular a verificação e fazer login.
          </p>
          <Button onClick={onVerify} className="w-full" size="lg">
            Confirmar E-mail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
