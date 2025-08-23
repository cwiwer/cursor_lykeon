// Enhanced security utilities and configurations

export const SECURITY_CONSTANTS = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MINUTES: 15,
  MAX_SIGNUP_ATTEMPTS: 3,
  SIGNUP_COOLDOWN_MINUTES: 30,
  MAX_API_REQUESTS_PER_MINUTE: 60,
  MAX_FORM_SUBMISSIONS_PER_MINUTE: 10,
  
  // Session management
  SESSION_TIMEOUT_MINUTES: 60,
  
  // Password security
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://uleykptbosbenlvqeuvl.supabase.co"],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"],
  },
} as const;

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

// Password validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH) {
    score += 20;
  } else {
    feedback.push(`Password must be at least ${SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH} characters`);
  }
  
  if (password.length > SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH) {
    feedback.push(`Password must not exceed ${SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH} characters`);
    return { isValid: false, score: 0, feedback };
  }
  
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');
  
  if (/\d/.test(password)) score += 20;
  else feedback.push('Add numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
  else feedback.push('Add special characters');
  
  return {
    isValid: score >= 80,
    score,
    feedback
  };
};

// Check if string contains potential XSS patterns
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Validate UUID format
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Log security events
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // In production, this should be sent to a security monitoring service
  console.warn('[SECURITY EVENT]', securityLog);
};

// Rate limiting utility (client-side helper)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMinutes: number): boolean {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', { key, attempts: recentAttempts.length });
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();