import {
  LocationCity as CityIcon,
  Business as CompanyIcon,
  LocationOn,
  MailOutline as MailIcon,
  PhoneIphone as MobileIcon,
  AccountCircle as PersonIcon,
} from "@mui/icons-material";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/UtilityDemoForm.css";
import topWave from "../../assets/images/utilityDemo/topwave.svg";
import { fetchMachines } from "../../redux/GanttReduces/machineSlice";
import { RootState } from "../../redux/store";
import { UtilityDemo } from "../../redux/types";
import { sendOTP } from "../../redux/utilityDemoSlice";
import OTPVerificationModal from "./OTPVerificationModal";
import backgroundImage from "../../assets/images/utilityDemo/factory-cnc-machines2_blur.jpg";
interface CSSProperties {
  [key: string]: string | number;
}

const initialValues: UtilityDemo = {
  companyName: "",
  contactPersonName: "",
  contactPersonNumber: "",
  email: "",
  address: "",
  city: "",
  numOfMachines: 0,
  numOfHardwireMachines: 0,
  numOfControllerMachines: 0,
  demoReportDuration: 0,
  demoType: "",
  machineList: [],
};

const formContainerStyles: CSSProperties = {
  backgroundImage: `url(${backgroundImage})`,
  flexDirection: "column",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  minHeight: "calc(100vh - 32px)",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  width: "100%",
  height: "100%",
  // background: "linear-gradient(to top, #dfe9f3 0%, white 100%)",

};

const ITEM_HEIGHT = 24;
const ITEM_PADDING_TOP = 1;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

