# Audio in Left Behind

Das Spiel bringt für **alle** Klänge eingebaute Synthesizer-Versionen mit. Du kannst jeden
einzelnen davon durch eine eigene Datei ersetzen. Was du nicht ersetzt, bleibt wie es ist.

## So tauschst du etwas aus

1. Lege deine Datei (`.mp3`, `.ogg` oder `.wav`) in diesen Ordner `audio/`.
2. Nenne sie genau wie die ID aus der Tabelle unten, zum Beispiel `shoot_crossbow.wav`.
3. Trage den Dateinamen in `audio/config.js` in die Liste `CUSTOM_AUDIO` ein.
4. Seite neu laden (F5).

Hinweise:
- Soundeffekte sollten kurz sein (meist unter 1 Sekunde) und ohne Stille am Anfang.
- Musik wird in einer Schleife abgespielt. Mach das Ende nahtlos zum Anfang.
- Lautstärke wird im Spiel gedrosselt (Effekte 70 %, Musik 50 %). Pegel also nicht zu leise anlegen.
- Mit **M** schaltest du die Musik, mit **N** die Effekte an und aus.

## Musik

| ID | Wann |
|----|------|
| `music_menu` | Hauptmenü, Charakterwahl, Kartenbuch, Bibliothek, Packöffnung, Recycling |
| `music_run` | Im Durchlauf (auch bei Pause und Kartenwahl). Die eingebaute Version wird dichter, wenn Gegner dich jagen. |
| `music_merchant` | Beim Händler am Lagerfeuer |

## Soundeffekte

| ID | Wann |
|----|------|
| `ui_click` | Klick auf Knöpfe und Menüpunkte |
| `card_pick` | Karte in der Kartenwahl gewählt |
| `stage_up` | Neue Stufe erreicht, Kartenwahl öffnet sich |
| `card_flip` | Karte aus einem Pack umgedreht |
| `rare_reveal` | Seltene Karte (Mondstein oder besser) aufgedeckt |
| `pack_buy` | Kartenpack gekauft |
| `coin` | Kauf beim Händler, Recycling |
| `buff_drink` | Trank vom Händler gekauft |
| `merchant_open` | Händler angesprochen |
| `shoot_crossbow` | Waldläufer schießt |
| `reload_start` | Waldläufer beginnt zu spannen |
| `reload_done` | Spannen fertig |
| `empty_click` | Abdrücken ohne Bolzen oder Mana |
| `shoot_spell` | Magier wirkt einen Zauber |
| `spell_explode` | Zauber explodiert |
| `sword_swing` | Ritter schwingt das Schwert |
| `sword_hit` | Schwert trifft einen Gegner |
| `block` | Schild oder Schwert wehrt einen Treffer ab |
| `hit_enemy` | Gegner wird getroffen |
| `enemy_die` | Gegner stirbt |
| `enemy_shoot` | Skelett schießt (wird mit der Entfernung leiser) |
| `player_hurt` | Du wirst getroffen |
| `player_die` | Du stirbst |
| `dash` | Windstoß |
| `pickup_heal` | Heiltrank aufgesammelt |
| `horde_horn` | Eine Horde bricht aus dem Wald |

Ein Beispiel für `audio/config.js`:

```js
window.CUSTOM_AUDIO = [
  'shoot_crossbow.wav',
  'sword_swing.ogg',
  'music_run.mp3',
];
```
