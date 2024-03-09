import { CalendarDays, Key, Settings, Text, User } from "lucide-react";
import { Tab } from "../pages/Home";

function Toolbar({ setTab }: { setTab: (tab: Tab) => void }) {
  return (
    <div className="toolbar">
      <div className="top">
        <div
          className="toolbar-icon"
          onClick={(e) => {
            setTab("planner");
          }}
        >
          <CalendarDays size={"1em"} strokeWidth={1} />
        </div>
        <div
          className="toolbar-icon"
          onClick={(e) => {
            setTab("pwg");
          }}
        >
          <Key size={"1em"} strokeWidth={1} />
        </div>
        <div className="toolbar-icon" onClick={(e) => {
          setTab("summary");
        }}>
          <Text size={"1em"} strokeWidth={1} />
        </div>
      </div>
      <div className="bottom">
        <div className="toolbar-icon">
          <User size={"1em"} strokeWidth={1} />
        </div>
        <div className="toolbar-icon">
          <Settings size={"1em"} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
