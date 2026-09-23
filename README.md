# MatchCraft AI

Criar do zero um SaaS de Matchmaking de Vagas + Currículos ATS-Friendly

1. PAPEL

Atue simultaneamente como:

Senior Product Designer

Senior UX/UI Designer

Senior Full-Stack Engineer

Product Manager especializado em recrutamento e carreira

Especialista em ATS e otimização de currículos

Quero que você construa o aplicativo completo e funcional dentro deste projeto Lovable, e não apenas um protótipo visual.

O resultado deve ser um SaaS moderno, responsivo, profissional e pronto para evolução, com frontend, backend, autenticação, banco de dados, regras de negócio, componentes reutilizáveis e fluxos funcionais.

Não pare em mockups. Implemente as funcionalidades reais.

Faça decisões razoáveis de produto quando algum detalhe não estiver especificado. Não interrompa a implementação para pedir decisões simples de UI ou arquitetura.

2. CONCEITO DO PRODUTO

Nome provisório do produto:

MatchCV

Proposta:

Uma plataforma que analisa o perfil profissional do usuário, encontra ou recebe vagas de emprego, calcula o nível de compatibilidade entre candidato e vaga e gera uma versão do currículo personalizada para aquela vaga, mantendo o conteúdo verdadeiro do candidato e aumentando sua compatibilidade com sistemas ATS.

O produto deverá resolver quatro problemas principais:

O candidato não sabe quais vagas realmente combinam com seu perfil.

O candidato não sabe quais requisitos da vaga atende ou não atende.

O candidato normalmente utiliza o mesmo currículo para vagas diferentes.

O candidato não sabe se seu currículo está estruturado de forma adequada para ATS.

3. PRINCÍPIO CENTRAL DO PRODUTO

O sistema deve trabalhar sempre com dois conceitos:

Perfil mestre

É a fonte da verdade do candidato.

Contém:

Dados pessoais

Título profissional

Resumo profissional

Experiências

Empresas

Cargos

Períodos

Responsabilidades

Resultados

Projetos

Formação

Certificações

Competências

Ferramentas

Idiomas

Cursos

Links profissionais

Preferências de trabalho

Localização

Pretensão salarial opcional

Tipo de trabalho desejado

Senioridade

Áreas de interesse

Currículo adaptado

É uma versão derivada do perfil mestre para uma vaga específica.

A regra principal é:

NUNCA inventar experiências, competências, cargos, resultados, certificações, idiomas ou qualquer informação que não esteja presente no perfil do usuário.

O sistema pode:

reorganizar informações;

destacar experiências relevantes;

alterar ordem das competências;

adaptar o resumo profissional;

ajustar palavras-chave;

melhorar descrições;

transformar responsabilidades em bullets mais objetivos;

enfatizar resultados já informados;

sugerir melhorias;

reduzir informações irrelevantes;

aumentar a aderência sem falsificar informações.

4. EXPERIÊNCIA PRINCIPAL DO USUÁRIO

O fluxo principal deve ser:

Criar conta → Importar currículo → Extrair perfil → Completar perfil → Adicionar vaga → Analisar vaga → Ver Match → Ver gaps → Gerar currículo personalizado → Revisar → Exportar → Acompanhar candidatura

O aplicativo deve tornar esse fluxo extremamente simples.

5. TECNOLOGIA E ARQUITETURA

Construa a aplicação utilizando:

React

TypeScript

Tailwind CSS

shadcn/ui como Design System

Componentes reutilizáveis

Ícones Lucide

Formulários robustos com validação

Estrutura modular

Estado e cache apropriados

Banco relacional

Autenticação segura

Backend server-side para operações sensíveis

Funções server-side para processamento de documentos e IA quando necessário

Use as capacidades nativas disponíveis no Lovable para backend, autenticação, banco, storage e funções server-side.

Não criar uma arquitetura que dependa de um servidor externo administrado manualmente pelo usuário.

Toda a lógica principal do produto deve permanecer no projeto.

Não exponha chaves de API no frontend.

Quando houver integração com IA, as credenciais devem ficar exclusivamente no ambiente seguro/server-side.

6. DESIGN SYSTEM

Utilize obrigatoriamente:

shadcn/ui

Não crie outro design system paralelo.

Utilize componentes shadcn/ui sempre que existir um equivalente adequado:

Button

Input

Textarea

Select

Combobox

Checkbox

Radio Group

Switch

Card

Badge

