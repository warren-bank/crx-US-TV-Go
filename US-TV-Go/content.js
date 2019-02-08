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

if (document.readyState === 'complete'){
  inject_function(payload)
}
else {
  document.addEventListener("DOMContentLoaded", function(event) {
    inject_function(payload)
  })
}
