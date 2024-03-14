# Youtube exact upload

Adds the time to the upload timestamp below the video.

## Infos

Die time update can take up to 5 seconds (when the website is loaded, a request is made to the YouTube Data API v3 and its value is then set).

The formats of the constants in the source code need to be checked and possibly adjusted (default values in quotes):

- DATE_PATTERN: "DD.MM.YYYY" Example: 27.03.2021.
- TIME_PATTERN: "HH:mm:ss" Example: 22:00:00
- DATETIME_COMBINE_PATTERN: " [at] "
- SCHEDULED_LIVESTREAM_START: "Livestream scheduled for: "
- SCHEDULED_PREMIERE_START: "Premiere scheduled for: "
- ONGOING_LIVESTREAM_START: "Active Livestream since "
- ONGOING_PREMIERE_START: "Active Premiere since "
- ENDED_LIVESTREAM_START: "Livestream from "
- ENDED_PREMIERE_START: "Premiere from "
- DATETIME_UNTIL_PATTERN: " until "
- SINCE: "Since"
- TODAY_AT: "Today at "
- AGE_RESTRICTED: " - FSK 18";
- SHOW_REFRESH: true;
- REFRESH_TIMESTAMP: "⟳";
- SHOW_UNDERLINE_ON_TIMESTAMP: false;
- YT_API_KEY: "YouTube API-Key"

For the first 3 constants, square brackets must be around for text that should not be formatted.

In the counter of active livestream or premieres, days are appended in front, if the livestream goes over 24 hours (two or more digits).

The API key must be created at https://console.developers.google.com/ and entered into the YT_API_KEY constant in the script (YouTube Data API v3).

### Known Bugs

If a livestream or a premiere changes from scheduled to active or from active to finished, the script does not get it (If someone knows how I get the change or in which yt-event you could listen there, I could include it).
