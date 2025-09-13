import React, { Component } from 'react'
import './App.css'
import MainPage from './components/MainPage'
import WildlifeSightingModal from './components/WildlifeSightingModal/WildlifeSightingModal'
import socketService from './services/socketService'

// Environment configuration
const config = {
  API_BASE_URL: import.meta.env.DEV ? 'http://localhost:3001' : null
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isDevelopment: import.meta.env.DEV,
      lastUpdate: new Date().toLocaleTimeString(),
      
      // Modal state
      showSightingModal: false,
      
      // Sightings data
      sightings: [],
      isLoadingSightings: true,
      
      // Real-time connection status
      isConnectedToRealTime: false
    }
  }

  // Load sightings from backend API
  loadSightingsFromAPI = async () => {
    try {
      console.log('🔄 Loading sightings from API...')
      
      // Skip API call if no backend URL is configured (production mode)
      if (!config.API_BASE_URL) {
        console.log('⚠️ API disabled in production mode')
        return
      }
      
      const response = await fetch(`${config.API_BASE_URL}/wildlife-sightings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purpose: 'retrieveAll' })
      })

      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        console.log('✅ Successfully loaded', data.data.length, 'sightings from API')
        this.setState({ 
          sightings: data.data,
          isLoadingSightings: false 
        })
        // Also save to localStorage as backup
        this.saveSightings(data.data)
      } else {
        console.warn('⚠️ API returned no sightings data, falling back to localStorage')
        this.fallbackToLocalStorage()
      }
    } catch (error) {
      console.error('❌ Error loading sightings from API:', error)
      console.log('🔄 Falling back to localStorage')
      this.fallbackToLocalStorage()
    }
  }

  // Fallback to localStorage if API fails
  fallbackToLocalStorage = () => {
    const localSightings = this.loadSightings()
    this.setState({ 
      sightings: localSightings,
      isLoadingSightings: false 
    })
  }

  // Load sightings from localStorage
  loadSightings = () => {
    try {
      const stored = localStorage.getItem('wildlifeSightings')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading sightings:', error)
      return []
    }
  }

  // Save sightings to localStorage
  saveSightings = (sightings) => {
    try {
      localStorage.setItem('wildlifeSightings', JSON.stringify(sightings))
    } catch (error) {
      console.error('Error saving sightings:', error)
    }
  }

  // Open the sighting modal
  openSightingModal = () => {
    console.log('🚀 App.openSightingModal called!')
    console.log('Current showSightingModal state:', this.state.showSightingModal)
    this.setState({ showSightingModal: true }, () => {
      console.log('✅ Modal state updated to:', this.state.showSightingModal)
    })
  }

  // Close the sighting modal
  closeSightingModal = () => {
    this.setState({ showSightingModal: false })
  }

  // Handle new sighting record (called by modal after successful API submission)
  handleRecordSighting = (newSighting) => {
    console.log('📝 Sighting recorded via modal:', newSighting)
    // Note: The real-time update will handle adding this to the state
    // This method is kept for compatibility but doesn't need to update state
    // since the Socket.IO event will handle the real-time update
    
    // Optional: Show a success message or perform other UI updates
    console.log('✅ Sighting will be updated via real-time connection')
  }

  componentDidMount() {
    // Show HMR status in development
    if (this.state.isDevelopment) {
      console.log('🌿 Wildlife Photography App - Development Mode')
      console.log('🔥 Hot Module Replacement is active')
      
      // Update timestamp when component mounts/updates
      if (import.meta.hot) {
        console.log('🔄 HMR is available and active')
      }
    }

    // Load existing sightings from API
    this.loadSightingsFromAPI()

    // Initialize Socket.IO connection for real-time updates
    this.initializeSocketConnection()
  }

  componentWillUnmount() {
    // Clean up socket connection
    socketService.offNewSighting()
    socketService.disconnect()
  }

  // Initialize Socket.IO connection and event listeners
  initializeSocketConnection = () => {
    console.log('🔌 Initializing Socket.IO connection for real-time updates')
    
    // Connect to the socket server
    const socket = socketService.connect()

    // Monitor connection status
    socket.on('connect', () => {
      console.log('✅ Real-time connection established')
      this.setState({ isConnectedToRealTime: true })
    })

    socket.on('disconnect', () => {
      console.log('❌ Real-time connection lost')
      this.setState({ isConnectedToRealTime: false })
    })

    // Listen for new sightings from other users
    socketService.onNewSighting((data) => {
      console.log('📡 Received real-time sighting update:', data)
      
      if (data.type === 'NEW_SIGHTING' && data.data) {
        // Check if this sighting already exists (to prevent duplicates)
        const existingSighting = this.state.sightings.find(
          sighting => sighting._id === data.data._id
        )
        
        if (!existingSighting) {
          // Add the new sighting to the state
          const updatedSightings = [...this.state.sightings, data.data]
          this.setState({ 
            sightings: updatedSightings,
            lastUpdate: new Date().toLocaleTimeString()
          })
          
          // Save to localStorage
          this.saveSightings(updatedSightings)
          
          // Show a notification (you can enhance this with a toast notification)
          console.log('✨ New wildlife sighting added in real-time!')
        } else {
          console.log('🔄 Sighting already exists, skipping duplicate')
        }
      }
    })
  }

  render() {
    const { showSightingModal, sightings, isLoadingSightings, isConnectedToRealTime } = this.state

    return (
      <>
        <MainPage 
          sightings={sightings}
          isLoadingSightings={isLoadingSightings}
          isConnectedToRealTime={isConnectedToRealTime}
          onOpenSightingModal={this.openSightingModal}
        />
        
        <WildlifeSightingModal 
          isOpen={showSightingModal}
          onClose={this.closeSightingModal}
          onRecordSighting={this.handleRecordSighting}
        />
      </>
    )
  }
}

export default App
