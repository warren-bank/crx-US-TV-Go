// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      3.0.1
// @match        https://ustvgo.tv/*
// @match        https://tvguide.to/*
// @icon         http://ustvgo.tv/favicon.ico
// @run-at       document-end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-US-TV-Go/issues
// @downloadURL  https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es5/webmonkey-userscript/US-TV-Go.user.js
// @updateURL    https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es5/webmonkey-userscript/US-TV-Go.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var user_options = {
  "redirect_to_webcast_reloaded": true,
  "force_http":                   true,
  "force_https":                  false,

  "redirect_to_tvguide":          true,
  "tvguide_timezone":             "PST"   // one of: "EST", "CST", "MST", "PST", or a custom locale
                                          // for example: "Asia/Hong_Kong"
                                          // as defined in: https://momentjs.com/downloads/moment-timezone-with-data.js
}

var constants = {
  "tvguide_pathname":             "/guide"
}

// ----------------------------------------------------------------------------- URL links to tools on Webcast Reloaded website

var get_webcast_reloaded_url = function(video_url, vtt_url, referer_url, force_http, force_https) {
  force_http  = (typeof force_http  === 'boolean') ? force_http  : user_options.force_http
  force_https = (typeof force_https === 'boolean') ? force_https : user_options.force_https

  var encoded_video_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

  encoded_video_url     = encodeURIComponent(encodeURIComponent(btoa(video_url)))
  encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
  referer_url           = referer_url ? referer_url : unsafeWindow.location.href
  encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

  webcast_reloaded_base = {
    "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
    "http":  "http://webcast-reloaded.surge.sh/index.html"
  }

  webcast_reloaded_base = (force_http)
                            ? webcast_reloaded_base.http
                            : (force_https)
                               ? webcast_reloaded_base.https
                               : (video_url.toLowerCase().indexOf('http:') === 0)
                                  ? webcast_reloaded_base.http
                                  : webcast_reloaded_base.https

  webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_video_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
  return webcast_reloaded_url
}

// ----------------------------------------------------------------------------- URL redirect

var redirect_to_url = function(url) {
  if (!url) return

  try {
    unsafeWindow.top.location = url
  }
  catch(e) {
    unsafeWindow.location = url
  }
}

var process_video_url = function(video_url, video_type, vtt_url, referer_url) {
  if (!referer_url)
    referer_url = unsafeWindow.location.href

  if (typeof GM_startIntent === 'function') {
    // running in Android-WebMonkey: open Intent chooser

    var args = [
      /* action = */ 'android.intent.action.VIEW',
      /* data   = */ video_url,
      /* type   = */ video_type
    ]

    // extras:
    if (vtt_url) {
      args.push('textUrl')
      args.push(vtt_url)
    }
    if (referer_url) {
      args.push('referUrl')
      args.push(referer_url)
    }

    GM_startIntent.apply(this, args)
    return true
  }
  else if (user_options.redirect_to_webcast_reloaded) {
    // running in standard web browser: redirect URL to top-level tool on Webcast Reloaded website

    redirect_to_url(get_webcast_reloaded_url(video_url, vtt_url, referer_url))
    return true
  }
  else {
    return false
  }
}

var process_hls_url = function(hls_url, vtt_url, referer_url) {
  process_video_url(/* video_url= */ hls_url, /* video_type= */ 'application/x-mpegurl', vtt_url, referer_url)
}

var process_dash_url = function(dash_url, vtt_url, referer_url) {
  process_video_url(/* video_url= */ dash_url, /* video_type= */ 'application/dash+xml', vtt_url, referer_url)
}

// ----------------------------------------------------------------------------- inspect current window for video URL

var sanitize_url = function(url) {
  if (url) {
    url = url.replace(/[\s\r\n]+/g, '')

    return (url.indexOf('http') === 0) ? url : null
  }
  return null
}

var get_hls_url_sync = function() {
  if (unsafeWindow.filePath)
    return unsafeWindow.filePath

  var player = unsafeWindow.player
  var hls_url  = null

  // assert: Clappr
  if (!hls_url && player) {
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
  if (!hls_url && player) {
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
         var regex   = /^.*\{'file':([^\}]+)\}.*$/
         var scripts = unsafeWindow.document.querySelectorAll('script')
         var txt, code

         for (var i=0; i < scripts.length; i++) {
           txt = scripts[i].innerHTML.replace(/[\r\n]+/g, '')

           try {
             if (! regex.test(txt))
               throw ''

             var code = txt.replace(regex, '$1')

             hls_url = eval(code)
             hls_url = sanitize_url(hls_url)
             break
           }
           catch(error){
             continue
           }
         }
      })()
    }
  }

  return sanitize_url(hls_url)
}

var get_hls_url_async = function(callback) {
  var done        = false
  var real_loader = null
  var fake_loader = function() {
    real_loader()

    var hls_url

    if (unsafeWindow.hls_src)
      hls_url = unsafeWindow.hls_src
    else
      hls_url = get_hls_url_sync()

    if (hls_url)
      callback(hls_url)
  }

  // assert: Clappr
  if (!done && (typeof unsafeWindow.LoadPlayer === 'function')) {
    real_loader = unsafeWindow.LoadPlayer
    unsafeWindow.LoadPlayer = fake_loader
    done = true
  }

  // assert: JW Player
  if (!done && (typeof unsafeWindow.LoadJwPlayer === 'function')) {
    real_loader = unsafeWindow.LoadJwPlayer
    unsafeWindow.LoadJwPlayer = fake_loader
    done = true
  }

  return done
}

var get_hls_url = function(callback) {
  return get_hls_url_sync() || get_hls_url_async(callback)
}

var extract_video = function() {
  var hls_url = get_hls_url(process_hls_url)

  if (typeof hls_url === 'string')
    process_hls_url(hls_url)

  return !!hls_url
}

// ----------------------------------------------------------------------------- tunnel into iframe window

var tunnel_into_iframe = function() {
  var iframe = unsafeWindow.document.querySelector('iframe[src][allowfullscreen]')
  if (!iframe) return false

  var url
  try {
    url = iframe.contentWindow.location.href
  }
  catch(error){
    url = iframe.getAttribute('src')
  }
  if (!url) return false

  if (typeof GM_loadUrl === 'function')
    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)

  return true
}

// ----------------------------------------------------------------------------- adjust timezone on tvguide

var update_tvguide_timezone = function() {
  if (typeof unsafeWindow.showtable === 'function') {
    var timezones = {
      EST: 'America/New_York',
      CST: 'America/Chicago',
      MST: 'America/Denver',
      PST: 'America/Los_Angeles'
    }

    var timezone = user_options.tvguide_timezone
    if (timezones[timezone])
      timezone = timezones[timezone]

    unsafeWindow.timezone = timezone
    unsafeWindow.showtable()
  }
}

// ----------------------------------------------------------------------------- bootstrap

var init_video = function() {
  return extract_video() || tunnel_into_iframe()
}

var init_tvguide = function() {
  var pathname = unsafeWindow.location.pathname

  if (pathname.indexOf(constants.tvguide_pathname) === 0)
    update_tvguide_timezone()
  else if (user_options.redirect_to_tvguide && (unsafeWindow === unsafeWindow.top))
    unsafeWindow.location = constants.tvguide_pathname
}

var init = function() {
  init_video() || init_tvguide()
}

init()

// -----------------------------------------------------------------------------
