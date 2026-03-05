import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'sociallens_profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage(STORAGE_KEY, []);

  const saveProfile = (profileData) => {
    setProfiles((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.profileUrl === profileData.profileUrl
      );

      const updatedProfile = {
        ...profileData,
        lastAnalyzed: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = updatedProfile;
        return updated;
      }

      return [updatedProfile, ...prev];
    });
  };

  const removeProfile = (profileUrl) => {
    setProfiles((prev) => prev.filter((p) => p.profileUrl !== profileUrl));
  };

  const getProfile = (profileUrl) => {
    return profiles.find((p) => p.profileUrl === profileUrl);
  };

  return {
    profiles,
    saveProfile,
    removeProfile,
    getProfile
  };
}
