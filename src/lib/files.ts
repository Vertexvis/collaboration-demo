import { FileList } from "@vertexvis/api-client-node";
import { basename } from "path";

export interface FileData {
  readonly created: string;
  readonly id: string;
  readonly name: string;
}

export function toFileData(fileList: FileList): FileData[] {
  return fileList.data.map((f) => ({
    created: f.attributes.created,
    id: f.id,
    name: basename(f.attributes.name),
  }));
}
