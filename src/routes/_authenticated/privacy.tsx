import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useInvalidate, useMasterProfile } from "@/lib/queries";
import { DeleteAccount } from "@/components/product/delete-account";

export const Route = createFileRoute("/_authenticated/privacy")({
  head: () => ({
    meta: [
      { title: "Privacidade — MatchCV" },
      {
        name: "description",
        content: "Quais dados guardamos, para que servem e como excluir sua conta e todas as informações.",
      },
      { property: "og:title", content: "Privacidade — MatchCV" },
      { property: "og:description", content: "Controle seus dados, a análise por IA e o histórico de versões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const STORED = [
  ["Dados de cadastro", "Nome e e-mail, usados para identificar sua conta e permitir o login."],
  [
    "Perfil profissional",
    "Resumo, experiências, formação, competências, certificações, projetos e idiomas que você informa ou importa do seu currículo.",
  ],
  ["Vagas", "Descrição, dados do anúncio e os requisitos identificados na análise."],
  ["Matches", "Score estimado, detalhamento por critério e as evidências encontradas no seu perfil."],
  ["Currículos", "Conteúdo das versões geradas, ATS Score estimado e histórico de versões."],
  ["Candidaturas", "Status, currículo utilizado, observações, contatos e histórico de eventos."],
  ["Registros de IA", "Entradas e saídas das análises, para você poder auditar o que foi gerado."],
];

function Privacy() {
  const { data: profile } = useMasterProfile();
  const invalidate = useInvalidate();

  async function toggle(field: "ai_analysis_enabled" | "keep_version_history", value: boolean) {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value } as never)
      .eq("id", userId);
    if (error) {
      toast.error("Não foi possível salvar a preferência.");
      return;
    }
    invalidate(["master-profile"]);
    toast.success("Preferência atualizada.");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Privacidade"
        description="Você decide o que é guardado e pode apagar tudo a qualquer momento."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados que guardamos</CardTitle>
            <CardDescription>
              Cada pessoa acessa apenas os próprios dados. Nada do seu perfil é compartilhado com outras contas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {STORED.map(([title, text]) => (
              <div key={title}>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seus controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="ai-toggle">Análise por IA</Label>
                <p className="text-sm text-muted-foreground">
                  Quando desativada, a extração de requisitos e as sugestões de texto usam apenas regras locais.
                </p>
              </div>
              <Switch
                id="ai-toggle"
                checked={profile?.profile.ai_analysis_enabled ?? true}
                onCheckedChange={(value) => toggle("ai_analysis_enabled", value)}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="history-toggle">Histórico de versões</Label>
                <p className="text-sm text-muted-foreground">
                  Guarda cada versão salva do currículo para você comparar e restaurar.
                </p>
              </div>
              <Switch
                id="history-toggle"
                checked={profile?.profile.keep_version_history ?? true}
                onCheckedChange={(value) => toggle("keep_version_history", value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base">Excluir minha conta e todos os meus dados</CardTitle>
            <CardDescription>
              Remove perfil, vagas, matches, currículos, candidaturas e registros de IA. A ação não pode ser
              desfeita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccount />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
