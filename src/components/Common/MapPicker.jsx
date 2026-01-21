import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardBody, Alert, Input, Label, Row, Col } from "reactstrap";
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const containerStyle = {
  width: '100%',
  height: '400px',
};

/**
 * MapPicker Component
 * 
 * Allows users to search for locations, click on a Google Map, or manually enter coordinates for the masjid location.
 * 
 * @param {Object} props
 * @param {number|string} props.latitude - Current latitude value
 * @param {number|string} props.longitude - Current longitude value
 * @param {Function} props.onLocationChange - Callback when location changes (lat, lng)
 * @param {boolean} props.showMap - Whether to show the component (typically when masjid image is uploaded)
 */
const MapPicker = ({ latitude, longitude, onLocationChange, showMap = true }) => {
  const [latValue, setLatValue] = useState("");
  const [lngValue, setLngValue] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: -25.7479, lng: 28.2293 }); // Default: South Africa
  const [markerPosition, setMarkerPosition] = useState(null);
  const autocompleteRef = useRef(null);

  // Update local state when props change
  useEffect(() => {
    const lat = latitude !== undefined && latitude !== null && latitude !== "" ? parseFloat(latitude) : null;
    const lng = longitude !== undefined && longitude !== null && longitude !== "" ? parseFloat(longitude) : null;
    
    if (lat !== null && !isNaN(lat)) {
      setLatValue(lat.toString());
    } else {
      setLatValue("");
    }
    
    if (lng !== null && !isNaN(lng)) {
      setLngValue(lng.toString());
    } else {
      setLngValue("");
    }

    // Set map center and marker if coordinates exist
    if (lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng)) {
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
    }
  }, [latitude, longitude]);

  // Handle autocomplete place selection
  const handlePlaceSelect = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setLatValue(lat.toString());
        setLngValue(lng.toString());
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });
        
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
      }
    }
  }, [onLocationChange]);

  // Handle autocomplete load
  const onLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  // Handle map click to set coordinates
  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setLatValue(lat.toString());
    setLngValue(lng.toString());
    setMarkerPosition({ lat, lng });
    
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  // Handle manual coordinate changes
  const handleLatChange = (e) => {
    const value = e.target.value;
    setLatValue(value);
    
    const lat = parseFloat(value);
    const lng = parseFloat(lngValue);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    } else if (!isNaN(lat)) {
      setMarkerPosition({ lat, lng: mapCenter.lng });
      setMapCenter(prev => ({ ...prev, lat }));
    }
  };

  const handleLngChange = (e) => {
    const value = e.target.value;
    setLngValue(value);
    
    const lat = parseFloat(latValue);
    const lng = parseFloat(value);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    } else if (!isNaN(lng)) {
      setMarkerPosition({ lat: mapCenter.lat, lng });
      setMapCenter(prev => ({ ...prev, lng }));
    }
  };

  if (!showMap) {
    return null;
  }

  const hasValidCoordinates = latValue && lngValue && !isNaN(parseFloat(latValue)) && !isNaN(parseFloat(lngValue));

  return (
    <Card className="mt-3">
      <CardBody>
        <div className="mb-3">
          <h6 className="mb-2">
            <i className="bx bx-map me-2"></i>
            Masjid Location Coordinates
          </h6>
          
          <Alert color="info" className="mb-3" style={{ fontSize: "0.875rem" }}>
            <i className="bx bx-info-circle me-2"></i>
            <strong>Instructions:</strong> Search for a masjid location, click on the map, or manually enter coordinates in the fields below.
          </Alert>

          {/* Wrap both Autocomplete and Map in a single LoadScript */}
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
            loadingElement={<div style={{ height: `400px` }}>Loading...</div>}
            errorElement={
              <Alert color="warning" className="mb-3">
                <strong>Google Maps Error:</strong> Please ensure the following APIs are enabled in Google Cloud Console:
                <ul className="mt-2 mb-0">
                  <li>Maps JavaScript API</li>
                  <li>Places API (required for search)</li>
                  <li>Geocoding API (optional, but recommended)</li>
                </ul>
                <small className="d-block mt-2">
                  Also ensure billing is enabled and the API key has proper restrictions configured.
                </small>
              </Alert>
            }
          >
            {/* Search Input with Autocomplete */}
            <div className="mb-3">
              <Label className="form-label" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                <i className="bx bx-search me-1"></i>
                Search for Masjid Location
              </Label>
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={handlePlaceSelect}
                options={{
                  types: ['establishment', 'geocode'],
                }}
              >
                <input
                  type="text"
                  placeholder="Search for masjid name or address (e.g., 'Masjid Johannesburg' or 'Cape Town Mosque')"
                  className="form-control"
                  style={{
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                    width: "100%",
                  }}
                />
              </Autocomplete>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Start typing to see suggestions. Select a location from the dropdown list.
              </small>
            </div>

            {/* Google Map */}
            <div className="mb-3" style={{ border: "1px solid #dee2e6", borderRadius: "0.25rem", overflow: "hidden" }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={markerPosition ? 15 : 10}
                onClick={handleMapClick}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(event) => {
                      const lat = event.latLng.lat();
                      const lng = event.latLng.lng();
                      setLatValue(lat.toString());
                      setLngValue(lng.toString());
                      setMarkerPosition({ lat, lng });
                      if (onLocationChange) {
                        onLocationChange(lat, lng);
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </LoadScript>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <Label className="form-label" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  <i className="bx bx-navigation me-1"></i>
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Enter latitude (e.g., -25.7479)"
                  value={latValue}
                  onChange={handleLatChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Latitude ranges from -90 to 90. For South Africa, typically between -22 and -35.
                </small>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <Label className="form-label" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  <i className="bx bx-navigation me-1"></i>
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Enter longitude (e.g., 28.2293)"
                  value={lngValue}
                  onChange={handleLngChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Longitude ranges from -180 to 180. For South Africa, typically between 16 and 33.
                </small>
              </div>
            </Col>
          </Row>

          {hasValidCoordinates && (
            <Alert color="success" className="py-2 mb-2" style={{ fontSize: "0.875rem" }}>
              <i className="bx bx-check-circle me-2"></i>
              <strong>Coordinates Set:</strong> {parseFloat(latValue).toFixed(6)}, {parseFloat(lngValue).toFixed(6)}
              <br />
              <small className="text-muted">
                <a 
                  href={`https://www.google.com/maps?q=${latValue},${lngValue}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <i className="bx bx-map me-1"></i>
                  View on Google Maps
                </a>
              </small>
            </Alert>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MapPicker;
