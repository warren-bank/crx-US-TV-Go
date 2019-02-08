// ==UserScript==
// @name US TV Go
// @description Removes clutter and reduces CPU load.
// @version 0.1.0
// @match *://ustvgo.net/*
// @icon http://ustvgo.net/favicon.ico
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

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
}

var inject_payload = function(){
  var inline, script, head

  inline = document.createTextNode(
    '(' + payload.toString() + ')()'
  )

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.getElementsByTagName('head')[0]
  head.appendChild(script)
}

if (document.readyState === 'complete'){
  inject_payload()
}
else {
  document.onreadystatechange = function(){
    if (document.readyState === 'complete'){
      inject_payload()
    }
  }
}
