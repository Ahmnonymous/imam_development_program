import React, { useState } from 'react';
import { Card, CardBody, Row, Col, Collapse, Button, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';

const ReportsMenu = () => {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const reportSections = [
        {
            id: 'imam-reports',
            title: 'Imam Reports',
            icon: 'bx bx-user',
            color: 'primary',
            reports: [
                {
                    id: 'imam-details',
                    title: 'Imam Details',
                    description: 'View comprehensive imam profile information',
                    icon: 'bx bx-user',
                    path: '/reports/imam-details',
                    color: 'primary'
                }
            ]
        },
        {
            id: 'financial-assistance-reports',
            title: 'Financial & Assistance Reports',
            icon: 'bx bx-money',
            color: 'success',
            reports: [
                {
                    id: 'hardship-relief',
                    title: 'Hardship Relief',
                    description: 'Hardship relief requests and assistance provided',
                    icon: 'bx bx-heart',
                    path: '/reports/hardship-relief',
                    color: 'danger'
                },
                {
                    id: 'medical-reimbursement',
                    title: 'Medical Reimbursement',
                    description: 'Medical reimbursement requests',
                    icon: 'bx bx-plus-medical',
                    path: '/reports/medical-reimbursement',
                    color: 'danger'
                },
                {
                    id: 'waqf-loan',
                    title: 'WAQF Loan',
                    description: 'WAQF loan applications and requests',
                    icon: 'bx bx-money',
                    path: '/reports/waqf-loan',
                    color: 'primary'
                },
                {
                    id: 'total-financial',
                    title: 'Total Financial Assistance',
                    description: 'Complete financial assistance summary including food and cash assistance',
                    icon: 'bx bx-money',
                    path: '/reports/total-financial-assistance',
                    color: 'success',
                    hasSubItems: true,
                    subItems: [
                        {
                            id: 'financial-assistance',
                            title: 'Financial Assistance',
                            description: 'Cash and financial support provided',
                            icon: 'bx bx-credit-card',
                            path: '/reports/financial-assistance'
                        },
                        {
                            id: 'food-assistance',
                            title: 'Food Assistance',
                            description: 'Food hampers and meal support provided',
                            icon: 'bx bx-home',
                            path: '/reports/food-assistance'
                        }
                    ]
                }
            ]
        },
        {
            id: 'bonus-reports',
            title: 'Bonus Reports',
            icon: 'bx bx-gift',
            color: 'warning',
            reports: [
                {
                    id: 'new-baby-bonus',
                    title: 'New Baby Bonus',
                    description: 'New baby bonus applications',
                    icon: 'bx bx-baby',
                    path: '/reports/new-baby-bonus',
                    color: 'success'
                },
                {
                    id: 'new-muslim-bonus',
                    title: 'New Muslim Bonus',
                    description: 'New Muslim revert bonus applications',
                    icon: 'bx bx-user-circle',
                    path: '/reports/new-muslim-bonus',
                    color: 'primary'
                },
                {
                    id: 'nikah-bonus',
                    title: 'Nikah Bonus',
                    description: 'Nikah bonus applications',
                    icon: 'bx bx-heart-circle',
                    path: '/reports/nikah-bonus',
                    color: 'danger'
                }
            ]
        },
        {
            id: 'educational-reports',
            title: 'Educational & Development Reports',
            icon: 'bx bx-book',
            color: 'info',
            reports: [
                {
                    id: 'continuous-professional-development',
                    title: 'Continuous Professional Development',
                    description: 'CPD courses and professional development activities',
                    icon: 'bx bx-graduation',
                    path: '/reports/continuous-professional-development',
                    color: 'success'
                },
                {
                    id: 'higher-education-request',
                    title: 'Higher Education Request',
                    description: 'Higher education course requests and applications',
                    icon: 'bx bx-book-reader',
                    path: '/reports/higher-education-request',
                    color: 'warning'
                },
                {
                    id: 'pearls-of-wisdom',
                    title: 'Pearls of Wisdom',
                    description: 'Pearls of wisdom submissions',
                    icon: 'bx bx-book',
                    path: '/reports/pearls-of-wisdom',
                    color: 'warning'
                },
                {
                    id: 'skills-matrix',
                    title: 'Skills Matrix Report',
                    description: 'Employee training courses, certifications, and expiry status',
                    icon: 'bx bx-award',
                    path: '/reports/skills-matrix',
                    color: 'dark'
                }
            ]
        },
        {
            id: 'community-reports',
            title: 'Community & Engagement Reports',
            icon: 'bx bx-group',
            color: 'secondary',
            reports: [
                {
                    id: 'community-engagement',
                    title: 'Community Engagement',
                    description: 'Community engagement activities and events',
                    icon: 'bx bx-group',
                    path: '/reports/community-engagement',
                    color: 'info'
                },
                {
                    id: 'jumuah-audio-khutbah',
                    title: 'Jumuah Audio Khutbah',
                    description: 'Jumuah audio khutbah submissions',
                    icon: 'bx bx-microphone',
                    path: '/reports/jumuah-audio-khutbah',
                    color: 'info'
                },
                {
                    id: 'jumuah-khutbah-topic-submission',
                    title: 'Jumuah Khutbah Topic Submission',
                    description: 'Jumuah khutbah topic submissions',
                    icon: 'bx bx-file-blank',
                    path: '/reports/jumuah-khutbah-topic-submission',
                    color: 'secondary'
                },
                {
                    id: 'tree-requests',
                    title: 'Tree Requests',
                    description: 'Tree planting requests',
                    icon: 'bx bx-tree',
                    path: '/reports/tree-requests',
                    color: 'success'
                },
                {
                    id: 'home-visits',
                    title: 'Home Visits',
                    description: 'Records of home visits conducted by representatives',
                    icon: 'bx bx-car',
                    path: '/reports/home-visits',
                    color: 'info'
                }
            ]
        },
        {
            id: 'infrastructure-reports',
            title: 'Infrastructure Reports',
            icon: 'bx bx-buildings',
            color: 'primary',
            reports: [
                {
                    id: 'borehole',
                    title: 'Borehole',
                    description: 'Borehole requests and construction details',
                    icon: 'bx bx-water',
                    path: '/reports/borehole',
                    color: 'primary'
                }
            ]
        },
        {
            id: 'relationship-reports',
            title: 'Relationship Reports',
            icon: 'bx bx-group',
            color: 'primary',
            reports: [
                {
                    id: 'relationship-report',
                    title: 'Relationship Report',
                    description: 'Family members and dependents',
                    icon: 'bx bx-group',
                    path: '/reports/relationship-report',
                    color: 'secondary'
                }
            ]
        },
        {
            id: 'administrative-reports',
            title: 'Administrative Reports',
            icon: 'bx bx-cog',
            color: 'dark',
            reports: [
                {
                    id: 'tickets',
                    title: 'Tickets',
                    description: 'Support tickets and issue tracking',
                    icon: 'bx bx-ticket',
                    path: '/reports/tickets',
                    color: 'dark'
                }
            ]
        }
    ];

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="container-fluid">
                    {/* Header */}
                    <Row>
                        <Col lg={12}>
                            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                                <h4 className="mb-sm-0">
                                    <i className="bx bx-bar-chart-alt-2 me-2"></i>
                                    Reports Dashboard
                                </h4>
                                <div className="page-title-right">
                                    <ol className="breadcrumb m-0">
                                        <li className="breadcrumb-item">
                                            <Link to="/dashboard">Dashboard</Link>
                                        </li>
                                        <li className="breadcrumb-item active">Reports</li>
                                    </ol>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Reports Sections with Dropdown */}
                    <Row>
                        <Col lg={12}>
                            {reportSections.map((section) => (
                                <Card key={section.id} className="mb-3 border">
                                    <CardBody className="p-0">
                                        <Button
                                            color="link"
                                            className="w-100 text-start p-3 text-decoration-none"
                                            onClick={() => toggleSection(section.id)}
                                            style={{ boxShadow: 'none' }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <div className={`avatar-sm rounded-circle bg-soft-${section.color} text-${section.color} me-3`}>
                                                        <i className={`${section.icon} font-size-18`}></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-0 text-dark">
                                                            {section.title}
                                                            <Badge color={section.color} className="ms-2">
                                                                {section.reports.length}
                                                            </Badge>
                                                        </h5>
                                                        <small className="text-muted">
                                                            {section.reports.length} {section.reports.length === 1 ? 'report' : 'reports'} available
                                                        </small>
                                                    </div>
                                                </div>
                                                <i className={`bx ${openSections[section.id] ? 'bx-chevron-up' : 'bx-chevron-down'} font-size-20 text-muted`}></i>
                                            </div>
                                        </Button>
                                        
                                        <Collapse isOpen={openSections[section.id]}>
                                            <div className="p-3 border-top">
                                                <Row>
                                                    {section.reports.map((report) => (
                                                        <Col key={report.id} lg={6} xl={4} className="mb-3">
                                                            <Card className="border h-100">
                                                                <CardBody>
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <div className={`avatar-sm rounded-circle bg-soft-${report.color} text-${report.color} me-3`}>
                                                                            <i className={`${report.icon} font-size-18`}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="mb-1">{report.title}</h6>
                                                                            <p className="text-muted mb-0 small">{report.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {report.hasSubItems && report.subItems && (
                                                                        <div className="mt-3 mb-3">
                                                                            <h6 className="mb-2 small text-muted">Sub-reports:</h6>
                                                                            <div className="d-flex flex-wrap gap-1">
                                                                                {report.subItems.map((subItem) => (
                                                                                    <Link
                                                                                        key={subItem.id}
                                                                                        to={subItem.path}
                                                                                        className="btn btn-outline-secondary btn-sm"
                                                                                    >
                                                                                        <i className={`${subItem.icon} me-1`}></i>
                                                                                        {subItem.title}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="mt-3">
                                                                        <Link
                                                                            to={report.path}
                                                                            className={`btn btn-${report.color} btn-sm w-100`}
                                                                        >
                                                                            <i className="bx bx-show me-1"></i>
                                                                            View Report
                                                                        </Link>
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        </Collapse>
                                    </CardBody>
                                </Card>
                            ))}
                        </Col>
                    </Row>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ReportsMenu;