Avatar

Alert

Alert Dialog

Dialog

Sheet

Drawer

Dropdown Menu

Tabs

Tooltip

Progress

Separator

Skeleton

Table

Pagination

Breadcrumb

Command

Calendar

Popover

Toast/Sonner

Form

Accordion

Scroll Area

Crie componentes próprios apenas quando forem específicos do produto.

Todos os componentes customizados devem respeitar a linguagem visual do shadcn/ui.

7. PALETA DE CORES

Quero uma identidade visual baseada em vermelho, porém sofisticada e agradável.

Não quero uma interface inteira vermelha.

O vermelho deve funcionar principalmente como cor de ação, identidade e destaque, enquanto fundos e superfícies utilizam tons neutros.

Cor principal

Use como referência:

Primary: #B91C1C

Vermelho profundo, profissional e moderno.

Paleta

Primary 900: #7F1D1D
Primary 800: #991B1B
Primary 700: #B91C1C
Primary 600: #DC2626
Primary 500: #EF4444
Primary 400: #F87171
Primary 300: #FCA5A5
Primary 200: #FECACA
Primary 100: #FEE2E2
Primary 50:  #FEF2F2


Neutros:

Background: #FAFAFA
Surface:    #FFFFFF
Muted:      #F5F5F5
Border:     #E5E5E5
Text:       #171717
Muted Text: #737373


Utilize também cores semânticas:

Success: #16A34A
Warning: #D97706
Info:    #2563EB
Danger:  #DC2626


As cores semânticas devem ser utilizadas apenas quando fizer sentido.

Regras visuais

Fundo predominantemente branco ou off-white.

Cards brancos com bordas discretas.

Sombras suaves.

Border radius moderno.

Vermelho principalmente em CTA, badges, indicadores, links e elementos de destaque.

Evitar excesso de gradientes.

Evitar visual neon.

Evitar excesso de glassmorphism.

Evitar deixar todos os elementos vermelhos.

Utilizar vermelho em pequenos detalhes para criar identidade.

A interface deve parecer um SaaS premium de carreira/tecnologia.

8. TIPOGRAFIA

Utilize uma tipografia moderna e altamente legível.

Priorize:

Inter

Hierarquia clara:

H1: 40–48px desktop

H2: 30–36px

H3: 22–26px

Body: 14–16px

Caption: 12–13px

Utilize pesos diferentes para hierarquia, sem exagerar em fontes muito pesadas.

9. ESTILO VISUAL

Referência visual:

Linear + Notion + modern SaaS + recruiting platform

A interface deve transmitir:

tecnologia;

confiança;

clareza;

produtividade;

inteligência;

profissionalismo;

facilidade.

Evitar:

aparência de template genérico;

excesso de cards;

excesso de bordas;

excesso de gradientes;

elementos decorativos sem função;

interface infantil;

visual de "site de agência".

10. ESTRUTURA DE NAVEGAÇÃO

Após login:

Sidebar

Logo

Principal

Dashboard

Encontrar vagas

Minhas vagas

Currículos

Candidaturas

Meu perfil

Perfil profissional

Competências

Experiências

Formação

Preferências

Ferramentas

Analisador ATS

Gerador de currículo

Conta

Configurações

Privacidade

Sidebar responsiva:

Desktop: sidebar fixa.

Tablet: sidebar compacta.

Mobile: bottom navigation + menu drawer.

11. LANDING PAGE

Criar uma landing page moderna.

Hero:

Headline

Encontre vagas que combinam com você. Adapte seu currículo para cada oportunidade.

Subheadline:

Analise sua compatibilidade com uma vaga, descubra seus gaps e gere um currículo personalizado e preparado para ATS em poucos minutos.

CTA principal:

Analisar meu currículo

CTA secundário:

Ver como funciona

Hero visual

Criar um mockup funcional da aplicação contendo:

Score de Match

Vaga

Competências compatíveis

Gaps

Botão "Gerar currículo"

Exemplo:

87%
Match com a vaga

✓ Power BI
✓ SQL
✓ Python
✓ Data Analytics

2 gaps identificados

[ Gerar currículo personalizado ]


Seções

Criar:

Hero

Como funciona

Match inteligente

Currículo ATS

Gaps profissionais

Acompanhamento das candidaturas

Preview da plataforma

FAQ

CTA final

Footer

12. AUTENTICAÇÃO

Implementar:

Cadastro

Login

Logout

