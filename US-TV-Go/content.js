var payload = function(){
  var $, $player

  $ = window.jQuery
  if (!$) return

  $player = $('div#player:first')
  if (!$player.length) return

  $player
    .detach()
    .appendTo(
      $('body').empty()
    )

  $('head').append(
    $('<style></style>').text('body > * {display:none;} body > #player {display:block; height:' + document.documentElement.clientHeight + 'px !important;}')
  )

  try {
    if (window.open_in_webcast_reloaded) {
      let hls_url = window.player.getConfig().playlist[0].file
      if (!hls_url) throw ''

      let encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    //let webcast_reloaded_base = 'https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html#/watch/'
      let webcast_reloaded_base = 'http://gitcdn.link/cdn/warren-bank/crx-webcast-reloaded/gh-pages/external_website/index.html#/watch/'
      let webcast_reloaded_url  = webcast_reloaded_base + encoded_hls_url

      window.location = webcast_reloaded_url
    }
  }
  catch(err) {}
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

var inject_function = function(_function){
  var inline, script, head

  inline = document.createTextNode(
    '(' + _function.toString() + ')()'
  )

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.head
  head.appendChild(script)
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
