export const VerticalValue = ({value=1, tw="bg-white"}) => (
  <div className='relative'>
    <div className="w-4 h-24 absolute bg-[#0004]" />
    <div 
      className={`w-4 h-24 origin-bottom transition ${tw}`}
      style={{transform:`scaleY(${value})`}} 
    />
  </div>
);