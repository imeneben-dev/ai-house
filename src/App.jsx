import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import { EventsProvider } from "./context/EventsContext";
import Navbar             from "./components/Navbar";

import Home            from "./pages/Home";
import Training        from "./pages/Training";
import EventDetail     from "./pages/EventDetail";
import Representatives from "./pages/Representatives";
import SignIn          from "./pages/SignIn";
import SignUp          from "./pages/SignUp";
import Settings        from "./pages/Settings";
import AddEvent        from "./pages/AddEvent";
import Admin           from "./pages/Admin";

function Layout() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/training"        element={<Training />} />
        <Route path="/training/new"    element={<AddEvent />} />
        <Route path="/training/:id"    element={<EventDetail />} />
        <Route path="/representatives" element={<Representatives />} />
        <Route path="/signin"          element={<SignIn />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/settings"        element={<Settings />} />
        <Route path="/admin"           element={<Admin />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </EventsProvider>
    </AuthProvider>
  );
}