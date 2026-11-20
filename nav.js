// Site navigation behaviour (CCB-14). Markup comes from scripts/build-nav.mjs.
// Desktop: a group opens on click, and on keyboard focus of its parent button. It closes on Escape,
// on a click outside, and when focus leaves the group. Mobile: each group is an accordion.
(function(){
  var keyboard=false;
  document.addEventListener('keydown',function(e){if(e.key==='Tab')keyboard=true},true);
  document.addEventListener('mousedown',function(){keyboard=false},true);
  document.addEventListener('touchstart',function(){keyboard=false},{capture:true,passive:true});

  function setOpen(btn,open){
    btn.setAttribute('aria-expanded',open?'true':'false');
    var panel=document.getElementById(btn.getAttribute('aria-controls'));
    if(panel)panel.hidden=!open;
  }
  var parents=Array.prototype.slice.call(document.querySelectorAll('.fsn-parent'));
  function closeOthers(keep){parents.forEach(function(p){if(p!==keep)setOpen(p,false)})}

  parents.forEach(function(btn){
    var group=btn.parentNode;
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')!=='true';
      closeOthers(btn);setOpen(btn,open);
    });
    btn.addEventListener('focus',function(){if(keyboard){closeOthers(btn);setOpen(btn,true)}});
    group.addEventListener('focusout',function(e){if(!group.contains(e.relatedTarget))setOpen(btn,false)});
  });
  document.addEventListener('click',function(e){
    parents.forEach(function(p){if(!p.parentNode.contains(e.target))setOpen(p,false)});
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    parents.forEach(function(p){
      if(p.getAttribute('aria-expanded')==='true'){
        var inside=p.parentNode.contains(document.activeElement);
        setOpen(p,false);
        if(inside){keyboard=false;p.focus()}
      }
    });
  });

  // mobile accordions
  Array.prototype.forEach.call(document.querySelectorAll('.fsn-m-parent'),function(btn){
    btn.addEventListener('click',function(){setOpen(btn,btn.getAttribute('aria-expanded')!=='true')});
  });

  // menu button on pages with the standalone header (styles.css pages keep their own [data-menu] script)
  var mb=document.querySelector('.fsn-menu-btn');
  if(mb){
    var panel=document.getElementById(mb.getAttribute('aria-controls'));
    var toggle=function(open){
      mb.setAttribute('aria-expanded',open?'true':'false');
      mb.setAttribute('aria-label',open?'Close menu':'Open menu');
      panel.hidden=!open;
    };
    mb.addEventListener('click',function(){toggle(mb.getAttribute('aria-expanded')!=='true')});
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&mb.getAttribute('aria-expanded')==='true'&&!parents.some(function(p){return p.getAttribute('aria-expanded')==='true'})){toggle(false);mb.focus()}
    });
  }
})();
