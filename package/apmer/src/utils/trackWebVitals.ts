import { getLCP, getFID, getCLS } from "web-vitals";

export function trackWebVitals() {
    getFID(console.log, true);
    // getCLS(console.log);
    // getLCP(console.log);
}
