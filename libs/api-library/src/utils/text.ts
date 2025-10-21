export const convertToPlain = (html: string) => {
  const tempDivElement = document.createElement('div');
  tempDivElement.innerHTML = html;
  return tempDivElement.textContent || tempDivElement.innerText || '';
};

export const msgBubbleTime = (date: Date | number) =>
  (typeof date === 'number' ? new Date(date) : date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });


export function getFlagUrlFromCurrency(currency: string): string {
  const currencyToCountry: Record<string, string> = {
    'USD': 'us',
    'EUR': 'eu',
    'GBP': 'gb',
    'JPY': 'jp',
    'AUD': 'au',
    'CAD': 'ca',
    'CHF': 'ch',
    'CNY': 'cn',
    // Add more currency to country mappings as needed
  }

  const countryCode = currencyToCountry[currency]?.toLowerCase() || 'us'
  return `https://flagcdn.com/48x36/${countryCode}.png`
}


