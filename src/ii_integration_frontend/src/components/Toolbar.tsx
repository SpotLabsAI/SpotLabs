import { CalendarDays, Key, Plug, Settings, Text, User } from "lucide-react";

function Toolbar({ setPluginManagerOpen }: { setPluginManagerOpen: () => void }) {
  return (
    <div className="toolbar">
      <div className="top">
        <div
          className="toolbar-icon"
          onClick={(e) => {
            setPluginManagerOpen();
          }}
        >
          <Plug size={"1em"} strokeWidth={1} />
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