Recuperação de senha

Sessão persistente

Proteção das rotas autenticadas

Login:

E-mail
Senha

[Entrar]

[Esqueci minha senha]

Ainda não tenho conta
[Criar conta]


Após cadastro:

Redirecionar automaticamente para onboarding.

13. ONBOARDING

O onboarding deve ser um wizard simples.

Etapa 1

Conte sobre sua carreira

Perguntar:

Nome

Cargo atual

Área

Senioridade

Localização

Modelo de trabalho

Cargo desejado

Etapa 2

Importe seu currículo

Permitir:

PDF

DOCX

Também oferecer:

Começar do zero

Etapa 3

Processar documento.

Mostrar:

Analisando seu currículo...

✓ Dados pessoais
✓ Experiências
✓ Formação
✓ Competências
✓ Certificações
✓ Idiomas


Etapa 4

Mostrar os dados extraídos para conferência.

O usuário deve poder corrigir tudo antes de salvar.

Etapa 5

Criar automaticamente:

Perfil profissional mestre

14. IMPORTAÇÃO E PARSING DE CURRÍCULO

Criar upload de:

PDF

DOCX

O sistema deve tentar extrair:

Dados pessoais

Nome

E-mail

Telefone

Localização

LinkedIn

Portfólio

GitHub

Outros links

Resumo

Experiências

Para cada experiência:

empresa

cargo

início

fim

atual

localização

descrição

responsabilidades

resultados

Formação

instituição

curso

nível

início

fim

Competências

Separar em:

hard skills

ferramentas

tecnologias

soft skills

idiomas

Certificações

Cursos

Projetos

O parser deve preservar o máximo possível das informações originais.

Sempre permitir revisão manual.

15. DASHBOARD

O Dashboard deve mostrar rapidamente a situação do usuário.

Header

Bom dia, Elvis 👋

Aqui está um resumo da sua jornada profissional.


Cards principais

Match médio

78%
Match médio
+8% esta semana


Vagas salvas

24
Vagas salvas


Candidaturas

8
Em andamento


Currículos criados

12
Versões geradas


16. DASHBOARD — SEÇÃO DE RECOMENDAÇÕES

Mostrar:

Vagas que mais combinam com você

Cada card deverá mostrar:

Data Analyst
Empresa XYZ

89% Match

Power BI
SQL
Python
Azure

3/3 requisitos principais

[Ver vaga]


Ordenar inicialmente pelo nível de compatibilidade.

Não mostrar nenhum atributo relacionado a:

raça;

gênero;

religião;

idade;

orientação sexual;

deficiência;

outras características protegidas.

Esses atributos não devem participar do cálculo de compatibilidade.

17. PÁGINA "ENCONTRAR VAGAS"

Criar mecanismo para o usuário adicionar uma vaga.

Opções:

Colar descrição da vaga

Text area grande.

Informar URL pública

Permitir tentar extrair os dados de uma página pública.

Caso a URL não possa ser processada, permitir automaticamente:

"Cole a descrição da vaga manualmente."

Não tentar contornar autenticação, CAPTCHA ou mecanismos de proteção.

Inserir manualmente

Campos:

cargo

empresa

localização

modelo de trabalho

senioridade

salário

descrição

requisitos

diferenciais

URL

18. ANÁLISE AUTOMÁTICA DA VAGA

Após importar a vaga, realizar:

Job Parsing

Extrair:

Informações básicas

Cargo

Empresa

Local

Modelo de trabalho

Senioridade

Área

Requisitos obrigatórios

Requisitos desejáveis

Competências técnicas

Soft skills

Tecnologias

Formação

Idiomas

Experiência

Palavras-chave

Responsabilidades

Indicadores de senioridade

19. PÁGINA DE DETALHE DA VAGA

Criar uma experiência visual semelhante a uma análise de oportunidade.

Header:

Senior Data Analyst
Empresa XYZ

São Paulo • Híbrido

[ Candidatar ]
[ Gerar currículo ]


Score principal

Criar um grande indicador:

87%
MATCH


Subtexto:

Alta compatibilidade com seu perfil

Não tratar o score como uma previsão de contratação.

Ele representa apenas compatibilidade entre dados do perfil e requisitos identificados na descrição da vaga.

20. MATCHING ENGINE

Criar um algoritmo híbrido:

Parte determinística

Comparar:

competências;

tecnologias;

experiências;

senioridade;

formação;

idiomas;

localização;

