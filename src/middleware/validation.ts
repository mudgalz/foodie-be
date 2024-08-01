import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string."),
  body("address")
    .isString()
    .notEmpty()
    .withMessage("Address must be a string."),
  body("zipcode")
    .isString()
    .notEmpty()
    .withMessage("Zipcode must be a string."),
  body("city").isString().notEmpty().withMessage("City must be a string."),
  handleValidationErrors,
];
