import { packBuffers } from "../main";

test("packBuffers", () => {
  expect(packBuffers([Buffer.from("beef", "hex"), Buffer.from("cafe", "hex")]).toString("hex")).toBe("02beef02cafe");
  expect(packBuffers([Buffer.alloc(0)]).toString("hex")).toBe("00");
  expect(packBuffers([Buffer.alloc(1)]).toString("hex")).toBe("0100");
});

test("packBuffers with an iterator from a generator", () => {
  function* generator() {
    yield Buffer.from("beef", "hex");
    yield Buffer.from("cafe", "hex");
  }
  const iterator = generator();
  expect(packBuffers(iterator).toString("hex")).toBe("02beef02cafe");
});

test("packBuffers with an iterator from a Map", () => {
  const map = new Map([[1, Buffer.from("beef", "hex")], [2, Buffer.from("cafe", "hex")]]);
  const iterator = map.values();
  expect(packBuffers(iterator).toString("hex")).toBe("02beef02cafe");
});
