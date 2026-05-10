export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fitch");
  }

  return res.json();
};