modelo de trabalho;

requisitos obrigatórios;

requisitos desejáveis.

Parte semântica/IA

Comparar semanticamente:

responsabilidades;

experiência;

projetos;

contexto profissional;

competências equivalentes;

terminologia.

Exemplo:

Power BI
vs
Microsoft Power BI


Deve reconhecer como semanticamente equivalente.

Também:

Data Visualization
vs
Visualização de Dados


21. SCORE DE MATCH

Criar score de 0 a 100.

Modelo inicial:

Requisitos obrigatórios     30%
Competências técnicas       25%
Experiência relevante       20%
Responsabilidades           10%
Senioridade                  5%
Formação/idiomas             5%
Preferências pessoais       5%


O peso deve ser configurável na arquitetura.

Mostrar também o nível:

90–100  Excelente compatibilidade
75–89   Alta compatibilidade
60–74   Compatibilidade moderada
40–59   Baixa compatibilidade
0–39    Pouca compatibilidade


Essas categorias descrevem apenas o nível de correspondência entre perfil e vaga.

22. EXPLICABILIDADE DO MATCH

Nunca mostrar apenas o número.

Mostrar:

Onde você combina

✓ Power BI
✓ SQL
✓ Python
✓ Azure
✓ Data Analytics


Onde você parcialmente combina

◐ Databricks
◐ Stakeholder Management


O que falta

! Inglês avançado
! Snowflake


Evidências do perfil

Para cada match importante, mostrar de qual parte do perfil veio a correspondência.

Exemplo:

Power BI
Encontrado em:
Experiência — Analista de Dados
Competências — Power BI


23. GAPS ANALYSIS

Criar seção:

O que pode reduzir sua aderência

Categorias:

Gap crítico

Requisito obrigatório ausente.

Gap parcial

O usuário demonstra experiência relacionada, mas o requisito aparece com outra terminologia ou em menor profundidade.

Gap desejável

Competência desejável ainda não identificada.

Para cada gap mostrar:

Power BI
Status: Atendido

Snowflake
Status: Não identificado

Inglês
Status: Parcial


Nunca sugerir que o usuário minta ou adicione uma experiência inexistente.

24. CURRÍCULO ATS

Criar ferramenta:

Gerar currículo para esta vaga

Antes da geração mostrar:

Seu currículo atual

ATS Score
72/100


Depois:

Currículo personalizado

ATS Score estimado
91/100


Deixar claro que isso é uma estimativa de compatibilidade, e não garantia de aprovação em determinado ATS.

25. REGRAS DE CURRÍCULO ATS

O gerador deve priorizar:

layout simples;

uma coluna;

hierarquia clara;

títulos tradicionais;

texto selecionável;

ausência de informações essenciais em imagens;

ausência de elementos meramente decorativos;

palavras-chave relevantes;

datas consistentes;

títulos profissionais claros;

bullets objetivos;

métricas quando já disponíveis no perfil;

consistência de nomenclatura.

Evitar:

tabelas complexas;

múltiplas colunas;

infográficos;

gráficos de habilidades;

barras de proficiência;

ícones substituindo texto;

informações essenciais dentro de imagens;

cabeçalhos e rodapés excessivamente complexos;

excesso de elementos gráficos.

26. ATS SCORE

Criar cálculo baseado em:

Estrutura                  20
Palavras-chave             20
Relevância                 20
Clareza                    15
Consistência               10
Experiência quantificada   10
Legibilidade                5


Mostrar detalhamento.

Exemplo:

ATS Score
91/100

Estrutura              20/20
Palavras-chave         18/20
Relevância             19/20
Clareza                15/15
Consistência            9/10
Resultados              7/10
Legibilidade             3/5


27. GERADOR DE CURRÍCULO

Criar uma interface dividida:

Esquerda

Painel de edição.

Direita

Preview em tempo real.

No topo:

Currículo para:
Senior Data Analyst — Empresa XYZ

ATS Score: 91

[Salvar]
[Exportar PDF]
[Exportar DOCX]


28. AI RESUME TUNING

Adicionar botões:

Melhorar resumo

Melhorar experiência

Adicionar palavras-chave relevantes

Tornar mais objetivo

Destacar resultados

Reduzir conteúdo irrelevante

Sempre apresentar a alteração antes de aplicá-la quando ela modificar conteúdo relevante.

Exemplo:

Original
Responsável pela criação de dashboards.

