export const getFilterFromHash = (hash) => {
  const filter = hash.split("/").at(-1);
  return filter;
};
