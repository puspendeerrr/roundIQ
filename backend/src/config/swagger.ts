export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RoundIQ API',
    version: 'v1',
    description: 'RoundIQ Marketplace Backend API — Comprehensive OpenAPI 3.0 Documentation',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base Endpoint',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT Access Token obtained from /auth/login or /auth/register',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Invalid request payload' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['STUDENT', 'INTERVIEWER', 'RECRUITER', 'ADMIN'] },
          status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'] },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'System health & probe monitoring' },
    { name: 'Auth', description: 'User authentication & session management' },
    { name: 'Students', description: 'Student dashboard, profiles & learning stats' },
    { name: 'Interviewers', description: 'Interviewer directory & profile management' },
    { name: 'Categories', description: 'Domain & interview category taxonomy' },
    { name: 'Skills', description: 'Technical skills & expertise tags' },
    { name: 'Bookings', description: 'Mock interview session scheduling' },
    { name: 'Availability', description: 'Interviewer calendar availability management' },
    { name: 'Wallet', description: 'User digital wallet & transaction ledger' },
    { name: 'Payments', description: 'Razorpay payment processing & webhooks' },
    { name: 'Withdrawals', description: 'Interviewer payout requests & processing' },
    { name: 'Refunds', description: 'Session cancellation refunds' },
    { name: 'Meetings', description: 'Video session room access & details' },
    { name: 'Notifications', description: 'In-app user notifications' },
    { name: 'Attendance', description: 'Interview attendance logging' },
    { name: 'Reviews', description: 'Interviewer ratings & student feedback' },
    { name: 'Reports', description: 'Technical assessment feedback reports' },
    { name: 'Reputation', description: 'Interviewer trust score & badge calculations' },
    { name: 'Recruiter', description: 'Company management & candidate discovery' },
    { name: 'Jobs', description: 'Job postings & hiring pipeline' },
    { name: 'Support', description: 'Customer support tickets & agent SLA' },
    { name: 'CMS', description: 'Legal pages & dynamic Help Center content' },
    { name: 'Files', description: 'Centralized file storage uploads' },
    { name: 'Admin', description: 'Platform administration & verification queue' },
    { name: 'Platform Settings', description: 'Global packages, coupons & announcement banner' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'API Health Status',
        description: 'Returns operational status of the API engine',
        responses: {
          200: { description: 'API operational' },
        },
      },
    },
    '/health/liveness': {
      get: {
        tags: ['Health'],
        summary: 'Liveness Probe',
        description: 'Used by Kubernetes/Render to check process health',
        responses: {
          200: { description: 'Process alive' },
        },
      },
    },
    '/health/readiness': {
      get: {
        tags: ['Health'],
        summary: 'Readiness Probe',
        description: 'Checks live database connection state',
        responses: {
          200: { description: 'Database connected and ready' },
          503: { description: 'Database unavailable' },
        },
      },
    },

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register New User',
        description: 'Register as Student, Interviewer, or Recruiter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                  email: { type: 'string', example: 'candidate@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  role: { type: 'string', enum: ['STUDENT', 'INTERVIEWER', 'RECRUITER'] },
                  name: { type: 'string', example: 'Jane Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User Login',
        description: 'Authenticate with email & password to obtain JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@roundiq.com' },
                  password: { type: 'string', example: 'AdminPass123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current User Profile',
        description: 'Get authenticated user details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Unauthenticated' },
        },
      },
    },

    '/students/profile': {
      get: {
        tags: ['Students'],
        summary: 'Get Student Profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile details' } },
      },
    },
    '/students/dashboard': {
      get: {
        tags: ['Students'],
        summary: 'Get Student Dashboard Stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard stats' } },
      },
    },

    '/interviewers': {
      get: {
        tags: ['Interviewers'],
        summary: 'List Public Interviewers Directory',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'skill', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'List of interviewers' } },
      },
    },
    '/interviewers/{id}': {
      get: {
        tags: ['Interviewers'],
        summary: 'Get Interviewer Profile Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Interviewer profile' }, 404: { description: 'Not found' } },
      },
    },

    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get Active Categories',
        responses: { 200: { description: 'Category taxonomy list' } },
      },
    },
    '/skills': {
      get: {
        tags: ['Skills'],
        summary: 'Get Technical Skills',
        responses: { 200: { description: 'Technical skills list' } },
      },
    },

    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List User Bookings',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User booking history' } },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create New Session Booking',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['interviewerId', 'startTime', 'durationMinutes'],
                properties: {
                  interviewerId: { type: 'string' },
                  startTime: { type: 'string', format: 'date-time' },
                  durationMinutes: { type: 'integer', example: 60 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Booking created' } },
      },
    },

    '/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Get Interviewer Availability Slots',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Availability slots' } },
      },
    },
    '/wallet': {
      get: {
        tags: ['Wallet'],
        summary: 'Get User Wallet Balance & Ledger',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Wallet balance details' } },
      },
    },
    '/payments/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create Razorpay Order',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Razorpay order details' } },
      },
    },
    '/withdrawals': {
      get: {
        tags: ['Withdrawals'],
        summary: 'Get Interviewer Withdrawal Requests',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Withdrawals list' } },
      },
    },
    '/refunds': {
      get: {
        tags: ['Refunds'],
        summary: 'List User Refund Claims',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Refunds list' } },
      },
    },
    '/meetings/{bookingId}': {
      get: {
        tags: ['Meetings'],
        summary: 'Get Video Meeting Room Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Meeting room link & tokens' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get User Notifications',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Notifications list' } },
      },
    },
    '/attendance/mark': {
      post: {
        tags: ['Attendance'],
        summary: 'Mark Session Attendance',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Attendance logged' } },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit Interviewer Review',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Review posted' } },
      },
    },
    '/reports/{bookingId}': {
      get: {
        tags: ['Reports'],
        summary: 'Get Interview Assessment Report',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Interview scorecard and feedback' } },
      },
    },
    '/reputation/{interviewerId}': {
      get: {
        tags: ['Reputation'],
        summary: 'Get Interviewer Reputation & Badges',
        parameters: [{ name: 'interviewerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Reputation details' } },
      },
    },
    '/companies': {
      get: {
        tags: ['Recruiter'],
        summary: 'Get Recruiter Companies',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Companies list' } },
      },
    },
    '/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'Get Job Postings',
        responses: { 200: { description: 'Job list' } },
      },
    },
    '/support/tickets': {
      get: {
        tags: ['Support'],
        summary: 'Get Support Tickets',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Tickets list' } },
      },
    },
    '/cms/pages': {
      get: {
        tags: ['CMS'],
        summary: 'Get Published CMS Legal & Help Pages',
        responses: { 200: { description: 'CMS pages list' } },
      },
    },
    '/files/upload': {
      post: {
        tags: ['Files'],
        summary: 'Upload Attachment File',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Uploaded file metadata' } },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get Platform KPI Overview',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Admin KPIs' } },
      },
    },
    '/packages': {
      get: {
        tags: ['Platform Settings'],
        summary: 'Get Session Duration Packages',
        responses: { 200: { description: 'Packages list' } },
      },
    },
  },
};
