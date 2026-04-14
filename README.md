# ✈️ Travel Checklist

旅行の条件を入力すると、100以上のアイテムから最適な持ち物リストを自動生成するバニラJSアプリです。

A vanilla JS travel packing list generator. Input your trip details — destination, season, duration, transport, and trip type — and get a tailored checklist drawn from 100+ conditional items.

**[Live Demo →](https://sen.ltd/portfolio/travel-checklist/)**

---

## Features / 機能

- **Conditional items** — passport for international trips, winter coat for cold seasons, swimsuit for beach trips, and more
- **7 categories** — Documents, Clothing, Toiletries, Electronics, Health, Entertainment, Misc
- **Priority levels** — Critical / High / Medium / Optional badges help you focus on essentials
- **Custom items** — add anything not on the default list
- **Trip profiles** — save and reload profiles with localStorage
- **Progress tracker** — visual progress bar as you pack
- **Print-friendly** — clean print layout with `Ctrl+P`
- **Japanese / English UI** — full i18n with one-click toggle
- **Dark / light theme**
- **Zero dependencies, no build step**

## Setup

```sh
git clone https://github.com/masaru87/travel-checklist.git
cd travel-checklist
python3 -m http.server 8080
# open http://localhost:8080
```

## Run tests

```sh
node --test tests/*.test.js
```

Requires Node.js 18+ (uses the built-in test runner).

## How it works

1. Select destination, season, duration, transport, and trip type
2. Click **Generate list**
3. Check off items as you pack
4. Add custom items with the input at the top of the list
5. Save the profile for future trips

## Condition logic

Items in `src/items.js` carry a `conditions` object. All specified conditions must match (AND logic):

| Key | Effect |
|-----|--------|
| `destination` | `['domestic']` or `['international']` |
| `season` | `['spring','summer','fall','winter']` |
| `transport` | `['plane','train','car']` |
| `tripType` | `['business','leisure','adventure','beach']` |
| `minDays` | Included when trip length ≥ this value |
| `maxDays` | Included when trip length ≤ this value |

## Project structure

```
travel-checklist/
├── index.html          # App shell
├── style.css           # All styles (light + dark theme)
├── src/
│   ├── main.js         # DOM orchestration, events, rendering
│   ├── checklist.js    # Pure logic: generate, group, sort
│   ├── items.js        # 100+ item database with conditions
│   └── i18n.js         # ja/en translations
├── tests/
│   └── checklist.test.js
├── assets/
└── package.json
```

## License

MIT © 2026 [SEN LLC](https://sen.ltd)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/travel-checklist/
- 📝 dev.to: https://dev.to/sendotltd/a-travel-checklist-generator-with-conditional-items-and-trip-profiles-13m0
<!-- /sen-publish:links -->
