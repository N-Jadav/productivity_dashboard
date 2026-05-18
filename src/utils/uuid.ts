let counter = 0;
export const v4 = (): string => {
  counter++;
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}-${counter}`;
};
