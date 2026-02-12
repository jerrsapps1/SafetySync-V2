/**
 * SupportWidget - Placeholder component for future chatbot/support feature
 * 
 * This component is not currently rendered in the application.
 * To enable it, import and add it to your layout/page component.
 * 
 * Example usage:
 * import { SupportWidget } from "@/components/SupportWidget";
 * 
 * function App() {
 *   return (
 *     <>
 *       <YourContent />
 *       <SupportWidget />
 *     </>
 *   );
 * }
 */

export function SupportWidget() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
        data-testid="support-widget-trigger"
        onClick={() => console.log("Support widget clicked")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="mx-auto h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </button>
    </div>
  );
}