Sugestão
Desenvolvimento de dashboards analíticos em Power BI para acompanhamento de indicadores de negócio.

[Aplicar]
[Ignorar]


29. REGRA CRÍTICA DA IA

A IA deve operar sob esta regra:

Otimize a apresentação da experiência do candidato, mas não crie fatos.

Nunca criar automaticamente:

empregos;

cargos;

certificações;

idiomas;

projetos;

números;

resultados;

tecnologias;

experiências profissionais;

formação.

Caso uma melhoria dependa de informação inexistente, mostrar:

Você possui essa informação?

[Adicionar dado]
[Manter como está]


30. EDITOR DE PERFIL MESTRE

Criar página:

Meu Perfil

Dividir em:

Resumo

Experiência

Competências

Formação

Certificações

Cursos

Projetos

Idiomas

Links

Preferências

Cada seção deve permitir:

adicionar;

editar;

excluir;

reordenar.

31. BIBLIOTECA DE CURRÍCULOS

Criar:

Meus Currículos

Mostrar:

Data Analyst — Empresa X
ATS 91
Atualizado há 2h

Data Analyst — Empresa Y
ATS 87
Atualizado ontem

BI Analyst — Empresa Z
ATS 82
Atualizado há 3 dias


Filtros:

cargo;

empresa;

score ATS;

data.

Ações:

abrir;

duplicar;

editar;

exportar;

excluir.

32. APLICAÇÕES / KANBAN

Criar um ATS pessoal para o candidato.

Colunas:

Salva
Preparando candidatura
Candidatado
Entrevista
Teste
Oferta
Recusado
Encerrado


Permitir drag and drop.

Cada candidatura deve estar vinculada a:

vaga;

currículo utilizado;

data;

status;

observações;

contatos;

próxima ação;

histórico.

33. PÁGINA DE CANDIDATURAS

Criar duas visualizações:

Kanban

Para movimentação visual.

Lista

Tabela com:

Vaga
Empresa
Match
Currículo
Status
Data
Próxima ação


Filtros por:

status;

empresa;

cargo;

match;

período.

34. INSIGHTS DO USUÁRIO

Criar página:

Meu mercado / Meus gaps

Com base nas vagas analisadas pelo próprio usuário.

Mostrar:

Competências mais solicitadas

Power BI      82%
SQL           76%
Python        65%
Azure         54%
Databricks    38%


Competências que mais aparecem nas vagas em que você tem gaps

Cargos mais compatíveis com seu perfil

Termos profissionais mais recorrentes

Competências para desenvolver

Nunca transformar esses insights em promessa de emprego.

35. BANCO DE DADOS

Estruturar o banco de forma normalizada.

Criar entidades semelhantes a:

users
profiles
experiences
education
skills
certifications
courses
projects
languages
preferences
resumes
resume_versions
jobs
job_requirements
job_skills
job_analysis
matches
match_details
applications
application_events
ai_generations


Relacionamentos devem ser feitos por IDs.

Um usuário só deve conseguir acessar seus próprios dados.

36. SEGURANÇA

Implementar controle de acesso rigoroso.

O usuário deve conseguir acessar apenas:

seu perfil;

seus currículos;

suas vagas;

suas candidaturas;

seus arquivos;

suas análises.

Implementar políticas de segurança no backend/banco.

Arquivos de currículo devem ser privados.

Nunca armazenar API keys no frontend.

Nunca enviar dados de um usuário para outro.

Adicionar opção:

Excluir minha conta e todos os meus dados

Ao excluir a conta, apagar também:

currículos;

versões;

arquivos;

análises;

vagas privadas;

candidaturas;

histórico relacionado.

Projetar pensando na LGPD.

37. PRIVACIDADE

Criar página:

Privacidade e dados

Mostrar:

quais dados são armazenados;

para que são utilizados;

possibilidade de exclusão;

gerenciamento de currículo;

gerenciamento de dados de IA.

Criar controles:

Permitir análise de currículo por IA
[ ON ]

Salvar histórico de versões
[ ON ]


38. ESTADOS DA INTERFACE

Todas as telas devem ter:

Loading

Skeletons consistentes com shadcn/ui.

Empty state

Exemplo:

Você ainda não adicionou nenhuma vaga.

Adicione uma vaga para descobrir seu Match.

[Adicionar vaga]


Error state

Mensagens claras.

Success state

Toast/Sonner.

Processing state

Especialmente para:

parsing;

análise;

