import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../helpers/useRole";
import axiosApi from "../helpers/api_helper";
import { API_BASE_URL } from "../helpers/url_helper";

/**
 * Route Guard for Create Imam Profile page
 * - For Imam User (type 6): Only allows access if profile status is NOT Approved (2)
 * - If approved, redirects to main imam profiles page
 * - For other users: Allows access normally
 */
const CreateImamProfileRouteGuard = ({ children }) => {
  const { userType } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          if (response.data?.status_id === 2) {
            // Approved - redirect to main page
            setShouldRedirect(true);
          }
        } catch (error) {
          // No profile or error - allow access to create page
          setShouldRedirect(false);
        }
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [userType]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="/imam-profiles" replace />;
  }

  return children;
};

export default CreateImamProfileRouteGuard;

