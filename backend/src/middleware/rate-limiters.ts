import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
    },
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_PAYMENT_REQUESTS',
      message: 'Payment request limit exceeded. Please wait before retrying.',
    },
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_BOOKING_REQUESTS',
      message: 'Booking request rate limit exceeded.',
    },
  },
});

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_SEARCHES',
      message: 'Search query rate limit exceeded.',
    },
  },
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ADMIN_REQUESTS',
      message: 'Admin API rate limit exceeded.',
    },
  },
});
