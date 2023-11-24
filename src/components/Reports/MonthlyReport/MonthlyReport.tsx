import React from "react";
import Summary from "./Summary";
import DailyOee from "./DailyOee";
import DailyProduction from "./DailyProduction";
import DailyRuntime from "./DailyRuntime";
import DailyPower from "./DailyPower";
import TargetVsActualProduction from "./TargetVsActualProduction";
import DowntimeAnalysis from "./DowntimeAnalysis";

export default function MonthlyReport() {
  return (
    <div id="monthly-report">
      <Summary />

      <DailyOee />
      <div className="lg:flex lg:flex-row lg:space-x-8">
        <div className="lg:w-1/2">
          <TargetVsActualProduction />
        </div>
        <div className="lg:w-1/2">
          <DowntimeAnalysis />
        </div>
      </div>

      <DailyProduction />
      <DailyRuntime />
      <DailyPower />
    </div>
  );
}
// import React from "react";
// import Summary from "./Summary";
// import DailyOee from "./DailyOee";

// export default function MonthlyReport() {
//   return (
//     <div className="lg:flex lg:flex-row lg:space-x-8">
//       <div className="lg:w-1/2">
//         <Summary />
//       </div>
//       <div className="lg:w-1/2">
//         <DailyOee />
//       </div>
//     </div>
//   );
// }
