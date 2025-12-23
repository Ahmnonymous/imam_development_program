import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const SummaryMetrics = ({ 
  imamProfileId, 
  jumuahKhutbahTopics, 
  jumuahAudioKhutbah, 
  pearlsOfWisdom,
  medicalReimbursements,
  communityEngagements,
  nikahBonuses,
  newMuslimBonuses,
  newBabyBonuses
}) => {
  // Ensure metrics reflect ONLY the selected imam profile
  const topicsForImam = (jumuahKhutbahTopics || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const audioForImam = (jumuahAudioKhutbah || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const pearlsForImam = (pearlsOfWisdom || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const medicalForImam = (medicalReimbursements || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const engagementForImam = (communityEngagements || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const nikahForImam = (nikahBonuses || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const newMuslimForImam = (newMuslimBonuses || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));
  const newBabyForImam = (newBabyBonuses || []).filter((x) => String(x.imam_profile_id) === String(imamProfileId));

  // Calculate totals
  const totalMedicalReimbursement = medicalForImam.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const totalNikahBonus = nikahForImam.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const totalNewMuslimBonus = newMuslimForImam.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const totalNewBabyBonus = newBabyForImam.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const topicCount = topicsForImam.length;
  const audioCount = audioForImam.length;
  const pearlsCount = pearlsForImam.length;
  const engagementCount = engagementForImam.length;
  const totalBonuses = totalNikahBonus + totalNewMuslimBonus + totalNewBabyBonus;

  const metrics = [
    {
      title: "Khutbah Topics",
      value: topicCount,
      icon: "bx-book",
      color: "primary"
    },
    {
      title: "Audio Khutbah",
      value: audioCount,
      icon: "bx-headphone",
      color: "success"
    },
    {
      title: "Pearls of Wisdom",
      value: pearlsCount,
      icon: "bx-diamond",
      color: "warning"
    },
    {
      title: "Community Engagements",
      value: engagementCount,
      icon: "bx-group",
      color: "info"
    },
    {
      title: "Medical Reimbursements",
      value: `R ${totalMedicalReimbursement.toFixed(2)}`,
      icon: "bx-clinic",
      color: "danger"
    },
    {
      title: "Total Bonuses",
      value: `R ${totalBonuses.toFixed(2)}`,
      icon: "bx-money",
      color: "primary"
    },
  ];

  return (
    <Row className="mb-3">
      {metrics.map((metric, index) => (
        <Col xl={4} md={6} sm={12} key={index}>
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium">
                    {metric.title}
                  </p>
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

