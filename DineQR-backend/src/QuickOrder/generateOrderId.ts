export const generateOrderId = () => {
  const now = new Date();

  // Format date: YYYYMMDD
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");

  // Format time: HHMMSS
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "");

  // Random 2-digit number
  const randomNumber = Math.floor(Math.random() * 90 + 10);

  // Random 3-letter English string
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");

  return `ORD-${datePart}${timePart}${randomNumber}${randomLetters}`; 
  // Example: ORD-20251006-114530-42-XYZ
};
