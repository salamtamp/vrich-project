import { ProfileSection } from '@/components/profile-box';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

type ChatProfileProps = {
  profile: FacebookInboxResponse['profile'] | undefined;
  onOpen?: () => void;
};

const ChatProfile = ({ profile, onOpen }: ChatProfileProps) => {
  if (!profile) {
    return null;
  }
  return (
    <ProfileSection
      profile={profile}
      onOpenProfile={onOpen}
    />
  );
};

export default ChatProfile;
