import React, { Component } from 'react'
import '../css/MainPage.css'
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
      transformedSightings: [] // Store transformed sightings for map and control panel
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
        speciesType: sighting.speciesType
      })
      
      return {
        id: sighting._id || index + 1,
        species: sighting.speciesName || 'Unknown Species',
        speciesType: sighting.speciesType || 'Unknown Type',
        date: sighting.date || 'Unknown Date',
        time: sighting.time || 'Unknown Time',
        coordinates: sighting.coordinates || 'Unknown Location',
      }
    })
    
    this.setState({ 
      transformedSightings,
      lastUpdate: Date.now()
    })
  }

  handleFiltersApplied = (filters) => {
    console.log('Filters applied in MainPage:', filters)
    // Handle the filters from the control panel
    // Apply filters to the map or perform other actions
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
    if (!this.state.selectedMarker) {
      return this.state.transformedSightings;
    }
    
    // If the selected marker has multiple sightings (grouped marker), return all of them
    if (this.state.selectedMarker.sightings) {
      return this.state.selectedMarker.sightings;
    }
    
    // Fallback: filter by coordinates for backward compatibility
    return this.state.transformedSightings.filter(observation => 
      observation.coordinates === this.state.selectedMarker.originalCoordinates
    );
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
              transformedSightings={this.state.transformedSightings}
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
