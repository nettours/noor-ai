// backend/src/services/email.ts
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  // TODO: configure real SMTP
  console.log(`Welcome email → ${email} (${name})`);
}
