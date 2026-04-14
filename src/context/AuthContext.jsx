import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Fake users for demo — replace with real API calls later
const MOCK_USERS = [
  { id: 1, fullName: "Dr. Amira Benali",  email: "amira@univ-blida.dz",  department: "Computer Science", role: "representative", password: "1234" },
  { id: 2, fullName: "Yacine Meziani",    email: "yacine@univ-blida.dz", department: "Biology",          role: "participant",    password: "1234" },
  { id: 3, fullName: "Admin",             email: "admin@univ-blida.dz",  department: "Administration",   role: "admin",          password: "admin123" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out

  const signIn = (email, password) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) { setUser(found); return { success: true, role: found.role }; }
    return { success: false, error: "Invalid email or password." };
  };

  const signUp = ({ fullName, email, department, password, role }) => {
    // In real app: POST /api/auth/register
    const newUser = { id: Date.now(), fullName, email, department, role, password };
    setUser(newUser);
    return { success: true };
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}