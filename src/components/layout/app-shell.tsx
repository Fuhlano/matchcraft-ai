import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useApplications, useJobs, useResumes } from "@/lib/queries";
import { ThemeToggle } from "./theme";

const NAV = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/jobs/new", label: "Encontrar vagas", icon: Search },
      { to: "/jobs", label: "Minhas vagas", icon: Briefcase },
      { to: "/resumes", label: "Currículos", icon: FileText },
      { to: "/applications", label: "Candidaturas", icon: Kanban },
    ],
  },
  {
    label: "Meu perfil",
    items: [
      { to: "/profile", label: "Perfil profissional", icon: User },
      { to: "/insights", label: "Meu mercado", icon: Target },
    ],
  },
  {
    label: "Conta",
    items: [
      { to: "/settings", label: "Configurações", icon: Settings },
      { to: "/privacy", label: "Privacidade", icon: Shield },
    ],
  },
] as const;

const MOBILE_NAV = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/jobs", label: "Vagas", icon: Briefcase },
  { to: "/jobs/new", label: "Adicionar", icon: Search },
  { to: "/resumes", label: "Currículos", icon: FileText },
  { to: "/applications", label: "Kanban", icon: Kanban },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden />
      </span>
      MatchCV
    </span>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-6 px-3 py-4">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function GlobalSearch({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { data: jobs } = useJobs();
  const { data: resumes } = useResumes();
  const { data: applications } = useApplications();

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar vagas, currículos, candidaturas e páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {NAV.flatMap((g) => g.items).map((item) => (
            <CommandItem key={item.to} value={item.label} onSelect={() => go(item.to)}>
              <item.icon className="mr-2 size-4" aria-hidden />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {jobs && jobs.length > 0 && (
          <CommandGroup heading="Vagas">
            {jobs.slice(0, 8).map((job) => (
              <CommandItem
                key={job.id}
                value={`${job.title} ${job.company}`}
                onSelect={() => go(`/jobs/${job.id}`)}
              >
                <Briefcase className="mr-2 size-4" aria-hidden />
                {job.title} — {job.company}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {resumes && resumes.length > 0 && (
          <CommandGroup heading="Currículos">
            {resumes.slice(0, 8).map((resume) => (
              <CommandItem
                key={resume.id}
                value={resume.title}
                onSelect={() => go(`/resumes/${resume.id}`)}
              >
                <FileText className="mr-2 size-4" aria-hidden />
                {resume.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {applications && applications.length > 0 && (
          <CommandGroup heading="Candidaturas">
            {applications.slice(0, 6).map((app) => (
              <CommandItem
                key={app.id}
                value={`${app.jobs?.title ?? "Candidatura"} ${app.jobs?.company ?? ""}`}
                onSelect={() => go("/applications")}
              >
                <Kanban className="mr-2 size-4" aria-hidden />
                {app.jobs?.title ?? "Candidatura"} — {app.jobs?.company ?? ""}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/dashboard" className="focus-visible:outline-none">
            <Logo />
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <NavLinks />
        </ScrollArea>
        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" aria-hidden />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="flex h-14 items-center border-b px-4 text-left">
                <Logo />
              </SheetTitle>
              <ScrollArea className="h-[calc(100vh-3.5rem)]">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
                <div className="px-3 pb-6">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="size-4" aria-hidden />
                    Sair
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="sm"
            className="w-full max-w-xs justify-start gap-2 text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            <Search className="size-4" aria-hidden />
            Buscar
            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-[10px] sm:inline">⌘K</kbd>
          </Button>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/jobs/new">Analisar vaga</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 backdrop-blur lg:hidden">
          {MOBILE_NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <GlobalSearch open={open} setOpen={setOpen} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
