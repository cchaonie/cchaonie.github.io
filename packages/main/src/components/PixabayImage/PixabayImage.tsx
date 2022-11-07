import { useEffect, useState } from 'react';
import { PIXABAY_API_ENDPOINT } from './constant';
import { PixabayImageProps } from './types';

export const PixabayImage = ({ width, height, API_KEY }: PixabayImageProps) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `${PIXABAY_API_ENDPOINT}?key=${API_KEY}&min_width=${width}&min_height=${height}&orientation=horizontal`,
      {
        signal: controller.signal,
      }
    )
      .then(res => {
        if (res.ok) {
          res.json().then(({ hits }) => {
            const totalHits = hits.length;
            const index = Math.floor(Math.random() * totalHits);
            setImgSrc(hits[index].largeImageURL);
          });
        }
      })
      .catch(e => console.error(e));
    return () => {
      controller.abort();
    };
  }, []);

  return (
    imgSrc && (
      <div
        style={{
          height: `${height}px`,
          width: `${width}px`,
          background: `url(${imgSrc}) no-repeat`,
        }}
      ></div>
    )
  );
};
