import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import fanucReducer from "./GanttReduces/fanucSlice";
import feedReducer from "./GanttReduces/feedSlice";
import ganttReducer from "./GanttReduces/ganttslice";
import motionReducer from "./GanttReduces/motionSlice";
import partTimelineReducer from "./GanttReduces/partTimelineSlice";
import machineReducer from "./GanttReduces/machineSlice";
import utilityDemoReducer from "./utilityDemoSlice";

const store = configureStore({
  reducer: {
    app: rootReducer,
    fanuc: fanucReducer,
    feed: feedReducer,  // Add the feed reducer to the store
    motion: motionReducer,
    gantt: ganttReducer,
    partTimeline: partTimelineReducer,
    machines: machineReducer,
    utilityDemo: utilityDemoReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
export type { RootState, AppDispatch };
export default store;
