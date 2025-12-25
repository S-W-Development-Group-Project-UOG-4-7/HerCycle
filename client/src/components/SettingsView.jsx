import { useState } from 'react';
import { User, Camera, Loader2, Save, Mail, Edit3 } from 'lucide-react';

export default function SettingsView({ user, onUpdateUser, showToast }) {
  // State for Name Editing
  const [name, setName] = useState(user.name);
  
  // State for Image Uploading
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePic || "");
  const [isSaving, setIsSaving] = useState(false);

  // Check if anything has changed to show the Save button
  const hasChanges = imageFile !== null || name !== user.name;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let finalProfilePic = user.profilePic;

      // 1. Upload Image to Cloudinary (ONLY if a new file exists)
      if (imageFile) {
        const data = new FormData();
        data.append("file", imageFile);
        data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: data
        });
        
        const cloudData = await res.json();
        finalProfilePic = cloudData.url;
      }

      // 2. Update Backend (Send Name AND ProfilePic)
      const updatePayload = {
        name: name,
        profilePic: finalProfilePic
      };

      const updateRes = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (updateRes.ok) {
        onUpdateUser(updatePayload); // Update parent state instantly
        showToast("Profile updated successfully!");
        setImageFile(null); // Reset file input
      } else {
        throw new Error("Backend update failed");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display text-white mb-2">Account Settings</h2>
        <p className="text-slate-400">Manage your personal information.</p>
      </div>

      <div className="bg-bg-card border border-slate-700 rounded-3xl p-8 shadow-xl">
        
        {/* --- PROFILE PICTURE --- */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-2xl bg-slate-800">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={64} className="text-slate-500" />
                </div>
              )}
            </div>
            
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full cursor-pointer hover:bg-secondary-dark transition-colors shadow-lg">
              <Camera size={20} />
            </label>
            <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          <p className="text-xs text-slate-500 mt-4">Click camera icon to change</p>
        </div>

        {/* --- FORM FIELDS --- */}
        <div className="space-y-6">
          
          {/* NAME FIELD */}
          <div>
            <label className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 block">Display Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                // LOGIC: Disabled if user is a student
                disabled={user.role === 'student'}
                className={`w-full p-4 bg-bg-input border rounded-xl text-white font-medium focus:outline-none transition-all ${
                  user.role === 'student' 
                    ? 'border-slate-800 text-slate-500 cursor-not-allowed opacity-70' 
                    : 'border-slate-700 focus:border-secondary'
                }`}
              />
              {/* Show Edit Icon only if Lecturer */}
              {user.role === 'lecturer' && (
                <Edit3 className="absolute right-4 top-4 text-slate-500 pointer-events-none" size={20} />
              )}
            </div>
            {user.role === 'student' && (
              <p className="text-xs text-slate-600 mt-2 italic">Only instructors can modify their display name.</p>
            )}
          </div>

          {/* EMAIL FIELD (Read Only for everyone) */}
          <div>
            <label className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <div className="w-full p-4 bg-bg-input border border-slate-800 rounded-xl text-slate-500 font-medium cursor-not-allowed opacity-70 flex items-center gap-3">
                <Mail size={18} />
                {user.email}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 italic">Email address cannot be changed.</p>
          </div>

        </div>

        {/* --- SAVE BUTTON (Only shows if changes detected) --- */}
        {hasChanges && (
          <div className="flex justify-center border-t border-slate-700 pt-8 mt-8 animate-fade-up">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}