import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try v2 API
        let user = null;
        if (supabase.auth && typeof supabase.auth.getUser === "function") {
          const { data } = await supabase.auth.getUser();
          user = data?.user ?? null;
        }

        // Fallback to v1
        if (!user && supabase.auth && typeof supabase.auth.user === "function") {
          user = supabase.auth.user();
        }

        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          navigate("/login");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;

        setProfile(data || {});
      } catch (err) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-[120px] flex items-start justify-center bg-gray-50 py-10">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile/edit")}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Edit
            </button>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile && Object.keys(profile).length > 0 ? (
            Object.entries(profile).map(([key, value]) => (
              <div key={key} className="p-3 border rounded">
                <div className="text-sm text-gray-500">{key}</div>
                <div className="mt-1 font-medium text-gray-800 break-words">
                  {value === null || value === undefined ? (
                    <span className="text-gray-400">—</span>
                  ) : typeof value === "object" ? (
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No profile data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