geração de currículo;

exportação.

39. RESPONSIVIDADE

O aplicativo precisa funcionar perfeitamente em:

desktop;

notebook;

tablet;

smartphone.

No mobile:

sidebar vira menu;

cards ocupam largura disponível;

editor do currículo vira fluxo vertical;

tabelas podem utilizar scroll horizontal;

CTA principal deve permanecer facilmente acessível.

40. ACESSIBILIDADE

Implementar:

navegação por teclado;

foco visível;

labels corretos;

contraste adequado;

aria labels quando necessário;

mensagens de erro acessíveis;

tamanho adequado dos controles;

estados de foco/hover/disabled.

41. MICROINTERAÇÕES

Utilizar microinterações discretas:

hover;

progress;

loading;

feedback de sucesso;

transições suaves.

Não utilizar animações exageradas.

Para score de Match, pode haver uma pequena animação de carregamento do indicador.

42. COMPONENTES ESPECÍFICOS DO PRODUTO

Criar componentes reutilizáveis:

MatchScore
ATSScore
SkillBadge
RequirementBadge
GapBadge
JobCard
ResumeCard
ResumePreview
ResumeSection
JobRequirementList
MatchBreakdown
GapAnalysis
ApplicationKanban
ApplicationCard
ProfileCompleteness
AIRewriteSuggestion
KeywordHighlight
UploadResume
JobImporter
ProcessingState


43. PROFILE COMPLETENESS

Criar indicador:

Perfil profissional
84% completo


Checklist:

✓ Dados pessoais
✓ Experiência
✓ Competências
✓ Formação
! Certificações
✓ Idiomas
! Projetos


CTA:

Completar perfil

44. PRIMEIRA EXPERIÊNCIA DO USUÁRIO

Quando um usuário entrar pela primeira vez e não possuir dados:

mostrar uma tela de onboarding extremamente clara:

Vamos começar.

Em poucos passos você terá:

✓ Perfil profissional estruturado
✓ Análise de vagas
✓ Match personalizado
✓ Currículos adaptados
✓ Score ATS

[Começar]


45. DEMO / EMPTY STATE

Criar alguns dados demonstrativos somente quando necessário para que a aplicação possa ser visualizada em desenvolvimento.

Os dados de demonstração devem ficar claramente identificados como:

Dados de demonstração

Nunca misturar silenciosamente dados demo com dados reais do usuário.

46. BUSCA E FILTROS

A busca de vagas deve permitir:

texto livre;

cargo;

empresa;

localização;

remoto;

híbrido;

presencial;

senioridade;

score de Match;

data;

status.

Ordenação:

Match maior;

mais recentes;

mais relevantes.

47. SEARCH EXPERIENCE

Criar busca global usando componente Command do shadcn.

Permitir encontrar rapidamente:

vagas;

currículos;

candidaturas;

competências;

páginas.

Atalho:

Ctrl/Cmd + K

48. NOTIFICAÇÕES INTERNAS

Criar sistema de notificações para eventos como:

currículo processado;

análise concluída;

currículo gerado;

exportação concluída;

lembrete de candidatura;

próxima ação vencendo.

49. EXPORTAÇÃO

Permitir exportar currículo em:

PDF

Layout ATS-friendly.

DOCX

Estrutura simples e compatível.

O usuário deve escolher:

Formato

○ PDF
○ DOCX

[Exportar]


50. VERSIONAMENTO

Todo currículo adaptado deve manter versões.

Exemplo:

Versão 1
18/09/2026

Versão 2
18/09/2026

Versão 3
19/09/2026


Permitir:

visualizar versão;

comparar;

duplicar;

restaurar;

exportar.

Criar comparação:

Antes
Depois


Com destaque nas alterações.

51. MÉTRICAS DO PRODUTO

No dashboard, coletar métricas simples:

número de vagas analisadas;

número de currículos gerados;

Match médio;

ATS médio;

número de candidaturas;

taxa de candidaturas por faixa de Match;

principais gaps.

Não criar estatísticas que dependam de dados que o sistema ainda não possui.

52. REGRAS DE IA

Todas as funções de IA devem possuir prompts especializados.

Criar funções separadas conceitualmente para:

parseResume()
analyzeJob()
calculateMatch()
explainMatch()
analyzeGaps()
optimizeResume()
generateResumeSummary()
rewriteExperience()
generateKeywords()
calculateATSScore()


Cada função deve possuir entradas e saídas estruturadas.

