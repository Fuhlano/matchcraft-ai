import type { ResumeContent } from "./types";

/** Exporta o currículo em DOCX com estrutura simples de uma coluna (ATS-friendly). */
export async function exportResumeDocx(resume: ResumeContent, fileName: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24 })],
    });

  const body = (text: string, bold = false) =>
    new Paragraph({ children: [new TextRun({ text, bold, size: 22 })], spacing: { after: 60 } });

  const bullet = (text: string) =>
    new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: resume.name, bold: true, size: 32 })],
    }),
  ];

  if (resume.headline) children.push(body(resume.headline));
  if (resume.contact.length) children.push(body(resume.contact.join(" | ")));

  if (resume.summary) {
    children.push(heading("Resumo profissional"));
    children.push(body(resume.summary));
  }

  if (resume.experiences.length) {
    children.push(heading("Experiência profissional"));
    for (const exp of resume.experiences) {
      children.push(body(exp.company, true));
      children.push(body([exp.role, exp.period, exp.location].filter(Boolean).join(" | ")));
      exp.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (resume.education.length) {
    children.push(heading("Formação"));
    for (const ed of resume.education) {
      children.push(body(ed.institution, true));
      children.push(body([ed.course, ed.period].filter(Boolean).join(" | ")));
    }
  }

  if (resume.skills.length) {
    children.push(heading("Competências"));
    children.push(body(resume.skills.join(", ")));
  }

  if (resume.certifications.length) {
    children.push(heading("Certificações"));
    resume.certifications.forEach((c) => children.push(bullet(c)));
  }

  if (resume.languages.length) {
    children.push(heading("Idiomas"));
    children.push(body(resume.languages.join(" | ")));
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${fileName}.docx`);
}

/** Exporta em PDF através da impressão do preview (texto selecionável, uma coluna). */
export function exportResumePdf() {
  window.print();
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
