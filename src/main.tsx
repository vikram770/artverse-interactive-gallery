
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAuth } from './lib/store.ts'
import { useNotificationStore } from './lib/notificationStore.ts'

// Initialize auth before rendering
initializeAuth().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  // Initialize notifications after auth
  useNotificationStore.getState().fetchNotifications();
}).catch(error => {
  console.error('Failed to initialize authentication:', error);
  // Still render the app, but it will be in an unauthenticated state
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
