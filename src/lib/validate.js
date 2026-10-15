// validateInput(input, rules) -> null when the input is fine, otherwise an Error (status 400) naming the first problem.
// Each model function passes its own rules, so "create" can require everything while "update" asks for nothing:
//   const error = validateInput(input, { name: { required: true, type: 'string', max: 120 }, phone: { type: 'string' } })
//   if (error) throw error
// Rule keys: required, nullable (null is accepted), type ('string' | 'number' | 'boolean' | 'array' | 'object'),
//            nonEmpty / max / min / enum (strings), min / max / integer (numbers).
// pattern (strings): a RegExp, e.g. pattern: PATTERN.email; an empty string skips it (use nonEmpty to refuse blanks).
// "required" means the key is present (an empty string still counts; use nonEmpty to refuse it).
// Ready-made patterns for the rules' `pattern` key.
const PATTERN = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s().-]{7,25}$/, // digits with optional + ( ) . - and spaces, e.g. (206) 555-0123 or +1 206-555-0123
};

function fail(field, message) {
  return Object.assign(new Error(`${field}: ${message}`), { status: 400, field });
}

function validateInput(input, rules) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('input', 'must be an object');
  for (const [key, rule] of Object.entries(rules)) {
    const v = input[key];
    if (v === undefined || v === null) {
      if (v === null && rule.nullable) continue;
      if (rule.required || v === null) return fail(key, v === null ? 'must not be null' : 'is required');
      continue;
    }
    switch (rule.type) {
      case 'string':
        if (typeof v !== 'string') return fail(key, 'must be a string');
        if (rule.nonEmpty && !v.trim()) return fail(key, 'must not be empty');
        if (rule.max !== undefined && v.length > rule.max) return fail(key, `must be at most ${rule.max} characters`);
        if (rule.min !== undefined && v.length < rule.min) return fail(key, `must be at least ${rule.min} characters`);
        if (rule.pattern && v !== '' && !rule.pattern.test(v)) return fail(key, 'has an invalid format');
        if (rule.enum && !rule.enum.includes(v)) return fail(key, `must be one of ${rule.enum.join(', ')}`);
        break;
      case 'number':
        if (typeof v !== 'number' || !Number.isFinite(v)) return fail(key, 'must be a number');
        if (rule.integer && !Number.isInteger(v)) return fail(key, 'must be a whole number');
        if (rule.min !== undefined && v < rule.min) return fail(key, `must be at least ${rule.min}`);
        if (rule.max !== undefined && v > rule.max) return fail(key, `must be at most ${rule.max}`);
        break;
      case 'boolean':
        if (typeof v !== 'boolean') return fail(key, 'must be true or false');
        break;
      case 'array':
        if (!Array.isArray(v)) return fail(key, 'must be an array');
        break;
      case 'object':
        if (typeof v !== 'object' || Array.isArray(v)) return fail(key, 'must be an object');
        break;
      default:
        break;
    }
  }
  return null;
}

module.exports = { validateInput, PATTERN };
