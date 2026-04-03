"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface SubscriptionPlan {
  name: string;
  monthlyLimit: number;
}

interface UserCredits {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  hasSubscription: boolean;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  credits: UserCredits | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  credits: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshCredits: async () => {},
  deductCredit: async () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = "google_user_session";
const API_BASE = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"; // Replace with your Apps Script URL

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

async function callAPI(action: string, data?: object): Promise<any> {
  if (API_BASE === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
    console.warn("API not configured yet");
    return { success: false, error: "API not configured" };
  }
  
  try {
    const url = new URL(API_BASE);
    url.searchParams.set("action", action);
    
    const options: RequestInit = {
      method: data ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url.toString(), options);
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    return { success: false, error: String(error) };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const initGoogleAuth = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();
      
      // Check session
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.expires > Date.now()) {
            setUser(parsed.user);
            // Fetch credits
            callAPI("getStats", { userId: parsed.user.id })
              .then(result => {
                if (result.success) setCredits(result.stats);
              });
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
          const params = new URLSearchParams(window.location.search);
          const credential = params.get("credential");
          if (credential) {
            const userData = decodeToken(credential);
            if (userData) {
              sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({ user: userData, expires: Date.now() + 3600 * 1000 })
              );
              window.history.replaceState({}, "", window.location.pathname);
              setUser(userData);
              // Register user and get credits
              callAPI("register", userData).then(result => {
                if (result.success && result.user) {
                  const creditsData: UserCredits = {
                    totalCredits: result.user.hasSubscription ? getPlanLimit(result.user.subscriptionPlan) : 3,
                    usedCredits: result.user.freeCreditsUsed,
                    remainingCredits: result.user.hasSubscription 
                      ? Math.max(0, getPlanLimit(result.user.subscriptionPlan) - result.user.freeCreditsUsed)
                      : Math.max(0, 3 - result.user.freeCreditsUsed),
                    hasSubscription: result.user.hasSubscription,
                    plan: result.user.subscriptionPlan || 'free'
                  };
                  setCredits(creditsData);
                }
              });
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

  const refreshCredits = useCallback(async () => {
    if (!user) return;
    const result = await callAPI("getStats", { userId: user.id });
    if (result.success) {
      setCredits(result.stats);
    }
  }, [user]);

  const deductCredit = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const result = await callAPI("deductCredit", { userId: user.id });
    if (result.success) {
      setCredits(prev => prev ? {
        ...prev,
        usedCredits: prev.usedCredits + 1,
        remainingCredits: Math.max(0, prev.remainingCredits - 1)
      } : null);
      return true;
    }
    return false;
  }, [user]);

  useEffect(() => {
    initGoogleAuth().then(() => setLoading(false));
  }, [initGoogleAuth]);

  const signIn = async () => {
    const { google } = window as any;
    if (!google) return;

    return new Promise<void>((resolve, reject) => {
      google.accounts.id.initialize({
        client_id: "183586128219-sl1fs3heq92fvrafqkhaav0bqe6loa0e.apps.googleusercontent.com",
        callback: async (response: any) => {
          const userData = decodeToken(response.credential);
          if (userData) {
            sessionStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ user: userData, expires: Date.now() + 3600 * 1000 })
            );
            setUser(userData);
            
            // Register or get user
            const result = await callAPI("register", userData);
            if (result.success && result.user) {
              const creditsData: UserCredits = {
                totalCredits: result.user.hasSubscription ? getPlanLimit(result.user.subscriptionPlan) : 3,
                usedCredits: result.user.freeCreditsUsed,
                remainingCredits: result.user.hasSubscription 
                  ? Math.max(0, getPlanLimit(result.user.subscriptionPlan) - result.user.freeCreditsUsed)
                  : Math.max(0, 3 - result.user.freeCreditsUsed),
                hasSubscription: result.user.hasSubscription,
                plan: result.user.subscriptionPlan || 'free'
              };
              setCredits(creditsData);
            }
            resolve();
          } else {
            reject(new Error("Failed to parse user data"));
          }
        },
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkipped()) {
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
    setCredits(null);
  };

  return (
    <AuthContext.Provider value={{ user, credits, loading, signIn, signOut, refreshCredits, deductCredit }}>
      {children}
    </AuthContext.Provider>
  );
}

function getPlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    'personal': 100,
    'pro': 300,
    'team': 500
  };
  return limits[plan] || 0;
}
