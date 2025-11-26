import type { ServiceManagerBaseConfig, ServiceConfig } from "@zwa73/service-manager";

import type { CredCtorTable } from "./CredManager";
import type { AccountCategoryData } from "./Interface";



export type CredServiceJsonTable =  ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<CredCtorTable>;
    };
}

export type CredCategoryJsonTable = {
    category_table:{
        [key: string]: AccountCategoryData
    }
}