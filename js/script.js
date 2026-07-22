
  // Transparent nav scrolls to white
  const nav = document.getElementById('main-nav');
  function handleScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, {passive:true});
  handleScroll();

  function toggleMenu(){
    const menu = document.getElementById('mobile-menu');
    const btn = document.querySelector('.hamburger');
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    nav.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  function closeMenu(){
    document.getElementById('mobile-menu').classList.remove('open');
    document.querySelector('.hamburger').classList.remove('open');
    nav.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
  function toggleFaq(btn){
    const item=btn.closest('.faq-item');
    const isOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
    if(!isOpen)item.classList.add('open');
  }
  // ── SKELETON LOADING: shimmer a tile until its image finishes loading ──
  function wireLoadFade(container){
    if(!container) return;
    container.querySelectorAll('img').forEach(function(img){
      var tile=img.closest('.about-post,.ig-post');
      function done(){
        img.classList.add('loaded');
        if(tile) tile.classList.add('loaded');
      }
      if(img.complete && img.naturalWidth>0){ done(); }
      else { img.addEventListener('load', done); img.addEventListener('error', done); }
    });
  }
  wireLoadFade(document.getElementById('about-gallery-track'));

  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:.08});
  document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));
  async function submitForm(){
    const n=document.getElementById('name').value;
    const e=document.getElementById('email').value;
    if(!n||!e){alert('Please fill in at least your name and email address.');return}
    const form=document.getElementById('contact-form');
    const data=new FormData(form);
    data.append('_subject','New Enquiry — The Loose Lead Co.');
    data.append('_captcha','false');
    data.append('_template','table');
    try{
      const r=await fetch('https://formsubmit.co/thelooseleadco@gmail.com',{method:'POST',body:data,headers:{Accept:'application/json'}});
      if(r.ok){
        document.getElementById('form-fields').style.display='none';
        document.getElementById('form-success').style.display='block';
        document.getElementById('contact').scrollIntoView({behavior:'smooth'});
      }else{
        alert('Something went wrong. Please email us directly at thelooseleadco@gmail.com');
      }
    }catch(err){
      alert('Something went wrong. Please email us directly at thelooseleadco@gmail.com');
    }
  }

  // ── INSTAGRAM FEED: load live photos from Behold ──
  (function(){
    var FEED='https://feeds.behold.so/fPivPXilrx8shCWFFglw';
    var strip=document.querySelector('.ig-strip');
    var track=strip&&strip.querySelector('.ig-track');
    if(!strip||!track) return;
    fetch(FEED)
      .then(function(r){return r.json();})
      .then(function(data){
        var posts=data.posts||[];
        var imgs=[];
        posts.forEach(function(post){
          var link=post.permalink;
          var children=post.children||[];
          children.forEach(function(child){
            var url=child.sizes&&child.sizes.medium?child.sizes.medium.mediaUrl:child.mediaUrl;
            if(url) imgs.push({url:url,link:link});
          });
        });
        var selected=imgs.slice(0,12);
        if(!selected.length) return;
        function makePost(p){
          return '<a href="'+p.link+'" target="_blank" rel="noopener" class="ig-post"><img src="'+p.url+'" alt="The Loose Lead Co. on Instagram" loading="lazy"></a>';
        }
        track.innerHTML=selected.map(makePost).join('');
        wireLoadFade(track);
      })
      .catch(function(){});
  })();

  // ── ABOUT GALLERY: load photos from images/gallery/ folder on GitHub ──
  // To add/remove photos, just upload/delete files in that folder on github.com —
  // no code changes or redeploy needed, this reads the folder live on every page load.
  (function(){
    var REPO='JakeRayner/the-loose-lead-website';
    var PATH='images/gallery';
    var track=document.getElementById('about-gallery-track');
    if(!track) return;
    fetch('https://api.github.com/repos/'+REPO+'/contents/'+PATH)
      .then(function(r){return r.json();})
      .then(function(files){
        if(!Array.isArray(files)) return;
        var imgExt=/\.(jpe?g|png|webp)$/i;
        var images=files.filter(function(f){return f.type==='file'&&imgExt.test(f.name);});
        if(!images.length) return;
        images.sort(function(a,b){return a.name.localeCompare(b.name);});
        function makePost(f){
          return '<div class="about-post"><img src="'+f.download_url+'" alt="Dog cared for by The Loose Lead Co." loading="lazy"></div>';
        }
        track.innerHTML=images.map(makePost).join('');
        wireLoadFade(track);
      })
      .catch(function(){});
  })();

  // ── GALLERY STRIP: pause/resume + drag + lightbox ──
  (function(){
    const strip=document.getElementById('gallery-strip');
    if(!strip) return;
    const fwd=strip.querySelector('.zs-track--fwd');
    const rev=strip.querySelector('.zs-track--rev');
    if(!fwd) return;
    let resumeTimer,fwdTotal=0,revTotal=0,didDrag=false,dragStartX=0;

    function getX(el){return new DOMMatrix(getComputedStyle(el).transform).m41;}

    function pauseIfNeeded(){
      if(fwd.style.animationPlayState==='paused') return;
      fwdTotal=getX(fwd);
      revTotal=rev?getX(rev):0;
      fwd.style.animationPlayState='paused';
      fwd.style.transform='translateX('+fwdTotal+'px)';
      if(rev){rev.style.animationPlayState='paused';rev.style.transform='translateX('+revTotal+'px)';}
      clearTimeout(resumeTimer);
    }

    function resume(){
      var fwdHw=fwd.scrollWidth/2;
      var fp=((-fwdTotal/fwdHw)%1+1)%1;
      fwd.style.animationDelay=-(fp*60)+'s';
      fwd.style.transform='';
      fwd.style.animationPlayState='running';
      if(rev){
        var revHw=rev.scrollWidth/2;
        var rp=((revTotal/revHw+1)%1+1)%1;
        rev.style.animationDelay=-(rp*55)+'s';
        rev.style.transform='';
        rev.style.animationPlayState='running';
      }
    }

    function scheduleResume(){clearTimeout(resumeTimer);resumeTimer=setTimeout(resume,3000);}

    strip.addEventListener('pointerdown',function(e){
      dragStartX=e.clientX;didDrag=false;
      pauseIfNeeded();
      if(window.innerWidth>768) strip.setPointerCapture(e.pointerId);
    });

    strip.addEventListener('pointermove',function(e){
      if(!strip.hasPointerCapture(e.pointerId)) return;
      var dx=e.clientX-dragStartX;
      if(Math.abs(dx)>4) didDrag=true;
      fwd.style.transform='translateX('+(fwdTotal+dx)+'px)';
      if(rev) rev.style.transform='translateX('+(revTotal-dx)+'px)';
    });

    strip.addEventListener('pointerup',function(e){
      if(strip.hasPointerCapture(e.pointerId)){
        var dx=e.clientX-dragStartX;
        fwdTotal+=dx;revTotal-=dx;
        strip.releasePointerCapture(e.pointerId);
      }
      scheduleResume();
    });

    strip.addEventListener('pointercancel',function(){scheduleResume();});

    // ── LIGHTBOX ──
    var imgs=[];
    var seen=new Set();
    strip.querySelectorAll('.zs-track img').forEach(function(img){
      if(!seen.has(img.src)){seen.add(img.src);imgs.push(img.src);}
    });
    var current=0;

    var lb=document.createElement('div');
    lb.id='gallery-lightbox';
    lb.className='gl-overlay';
    lb.innerHTML='<button class="gl-close" aria-label="Close">✕</button>'
      +'<button class="gl-prev" aria-label="Previous">&#8249;</button>'
      +'<div class="gl-img-wrap"><img id="gl-main" alt="Dog photo"></div>'
      +'<button class="gl-next" aria-label="Next">&#8250;</button>'
      +'<div class="gl-counter" id="gl-counter"></div>';
    document.body.appendChild(lb);

    var glMain=lb.querySelector('#gl-main');
    var glCounter=lb.querySelector('#gl-counter');

    function updateLb(){glMain.src=imgs[current];glCounter.textContent=(current+1)+' / '+imgs.length;}

    function openLb(idx){
      current=((idx%imgs.length)+imgs.length)%imgs.length;
      updateLb();lb.classList.add('open');
      document.body.style.overflow='hidden';
      pauseIfNeeded();
    }

    function closeLb(){
      lb.classList.remove('open');
      document.body.style.overflow='';
      scheduleResume();
    }

    function showImg(idx){current=((idx%imgs.length)+imgs.length)%imgs.length;updateLb();}

    lb.querySelector('.gl-close').addEventListener('click',closeLb);
    lb.querySelector('.gl-prev').addEventListener('click',function(){showImg(current-1);});
    lb.querySelector('.gl-next').addEventListener('click',function(){showImg(current+1);});
    lb.addEventListener('click',function(e){if(e.target===lb) closeLb();});

    document.addEventListener('keydown',function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') closeLb();
      if(e.key==='ArrowLeft') showImg(current-1);
      if(e.key==='ArrowRight') showImg(current+1);
    });

    var lbTouchX=0,lbSwiped=false;
    lb.addEventListener('touchstart',function(e){lbTouchX=e.touches[0].clientX;lbSwiped=false;},{passive:true});
    lb.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].clientX-lbTouchX;
      if(Math.abs(dx)>40){lbSwiped=true;dx<0?showImg(current+1):showImg(current-1);}
    },{passive:true});
    lb.addEventListener('click',function(e){if(lbSwiped){lbSwiped=false;}});

    strip.addEventListener('click',function(e){
      if(didDrag){didDrag=false;return;}
      var img=e.target.closest('img');
      if(!img) return;
      var src=img.src;
      var idx=imgs.findIndex(function(s){return s===src;});
      if(idx===-1) idx=imgs.findIndex(function(s){return s.split('/').pop()===src.split('/').pop();});
      openLb(idx>=0?idx:0);
    });
  })();
