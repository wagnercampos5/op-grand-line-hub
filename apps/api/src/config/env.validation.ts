export interface EnvConfig {
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: number;
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const portRaw = config.PORT ?? 3000;
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('Invalid PORT environment variable');
  }

  const corsOrigin =
    typeof config.CORS_ORIGIN === 'string' && config.CORS_ORIGIN.trim().length > 0
      ? config.CORS_ORIGIN.trim()
      : 'http://localhost:5173';

  const databaseUrl = config.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const jwtSecret = config.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length < 32) {
    throw new Error(
      'JWT_SECRET environment variable must be at least 32 characters long',
    );
  }

  const jwtExpiresIn =
    typeof config.JWT_EXPIRES_IN === 'string' &&
    config.JWT_EXPIRES_IN.trim().length > 0
      ? config.JWT_EXPIRES_IN.trim()
      : '1d';

  const saltRoundsRaw = config.BCRYPT_SALT_ROUNDS ?? 10;
  const bcryptSaltRounds = Number(saltRoundsRaw);
  if (
    !Number.isInteger(bcryptSaltRounds) ||
    bcryptSaltRounds < 4 ||
    bcryptSaltRounds > 15
  ) {
    throw new Error(
      'BCRYPT_SALT_ROUNDS must be an integer between 4 and 15',
    );
  }

  return {
    PORT: port,
    CORS_ORIGIN: corsOrigin,
    DATABASE_URL: databaseUrl.trim(),
    JWT_SECRET: jwtSecret.trim(),
    JWT_EXPIRES_IN: jwtExpiresIn,
    BCRYPT_SALT_ROUNDS: bcryptSaltRounds,
  };
}
