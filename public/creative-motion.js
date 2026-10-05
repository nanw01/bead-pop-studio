/* One finite animation owner; exports continue using the original paint path. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.getElementById('canvas'),paletteEl=document.getElementById('palette');
 const focusText=document.getElementById('colorFocus'),clear=document.getElementById('clearFocus');
 let frame=0,selected=null;
 const originalRender=render;
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function highlight(){
  originalRender();
  if(selected===null)return;
  const ctx=canvas.getContext('2d');
  result.cells.forEach((id,i)=>{if(id>=0&&id!==selected){ctx.fillStyle='rgba(255,255,255,.84)';ctx.fillRect(i%result.w*16,Math.floor(i/result.w)*16,16,16);}});
 }
 render=()=>{stop();selected=null;paletteEl.querySelectorAll('[data-color-index]').forEach(c=>c.setAttribute('aria-pressed','false'));clear.hidden=true;focusText.textContent='点击一种颜色，看看它在作品里的位置。';originalRender();};
 function replay(){
  stop();selected=null;paletteEl.querySelectorAll('[data-color-index]').forEach(c=>c.setAttribute('aria-pressed','false'));clear.hidden=true;
  mode='beads';originalRender();
  focusText.textContent='豆子落位后，可以在下方色卡中查看每种颜色。';
  if(preference.matches)return;
  const ctx=canvas.getContext('2d'),start=performance.now();
  const width=canvas.width,height=canvas.height;
  function draw(now){
   const t=Math.min((now-start)/850,1),p=1-(1-t)**3;
   ctx.clearRect(0,0,width,height);
   result.cells.forEach((id,i)=>{
    if(id<0)return;
    const endX=i%result.w*16+8,endY=Math.floor(i/result.w)*16+8;
    const seedX=(Math.sin(i*12.9898)*43758.5453)%1,seedY=(Math.sin(i*78.233)*19341.131)%1;
    const x=((seedX+1)%1)*width*(1-p)+endX*p,y=((seedY+1)%1)*height*(1-p)+endY*p;
    ctx.beginPath();ctx.arc(x,y,7.36,0,Math.PI*2);ctx.fillStyle=result.palette[id].hex;ctx.fill();
    ctx.beginPath();ctx.arc(x,y,2.08,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
   });
   if(t<1)frame=requestAnimationFrame(draw);else{frame=0;originalRender();}
  }
  frame=requestAnimationFrame(draw);
 }
 document.getElementById('replay').addEventListener('click',replay);
 paletteEl.addEventListener('click',e=>{
  const card=e.target.closest('[data-color-index]');if(!card)return;
  stop();const id=Number(card.dataset.colorIndex);selected=selected===id?null:id;
  paletteEl.querySelectorAll('[data-color-index]').forEach(c=>c.setAttribute('aria-pressed',String(Number(c.dataset.colorIndex)===selected)));
  clear.hidden=selected===null;
  focusText.textContent=selected===null?'点击一种颜色，看看它在作品里的位置。':`MARD ${result.palette[id].code} · ${result.palette[id].hex.toUpperCase()} · ${result.palette[id].count} 颗；其余颜色已淡化。`;
  highlight();
 });
 clear.addEventListener('click',()=>{selected=null;paletteEl.querySelectorAll('[data-color-index]').forEach(c=>c.setAttribute('aria-pressed','false'));clear.hidden=true;focusText.textContent='点击一种颜色，看看它在作品里的位置。';highlight();});
 preference.addEventListener('change',()=>{stop();highlight();});
 window.addEventListener('pagehide',stop);
})();

(()=>{
 const dialog=document.getElementById('patternDialog');
 document.getElementById('inspectPattern').addEventListener('click',()=>{
  const detail=document.getElementById('detailCanvas');detail.width=result.w*28;detail.height=result.h*28;paint(detail,true,28);dialog.showModal();
  const occupied=result.cells.map((id,i)=>id<0?null:{x:i%result.w,y:Math.floor(i/result.w)}).filter(Boolean);
  const scroller=dialog.querySelector('.detail-scroll');scroller.scrollLeft=Math.max(0,occupied[0].x*28-28);scroller.scrollTop=Math.max(0,occupied[0].y*28-28);
 });
 document.getElementById('closePattern').addEventListener('click',()=>dialog.close());
})();
