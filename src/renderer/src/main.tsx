import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useUiStore } from './store/useUiStore'
import { toastMessages } from './lib/toastMessages'
import './styles/index.css'

// store の mutation 内で既に toast を出しているケースが多いので、ここでは握りつぶさず
// 「想定外の Promise rejection」だけ拾ってログとフォールバック toast に流す。
window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandledrejection]', event.reason)
  useUiStore.getState().addToast(toastMessages.unexpectedError(), 'error')
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
