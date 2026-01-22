import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../helpers/useRole";
import axiosApi from "../helpers/api_helper";
import { API_BASE_URL } from "../helpers/url_helper";

/**
 * Route Guard for Dashboard
 * - For Imam User (type 6): Only allows access if profile status is Approved (2)
 * - If not approved or no profile exists, redirects to Create Imam Profile page
 * - For other users: Allows access normally
 */
const DashboardRouteGuard = ({ children }) => {
  const { userType, isImamUser } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (isImamUser || userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          if (response.data) {
            // Check if profile is approved (status_id === 2)
            if (Number(response.data.status_id) === 2) {
              // Approved - allow access to dashboard
              setShouldRedirect(false);
            } else {
              // Not approved (pending) - redirect to create profile page
              setShouldRedirect(true);
            }
          } else {
            // No profile - redirect to create page
            setShouldRedirect(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No profile - redirect to create page
            setShouldRedirect(true);
          } else {
            // Other error - allow access (will show error on page)
            console.error("Error checking imam profile:", error);
            setShouldRedirect(false);
          }
        }
      } else {
        // Not Imam User - allow access
        setShouldRedirect(false);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [userType, isImamUser]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/imam-profiles/create" replace />;
  }

  return children;
};

export default DashboardRouteGuard;

