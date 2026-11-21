# Konzept: Lern-Club

Eine Lern-App für ein Kind in der 5. Klasse (Schweiz, Lehrplan 21). Hauptsprache Deutsch, Englisch und Spanisch als Bonus (Spanisch ist die dritte Sprache des Kindes, ohne regelmässigen Unterricht).
Läuft als Web-App (PWA) auf Tablet und Handy, offline-fähig, ohne Login, ohne Server, ohne Tracking.

## Leitidee

> Schule ist kein Selbstzweck. Wissen ist das, was dich klüger macht als jede Maschine, die du bedienst.

Die App soll nicht predigen. Sie soll **Aha-Momente** erzeugen und das Kind seine **eigenen Gründe** finden lassen.
Das ist der wichtigste Befund aus der Motivationsforschung für dieses Alter (siehe unten).

## Bausteine

| Baustein | Was es ist | Warum |
|---|---|---|
| **Känguru-Antwortbogen** | Offizielle Känguru-PDFs (2022–2026, Stufe 3/4 als Aufwärmen, 5/6) werden nur **verlinkt**. Das Kind löst auf Papier/Tablet und tippt den Lösungsbuchstaben ein. Die App prüft, gibt Punkte und merkt sich den Stand. | Die Aufgaben sind urheberrechtlich geschützt (© Verein Känguru Schweiz). Verlinken ist okay, kopieren nicht. Die Lösungsbuchstaben sind reine Fakten. |
| **Knobel-Werkstatt** | Eigene Aufgaben im Känguru-Stil (Logik, Zahlen, Geometrie), Deutsch und Englisch. | Frei verwendbar, beliebig erweiterbar. |
| **Warum Schule?** | Karten mit wissenschaftlichen Befunden, kindgerecht erzählt, je mit Punchline und einer Frage zum Nachdenken. Antworten landen im Tagebuch. | Utility-Value- und Purpose-Interventionen (Hulleman 2009, Yeager 2014). |
| **Mein Warum (Tagebuch)** | Freies Textfeld. Eltern können es im Elternbereich lesen. Kein KI-Anschluss. | Selbst formulierte Gründe wirken stärker als vorgetragene. |
| **Der Club** | Wissenskarten nach Dietrich Schwanitz' Idee: Allgemeinbildung als «Eintrittskarte». Karten freischalten, Ränge vom «Gast» bis zum «Ehrenmitglied». Jede Karte zeigt, wo man dem Wissen im Alltag, in Games und Filmen begegnet. | Vorwissen macht Verstehen möglich (Recht & Leslie 1988), Matthäus-Effekt (Stanovich 1986). |
| **¡Español!** | Vokabeltrainer (12 Themen, 144 Wörter, Nomen mit Artikel) mit Leitner-Kisten: Erkennen, dann Schreiben. Bildschirmtasten für á é í ó ú ü ñ ¿ ¡. Fehlt nur der Akzent oder der Artikel, gibt es «Fast!» statt «falsch». Dazu 11 Schreibregeln mit Übungen und der Akzent-Detektiv. | Ohne Unterricht fehlt vor allem das Schreiben. Verteiltes Wiederholen (Cepeda 2006) und Abfragen statt Lesen (Roediger & Karpicke 2006). |
| **Sprüche & Redewendungen** | 26 Redewendungen als «Zwillinge» in drei Sprachen, mit wörtlicher Übersetzung (Aha-Effekt: gleiche Weisheit, andere Bilder). Quiz mit drei Fragetypen: Bedeutung, Zwilling in einer anderen Sprache finden, fehlendes Wort. Lieblingssprüche erscheinen als Spruch des Tages. | Sprachvergleich macht Bedeutung bewusst. Eigene Erfahrung dazu aufschreiben verbindet mit dem Leben (Hulleman 2009). |
| **Musik · mCheck** | Stufentest der Aargauer Musikschulen (VAM). Stufe 1–3 nach «mCheck Basiswissen 2024» und Fachausdrucksliste: Notennamen, Notenwerte, Pausen, Taktarten, Vorzeichen, Dur-Tonleiter, Leitton, Moll, Dreiklänge, Intervalle, Enharmonik, Fachausdrücke. Hören: Melodie im Drei-/Fünftonraum nachspielen, Rhythmus nachtippen (mit Einzähler), Intervalle bis zur Quinte, Dur/Moll. Frühere Stufen werden zu 30 % wiederholt. | Abfragen statt Lesen (Roediger & Karpicke 2006), sofortige Rückmeldung mit Notenbild und Klang. |
| **Meine Schulwoche** | Montag: Hausaufgaben melden (Fach, Aufgabe, bis wann), danach abhaken. Freitag: Wochenrückblick mit vier Leitfragen (neu, schwierig, das Beste, sonst). | Schreibanlass mit echtem Bezug. Die gemeldeten Hausaufgaben zeigen, was gerade im Unterricht läuft, und helfen, passende Übungen zu bauen. |
| **Schreib-Zeitreise** | Alles Geschriebene über die Jahre: erster, neuester und längster Text, Wörter pro Monat. Export als lesbare Textdatei. | Fortschritt sichtbar machen stärkt das Kompetenzerleben (Deci & Ryan). |
| **Game-Look** | Stufen und XP, 12 selbst gezeichnete Skins in fünf Seltenheitsstufen, Spind, Siegerbildschirm. Bei schwacher Runde «Gut gekämpft!» statt «Sieg!». | Spiel-Ästhetik, die er aus seiner Freizeit kennt, ohne fremde Figuren. Belohnungen sind kosmetisch und zeigen Fortschritt (siehe unten). |
| **Mitgestalten** | Maskottchen, App-Name und Farbe selbst wählen. Ideen-Box. Rollentausch-Quiz: das Kind erfindet Fragen für die Eltern. | Autonomie (Deci & Ryan), Lernen durch Lehren (Fiorella & Mayer 2013). |
| **Elternbereich** | PIN-geschützt. Tagebuch, Ideen, Känguru-Resultate, Sicherung als Datei. | Begleiten statt kontrollieren. |

