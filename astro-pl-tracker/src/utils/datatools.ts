export const get = (obj: Object, path: string, defaultValue = undefined): unknown => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key: string) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const formatDate = ((d: Date) => {
  const cy = Date.prototype.getUTCFullYear.call(d);
  const cm = (Date.prototype.getUTCMonth.call(d) + 1).toString().padStart(2, "0");
  const cd = Date.prototype.getUTCDate.call(d).toString().padStart(2, "0");
  return `${cy}-${cm}-${cd}`;
})
