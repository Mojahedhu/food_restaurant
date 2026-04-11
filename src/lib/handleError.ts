export const handleError = (
  error: unknown,
  msg: string = "An error occurred. Please try again.",
) => {
  if (error instanceof Error) {
    return error.message;
  }
  return msg;
};
