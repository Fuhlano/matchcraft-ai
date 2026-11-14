import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProfileCompleteness } from "@/components/product/profile-completeness";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useInvalidate, useMasterProfile } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Perfil profissional — MatchCV" },
      { name: "description", content: "Seu perfil mestre: base verdadeira de todas as análises e currículos." },
      { property: "og:title", content: "Perfil profissional — MatchCV" },
      { property: "og:description", content: "Edite experiências, competências, formação e idiomas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useMasterProfile();
  const invalidate = useInvalidate();
  const [basic, setBasic] = useState({ full_name: "", headline: "", email: "", phone: "", location: "", linkedin_url: "", portfolio_url: "", summary: "" });
  const [skill, setSkill] = useState("");
  const [lang, setLang] = useState({ name: "", level: "" });
  const [cert, setCert] = useState({ name: "", issuer: "" });
  const [edu, setEdu] = useState({ institution: "", course: "", level: "" });
  const [exp, setExp] = useState({ company: "", role: "", start_date: "", end_date: "", bullets: "" });

  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    setBasic({ full_name: p.full_name, headline: p.headline ?? "", email: p.email ?? "", phone: p.phone ?? "", location: p.location ?? "", linkedin_url: p.linkedin_url ?? "", portfolio_url: p.portfolio_url ?? "", summary: p.summary ?? "" });
  }, [data]);

  const refresh = () => invalidate(["master-profile"]);
  async function saveBasic() {
    const id = await requireUserId();
    const { error } = await supabase.from("profiles").update(basic).eq("id", id);
    if (error) return toast.error("Não foi possível salvar.");
    refresh(); toast.success("Perfil salvo.");
  }
  async function add(table: "skills" | "languages" | "certifications" | "education" | "experiences", row: Record<string, unknown>, reset: () => void) {
    const user_id = await requireUserId();
    const { error } = await supabase.from(table).insert({ ...row, user_id } as never);
    if (error) return toast.error("Não foi possível adicionar.");
    reset(); refresh();
  }
  async function del(table: "skills" | "languages" | "certifications" | "education" | "experiences", id: string) {
    await supabase.from(table).delete().eq("id", id); refresh();
  }
  async function moveExp(index: number, dir: -1 | 1) {
    if (!data) return;
    const list = [...data.experiences]; const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j]!, list[index]!];
    await Promise.all(list.map((e, i) => supabase.from("experiences").update({ sort_order: i }).eq("id", e.id)));
    refresh();
  }

  if (!data) return null;
  const f = (k: keyof typeof basic, label: string) => (
    <div className="space-y-1.5"><Label htmlFor={`p-${k}`}>{label}</Label><Input id={`p-${k}`} value={basic[k]} onChange={(e) => setBasic({ ...basic, [k]: e.target.value })} /></div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Perfil profissional" description="A fonte de verdade: o MatchCV só usa o que está aqui." />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Dados pessoais e resumo</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {f("full_name", "Nome")}{f("headline", "Título profissional")}{f("email", "E-mail")}{f("phone", "Telefone")}{f("location", "Localização")}{f("linkedin_url", "LinkedIn")}{f("portfolio_url", "Portfólio")}
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="p-summary">Resumo</Label><Textarea id="p-summary" rows={5} value={basic.summary} onChange={(e) => setBasic({ ...basic, summary: e.target.value })} /></div>
              <div><Button onClick={saveBasic}>Salvar</Button></div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Experiências</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.experiences.map((e, i) => (
                <div key={e.id} className="flex items-start justify-between gap-2 rounded-md border p-3 text-sm">
                  <div><p className="font-medium">{e.role} — {e.company}</p><p className="text-muted-foreground">{[e.start_date, e.is_current ? "atual" : e.end_date].filter(Boolean).join(" – ")}</p>
                    <ul className="mt-1 list-disc pl-4 text-muted-foreground">{e.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul></div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" aria-label="Subir" onClick={() => moveExp(i, -1)}>↑</Button>
                    <Button size="sm" variant="ghost" aria-label="Descer" onClick={() => moveExp(i, 1)}>↓</Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir experiência" onClick={() => del("experiences", e.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="grid gap-2 sm:grid-cols-2">
                <Input aria-label="Cargo" placeholder="Cargo" value={exp.role} onChange={(e) => setExp({ ...exp, role: e.target.value })} />
                <Input aria-label="Empresa" placeholder="Empresa" value={exp.company} onChange={(e) => setExp({ ...exp, company: e.target.value })} />
                <Input aria-label="Início" placeholder="Início (ex: 01/2021)" value={exp.start_date} onChange={(e) => setExp({ ...exp, start_date: e.target.value })} />
                <Input aria-label="Fim" placeholder="Fim (vazio = atual)" value={exp.end_date} onChange={(e) => setExp({ ...exp, end_date: e.target.value })} />
                <Textarea aria-label="Atividades" className="sm:col-span-2" placeholder="Uma atividade ou resultado por linha" value={exp.bullets} onChange={(e) => setExp({ ...exp, bullets: e.target.value })} />
              </div>
              <Button size="sm" variant="outline" disabled={!exp.role || !exp.company} onClick={() => add("experiences", { company: exp.company, role: exp.role, start_date: exp.start_date, end_date: exp.end_date, is_current: !exp.end_date, bullets: exp.bullets.split("\n").map((s) => s.trim()).filter(Boolean), sort_order: data.experiences.length }, () => setExp({ company: "", role: "", start_date: "", end_date: "", bullets: "" }))}><Plus className="size-4" />Adicionar experiência</Button>
            </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Competências</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">{data.skills.map((s) => <Badge key={s.id} variant="secondary" className="gap-1 font-normal">{s.name}<button aria-label={`Remover ${s.name}`} onClick={() => del("skills", s.id)}>×</button></Badge>)}</div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (skill.trim()) add("skills", { name: skill.trim(), category: "hard", sort_order: data.skills.length }, () => setSkill("")); }}>
                <Input aria-label="Nova competência" placeholder="Ex: SQL" value={skill} onChange={(e) => setSkill(e.target.value)} /><Button type="submit" variant="outline">Adicionar</Button>
              </form>
            </CardContent></Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">Formação</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              {data.education.map((e) => <Row key={e.id} text={`${e.course} — ${e.institution}`} onDelete={() => del("education", e.id)} />)}
              <Input aria-label="Curso" placeholder="Curso" value={edu.course} onChange={(e) => setEdu({ ...edu, course: e.target.value })} />
              <Input aria-label="Instituição" placeholder="Instituição" value={edu.institution} onChange={(e) => setEdu({ ...edu, institution: e.target.value })} />
              <Button size="sm" variant="outline" disabled={!edu.course} onClick={() => add("education", { ...edu, sort_order: data.education.length }, () => setEdu({ institution: "", course: "", level: "" }))}>Adicionar</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Certificações</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              {data.certifications.map((c) => <Row key={c.id} text={c.name} onDelete={() => del("certifications", c.id)} />)}
              <Input aria-label="Certificação" placeholder="Nome" value={cert.name} onChange={(e) => setCert({ ...cert, name: e.target.value })} />
              <Input aria-label="Emissor" placeholder="Emissor" value={cert.issuer} onChange={(e) => setCert({ ...cert, issuer: e.target.value })} />
              <Button size="sm" variant="outline" disabled={!cert.name} onClick={() => add("certifications", { ...cert, sort_order: data.certifications.length }, () => setCert({ name: "", issuer: "" }))}>Adicionar</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Idiomas</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              {data.languages.map((l) => <Row key={l.id} text={`${l.name} — ${l.level}`} onDelete={() => del("languages", l.id)} />)}
              <Input aria-label="Idioma" placeholder="Idioma" value={lang.name} onChange={(e) => setLang({ ...lang, name: e.target.value })} />
              <Input aria-label="Nível" placeholder="Nível" value={lang.level} onChange={(e) => setLang({ ...lang, level: e.target.value })} />
              <Button size="sm" variant="outline" disabled={!lang.name} onClick={() => add("languages", lang, () => setLang({ name: "", level: "" }))}>Adicionar</Button>
            </CardContent></Card>
          </div>
        </div>
        <aside><ProfileCompleteness profile={data} /></aside>
      </div>
    </div>
  );
}

function Row({ text, onDelete }: { text: string; onDelete: () => void }) {
  return <div className="flex items-center justify-between gap-2"><span>{text}</span><Button size="icon" variant="ghost" aria-label="Excluir" onClick={onDelete}><Trash2 className="size-3.5" /></Button></div>;
}
