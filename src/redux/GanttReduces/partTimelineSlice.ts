import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import config from "../../config";

interface FetchPartTimelineDataArgs {
    hours: number;
    machine: string;
    observationName:string
  }
  
  export const fetchPartTimelineData = createAsyncThunk<any, FetchPartTimelineDataArgs, {}>(
    'partTimeline/fetchData',
    async ({ hours, machine, observationName}: FetchPartTimelineDataArgs) => {
      const response = await axios.get(`${config.API_URL}/v1/fanuc/data/${machine}/${hours}/${observationName}`);
      return response.data;
    }
  );
  

interface PartTimelineState {
  data: any[];
  status: 'idle' | 'loading' | 'failed';
  message: string;
}

const initialState: PartTimelineState = {
  data: [],
  status: 'idle',
  message: '',
};

const partTimelineSlice = createSlice({
  name: 'partTimeline',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartTimelineData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPartTimelineData.fulfilled, (state, action: PayloadAction<any[]>) => {
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
      .addCase(fetchPartTimelineData.rejected, (state) => {
        state.status = 'failed';
        state.data = [];
      });
  },
});

export default partTimelineSlice.reducer;
