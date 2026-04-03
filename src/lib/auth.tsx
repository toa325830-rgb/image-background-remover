"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = "google_user_session";

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      id: decoded.sub,
      name: decoded.name || "",
      email: decoded.email || "",
      picture: decoded.picture || "",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initGoogleAuth = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();
      
      // Check if already have session stored
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.expires > Date.now()) {
            setUser(parsed.user);
          } else {
            sessionStorage.removeItem(SESSION_KEY);
          }
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }

      // Load Google Identity Services
      if (!document.getElementById("google-identity-services")) {
        const script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // Check for credential response in URL (OAuth redirect)
          const params = new URLSearchParams(window.location.search);
          const credential = params.get("credential");
          if (credential) {
            const userData = decodeToken(credential);
            if (userData) {
              sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({ user: userData, expires: Date.now() + 3600 * 1000 })
              );
              // Clean URL
              window.history.replaceState({}, "", window.location.pathname);
              setUser(userData);
            }
          }
          resolve();
        };
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }, []);

  useEffect(() => {
    initGoogleAuth().then(() => setLoading(false));
  }, [initGoogleAuth]);

  const signIn = async () => {
    const { google } = window as any;
    if (!google) return;

    return new Promise<void>((resolve, reject) => {
      google.accounts.id.initialize({
        client_id: "183586128219-sl1fs3heq92fvrafqkhaav0bqe6loa0e.apps.googleusercontent.com",
        callback: (response: any) => {
          const userData = decodeToken(response.credential);
          if (userData) {
            sessionStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ user: userData, expires: Date.now() + 3600 * 1000 })
            );
            setUser(userData);
            resolve();
          } else {
            reject(new Error("Failed to parse user data"));
          }
        },
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkipped()) {
          // Fallback: use signInWithRedirect
          google.accounts.id.renderButton(
            document.createElement("div"),
            { type: "standard" }
          );
          reject(new Error("One Tap not available"));
        }
      });
    });
  };

  const signOut = async () => {
    const { google } = window as any;
    if (google) {
      google.accounts.id.disableAutoSelect();
    }
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
