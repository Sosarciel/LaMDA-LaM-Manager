import { HttpAPIModelDrive } from "./HttpApiModel";




export const ModelDriveTable = {
    httpapi:HttpAPIModelDrive,
};

export type ModelDriveType = keyof typeof ModelDriveTable;