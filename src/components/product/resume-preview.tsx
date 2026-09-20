import { cn } from "@/lib/utils";
import type { ResumeContent } from "@/lib/types";

export type ResumeTemplate = "classic" | "modern" | "minimal";

/** Preview do currículo: uma coluna, texto selecionável, sem elementos decorativos. */
export function ResumePreview({
  resume,
  template = "classic",
  className,
}: {
  resume: ResumeContent;
  template?: ResumeTemplate;
  className?: string;
}) {
  const heading =
    template === "modern"
      ? "text-[13px] font-semibold uppercase tracking-[0.12em] text-[#b91c1c] border-b border-[#e5e5e5] pb-1"
      : template === "minimal"
        ? "text-[13px] font-semibold text-[#171717]"
        : "text-[13px] font-bold uppercase tracking-wide text-[#171717] border-b border-[#171717] pb-1";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-5 space-y-2">
      <h2 className={heading}>{title}</h2>
      {children}
    </section>
  );

  return (
    <article
      className={cn(
        "resume-doc resume-print mx-auto w-full max-w-[820px] px-10 py-10 text-[13px]",
        className,
      )}
    >
      <header className={cn(template === "modern" && "border-b-2 border-[#b91c1c] pb-3")}>
        <h1 className="text-[26px] font-bold leading-tight">{resume.name || "Seu nome"}</h1>
        {resume.headline && <p className="text-[14px] text-[#404040]">{resume.headline}</p>}
        {resume.contact.length > 0 && (
          <p className="mt-1 text-[12px] text-[#525252]">{resume.contact.join(" | ")}</p>
        )}
      </header>

      {resume.summary && (
        <Section title="Resumo profissional">
          <p className="whitespace-pre-line text-[#262626]">{resume.summary}</p>
        </Section>
      )}

      {resume.experiences.length > 0 && (
        <Section title="Experiência profissional">
          <div className="space-y-4">
            {resume.experiences.map((exp, i) => (
              <div key={`${exp.company}-${i}`}>
                <p className="font-semibold">{exp.company}</p>
                <p className="text-[12px] text-[#525252]">
                  {[exp.role, exp.period, exp.location].filter(Boolean).join(" | ")}
                </p>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[#262626]">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Formação">
          <div className="space-y-2">
            {resume.education.map((ed, i) => (
              <div key={i}>
                <p className="font-semibold">{ed.institution}</p>
                <p className="text-[12px] text-[#525252]">{[ed.course, ed.period].filter(Boolean).join(" | ")}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Competências">
          <p className="text-[#262626]">{resume.skills.join(" • ")}</p>
        </Section>
      )}

      {resume.certifications.length > 0 && (
        <Section title="Certificações">
          <ul className="list-disc space-y-1 pl-5 text-[#262626]">
            {resume.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title="Idiomas">
          <p className="text-[#262626]">{resume.languages.join(" | ")}</p>
        </Section>
      )}
    </article>
  );
}
