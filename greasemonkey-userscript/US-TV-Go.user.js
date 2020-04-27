// ==UserScript==
// @name         US TV Go
// @description  Removes clutter to reduce CPU load. Can transfer video stream to alternate video players: WebCast-Reloaded, ExoAirPlayer.
// @version      0.2.0
// @match        *://ustvgo.tv/*
// @icon         http://ustvgo.tv/favicon.ico
// @run-at       document-idle
// @homepage     https://github.com/warren-bank/crx-US-TV-Go/tree/greasemonkey-userscript
// @supportURL   https://github.com/warren-bank/crx-US-TV-Go/issues
// @downloadURL  https://github.com/warren-bank/crx-US-TV-Go/raw/greasemonkey-userscript/greasemonkey-userscript/US-TV-Go.user.js
// @updateURL    https://github.com/warren-bank/crx-US-TV-Go/raw/greasemonkey-userscript/greasemonkey-userscript/US-TV-Go.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

var user_options = {
  "script_injection_delay_ms":   250,
  "open_in_webcast_reloaded":    false,
  "open_in_exoairplayer_sender": true
}

var payload = function(){
  let hls_url, webcast_reloaded_url, exoairplayer_url
  let $, $player, $tvguide

  const webcast_div_id = 'webcast_div'

  if (!hls_url) {
    try {
      hls_url = window.player.getPlaylistItem().file
    }
    catch(err){}
  }

  if (!hls_url) {
    try {
      hls_url = window.player.getConfig().playlistItem.allSources[0].file
    }
    catch(err){}
  }

  if (!hls_url) {
    try {
      hls_url = window.player.getConfig().file
    }
    catch(err){}
  }

  if (!hls_url) {
    try {
      hls_url = window.player.getConfig().playlist[0].file
    }
    catch(err){}
  }

  if (!hls_url) {
    try {
      hls_url = window.player.playerInfo.options.sources[0]
    }
    catch(err){}
  }

  if (hls_url) {
    let encoded_hls_url, webcast_reloaded_base
    let encoded_referer_url, exoairplayer_base

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
      "http":  "http://webcast-reloaded.surge.sh/index.html"
    }
    webcast_reloaded_base = (hls_url.toLowerCase().indexOf('https:') === 0)
                              ? webcast_reloaded_base.https
                              : webcast_reloaded_base.http
    webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_hls_url

    encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(top.location.href)))
    exoairplayer_base     = 'http://webcast-reloaded.surge.sh/airplay_sender.html'
    exoairplayer_url      = exoairplayer_base  + '#/watch/' + encoded_hls_url + '/referer/' + encoded_referer_url
  }

  if (window.open_in_webcast_reloaded && webcast_reloaded_url) {
    top.location = webcast_reloaded_url
    return
  }

  if (window.open_in_exoairplayer_sender && exoairplayer_url) {
    top.location = exoairplayer_url
    return
  }

  $ = window.jQuery
  if (!$ && webcast_reloaded_url) {
    // inside of iframe
    $player = document.getElementById('player')
    if ($player) {
      $player.style.maxHeight = '100%'
    }

    // communicate video URL to parent frame
    setTimeout(() => {
      try {
        let data = {webcast_reloaded_url, exoairplayer_url}
        data = JSON.stringify(data)

        top.postMessage(data, "*")
      }
      catch(e){}
    }, 500)
  }
  if (!$) return

  $player = $('div#player, div#container, iframe#ViostreamIframe, .iframe-container > iframe, .iframe-container iframe, #main-content iframe').first().detach()
  if (!$player.length) return
  if ($player.is('iframe:not([id])')) $player.attr('id', 'ViostreamIframe')  // normalize id for css rules

  $tvguide = $('.timetable-list').first().detach()

  // append "WebCast-Reloaded" link
  const append_webcast_link = (wcr_url, eap_url) => {
    if (!$tvguide.length) return

    let $webcast_div = $tvguide.find('#' + webcast_div_id)
    if ($webcast_div.length) return

    // append
    $tvguide.append(
        '<div class="timetable-day" id="' + webcast_div_id + '">'
      + '  <div class="timetable-header">Open video stream in alternate player:</div>'
      + '  <div class="timetable-content hide">'
      + '    <div class="timetable-item">'
      + '      <span></span>'
      + '      <span></span>'
      + '      <a class="timetable-title" href="' + wcr_url + '">"WebCast-Reloaded"</a>'
      + '    </div>'
      + '  </div>'
      + '  <div class="timetable-content hide">'
      + '    <div class="timetable-item">'
      + '      <span></span>'
      + '      <span></span>'
      + '      <a class="timetable-title" href="' + eap_url + '">"ExoAirPlayer"</a>'
      + '    </div>'
      + '  </div>'
      + '</div>'
    )
  }

  if ($tvguide.length) {
    $tvguide.find('.timetable-popup').remove()

    if (webcast_reloaded_url) {
      append_webcast_link(webcast_reloaded_url, exoairplayer_url)
    }
    else {
      const process_iframe_message = (message) => {
        if (!message || !message.data) return
        let data = message.data

        try {
          data = JSON.parse(data)
          if (data.webcast_reloaded_url) {
            append_webcast_link(data.webcast_reloaded_url, data.exoairplayer_url)
          }
        }
        catch(e){}
      }

      // receive video URL from child frame
      window.addEventListener("message", process_iframe_message, false)
    }
  }

  $('body')
    .empty()
    .append($player)
    .append($tvguide)

  $('head').append(
    $('<style></style>').text(
        'body {background-image: none !important;} body > * {display:none !important;} '
      + 'body > #player {display:block !important; width: 100% !important;} body > #player:not(.jw-flag-fullscreen) {height:' + document.documentElement.clientHeight + 'px !important;} '
      + 'body > #container, body > #container > div[data-player]:not(.fullscreen) {display:block !important; width: 100% !important; height:' + document.documentElement.clientHeight + 'px !important;} '
      + 'body > #ViostreamIframe {display:block !important; position: static !important; width: 100% !important; height:' + document.documentElement.clientHeight + 'px !important;} '
      + 'body > .timetable-list {display:block !important; width: 100% !important; margin:1em 0;} '
      + 'body > .timetable-list > .timetable-day {margin-top:1em;} '
      + 'body > .timetable-list > .timetable-day > .timetable-header {background-color:#bbb; padding:0 0.5em;} '
      + 'body > .timetable-list > .timetable-day span {padding-left:1.5em;} '
    )
  )

  // disable script: "blockadblock.com"
  if (window['' + MysfbmLEHhis + ''] instanceof Object) {
    window['' + MysfbmLEHhis + ''].QePjkQwWvd = function(){}
  }
}

var get_hash_code = function(str){
  var hash, i, char
  hash = 0
  if (str.length == 0) {
    return hash
  }
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash  // Convert to 32bit integer
  }
  return Math.abs(hash)
}

var inject_function = function(_function){
  var inline, script, head

  inline = _function.toString()
  inline = '(' + inline + ')()' + '; //# sourceURL=crx_extension.' + get_hash_code(inline)
  inline = document.createTextNode(inline)

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.head
  head.appendChild(script)
}

var inject_options = function(){
  var _function = `function(){
    window.open_in_webcast_reloaded    = ${user_options['open_in_webcast_reloaded']}
    window.open_in_exoairplayer_sender = ${user_options['open_in_exoairplayer_sender']}
  }`
  inject_function(_function)
}

var inject_options_then_function = function(_function){
  inject_options()
  inject_function(_function)
}

setTimeout(
  function(){
    inject_options_then_function(payload)
  },
  user_options['script_injection_delay_ms']
)