Sempre que possível, a IA deve devolver dados estruturados em JSON para o backend validar antes de persistir.

53. CONFIABILIDADE DA IA

A IA deve:

diferenciar dado confirmado de inferência;

evitar inventar informações;

sinalizar baixa confiança;

manter rastreabilidade da origem dos dados;

preservar o conteúdo original;

permitir revisão humana.

Para qualquer informação crítica:

Fonte:
Perfil do usuário
ou
Descrição da vaga


54. MATCH EXPLICÁVEL

Criar uma visualização:

Como chegamos a 87%?

Requisitos obrigatórios
28/30

Competências técnicas
23/25

Experiência
18/20

Responsabilidades
9/10

Senioridade
5/5

Formação/idiomas
4/5

Preferências
4/5


Ao clicar em cada item, mostrar a justificativa.

55. PÁGINA DE CONFIGURAÇÕES

Criar:

Conta

nome;

e-mail;

senha.

Preferências

cargos;

localização;

modelo de trabalho;

senioridade.

IA

preferências de análise.

Privacidade

dados;

exclusão da conta.

56. DESIGN DO CURRÍCULO

O preview do currículo deve parecer um documento profissional real.

Uma coluna.

Margens equilibradas.

Cabeçalho simples.

Estrutura:

NOME

Cargo / Título profissional
Localização | Email | Telefone | LinkedIn

RESUMO PROFISSIONAL

EXPERIÊNCIA PROFISSIONAL

Empresa
Cargo | Período

• Resultado / responsabilidade
• Resultado / responsabilidade
• Resultado / responsabilidade

FORMAÇÃO

COMPETÊNCIAS

CERTIFICAÇÕES

IDIOMAS


Nenhum elemento decorativo deve atrapalhar a legibilidade.

57. RESUME TEMPLATE

Criar inicialmente 3 templates:

Classic

Tradicional e extremamente simples.

Modern

Contemporâneo, mas ainda ATS-friendly.

Minimal

Minimalista e focado em conteúdo.

Todos devem respeitar as regras ATS.

O usuário pode alternar entre eles.

58. JOB DETAIL UX

Ao abrir uma vaga:

Header

Cargo + empresa + Match.

Overview

localização;

modelo;

senioridade;

salário, se disponível.

Match

Score.

Você atende

Competências.

Você parcialmente atende

Competências.

Gaps

Requisitos ausentes.

Descrição

Texto original da vaga.

Currículo recomendado

Mostrar melhor versão existente.

CTA:

Gerar currículo para esta vaga

59. CALL TO ACTIONS

Principal CTA do produto:

Encontrar meu Match

CTAs secundários:

Analisar vaga

Gerar currículo

Melhorar currículo

Ver gaps

Ver candidaturas

Evitar CTAs vagos como:

Clique aqui

Saiba mais

Continuar sem contexto

60. COPY DA INTERFACE

A linguagem deve ser:

direta;

profissional;

amigável;

objetiva;

humana.

Evitar linguagem exageradamente promocional.

Exemplo:

Em vez de:

Nossa revolucionária inteligência artificial irá transformar sua carreira.

Usar:

Veja onde seu perfil combina com a vaga e adapte seu currículo com base nos requisitos encontrados.

61. ALERTA IMPORTANTE

O produto não deve prometer:

emprego;

entrevista;

aprovação;

aumento garantido da taxa de contratação;

aprovação garantida em ATS.

Utilizar linguagem como:

"compatibilidade estimada";

"aderência ao perfil";

"ATS Score estimado";

"requisitos identificados".

62. PERFORMANCE

Priorizar:

carregamento rápido;

componentes reutilizáveis;

consultas eficientes;

paginação quando necessário;

lazy loading de páginas pesadas;

processamento assíncrono para IA;

feedback visual durante operações longas.

Não carregar currículos completos ou arquivos pesados desnecessariamente.

63. ARQUITETURA DE CÓDIGO

Organizar o projeto de maneira escalável.

Separar claramente:

components
pages
features
hooks
lib
services
types
utils


Agrupar funcionalidades por domínio quando fizer sentido:

features/
  auth/
  profile/
  jobs/
  matching/
  resumes/
  applications/
  ai/


Evitar componentes gigantes.

Evitar duplicação de código.

64. COMPONENTES E TOKENS

Centralizar:

cores;

radius;

shadows;

typography;

spacing;

estados.

