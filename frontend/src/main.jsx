import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

function render() {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

// Initial render
render()

// Enable HMR (Hot Module Replacement)
if (import.meta.hot) {
  import.meta.hot.accept('./App.jsx', () => {
    console.log('🔄 App component updated - Hot reloading...')
    render()
  })
  
  import.meta.hot.accept('./components/MainPage.jsx', () => {
    console.log('🔄 MainPage component updated - Hot reloading...')
    render()
  })
  
  import.meta.hot.accept('./components/subcomponents/ControlPanel/ControlPanel.jsx', () => {
    console.log('🔄 ControlPanel component updated - Hot reloading...')
    render()
  })
  
  import.meta.hot.accept('./components/subcomponents/MapContainer/MapContainer.jsx', () => {
    console.log('🔄 MapContainer component updated - Hot reloading...')
    render()
  })
  
  // Accept CSS changes
  import.meta.hot.accept('./index.css', () => {
    console.log('🎨 Global styles updated')
  })
  
  import.meta.hot.accept('./css/MainPage.css', () => {
    console.log('🎨 MainPage styles updated')
  })
  
  import.meta.hot.accept('./css/Subcomponents/ControlPanel/ControlPanel.css', () => {
    console.log('🎨 ControlPanel styles updated')
  })
  
  import.meta.hot.accept('./css/Subcomponents/MapContainer/MapContainer.css', () => {
    console.log('🎨 MapContainer styles updated')
  })
}
