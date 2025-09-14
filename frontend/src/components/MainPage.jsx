import React, { Component } from 'react'
import '@css/MainPage.css'
import ControlPanel from './Subcomponents/ControlPanel/ControlPanel'
import MapContainer from './Subcomponents/MapContainer/MapContainer'
import ObservationsList from './Subcomponents/ObservationsList/ObservationsList'
import { devUtils } from '../utils/devUtils'

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      map: null,
      mapLoaded: false,
      lastUpdate: Date.now(),
      showObservations: false, // Initially hidden
      selectedMarker: null, // Track which marker was clicked
      transformedSightings: [], // Store transformed sightings for map and control panel
      filteredSightings: [] // Store filtered sightings based on search/filters
    }
  }

  componentDidMount() {
    devUtils.logUpdate('MainPage mounted')
    this.transformSightings(this.props.sightings || [])
  }

  componentDidUpdate(prevProps) {
    // Update transformed sightings when props change
    if (prevProps.sightings !== this.props.sightings) {
      this.transformSightings(this.props.sightings || [])
    }
  }

  transformSightings = (sightings) => {
    console.log('Transforming sightings:', sightings)
    
    // Transform the backend data to match the current observations format
    const transformedSightings = sightings.map((sighting, index) => {
      console.log(`Transforming sighting ${index}:`, {
        coordinates: sighting.coordinates,
        speciesName: sighting.speciesName,
        speciesType: sighting.speciesType,
        images: sighting.images
      })
      
      return {
        id: sighting._id || index + 1,
        species: sighting.speciesName || 'Unknown Species',
        speciesType: sighting.speciesType || 'Unknown Type',
        date: sighting.date || 'Unknown Date',
        time: sighting.time || 'Unknown Time',
        coordinates: sighting.coordinates || 'Unknown Location',
        images: sighting.images || []
      }
    })
    
    this.setState({ 
      transformedSightings,
      filteredSightings: transformedSightings, // Initially show all sightings
      lastUpdate: Date.now()
    })
  }

  handleFiltersApplied = (filters) => {
    console.log('Filters applied in MainPage:', filters)
    
    let filtered = [...this.state.transformedSightings]
    
    // Apply species type filter
    if (filters.speciesType && filters.speciesType !== 'all' && filters.speciesType !== '') {
      filtered = filtered.filter(sighting => 
        sighting.speciesType.toLowerCase() === filters.speciesType.toLowerCase()
      )
    }
    
    // Apply search filter (search in species name and species type)
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(sighting =>
        sighting.species.toLowerCase().includes(searchTerm) ||
        sighting.speciesType.toLowerCase().includes(searchTerm) ||
        sighting.coordinates.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply location filter (coordinates)
    if (filters.location && filters.location !== '') {
      filtered = filtered.filter(sighting => sighting.coordinates === filters.location)
    }
    
    // Apply date filter if provided
    if (filters.date) {
      filtered = filtered.filter(sighting => sighting.date === filters.date)
    }
    
    console.log('Filtered sightings:', filtered.length, 'out of', this.state.transformedSightings.length)
    
    this.setState({ 
      filteredSightings: filtered,
      showObservations: false, // Close observations panel to reset
      selectedMarker: null
    })
  }

  handleMapLoaded = (mapInstance) => {
    this.setState({ 
      map: mapInstance,
      mapLoaded: true 
    })
    console.log('Map loaded in MainPage')
  }

  handleMapClick = () => {
    this.setState({ showObservations: true })
  }

  handleMarkerClick = (marker) => {
    console.log('🖱️ Marker clicked:', marker)
    console.log('Marker has sightings:', marker.sightings ? marker.sightings.length : 'No sightings property')
    
    this.setState({ 
      showObservations: true,
      selectedMarker: marker
    })
  }

  // Helper function to calculate distance between two coordinate points
  calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 || coord1 === 'Unknown Location' || coord2 === 'Unknown Location') {
      return Infinity;
    }
    
    const parseCoords = (coordString) => {
      const match = coordString.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
      return null;
    };
    
    const pos1 = parseCoords(coord1);
    const pos2 = parseCoords(coord2);
    
    if (!pos1 || !pos2) return Infinity;
    
    // Calculate distance using Haversine formula (simplified for short distances)
    const deltaLat = Math.abs(pos1.lat - pos2.lat);
    const deltaLng = Math.abs(pos1.lng - pos2.lng);
    
    // For wildlife observations, consider points within ~100 meters as the same location
    // 0.001 degrees ≈ 111 meters at the equator
    const threshold = 0.001;
    
    return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) <= threshold;
  }

  getFilteredObservations = () => {
    console.log('🔍 getFilteredObservations called')
    console.log('selectedMarker:', this.state.selectedMarker)
    
    if (!this.state.selectedMarker) {
      console.log('No selectedMarker, returning all filteredSightings')
      return this.state.filteredSightings;
    }
    
    // For individual markers, find all nearby sightings within the same area
    // but only from the already filtered sightings
    if (this.state.selectedMarker.sighting) {
      const clickedCoordinates = this.state.selectedMarker.originalCoordinates
      console.log('Individual marker clicked, finding nearby sightings for:', clickedCoordinates)
      
      // Find all sightings that are at the same or very close coordinates
      // but only from the filtered sightings
      const nearbySightings = this.state.filteredSightings.filter(sighting => {
        if (sighting.coordinates === clickedCoordinates) {
          return true // Exact match
        }
        
        // Check if coordinates are within ~100 meters of each other
        return this.calculateDistance(sighting.coordinates, clickedCoordinates)
      })
      
      console.log('Found nearby sightings:', nearbySightings.length)
      console.log('Nearby sightings data:', nearbySightings)
      return nearbySightings
    }
    
    // If the selected marker has multiple sightings (grouped marker), return all of them
    // but filter them based on current filters
    if (this.state.selectedMarker.sightings) {
      console.log('Found grouped marker with sightings:', this.state.selectedMarker.sightings.length)
      
      // Filter the marker's sightings based on current filters
      const markerSightings = this.state.selectedMarker.sightings.filter(sighting =>
        this.state.filteredSightings.some(filtered => filtered.id === sighting.id)
      )
      
      console.log('Filtered marker sightings:', markerSightings)
      return markerSightings;
    }
    
    // Fallback: filter by coordinates for backward compatibility
    // but only from filtered sightings
    console.log('Using fallback coordinate filtering')
    const filtered = this.state.filteredSightings.filter(observation => 
      observation.coordinates === this.state.selectedMarker.originalCoordinates
    );
    console.log('Filtered observations:', filtered)
    return filtered;
  }

  handleCloseObservations = () => {
    this.setState({ showObservations: false })
  }

  render() {
    const { sightings, onOpenSightingModal } = this.props

    return (
      <div className="main-page">
        <header className="main-header">
          <div className="header-container">
            {/* Photography Equipment Icons */}
            <div className="photography-title">
              <span className="title-icon">📸</span>
              <h1 className="main-title">Wildlife Photography Hub</h1>
              <span className="title-icon">🦅</span>
            </div>

            {/* Photography Control Panel */}
            <ControlPanel 
              sightings={sightings || []}
              transformedSightings={this.state.transformedSightings}
              onFiltersApplied={this.handleFiltersApplied}
              onOpenSightingModal={onOpenSightingModal}
            />
          </div>
        </header>
        
        {/* Main Content - Map and Observations Side by Side */}
        <div className="main-content">
          <div className="content-container">
            <MapContainer 
              onMapLoaded={this.handleMapLoaded} 
              onMarkerClick={this.handleMarkerClick}
              showObservations={this.state.showObservations}
              transformedSightings={this.state.filteredSightings}
            />
            {this.state.showObservations && (
              <ObservationsList 
                observations={this.getFilteredObservations()} 
                selectedLocation={this.state.selectedMarker?.title}
                onClose={this.handleCloseObservations}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default MainPage;
