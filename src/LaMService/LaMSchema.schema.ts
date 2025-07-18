import { HttpApiModelCategory } from "ModelDrive";
import { CtorTable } from "./LaMManager";
import { ServiceConfig, ServiceManagerBaseConfig } from "@zwa73/service-manager";


/**用于实例加载 */
type ServiceJsonTable = ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<CtorTable>;
    };
};

/**用于设置实例类别 */
type ModelCategoryJsonTable = {
    /**适用于HttpApi的模型 */
    httpapi_model: {
        [key: string]: HttpApiModelCategory;
    };
};