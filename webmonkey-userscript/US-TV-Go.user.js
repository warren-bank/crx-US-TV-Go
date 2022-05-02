// ==UserScript==
// @name         US TV Go
// @description  Watch videos in external player.
// @version      3.0.3
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
  "common": {
    "redirect_to_tvguide":          true,   // when requested page doesn't contain a video, and isn't the tvguide
    "tvguide_timezone":             "PST",  // one of: "EST", "CST", "MST", "PST", or a custom locale
                                            // for example: "Asia/Hong_Kong"
                                            // as defined in: https://momentjs.com/downloads/moment-timezone-with-data.js
    "rewrite_tvguide":              true    // replace overly complicated DOM with a simple <table> layout
  },
  "webmonkey": {
    "post_intent_redirect_to_url":  "about:blank"
  },
  "greasemonkey": {
    "redirect_to_webcast_reloaded": true,
    "force_http":                   true,
    "force_https":                  false
  }
}

var constants = {
  "tvguide_pathname":               "/guide"
}

// ----------------------------------------------------------------------------- URL links to tools on Webcast Reloaded website

var get_webcast_reloaded_url = function(video_url, vtt_url, referer_url, force_http, force_https) {
  force_http  = (typeof force_http  === 'boolean') ? force_http  : user_options.greasemonkey.force_http
  force_https = (typeof force_https === 'boolean') ? force_https : user_options.greasemonkey.force_https

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

  if (typeof GM_loadUrl === 'function') {
    if (typeof GM_resolveUrl === 'function')
      url = GM_resolveUrl(url, unsafeWindow.location.href) || url

    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)
  }
  else {
    try {
      unsafeWindow.top.location = url
    }
    catch(e) {
      unsafeWindow.window.location = url
    }
  }
}

