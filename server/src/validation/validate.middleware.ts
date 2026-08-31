import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendApiError } from '../utils/apiError.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware de validation universelle Zod.
 * Usage : router.post('/', validate(MySchema), handler)
 * Usage params/query : router.get('/', validate(MySchema, 'query'), handler)
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const source = req[target];
    const result = schema.safeParse(source);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      console.warn(`⚠️ [Validation] Échec sur ${target} de ${req.method} ${req.path} :`, errors);
      return sendApiError(
        res,
        400,
        'VALIDATION_ERROR',
        `Données ${target} invalides.`,
        errors
      );
    }

    // Injecter les données assainies/transformées dans la requête
    (req as any)[`_validated_${target}`] = result.data;
    // Remplacer aussi la source originale avec les données transformées par Zod
    (req as any)[target] = result.data;
    next();
  };
}

/**
 * Formate les erreurs Zod en tableau lisible pour les clients API et le débogage.
 */
function formatZodErrors(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}
