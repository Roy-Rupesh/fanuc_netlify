import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { GanttState,ProductionData} from "../types";
import config from "../../config";

const initialState: GanttState = {
  productionData: [],
  allMacIds: [],
  allMachines: [],
  selectedMachine: null,
  loading: false,
  error: null
};

export const fetchAllMachines = createAsyncThunk("gantt/fetchAllMachines", async () => {
  const response = await fetch(`${config.API_URL}/v1/machines/findAllMachines`);
  return await response.json();
});

export const fetchMacIds = createAsyncThunk("gantt/fetchMacIds", async () => {
  const response = await fetch(`${config.API_URL}/v1/gateway/`);
  const data = await response.json();
  return data.map((record: any) => record.macId);
});

export const fetchProductionData = createAsyncThunk(
  "gantt/fetchProductionData",
  async (params: { mac: string; hours: number }) => {
    const { mac, hours } = params;
    const response = await fetch(`${config.API_URL}/v1/data/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mac: mac,
        hours: hours
      })
    });
    const data = await response.json();
    return data.foundData;  // Ensure this is the correct structure of the response
  }
);


const ganttSlice = createSlice({
  name: "gantt",
  initialState,
  reducers: {
    setRealTimeData: (state, action: PayloadAction<any>) => {
      state.productionData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.allMachines = action.payload;
      })
      .addCase(fetchAllMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An unknown error occurred.";
      })
      // Handle fetchMacIds
      .addCase(fetchMacIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMacIds.fulfilled, (state, action) => {
        state.loading = false;
        state.allMacIds = action.payload;
      })
      .addCase(fetchMacIds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "An unknown error occurred.";
      })

      // Handle fetchProductionData
      .addCase(fetchProductionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionData.fulfilled, (state, action) => {
        state.loading = false;
        state.productionData = action.payload;
      })
      .addCase(fetchProductionData.rejected, (state, action) => {
        console.error("Error fetching production data:", action.error);
        state.loading = false;
        state.error = action.error.message || "An unknown error occurred.";
      });
      
  }
});

export const { setRealTimeData } = ganttSlice.actions;

export default ganttSlice.reducer;