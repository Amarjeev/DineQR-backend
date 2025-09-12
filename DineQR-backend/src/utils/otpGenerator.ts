export const generateOtp = (length: number = 4): string => {
  const digits = "0123456789";
  let Otp = "";
  for (let i = 0; i < length; i++) {
    Otp += digits[Math.floor(Math.random() * 10)];
  }
  return Otp;
};


export const generateSixDigitOtp = (): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};
