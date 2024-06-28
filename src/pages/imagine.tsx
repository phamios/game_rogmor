import { useState } from 'react';
import { MobilFrame } from 'src/gui/MobilFrame';
import { select } from 'redux-saga/effects';
import Dream from 'dream-api';

export default () => {
  // get image from api
  const [image, setImage] = useState(null); // image url
  const [seek, setSeek] = useState(''); // image url
  const [n, setN] = useState(1); // image url 
  const [size, setSize] = useState('256x256'); // image url
  const [debug, trace] = useState({});

  const getImage = async () => {
    // const res = await fetch(`/api/ai-image?seek=${seek}&n=${n}&size=${size}`);
    // const json = await res.json();
    // trace(json);
    // const image = await Dream.generateImage(1, seek);
    const token = await Dream.signIn(['csakracsongor@gmail.com','ccsongor'])
    trace(token);
  };


  return (

      <div className='grid'>
        <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="text" placeholder='prompt' value={seek} onChange={e => setSeek(e.target.value)} />
  
        <button className='bg-sky-800 hover:bg-sky-600 m-2 p-2 rounded-md' onClick={getImage} >Get Image</button>
        <pre>{JSON.stringify(debug,null,2)}</pre>
      </div>
  );
}