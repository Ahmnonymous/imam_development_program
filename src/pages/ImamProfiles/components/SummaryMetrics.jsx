import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const SummaryMetrics = ({
  imamProfileId,
  medicalReimbursements,
  communityEngagements,
  jumuahKhutbahTopics,
}) => {
  // Ensure metrics reflect ONLY the selected imam profile
  const medicalForImam = (medicalReimbursements || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );
  const engagementsForImam = (communityEngagements || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );
  const topicsForImam = (jumuahKhutbahTopics || []).filter(
    (x) => String(x.imam_profile_id) === String(imamProfileId)
  );

  // Calculate totals
  const totalMedicalReimbursement = medicalForImam.reduce(
    (sum, item) => sum + (parseFloat(item.reimbursement_amount) || 0),
    0
  );
  const totalEngagements = engagementsForImam.length;
  const totalKhutbahTopics = topicsForImam.length;

  const metrics = [
    {
      title: "Medical Reimbursement",
      value: `R ${totalMedicalReimbursement.toFixed(2)}`,
      icon: "bx-money",
      color: "primary",
    },
    {
      title: "Community Engagements",
      value: totalEngagements,
      icon: "bx-home",
      color: "success",
    },
    {
      title: "Khutbah Topics",
      value: totalKhutbahTopics,
      icon: "bx-book",
      color: "info",
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
                  <p className="text-muted fw-medium">{metric.title}</p>
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