Utilizar os tokens semânticos do shadcn.

Não espalhar cores hexadecimais diretamente pelos componentes.

A identidade visual deve poder ser alterada futuramente alterando os tokens.

65. DARK MODE

Implementar dark mode utilizando os mesmos tokens do shadcn.

Dark mode deve ser:

elegante;

confortável;

sem vermelho excessivamente saturado;

com contraste adequado.

No dark mode, utilizar vermelho como destaque, mas não como fundo predominante.

66. PRIMEIRO FLUXO COMPLETO A SER FUNCIONAL

Após a construção inicial, garantir que este fluxo funcione ponta a ponta:

Cadastro
↓
Login
↓
Onboarding
↓
Upload de currículo
↓
Parsing
↓
Revisão dos dados
↓
Perfil mestre
↓
Adicionar vaga
↓
Análise da vaga
↓
Match
↓
Gaps
↓
Gerar currículo personalizado
↓
ATS Score
↓
Editar
↓
Exportar PDF/DOCX
↓
Salvar candidatura


Esse fluxo é prioritário.

67. CRITÉRIOS DE ACEITE

Considerar a primeira versão concluída somente quando:

Autenticação

Cadastro funciona.

Login funciona.

Logout funciona.

Rotas privadas estão protegidas.

Perfil

Usuário consegue criar e editar perfil.

Usuário consegue gerenciar experiências.

Usuário consegue gerenciar competências.

Currículo

Usuário consegue importar PDF/DOCX.

Dados podem ser revisados.

Perfil mestre é salvo.

Currículo pode ser editado.

Currículo pode ser duplicado.

Vagas

Usuário consegue adicionar uma vaga.

Vaga é analisada.

Requisitos são estruturados.

Match

Match é calculado.

Score aparece.

Breakdown aparece.

Competências compatíveis aparecem.

Gaps aparecem.

ATS

ATS Score é calculado.

Recomendações aparecem.

Currículo adaptado pode ser gerado.

Usuário pode revisar alterações.

Exportação

PDF funciona.

DOCX funciona.

Candidaturas

Usuário consegue salvar candidatura.

Usuário consegue alterar status.

Kanban funciona.

Segurança

Usuários não acessam dados uns dos outros.

Arquivos são privados.

Chaves não ficam no frontend.

Responsividade

Desktop funciona.

Mobile funciona.

68. PRINCÍPIO DE IMPLEMENTAÇÃO

Não construir somente uma landing page.

Quero uma aplicação SaaS completa.

Não criar botões falsos.

Se um botão existir, ele deve realizar uma ação real ou indicar claramente uma funcionalidade ainda não configurada.

Não utilizar dados estáticos onde deveria existir persistência.

Não inventar resultados de IA.

Não inventar dados do usuário.

Não inventar requisitos da vaga.

69. ORDEM DE CONSTRUÇÃO

Implemente nesta ordem dentro do projeto:

Fase 1 — Foundation

Design system shadcn

Tokens

Layout

Responsividade

Autenticação

Banco

Estrutura de navegação

Fase 2 — Profile

Onboarding

Perfil

Upload

Parsing

Edição

Fase 3 — Jobs

Importação

Job parsing

Lista

Detalhe

Fase 4 — Matching

Score

Breakdown

Gaps

Explicabilidade

Fase 5 — Resumes

Gerador

Editor

Templates

ATS Score

Versionamento

Exportação

Fase 6 — Applications

Kanban

Lista

Histórico

Fase 7 — Dashboard

Métricas

Recomendações

Insights

Fase 8 — Polish

Loading

Empty states

Error states

Accessibility

Mobile

Performance

Microinteractions

70. RESULTADO ESPERADO

O produto final deve parecer um SaaS real chamado MatchCV, com aparência profissional e pronta para apresentação a usuários reais.

A experiência principal precisa comunicar imediatamente:

"Eu coloco meu currículo + uma vaga e o sistema me mostra o quanto eu combino, o que está faltando e cria uma versão do meu currículo específica para essa oportunidade."

Priorize:

clareza → confiança → velocidade → explicabilidade → utilidade.

Comece a construir a aplicação agora, usando este documento como especificação central do produto.

Não reduza o escopo para um simples protótipo visual.

Implemente a base completa e funcional, utilizando shadcn/ui como Design System oficial e a identidade visual baseada na paleta vermelha especificada acima.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/216fb3ba-4b60-43b5-a3fc-3415403c626d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
