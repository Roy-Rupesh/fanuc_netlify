import AlertTable from "../Tables/AlertTable";
import BaseNav from "./BaseNav";

export default function RightNav() {
  const tableContainerStyle = {
    marginLeft: "600px",
  };

  return (
    <div>
      <AlertTable />
      <BaseNav />
    </div>
  );
}
