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
        "http://localhost:5000",
        "http://localhost:5173",
        "https://dine-qr-website.vercel.app",
        "https://api.com",
      ],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
];
