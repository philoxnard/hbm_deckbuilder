#!/usr/bin/env python3
"""
Simple helper script to fetch pending card updates from Google Sheets.
This script just reports what needs to be updated - the actual updates
are done by Claude Code interactively.
"""

import csv
import json
import re
from io import StringIO
import urllib.request

# Configuration
SPREADSHEET_ID = "1q0OdNYv0d20mDlYu_2NWS38_LNo-qZWsvTmVzRVStC4"
GID = "296437486"
CSV_EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={GID}"

def convert_card_name_to_snake_case(card_name):
    """Convert card name to snake_case format"""
    cleaned = re.sub(r"['\",!():]", "", card_name)
    cleaned = re.sub(r"[\s.]+", "_", cleaned)
    cleaned = cleaned.lower()
    cleaned = re.sub(r"_+", "_", cleaned)
    cleaned = cleaned.strip("_")
    return cleaned

def main():
    print("Fetching spreadsheet data...")

    # Fetch spreadsheet
    with urllib.request.urlopen(CSV_EXPORT_URL) as response:
        csv_data = response.read().decode('utf-8')

    reader = csv.DictReader(StringIO(csv_data))
    rows = list(reader)

    # Load db.json to verify cards exist
    with open('db.json', 'r') as f:
        db = json.load(f)

    # Find cards that need updating
    pending_updates = []

    for i, row in enumerate(rows):
        # Skip rows before row 340 (index 338 since rows start at row 2 in spreadsheet)
        if i < 338:
            continue

        card_name = row.get('Card', '').strip()
        checkbox = row.get('Phil Updated', '').strip()
        image_url = row.get('Link', '').strip()

        # Skip header rows or invalid data
        if not card_name or '/' in card_name or card_name.lower() == 'card':
            continue

        # Skip if already checked
        if checkbox.upper() == 'TRUE':
            continue

        # Skip if no image URL
        if not image_url:
            continue

        # Convert to snake_case and check if exists in db
        snake_case_name = convert_card_name_to_snake_case(card_name)

        if snake_case_name in db:
            pending_updates.append({
                'display_name': card_name,
                'snake_case_name': snake_case_name,
                'image_url': image_url
            })
        else:
            print(f"WARNING: '{card_name}' (snake_case: '{snake_case_name}') not found in db.json")

    # Display results
    print(f"\n{'='*80}")
    print(f"Found {len(pending_updates)} cards that need updating:")
    print(f"{'='*80}\n")

    for i, card in enumerate(pending_updates, 1):
        print(f"{i}. {card['display_name']}")
        print(f"   Snake case: {card['snake_case_name']}")
        print(f"   Image URL: {card['image_url']}")
        print()

    # Save to JSON for easy access
    with open('pending_updates.json', 'w') as f:
        json.dump(pending_updates, f, indent=2)

    print(f"Saved pending updates to: pending_updates.json")
    print(f"\nTo update these cards, run: Tell Claude Code to 'update the pending cards'")

if __name__ == "__main__":
    main()
