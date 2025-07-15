// login.test.ts
import { login } from "../lib/api/authService";

describe("login service", () => {
  it("deve armazenar o token no localStorage", async () => {
    const mockResponse = {
      token: "fake-token-123",
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;

    const result = await login({ username: "user", password: "pass" });

    expect(result).toEqual(mockResponse);
    expect(localStorage.getItem("token")).toBe("fake-token-123");
  });
});
