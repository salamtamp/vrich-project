import { useCallback, useEffect, useRef, useState } from 'react';

export type ProfileLike = { id: string; name: string; profile_picture_url?: string };

export function useLocalDocsWithProfileUpdate<T>(
  remoteDocs: T[] | undefined,
  getProfileId: (item: T) => string | undefined,
  updateProfile: (item: T, profile: ProfileLike) => T
) {
  const [localDocs, setLocalDocs] = useState<T[]>(remoteDocs ?? []);
  const didUpdateRef = useRef(false);
  const updatedProfileRef = useRef<ProfileLike | null>(null);

  useEffect(() => {
    setLocalDocs(remoteDocs ?? []);
  }, [remoteDocs]);

  const markProfileUpdated = useCallback((profile: ProfileLike) => {
    didUpdateRef.current = true;
    updatedProfileRef.current = profile;
  }, []);

  const handleProfileUpdateIfNeeded = useCallback(() => {
    if (didUpdateRef.current && updatedProfileRef.current) {
      const { id } = updatedProfileRef.current;
      const profile = updatedProfileRef.current;
      setLocalDocs((prev) =>
        prev.map((item) => (getProfileId(item) === id ? updateProfile(item, profile) : item))
      );
      didUpdateRef.current = false;
      updatedProfileRef.current = null;
    }
  }, [getProfileId, updateProfile]);

  return {
    updated: localDocs,
    setLocalDocs,
    markProfileUpdated,
    handleProfileUpdateIfNeeded,
  };
}
