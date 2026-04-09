import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

function LocationSearch({ initialValue = '', onLocationSelect, placeholder = 'Search for your pharmacy location...', className }) {
    const [query, setQuery] = useState(initialValue)
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const [searchedOnce, setSearchedOnce] = useState(false)

    // Update query when initialValue changes (e.g. after profile load)
    useEffect(() => {
        if (initialValue) {
            setQuery(initialValue)
        }
    }, [initialValue])

    const searchLocation = useCallback(async (searchQuery) => {
        let cleanQuery = searchQuery.trim()
        // Remove common prefixes that can confuse Nominatim's strict search
        cleanQuery = cleanQuery.replace(/^(near|in|at|around)\s+/i, '')

        if (cleanQuery.length < 3) {
            setSuggestions([])
            return
        }

        setLoading(true)
        setSearchedOnce(true)
        try {
            // Nominatim search API with Goa-focused parameters
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: cleanQuery,
                    format: 'json',
                    addressdetails: 1,
                    limit: 8,
                    countrycodes: 'in',
                    // Prioritize Goa: south, north, west, east
                    viewbox: '73.68,14.89,74.34,15.80',
                    bounded: 0
                },
                headers: {
                    // Custom User-Agent for Nominatim policy
                    'User-Agent': 'PharmaFind-Goa-Application'
                }
            })
            setSuggestions(response.data)
        } catch (error) {
            console.error('Error fetching locations:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query !== initialValue) {
                searchLocation(query)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query, searchLocation, initialValue])

    const handleSelect = (item) => {
        const { lat, lon, address, display_name } = item

        // Attempt to extract area and city
        const area = address.suburb || address.neighbourhood || address.village || address.town || address.hamlet || ''
        const city = address.city || address.county || address.state_district || address.state || ''

        setQuery(display_name)
        setSuggestions([])
        setShowSuggestions(false)

        onLocationSelect({
            latitude: lat,
            longitude: lon,
            area: area,
            city: city,
            displayName: display_name
        })
    }

    return (
        <div className="location-search-container" style={{ position: 'relative' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                autoComplete="off"
                className={className || "form-input"}
            />
            {loading && (
                <div
                    className="loading-spinner-sm"
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        border: '2px solid var(--border-color)',
                        borderTop: '2px solid var(--primary-color)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}
                ></div>
            )}

            {showSuggestions && (
                <ul className="suggestions-list">
                    {suggestions.length > 0 ? (
                        suggestions.map((item) => (
                            <li
                                key={item.place_id}
                                onMouseDown={() => handleSelect(item)}
                                className="suggestion-item"
                            >
                                <div style={{ fontWeight: '600' }}>{item.display_name.split(',')[0]}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.display_name}
                                </div>
                            </li>
                        ))
                    ) : (
                        query.length >= 3 && !loading && searchedOnce && (
                            <li className="suggestion-item" style={{ color: 'var(--text-secondary)', cursor: 'default' }}>
                                No results found. Try a specific place name.
                            </li>
                        )
                    )}
                </ul>
            )}
        </div>
    )
}

export default LocationSearch
