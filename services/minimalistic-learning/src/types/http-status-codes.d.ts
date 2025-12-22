declare module 'http-status-codes' {
  export const StatusCodes: Record<string, number>;
  export function getReasonPhrase(statusCode: number): string;
}


