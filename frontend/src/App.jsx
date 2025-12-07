

import Register from "./Register";
import Login from "./Login";
import SymptomChecker from "./SymptomChecker";
import { useState } from "react";


function App() {
  const [page, setPage] = useState("register");
  // Handler to switch to login after registration
  const handleRegistered = () => setPage("login");
  const handleLoginSuccess = () => setPage("symptom");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-pink-200 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-800 tracking-tight drop-shadow">ClinicEase</h1>
      <div className="w-full max-w-lg">
        {page === "register" && <Register onRegistered={handleRegistered} />}
        {page === "login" && <Login onLoginSuccess={handleLoginSuccess} />}
        {page === "symptom" && <SymptomChecker />}
      </div>
      {page !== "symptom" && (
        <div className="mt-6 text-center">
          {page === "register" ? (
            <span className="text-gray-700">Already have an account?{' '}
              <button className="text-blue-600 hover:underline font-semibold" onClick={() => setPage("login")}>Login</button>
            </span>
          ) : (
            <span className="text-gray-700">Don't have an account?{' '}
              <button className="text-pink-600 hover:underline font-semibold" onClick={() => setPage("register")}>Register</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
