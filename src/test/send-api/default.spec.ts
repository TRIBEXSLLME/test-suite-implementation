import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "smtpexpress";
import { SendMailOptions } from "smtpexpress/dist/src/helpers/types";


describe("Send API - Message", () => {
  let smtpExpressClient: {
    sendApi: {
      sendMail(options: SendMailOptions): Promise<{
        message: string;
        statusCode: number;
        data: {
          ref: string;
        };
      }>;
    };
  };

  beforeEach(() => {
    smtpExpressClient = createClient({
      projectId: process.env.VITE_PROJECT_ID as string,
      projectSecret: process.env.VITE_PROJECT_SECRET as string,
    });
  });

  const testValidPayload = {
    subject: "test subject",
    message:
      '<!DOCTYPE html>\n<html>\n  <body style="max-width: 600px; margin: auto;">\n    <p style="font-size: 14px; font-weight: 400; letter-spacing: -0.05em; font-family: system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif;">quick send</p>\n  </body>\n</html>\n',
    sender: {
      name: "adedotxn.dev",
      email: process.env.VITE_SENDER_ADDRESS as string,
    },
    recipients: {
      email: "adedotxn.dev@gmail.com",
    },
  };

  const testErrorCase = async (
    payload: any,
    expectedErrorMessage: string,
    expectedStatusCode: number,
  ) => {
    try {
      const result = await smtpExpressClient.sendApi.sendMail(payload);
      expect(result.statusCode).toBe(expectedStatusCode);
    } catch (error: any) {
      expect(error).toBeTruthy();
      expect(error?.message).toBe(expectedErrorMessage);
      expect(error?.statusCode).toBe(expectedStatusCode);
    }
  };

  it("should reject request with empty payload", () =>
    testErrorCase({}, "Missing value of sender's email in request body", 400));

  it("should raise error for empty subject", () =>
    testErrorCase(
      { ...testValidPayload, subject: "" },
      "Missing value of subject in request body",
      400,
    ));

  it("should raise error for empty body/content", () =>
    testErrorCase(
      { ...testValidPayload, message: "" },
      "Missing value of message in request body. If using a template, please provide a template id. \n      Refer to the usage of templates here https://smtpexpress.com/docs/send-api#with-templates",
      400,
    ));

  it("should raise error for missing recipient email", () =>
    testErrorCase(
      { ...testValidPayload, recipients: {} },
      "Missing value of recipient's email in request body",
      400,
    ));

  it("should raise error for empty sender name", () =>
    testErrorCase(
      { ...testValidPayload, sender: { ...testValidPayload.sender, name: "" } },
      "Missing value of sender's name in request body",
      400,
    ));

  it("should raise error for subject value length ≤ 2", () =>
    testErrorCase(
      { ...testValidPayload, subject: "Ab" },
      "Subject must be at least 3 characters long",
      400,
    ));

  it("should raise error for incorrect recipient email format", async () => {
    const invalidEmails = [
      "harof.dev@gmil..com",
      "harof.dev@com",
      "harof.dev@.com",
    ];

    for (const invalidEmail of invalidEmails) {
      await testErrorCase(
        { ...testValidPayload, recipients: { email: invalidEmail } },
        "Invalid value of recipient's email in request body",
        400,
      );
    }
  });

  it("should raise error for sender name value length ≤ 2", () =>
    testErrorCase(
      {
        ...testValidPayload,
        sender: { ...testValidPayload.sender, name: "Ab" },
      },
      "Sender name must be at least 3 characters long",
      400,
    ));

  it("should reject mail when sender address is not reachable or connected", () =>
    testErrorCase(
      {
        ...testValidPayload,
        sender: { ...testValidPayload.sender, email: "example@gmail.com" },
      },
      "Sender address is not reachable",
      400,
    ));

  it("should raise error for sending incompatible custom domain attached to secret", () =>
    testErrorCase(
      {
        ...testValidPayload,
        sender: {
          ...testValidPayload.sender,
          email: "sender@incompatible-domain.com",
        },
      },
      "Custom sender domain does not match the selected secret",
      400,
    ));
});