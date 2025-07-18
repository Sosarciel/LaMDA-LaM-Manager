// main.test.ts
const add = (a: number, b: number): number => a + b;

xit('1+2=3', () => {
    expect(add(1, 2)).toBe(3);
});

xit('console.log test', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // 这里是你的函数，它会打印 "成功" 或 "失败"
    function yourFunction() {
        console.log('成功');
    }

    yourFunction();

    expect(consoleSpy).toHaveBeenCalledWith('成功');

    // 清理 spy
    consoleSpy.mockRestore();
});

xit('mult console.log test', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // 这里是你的函数
    function yourFunction() {
        console.log("xxxx1234");
        console.log("111abc22");
        console.log("11def");
        console.log("xxxxxxx");
    }

    yourFunction();

    // 检查 console.log 的输出中是否包含 "abc" 和 "def"
    const hasAbc = consoleSpy.mock.calls.some(args => args.some(arg => arg.includes('abc')));
    const hasDef = consoleSpy.mock.calls.some(args => args.some(arg => arg.includes('def')));

    expect(hasAbc).toBe(true);
    expect(hasDef).toBe(true);

    // 清理 spy
    consoleSpy.mockRestore();
});
