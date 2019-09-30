var payload = function(){
  var $, $player

  if (window.open_in_webcast_reloaded) {
    try {
      let hls_url, encoded_hls_url, webcast_reloaded_base, webcast_reloaded_url

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

      if (!hls_url) {
        throw ''
      }

      encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    //webcast_reloaded_base = 'https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html#/watch/'
      webcast_reloaded_base = 'http://gitcdn.link/cdn/warren-bank/crx-webcast-reloaded/gh-pages/external_website/index.html#/watch/'
      webcast_reloaded_url  = webcast_reloaded_base + encoded_hls_url

      window.location = webcast_reloaded_url
      return
    }
    catch(err) {}
  }

  $ = window.jQuery
  if (!$) return

  $player = $('div#player, div#container').first()
  if (!$player.length) return

  $player
    .detach()
    .appendTo(
      $('body').empty()
    )

  $('head').append(
    $('<style></style>').text(
        'body {background-image: none !important;} body > * {display:none !important;} '
      + 'body > #player {display:block !important; width: 100% !important;} body > #player:not(.jw-flag-fullscreen) {height:' + document.documentElement.clientHeight + 'px !important;} '
      + 'body > #container, body > #container > div[data-player]:not(.fullscreen) {display:block !important; width: 100% !important; height:' + document.documentElement.clientHeight + 'px !important;} '
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
