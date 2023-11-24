import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./types";
import { subDays } from "date-fns";
const initialState: AppState = {
  macId: "",
  machineInfo: [],
  baseInfo: [],
  selectedOption: "24",
  formattedDate: "",
  userInput: 1,
  startDate: subDays(new Date(), 1),
  endDate: new Date(),
  avgOee: 0,
  selectedMachine_R: "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setMacId: (state, action) => {
      state.macId = action.payload;
    },

    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },

    setMachineInfo: (state, action) => {
      state.machineInfo = action.payload;
    },

    setFormattedDate: (state, action) => {
      state.formattedDate = action.payload;
    },
    setUserInput: (state, action) => {
      state.userInput = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setBaseInfo: (state, action) => {
      state.baseInfo = action.payload;
    },
    setAvgOee: (state, action) => {
      state.avgOee = action.payload;
    },
    setSelectedMachine_R: (state, action) => {
      state.selectedMachine_R = action.payload;
    },
  },
});

export const {
  setMacId,
  setAvgOee,
  setSelectedOption,
  setMachineInfo,
  setFormattedDate,
  setUserInput,
  setStartDate,
  setEndDate,
  setBaseInfo,
  setSelectedMachine_R,
} = appSlice.actions;

export default appSlice.reducer;
