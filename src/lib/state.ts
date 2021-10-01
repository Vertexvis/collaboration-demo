import { Vector3 } from "@vertexvis/geometry";

export interface Awareness {
  readonly user: User;
}

export interface Message {
  text: string;
  user: User;
}

export type Model = Record<string, State>;

export interface Pin {
  color: string;
  worldPosition: Vector3.Vector3;
  itemId: string;
}

export interface State {
  selectItemId?: string;
  pins: Pin[];
}

export interface User extends UserData {
  readonly clientId: number;
}

export interface UserData {
  readonly color: string;
  readonly name: string;
}
