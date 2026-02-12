import Landing from "../../pages/landing";
import { AuthProvider } from "../../contexts/AuthContext";

export default function LandingExample() {
  return (
    <AuthProvider>
      <Landing />
    </AuthProvider>
  );
}
