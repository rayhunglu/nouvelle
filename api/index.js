// Vercel entry point: every /api/* request is rewritten to this function (see vercel.json).
// MongoDB is connected first (once per cold start), then the Express app is built and reused; it never calls listen().
import server from '../src/app.js'

let appPromise

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = server.default().catch((err) => {
      appPromise = undefined // try again on the next request
      throw err
    })
  }
  const app = await appPromise
  return app(req, res)
}
