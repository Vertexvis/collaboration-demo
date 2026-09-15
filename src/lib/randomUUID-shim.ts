function fallbackUUID(): string {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const n = Number(c);
    return (
      n ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))
    ).toString(16);
  });
}

if (typeof crypto !== "undefined" && crypto.randomUUID == null) {
  Object.defineProperty(crypto, "randomUUID", {
    configurable: true,
    value: fallbackUUID,
  });
}
