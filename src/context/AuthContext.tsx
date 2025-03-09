
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  username: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch username if user is logged in
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUsername(data.username);
        }
      }
      
      setLoading(false);
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch username if user is logged in
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUsername(data.username);
        }
      } else {
        setUsername(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        // Create default balances if they don't exist
        if (session?.user) {
          try {
            // This will call the function to ensure user balances exist
            await supabase.rpc('ensure_user_balances', { 
              user_id: session.user.id 
            });
          } catch (balanceError) {
            console.error("Failed to ensure user balances:", balanceError);
          }
        }
        
        navigate('/dashboard');
        toast({
          title: "Successfully signed in",
          description: "Welcome back!",
        });
      } else {
        console.error("Sign in error:", error);
        toast({
          title: "Sign in failed",
          description: error.message || "Please check your credentials and try again",
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Unexpected auth error during sign in:", error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username: username
          }
        }
      });
      
      if (!error) {
        // Update profile with username
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              username: username,
              updated_at: new Date().toISOString()
            });
            
          if (profileError) {
            console.error("Profile update error:", profileError);
          } else {
            setUsername(username);
          }
        }
        
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account",
        });
        // We'll navigate after email verification, not immediately
      } else {
        console.error("Sign up error:", error);
        toast({
          title: "Sign up failed",
          description: error.message || "Could not create your account",
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Unexpected auth error during sign up:", error);
      toast({
        title: "Sign up error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUsername(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, username, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
