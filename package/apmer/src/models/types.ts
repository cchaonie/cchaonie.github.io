export interface Circle {
  x: number;
  y: number;
}

export type Listener = (circles: Circle[]) => void;
