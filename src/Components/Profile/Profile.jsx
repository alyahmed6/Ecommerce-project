import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient/supabaseClient";
import ProfileLoader from "../Loader/ProfileLoader";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");

 const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setProfile(null);
        return;
      }

      setEmail(user.email || "");
      setCreatedAt(user.created_at || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, role")
        .eq("id", user.id)
        .single();
      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setRole(data.role || "user");

    } catch (err) {
      console.error("Load profile error:", err);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    // Check if a session exists on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) loadProfile();
    };
    checkSession();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          loadProfile();
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  // ================= UPLOAD AVATAR =================
  const uploadImage = async () => {
    if (!imageFile) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const ext = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, imageFile, {
        upsert: true,
        contentType: imageFile.type,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

 
  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      let avatarUrl = profile?.avatar_url ?? null;

      if (imageFile) {
        avatarUrl = await uploadImage();
        setAvatarVersion(Date.now());
      }

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone,
          avatar_url: avatarUrl,
          role,
        });
      if (upsertError) throw upsertError;

      setEditing(false);
      setImageFile(null);
      await loadProfile();

    } catch (err) {
      alert(err.message || err);
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <ProfileLoader />;
  if (!profile)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">No profile found</div>
      </div>
    );

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const avatarSrc =
    (profile.avatar_url || "https://via.placeholder.com/160") +
    (avatarVersion ? `?v=${avatarVersion}` : "");

  
  return (
    <div className="min-h-screen mt-[100px] bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

         
          <div className="flex flex-col items-center md:items-start">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100">
              <img
                src={previewUrl || avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {editing && (
              <label className="mt-3 text-sm text-gray-600 cursor-pointer px-3 py-1 rounded bg-gray-100">
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">My Profile</h2>
              <div className="flex gap-4">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setImageFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
              <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Admin Panal
                </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full name</label>
                <input
                  value={fullName}
                  disabled={!editing}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <input
                  value={phone}
                  disabled={!editing}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input
                  value={email}
                  disabled
                  className="w-full mt-1 p-2 border rounded bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Member since</label>
                <input
                  value={createdAt ? new Date(createdAt).toLocaleDateString() : ""}
                  disabled
                  className="w-full mt-1 p-2 border rounded bg-gray-50"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
