import type { TaskInterface, TextCompletionInterface, TextCompletionOption } from "Task";







/**语言模型驱动器 */
export type LaMDrive = TextCompletionInterface&TaskInterface;

export type LaMDriveDefaultOption = TextCompletionOption&ExpandSchemaOption;

/**用于扩展schema数据的选项 */
type ExpandSchemaOption = {
    /**控制最大历史记录token长度 */
    max_hist_length?:number;
    /**控制最大历史消息条数 */
    max_hist_count?:number;
}