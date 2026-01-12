

// 使用泛型约束，确保 value 是一个构造函数
function registerTokensizer<Class extends abstract new (...args: any[]) => any>(
    value: Class, 
    context: ClassDecoratorContext<Class>
) {
    console.log(`正在封印类: ${context.name}`);
    Object.seal(value);
    Object.seal(value.prototype);
}

@registerTokensizer
class BugReport {
    type = "report";
    title: string;
    constructor(t: string) {
        this.title = t;
    }
}