export type User = {
  email: string;
  name?: string;
};
export type UserCreate = User & {
  password: string;
};
export type UserUpdate = Partial<User> & {
  password?: string;
};
export type UserResponse = User & {
  id: string;
  created_at: string;
  updated_at?: string;
};
