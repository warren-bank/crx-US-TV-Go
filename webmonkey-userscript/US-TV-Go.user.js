// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      2.0.3
// @match        https://ustvgo.tv/*
// @match        https://tvguide.to/*
// @icon         http://ustvgo.tv/favicon.ico
// @run-at       document-end
// @homepage     https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-US-TV-Go/issues
// @downloadURL  https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es5/webmonkey-userscript/US-TV-Go.user.js
// @updateURL    https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es5/webmonkey-userscript/US-TV-Go.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ============================================================================= common

var get_referer_url = function() {
  var referer_url
  try {
    referer_url = unsafeWindow.top.location.href
  }
  catch(e) {
    referer_url = unsafeWindow.location.href
  }
  return referer_url
}

// ============================================================================= iframe

var get_hls_url = function() {
  if (unsafeWindow.filePath)
    return unsafeWindow.filePath

  var player = unsafeWindow.player
  var hls_url  = null

  // assert: Clappr
  if (player) {
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.source
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.sources[0]
      }
      catch(err){}
    }
  }

  // assert: JW Player
  if (player) {
    if (!hls_url) {
      try {
        hls_url = player.getPlaylistItem().file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getPlaylist()[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().playlistItem.allSources[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.getConfig().playlist[0].file
      }
      catch(err){}
    }
    if (!hls_url) {
      try {
        hls_url = player.playerInfo.options.sources[0]
      }
      catch(err){}
    }
    if (!hls_url) {
      (function(){
        try {
          var regex = /^.*\{'file':([^\}]+)\}.*$/
          var txt   = document.querySelector('body > script').innerHTML.replace(/[\r\n]+/g, '')

          if (! regex.test(txt))
            throw ''

          var code = txt.replace(regex, '$1')

          hls_url = eval(code)
        }
        catch(err){}
      })()
    }
  }

  return hls_url
}

var process_iframe_window = function() {
  var hls_url = get_hls_url()

  if (hls_url) {
    var extras = ['referUrl', get_referer_url()]

    var args = [
      'android.intent.action.VIEW',  /* action */
      hls_url,                       /* data   */
      'application/x-mpegurl'        /* type   */
    ]

    for (var i=0; i < extras.length; i++) {
      args.push(extras[i])
    }

    GM_startIntent.apply(this, args)
  }

  return !!hls_url
}

// ============================================================================= parent

var get_iframe_url = function() {
  var urls = [
    'https://tvguide.to/clappr.php',
    'https://tvguide.to/',
    'https://ustvgo.tv/clappr.php'
  ]

  var iframe
  for (var i=0; (i < urls.length) && !iframe; i++) {
    iframe = document.querySelector('iframe[src^="' + urls[i] + '"]')
  }

  return (iframe) ? iframe.getAttribute('src') : null
}

var process_parent_window = function() {
  var iframe_url = get_iframe_url()

  if (iframe_url) {
    var headers = ['Referer', get_referer_url()]

    var args = [iframe_url]

    for (var i=0; i < headers.length; i++) {
      args.push(headers[i])
    }

    GM_loadUrl.apply(this, args)
  }

  return !!iframe_url
}

// ============================================================================= common bootstrap

var init = function() {
  if (process_iframe_window())
    return

  process_parent_window()
}

init()

// =============================================================================
