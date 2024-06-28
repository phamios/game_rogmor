export default ({children, ...props}) => {
  return (    
    <figure className='slice-9-grid-holder retro' id="__rogmor__">
      <figure className="slice-content">
        {children}
      </figure>
      <figure className="modal-window slice-extra" {...props}/>
    </figure>
  );
}
