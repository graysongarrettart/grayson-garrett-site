// ==========================================================================
// GRAYSON GARRETT PRODUCTIONS — shared interaction layer (v2)
// ==========================================================================
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- nav: solid on scroll + mobile toggle ---------------- */
  const nav = document.querySelector('.nav');
  const onScroll = ()=>{ if(nav) nav.classList.toggle('scrolled', window.scrollY > 40); };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', ()=>{
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
      toggle.classList.remove('open'); links.classList.remove('open');
    }));
  }

  /* ---------------- scroll reveal ---------------- */
  const rvEls = document.querySelectorAll('.rv, .rv-left, .rv-right, .rv-scale');
  if('IntersectionObserver' in window && rvEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
    rvEls.forEach((el,i)=>{ el.style.setProperty('--i', i%8); io.observe(el); });
  } else {
    rvEls.forEach(el=> el.classList.add('in'));
  }

  /* ---------------- "need" sections: outline -> fill on enter ---------------- */
  document.querySelectorAll('.need-head .h-title').forEach(el=>{
    if('IntersectionObserver' in window){
      const io2 = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.remove('outline'); io2.unobserve(en.target); } });
      }, { threshold: .5 });
      io2.observe(el);
    } else { el.classList.remove('outline'); }
  });

  /* ---------------- hero intro sequence (index only) ---------------- */
  const introEl = document.getElementById('heroIntro');
  const heroEl = document.querySelector('.hero');
  if(introEl && heroEl){
    const words = introEl.querySelectorAll('.hero-intro-word');
    const finish = ()=>{
      introEl.classList.add('done');
      heroEl.classList.add('on');
      document.body.style.overflow = '';
    };
    if(reduced){
      finish();
    } else {
      document.body.style.overflow = 'hidden';
      let step = 0;
      const advance = ()=>{
        words.forEach(w=>w.classList.remove('show'));
        if(step < words.length){
          words[step].classList.add('show');
          step++;
          setTimeout(advance, step === words.length ? 650 : 780);
        } else {
          finish();
        }
      };
      setTimeout(advance, 260);
      introEl.addEventListener('click', ()=>{ document.body.style.overflow=''; finish(); });
    }
  } else if(heroEl){
    heroEl.classList.add('on');
  }

  /* ---------------- Project hero v2: reveal + parallax + ken-burns (shared across all project pages) ---------------- */
  const ph = document.querySelector('.ph');
  if(ph){
    requestAnimationFrame(()=> ph.classList.add('on'));
    const phBgImg = ph.querySelector('.ph-bg img');
    if(phBgImg && !reduced){
      const onPhScroll = ()=>{
        const rect = ph.getBoundingClientRect();
        if(rect.bottom < 0 || rect.top > window.innerHeight) return;
        const shift = Math.max(0, -rect.top) * 0.18;
        phBgImg.style.transform = `translate3d(0, ${shift}px, 0)`;
      };
      document.addEventListener('scroll', onPhScroll, {passive:true});
      onPhScroll();
    }
  }

  /* ---------------- Site-wide lightbox ---------------- */
  const lbBox = document.getElementById('lightbox');
  if(lbBox){
    const lbImg = lbBox.querySelector('.lb-img');
    const lbBackdrop = lbBox.querySelector('.lb-backdrop');
    const lbClose = lbBox.querySelector('.lb-close');
    const lbPrev = lbBox.querySelector('.lb-prev');
    const lbNext = lbBox.querySelector('.lb-next');
    const lbCounter = lbBox.querySelector('.lb-counter');

    let lbGroup = [];
    let lbIndex = 0;
    let lbOrigin = null;

    function finalRect(w, h){
      const maxW = window.innerWidth * (window.innerWidth < 720 ? 0.92 : 0.86);
      const maxH = window.innerHeight * (window.innerWidth < 720 ? 0.78 : 0.84);
      const ratio = Math.min(maxW / w, maxH / h);
      const fw = w * ratio, fh = h * ratio;
      return { width: fw, height: fh, left: (window.innerWidth - fw) / 2, top: (window.innerHeight - fh) / 2 };
    }

    function setToFinal(src){
      const probe = new Image();
      const apply = (w, h) => {
        const fin = finalRect(w || 1600, h || 1000);
        lbImg.style.top = fin.top + 'px';
        lbImg.style.left = fin.left + 'px';
        lbImg.style.width = fin.width + 'px';
        lbImg.style.height = fin.height + 'px';
        lbImg.style.objectFit = 'contain';
      };
      probe.onload = () => apply(probe.naturalWidth, probe.naturalHeight);
      probe.onerror = () => apply(1600, 1000); // still center even if the image 404s
      probe.src = src;
      // safety net in case neither event fires quickly (odd caching edge cases)
      setTimeout(()=>{ if(!probe.complete){ apply(1600, 1000); } }, 500);
    }

    function updateChrome(){
      const multi = lbGroup.length > 1;
      lbPrev.style.display = multi ? 'flex' : 'none';
      lbNext.style.display = multi ? 'flex' : 'none';
      lbCounter.style.display = multi ? 'block' : 'none';
      lbCounter.textContent = (lbIndex + 1) + ' / ' + lbGroup.length;
    }

    function openLB(srcs, startIndex, triggerImgEl){
      lbGroup = srcs; lbIndex = startIndex;
      const rect = triggerImgEl.getBoundingClientRect();
      lbOrigin = rect;
      lbBox.classList.add('open');
      lbImg.style.transition = 'none';
      lbImg.style.top = rect.top + 'px';
      lbImg.style.left = rect.left + 'px';
      lbImg.style.width = rect.width + 'px';
      lbImg.style.height = rect.height + 'px';
      lbImg.style.objectFit = 'cover';
      lbImg.style.opacity = '1';
      lbImg.src = lbGroup[lbIndex];
      updateChrome();
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          lbBox.classList.add('show');
          lbImg.style.transition = '';
          if(!reduced){ setToFinal(lbGroup[lbIndex]); }
          else{
            lbImg.style.top='6vh'; lbImg.style.left='6vw'; lbImg.style.width='88vw'; lbImg.style.height='88vh'; lbImg.style.objectFit='contain';
          }
        });
      });
      document.body.style.overflow = 'hidden';
    }

    function closeLB(){
      lbBox.classList.remove('show');
      if(lbOrigin){
        lbImg.style.top = lbOrigin.top + 'px';
        lbImg.style.left = lbOrigin.left + 'px';
        lbImg.style.width = lbOrigin.width + 'px';
        lbImg.style.height = lbOrigin.height + 'px';
        lbImg.style.objectFit = 'cover';
      }
      setTimeout(()=>{ lbBox.classList.remove('open'); document.body.style.overflow = ''; }, 480);
    }

    function goLB(delta){
      if(lbGroup.length < 2) return;
      lbIndex = (lbIndex + delta + lbGroup.length) % lbGroup.length;
      lbImg.style.opacity = '0';
      setTimeout(()=>{
        lbImg.src = lbGroup[lbIndex];
        if(!reduced) setToFinal(lbGroup[lbIndex]);
        lbImg.style.opacity = '1';
        updateChrome();
      }, 190);
    }

    window.addEventListener('resize', ()=>{
      if(lbBox.classList.contains('show')) setToFinal(lbGroup[lbIndex]);
    });

    lbBackdrop.addEventListener('click', closeLB);
    lbClose.addEventListener('click', closeLB);
    lbPrev.addEventListener('click', ()=>goLB(-1));
    lbNext.addEventListener('click', ()=>goLB(1));
    document.addEventListener('keydown', (e)=>{
      if(!lbBox.classList.contains('open')) return;
      if(e.key === 'Escape') closeLB();
      if(e.key === 'ArrowLeft') goLB(-1);
      if(e.key === 'ArrowRight') goLB(1);
    });

    // wire every .lb-item on the page, grouped by data-lb-group
    const items = document.querySelectorAll('.lb-item');
    const groups = {};
    items.forEach((el, i)=>{
      const g = el.getAttribute('data-lb-group') || ('single-' + i);
      (groups[g] = groups[g] || []).push(el);
    });
    items.forEach((el)=>{
      el.addEventListener('click', (e)=>{
        e.preventDefault();
        const g = el.getAttribute('data-lb-group');
        const groupEls = g ? groups[g] : [el];
        const srcs = groupEls.map(x => x.getAttribute('data-lb-src') || x.querySelector('img').src);
        const idx = groupEls.indexOf(el);
        const triggerImg = el.querySelector('img');
        openLB(srcs, idx, triggerImg);
      });
    });

    window.__openLightbox = openLB; // exposed for carousel main-image clicks
  }

  /* ---------------- Carousel component (e.g. "Forging the Guide") — supports N images via a windowed 4-thumb pager ---------------- */
  document.querySelectorAll('.carousel').forEach((car)=>{
    const mainWrap = car.querySelector('.carousel-main');
    const mainImg = car.querySelector('.carousel-main-img');
    const thumbStrip = car.querySelector('.carousel-thumbs');
    const thumbs = [...car.querySelectorAll('.carousel-thumb')];
    if(!mainImg || !thumbs.length) return;

    let images;
    try{ images = JSON.parse(car.getAttribute('data-images') || '[]'); } catch(e){ images = []; }
    if(!images.length){
      // fall back to whatever the 4 static thumbs already point to
      images = thumbs.map(t => t.getAttribute('data-full') || t.querySelector('img').src);
    }

    const perPage = thumbs.length; // number of visible thumbnail slots (4)
    let activeIndex = 0;
    let windowStart = 0;

    function updateHighlight(){
      thumbs.forEach(t=>{
        const ri = parseInt(t.getAttribute('data-real-index'), 10);
        t.classList.toggle('active', ri === activeIndex);
      });
    }

    function paintWindow(start){
      thumbs.forEach((t, i)=>{
        const idx = start + i;
        const img = t.querySelector('img');
        if(idx < images.length){
          t.classList.remove('empty');
          img.src = images[idx];
          t.setAttribute('data-real-index', idx);
        } else {
          t.classList.add('empty');
        }
      });
      windowStart = start;
      updateHighlight();
    }

    function showWindow(start, animate){
      if(!animate){ paintWindow(start); return; }
      thumbStrip.classList.add('paging');
      setTimeout(()=>{
        paintWindow(start);
        requestAnimationFrame(()=> thumbStrip.classList.remove('paging'));
      }, 260);
    }

    function setActive(i, animateMain){
      activeIndex = (i + images.length) % images.length;
      const newStart = Math.floor(activeIndex / perPage) * perPage;
      if(newStart !== windowStart){ showWindow(newStart, true); }
      else { updateHighlight(); }

      if(animateMain){
        mainImg.classList.add('swap');
        setTimeout(()=>{ mainImg.src = images[activeIndex]; mainImg.classList.remove('swap'); }, 220);
      } else {
        mainImg.src = images[activeIndex];
      }
    }

    thumbs.forEach((t)=> t.addEventListener('click', ()=>{
      if(t.classList.contains('empty')) return;
      setActive(parseInt(t.getAttribute('data-real-index'), 10), true);
    }));

    const prevBtn = car.querySelector('.carousel-arrow.prev');
    const nextBtn = car.querySelector('.carousel-arrow.next');
    if(prevBtn) prevBtn.addEventListener('click', (e)=>{ e.stopPropagation(); setActive(activeIndex - 1, true); });
    if(nextBtn) nextBtn.addEventListener('click', (e)=>{ e.stopPropagation(); setActive(activeIndex + 1, true); });

    mainWrap.addEventListener('click', ()=>{
      if(window.__openLightbox) window.__openLightbox(images, activeIndex, mainImg);
    });

    paintWindow(0);
    mainImg.src = images[0];
  });


  /* ---------------- video modal ("Watch" buttons) ---------------- */
  const vmBox = document.getElementById('videoModal');
  if(vmBox){
    const vmVideo = vmBox.querySelector('video');
    const vmBackdrop = vmBox.querySelector('.vm-backdrop');
    const vmClose = vmBox.querySelector('.vm-close');

    function openVM(src){
      vmVideo.src = src;
      vmBox.classList.add('open');
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          vmBox.classList.add('show');
          vmVideo.play().catch(()=>{});
        });
      });
      document.body.style.overflow = 'hidden';
    }
    function closeVM(){
      vmBox.classList.remove('show');
      vmVideo.pause();
      setTimeout(()=>{ vmBox.classList.remove('open'); vmVideo.removeAttribute('src'); document.body.style.overflow=''; }, 420);
    }
    vmBackdrop.addEventListener('click', closeVM);
    vmClose.addEventListener('click', closeVM);
    document.addEventListener('keydown', (e)=>{ if(vmBox.classList.contains('open') && e.key === 'Escape') closeVM(); });
    document.querySelectorAll('[data-video-trigger]').forEach((btn)=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        openVM(btn.getAttribute('data-video-trigger'));
      });
    });
  }

  /* ---------------- CAPES character browser ---------------- */
  (function(){
    const grid = document.querySelector('.cast-grid');
    if(!grid) return;

    const DATA = {
      'alpha': {
        name: 'Operator Alpha', kicker: 'Main Character',
        brief: "Design a veteran field commander who immediately communicates experience, leadership, and resilience. Every element needed to balance military functionality with a believable superhero aesthetic.",
        visualDirection: "Operator Alpha's design balanced military realism with superhero storytelling. Functional gear, layered silhouettes, and subtle signs of experience created a character who feels equally capable leading a squad or standing on the front lines.",
        pieces: [
          { src:'assets/projects/capes/operator-alpha/imgi_3_image-asset.jpg', tall:true, label:'Operator Alpha', desc:"Operator Alpha is the pioneering result of a radical process that reshapes heroes through sacrifice. Born from the ashes of a dozen fallen supers, he emerges as the epitome of human potential, an unparalleled fusion of strength, resilience, and untapped power." },
          { src:'assets/projects/capes/operator-alpha/imgi_4_Operator+Alpha+Concept+Art+Full.png', label:'Asset Page', desc:"This page shows all of the character concept art beginnings, as well as the assets the animators used for in-game." },
          { src:'assets/projects/capes/operator-alpha/imgi_8_weapon+concepts.jpg', label:'Weapon Detail', desc:"A closer look at Alpha's sidearm, designed to feel functional and battle-worn." },
          { src:'assets/projects/capes/operator-alpha/imgi_5_IMG_0314.png', label:'Pose Exploration', desc:"Early pose studies exploring a commanding, battle-ready stance." },
          { src:'assets/projects/capes/operator-alpha/imgi_6_IMG_0332.png', label:'Animation Exploration', desc:"The animators wanted more information on how Alpha would grab his weapon." },
        ]
      },
      'cruxus': {
        name: 'Cruxus', kicker: 'Main Character',
        brief: "Design a hero with a tactical edge — strong, government-controlled, and practical — whose presence reads as both formidable and strategic.",
        visualDirection: "Cruxus balances rugged, battle-worn detail with an imposing silhouette. His red cape and layered armor reflect his role as a champion who's seen real cost, not just a symbol.",
        pieces: [
          { src:'assets/projects/capes/cruxus/imgi_2_IMG_0414.png', tall:true, label:'Cruxus', desc:"Cruxus, worn from constant battle in a fractured realm, shows the weight of his struggles. Amid the clash between heroes and government, his rugged appearance masks a steadfast commitment that still shines as a beacon of hope." },
          { src:'assets/projects/capes/cruxus/imgi_3_Cruxus+Concept+Art+Full.png', label:'Asset Breakdown', desc:"Cape, armor, and accessory pieces broken out for animation." },
          { src:'assets/projects/capes/cruxus/imgi_4_IMG_0397.png', label:'Pose Exploration', desc:"Studies exploring a strong, commanding stance that reads at a glance." },
        ]
      },
      'hyde': {
        name: 'Hyde', kicker: 'Main Character',
        brief: "Design a young genius who relies on intellect and technology rather than brute strength, with a visual language built around nanobot control.",
        visualDirection: "Hyde's design integrates cutting-edge tech elements — from his nanobot gloves to the deployment container on his back — reflecting his role as a brilliant, if cautious, scientist.",
        pieces: [
          { src:'assets/projects/capes/hyde/imgi_3_Hyde.png', tall:true, label:'Hyde', desc:"Hyde, a standout talent in augmentation, skyrocketed from high school to Superior Labs thanks to his remarkable ability to grasp complex ideas quickly. His groundbreaking work holds the potential for incredible power, but he's aware of the risks involved, especially in King City, where innovation often faces harsh consequences." },
          { src:'assets/projects/capes/hyde/imgi_4_Hyde+Concept+Art+Full.png', label:'Asset Breakdown', desc:"Turnaround and gear pieces used to keep Hyde consistent across every episode." },
          { src:'assets/projects/capes/hyde/imgi_6_IMG_0370.png', label:'Nanobot Gloves', desc:"A closer look at the gloves that let Hyde control his nanobot swarm." },
          { src:'assets/projects/capes/hyde/imgi_5_IMG_0364.png', label:'Pose Exploration', desc:"Studies exploring how the nanobots visually extend from Hyde's hands mid-use." },
        ]
      },
      'kinetic': {
        name: 'Kinetic', kicker: 'Main Character',
        brief: "Design a hero whose look is pieced together from what they've found, not what they've been given — resourcefulness as a visual language.",
        visualDirection: "Kinetic's wardrobe is a patchwork of street finds and salvaged gear, honoring their resilience and nonbinary identity while keeping every piece functional for their powers.",
        pieces: [
          { src:'assets/projects/capes/kinetic/imgi_3_Kinetic.png', tall:true, label:'Kinetic', desc:"Kinetic stands as a symbol of resilience in the face of adversity. Despite being low-income and homeless, this nonbinary individual uses their extraordinary powers to uplift and protect their community, pushing back against a world that often ignores their struggles." },
          { src:'assets/projects/capes/kinetic/imgi_4_Kinetic+Concept+Art+Full.png', label:'Asset Breakdown', desc:"Backpack, gloves, and gear pieces broken out for animation." },
          { src:'assets/projects/capes/kinetic/imgi_5_IMG_0479.png', label:'Outfit Exploration', desc:"Early passes at Kinetic's patchwork wardrobe of found gear." },
          { src:'assets/projects/capes/kinetic/imgi_6_IMG_0476.png', label:'Pose Exploration', desc:"Studies balancing Kinetic's powers with the weight of everything they carry." },
        ]
      },
      'seraph': {
        name: 'Seraph', kicker: 'Main Character',
        brief: "Design a former hero hiding in plain sight — someone whose civilian look still carries an undercurrent of readiness and command.",
        visualDirection: "Seraph's design mixes classic hero elements with tactical gear, landing on a bold, commanding silhouette that stays grounded in practical, wearable armor.",
        pieces: [
          { src:'assets/projects/capes/seraph/imgi_3_Seraph.png', tall:true, label:'Seraph', desc:"Seraph, once a leading force for justice, has retreated into civilian life under the looming shadow of the government. Despite the shift to a more ordinary existence, her resolve remains strong — she navigates her new world with the sharp awareness of someone who's always on edge." },
          { src:'assets/projects/capes/seraph/imgi_4_Seraph+Concept+Art+Full-1.png', label:'Asset Breakdown', desc:"Jacket, armor, and accessory pieces broken out for animation." },
          { src:'assets/projects/capes/seraph/imgi_6_IMG_0427.png', label:'Outfit Variations', desc:"Alternate costume passes mixing classic hero silhouettes with tactical gear." },
          { src:'assets/projects/capes/seraph/imgi_5_IMG_0425(1).png', label:'Pose Exploration', desc:"Studies aimed at a strong, grounded stance that reads as battle-ready." },
        ]
      },
      'enhanced-soldiers': {
        name: 'Enhanced Soldiers', kicker: 'Faction',
        brief: "Design a faction of government-engineered soldiers whose variations communicate different specializations and threat levels at a glance.",
        visualDirection: "From cybernetic fusion to the towering Brutes, each variation explores a different facet of enhancement — the invasive edge of the program, and the raw scale of what it can produce.",
        pieces: [
          { src:'assets/projects/capes/enhanced-soldiers/imgi_3_Enhanced+Soldiers+Concept+Art+Full.png', label:'Super Soldier Exploration', desc:"Super soldiers created by the government — variations balancing enhanced physique with tactical gear." },
          { src:'assets/projects/capes/enhanced-soldiers/imgi_5_Technology+Integration.png', label:'Cybernetic Fusion', desc:"Exploring the invasive side of the program, where machine and soldier blur." },
          { src:'assets/projects/capes/enhanced-soldiers/imgi_6_Brute+Variations+and+Scale.png', label:'The Brutes', desc:"A larger-scale variation built to read as an immediate physical threat." },
          { src:'assets/projects/capes/enhanced-soldiers/imgi_4_IMG_0498.png', label:'Soldier Variations', desc:"Various armor and material passes tested across the soldier lineup." },
        ]
      },
      'civilians': {
        name: 'Civilians', kicker: 'World Building',
        brief: "Populate the world of CAPES with civilians who feel specific and alive, not like generic background filler.",
        visualDirection: "Diverse, expressive poses and grounded body language give the civilian cast the same care as the hero roster, reinforcing that this world feels lived-in.",
        pieces: [
          { src:'assets/projects/capes/civilians/imgi_3_Civilian+Concept+Art.png', label:'Civilian Concept Sheet', desc:"A civilian concept sheet built to emphasize diversity and nuanced body language. We explored a range of ethnicities and captured subtle conversational cues, creating more immersive and relatable NPCs." },
        ]
      }
    };
    const ORDER = ['alpha','cruxus','hyde','kinetic','seraph','enhanced-soldiers','civilians'];

    const wrap = document.getElementById('castDetailWrap');
    const inner = document.getElementById('castDetailInner');
    const kickerEl = document.getElementById('castKicker');
    const nameEl = document.getElementById('castName');
    const descEl = document.getElementById('castDesc');
    const thumbsEl = document.getElementById('castThumbs');
    const mainWrap = document.getElementById('castMain');
    const mainImg = document.getElementById('castMainImg');
    const arrowPrev = document.getElementById('castArrowPrev');
    const arrowNext = document.getElementById('castArrowNext');
    const briefEl = document.getElementById('castBrief');
    const visualEl = document.getElementById('castVisual');
    const navPrevBtn = document.getElementById('castPrev');
    const navNextBtn = document.getElementById('castNext');
    const navPrevName = navPrevBtn.querySelector('.cast-nav-name');
    const navNextName = navNextBtn.querySelector('.cast-nav-name');

    let currentId = null;
    let pieceIndex = 0;

    function renderPiece(id, i, animate){
      const char = DATA[id];
      const piece = char.pieces[i];
      pieceIndex = i;
      thumbsEl.querySelectorAll('.carousel-thumb').forEach((t, ti)=> t.classList.toggle('active', ti === i));

      const setText = ()=>{
        kickerEl.textContent = i === 0 ? char.kicker : 'Collateral';
        nameEl.textContent = piece.label;
        descEl.textContent = piece.desc;
        mainImg.src = piece.src;
        mainImg.classList.remove('swap');
      };
      if(animate){
        mainImg.classList.add('swap');
        setTimeout(setText, 200);
      } else {
        setText();
      }
    }

    function buildThumbs(char){
      thumbsEl.innerHTML = '';
      char.pieces.forEach((p, i)=>{
        const b = document.createElement('button');
        b.className = 'carousel-thumb' + (i === 0 ? ' active' : '');
        b.innerHTML = '<img src="' + p.src + '" alt="' + p.label + '" onerror="this.style.opacity=\'0\'">';
        b.addEventListener('click', ()=> renderPiece(currentId, i, true));
        thumbsEl.appendChild(b);
      });
      const multi = char.pieces.length > 1;
      thumbsEl.style.display = multi ? 'flex' : 'none';
      arrowPrev.style.display = multi ? 'flex' : 'none';
      arrowNext.style.display = multi ? 'flex' : 'none';
    }

    function showCharacter(id, opts){
      opts = opts || {};
      const char = DATA[id];
      const idx = ORDER.indexOf(id);
      const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      const nextId = ORDER[(idx + 1) % ORDER.length];
      const wasOpen = wrap.classList.contains('open');
      const isSwitch = wasOpen && currentId && currentId !== id;

      const doUpdate = ()=>{
        currentId = id;
        briefEl.textContent = char.brief;
        visualEl.textContent = char.visualDirection;
        buildThumbs(char);
        renderPiece(id, 0, false);
        navPrevName.textContent = DATA[prevId].name;
        navNextName.textContent = DATA[nextId].name;
        grid.querySelectorAll('.cast-card').forEach((c)=> c.classList.toggle('active', c.getAttribute('data-char') === id));
        inner.classList.remove('switching');
      };

      if(isSwitch){
        inner.classList.add('switching');
        setTimeout(doUpdate, 190);
      } else {
        doUpdate();
      }

      if(!wasOpen) wrap.classList.add('open');

      if(opts.scroll !== false){
        setTimeout(()=>{ wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, wasOpen ? 0 : 150);
      }
    }

    grid.querySelectorAll('.cast-card').forEach((card)=>{
      card.addEventListener('click', ()=> showCharacter(card.getAttribute('data-char')));
    });

    navPrevBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx - 1 + ORDER.length) % ORDER.length], {scroll:false});
    });
    navNextBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx + 1) % ORDER.length], {scroll:false});
    });
    arrowPrev.addEventListener('click', (e)=>{
      e.stopPropagation();
      const char = DATA[currentId];
      renderPiece(currentId, (pieceIndex - 1 + char.pieces.length) % char.pieces.length, true);
    });
    arrowNext.addEventListener('click', (e)=>{
      e.stopPropagation();
      const char = DATA[currentId];
      renderPiece(currentId, (pieceIndex + 1) % char.pieces.length, true);
    });
    mainWrap.addEventListener('click', ()=>{
      const char = DATA[currentId];
      if(!char) return;
      const srcs = char.pieces.map((p)=> p.src);
      if(window.__openLightbox) window.__openLightbox(srcs, pieceIndex, mainImg);
    });
  })();

  /* ---------------- ETA concept browser (selector + main/thumb-stack detail) ---------------- */
  (function(){
    const grid = document.querySelector('.concept-grid');
    if(!grid) return;

    const DATA = {
      1: {
        name: 'Transactional Motion',
        visualDirection: "Inspired by The Creation of Adam, this concept transformed transaction into visual storytelling. Motion, contrast, and connection worked together to reinforce the campaign's central message.",
        pieces: ['assets/projects/eta-transact/imgi_6_2_ETATransACT_Concept+1-V1_FullBooth.png','assets/projects/eta-transact/imgi_7_3_ETATransACT_Concept+1-V1_ScanSourceSide_Assets.png','assets/projects/eta-transact/imgi_8_4_ETATransACT_Concept+1-V1_POSPSide_Assets.png']
      },
      2: {
        name: 'Perception Over Process',
        visualDirection: "This direction presents how the experience feels rather than how the system works. Angular, high-tech forms are softened by human-centered imagery, positioning the brand as premium and forward-thinking.",
        pieces: ['assets/projects/eta-transact/imgi_9_5_ETATransACT_Concept+2-V1_FullBooth.png','assets/projects/eta-transact/imgi_10_6_ETATransACT_Concept+2-V1_ScanSourceSide_Assets.png','assets/projects/eta-transact/imgi_11_7_ETATransACT_Concept+2-V1_POSPSide_Assets.png']
      },
      3: {
        name: 'Systems in Sync',
        visualDirection: "Glass-like layers and transparency merge system and experience into one language, weaving both brands throughout so they read as converging rather than competing.",
        pieces: ['assets/projects/eta-transact/imgi_12_8_ETATransACT_Concept+3-V1_FullBooth.png','assets/projects/eta-transact/imgi_13_9_ETATransACT_Concept+3-V1_ScanSourceSide_Assets.png','assets/projects/eta-transact/imgi_14_10_ETATransACT_Concept+3-V1_POSPSide_Assets.png']
      },
      4: {
        name: 'Familiar Ground',
        visualDirection: "This direction leans into familiarity and energy. Brighter color and a more open composition make the campaign approachable, pulling directly from established brand language to reinforce trust.",
        pieces: ['assets/projects/eta-transact/imgi_15_11_ETATransACT_Concept+4-V1_FullBooth.png','assets/projects/eta-transact/imgi_16_12_ETATransACT_Concept+4-V1_ScanSourceSide_Assets.png','assets/projects/eta-transact/imgi_17_13_ETATransACT_Concept+4-V1_POSPSide_Assets.png']
      }
    };
    const ORDER = [1,2,3,4];

    const wrap = document.getElementById('conceptDetailWrap');
    const inner = document.getElementById('conceptDetailInner');
    const nameEl = document.getElementById('conceptName');
    const vdEl = document.getElementById('conceptVD');
    const thumbsEl = document.getElementById('conceptThumbs');
    const mainWrap = document.getElementById('conceptMain');
    const mainImg = document.getElementById('conceptMainImg');
    const navPrevBtn = document.getElementById('conceptPrev');
    const navNextBtn = document.getElementById('conceptNext');
    const navPrevName = navPrevBtn.querySelector('.concept-nav-name');
    const navNextName = navNextBtn.querySelector('.concept-nav-name');

    let currentId = null;
    let pieceIndex = 0;

    function setImage(idx, animate){
      const concept = DATA[currentId];
      pieceIndex = idx;
      thumbsEl.querySelectorAll('.carousel-thumb').forEach((t, ti)=> t.classList.toggle('active', ti === idx));
      const apply = ()=>{ mainImg.src = concept.pieces[idx]; mainImg.classList.remove('swap'); };
      if(animate){ mainImg.classList.add('swap'); setTimeout(apply, 200); } else { apply(); }
    }

    function buildThumbs(concept){
      thumbsEl.innerHTML = '';
      concept.pieces.forEach((src, i)=>{
        const b = document.createElement('button');
        b.className = 'carousel-thumb' + (i === 0 ? ' active' : '');
        b.innerHTML = '<img src="' + src + '" alt="Concept collateral" onerror="this.style.opacity=\'0\'">';
        b.addEventListener('click', ()=> setImage(i, true));
        thumbsEl.appendChild(b);
      });
    }

    function showConcept(id, opts){
      opts = opts || {};
      const concept = DATA[id];
      const idx = ORDER.indexOf(id);
      const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      const nextId = ORDER[(idx + 1) % ORDER.length];
      const wasOpen = wrap.classList.contains('open');
      const isSwitch = wasOpen && currentId && currentId !== id;

      const doUpdate = ()=>{
        currentId = id;
        nameEl.textContent = concept.name;
        vdEl.textContent = concept.visualDirection;
        buildThumbs(concept);
        setImage(0, false);
        navPrevName.textContent = 'Concept ' + prevId;
        navNextName.textContent = 'Concept ' + nextId;
        grid.querySelectorAll('.concept-card').forEach((c)=> c.classList.toggle('active', c.getAttribute('data-concept') == id));
        inner.classList.remove('switching');
      };

      if(isSwitch){ inner.classList.add('switching'); setTimeout(doUpdate, 190); } else { doUpdate(); }
      if(!wasOpen) wrap.classList.add('open');
      if(opts.scroll !== false){
        setTimeout(()=>{ wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, wasOpen ? 0 : 150);
      }
    }

    grid.querySelectorAll('.concept-card').forEach((card)=>{
      card.addEventListener('click', ()=> showConcept(parseInt(card.getAttribute('data-concept'), 10)));
    });
    navPrevBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showConcept(ORDER[(idx - 1 + ORDER.length) % ORDER.length], {scroll:false});
    });
    navNextBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showConcept(ORDER[(idx + 1) % ORDER.length], {scroll:false});
    });
    mainWrap.addEventListener('click', ()=>{
      const concept = DATA[currentId];
      if(!concept) return;
      if(window.__openLightbox) window.__openLightbox(concept.pieces, pieceIndex, mainImg);
    });
  })();

  /* ---------------- Filmstrip: windowed image pager (Looping Booth Graphics / Showtime, etc.) ---------------- */
  document.querySelectorAll('.filmstrip').forEach((strip)=>{
    const items = [...strip.querySelectorAll('.filmstrip-item')];
    const track = strip.querySelector('.filmstrip-track');
    if(!items.length || !track) return;

    let images;
    try{ images = JSON.parse(strip.getAttribute('data-images') || '[]'); } catch(e){ images = []; }
    if(!images.length) images = items.map((it)=> it.querySelector('img').getAttribute('src') || '');

    const perPage = items.length;
    const totalPages = Math.max(1, Math.ceil(images.length / perPage));
    let page = 0;

    function paint(animate){
      const doPaint = ()=>{
        const start = page * perPage;
        items.forEach((it, i)=>{
          const idx = start + i;
          const img = it.querySelector('img');
          if(idx < images.length){
            it.classList.remove('empty');
            img.src = images[idx];
            it.setAttribute('data-real-index', idx);
          } else {
            it.classList.add('empty');
          }
        });
      };
      if(animate){
        track.classList.add('paging');
        setTimeout(()=>{ doPaint(); requestAnimationFrame(()=> track.classList.remove('paging')); }, 260);
      } else { doPaint(); }
    }

    const prevBtn = strip.querySelector('.filmstrip-arrow.prev');
    const nextBtn = strip.querySelector('.filmstrip-arrow.next');
    if(totalPages <= 1){
      if(prevBtn) prevBtn.style.display = 'none';
      if(nextBtn) nextBtn.style.display = 'none';
    }
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ page = (page - 1 + totalPages) % totalPages; paint(true); });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ page = (page + 1) % totalPages; paint(true); });

    items.forEach((it)=>{
      it.addEventListener('click', ()=>{
        if(it.classList.contains('empty')) return;
        const idx = parseInt(it.getAttribute('data-real-index'), 10);
        const imgEl = it.querySelector('img');
        if(window.__openLightbox) window.__openLightbox(images, idx, imgEl);
      });
    });

    paint(false);
  });

  /* ---------------- before/after drag slider ---------------- */
  document.querySelectorAll('.ba-slider').forEach((slider)=>{
    const frame = slider.querySelector('.ba-slider-frame');
    const before = slider.querySelector('.ba-slider-before');
    const handle = slider.querySelector('.ba-slider-handle');
    const labelAfter = slider.querySelector('.ba-label-after');
    const labelBefore = slider.querySelector('.ba-label-before');
    if(!frame || !before || !handle) return;
    let dragging = false;

    function setPos(percent){
      percent = Math.max(0, Math.min(100, percent));
      before.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
      handle.style.left = percent + '%';
      if(labelBefore) labelBefore.style.opacity = percent > 14 ? '1' : '0';
      if(labelAfter) labelAfter.style.opacity = percent < 86 ? '1' : '0';
    }
    function posFromEvent(e){
      const rect = frame.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }
    function onDown(e){
      dragging = true;
      slider.classList.add('dragging');
      setPos(posFromEvent(e));
      e.preventDefault();
    }
    function onMove(e){
      if(!dragging) return;
      if(e.touches) e.preventDefault();
      setPos(posFromEvent(e));
    }
    function onUp(){
      dragging = false;
      slider.classList.remove('dragging');
    }

    frame.addEventListener('mousedown', onDown);
    frame.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    setPos(50);
  });

  /* ---------------- Sketchbook: wheel-to-horizontal scroll + automatic masonry ---------------- */
  (function(){
    const viewport = document.querySelector('.sb-gallery-viewport');
    if(!viewport) return;

    // translate vertical wheel input into horizontal scroll, so the page never needs to scroll down
    viewport.addEventListener('wheel', (e)=>{
      if(Math.abs(e.deltaY) >= Math.abs(e.deltaX)){
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
      }
    }, {passive:false});

    // cell size scales with how many images exist: few images fill more of the screen
    // (fewer, taller rows), many images shrink down to fit more at once (more, shorter rows).
    // rows are set as fractions (1fr) so they always exactly fill the available height —
    // this can never clip a row, unlike sizing rows in measured pixels.
    const track = document.querySelector('.sb-track');
    let currentRows = 3;
    function updateGallerySize(){
      if(!track) return;
      const items = track.querySelectorAll('.sb-item').length || 1;
      const isMobile = window.innerWidth <= 760;
      if(isMobile){ currentRows = items <= 4 ? 1 : items <= 8 ? 2 : 3; }
      else { currentRows = items <= 4 ? 2 : items <= 10 ? 3 : 4; }
      track.style.setProperty('--sb-rows', currentRows);

      // always start scrolled to the true beginning, and never center — this gallery
      // should read as left-aligned whether it fills the screen or overflows it.
      requestAnimationFrame(()=>{
        viewport.scrollLeft = 0;
      });
    }
    updateGallerySize();
    window.addEventListener('resize', updateGallerySize);

    // every image is sized automatically based on its own real aspect ratio — no manual placement needed.
    // portrait-leaning images get a taller cell (spanning 2 grid rows); everything else gets 1.
    // span is capped to the current row count so it can never exceed the grid on very small galleries.
    document.querySelectorAll('.sb-item img').forEach((img)=>{
      const assign = ()=>{
        if(!img.naturalWidth) return;
        const wantsTall = img.naturalHeight / img.naturalWidth > 1.15;
        const span = wantsTall ? Math.min(2, currentRows) : 1;
        img.closest('.sb-item').style.gridRow = 'span ' + span;
      };
      if(img.complete) assign(); else img.addEventListener('load', assign);
    });

    // right-edge fade fades out once you've scrolled to the end; swipe hint dismisses after first interaction
    const fadeRight = document.querySelector('.sb-fade-right');
    const swipeHint = document.querySelector('.sb-swipe-hint');
    function updateFade(){
      if(!fadeRight) return;
      const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
      fadeRight.style.opacity = atEnd ? '0' : '1';
    }
    viewport.addEventListener('scroll', ()=>{
      updateFade();
      if(swipeHint && viewport.scrollLeft > 12) swipeHint.style.opacity = '0';
    });
    window.addEventListener('resize', updateFade);
    updateFade();
  })();

  /* ---------------- Daughters of Steel character browser ---------------- */
  (function(){
    const grid = document.querySelector('.dos-grid');
    if(!grid) return;

    const DATA = {
      1: {
        name: 'EVELYN',
        description: "Evelyn embodies the heart of Daughters of Steel: resilient, resourceful, and relentlessly optimistic. Her layered attire reflects a life of constant travel and survival, while every expression hints at a young woman learning to carry responsibilities far greater than herself.",
        pieces: [
          { src:'assets/projects/daughters-of-steel/imgi_3_Fantasy_Medieval+Women_Woman+1_Full.png', label:'Reference Sheet' },
          { src:'assets/projects/daughters-of-steel/imgi_4_Extra+Instagram+Comps_1.png', label:'Finished Piece' },
          { src:'assets/projects/daughters-of-steel/imgi_5_Extra+Instagram+Comps_2.png', label:'Sketch Process' },
          { src:'assets/projects/daughters-of-steel/imgi_6_Extra+Instagram+Comps_3.png', label:'Color & Shading Process' },
        ]
      },
      2: {
        name: 'ROWENNA',
        description: "Rowenna personifies resilience through restraint. Her layered armor, practical gear, and composed demeanor reflect a fighter who values preparation over bravado, balancing protection, mobility, and purpose in every element of her design.",
        pieces: [
          { src:'assets/projects/daughters-of-steel/imgi_7_Fantasy_Medieval+Women_Woman+2_Full.png', label:'Reference Sheet' },
          { src:'assets/projects/daughters-of-steel/imgi_8_W2_Extra+Instagram+Comps_1.png', label:'Finished Piece' },
          { src:'assets/projects/daughters-of-steel/imgi_9_W2_Extra+Instagram+Comps_2.png', label:'Sketch Process' },
          { src:'assets/projects/daughters-of-steel/imgi_10_W2_Extra+Instagram+Comps_3.png', label:'Color & Shading Process' },
        ]
      },
      3: {
        name: 'SERELITH',
        description: "Serelith embodies quiet resilience. Her design contrasts refined silhouettes with functional armor, reflecting a warrior who leads through patience, empathy, and unwavering conviction rather than brute strength.",
        pieces: [
          { src:'assets/projects/daughters-of-steel/imgi_11_W3_Extra+Instagram+Comps_1_Main.png', label:'Reference Sheet' },
          { src:'assets/projects/daughters-of-steel/imgi_12_W3_Extra+Instagram+Comps_1.png', label:'Finished Piece' },
          { src:'assets/projects/daughters-of-steel/imgi_13_W3_Extra+Instagram+Comps_2.png', label:'Sketch Process' },
          { src:'assets/projects/daughters-of-steel/imgi_14_W3_Extra+Instagram+Comps_3.png', label:'Color & Shading Process' },
        ]
      }
    };
    const ORDER = [1,2,3];

    const wrap = document.getElementById('dosDetailWrap');
    const inner = document.getElementById('dosDetailInner');
    const nameEl = document.getElementById('dosName');
    const descEl = document.getElementById('dosDesc');
    const thumbsEl = document.getElementById('dosThumbs');
    const mainWrap = document.getElementById('dosMain');
    const mainImg = document.getElementById('dosMainImg');
    const navPrevBtn = document.getElementById('dosPrev');
    const navNextBtn = document.getElementById('dosNext');
    const navPrevName = navPrevBtn.querySelector('.cast-nav-name');
    const navNextName = navNextBtn.querySelector('.cast-nav-name');

    let currentId = null;
    let pieceIndex = 0;

    function setImage(idx, animate){
      const char = DATA[currentId];
      pieceIndex = idx;
      thumbsEl.querySelectorAll('.carousel-thumb').forEach((t, ti)=> t.classList.toggle('active', ti === idx));
      const apply = ()=>{ mainImg.src = char.pieces[idx].src; mainImg.classList.remove('swap'); };
      if(animate){ mainImg.classList.add('swap'); setTimeout(apply, 200); } else { apply(); }
    }

    function buildThumbs(char){
      thumbsEl.innerHTML = '';
      char.pieces.forEach((p, i)=>{
        const b = document.createElement('button');
        b.className = 'carousel-thumb' + (i === 0 ? ' active' : '');
        b.innerHTML = '<img src="' + p.src + '" alt="' + p.label + '" onerror="this.style.opacity=\'0\'">';
        b.addEventListener('click', ()=> setImage(i, true));
        thumbsEl.appendChild(b);
      });
    }

    function showCharacter(id, opts){
      opts = opts || {};
      const char = DATA[id];
      const idx = ORDER.indexOf(id);
      const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      const nextId = ORDER[(idx + 1) % ORDER.length];
      const wasOpen = wrap.classList.contains('open');
      const isSwitch = wasOpen && currentId && currentId !== id;

      const doUpdate = ()=>{
        currentId = id;
        nameEl.textContent = char.name;
        descEl.textContent = char.description;
        buildThumbs(char);
        setImage(0, false);
        navPrevName.textContent = DATA[prevId].name;
        navNextName.textContent = DATA[nextId].name;
        grid.querySelectorAll('.dos-card').forEach((c)=> c.classList.toggle('active', c.getAttribute('data-char') == id));
        inner.classList.remove('switching');
      };

      if(isSwitch){ inner.classList.add('switching'); setTimeout(doUpdate, 190); } else { doUpdate(); }
      if(!wasOpen) wrap.classList.add('open');
      if(opts.scroll !== false){
        setTimeout(()=>{ wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, wasOpen ? 0 : 150);
      }
    }

    grid.querySelectorAll('.dos-card').forEach((card)=>{
      card.addEventListener('click', ()=> showCharacter(parseInt(card.getAttribute('data-char'), 10)));
    });
    navPrevBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx - 1 + ORDER.length) % ORDER.length], {scroll:false});
    });
    navNextBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx + 1) % ORDER.length], {scroll:false});
    });
    mainWrap.addEventListener('click', ()=>{
      const char = DATA[currentId];
      if(!char) return;
      const srcs = char.pieces.map((p)=> p.src);
      if(window.__openLightbox) window.__openLightbox(srcs, pieceIndex, mainImg);
    });
  })();

  /* ---------------- Neutronic Nonsense character browser ---------------- */
  (function(){
    const grid = document.querySelector('.nn-grid');
    if(!grid) return;

    const DATA = {
      1: {
        name: 'The Exec',
        description: "The Exec is the no-nonsense figure trying to bring some semblance of order to the chaos that is Neutronics Corp. Armed with a tablet full of reports and a mind full of corporate jargon, she's all about efficiency, deadlines, and hitting impossible quarterly goals — whether or not the reactor is actively melting down in the background.",
        pieces: [
          { src:'assets/projects/neutronic-nonsense/imgi_4_Neutronic+Nonsense_The+Exec.jpg', label:'Main Pose', ratio:'1/1' },
          { src:'assets/projects/neutronic-nonsense/TheExec_CharacterSheet.png', label:'Character Sheet', ratio:'16/9' },
        ]
      },
      2: {
        name: 'The Top Hand',
        description: "The Top Hand is the real backbone of the workforce — steady, competent, and respected by everyone on the floor. He's the go-to guy when things go wrong, which is often, and while he's technically under The Gaffer, it's clear who's actually holding things together. He doesn't crave power; he finds purpose in being the one everyone can rely on, keeping things running amid the constant chaos.",
        pieces: [
          { src:'assets/projects/neutronic-nonsense/imgi_5_Neutronic+Nonsense_The+Top+Hand.jpg', label:'Main Pose', ratio:'1/1' },
          { src:'assets/projects/neutronic-nonsense/TheTopHand_CharacterSheet.png', label:'Character Sheet', ratio:'16/9' },
        ]
      },
      3: {
        name: 'The Pusher',
        description: "The Pusher landed his spot through connections, not skill. He's the son of a bigwig upstairs, so despite being clueless, he's in a position of authority — constantly giving misguided orders and saved time and again by The Top Hand. People follow him out of obligation, knowing exactly whose son he is, but everyone sees through the bluster: a boss in title only.",
        pieces: [
          { src:'assets/projects/neutronic-nonsense/imgi_6_Neutronic+Nonsense_The+Pusher.jpg', label:'Main Pose', ratio:'1/1' },
          { src:'assets/projects/neutronic-nonsense/ThePusher_CharacterSheet.png', label:'Character Sheet', ratio:'16/9' },
        ]
      },
      4: {
        name: 'The Gaffer',
        description: "The Gaffer is the archetypal old-school boss, set in his ways as second-in-command under The Exec. He wields his authority more from habit than genuine leadership, commanding respect through fear rather than admiration — especially in his ongoing friction with The Top Hand, who remains unfazed by it. A relic of outdated methods, he resents anyone who questions his established norms.",
        pieces: [
          { src:'assets/projects/neutronic-nonsense/imgi_7_Neutronic+Nonsense_The+Gaffer.jpg', label:'Main Pose', ratio:'1/1' },
          { src:'assets/projects/neutronic-nonsense/gaffer-sheet.jpg', label:'Character Sheet', ratio:'16/9' },
        ]
      },
      5: {
        name: 'The Nuclear Nomad',
        description: "The Nuclear Nomad is a seasoned specialist who drifts from reactor to reactor, brought in to clean up disasters or refurbish cores when things go south. She's distant — not from coldness, but because she's always moving and never sure how long she'll stay. Not part of the main crew, she's vital when things get critical, quietly carrying the weight of never truly belonging anywhere.",
        pieces: [
          { src:'assets/projects/neutronic-nonsense/imgi_8_Neutronic+Nonsense_The+Nuclear+Nomad.jpg', label:'Main Pose', ratio:'1/1' },
          { src:'assets/projects/neutronic-nonsense/TheNuclearNomad_CharacterSheet.png', label:'Character Sheet', ratio:'16/9' },
        ]
      }
    };
    const ORDER = [1,2,3,4,5];

    const wrap = document.getElementById('nnDetailWrap');
    const inner = document.getElementById('nnDetailInner');
    const nameEl = document.getElementById('nnName');
    const descEl = document.getElementById('nnDesc');
    const thumbsEl = document.getElementById('nnThumbs');
    const mainWrap = document.getElementById('nnMain');
    const mainImg = document.getElementById('nnMainImg');
    const navPrevBtn = document.getElementById('nnPrev');
    const navNextBtn = document.getElementById('nnNext');
    const navPrevName = navPrevBtn.querySelector('.cast-nav-name');
    const navNextName = navNextBtn.querySelector('.cast-nav-name');

    let currentId = null;
    let pieceIndex = 0;

    function setImage(idx, animate){
      const char = DATA[currentId];
      const piece = char.pieces[idx];
      pieceIndex = idx;
      thumbsEl.querySelectorAll('.carousel-thumb').forEach((t, ti)=> t.classList.toggle('active', ti === idx));
      const apply = ()=>{
        mainImg.src = piece.src;
        mainImg.classList.remove('swap');
        mainWrap.style.aspectRatio = piece.ratio;
      };
      if(animate){ mainImg.classList.add('swap'); setTimeout(apply, 200); } else { apply(); }
    }

    function buildThumbs(char){
      thumbsEl.innerHTML = '';
      char.pieces.forEach((p, i)=>{
        const b = document.createElement('button');
        b.className = 'carousel-thumb' + (i === 0 ? ' active' : '');
        b.innerHTML = '<img src="' + p.src + '" alt="' + p.label + '" onerror="this.style.opacity=\'0\'">';
        b.addEventListener('click', ()=> setImage(i, true));
        thumbsEl.appendChild(b);
      });
    }

    function showCharacter(id, opts){
      opts = opts || {};
      const char = DATA[id];
      const idx = ORDER.indexOf(id);
      const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      const nextId = ORDER[(idx + 1) % ORDER.length];
      const wasOpen = wrap.classList.contains('open');
      const isSwitch = wasOpen && currentId && currentId !== id;

      const doUpdate = ()=>{
        currentId = id;
        nameEl.textContent = char.name;
        descEl.textContent = char.description;
        buildThumbs(char);
        setImage(0, false);
        navPrevName.textContent = DATA[prevId].name;
        navNextName.textContent = DATA[nextId].name;
        grid.querySelectorAll('.nn-card').forEach((c)=> c.classList.toggle('active', c.getAttribute('data-char') == id));
        inner.classList.remove('switching');
      };

      if(isSwitch){ inner.classList.add('switching'); setTimeout(doUpdate, 190); } else { doUpdate(); }
      if(!wasOpen) wrap.classList.add('open');
      if(opts.scroll !== false){
        setTimeout(()=>{ wrap.scrollIntoView({behavior:'smooth', block:'start'}); }, wasOpen ? 0 : 150);
      }
    }

    grid.querySelectorAll('.nn-card').forEach((card)=>{
      card.addEventListener('click', ()=> showCharacter(parseInt(card.getAttribute('data-char'), 10)));
    });
    navPrevBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx - 1 + ORDER.length) % ORDER.length], {scroll:false});
    });
    navNextBtn.addEventListener('click', ()=>{
      const idx = ORDER.indexOf(currentId);
      showCharacter(ORDER[(idx + 1) % ORDER.length], {scroll:false});
    });
    mainWrap.addEventListener('click', ()=>{
      const char = DATA[currentId];
      if(!char) return;
      const srcs = char.pieces.map((p)=> p.src);
      if(window.__openLightbox) window.__openLightbox(srcs, pieceIndex, mainImg);
    });
  })();

  const filterBar = document.querySelector('.filters');
  if(filterBar){
    const btns = filterBar.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.work-card');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.getAttribute('data-filter');
        cards.forEach(c=>{
          const show = f === 'all' || c.getAttribute('data-tags').includes(f);
          c.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------------- word-cycle: "some ideas need... EVERYTHING" ----------------
     Slot-machine style: words swap fast at first, then decelerate, then settle
     permanently on the final word (styled distinctly via .final). Plays once,
     triggered the first time the stage scrolls into view.                        */
  const stage = document.getElementById('cycleStage');
  if(stage){
    const words = JSON.parse(stage.getAttribute('data-words') || '[]');
    const finalWord = stage.getAttribute('data-final') || (words[words.length-1] || '');
    let played = false;

    function runCycle(){
      if(played) return;
      played = true;

      if(reduced){
        const span = document.createElement('span');
        span.className = 'cycle-word final';
        span.style.opacity = '1';
        span.style.position = 'static';
        span.textContent = finalWord;
        stage.innerHTML = '';
        stage.appendChild(span);
        return;
      }

      let i = 0;
      // deceleration curve: fast at first, slows toward the landing word
      const delays = [70,70,80,90,100,120,150,190,240,320];
      const showWord = (text, isFinal)=>{
        stage.querySelectorAll('.cycle-word').forEach(n=>n.remove());
        const span = document.createElement('span');
        span.className = 'cycle-word' + (isFinal ? ' final' : '');
        span.textContent = text;
        span.style.transition = 'opacity .12s linear, transform .12s ' + (isFinal ? 'cubic-bezier(.34,1.56,.64,1)' : 'linear');
        span.style.transform = isFinal ? 'scale(.92)' : 'translateY(4px)';
        stage.appendChild(span);
        requestAnimationFrame(()=>{
          span.style.opacity = '1';
          span.style.transform = isFinal ? 'scale(1)' : 'translateY(0)';
        });
      };

      const pool = words.slice(0, -1); // every word except the final landing word
      const step = ()=>{
        const isLast = i >= delays.length;
        if(isLast){
          showWord(finalWord, true);
          return;
        }
        const word = pool[i % pool.length];
        showWord(word, false);
        i++;
        setTimeout(step, delays[i-1]);
      };
      step();
    }

    if('IntersectionObserver' in window){
      const io4 = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{ if(en.isIntersecting){ runCycle(); io4.unobserve(en.target); } });
      }, { threshold: .6 });
      io4.observe(stage);
    } else {
      runCycle();
    }
  }
})();
