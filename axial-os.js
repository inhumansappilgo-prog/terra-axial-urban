// Terra Axial // Urbanos // AXIAL OS experimental layer
// Roda apenas no site externo carregado pelo iframe.
(function(){
  const root = document.documentElement;
  root.classList.add('axial-os');
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const packages = $$('.package-block');
  const links = $$('.left-summary-link');
  let currentFilter = 'all';

  const normalize = text => (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  function toast(message){
    let el = $('.os-toast');
    if(!el){ el = document.createElement('div'); el.className = 'os-toast'; document.body.appendChild(el); }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-visible'), 1800);
  }

  function boot(){
    const el = document.createElement('div');
    el.className = 'os-boot';
    el.innerHTML = `<div class="os-boot-card" role="status" aria-live="polite">
      <div class="os-boot-kicker">Terra Axial // Sistema externo habilitado</div>
      <div class="os-boot-title">AXIAL OS</div>
      <div class="os-boot-sub">Indexando ${packages.length} registros urbanos, imagens, níveis e protocolos HAMMER...</div>
      <div class="os-boot-bar"><i></i></div>
    </div>`;
    document.body.appendChild(el);
    window.addEventListener('load', () => setTimeout(() => el.classList.add('is-hidden'), 650));
  }

  function progress(){
    const bar = document.createElement('div');
    bar.className = 'os-progress';
    document.body.appendChild(bar);
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.width = ((scrollY / max) * 100).toFixed(2) + '%';
    };
    addEventListener('scroll', update, {passive:true});
    addEventListener('resize', update);
    update();
  }

  function classify(pkg){
    const tag = normalize(($('.pkg-header-tags', pkg)||{}).textContent || '');
    if(tag.includes('vaga unica')) return 'vaga';
    if(tag.includes('form/merc')) return 'formmerc';
    if(tag.includes('formulario') || tag.includes('form')) return 'form';
    if(tag.includes('livre')) return 'livre';
    return 'outro';
  }

  function commandCenter(){
    packages.forEach(pkg => {
      pkg.dataset.kind = classify(pkg);
      pkg.dataset.search = normalize(pkg.textContent);
    });
    const command = document.createElement('section');
    command.className = 'os-command';
    command.innerHTML = `<div class="os-search-wrap"><input id="os-search" type="search" placeholder="Buscar pacote, poder, classe, preço ou protocolo..." autocomplete="off" aria-label="Buscar pacotes urbanos"></div>
      <button type="button" data-filter="all" class="is-active">Todos</button>
      <button type="button" data-filter="livre">Livre</button>
      <button type="button" data-filter="formmerc">Form/Merc</button>
      <button type="button" data-filter="form">Formulário</button>
      <button type="button" data-filter="vaga">Vaga Única</button>
      <button type="button" class="os-extra" id="os-compact">Modo Leitura</button>
      <div class="os-count"><span id="os-count">${packages.length}</span> / ${packages.length} ativos</div>`;
    const anchor = $('.control-panel') || $('.hero-pacotes') || $('header');
    anchor.insertAdjacentElement('afterend', command);
    const empty = document.createElement('div');
    empty.className = 'os-empty';
    empty.textContent = 'Nenhum registro encontrado no índice urbano.';
    $('.packages-list').prepend(empty);

    const input = $('#os-search');
    const count = $('#os-count');
    const filterButtons = $$('[data-filter]', command);
    function apply(){
      const q = normalize(input.value.trim());
      let visible = 0;
      packages.forEach(pkg => {
        const matchSearch = !q || pkg.dataset.search.includes(q);
        const matchFilter = currentFilter === 'all' || pkg.dataset.kind === currentFilter;
        const show = matchSearch && matchFilter;
        pkg.classList.toggle('is-hidden', !show);
        if(show) visible++;
      });
      count.textContent = visible;
      empty.classList.toggle('is-visible', visible === 0);
    }
    input.addEventListener('input', apply);
    filterButtons.forEach(btn => btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.toggle('is-active', b === btn));
      apply();
      toast('Filtro aplicado: ' + btn.textContent.trim());
    }));
    $('#os-compact').addEventListener('click', e => {
      root.classList.toggle('os-compact');
      e.currentTarget.classList.toggle('is-active', root.classList.contains('os-compact'));
      toast(root.classList.contains('os-compact') ? 'Modo leitura compacta ativado' : 'Modo leitura completa ativado');
    });
    addEventListener('keydown', e => {
      if(e.key === '/' && document.activeElement !== input){ e.preventDefault(); input.focus(); }
      if(e.key === 'Escape' && document.activeElement === input){ input.value=''; input.blur(); apply(); }
    });
    apply();
  }

  function reveal(){
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, {threshold:.08, rootMargin:'0px 0px -8% 0px'});
    packages.forEach(pkg => io.observe(pkg));
  }

  function activeTracker(){
    const card = document.createElement('div');
    card.className = 'os-active-card';
    card.innerHTML = `<span>Registro ativo</span><strong>Urbanos</strong>`;
    const dock = document.createElement('div');
    dock.className = 'os-dock';
    dock.innerHTML = `<button type="button" id="os-top" title="Voltar ao topo">↑</button>`;
    dock.prepend(card);
    document.body.appendChild(dock);
    $('#os-top').addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

    const map = new Map(links.map(link => [link.getAttribute('href'), link]));
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if(!visible) return;
      const id = '#' + visible.target.id;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
      packages.forEach(p => p.classList.toggle('is-active-package', p === visible.target));
      const title = $('.pkg-title', visible.target)?.textContent?.trim() || 'Urbanos';
      const reg = $('.widget-value', visible.target)?.textContent?.trim() || 'HAM-URB-INDEX';
      card.innerHTML = `<span>${reg}</span><strong>${title}</strong>`;
    }, {threshold:.24, rootMargin:'-15% 0px -55% 0px'});
    packages.forEach(pkg => io.observe(pkg));
  }

  function cardTilt(){
    packages.forEach(pkg => {
      const card = $('.dynamic-card', pkg);
      if(!card) return;
      pkg.addEventListener('pointermove', e => {
        const r = pkg.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        pkg.style.setProperty('--mx', x + '%');
        pkg.style.setProperty('--my', y + '%');
        const dx = (x - 50) / 22;
        const dy = (50 - y) / 28;
        card.style.transform = `rotateY(${dx}deg) rotateX(${dy}deg) translateY(-4px)`;
      });
      pkg.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  function levelPulse(){
    $$('.lvl-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        const section = radio.closest('.leveling-section');
        if(!section) return;
        section.classList.remove('is-switching');
        void section.offsetWidth;
        section.classList.add('is-switching');
      });
    });
  }

  function externalLinks(){
    $$('a[href^="http"]').forEach(a => {
      if(!a.href.includes(location.host)) a.setAttribute('target', '_top');
    });
  }

  boot();
  progress();
  commandCenter();
  reveal();
  activeTracker();
  cardTilt();
  levelPulse();
  externalLinks();
})();