function UtilityDemoForm() {
  const [formData, setFormData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<Partial<UtilityDemo>>({});
  const [showForm, setShowForm] = useState(false);
  const [isOTPVerificationModalOpen, setOTPVerificationModalOpen] =
    useState(false);
  const machines = useSelector((state: RootState) => state.machines.data);

  const dispatch = useDispatch();

  useEffect(() => {
    setShowForm(true);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as { name: string; value: string };

    if (name === "machineList") {
      // Split the input value into an array
      const machineNames = (value as string)
        .split(",")
        .map((machineName) => ({ machineName: machineName.trim() }));

      setFormData((prevData) => ({
        ...prevData,
        machineList: machineNames,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const resetFormData = () => {
    setFormData(initialValues);
  };

  const validateForm = () => {
    const errors: Partial<UtilityDemo> = {};

    if (!formData.companyName) {
      errors.companyName = "Company Name is required";
    }

    if (!formData.contactPersonName) {
      errors.contactPersonName = "Contact Person Name is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.contactPersonNumber) {
        errors.contactPersonNumber =
          "Contact Person Number is required";
    }
    if (formData.contactPersonNumber) {
      if (!/^\d{10}$/.test(formData.contactPersonNumber)) {
        errors.contactPersonNumber =
          "Contact Person Number should be a 10-digit number";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    try {
      const otpAction = await dispatch(sendOTP(formData.email) as any);

      if (sendOTP.fulfilled.match(otpAction)) {
        console.log("OTP sent successfully.");
      } else {
        console.error("Error sending OTP: ", otpAction.error);
        toast.error("Error sending OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error handling dispatch: ", error);
      toast.error("Error occurred while sending OTP. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Utility Data", formData);
      setOTPVerificationModalOpen(true);
      handleSendOtp();
    }
  };
  console.log("Updated formData:", formData);
  return (
    <div style={formContainerStyles} className="utilityform-container">
      <div
        className={`utility-box ${
          showForm ? "form-zoom-in active" : "form-zoom-in"
        }`}
        style={{
          maxWidth: "480px",
          width: "100%",
          height: "100%",
        }}
      >
        <form style={{ maxWidth: "480px" }}>
          <Typography variant="h5" className="utilityform-title ">
            Utility Demo Form
          </Typography>

          <Grid container spacing={0.5} justifyContent="center">
            <Grid item xs={7} sm={6} md={6} className="utilityform-item">
              <TextField
                name="companyName"
                label="Company Name"
                variant="standard"
                fullWidth
                value={formData.companyName}
                margin="normal"
                onChange={handleInputChange}
                error={!!formErrors.companyName}
                className="utility-custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CompanyIcon className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
              {formErrors.companyName && (
                <FormHelperText error>{formErrors.companyName}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="contactPersonName"
                label="Contact Person Name"
                variant="standard"
                fullWidth
                value={formData.contactPersonName}
                margin="normal"
                onChange={handleInputChange}
                error={!!formErrors.contactPersonName}
                className="utility-custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
              {formErrors.contactPersonName && (
                <FormHelperText error>
                  {formErrors.contactPersonName}
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="contactPersonNumber"
                label="Contact Person Number"
                variant="standard"
                fullWidth
                value={formData.contactPersonNumber}
                className="utility-custom-textfield"
                margin="normal"
                onChange={handleInputChange}
                error={!!formErrors.contactPersonNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MobileIcon className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
              {formErrors.contactPersonNumber && (
                <FormHelperText error>
                  {formErrors.contactPersonNumber}
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                variant="standard"
                value={formData.email}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
                error={!!formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
              {formErrors.email && (
                <FormHelperText error>{formErrors.email}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                variant="standard"
                value={formData.address}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="city"
                label="City"
                fullWidth
                variant="standard"
                value={formData.city}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CityIcon className="icon" />{" "}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="numOfMachines"
                label="No. of Machines"
                variant="standard"
                fullWidth
                value={formData.numOfMachines}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
              />
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="numOfHardwireMachines"
                label="No. of Hardwire Machines"
                variant="standard"
                fullWidth
                value={formData.numOfHardwireMachines}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
              />
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="numOfControllerMachines"
                label="No. of Controller Machines"
                variant="standard"
                fullWidth
                value={formData.numOfControllerMachines}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
              />
            </Grid>
            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="demoReportDuration"
                label="Demo Report Duration"
                variant="standard"
                fullWidth
                value={formData.demoReportDuration}
                margin="normal"
                onChange={handleInputChange}
                className="utility-custom-textfield"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {" "}
                      <span style={{ color: "#061c73" }}>mins</span>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={7} sm={6} md={6}>
              <TextField
                name="machineList"
                label="Demo for Machines"
                fullWidth
                variant="standard"
                margin="normal"
                value={formData.machineList
                  .map((machine) => machine.machineName)
                  .join(", ")}
                onChange={handleInputChange}
                className="utility-custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} style={{ textAlign: "center" }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel
                  component="legend"
                  style={{
                    color: " #061c73",
                    fontSize: "13px",
                    fontWeight: "600",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  Demo Type
                </FormLabel>
                <RadioGroup
                  row
                  name="demoType"
                  value={formData.demoType}
                  onChange={handleInputChange}
                  className="utility-custom-textfield"
                  style={{ justifyContent: "center" }}
                >
                  <FormControlLabel
                    value="Inside"
                    control={<Radio />}
                    label="Inside"
                  />
                  <FormControlLabel
                    value="Promotional"
                    control={<Radio />}
                    label="Promotional"
                  />
                  <FormControlLabel
                    value="End-user"
                    control={<Radio />}
                    label="End-user"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <div className="utilitybutton-container">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className="utilitysubmit-button"
              >
                Submit
              </Button>
            </div>
          </Grid>
        </form>{" "}
      </div>

      {isOTPVerificationModalOpen && (
        <OTPVerificationModal
          formData={formData}
          resetFormData={resetFormData}
          open={isOTPVerificationModalOpen}
          onClose={() => setOTPVerificationModalOpen(false)}
          handleSendOtp={handleSendOtp}
        />
      )}
    </div>
  );
}

export default UtilityDemoForm;


