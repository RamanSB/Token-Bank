export const divideBigInts = (a: bigint, b: bigint, precision: number): string => {
  const balanceWithPrecision = (a * BigInt(10 ** precision)) / b;
  // Convert to string
  const balanceString = balanceWithPrecision.toString();
  // Move decimal place.
  const formattedBalance =
    balanceString.length > precision
      ? balanceString.slice(0, -precision) + '.' + balanceString.slice(-precision)
      : '0.' + balanceString.padStart(precision, '0');
  console.log(`formattedBalance components: ${formattedBalance}`);
  return formattedBalance;
}


export const multiplyBigInts = (val: string | number, decimals: number): bigint | undefined => {
  try {
    console.log(`multiplyBigInts(${val}, ${decimals})`);

    if (Number.isNaN(Number(val))) {
      console.log(`${val} is NaN`);
      return undefined;
    }

    // Convert the value to a number to handle both string and number inputs
    const num = Number(val);
    if (!Number.isFinite(num)) {
      console.log(`${val} is not a finite number`);
      return undefined;
    }

    if (num % 1 === 0) {
      // If the number is already an integer
      return BigInt(num) * BigInt(10 ** decimals);
    } else {
      // If the number has a decimal part
      const numStr = num.toString();
      const decimalPlaces = numStr.includes('.') ? numStr.length - numStr.indexOf('.') - 1 : 0;
      const scaleFactor = 10 ** decimalPlaces;
      const numAsBigInt = BigInt(Math.round(num * scaleFactor));  // Convert to integer BigInt after appropriate scaling
      return numAsBigInt * BigInt(10 ** (decimals - decimalPlaces));
    }
  } catch (error) {
    console.log(`Error when attempting to multiplyBigInts(${val}, ${decimals}): ${error}`);
    return undefined;
  }
}