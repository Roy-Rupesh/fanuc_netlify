import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import axios from "axios";

import { setSelectedOption } from "../../../redux/reducers";
import { RootState } from "../../../redux/types";
import ProductionCountTable from "../Tables/ProductionCountTable";
import AvgOeeChart from "../Charts/AvgOeeChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../@/components/ui/dropdown-menu";
import { Button } from "../../../@/components/ui/button";

// interface LeftNavProps {
//   selectedDate: Date | null;
// }

function LeftNav() {
  const dispatch = useDispatch();

  const selectedOption = useSelector(
    (state: RootState) => state.app.selectedOption
  );
  // const [selectedOption, setSelectedOption] = useState("1h");
  const [formattedDate, setFormattedDate] = useState<string>("");

  const handleSelectedOptionChange = (newValue: string) => {
    dispatch(setSelectedOption(newValue));
  };

  return (
    <div>
      <AvgOeeChart />
      <div style={{ marginRight: "20px" }}>
        <div className="mb-3">
          <h5 style={{ color: "gray", marginLeft: "10px" }}>Parts Produced</h5>

          {/* <h3>{formattedDate}</h3> */}
          {/* <h3> {formattedDate}</h3> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} style={{marginLeft: "10px"}}>
                Select Time Range :{" "}
                {selectedOption === "1"
                  ? "1 Hr"
                  : selectedOption === "8"
                  ? "8 Hr"
                  : selectedOption === "24"
                  ? "24 Hr"
                  : ""}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* DropdownMenuItem components for each option */}
              <DropdownMenuItem
                onClick={() => handleSelectedOptionChange("1")}
                className={selectedOption === "1" ? "active" : ""}
              >
                1 Hour
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectedOptionChange("8")}
                className={selectedOption === "8" ? "active" : ""}
              >
                8 Hours
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelectedOptionChange("24")}
                className={selectedOption === "24" ? "active" : ""}
              >
                24 Hours
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProductionCountTable />
    </div>
  );
}

export default LeftNav;
