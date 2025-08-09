import { ProfileSection } from '@/components/profile-box';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

type ChatProfileProps = {
  profile: FacebookInboxResponse['profile'] | undefined;
};

const ChatProfile = ({ profile }: ChatProfileProps) => {
  if (!profile) {
    return null;
  }
  return <ProfileSection profile={profile} />;
};

export default ChatProfile;
