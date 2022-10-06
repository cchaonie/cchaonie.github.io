import collapsed from '../utils/collapsed';
import getRandomCoordinates from '../utils/getRandomCoordinates';
import { CirclePoolEvents } from './constant';
import { Circle, Listener } from './types';

class CirclePool {
  #circles: Circle[] = [];
  #listenersMap: { [index: string]: Array<Listener> } = {
    [CirclePoolEvents.CREATE]: [],
    [CirclePoolEvents.DISPOSE]: [],
  };
  #creationId: any;

  set circles(circles: Circle[]) {
    this.#circles = circles;
    this.notify(CirclePoolEvents.CREATE);
  }

  get circles() {
    return this.#circles;
  }

  subscribe(event: CirclePoolEvents, listener: Listener) {
    const listeners = this.#listenersMap[event];
    listeners[listeners.length] = listener;
    return () => {
      listeners.splice(listeners.length, 1);
    };
  }

  generate() {
    let [x, y] = [0, 0];
    do {
      [x, y] = getRandomCoordinates(800, 600);
    } while (this.circles.some(c => collapsed(c, { x, y }, 64)));

    const circle = {
      x,
      y,
    };

    this.circles = [...this.circles, circle];
    setTimeout(() => {
      this.remove(circle);
    }, 1600);
  }

  remove(circle: Circle) {
    let index = this.circles.indexOf(circle);
    if (index > -1) {
      const validCircles = this.circles.slice();
      validCircles.splice(index, 1);
      this.notify(CirclePoolEvents.DISPOSE);
      this.circles = validCircles;
    }
  }

  initPool() {
    this.#creationId = setInterval(() => {
      this.generate();
    }, 400);
  }

  destroy() {
    this.circles = [];
    if (this.#creationId) {
      clearInterval(this.#creationId);
    }

    this.#listenersMap = {
      [CirclePoolEvents.CREATE]: [],
      [CirclePoolEvents.DISPOSE]: [],
    };
  }

  notify(event: string) {
    const listeners = this.#listenersMap[event];
    for (let i = 0; i < listeners.length; i += 1) {
      listeners[i].call(null, this.circles);
    }
  }
}

export default new CirclePool();
