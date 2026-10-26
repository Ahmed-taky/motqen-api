import { asyncHandler } from 'src/types/asyncHandler.js';
import { z } from 'src/libs/zod.js';
import ValidationError from 'src/errors/ValidationError.js';

export const parseFormDataJson = (fieldName: string = 'data') => asyncHandler(async (req, _, next) => {
    try {
      const formData = req.body;
      const parsedBody: any = {};

      for (const [key, value] of Object.entries(formData)) {
        if (key === fieldName && typeof value === 'string') {
          try {
            parsedBody[key] = JSON.parse(value);
          } catch (e) {
            next(
              new ValidationError(
                `Invalid JSON in "${key}" field: ${(e as SyntaxError).message}`,
                new z.ZodError([
                  { code: 'custom', input: value, path: [key], message: 'must be valid JSON' },
                ] as never)
              )
            );
            return;
          }
        } else if (value instanceof File) {
          parsedBody[key] = value;
        } else {
          parsedBody[key] = value;
        }
      }

      req.body = parsedBody;
      next();
    } catch (error) {
      next(error);
    }
  });
