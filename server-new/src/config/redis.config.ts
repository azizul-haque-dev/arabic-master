// Never hardcode server addresses or passwords in code — that's how
// secrets end up leaked on GitHub. Always pull them from environment
// variables instead.
export default function redisConfig() {
  return {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  };
}
