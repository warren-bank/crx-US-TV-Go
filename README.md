### [US TV Go](https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es6)

[Userscript](https://github.com/warren-bank/crx-US-TV-Go/raw/webmonkey-userscript/es6/webmonkey-userscript/US-TV-Go.user.js) for [ustvgo.tv](https://ustvgo.tv/) to run in:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android

Its purpose is to:
* on a page for a video:
  - redirect the video stream to an external player

#### Stale Branch:

* the only active branch is [`webmonkey-userscript/es5`](https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es5)
* all of the following branches are no-longer maintained:
  - [`webmonkey-userscript/es6`](https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es6)
  - [`greasemonkey-userscript`](https://github.com/warren-bank/crx-US-TV-Go/tree/greasemonkey-userscript)
  - [`master`](https://github.com/warren-bank/crx-US-TV-Go/tree/master) Chrome extension
* rationale
  - the [ustvgo.tv](https://ustvgo.tv/) website loads in older ES5 web browsers, including Android 4.x WebView
  - as such:
    * there is no functional difference between ES5 and ES6 variations of these stale userscripts
    * they only differ in syntax
    * there's no reason to maintain multiple variations
    * ES5 is a least common denominator
      - the [`webmonkey-userscript/es5`](https://github.com/warren-bank/crx-US-TV-Go/tree/webmonkey-userscript/es5) userscript will run on all supported platforms

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
