import { useCallback } from "react";
import useRepairLogic, { STEPS } from "../utils/useRepairLogic";
import type { DeviceName } from "../types/repairTypes"; 

import DeviceGrid from "../UI/DeviceGrid";
import ModelList from "../UI/ModelList";
import IssueList from "../UI/IssueList";
import LocationDetailPanel from "../UI/LocationDetailPanel";
import Calendar from "../UI/Calendar";
import ProgressBar from "../UI/ProgressBar";
import QuoteInformationPanel from "../UI/QuoteInformationPanel";
import ShopMapLeaflet from "../components/ShopMap";

const LOCATION_SORT_ORDER: string[] = ["Repair Pro Melbourne Central", "Repair Pro Springvale", "Repair Pro Chelsea"];

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => { const c = phone.replace(/\D/g, ""); return c.length >= 9 && c.length <= 12; };

const RepairPage = () => {
  const {
    isFirebaseReady, isDataLoading, repairData, devices, locations, step, navigateStep,
    selectedDevice, selectedModel, selectedIssue, selectedLocation, selectedLocationTemp, activeMapCenter,
    selectedDate, setSelectedDate, selectedTime, setSelectedTime, availableTimeSlots, isTimeLoading, loadingError,
    customerEmail, customerPhone, customerMessage, isLeadSubmitted, quotePrice, 
    
    discountCode, setDiscountCode,
    isPromoInvalid, appliedPromo,

    setSelectedDevice, setSelectedModel, setSelectedIssue, setCustomerEmail, setCustomerPhone, setCustomerMessage, 
    handleLeadSubmitInitial, handleLocationPreview, handleLocationConfirm, handleBookingConfirm,
  } = useRepairLogic();

  const handleIssueSelectAndAdvance = useCallback((issue: string | null) => { setSelectedIssue(issue); if (issue) navigateStep(4); }, [setSelectedIssue, navigateStep]);
  
  const sortedLocations = [...locations].sort((a, b) => {
    const iA = LOCATION_SORT_ORDER.indexOf(a.name);
    const iB = LOCATION_SORT_ORDER.indexOf(b.name);
    if (iA > -1 && iB > -1) return iA - iB;
    if (iA > -1) return -1;
    if (iB > -1) return 1;
    return a.name.localeCompare(b.name);
  });
  
  const getPageTitle = useCallback(() => {
    if (step === 1) return "Choose Your Device";
    if (step === 2) return `Select Your ${selectedDevice} Model`;
    if (step === 3) return "Select Your Repair Issue";
    if (step === 4) return "Select Your Preferred Location";
    if (step === 5) return "Final Details for Quote";
    if (step === 6) return "Your Instant Quote";
    if (step === 7) return "Book Your Appointment";
    if (step === 8) return "Booking Confirmed";
    return "";
  }, [step, selectedDevice]);

  const BackButtonContent = () => step > 1 && step < 8 && (
      <button onClick={() => { if (step === 4 && selectedLocationTemp) { handleLocationPreview(null as any); return; } navigateStep(step - 1); }}
        className="rounded-full px-4 py-2 text-sm font-medium bg-white border border-black text-black shadow-sm hover:shadow-md transition flex items-center gap-2">← Back</button>
    );

  const isFormValid = isValidEmail(customerEmail) && isValidPhone(customerPhone) && !isPromoInvalid;

  if (!isFirebaseReady) return <div className="pt-28 text-center text-red-600 font-bold text-xl">ERROR: Firebase failed to initialize.</div>;
  if (isDataLoading) return <div className="pt-28 text-center text-black font-semibold">Loading repair data...</div>;
  if (!repairData && step > 1) return <div className="pt-28 text-center text-red-600 font-bold">ERROR: Missing cloud data.</div>;

  return (
    <section className="w-full bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 h-10"><BackButtonContent /></div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-5">{getPageTitle()}</h1>
          {step < 8 && <ProgressBar currentStep={step} steps={STEPS.slice(0, 7)} />}
        </div>

        {step === 1 && <DeviceGrid devices={devices as any[]} onSelect={(name) => { setSelectedDevice(name as DeviceName); navigateStep(2); }} />}
        {step === 2 && selectedDevice && repairData && <ModelList models={repairData.models[selectedDevice]} onSelect={(model) => { setSelectedModel(model); navigateStep(3); }} />}
        {step === 3 && selectedModel && repairData && <div className="text-center"><IssueList selectedDevice={selectedDevice} selectedModel={selectedModel} repairData={repairData} selectedIssue={selectedIssue} onSelect={handleIssueSelectAndAdvance} /></div>}

        {step === 4 && selectedIssue && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:hidden gap-4">
              <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-300 shadow-lg"><ShopMapLeaflet locations={locations} onLocationSelect={handleLocationPreview} activeCenter={activeMapCenter} /></div>
              <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-lg">
                <h2 className="text-xl font-bold mb-3 text-black">Select Location</h2>
                <div className="space-y-2">{sortedLocations.map((loc) => (<button key={loc.id} onClick={() => handleLocationPreview(loc)} className={`w-full p-4 text-left border rounded-xl transition ${selectedLocationTemp?.id === loc.id ? "border-black bg-gray-100 shadow-md" : "border-gray-200 hover:border-gray-400"}`}><p className="font-semibold">{loc.name}</p><p className="text-sm text-gray-600">{loc.address}</p></button>))}</div>
              </div>
            </div>
            <div className="hidden sm:flex sm:flex-row relative w-full border border-gray-300 rounded-xl overflow-hidden shadow-2xl mt-5 h-[500px]">
              <div className="w-80 h-full flex-shrink-0 bg-white p-6 rounded-xl shadow-lg text-left overflow-y-auto border-r border-gray-300">
                <h2 className="text-xl font-bold mb-4">Select your preferred location</h2>
                <div className="space-y-3">{sortedLocations.map((loc) => (<button key={loc.id} onClick={() => handleLocationPreview(loc)} className={`w-full p-4 border rounded-xl transition text-left ${selectedLocationTemp?.id === loc.id ? "border-black bg-gray-100 shadow-md" : "border-gray-200 hover:border-gray-500"}`}><p className="font-semibold">{loc.name}</p><p className="text-sm text-gray-600">{loc.address}</p></button>))}</div>
              </div>
              <div className="flex-grow relative h-full"><ShopMapLeaflet locations={locations} onLocationSelect={handleLocationPreview} activeCenter={activeMapCenter} />{selectedLocationTemp && <LocationDetailPanel location={selectedLocationTemp} onConfirm={handleLocationConfirm} />}</div>
            </div>
            {selectedLocationTemp && (<div className="sm:hidden mt-4"><div className="w-full bg-white p-6 rounded-xl shadow-lg text-left border border-gray-300"><h3 className="text-xl font-bold mb-1">{selectedLocationTemp.name}</h3><p className="text-sm text-gray-600 mb-4">{selectedLocationTemp.address}</p><button onClick={() => handleLocationConfirm(selectedLocationTemp)} className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition">Select Store</button></div></div>)}
          </div>
        )}

        {step === 5 && selectedLocation && repairData && (
          <div className="mb-20 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-5">
            <div className="md:w-1/2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Where should we send your instant quote?</h2>
              <form className="space-y-5">
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center text-sm cursor-pointer"><input type="radio" name="contact" defaultChecked className="cursor-pointer" /><span className="ml-2">Email (Instant)</span></label>
                  <label className="flex items-center text-sm cursor-pointer"><input type="radio" name="contact" className="cursor-pointer" /><span className="ml-2">SMS (Instant)</span></label>
                </div>
                
                <div><input className={`w-full border p-3 rounded-xl outline-none focus:ring-2 transition ${customerEmail && !isValidEmail(customerEmail) ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-black"}`} placeholder="Email Address" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />{customerEmail && !isValidEmail(customerEmail) && (<p className="text-red-500 text-xs mt-1 ml-1">Please enter a valid email</p>)}</div>
                <div><input className={`w-full border p-3 rounded-xl outline-none focus:ring-2 transition ${customerPhone && !isValidPhone(customerPhone) ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-black"}`} placeholder="Phone Number" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />{customerPhone && !isValidPhone(customerPhone) && (<p className="text-red-500 text-xs mt-1 ml-1">Valid phone (9-12 digits)</p>)}</div>
                
                <div>
                  <input
                    className={`w-full border p-3 rounded-xl uppercase outline-none focus:ring-2 transition
                      ${isPromoInvalid ? "border-red-500 focus:ring-red-200 text-red-600" : (appliedPromo ? "border-green-500 focus:ring-green-200 text-green-700 font-bold" : "border-gray-300 focus:ring-black")}`}
                    placeholder="Discount Code (Optional)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  />
                  {isPromoInvalid && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">❌ Invalid Promo Code</p>}
                  {appliedPromo && <p className="text-green-600 text-xs mt-1 ml-1 font-bold">✅ Code Applied: {appliedPromo.label} (-{appliedPromo.type === 'fixed' ? '$'+appliedPromo.value : appliedPromo.value+'%'})</p>}
                </div>

                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-xl h-24 outline-none focus:ring-2 focus:ring-black transition" 
                  placeholder="Message (Optional)" 
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                />
                
                <button
                  onClick={(e) => { e.preventDefault(); if (isFormValid) handleLeadSubmitInitial(); }}
                  disabled={!isFormValid}
                  className={`w-full rounded-full px-10 py-4 text-lg font-semibold shadow-sm transition ${!isFormValid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800 hover:shadow-md"}`}
                >
                  {isFormValid ? "Send me the quote →" : "Enter details to proceed"}
                </button>
              </form>
            </div>
            <QuoteInformationPanel showPrice={false} selectedModel={selectedModel ?? ""} selectedIssue={selectedIssue ?? ""} selectedLocation={selectedLocation ?? undefined} quotePrice={quotePrice} />
          </div>
        )}

        {step === 6 && selectedLocation && isLeadSubmitted && repairData && (
          <div className="mb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 mt-5 mb-10"><div className="md:w-1/2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center"><p className="text-xl font-medium text-gray-700">Thank you! Your details have been saved. Your instant quote is shown on the right. Proceed to booking to secure your appointment.</p></div><QuoteInformationPanel showPrice={true} selectedModel={selectedModel ?? ""} selectedIssue={selectedIssue ?? ""} selectedLocation={selectedLocation ?? undefined} quotePrice={quotePrice} /></div>
            <div className="text-center"><button onClick={() => navigateStep(7)} className="w-full md:w-auto rounded-full px-12 py-4 text-xl font-bold bg-black text-white hover:bg-gray-800 transition shadow-lg">Proceed to Booking →</button></div>
          </div>
        )}

        {step === 7 && selectedLocation && isLeadSubmitted && repairData && (
          <div className="mb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 mt-5"><div className="md:w-1/2 p-4 md:p-6 bg-white border border-gray-200 rounded-xl shadow-sm"><Calendar locationId={selectedLocation.id} selectedDate={selectedDate} onDateSelect={setSelectedDate} selectedTime={selectedTime} onTimeSelect={setSelectedTime} onConfirmBooking={handleBookingConfirm} availableTimeSlots={availableTimeSlots} isTimeLoading={isTimeLoading} loadingError={loadingError} /></div><QuoteInformationPanel showPrice={true} selectedModel={selectedModel ?? ""} selectedIssue={selectedIssue ?? ""} selectedLocation={selectedLocation ?? undefined} quotePrice={quotePrice} /></div>
          </div>
        )}

        {step === 8 && selectedLocation && (
          <div className="mb-20 max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><i className="bi bi-check-lg text-4xl text-green-600"></i></div>
            <h1 className="text-4xl font-bold mb-4">Thank you for your booking!</h1>
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl mb-8 text-left">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Booking Details</h3>
              <p className="mb-2"><span className="font-bold">Store:</span> {selectedLocation.name}</p>
              <p className="mb-2"><span className="font-bold">Address:</span> {selectedLocation.address}</p>
              <p className="mb-2"><span className="font-bold">Device:</span> {selectedDevice} {selectedModel}</p>
              <p className="mb-2"><span className="font-bold">Issue:</span> {selectedIssue}</p>
              <p className="mb-2"><span className="font-bold">Date & Time:</span> {selectedDate ? new Date(selectedDate).toDateString() : "Date not selected"} at {selectedTime}</p>
              {discountCode && appliedPromo && <p className="mb-2"><span className="font-bold text-green-600">Promo Code:</span> {appliedPromo.code} (Applied)</p>}
              <p className="mt-4 text-sm text-gray-500">A confirmation has been sent to <b>{customerEmail}</b></p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-black p-4 rounded-xl"><p className="font-bold text-lg mb-1">Store Contact</p><p className="text-xl">{selectedLocation.phone}</p></div>
              
              {/* 🔴 UPDATED TO USE NEW /home URL */}
              <button onClick={() => window.location.href = "/home"} className="bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition">Return Home</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RepairPage;