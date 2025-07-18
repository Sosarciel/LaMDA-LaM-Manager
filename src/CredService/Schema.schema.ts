import { CtorTable } from "./CredManager";
import { ServiceManagerBaseConfig, ServiceConfig } from "@zwa73/service-manager";
import { AccountCategoryData } from "./Interface";



type CredServiceJsonTable =  ServiceManagerBaseConfig & {
    instance_table: {
        [key: string]: ServiceConfig<CtorTable>;
    };
}

export type CredCategoryJsonTable = {
    category_table:{
        [key: string]: AccountCategoryData
    }
}