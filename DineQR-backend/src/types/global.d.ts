declare module 'express';
declare module 'cors';
declare module 'cookie-parser';
declare module 'jsonwebtoken';
declare module 'nodemailer';

import 'express';
declare module 'express' {
  interface Request {
    cookies?: { [key: string]: string };
    user?: any;
  }
}
