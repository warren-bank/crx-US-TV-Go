// http://ustvgo.net/category/entertainment/
// http://ustvgo.net/category/news/
// http://ustvgo.net/category/sports/
// http://ustvgo.net/category/kids/

jQuery(document).ready(function($){
  let data = []
  let $a = $('div.mh-posts-list-content > header.mh-posts-list-header > h3 > a')

  $a.each(function(){
    let href = this.href
    let name = this.title.replace(/ (?:Live Streaming Free|Live Streaming|Live Free|Live)$/i, '')

    data.push([href,name])
  })

  data.sort(function(a, b){
    let nameA = a[1].toLowerCase()
    let nameB = b[1].toLowerCase()
    return (nameA < nameB)
      ? -1
      : (nameA > nameB)
        ? 1
        : 0
  })

  let md   = ''
  let html = ''
  let i

  for (i=0; i<data.length; i++) {
    let href = data[i][0]
    let name = data[i][1]

    md   += `  * [${name}](${href})\n`
    html += `                <li><a href="${href}">${name}</a></li>\n`
  }

  console.log("\n----------------------------------------\n")
  console.log('md:')
  console.log(md)
  console.log("\n----------------------------------------\n")
  console.log('html:')
  console.log(html)
  console.log("\n----------------------------------------\n")
})
