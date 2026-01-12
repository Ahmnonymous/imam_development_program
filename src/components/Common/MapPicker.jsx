import React, { useState, useEffect } from "react";
import { Card, CardBody, Alert, Input, Label, Row, Col } from "reactstrap";

/**
 * MapPicker Component
 * 
 * Allows users to manually enter latitude and longitude coordinates for the masjid location.
 * Google Maps integration is disabled due to CORS issues with keyless APIs.
 * 
 * @param {Object} props
 * @param {number} props.latitude - Current latitude value
 * @param {number} props.longitude - Current longitude value
 * @param {Function} props.onLocationChange - Callback when location changes (lat, lng)
 * @param {boolean} props.showMap - Whether to show the component (typically when masjid image is uploaded)
 */
const MapPicker = ({ latitude, longitude, onLocationChange, showMap = true }) => {
  const [latValue, setLatValue] = useState(latitude || "");
  const [lngValue, setLngValue] = useState(longitude || "");

  // Update local state when props change
  useEffect(() => {
    if (latitude !== undefined && latitude !== null) {
      setLatValue(latitude.toString());
    }
    if (longitude !== undefined && longitude !== null) {
      setLngValue(longitude.toString());
    }
  }, [latitude, longitude]);

  // Handle coordinate changes
  const handleLatChange = (e) => {
    const value = e.target.value;
    setLatValue(value);
    if (value && lngValue && onLocationChange) {
      const lat = parseFloat(value);
      const lng = parseFloat(lngValue);
      if (!isNaN(lat) && !isNaN(lng)) {
        onLocationChange(lat, lng);
      }
    }
  };

  const handleLngChange = (e) => {
    const value = e.target.value;
    setLngValue(value);
    if (value && latValue && onLocationChange) {
      const lat = parseFloat(latValue);
      const lng = parseFloat(value);
      if (!isNaN(lat) && !isNaN(lng)) {
        onLocationChange(lat, lng);
      }
    }
  };

  if (!showMap) {
    return null;
  }

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
            <strong>How to find coordinates:</strong>
            <ol className="mb-0 mt-2" style={{ fontSize: "0.875rem", paddingLeft: "1.5rem" }}>
              <li>Open <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> in a new tab</li>
              <li>Search for or navigate to your masjid location</li>
              <li>Right-click on the exact location on the map</li>
              <li>Click on the coordinates that appear (e.g., "-25.7479, 28.2293")</li>
              <li>Copy the latitude and longitude values</li>
              <li>Paste them into the fields below</li>
            </ol>
          </Alert>

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

          {latValue && lngValue && !isNaN(parseFloat(latValue)) && !isNaN(parseFloat(lngValue)) && (
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
        
        <div className="mt-2">
          <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
            <i className="bx bx-info-circle me-1"></i>
            <strong>Tip:</strong> You can also use GPS coordinates from your mobile device or other mapping services.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default MapPicker;
