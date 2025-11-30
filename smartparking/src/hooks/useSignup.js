import { auth } from "../Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export const useSignup = () => {
  const navigate = useNavigate();
  const { setToken, setLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const handleSignup = async (email, password) => {
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      setToken(idToken);
      showSuccess("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Signup failed. Please try again.";
      showError(errorMessage);
      setLoading(false);
    }
  };

  return {
    handleSignup,
  };
};
