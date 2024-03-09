import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { getFacts } from "../lib/utils";
import "./../styles/planner.scss";

function Planner() {
  const fact: WritableFactContextType = useFact();

  return (
    <div className="planner-list">
      {getFacts(fact)?.map((entry, index) => {
        const data = JSON.parse(entry.fact.content);
        return (
          <div key={index} className="planner-entry">
            <div className="planner-entry-top">
              <div className="planner-entry-title">{data.title}</div>
              <div className="planner-entry-date">{data.date}</div>
            </div>
            <div className="planner-entry-subtitle">{data.summary}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Planner;
