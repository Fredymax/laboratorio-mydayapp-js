export const KEYWORDS = {
  ESCAPE: "Escape",
  ENTER: "Enter",
};

export function useLocalStorage(codeName, initialValue) {
  let value = getItem();

  if (!value)
    window.localStorage.setItem(codeName, JSON.stringify(initialValue));

  function setItem(newValue) {
    window.localStorage.setItem(codeName, JSON.stringify(newValue));
  }

  function getItem() {
    return JSON.parse(window.localStorage.getItem(codeName));
  }

  return { value, setItem, getItem };
}
