// Simple authentication utility
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isAuthenticated") === "true";
};

export const login = (): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("isAuthenticated", "true");
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("isAuthenticated");
};
