import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        if (supabase.auth && typeof supabase.auth.getUser === "function") {
          const { data } = await supabase.auth.getUser();
          if (!mounted) return;
          setUser(data?.user ?? null);
        } else if (supabase.auth && typeof supabase.auth.user === "function") {
          const u = supabase.auth.user();
          if (!mounted) return;
          setUser(u ?? null);
        } else {
          if (!mounted) return;
          setUser(null);
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setChecked(true);
      }
    };

    checkAuth();
    return () => (mounted = false);
  }, []);

  if (!checked) return <div className="min-h-screen flex items-center justify-center">Checking auth...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
