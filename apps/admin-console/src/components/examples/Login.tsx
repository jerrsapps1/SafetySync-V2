import Login from "../../pages/login";
import { AuthProvider } from "../../contexts/AuthContext";

export default function LoginExample() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
