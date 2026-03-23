export type ValidationResult = {
  valid: boolean;
  safetyLevel: 'safe' | 'warning' | 'trusted';
  reason?: string;
  allowProceed?: boolean;
};

type TrustedDomain = {
  domain: string;
  name: string;
};

const TRUSTED_DOMAINS: TrustedDomain[] = [
  { domain: 'linkedin.com', name: 'LinkedIn' },
  { domain: 'www.linkedin.com', name: 'LinkedIn' },
  { domain: 'linktree.com', name: 'Linktree' },
  { domain: 'github.com', name: 'GitHub' },
  { domain: 'www.github.com', name: 'GitHub' },
];

export function validateURL(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, safetyLevel: 'warning', reason: 'Empty URL' };
  }

  const trimmed = url.trim();

  if (/^(javascript|data|file):/i.test(trimmed)) {
    return { valid: false, safetyLevel: 'warning', reason: 'Malicious code detected (Malware Risk)' };
  }

  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, safetyLevel: 'warning', reason: 'Malicious code detected (Malware Risk)' };
  }

  try {
    const urlObj = new URL(trimmed);
    if (urlObj.hostname.includes('@')) {
      return { valid: false, safetyLevel: 'warning', reason: 'Spoofed address detected (Phishing Risk)' };
    }

    if (urlObj.protocol === 'http:') {
      return {
        valid: true,
        safetyLevel: 'warning',
        reason: 'Non-secure protocol. Tap Program Tag to proceed anyway.',
        allowProceed: true,
      };
    }

    if (urlObj.protocol !== 'https:') {
      return { valid: false, safetyLevel: 'warning', reason: 'Unsupported protocol' };
    }

    const hostname = urlObj.hostname.toLowerCase();
    const isTrusted = TRUSTED_DOMAINS.some((trustedDomain) => {
      return hostname === trustedDomain.domain || hostname === trustedDomain.domain.replace('www.', '');
    });

    if (isTrusted) {
      return { valid: true, safetyLevel: 'trusted', reason: 'Safety Verified' };
    }

    return { valid: true, safetyLevel: 'safe', reason: '' };
  } catch {
    return { valid: false, safetyLevel: 'warning', reason: 'Invalid URL format' };
  }
}
