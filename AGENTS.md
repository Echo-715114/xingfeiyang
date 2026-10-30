# AGENTS.md

## Repository shape

- Static HTML/CSS/JS course workspace. No package manager, build, lint, or automated tests; verify changes by opening the HTML file in a browser.
- The root `D:\高级网页设计` is the git repo `xfy715114` (branch `master`, Gitee). `webproject-xingfeiyang/` is a separate nested git repo with its own Gitee remote and is intentionally gitignored — never add it to the root repo.
- `.trae/` and `.trae-html-share-packages/` are gitignored. `.trae/` contains local commit skills and token config; never force-add it or commit secrets.

## Repo-specific workflow rules

- Prefix new CSS classes, IDs, and JS variables with `xfy_` (see `xfy_prompt.md`). Older starter templates may not follow this; new work must.
- For page work requested by a prompt, append the prompt to `xfy_prompt.md` with timestamp, model, and verbatim content before implementing. Never overwrite existing entries.
- New HTML pages should link back to the homepage with `<a class="xfy_home" href="index.html">返回首页</a>`. Note: the root `index.html` does not currently exist, so existing iconfont pages link to a missing page; confirm before creating/restoring it.
- UI copy and commit messages are in Chinese.

## Where things live

- `iconfont-1.html`..`iconfont-4.html`: icon specimen pages. 1/2 show Font Awesome font icons vs Lucide SVG using `cdn/`; 3/4 are mobile fixed bottom navs whose icon assets point into `webproject-xingfeiyang/font/` (the gitignored nested repo), so they break in a fresh clone without that subrepo.
- `四级项目/`: "Days Matter" mobile replica (`index.html`, `menu.html`, `add.html`). Inline CSS/JS, iconfont JS sprite under `images/font_5244147_o2xw7xghiud/`, shared styles in `css/xfy_global.css`. Verify in DevTools mobile mode.
- `模块6/`: student grade dashboard exercise. `data.js` exposes global `SUBJECTS` / `STUDENTS`; `starter-level1.html` / `starter-level2.html` are templates, `starter-level1-0117xfy.html` / `starter-level2-0117xfy.html` are the student implementations. Render from `data.js`; do not hardcode student data.
- `TRAE_CN/`: catch-ball game. `spec.md` is authoritative; implementation plan is in `docs/plans/2026-10-21-catch-ball-game.md`. `js/game.js` is still a placeholder, so the game logic is not implemented.
- `cdn/`: vendored Font Awesome and Lucide. Use these local paths, not remote CDNs.
- `skills/frontend-design/SKILL.md`: read before designing new visual pages.

## Verification and gotchas

- Manual browser verification only. Mobile layouts require DevTools device emulation; no dev server is required for most pages.
- Do not mix root-repo work with `webproject-xingfeiyang/`; it is a separate submission.
- Some `模块6` starter files contain mojibake in comments/titles; preserve their behavior and do not copy garbled text into new work.

## Git and submission

- Root remote: `https://gitee.com/neusoft_wangyao_jsj/xfy715114.git`. Subrepo remote: `https://gitee.com/neusoft_wangyao_jsj/webproject-xingfeiyang.git`. Both use `master`.
- Follow the existing local skills: `.trae/skills/commit-xfy715114/SKILL.md` for the root repo, `.trae/skills/commit-to-gitee/SKILL.md` for the subrepo. Stage files individually (no `git add -A`), avoid force-push/amend, and never commit tokens.
- If the user only says "提交项目" without naming a repo, confirm which repo before committing.
- The root working tree currently has uncommitted `四级项目/` changes and untracked `模块6/`; do not commit unless asked.
