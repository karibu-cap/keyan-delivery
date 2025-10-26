import { useEffect } from "react";

/**
 * Prevents the user from navigating back with the browser's back button.
 * Optionally, you can provide a callback to handle the event.
 */
export function useBlockBackNavigation(onBack?: () => void) {
   useEffect(() => {
      const handlePopState = (event: PopStateEvent) => {
         event.preventDefault();

         // If a custom handler is provided, call it
         if (onBack) {
            onBack();
         } else {
            // Otherwise, prevent going back by pushing the current state again
            window.history.pushState(null, "", window.location.href);
         }
      };

      // Push a new state and attach listener
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);

      return () => {
         window.removeEventListener("popstate", handlePopState);
      };
   }, [onBack]);
}
