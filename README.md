# manasjoshi.site

Manas Joshi's portfolio, presented as **Vice OS 86**: a 1986-style desktop where the portfolio runs inside a retro browser window. On phones it becomes an in-game phone: a home screen with a widget (name, live commits, wanted stars), apps for each page plus Snake '86 (a phone-only game where the snake eats commits), Notes and Settings, and Contact, Résumé and the MJ FM radio in the dock. Apps zoom out of their icon, and notifications drop from the top.

Plain HTML, CSS and JavaScript. No framework, no build step, hosted on GitHub Pages.

## Files

| Path | What it is |
|---|---|
| `index.html` | The desktop, the browser window and all six pages (Home, Missions, Career, Stats, Brief, Contact) |
| `assets/css/site.css` | All styles |
| `assets/js/site.js` | Everything that moves: window manager, router, sounds, Bugsweeper, menu, card |
| `assets/photos/wall.jpg` | Desktop wallpaper, also used behind the Home hero and on the card's back |
| `assets/Manas_Joshi_Resume.pdf` | The résumé every "Résumé" link opens |
| `assets/og.jpg` | 1200×630 link preview for LinkedIn, Discord and so on |
| `404.html` | The "wasted" page. It also forwards `/missions`, `/career`, `/stats` and `/brief` to the site (see Routing) |
| `projects.html`, `experience.html`, `education.html`, `contact.html`, `skills.html` | Forward old links (and `/contact`) to the matching page |

## Routing

Each page has its own address: `/`, `/missions`, `/career`, `/stats`, `/brief`, `/contact`. The site switches pages with the History API, so the browser's Back and Forward work, and so do the Back and Forward buttons in the fake browser window.

GitHub Pages has no server-side routing, so a direct visit to `/stats` is served `404.html`. That page recognises the route and forwards to `/?r=stats`, and the site restores the clean `/stats` address. Any other unknown path shows the "wasted" page. If you add a page, add its name to `PAGES` in `site.js` and to the `routes` list at the top of `404.html`.

## Updating content

Most content is data at the top of the "site data" section in `assets/js/site.js`:

- `MISSIONS`: projects. `medal` is `gold`, `silver` or `bronze`. `g` lists the skill groups the project counts toward on the Stats page.
- `JOBS`: career entries. `st` is `active`, `passed` or `incoming`. The neon sign name for each job is in `SIGN`, in the same order.
- `KIT`: the loadout on the Stats page.
- `COMMITS_FALLBACK`: shown only if the live GitHub request fails.

The Home story ("the story so far") and the certifications on Brief are plain HTML in `index.html`.

To swap the wallpaper, replace `assets/photos/wall.jpg` with a landscape photo (3840px wide or more, compressed to around 400 KB).

## Easter eggs

- Minimize the portfolio window: Bugsweeper opens.
- Close it: the desktop, with a radio, readme, Recycle Bin and a Start menu that shuts down like it's 1995. Click the black screen to boot back up (BIOS memory test, then the Vice OS splash).
- The MJ spray-paint intro plays every time the site opens and every time the portfolio window is reopened from the desktop.
- **Esc** (or tap the MJ logo three times on a phone): the classic main menu.
- Type `HESOYAM` anywhere.
- The wanted stars go up every time you come back.
- The cursor leans, aims at missions, and grows if you shake it.

## Domain

`CNAME` points GitHub Pages at `manasjoshi.site`. At the domain registrar, add four `A` records for the apex (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `CNAME` for `www` pointing to `betterthanyou73.github.io`. Then turn on **Enforce HTTPS** in the repo's Pages settings.

To keep old links alive, forward `manasjoshi.space` to `https://manasjoshi.site` with a 301 at its registrar or in Cloudflare. GitHub Pages can only serve one custom domain per repository, so it can't do that redirect itself.
