<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- External job search lives in src/lib/job-search/: one adapter per provider in providers.server.ts normalizing to external_jobs; pure classifiers/filters in classify.ts (tested). Why: new sources plug in without UI changes and credentials stay server-side.
