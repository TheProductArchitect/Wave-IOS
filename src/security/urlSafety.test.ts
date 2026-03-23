import { validateURL } from './urlSafety';

describe('validateURL', () => {
  it('blocks javascript protocol payloads', () => {
    const result = validateURL('javascript:alert(1)');

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Malicious code detected');
  });

  it('blocks script-injection patterns', () => {
    const result = validateURL('https://example.com/<script>alert(1)</script>');

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Malicious code detected');
  });

  it('allows http with warning for explicit proceed', () => {
    const result = validateURL('http://example.com');

    expect(result.valid).toBe(true);
    expect(result.safetyLevel).toBe('warning');
    expect(result.allowProceed).toBe(true);
  });

  it('marks trusted domains as trusted', () => {
    const result = validateURL('https://github.com/venu');

    expect(result.valid).toBe(true);
    expect(result.safetyLevel).toBe('trusted');
  });

  it('accepts generic https links as safe', () => {
    const result = validateURL('https://example.org/profile');

    expect(result.valid).toBe(true);
    expect(result.safetyLevel).toBe('safe');
  });
});
