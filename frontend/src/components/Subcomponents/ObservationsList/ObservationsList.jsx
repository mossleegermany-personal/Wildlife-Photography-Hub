import React, { Component } from 'react'
import '../../../css/Subcomponents/ObservationsList/ObservationsList.css'

class ObservationsList extends Component {
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

  render() {
    const { observations = [], selectedLocation, onClose } = this.props

   
    const locationCoords = observations.length > 0 && observations[0].coordinates && observations[0].coordinates !== 'Unknown Location' 
      ? observations[0].coordinates 
      : null;

    return (
      <div className="observations-column">
        <div className="observations-header">
          <div className="observations-title-section">
            <h3>Wildlife Observations</h3>
            <span className="observations-count">{observations.length} observation{observations.length !== 1 ? 's' : ''}</span>
            {locationCoords && (
              <div className="location-info">
                <span className="location-badge">📍 {locationCoords}</span>
              </div>
            )}
          </div>
          {onClose && (
            <button className="close-observations-btn" onClick={onClose} title="Close observations">
              ✕
            </button>
          )}
        </div>
        
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
      </div>
    )
  }
}

export default ObservationsList
