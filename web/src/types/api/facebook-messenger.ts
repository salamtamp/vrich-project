export type FacebookMessenger = {
  profile_id: string;
  messenger_id: string;
  message: string;
  sent_at: string;
};

export type FacebookMessengerUpdate = Partial<Pick<FacebookMessenger, 'message' | 'sent_at'>> & {
  deleted_at?: string;
};

export type FacebookMessengerResponse = FacebookMessenger & {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
};
