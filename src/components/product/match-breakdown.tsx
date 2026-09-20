import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { RequirementBadge } from "./badges";
import type { MatchItem, MatchResult } from "@/lib/types";

export function MatchBreakdown({ match }: { match: MatchResult }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        Como chegamos a {match.score}%? Clique em cada item para ver a justificativa.
      </p>
      <Accordion type="multiple" className="w-full">
        {match.breakdown.map((item) => (
          <AccordionItem key={item.key} value={item.key}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full items-center gap-4 pr-3">
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {item.score}/{item.max}
                </span>
                <Progress value={(item.score / item.max) * 100} className="hidden w-28 sm:block" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.reason}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function MatchEvidence({ items }: { items: MatchItem[] }) {
  const matched = items.filter((i) => i.status === "match");
  const partial = items.filter((i) => i.status === "partial");
  const gaps = items.filter((i) => i.status === "gap");

  return (
    <div className="space-y-6">
      <Group title="Onde você combina" items={matched} empty="Nenhuma correspondência direta identificada." />
      <Group
        title="Onde você parcialmente combina"
        items={partial}
        empty="Nenhuma correspondência parcial identificada."
      />
      <Group title="O que falta" items={gaps} empty="Nenhum requisito ausente identificado." />
    </div>
  );
}

function Group({ title, items, empty }: { title: string; items: MatchItem[]; empty: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label} className="space-y-1">
              <RequirementBadge label={item.label} status={item.status} required={item.required} />
              {item.evidence.length > 0 && (
                <p className="pl-1 text-xs text-muted-foreground">
                  Encontrado em: {item.evidence.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GapAnalysis({ items }: { items: MatchItem[] }) {
  const gaps = items.filter((i) => i.status !== "match");
  if (gaps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum item identificado como ausente nesta comparação.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        O que pode reduzir sua aderência. Estes itens vêm da descrição da vaga — adicione ao perfil apenas o
        que for verdadeiro.
      </p>
      <ul className="divide-y rounded-lg border">
        {gaps.map((gap) => {
          const kind = gap.status === "partial" ? "Parcial" : gap.required ? "Não identificado" : "Desejável";
          const tone =
            gap.status === "partial" ? "text-warning" : gap.required ? "text-primary" : "text-muted-foreground";
          return (
            <li key={gap.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="font-medium">{gap.label}</span>
              <span className={tone}>Status: {kind}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
