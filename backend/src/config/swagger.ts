export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RoundIQ API Documentation',
    version: '1.0.0',
    description: 'Production OpenAPI / Swagger Specification for RoundIQ — Technical Interview Marketplace & Hiring Platform',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'http://localhost/api/v1',
      description: 'Production Nginx Proxy',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        responses: {
          200: { description: 'API Operational' },
        },
      },
    },
    '/health/liveness': {
      get: {
        summary: 'Liveness Probe',
        responses: {
          200: { description: 'Node server process active' },
        },
      },
    },
    '/health/readiness': {
      get: {
        summary: 'Readiness Probe',
        responses: {
          200: { description: 'Database and Redis connections ready' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
  },
};
