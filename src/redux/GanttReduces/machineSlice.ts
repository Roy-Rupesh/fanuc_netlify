import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config";
interface Machine {
  machineName: string;
}

interface MachineState {
  data: Machine[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: MachineState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchMachines = createAsyncThunk(
  "machines/fetchMachines",
  async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/v1/fanuc/machineList`
      );
      return response.data as Machine[];
    } catch (err) {
      throw err;
    }
  }
);

const machineSlice = createSlice({
  name: "machines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch machines";
      });
  },
});

export default machineSlice.reducer;
