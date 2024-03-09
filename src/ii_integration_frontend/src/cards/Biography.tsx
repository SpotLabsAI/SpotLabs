import { useEffect, useState } from "react";
import "./../styles/bio.scss";

function Biography() {
  const [text, setText] = useState<string>("");

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    clearTimeout(timer as ReturnType<typeof setTimeout>);
    setTimer(setTimeout(callFunctionAfterDelay, 1000));
  };

  const callFunctionAfterDelay = () => {
    
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer as ReturnType<typeof setTimeout>);
    };
  }, [timer]);

  return (
    <div>
      <textarea
        className="bio-textarea"
        value={text}
        onChange={handleTextChange}
        placeholder="Type here..."
        contentEditable="plaintext-only"
        suppressContentEditableWarning={true}
      />
    </div>
  );
}

export default Biography;
