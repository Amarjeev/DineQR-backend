import helmet from "helmet";

export const securityHeaders = [
  helmet.hidePoweredBy(),
  helmet.frameguard({ action: "deny" }),
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://apis.google.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://dineqr.cfd",
        "https://www.dineqr.cfd",
        "https://dineqr-backend-3.onrender.com",
      ],
      formAction: ["'self'", "https://dineqr.cfd"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
    },
  }),
];
