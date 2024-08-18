import { UserRole } from "src/dto/user.dto";

export function stringToEnum(value: UserRole): UserRole | null {
  if (Object.values(UserRole).includes(value)) {
    return value as UserRole;
  }
  return null;
}