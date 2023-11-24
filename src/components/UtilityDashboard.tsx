import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import axios from "axios"; // Import Axios
import config from "../config";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import ContactUs from "./ContactUs";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
function UtilityDashboard() {
  const [isDashboardAvailable, setIsDashboardAvailable] = useState(false);

  const savedEmail = localStorage.getItem("userEmail");
  const emailFromRedux = useSelector(
    (state: RootState) => state.utilityDemo.email
  );
  const email = emailFromRedux || savedEmail || "";
  if (emailFromRedux && emailFromRedux !== savedEmail) {
    localStorage.setItem("userEmail", emailFromRedux);
  }
  console.log("in dashboard we got this email", email);

  useEffect(() => {
    // Define the data to be sent in the request body
    const requestData = { email };
    if (!email) {
      // If email is empty, set isDashboardAvailable to false
      setIsDashboardAvailable(false);
      return; // Exit the useEffect
    }
    // Use Axios to make the API request
    axios
      .post(
        `${config.API_URL}/v1/utilityDemo/dashboard-status`,
        requestData
      )
      .then((response) => {
        if (response.status === 200) {
          if (response.data.status === 1) {
            // Status is 1, continue
            setIsDashboardAvailable(true);
          } else if (response.data.status === 0) {
            // Status is 0, clear local storage
            localStorage.removeItem("userEmail");
            setIsDashboardAvailable(false);
          }
        } else {
          console.error("Error getting dashboard status:", response.statusText);
          // Handle the error
        }
      })
      .catch((error) => {
        console.error("Error getting dashboard status:", error);
      });
  }, [email]);

  return (
    <div>
      {isDashboardAvailable ? (
        <div>
          <Dashboard />
        </div>
      ) : (
        <Dialog open={!isDashboardAvailable}>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You don't have access to this page. Please contact us for more
              information.
            </DialogContentText>
            <DialogContentText>Please Login!!!!!</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button component={Link} to="/ulogin" color="primary">
              login
            </Button>
            <Button component={Link} to="/contact-us" color="primary">
              Contact Us
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default UtilityDashboard;
