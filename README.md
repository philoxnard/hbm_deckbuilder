# Here Be Monsters — Deckbuilder

A full-stack web application for building decks for the tabletop card game *Here Be Monsters* (HBM). Users can browse the full card database, filter cards by multiple criteria, construct decks, and export them in formats compatible with both [Tabletop Simulator](https://www.tabletopsimulator.com/) (TTS) and human-readable plain text.

The app is live at **[deckbuilder.herebemonstersthegame.com](https://deckbuilder.herebemonstersthegame.com)**.

---

## Features

- **Full card browser** — Displays the complete card database with card art fetched from hosted image URLs
- **Advanced filtering** — Filter by card type (pirate/ship/shanty), pirate code, pirate type(s), firepower (with `=` / `<` / `>` comparisons), crew affiliation, and free-text effect/name search
- **Deck management** — Add and remove cards; deck state is persisted in `localStorage` so it survives page refreshes
- **Crew builder** — One-click preset deck construction based on official crew lists
- **Dual export formats**
  - **TTS JSON** — Generates the full nested JSON object that Tabletop Simulator requires to import a custom deck, including card image URLs, transform data, and per-card metadata
  - **Plain text** — Exports a human-readable decklist organized by card type (Ships / Pirates / Shanties)
- **Deck import** — Accepts both TTS JSON and plain text files; auto-detects format, normalizes card names, and repopulates the deck view
- **Version-aware cache invalidation** — On load, the frontend compares its `localStorage` version against the server version; mismatches trigger a full cache clear to prevent stale card art

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| Frontend | Vanilla JavaScript (ES6), HTML5, CSS3 |
| Data | JSON flat-file database (`db.json`) |
| State | Browser `localStorage` |
| Hosting | AWS EC2 (Ubuntu), nginx, Gunicorn, HTTPS via Let's Encrypt |

---

## Architecture

### Backend

```
app.py                 # Flask app; routes all POST requests to handlers
messageHandlers.py     # Handler functions for each command
functions.py           # Core logic: filtering, TTS generation, import parsing
configurations.py      # DB filepath, filter config
db.json                # Card database
```

All API traffic flows through a single `/receive` endpoint. Each request carries a `command` field that routes it to the appropriate handler:

| Command | Handler | Description |
|---|---|---|
| `command_on_load` | `handleOnLoad` | Returns full card list + filter options |
| `command_filter_cards` | `handleFilterCards` | Returns filtered card subset |
| `command_export_decklist` | `handleExportDecklist` | Generates TTS JSON or plain text decklist |
| `command_build_crew` | `handleBuildCrew` | Returns cards for a preset crew |
| `command_import_decklist` | `handleImportDeck` | Parses uploaded decklist file |

### Frontend

```
static/javascript.js          # Core app logic; deck state management, card rendering
static/messageHandlers.js     # Client-side AJAX handlers; mirrors backend command structure
static/stylesheet.css         # Styling
templates/index.html          # Single-page app template
```

The frontend is a single-page app. Deck state is stored in `localStorage` keyed by card name, with card metadata (including quantity) as the value. This avoids re-fetching card data on every interaction.

### Data

Each card in `db.json` has:

```json
{
  "name": "avast_avenger",
  "card_type": "pirate",
  "FaceURL": "https://...",
  "BackURL": "https://...",
  "effect_text": "...",
  "firepower": "3",
  "pirate_code": "boom",
  "pirate_types": ["super", "robot"],
  "crew": { "outlaw_dynasty": 3 }
}
```

Effect text is stripped server-side before sending to the frontend to keep the payload size manageable.

---

## TTS Export Format

Tabletop Simulator's custom deck format is a deeply nested JSON structure. Generating it correctly requires constructing several interdependent sections in a single pass over the decklist:

- **`DeckIDs`** — A flat list of sequential IDs (`100, 200, 300, ...`), one per card copy
- **`CustomDeck`** — A map from sequential index to card image URLs (`FaceURL` / `BackURL`)
- **`ContainedObjects`** — Full card object definitions, each referencing its own `CustomDeck` entry and `CardID`

All three sections must be consistent for TTS to import the deck correctly. The generation functions (`generateDeckIDs`, `generateCustomDeck`, `generateContainedObjects`) each iterate the decklist in the same order to guarantee alignment.

---

## Filtering System

Filters are sent as raw form values from the frontend and normalized server-side via `repackageRawFilters()`:

- `pirate_type` — comma-separated string split into a list; supports multi-type filtering (AND logic)
- `firepower` — cast to integer; paired with a `firepower_relativity` field (`=`, `<`, `>`)
- `effect_text` — case-insensitive substring match against both effect text and card name
- Experimental cards are hidden from all queries unless the `experimental` pirate type is explicitly requested

---

## Import / Export Flow

**Export:** Deck in `localStorage` → stringified → sent to backend → matched against `db.json` → formatted as TTS JSON or plain text → downloaded via dynamically created `<a>` element

**Import:** File uploaded → read as string → format auto-detected (TTS JSON contains `"LuaScript"`, plain text contains `"Shanties:"`) → card names parsed and normalized → matched against `db.json` → full card objects returned to frontend → stored in `localStorage`

Card name normalization handles edge cases including apostrophes, periods (`Mr. Manty`), parentheses, exclamation marks, and title-case-to-snake-case conversion.

---

## Deployment

The app is hosted on an AWS EC2 instance (Ubuntu) using the following stack:

```
Internet → nginx (port 443, HTTPS) → Gunicorn (127.0.0.1:8080) → Flask app
```

TLS is handled by a free **Let's Encrypt** certificate, obtained and auto-renewed via Certbot.

**nginx** acts as a reverse proxy, forwarding all inbound HTTP traffic to Gunicorn via an upstream block:

```nginx
upstream flaskhbmdeckbuilder {
    server 127.0.0.1:8080;
}

server {
    listen 80;

    location / {
        proxy_pass http://flaskhbmdeckbuilder;
    }
}
```

**Gunicorn** serves as the WSGI server between nginx and Flask. It is managed by a **systemd service** (`hbm_deckbuilder.service`) so the process starts automatically on boot and restarts on failure — no need for screen or tmux sessions.

To control the app on the server:

```bash
sudo systemctl start hbm_deckbuilder
sudo systemctl stop hbm_deckbuilder
sudo systemctl restart hbm_deckbuilder
sudo systemctl status hbm_deckbuilder
```

---

## Running Locally

```bash
# Install dependencies
pip install flask

# Run the development server
python app.py
```

The app starts in debug mode at `http://localhost:5000`.

---

## Tabletop Simulator — Save File Locations

To use an exported TTS deck, place the downloaded `.json` file in the TTS saved objects directory:

| OS | Path |
|---|---|
| Windows | `Documents\My Games\Tabletop Simulator\Saves\Saved Objects` |
| macOS | `~/Library/Tabletop Simulator/Saves/Saved Objects` |
| Linux | `~/.local/share/Tabletop Simulator/Saves/Saved Objects` |
