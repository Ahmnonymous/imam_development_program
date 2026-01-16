import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import withRouter from "../Common/withRouter";
import classname from "classnames";

//i18n
import { withTranslation } from "react-i18next";

import { connect } from "react-redux";

// ✅ Import role-based access control helper
import { useRole } from "../../helpers/useRole";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";

const Navbar = (props) => {
  const [management, setManagement] = useState(false);
  const [reports, setReports] = useState(false);
  const [personal, setPersonal] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [pages, setPages] = useState(false);
  
  // ✅ Get user role information
  const {
    canAccessNav,
    canEditModule,
    isOrgExecutive,
    userType,
  } = useRole();
  
  const [imamProfileStatus, setImamProfileStatus] = useState(null);

  // Check Imam User profile status
  useEffect(() => {
    const checkImamProfileStatus = async () => {
      if (userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          setImamProfileStatus(response.data?.status_id || null);
        } catch (error) {
          setImamProfileStatus(null);
        }
      }
    };
    checkImamProfileStatus();
  }, [userType]);

  useEffect(() => {
    var matchingMenuItem = null;
    var ul = document.getElementById("navigation");
    var items = ul.getElementsByTagName("a");
    removeActivation(items);
    for (var i = 0; i < items.length; ++i) {
      if (window.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  });

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        if (parent.classList.contains("active")) {
          parent.classList.remove("active");
        }
      }
    }
  };

  function activateParentDropdown(item) {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  return (
    <React.Fragment>
      <div className="topnav">
        <div className="container-fluid">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse
              isOpen={props.leftMenu}
              className="navbar-collapse"
              id="topnav-menu-content"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    <i className="bx bx-bar-chart-alt-2 me-2"></i>
                    {props.t("Dashboard")}
                  </Link>
                </li>

                {/* Management dropdown – render only when at least one item is accessible */}
                {(() => {
                  const managementLinks = [
                  ].filter(Boolean);

                  if (!managementLinks.length) {
                    return null;
                  }

                  return (
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle arrow-none"
                      to="/#"
                      onClick={(e) => {
                        e.preventDefault();
                        setManagement(!management);
                      }}
                    >
                      <i className="bx bx-buildings me-2"></i>
                      {props.t("Management")} <div className="arrow-down"></div>
                    </Link>
                    <div className={classname("dropdown-menu", { show: management })}>
                      {managementLinks}
                    </div>
                  </li>
                  );
                })()}


                {/* Reports dropdown */}
                {canAccessNav("reports") && (
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle arrow-none"
                      to="/#"
                      onClick={(e) => {
                        e.preventDefault();
                        setReports(!reports);
                      }}
                    >
                      <i className="bx bx-file-find me-2"></i>
                      {props.t("Reports")} <div className="arrow-down"></div>
                    </Link>
                    <div className={classname("dropdown-menu dropdown-menu-lg", { show: reports })} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                      <Link to="/reports" className="dropdown-item">
                        <i className="bx bx-bar-chart-alt-2 me-2"></i>
                        {props.t("Reports Dashboard")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-user me-2"></i>
                        {props.t("Imam Reports")}
                      </h6>
                      <Link to="/reports/imam-details" className="dropdown-item">
                        <i className="bx bx-user me-2"></i>
                        {props.t("Imam Details")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-money me-2"></i>
                        {props.t("Financial & Assistance")}
                      </h6>
                      <Link to="/reports/hardship-relief" className="dropdown-item">
                        <i className="bx bx-heart me-2"></i>
                        {props.t("Hardship Relief")}
                      </Link>
                      <Link to="/reports/medical-reimbursement" className="dropdown-item">
                        <i className="bx bx-plus-medical me-2"></i>
                        {props.t("Medical Reimbursement")}
                      </Link>
                      <Link to="/reports/waqf-loan" className="dropdown-item">
                        <i className="bx bx-money me-2"></i>
                        {props.t("WAQF Loan")}
                      </Link>
                      {/* Reports for tables with File_ID removed: total-financial-assistance, financial-assistance, food-assistance */}
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-gift me-2"></i>
                        {props.t("Bonus Reports")}
                      </h6>
                      <Link to="/reports/new-baby-bonus" className="dropdown-item">
                        <i className="bx bx-baby me-2"></i>
                        {props.t("New Baby Bonus")}
                      </Link>
                      <Link to="/reports/new-muslim-bonus" className="dropdown-item">
                        <i className="bx bx-user-circle me-2"></i>
                        {props.t("New Muslim Bonus")}
                      </Link>
                      <Link to="/reports/nikah-bonus" className="dropdown-item">
                        <i className="bx bx-heart-circle me-2"></i>
                        {props.t("Nikah Bonus")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-book me-2"></i>
                        {props.t("Educational & Development")}
                      </h6>
                      <Link to="/reports/continuous-professional-development" className="dropdown-item">
                        <i className="bx bx-graduation me-2"></i>
                        {props.t("CPD")}
                      </Link>
                      <Link to="/reports/higher-education-request" className="dropdown-item">
                        <i className="bx bx-book-reader me-2"></i>
                        {props.t("Higher Education")}
                      </Link>
                      <Link to="/reports/pearls-of-wisdom" className="dropdown-item">
                        <i className="bx bx-book me-2"></i>
                        {props.t("Pearls of Wisdom")}
                      </Link>
                      <Link to="/reports/skills-matrix" className="dropdown-item">
                        <i className="bx bx-award me-2"></i>
                        {props.t("Skills Matrix")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-group me-2"></i>
                        {props.t("Community & Engagement")}
                      </h6>
                      <Link to="/reports/community-engagement" className="dropdown-item">
                        <i className="bx bx-group me-2"></i>
                        {props.t("Community Engagement")}
                      </Link>
                      <Link to="/reports/jumuah-audio-khutbah" className="dropdown-item">
                        <i className="bx bx-microphone me-2"></i>
                        {props.t("Jumuah Audio Khutbah")}
                      </Link>
                      <Link to="/reports/jumuah-khutbah-topic" className="dropdown-item">
                        <i className="bx bx-file-blank me-2"></i>
                        {props.t("Jumuah Khutbah Topics")}
                      </Link>
                      <Link to="/reports/tree-requests" className="dropdown-item">
                        <i className="bx bx-tree me-2"></i>
                        {props.t("Tree Requests")}
                      </Link>
                      {/* home-visits report removed (table had File_ID) */}
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-buildings me-2"></i>
                        {props.t("Infrastructure")}
                      </h6>
                      <Link to="/reports/borehole" className="dropdown-item">
                        <i className="bx bx-water me-2"></i>
                        {props.t("Borehole")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <Link to="/reports/relationship-report" className="dropdown-item">
                        <i className="bx bx-group me-2"></i>
                        {props.t("Relationship Report")}
                      </Link>
                      <div className="dropdown-divider"></div>
                      
                      <h6 className="dropdown-header">
                        <i className="bx bx-cog me-2"></i>
                        {props.t("Administrative")}
                      </h6>
                      <Link to="/reports/tickets" className="dropdown-item">
                        <i className="bx bx-ticket me-2"></i>
                        {props.t("Tickets")}
                      </Link>
                    </div>
                  </li>
                )}

                {/* Lookup setup */}
                {canAccessNav("lookups") && (
                  <li className="nav-item">
                    <Link to="/lookups" className="nav-link">
                      <i className="bx bx-list-ul me-2"></i>
                      {props.t("Lookup Setup")}
                    </Link>
                  </li>
                )}

                {canAccessNav("filemanager") && (
                  <li className="nav-item">
                    <Link to="/FileManager" className="nav-link">
                      <i className="bx bx-folder me-2"></i>
                      {props.t("File Manager")}
                        </Link>
                  </li>
                )}

                {canAccessNav("chat") && (
                  <li className="nav-item">
                    <Link to="/chat" className="nav-link">
                      <i className="bx bx-chat me-2"></i>
                      {props.t("Chat")}
                          </Link>
                  </li>
                )}
              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
};

Navbar.propTypes = {
  leftMenu: PropTypes.any,
  location: PropTypes.any,
  menuOpen: PropTypes.any,
  t: PropTypes.any,
};

const mapStatetoProps = (state) => {
  const { leftMenu } = state.Layout;
  return { leftMenu };
};

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(Navbar))
);
