import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../@/components/ui/popover";
import { useRef } from "react";
import { RootState } from "../../../redux/types";
import { Label } from "../../../@/components/ui/label";
import { Input } from "../../../@/components/ui/input";
import { setUserInput } from "../../../redux/reducers";
export default function RangeSelect() {
  const dispatch = useDispatch();

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
  return (
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
            <p className="text-sm text-muted-foreground">Set the range.</p>
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
  );
}
