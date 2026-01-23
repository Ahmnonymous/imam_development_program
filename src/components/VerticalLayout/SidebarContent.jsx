import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

// //Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import { Link, useLocation } from "react-router-dom";
import withRouter from "../Common/withRouter";

//i18n
import { withTranslation } from "react-i18next";
import { useCallback } from "react";

// ✅ Import role-based access control helper
import { useRole } from "../../helpers/useRole";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";

const SidebarContent = (props) => {
  const ref = useRef();
  const path = useLocation();
  
  // ✅ Get user role information
  const { canAccessNav, canEditModule, userType, isImamUser } = useRole();
  const [imamProfileStatus, setImamProfileStatus] = useState(null);
  const [hasConversations, setHasConversations] = useState(false); // For Imam Users to check if they have conversations

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = path.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    if (!ul) return; // Guard against missing element
    
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      const itemPath = items[i].pathname;
      // Exact match
      if (pathName === itemPath) {
        matchingMenuItem = items[i];
        break;
      }
      // Handle /imam-profiles routes - match if path starts with the menu item path
      // This includes /imam-profiles, /imam-profiles/create, etc.
      if (itemPath === "/imam-profiles" && pathName.startsWith("/imam-profiles")) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  // useEffect(() => {
  //   new MetisMenu("#side-menu");
  //   activeMenu();
  // }, []);
  useEffect(() => {
    const metisMenu = new MetisMenu("#side-menu");
    // Use setTimeout to ensure DOM is ready after menu items are rendered
    setTimeout(() => {
      activeMenu();
    }, 0);

    // Cleanup on component unmount
    return () => {
      metisMenu.dispose();
    };
  }, [activeMenu, imamProfileStatus]);

  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Use setTimeout to ensure DOM is updated after menu items are rendered
    setTimeout(() => {
      activeMenu();
    }, 0);
  }, [activeMenu, path.pathname, imamProfileStatus]);

  // Check Imam User profile status
  useEffect(() => {
    const checkImamProfileStatus = async () => {
      if (userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          // Ensure status_id is converted to number for consistent comparison
          const statusId = response.data?.status_id ? Number(response.data.status_id) : null;
          setImamProfileStatus(statusId);
        } catch (error) {
          // No profile exists yet
          setImamProfileStatus(null);
        }
      } else {
        // For non-Imam users, set to null so dashboard shows
        setImamProfileStatus(null);
      }
    };
    checkImamProfileStatus();
  }, [userType, path.pathname]); // Re-check when path changes

  // Check if Imam User has conversations (for showing Chat menu item)
  useEffect(() => {
    const checkConversations = async () => {
      if (isImamUser) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/conversations`);
          const conversations = response.data || [];
          setHasConversations(conversations.length > 0);
        } catch (error) {
          // On error, don't show Chat menu
          setHasConversations(false);
        }
      }
    };
    checkConversations();
  }, [isImamUser, path.pathname]); // Re-check when path changes

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100 mt-2"  ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {/* ✅ Pages Group - Dashboard and other pages (First) */}
            <li className="menu-title">
              <i className="bx bx-file"></i>
              <span>{props.t("Pages")}</span>
            </li>
            {/* ✅ Dashboard - All roles except Imam User without approved profile */}
            {userType !== 6 || (userType === 6 && imamProfileStatus === 2) ? (
              <li>
                <Link to="/dashboard">
                  <i className="bx bx-bar-chart-alt-2"></i>
                  <span>{props.t("Dashboard")}</span>
                </Link>
              </li>
            ) : null}

            {/* ✅ Create Imam Profile - Hide if Imam User has a profile (pending or approved) */}
            {userType !== 6 || imamProfileStatus === null ? (
              <li>
                <Link to="/imam-profiles/create">
                  <i className="bx bx-user-plus"></i>
                  <span>{props.t("Create Imam Profile")}</span>
                </Link>
              </li>
            ) : null}

            {/* ✅ Imam Profile Details - All roles (1,2,3,4,5), Imam User (6) if profile exists (pending or approved) */}
            {userType !== 6 || imamProfileStatus !== null ? (
              <li>
                <Link to="/imam-profiles">
                  <i className="bx bx-user-circle"></i>
                  <span>{props.t("Imam Profiles")}</span>
                </Link>
              </li>
            ) : null}

            {/* ✅ Chat - Separate navigation for Imam Users (only if they have conversations) */}
            {isImamUser && hasConversations && (
              <li>
                <Link to="/chat">
                  <i className="bx bx-chat"></i>
                  <span>{props.t("Chat")}</span>
                </Link>
              </li>
            )}

            {/* ✅ Borehole Management - All staff roles (1,2,3,4,5) */}
            {userType !== 6 && (
              <li>
                <Link to="/borehole-management">
                  <i className="bx bx-droplet"></i>
                  <span>{props.t("Borehole Management")}</span>
                </Link>
              </li>
            )}

            {/* Reports Dropdown */}
            {canAccessNav("reports") && (
              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-file-find"></i>
                  <span>{props.t("Reports")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/reports/imam-details">
                      <i className="bx bx-user"></i>
                      <span>{props.t("Imam Details")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/hardship-relief">
                      <i className="bx bx-heart"></i>
                      <span>{props.t("Hardship Relief")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/community-engagement">
                      <i className="bx bx-group"></i>
                      <span>{props.t("Comm. Engagement")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/borehole">
                      <i className="bx bx-droplet"></i>
                      <span>{props.t("Borehole")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/continuous-professional-development">
                      <i className="bx bx-book-open"></i>
                      <span>{props.t("CPD")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/higher-education-request">
                      <i className="bx bx-book"></i>
                      <span>{props.t("Higher Education")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/jumuah-audio-khutbah">
                      <i className="bx bx-music"></i>
                      <span>{props.t("Jumuah Audio")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/jumuah-khutbah-topic">
                      <i className="bx bx-book"></i>
                      <span>{props.t("Jumuah Topics")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/medical-reimbursement">
                      <i className="bx bx-plus-medical"></i>
                      <span>{props.t("Medical Reimb.")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/new-baby-bonus">
                      <i className="bx bx-gift"></i>
                      <span>{props.t("New Baby Bonus")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/new-muslim-bonus">
                      <i className="bx bx-user-circle"></i>
                      <span>{props.t("New Muslim Bonus")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/nikah-bonus">
                      <i className="bx bx-heart"></i>
                      <span>{props.t("Nikah Bonus")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/pearls-of-wisdom">
                      <i className="bx bx-diamond"></i>
                      <span>{props.t("Pearls of Wisdom")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/tickets">
                      <i className="bx bx-help-circle"></i>
                      <span>{props.t("Tickets")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/tree-requests">
                      <i className="bx bx-box"></i>
                      <span>{props.t("Tree Requests")}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports/waqf-loan">
                      <i className="bx bx-money"></i>
                      <span>{props.t("WAQF Loan")}</span>
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* ✅ Personal Dropdown - File Management, Chat, Policy & Procedure - For non-Imam Users */}
            {userType !== 6 && (
                <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-user"></i>
                  <span>{props.t("Personal")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/FileManager">
                    <i className="bx bx-folder"></i>
                    <span>{props.t("File Manager")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/chat">
                    <i className="bx bx-chat"></i>
                    <span>{props.t("Chat")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/policy-library">
                    <i className="bx bx-file-blank"></i>
                    <span>{props.t("Policy & Procedure")}</span>
                  </Link>
                </li>
                </ul>
              </li>
            )}

            {/* ✅ Administration - Separate navigation item */}
            {canAccessNav("lookups") && (
              <li>
                <Link to="/lookups">
                  <i className="bx bx-list-ul"></i>
                  <span>{props.t("Administration")}</span>
                </Link>
              </li>
            )}

            {/* TEMPORARILY HIDDEN - Centers */}
            {/* {canAccessNav("centers") && (
              <li>
                <Link to="/centers">
                  <i className="bx bx-building"></i>
                  <span>{props.t("Center Management")}</span>
                </Link>
              </li>
            )} */}

            {/* TEMPORARILY HIDDEN - Meetings */}
            {/* {canAccessNav("meetings") && (
              <li>
                <Link to="/meetings">
                  <i className="bx bx-calendar"></i>
                  <span>{props.t("Meetings Management")}</span>
                </Link>
              </li>
            )} */}

            {/* TEMPORARILY HIDDEN - Suppliers */}
            {/* {canAccessNav("suppliers") && (
              <li>
                <Link to="/suppliers">
                  <i className="bx bx-store"></i>
                  <span>{props.t("Supplier Management")}</span>
                </Link>
              </li>
            )} */}

            {/* TEMPORARILY HIDDEN - Inventory */}
            {/* {canAccessNav("inventory") && (
              <li>
                <Link to="/inventory">
                  <i className="bx bx-box"></i>
                  <span>{props.t("Inventory Management")}</span>
                </Link>
              </li>
            )} */}

            {/* TEMPORARILY HIDDEN - Create Applicant */}
            {/* {canEditModule("applicants") && (
              <li>
                <Link to="/applicants/create">
                  <i className="bx bx-user-plus"></i>
                  <span>{props.t("Create Applicant")}</span>
                </Link>
              </li>
            )} */}

            {/* TEMPORARILY HIDDEN - Applicant Details */}
            {/* <li>
              <Link to="/applicants">
                <i className="bx bx-user-check"></i>
                <span>{props.t("Applicant Details")}</span>
              </Link>
            </li> */}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
