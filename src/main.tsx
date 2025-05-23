
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAuth } from './lib/store.ts'
import { Toaster } from 'sonner'

// Initialize auth before rendering to avoid flashing of unauthenticated state
// Also ensures proper error handling if auth init fails
initializeAuth()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" />
      </React.StrictMode>,
    )
  })
  .catch(error => {
    console.error('Failed to initialize authentication:', error);
    // Still render the app, but it will be in an unauthenticated state
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" />
      </React.StrictMode>,
    )
    
    // Show error toast after the app is rendered
    setTimeout(() => {
      console.error("Failed to initialize authentication. Please try again later.");
    }, 1000);
  });
