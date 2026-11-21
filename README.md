# 🦘 Lern-Club

Eine kleine, werbefreie Lern-App für Kinder der 5. Klasse (Schweiz, Lehrplan 21).
Deutsch, Englisch und Spanisch, läuft auf Tablet und Handy, auch offline.

- **Känguru-Antwortbogen:** offizielle Känguru-Aufgaben 2022–2026 (Stufen 3/4 und 5/6) lösen und den Lösungsbuchstaben eintippen
- **Knobel-Werkstatt:** eigene Rätsel im Känguru-Stil
- **Warum Schule?** Befunde aus der Lern- und Motivationsforschung, kindgerecht erzählt
- **Der Club:** Allgemeinbildung als Sammelkarten, mit Rängen vom Gast bis zum Ehrenmitglied
- **Sprüche & Redewendungen:** 26 Weisheiten als Zwillinge in Deutsch, Englisch und Spanisch, mit wörtlicher Übersetzung und Quiz
- **¡Español!** (Basis: Venezuela) Vokabeltrainer mit Wiederholungs-Kisten, Schreibregeln (Tilde, ñ, ¿¡) und Akzent-Detektiv
- **Musik · mCheck:** Vorbereitung auf den Stufentest der Aargauer Musikschulen (VAM), Stufe 1–3: Basiswissen-Quiz mit Notenbild, Melodie und Rhythmus nachspielen, Intervalle und Dur/Moll hören (Töne werden im Browser erzeugt)
- **Karten-Quiz (NMG):** Bezirke im Aargau und Kantone der Schweiz entdecken, finden und benennen, mit Bestzeit
- **Meine Schulwoche:** montags Hausaufgaben melden (mit Abhak-Liste), freitags Wochenrückblick schreiben
- **Schreib-Zeitreise:** alles Geschriebene über Jahre, mit erstem/neuestem/längstem Text und Wörtern pro Monat
- **Tagesmissionen & Fokus der Woche:** jeden Tag drei Aufträge aus verschiedenen Modulen (bevorzugt lange nicht geübte) mit Bonus-Kiste; die Eltern können ein Modul mit doppelten XP hervorheben
- **Game-Look:** Stufen (100 XP pro Stufe), 12 eigene Avatar-Skins mit Seltenheitsstufen, Spind, Siegerbildschirm
- **Mein Warum, Rollentausch-Quiz, Ideen-Box** und ein **Elternbereich** mit PIN

Das pädagogische Konzept und alle Quellen stehen in [KONZEPT.md](KONZEPT.md).

## Datenschutz

Kein Login, kein Server, kein Tracking. Alle Eingaben bleiben im Browser des Geräts (localStorage).
Im Elternbereich lässt sich eine Sicherung als Datei herunterladen.

## Starten

Es gibt keinen Build-Schritt. Lokal reicht ein beliebiger statischer Webserver:

```bash
python -m http.server 8080
```

Danach http://localhost:8080 öffnen. Online läuft die App über **GitHub Pages**
(Settings → Pages → Branch `main`, Ordner `/`).
Auf dem Tablet: Seite öffnen → «Zum Home-Bildschirm hinzufügen».

## Inhalte erweitern

Alle Inhalte liegen als einfache JavaScript-Dateien in `data/`:

| Datei | Inhalt |
|---|---|
| `data/puzzles.js` | Knobelaufgaben (Frage, Optionen, Lösung, Erklärung) |
| `data/warum.js` | «Warum Schule?»-Karten und Sprüche des Tages |
| `data/club.js` | Club-Wissenskarten |
| `data/spanisch.js` | Spanisch-Vokabeln, Schreibregeln und Akzentwörter |
| `data/inhalte-es.js` | Spanische Übersetzungen der Rätsel, Warum-Karten und Club-Karten |
| `data/sprueche.js` | Redewendungen in drei Sprachen |
| `data/skins.js` | Eigene Avatar-Skins (SVG, selbst gezeichnet) und Seltenheitsfarben |
| `data/musik.js` | mCheck: Fachausdrücke, Fragen-Generatoren, Hörübungen |
| `js/notation.js` | Notenbild (SVG) und Klang (Web Audio) |
| `data/karten.js` | Kartenumrisse, erzeugt mit `tools/build_karten.py` aus swisstopo-Daten |
| `data/kaenguru.js` | Links und Lösungsbuchstaben der Känguru-Tests |

Nach Änderungen in `sw.js` die `VERSION` erhöhen, damit installierte Apps das Update laden.

**Inhalte erneuern** (neue Karten, Rätsel, Sprüche, Karten fürs Karten-Quiz): siehe [INHALTE.md](INHALTE.md).

## Weiterentwicklung mit Rückmeldungen

Im Elternbereich gibt es einen **Entwicklungsbericht** (Markdown). Er enthält Fortschritt, Fehlermuster
(z. B. häufige Spanisch-Fehler), die Ideen-Box und nur auf Wunsch das Tagebuch. Namen enthält er keine.
Berichte gehören in den Ordner `feedback/`, der per `.gitignore` nie veröffentlicht wird.

## Langzeit-Archiv

Die Daten liegen im Browser. Damit sie Jahre überdauern: im Elternbereich **monatlich** die Sicherung
(JSON) und das **Schreib-Archiv** (lesbare Textdatei) herunterladen und ausserhalb des Repositorys aufbewahren.
Die App erinnert daran, wenn die letzte Sicherung über 30 Tage her ist.

## Rechtliches

- Code: MIT-Lizenz (siehe [LICENSE](LICENSE)).
- Die **Känguru-Aufgaben** sind urheberrechtlich geschützt (© Verein Känguru Schweiz).
  Die App verlinkt nur auf die offiziellen PDFs unter https://www.kaenguru-schweiz.ch/wettbewerb/aufgaben-archiv/
  und speichert lediglich die öffentlich publizierten Lösungsbuchstaben.
  Dieses Projekt steht in keiner Verbindung zum Verein Känguru Schweiz.
- **mCheck** ist der Stufentest des Verbands Aargauer Musikschulen (VAM). Die Übungen sind selbst erstellt und
  folgen den öffentlich beschriebenen Themen (https://vam-ag.ch/mcheck/basiswissen/). Keine Verbindung zum VAM.
- **Kartendaten:** © swisstopo (swissBOUNDARIES3D, frei nutzbar als Open Government Data), bezogen über das
  npm-Paket [swiss-maps](https://github.com/interactivethings/swiss-maps) (BSD-3-Clause) und für die App vereinfacht.
- Der Game-Look ist eigenständig gestaltet (eigene Figuren, Farben, Begriffe). Es werden keine Figuren, Logos
  oder Namen aus kommerziellen Spielen verwendet.
