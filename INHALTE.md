# Inhalte erneuern

Irgendwann ist ein Modul durchgespielt. Diese Anleitung zeigt, wie neue Inhalte dazukommen,
**ohne dass Fortschritt verloren geht**, und wie das Kind merkt, dass es Nachschub gibt.

## So erkennt man, dass ein Modul Nachschub braucht

- Auf der Kachel steht der Fortschritt, zum Beispiel «✅ 7/9». Ist alles erledigt, steht dort
  «🏁 Alles geschafft – Nachschub folgt!».
- Im **Entwicklungsbericht** (Elternbereich) steht unter «Abwechslung» die Zeile
  «Inhalte erledigt», zum Beispiel `warum 9/9 · kg 3/10 · karten 2/2`.

## So merkt das Kind den Nachschub

Neue Inhalte bekommen automatisch ein **NEU!**-Abzeichen:

- auf der Modul-Kachel (Startbildschirm und «Lernen»), solange es im Modul Neues gibt,
- in der Liste des Moduls neben jedem neuen Eintrag, beim ersten Öffnen der Liste.

Danach gilt der Eintrag als gesehen. Wer die App zum ersten Mal startet, sieht kein NEU!,
denn dort ist ja alles neu.

## Die eine goldene Regel: Kennungen (`id`) nie ändern

Jeder Eintrag hat eine feste `id` (zum Beispiel `w3`, `p07`, `c12`, `2026-56`, `ag`).
Daran hängen Fortschritt, Punkte und das Geschriebene des Kindes.

- **Neue Einträge bekommen eine neue, noch nie benutzte `id`.** Am besten fortlaufend: `w10`, `w11` …
- Texte eines Eintrags dürfen jederzeit verbessert werden, solange die `id` bleibt.
- Einträge **nicht löschen**, wenn das Kind sie schon bearbeitet hat. Sein Geschriebenes bleibt zwar erhalten,
  aber der Bezug geht verloren.
- **Ausnahme Spanisch-Vokabeln:** Hier zählt die Position im Thema (`escuela:0`, `escuela:1` …).
  Neue Wörter deshalb **nur ans Ende** eines Themas setzen, nie dazwischen. Neue Themen sind jederzeit möglich.

## Wo was liegt

| Modul | Datei | Neuer Eintrag |
|---|---|---|
| Warum Schule? | `data/warum.js` (`WARUM`) | neue Karte mit `id`, Titel, Punchline, Geschichte, Quelle, Schreibfrage |
| Spruch des Tages | `data/warum.js` (`PUNCHLINES`) | eine Zeile in die Listen `de` und `en`, die spanische in `data/inhalte-es.js` |
| Känguru | `data/kaenguru.js` | neuer Jahrgang: `id` wie `2027-56`, Links zu den PDFs, Lösungsbuchstaben |
| Knobel-Werkstatt | `data/puzzles.js` | neues Rätsel mit `id` `p16`, `p17` … |
| Der Club | `data/club.js` | neue Karte mit `id` `c15` … und Kategorie |
| Sprüche | `data/sprueche.js` | neuer Spruch mit `id` (Wort wie `fliegen`) in allen drei Sprachen |
| Español | `data/spanisch.js` | neues Thema in `ES_VOCAB`, neue Regel in `ES_RULES`, Akzentwörter in `ES_ACCENT` |
| Karten-Quiz | `tools/build_karten.py` | siehe unten |
| Mathe · Item-Shop | `data/mathe.js` | neues Item in `ITEMS` (Emoji, Preisspanne, Namen in drei Sprachen); Aufgaben werden erzeugt |
| Musik | `data/musik.js` | Fragen werden erzeugt; neue Stufen brauchen Programmierarbeit |

### Drei Sprachen

Texte stehen als `{ de: "…", en: "…" }`. Die spanischen Übersetzungen der Warum-, Rätsel- und
Club-Karten liegen gesammelt in `data/inhalte-es.js` (gleiche `id`). Fehlt eine Übersetzung,
zeigt die App den deutschen Text. Kaputt geht also nichts, es fällt aber auf.

## Neue Karte im Karten-Quiz

Die Kartenumrisse werden aus den offenen Daten von swisstopo berechnet:

1. In `tools/build_karten.py` in der Liste `KARTEN` einen Eintrag ergänzen, zum Beispiel
   die Nachbarkantone des Aargaus:
   ```python
   {
       "key": "nachbarn", "kind": "cantons", "ids": [19, 1, 2, 11, 13, 3, 9], "width": 600,
       "title": {"de": "Aargau und Nachbarn", "en": "Aargau and neighbours", "es": "Argovia y vecinos"},
   },
   ```
   `kind: "cantons"` nimmt Kantone (BFS-Nummer 1–26), `kind: "districts"` die Bezirke eines Kantons
   über die BFS-Gemeindenummern (Beispiel: der Eintrag `ag`).
2. Im Projektordner `python tools/build_karten.py` ausführen. Das erzeugt `data/karten.js` neu.
3. Die App zeigt die neue Karte automatisch an, mit NEU!-Abzeichen.

Für ganz neue Kartentypen (zum Beispiel Gemeinden mit Namen, Flüsse) muss das Skript erweitert werden.

## Veröffentlichen

1. In `sw.js` die `VERSION` um eins erhöhen (`lernclub-v10` → `lernclub-v11`).
   Sonst laden installierte Apps die neuen Dateien nicht.
2. Lokal kurz testen (`python -m http.server 8080`).
3. Committen und auf `main` pushen. GitHub Pages ist nach ein bis zwei Minuten aktuell.
