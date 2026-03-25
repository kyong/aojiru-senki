import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Aojiru Senki API is running!')
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '1.0.0' })
})

// Mock Battle Start
app.post('/battle/start', async (c) => {
  const body = await c.req.json()
  return c.json({
    battleId: 'mock-battle-' + Date.now(),
    questId: body.questId,
    enemyHp: 1000 // Mock HP
  })
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
