export const parseError = (error: Error): Error & { status: number } => {
  if (error.name === "PrismaClientValidationError") {
    return { ...error, message: "error database!", status: 500 };
  } else if (error.name === "ZodError") {
    return { ...error, message: JSON.parse(error.message), status: 400 };
  } else {
    return { ...error, message: error.message, status: 404 };
  }
};
