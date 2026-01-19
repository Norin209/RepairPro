import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-2CM9SM2E9L"; 

// Initialize once
ReactGA.initialize(MEASUREMENT_ID);

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 📢 Log to the console so we can see it working!
    console.log("👀 Tracking Page View:", location.pathname);

    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

export default AnalyticsTracker;