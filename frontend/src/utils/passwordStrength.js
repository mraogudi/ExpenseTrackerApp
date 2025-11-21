export const getPasswordStrength = (password) => {
  let score = 0;

  if (!password) return { label: "Weak", color: "red.400", score: 0 };

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "red.400", score };
  if (score === 2) return { label: "Medium", color: "yellow.400", score };
  if (score === 3) return { label: "Good", color: "blue.400", score };
  return { label: "Strong", color: "green.400", score };
};

