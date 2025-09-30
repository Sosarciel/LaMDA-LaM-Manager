// main.test.ts
const add = (a: number, b: number): number => a + b;

it('1+2=3', () => {
    expect(add(1, 2)).toBe(3);
});