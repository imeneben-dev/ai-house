import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Fake users for demo — replace with real API calls later
const MOCK_USERS = [
  { id: 1, fullName: "Dr. Amira Benali",  email: "amira@univ-blida.dz",  department: "Computer Science", role: "representative", password: "1234" },
  { id: 2, fullName: "Yacine Meziani",    email: "yacine@univ-blida.dz", department: "Biology",          role: "participant",    password: "1234" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser)); 
    }
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