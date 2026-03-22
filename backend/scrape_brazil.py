"""
Craque! — Brazil National Team Player Scraper
Scrapes player data from Wikipedia and outputs brazil_players.json
Target: https://en.wikipedia.org/wiki/List_of_Brazil_international_footballers

Requirements:
    pip install requests beautifulsoup4

Usage:
    python scrape_brazil.py
"""

import json
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

URL = "https://en.wikipedia.org/wiki/List_of_Brazil_international_footballers"
MIN_CAPS = 10
OUTPUT_PATH = Path(__file__).parent.parent / "frontend" / "src" / "data" / "brazil_players.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ── Position normalisation ────────────────────────────────────────────────────

POSITION_MAP = {
    # Goalkeepers
    "goalkeeper": "GK", "gk": "GK", "g": "GK",
    # Defenders (Wikipedia uses "DF")
    "defender": "DEF", "df": "DEF", "cb": "DEF", "lb": "DEF", "rb": "DEF",
    "rwb": "DEF", "lwb": "DEF", "sw": "DEF", "sweeper": "DEF",
    "centre-back": "DEF", "center-back": "DEF", "full-back": "DEF",
    "right back": "DEF", "left back": "DEF",
    # Midfielders (Wikipedia uses "MF")
    "midfielder": "MID", "mf": "MID", "cm": "MID", "dm": "MID", "am": "MID",
    "cdm": "MID", "cam": "MID", "lm": "MID", "rm": "MID",
    "central midfield": "MID", "defensive midfield": "MID",
    "attacking midfield": "MID", "winger": "MID", "w": "MID",
    # Forwards (Wikipedia uses "FW")
    "forward": "FWD", "fw": "FWD", "st": "FWD", "cf": "FWD", "ss": "FWD",
    "striker": "FWD", "centre-forward": "FWD", "center-forward": "FWD",
    "inside forward": "FWD", "right wing": "FWD", "left wing": "FWD",
}

def normalise_position(raw: str) -> str:
    """Map raw position string to GK/DEF/MID/FWD."""
    clean = raw.strip().lower()
    if clean in POSITION_MAP:
        return POSITION_MAP[clean]
    for key, val in POSITION_MAP.items():
        if key in clean:
            return val
    return "MID"  # default fallback


# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_year(text: str) -> int | None:
    """Extract a 4-digit year from a date string."""
    match = re.search(r"\b(19|20)\d{2}\b", text)
    return int(match.group()) if match else None


def clean_number(text: str) -> int:
    """Strip footnotes/refs and convert to int."""
    cleaned = re.sub(r"\[.*?\]", "", text).strip()
    try:
        return int(cleaned)
    except ValueError:
        return 0


def clean_name(text: str) -> str:
    """Remove Wikipedia footnotes, asterisks, and special characters from player names."""
    text = re.sub(r"\[.*?\]", "", text)   # remove [citation needed] etc.
    text = re.sub(r"\s*\*\s*", "", text)  # remove active-player asterisk
    text = text.replace("\u00ad", "")     # remove soft hyphen
    text = text.strip().strip("<>")       # remove stray HTML artifacts
    return text


# ── Scraper ───────────────────────────────────────────────────────────────────

def fetch_page(url: str) -> BeautifulSoup:
    print(f"Fetching: {url}")
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    print(f"  Status: {response.status_code}")
    return BeautifulSoup(response.text, "html.parser")


def find_player_tables(soup: BeautifulSoup) -> list:
    """
    The Wikipedia page groups players into tables (A–Z or by era).
    We collect every wikitable that looks like it has player rows.
    """
    return soup.find_all("table", class_="wikitable")


def parse_headers(table) -> dict[int, str]:
    """Return a mapping of column index → normalised header name."""
    header_row = table.find("tr")
    if not header_row:
        return {}
    headers = {}
    for i, th in enumerate(header_row.find_all(["th", "td"])):
        text = th.get_text(separator=" ", strip=True).lower()
        headers[i] = text
    return headers


def detect_column_indices(headers: dict[int, str]) -> dict[str, int] | None:
    """
    Map semantic fields to column indices.
    Returns None if the table doesn't look like a player table.
    """
    cols = {}
    for i, h in headers.items():
        if "name" in h or "player" in h:
            cols.setdefault("name", i)
        elif "pos" in h:
            cols.setdefault("position", i)
        elif "first" in h:
            cols.setdefault("first_year", i)
        elif "last" in h or "final" in h:
            cols.setdefault("last_year", i)
        elif h == "caps" or h == "app" or h == "appearances":
            cols.setdefault("caps", i)
        elif "goal" in h:
            cols.setdefault("goals", i)

    # Must have at least name + caps to be useful
    if "name" not in cols or "caps" not in cols:
        return None
    return cols


def parse_table(table) -> list[dict]:
    headers = parse_headers(table)
    cols = detect_column_indices(headers)
    if cols is None:
        return []

    players = []
    rows = table.find_all("tr")[1:]  # skip header row

    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue

        def cell_text(key):
            idx = cols.get(key)
            if idx is None or idx >= len(cells):
                return ""
            return cells[idx].get_text(separator=" ", strip=True)

        name = clean_name(cell_text("name"))
        if not name:
            continue

        caps = clean_number(cell_text("caps"))
        if caps < MIN_CAPS:
            continue

        goals = clean_number(cell_text("goals"))
        position = normalise_position(cell_text("position")) if "position" in cols else "MID"
        first_year = extract_year(cell_text("first_year"))
        last_year = extract_year(cell_text("last_year"))

        players.append({
            "name": name,
            "position": position,
            "caps": caps,
            "goals": goals,
            "first_year": first_year,
            "last_year": last_year,
            "fun_fact": "",
        })

    return players


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    soup = fetch_page(URL)
    tables = find_player_tables(soup)
    print(f"  Found {len(tables)} wikitable(s)")

    all_players: list[dict] = []
    seen_names: set[str] = set()

    for table in tables:
        parsed = parse_table(table)
        for player in parsed:
            if player["name"] not in seen_names:
                seen_names.add(player["name"])
                all_players.append(player)

    if not all_players:
        print("\nERROR: No players found. The page structure may have changed.")
        print("Open the URL in a browser and inspect the table columns, then")
        print("adjust detect_column_indices() to match the actual headers.")
        sys.exit(1)

    # Sort alphabetically for readability
    all_players.sort(key=lambda p: p["name"])

    print(f"\n  Players scraped: {len(all_players)}")
    print(f"  Missing first_year: {sum(1 for p in all_players if not p['first_year'])}")
    print(f"  Missing last_year:  {sum(1 for p in all_players if not p['last_year'])}")
    print(f"  Missing position:   {sum(1 for p in all_players if not p['position'])}")

    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_players, f, ensure_ascii=False, indent=2)

    print(f"\n  Saved to: {OUTPUT_PATH}")
    print("\nSample (first 3 players):")
    for p in all_players[:3]:
        print(f"  {p}")


if __name__ == "__main__":
    main()
