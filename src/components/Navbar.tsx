import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../@/components/ui/navigation-menu";
import Header from "./Dashboard/Nav/Header";

function Navbar() {
  return (
    <>
      <NavigationMenu style={{ display: "flex", flexDirection: "row" }}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/demo-dashboard">
              <NavigationMenuLink
                style={{ textDecoration: "none", color: "black" }}
                className={navigationMenuTriggerStyle()}
              >
                DashBoard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

       
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

export default Navbar;
