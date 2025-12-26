import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../helpers/useRole";
import axiosApi from "../helpers/api_helper";
import { API_BASE_URL } from "../helpers/url_helper";

/**
 * Route Guard for Imam Profile pages
 * - For Imam User (type 6): Only allows access if profile status is Approved (2)
 * - For other users: Allows access normally
 */
const ImamProfileRouteGuard = ({ children }) => {
  const { userType } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (userType === 6) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/imamProfiles/my-profile`);
          if (response.data) {
            // Profile exists (pending or approved) - allow access
            setHasAccess(true);
          } else {
            // No profile - redirect to create page
            setHasAccess(false);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No profile - redirect to create page
            setHasAccess(false);
          } else {
            // Other error - allow access (will show error on page)
            setHasAccess(true);
          }
        }
      } else {
        // Not Imam User - allow access
        setHasAccess(true);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [userType]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (userType === 6 && !hasAccess) {
    return <Navigate to="/imam-profiles/create" replace />;
  }

  return children;
};

export default ImamProfileRouteGuard;

