import BlackBoard from '../BlackBoard/BlackBoard';
import {
  WebGLRenderer,
  PerspectiveCamera,
  BufferGeometry,
  Color,
  ColorRepresentation,
  DirectionalLight,
  Renderer,
  Scene,
  BufferAttribute,
  DoubleSide,
  DynamicDrawUsage,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from 'three';
import { useEffect, useRef } from 'react';

export const MyScene = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let id: number;
    if (ref.current) {
      const renderer = new WebGLRenderer({ canvas: ref.current });

      const fov = 75;
      const aspect = 2; // the canvas default
      const near = 0.1;
      const far = 100;
      const camera = new PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 3;

      const scene = new Scene();
      scene.background = new Color(0xffffff);

      function addLight(...pos: [number, number, number]) {
        const color = 0xffffff;
        const intensity = 1;
        const light = new DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
      }
      addLight(-1, 2, 4);
      addLight(2, -2, 3);

      function makeSpherePositions(
        segmentsAround: number,
        segmentsDown: number
      ) {
        const numVertices = segmentsAround * segmentsDown * 6;
        const numComponents = 3;
        const positions = new Float32Array(numVertices * numComponents);
        const indices = [];

        const longHelper = new Object3D();
        const latHelper = new Object3D();
        const pointHelper = new Object3D();
        longHelper.add(latHelper);
        latHelper.add(pointHelper);
        pointHelper.position.z = 1;
        const temp = new Vector3();

        function getPoint(lat: number, long: number) {
          latHelper.rotation.x = lat;
          longHelper.rotation.y = long;
          longHelper.updateMatrixWorld(true);
          return pointHelper.getWorldPosition(temp).toArray();
        }

        let posNdx = 0;
        let ndx = 0;
        for (let down = 0; down < segmentsDown; ++down) {
          const v0 = down / segmentsDown;
          const v1 = (down + 1) / segmentsDown;
          const lat0 = (v0 - 0.5) * Math.PI;
          const lat1 = (v1 - 0.5) * Math.PI;

          for (let across = 0; across < segmentsAround; ++across) {
            const u0 = across / segmentsAround;
            const u1 = (across + 1) / segmentsAround;
            const long0 = u0 * Math.PI * 2;
            const long1 = u1 * Math.PI * 2;

            positions.set(getPoint(lat0, long0), posNdx);
            posNdx += numComponents;
            positions.set(getPoint(lat1, long0), posNdx);
            posNdx += numComponents;
            positions.set(getPoint(lat0, long1), posNdx);
            posNdx += numComponents;
            positions.set(getPoint(lat1, long1), posNdx);
            posNdx += numComponents;

            indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
            ndx += 4;
          }
        }
        return { positions, indices };
      }

      const segmentsAround = 24;
      const segmentsDown = 16;
      const { positions, indices } = makeSpherePositions(
        segmentsAround,
        segmentsDown
      );

      const normals = positions.slice();

      const geometry = new BufferGeometry();
      const positionNumComponents = 3;
      const normalNumComponents = 3;

      const positionAttribute = new BufferAttribute(
        positions,
        positionNumComponents
      );
      positionAttribute.setUsage(DynamicDrawUsage);
      geometry.setAttribute('position', positionAttribute);
      geometry.setAttribute(
        'normal',
        new BufferAttribute(normals, normalNumComponents)
      );
      geometry.setIndex(indices);

      function makeInstance(
        geometry: BufferGeometry,
        color: ColorRepresentation,
        x: number
      ) {
        const material = new MeshPhongMaterial({
          color,
          side: DoubleSide,
          shininess: 100,
        });

        const cube = new Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;
        return cube;
      }

      const cubes = [makeInstance(geometry, 0xff0000, 0)];

      function resizeRendererToDisplaySize(renderer: Renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }

      const temp = new Vector3();

      function render(time: number) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }

        for (let i = 0; i < positions.length; i += 3) {
          const quad = (i / 12) | 0;
          const ringId = (quad / segmentsAround) | 0;
          const ringQuadId = quad % segmentsAround;
          const ringU = ringQuadId / segmentsAround;
          const angle = ringU * Math.PI * 2;
          temp.fromArray(normals, i);
          temp.multiplyScalar(
            MathUtils.lerp(1, 1.4, Math.sin(time + ringId + angle) * 0.5 + 0.5)
          );
          temp.toArray(positions, i);
        }
        positionAttribute.needsUpdate = true;

        cubes.forEach((cube, ndx) => {
          const speed = -0.2 + ndx * 0.1;
          const rot = time * speed;
          cube.rotation.y = rot;
        });

        renderer.render(scene, camera);

        id = requestAnimationFrame(render);
      }
      id = requestAnimationFrame(render);
    }

    return () => {
      if (id) {
        cancelAnimationFrame(id);
      }
    };
  }, []);
  return <BlackBoard ref={ref} height={150} width={300} />;
};
