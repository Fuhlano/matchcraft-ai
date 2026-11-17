import { describe, expect, it } from "vitest";
import { classifyEnglish, classifyWorkModel, dedupeHash, passesFilters, DEFAULT_FILTERS } from "./classify";

const base = {
  work_model: "remote", remote_scope: "brazil", english_requirement: "not_mentioned", seniority: "",
  contract_type: "", posted_at: null, salary_min: null, salary_max: null, salary_period: null, status: "open",
};

describe("inglês", () => {
  it("obrigatório", () => expect(classifyEnglish("Requisitos: inglês avançado obrigatório")).toBe("required"));
  it("desejável", () => expect(classifyEnglish("Diferenciais: inglês intermediário é um diferencial")).toBe("desirable"));
  it("não exigido", () => expect(classifyEnglish("Inglês não é necessário para esta vaga")).toBe("not_required"));
  it("ausência não vira 'não exigido'", () => expect(classifyEnglish("Experiência com SQL e Power BI")).toBe("not_mentioned"));
});

describe("modalidade", () => {
  it("híbrido", () => expect(classifyWorkModel("Modelo híbrido, 3x por semana")).toBe("hybrid"));
  it("remoto", () => expect(classifyWorkModel("100% remoto")).toBe("remote"));
});

describe("filtros eliminatórios", () => {
  it("só remoto elimina presencial", () =>
    expect(passesFilters({ ...base, work_model: "onsite" }, { ...DEFAULT_FILTERS, workModels: ["remote"] })).toBe(false));
  it("vaga sem salário não é eliminada pelo salário mínimo", () =>
    expect(passesFilters(base, { ...DEFAULT_FILTERS, salaryMin: 8000 })).toBe(true));
  it("salário divulgado abaixo do mínimo é eliminado", () =>
    expect(passesFilters({ ...base, salary_max: 5000, salary_period: "month" }, { ...DEFAULT_FILTERS, salaryMin: 8000 })).toBe(false));
  it("inglês obrigatório exclui não mencionado", () =>
    expect(passesFilters(base, { ...DEFAULT_FILTERS, english: "required" })).toBe(false));
});

it("dedupe ignora acentos e caixa", () =>
  expect(dedupeHash("Analista de Dados", "Stone", "São Paulo")).toBe(dedupeHash("analista de dados ", "STONE", "Sao Paulo")));
