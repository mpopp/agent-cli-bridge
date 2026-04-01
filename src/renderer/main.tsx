import React from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider, createRoute, createRootRoute } from '@tanstack/react-router'
import { App } from './App'
import { ExecutionHistory } from './pages/ExecutionHistory'
import { About } from './pages/About'
import './i18n/config'

const rootRoute = createRootRoute({
  component: App
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ExecutionHistory
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About
})

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
