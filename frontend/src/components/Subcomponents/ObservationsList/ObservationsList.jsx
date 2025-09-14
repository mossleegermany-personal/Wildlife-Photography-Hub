import React, { Component } from 'react'
import '@css/Subcomponents/ObservationsList/ObservationsList.css'

class ObservationsList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showGalleryModal: false,
      selectedImages: [],
      currentImageIndex: 0,
      viewMode: 'list' // 'list' or 'gallery'
    }
  }

  // Get appropriate emoji for species type
  getSpeciesEmoji = (speciesType) => {
    const emojiMap = {
      'Bird': '🦅',
      'Mammal': '🦌',
      'Reptile': '🦎',
      'Amphibian': '🐸',
      'Fish': '🐟',
      'Insect': '🦗',
      'Arthropod': '🕷️',
      'Marine': '🐠'
    }
    
    return emojiMap[speciesType] || emojiMap['Default']
  }

  openGallery = (images, startIndex = 0) => {
    this.setState({
      showGalleryModal: true,
      selectedImages: images,
      currentImageIndex: startIndex
    })
  }

  closeGallery = () => {
    this.setState({
      showGalleryModal: false,
      selectedImages: [],
      currentImageIndex: 0
    })
  }

  toggleViewMode = () => {
    this.setState(prevState => ({
      viewMode: prevState.viewMode === 'list' ? 'gallery' : 'list'
    }))
  }

  navigateImage = (direction) => {
    const { selectedImages, currentImageIndex } = this.state
    if (direction === 'next') {
      this.setState({
        currentImageIndex: (currentImageIndex + 1) % selectedImages.length
      })
    } else {
      this.setState({
        currentImageIndex: currentImageIndex === 0 ? selectedImages.length - 1 : currentImageIndex - 1
      })
    }
  }

  renderImageGallery = (observation) => {
    if (!observation.images || observation.images.length === 0) {
      return null
    }

    return (
      <div className="observation-gallery">
        <div className="gallery-header">
          <span className="gallery-title">📷 Photos ({observation.images.length})</span>
          <button 
            className="view-all-btn"
            onClick={() => this.openGallery(observation.images)}
          >
            View All
          </button>
        </div>
        <div className="gallery-thumbnails">
          {observation.images.slice(0, 3).map((image, index) => (
            <div 
              key={index} 
              className="gallery-thumbnail"
              onClick={() => this.openGallery(observation.images, index)}
            >
              <img 
                src={image.data || image.url} 
                alt={`${observation.species} photo ${index + 1}`}
              />
              {index === 2 && observation.images.length > 3 && (
                <div className="more-overlay">
                  +{observation.images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  renderListView = () => {
    const { observations = [] } = this.props
    
    return (
      <div className="observations-list">
        {observations.length > 0 ? (
          observations.map((observation) => (
            <div key={observation.id} className="observation-item">
              <div className="observation-header">
                <h4 className="species-name">{observation.species}</h4>
                <span className="observation-date">{observation.date}</span>
              </div>
              
              <div className="observation-details">
                <div className="species-info">
                  <span className="species-type">{this.getSpeciesEmoji(observation.speciesType)} Type: {observation.speciesType}</span>
                </div>
                
                <div className="location-time">
                  <span className="time">🕒 {observation.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-observations">
            <div className="no-observations-content">
              <span className="no-observations-icon">🔍</span>
              <p>No wildlife observations found for this location.</p>
              <span className="no-observations-hint">Try clicking on a different marker!</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderGalleryView = () => {
    const { observations = [] } = this.props
    
    // Collect all images from all observations
    const allImages = observations.reduce((acc, observation) => {
      if (observation.images && observation.images.length > 0) {
        observation.images.forEach(image => {
          acc.push({
            ...image,
            species: observation.species,
            speciesType: observation.speciesType,
            date: observation.date,
            time: observation.time,
            observationId: observation.id
          })
        })
      }
      return acc
    }, [])

    return (
      <div className="gallery-grid-container">
        {allImages.length > 0 ? (
          <div className="gallery-grid">
            {allImages.map((image, index) => (
              <div 
                key={`${image.observationId}-${index}`}
                className="gallery-grid-item"
                onClick={() => this.openGallery(allImages, index)}
              >
                <div className="gallery-grid-image">
                  <img 
                    src={image.data || image.url} 
                    alt={`${image.species} photo`}
                  />
                  <div className="gallery-grid-overlay">
                    <div className="image-info">
                      <span className="species-name">{image.species}</span>
                      <span className="image-date">{image.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-observations">
            <div className="no-observations-content">
              <span className="no-observations-icon">📷</span>
              <p>No photos found for this location.</p>
              <span className="no-observations-hint">Upload some wildlife photos to see them here!</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  render() {
    const { observations = [], selectedLocation, onClose } = this.props
    const { showGalleryModal, selectedImages, currentImageIndex, viewMode } = this.state
    const locationCoords = observations.length > 0 && observations[0].coordinates && observations[0].coordinates !== 'Unknown Location' 
      ? observations[0].coordinates 
      : null;

    return (
      <>
        <div className="observations-column">
          <div className="observations-header">
            <div className="observations-title-section">
              <h3>Wildlife Observations</h3>
              <span className="observations-count">{observations.length} observation{observations.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="observations-controls">
              <div className="view-toggle">
                <button 
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => this.setState({ viewMode: 'list' })}
                >
                  📋 List
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                  onClick={() => this.setState({ viewMode: 'gallery' })}
                >
                  🖼️ Gallery
                </button>
              </div>
              {onClose && (
                <button className="close-observations-btn" onClick={onClose} title="Close observations">
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {viewMode === 'list' ? this.renderListView() : this.renderGalleryView()}
        </div>

        {/* Gallery Modal */}
        {showGalleryModal && (
          <div className="gallery-modal-backdrop" onClick={this.closeGallery}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
              <div className="gallery-modal-header">
                <h3>Wildlife Photos</h3>
                <button className="gallery-close-btn" onClick={this.closeGallery}>
                  ✕
                </button>
              </div>
              
              <div className="gallery-modal-content">
                <div className="gallery-main-image">
                  {selectedImages.length > 1 && (
                    <button 
                      className="gallery-nav-btn gallery-prev"
                      onClick={() => this.navigateImage('prev')}
                    >
                      ←
                    </button>
                  )}
                  
                  <img 
                    src={selectedImages[currentImageIndex]?.data || selectedImages[currentImageIndex]?.url}
                    alt={`Wildlife photo ${currentImageIndex + 1}`}
                  />
                  
                  {selectedImages.length > 1 && (
                    <button 
                      className="gallery-nav-btn gallery-next"
                      onClick={() => this.navigateImage('next')}
                    >
                      →
                    </button>
                  )}
                </div>
                
                {selectedImages.length > 1 && (
                  <div className="gallery-thumbnails-row">
                    {selectedImages.map((image, index) => (
                      <div 
                        key={index}
                        className={`gallery-thumb ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => this.setState({ currentImageIndex: index })}
                      >
                        <img 
                          src={image.data || image.url}
                          alt={`Thumbnail ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="gallery-info">
                  <span>Image {currentImageIndex + 1} of {selectedImages.length}</span>
                  {selectedImages[currentImageIndex]?.name && (
                    <span className="image-name">{selectedImages[currentImageIndex].name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
}

export default ObservationsList
