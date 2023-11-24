import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import config from "../../config";

interface FetchMotionDataArgs {
  hours: number;
  machine: string;
}

export const fetchMotionData = createAsyncThunk(
  'motion/fetchData',
  async ({ hours, machine }: FetchMotionDataArgs) => {
    const response = await axios.get(`${config.API_URL}/v1/fanuc/singleMachineData/${machine}/${hours}`);
    return response.data;
  }
);

interface MotionState {
  data: any[];
  status: 'idle' | 'loading' | 'failed';
  message: string;
}

const initialState: MotionState = {
  data: [],
  status: 'idle',
  message: '',
};

const motionSlice = createSlice({
  name: 'motion',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMotionData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMotionData.fulfilled, (state, action: PayloadAction<any[]>) => {
        if (action.payload && action.payload.length > 0) {
          state.status = 'idle';
          state.data = action.payload;
          state.message = '';
        } else {
          state.status = 'idle';
          state.data = [];
          state.message = 'No data available for this specific period of time.';
        }
      })
      .addCase(fetchMotionData.rejected, (state) => {
        state.status = 'failed';
        state.data = [];
      });
  },
});

export default motionSlice.reducer;
