// ==UserScript==
// @name         US TV Go
// @description  Removes clutter to reduce CPU load. Can transfer video stream to alternate video players: WebCast-Reloaded, ExoAirPlayer.
// @version      0.2.7
// @match        *://ustvgo.tv/*
// @match        *://tvguide.to/*
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

  // =================================================================================================================== iframe window

  const get_hls_url = () => {
    let hls_url

    if (window.filePath)
      return window.filePath

    // assert: Clappr
    if (window.player) {
      if (!hls_url) {
        try {
          hls_url = window.player.playerInfo.options.source
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

    // assert: JW Player
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

    // why are there multiple linefeeds between hostname and pathname?
    if (hls_url)
      hls_url = hls_url.replace(/[\s\r\n]+/g, '')

    return hls_url
  }

  // ===========================================================================

  const update_iframe_window_dom = () => {
    const $player = document.getElementById('player')
    if ($player) {
      $player.style.width     = '100%'
      $player.style.height    = '100%'
      $player.style.maxWidth  = '100%'
      $player.style.maxHeight = '100%'
    }
  }

  // ===========================================================================

  const process_iframe_window = () => {
    const hls_url = get_hls_url()

    if (hls_url) {
      // communicate video URL to parent window
      setTimeout(() => {
        try {
          let data = {hls_url}
          data = JSON.stringify(data)

          top.postMessage(data, "*")
        }
        catch(e){}
      }, 500)

      if (!window.redirect_to_webcast_reloaded) {
        // update DOM: iframe window

        update_iframe_window_dom()
      }
    }

    return !!hls_url
  }

  // =================================================================================================================== parent window

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

  // ===========================================================================

  const make_dom_element_visible = (el) => {
    const css_classname = 'gm_visible'
    el.addClass(css_classname)
  }

  const make_dom_element_client_height = (el, fixed) => {
    const css_classname = 'gm_client_height'

    if (fixed && (typeof fixed === 'number'))
      el.css({height: `${fixed}px`})
    else
      el.addClass(css_classname)
  }

  // ===========================================================================

  const update_parent_window_dom_2 = ($, hls_url) => {
    if (!$ || !hls_url) return

    // append "WebCast-Reloaded" link
    const $webcast_link = $(
          '<div class="webcast">'
        + '  <div class="header">Open video stream in alternate player:</div>'
        + '  <div class="link">'
        + '    <a href="' + get_webcast_reloaded_url(hls_url) + '">"WebCast-Reloaded"</a>'
        + '  </div>'
        + '</div>'
    )

    make_dom_element_visible($webcast_link)

    $('body')
      .append($webcast_link)
  }

  // ===========================================================================

  const get_videoplayer_iframe = ($) => {
    const urls = [
      'https://tvguide.to/clappr.php',
      'https://tvguide.to/',
      'https://ustvgo.tv/clappr.php'
    ]

    let $player
    for (let i=0; (i < urls.length) && (!$player || !$player.length); i++) {
      $player = $('iframe[src^="' + urls[i] + '"]').first().detach()
    }
    return $player
  }

  const update_parent_window_dom_1 = ($) => {
    if (!$) return

    const $player = get_videoplayer_iframe($)
    if (!$player || !$player.length) return
    $player.attr('id', 'ViostreamIframe')  // normalize id for css rules

    const $tvguide = $('iframe[src^="https://ustvgo.tv/tvguide/index.html"]').first().detach()

    make_dom_element_visible($player)
    make_dom_element_visible($tvguide)

    make_dom_element_client_height($player, Math.max(900, document.documentElement.clientHeight))

    $('body')
      .empty()
      .append($player)
      .append($tvguide)

    $('head').append(
      $('<style></style>').text(
          'body {background-image: none !important; background-color: #fff !important;} body > * {display:none !important;} '
        + 'body > .gm_visible {display:block !important; width: 100% !important;} '

        + 'body > .gm_client_height {height:auto; max-height:' + document.documentElement.clientHeight + 'px !important;} '

        + 'body > .webcast {margin:1em 0;} '
        + 'body > .webcast > .header {background-color:#04abf2; color:#fff; line-height:3em; margin:1em 0;} '
        + 'body > .webcast > .link {padding-left:1.5em;} '
      )
    )
  }

  // ===========================================================================

  const disable_blockadblock = function() {
    if (
         ('string'   === typeof FMGAnJzGgfis)
      && ('object'   === typeof window[FMGAnJzGgfis])
      && ('function' === typeof window[FMGAnJzGgfis].bBGHcTrBzx)
    ) {
      window[FMGAnJzGgfis].bBGHcTrBzx = function(){
        console.clear()
        console.log('blockadblock blocked :)')
      }
    }
  }

  // ===========================================================================

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

  const process_hls_url = (hls_url) => {
    if (window.redirect_to_webcast_reloaded) {
      // transfer video stream
      redirect_to_url(get_webcast_reloaded_url(hls_url))
    }
    else {
      // update DOM: parent window (part 2 of 2)
      update_parent_window_dom_2(window.jQuery, hls_url)
    }
  }

  // ===========================================================================

  const process_iframe_message = (message) => {
    if (!message || !message.data) return
    let data = message.data

    try {
      data = JSON.parse(data)
      if (data.hls_url) {
        process_hls_url(data.hls_url)
      }
    }
    catch(e){}
  }

  // ===========================================================================

  const process_parent_window = () => {
    // disable:
    //   https://blockadblock.com/blockadblock_basic_script.php
    disable_blockadblock()

    // update DOM: parent window (part 1 of 2)
    update_parent_window_dom_1(window.jQuery)

    window.addEventListener("message", process_iframe_message, false)
  }

  // =================================================================================================================== init

  const init = () => {
    if (process_iframe_window())
      return

    process_parent_window()
  }

  // ===========================================================================

  init()
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
