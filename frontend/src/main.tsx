import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import React from 'react'
import { Analytics } from '@vercel/analytics/react'
import { countVisit } from './api/analytics/analytics'

const today = new Date().toISOString().slice(0, 10)
const visitKey = `devmine-visit-counted-${today}`

async function trackVisitOncePerDay() {
  if (localStorage.getItem(visitKey)) return

  try {
    await countVisit()
    localStorage.setItem(visitKey, "true")
  } catch (e) {
    console.error("visit count failed", e)
  }
}

trackVisitOncePerDay()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Analytics />
  </React.StrictMode>,
)


