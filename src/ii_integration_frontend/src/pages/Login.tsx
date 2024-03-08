import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";
import { login } from "../lib/auth";

const Login = () => {
  const auth: WritableAuthContextType = useAuth();

  return (
    <main>
      {auth.value.state === "anonymous" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            login(auth);
          }}
        >
          Login
        </button>
      ) : (
        <>
          {" "}
          <p>Loading...</p>
          <p>AuthState: {auth.value.state}</p>
        </>
      )}
    </main>
  );
};

export default Login;
