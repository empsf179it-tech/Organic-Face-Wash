document.addEventListener("DOMContentLoaded",()=>{
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".section,.page-hero").forEach(el=>el.classList.add("motion-section"));
  const revealEls=[...document.querySelectorAll(".reveal,.stagger,.motion-section")];
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show","is-visible");}}),{threshold:.10,rootMargin:"0px 0px -6% 0px"});
  revealEls.forEach(el=>io.observe(el));

  const menu=document.querySelector(".menu"),links=document.querySelector(".links");
  if(menu&&links) menu.addEventListener("click",()=>{links.classList.toggle("open");menu.classList.toggle("is-open")});

  if(!reduced){
    addEventListener("pointermove",e=>{document.body.style.setProperty("--mx",e.clientX+"px");document.body.style.setProperty("--my",e.clientY+"px")},{passive:true});
    document.querySelectorAll("[data-tilt]").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1200px) rotateX(${y*-6}deg) rotateY(${x*8}deg) translateY(-9px) scale(1.015)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
    document.querySelectorAll(".pill,.social-btn,.add-cart").forEach(btn=>{btn.addEventListener("pointermove",e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.025}px,${(e.clientY-r.top-r.height/2)*.04}px) translateY(-2px)`});btn.addEventListener("pointerleave",()=>btn.style.transform="")});
    const items=[...document.querySelectorAll(".motion-section img,.hero-photo img")];let ticking=false;
    const parallax=()=>{const vh=innerHeight;items.forEach(img=>{const r=img.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const p=(r.top-vh/2)/(vh/2);img.style.setProperty("--scrollY",(-p*7).toFixed(2)+"px")}});ticking=false};
    addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true}},{passive:true});parallax();
  }

  document.querySelectorAll("img").forEach(img=>{img.addEventListener("error",()=>{img.classList.add("image-fallback");img.removeAttribute("src");img.alt=img.alt||"Organic skincare product"},{once:true})});

  document.querySelectorAll("[data-count]").forEach(el=>{const target=Number(el.dataset.count)||0;if(reduced){el.textContent=target.toLocaleString();return}let start=0,duration=1200,t0=null;const tick=t=>{if(!t0)t0=t;const p=Math.min((t-t0)/duration,1),ease=1-Math.pow(1-p,3);el.textContent=Math.round(target*ease).toLocaleString();if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)});

  /* Simple static-cart system: works on GitHub Pages with localStorage. */
  const CART_KEY="ofw_cart_v1";
  const getCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY)||"[]")}catch{return[]}};
  const saveCart=cart=>{localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartCount();};
  const updateCartCount=()=>{const count=getCart().reduce((sum,item)=>sum+(item.qty||1),0);document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=count);document.querySelectorAll(".cart-link").forEach(el=>el.classList.toggle("has-items",count>0));};

  const addToCart=(product)=>{
    const cart=getCart();const found=cart.find(item=>item.id===product.id);
    if(found) found.qty+=1; else cart.push({...product,qty:1});
    saveCart(cart);
    const buttons=[...document.querySelectorAll(`[data-add-cart][data-id="${CSS.escape(product.id)}"]`)];
    buttons.forEach(btn=>{const original=btn.dataset.originalText||btn.textContent;btn.dataset.originalText=original;btn.textContent="Added ✓";btn.classList.add("added");setTimeout(()=>{btn.textContent=original;btn.classList.remove("added")},900)});
  };

  document.addEventListener("click",e=>{
    const add=e.target.closest("[data-add-cart]");
    if(add){
      e.preventDefault();
      addToCart({id:add.dataset.id,name:add.dataset.name,price:Number(add.dataset.price),image:add.dataset.image});
      return;
    }
    const remove=e.target.closest("[data-remove-cart]");
    if(remove){e.preventDefault();const cart=getCart().filter(item=>item.id!==remove.dataset.removeCart);saveCart(cart);renderCart();return;}
    const qty=e.target.closest("[data-qty]");
    if(qty){e.preventDefault();const cart=getCart(),item=cart.find(x=>x.id===qty.dataset.id);if(!item)return;item.qty=Math.max(1,item.qty+(qty.dataset.qty==="plus"?1:-1));saveCart(cart);renderCart();}
  });

  const money=n=>`$${Number(n).toFixed(2)}`;
  const renderCart=()=>{
    const root=document.querySelector("[data-cart-root]");if(!root){updateCartCount();return;}
    const cart=getCart();
    if(!cart.length){root.innerHTML=`<div class="cart-empty reveal show"><div class="cart-empty-mark">OF</div><h2>Your cart is empty.</h2><p>Choose a botanical face wash and build your daily ritual.</p><a class="pill dark" href="shop.html">Browse collections</a></div>`;updateCartCount();return;}
    const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
    root.innerHTML=`<div class="cart-layout"><div class="cart-list">${cart.map(item=>`<article class="cart-item"><img src="${item.image}" alt="${item.name}"><div class="cart-item-info"><span class="cart-item-kicker">BOTANICAL CARE</span><h3>${item.name}</h3><p>Gentle everyday skincare</p><div class="cart-item-bottom"><strong>${money(item.price)}</strong><div class="qty"><button type="button" data-qty="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" data-qty="plus" data-id="${item.id}" aria-label="Increase quantity">+</button></div><button type="button" class="remove-cart" data-remove-cart="${item.id}">Remove</button></div></div></article>`).join("")}</div><aside class="cart-summary"><span class="kicker">YOUR RITUAL</span><h2>Order summary</h2><div class="summary-row"><span>Items</span><span>${cart.reduce((s,i)=>s+i.qty,0)}</span></div><div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-row"><span>Shipping</span><span>Free</span></div><div class="summary-total"><span>Total</span><strong>${money(subtotal)}</strong></div><button class="pill dark checkout-btn" type="button" data-checkout>Proceed to checkout</button><a class="continue-link" href="shop.html">← Continue shopping</a></aside></div>`;
    root.querySelector("[data-checkout]").addEventListener("click",()=>alert("Checkout is ready to connect to your payment provider."));
    updateCartCount();
  };
  renderCart();
  updateCartCount();
});
