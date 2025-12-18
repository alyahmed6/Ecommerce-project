import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient/supabaseClient";

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await supabase.auth.getUser?.();
      const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
      if (!user) return;

      setEmail(user.email || "");
      setCreatedAt(user?.created_at || "");

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 const uploadImage = async () => {
  if (!imageFile) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `${user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from("avatars")  
    .upload(filePath, imageFile, {
      upsert: true,
      contentType: imageFile.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

  const handleSave = async () => {
    try {
      setSaving(true);

      const res2 = await supabase.auth.getUser?.();
      const user2 = res2?.data?.user ?? res2?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
      if (!user2) return;

      let avatarUrl = profile?.avatar_url ?? null;

      if (imageFile) {
        avatarUrl = await uploadImage(user2.id);
        setAvatarVersion(Date.now());
      }

      await supabase
        .from("profiles")
        .upsert(
          {
            id: user2.id,
            full_name: fullName,
            phone,
            avatar_url: avatarUrl,
            role,
          },
          { returning: "minimal" }
        );

        setEditing(false);
      setImageFile(null);
      await loadProfile();
    } catch (err) {
      alert(err.message || err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center"> 
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const avatarSrc = (profile.avatar_url || "https://via.placeholder.com/160") + (avatarVersion ? `?v=${avatarVersion}` : "");

  return (
    <div className="min-h-screen mt-[100px] bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100">
              <img
                src={previewUrl || avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {editing &&
              <label className="mt-3 text-sm text-gray-600 cursor-pointer inline-block px-3 py-1 rounded bg-gray-100">
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
           }
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">My Profile</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setImageFile(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full name</label>
                <input value={fullName} disabled={!editing} onChange={(e) => setFullName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              </div>

              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <input value={phone} disabled={!editing} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              </div>

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input value={email} disabled className="w-full mt-1 p-2 border rounded bg-gray-50" />
              </div>

              <div>
                <label className="text-sm text-gray-500">Member since</label>
                <input value={createdAt ? new Date(createdAt).toLocaleDateString() : ""} disabled className="w-full mt-1 p-2 border rounded bg-gray-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
