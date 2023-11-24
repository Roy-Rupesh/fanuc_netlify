import Header from "./Nav/Header";
import LeftNav from "./Nav/LeftNav";
import RightNav from "./Nav/RightNav";
import CombinedChart from "./Charts/CombinedChart";
import AlertTable from "./Tables/AlertTable";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2  p-4">
        {/* Content for the 75% div */}
        <Header />
        <CombinedChart />
      </div>
      <div className="col-span-1  p-4">
        {/* Content for the 25% div */}
        <RightNav />
      </div>
    </div>
  );
}