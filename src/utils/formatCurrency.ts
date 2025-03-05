
/**
 * Formats a number as a currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Formats a crypto amount with appropriate decimals
 */
export function formatCrypto(
  amount: number,
  symbol: string = 'BTC',
  maxDecimals: number = 8
): string {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
  
  return `${formattedAmount} ${symbol}`;
}

/**
 * Formats a percentage value
 */
export function formatPercentage(
  value: number,
  includeSign: boolean = true
): string {
  const absValue = Math.abs(value);
  const formattedValue = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const sign = includeSign ? (value >= 0 ? '+' : '-') : '';
  return `${sign}${formattedValue}%`;
}

/**
 * Abbreviates large numbers (like 1.2k, 1.2M, etc.)
 */
export function abbreviateNumber(value: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(Math.abs(value)) / 3);
  
  if (suffixNum === 0) return value.toString();
  
  const shortValue = value / Math.pow(10, suffixNum * 3);
  const formatted = shortValue.toFixed(1).replace(/\.0$/, '');
  
  return formatted + suffixes[suffixNum];
}
