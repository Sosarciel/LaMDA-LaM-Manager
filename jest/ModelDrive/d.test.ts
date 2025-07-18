import { flow } from "@zwa73/utils";


describe('Flow Function - Basic Operations', () => {
    it('应该能按顺序应用所有函数 (同步操作)', () => {
        const result = flow(
            (x: number) => x + 1,
            (x) => x * 2,
            (x) => x - 3
        )(5);
        expect(result).toBe(9); // (5 + 1) * 2 - 3 = 9
    });
});