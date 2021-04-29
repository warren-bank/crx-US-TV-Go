### [US TV Go](https://github.com/warren-bank/crx-US-TV-Go/tree/master)

#### Summary:

Chromium browser extension:
* works on pages that are hosted at: [`ustvgo.tv/*`](http://ustvgo.tv/)

#### UI:

* there is no user interface (UI)
* the extension works silently in the background
  * removes all page content except the iframe that contains an embedded video player
  * dramatically reduces CPU load
* after installation, an icons is added to the "Chrome toolbar"
  * there is no way for the extension to prevent this from happening
  * to hide ( but [not remove](https://superuser.com/questions/1048619) ) it, you can right-click on the icon and select: "Hide in Chrome menu"

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
