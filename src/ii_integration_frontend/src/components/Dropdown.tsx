import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import { useState } from "react";

export type DropdownProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const Dropdown = (props: DropdownProps) => {
  const [value, setValue] = useState<string>(props.value);

  return (
    <CDropdown variant="btn-group" direction="dropup">
      <CDropdownToggle color="secondary">{value}</CDropdownToggle>
      <CDropdownMenu>
        {props.options.map((option) => (
          <CDropdownItem
            key={option}
            onClick={() => {
              setValue(option);
              props.onChange(option);
            }}
          >
            {option}
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  );
};

export default Dropdown;
