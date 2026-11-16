import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/product/states";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useApplications, useInvalidate } from "@/lib/queries";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, type ApplicationStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Candidaturas — MatchCV" },
      { name: "description", content: "Kanban e lista das suas candidaturas com status, currículo e próxima ação." },
      { property: "og:title", content: "Candidaturas — MatchCV" },
      { property: "og:description", content: "Acompanhe cada processo seletivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Applications,
});

function Applications() {
  const { data } = useApplications();
  const invalidate = useInvalidate();
  const [dragId, setDragId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function move(id: string, status: ApplicationStatus) {
    const userId = await requireUserId();
    const patch: Record<string, unknown> = { status };
    if (status === "applied") patch['applied_at'] = new Date().toISOString().slice(0, 10);
    await supabase.from("applications").update(patch as never).eq("id", id);
    await supabase.from("application_events").insert({ user_id: userId, application_id: id, event: "status", detail: APPLICATION_STATUS_LABEL[status] });
    invalidate(["applications"]);
    toast.success(`Movida para ${APPLICATION_STATUS_LABEL[status]}.`);
  }
  async function update(id: string, field: "next_action" | "notes", value: string) {
    await supabase.from("applications").update({ [field]: value } as never).eq("id", id);
    invalidate(["applications"]);
  }

  if (!data?.length) return (
    <div className="mx-auto max-w-4xl"><PageHeader title="Candidaturas" />
      <EmptyState title="Nenhuma candidatura" description="Na análise de uma vaga, use “Salvar candidatura” para acompanhar o processo aqui." actionLabel="Ver minhas vagas" actionTo="/jobs" /></div>
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Candidaturas" description="Arraste os cartões entre colunas ou altere o status na lista." />
      <Tabs defaultValue="kanban">
        <TabsList className="mb-4"><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="list">Lista</TabsTrigger></TabsList>
        <TabsContent value="kanban">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {APPLICATION_STATUSES.map((s) => (
              <div key={s} className="w-64 shrink-0 rounded-lg bg-muted/50 p-2" onDragOver={(e) => e.preventDefault()} onDrop={() => dragId && move(dragId, s)}>
                <p className="px-1 pb-2 text-sm font-medium">{APPLICATION_STATUS_LABEL[s]} <span className="text-muted-foreground">{data.filter((a) => a.status === s).length}</span></p>
                <div className="space-y-2">
                  {data.filter((a) => a.status === s).map((a) => (
                    <Card key={a.id} draggable onDragStart={() => setDragId(a.id)} className="cursor-grab">
                      <CardContent className="space-y-1 p-3 text-sm">
                        {a.jobs ? <Link to="/jobs/$jobId" params={{ jobId: a.jobs.id }} className="font-medium hover:underline">{a.jobs.title}</Link> : <span>Vaga removida</span>}
                        <p className="text-xs text-muted-foreground">{a.jobs?.company}</p>
                        {a.resumes && <p className="text-xs">Currículo: {a.resumes.title}</p>}
                        <Select value={a.status} onValueChange={(v) => move(a.id, v as ApplicationStatus)}>
                          <SelectTrigger className="h-7 text-xs" aria-label="Status"><SelectValue /></SelectTrigger>
                          <SelectContent>{APPLICATION_STATUSES.map((x) => <SelectItem key={x} value={x}>{APPLICATION_STATUS_LABEL[x]}</SelectItem>)}</SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="mb-3 w-56" aria-label="Filtrar status"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos os status</SelectItem>{APPLICATION_STATUSES.map((x) => <SelectItem key={x} value={x}>{APPLICATION_STATUS_LABEL[x]}</SelectItem>)}</SelectContent>
          </Select>
          <Table>
            <TableHeader><TableRow><TableHead>Vaga</TableHead><TableHead>Status</TableHead><TableHead>Candidatura</TableHead><TableHead>Próxima ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.filter((a) => filter === "all" || a.status === filter).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.jobs?.title} <span className="text-muted-foreground">— {a.jobs?.company}</span></TableCell>
                  <TableCell>{APPLICATION_STATUS_LABEL[a.status]}</TableCell>
                  <TableCell>{a.applied_at ?? "—"}</TableCell>
                  <TableCell><Input aria-label="Próxima ação" defaultValue={a.next_action ?? ""} onBlur={(e) => update(a.id, "next_action", e.target.value)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
