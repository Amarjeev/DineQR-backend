// ================================
// ✅ Function: generateOrderId
// Generates a unique order ID with date, time, random number, and letters
// Example output: ORD-20251006-114530-42-XYZ
// ================================
export const generateOrderId = () => {
  const now = new Date(); // 🔹 Get current date and time

  // 🔹 Format date as YYYYMMDD
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");

  // 🔹 Format time as HHMMSS
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "");

  // 🔹 Generate a random 2-digit number (10–99)
  const randomNumber = Math.floor(Math.random() * 90 + 10);

  // 🔹 Generate a random 3-letter uppercase string
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = Array.from({ length: 3 }, () => 
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");

  // 🔹 Combine all parts into the final order ID
  return `ORD-${datePart}${timePart}${randomNumber}${randomLetters}`;
};
