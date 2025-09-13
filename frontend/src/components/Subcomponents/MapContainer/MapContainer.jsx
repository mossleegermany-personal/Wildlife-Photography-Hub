import React, { Component } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import '../../../css/Subcomponents/MapContainer/MapContainer.css'

class MapContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mapLoaded: false,
      selectedMarker: null,
      clickedCoordinates: null,
      showCoordinates: false,
      observations: []
    }
  }

  // Convert transformedSightings to map markers, grouping by coordinates
  getSightingMarkers = () => {
    const { transformedSightings } = this.props
    if (!transformedSightings || transformedSightings.length === 0) {
      return []
    }

    // Group sightings by coordinates
    const groupedSightings = {}
    
    transformedSightings.forEach((sighting, index) => {
      let position = { lat: 1.3521, lng: 103.8198 } // Default to Singapore center
      let coordKey = 'default'
      
      console.log(`Processing sighting ${index}:`, sighting.coordinates)
      
      if (sighting.coordinates && sighting.coordinates !== 'Unknown Location') {
        // Try to parse coordinates if they're in "lat, lng" format
        const coordMatch = sighting.coordinates.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1])
          const lng = parseFloat(coordMatch[2])
          
          // Validate coordinates are within reasonable ranges
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            position = { lat, lng }
            coordKey = sighting.coordinates
            console.log(`Successfully parsed coordinates for ${sighting.species}:`, position)
          } else {
            console.warn(`Invalid coordinates for ${sighting.species}:`, lat, lng)
          }
        } else {
          console.warn(`Could not parse coordinates for ${sighting.species}:`, sighting.coordinates)
        }
      }

      // Group sightings by coordinate key
      if (!groupedSightings[coordKey]) {
        groupedSightings[coordKey] = {
          position: position,
          originalCoordinates: coordKey === 'default' ? 'Unknown Location' : coordKey,
          sightings: []
        }
      }
      
      groupedSightings[coordKey].sightings.push(sighting)
    })

    // Convert grouped sightings to markers
    return Object.entries(groupedSightings).map(([coordKey, group], index) => {
      const sightingCount = group.sightings.length
      const firstSighting = group.sightings[0]
      
      // Create title based on number of sightings
      let title
      if (sightingCount === 1) {
        title = `${firstSighting.species} (${firstSighting.speciesType})`
      } else {
        const speciesList = group.sightings.map(s => s.species).slice(0, 3).join(', ')
        title = `${sightingCount} observations: ${speciesList}${sightingCount > 3 ? '...' : ''}`
      }

      return {
        id: `grouped-${coordKey}-${index}`,
        position: group.position,
        title: title,
        sightingCount: sightingCount,
        sightings: group.sightings,
        originalCoordinates: group.originalCoordinates
      }
    })
  }

  onMarkerClick = (marker) => {
    this.setState({
      selectedMarker: marker,
      clickedCoordinates: marker.position,
      showCoordinates: true
    })
    
    // Trigger observations list with marker location info
    if (this.props.onMarkerClick) {
      this.props.onMarkerClick(marker);
    }
  }

  onInfoWindowClose = () => {
    this.setState({
      selectedMarker: null,
      clickedCoordinates: null,
      showCoordinates: false
    })
  }

  onLoad = (map) => {
    console.log('Map loaded successfully:', map);
    this.map = map
    this.setState({ mapLoaded: true })
    
    if (this.props.onMapLoaded) {
      this.props.onMapLoaded(map)
    }
  }

  onUnmount = () => {
    console.log('Map unmounted');
    this.map = null
  }

  render() {
    const containerStyle = { 
      width: "100%", 
      height: "500px",
      minHeight: '400px'
    };
    const center = { lat: 1.3521, lng: 103.8198 }; // Singapore
    const sightingMarkers = this.getSightingMarkers()

    return (
      <main className="map-container">
        <LoadScript googleMapsApiKey="AIzaSyAYSiPt4ThyQEC1hm5hdsDExYvPsE68uEo">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={this.onLoad}
            onUnmount={this.onUnmount}
            options={{
              mapTypeId: 'hybrid',
              disableDefaultUI: true,
              gestureHandling: 'greedy',
              clickableIcons: false,
              disableDoubleClickZoom: false,
              keyboardShortcuts: false,
              minZoom: 12,
              restriction: {
                latLngBounds: {
                  north: 1.4784,
                  south: 1.1304,
                  east: 104.2400,
                  west: 103.6000
                },
                strictBounds: false
              }
            }}
          >
            {/* Render markers from wildlife sightings data */}
            {sightingMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => this.onMarkerClick(marker)}
                label={marker.sightingCount > 1 ? {
                  text: marker.sightingCount.toString(),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                } : undefined}
                icon={marker.sightingCount > 1 ? {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="15" cy="15" r="12" fill="#2d8653" stroke="white" stroke-width="2"/>
                    </svg>
                  `),
                  scaledSize: { width: 30, height: 30 },
                  labelOrigin: { x: 15, y: 15 }
                } : undefined}
              />
            ))}
          </GoogleMap>
        </LoadScript>
        
        {!this.state.mapLoaded && (
          <div className="map-loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <p>Loading map...</p>
            </div>
          </div>
        )}
      </main>
    )
  }
}

export default MapContainer