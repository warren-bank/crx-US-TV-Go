var payload = function(){
  let hls_url, webcast_reloaded_url
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

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html#/watch/",
      "http":  "http://gitcdn.link/cdn/warren-bank/crx-webcast-reloaded/gh-pages/external_website/index.html#/watch/"
    }
    webcast_reloaded_base = (hls_url.toLowerCase().indexOf('https:') === 0)
                              ? webcast_reloaded_base.https
                              : webcast_reloaded_base.http
    webcast_reloaded_url  = webcast_reloaded_base + encoded_hls_url
  }

  if (window.open_in_webcast_reloaded && webcast_reloaded_url) {
    top.location = webcast_reloaded_url
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
        let data = {webcast_reloaded_url}
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
  const append_webcast_link = (url) => {
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
      + '      <a class="timetable-title" href="' + url + '">"WebCast-Reloaded"</a>'
      + '    </div>'
      + '  </div>'
      + '</div>'
    )
  }

  if ($tvguide.length) {
    $tvguide.find('.timetable-popup').remove()

    if (webcast_reloaded_url) {
      append_webcast_link(webcast_reloaded_url)
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
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['open_in_webcast_reloaded'], (result) => {
      var _function = `function(){window.open_in_webcast_reloaded = ${result['open_in_webcast_reloaded']}}`
      inject_function(_function)
      resolve()
    })
  })
}

var inject_options_then_function = function(_function){
  inject_options()
  .then(() => {
    inject_function(_function)
  })
  .catch(() => {})
}

if (document.readyState === 'complete'){
  inject_options_then_function(payload)
}
else {
  document.addEventListener("DOMContentLoaded", function(event) {
    inject_options_then_function(payload)
  })
}
