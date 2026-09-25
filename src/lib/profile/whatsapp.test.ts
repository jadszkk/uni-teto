import { describe, expect, it } from "vitest";
import { formatWhatsapp, normalizeWhatsapp } from "./whatsapp";

describe("normalizeWhatsapp", () => {
  it.each([
    ["(86) 99999-8888", "5586999998888"],
    ["86999998888", "5586999998888"],
    ["+55 86 99999-8888", "5586999998888"],
    ["55 (11) 98765-4321", "5511987654321"],
  ])("aceita %j", (input, expected) => {
    expect(normalizeWhatsapp(input)).toBe(expected);
  });

  it.each([
    ["", "vazio"],
    ["(86) 3222-1111", "telefone fixo"],
    ["(86) 8999-8888", "celular sem o 9"],
    ["(06) 99999-8888", "DDD com zero"],
    ["(86) 99999-88889", "dígito a mais"],
    ["+1 415 555 0100", "número de outro país"],
  ])("recusa %j (%s)", (input) => {
    expect(normalizeWhatsapp(input)).toBeNull();
  });
});

describe("formatWhatsapp", () => {
  it("formata o número guardado", () => {
    expect(formatWhatsapp("5586999998888")).toBe("(86) 99999-8888");
  });

  it("devolve como veio se o número não estiver no formato esperado", () => {
    expect(formatWhatsapp("123")).toBe("123");
  });

  it("volta ao mesmo valor ao normalizar de novo", () => {
    const stored = "5511987654321";
    expect(normalizeWhatsapp(formatWhatsapp(stored))).toBe(stored);
  });
});
