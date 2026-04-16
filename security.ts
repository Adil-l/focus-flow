export const sanitize = (str: string) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
