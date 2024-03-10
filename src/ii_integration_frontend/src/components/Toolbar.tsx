import { LineChart, Plug, Settings, User } from "lucide-react";

function Toolbar({
  setPluginManagerOpen,
  setDataWindowOpen,
}: {
  setPluginManagerOpen: () => void;
  setDataWindowOpen: () => void;
}) {
  return (
    <div className="toolbar">
      <div className="top">
        <div
          className="toolbar-icon"
          onClick={(_) => {
            setPluginManagerOpen();
          }}
        >
          <Plug size={"1em"} strokeWidth={1} />
        </div>
        <div
          className="toolbar-icon"
          onClick={(_) => {
            setDataWindowOpen();
          }}
        >
          <LineChart size={"1em"} strokeWidth={1} />
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
