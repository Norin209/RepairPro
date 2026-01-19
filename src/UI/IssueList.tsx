// src/UI/IssueList.tsx

import React from "react"; 
import { REPAIR_ISSUE_ICONS } from "../utils/useRepairLogic";
import type { DeviceName, RepairData } from "../types/repairTypes";

// 💡 DEFINE THE PREFERRED ORDER
const ISSUE_SORT_ORDER: string[] = [
  "Screen Replacement",
  "Back Glass",
  "Battery Replacement",
  "Charging Port",
  "Water Damage",
];

interface IssueListProps {
  selectedDevice: DeviceName | null;
  selectedModel: string | null;
  repairData: RepairData;
  selectedIssue: string | null;
  onSelect: (issue: string | null) => void; 
}

const IssueList: React.FC<IssueListProps> = ({
  selectedDevice,
  selectedModel,
  repairData,
  selectedIssue,
  onSelect,
}) => {
  const availableIssues =
    selectedDevice &&
    selectedModel &&
    repairData?.pricing?.[selectedDevice]?.[selectedModel]
      ? Object.keys(repairData.pricing[selectedDevice][selectedModel])
      : [];

  // 💡 SORTING LOGIC (unchanged)
  const sortedIssues = availableIssues.sort((a, b) => {
    const indexA = ISSUE_SORT_ORDER.indexOf(a);
    const indexB = ISSUE_SORT_ORDER.indexOf(b);

    if (indexA > -1 && indexB > -1) return indexA - indexB;
    if (indexA > -1) return -1;
    if (indexB > -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {sortedIssues.map((issue) => {
        const icon = REPAIR_ISSUE_ICONS[issue] || REPAIR_ISSUE_ICONS.default;
        const isSelected = issue === selectedIssue;

        return (
          <button
            key={issue}
            onClick={() => onSelect(issue)}
            className={`
              bg-white border rounded-xl p-6
              flex flex-col items-center justify-center text-black
              shadow-sm transition-all duration-300
              cursor-pointer
              ${
                isSelected
                  ? "border-black shadow-md"
                  : "border-gray-300 hover:border-black hover:shadow-xl hover:-translate-y-1"
              }
            `}
          >
            {/* ICON */}
            <img
              src={icon}
              alt={issue}
              className="h-16 w-auto md:h-20 object-contain mb-3"
            />

            {/* TEXT */}
            <p className="font-medium text-center">{issue}</p>
          </button>
        );
      })}

      {availableIssues.length === 0 && (
        <p className="col-span-3 text-center text-gray-500">
          Select a device and model to view issues.
        </p>
      )}
    </div>
  );
};

export default IssueList;
