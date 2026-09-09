export const mockVerify = () => new Promise<{ verified: true }>((resolve) => {
  window.setTimeout(() => resolve({ verified: true }), 600 + Math.floor(Math.random() * 301));
});
