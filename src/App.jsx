import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar          from "./components/Navbar";

import Home            from "./pages/Home";
import Training        from "./pages/Training";
import EventDetail     from "./pages/Eventdetail";
import Representatives from "./pages/Representatives";
import SignIn          from "./pages/SignIn";
import SignUp          from "./pages/SignUp";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar is outside Routes → visible on every page */}
        <Navbar />

        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/Home"            element={<Home />} />
          <Route path="/training"        element={<Training />} />
          <Route path="/training/:id"    element={<EventDetail />} />
          <Route path="/representatives" element={<Representatives />} />
          <Route path="/signin"          element={<SignIn />} />
          <Route path="/signup"          element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}