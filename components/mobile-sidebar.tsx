import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "./sidebar";

const MobileSidebar = () => {
  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <Menu className="text-white"></Menu>
        </SheetTrigger>
        <SheetContent className="p-0 z-[100]" side="left">
          <SheetTitle></SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
