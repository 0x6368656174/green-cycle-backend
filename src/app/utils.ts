/**
 * Форматирует телефон
 *
 * @param phone Телефон
 */
export function formatPhone(phone: number): string {
  const phoneString = phone.toString();

  return (
    `+${phoneString[0]} (${phoneString.substr(1, 3)}) ${phoneString.substr(4, 3)}` +
    `-${phoneString.substr(7, 2)}-${phoneString.substr(9, 2)}`
  );
}
