// Booking and contact buttons on the CRM pages (/crm-scalability-assessment, /salesforce, /iris).
// Each button carries data-book="<value>"; the same value is in its utm_content, so every button can be told apart.
// 1) Pass utm_source, utm_medium and utm_campaign from the visitor's URL through to the button links
//    (the site's own values stay when the visitor has none). utm_content always stays the button's own value.
// 2) Record each click in Vercel Web Analytics as the custom event "CRM page button", with the button value
//    and the page as properties. No other analytics tool.
(function(){
  var q=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign'];
  var buttons=document.querySelectorAll('[data-book]');
  if(keys.some(function(k){return q.get(k)})){
    buttons.forEach(function(a){
      var u=new URL(a.href);
      keys.forEach(function(k){if(q.get(k))u.searchParams.set(k,q.get(k))});
      a.href=u.toString();
    });
  }
  window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};
  buttons.forEach(function(a){
    a.addEventListener('click',function(){
      try{window.va('event',{name:'CRM page button',data:{button:a.getAttribute('data-book'),page:location.pathname}})}catch(e){}
    });
  });
})();
