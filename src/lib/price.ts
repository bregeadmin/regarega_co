// Форматирование цены «от» для карты/карточек.
// price_from в apartments_public УЖЕ = base_rate × 1.1 (наценка запечена во вью 064) —
// здесь только формат + символ валюты оператора. Конвертацию валют не делаем.
type PricedApt = { price_from?: number | null; price_currency?: string | null };

export function priceSym(cur?: string | null): string {
  return cur === 'gel' ? '₾' : '$';
}

// короткая форма для плашки на карте: "$165" | null (если цены нет)
export function priceShort(a: PricedApt): string | null {
  return a.price_from ? priceSym(a.price_currency) + a.price_from : null;
}

// полная форма: EN "from $165 / night" | "on request"; RU "от $165 / ночь" | "по запросу"
export function priceFrom(a: PricedApt, lang: 'en' | 'ru' = 'en'): string {
  if (!a.price_from) return lang === 'ru' ? 'по запросу' : 'on request';
  const s = priceSym(a.price_currency) + a.price_from;
  return lang === 'ru' ? `от ${s} / ночь` : `from ${s} / night`;
}
