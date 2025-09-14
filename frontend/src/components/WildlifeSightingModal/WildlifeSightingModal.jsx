import React, { Component } from 'react'
import axios from 'axios'
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import '@css/WildlifeSightingModal/WildlifeSightingModal.css'

// Environment configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://wildlife-photography-backend.azurewebsites.net'

class WildlifeSightingModal extends Component {
  constructor(props) {
    super(props)
    
    const now = new Date()
    const currentDate = now.toLocaleDateString('en-GB')
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)
    
    this.state = {
      speciesName: '',
      speciesType: '',
      coordinates: '',
      date: currentDate,
      time: currentTime,
      showMapsSection: false,
      showLocationModal: false,
      showSpeciesDropdown: false,
      selectedLat: 1.3521,
      selectedLng: 103.8198,
      mapLoadError: false,
      selectedImages: [],
      uploading: false,
      isDragOver: false,
      speciesOptions: [
        'Mammal',
        'Bird',
        'Reptile',
        'Amphibian',
        'Fish',
        'Insect',
        'Arachnid',
        'Crustacean',
        'Mollusk',
        'Other'
      ]
    }
    
    // Remove unused mapRef, map, and marker since we're using React Google Maps
  }

  componentDidMount() {
    // Google Maps will be loaded by LoadScript component
  }

  componentDidUpdate(prevProps, prevState) {
    // Map will be initialized automatically by React Google Maps
  }

  getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          this.setState({
            coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            selectedLat: lat,
            selectedLng: lng,
            showLocationModal: false
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please select manually on the map.')
          this.setState({ 
            showLocationModal: false,
            showMapsSection: true 
          })
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
      this.setState({ 
        showLocationModal: false,
        showMapsSection: true 
      })
    }
  }

  handleInputChange = (field, value) => {
    this.setState({ [field]: value })
  }

  handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    this.processFiles(files)
  }

  handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragOver: true })
  }

  handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragOver: false })
  }

  handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragOver: false })
    
    const files = Array.from(event.dataTransfer.files)
    this.processFiles(files)
  }

  processFiles = (files) => {
    const maxFiles = 5
    const maxSizePerFile = 10 * 1024 * 1024 // 10MB per file
    
    if (files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`)
      return
    }

    // Validate file types and sizes
    const validFiles = []
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        continue
      }
      
      if (file.size > maxSizePerFile) {
        alert(`${file.name} is too large. Maximum size is 10MB`)
        continue
      }
      
      validFiles.push(file)
    }

    this.setState({ 
      selectedImages: validFiles
    })
  }

  removeImage = (index) => {
    const newImages = [...this.state.selectedImages]
    
    newImages.splice(index, 1)
    
    this.setState({
      selectedImages: newImages
    })
  }

  uploadImages = async (sightingId) => {
    if (this.state.selectedImages.length === 0) {
      return []
    }

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        this.state.selectedImages.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result // This includes the data:image/jpeg;base64, prefix
              })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
      )

      const response = await axios.post(`${API_BASE_URL}/wildlife-sightings/upload-images`, {
        sightingId: sightingId,
        images: imageData
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        return response.data.imageIds
      } else {
        throw new Error(response.data.message || 'Failed to upload images')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  handleClose = () => {
    this.setState({
      speciesName: '',
      speciesType: '',
      coordinates: '',
      showMapsSection: false,
      showLocationModal: false,
      showSpeciesDropdown: false,
      selectedImages: [],
      uploading: false,
      isDragOver: false
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  handleSubmit = async () => {
    const { speciesName, speciesType, coordinates, date, time } = this.state
    
    if (!speciesName || !speciesType || !coordinates) {
      alert('Please fill in all fields')
      return
    }

    this.setState({ uploading: true })

    const sightingData = {
      speciesName,
      speciesType,
      coordinates,
      date,
      time
    }

    try {
      console.log('Submitting sighting data:', sightingData)
      
      // Skip API call if no backend URL is configured (production mode)
      if (!API_BASE_URL) {
        alert('Backend API not available in demo mode')
        this.handleClose()
        return
      }
      
      // Send data to backend using axios
      const response = await axios.post(`${API_BASE_URL}/wildlife-sightings`, {purpose: "newRecord", sightingData})
      
      if (response.data.success) {
        const sightingId = response.data.data._id
        
        // Upload images if any were selected
        let imageIds = []
        if (this.state.selectedImages.length > 0) {
          try {
            imageIds = await this.uploadImages(sightingId)
            console.log('Images uploaded successfully:', imageIds)
          } catch (imageError) {
            console.error('Failed to upload images:', imageError)
            alert('Sighting recorded but failed to upload images: ' + imageError.message)
          }
        }
        
        alert('Wildlife sighting recorded successfully!' + 
              (imageIds.length > 0 ? ` ${imageIds.length} image(s) uploaded.` : ''))
        
        // Also call the parent component's callback if it exists
        if (this.props.onRecordSighting) {
          this.props.onRecordSighting({
            ...response.data.data,
            images: imageIds
          })
        }
        
        this.handleClose()
      } else {
        alert('Failed to record sighting: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error recording sighting:', error)
      if (error.response) {
        // Server responded with error status
        alert('Error: ' + (error.response.data.message || 'Failed to record sighting'))
      } else if (error.request) {
        // Request was made but no response received
        alert('Network error: Could not connect to server')
      } else {
        // Something else happened
        alert('Error: ' + error.message)
      }
    } finally {
      this.setState({ uploading: false })
    }
  }

  render() {
    const { isOpen } = this.props
    const { speciesName, speciesType, coordinates, date, time, showMapsSection, showLocationModal } = this.state

    if (!isOpen) return null

    // Location Selection Modal
    if (showLocationModal) {
      return (
        <div className="modal-backdrop" onClick={() => this.setState({ showLocationModal: false })}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📍 Select Location Method</h3>
              <button 
                className="modal-close-btn"
                onClick={() => this.setState({ showLocationModal: false })}
              >
                ← Back
              </button>
            </div>
            <div className="modal-body">
              <div className="location-option-simple" onClick={this.getCurrentLocation}>
                <span className="option-icon">📍</span>
                <div className="option-text">
                  <strong>Auto-detect my location</strong>
                  <small>Use GPS to automatically detect your current location</small>
                </div>
              </div>
              
              <div className="location-option-simple" onClick={() => {
                this.setState({ 
                  showLocationModal: false,
                  showMapsSection: true 
                })
              }}>
                <span className="option-icon">🗺️</span>
                <div className="option-text">
                  <strong>Select on map manually</strong>
                  <small>Click on an interactive map to choose your location</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (showMapsSection) {
      return (
        <div className="modal-backdrop" onClick={() => this.setState({ showMapsSection: false })}>
          <div className="modal-content-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📍 Select Location</h3>
              <button 
                className="modal-close-btn"
                onClick={() => this.setState({ showMapsSection: false })}
              >
                ← Back
              </button>
            </div>
            <div className="map-section-fullscreen">
              <div className="map-container-modal">
                {window.google && window.google.maps ? (
                  // Google Maps API is already loaded, use GoogleMap directly
                  <GoogleMap
                    mapContainerStyle={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px'
                    }}
                    center={{ lat: this.state.selectedLat, lng: this.state.selectedLng }}
                    zoom={14}
                    onClick={(event) => {
                      const lat = event.latLng.lat()
                      const lng = event.latLng.lng()
                      this.setState({
                        selectedLat: lat,
                        selectedLng: lng,
                        coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                      })
                    }}
                    options={{
                      mapTypeId: 'hybrid',
                      disableDefaultUI: true,
                      gestureHandling: 'greedy',
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
                    {coordinates && (
                      <Marker
                        position={{ lat: this.state.selectedLat, lng: this.state.selectedLng }}
                        title="Selected Location"
                        animation={2} // DROP animation
                      />
                    )}
                  </GoogleMap>
                ) : (
                  // Google Maps API not loaded yet, use LoadScript
                  <LoadScript googleMapsApiKey="AIzaSyAYSiPt4ThyQEC1hm5hdsDExYvPsE68uEo">
                    <GoogleMap
                      mapContainerStyle={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px'
                      }}
                      center={{ lat: this.state.selectedLat, lng: this.state.selectedLng }}
                      zoom={16}
                      onClick={(event) => {
                        const lat = event.latLng.lat()
                        const lng = event.latLng.lng()
                        this.setState({
                          selectedLat: lat,
                          selectedLng: lng,
                          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                        })
                      }}
                      options={{
                        mapTypeId: 'hybrid',
                        disableDefaultUI: true,
                        gestureHandling: 'greedy',
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
                      {coordinates && (
                        <Marker
                          position={{ lat: this.state.selectedLat, lng: this.state.selectedLng }}
                          title="Selected Location"
                          animation={2} // DROP animation
                        />
                      )}
                    </GoogleMap>
                  </LoadScript>
                )}
              </div>
              <div className="map-controls">
                <div className="map-instructions">
                  <p>📍 Click anywhere on the map to pin your location</p>
                  <p><small>💡 The coordinates will be automatically filled. You can click multiple times to update your selection.</small></p>
                </div>
                <input
                  type="text"
                  placeholder="Coordinates will appear here when you click the map"
                  value={coordinates}
                  onChange={(e) => this.handleInputChange('coordinates', e.target.value)}
                  className="modal-input"
                />
                <button 
                  onClick={() => this.setState({ showMapsSection: false })}
                  className="confirm-btn"
                >
                  ← Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="modal-backdrop" onClick={this.handleClose}>
        <div className="modal-content-small" onClick={(e) => {
          e.stopPropagation()
          // Close dropdowns when clicking elsewhere in modal
          if (!e.target.closest('.dropdown-container')) {
            this.setState({ showSpeciesDropdown: false })
          }
        }}>
          <div className="modal-header">
            <h3>📝 Record Wildlife Sighting</h3>
            <button 
              className="modal-close-btn"
              onClick={this.handleClose}
            >
              ✕
            </button>
          </div>
          
          <div className="modal-body">
            <div className="input-group">
              <label>🦎 Species Name</label>
              <input
                type="text"
                placeholder="Enter species name"
                value={speciesName}
                onChange={(e) => this.handleInputChange('speciesName', e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label>🔍 Species Type</label>
              <div className="dropdown-container">
                <input
                  type="text"
                  placeholder="Select or enter species type"
                  value={speciesType}
                  onClick={() => this.setState({ showSpeciesDropdown: true })}
                  onChange={(e) => {
                    this.handleInputChange('speciesType', e.target.value)
                    this.setState({ showSpeciesDropdown: true })
                  }}
                  className="modal-input dropdown-input"
                />
                <span className="dropdown-arrow">▼</span>
                {this.state.showSpeciesDropdown && (
                  <div className="dropdown-options">
                    {this.state.speciesOptions
                      .filter(option => 
                        option.toLowerCase().includes(speciesType.toLowerCase())
                      )
                      .map((option, index) => (
                        <div
                          key={index}
                          className="dropdown-option"
                          onClick={() => {
                            this.setState({
                              speciesType: option,
                              showSpeciesDropdown: false
                            })
                          }}
                        >
                          {option}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>📍 Location</label>
              <input
                type="text"
                placeholder="Click to select location method"
                value={coordinates}
                onClick={() => this.setState({ showLocationModal: true })}
                onChange={(e) => this.handleInputChange('coordinates', e.target.value)}
                className="modal-input location-input"
                readOnly
              />
            </div>

            <div className="input-group">
              <label>📷 Photos (Optional)</label>
              <div 
                className={`image-upload-container ${this.state.isDragOver ? 'drag-over' : ''}`}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={this.handleImageSelect}
                  className="hidden-file-input"
                  style={{ display: 'none' }}
                />
                <div className="drag-drop-area">
                  <div className="drag-drop-icon">📁</div>
                  <div className="drag-drop-text">
                    <p><strong>Drag & drop images here</strong></p>
                    <p>or</p>
                    <label htmlFor="image-upload" className="image-upload-btn">
                      Choose Photos
                    </label>
                  </div>
                  <div className="upload-limits">
                    Max 5 photos, 10MB each
                  </div>
                </div>
                <div className="image-info">
                  {this.state.selectedImages.length > 0 && (
                    <span>{this.state.selectedImages.length} photo(s) selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="datetime-row">
              <div className="input-group-half">
                <label>📅 Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => this.handleInputChange('date', e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="input-group-half">
                <label>🕐 Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => this.handleInputChange('time', e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>

            <button 
              onClick={this.handleSubmit}
              className="submit-btn"
              disabled={this.state.uploading}
            >
              {this.state.uploading ? '📤 Uploading...' : '🔍 Record Sighting'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default WildlifeSightingModal

