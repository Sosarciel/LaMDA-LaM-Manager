
import { ServiceManagerBaseConfig, ServiceConfig } from "@zwa73/service-manager";
import { LaMCtorTable } from "./LaMManager";



/**用于实例加载 */
type LaMServiceJsonTable = ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<LaMCtorTable>;
    };
};