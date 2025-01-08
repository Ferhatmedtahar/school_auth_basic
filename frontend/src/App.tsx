import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// PrivateRoute component to ensure authentication for protected routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const userId = Cookie.get("jwt");
  return userId ? <>{children}</> : <Navigate to="/signin" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status when the component mounts
  useEffect(() => {
    const userId = Cookie.get("jwt");
    if (userId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            element={
              <PrivateRoute>
                {isAuthenticated && <NavBar />}
                <Home />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            {/* <Route path="/checklist" element={<h1>Checklist</h1>} /> */}
          </Route>

          {/* Handle default route */}
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
