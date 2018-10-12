/**
 * Возвращает множественное число
 *
 * @param count Число
 * @param one Один
 * @param several Несколько
 * @param many Много
 */
export function pluralize(count: number, one: string, several: string, many: string): string {
  let baseCount = count;

  if (baseCount > 19) {
    baseCount = baseCount % 10;
  }

  let string = '';
  switch (baseCount) {
    case 0:
      string = many;
      break;
    case 1:
      string = one;
      break;
    case 2:
    case 3:
    case 4:
      string = several;
      break;
    default:
      string = many;
      break;
  }

  return `${count} ${string}`;
}
