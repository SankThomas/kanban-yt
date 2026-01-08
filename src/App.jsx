import { Authenticated, Unauthenticated } from "convex/react";
import AuthPage from "./components/AuthPage";
import AuthenticatedApp from "./components/AuthenticatedApp";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Authenticated>
        <AuthenticatedApp />
        <Toaster richColors />
      </Authenticated>

      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
    </>
  );
}
