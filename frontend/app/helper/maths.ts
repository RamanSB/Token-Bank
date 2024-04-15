export const divideBigInts = (a: bigint, b: bigint, precision: number)  => {
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


