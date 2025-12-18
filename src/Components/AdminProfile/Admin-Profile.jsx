import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaUserEdit, FaCamera, FaRegCalendarAlt } from "react-icons/fa";
import { supabase } from "../../supabaseClient/supabaseClient";

const AdminProfile = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [joined, setJoined] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await supabase.auth.getUser?.();
        const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
        if (!user) return;

        setForm((f) => ({ ...f, email: user.email || "" }));
        setJoined(user.created_at ? new Date(user.created_at).toLocaleDateString() : "");

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, avatar_url")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setForm({ name: data.full_name || "", email: user.email || "", phone: data.phone || "" });
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
      }
    };

    loadAdmin();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await supabase.auth.getUser?.();
      const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
      if (!user) return;

      await supabase.from("profiles").upsert({ id: user.id, full_name: form.name, phone: form.phone });
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert(err.message || err);
    }
  };

  return (
    <div className="max-w-5xl mt-[100px] mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-700 overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : "A"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{form.name || "Administrator"}</h2>
            <p className="text-sm text-zinc-500">Administrator</p>

            <div className="mt-3 flex gap-3">
              
              <button onClick={() => setEditing(!editing)} 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"><FaUserEdit /> 
              Edit Profile</button>
{editing &&
              <label className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition flex items-center gap-2 cursor-pointer"><FaCamera /> 
              Change Avatar
                <input type="file" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await supabase.auth.getUser?.();
                    const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
                    if (!user) return;
                    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
                    const filePath = `avatars/${user.id}/${fileName}`;
                    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
                    if (error) throw error;
                    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    const publicUrl = data?.publicUrl ?? null;
                    if (publicUrl) {
                      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
                      setAvatarUrl(publicUrl + `?v=${Date.now()}`);
                    }
                  } catch (err) {
                    console.error('Avatar upload failed', err);
                    alert(err.message || err);
                  }
                }} /></label>}
            </div>
          </div>
        </div>

        <div className="ml-auto flex gap-6">
          <div className="text-center">
            <div className="text-sm text-zinc-500">Joined</div>
            <div className="font-semibold">{joined || '—'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-zinc-500">Products</div>
            <div className="font-semibold">—</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-zinc-500">Orders</div>
            <div className="font-semibold">—</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Profile Details</h3>
            <div className="text-sm text-zinc-500 flex items-center gap-2"><FaRegCalendarAlt /> Last updated: Today</div>
          </div>

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600">Full name</label>
                <input name="name" value={form.name} onChange={handleChange} disabled={!editing} className="w-full mt-1 p-3 border rounded-lg bg-transparent disabled:opacity-70" />
              </div>

              <div>
                <label className="text-sm text-zinc-600">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <FaEnvelope className="text-zinc-400" />
                  <input name="email" value={form.email} disabled className="w-full p-3 border rounded-lg bg-transparent disabled:opacity-70" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-600">Phone</label>
              <div className="mt-1 flex items-center gap-2">
                <FaPhone className="text-zinc-400" />
                <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} className="w-full p-3 border rounded-lg bg-transparent disabled:opacity-70" />
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => setEditing(false)} type="button" className="px-4 py-2 rounded-lg bg-zinc-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save Changes</button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-zinc-500">Last changed 3 months ago</div>
              </div>
              <button className="px-3 py-2 rounded-lg border border-zinc-200">Change</button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-factor Authentication</div>
                <div className="text-sm text-zinc-500">Not enabled</div>
              </div>
              <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
