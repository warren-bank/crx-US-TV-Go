// ==UserScript==
// @name         US TV Go
// @description  Removes clutter to reduce CPU load. Can transfer video stream to alternate video players: WebCast-Reloaded, ExoAirPlayer.
// @version      0.2.1
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
  "script_injection_delay_ms":    250,
  "redirect_to_webcast_reloaded": true,
  "force_http":                   true,
  "force_https":                  false
}

var payload = function(){

  // ===========================================================================

  const get_hls_url = () => {
    let hls_url

    if (window.player) {
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
    }

    return hls_url
  }

  // ===========================================================================

  const get_referer_url = function() {
    let referer_url
    try {
      referer_url = top.location.href
    }
    catch(e) {
      referer_url = window.location.href
    }
    return referer_url
  }

  const get_webcast_reloaded_url = (hls_url, vtt_url, referer_url) => {
    let encoded_hls_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
    referer_url           = referer_url ? referer_url : get_referer_url()
    encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
      "http":  "http://webcast-reloaded.surge.sh/index.html"
    }

    webcast_reloaded_base = (window.force_http)
                              ? webcast_reloaded_base.http
                              : (window.force_https)
                                 ? webcast_reloaded_base.https
                                 : (hls_url.toLowerCase().indexOf('http:') === 0)
                                    ? webcast_reloaded_base.http
                                    : webcast_reloaded_base.https

    webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_hls_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
    return webcast_reloaded_url
  }

  const redirect_to_url = function(url) {
    if (!url) return

    try {
      top.location = url
    }
    catch(e) {
      window.location = url
    }
  }

  // ===========================================================================

  const process_embedded_iframe = (hls_url) => {
    const $player = document.getElementById('player')
    if ($player) {
      $player.style.maxHeight = '100%'
    }

    // communicate video URL to parent window
    setTimeout(() => {
      try {
        let data = {webcast_reloaded_url: get_webcast_reloaded_url(hls_url)}
        data = JSON.stringify(data)

        top.postMessage(data, "*")
      }
      catch(e){}
    }, 500)
  }

  // ===========================================================================

  const process_parent_window = ($, hls_url) => {
    const $player = $('div#player, div#container, iframe#ViostreamIframe, .iframe-container > iframe, .iframe-container iframe, #main-content iframe').first().detach()
    if (!$player.length) return
    if ($player.is('iframe:not([id])')) $player.attr('id', 'ViostreamIframe')  // normalize id for css rules

    const $tvguide = $('.timetable-list').first().detach()

    // append "WebCast-Reloaded" link
    const append_webcast_link = (wcr_url) => {
      if (!$tvguide.length) return

      const webcast_div_id = 'webcast_div'
      const $webcast_div   = $tvguide.find('#' + webcast_div_id)
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
        + '</div>'
      )
    }

    if ($tvguide.length) {
      $tvguide.find('.timetable-popup').remove()

      if (hls_url) {
        append_webcast_link(get_webcast_reloaded_url(hls_url))
      }
      else {
        const process_iframe_message = (message) => {
          if (!message || !message.data) return
          let data = message.data

          try {
            data = JSON.parse(data)
            if (data.webcast_reloaded_url) {
              append_webcast_link(data.webcast_reloaded_url)
            }
          }
          catch(e){}
        }

        // receive video URL from embedded child iframe
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
        + 'body > .timetable-list {display:block !important; width: 100% !important; margin:1em 0; background-color: #fff;} '
        + 'body > .timetable-list > .timetable-day {margin-top:1em;} '
        + 'body > .timetable-list > .timetable-day > .timetable-header {padding:0 0.5em; margin-bottom: 0.5em; background-color:#eee; color:#666;} '
        + 'body > .timetable-list > .timetable-day span {padding-left:1.5em;} '
      )
    )

    // disable script: "blockadblock.com"
    if (window['' + MysfbmLEHhis + ''] instanceof Object) {
      window['' + MysfbmLEHhis + ''].QePjkQwWvd = function(){}
    }
  }

  // ===========================================================================

  const process_page = () => {
    const hls_url = get_hls_url()

    if (hls_url && window.redirect_to_webcast_reloaded) {
      // transfer video stream

      redirect_to_url(get_webcast_reloaded_url(hls_url))
    }
    else if (!window.jQuery) {
      // update DOM: embedded iframe

      if (hls_url)
        process_embedded_iframe(hls_url)
    }
    else {
      // update DOM: parent window

      process_parent_window(window.jQuery, hls_url)
    }
  }

  process_page()
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
    window.redirect_to_webcast_reloaded = ${user_options['redirect_to_webcast_reloaded']}
    window.force_http                   = ${user_options['force_http']}
    window.force_https                  = ${user_options['force_https']}
  }`
  inject_function(_function)
}

var bootstrap = function(){
  inject_options()
  inject_function(payload)
}

setTimeout(
  bootstrap,
  user_options['script_injection_delay_ms']
)
