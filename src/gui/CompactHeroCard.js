export default ({hero, children, ...props}) => {
  const {avatar, profession, staminaState } = hero;

  return (
    <figure className='small-card gui gui-loginw' {...props}>
      <image className='face-sprite' data-face={avatar} />
      <span>
        <span>{`lvl: ${level} - ${profession}`}</span>
        <div>
          <svg className="small-card-svg">
            <rect fill="rgba(0,0,0,0.2)" width={100} height={4} x={0} y={0}/>
            <rect fill="green" width={100 * staminaState / stamina} height={4} x={0} y={0}/>
          </svg>
        </div>
      </span>
      {/* <ProcessBar process={staminaState / stamina} style={{width: 160, marginLeft: 15}} /> */}
      {children}
    </figure>
  );
}