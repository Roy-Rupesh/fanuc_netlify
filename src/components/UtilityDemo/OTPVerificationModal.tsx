import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/UtilityDemoForm.css";
import { UtilityDemo } from "../../redux/types";
import {
  sendCRMUpdateEmail,
  sendUpdateDashboardStatus,
  setEmail,
  submitUtilityData,
  verifyOTP,
} from "../../redux/utilityDemoSlice";

interface OTPVerificationModalProps {
  formData: UtilityDemo;
  open: boolean;
  onClose: () => void;
  resetFormData: () => void;
  handleSendOtp: () => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  formData,
  open,
  onClose,
  resetFormData,
  handleSendOtp,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [enteredOTP, setEnteredOTP] = useState("");
  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds
  let timerId: NodeJS.Timer | undefined;
  const [verifying, setVerifying] = useState(false);
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredOTP(e.target.value);
  };

  const handleVerifyOTP = async () => {
    try {
      // Show loading icon and disable submit button
      setVerifying(true);
      const email = formData.email;

      // Verify OTP
      const otpResponse = await dispatch(
        verifyOTP({ otp: enteredOTP, email }) as any
      );

      if (verifyOTP.fulfilled.match(otpResponse)) {
        // Show success message
        toast.success("OTP verification successful");
        // Update dashboard status
        const updateStatusResponse = await dispatch(
          sendUpdateDashboardStatus(email) as any
        );

        if (sendUpdateDashboardStatus.fulfilled.match(updateStatusResponse)) {
          // Show success message
          toast.success("Dashboard status updated successfully");

          // Set the email in Redux state
          dispatch(setEmail(email) as any);

          // Submit utility data
          const submitAction = await dispatch(
            submitUtilityData(formData) as any
          );
          // console.log("Submit Utility Data Action:", submitAction);

          if (submitUtilityData.fulfilled.match(submitAction)) {
            // Store the _id as demoId in local storage
            const createdDemoId = submitAction.payload.createdUtilityDemo?._id;

            if (createdDemoId) {
              // Store the _id as demoId in local storage
              localStorage.setItem("demoId", createdDemoId);
              // console.log("UtilityForm Data _id:", createdDemoId);
            } else {
              console.error("UtilityForm Data _id is missing.");
            }
            onClose();

            // Clear enteredOTP
            setEnteredOTP(""); // Clear enteredOTP

            // Redirect to demo dashboard
            navigate("/demo-dashboard");
          } else {
            // Show warning message
            toast.warning("Failed to submit utility data. Please try again.");
          }

          // Send CRM update email
          const crmUpdateAction = await dispatch(
            sendCRMUpdateEmail(formData) as any
          );

          console.log("CRM Update Action:", crmUpdateAction); // Log the CRM update action

          if (sendCRMUpdateEmail.fulfilled.match(crmUpdateAction)) {
            // Show success message
            toast.success("CRM update email sent successfully");
          } else {
            console.error(
              "Error sending CRM update email:",
              crmUpdateAction.error
            );
            toast.error("Error sending CRM update email. Please try again.");
          }
        } else {
          // Show warning message
          toast.warning(
            "Failed to update the dashboard status. Please try again."
          );
        }
      } else {
        // Show warning message
        toast.warning("OTP verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP. Please try again.");
    } finally {
      // Clear form data
      resetFormData(); // Clear the form data
      setVerifying(false); // Set it back to false whether success or error
    }
  };
  const handleResendOTP = () => {
    if (timerId) {
      clearInterval(timerId);
    }

    handleSendOtp();
    setRemainingTime(120); // Reset the timer to 2 minutes

    timerId = setInterval(() => {
      if (remainingTime > 0) {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);
  };

  useEffect(() => {
    if (open && remainingTime > 0) {
      if (timerId) {
        clearInterval(timerId);
      }

      timerId = setInterval(() => {
        if (remainingTime > 0) {
          setRemainingTime((prevTime) => prevTime - 1);
        }
      }, 1000);
    } else if (timerId) {
      clearInterval(timerId);
      setRemainingTime(120); // Reset the timer when the modal closes
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [open, remainingTime]);

  return (
    <Dialog open={open} maxWidth="sm" className="otp-modal">
      <DialogTitle className="otp-modal-title">
        Verify OTP
        <Tooltip title="Close" placement="left-start">
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            style={{ position: "absolute", right: "2%", top: "1%" }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent className="otp-modal-content">
        <form style={{ padding: "20px" }}>
          <Grid container spacing={2} justifyContent="center">
            <p
              style={{
                fontSize: "16px",
                margin: "0",
                color: "#555",
                textAlign: "center",
              }}
            >
              An OTP has been sent to your Email: {formData.email}
            </p>
            <Divider style={{ margin: "10px 0" }} />
            <Grid item xs={6} style={{ marginLeft: "5px" }}>
              <TextField
                label="Enter OTP"
                variant="outlined"
                value={enteredOTP}
                onChange={handleOTPChange}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "10px",
              }}
            >
              <Grid
                item
                xs={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  className="otp-modal-button"
                  onClick={handleVerifyOTP}
                  disabled={verifying}
                  startIcon={verifying ? <CircularProgress size={20} /> : null}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
              </Grid>

              <Grid
                item
                xs={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  className="otp-modal-button"
                  onClick={handleResendOTP}
                  disabled={remainingTime > 0}
                  size="small"
                >
                  {remainingTime > 0
                    ? `Resend OTP in ${remainingTime} seconds`
                    : "Resend OTP"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
