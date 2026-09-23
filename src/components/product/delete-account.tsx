import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";

const CONFIRM = "EXCLUIR";

/** Exclusão definitiva da conta e de todos os dados relacionados. */
export function DeleteAccount() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteMyAccount();
      await supabase.auth.signOut();
      toast.success("Conta e dados excluídos.");
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir minha conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta e todos os dados?</AlertDialogTitle>
          <AlertDialogDescription>
            Perfil, vagas, matches, currículos, candidaturas e registros de IA serão apagados. Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-delete">
            Digite <strong>{CONFIRM}</strong> para confirmar
          </Label>
          <Input id="confirm-delete" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={value !== CONFIRM || loading} onClick={handleDelete}>
            Excluir definitivamente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
