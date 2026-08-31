/**
 * Logger structuré DigiCouture — JSON en production, human-readable en dev.
 *
 * Utilise uniquement les modules natifs Node.js + un mini-format maison
 * pour éviter les dépendances tierces (pino / winston).
 *
 * Interface compatible avec pino : logger.info({...}, 'message')
 * Peut être remplacé par pino ou winston plus tard sans changer les call sites.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_NUM: Record<LogLevel, number> = {
  debug: 10,
  info:  20,
  warn:  30,
  error: 40,
};

const ENV_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const IS_JSON = process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production';

function write(level: LogLevel, context: Record<string, any>, message: string) {
  if (LEVEL_NUM[level] < LEVEL_NUM[ENV_LEVEL]) return;

  const ts = new Date().toISOString();

  if (IS_JSON) {
    // Format JSON structuré — ingestible par Cloud Logging / Datadog / ELK
    const entry = JSON.stringify({
      ts,
      level,
      msg: message,
      ...sanitize(context),
    });
    level === 'error' ? console.error(entry) : console.log(entry);
  } else {
    // Format lisible en développement
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'info' ? '\x1b[36m' : '\x1b[90m';
    const prefix = `${color}[${level.toUpperCase()}]\x1b[0m`;
    const ctx = Object.keys(context).length ? ' ' + JSON.stringify(sanitize(context)) : '';
    console.log(`${ts} ${prefix} ${message}${ctx}`);
  }
}

/** Supprime les champs sensibles avant logging */
function sanitize(obj: Record<string, any>): Record<string, any> {
  const REDACT = ['password', 'token', 'secret', 'jwt', 'refreshToken', 'apiKey', 'CINETPAY_SECRET'];
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACT.some(r => k.toLowerCase().includes(r.toLowerCase()))) {
      out[k] = '[REDACTED]';
    } else if (v instanceof Error) {
      out[k] = { message: v.message, name: v.name };
    } else {
      out[k] = v;
    }
  }
  return out;
}

export const logger = {
  debug: (ctx: Record<string, any>, msg: string) => write('debug', ctx, msg),
  info:  (ctx: Record<string, any>, msg: string) => write('info',  ctx, msg),
  warn:  (ctx: Record<string, any>, msg: string) => write('warn',  ctx, msg),
  error: (ctx: Record<string, any>, msg: string) => write('error', ctx, msg),
};
