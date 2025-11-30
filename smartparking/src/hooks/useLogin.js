import { auth } from "../Firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { setToken, setLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const handleLogin = async (email, password) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      setToken(idToken);
      showSuccess("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      setToken(idToken);
      showSuccess("Logged in with Google successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Google login failed. Please try again.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    handleGoogleLogin,
  };
};
