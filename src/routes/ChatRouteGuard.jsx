import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../helpers/useRole";
import axiosApi from "../helpers/api_helper";
import { API_BASE_URL } from "../helpers/url_helper";

/**
 * ChatRouteGuard Component
 * 
 * For Imam Users (role 6):
 * - By default, they don't have access to Chat module
 * - BUT, if they have any conversations (received messages or added as participant),
 *   they get access to view and respond to conversations
 * - However, they still cannot create new conversations
 * 
 * For App Admin (role 1) and Admin (role 7):
 * - Full access to Chat module
 */
const ChatRouteGuard = ({ children }) => {
  const { isAppAdmin, isImamUser, userType, isAdmin } = useRole();
  const [hasConversations, setHasConversations] = useState(null); // null = checking, true = has access, false = no access
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConversations = async () => {
      // App Admin and Admin always have access
      if (isAppAdmin || userType === 7) {
        setHasConversations(true);
        setLoading(false);
        return;
      }

      // For Imam Users, check if they have any conversations
      if (isImamUser) {
        try {
          const response = await axiosApi.get(`${API_BASE_URL}/conversations`);
          const conversations = response.data || [];
          
          // If user has at least one conversation, grant access
          setHasConversations(conversations.length > 0);
        } catch (error) {
          console.error("Error checking conversations:", error);
          // On error, deny access (safer default)
          setHasConversations(false);
        } finally {
          setLoading(false);
        }
      } else {
        // Other roles - deny access (shouldn't reach here if route is properly configured)
        setHasConversations(false);
        setLoading(false);
      }
    };

    checkConversations();
  }, [isAppAdmin, isImamUser, userType]);

  // Show loading state while checking
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Checking access...</p>
        </div>
      </div>
    );
  }

  // Grant access if:
  // 1. App Admin or Admin (always)
  // 2. Imam User with conversations
  if (hasConversations) {
    return children;
  }

  // Deny access - redirect to unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default ChatRouteGuard;

