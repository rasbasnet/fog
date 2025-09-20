import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import JourneyPage from './pages/JourneyPage'
import NotFoundPage from './pages/NotFoundPage'
import './index.css'

const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <HomePage /> },
        { path: ':slug', element: <JourneyPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: base === '/' ? undefined : base },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
