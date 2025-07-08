export type Token = {
  access_token: string;
  token_type: string;
};

export type TokenPayload = {
  sub?: string;
  exp?: number;
};
