import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

const ALLOWED_DAYS = [
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
  "dom",
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

@ValidatorConstraint({ async: false })
export class BusinessHoursConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, _args: ValidationArguments): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Must have at least one day
    if (keys.length === 0) {
      return false;
    }

    for (const day of keys) {
      // Day key must be a valid Portuguese abbreviation
      if (!(ALLOWED_DAYS as readonly string[]).includes(day)) {
        return false;
      }

      const entry = obj[day];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return false;
      }

      const { open, close } = entry as Record<string, unknown>;

      if (typeof open !== "string" || typeof close !== "string") {
        return false;
      }

      // open and close must be valid HH:mm
      if (!TIME_REGEX.test(open) || !TIME_REGEX.test(close)) {
        return false;
      }

      // open must be before close (or equal for 24h)
      const [openH, openM] = open.split(":").map(Number);
      const [closeH, closeM] = close.split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      if (openMinutes > closeMinutes) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return (
      "businessHours must be an object with keys seg/ter/qua/qui/sex/sab/dom, " +
      "each containing { open: 'HH:mm', close: 'HH:mm' } where open is before close"
    );
  }
}

export function ValidateBusinessHours(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: BusinessHoursConstraint,
    });
  };
}
