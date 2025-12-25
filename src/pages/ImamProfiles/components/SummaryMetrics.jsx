import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const SummaryMetrics = ({
  imamProfileId,
  medicalReimbursement,
  communityEngagement,
  jumuahKhutbahTopicSubmission,
  jumuahAudioKhutbah,
}) => {
  if (!imamProfileId) return null;

  // Ensure metrics reflect ONLY the selected imam profile
  const medicalForImam = (medicalReimbursement || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );
  const engagementsForImam = (communityEngagement || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );
  const topicsForImam = (jumuahKhutbahTopicSubmission || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );
  const audioForImam = (jumuahAudioKhutbah || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );

  // Calculate totals
  const totalMedicalAmount = medicalForImam.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalEngagements = engagementsForImam.length;
  const totalTopics = topicsForImam.length;
  const totalAudio = audioForImam.length;

  const metrics = [
    {
      title: "Medical",
      value: medicalForImam.length,
      icon: "bx-money",
      color: "primary",
    },
    {
      title: "Community",
      value: totalEngagements,
      icon: "bx-home",
      color: "success",
    },
    {
      title: "Topics",
      value: totalTopics,
      icon: "bx-book",
      color: "info",
    },
    {
      title: "Audio",
      value: totalAudio,
      icon: "bx-music",
      color: "warning",
    },
  ];

  return (
    <Row className="mb-3">
      {metrics.map((metric, index) => (
        <Col xl={3} md={6} sm={12} key={index}>
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium mb-1">{metric.title}</p>
                  <h4 className="mb-0">{metric.value}</h4>
                </div>
                <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                  <span className={`avatar-title rounded-circle bg-${metric.color}`}>
                    <i className={`bx ${metric.icon} font-size-24`}></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryMetrics;
