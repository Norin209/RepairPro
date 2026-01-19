import React from "react";
import type { Location } from "../types/repairTypes";

interface Props {
  showPrice?: boolean;
  selectedModel?: string;
  selectedIssue?: string;
  selectedLocation?: Location;
  quotePrice?: number | null;
  navigateStep?: (step: number) => void;
}

const QuoteInformationPanel: React.FC<Props> = ({
  showPrice = false,
  selectedModel,
  selectedIssue,
  selectedLocation,
  quotePrice,
  navigateStep,
}) => {
  return (
    <div className="md:w-1/2 p-6 border border-gray-200 rounded-xl bg-white shadow-sm text-left">
      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4">
        Quote Information
      </h3>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <strong>Device:</strong> {selectedModel}
        </p>
        <p>
          <strong>Problem:</strong> {selectedIssue}
        </p>

        <p>
          <strong>Price from:</strong>
          {showPrice ? (
            <span className="ml-2 text-black">
              {quotePrice !== null ? `$${quotePrice}` : "Price unavailable"}
            </span>
          ) : (
            <span className="ml-2 text-gray-500">
              Submit details to reveal price
            </span>
          )}
        </p>

        <p className="text-gray-500">
          <strong>Timeframe:</strong> 1–2 Hours
        </p>
        <p className="text-gray-500">
          <strong>Warranty:</strong> 90 Days
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-bold mb-2">Selected Store</h3>

        {selectedLocation ? (
          <>
            <p className="text-sm">{selectedLocation.name}</p>
            <p className="text-sm">{selectedLocation.address}</p>
            <p className="text-sm">{selectedLocation.phone}</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">No store selected yet</p>
        )}

        {navigateStep && (
          <button
            onClick={() => navigateStep(4)}
            className="text-black font-semibold text-sm mt-2 hover:underline"
          >
            Change Location
          </button>
        )}
      </div>
    </div>
  );
};

export default QuoteInformationPanel;
