"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
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

// IMPORTANT: Replace with your Google Sheet ID
// Create a Google Sheet and put the ID here (from the URL: spreadsheets/d/YOUR_ID_HERE)
const SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"; 
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

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

async function sheetsApiCall(range: string, accessToken: string, method: string = 'GET', body?: object) {
  const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${range}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

async function registerUserInSheet(user: User, accessToken: string): Promise<UserCredits> {
  try {
    // Check if user exists
    const result = await sheetsApiCall('Users!A:A', accessToken);
    
    if (result.values) {
      for (let i = 0; i < result.values.length; i++) {
        if (result.values[i][0] === user.id) {
          const row = result.values[i];
          const freeCreditsUsed = parseInt(row[4]) || 0;
          const hasSubscription = row[5] === 'TRUE';
          const plan = row[6] || 'free';
          const totalCredits = hasSubscription ? getPlanLimit(plan) : 3;
          
          return {
            totalCredits,
            usedCredits: freeCreditsUsed,
            remainingCredits: Math.max(0, totalCredits - freeCreditsUsed),
            hasSubscription,
            plan
          };
        }
      }
    }
    
    // New user - append row
    const now = new Date().toISOString();
    const newRow = [[user.id, user.name, user.email, user.picture, '0', 'FALSE', '', now]];
    
    await sheetsApiCall('Users!A1', accessToken, 'POST', { values: newRow });
    
    return {
      totalCredits: 3,
      usedCredits: 0,
      remainingCredits: 3,
      hasSubscription: false,
      plan: 'free'
    };
  } catch (error) {
    console.error('Sheets API error:', error);
    // Return default credits if API fails
    return {
      totalCredits: 3,
      usedCredits: 0,
      remainingCredits: 3,
      hasSubscription: false,
      plan: 'free'
    };
  }
}

async function deductCreditInSheet(userId: string, accessToken: string): Promise<{ success: boolean; remaining: number }> {
  try {
    const result = await sheetsApiCall('Users!A:A', accessToken);
    
    if (!result.values) return { success: false, remaining: 0 };
    
    for (let i = 0; i < result.values.length; i++) {
      if (result.values[i][0] === userId) {
        const rowNum = i + 2;
        const freeCreditsUsed = parseInt(result.values[i][4]) || 0;
        const hasSubscription = result.values[i][5] === 'TRUE';
        const plan = result.values[i][6] || 'free';
        const totalCredits = hasSubscription ? getPlanLimit(plan) : 3;
        
        if (freeCreditsUsed >= totalCredits) {
          return { success: false, remaining: 0 };
        }
        
        await sheetsApiCall(`Users!E${rowNum}:E${rowNum}`, accessToken, 'PUT', {
          values: [[String(freeCreditsUsed + 1)]]
        });
        
        return { success: true, remaining: totalCredits - freeCreditsUsed - 1 };
      }
    }
    
    return { success: false, remaining: 0 };
  } catch (error) {
    console.error('Deduct credit error:', error);
    return { success: false, remaining: 0 };
  }
}

async function getUserCreditsFromSheet(userId: string, accessToken: string): Promise<UserCredits | null> {
  try {
    const result = await sheetsApiCall('Users!A:A', accessToken);
    
    if (!result.values) return null;
    
    for (let i = 0; i < result.values.length; i++) {
      if (result.values[i][0] === userId) {
        const row = result.values[i];
        const freeCreditsUsed = parseInt(row[4]) || 0;
        const hasSubscription = row[5] === 'TRUE';
        const plan = row[6] || 'free';
        const totalCredits = hasSubscription ? getPlanLimit(plan) : 3;
        
        return {
          totalCredits,
          usedCredits: freeCreditsUsed,
          remainingCredits: Math.max(0, totalCredits - freeCreditsUsed),
          hasSubscription,
          plan
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get credits error:', error);
    return null;
  }
}

function getPlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    'personal': 100,
    'pro': 300,
    'team': 500
  };
  return limits[plan] || 3;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const initGoogleAuth = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();
      
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

      if (!document.getElementById("google-identity-services")) {
        const script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!user?.accessToken) return;
    const creds = await getUserCreditsFromSheet(user.id, user.accessToken);
    if (creds) setCredits(creds);
  }, [user]);

  const deductCredit = useCallback(async (): Promise<boolean> => {
    if (!user?.accessToken) return false;
    const result = await deductCreditInSheet(user.id, user.accessToken);
    if (result.success) {
      setCredits(prev => prev ? {
        ...prev,
        usedCredits: prev.usedCredits + 1,
        remainingCredits: result.remaining
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
        scope: 'email profile https://www.googleapis.com/auth/spreadsheets',
        callback: async (response: any) => {
          const userData = decodeToken(response.credential);
          if (userData) {
            const accessToken = response.access_token;
            userData.accessToken = accessToken;
            
            sessionStorage.setItem(
              SESSION_KEY,
              JSON.stringify({ user: userData, expires: Date.now() + 3600 * 1000 })
            );
            setUser(userData);
            
            if (accessToken) {
              const creds = await registerUserInSheet(userData, accessToken);
              setCredits(creds);
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
