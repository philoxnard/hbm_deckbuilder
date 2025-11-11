# Card Update Workflow

This document explains how to update cards from the Google Spreadsheet into `db.json` using Claude Code.

## Quick Start

When you want to update cards from the spreadsheet, just tell Claude Code:

```
"Update the cards from the spreadsheet"
```

That's it! Claude Code will:
1. Fetch the Google Spreadsheet data
2. Identify which cards need updating (where "Phil Updated" is FALSE)
3. Read each card image to extract effect text and firepower
4. Update `db.json` with the new data
5. Add "experimental" to each card's pirate_types
6. Increment the version number
7. Provide you a summary of changes

After Claude Code is done, you can:
- Review the changes with `git diff`
- Commit the changes
- Push to GitHub
- Deploy to AWS

## Manual Process (Optional)

If you prefer more control, you can use the helper script:

### Step 1: Check for pending updates

```bash
python3 fetch_updates.py
```

This will show you all cards that need updating and save them to `pending_updates.json`.

### Step 2: Ask Claude Code to process them

```
"Process the pending card updates from pending_updates.json"
```

## What Claude Code Does

When you ask Claude Code to update cards, it:

1. **Fetches spreadsheet data** from:
   - URL: `https://docs.google.com/spreadsheets/d/1q0OdNYv0d20mDlYu_2NWS38_LNo-qZWsvTmVzRVStC4/edit#gid=296437486`
   - Reads columns: Card Name, Phil Updated (checkbox), Link (image URL)

2. **Filters for unchecked cards**:
   - Skips rows where "Phil Updated" = TRUE
   - Skips rows without image URLs
   - Skips header rows

3. **For each card**:
   - Converts card name to snake_case (e.g., "Sword Beast" → "sword_beast")
   - Verifies the card exists in db.json
   - Fetches the card image from the URL
   - Reads the image to extract:
     - **Effect text**: The rules text in the bottom half of the card
     - **Firepower**: The number in the bottom right corner (if present)
   - Updates the card in db.json:
     - `FaceURL` = image URL from spreadsheet
     - `effect_text` = extracted text
     - `firepower` = extracted number (or unchanged if not present)
     - Adds "experimental" to `pirate_types` list

4. **After all cards are processed**:
   - Saves updated db.json
   - Increments version number in version.txt (e.g., 2.4.7 → 2.4.8)
   - Provides summary of changes

## Deploying Updates

After Claude Code has updated the files locally:

### 1. Review Changes

```bash
git status
git diff db.json
git diff version.txt
```

### 2. Commit Changes

```bash
git add db.json version.txt
git commit -m "Updated X cards to version 2.4.X"
```

### 3. Push to GitHub

```bash
git push
```

### 4. Deploy to AWS

SSH into your AWS server:

```bash
ssh your-aws-server
cd /path/to/hbm_deckbuilder
git pull
sudo systemctl restart hbm_deckbuilder
```

## Troubleshooting

### "Card not found in db.json"

The card name in the spreadsheet doesn't match any key in db.json. Check:
- The exact spelling in the spreadsheet
- The snake_case conversion is correct
- The card actually exists in db.json

Claude Code will log these warnings and skip those cards.

### "Can't read effect text from image"

The image might be:
- Corrupted or invalid
- Not loading properly
- In an unexpected format

Claude Code will report these errors and you can manually fix them.

### "Image URL is empty"

The "Link" column in the spreadsheet is empty for that card. Add the image URL in the spreadsheet first.

## Files Modified

When you run an update, these files change:

- `db.json` - Card database with updated FaceURL, effect_text, firepower, and pirate_types
- `version.txt` - Version number incremented
- `pending_updates.json` - (Optional) List of pending cards from fetch_updates.py

## Spreadsheet Column Mapping

- **Column A (Card)**: Display name of the card
- **Column B (Carson Uploaded)**: Unused by this workflow
- **Column C (Phil Updated)**: Checkbox - FALSE means needs updating, TRUE means already processed
- **Column D (Link)**: URL to the card image

## Notes

- The spreadsheet must be set to "Anyone with the link can view" for the script to access it
- Updates happen locally on your machine, not on AWS
- You control when to commit and deploy changes
- No API costs - Claude Code (me!) reads the images for free while helping you
- The "Phil Updated" checkboxes in the spreadsheet are NOT automatically checked - you'll need to do that manually after confirming the updates look good
