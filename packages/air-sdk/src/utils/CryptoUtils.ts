import SHA256 from 'crypto-js/sha256';

export function SHA(input: string): string {
  return SHA256(input).toString();
}
