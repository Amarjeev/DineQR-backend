declare module "fast-two-sms" {
  interface Fast2SMSOptions {
    authorization: string;
    message: string;
    numbers: string[];
    route?: "p" | "t";
  }

  interface Fast2SMSResponse {
    return: boolean;
    message: string;
    [key: string]: any;
  }

  function sendMessage(options: Fast2SMSOptions): Promise<Fast2SMSResponse>;

  export = { sendMessage };
}
