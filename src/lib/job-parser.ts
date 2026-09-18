import type { JobAnalysis } from "./types";
import { normalize } from "./matching";

/** Dicionário de tecnologias/competências reconhecidas sem IA. */
const KNOWN_TERMS = [
  "Power BI","SQL","Python","R","Excel","Tableau","Looker","Qlik","Azure","AWS","GCP","Databricks",
  "Snowflake","Spark","Hadoop","Airflow","dbt","ETL","Data Warehouse","Big Query","Redshift",
  "Machine Learning","Estatística","Data Analytics","Business Intelligence","Pandas","NumPy",
  "JavaScript","TypeScript","React","Node.js","Java","C#",".NET","Go","PHP","Ruby","Kotlin","Swift",
  "Docker","Kubernetes","Terraform","CI/CD","Git","Linux","REST","GraphQL","Microservices",
  "PostgreSQL","MySQL","MongoDB","Oracle","SAP","Salesforce","HubSpot","Jira","Figma",
  "Scrum","Kanban","Agile","Product Discovery","OKR","KPI","Storytelling","Comunicação",
  "Liderança","Gestão de stakeholders","Trabalho em equipe","Resolução de problemas",
  "Inglês","Espanhol","Português",
];

const SOFT_TERMS = new Set(
  ["Comunicação","Liderança","Gestão de stakeholders","Trabalho em equipe","Resolução de problemas","Storytelling"].map(normalize),
);
const LANGUAGE_TERMS = new Set(["Inglês","Espanhol","Português"].map(normalize));

const SENIORITIES = ["Estágio","Júnior","Pleno","Sênior","Especialista","Coordenador","Gerente","Trainee"];

function section(text: string, headers: string[]): string {
  const lines = text.split(/\n+/);
  const out: string[] = [];
  let capturing = false;
  for (const line of lines) {
    const n = normalize(line);
    if (headers.some((h) => n.startsWith(normalize(h)))) {
      capturing = true;
      continue;
    }
    if (capturing && /^[a-zà-ú ]{3,40}:?$/i.test(line.trim()) && line.trim().length < 40 && /:$/.test(line.trim())) {
      capturing = false;
    }
    if (capturing) out.push(line);
  }
  return out.join("\n");
}

function bulletsOf(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.replace(/^[\s•\-–*·]+/, "").trim())
    .filter((l) => l.length > 12 && l.length < 260)
    .slice(0, 12);
}

/** Análise determinística da descrição da vaga (usada como base e fallback da IA). */
export function analyzeJobLocally(description: string, title = ""): JobAnalysis {
  const text = `${title}\n${description}`;
  const n = normalize(text);

  const found = KNOWN_TERMS.filter((t) => n.includes(normalize(t)));

  const requiredBlock = section(description, ["requisitos","requisitos obrigatórios","obrigatório","o que esperamos","você precisa","qualificações","requirements"]);
  const desirableBlock = section(description, ["diferenciais","desejável","desejáveis","será um plus","nice to have","preferred"]);
  const respBlock = section(description, ["responsabilidades","atividades","o que você vai fazer","suas entregas","responsibilities"]);

  const requiredText = normalize(requiredBlock || description);
  const desirableText = normalize(desirableBlock);

  const desirableSkills = found.filter((t) => desirableText.includes(normalize(t)));
  const requiredSkills = found.filter(
    (t) => !desirableSkills.includes(t) && requiredText.includes(normalize(t)) && !SOFT_TERMS.has(normalize(t)) && !LANGUAGE_TERMS.has(normalize(t)),
  );

  const softSkills = found.filter((t) => SOFT_TERMS.has(normalize(t)));
  const languages = found.filter((t) => LANGUAGE_TERMS.has(normalize(t)));
  const technologies = found.filter(
    (t) => !SOFT_TERMS.has(normalize(t)) && !LANGUAGE_TERMS.has(normalize(t)) && !requiredSkills.includes(t),
  );

  const seniority = SENIORITIES.find((s) => n.includes(normalize(s))) ?? "";
  const yearsMatch = /(\d+)\s*\+?\s*anos?/.exec(n);

  const education: string[] = [];
  for (const term of ["Ensino superior","Graduação","Pós-graduação","MBA","Mestrado","Doutorado","Tecnólogo"]) {
    if (n.includes(normalize(term))) education.push(term);
  }

  const responsibilities = bulletsOf(respBlock || "");

  const keywords = Array.from(new Set([...found, ...(title ? title.split(/[\s-]+/).filter((w) => w.length > 3) : [])]));

  return {
    requiredSkills,
    desirableSkills,
    technologies,
    softSkills,
    responsibilities,
    keywords,
    education,
    languages,
    seniority,
    area: "",
    experienceYears: yearsMatch ? Number(yearsMatch[1]) : null,
  };
}
