export function numberToIndianWords(num) {
  if (isNaN(num) || num <= 0) return "Zero Rupees Only";

  const singleDigits = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertTwoDigits(n) {
    if (n < 20) return singleDigits[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit ? " " + singleDigits[unit] : "");
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred) str += singleDigits[hundred] + " Hundred";
    if (rest) {
      if (str) str += " And ";
      str += convertTwoDigits(rest);
    }
    return str;
  }

  const rounded = Math.round(num);
  let remaining = rounded;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundredPart = remaining;

  const parts = [];
  if (crore) parts.push(convertTwoDigits(crore) + " Crore");
  if (lakh) parts.push(convertTwoDigits(lakh) + " Lakh");
  if (thousand) parts.push(convertTwoDigits(thousand) + " Thousand");
  if (hundredPart) parts.push(convertThreeDigits(hundredPart));

  return "INR " + parts.join(" ") + " Only.";
}
