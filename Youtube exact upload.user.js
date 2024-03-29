// ==UserScript==
// @name           Youtube exact upload
// @name:de        YouTube exakter Hochladezeitpunkt
// @description    Adds exact upload time to youtube videos
// @description:de Fügt YouTube-Videos den exakten Hochladezeitpunkt mit Uhrzeit hinzu
// @require        https://cdnjs.cloudflare.com/ajax/libs/luxon/3.4.4/luxon.min.js
// @version        0.18
// @match          https://www.youtube.com/*
// @grant          none
// @namespace      https://greasyfork.org/users/94906
// @license        MIT
// @downloadURL    https://update.greasyfork.org/scripts/424068/Youtube%20exact%20upload.user.js
// @updateURL      https://update.greasyfork.org/scripts/424068/Youtube%20exact%20upload.meta.js
// ==/UserScript==

// luxon is for formatting and comparing dates and times

(function () {
  "use strict";
  console.log("YT EXACT UPLOAD LOADED");
  //Pre-Define Variables to prevent warning of redaclaration of variables
  var DATE_PATTERN,
    TIME_PATTERN,
    DATETIME_COMBINE_PATTERN,
    SCHEDULED_LIVESTREAM_START,
    SCHEDULED_PREMIERE_START,
    ONGOING_LIVESTREAM_START;
  var ONGOING_PREMIERE_START,
    ENDED_LIVESTREAM_START,
    ENDED_PREMIERE_START,
    DATETIME_UNTIL_PATTERN,
    SINCE,
    TODAY_AT;
  var YT_API_KEY = "YouTube API-Key";
  var AGE_RESTRICTED = " - FSK 18";
  var SHOW_REFRESH = true;
  var REFRESH_TIMESTAMP = "&#10227;";
  var SHOW_UNDERLINE_ON_TIMESTAMP = false;
  var BASE_URL =
    "https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,contentDetails,localizations,player,statistics,status&key=" +
    YT_API_KEY;
  var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
  luxon.Settings.defaultLocale = lang;
  if (lang.startsWith("de")) {
    DATE_PATTERN = "dd.MM.yyyy"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    TIME_PATTERN = "HH:mm:ss 'Uhr'"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    DATETIME_COMBINE_PATTERN = " 'um' "; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    SCHEDULED_LIVESTREAM_START = "Livestream geplant für: ";
    SCHEDULED_PREMIERE_START = "Premiere geplant für: ";
    ONGOING_LIVESTREAM_START = "Aktiver Livestream seit ";
    ONGOING_PREMIERE_START = "Aktive Premiere seit ";
    ENDED_LIVESTREAM_START = "Livestream von ";
    ENDED_PREMIERE_START = "Premiere von ";
    DATETIME_UNTIL_PATTERN = " bis ";
    SINCE = "Seit";
    TODAY_AT = "Heute um ";
  } else if (lang.startsWith("fr")) {
    DATE_PATTERN = "dd MMMM yyyy"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    TIME_PATTERN = "HH:mm:ss"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    DATETIME_COMBINE_PATTERN = " 'de' "; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    SCHEDULED_LIVESTREAM_START = "Direct planifié pour le ";
    SCHEDULED_PREMIERE_START = "Première planifiée pour le ";
    ONGOING_LIVESTREAM_START = "Direct en cours depuis ";
    ONGOING_PREMIERE_START = "Première en cours depuis ";
    ENDED_LIVESTREAM_START = "Direct diffusé le ";
    ENDED_PREMIERE_START = "Première diffusée le ";
    DATETIME_UNTIL_PATTERN = " à ";
    SINCE = "Depuis";
    TODAY_AT = "Aujourd'hui à ";
  } else if (lang.startsWith("it")) {
    DATE_PATTERN = "dd MMMM yyyy"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    TIME_PATTERN = "HH:mm:ss"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    DATETIME_COMBINE_PATTERN = " 'alle' "; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    SCHEDULED_LIVESTREAM_START = "Diretta pianificata per il: ";
    SCHEDULED_PREMIERE_START = "Premiere pianificata per il: ";
    ONGOING_LIVESTREAM_START = "Diretta attiva dalle ";
    ONGOING_PREMIERE_START = "Premiere attiva dalle ";
    ENDED_LIVESTREAM_START = "Diretta del ";
    ENDED_PREMIERE_START = " Premiere del ";
    DATETIME_UNTIL_PATTERN = " fino ";
    SINCE = "Dalle";
    TODAY_AT = "Oggi alle ";
  } else {
    DATE_PATTERN = "dd.MM.yyyy"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    TIME_PATTERN = "HH:mm:ss"; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    DATETIME_COMBINE_PATTERN = " 'at' "; // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    SCHEDULED_LIVESTREAM_START = "Livestream scheduled for: ";
    SCHEDULED_PREMIERE_START = "Premiere scheduled for: ";
    ONGOING_LIVESTREAM_START = "Active Livestream since ";
    ONGOING_PREMIERE_START = "Active Premiere since ";
    ENDED_LIVESTREAM_START = "Livestream from ";
    ENDED_PREMIERE_START = "Premiere from ";
    DATETIME_UNTIL_PATTERN = " until ";
    SINCE = "Since";
    TODAY_AT = "Today at ";
  }
  var interval = null;
  var changeCheckTimer = null;
  var currentVideoId = null;
  function genUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("v") != null) {
      return BASE_URL + "&id=" + urlParams.get("v");
    } else {
      return "";
    }
  }
  function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  function formatMilliseconds(
    milliseconds,
    joinString,
    showDays,
    showHours,
    showMinutes,
    showSeconds,
    showMilliseconds,
    pad,
    hideDaysOnNull,
  ) {
    let result = "";
    let days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    let seconds = Math.floor((milliseconds / 1000) % 60);
    milliseconds = milliseconds % 1000;
    if (showDays) {
      if (days < 1 && hideDaysOnNull) {
      } else {
        if (result != "") result += joinString;
        if (pad) {
          if (days < 10) result += "0" + days;
          else result += days;
        } else result += days;
      }
    }
    if (showHours) {
      if (result != "") result += joinString;
      if (pad) result += ("0" + hours).slice(-2);
      else result += hours;
    }
    if (showMinutes) {
      if (result != "") result += joinString;
      if (pad) result += ("0" + minutes).slice(-2);
      else result += minutes;
    }
    if (showSeconds) {
      if (result != "") result += joinString;
      if (pad) result += ("0" + seconds).slice(-2);
      else result += seconds;
    }
    if (showMilliseconds) {
      if (result != "") result += joinString;
      if (pad) result += ("00" + milliseconds).slice(-3);
      else result += milliseconds;
    }
    return result;
  }
  function updateOngoing(startTime) {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    interval = setInterval(function () {
      let durationInMilliseconds = luxon.Interval.fromDateTimes(
        startTime,
        luxon.DateTime.now(),
      ).length("milliseconds");
      var ongoingVideoDuration = document.getElementById(
        "ongoing-video-duration",
      );
      ongoingVideoDuration.innerHTML = formatMilliseconds(
        durationInMilliseconds,
        ":",
        true,
        true,
        true,
        true,
        false,
        true,
        true,
      );
      if (ongoingVideoDuration.parentNode) {
        ongoingVideoDuration.parentNode.title =
          ongoingVideoDuration.parentNode.innerText;
      }
    }, 500);
  }
  async function updateLiveContent(premiere, livestream, data, dt) {
    var element = null;
    while (!element) {
      element = document.getElementById("primary-inner");
      await sleep(200);
    }
    var durationInMilliseconds = null;
    var ongoing = false;
    var innerHTML = "";
    if (!premiere && !livestream) {
      // normal video
      if (dt.hasSame(luxon.DateTime.now(), "day"))
        // today
        innerHTML += TODAY_AT + dt.toFormat(TIME_PATTERN);
      else
        innerHTML += dt.toFormat(
          DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
        );
    } else {
      if (!data.items[0].liveStreamingDetails.actualStartTime) {
        // planned
        dt = luxon.DateTime.fromISO(
          data.items[0].liveStreamingDetails.scheduledStartTime,
        );
        if (dt.hasSame(luxon.DateTime.now(), "day")) {
          // today
          if (livestream)
            innerHTML += SCHEDULED_LIVESTREAM_START + dt.toFormat(TIME_PATTERN);
          else if (premiere)
            innerHTML += SCHEDULED_PREMIERE_START + dt.toFormat(TIME_PATTERN);
          else innerHTML += TODAY_AT + dt.toFormat(TIME_PATTERN);
        } else {
          if (livestream)
            innerHTML +=
              SCHEDULED_LIVESTREAM_START +
              dt.toFormat(
                DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
              );
          else if (premiere)
            innerHTML +=
              SCHEDULED_PREMIERE_START +
              dt.toFormat(
                DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
              );
          else
            innerHTML +=
              TODAY_AT +
              dt.toFormat(
                DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
              );
        }
      } else {
        // ongoing / ended
        dt = luxon.DateTime.fromISO(
          data.items[0].liveStreamingDetails.actualStartTime,
        );
        var endTime = null;
        if (data.items[0].liveStreamingDetails.actualEndTime)
          endTime = luxon.DateTime.fromISO(
            data.items[0].liveStreamingDetails.actualEndTime,
          );
        if (endTime == null) {
          // ongoing
          ongoing = true;
          durationInMilliseconds = luxon.Interval.fromDateTimes(
            dt,
            luxon.DateTime.now(),
          ).length("milliseconds");
          if (dt.hasSame(luxon.DateTime.now(), "day")) {
            // today
            if (livestream)
              innerHTML +=
                ONGOING_LIVESTREAM_START +
                dt.toFormat(TIME_PATTERN) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
            else if (premiere)
              innerHTML +=
                ONGOING_PREMIERE_START +
                dt.toFormat(TIME_PATTERN) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
            else
              innerHTML +=
                SINCE +
                " " +
                dt.toFormat(TIME_PATTERN) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
          } else {
            if (livestream)
              innerHTML +=
                ONGOING_LIVESTREAM_START +
                dt.toFormat(
                  DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                ) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
            else if (premiere)
              innerHTML +=
                ONGOING_PREMIERE_START +
                dt.toFormat(
                  DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                ) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
            else
              innerHTML +=
                SINCE +
                " " +
                dt.toFormat(
                  DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                ) +
                ' (<span id="ongoing-video-duration">' +
                formatMilliseconds(
                  durationInMilliseconds,
                  ":",
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                ) +
                "</span>)";
          }
        } else {
          // ended
          if (dt.hasSame(endTime, "day")) {
            // start date and end date are the same
            if (dt.hasSame(luxon.DateTime.now(), "day")) {
              // today
              if (livestream)
                innerHTML +=
                  ENDED_LIVESTREAM_START +
                  dt.toFormat(TIME_PATTERN) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(TIME_PATTERN);
              else if (premiere)
                innerHTML +=
                  ENDED_PREMIERE_START +
                  dt.toFormat(TIME_PATTERN) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(TIME_PATTERN);
              else innerHTML += TODAY_AT + dt.toFormat(TIME_PATTERN);
            } else {
              if (livestream)
                innerHTML +=
                  ENDED_LIVESTREAM_START +
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(TIME_PATTERN);
              else if (premiere)
                innerHTML +=
                  ENDED_PREMIERE_START +
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(TIME_PATTERN);
              else
                innerHTML +=
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(TIME_PATTERN);
            }
          } else {
            if (dt.hasSame(luxon.DateTime.now(), "day")) {
              // today
              if (livestream)
                innerHTML +=
                  ENDED_LIVESTREAM_START +
                  dt.toFormat(TIME_PATTERN) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
              else if (premiere)
                innerHTML +=
                  ENDED_PREMIERE_START +
                  dt.toFormat(TIME_PATTERN) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
              else
                innerHTML +=
                  TODAY_AT +
                  dt.toFormat(TIME_PATTERN) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
            } else {
              if (livestream)
                innerHTML +=
                  ENDED_LIVESTREAM_START +
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
              else if (premiere)
                innerHTML +=
                  ENDED_PREMIERE_START +
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
              else
                innerHTML +=
                  dt.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  ) +
                  DATETIME_UNTIL_PATTERN +
                  endTime.toFormat(
                    DATE_PATTERN + DATETIME_COMBINE_PATTERN + TIME_PATTERN,
                  );
            }
          }
        }
      }
    }
    var contentRating = data.items[0].contentDetails.contentRating;
    if (contentRating.ytRating && contentRating.ytRating == "ytAgeRestricted")
      innerHTML += AGE_RESTRICTED;
    if (SHOW_REFRESH) {
      if (SHOW_UNDERLINE_ON_TIMESTAMP)
        innerHTML +=
          ' <span id="dot" class="style-scope ytd-video-primary-info-renderer"></span> <span style="color: var(--yt-spec-text-secondary); text-decoration: underline var(--yt-spec-text-secondary); cursor: pointer;" onclick="document.dispatchEvent(new Event(\'refresh-clicked\'));">' +
          REFRESH_TIMESTAMP +
          "</span>";
      else
        innerHTML +=
          ' <span id="dot" class="style-scope ytd-video-primary-info-renderer"></span> <span style="color: var(--yt-spec-text-secondary); cursor: pointer;" onclick="document.dispatchEvent(new Event(\'refresh-clicked\'));">' +
          REFRESH_TIMESTAMP +
          "</span>";
    }
    if (ongoing) updateOngoing(dt);
    let primaryInner = document.getElementById("primary-inner");
    let dateTimeValueElem = document.getElementById("exact-date-time");
    if (!dateTimeValueElem) {
      dateTimeValueElem = document.createElement("span");
      dateTimeValueElem.id = "exact-date-time";
      primaryInner.insertBefore(dateTimeValueElem, primaryInner.firstChild);
    }
    dateTimeValueElem.style.color = "white";
    dateTimeValueElem.style.position = "absolute";
    dateTimeValueElem.style.zIndex = "999";
    dateTimeValueElem.innerHTML = innerHTML;
    dateTimeValueElem.title = dateTimeValueElem.innerText;
    return ongoing;
  }
  function getExactUploadDate(forceRefresh = false) {
    var abort = false;
    const processEvent = async () => {
      await sleep(500);
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("v") != null) {
        let videoId = urlParams.get("v");
        if (videoId == currentVideoId) {
          abort = true;
        } else {
          currentVideoId = videoId;
        }
      }
      if (forceRefresh) abort = false;
      if ((YT_API_KEY != "" || typeof YT_API_KEY != "undefined") && !abort) {
        var url = genUrl();
        if (url != "") {
          fetch(url)
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              if (data.pageInfo.totalResults > 0) {
                const addTime = async () => {
                  var dt = luxon.DateTime.fromISO(
                    data.items[0].snippet.publishedAt,
                  );
                  console.log(dt);
                  let payload = {
                    context: {
                      client: {
                        clientName: "WEB",
                        clientVersion: "2.20210614.06.00",
                        originalUrl: window.location.href,
                        platform: "DESKTOP",
                        clientFormFactor: "UNKNOWN_FORM_FACTOR",
                        mainAppWebInfo: {
                          graftUrl: "/watch?v=" + currentVideoId,
                          webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
                          isWebNativeShareAvailable: false,
                        },
                      },
                      user: {
                        lockedSafetyMode: false,
                      },
                      request: {
                        useSsl: true,
                      },
                    },
                    videoId: currentVideoId,
                    racyCheckOk: false,
                    contentCheckOk: false,
                  };
                  fetch(
                    "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8" /*InnerTube-API-Key*/,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                    },
                  )
                    .then(function (response) {
                      return response.text();
                    })
                    .then(function (video_info) {
                      if (interval) {
                        clearInterval(interval);
                        interval = null;
                      }
                      if (changeCheckTimer) {
                        clearInterval(changeCheckTimer);
                        changeCheckTimer = null;
                      }
                      try {
                        /*let player_response = decodeURIComponent(video_info);
                    let urlParams = new URLSearchParams(player_response);
                    if (urlParams.get("player_response") != null) {
                      player_response = urlParams.get("player_response");
                    }
                    player_response = JSON.parse(player_response);// data.items[0].status.privacyStatus = "public" -> Öffentliches Video*/
                        let player_response = JSON.parse(video_info);
                        var premiere =
                          player_response &&
                          !player_response.videoDetails.isLiveContent;
                        premiere =
                          premiere && data.items[0].liveStreamingDetails;
                        var livestream =
                          player_response &&
                          player_response.videoDetails.isLiveContent;
                        var innerHTML =
                          '<span id="dot" class="style-scope ytd-video-primary-info-renderer">•</span>';
                        updateLiveContent(premiere, livestream, data, dt);
                      } catch (ex) {
                        console.error(ex);
                      }
                    })
                    .catch((error) =>
                      console.error(
                        "YOUTUBE EXACT UPLOAD ERROR: " + error,
                        "\nget_video_info doesn't seem to work",
                      ),
                    );
                };
                addTime();
              }
            })
            .catch((error) =>
              console.error(
                "YOUTUBE EXACT UPLOAD ERROR: " + error,
                "\nINVALID API KEY?",
              ),
            );
        }
      } else {
        if (!abort)
          console.error("YOUTUBE EXACT UPLOAD ERROR: Undefined api key");
      }
    };
    processEvent();
  }
  function refreshEventListener() {
    getExactUploadDate(true);
  }
  //getExactUploadDate();
  //document.addEventListener('click', getExactUploadDate);
  //document.addEventListener('yt-page-data-updated', getExactUploadDate);
  //document.addEventListener('yt-navigate-finish', getExactUploadDate);
  document.addEventListener("refresh-clicked", refreshEventListener);
  //<video style="width: 853px; height: 480px; left: 0px; top: 0px;" tabindex="-1" class="video-stream html5-main-video" src="blob:https://www.youtube.com/0976da77-cfd4-4922-ad9e-383d88a12200"></video>
  /*function main() {
    let videoStream = document.getElementsByClassName('video-stream');
    if (videoStream.length < 1) {
      setTimeout(() => main(), 500);
    } else {
      console.log('video-stream:', videoStream[0]);
      // videoStream[0].addEventListener('loadeddata', (event) => console.log(`Loaded ${event.target.src}`));
      //videoStream[0].addEventListener('loadeddata', (event) => getExactUploadDate());
      videoStream[0].addEventListener('durationchange', (event) => getExactUploadDate());
    }
  }*/
  function main() {
    let ytdPlayer = document.getElementById("ytd-player");
    if (!ytdPlayer) {
      setTimeout(() => main(), 500);
    } else {
      ytdPlayer.addEventListener("yt-player-updated", (event) =>
        getExactUploadDate(),
      );
    }
  }
  main();
  if (new URLSearchParams(window.location.search).get("v") != null) {
    getExactUploadDate();
  }
})();
