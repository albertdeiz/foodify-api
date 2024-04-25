export const parseError = (error: Error): Error => {
  if (error.name === "PrismaClientValidationError") {
    return { ...error, message: "error database!" };
  } else if (error.name === "ZodError") {
    return { ...error, message: JSON.parse(error.message) };
  } else {
    return { ...error, message: error.message };
  }
};
