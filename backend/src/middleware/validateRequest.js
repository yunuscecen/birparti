const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Gönderilen bilgiler geçersiz.",
        details,
      });
    }

    req.validatedBody = result.data;

    next();
  };
};

export default validateRequest;