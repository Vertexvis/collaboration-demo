import { MousePosition } from "@react-hook/mouse-position";
import { Vector3 } from "@vertexvis/geometry";

export interface Awareness {
  readonly mousePosition?: MousePosition;
  readonly user: User;
}

export interface Message {
  readonly text: string;
  readonly user: User;
}

export type Model = Record<string, State>;

export interface Pin {
  readonly color: string;
  readonly worldPosition: Vector3.Vector3;
  readonly itemId: string;
}

export interface State {
  readonly selectItemId?: string;
  readonly pins: Pin[];
}

export interface User extends UserData {
  readonly clientId: number;
}

export interface UserData {
  readonly color: string;
  readonly name: string;
}
