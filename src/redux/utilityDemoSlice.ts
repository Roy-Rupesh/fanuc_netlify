import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAction,
  createAction,
} from "@reduxjs/toolkit";
import { UtilityDemo } from "./types";
import axios from "axios";
import config from "../config";

interface UtilityDemoState {
  utilityDemos: UtilityDemo[] | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  crmUpdateEmailSent: boolean;
  email: string;
}

const initialState: UtilityDemoState = {
  utilityDemos: [],
  loading: false,
  error: null,
  otpSent: false,
  crmUpdateEmailSent: false,
  email: "",
};

export const submitUtilityData = createAsyncThunk(
  "utilityDemo/submitUtilityData",
  async (utilityDemoData: UtilityDemo, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${config.API_URL}/v1/utilityDemo/addutilityDemo`,
        utilityDemoData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        "An error occurred while Submitting Utility Demo Data"
      );
    }
  }
);

export const sendOTP = createAsyncThunk(
  "utilityDemo/sendOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("sending otp to email", email);
      const response = await axios.post(
        `${config.API_URL}/v1/utilityDemo/send-otp`,
        { email }
      );
      console.log("Received response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const verifyOTP = createAsyncThunk(
  "utilityDemo/verifyOTP",
  async (
    { otp, email }: { otp: string; email: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${config.API_URL}/v1/utilityDemo/verify-otp`,
        { email, otp }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error verifying OTP");
    }
  }
);

export const sendCRMUpdateEmail = createAsyncThunk(
  "utilityDemo/sendCRMUpdateEmail",
  async (formData: UtilityDemo, { rejectWithValue }) => {
    //const { contactPersonNumber, ...formDataWithoutContactNumber } = formData;

    try {
      const response = await axios.post(
        `${config.API_URL}/v1/utilityDemo/send-crm-update`,
        {
          //formData: formDataWithoutContactNumber,
          formData,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error sending CRM update email");
    }
  }
);

export const sendUpdateDashboardStatus = createAsyncThunk(
  "utilityDemo/updateDashboardStatus",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        // "http://localhost:25208/v1/utilityDemo/addDashboardStatus",
        `${config.API_URL}/v1/utilityDemo/addDashboardStatus`,

        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error updating dashboard status");
    }
  }
);
export const fetchAllowedMachines = createAsyncThunk(
  "utilityDemo/fetchMachines",
  async (demoId: string, { rejectWithValue }) => {
    try {
      console.warn("in uti demo "+ config.API_URL);
      
      const response = await axios.get(
        `${config.API_URL}/v1/utilityDemo/machinelist/${demoId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Error updating dashboard status");
    }
  }
);

export const setEmail = createAction<string>("utilityDemo/setEmail");
export const clearEmail = createAction("utilityDemo/clearEmail");

const utilityDemoSlice = createSlice({
  name: "utilityDemo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitUtilityData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitUtilityData.fulfilled, (state, action) => {
        state.loading = false;
        state.utilityDemos?.push(action.payload);
      })
      .addCase(submitUtilityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit Data";
      })
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send OTP";
      })
      .addCase(sendCRMUpdateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCRMUpdateEmail.fulfilled, (state) => {
        state.loading = false;
        state.crmUpdateEmailSent = true;
      })
      .addCase(sendCRMUpdateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send CRM update email";
      })
      .addCase(setEmail, (state, action) => {
        state.email = action.payload;
      })

      .addCase(clearEmail, (state) => {
        state.email = "";
      });
  },
});

export const {} = utilityDemoSlice.actions;

export default utilityDemoSlice.reducer;