var process_webmonkey_post_intent_redirect_to_url = function() {
  var url = null

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'string')
    url = user_options.webmonkey.post_intent_redirect_to_url

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'function')
    url = user_options.webmonkey.post_intent_redirect_to_url()

  if (typeof url === 'string')
    redirect_to_url(url)
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
    process_webmonkey_post_intent_redirect_to_url()
    return true
  }
  else if (user_options.greasemonkey.redirect_to_webcast_reloaded) {
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

// ----------------------------------------------------------------------------- tvguide

var update_tvguide = function() {
  update_tvguide_timezone()
  rewrite_tvguide()
}

// ----------------------------------------------------------------------------- tvguide (helper)

var get_tvguide_lists = function() {
  var timebar, schedule

  timebar  = unsafeWindow.document.querySelector('div#p_guide > div.container-fluid > div.row > ul.schedule-timebar')
  schedule = unsafeWindow.document.querySelector('div#p_guide > div.container-fluid > div.row > div.schedule-content > ul.schedule-list')

  return {timebar, schedule}
}

var clear_tvguide_lists = function() {
  var lists = get_tvguide_lists()

  if (lists.timebar)
    lists.timebar.innerHTML = ''

  if (lists.schedule)
    lists.schedule.innerHTML = ''
}

// ----------------------------------------------------------------------------- tvguide (adjust timezone)

var update_tvguide_timezone = function() {
  if (typeof unsafeWindow.showtable === 'function') {
    var timezones = {
      EST: 'America/New_York',
      CST: 'America/Chicago',
      MST: 'America/Denver',
      PST: 'America/Los_Angeles'
    }

    var timezone = user_options.common.tvguide_timezone
    if (timezones[timezone])
      timezone = timezones[timezone]

    unsafeWindow.timezone = timezone
    clear_tvguide_lists()
    unsafeWindow.showtable()
  }
}

// ----------------------------------------------------------------------------- tvguide (rewrite DOM)

var rewrite_tvguide_polling_attempts_remaining = 30

var rewrite_tvguide = function() {
  if (!user_options.common.rewrite_tvguide) return

  var lists = get_tvguide_lists()
  if (!lists.timebar || !lists.schedule) return

  if (!lists.timebar.childNodes.length || !lists.schedule.childNodes.length) {
    // showtable() is async and still running.. wait a period of time and retry

    if (rewrite_tvguide_polling_attempts_remaining > 0) {
      rewrite_tvguide_polling_attempts_remaining--
      setTimeout(rewrite_tvguide, 1000)
    }
    return
  }

  // proceed..
  var html = []
  var style_width_regex = /^.*?width:\s*(\d+)\s*%.*$/
  var items, nested_items, item, max_colspan_count, colspan_percent, cell_width, colspan_count

  items = lists.timebar.querySelectorAll(':scope > li.schedule-timebar-time')

  // should be 5 columns at 20% each
  max_colspan_count = items.length
  colspan_percent   = Math.floor(100 / max_colspan_count)

  html.push('<table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">')

  html.push('  ' + '<tr>')
  for (var i=0; i < items.length; i++) {
    item = items[i]
    html.push('    ' + '<th align="center" width="' + colspan_percent + '%">' + item.innerHTML.trim() + '</th>')
  }
  html.push('  ' + '</tr>')

  items = lists.schedule.querySelectorAll(':scope > li.schedule-channel-row')

  for (var i1=0; i1 < items.length; i1++) {
    nested_items = items[i1].querySelectorAll(':scope > a')

    if (!nested_items.length || (nested_items[0].getAttribute('href').toLowerCase().indexOf('http') !== 0)) continue

    html.push('  ' + '<tr>')
    for (var i2=0; i2 < nested_items.length; i2++) {
      item = nested_items[i2]

      if (i2 === 0) {
        // link to channel

        html.push('    ' + '<td align="left" colspan="1">' + item.outerHTML.trim() + '</td>')
      }
      else {
        // info about programming for channel

        cell_width = item.getAttribute('style')
        if (!style_width_regex.test(cell_width)) continue
        cell_width = cell_width.replace(style_width_regex, '$1')
        cell_width = parseInt(cell_width, 10)

        colspan_count = Math.floor(cell_width / colspan_percent)
        if (colspan_count <= 0)
          colspan_count = 1
        if (colspan_count > max_colspan_count)
          colspan_count = max_colspan_count

        html.push('    ' + '<td align="left" colspan="' + colspan_count + '">' + item.innerHTML.trim() + '</td>')
      }
    }
    html.push('  ' + '</tr>')
  }

  html.push('</table>')

  // add external css for channel icons
  html.push('<link rel="stylesheet" href="channel-icons.css" />')

  // add css tweaks
  html.push('<style>')
  html.push('  ' + 'span.schedule-program-title {display: block}')
  html.push('  ' + 'span.schedule-program-time  {display: block; font-size: 0.75em; margin-top: 2px}')

  html.push('  ' + 'tr > th, tr > td:first-child {background-color: #f4f3f3; color: #444}')

  html.push('  ' + 'a.schedule-channel {color: #222; text-decoration: none}')
  html.push('  ' + 'a.schedule-channel:hover {text-decoration: underline}')
  html.push('  ' + 'a.schedule-channel * {vertical-align: top}')
  html.push('  ' + 'a.schedule-channel i.channel-icon {display: inline-block; width: 30px; height: 20px; margin-right: 10px;}')
  html.push('</style>')

  unsafeWindow.document.close()
  unsafeWindow.document.open()
  unsafeWindow.document.write(html.join("\n"))
  unsafeWindow.document.close()
}

// ----------------------------------------------------------------------------- bootstrap

var init_video = function() {
  return extract_video() || tunnel_into_iframe()
}

var init_tvguide = function() {
  var pathname = unsafeWindow.location.pathname

  if (pathname.indexOf(constants.tvguide_pathname) === 0)
    update_tvguide()
  else if (user_options.common.redirect_to_tvguide && (unsafeWindow === unsafeWindow.top))
    unsafeWindow.location = constants.tvguide_pathname
}

var init = function() {
  init_video() || init_tvguide()
}

init()

// -----------------------------------------------------------------------------
