class CustomNotFoundError extends Error {
  constructor(message, status) {
    super(message);
    this.statusCode = status;
    this.name = "NotFoundError";
  }
}

export { CustomNotFoundError };
