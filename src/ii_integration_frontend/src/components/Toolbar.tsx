import { Settings, User } from "lucide-react";

function Toolbar() {
  return (
    <div className="toolbar">
      <div className="top"></div>
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
