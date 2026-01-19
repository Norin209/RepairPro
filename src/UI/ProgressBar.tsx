// ProgressBar.tsx

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto mb-10 pt-4 px-4">
      {/* Container for step names */}
      <div className="flex justify-between items-center w-full mb-2">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const active = stepNum <= currentStep;

          return (
            <div
              key={label}
              className={`text-xs sm:text-sm text-center ${
                // Styled: Use black text and bold weight for active steps
                active ? "font-extrabold text-black" : "font-medium text-gray-500"
              } 
              // Added spacing (mx-0.5) to prevent squeezing on small screens
              mx-0.5 sm:mx-1`} 
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Progress Track */}
      <div className="relative h-1 bg-gray-300 w-full rounded-full mt-1"> 
        <div
          // Styled: Progress bar uses a thick black background
          className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;