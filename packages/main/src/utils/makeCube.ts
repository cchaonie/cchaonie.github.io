import {
  BufferGeometry,
  ColorRepresentation,
  Mesh,
  MeshPhongMaterial,
  Scene,
} from 'three';

export default function makeCube(
  scene: Scene,
  geometry: BufferGeometry,
  color: ColorRepresentation,
  x: number
) {
  const material = new MeshPhongMaterial({ color });
  const cube = new Mesh(geometry, material);
  cube.position.x = x;

  scene.add(cube);

  return cube;
}
