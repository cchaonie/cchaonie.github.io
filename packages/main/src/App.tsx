import { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three';
import './app.css';
import BlackBoard from './components/BlackBoard/BlackBoard';
import { menuLinks } from './components/constant';
import Menu from './components/Menu/Menu';

function App() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let id: number;

    if (ref.current) {
      const scene = new Scene();
      const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new WebGLRenderer({ canvas: ref.current });

      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0xeeff22 });
      const cube = new Mesh(geometry, material);
      scene.add(cube);

      camera.position.z = 5;

      function animate() {
        id = requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
      }
      animate();
    }

    return () => {
      if (id) {
        cancelAnimationFrame(id);
      }
    };
  }, []);

  return (
    <div className='main'>
      <BlackBoard ref={ref} height={360} width={490} />
      <Menu links={menuLinks} />
    </div>
  );
}

export default App;
