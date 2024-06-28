import { useState } from 'react';
import { MobilFrame } from 'src/gui/MobilFrame';
import { select } from 'redux-saga/effects';

export default () => {
  // get image from api
  const [image, setImage] = useState(null); // image url
  const [seek, setSeek] = useState(''); // image url
  const [n, setN] = useState(1); // image url 
  const [size, setSize] = useState('256x256'); // image url

  const getImage = async () => {
    const res = await fetch(`/api/ai-image?seek=${seek}&n=${n}&size=${size}`);
    const json = await res.json();
    setImage(json);
  };


  return (
    <section className='portal-root m-2'>
      <MobilFrame>

        <h1 className='text-[2em] text-center'>Design Something</h1>
        <div className='grid'>
          <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="text" placeholder='prompt' value={seek} onChange={e => setSeek(e.target.value)} />
          <section className='grid grid-cols-2'>
            <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="number" value={n} min={1} max={8} onChange={e => setN(+ e.target.value)} />
            <select className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" value={size} onChange={e => setSize(e.target.value)}>
              <option value="256x256">256x256</option>
              <option value="512x512">512x512</option>
              <option value="1024x1024">1024x1024</option>
            </select>
          </section>

          <button className='bg-sky-800 hover:bg-sky-600 m-2 p-2 rounded-md' onClick={getImage} >Get Image</button>
          {/* <a className='bg-sky-800 hover:bg-sky-600 m-2 p-4 rounded-md text-center text-lg' href={`/`} target='_blank' >Back to play</a> */}

        </div>
        <div>
          {/* <pre>{JSON.stringify(image, null, 2)}</pre> */}
          <section className='grid gap-2 place-items-center'>
            {image?.data?.map && image.data.map(({ url }, idx) => <img key={idx} src={url} />)}
          </section>
        </div>
      </MobilFrame>
    </section>
  );
}