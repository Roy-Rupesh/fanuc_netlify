import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setStartDate,
  setEndDate,
  setUserInput,
} from "../../../redux/reducers";

import PdfGenerator from "../../Reports/PdfGenerator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../../../@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../@/components/ui/dropdown-menu";
import { Button } from "../../../@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../@/components/ui/popover";
import { cn } from "../../../@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../../../@/components/ui/calendar";
import React, { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays, isAfter } from "date-fns";
import { RootState } from "../../../redux/types";
import { Label } from "../../../@/components/ui/label";
import { Input } from "../../../@/components/ui/input";

function Header({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const AvgOEE = useSelector((state: RootState) => state.app.avgOee);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 1),
    to: new Date(),
  });
  const dispatch = useDispatch();
  const [startDate, setStartDate_] = React.useState<Date | undefined>(
    subDays(new Date(), 1)
  );
  const [endDate, setEndDate_] = React.useState<Date | undefined>(new Date());

  const userInput = useSelector((state: RootState) => state.app.userInput);
  const popoverTriggerRef = useRef(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the input is a valid number between 0 and 24 or empty
    if (
      newValue === "" ||
      (/^\d+$/.test(newValue) &&
        parseInt(newValue, 10) >= 0 &&
        parseInt(newValue, 10) <= 24)
    ) {
      dispatch(setUserInput(newValue));
    }
  };

  const handleEnterKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      // Close the popover when Enter key is pressed
      const triggerButton =
        popoverTriggerRef.current as HTMLButtonElement | null;
      if (triggerButton) {
        triggerButton.click(); // Simulate a click on the popover trigger button
      }
    }
  };
  useEffect(() => {
    if (date?.from && date?.to) {
      setStartDate_(date?.from);
      setEndDate_(date?.to);
      dispatch(setStartDate(date.from));
      dispatch(setEndDate(date.to));
    }
  }, [date]);

  return (
    <>
      <div
        style={{
          marginLeft: "10px",
          marginRight: "10px",
          marginTop: "10px",
        }}
      >
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem></NavigationMenuItem>
            <NavigationMenuItem>{/* <PdfGenerator /> */}</NavigationMenuItem>
            <NavigationMenuItem>
              <div className={cn("grid gap-2", className)}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[19vw] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                      modifiers={{
                        // Disable dates that are after today
                        disabled: (day) => isAfter(day, new Date()),
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" ref={popoverTriggerRef}>
                    Select Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40">
                  <div className="grid gap-1">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Time Range</h4>
                      <p className="text-sm text-muted-foreground">
                        Set the range.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Range</Label>
                        <Input
                          id="width"
                          value={userInput}
                          onChange={handleInputChange}
                          onKeyPress={handleEnterKeyPress}
                          className="col-span-2 h-8"
                          placeholder="1-24"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <h3 style={{ color: "gray" }}>Company OEE : {AvgOEE}%</h3>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
}

export default Header;
