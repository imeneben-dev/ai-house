import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Fake users for demo — replace with real API calls later
const MOCK_USERS = [
  { id: 1, fullName: "Dr. Amira Benali",  email: "amira@univ-blida.dz",  department: "Computer Science", role: "representative", password: "1234" },
  { id: 2, fullName: "Yacine Meziani",    email: "yacine@univ-blida.dz", department: "Biology",          role: "participant",    password: "1234" },
  { id: 3, fullName: "Admin User",        email: "admin@univ-blida.dz",  department: "Administration",   role: "admin",          password: "SecurePassword123!" }
];

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  useEffect(() => {
    const fetchFreshUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const freshUser = await response.json();
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (error) {
        console.error("Failed to sync user data");
      }
    };

    fetchFreshUserData();
  }, []);
  const signIn = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signUp = ({ fullName, email, department, password, role }) => {
    // In real app: POST /api/auth/register
    const newUser = { id: Date.now(), fullName, email, department, role, password };
    setUser(newUser);
    return { success: true };
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}