## Punkte und Motivation

- Punkte zeigen **Fortschritt**. Sie sind nicht der Grund zu lernen (Überrechtfertigungseffekt, Lepper et al. 1973; Deci, Koestner & Ryan 1999).
- **Sprachen-Bonus ×1.5** für Aufgaben, wenn die App auf Englisch oder Spanisch läuft (Känguru nur auf Englisch, weil es kein spanisches Aufgabenblatt gibt). Nicht mehr, damit Deutsch nicht «zweite Klasse» wirkt.
- **Serie (Streak)** mit **Joker-Tagen**: Ein verpasster Tag zerstört nicht alles. Pro 7 Tage gibt es einen Joker, maximal 2.
- **Zweiter Versuch** bei Fehlern (halbe Punkte), danach wird die Lösung gezeigt. Fehler sind Lerngelegenheiten.
- Keine Ranglisten gegen andere, kein Zeitdruck, keine Push-Nachrichten.

## Wissenschaftliche Grundlage

| Befund | Quelle | Umsetzung |
|---|---|---|
| Jedes zusätzliche Schuljahr erhöht den IQ um ca. 1–5 Punkte. | Ritchie, S. J. & Tucker-Drob, E. M. (2018). How much does education improve intelligence? A meta-analysis. *Psychological Science*, 29(8), 1358–1369. | Karte «Schule ist Gehirn-Training» |
| Schwache Leser mit viel Baseball-Wissen verstanden einen Baseball-Text besser als gute Leser ohne dieses Wissen. | Recht, D. R. & Leslie, L. (1988). Effect of prior knowledge on good and poor readers' memory of text. *Journal of Educational Psychology*, 80(1), 16–20. | Karte «Vorwissen schlägt Talent», Club |
| Wer früh viel weiss und liest, lernt immer schneller dazu, und der Abstand zu den anderen wächst. | Stanovich, K. E. (1986). Matthew effects in reading. *Reading Research Quarterly*, 21(4), 360–407. | Karte «Wissen wächst mit Zinseszins» |
| Mit freiem GPT-4-Zugang lösten Schüler die Übungen besser. Ohne KI schnitten sie danach in der Prüfung ca. 17 % schlechter ab. | Bastani, H. et al. (2025). Generative AI without guardrails can harm learning. *PNAS*, 122(26). | Karte «KI ist ein Verstärker» |
| Lernen, das sich schwer anfühlt, bleibt oft besser hängen («desirable difficulties»). | Bjork, E. L. & Bjork, R. A. (2011). Making things hard on yourself, but in a good way. | Karte «Schwer = Wachstum» |
| Wer einen höheren Zweck fürs Lernen sieht, bleibt auch bei langweiligen Aufgaben länger dran. | Yeager, D. S. et al. (2014). Boring but important. *Journal of Personality and Social Psychology*, 107(4), 559–580. | Karte «Langweilig, aber wichtig», Mein Warum |
| Wer selbst aufschreibt, wie der Stoff mit dem eigenen Leben zusammenhängt, wird interessierter und besser. | Hulleman, C. S. & Harackiewicz, J. M. (2009). Promoting interest and performance in high school science classes. *Science*, 326, 1410–1412. | Nachdenk-Fragen nach jeder Karte |
| Wer Experte wird, übt die Grundlagen gezielt und oft, auch wenn es keinen Spass macht («deliberate practice»). | Ericsson, K. A., Krampe, R. T. & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review*, 100(3), 363–406. | Karte «Profis trainieren das Langweilige» |
| Jugendliche ändern ihr Verhalten eher, wenn es als Widerstand gegen Manipulation gerahmt ist als durch Belehrung. | Bryan, C. J. et al. (2016). Harnessing adolescent values to motivate healthier eating. *PNAS*, 113(39), 10830–10835. | Karte «Wer kontrolliert deine Zeit?» |
| Belohnungen können innere Motivation verdrängen. | Lepper, Greene & Nisbett (1973), *JPSP* 28(1); Deci, Koestner & Ryan (1999), *Psychological Bulletin* 125(6). | Punkte sparsam und als Rückmeldung |
| Sich selbst abfragen und verteilt wiederholen ist die wirksamste Lernmethode. | Roediger & Karpicke (2006), *Psychological Science* 17(3); Cepeda et al. (2006), *Psychological Bulletin* 132(3). | Quiz statt Lesen, Wiederholung |
| Wer etwas erklärt, lernt es selbst besser. | Fiorella, L. & Mayer, R. E. (2013). *Contemporary Educational Psychology*, 38(4), 281–288. | Rollentausch-Quiz |

