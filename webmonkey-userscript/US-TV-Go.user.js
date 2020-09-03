// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      1.0.0
// @match        https://ustvgo.tv/*
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

// =============================================================================

var get_hls_url = function() {
  var player = unsafeWindow.player
  var hls_url  = null

  if (player) {
    if (!hls_url) {
      try {
        hls_url = player.getPlaylistItem().file
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
  }

  return hls_url
}

// =============================================================================

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

// =============================================================================

var process_iframe = function() {
  var iframe = document.querySelector('iframe[src^="https://ustvgo.tv/"]')
  if (iframe)
    unsafeWindow.location = iframe.getAttribute('src')
}

// =============================================================================

var process_page = function() {
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
  else {
    process_iframe()
  }
}

// =============================================================================

process_page()
