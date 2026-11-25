# Versionierung

Schema: **Major.Minor.Patch** (zum Beispiel `v1.10.0`). Die Nummer steht in `index.html` als `const VERSION`.

| Stelle | Wann erhöhen | Beispiel |
|---|---|---|
| Major | Mehrere neue Features zusammen, ein großer Schritt. Minor und Patch fangen wieder bei 0 an. | v2.0.0 |
| Minor | Ein einzelnes neues Feature oder ein größerer neuer Bildschirm. Patch fängt wieder bei 0 an. | v1.11.0 |
| Patch | Bugfixes, Balancing und Verhaltensanpassungen. | v1.10.1 |

Regeln:
- Der Commit-Text beginnt mit der vollen Nummer, zum Beispiel `v1.10.1: Bogenmeister springt seltener`.
- Bis v1.25 (alt) zählte jede Änderung die Minor-Stelle hoch. Das neue Schema beginnt mit v1.10.0.
