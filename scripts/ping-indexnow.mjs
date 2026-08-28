// Tell Bing, Yandex and Naver that the site changed, instead of waiting to be
// found.
//
// WHAT THIS IS AND IS NOT
// IndexNow is a one-call protocol: a site publishes a key at its own root, then
// POSTs a list of its own URLs and the key, and the participating engines fetch
// those URLs sooner than their crawl schedule would have. Google does not
// participate and has said it is evaluating it; nothing here changes anything
// in Google Search. The owner's decision of 28.08.2026 was to implement it
// anyway, and to have it fire by itself rather than be remembered.
//
// THE URL LIST IS READ FROM THE LIVE SITE, NOT FROM THE BUILD
// Deliberately. The point of the call is "these addresses have new content
// NOW", and the only thing that knows what is actually served is the thing
// serving it. Reading dist/sitemap.xml would let this announce a page that the
// deploy had not finished publishing, which is the one way to make an engine
// fetch a 404 on purpose.
//
// It is also why a failure here is not a failure of anything. If the site is
// not up, or the deploy is still running, this says so and exits 0: a
// notification that did not go out is not a broken build, and it will go out on
// the next push.
//
//   node scripts/ping-indexnow.mjs                 against https://inplace.digital
//   node scripts/ping-indexnow.mjs --dry           print the payload, send nothing
//   node scripts/ping-indexnow.mjs --host example.com

import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}
const DRY = args.includes('--dry')

const HOST = arg('host', 'inplace.digital')
const ORIGIN = `https://${HOST}`
const ENDPOINT = 'https://api.indexnow.org/indexnow'

// The key is the name of the file that holds it, which is how the protocol
// proves the caller controls the host. It is found rather than written down
// twice: public/ holds exactly one 32-character hex .txt and that is it.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const keyFiles = readdirSync(path.join(ROOT, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (keyFiles.length !== 1) {
  console.error(
    `expected exactly one IndexNow key file in public/, found ${keyFiles.length}` +
      (keyFiles.length ? `: ${keyFiles.join(', ')}` : '')
  )
  process.exit(1)
}
const KEY = keyFiles[0].replace(/\.txt$/, '')

const soft = (message) => {
  console.log(`IndexNow not sent: ${message}`)
  process.exit(0)
}

let sitemap
try {
  const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { 'user-agent': 'inplace-indexnow' } })
  if (!res.ok) soft(`${ORIGIN}/sitemap.xml returned ${res.status}`)
  sitemap = await res.text()
} catch (err) {
  soft(`${ORIGIN}/sitemap.xml could not be fetched (${err.message})`)
}

// <loc> only. The <xhtml:link> alternates in the same file are the same pages
// under their other language, and every one of them has its own <loc> further
// down; submitting both would send each address twice.
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (!urlList.length) soft('the live sitemap lists no <loc>')

const foreign = urlList.filter((u) => !u.startsWith(`${ORIGIN}/`))
if (foreign.length) {
  // Every URL in one submission must belong to the host that owns the key.
  console.error(`the sitemap lists addresses outside ${ORIGIN}: ${foreign.join(', ')}`)
  process.exit(1)
}

const body = { host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }

if (DRY) {
  console.log(JSON.stringify({ ...body, key: '(withheld)' }, null, 2))
  console.log(`\n${urlList.length} URLs would be submitted to ${ENDPOINT}`)
  process.exit(0)
}

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })
  // 200 accepted, 202 accepted but the key is still being verified. Both are
  // the call having worked.
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow: ${urlList.length} URLs submitted for ${HOST}, HTTP ${res.status}`)
  } else {
    soft(`${ENDPOINT} returned ${res.status} ${await res.text()}`)
  }
} catch (err) {
  soft(`${ENDPOINT} could not be reached (${err.message})`)
}
