export type Gender = "female" | "male" | "other";

export const availableGenders: Gender[] = ["female", "male", "other"];

export const validateGender = (value: any): boolean =>
  availableGenders.includes(value as Gender);
