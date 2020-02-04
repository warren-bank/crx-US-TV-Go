// https://ustvgo.tv/category/entertainment/

{
  const urls = []
  ;[...document.querySelectorAll('#ul_pis_posts_in_sidebar-2 a')].forEach(anchor => {
    let href = anchor.getAttribute('href')
    let name = anchor.innerHTML
    urls.push({name, href})
  })

  const $md     = urls.map(({name, href}) => `  * [${name}](${href})`).join("\n")
  const $html   = urls.map(({name, href}) => `                <li><a href="${href}">${name}</a></li>`).join("\n")
  const $import = urls.map(({name, href}) => `                <DT><A HREF="${href}">${name}</A>`).join("\n")

  const hr = "\n----------------------------------------\n"

  console.log(`${hr}${$md}${hr}${$html}${hr}${$import}${hr}`)
}
