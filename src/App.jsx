import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth }   from "./context/AuthContext";
import { EventsProvider } from "./context/EventsContext";
import { useEffect } from "react";
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
  const navigate = useNavigate();
  const { user } = useAuth(); // Grab the logged-in user!

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSystemAdmin = user?.role === "admin";

  // MAGIC FIX 1: The Bouncer! Keep admins out of public pages.
  useEffect(() => {
    const publicPaths = ["/", "/training", "/representatives"];
    if (isSystemAdmin && publicPaths.includes(location.pathname)) {
      navigate("/admin"); // Instantly teleport them to the dashboard
    }
  }, [isSystemAdmin, location.pathname, navigate]);

  // MAGIC FIX 2: Hide the Navbar on /admin routes AND on the /settings page if they are an admin!
  const showNavbar = !isAdminRoute && !isSystemAdmin;

  return (
    <>
      {showNavbar && <Navbar />}
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