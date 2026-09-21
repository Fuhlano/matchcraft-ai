import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileText,
  Kanban,
  LineChart,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/layout/app-shell";
import { MatchScore } from "@/components/product/scores";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV — Encontre vagas que combinam com você" },
      {
        name: "description",
        content:
          "Analise sua compatibilidade com uma vaga, descubra seus gaps e gere um currículo personalizado e preparado para ATS em poucos minutos.",
      },
      { property: "og:title", content: "MatchCV — Match de vagas e currículos ATS-friendly" },
      {
        property: "og:description",
        content:
          "Compatibilidade estimada com a vaga, requisitos identificados, gaps e currículo adaptado ao perfil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: FileText,
    title: "Importe seu currículo",
    text: "Enviamos o texto do seu PDF ou DOCX para estruturar um perfil profissional mestre, que você revisa antes de salvar.",
  },
  {
    icon: Search,
    title: "Adicione uma vaga",
    text: "Cole a descrição, informe uma URL pública ou preencha manualmente. Os requisitos são organizados automaticamente.",
  },
  {
    icon: Target,
    title: "Veja o match e os gaps",
    text: "Score de 0 a 100 com o detalhamento por critério, competências compatíveis e requisitos não identificados.",
  },
  {
    icon: Sparkles,
    title: "Gere o currículo da vaga",
    text: "Uma versão adaptada ao que a vaga pede, com ATS Score estimado, edição e exportação em PDF ou DOCX.",
  },
];

const FEATURES = [
  {
    icon: Target,
    title: "Match explicável",
    text: "Cada ponto do score tem justificativa e evidência: de qual experiência ou competência veio a correspondência.",
  },
  {
    icon: FileText,
    title: "Currículo ATS-friendly",
    text: "Uma coluna, títulos tradicionais, texto selecionável e palavras-chave alinhadas à descrição da vaga.",
  },
  {
    icon: LineChart,
    title: "Gaps profissionais",
    text: "Requisitos ausentes, parciais e desejáveis separados — sem sugerir que você invente experiências.",
  },
  {
    icon: Kanban,
    title: "Acompanhamento de candidaturas",
    text: "Kanban e lista com status, currículo utilizado, próxima ação e histórico de cada processo.",
  },
];

const FAQ = [
  {
    q: "O score de match garante que serei contratado?",
    a: "Não. O score representa a compatibilidade estimada entre as informações do seu perfil e os requisitos identificados na descrição da vaga. Ele não prevê contratação nem aprovação.",
  },
  {
    q: "O sistema inventa experiências no meu currículo?",
    a: "Nunca. O currículo adaptado reorganiza, prioriza e reescreve o que já está no seu perfil. Se uma melhoria depender de algo que você não informou, o sistema pergunta antes.",
  },
  {
    q: "O que é o ATS Score?",
    a: "É uma estimativa de compatibilidade estrutural e textual do currículo com sistemas de triagem: estrutura, palavras-chave, relevância, clareza, consistência, resultados e legibilidade.",
  },
  {
    q: "Meus dados ficam privados?",
    a: "Sim. Cada pessoa acessa somente os próprios dados. Você pode desativar a análise por IA, controlar o histórico de versões e excluir a conta com todos os dados relacionados.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar conta
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-5 font-normal">
              Match de vagas + currículo ATS
            </Badge>
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight lg:text-5xl">
              Encontre vagas que combinam com você.{" "}
              <span className="text-primary">Adapte seu currículo</span> para cada oportunidade.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Analise sua compatibilidade com uma vaga, descubra seus gaps e gere um currículo personalizado e
              preparado para ATS em poucos minutos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Analisar meu currículo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
          </div>

          {/* Mockup da aplicação */}
          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vaga analisada</p>
                  <p className="font-semibold">Senior Data Analyst</p>
                  <p className="text-sm text-muted-foreground">Empresa XYZ • São Paulo • Híbrido</p>
                </div>
                <MatchScore score={87} size="md" showLabel={false} />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Competências compatíveis
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Power BI", "SQL", "Python", "Data Analytics"].map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                    >
                      <Check className="size-3.5" aria-hidden />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
                2 gaps identificados: Snowflake e Inglês avançado
              </div>

              <Button className="w-full" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Gerar currículo personalizado
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Exemplo ilustrativo. Compatibilidade estimada entre perfil e requisitos identificados.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Do currículo atual até uma versão específica para a vaga, em quatro passos.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <div key={step.title} className="surface-card p-5">
                  <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <p className="mt-4 text-xs font-medium text-primary">Passo {index + 1}</p>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <feature.icon className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Preview da plataforma */}
        <section className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Uma visão clara da sua busca</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Dashboard com match médio, vagas salvas, candidaturas em andamento e as versões de currículo já
              geradas.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "78%", label: "Match médio" },
                { value: "24", label: "Vagas salvas" },
                { value: "8", label: "Candidaturas em andamento" },
                { value: "12", label: "Versões de currículo" },
              ].map((metric) => (
                <div key={metric.label} className="surface-card p-5">
                  <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Números ilustrativos. No aplicativo, as métricas vêm somente das suas próprias análises.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA final */}
        <section className="border-t bg-card">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Encontre meu Match</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Veja onde seu perfil combina com a vaga e adapte seu currículo com base nos requisitos
              encontrados.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar minha conta
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo className="text-foreground" />
          <p>
            MatchCV — compatibilidade estimada entre perfil e requisitos identificados. Não prometemos emprego,
            entrevista ou aprovação em sistemas de triagem.
          </p>
        </div>
      </footer>
    </div>
  );
}
