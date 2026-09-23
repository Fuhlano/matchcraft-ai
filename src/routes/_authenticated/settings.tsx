import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useInvalidate, useMasterProfile, useSession } from "@/lib/queries";
import { DeleteAccount } from "@/components/product/delete-account";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — MatchCV" },
      { name: "description", content: "Conta, preferências de busca, uso de IA e privacidade." },
      { property: "og:title", content: "Configurações — MatchCV" },
      { property: "og:description", content: "Gerencie sua conta e preferências no MatchCV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings;
});

function Settings() {
  const { data: profile } = useMasterProfile();
  const { user } = useSession();
  const invalidate = useInvalidate();
  const [prefs, setPrefs] = useState({
    desired_role: "",
    work_model: "",
    salary_expectation: "",
    location: "",
  });
  const [password, setPassword] = useState({ current: "", next: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPrefs({
      desired_role: profile.profile.desired_role ?? "",
      work_model: profile.profile.work_model ?? "",
      salary_expectation: profile.profile.salary_expectation ?? "",
      location: profile.profile.location ?? "",
    });
  }, [profile]);

  async function savePrefs() {
    setSaving(true);
    const userId = await requireUserId();
    const { error } = await supabase.from("profiles").update(prefs).eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    invalidate(["master-profile"]);
    toast.success("Preferências salvas.");
  }

  async function toggle(field: "ai_analysis_enabled" | "keep_version_history", value: boolean) {
    const userId = await requireUserId();
    await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", userId);
    invalidate(["master-profile"]);
  }

  async function changePassword() {
    if (password.next.length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: password.next,
      // @ts-expect-error current_password é exigido pelo backend em troca de senha autenticada
      current_password: password.current,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword({ current: "", next: "" });
    toast.success("Senha atualizada.");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configurações" description="Conta, preferências de busca, IA e privacidade." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conta</CardTitle>
            <CardDescription>E-mail utilizado para acessar o MatchCV.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="account-email">E-mail</Label>
              <Input id="account-email" value={user?.email ?? ""} readOnly disabled />
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pass-current">Senha atual</Label>
                <Input
                  id="pass-current"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass-next">Nova senha</Label>
                <Input
                  id="pass-next"
                  type="password"
                  value={password.next}
                  onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button variant="outline" onClick={changePassword}>
              Alterar senha
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferências de busca</CardTitle>
            <CardDescription>Usadas no cálculo de compatibilidade com a vaga.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pref-role">Cargo desejado</Label>
              <Input
                id="pref-role"
                value={prefs.desired_role}
                onChange={(e) => setPrefs((p) => ({ ...p, desired_role: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pref-model">Modelo de trabalho</Label>
              <Input
                id="pref-model"
                value={prefs.work_model}
                onChange={(e) => setPrefs((p) => ({ ...p, work_model: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pref-location">Localização</Label>
              <Input
                id="pref-location"
                value={prefs.location}
                onChange={(e) => setPrefs((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pref-salary">Pretensão salarial</Label>
              <Input
                id="pref-salary"
                value={prefs.salary_expectation}
                onChange={(e) => setPrefs((p) => ({ ...p, salary_expectation: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={savePrefs} disabled={saving}>
                Salvar preferências
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inteligência artificial</CardTitle>
            <CardDescription>
              A IA reorganiza e reescreve o que já está no seu perfil. Ela nunca cria experiências, resultados
              ou competências que você não informou.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="set-ai">Usar IA nas análises e sugestões</Label>
              <Switch
                id="set-ai"
                checked={profile?.profile.ai_analysis_enabled ?? true}
                onCheckedChange={(v) => toggle("ai_analysis_enabled", v)}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="set-history">Guardar histórico de versões dos currículos</Label>
              <Switch
                id="set-history"
                checked={profile?.profile.keep_version_history ?? true}
                onCheckedChange={(v) => toggle("keep_version_history", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base">Zona de risco</CardTitle>
            <CardDescription>Exclusão definitiva da conta e de todos os dados.</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccount />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
