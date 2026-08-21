import { createContext, useContext, useState, useEffect } from "react";

const AuthContext  = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Checks on first load if a token was saved from previous session
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }

        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark")
        }
        setIsLoading(false);
    }, []);

    function login(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
    }   

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const nextMode = !prev;
            if (nextMode) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark")
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light")
            }
            return nextMode;
        });
    };

    return (
        <AuthContext.Provider value={{token, login, logout, isLoading, isDarkMode, toggleDarkMode}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}