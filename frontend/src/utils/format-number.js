// ----------------------------------------------------------------------

const DEFAULT_LOCALE = { code: 'en-PH', currency: 'PHP' };

function processInput(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fNumber(inputValue, options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue, options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

// PHP-style currency formatting (similar to number_format function)
export function fCurrencyPHP(inputValue, decimals = 2, decimalSeparator = '.', thousandsSeparator = ',') {
  const number = processInput(inputValue);
  if (number === null) return '';

  // Convert to string with fixed decimal places
  const numStr = number.toFixed(decimals);
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = numStr.split('.');
  
  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Combine parts
  if (decimals > 0) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }
  
  return formattedInteger;
}

// PHP-style currency with currency symbol
export function fCurrencyPHPSymbol(inputValue, currencySymbol = '$', decimals = 2, decimalSeparator = '.', thousandsSeparator = ',') {
  const formattedNumber = fCurrencyPHP(inputValue, decimals, decimalSeparator, thousandsSeparator);
  return `${currencySymbol}${formattedNumber}`;
}

// PHP-style currency with custom formatting options
export function fCurrencyPHPCustom(inputValue, options = {}) {
  const {
    symbol = '$',
    decimals = 2,
    decimalSeparator = '.',
    thousandsSeparator = ',',
    symbolPosition = 'before', // 'before' or 'after'
    spaceBetween = false
  } = options;

  const formattedNumber = fCurrencyPHP(inputValue, decimals, decimalSeparator, thousandsSeparator);
  const space = spaceBetween ? ' ' : '';
  
  if (symbolPosition === 'after') {
    return `${formattedNumber}${space}${symbol}`;
  }
  
  return `${symbol}${space}${formattedNumber}`;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue, options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue, options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
} 