// src/UI/Calendar.tsx

import React from "react";

// Define the structure for the dynamically fetched time slots
interface TimeSlot {
  time: string;
  isAvailable: boolean; // True if count < max (2)
}

interface CalendarProps {
  locationId: string; 

  selectedDate: number | null;
  onDateSelect: (day: number) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  onConfirmBooking: () => void;
  
  availableTimeSlots: TimeSlot[]; 
  isTimeLoading: boolean;
  loadingError: string | null;
}

const Calendar: React.FC<CalendarProps> = ({
  locationId,
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  onConfirmBooking,
  availableTimeSlots,
  isTimeLoading,
  loadingError,
}) => {
  // Local Date/Calculation Variables
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.getDate(); // This correctly gives the current day number (e.g., 9 or 10)

  const monthName = now.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // END OF Local Date/Calculation Variables

  const canConfirm = selectedDate !== null && selectedTime !== null;
  
  // Early return if locationId is missing (Safety Check)
  if (!locationId) {
      return <div className="p-4 bg-white text-center text-red-500">Error: No store selected for booking.</div>;
  }

  return (
    <div className="p-4 bg-white">
      <h3 className="text-xl font-semibold text-center border-b border-black pb-2 mb-4">
        Book an appointment for this repair
      </h3>

      {/* Month and Year Header */}
      <p className="text-center font-semibold text-lg mb-4">
        {monthName} {currentYear}
      </p>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <div key={d} className="font-bold text-center text-gray-700">
            {d}
          </div>
        ))}

        {/* Empty cells to pad the beginning of the month */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={i}></div>
        ))}

        {/* Date Buttons */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          
          // 💡 ORIGINAL DYNAMIC LOGIC RESTORED: Only grey out days STRICTLY BEFORE TODAY.
          const isPast = day < today; 
          
          // We rely only on isPast. If you have an API to check availability, that would go here.
          const isDisabled = isPast;
          const active = selectedDate === day;

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => onDateSelect(day)}
              className={`rounded-full px-0.5 py-2 sm:px-3 sm:py-2 text-sm transition shadow-sm
              
              // Apply grey styling if the day is in the past
              ${isDisabled 
                ? "text-gray-300 cursor-not-allowed border border-gray-300" 
                : ""}
              
              ${
                // Override styling if the day is currently selected AND available (not disabled)
                !isDisabled && active
                  ? "bg-black text-white shadow-md"
                  : !isDisabled 
                    ? "bg-white border border-black text-black"
                    : "" // Let the isDisabled style handle the styling
              }
            `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time Slot Selection (Dynamic Content) */}
      {selectedDate && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-3 text-center">
            Select Time Slot 
            <span className="text-xs text-gray-500 block">Store ID: {locationId}</span>
          </h4>

          {isTimeLoading && <p className="text-center text-blue-600">Checking slot availability...</p>}
          {loadingError && <p className="text-center text-red-500">{loadingError}</p>}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableTimeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.isAvailable} 
                onClick={() => onTimeSelect(slot.time)}
                className={`py-2 rounded-full font-medium text-sm transition
                ${
                  !slot.isAvailable 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                    : selectedTime === slot.time 
                        ? "bg-black text-white shadow-md"
                        : "bg-white border border-gray-300 text-black" 
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {/* Fallback/Empty State */}
          {!isTimeLoading && availableTimeSlots.length === 0 && selectedDate && (
              <p className="text-center text-gray-500 mt-4">No time slots available for this date.</p>
          )}

        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={onConfirmBooking}
        disabled={!canConfirm}
        className={`mt-6 w-full rounded-full text-lg font-semibold px-10 py-4 shadow-lg
        ${
          canConfirm
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {canConfirm ? "Confirm Booking" : "Select Date & Time"}
      </button>
    </div>
  );
};

export default Calendar;