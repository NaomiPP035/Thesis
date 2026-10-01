# Atlas versions

- `map-v1.html`: restored original star map. Its original script, style and diary are kept in `v1/`.
- `map-v2.html`: touch / attention edition using the September 25–30 workbook records. Uses `app.js`, `style.css` and `diary.js`.
- `map.html`: compatibility redirect to V2, retaining query strings and record links.
- Both versions read the existing shared cloud record store; no duplicate database or duplicate saves. V2 shows records tagged Touch. The mobile success screen links to the saved record in either version.

V2 selection changes brightness and size in place. All new and revisited entries use the same 22-second exponential decay time constant; this is a display effect, not a measurement of awareness. Source timestamps remain unchanged. Search uses all query terms, English word prefixes and Chinese substrings, ranked by title, surface and content.
