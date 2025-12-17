import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, role")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setFullName(data?.full_name || "");
      setPhone(data?.phone || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const fileName = `${user.id}.${ext}`;

        await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = data.publicUrl;
      }

      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      setEditing(false);
      loadProfile();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-md p-6 cursor-pointer"
        onClick={() => !editing && setEditing(true)}
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={profile.avatar_url || "https://via.placeholder.com/120"}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover mb-3"
          />

          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="text-sm"
            />
          )}

          <span className="mt-2 text-xs text-gray-400">
            {editing ? "Editing profile" : "Click anywhere to edit"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <input
              value={fullName}
              disabled={!editing}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${editing ? "bg-white" : "bg-gray-100"}`}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <input
              value={phone}
              disabled={!editing}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${editing ? "bg-white" : "bg-gray-100"}`}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Role</label>
            <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 capitalize">
              {profile.role}
            </div>
          </div>
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="mt-4 w-full text-sm text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
