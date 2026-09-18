/* Legacy service-worker kill switch.
 *
 * Older builds of this app registered a worker at the fixed URL /sw.js, and
 * CloudStudio's CDN cached that URL for hours. Those installs could therefore
 * never discover a newer worker: they kept answering navigations out of their
 * own cache, so the device was pinned to an old app shell forever.
 *
 * Current builds register a versioned worker (`sw-<ts>.js`) and never reference
 * this file. It exists only so a device still holding the old /sw.js
 * registration gets unregistered: browsers re-check a worker script roughly
 * every 24h, so the device will pick this up on its own, install it, activate,
 * and then be released back to plain network requests.
 *
 * Keep this file tiny and side-effect free — it must never control a page.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        try {
          client.navigate(client.url)
        } catch {
          /* client may already be gone */
        }
      }
    })()
  )
})
