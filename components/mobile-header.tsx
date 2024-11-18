import MobileSidebar from "./mobile-sidebar";

const MobileHeader = () => {
  return (
    <div
      className="lg:hidden px-6 h-[50px] flex items-center
     bg-green-500 border-b top-0 w-full z-50"
    >
      <MobileSidebar />
    </div>
  );
};

export default MobileHeader;
