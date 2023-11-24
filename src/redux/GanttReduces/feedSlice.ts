// feedSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import config from "../../config";

interface FetchFeedDataArgs {
  hours: number;
  machine?: string;
}

export const fetchFeedData = createAsyncThunk(
  'feed/fetchFeedData',
  async ({ hours, machine = 'datta_f2' }: FetchFeedDataArgs) => {
    try {
      const response = await axios.get(`${config.API_URL}/v1/fanuc/feed_uptime/${machine}/${hours}`);
      console.log('API Response:', response.data);
      const formattedData = response.data.map((item: any) => {
        return {
          time: new Date(item.time).toISOString(),
          feed: item.feed
        };
      });
      console.log('Formatted Data:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('Error fetching feed data:', error);
      throw error;
    }
  }
);

interface FeedData {
  time: string;
  feed: number;
}

interface FeedState {
  data: FeedData[];
  status: 'idle' | 'loading' | 'failed';
  message: string;
}

const initialState: FeedState = {
  data: [],
  status: 'idle',
  message: '',
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedData.pending, (state) => {
        state.status = 'loading';
        state.message = '';
      })
      .addCase(fetchFeedData.fulfilled, (state, action: PayloadAction<FeedData[]>) => {
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
      .addCase(fetchFeedData.rejected, (state) => {
        state.status = 'failed';
        state.data = [];
        state.message = 'An error occurred while fetching the data.';
      });
  },
});

export default feedSlice.reducer;
