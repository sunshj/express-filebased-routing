export function isCjs() {
  return typeof module !== 'undefined' && typeof module.exports !== 'undefined';
}
