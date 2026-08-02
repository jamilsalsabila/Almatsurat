const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumber(value) {
  return String(value)
    .split("")
    .map((char) => (/\d/.test(char) ? arabicDigits[Number(char)] : char))
    .join("");
}
