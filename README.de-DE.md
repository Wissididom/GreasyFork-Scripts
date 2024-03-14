# YouTube exakter Hochladezeitpunkt

Fügt die Uhrzeit zum Hochladezeitpunkt unter dem Video hinzu.

## Infos

Die Aktualisierung der Zeit kann bis zu 5 Sekunden dauern (Wenn die Website geladen wurde wird eine Anfrage an die YouTube Data API v3 gestellt und dessen Wert dann gesetzt).

Die Formate der Konstanten im Quellcode müssen geprüft und möglicherweise angepasst werden (Standardwerte in Anführungsstrichen):

- DATE_PATTERN: "DD.MM.YYYY" Beispiel: 27.03.2021
- TIME_PATTERN: "HH:mm:ss [Uhr]" Beispiel: 22:00:00 Uhr
- DATETIME_COMBINE_PATTERN: " [um] "
- SCHEDULED_LIVESTREAM_START: "Livestream geplant für: "
- SCHEDULED_PREMIERE_START: "Premiere geplant für: "
- ONGOING_LIVESTREAM_START: "Aktiver Livestream seit "
- ONGOING_PREMIERE_START: "Aktive Premiere seit "
- ENDED_LIVESTREAM_START: "Livestream von "
- ENDED_PREMIERE_START: "Premiere von "
- DATETIME_UNTIL_PATTERN: " bis "
- SINCE: "Seit"
- TODAY_AT: "Heute um "
- AGE_RESTRICTED: " - FSK 18";
- SHOW_REFRESH: true;
- REFRESH_TIMESTAMP: "⟳";
- SHOW_UNDERLINE_ON_TIMESTAMP: false;
- YT_API_KEY: "YouTube API-Key"

Bei den ersten 3 Konstanten müssen bei Text, der nicht formatiert werden soll, eckige Klammern herum.

Bei dem Counter von aktiven Livestream bzw. Premieren werden Tage vorne angehängt, wenn der Livestream schon über 24 Stunden geht (zwei- oder mehrstellig).

Der API-Key muss unter https://console.developers.google.com/ angelegt werden und in die Konstante YT_API_KEY in dem Skript eingetragen werden (YouTube Data API v3).

### Bekannte Bugs

Wenn ein Livestream oder eine Premiere von Geplant auf Aktiv oder von Aktiv auf Beendet wechselt bekommt das Skript es nicht mit (Falls jemand weiß, wie ich den Wechsel mitbekomme bzw. auf welches yt-Event man da hören könnte, könnte ich es einbauen).