**Bewusst nicht verwendet:** Marshmallow-Test (Replikation zeigt viel kleinere Effekte, Watts et al. 2018) und starke «Growth Mindset»-Versprechen (kleine Durchschnittseffekte, Sisk et al. 2018).

## Weiterentwicklung mit Rückmeldungen

Die App merkt sich Fehler (was richtig gewesen wäre, was eingegeben wurde). Im Elternbereich lässt sich daraus ein
**Entwicklungsbericht** erzeugen, den die Eltern mit Claude teilen. So entstehen neue Übungen genau dort, wo es hakt.

- Ideen-Box und Lerndaten: immer im Bericht. Er weiss, dass seine Ideen die App formen.
- Tagebuch und «Mein Warum»: nur mit Häkchen, und nur mit seinem Einverständnis. Sonst wird aus einem Ort zum Nachdenken ein Ort, an dem man beobachtet wird.
- Berichte gehören in `feedback/` (per `.gitignore` ausgeschlossen) und nie ins öffentliche Repository.

## Datenschutz

- Alle Daten bleiben im Browser des Geräts (localStorage). Es geht nichts an einen Server.
- Keine Namen nötig: Das Kind wählt einen Spitznamen.
- Das Repository enthält keine persönlichen Daten. Der Elternbereich ist mit PIN geschützt, aber nur gegen neugierige Finger, nicht gegen Technik.
- Keine API-Schlüssel im Code. Falls später KI dazukommt, nur über einen eigenen Proxy mit Limit.

## Ausbau-Ideen

- Weitere Fächer: Französisch- und Englisch-Wörtli mit Wiederholung, Deutsch-Rechtschreibung, NMG.
- Mehr Club-Karten (Ziel: 100 Karten über Geschichte, Kunst, Musik, Wissenschaft, Sprache, Schweiz).
- Zeitstrahl, auf dem freigeschaltete Karten erscheinen.
- KI-Erklärhilfe über einen Proxy (Cloudflare Worker) mit Tageslimit.
