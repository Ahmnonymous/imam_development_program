import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Badge,
} from "reactstrap";
import { API_STREAM_BASE_URL } from "../../../helpers/url_helper";
import { useRole } from "../../../helpers/useRole";

const BoreholeSummary = ({ borehole, imamProfile, lookupData, onUpdate, showAlert }) => {
  const { isOrgExecutive } = useRole();

  const getLookupValue = (lookupArray, id) => {
    if (!id || !lookupArray) return "N/A";
    const item = lookupArray.find(x => Number(x.id) === Number(id));
    return item ? item.name : "N/A";
  };


  if (!borehole) return null;

  return (
    <Card className="border shadow-sm mb-4">
      <div className="card-header bg-transparent border-bottom py-3">
        <h5 className="card-title mb-0 fw-semibold font-size-16">
          <i className="bx bx-droplet me-2 text-primary"></i>
          Borehole Information
          <Badge color="success" className="ms-2">Approved</Badge>
        </h5>
      </div>
      <CardBody className="py-3">
        <Row>
          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Imam Profile</h6>
            <p className="mb-0">
              <strong>{imamProfile?.name} {imamProfile?.surname}</strong>
              {imamProfile?.id_number && (
                <span className="text-muted ms-2">(ID: {imamProfile.id_number})</span>
              )}
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Has Electricity</h6>
            <p className="mb-0">{getLookupValue(lookupData?.yesNo, borehole.has_electricity)}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Received Borehole Before</h6>
            <p className="mb-0">{getLookupValue(lookupData?.yesNo, borehole.received_borehole_before)}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Current Water Source</h6>
            <p className="mb-0">{getLookupValue(lookupData?.waterSource, borehole.current_water_source)}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Distance to Water Source (KM)</h6>
            <p className="mb-0">{borehole.distance_to_water_source || "N/A"}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Beneficiaries Count</h6>
            <p className="mb-0">{borehole.beneficiaries_count || "N/A"}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Latitude</h6>
            <p className="mb-0">{borehole.latitude || "N/A"}</p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-muted mb-1">Longitude</h6>
            <p className="mb-0">{borehole.longitude || "N/A"}</p>
          </Col>

          {borehole.water_usage_purpose_ids && Array.isArray(borehole.water_usage_purpose_ids) && borehole.water_usage_purpose_ids.length > 0 && (
            <Col md={12} className="mb-3">
              <h6 className="text-muted mb-2">Water Usage Purpose</h6>
              <div className="d-flex flex-wrap gap-2">
                {borehole.water_usage_purpose_ids.map((purposeId) => {
                  const purpose = getLookupValue(lookupData?.waterUsagePurpose, purposeId);
                  return (
                    <Badge key={purposeId} color="info" className="p-2">
                      {purpose}
                    </Badge>
                  );
                })}
              </div>
            </Col>
          )}

          <Col md={12} className="mb-3">
            <h6 className="text-muted mb-1">Challenges Due to Lack of Water</h6>
            <p className="mb-0">{borehole.challenges_due_to_lack_of_water || "N/A"}</p>
          </Col>

          <Col md={12} className="mb-3">
            <h6 className="text-muted mb-1">Motivation</h6>
            <p className="mb-0">{borehole.motivation || "N/A"}</p>
          </Col>

          {borehole.comment && (
            <Col md={12} className="mb-3">
              <h6 className="text-muted mb-1">Comment</h6>
              <p className="mb-0">{borehole.comment}</p>
            </Col>
          )}

          {(borehole.current_water_source_image || borehole.masjid_area_image) && (
            <Col md={12} className="mb-3">
              <h6 className="text-muted mb-2">Images</h6>
              <div className="d-flex gap-3">
                {borehole.current_water_source_image && (
                  <div>
                    <a
                      href={`${API_STREAM_BASE_URL}/borehole/${borehole.id}/view-current-water-source-image`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bx bx-image me-1"></i>
                      Current Water Source
                    </a>
                  </div>
                )}
                {borehole.masjid_area_image && (
                  <div>
                    <a
                      href={`${API_STREAM_BASE_URL}/borehole/${borehole.id}/view-masjid-area-image`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bx bx-image me-1"></i>
                      Masjid Area
                    </a>
                  </div>
                )}
              </div>
            </Col>
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default BoreholeSummary;

