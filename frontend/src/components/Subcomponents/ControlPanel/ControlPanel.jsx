import React, { Component } from 'react'
import '../../../css/Subcomponents/ControlPanel/ControlPanel.css'

class ControlPanel extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      // Search and Filter state
      searchQuery: '',
      filterSpeciesType: '',
      filterLocation: ''
    }
  }

  // Get unique species types from transformedSightings
  getUniqueSpeciesTypes = () => {
    const { transformedSightings } = this.props
    if (!transformedSightings || transformedSightings.length === 0) {
      return []
    }
    
    const speciesTypes = transformedSightings
      .map(sighting => sighting.speciesType)
      .filter(type => type && type !== 'Unknown Type')
    
    return [...new Set(speciesTypes)].sort()
  }

  // Get unique locations from transformedSightings
  getUniqueLocations = () => {
    const { transformedSightings } = this.props
    if (!transformedSightings || transformedSightings.length === 0) {
      return []
    }
    
    const locations = transformedSightings
      .map(sighting => sighting.location)
      .filter(location => location && location !== 'Unknown Location')
    
    return [...new Set(locations)].sort()
  }

  // Handle search
  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value }, () => {
      this.applyFilters()
    })
  }

  // Handle filter changes
  handleFilterChange = (filterType, value) => {
    this.setState({ [filterType]: value }, () => {
      this.applyFilters()
    })
  }

  // Apply filters and notify parent component
  applyFilters = () => {
    const { searchQuery, filterSpeciesType, filterLocation } = this.state
    const { transformedSightings } = this.props
    
    if (!transformedSightings) return
    
    let filteredSightings = [...transformedSightings]
    
    // Apply search filter
    if (searchQuery) {
      filteredSightings = filteredSightings.filter(sighting =>
        sighting.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sighting.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply species type filter
    if (filterSpeciesType) {
      filteredSightings = filteredSightings.filter(sighting =>
        sighting.speciesType === filterSpeciesType
      )
    }
    
    // Apply location filter
    if (filterLocation) {
      filteredSightings = filteredSightings.filter(sighting =>
        sighting.location === filterLocation
      )
    }
    
    // Notify parent component with filtered results
    if (this.props.onFiltersApplied) {
      this.props.onFiltersApplied({
        filteredSightings,
        searchQuery,
        filterSpeciesType,
        filterLocation
      })
    }
  }

  // Clear all filters
  clearAllFilters = () => {
    this.setState({
      searchQuery: '',
      filterSpeciesType: '',
      filterLocation: ''
    }, () => {
      this.applyFilters()
    })
  }

  // Open the sighting modal
  openSightingModal = () => {
    console.log('🔍 Record button clicked!')
    console.log('onOpenSightingModal prop:', this.props.onOpenSightingModal)
    if (this.props.onOpenSightingModal) {
      this.props.onOpenSightingModal()
      console.log('✅ Modal should open now')
    } else {
      console.error('❌ onOpenSightingModal prop is missing!')
    }
  }

  render() {
    const { 
      searchQuery,
      filterSpeciesType,
      filterLocation
    } = this.state

    const uniqueSpeciesTypes = this.getUniqueSpeciesTypes()
    const uniqueLocations = this.getUniqueLocations()
    const { transformedSightings } = this.props
    const totalSightings = transformedSightings ? transformedSightings.length : 0

    return (
      <div className="control-panel">
        <div className="panel-header">
          <h2 className="panel-title">🦎 Wildlife Sightings Tracker</h2>
          <p className="panel-subtitle">
            Record and manage your wildlife observations ({totalSightings} sightings)
          </p>
        </div>

        <div className="panel-actions">
          <button 
            className="record-btn"
            onClick={this.openSightingModal}
          >
            📝 Record New Sighting
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search by species name or location..."
              value={searchQuery}
              onChange={this.handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={filterSpeciesType}
              onChange={(e) => this.handleFilterChange('filterSpeciesType', e.target.value)}
              className="filter-select"
            >
              <option value="">All Species Types</option>
              {uniqueSpeciesTypes.map(type => (
                <option key={type} value={type}>{type}s</option>
              ))}
            </select>

            <select
              value={filterLocation}
              onChange={(e) => this.handleFilterChange('filterLocation', e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <button 
              onClick={this.clearAllFilters}
              className="clear-filters-btn"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ControlPanel
