// Vercel entry point: every /api/* request is rewritten to this function (see vercel.json).
// The Express app is created once per cold start and reused; it never calls listen().
import server from '../src/app.js'

export default server.createServer()
