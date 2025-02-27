export type User = {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  souce?: string;
  country?: string;
}

export function validateContactForm(data: unknown): { valid: boolean; errors?: string[] } {
  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Invalid data format"] };
  }

  const { firstName, lastName, email, phone } = data as User;
  const errors: string[] = [];

  // Validate Name
  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  // Validate Email (Simple Regex)
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format.");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}