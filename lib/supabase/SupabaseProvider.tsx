"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
};
const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
  isAuthenticated: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function initializeSupabase() {
      if (!session) {
        setSupabase(null);
        setIsLoaded(true);
        setIsAuthenticated(false);
        return;
      }
      
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("Missing Supabase environment variables");
          setIsLoaded(true);
          return;
        }
        
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: {
              persistSession: false,
            },
          }
        );

        setSupabase(client);
        setIsLoaded(true);
        
        try {
          let token = await session.getToken({ template: "supabase" });
          
          if (!token) {
            token = await session.getToken();
          }
          
          if (token) {
            const { data: { user }, error } = await client.auth.getUser();
            if (!error && user) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (authError) {
          console.error("Auth check failed, continuing with basic client:", authError);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error initializing Supabase:", error);
        setSupabase(null);
        setIsLoaded(true);
        setIsAuthenticated(false);
      }
    }

    initializeSupabase();
  }, [session]);

  return (
    <Context.Provider value={{ supabase, isLoaded, isAuthenticated }}>
      {/* {!isLoaded ? <div> Loading...</div> : children} */}
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase needs to be inside the provider");
  }

  return context;
};
