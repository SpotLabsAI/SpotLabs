import { useState } from "react";
import "./../styles/bio.scss";

function Biography() {
  const [text, setText] = useState<string>("");

  return (
    <div>
      <textarea
        className="bio-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        contentEditable="plaintext-only"
        suppressContentEditableWarning={true}
      />
    </div>
  );
}

export default Biography;
