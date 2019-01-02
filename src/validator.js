// @flow

// This is a little functional validator library Hao wrote for a
// different project, originally designed to validate untrusted
// objects parsed from JSON. We've repurposed it here to validate
// process.env before the server starts. In Haskell we would say
// that `Valdiator<T>` is an applicative type that accumulates
// errors in a Writer-like way; the library is then a set of
// combinators that construct and operate on that type. I've never
// seen a JS library implement validation this way, but in my
// opinion it's cheap and a small, useful set of primitive
// combinators can be written in fewer than 150 lines of code.

export type ValidatorErrorID =
  | 'oneOf.missing'
  | 'oneOf.invalid'
  | 'regex.missing'
  | 'regex.invalid'
  | 'object.invalid'
  | 'object.missing'
  | 'array.invalid'
  | 'string.invalid'
  | 'number.invalid';

type ValidatorError = {
  id: ValidatorErrorID,
  path: string,
  value: any,
  msg: string,
};

type ValidatorBadResult = {|
  errors: ValidatorError[],
|};

// A validator takes a random object "untrusted" along with its current
// "path" and spits out a thumbs up or a thumbs down. If it's a
// thumbs down, it also spits out an array of human-readable messages.
// This module allows you to build up validators using a small set
// of combinators.
export type Validator<T> = (untrusted: any, path: string) => T | ValidatorBadResult;

const bad = (...errors: ValidatorError[]): ValidatorBadResult => ({
  errors,
});

const error = (id: ValidatorErrorID, path: string, value: any, msg: string): ValidatorError => ({
  id,
  path,
  value,
  msg,
});

// Given a whitelist of strings (typically valid enum values), oneOf
// returns a validator that checks against inclusion in the whitelist.
export const oneOf = (whitelist: string[]): Validator<string> => {
  return (untrusted: any, path: string) => {
    if (untrusted === undefined || typeof untrusted !== 'string') {
      return bad(error('oneOf.missing', path, untrusted, 'missing or not a string'));
    }
    if (!whitelist.includes(untrusted)) {
      return bad(error('oneOf.invalid', path, untrusted, `must be one of: ${whitelist.join(' ')}`));
    }
    return untrusted;
  };
};

// Given a regex, regex returns a Validator that checks a string
// against the regex.
export const regex = (regex: RegExp, msg: string): Validator<string> => {
  return (untrusted: any, path: string) => {
    if (untrusted === undefined || typeof untrusted !== 'string') {
      return bad(error('regex.missing', path, untrusted, 'missing or not a string'));
    }
    if (!regex.test(untrusted)) {
      return bad(error('regex.invalid', path, untrusted, msg));
    }
    return untrusted;
  };
};

// optional stops a Validator from running if the untrusted is null or
// undefined. Use it when certain keys can be assumed from the HTTP
// request.
export const optional = <T>(validator: Validator<T>): Validator<T | null> => {
  return (untrusted: any, path: any) => {
    if (untrusted === undefined || untrusted === null) {
      return null;
    } else {
      return validator(untrusted, path);
    }
  };
};

type Schema = { [string]: Validator<any> };

// Given an object schema of validators, the object combinator matches
// the key k in the untrusted against the validator schema[k] in the schema.
export const object = <T>(schema: Schema): Validator<T> => {
  return (untrusted: any, path: string) => {
    if (untrusted === undefined || typeof untrusted !== 'object') {
      return bad(error('object.invalid', path, '--', 'missing or not an object'));
    }
    let errors: ValidatorError[] = [];
    let acc: any = {};
    // 1. For each key, run schema[key] on untrusted[key]
    // 2. Collect errors, if any
    // 3. If no errors occurred, return thumbs up
    // 4. Else return thumbs down
    for (const key of Object.keys(schema)) {
      const result = schema[key](untrusted[key], `${path}.${key}`);
      if (typeof result === 'object' && result && 'errors' in result) {
        errors = errors.concat(result.errors);
      } else {
        acc[key] = result;
      }
    }
    return errors.length ? bad(...errors) : acc;
  };
};

export const array = <T>(inner: Validator<T>): Validator<T[]> => {
  return (untrusted: any, path: string) => {
    if (untrusted === undefined || typeof untrusted !== 'object') {
      return bad(error('array.invalid', path, '--', 'missing or not an array'));
    }

    let errors: ValidatorError[] = [];
    let acc: T[] = [];
    for (const [index, item] of untrusted.entries()) {
      const result: any = inner(item, `${path}.${index}`);
      if (result && 'errors' in result) {
        errors = errors.concat(result.errors);
      } else {
        acc.push(result);
      }
    }
    return errors.length ? bad(...errors) : acc;
  };
};

// Validates as long as the key exists and is a nonempty string
export const string = (): Validator<string> => {
  return (untrusted: any, path: string) => {
    if (typeof untrusted === 'string' && untrusted.length > 0) {
      return untrusted;
    } else {
      return bad(error('string.invalid', path, untrusted, 'needed to be a nonempty string'));
    }
  };
};

// Validates as long as the key exists and is a nonempty string that
// can be parsed to a number
export const numeric = (): Validator<number> => {
  return (untrusted: any, path: string) => {
    const result = string()(untrusted, path);
    if (typeof result === 'string') {
      if (Number.isNaN(result)) {
        return bad(error('number.invalid', path, untrusted, 'needed to be a number'));
      }
      return +result;
    } else {
      return result;
    }
  };
};

// Validates as long as the key exists and is a valid number
export const number = (): Validator<number> => {
  return (untrusted: any, path: string) => {
    if (typeof untrusted === 'number' && !Number.isNaN(untrusted)) {
      return untrusted;
    } else {
      return bad(error('number.invalid', path, untrusted, 'needed to be a number'));
    }
  };
};

export const runValidator = <T>(validator: Validator<T>, untrusted: any): T | ValidatorBadResult => {
  return validator(untrusted, '<root>');
};
