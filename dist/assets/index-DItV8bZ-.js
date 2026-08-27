var Ji=Object.defineProperty;var Qi=(r,e,t)=>e in r?Ji(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var ce=(r,e,t)=>Qi(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();/*! Capacitor: https://capacitorjs.com/ - MIT License */const _i=r=>{const e=new Map;e.set("web",{name:"web"});const t=r.CapacitorPlatforms||{currentPlatform:{name:"web"},platforms:e},a=(n,o)=>{t.platforms.set(n,o)},i=n=>{t.platforms.has(n)&&(t.currentPlatform=t.platforms.get(n))};return t.addPlatform=a,t.setPlatform=i,t},en=r=>r.CapacitorPlatforms=_i(r),Z0=en(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});Z0.addPlatform;Z0.setPlatform;var Ft;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(Ft||(Ft={}));class Nr extends Error{constructor(e,t,a){super(e),this.message=e,this.code=t,this.data=a}}const tn=r=>{var e,t;return r!=null&&r.androidBridge?"android":!((t=(e=r==null?void 0:r.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},rn=r=>{var e,t,a,i,n;const o=r.CapacitorCustomPlatform||null,l=r.Capacitor||{},c=l.Plugins=l.Plugins||{},m=r.CapacitorPlatforms,h=()=>o!==null?o.name:tn(r),f=((e=m==null?void 0:m.currentPlatform)===null||e===void 0?void 0:e.getPlatform)||h,y=()=>f()!=="web",g=((t=m==null?void 0:m.currentPlatform)===null||t===void 0?void 0:t.isNativePlatform)||y,C=X=>{const K=$.get(X);return!!(K!=null&&K.platforms.has(f())||M(X))},z=((a=m==null?void 0:m.currentPlatform)===null||a===void 0?void 0:a.isPluginAvailable)||C,k=X=>{var K;return(K=l.PluginHeaders)===null||K===void 0?void 0:K.find(R=>R.name===X)},M=((i=m==null?void 0:m.currentPlatform)===null||i===void 0?void 0:i.getPluginHeader)||k,A=X=>r.console.error(X),D=(X,K,R)=>Promise.reject(`${R} does not have an implementation of "${K}".`),$=new Map,Y=(X,K={})=>{const R=$.get(X);if(R)return console.warn(`Capacitor plugin "${X}" already registered. Cannot register plugins twice.`),R.proxy;const J=f(),ie=M(X);let G;const F=async()=>(!G&&J in K?G=typeof K[J]=="function"?G=await K[J]():G=K[J]:o!==null&&!G&&"web"in K&&(G=typeof K.web=="function"?G=await K.web():G=K.web),G),_=(S,x)=>{var N,T;if(ie){const O=ie==null?void 0:ie.methods.find(P=>x===P.name);if(O)return O.rtype==="promise"?P=>l.nativePromise(X,x.toString(),P):(P,W)=>l.nativeCallback(X,x.toString(),P,W);if(S)return(N=S[x])===null||N===void 0?void 0:N.bind(S)}else{if(S)return(T=S[x])===null||T===void 0?void 0:T.bind(S);throw new Nr(`"${X}" plugin is not implemented on ${J}`,Ft.Unimplemented)}},ee=S=>{let x;const N=(...T)=>{const O=F().then(P=>{const W=_(P,S);if(W){const H=W(...T);return x=H==null?void 0:H.remove,H}else throw new Nr(`"${X}.${S}()" is not implemented on ${J}`,Ft.Unimplemented)});return S==="addListener"&&(O.remove=async()=>x()),O};return N.toString=()=>`${S.toString()}() { [capacitor code] }`,Object.defineProperty(N,"name",{value:S,writable:!1,configurable:!1}),N},re=ee("addListener"),le=ee("removeListener"),ue=(S,x)=>{const N=re({eventName:S},x),T=async()=>{const P=await N;le({eventName:S,callbackId:P},x)},O=new Promise(P=>N.then(()=>P({remove:T})));return O.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await T()},O},fe=new Proxy({},{get(S,x){switch(x){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return ie?ue:re;case"removeListener":return le;default:return ee(x)}}});return c[X]=fe,$.set(X,{name:X,proxy:fe,platforms:new Set([...Object.keys(K),...ie?[J]:[]])}),fe},Q=((n=m==null?void 0:m.currentPlatform)===null||n===void 0?void 0:n.registerPlugin)||Y;return l.convertFileSrc||(l.convertFileSrc=X=>X),l.getPlatform=f,l.handleError=A,l.isNativePlatform=g,l.isPluginAvailable=z,l.pluginMethodNoop=D,l.registerPlugin=Q,l.Exception=Nr,l.DEBUG=!!l.DEBUG,l.isLoggingEnabled=!!l.isLoggingEnabled,l.platform=l.getPlatform(),l.isNative=l.isNativePlatform(),l},an=r=>r.Capacitor=rn(r),It=an(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Dt=It.registerPlugin;It.Plugins;class J0{constructor(e){this.listeners={},this.retainedEventArguments={},this.windowListeners={},e&&(console.warn(`Capacitor WebPlugin "${e.name}" config object was deprecated in v3 and will be removed in v4.`),this.config=e)}addListener(e,t){let a=!1;this.listeners[e]||(this.listeners[e]=[],a=!0),this.listeners[e].push(t);const n=this.windowListeners[e];n&&!n.registered&&this.addWindowListener(n),a&&this.sendRetainedArgumentsForEvent(e);const o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,a){const i=this.listeners[e];if(!i){if(a){let n=this.retainedEventArguments[e];n||(n=[]),n.push(t),this.retainedEventArguments[e]=n}return}i.forEach(n=>n(t))}hasListeners(e){return!!this.listeners[e].length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:a=>{this.notifyListeners(t,a)}}}unimplemented(e="not implemented"){return new It.Exception(e,Ft.Unimplemented)}unavailable(e="not available"){return new It.Exception(e,Ft.Unavailable)}async removeListener(e,t){const a=this.listeners[e];if(!a)return;const i=a.indexOf(t);this.listeners[e].splice(i,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(a=>{this.notifyListeners(e,a)}))}}const e0=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),t0=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class nn extends J0{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(a=>{if(a.length<=0)return;let[i,n]=a.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=t0(i).trim(),n=t0(n).trim(),t[i]=n}),t}async setCookie(e){try{const t=e0(e.key),a=e0(e.value),i=`; expires=${(e.expires||"").replace("expires=","")}`,n=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${a||""}${i}; path=${n}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}Dt("CapacitorCookies",{web:()=>new nn});const sn=async r=>new Promise((e,t)=>{const a=new FileReader;a.onload=()=>{const i=a.result;e(i.indexOf(",")>=0?i.split(",")[1]:i)},a.onerror=i=>t(i),a.readAsDataURL(r)}),on=(r={})=>{const e=Object.keys(r);return Object.keys(r).map(i=>i.toLocaleLowerCase()).reduce((i,n,o)=>(i[n]=r[e[o]],i),{})},ln=(r,e=!0)=>r?Object.entries(r).reduce((a,i)=>{const[n,o]=i;let l,c;return Array.isArray(o)?(c="",o.forEach(m=>{l=e?encodeURIComponent(m):m,c+=`${n}=${l}&`}),c.slice(0,-1)):(l=e?encodeURIComponent(o):o,c=`${n}=${l}`),`${a}&${c}`},"").substr(1):null,dn=(r,e={})=>{const t=Object.assign({method:r.method||"GET",headers:r.headers},e),i=on(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(i.includes("application/x-www-form-urlencoded")){const n=new URLSearchParams;for(const[o,l]of Object.entries(r.data||{}))n.set(o,l);t.body=n.toString()}else if(i.includes("multipart/form-data")||r.data instanceof FormData){const n=new FormData;if(r.data instanceof FormData)r.data.forEach((l,c)=>{n.append(c,l)});else for(const l of Object.keys(r.data))n.append(l,r.data[l]);t.body=n;const o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(i.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t};class cn extends J0{async request(e){const t=dn(e,e.webFetchExtra),a=ln(e.params,e.shouldEncodeUrlParams),i=a?`${e.url}?${a}`:e.url,n=await fetch(i,t),o=n.headers.get("content-type")||"";let{responseType:l="text"}=n.ok?e:{};o.includes("application/json")&&(l="json");let c,m;switch(l){case"arraybuffer":case"blob":m=await n.blob(),c=await sn(m);break;case"json":c=await n.json();break;case"document":case"text":default:c=await n.text()}const h={};return n.headers.forEach((f,y)=>{h[y]=f}),{data:c,headers:h,status:n.status,url:n.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}Dt("CapacitorHttp",{web:()=>new cn});const un="modulepreload",mn=function(r){return"/"+r},r0={},kr=function(e,t,a){let i=Promise.resolve();if(t&&t.length>0){let o=function(m){return Promise.all(m.map(h=>Promise.resolve(h).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=o(t.map(m=>{if(m=mn(m),m in r0)return;r0[m]=!0;const h=m.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${f}`))return;const y=document.createElement("link");if(y.rel=h?"stylesheet":un,h||(y.as="script"),y.crossOrigin="",y.href=m,c&&y.setAttribute("nonce",c),document.head.appendChild(y),h)return new Promise((g,C)=>{y.addEventListener("load",g),y.addEventListener("error",()=>C(new Error(`Unable to preload CSS for ${m}`)))})}))}function n(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return i.then(o=>{for(const l of o||[])l.status==="rejected"&&n(l.reason);return e().catch(n)})},a0=Dt("Device",{web:()=>kr(()=>import("./web-TL8NYv0D.js"),[]).then(r=>new r.DeviceWeb)});var Zt;(function(r){r.Heavy="HEAVY",r.Medium="MEDIUM",r.Light="LIGHT"})(Zt||(Zt={}));var na;(function(r){r.Success="SUCCESS",r.Warning="WARNING",r.Error="ERROR"})(na||(na={}));const i0=Dt("Haptics",{web:()=>kr(()=>import("./web-MQKtS7eA.js"),[]).then(r=>new r.HapticsWeb)});var sa;(function(r){r.Dark="DARK",r.Light="LIGHT",r.Default="DEFAULT"})(sa||(sa={}));var n0;(function(r){r.None="NONE",r.Slide="SLIDE",r.Fade="FADE"})(n0||(n0={}));const s0=Dt("StatusBar"),o0=Dt("Preferences",{web:()=>kr(()=>import("./web-jJ7Rub_Z.js"),[]).then(r=>new r.PreferencesWeb)}),pn=Dt("SplashScreen",{web:()=>kr(()=>import("./web-D3FEI0uc.js"),[]).then(r=>new r.SplashScreenWeb)}),kt=class kt{constructor(){}static getInstance(){return kt.instance||(kt.instance=new kt),kt.instance}async initialize(){try{It.isNativePlatform()&&(await s0.setStyle({style:sa.Dark}),await s0.setBackgroundColor({color:"#090d16"}),await pn.hide())}catch(e){console.warn("NativeService: Initialization running in web fallback mode",e)}}async getDeviceInfo(){const e=It.getPlatform(),t=It.isNativePlatform();try{const a=await a0.getInfo();let i,n;try{const o=await a0.getBatteryInfo();i=o.batteryLevel?Math.round(o.batteryLevel*100):void 0,n=o.isCharging}catch{}return{platform:e,isNative:t,model:a.model||(t?"Dispositivo Nativo":"Navegador Web"),osVersion:`${a.operatingSystem} ${a.osVersion}`,batteryLevel:i,isCharging:n}}catch{return{platform:e,isNative:t,model:t?"Dispositivo Nativo":"Navegador Web",osVersion:navigator.userAgent.includes("Windows")?"Windows":"Web Engine"}}}async triggerHaptics(e="medium"){try{if(e==="success")await i0.notification({type:na.Success});else{const t=e==="light"?Zt.Light:e==="heavy"?Zt.Heavy:Zt.Medium;await i0.impact({style:t})}}catch{"vibrate"in navigator&&navigator.vibrate(e==="heavy"?40:20)}}async setStorage(e,t){await o0.set({key:e,value:t})}async getStorage(e){return(await o0.get({key:e})).value}};ce(kt,"instance");let oa=kt;const je=oa.getInstance(),Qt=`data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450" style="background:#111216; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
  <defs>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="venaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="0%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>

  <text x="300" y="34" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="0.5">ANATOMÍA DEL CORAZÓN HUMANO</text>
  <text x="300" y="52" fill="#94a3b8" font-size="11" text-anchor="middle">Esquema de Cámaras y Grandes Vasos</text>

  <g transform="translate(140, 65)">
    <!-- Vena Cava -->
    <path d="M70,30 L70,120 C70,140 85,155 105,155 L105,30 Z" fill="url(#venaGrad)" stroke="#38bdf8" stroke-width="2"/>
    <!-- Aorta -->
    <path d="M120,40 C120,-10 200,-10 200,60 L180,90 C170,50 145,50 140,80 Z" fill="url(#aortaGrad)" stroke="#fca5a5" stroke-width="2"/>
    <!-- Pulmonary Artery -->
    <path d="M150,55 L220,95 L205,115 L145,85 Z" fill="#818cf8" opacity="0.85"/>
    <!-- Ventricles Body -->
    <path d="M50,130 C30,220 120,320 160,330 C210,320 280,210 250,130 C230,80 180,100 150,115 C120,100 70,80 50,130 Z" fill="url(#heartGrad)" stroke="#f87171" stroke-width="3"/>
    <!-- Septum separator -->
    <path d="M150,125 C145,200 155,270 160,330" stroke="#fecaca" stroke-width="2.5" stroke-dasharray="4,4" fill="none"/>
  </g>

  <!-- Labels -->
  <rect x="25" y="100" width="150" height="32" rx="8" fill="#1e1f24" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="100" y="121" fill="#38bdf8" font-size="12" font-weight="600" text-anchor="middle">Vena Cava Superior</text>

  <rect x="420" y="70" width="150" height="32" rx="8" fill="#1e1f24" stroke="#f87171" stroke-width="1.5"/>
  <text x="495" y="91" fill="#f87171" font-size="12" font-weight="600" text-anchor="middle">Cayado de la Aorta</text>

  <rect x="25" y="195" width="150" height="32" rx="8" fill="#1e1f24" stroke="#818cf8" stroke-width="1.5"/>
  <text x="100" y="216" fill="#818cf8" font-size="12" font-weight="600" text-anchor="middle">Aurícula Derecha</text>

  <rect x="420" y="275" width="155" height="32" rx="8" fill="#1e1f24" stroke="#ec4899" stroke-width="1.5"/>
  <text x="497" y="296" fill="#ec4899" font-size="12" font-weight="600" text-anchor="middle">Ventrículo Izquierdo</text>
</svg>
`)}`;function Or(){const r=Date.now(),e={id:"deck-mates",parentId:null,name:"MATES",description:"Matemáticas, Física & Química",icon:"folder",color:"#84cc16",settings:{algorithmType:"custom",learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:25,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},createdAt:r-864e5*5,updatedAt:r},t={id:"deck-mates-sub",parentId:"deck-mates",name:"Matemática, Física & Química",description:"Cálculo, geometría no euclidiana, mecánica cuántica",icon:"folder-sub",color:"#84cc16",settings:{algorithmType:"custom",learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:25,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},createdAt:r-864e5*4,updatedAt:r},a={id:"deck-idioma",parentId:null,name:"IDIOMA",description:"Inglés avanzado, fonética & phrasal verbs",icon:"folder",color:"#8b5cf6",settings:{algorithmType:"languages",learningSteps:[4,1440,2880,7200],easyBonus:1.4,hardIntervalMultiplier:1.2,newCardsPerDay:20,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!0,ttsVoiceLang:"en-US"},createdAt:r-864e5*3,updatedAt:r},i={id:"deck-humans",parentId:null,name:"HUMANS",description:"Anatomía humana, fisiología y medicina clínica",icon:"folder",color:"#f59e0b",settings:{algorithmType:"medical",learningSteps:[4,1440,2880,7200],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:20,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},createdAt:r-864e5*2,updatedAt:r},n={id:"deck-tools",parentId:null,name:"TOOLS",description:"Algoritmos, arquitecturas y herramientas",icon:"briefcase",color:"#ec4899",settings:{algorithmType:"fsrs",learningSteps:[4,1440,2880,7200],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:20,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},createdAt:r-864e5,updatedAt:r},o=[{id:"card-figma-1",deckId:"deck-mates-sub",type:"latex",front:"Geometría Hiperbólica (Lobachevskiana)",back:"Curvatura $$K < 0$$. La suma de los ángulos del triángulo $$< 180^\\circ$$. Fey: Dibujar sobre una papa frita Pringles (silla de montar). Las paralelas se repelen hacia afuera.",audioLang:"es-ES",audioText:"Geometría Hiperbólica. Curvatura K menor que cero.",state:"learning",stepIndex:1,intervalMinutes:1440,easeFactor:2.5,lapses:0,reps:2,dueDate:r-1e3,createdAt:r-864e5*3,updatedAt:r},{id:"card-figma-2",deckId:"deck-mates-sub",type:"latex",front:"Geometría Elíptica (Riemanniana)",back:"Curvatura $$K > 0$$. La suma de los ángulos del triángulo $$> 180^\\circ$$. Fey: Dibujar sobre un globo terráqueo. Las líneas que crees paralelas siempre chocarán en los polos.",audioLang:"es-ES",audioText:"Geometría Elíptica. Curvatura K mayor que cero.",state:"learning",stepIndex:2,intervalMinutes:4320,easeFactor:2.5,lapses:0,reps:3,dueDate:r-2e3,createdAt:r-864e5*2,updatedAt:r},{id:"card-figma-3",deckId:"deck-mates-sub",type:"standard",front:"Ortocentro:",back:"Intersección de las alturas. Fey: El foco de tensión. Donde colisionan todas las plomadas gravitacionales de la estructura (enfocado en los ángulos).",audioLang:"es-ES",audioText:"Ortocentro. Intersección de las alturas.",state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:r,createdAt:r-864e5,updatedAt:r},{id:"card-figma-4",deckId:"deck-mates-sub",type:"standard",front:"Circuncentro:",back:"Intersección de las mediatrices. Centro geométrico del círculo circunscrito. Fey: El domo del escudo. Un campo de fuerza que encapsula la base tocando solo las esquinas exteriores.",audioLang:"es-ES",audioText:"Circuncentro. Intersección de las mediatrices.",state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:r,createdAt:r-864e5,updatedAt:r},{id:"card-figma-occlusion",deckId:"deck-humans",type:"image_occlusion",front:"Identifica la estructura anatómica señalada con la máscara luminosa:",back:"La **Vena Cava Superior** transporta sangre desoxigenada desde la parte superior del cuerpo hacia la aurícula derecha.",occlusionImage:Qt,occlusionMasks:[{id:"mask-1",x:4.1,y:22.2,width:25,height:7.2,label:"Vena Cava Superior"},{id:"mask-2",x:70,y:15.5,width:25,height:7.2,label:"Cayado de la Aorta"},{id:"mask-3",x:4.1,y:43.3,width:25,height:7.2,label:"Aurícula Derecha"},{id:"mask-4",x:70,y:61.1,width:25.8,height:7.2,label:"Ventrículo Izquierdo"}],activeMaskId:"mask-1",occlusionMode:"hide_all_reveal_one",audioLang:"es-ES",audioText:"Vena Cava Superior.",state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:r,createdAt:r-864e5,updatedAt:r}];return{decks:[e,t,a,i,n],cards:o}}const St=class St{constructor(){}static getInstance(){return St.instance||(St.instance=new St),St.instance}formatMinutesToHuman(e){if(e<60)return`${Math.round(e)} min`;const t=e/60;if(t<24)return`${Math.round(t)} h`;const a=e/1440;if(a<30)return a===1?"1 día":`${Math.round(a)} días`;const i=e/43200;if(i<12)return i===1?"1 mes":`${Math.round(i)} meses`;const n=e/525600;return n===1?"1 año":`${Number(n.toFixed(1))} años`}parseTimeToMinutes(e){const t=e.trim().toLowerCase(),a=parseFloat(t);return isNaN(a)?1440:t.includes("m")&&!t.includes("mes")&&!t.includes("min")||t.includes("min")?Math.round(a):t.includes("h")||t.includes("hora")?Math.round(a*60):t.includes("d")||t.includes("día")||t.includes("dia")?Math.round(a*1440):t.includes("mes")||t.includes("mo")?Math.round(a*43200):t.includes("a")||t.includes("año")||t.includes("year")?Math.round(a*525600):Math.round(a*1440)}calculateNextState(e,t,a){const i=Date.now(),n=a.learningSteps&&a.learningSteps.length>0?a.learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],o=e.stepIndex||0;let l=o,c=e.intervalMinutes||n[0],m=e.easeFactor||2.5,h=e.lapses||0,f=(e.reps||0)+1,y=e.state;switch(t){case"again":{l=0,c=n[0],m=Math.max(1.3,m-.2),h+=1,y="relearning";break}case"hard":{c=Math.round(c*(a.hardIntervalMultiplier||1.2)),m=Math.max(1.3,m-.15),y="learning";break}case"good":{o<n.length-1?(l=o+1,c=n[l],y="learning"):(c=Math.round(c*m),y="review");break}case"easy":{o<n.length-2?(l=o+2,c=Math.round(n[l]*(a.easyBonus||1.35))):(l=n.length-1,c=Math.round(c*m*(a.easyBonus||1.35))),m=Math.min(3.5,m+.15),y="review";break}}const g=i+c*60*1e3;return{state:y,stepIndex:l,intervalMinutes:c,easeFactor:Number(m.toFixed(2)),lapses:h,reps:f,dueDate:g}}projectIntervals(e,t){const a=t.learningSteps&&t.learningSteps.length>0?t.learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],i=e.stepIndex||0,n=Date.now(),o=a[0],l=Math.round((e.intervalMinutes||a[0])*(t.hardIntervalMultiplier||1.2)),c=i<a.length-1?a[i+1]:Math.round((e.intervalMinutes||a[0])*e.easeFactor),m=i<a.length-2?Math.round(a[i+2]*(t.easyBonus||1.35)):Math.round((e.intervalMinutes||a[0])*e.easeFactor*(t.easyBonus||1.35));return[{rating:"again",label:"Muy Difícil",intervalMinutes:o,displayTime:`< ${this.formatMinutesToHuman(o)}`,nextDueDate:n+o*6e4},{rating:"hard",label:"Difícil",intervalMinutes:l,displayTime:this.formatMinutesToHuman(l),nextDueDate:n+l*6e4},{rating:"good",label:"Bien",intervalMinutes:c,displayTime:this.formatMinutesToHuman(c),nextDueDate:n+c*6e4},{rating:"easy",label:"Fácil",intervalMinutes:m,displayTime:this.formatMinutesToHuman(m),nextDueDate:n+m*6e4}]}parseStepsString(e){return e.split(",").map(t=>this.parseTimeToMinutes(t)).filter(t=>t>0)}formatStepsToString(e){return e.map(t=>this.formatMinutesToHuman(t)).join(", ")}};ce(St,"instance");let la=St;const _t=la.getInstance(),l0="eureka_flashcards_decks_v4",d0="eureka_flashcards_cards_v4",Mt=class Mt{constructor(){ce(this,"decks",[]);ce(this,"cards",[]);ce(this,"listeners",[]);this.loadFromStorage()}static getInstance(){return Mt.instance||(Mt.instance=new Mt),Mt.instance}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.saveToStorage(),this.listeners.forEach(e=>e())}loadFromStorage(){try{const e=localStorage.getItem(l0),t=localStorage.getItem(d0);if(e&&t)this.decks=JSON.parse(e),this.cards=JSON.parse(t);else{const a=Or();this.decks=a.decks,this.cards=a.cards,this.saveToStorage()}}catch{const e=Or();this.decks=e.decks,this.cards=e.cards}}saveToStorage(){try{localStorage.setItem(l0,JSON.stringify(this.decks)),localStorage.setItem(d0,JSON.stringify(this.cards))}catch(e){console.warn("Error guardando en almacenamiento:",e)}}getAllDecks(){return this.decks.filter(e=>!e.isArchived)}getRootDecks(){return this.decks.filter(e=>!e.parentId&&!e.isArchived)}getSubdecks(e){return this.decks.filter(t=>t.parentId===e&&!t.isArchived)}getDeckById(e){return this.decks.find(t=>t.id===e)}getDeckHierarchyIds(e){const t=[e],a=this.getSubdecks(e);for(const i of a)t.push(...this.getDeckHierarchyIds(i.id));return t}createDeck(e){var n;const t=e.parentId?this.getDeckById(e.parentId):void 0,a=(t==null?void 0:t.settings)||{algorithmType:"custom",learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:25,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},i={id:`deck-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,parentId:e.parentId||null,name:e.name.trim(),description:((n=e.description)==null?void 0:n.trim())||"",icon:e.icon||(e.parentId?"folder-sub":"folder"),color:e.color||(e.parentId?"#84cc16":"#38bdf8"),settings:{...a,...e.settings},createdAt:Date.now(),updatedAt:Date.now()};return this.decks.push(i),this.notify(),i}updateDeck(e,t){const a=this.decks.findIndex(i=>i.id===e);if(a!==-1)return this.decks[a]={...this.decks[a],...t,updatedAt:Date.now()},this.notify(),this.decks[a]}renameDeck(e,t){return this.updateDeck(e,{name:t.trim()})}duplicateDeck(e){const t=this.getDeckById(e);if(!t)return;const a=this.createDeck({name:`${t.name} (Copia)`,description:t.description,parentId:t.parentId,color:t.color,icon:t.icon,settings:{...t.settings}});return this.getCardsByDeck(e,!1).forEach(n=>{this.createCard({deckId:a.id,type:n.type,front:n.front,back:n.back,frontImage:n.frontImage,backImage:n.backImage,occlusionImage:n.occlusionImage,occlusionMasks:n.occlusionMasks?[...n.occlusionMasks]:void 0,activeMaskId:n.activeMaskId,occlusionMode:n.occlusionMode,audioLang:n.audioLang,audioText:n.audioText})}),a}resetDeckProgress(e){const t=this.getDeckHierarchyIds(e),a=Date.now();this.cards=this.cards.map(i=>t.includes(i.deckId)?{...i,state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:a,updatedAt:a}:i),this.notify()}archiveDeck(e){this.updateDeck(e,{isArchived:!0})}exportDeck(e){const t=this.getDeckById(e),a=this.getCardsByDeck(e,!0);return JSON.stringify({deck:t,cards:a},null,2)}deleteDeck(e){const t=this.getDeckHierarchyIds(e);this.decks=this.decks.filter(a=>!t.includes(a.id)),this.cards=this.cards.filter(a=>!t.includes(a.deckId)),this.notify()}getCardsByDeck(e,t=!0){let a;if(!t)a=this.cards.filter(i=>i.deckId===e);else{const i=this.getDeckHierarchyIds(e);a=this.cards.filter(n=>i.includes(n.deckId))}return a.sort((i,n)=>(n.createdAt||0)-(i.createdAt||0))}searchCardsInDeck(e,t){const a=this.getCardsByDeck(e,!0);if(!t.trim())return a;const i=t.toLowerCase();return a.filter(n=>n.front.toLowerCase().includes(i)||n.back.toLowerCase().includes(i))}getDueCardsByDeck(e,t=!0){const a=this.getCardsByDeck(e,t),i=Date.now();return a.filter(n=>n.dueDate<=i)}getCardById(e){return this.cards.find(t=>t.id===e)}getCardsByGroupId(e){return this.cards.filter(t=>t.groupId===e)}createCard(e,t=!1){const a=this.getDeckById(e.deckId),i=(a==null?void 0:a.settings.learningSteps)||[4,1440,2880,7200],n=Date.now(),o=t?`grp-inv-${n}-${Math.random().toString(36).substr(2,4)}`:e.groupId,l={...e,id:`card-${n}-${Math.random().toString(36).substr(2,4)}`,groupId:o,groupTitle:t?"Par Invertido":e.groupTitle,isInverted:!1,state:"new",stepIndex:0,intervalMinutes:i[0]||4,easeFactor:2.5,lapses:0,reps:0,dueDate:n,createdAt:n,updatedAt:n};if(this.cards.push(l),t&&e.type!=="image_occlusion"){const c={...e,id:`card-${n}-inv-${Math.random().toString(36).substr(2,4)}`,groupId:o,groupTitle:"Par Invertido",front:e.back,back:e.front,frontImage:e.backImage,backImage:e.frontImage,isInverted:!0,state:"new",stepIndex:0,intervalMinutes:i[0]||4,easeFactor:2.5,lapses:0,reps:0,dueDate:n,createdAt:n+1,updatedAt:n+1};this.cards.push(c)}return this.notify(),l}createOcclusionCards(e,t,a,i="hide_all_reveal_one"){const n=[],o=this.getDeckById(e),l=(o==null?void 0:o.settings.learningSteps)||[4,1440,2880,7200],c=Date.now(),m=`occ-grp-${c}-${Math.random().toString(36).substr(2,4)}`;return a.forEach((h,f)=>{const y={id:`card-occ-${c}-${f}-${Math.random().toString(36).substr(2,4)}`,deckId:e,groupId:m,groupTitle:`Oclusión (${a.length} máscaras)`,type:"image_occlusion",front:`Identifica la estructura anatómica #${f+1}:`,back:h.label?`**${h.label}**`:`Estructura #${f+1} revelada.`,occlusionImage:t,occlusionMasks:a,activeMaskId:h.id,occlusionMode:i,isInverted:!1,state:"new",stepIndex:0,intervalMinutes:l[0]||4,easeFactor:2.5,lapses:0,reps:0,dueDate:c+f*5,createdAt:c+f,updatedAt:c+f};this.cards.push(y),n.push(y)}),this.notify(),n}syncOcclusionCards(e,t,a,i,n="hide_all_reveal_one",o){const l=this.getDeckById(e),c=(l==null?void 0:l.settings.learningSteps)||[4,1440,2880,7200],m=Date.now(),h=t.groupId||`occ-grp-${m}-${Math.random().toString(36).substr(2,4)}`,f=t.groupId?this.getCardsByGroupId(h):[t];if(i.forEach((y,g)=>{const C=y.label?`**${y.label}**`:`Estructura #${g+1} revelada.`,z=o||`Identifica la estructura anatómica #${g+1}:`;if(g<f.length){const k=f[g];this.updateCard(k.id,{deckId:e,groupId:h,groupTitle:`Oclusión (${i.length} máscaras)`,type:"image_occlusion",front:z,back:C,occlusionImage:a,occlusionMasks:i,activeMaskId:y.id,occlusionMode:n,updatedAt:m})}else{const k={id:`card-occ-${m}-${g}-${Math.random().toString(36).substr(2,4)}`,deckId:e,groupId:h,groupTitle:`Oclusión (${i.length} máscaras)`,type:"image_occlusion",front:z,back:C,occlusionImage:a,occlusionMasks:i,activeMaskId:y.id,occlusionMode:n,isInverted:!1,state:"new",stepIndex:0,intervalMinutes:c[0]||4,easeFactor:2.5,lapses:0,reps:0,dueDate:m+g*5,createdAt:m+g,updatedAt:m+g};this.cards.push(k)}}),i.length<f.length){const y=f.slice(i.length).map(C=>C.id),g=new Set(y);this.cards=this.cards.filter(C=>!g.has(C.id))}this.notify()}importBatchCards(e,t){const a=t.split(`
`).map(n=>n.trim()).filter(Boolean);let i=0;for(const n of a){let o=[];if(n.includes(";")?o=n.split(";"):n.includes("	")?o=n.split("	"):n.includes(":::")?o=n.split(":::"):n.includes("|")&&(o=n.split("|")),o.length>=2){const l=o[0].trim(),c=o.slice(1).join(";").trim(),m=l.includes("$")||c.includes("$")?"latex":"standard";this.createCard({deckId:e,type:m,front:l,back:c}),i++}}return i}updateCard(e,t){const a=this.cards.findIndex(i=>i.id===e);if(a!==-1)return this.cards[a]={...this.cards[a],...t,updatedAt:Date.now()},this.notify(),this.cards[a]}deleteCard(e){this.cards=this.cards.filter(t=>t.id!==e),this.notify()}deleteCardGroup(e){this.cards=this.cards.filter(t=>t.groupId!==e),this.notify()}moveCards(e,t){var l;const a=new Set(e),i=Date.now(),n=this.getDeckById(t),o=((l=n==null?void 0:n.settings)==null?void 0:l.learningSteps)||[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600];this.cards=this.cards.map(c=>{if(a.has(c.id)){const m=c.intervalMinutes>0?c.intervalMinutes:Math.max(1,Math.round((c.dueDate-i)/6e4));let h=0;for(let f=0;f<o.length&&o[f]<=m;f++)h=f;return{...c,deckId:t,stepIndex:h,updatedAt:i}}return c}),this.notify()}deleteCards(e){const t=new Set(e);this.cards=this.cards.filter(a=>!t.has(a.id)),this.notify()}resetCardsProgress(e){const t=new Set(e),a=Date.now();this.cards=this.cards.map(i=>t.has(i.id)?{...i,state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:a,updatedAt:a}:i),this.notify()}toggleInvertCards(e){const t=new Set(e),a=Date.now();this.cards=this.cards.map(i=>t.has(i.id)?{...i,front:i.back,back:i.front,frontImage:i.backImage,backImage:i.frontImage,isInverted:!i.isInverted,updatedAt:a}:i),this.notify()}resetCardProgress(e){if(!this.getCardById(e))return;const a=Date.now();return this.updateCard(e,{state:"new",stepIndex:0,intervalMinutes:4,easeFactor:2.5,lapses:0,reps:0,dueDate:a,updatedAt:a})}reviewCard(e,t){const a=this.getCardById(e);if(!a)return;const i=this.getDeckById(a.deckId),n=(i==null?void 0:i.settings)||{algorithmType:"custom",learningSteps:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600],easyBonus:1.35,hardIntervalMultiplier:1.2,newCardsPerDay:25,maxReviewsPerDay:3e3,mixCards:!0,autoPlayAudio:!1,ttsVoiceLang:"es-ES"},o=_t.calculateNextState(a,t,n);return this.updateCard(e,{...o,lastReviewDate:Date.now()})}getDeckStats(e){const t=this.getCardsByDeck(e,!0),a=Date.now();let i=0,n=0,o=0,l=0;return t.forEach(c=>{c.state==="new"?i++:c.state==="learning"||c.state==="relearning"?n++:(c.state==="review"||c.intervalMinutes>=10080)&&l++,c.dueDate<=a&&o++}),{totalCards:t.length,newCards:i,learningCards:n,dueCards:o,masteredCards:l}}resetAllToDemo(){const e=Or();this.decks=e.decks,this.cards=e.cards,this.notify()}};ce(Mt,"instance");let da=Mt;const j=da.getInstance(),c0="eureka_customization_theme_v2",Hr={accentColor:"#38bdf8",accentName:"blue",bgTheme:"modern_black",cardRadius:"super_rounded",cardSurface:"glass",uiScale:"comfortable"},zt=class zt{constructor(){ce(this,"currentTheme");const e=localStorage.getItem(c0);if(e)try{this.currentTheme={...Hr,...JSON.parse(e)}}catch{this.currentTheme={...Hr}}else this.currentTheme={...Hr};this.applyTheme()}static getInstance(){return zt.instance||(zt.instance=new zt),zt.instance}getTheme(){return{...this.currentTheme}}setTheme(e){this.currentTheme={...this.currentTheme,...e},localStorage.setItem(c0,JSON.stringify(this.currentTheme)),this.applyTheme()}applyTheme(){const e=document.documentElement,t=document.body,i={blue:"#38bdf8",green:"#10b981",purple:"#a855f7",amber:"#f59e0b",pink:"#ec4899",red:"#ef4444"}[this.currentTheme.accentName]||this.currentTheme.accentColor||"#38bdf8";e.style.setProperty("--f-blue",i),e.style.setProperty("--f-accent",i),t.className="",t.classList.add(`theme-${this.currentTheme.bgTheme}`),t.classList.add(`radius-${this.currentTheme.cardRadius}`),t.classList.add(`surface-${this.currentTheme.cardSurface}`),t.classList.add(`scale-${this.currentTheme.uiScale}`)}};ce(zt,"instance");let ca=zt;const $t=ca.getInstance();function hn(r="inicio"){return`
    <!-- Top Nav Header (Responsive for Desktop & Mobile APK) -->
    <header class="figma-global-nav">
      <div class="figma-nav-left">
        <div class="figma-logo-wrap" id="nav-brand-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span class="figma-brand-name">Eureka</span>
        </div>

        <!-- Desktop Navigation Tabs (Hidden on Mobile) -->
        <nav class="figma-nav-tabs desktop-only">
          <button class="figma-nav-tab-btn ${r==="inicio"?"active":""}" data-tab="inicio">
            Inicio
          </button>
          <button class="figma-nav-tab-btn ${r==="biblioteca"?"active":""}" data-tab="biblioteca">
            Biblioteca
          </button>
          <button class="figma-nav-tab-btn ${r==="ajustes"?"active":""}" data-tab="ajustes">
            🎨 Personalización
          </button>
        </nav>
      </div>

      <div class="figma-nav-right">
        <!-- Timer Capsule (Desktop only) -->
        <button class="figma-timer-capsule desktop-only" id="btn-header-premium" style="border:none; cursor:pointer;" title="Rachas y repetición diaria">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>12:00:00</span>
        </button>

        <!-- Streak Badge -->
        <div class="figma-streak-badge" title="Racha activa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span>0</span>
        </div>

        <!-- Quick Theme Switcher Button (Mobile) -->
        <button class="figma-icon-btn-dark mobile-only" id="btn-header-theme-mobile" style="width:38px; height:38px; border-radius:50%;" title="Personalización">
          🎨
        </button>

        <!-- Profile Avatar -->
        <button class="figma-avatar-circle" id="btn-header-avatar" title="Ajustes de la App">
          <span>E</span>
        </button>
      </div>
    </header>

    <!-- Mobile Native Bottom Navigation Bar (iOS & Android APK) -->
    <nav class="mobile-bottom-nav mobile-only">
      <button class="mobile-nav-item ${r==="inicio"?"active":""}" data-tab="inicio">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Inicio</span>
      </button>

      <button class="mobile-nav-item ${r==="biblioteca"?"active":""}" data-tab="biblioteca">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span>Biblioteca</span>
      </button>

      <button class="mobile-nav-item ${r==="ajustes"?"active":""}" data-tab="ajustes">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Estilo</span>
      </button>
    </nav>
  `}const Ct=class Ct{constructor(){}static getInstance(){return Ct.instance||(Ct.instance=new Ct),Ct.instance}showIntervalPicker(e){var C,z,k;const t=Math.max(1,e.initialMinutes||4);let a=Math.floor(t/1440),i=t%1440,n=Math.floor(i/60),o=i%60;const l=document.createElement("div");l.className="apple-modal-overlay",l.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:460px; width:92%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div>
            <h3 style="font-size:1.3rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
              ${e.title||"Modificar Intervalo"}
            </h3>
            ${e.subtitle?`<p style="font-size:0.85rem; color:var(--f-text-secondary); margin-top:2px;">${e.subtitle}</p>`:""}
          </div>
          <button id="btn-dialog-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.4rem; cursor:pointer; padding:4px;">✕</button>
        </div>

        <!-- 3 Inputs: Días, Horas, Minutos -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:16px;">
          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Días</label>
            <input type="number" id="picker-days" min="0" max="3650" value="${a}" class="cupertino-dialog-input" />
          </div>

          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Horas</label>
            <input type="number" id="picker-hours" min="0" max="23" value="${n}" class="cupertino-dialog-input" />
          </div>

          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Minutos</label>
            <input type="number" id="picker-minutes" min="0" max="59" value="${o}" class="cupertino-dialog-input" />
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div id="picker-live-preview" style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:10px 14px; margin-bottom:16px; font-size:0.88rem; font-weight:700; color:var(--f-blue); text-align:center;">
          ⏱️ Total calculado: ${this.formatReadableDuration(a,n,o)}
        </div>

        <!-- Quick Presets -->
        <div style="margin-bottom:20px;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:8px;">
            Atajos rápidos:
          </span>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="preset-btn" data-days="0" data-hours="0" data-mins="4">4 min</button>
            <button class="preset-btn" data-days="0" data-hours="0" data-mins="10">10 min</button>
            <button class="preset-btn" data-days="0" data-hours="1" data-mins="0">1 hora</button>
            <button class="preset-btn" data-days="1" data-hours="0" data-mins="0">1 día</button>
            <button class="preset-btn" data-days="2" data-hours="0" data-mins="0">2 días</button>
            <button class="preset-btn" data-days="5" data-hours="0" data-mins="0">5 días</button>
            <button class="preset-btn" data-days="15" data-hours="0" data-mins="0">15 días</button>
            <button class="preset-btn" data-days="30" data-hours="0" data-mins="0">1 mes</button>
            <button class="preset-btn" data-days="600" data-hours="0" data-mins="0">600 días</button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-dialog-cancel">
            Cancelar
          </button>
          <button class="dialog-btn dialog-btn-primary" id="btn-dialog-save-interval">
            Guardar Intervalo
          </button>
        </div>
      </div>
    `,document.body.appendChild(l);const c=l.querySelector("#picker-days"),m=l.querySelector("#picker-hours"),h=l.querySelector("#picker-minutes"),f=l.querySelector("#picker-live-preview"),y=()=>{const M=Math.max(0,parseInt(c.value,10)||0),A=Math.max(0,parseInt(m.value,10)||0),D=Math.max(0,parseInt(h.value,10)||0),$=M*1440+A*60+D;f.textContent=`⏱️ Total: ${this.formatReadableDuration(M,A,D)} (${$} minutos)`};[c,m,h].forEach(M=>{M.addEventListener("input",y)}),l.querySelectorAll(".preset-btn").forEach(M=>{M.addEventListener("click",()=>{c.value=M.dataset.days||"0",m.value=M.dataset.hours||"0",h.value=M.dataset.mins||"0",y()})});const g=()=>l.remove();(C=l.querySelector("#btn-dialog-close-x"))==null||C.addEventListener("click",()=>{g(),e.onCancel&&e.onCancel()}),(z=l.querySelector("#btn-dialog-cancel"))==null||z.addEventListener("click",()=>{g(),e.onCancel&&e.onCancel()}),l.addEventListener("click",M=>{M.target===l&&(g(),e.onCancel&&e.onCancel())}),(k=l.querySelector("#btn-dialog-save-interval"))==null||k.addEventListener("click",()=>{const M=Math.max(0,parseInt(c.value,10)||0),A=Math.max(0,parseInt(m.value,10)||0),D=Math.max(0,parseInt(h.value,10)||0),$=Math.max(1,M*1440+A*60+D);g(),e.onConfirm($)})}formatReadableDuration(e,t,a){const i=[];return e>0&&i.push(e===1?"1 día":`${e} días`),t>0&&i.push(t===1?"1 hora":`${t} horas`),(a>0||i.length===0)&&i.push(`${a} min`),i.join(", ")}showPrompt(e){var o,l,c;const t=document.createElement("div");t.className="apple-modal-overlay",t.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
            ${e.title}
          </h3>
          <button id="btn-prompt-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        ${e.message?`<p style="font-size:0.9rem; color:var(--f-text-secondary); margin-bottom:14px; line-height:1.4;">${e.message}</p>`:""}

        <input 
          type="${e.inputType||"text"}" 
          id="prompt-modal-input" 
          value="${e.defaultValue||""}" 
          placeholder="${e.placeholder||""}" 
          class="cupertino-dialog-input" 
          style="width:100%; margin-bottom:18px;" 
        />

        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-prompt-cancel">
            ${e.cancelText||"Cancelar"}
          </button>
          <button class="dialog-btn dialog-btn-primary" id="btn-prompt-confirm">
            ${e.confirmText||"Aceptar"}
          </button>
        </div>
      </div>
    `,document.body.appendChild(t);const a=t.querySelector("#prompt-modal-input");a.focus(),a.select();const i=()=>t.remove(),n=()=>{const m=a.value.trim();i(),e.onConfirm(m)};a.addEventListener("keydown",m=>{m.key==="Enter"&&n(),m.key==="Escape"&&(i(),e.onCancel&&e.onCancel())}),(o=t.querySelector("#btn-prompt-close-x"))==null||o.addEventListener("click",()=>{i(),e.onCancel&&e.onCancel()}),(l=t.querySelector("#btn-prompt-cancel"))==null||l.addEventListener("click",()=>{i(),e.onCancel&&e.onCancel()}),(c=t.querySelector("#btn-prompt-confirm"))==null||c.addEventListener("click",n),t.addEventListener("click",m=>{m.target===t&&(i(),e.onCancel&&e.onCancel())})}showConfirm(e){var i,n,o;const t=document.createElement("div");t.className="apple-modal-overlay",t.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:90%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:${e.isDanger?"#f87171":"#fff"}; letter-spacing:-0.02em;">
            ${e.isDanger?"⚠️ ":""}${e.title}
          </h3>
          <button id="btn-confirm-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.5;">
          ${e.message}
        </p>

        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-confirm-cancel">
            ${e.cancelText||"Cancelar"}
          </button>
          <button class="dialog-btn ${e.isDanger?"dialog-btn-danger":"dialog-btn-primary"}" id="btn-confirm-ok">
            ${e.confirmText||"Aceptar"}
          </button>
        </div>
      </div>
    `,document.body.appendChild(t);const a=()=>t.remove();(i=t.querySelector("#btn-confirm-close-x"))==null||i.addEventListener("click",()=>{a(),e.onCancel&&e.onCancel()}),(n=t.querySelector("#btn-confirm-cancel"))==null||n.addEventListener("click",()=>{a(),e.onCancel&&e.onCancel()}),(o=t.querySelector("#btn-confirm-ok"))==null||o.addEventListener("click",()=>{a(),e.onConfirm()}),t.addEventListener("click",l=>{l.target===t&&(a(),e.onCancel&&e.onCancel())})}showAlert(e){var i,n;const t=document.createElement("div");t.className="apple-modal-overlay",t.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:90%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
            ${e.title}
          </h3>
          <button id="btn-alert-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.5; white-space:pre-line;">
          ${e.message}
        </p>

        <div style="display:flex; align-items:center; justify-content:flex-end;">
          <button class="dialog-btn dialog-btn-primary" id="btn-alert-ok" style="min-width:110px;">
            ${e.buttonText||"Entendido"}
          </button>
        </div>
      </div>
    `,document.body.appendChild(t);const a=()=>{t.remove(),e.onConfirm&&e.onConfirm()};(i=t.querySelector("#btn-alert-close-x"))==null||i.addEventListener("click",a),(n=t.querySelector("#btn-alert-ok"))==null||n.addEventListener("click",a),t.addEventListener("click",o=>{o.target===t&&a()})}};ce(Ct,"instance");let ua=Ct;const me=ua.getInstance();function u0(){return`
    <div>
      <!-- Responsive Action Header -->
      <div class="figma-action-header">
        <h2 class="figma-view-title">Inicio</h2>

        <div class="figma-header-actions-group">
          <div class="figma-actions-mini-group">
            <button class="figma-icon-btn-dark" id="btn-trash-decks" title="Eliminar mazo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>

            <button class="figma-icon-btn-dark" id="btn-create-deck-top" title="Crear Carpeta / Mazo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            </button>

            <button class="figma-icon-btn-dark" id="btn-edit-decks" title="Ajustes de Mazos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <button class="figma-btn-outline" id="btn-batch-import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Importar</span>
          </button>

          <button class="figma-btn-blue-pill" id="btn-manual-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- Main Deck List Container -->
      <div class="figma-card-container apple-glass-panel">
        ${j.getRootDecks().map(e=>`
          <div class="figma-deck-row" data-deck-id="${e.id}">
            <div class="figma-deck-left">
              <div class="figma-deck-folder-icon" style="background:${e.color}15; border-color:${e.color}; color:${e.color};">
                ${e.icon==="briefcase"?'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>':'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'}
              </div>
              <div class="figma-deck-info-wrap">
                <span class="figma-deck-title">${e.name}</span>
                <div class="figma-deck-subtext">${e.description||"Toca para abrir submazos"}</div>
              </div>
            </div>

            <span class="figma-chevron">›</span>
          </div>
        `).join("")}
      </div>

      <!-- Floating Action Buttons (Desktop only, mobile uses bottom nav) -->
    </div>
  `}function fn(r,e){var t,a,i,n,o;r.querySelectorAll(".figma-deck-row").forEach(l=>{l.addEventListener("click",()=>{const c=l.dataset.deckId;c&&e.onSelectDeck(c)})}),(t=r.querySelector("#btn-manual-add"))==null||t.addEventListener("click",()=>e.onAddCard()),(a=r.querySelector("#btn-create-deck-top"))==null||a.addEventListener("click",()=>e.onCreateDeck()),(i=r.querySelector("#btn-batch-import"))==null||i.addEventListener("click",()=>e.onImportBatch()),(n=r.querySelector("#btn-edit-decks"))==null||n.addEventListener("click",()=>e.onManageDecks()),(o=r.querySelector("#btn-trash-decks"))==null||o.addEventListener("click",()=>{const l=j.getRootDecks();if(l.length<=1){me.showAlert({title:"Atención",message:"Debes mantener al menos un mazo principal."});return}const c=l.map((m,h)=>`${h+1}. ${m.name}`).join(`
`);me.showPrompt({title:"Eliminar Mazo",message:`Elige el número de mazo que deseas eliminar:
${c}`,placeholder:"Número de mazo (ej: 1)",inputType:"number",confirmText:"Continuar",onConfirm:m=>{if(m){const h=parseInt(m,10)-1;if(h>=0&&h<l.length){const f=l[h];me.showConfirm({title:"Eliminar Mazo",message:`¿Eliminar mazo "${f.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`,confirmText:"Eliminar",isDanger:!0,onConfirm:()=>{j.deleteDeck(f.id)}})}}}})})}function vn(r){var m,h,f,y;const e=document.getElementById("modal-learning-phase-root");e&&e.remove();const t=r.deck,a=[{label:"4 min",minutes:4},{label:"1 día",minutes:1440},{label:"2 días",minutes:2880},{label:"5 días",minutes:7200},{label:"11 días",minutes:15840},{label:"18 días",minutes:25920},{label:"29 días",minutes:41760},{label:"57 días",minutes:82080},{label:"102 días",minutes:146880},{label:"171 días",minutes:246240},{label:"278 días",minutes:400320},{label:"440 días",minutes:633600}];let i=t.settings.learningSteps&&t.settings.learningSteps.length>0?t.settings.learningSteps.map(g=>({label:_t.formatMinutesToHuman(g),minutes:g})):a;const n=document.createElement("div");n.id="modal-learning-phase-root",n.className="apple-modal-overlay",n.innerHTML=`
    <div class="apple-modal-content apple-glass-panel" style="max-width:540px; width:92%; max-height:90vh; display:flex; flex-direction:column; padding:0; overflow:hidden;">
      
      <!-- Modal Header (Foto 4) -->
      <div style="padding:20px 24px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <button class="apple-btn-outline-pill" id="btn-how-it-works" style="font-size:0.75rem; padding:4px 12px; margin-bottom:6px;">
            ¿Cómo funciona el algoritmo?
          </button>
          <h2 style="font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">Fase de aprendizaje</h2>
          <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-top:2px;">Pasos del aprendizaje</div>
        </div>
        <button id="btn-close-learning-phase" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.5rem; cursor:pointer; padding:4px;">✕</button>
      </div>

      <!-- Content Scrollable List -->
      <div style="flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:16px;">
        <p style="font-size:0.85rem; color:var(--f-text-secondary); line-height:1.4;">
          Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos de longitud fija. Cuando presionas <strong style="color:var(--f-green);">Bien</strong>, la tarjeta pasa al siguiente paso de aprendizaje hasta que se gradúa.
        </p>

        <!-- Steps List (Foto 4) -->
        <div id="learning-phase-steps-mount" class="apple-card-grouped" style="padding:4px 0;">
        </div>

        <!-- Add Step button -->
        <button class="apple-btn-secondary" id="btn-add-review-step" style="padding:12px; border-radius:12px; font-weight:700;">
          + Agregar paso de revisión
        </button>
      </div>

      <!-- Modal Footer -->
      <div style="padding:16px 24px 24px; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:flex-end;">
        <button class="apple-btn-primary" id="btn-save-learning-steps" style="width:100%; padding:14px; border-radius:14px; font-size:1rem; justify-content:center; background:var(--f-blue); color:#07080a; font-weight:800;">
          🔒 Guardar los cambios
        </button>
      </div>

    </div>
  `,document.body.appendChild(n);const o=n.querySelector("#learning-phase-steps-mount"),l=()=>{o&&(o.innerHTML=i.map((g,C)=>`
      <div class="apple-list-row" style="padding:12px 16px;">
        <div style="font-size:0.95rem; font-weight:600; color:#fff;">
          Revisión ${C+1}: <span style="color:var(--f-blue); font-weight:800; margin-left:6px;">${g.label}</span>
        </div>
        ${C>0?`<button class="apple-icon-del-btn" data-step-idx="${C}" title="Eliminar paso">×</button>`:'<span style="width:24px;"></span>'}
      </div>
    `).join(""),o.querySelectorAll(".apple-icon-del-btn").forEach(g=>{g.addEventListener("click",()=>{const C=parseInt(g.dataset.stepIdx||"0",10);i.splice(C,1),l()})}))};l(),(m=document.getElementById("btn-add-review-step"))==null||m.addEventListener("click",()=>{me.showIntervalPicker({title:"Nuevo Paso de Revisión",subtitle:"Configura el intervalo en días, horas o minutos:",initialMinutes:864e3,onConfirm:g=>{i.push({label:_t.formatMinutesToHuman(g),minutes:g}),l()}})}),(h=document.getElementById("btn-how-it-works"))==null||h.addEventListener("click",()=>{me.showAlert({title:"Algoritmo de Intervalos Fijos",message:`Cada respuesta correcta ("Bien" o "Fácil") traslada la tarjeta a la siguiente etapa de revisión secuencial.

Al responder "Muy Difícil", la tarjeta regresa al paso 1 para consolidar la memoria.`})}),(f=document.getElementById("btn-save-learning-steps"))==null||f.addEventListener("click",()=>{var C;const g=i.map(z=>z.minutes);j.updateDeck(t.id,{settings:{...t.settings,algorithmType:"custom",learningSteps:g}}),(C=document.getElementById("modal-learning-phase-root"))==null||C.remove(),r.onSaved()});const c=()=>{var g;(g=document.getElementById("modal-learning-phase-root"))==null||g.remove(),r.onClose()};(y=document.getElementById("btn-close-learning-phase"))==null||y.addEventListener("click",c)}function qa(r){var o,l;const e=document.getElementById("modal-algo-selector-root");e&&e.remove();const t=r.deck,a=t.settings.algorithmType||"custom",i=`
    <div class="modal-backdrop figma-modal-backdrop" id="modal-algo-selector-root">
      <div class="apple-glass-modal" style="max-width:580px; max-height:90vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 22px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Elegir algoritmo</h3>
          <button class="figma-btn-ghost" id="btn-close-algo-sel">×</button>
        </div>

        <div style="padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Option 1: FSRS -->
          <div class="apple-algo-card ${a==="fsrs"?"selected":""}" data-algo-key="fsrs">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Repetición espaciada inteligente (FSRS)</span>
                <span class="apple-badge-beta">Beta</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${a==="fsrs"?"checked":""} readonly />
            </div>
            <p class="apple-algo-desc">
              El algoritmo de programación más reciente y avanzado: aprende tus patrones de memoria personales y programa cada repaso justo para el momento en que estás a punto de olvidar, para que recuerdes más con menos repasos.
            </p>
          </div>

          <!-- Option 2: Revisión rápida -->
          <div class="apple-algo-card ${a==="quick"?"selected":""}" data-algo-key="quick">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Revisión rápida</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${a==="quick"?"checked":""} readonly />
            </div>
            <p class="apple-algo-desc">
              Revisa tarjetas sin ningún horario, solo una por una. Las tarjetas siempre están disponibles para estudiar cuando lo desees, lo que te permite repasar el material a tu propio ritmo sin seguir los intervalos de repaso espaciado.
            </p>
          </div>

          <!-- Option 3: Repaso espaciado general -->
          <div class="apple-algo-card ${a==="general"?"selected":""}" data-algo-key="general">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Repaso espaciado general</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${a==="general"?"checked":""} readonly />
            </div>
            <p class="apple-algo-desc">
              Un sistema inteligente que programa las revisiones según qué tan bien recuerdas cada tarjeta. Las tarjetas fáciles aparecen con menos frecuencia, mientras que las más difíciles se muestran más seguido, ayudándote a aprender de forma eficiente y a retener el conocimiento a largo plazo.
            </p>
          </div>

          <!-- Option 4: Aprendizaje de idiomas -->
          <div class="apple-algo-card ${a==="languages"?"selected":""}" data-algo-key="languages">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon" style="color:#38bdf8;">🔤</span>
                <span class="apple-algo-title">Aprendizaje de idiomas</span>
              </div>
              <span style="font-size:0.88rem; color:var(--f-blue);">🔓</span>
            </div>
            <div style="margin-bottom:8px;">
              <span class="apple-badge-subpill">+ Repaso espaciado</span>
            </div>
            <p class="apple-algo-desc">
              Una variación de repaso espaciado diseñada para aprender palabras nuevas. Las nuevas tarjetas se muestran con frecuencia al principio y luego se repasan en intervalos más largos para ayudarte a recordarlas a largo plazo.
            </p>
          </div>

          <!-- Option 5: Aprendizaje médico -->
          <div class="apple-algo-card ${a==="medical"?"selected":""}" data-algo-key="medical">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon" style="color:#38bdf8;">⚕️</span>
                <span class="apple-algo-title">Aprendizaje médico</span>
              </div>
              <span style="font-size:0.88rem; color:var(--f-blue);">🔓</span>
            </div>
            <div style="margin-bottom:8px;">
              <span class="apple-badge-subpill">+ Repaso espaciado</span>
            </div>
            <p class="apple-algo-desc">
              Este ajuste predeterminado de repaso espaciado se basa en técnicas utilizadas por estudiantes de medicina de alto rendimiento. Elimina los límites diarios y evita la repetición excesiva de tarjetas, ayudándote a cubrir grandes volúmenes de material de manera eficiente a corto plazo.
            </p>
          </div>

          <!-- Button to customize exact 12 steps (Foto 4) -->
          <button class="apple-btn-secondary" id="btn-open-custom-learning-phases" style="width:100%; padding:14px; border-radius:14px; margin-top:8px; font-weight:700;">
            ⚙️ Personalizar Escalera de Fases (12 Pasos)
          </button>

        </div>

      </div>
    </div>
  `;document.body.insertAdjacentHTML("beforeend",i),document.querySelectorAll(".apple-algo-card").forEach(c=>{c.addEventListener("click",()=>{var h;const m=c.dataset.algoKey;m&&(j.updateDeck(t.id,{settings:{...t.settings,algorithmType:m}}),(h=document.getElementById("modal-algo-selector-root"))==null||h.remove(),r.onSaved())})}),(o=document.getElementById("btn-open-custom-learning-phases"))==null||o.addEventListener("click",()=>{var c;(c=document.getElementById("modal-algo-selector-root"))==null||c.remove(),vn({deck:t,onSaved:()=>r.onSaved(),onClose:()=>qa(r)})});const n=()=>{var c;(c=document.getElementById("modal-algo-selector-root"))==null||c.remove(),r.onClose()};(l=document.getElementById("btn-close-algo-sel"))==null||l.addEventListener("click",n)}const At=class At{constructor(){}static getInstance(){return At.instance||(At.instance=new At),At.instance}generateCards(e,t=3){const a=e.trim().toLowerCase(),i=[];if(a.includes("matemática")||a.includes("física")||a.includes("cálculo")||a.includes("cuántica"))i.push({front:"¿Cuál es el Principio de Incertidumbre de Heisenberg?",back:`Establece la imposibilidad de medir simultáneamente y con precisión absoluta la posición y el momento lineal de una partícula:

$$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$$`,type:"latex"},{front:"¿Qué es la Derivada direccional de una función multivariable?",back:`Representa la tasa de cambio de $f(x,y)$ en la dirección de un vector unitario $\\mathbf{u}$:

$$D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u}$$`,type:"latex"},{front:"¿Qué describe la Ley de Gauss para el campo eléctrico?",back:`El flujo eléctrico total a través de cualquier superficie cerrada es proporcional a la carga eléctrica neta encerrada:

$$\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$$`,type:"latex"});else if(a.includes("corazón")||a.includes("anatomía")||a.includes("medicina")||a.includes("humans"))i.push({front:"¿Cuál es la función principal de la Válvula Mitral (bicúspide)?",back:"Permite el flujo unidireccional de sangre oxigenada desde la aurícula izquierda hacia el ventrículo izquierdo, impidiendo el reflujo retrógrado durante la sístole.",type:"standard"},{front:"¿Dónde se origina el impulso eléctrico cardíaco normal?",back:"En el **Nodo Sinoauricular (SA)**, ubicado en la parte superior de la aurícula derecha, actuando como el marcapasos natural.",type:"standard"},{front:"¿Qué diferencia a la circulación sistémica de la pulmonar?",back:`**Circulación pulmonar**: Transporta sangre desoxigenada a los pulmones para intercambio gaseoso.
**Circulación sistémica**: Distribuye sangre rica en $O_2$ a todos los tejidos del organismo.`,type:"standard"});else if(a.includes("inglés")||a.includes("idioma")||a.includes("english"))i.push({front:'Phrasal Verb: "To call it a day"',back:`**Meaning:** To stop working on something for the rest of the day.

*Example:* "We have made good progress, let's call it a day."`,type:"standard"},{front:'Idiom: "Bite the bullet"',back:"**Meaning:** To face a difficult or unpleasant situation with courage and resolve.",type:"standard"},{front:'Word: "Eloquent" /ˌel.ə.kwənt/',back:`**Definition:** Fluent or persuasive in speaking or writing.

*Synonyms:* Articulate, expressive, fluent.`,type:"standard"});else{const n=e.split(`
`).filter(o=>o.trim().length>5);if(n.length>=2)for(let o=0;o<Math.min(t,Math.floor(n.length/2));o++)i.push({front:n[o*2].trim(),back:n[o*2+1].trim(),type:"standard"});else i.push({front:`Concepto Clave: ${e.slice(0,40)}...`,back:`Definición detallada y aplicación fundamental de ${e}.`,type:"standard"},{front:`¿Cuál es el objetivo principal de ${e.slice(0,30)}?`,back:"Consolidar el conocimiento activo mediante la práctica espaciada y el recuerdo activo.",type:"standard"})}return i.slice(0,t)}};ce(At,"instance");let ma=At;const gn=ma.getInstance();function $a(r){var l,c,m;const e=document.getElementById("modal-ai-builder-root");e&&e.remove(),document.body.insertAdjacentHTML("beforeend",`
    <div class="modal-backdrop figma-modal-backdrop" id="modal-ai-builder-root">
      <div class="modal-container" style="max-width:600px; background:var(--f-surface); border:1px solid var(--f-border); border-radius:var(--f-radius-lg);">
        
        <div class="figma-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, #ec4899, #8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff;">
              ✨
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">AI Builder Flashcards</h3>
              <p style="font-size:0.75rem; color:var(--f-text-secondary);">Genera tarjetas automáticamente a partir de un tema o notas</p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-ai-modal">×</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          
          <div class="form-group">
            <label class="form-label" style="color:var(--f-text-secondary);">Tema o Texto de Estudio</label>
            <textarea 
              id="ai-prompt-input" 
              class="figma-editor-textarea" 
              style="min-height:90px; border-radius:var(--f-radius-sm);" 
              placeholder="Ej: Mecánica Cuántica, Anatomía Cardíaca, Phrasal Verbs en Inglés o pega tus apuntes aquí..."
            ></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-preset-chip" data-ai-topic="Mecánica Cuántica y Fórmulas">⚛️ Cuántica</button>
              <button type="button" class="btn-preset-chip" data-ai-topic="Anatomía del Corazón Humano">🫀 Corazón</button>
              <button type="button" class="btn-preset-chip" data-ai-topic="Vocabulario Avanzado Inglés">🌍 Inglés</button>
            </div>

            <button class="figma-btn-blue-pill" id="btn-trigger-ai-gen">
              <span>✨ Generar</span>
            </button>
          </div>

          <div id="ai-results-container" class="hidden" style="margin-top:16px; border-top:1px solid var(--f-border); padding-top:16px;">
            <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:10px; color:#fff;">Tarjetas Generadas</h4>
            <div id="ai-cards-list" style="display:flex; flex-direction:column; gap:10px; max-height:240px; overflow-y:auto;"></div>
            
            <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
              <button class="figma-btn-blue-pill" id="btn-add-all-ai-cards" style="width:100%; justify-content:center;">
                Añadir Todas al Mazo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `);const a=document.getElementById("ai-prompt-input"),i=document.getElementById("ai-results-container"),n=document.getElementById("ai-cards-list");let o=[];document.querySelectorAll("[data-ai-topic]").forEach(h=>{h.addEventListener("click",()=>{a&&(a.value=h.dataset.aiTopic||"")})}),(l=document.getElementById("btn-trigger-ai-gen"))==null||l.addEventListener("click",()=>{const h=(a==null?void 0:a.value.trim())||"Conceptos Generales";o=gn.generateCards(h,3),n&&i&&(n.innerHTML=o.map((f,y)=>`
        <div style="background:var(--f-input-bg); border:1px solid var(--f-border); border-radius:10px; padding:12px;">
          <div style="font-size:0.88rem; font-weight:700; color:#fff; margin-bottom:4px;">#${y+1}: ${f.front}</div>
          <div style="font-size:0.8rem; color:var(--f-text-secondary); line-height:1.4;">${f.back}</div>
        </div>
      `).join(""),i.classList.remove("hidden"))}),(c=document.getElementById("btn-add-all-ai-cards"))==null||c.addEventListener("click",()=>{var h,f;o.forEach(y=>{j.createCard({deckId:r.deckId,type:y.type,front:y.front,back:y.back})}),(h=r.onBatchAdded)==null||h.call(r,o.length),(f=document.getElementById("modal-ai-builder-root"))==null||f.remove()}),(m=document.getElementById("btn-close-ai-modal"))==null||m.addEventListener("click",()=>{var h;(h=document.getElementById("modal-ai-builder-root"))==null||h.remove(),r.onClose()})}function Q0(r){var n,o,l;const e=document.getElementById("modal-batch-import-root");e&&e.remove(),document.body.insertAdjacentHTML("beforeend",`
    <div class="modal-backdrop figma-modal-backdrop" id="modal-batch-import-root">
      <div class="modal-container" style="max-width:580px; background:var(--f-surface); border:1px solid var(--f-border); border-radius:var(--f-radius-lg);">
        
        <div class="figma-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="figma-icon-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#50b5ff" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Importar Tarjetas en Lote</h3>
              <p style="font-size:0.75rem; color:var(--f-text-secondary);">Pega tus pares de Pregunta y Respuesta</p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-batch-modal">×</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Formato admitido: <code>Pregunta;Respuesta</code> o separado por tabulaciones (CSV/TSV)</label>
            <textarea 
              id="batch-raw-textarea" 
              class="figma-editor-textarea" 
              style="min-height:160px; border-radius:var(--f-radius-sm); font-size:0.88rem;"
              placeholder="¿Qué es el ortocentro?;Punto de intersección de las alturas de un triángulo&#10;¿Qué es la Vena Cava?;Vaso que transporta sangre desoxigenada al corazón&#10;Identidad de Euler;$$e^{i\\pi} + 1 = 0$$"
            ></textarea>
          </div>

          <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="figma-btn-ghost" id="btn-cancel-batch">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-confirm-batch-import">
              Importar Tarjetas
            </button>
          </div>
        </div>

      </div>
    </div>
  `);const a=document.getElementById("batch-raw-textarea");(n=document.getElementById("btn-confirm-batch-import"))==null||n.addEventListener("click",()=>{var h;const c=(a==null?void 0:a.value)||"",m=j.importBatchCards(r.deckId,c);(h=document.getElementById("modal-batch-import-root"))==null||h.remove(),r.onImported(m)});const i=()=>{var c;(c=document.getElementById("modal-batch-import-root"))==null||c.remove(),r.onClose()};(o=document.getElementById("btn-close-batch-modal"))==null||o.addEventListener("click",i),(l=document.getElementById("btn-cancel-batch"))==null||l.addEventListener("click",i)}function bn(r){var n,o,l,c,m,h,f,y,g,C;const e=document.getElementById("modal-adv-menu-root");e&&e.remove();const t=r.deck,a=`
    <div class="modal-backdrop figma-modal-backdrop" id="modal-adv-menu-root">
      <div class="apple-glass-modal" style="max-width:580px; max-height:88vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de Mazo</h3>
          <button class="figma-btn-ghost" id="btn-close-adv-menu">×</button>
        </div>

        <div style="padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Group 1: Algoritmo -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-algo" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--f-blue)" stroke-width="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/></svg>
                <div>
                  <div style="font-size:0.98rem; font-weight:700; color:#fff;">Personalizado</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary);">Ajustes predeterminados del algoritmo</div>
                </div>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 2: Audio y Estilo -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-tts" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🔊</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Texto a voz</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-text-secondary); font-size:0.85rem;">${t.settings.ttsVoiceLang}</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-style" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🗂</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Estilo de la tarjeta</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 3: Compartir y Biblioteca -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-share" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬆</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Compartir mazo</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-text-secondary); font-size:0.85rem;">Off</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-publish" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🖫</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Publicar en la biblioteca</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 4: Acciones Avanzadas -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-ai" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem; color:#ec4899;">✨</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Generar tarjetas con IA</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="apple-badge-beta">Beta</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-import" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬇</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Importar tarjetas</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-rename" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">✏️</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Cambiar el nombre del mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-move" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">↪</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Mover mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-duplicate" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🗎</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Duplicar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-reset" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">↺</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Restablecer progreso</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-archive" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">📥</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Archivar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-export" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬆</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Exportar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-delete" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem; color:#ef4444;">🗑️</span>
                <span style="font-size:0.98rem; font-weight:700; color:#ef4444;">Eliminar mazo</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;document.body.insertAdjacentHTML("beforeend",a),(n=document.getElementById("adv-row-rename"))==null||n.addEventListener("click",()=>{me.showPrompt({title:"Renombrar Mazo",defaultValue:t.name,confirmText:"Guardar",onConfirm:z=>{var k;z&&z.trim()&&(j.renameDeck(t.id,z.trim()),(k=document.getElementById("modal-adv-menu-root"))==null||k.remove(),r.onActionCompleted())}})}),(o=document.getElementById("adv-row-duplicate"))==null||o.addEventListener("click",()=>{var z;j.duplicateDeck(t.id),(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),r.onActionCompleted()}),(l=document.getElementById("adv-row-reset"))==null||l.addEventListener("click",()=>{me.showConfirm({title:"Restablecer Progreso",message:`¿Estás seguro de restablecer todo el progreso de estudio en "${t.name}"? Todas las tarjetas volverán al estado nuevo.`,confirmText:"Restablecer",isDanger:!0,onConfirm:()=>{var z;j.resetDeckProgress(t.id),(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),r.onActionCompleted()}})}),(c=document.getElementById("adv-row-archive"))==null||c.addEventListener("click",()=>{me.showConfirm({title:"Archivar Mazo",message:`¿Deseas archivar el mazo "${t.name}"?`,confirmText:"Archivar",onConfirm:()=>{var z;j.archiveDeck(t.id),(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),r.onActionCompleted()}})}),(m=document.getElementById("adv-row-export"))==null||m.addEventListener("click",()=>{const z=j.exportDeck(t.id),k=new Blob([z],{type:"application/json"}),M=URL.createObjectURL(k),A=document.createElement("a");A.href=M,A.download=`${t.name.toLowerCase().replace(/\s+/g,"_")}_backup.json`,A.click()}),(h=document.getElementById("adv-row-delete"))==null||h.addEventListener("click",()=>{me.showConfirm({title:"Eliminar Mazo Definitivamente",message:`¿ELIMINAR DEFINITIVAMENTE el mazo "${t.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`,confirmText:"Eliminar Mazo",isDanger:!0,onConfirm:()=>{var z;j.deleteDeck(t.id),(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),r.onActionCompleted()}})}),(f=document.getElementById("adv-row-ai"))==null||f.addEventListener("click",()=>{var z;(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),$a({deckId:t.id,onBatchAdded:()=>r.onActionCompleted(),onClose:()=>{}})}),(y=document.getElementById("adv-row-import"))==null||y.addEventListener("click",()=>{var z;(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),Q0({deckId:t.id,onImported:()=>r.onActionCompleted(),onClose:()=>{}})}),(g=document.getElementById("adv-row-algo"))==null||g.addEventListener("click",()=>{var z;(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),qa({deck:t,onSaved:()=>r.onActionCompleted(),onClose:()=>{}})});const i=()=>{var z;(z=document.getElementById("modal-adv-menu-root"))==null||z.remove(),r.onClose()};(C=document.getElementById("btn-close-adv-menu"))==null||C.addEventListener("click",i)}function hr(r){var c,m,h,f,y,g;const e=document.getElementById("modal-deck-settings-root");e&&e.remove();const t=r.deck,a=t.settings.algorithmType==="fsrs"?"FSRS (Inteligente)":t.settings.algorithmType==="quick"?"Revisión rápida":t.settings.algorithmType==="languages"?"Aprendizaje de idiomas":t.settings.algorithmType==="medical"?"Aprendizaje médico":t.settings.algorithmType==="general"?"Repaso espaciado general":"Personalizado",i=document.createElement("div");i.id="modal-deck-settings-root",i.className="apple-modal-overlay",i.innerHTML=`
    <div class="apple-modal-content apple-glass-panel" style="max-width:520px; width:92%; padding:0; overflow:hidden;">
      
      <!-- Header -->
      <div style="padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <span style="font-size:0.75rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase;">Ajustes de Mazo</span>
          <h2 style="font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">${t.name}</h2>
        </div>
        <button id="btn-close-deck-settings" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.4rem; cursor:pointer; padding:4px;">✕</button>
      </div>

      <!-- Body Rows -->
      <div style="padding:20px 24px; display:flex; flex-direction:column; gap:16px;">
        
        <!-- Algorithm Selector Row -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-select-algo" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Algoritmo de aprendizaje</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:0.95rem;" id="val-algo-label">${a}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Mezclar tarjetas</div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-mix-cards" ${t.settings.mixCards?"checked":""} />
              <span class="apple-slider"></span>
            </label>
          </div>
        </div>

        <!-- Limits -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-new-cards-day" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Tarjetas nuevas por día</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-new-cards">${t.settings.newCardsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="row-max-cards-day" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Máximo de tarjetas por día</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-max-cards">${t.settings.maxReviewsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Neuro-Ergonomic Micro-Games Section -->
        <div class="apple-card-grouped">
          <div class="apple-list-row">
            <div>
              <div style="font-size:0.95rem; font-weight:600; color:#fff;">🎮 Minijuegos de descanso</div>
              <div style="font-size:0.75rem; color:var(--f-text-muted);">Sin carga alostática ni fatiga</div>
            </div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-microgames" ${t.settings.enableMicroGames!==!1?"checked":""} />
              <span class="apple-slider"></span>
            </label>
          </div>

          <div class="apple-list-row" id="row-microgame-freq" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Frecuencia de juego</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:0.95rem;" id="val-microgame-freq">
                ${(t.settings.microGameInterval||5)===0?"Desactivado":`Cada ${t.settings.microGameInterval||5} tarjetas`}
              </span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Advanced settings button -->
        <button class="apple-btn-secondary" id="btn-open-advanced-menu" style="padding:14px; border-radius:14px; font-weight:700; font-size:0.95rem;">
          Configuraciones avanzadas
        </button>

      </div>

    </div>
  `,document.body.appendChild(i);const n=()=>{i.remove(),r.onClose()};(c=i.querySelector("#btn-close-deck-settings"))==null||c.addEventListener("click",n),i.addEventListener("click",C=>{C.target===i&&n()});const o=i.querySelector("#toggle-mix-cards");o==null||o.addEventListener("change",()=>{j.updateDeck(t.id,{settings:{...t.settings,mixCards:o.checked}})});const l=i.querySelector("#toggle-microgames");l==null||l.addEventListener("change",()=>{j.updateDeck(t.id,{settings:{...t.settings,enableMicroGames:l.checked}})}),(m=i.querySelector("#row-microgame-freq"))==null||m.addEventListener("click",()=>{me.showPrompt({title:"Frecuencia de Minijuegos",message:"¿Cada cuántas tarjetas deseas una pausa de minijuego? (ej: 5, 10, 15, 20 o 0 para desactivar)",defaultValue:String(t.settings.microGameInterval!==void 0?t.settings.microGameInterval:5),inputType:"number",confirmText:"Guardar",onConfirm:C=>{if(C!==null&&!isNaN(Number(C))){const z=Math.max(0,parseInt(C,10));j.updateDeck(t.id,{settings:{...t.settings,microGameInterval:z,enableMicroGames:z>0}});const k=i.querySelector("#val-microgame-freq");k&&(k.textContent=z===0?"Desactivado":`Cada ${z} tarjetas`)}}})}),(h=i.querySelector("#row-new-cards-day"))==null||h.addEventListener("click",()=>{me.showPrompt({title:"Tarjetas Nuevas por Día",defaultValue:String(t.settings.newCardsPerDay),inputType:"number",confirmText:"Guardar",onConfirm:C=>{if(C&&!isNaN(Number(C))){const z=Math.max(1,parseInt(C,10));j.updateDeck(t.id,{settings:{...t.settings,newCardsPerDay:z}});const k=i.querySelector("#val-new-cards");k&&(k.textContent=String(z))}}})}),(f=i.querySelector("#row-max-cards-day"))==null||f.addEventListener("click",()=>{me.showPrompt({title:"Máximo de Tarjetas por Día",defaultValue:String(t.settings.maxReviewsPerDay),inputType:"number",confirmText:"Guardar",onConfirm:C=>{if(C&&!isNaN(Number(C))){const z=Math.max(1,parseInt(C,10));j.updateDeck(t.id,{settings:{...t.settings,maxReviewsPerDay:z}});const k=i.querySelector("#val-max-cards");k&&(k.textContent=String(z))}}})}),(y=i.querySelector("#row-select-algo"))==null||y.addEventListener("click",()=>{i.remove(),qa({deck:t,onSaved:()=>{hr(r),r.onSaved()},onClose:()=>{hr(r)}})}),(g=i.querySelector("#btn-open-advanced-menu"))==null||g.addEventListener("click",()=>{i.remove(),bn({deck:t,onActionCompleted:()=>{r.onSaved()},onClose:()=>{hr(r)}})})}function yn(r){const e=j.getSubdecks(r.id);return`
    <div>
      <!-- Action Header with Breadcrumbs -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs">
          <button class="figma-icon-btn-dark" id="btn-back-to-inicio" style="margin-right:6px;" title="Volver a Inicio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="figma-crumb-link" id="crumb-inicio">Inicio</span>
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-current">${r.name}</span>
        </div>

        <div class="figma-header-actions-group">
          <button class="figma-icon-btn-dark" id="btn-edit-subdeck" title="Ajustes de Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          <button class="figma-btn-outline" id="btn-sub-import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Importar en lote
          </button>

          <button class="figma-btn-white-pill" id="btn-sub-manual-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Agregar manualmente
          </button>

          <button class="figma-icon-btn-dark" id="btn-subdeck-menu" title="Ajustes del Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <!-- Subdecks Container -->
      <div class="figma-card-container apple-glass-panel">
        ${e.length===0?`
          <div style="padding:40px 20px; text-align:center;">
            <p style="color:var(--f-text-secondary); margin-bottom:14px;">No hay submazos en ${r.name}.</p>
            <button class="figma-btn-blue-pill" id="btn-create-child-subdeck" style="margin: 0 auto;">
              + Crear Submazo
            </button>
          </div>
        `:e.map(t=>{const a=j.getDeckStats(t.id);return`
            <div class="figma-deck-row" data-subdeck-id="${t.id}">
              <div class="figma-deck-left">
                <div style="color:var(--f-text-muted); font-size:1.3rem; font-weight:700;">+</div>
                <div>
                  <div class="figma-deck-title" style="font-size:1.15rem;">${t.name}</div>
                  <div class="figma-deck-subtext">Tarjetas para hoy: ${a.dueCards>0?a.dueCards:a.totalCards}</div>
                </div>
              </div>

              <span class="figma-chevron">›</span>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function xn(r,e,t){var i,n,o,l,c,m,h,f;(i=r.querySelector("#btn-subdeck-back"))==null||i.addEventListener("click",()=>t.onBack()),(n=r.querySelector("#btn-back-to-inicio"))==null||n.addEventListener("click",()=>t.onBack()),(o=r.querySelector("#crumb-inicio"))==null||o.addEventListener("click",()=>t.onBack()),r.querySelectorAll(".figma-deck-row").forEach(y=>{y.addEventListener("click",()=>{const g=y.dataset.subdeckId;g&&t.onSelectSubdeck(g)})});const a=()=>{hr({deck:e,onSaved:()=>t.onConfigureDeck(e.id),onClose:()=>{}})};(l=r.querySelector("#btn-edit-subdeck"))==null||l.addEventListener("click",a),(c=r.querySelector("#btn-subdeck-menu"))==null||c.addEventListener("click",a),(m=r.querySelector("#btn-sub-manual-add"))==null||m.addEventListener("click",()=>t.onAddCard(e.id)),(h=r.querySelector("#btn-sub-import"))==null||h.addEventListener("click",()=>t.onImportBatch(e.id)),(f=r.querySelector("#btn-create-child-subdeck"))==null||f.addEventListener("click",()=>{me.showPrompt({title:`Nuevo Submazo en "${e.name}"`,placeholder:"Nombre del submazo...",confirmText:"Crear",onConfirm:y=>{y&&y.trim()&&(j.createDeck({name:y.trim(),parentId:e.id}),t.onConfigureDeck(e.id))}})})}class B extends Error{constructor(e,t){var a="KaTeX parse error: "+e,i,n,o=t&&t.loc;if(o&&o.start<=o.end){var l=o.lexer.input;i=o.start,n=o.end,i===l.length?a+=" at end of input: ":a+=" at position "+(i+1)+": ";var c=l.slice(i,n).replace(/[^]/g,"$&̲"),m;i>15?m="…"+l.slice(i-15,i):m=l.slice(0,i);var h;n+15<l.length?h=l.slice(n,n+15)+"…":h=l.slice(n),a+=m+c+h}super(a),this.name="ParseError",this.position=void 0,this.length=void 0,this.rawMessage=void 0,Object.setPrototypeOf(this,B.prototype),this.position=i,i!=null&&n!=null&&(this.length=n-i),this.rawMessage=e}}var wn=/([A-Z])/g,kn=r=>r.replace(wn,"-$1").toLowerCase(),Sn={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#x27;"},Mn=/[&><"']/g,Le=r=>String(r).replace(Mn,e=>Sn[e]),fr=r=>r.type==="ordgroup"||r.type==="color"?r.body.length===1?fr(r.body[0]):r:r.type==="font"?fr(r.body):r,zn=new Set(["mathord","textord","atom"]),ot=r=>zn.has(fr(r).type),Cn=r=>{var e=/^[\x00-\x20]*([^\\/#?]*?)(:|&#0*58|&#x0*3a|&colon)/i.exec(r);return e?e[2]!==":"||!/^[a-zA-Z][a-zA-Z0-9+\-.]*$/.test(e[1])?null:e[1].toLowerCase():"_relative"},pa={displayMode:{type:"boolean",description:"Render math in display mode, which puts the math in display style (so \\int and \\sum are large, for example), and centers the math on the page on its own line.",cli:"-d, --display-mode"},output:{type:{enum:["htmlAndMathml","html","mathml"]},description:"Determines the markup language of the output.",cli:"-F, --format <type>"},leqno:{type:"boolean",description:"Render display math in leqno style (left-justified tags)."},fleqn:{type:"boolean",description:"Render display math flush left."},throwOnError:{type:"boolean",default:!0,cli:"-t, --no-throw-on-error",cliDescription:"Render errors (in the color given by --error-color) instead of throwing a ParseError exception when encountering an error."},errorColor:{type:"string",default:"#cc0000",cli:"-c, --error-color <color>",cliDescription:"A color string given in the format 'rgb' or 'rrggbb' (no #). This option determines the color of errors rendered by the -t option.",cliProcessor:r=>"#"+r},macros:{type:"object",cli:"-m, --macro <def>",cliDescription:"Define custom macro of the form '\\foo:expansion' (use multiple -m arguments for multiple macros).",cliDefault:[],cliProcessor:(r,e)=>(e.push(r),e)},minRuleThickness:{type:"number",description:"Specifies a minimum thickness, in ems, for fraction lines, `\\sqrt` top lines, `{array}` vertical lines, `\\hline`, `\\hdashline`, `\\underline`, `\\overline`, and the borders of `\\fbox`, `\\boxed`, and `\\fcolorbox`.",processor:r=>Math.max(0,r),cli:"--min-rule-thickness <size>",cliProcessor:parseFloat},colorIsTextColor:{type:"boolean",description:"Makes \\color behave like LaTeX's 2-argument \\textcolor, instead of LaTeX's one-argument \\color mode change.",cli:"-b, --color-is-text-color"},strict:{type:[{enum:["warn","ignore","error"]},"boolean","function"],description:"Turn on strict / LaTeX faithfulness mode, which throws an error if the input uses features that are not supported by LaTeX.",cli:"-S, --strict",cliDefault:!1},trust:{type:["boolean","function"],description:"Trust the input, enabling all HTML features such as \\url.",cli:"-T, --trust"},maxSize:{type:"number",default:1/0,description:"If non-zero, all user-specified sizes, e.g. in \\rule{500em}{500em}, will be capped to maxSize ems. Otherwise, elements and spaces can be arbitrarily large",processor:r=>Math.max(0,r),cli:"-s, --max-size <n>",cliProcessor:parseInt},maxExpand:{type:"number",default:1e3,description:"Limit the number of macro expansions to the specified number, to prevent e.g. infinite macro loops. If set to Infinity, the macro expander will try to fully expand as in LaTeX.",processor:r=>Math.max(0,r),cli:"-e, --max-expand <n>",cliProcessor:r=>r==="Infinity"?1/0:parseInt(r)},globalGroup:{type:"boolean",cli:!1}};function An(r){if(typeof r!="string")return r.enum[0];switch(r){case"boolean":return!1;case"string":return"";case"number":return 0;case"object":return{};default:throw new Error("Unexpected schema type; settings must declare an explicit default.")}}function Tn(r){if(r.default!==void 0)return r.default;var e=Array.isArray(r.type)?r.type[0]:r.type;return An(e)}function En(r,e,t,a){var i=t[e];r[e]=i!==void 0?a.processor?a.processor(i):i:Tn(a)}class Ra{constructor(e){e===void 0&&(e={}),this.displayMode=void 0,this.output=void 0,this.leqno=void 0,this.fleqn=void 0,this.throwOnError=void 0,this.errorColor=void 0,this.macros=void 0,this.minRuleThickness=void 0,this.colorIsTextColor=void 0,this.strict=void 0,this.trust=void 0,this.maxSize=void 0,this.maxExpand=void 0,this.globalGroup=void 0,e=e||{};for(var t of Object.keys(pa)){var a=pa[t];a&&En(this,t,e,a)}}reportNonstrict(e,t,a){var i=this.strict;if(typeof i=="function"&&(i=i(e,t,a)),!(!i||i==="ignore")){if(i===!0||i==="error")throw new B("LaTeX-incompatible input and strict mode is set to 'error': "+(t+" ["+e+"]"),a);i==="warn"?typeof console<"u"&&console.warn("LaTeX-incompatible input and strict mode is set to 'warn': "+(t+" ["+e+"]")):typeof console<"u"&&console.warn("LaTeX-incompatible input and strict mode is set to "+("unrecognized '"+i+"': "+t+" ["+e+"]"))}}useStrictBehavior(e,t,a){var i=this.strict;if(typeof i=="function")try{i=i(e,t,a)}catch{i="error"}return!i||i==="ignore"?!1:i===!0||i==="error"?!0:i==="warn"?(typeof console<"u"&&console.warn("LaTeX-incompatible input and strict mode is set to 'warn': "+(t+" ["+e+"]")),!1):(typeof console<"u"&&console.warn("LaTeX-incompatible input and strict mode is set to "+("unrecognized '"+i+"': "+t+" ["+e+"]")),!1)}isTrusted(e){if("url"in e&&e.url&&!e.protocol){var t=Cn(e.url);if(t==null)return!1;e.protocol=t}var a=typeof this.trust=="function"?this.trust(e):this.trust;return!!a}}class ct{constructor(e,t,a){this.id=void 0,this.size=void 0,this.cramped=void 0,this.id=e,this.size=t,this.cramped=a}sup(){return Je[In[this.id]]}sub(){return Je[Dn[this.id]]}fracNum(){return Je[Bn[this.id]]}fracDen(){return Je[Ln[this.id]]}cramp(){return Je[qn[this.id]]}text(){return Je[$n[this.id]]}isTight(){return this.size>=2}}var Pa=0,gr=1,Pt=2,nt=3,er=4,Ye=5,jt=6,Pe=7,Je=[new ct(Pa,0,!1),new ct(gr,0,!0),new ct(Pt,1,!1),new ct(nt,1,!0),new ct(er,2,!1),new ct(Ye,2,!0),new ct(jt,3,!1),new ct(Pe,3,!0)],In=[er,Ye,er,Ye,jt,Pe,jt,Pe],Dn=[Ye,Ye,Ye,Ye,Pe,Pe,Pe,Pe],Bn=[Pt,nt,er,Ye,jt,Pe,jt,Pe],Ln=[nt,nt,Ye,Ye,Pe,Pe,Pe,Pe],qn=[gr,gr,nt,nt,Ye,Ye,Pe,Pe],$n=[Pa,gr,Pt,nt,Pt,nt,Pt,nt],se={DISPLAY:Je[Pa],TEXT:Je[Pt],SCRIPT:Je[er],SCRIPTSCRIPT:Je[jt]},ha=[{name:"latin",blocks:[[256,591],[768,879]]},{name:"cyrillic",blocks:[[1024,1279]]},{name:"armenian",blocks:[[1328,1423]]},{name:"brahmic",blocks:[[2304,4255]]},{name:"georgian",blocks:[[4256,4351]]},{name:"cjk",blocks:[[12288,12543],[19968,40879],[65280,65376]]},{name:"hangul",blocks:[[44032,55215]]}];function Rn(r){for(var e=0;e<ha.length;e++)for(var t=ha[e],a=0;a<t.blocks.length;a++){var i=t.blocks[a];if(r>=i[0]&&r<=i[1])return t.name}return null}var vr=[];ha.forEach(r=>r.blocks.forEach(e=>vr.push(...e)));function _0(r){for(var e=0;e<vr.length;e+=2)if(r>=vr[e]&&r<=vr[e+1])return!0;return!1}var Ee=r=>r+" "+r,qt=80,Pn=function(e,t){return"M95,"+(622+e+t)+`
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l`+e/2.075+" -"+e+`
c5.3,-9.3,12,-14,20,-14
H400000v`+(40+e)+`H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M`+(834+e)+" "+t+"h400000v"+(40+e)+"h-400000z"},Fn=function(e,t){return"M263,"+(601+e+t)+`c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l`+e/2.084+" -"+e+`
c4.7,-7.3,11,-11,19,-11
H40000v`+(40+e)+`H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M`+(1001+e)+" "+t+"h400000v"+(40+e)+"h-400000z"},jn=function(e,t){return"M983 "+(10+e+t)+`
l`+e/3.13+" -"+e+`
c4,-6.7,10,-10,18,-10 H400000v`+(40+e)+`
H1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7
s-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744
c-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30
c26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722
c56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5
c53.7,-170.3,84.5,-266.8,92.5,-289.5z
M`+(1001+e)+" "+t+"h400000v"+(40+e)+"h-400000z"},Nn=function(e,t){return"M424,"+(2398+e+t)+`
c-1.3,-0.7,-38.5,-172,-111.5,-514c-73,-342,-109.8,-513.3,-110.5,-514
c0,-2,-10.7,14.3,-32,49c-4.7,7.3,-9.8,15.7,-15.5,25c-5.7,9.3,-9.8,16,-12.5,20
s-5,7,-5,7c-4,-3.3,-8.3,-7.7,-13,-13s-13,-13,-13,-13s76,-122,76,-122s77,-121,77,-121
s209,968,209,968c0,-2,84.7,-361.7,254,-1079c169.3,-717.3,254.7,-1077.7,256,-1081
l`+e/4.223+" -"+e+`c4,-6.7,10,-10,18,-10 H400000
v`+(40+e)+`H1014.6
s-87.3,378.7,-272.6,1166c-185.3,787.3,-279.3,1182.3,-282,1185
c-2,6,-10,9,-24,9
c-8,0,-12,-0.7,-12,-2z M`+(1001+e)+" "+t+`
h400000v`+(40+e)+"h-400000z"},On=function(e,t){return"M473,"+(2713+e+t)+`
c339.3,-1799.3,509.3,-2700,510,-2702 l`+e/5.298+" -"+e+`
c3.3,-7.3,9.3,-11,18,-11 H400000v`+(40+e)+`H1017.7
s-90.5,478,-276.2,1466c-185.7,988,-279.5,1483,-281.5,1485c-2,6,-10,9,-24,9
c-8,0,-12,-0.7,-12,-2c0,-1.3,-5.3,-32,-16,-92c-50.7,-293.3,-119.7,-693.3,-207,-1200
c0,-1.3,-5.3,8.7,-16,30c-10.7,21.3,-21.3,42.7,-32,64s-16,33,-16,33s-26,-26,-26,-26
s76,-153,76,-153s77,-151,77,-151c0.7,0.7,35.7,202,105,604c67.3,400.7,102,602.7,104,
606zM`+(1001+e)+" "+t+"h400000v"+(40+e)+"H1017.7z"},Hn=function(e){var t=e/2;return"M400000 "+e+" H0 L"+t+" 0 l65 45 L145 "+(e-80)+" H400000z"},Vn=function(e,t,a){var i=a-54-t-e;return"M702 "+(e+t)+"H400000"+(40+e)+`
H742v`+i+`l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1
h-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170
c-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667
219 661 l218 661zM702 `+t+"H400000v"+(40+e)+"H742z"},Gn=function(e,t,a){t=1e3*t;var i="";switch(e){case"sqrtMain":i=Pn(t,qt);break;case"sqrtSize1":i=Fn(t,qt);break;case"sqrtSize2":i=jn(t,qt);break;case"sqrtSize3":i=Nn(t,qt);break;case"sqrtSize4":i=On(t,qt);break;case"sqrtTall":i=Vn(t,qt,a)}return i},Un=function(e,t){switch(e){case"⎜":return Ee("M291 0 H417 V"+t+" H291z");case"∣":return Ee("M145 0 H188 V"+t+" H145z");case"∥":return Ee("M145 0 H188 V"+t+" H145z")+Ee("M367 0 H410 V"+t+" H367z");case"⎟":return Ee("M457 0 H583 V"+t+" H457z");case"⎢":return Ee("M319 0 H403 V"+t+" H319z");case"⎥":return Ee("M263 0 H347 V"+t+" H263z");case"⎪":return Ee("M384 0 H504 V"+t+" H384z");case"⏐":return Ee("M312 0 H355 V"+t+" H312z");case"‖":return Ee("M257 0 H300 V"+t+" H257z")+Ee("M478 0 H521 V"+t+" H478z");default:return""}},m0={doubleleftarrow:`M262 157
l10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3
 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28
 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5
c2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5
 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87
-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7
-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z
m8 0v40h399730v-40zm0 194v40h399730v-40z`,doublerightarrow:`M399738 392l
-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5
 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88
-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68
-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18
-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782
c-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3
-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z`,leftarrow:`M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`,leftbrace:`M6 548l-6-6v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117
-45 179-50h399577v120H403c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7
 5-6 9-10 13-.7 1-7.3 1-20 1H6z`,leftbraceunder:`M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z`,leftgroup:`M400000 80
H435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0
 435 0h399565z`,leftgroupunder:`M400000 262
H435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219
 435 219h399565z`,leftharpoon:`M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3
-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5
-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7
-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z`,leftharpoonplus:`M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5
 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3
-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7-196 228-6.7 4.7
-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40zM0 435v40h400000v-40z
m0 0v40h400000v-40z`,leftharpoondown:`M7 241c-4 4-6.333 8.667-7 14 0 5.333.667 9 2 11s5.333
 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667 6.333 16.333 9 17 2 .667 5
 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21-32-87.333-82.667-157.667
-152-211l-3-3h399907v-40zM93 281 H400000 v-40L7 241z`,leftharpoondownplus:`M7 435c-4 4-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12
 10c90.7 54 156 130 196 228 3.3 10.7 6.3 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7
-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7-157.7-152-211l-3-3h399907v-40H7zm93 0
v40h399900v-40zM0 241v40h399900v-40zm0 0v40h399900v-40z`,lefthook:`M400000 281 H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5
-83.5C70.8 58.2 104 47 142 47 c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3
-68.7 15.7-86 37-10 12-15 25.3-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21
 71.5 23h399859zM103 281v-40h399897v40z`,leftlinesegment:Ee("M40 281 V428 H0 V94 H40 V241 H400000 v40z"),leftbracketunder:Ee("M0 0 h120 V290 H399995 v120 H0z"),leftbracketover:Ee("M0 440 h120 V150 H399995 v-120 H0z"),leftmapsto:Ee("M40 281 V448H0V74H40V241H400000v40z"),leftToFrom:`M0 147h400000v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23
-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8
c28.7-32 52-65.7 70-101 10.7-23.3 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3
 68 321 0 361zm0-174v-40h399900v40zm100 154v40h399900v-40z`,longequal:Ee("M0 50 h400000 v40H0z m0 194h40000v40H0z"),midbrace:`M200428 334
c-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14
-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7
 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11
 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z`,midbraceunder:`M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z`,oiintSize1:`M512.6 71.6c272.6 0 320.3 106.8 320.3 178.2 0 70.8-47.7 177.6
-320.3 177.6S193.1 320.6 193.1 249.8c0-71.4 46.9-178.2 319.5-178.2z
m368.1 178.2c0-86.4-60.9-215.4-368.1-215.4-306.4 0-367.3 129-367.3 215.4 0 85.8
60.9 214.8 367.3 214.8 307.2 0 368.1-129 368.1-214.8z`,oiintSize2:`M757.8 100.1c384.7 0 451.1 137.6 451.1 230 0 91.3-66.4 228.8
-451.1 228.8-386.3 0-452.7-137.5-452.7-228.8 0-92.4 66.4-230 452.7-230z
m502.4 230c0-111.2-82.4-277.2-502.4-277.2s-504 166-504 277.2
c0 110 84 276 504 276s502.4-166 502.4-276z`,oiiintSize1:`M681.4 71.6c408.9 0 480.5 106.8 480.5 178.2 0 70.8-71.6 177.6
-480.5 177.6S202.1 320.6 202.1 249.8c0-71.4 70.5-178.2 479.3-178.2z
m525.8 178.2c0-86.4-86.8-215.4-525.7-215.4-437.9 0-524.7 129-524.7 215.4 0
85.8 86.8 214.8 524.7 214.8 438.9 0 525.7-129 525.7-214.8z`,oiiintSize2:`M1021.2 53c603.6 0 707.8 165.8 707.8 277.2 0 110-104.2 275.8
-707.8 275.8-606 0-710.2-165.8-710.2-275.8C311 218.8 415.2 53 1021.2 53z
m770.4 277.1c0-131.2-126.4-327.6-770.5-327.6S248.4 198.9 248.4 330.1
c0 130 128.8 326.4 772.7 326.4s770.5-196.4 770.5-326.4z`,rightarrow:`M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`,rightbrace:`M400000 542l
-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5
s-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1
c124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z`,rightbraceunder:`M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z`,rightgroup:`M0 80h399565c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0
 3-1 3-3v-38c-76-158-257-219-435-219H0z`,rightgroupunder:`M0 262h399565c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18
 0 2 0 3 1 3 3v38c-76 158-257 219-435 219H0z`,rightharpoon:`M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3
-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2
-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58
 69.2 92 94.5zm0 0v40h399900v-40z`,rightharpoonplus:`M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11
-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7
 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5z
m0 0v40h399900v-40z m100 194v40h399900v-40zm0 0v40h399900v-40z`,rightharpoondown:`M399747 511c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8
 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5
-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95
-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 241v40h399900v-40z`,rightharpoondownplus:`M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8
 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3
 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3
-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z
m0-194v40h400000v-40zm0 0v40h400000v-40z`,righthook:`M399859 241c-764 0 0 0 0 0 40-3.3 68.7-15.7 86-37 10-12 15-25.3
 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5-23-17.3-1.3-26-8-26-20 0
-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21 16.7 14 11.2 21 33.5 21
 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z M0 281v-40h399859v40z`,rightlinesegment:Ee("M399960 241 V94 h40 V428 h-40 V281 H0 v-40z"),rightbracketunder:Ee("M399995 0 h-120 V290 H0 v120 H400000z"),rightbracketover:Ee("M399995 440 h-120 V150 H0 v-120 H399995z"),rightToFrom:`M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23
 1 0 1.3 5.3 13.7 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32
-52 65.7-70 101-10.7 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142
-167z M100 147v40h399900v-40zM0 341v40h399900v-40z`,twoheadleftarrow:`M0 167c68 40
 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69
-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3
-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19
-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101
 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z`,twoheadrightarrow:`M400000 167
c-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3
 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42
 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333
-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70
 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z`,tilde1:`M200 55.538c-77 0-168 73.953-177 73.953-3 0-7
-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0
 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0
 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128
-68.267.847-113-73.952-191-73.952z`,tilde2:`M344 55.266c-142 0-300.638 81.316-311.5 86.418
-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9
 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114
c1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751
 181.476 676 181.476c-149 0-189-126.21-332-126.21z`,tilde3:`M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457
-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0
 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697
 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696
 -338 0-409-156.573-744-156.573z`,tilde4:`M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345
-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409
 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9
 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409
 -175.236-744-175.236z`,vec:`M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
-1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
-7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
c-16-25.333-24-45-24-59z`,widehat1:`M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22
c-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z`,widehat2:`M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,widehat3:`M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,widehat4:`M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,widecheck1:`M529,159h5l519,-115c5,-1,9,-5,9,-10c0,-1,-1,-2,-1,-3l-4,-22c-1,
-5,-5,-9,-11,-9h-2l-512,92l-513,-92h-2c-5,0,-9,4,-11,9l-5,22c-1,6,2,12,8,13z`,widecheck2:`M1181,220h2l1171,-176c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,153l-1167,-153h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,widecheck3:`M1181,280h2l1171,-236c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,213l-1167,-213h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,widecheck4:`M1181,340h2l1171,-296c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,273l-1167,-273h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,baraboveleftarrow:`M400000 620h-399890l3 -3c68.7 -52.7 113.7 -120 135 -202
c4 -14.7 6 -23 6 -25c0 -7.3 -7 -11 -21 -11c-8 0 -13.2 0.8 -15.5 2.5
c-2.3 1.7 -4.2 5.8 -5.5 12.5c-1.3 4.7 -2.7 10.3 -4 17c-12 48.7 -34.8 92 -68.5 130
s-74.2 66.3 -121.5 85c-10 4 -16 7.7 -18 11c0 8.7 6 14.3 18 17c47.3 18.7 87.8 47
121.5 85s56.5 81.3 68.5 130c0.7 2 1.3 5 2 9s1.2 6.7 1.5 8c0.3 1.3 1 3.3 2 6
s2.2 4.5 3.5 5.5c1.3 1 3.3 1.8 6 2.5s6 1 10 1c14 0 21 -3.7 21 -11
c0 -2 -2 -10.3 -6 -25c-20 -79.3 -65 -146.7 -135 -202l-3 -3h399890z
M100 620v40h399900v-40z M0 241v40h399900v-40zM0 241v40h399900v-40z`,rightarrowabovebar:`M0 241v40h399891c-47.3 35.3-84 78-110 128-16.7 32
-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20 11 8 0
13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7 39
-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85-40.5
-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
151.7 139 205zm96 379h399894v40H0zm0 0h399904v40H0z`,baraboveshortleftharpoon:`M507,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11
c1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17
c2,0.7,5,1,9,1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21
c-32,-87.3,-82.7,-157.7,-152,-211c0,0,-3,-3,-3,-3l399351,0l0,-40
c-398570,0,-399437,0,-399437,0z M593 435 v40 H399500 v-40z
M0 281 v-40 H399908 v40z M0 281 v-40 H399908 v40z`,rightharpoonaboveshortbar:`M0,241 l0,40c399126,0,399993,0,399993,0
c4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,
-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6
c-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z
M0 241 v40 H399908 v-40z M0 475 v-40 H399500 v40z M0 475 v-40 H399500 v40z`,shortbaraboveleftharpoon:`M7,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11
c1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17c2,0.7,5,1,9,
1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21c-32,-87.3,-82.7,-157.7,
-152,-211c0,0,-3,-3,-3,-3l399907,0l0,-40c-399126,0,-399993,0,-399993,0z
M93 435 v40 H400000 v-40z M500 241 v40 H400000 v-40z M500 241 v40 H400000 v-40z`,shortrightharpoonabovebar:`M53,241l0,40c398570,0,399437,0,399437,0
c4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,
-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6
c-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z
M500 241 v40 H399408 v-40z M500 435 v40 H400000 v-40z`},Wn=function(e,t){switch(e){case"lbrack":return"M403 1759 V84 H666 V0 H319 V1759 v"+t+` v1759 v84 h347 v-84
H403z M403 1759 V0 H319 V1759 v`+t+" v1759 v84 h84z";case"rbrack":return"M347 1759 V0 H0 V84 H263 V1759 v"+t+` v1759 H0 v84 H347z
M347 1759 V0 H263 V1759 v`+t+" v1759 h84z";case"vert":return"M145 15 v585 v"+t+` v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v`+-t+` v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v`+t+" v585 h43z";case"doublevert":return"M145 15 v585 v"+t+` v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v`+-t+` v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v`+t+` v585 h43z
M367 15 v585 v`+t+` v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v`+-t+` v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v`+t+" v585 h43z";case"lfloor":return"M319 602 V0 H403 V602 v"+t+` v1715 h263 v84 H319z
MM319 602 V0 H403 V602 v`+t+" v1715 H319z";case"rfloor":return"M319 602 V0 H403 V602 v"+t+` v1799 H0 v-84 H319z
MM319 602 V0 H403 V602 v`+t+" v1715 H319z";case"lceil":return"M403 1759 V84 H666 V0 H319 V1759 v"+t+` v602 h84z
M403 1759 V0 H319 V1759 v`+t+" v602 h84z";case"rceil":return"M347 1759 V0 H0 V84 H263 V1759 v"+t+` v602 h84z
M347 1759 V0 h-84 V1759 v`+t+" v602 h84z";case"lparen":return`M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,`+(t+84)+`c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-`+(t+92)+`c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z`;case"rparen":return`M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,`+(t+9)+`
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-`+(t+144)+`c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z`;default:throw new Error("Unknown stretchy delimiter.")}};function Xn(r){return"toText"in r}class Ht{constructor(e){this.children=void 0,this.classes=void 0,this.height=void 0,this.depth=void 0,this.maxFontSize=void 0,this.style=void 0,this.children=e,this.classes=[],this.height=0,this.depth=0,this.maxFontSize=0,this.style={}}hasClass(e){return this.classes.includes(e)}toNode(){for(var e=document.createDocumentFragment(),t=0;t<this.children.length;t++)e.appendChild(this.children[t].toNode());return e}toMarkup(){for(var e="",t=0;t<this.children.length;t++)e+=this.children[t].toMarkup();return e}toText(){return this.children.map(e=>{if(Xn(e))return e.toText();throw new Error("Expected MathDomNode with toText, got "+e.constructor.name)}).join("")}}var fa={pt:1,mm:7227/2540,cm:7227/254,in:72.27,bp:803/800,pc:12,dd:1238/1157,cc:14856/1157,nd:685/642,nc:1370/107,sp:1/65536,px:803/800},Yn={ex:!0,em:!0,mu:!0},ei=function(e){return typeof e!="string"&&(e=e.unit),e in fa||e in Yn||e==="ex"},Se=function(e,t){var a;if(e.unit in fa)a=fa[e.unit]/t.fontMetrics().ptPerEm/t.sizeMultiplier;else if(e.unit==="mu")a=t.fontMetrics().cssEmPerMu;else{var i;if(t.style.isTight()?i=t.havingStyle(t.style.text()):i=t,e.unit==="ex")a=i.fontMetrics().xHeight;else if(e.unit==="em")a=i.fontMetrics().quad;else throw new B("Invalid unit: '"+e.unit+"'");i!==t&&(a*=i.sizeMultiplier/t.sizeMultiplier)}return Math.min(e.number*a,t.maxSize)},q=function(e){return+e.toFixed(4)+"em"},pt=function(e){return e.filter(t=>t).join(" ")},Fa=function(e){var t="";for(var a of Object.keys(e)){var i=e[a];i!==void 0&&(t+=kn(a)+":"+i+";")}return t},ti=function(e,t,a){if(this.classes=e||[],this.attributes={},this.height=0,this.depth=0,this.maxFontSize=0,this.style=a||{},t){t.style.isTight()&&this.classes.push("mtight");var i=t.getColor();i&&(this.style.color=i)}},ri=function(e){var t=document.createElement(e);t.className=pt(this.classes),Object.assign(t.style,this.style);for(var a of Object.keys(this.attributes))t.setAttribute(a,this.attributes[a]);for(var i=0;i<this.children.length;i++)t.appendChild(this.children[i].toNode());return t},Kn=/[\s"'>/=\x00-\x1f]/,ai=function(e){var t="<"+e;this.classes.length&&(t+=' class="'+Le(pt(this.classes))+'"');var a=Fa(this.style);a&&(t+=' style="'+Le(a)+'"');for(var i of Object.keys(this.attributes)){if(Kn.test(i))throw new B("Invalid attribute name '"+i+"'");t+=" "+i+'="'+Le(this.attributes[i])+'"'}t+=">";for(var n=0;n<this.children.length;n++)t+=this.children[n].toMarkup();return t+="</"+e+">",t};class Vt{constructor(e,t,a,i){this.children=void 0,this.attributes=void 0,this.classes=void 0,this.height=void 0,this.depth=void 0,this.width=void 0,this.maxFontSize=void 0,this.style=void 0,this.italic=void 0,ti.call(this,e,a,i),this.children=t||[]}setAttribute(e,t){this.attributes[e]=t}hasClass(e){return this.classes.includes(e)}toNode(){return ri.call(this,"span")}toMarkup(){return ai.call(this,"span")}}class Sr{constructor(e,t,a,i){this.children=void 0,this.attributes=void 0,this.classes=void 0,this.height=void 0,this.depth=void 0,this.maxFontSize=void 0,this.style=void 0,ti.call(this,t,i),this.children=a||[],this.setAttribute("href",e)}setAttribute(e,t){this.attributes[e]=t}hasClass(e){return this.classes.includes(e)}toNode(){return ri.call(this,"a")}toMarkup(){return ai.call(this,"a")}}class Zn{constructor(e,t,a){this.src=void 0,this.alt=void 0,this.classes=void 0,this.height=void 0,this.depth=void 0,this.maxFontSize=void 0,this.style=void 0,this.alt=t,this.src=e,this.classes=["mord"],this.height=0,this.depth=0,this.maxFontSize=0,this.style=a}hasClass(e){return this.classes.includes(e)}toNode(){var e=document.createElement("img");return e.src=this.src,e.alt=this.alt,e.className="mord",Object.assign(e.style,this.style),e}toMarkup(){var e='<img src="'+Le(this.src)+'"'+(' alt="'+Le(this.alt)+'"'),t=Fa(this.style);return t&&(e+=' style="'+Le(t)+'"'),e+="'/>",e}}var Jn={î:"ı̂",ï:"ı̈",í:"ı́",ì:"ı̀"};class Ge{constructor(e,t,a,i,n,o,l,c){this.text=void 0,this.height=void 0,this.depth=void 0,this.italic=void 0,this.skew=void 0,this.width=void 0,this.maxFontSize=void 0,this.classes=void 0,this.style=void 0,this.text=e,this.height=t||0,this.depth=a||0,this.italic=i||0,this.skew=n||0,this.width=o||0,this.classes=l||[],this.style=c||{},this.maxFontSize=0;var m=Rn(this.text.charCodeAt(0));m&&this.classes.push(m+"_fallback"),/[îïíì]/.test(this.text)&&(this.text=Jn[this.text])}hasClass(e){return this.classes.includes(e)}toNode(){var e=document.createTextNode(this.text),t=null;return this.italic>0&&(t=document.createElement("span"),t.style.marginRight=q(this.italic)),this.classes.length>0&&(t=t||document.createElement("span"),t.className=pt(this.classes)),Object.keys(this.style).length>0&&(t=t||document.createElement("span"),Object.assign(t.style,this.style)),t?(t.appendChild(e),t):e}toMarkup(){var e=!1,t="<span";this.classes.length&&(e=!0,t+=' class="',t+=Le(pt(this.classes)),t+='"');var a="";this.italic>0&&(a+="margin-right:"+q(this.italic)+";"),a+=Fa(this.style),a&&(e=!0,t+=' style="'+Le(a)+'"');var i=Le(this.text);return e?(t+=">",t+=i,t+="</span>",t):i}}class st{constructor(e,t){this.children=void 0,this.attributes=void 0,this.children=e||[],this.attributes=t||{}}toNode(){var e="http://www.w3.org/2000/svg",t=document.createElementNS(e,"svg");for(var a of Object.keys(this.attributes))t.setAttribute(a,this.attributes[a]);for(var i=0;i<this.children.length;i++)t.appendChild(this.children[i].toNode());return t}toMarkup(){var e='<svg xmlns="http://www.w3.org/2000/svg"';for(var t of Object.keys(this.attributes))e+=" "+t+'="'+Le(this.attributes[t])+'"';e+=">";for(var a=0;a<this.children.length;a++)e+=this.children[a].toMarkup();return e+="</svg>",e}}class ht{constructor(e,t){this.pathName=void 0,this.alternate=void 0,this.pathName=e,this.alternate=t}toNode(){var e="http://www.w3.org/2000/svg",t=document.createElementNS(e,"path");return this.alternate?t.setAttribute("d",this.alternate):t.setAttribute("d",m0[this.pathName]),t}toMarkup(){return this.alternate?'<path d="'+Le(this.alternate)+'"/>':'<path d="'+Le(m0[this.pathName])+'"/>'}}class va{constructor(e){this.attributes=void 0,this.attributes=e||{}}toNode(){var e="http://www.w3.org/2000/svg",t=document.createElementNS(e,"line");for(var a of Object.keys(this.attributes))t.setAttribute(a,this.attributes[a]);return t}toMarkup(){var e="<line";for(var t of Object.keys(this.attributes))e+=" "+t+'="'+Le(this.attributes[t])+'"';return e+="/>",e}}function Qn(r){if(r instanceof Ge)return r;throw new Error("Expected symbolNode but got "+String(r)+".")}function _n(r){if(r instanceof Vt)return r;throw new Error("Expected span<HtmlDomNode> but got "+String(r)+".")}var es=r=>r instanceof Vt||r instanceof Sr||r instanceof Ht,Qe={"AMS-Regular":{32:[0,0,0,0,.25],65:[0,.68889,0,0,.72222],66:[0,.68889,0,0,.66667],67:[0,.68889,0,0,.72222],68:[0,.68889,0,0,.72222],69:[0,.68889,0,0,.66667],70:[0,.68889,0,0,.61111],71:[0,.68889,0,0,.77778],72:[0,.68889,0,0,.77778],73:[0,.68889,0,0,.38889],74:[.16667,.68889,0,0,.5],75:[0,.68889,0,0,.77778],76:[0,.68889,0,0,.66667],77:[0,.68889,0,0,.94445],78:[0,.68889,0,0,.72222],79:[.16667,.68889,0,0,.77778],80:[0,.68889,0,0,.61111],81:[.16667,.68889,0,0,.77778],82:[0,.68889,0,0,.72222],83:[0,.68889,0,0,.55556],84:[0,.68889,0,0,.66667],85:[0,.68889,0,0,.72222],86:[0,.68889,0,0,.72222],87:[0,.68889,0,0,1],88:[0,.68889,0,0,.72222],89:[0,.68889,0,0,.72222],90:[0,.68889,0,0,.66667],107:[0,.68889,0,0,.55556],160:[0,0,0,0,.25],165:[0,.675,.025,0,.75],174:[.15559,.69224,0,0,.94666],240:[0,.68889,0,0,.55556],295:[0,.68889,0,0,.54028],710:[0,.825,0,0,2.33334],732:[0,.9,0,0,2.33334],770:[0,.825,0,0,2.33334],771:[0,.9,0,0,2.33334],989:[.08167,.58167,0,0,.77778],1008:[0,.43056,.04028,0,.66667],8245:[0,.54986,0,0,.275],8463:[0,.68889,0,0,.54028],8487:[0,.68889,0,0,.72222],8498:[0,.68889,0,0,.55556],8502:[0,.68889,0,0,.66667],8503:[0,.68889,0,0,.44445],8504:[0,.68889,0,0,.66667],8513:[0,.68889,0,0,.63889],8592:[-.03598,.46402,0,0,.5],8594:[-.03598,.46402,0,0,.5],8602:[-.13313,.36687,0,0,1],8603:[-.13313,.36687,0,0,1],8606:[.01354,.52239,0,0,1],8608:[.01354,.52239,0,0,1],8610:[.01354,.52239,0,0,1.11111],8611:[.01354,.52239,0,0,1.11111],8619:[0,.54986,0,0,1],8620:[0,.54986,0,0,1],8621:[-.13313,.37788,0,0,1.38889],8622:[-.13313,.36687,0,0,1],8624:[0,.69224,0,0,.5],8625:[0,.69224,0,0,.5],8630:[0,.43056,0,0,1],8631:[0,.43056,0,0,1],8634:[.08198,.58198,0,0,.77778],8635:[.08198,.58198,0,0,.77778],8638:[.19444,.69224,0,0,.41667],8639:[.19444,.69224,0,0,.41667],8642:[.19444,.69224,0,0,.41667],8643:[.19444,.69224,0,0,.41667],8644:[.1808,.675,0,0,1],8646:[.1808,.675,0,0,1],8647:[.1808,.675,0,0,1],8648:[.19444,.69224,0,0,.83334],8649:[.1808,.675,0,0,1],8650:[.19444,.69224,0,0,.83334],8651:[.01354,.52239,0,0,1],8652:[.01354,.52239,0,0,1],8653:[-.13313,.36687,0,0,1],8654:[-.13313,.36687,0,0,1],8655:[-.13313,.36687,0,0,1],8666:[.13667,.63667,0,0,1],8667:[.13667,.63667,0,0,1],8669:[-.13313,.37788,0,0,1],8672:[-.064,.437,0,0,1.334],8674:[-.064,.437,0,0,1.334],8705:[0,.825,0,0,.5],8708:[0,.68889,0,0,.55556],8709:[.08167,.58167,0,0,.77778],8717:[0,.43056,0,0,.42917],8722:[-.03598,.46402,0,0,.5],8724:[.08198,.69224,0,0,.77778],8726:[.08167,.58167,0,0,.77778],8733:[0,.69224,0,0,.77778],8736:[0,.69224,0,0,.72222],8737:[0,.69224,0,0,.72222],8738:[.03517,.52239,0,0,.72222],8739:[.08167,.58167,0,0,.22222],8740:[.25142,.74111,0,0,.27778],8741:[.08167,.58167,0,0,.38889],8742:[.25142,.74111,0,0,.5],8756:[0,.69224,0,0,.66667],8757:[0,.69224,0,0,.66667],8764:[-.13313,.36687,0,0,.77778],8765:[-.13313,.37788,0,0,.77778],8769:[-.13313,.36687,0,0,.77778],8770:[-.03625,.46375,0,0,.77778],8774:[.30274,.79383,0,0,.77778],8776:[-.01688,.48312,0,0,.77778],8778:[.08167,.58167,0,0,.77778],8782:[.06062,.54986,0,0,.77778],8783:[.06062,.54986,0,0,.77778],8785:[.08198,.58198,0,0,.77778],8786:[.08198,.58198,0,0,.77778],8787:[.08198,.58198,0,0,.77778],8790:[0,.69224,0,0,.77778],8791:[.22958,.72958,0,0,.77778],8796:[.08198,.91667,0,0,.77778],8806:[.25583,.75583,0,0,.77778],8807:[.25583,.75583,0,0,.77778],8808:[.25142,.75726,0,0,.77778],8809:[.25142,.75726,0,0,.77778],8812:[.25583,.75583,0,0,.5],8814:[.20576,.70576,0,0,.77778],8815:[.20576,.70576,0,0,.77778],8816:[.30274,.79383,0,0,.77778],8817:[.30274,.79383,0,0,.77778],8818:[.22958,.72958,0,0,.77778],8819:[.22958,.72958,0,0,.77778],8822:[.1808,.675,0,0,.77778],8823:[.1808,.675,0,0,.77778],8828:[.13667,.63667,0,0,.77778],8829:[.13667,.63667,0,0,.77778],8830:[.22958,.72958,0,0,.77778],8831:[.22958,.72958,0,0,.77778],8832:[.20576,.70576,0,0,.77778],8833:[.20576,.70576,0,0,.77778],8840:[.30274,.79383,0,0,.77778],8841:[.30274,.79383,0,0,.77778],8842:[.13597,.63597,0,0,.77778],8843:[.13597,.63597,0,0,.77778],8847:[.03517,.54986,0,0,.77778],8848:[.03517,.54986,0,0,.77778],8858:[.08198,.58198,0,0,.77778],8859:[.08198,.58198,0,0,.77778],8861:[.08198,.58198,0,0,.77778],8862:[0,.675,0,0,.77778],8863:[0,.675,0,0,.77778],8864:[0,.675,0,0,.77778],8865:[0,.675,0,0,.77778],8872:[0,.69224,0,0,.61111],8873:[0,.69224,0,0,.72222],8874:[0,.69224,0,0,.88889],8876:[0,.68889,0,0,.61111],8877:[0,.68889,0,0,.61111],8878:[0,.68889,0,0,.72222],8879:[0,.68889,0,0,.72222],8882:[.03517,.54986,0,0,.77778],8883:[.03517,.54986,0,0,.77778],8884:[.13667,.63667,0,0,.77778],8885:[.13667,.63667,0,0,.77778],8888:[0,.54986,0,0,1.11111],8890:[.19444,.43056,0,0,.55556],8891:[.19444,.69224,0,0,.61111],8892:[.19444,.69224,0,0,.61111],8901:[0,.54986,0,0,.27778],8903:[.08167,.58167,0,0,.77778],8905:[.08167,.58167,0,0,.77778],8906:[.08167,.58167,0,0,.77778],8907:[0,.69224,0,0,.77778],8908:[0,.69224,0,0,.77778],8909:[-.03598,.46402,0,0,.77778],8910:[0,.54986,0,0,.76042],8911:[0,.54986,0,0,.76042],8912:[.03517,.54986,0,0,.77778],8913:[.03517,.54986,0,0,.77778],8914:[0,.54986,0,0,.66667],8915:[0,.54986,0,0,.66667],8916:[0,.69224,0,0,.66667],8918:[.0391,.5391,0,0,.77778],8919:[.0391,.5391,0,0,.77778],8920:[.03517,.54986,0,0,1.33334],8921:[.03517,.54986,0,0,1.33334],8922:[.38569,.88569,0,0,.77778],8923:[.38569,.88569,0,0,.77778],8926:[.13667,.63667,0,0,.77778],8927:[.13667,.63667,0,0,.77778],8928:[.30274,.79383,0,0,.77778],8929:[.30274,.79383,0,0,.77778],8934:[.23222,.74111,0,0,.77778],8935:[.23222,.74111,0,0,.77778],8936:[.23222,.74111,0,0,.77778],8937:[.23222,.74111,0,0,.77778],8938:[.20576,.70576,0,0,.77778],8939:[.20576,.70576,0,0,.77778],8940:[.30274,.79383,0,0,.77778],8941:[.30274,.79383,0,0,.77778],8994:[.19444,.69224,0,0,.77778],8995:[.19444,.69224,0,0,.77778],9416:[.15559,.69224,0,0,.90222],9484:[0,.69224,0,0,.5],9488:[0,.69224,0,0,.5],9492:[0,.37788,0,0,.5],9496:[0,.37788,0,0,.5],9585:[.19444,.68889,0,0,.88889],9586:[.19444,.74111,0,0,.88889],9632:[0,.675,0,0,.77778],9633:[0,.675,0,0,.77778],9650:[0,.54986,0,0,.72222],9651:[0,.54986,0,0,.72222],9654:[.03517,.54986,0,0,.77778],9660:[0,.54986,0,0,.72222],9661:[0,.54986,0,0,.72222],9664:[.03517,.54986,0,0,.77778],9674:[.11111,.69224,0,0,.66667],9733:[.19444,.69224,0,0,.94445],10003:[0,.69224,0,0,.83334],10016:[0,.69224,0,0,.83334],10731:[.11111,.69224,0,0,.66667],10846:[.19444,.75583,0,0,.61111],10877:[.13667,.63667,0,0,.77778],10878:[.13667,.63667,0,0,.77778],10885:[.25583,.75583,0,0,.77778],10886:[.25583,.75583,0,0,.77778],10887:[.13597,.63597,0,0,.77778],10888:[.13597,.63597,0,0,.77778],10889:[.26167,.75726,0,0,.77778],10890:[.26167,.75726,0,0,.77778],10891:[.48256,.98256,0,0,.77778],10892:[.48256,.98256,0,0,.77778],10901:[.13667,.63667,0,0,.77778],10902:[.13667,.63667,0,0,.77778],10933:[.25142,.75726,0,0,.77778],10934:[.25142,.75726,0,0,.77778],10935:[.26167,.75726,0,0,.77778],10936:[.26167,.75726,0,0,.77778],10937:[.26167,.75726,0,0,.77778],10938:[.26167,.75726,0,0,.77778],10949:[.25583,.75583,0,0,.77778],10950:[.25583,.75583,0,0,.77778],10955:[.28481,.79383,0,0,.77778],10956:[.28481,.79383,0,0,.77778],57350:[.08167,.58167,0,0,.22222],57351:[.08167,.58167,0,0,.38889],57352:[.08167,.58167,0,0,.77778],57353:[0,.43056,.04028,0,.66667],57356:[.25142,.75726,0,0,.77778],57357:[.25142,.75726,0,0,.77778],57358:[.41951,.91951,0,0,.77778],57359:[.30274,.79383,0,0,.77778],57360:[.30274,.79383,0,0,.77778],57361:[.41951,.91951,0,0,.77778],57366:[.25142,.75726,0,0,.77778],57367:[.25142,.75726,0,0,.77778],57368:[.25142,.75726,0,0,.77778],57369:[.25142,.75726,0,0,.77778],57370:[.13597,.63597,0,0,.77778],57371:[.13597,.63597,0,0,.77778]},"Caligraphic-Regular":{32:[0,0,0,0,.25],65:[0,.68333,0,.19445,.79847],66:[0,.68333,.03041,.13889,.65681],67:[0,.68333,.05834,.13889,.52653],68:[0,.68333,.02778,.08334,.77139],69:[0,.68333,.08944,.11111,.52778],70:[0,.68333,.09931,.11111,.71875],71:[.09722,.68333,.0593,.11111,.59487],72:[0,.68333,.00965,.11111,.84452],73:[0,.68333,.07382,0,.54452],74:[.09722,.68333,.18472,.16667,.67778],75:[0,.68333,.01445,.05556,.76195],76:[0,.68333,0,.13889,.68972],77:[0,.68333,0,.13889,1.2009],78:[0,.68333,.14736,.08334,.82049],79:[0,.68333,.02778,.11111,.79611],80:[0,.68333,.08222,.08334,.69556],81:[.09722,.68333,0,.11111,.81667],82:[0,.68333,0,.08334,.8475],83:[0,.68333,.075,.13889,.60556],84:[0,.68333,.25417,0,.54464],85:[0,.68333,.09931,.08334,.62583],86:[0,.68333,.08222,0,.61278],87:[0,.68333,.08222,.08334,.98778],88:[0,.68333,.14643,.13889,.7133],89:[.09722,.68333,.08222,.08334,.66834],90:[0,.68333,.07944,.13889,.72473],160:[0,0,0,0,.25]},"Fraktur-Regular":{32:[0,0,0,0,.25],33:[0,.69141,0,0,.29574],34:[0,.69141,0,0,.21471],38:[0,.69141,0,0,.73786],39:[0,.69141,0,0,.21201],40:[.24982,.74947,0,0,.38865],41:[.24982,.74947,0,0,.38865],42:[0,.62119,0,0,.27764],43:[.08319,.58283,0,0,.75623],44:[0,.10803,0,0,.27764],45:[.08319,.58283,0,0,.75623],46:[0,.10803,0,0,.27764],47:[.24982,.74947,0,0,.50181],48:[0,.47534,0,0,.50181],49:[0,.47534,0,0,.50181],50:[0,.47534,0,0,.50181],51:[.18906,.47534,0,0,.50181],52:[.18906,.47534,0,0,.50181],53:[.18906,.47534,0,0,.50181],54:[0,.69141,0,0,.50181],55:[.18906,.47534,0,0,.50181],56:[0,.69141,0,0,.50181],57:[.18906,.47534,0,0,.50181],58:[0,.47534,0,0,.21606],59:[.12604,.47534,0,0,.21606],61:[-.13099,.36866,0,0,.75623],63:[0,.69141,0,0,.36245],65:[0,.69141,0,0,.7176],66:[0,.69141,0,0,.88397],67:[0,.69141,0,0,.61254],68:[0,.69141,0,0,.83158],69:[0,.69141,0,0,.66278],70:[.12604,.69141,0,0,.61119],71:[0,.69141,0,0,.78539],72:[.06302,.69141,0,0,.7203],73:[0,.69141,0,0,.55448],74:[.12604,.69141,0,0,.55231],75:[0,.69141,0,0,.66845],76:[0,.69141,0,0,.66602],77:[0,.69141,0,0,1.04953],78:[0,.69141,0,0,.83212],79:[0,.69141,0,0,.82699],80:[.18906,.69141,0,0,.82753],81:[.03781,.69141,0,0,.82699],82:[0,.69141,0,0,.82807],83:[0,.69141,0,0,.82861],84:[0,.69141,0,0,.66899],85:[0,.69141,0,0,.64576],86:[0,.69141,0,0,.83131],87:[0,.69141,0,0,1.04602],88:[0,.69141,0,0,.71922],89:[.18906,.69141,0,0,.83293],90:[.12604,.69141,0,0,.60201],91:[.24982,.74947,0,0,.27764],93:[.24982,.74947,0,0,.27764],94:[0,.69141,0,0,.49965],97:[0,.47534,0,0,.50046],98:[0,.69141,0,0,.51315],99:[0,.47534,0,0,.38946],100:[0,.62119,0,0,.49857],101:[0,.47534,0,0,.40053],102:[.18906,.69141,0,0,.32626],103:[.18906,.47534,0,0,.5037],104:[.18906,.69141,0,0,.52126],105:[0,.69141,0,0,.27899],106:[0,.69141,0,0,.28088],107:[0,.69141,0,0,.38946],108:[0,.69141,0,0,.27953],109:[0,.47534,0,0,.76676],110:[0,.47534,0,0,.52666],111:[0,.47534,0,0,.48885],112:[.18906,.52396,0,0,.50046],113:[.18906,.47534,0,0,.48912],114:[0,.47534,0,0,.38919],115:[0,.47534,0,0,.44266],116:[0,.62119,0,0,.33301],117:[0,.47534,0,0,.5172],118:[0,.52396,0,0,.5118],119:[0,.52396,0,0,.77351],120:[.18906,.47534,0,0,.38865],121:[.18906,.47534,0,0,.49884],122:[.18906,.47534,0,0,.39054],160:[0,0,0,0,.25],8216:[0,.69141,0,0,.21471],8217:[0,.69141,0,0,.21471],58112:[0,.62119,0,0,.49749],58113:[0,.62119,0,0,.4983],58114:[.18906,.69141,0,0,.33328],58115:[.18906,.69141,0,0,.32923],58116:[.18906,.47534,0,0,.50343],58117:[0,.69141,0,0,.33301],58118:[0,.62119,0,0,.33409],58119:[0,.47534,0,0,.50073]},"Main-Bold":{32:[0,0,0,0,.25],33:[0,.69444,0,0,.35],34:[0,.69444,0,0,.60278],35:[.19444,.69444,0,0,.95833],36:[.05556,.75,0,0,.575],37:[.05556,.75,0,0,.95833],38:[0,.69444,0,0,.89444],39:[0,.69444,0,0,.31944],40:[.25,.75,0,0,.44722],41:[.25,.75,0,0,.44722],42:[0,.75,0,0,.575],43:[.13333,.63333,0,0,.89444],44:[.19444,.15556,0,0,.31944],45:[0,.44444,0,0,.38333],46:[0,.15556,0,0,.31944],47:[.25,.75,0,0,.575],48:[0,.64444,0,0,.575],49:[0,.64444,0,0,.575],50:[0,.64444,0,0,.575],51:[0,.64444,0,0,.575],52:[0,.64444,0,0,.575],53:[0,.64444,0,0,.575],54:[0,.64444,0,0,.575],55:[0,.64444,0,0,.575],56:[0,.64444,0,0,.575],57:[0,.64444,0,0,.575],58:[0,.44444,0,0,.31944],59:[.19444,.44444,0,0,.31944],60:[.08556,.58556,0,0,.89444],61:[-.10889,.39111,0,0,.89444],62:[.08556,.58556,0,0,.89444],63:[0,.69444,0,0,.54305],64:[0,.69444,0,0,.89444],65:[0,.68611,0,0,.86944],66:[0,.68611,0,0,.81805],67:[0,.68611,0,0,.83055],68:[0,.68611,0,0,.88194],69:[0,.68611,0,0,.75555],70:[0,.68611,0,0,.72361],71:[0,.68611,0,0,.90416],72:[0,.68611,0,0,.9],73:[0,.68611,0,0,.43611],74:[0,.68611,0,0,.59444],75:[0,.68611,0,0,.90138],76:[0,.68611,0,0,.69166],77:[0,.68611,0,0,1.09166],78:[0,.68611,0,0,.9],79:[0,.68611,0,0,.86388],80:[0,.68611,0,0,.78611],81:[.19444,.68611,0,0,.86388],82:[0,.68611,0,0,.8625],83:[0,.68611,0,0,.63889],84:[0,.68611,0,0,.8],85:[0,.68611,0,0,.88472],86:[0,.68611,.01597,0,.86944],87:[0,.68611,.01597,0,1.18888],88:[0,.68611,0,0,.86944],89:[0,.68611,.02875,0,.86944],90:[0,.68611,0,0,.70277],91:[.25,.75,0,0,.31944],92:[.25,.75,0,0,.575],93:[.25,.75,0,0,.31944],94:[0,.69444,0,0,.575],95:[.31,.13444,.03194,0,.575],97:[0,.44444,0,0,.55902],98:[0,.69444,0,0,.63889],99:[0,.44444,0,0,.51111],100:[0,.69444,0,0,.63889],101:[0,.44444,0,0,.52708],102:[0,.69444,.10903,0,.35139],103:[.19444,.44444,.01597,0,.575],104:[0,.69444,0,0,.63889],105:[0,.69444,0,0,.31944],106:[.19444,.69444,0,0,.35139],107:[0,.69444,0,0,.60694],108:[0,.69444,0,0,.31944],109:[0,.44444,0,0,.95833],110:[0,.44444,0,0,.63889],111:[0,.44444,0,0,.575],112:[.19444,.44444,0,0,.63889],113:[.19444,.44444,0,0,.60694],114:[0,.44444,0,0,.47361],115:[0,.44444,0,0,.45361],116:[0,.63492,0,0,.44722],117:[0,.44444,0,0,.63889],118:[0,.44444,.01597,0,.60694],119:[0,.44444,.01597,0,.83055],120:[0,.44444,0,0,.60694],121:[.19444,.44444,.01597,0,.60694],122:[0,.44444,0,0,.51111],123:[.25,.75,0,0,.575],124:[.25,.75,0,0,.31944],125:[.25,.75,0,0,.575],126:[.35,.34444,0,0,.575],160:[0,0,0,0,.25],163:[0,.69444,0,0,.86853],168:[0,.69444,0,0,.575],172:[0,.44444,0,0,.76666],176:[0,.69444,0,0,.86944],177:[.13333,.63333,0,0,.89444],184:[.17014,0,0,0,.51111],198:[0,.68611,0,0,1.04166],215:[.13333,.63333,0,0,.89444],216:[.04861,.73472,0,0,.89444],223:[0,.69444,0,0,.59722],230:[0,.44444,0,0,.83055],247:[.13333,.63333,0,0,.89444],248:[.09722,.54167,0,0,.575],305:[0,.44444,0,0,.31944],338:[0,.68611,0,0,1.16944],339:[0,.44444,0,0,.89444],567:[.19444,.44444,0,0,.35139],710:[0,.69444,0,0,.575],711:[0,.63194,0,0,.575],713:[0,.59611,0,0,.575],714:[0,.69444,0,0,.575],715:[0,.69444,0,0,.575],728:[0,.69444,0,0,.575],729:[0,.69444,0,0,.31944],730:[0,.69444,0,0,.86944],732:[0,.69444,0,0,.575],733:[0,.69444,0,0,.575],915:[0,.68611,0,0,.69166],916:[0,.68611,0,0,.95833],920:[0,.68611,0,0,.89444],923:[0,.68611,0,0,.80555],926:[0,.68611,0,0,.76666],928:[0,.68611,0,0,.9],931:[0,.68611,0,0,.83055],933:[0,.68611,0,0,.89444],934:[0,.68611,0,0,.83055],936:[0,.68611,0,0,.89444],937:[0,.68611,0,0,.83055],8211:[0,.44444,.03194,0,.575],8212:[0,.44444,.03194,0,1.14999],8216:[0,.69444,0,0,.31944],8217:[0,.69444,0,0,.31944],8220:[0,.69444,0,0,.60278],8221:[0,.69444,0,0,.60278],8224:[.19444,.69444,0,0,.51111],8225:[.19444,.69444,0,0,.51111],8242:[0,.55556,0,0,.34444],8407:[0,.72444,.15486,0,.575],8463:[0,.69444,0,0,.66759],8465:[0,.69444,0,0,.83055],8467:[0,.69444,0,0,.47361],8472:[.19444,.44444,0,0,.74027],8476:[0,.69444,0,0,.83055],8501:[0,.69444,0,0,.70277],8592:[-.10889,.39111,0,0,1.14999],8593:[.19444,.69444,0,0,.575],8594:[-.10889,.39111,0,0,1.14999],8595:[.19444,.69444,0,0,.575],8596:[-.10889,.39111,0,0,1.14999],8597:[.25,.75,0,0,.575],8598:[.19444,.69444,0,0,1.14999],8599:[.19444,.69444,0,0,1.14999],8600:[.19444,.69444,0,0,1.14999],8601:[.19444,.69444,0,0,1.14999],8636:[-.10889,.39111,0,0,1.14999],8637:[-.10889,.39111,0,0,1.14999],8640:[-.10889,.39111,0,0,1.14999],8641:[-.10889,.39111,0,0,1.14999],8656:[-.10889,.39111,0,0,1.14999],8657:[.19444,.69444,0,0,.70277],8658:[-.10889,.39111,0,0,1.14999],8659:[.19444,.69444,0,0,.70277],8660:[-.10889,.39111,0,0,1.14999],8661:[.25,.75,0,0,.70277],8704:[0,.69444,0,0,.63889],8706:[0,.69444,.06389,0,.62847],8707:[0,.69444,0,0,.63889],8709:[.05556,.75,0,0,.575],8711:[0,.68611,0,0,.95833],8712:[.08556,.58556,0,0,.76666],8715:[.08556,.58556,0,0,.76666],8722:[.13333,.63333,0,0,.89444],8723:[.13333,.63333,0,0,.89444],8725:[.25,.75,0,0,.575],8726:[.25,.75,0,0,.575],8727:[-.02778,.47222,0,0,.575],8728:[-.02639,.47361,0,0,.575],8729:[-.02639,.47361,0,0,.575],8730:[.18,.82,0,0,.95833],8733:[0,.44444,0,0,.89444],8734:[0,.44444,0,0,1.14999],8736:[0,.69224,0,0,.72222],8739:[.25,.75,0,0,.31944],8741:[.25,.75,0,0,.575],8743:[0,.55556,0,0,.76666],8744:[0,.55556,0,0,.76666],8745:[0,.55556,0,0,.76666],8746:[0,.55556,0,0,.76666],8747:[.19444,.69444,.12778,0,.56875],8764:[-.10889,.39111,0,0,.89444],8768:[.19444,.69444,0,0,.31944],8771:[.00222,.50222,0,0,.89444],8773:[.027,.638,0,0,.894],8776:[.02444,.52444,0,0,.89444],8781:[.00222,.50222,0,0,.89444],8801:[.00222,.50222,0,0,.89444],8804:[.19667,.69667,0,0,.89444],8805:[.19667,.69667,0,0,.89444],8810:[.08556,.58556,0,0,1.14999],8811:[.08556,.58556,0,0,1.14999],8826:[.08556,.58556,0,0,.89444],8827:[.08556,.58556,0,0,.89444],8834:[.08556,.58556,0,0,.89444],8835:[.08556,.58556,0,0,.89444],8838:[.19667,.69667,0,0,.89444],8839:[.19667,.69667,0,0,.89444],8846:[0,.55556,0,0,.76666],8849:[.19667,.69667,0,0,.89444],8850:[.19667,.69667,0,0,.89444],8851:[0,.55556,0,0,.76666],8852:[0,.55556,0,0,.76666],8853:[.13333,.63333,0,0,.89444],8854:[.13333,.63333,0,0,.89444],8855:[.13333,.63333,0,0,.89444],8856:[.13333,.63333,0,0,.89444],8857:[.13333,.63333,0,0,.89444],8866:[0,.69444,0,0,.70277],8867:[0,.69444,0,0,.70277],8868:[0,.69444,0,0,.89444],8869:[0,.69444,0,0,.89444],8900:[-.02639,.47361,0,0,.575],8901:[-.02639,.47361,0,0,.31944],8902:[-.02778,.47222,0,0,.575],8968:[.25,.75,0,0,.51111],8969:[.25,.75,0,0,.51111],8970:[.25,.75,0,0,.51111],8971:[.25,.75,0,0,.51111],8994:[-.13889,.36111,0,0,1.14999],8995:[-.13889,.36111,0,0,1.14999],9651:[.19444,.69444,0,0,1.02222],9657:[-.02778,.47222,0,0,.575],9661:[.19444,.69444,0,0,1.02222],9667:[-.02778,.47222,0,0,.575],9711:[.19444,.69444,0,0,1.14999],9824:[.12963,.69444,0,0,.89444],9825:[.12963,.69444,0,0,.89444],9826:[.12963,.69444,0,0,.89444],9827:[.12963,.69444,0,0,.89444],9837:[0,.75,0,0,.44722],9838:[.19444,.69444,0,0,.44722],9839:[.19444,.69444,0,0,.44722],10216:[.25,.75,0,0,.44722],10217:[.25,.75,0,0,.44722],10815:[0,.68611,0,0,.9],10927:[.19667,.69667,0,0,.89444],10928:[.19667,.69667,0,0,.89444],57376:[.19444,.69444,0,0,0]},"Main-BoldItalic":{32:[0,0,0,0,.25],33:[0,.69444,.11417,0,.38611],34:[0,.69444,.07939,0,.62055],35:[.19444,.69444,.06833,0,.94444],37:[.05556,.75,.12861,0,.94444],38:[0,.69444,.08528,0,.88555],39:[0,.69444,.12945,0,.35555],40:[.25,.75,.15806,0,.47333],41:[.25,.75,.03306,0,.47333],42:[0,.75,.14333,0,.59111],43:[.10333,.60333,.03306,0,.88555],44:[.19444,.14722,0,0,.35555],45:[0,.44444,.02611,0,.41444],46:[0,.14722,0,0,.35555],47:[.25,.75,.15806,0,.59111],48:[0,.64444,.13167,0,.59111],49:[0,.64444,.13167,0,.59111],50:[0,.64444,.13167,0,.59111],51:[0,.64444,.13167,0,.59111],52:[.19444,.64444,.13167,0,.59111],53:[0,.64444,.13167,0,.59111],54:[0,.64444,.13167,0,.59111],55:[.19444,.64444,.13167,0,.59111],56:[0,.64444,.13167,0,.59111],57:[0,.64444,.13167,0,.59111],58:[0,.44444,.06695,0,.35555],59:[.19444,.44444,.06695,0,.35555],61:[-.10889,.39111,.06833,0,.88555],63:[0,.69444,.11472,0,.59111],64:[0,.69444,.09208,0,.88555],65:[0,.68611,0,0,.86555],66:[0,.68611,.0992,0,.81666],67:[0,.68611,.14208,0,.82666],68:[0,.68611,.09062,0,.87555],69:[0,.68611,.11431,0,.75666],70:[0,.68611,.12903,0,.72722],71:[0,.68611,.07347,0,.89527],72:[0,.68611,.17208,0,.8961],73:[0,.68611,.15681,0,.47166],74:[0,.68611,.145,0,.61055],75:[0,.68611,.14208,0,.89499],76:[0,.68611,0,0,.69777],77:[0,.68611,.17208,0,1.07277],78:[0,.68611,.17208,0,.8961],79:[0,.68611,.09062,0,.85499],80:[0,.68611,.0992,0,.78721],81:[.19444,.68611,.09062,0,.85499],82:[0,.68611,.02559,0,.85944],83:[0,.68611,.11264,0,.64999],84:[0,.68611,.12903,0,.7961],85:[0,.68611,.17208,0,.88083],86:[0,.68611,.18625,0,.86555],87:[0,.68611,.18625,0,1.15999],88:[0,.68611,.15681,0,.86555],89:[0,.68611,.19803,0,.86555],90:[0,.68611,.14208,0,.70888],91:[.25,.75,.1875,0,.35611],93:[.25,.75,.09972,0,.35611],94:[0,.69444,.06709,0,.59111],95:[.31,.13444,.09811,0,.59111],97:[0,.44444,.09426,0,.59111],98:[0,.69444,.07861,0,.53222],99:[0,.44444,.05222,0,.53222],100:[0,.69444,.10861,0,.59111],101:[0,.44444,.085,0,.53222],102:[.19444,.69444,.21778,0,.4],103:[.19444,.44444,.105,0,.53222],104:[0,.69444,.09426,0,.59111],105:[0,.69326,.11387,0,.35555],106:[.19444,.69326,.1672,0,.35555],107:[0,.69444,.11111,0,.53222],108:[0,.69444,.10861,0,.29666],109:[0,.44444,.09426,0,.94444],110:[0,.44444,.09426,0,.64999],111:[0,.44444,.07861,0,.59111],112:[.19444,.44444,.07861,0,.59111],113:[.19444,.44444,.105,0,.53222],114:[0,.44444,.11111,0,.50167],115:[0,.44444,.08167,0,.48694],116:[0,.63492,.09639,0,.385],117:[0,.44444,.09426,0,.62055],118:[0,.44444,.11111,0,.53222],119:[0,.44444,.11111,0,.76777],120:[0,.44444,.12583,0,.56055],121:[.19444,.44444,.105,0,.56166],122:[0,.44444,.13889,0,.49055],126:[.35,.34444,.11472,0,.59111],160:[0,0,0,0,.25],168:[0,.69444,.11473,0,.59111],176:[0,.69444,0,0,.94888],184:[.17014,0,0,0,.53222],198:[0,.68611,.11431,0,1.02277],216:[.04861,.73472,.09062,0,.88555],223:[.19444,.69444,.09736,0,.665],230:[0,.44444,.085,0,.82666],248:[.09722,.54167,.09458,0,.59111],305:[0,.44444,.09426,0,.35555],338:[0,.68611,.11431,0,1.14054],339:[0,.44444,.085,0,.82666],567:[.19444,.44444,.04611,0,.385],710:[0,.69444,.06709,0,.59111],711:[0,.63194,.08271,0,.59111],713:[0,.59444,.10444,0,.59111],714:[0,.69444,.08528,0,.59111],715:[0,.69444,0,0,.59111],728:[0,.69444,.10333,0,.59111],729:[0,.69444,.12945,0,.35555],730:[0,.69444,0,0,.94888],732:[0,.69444,.11472,0,.59111],733:[0,.69444,.11472,0,.59111],915:[0,.68611,.12903,0,.69777],916:[0,.68611,0,0,.94444],920:[0,.68611,.09062,0,.88555],923:[0,.68611,0,0,.80666],926:[0,.68611,.15092,0,.76777],928:[0,.68611,.17208,0,.8961],931:[0,.68611,.11431,0,.82666],933:[0,.68611,.10778,0,.88555],934:[0,.68611,.05632,0,.82666],936:[0,.68611,.10778,0,.88555],937:[0,.68611,.0992,0,.82666],8211:[0,.44444,.09811,0,.59111],8212:[0,.44444,.09811,0,1.18221],8216:[0,.69444,.12945,0,.35555],8217:[0,.69444,.12945,0,.35555],8220:[0,.69444,.16772,0,.62055],8221:[0,.69444,.07939,0,.62055]},"Main-Italic":{32:[0,0,0,0,.25],33:[0,.69444,.12417,0,.30667],34:[0,.69444,.06961,0,.51444],35:[.19444,.69444,.06616,0,.81777],37:[.05556,.75,.13639,0,.81777],38:[0,.69444,.09694,0,.76666],39:[0,.69444,.12417,0,.30667],40:[.25,.75,.16194,0,.40889],41:[.25,.75,.03694,0,.40889],42:[0,.75,.14917,0,.51111],43:[.05667,.56167,.03694,0,.76666],44:[.19444,.10556,0,0,.30667],45:[0,.43056,.02826,0,.35778],46:[0,.10556,0,0,.30667],47:[.25,.75,.16194,0,.51111],48:[0,.64444,.13556,0,.51111],49:[0,.64444,.13556,0,.51111],50:[0,.64444,.13556,0,.51111],51:[0,.64444,.13556,0,.51111],52:[.19444,.64444,.13556,0,.51111],53:[0,.64444,.13556,0,.51111],54:[0,.64444,.13556,0,.51111],55:[.19444,.64444,.13556,0,.51111],56:[0,.64444,.13556,0,.51111],57:[0,.64444,.13556,0,.51111],58:[0,.43056,.0582,0,.30667],59:[.19444,.43056,.0582,0,.30667],61:[-.13313,.36687,.06616,0,.76666],63:[0,.69444,.1225,0,.51111],64:[0,.69444,.09597,0,.76666],65:[0,.68333,0,0,.74333],66:[0,.68333,.10257,0,.70389],67:[0,.68333,.14528,0,.71555],68:[0,.68333,.09403,0,.755],69:[0,.68333,.12028,0,.67833],70:[0,.68333,.13305,0,.65277],71:[0,.68333,.08722,0,.77361],72:[0,.68333,.16389,0,.74333],73:[0,.68333,.15806,0,.38555],74:[0,.68333,.14028,0,.525],75:[0,.68333,.14528,0,.76888],76:[0,.68333,0,0,.62722],77:[0,.68333,.16389,0,.89666],78:[0,.68333,.16389,0,.74333],79:[0,.68333,.09403,0,.76666],80:[0,.68333,.10257,0,.67833],81:[.19444,.68333,.09403,0,.76666],82:[0,.68333,.03868,0,.72944],83:[0,.68333,.11972,0,.56222],84:[0,.68333,.13305,0,.71555],85:[0,.68333,.16389,0,.74333],86:[0,.68333,.18361,0,.74333],87:[0,.68333,.18361,0,.99888],88:[0,.68333,.15806,0,.74333],89:[0,.68333,.19383,0,.74333],90:[0,.68333,.14528,0,.61333],91:[.25,.75,.1875,0,.30667],93:[.25,.75,.10528,0,.30667],94:[0,.69444,.06646,0,.51111],95:[.31,.12056,.09208,0,.51111],97:[0,.43056,.07671,0,.51111],98:[0,.69444,.06312,0,.46],99:[0,.43056,.05653,0,.46],100:[0,.69444,.10333,0,.51111],101:[0,.43056,.07514,0,.46],102:[.19444,.69444,.21194,0,.30667],103:[.19444,.43056,.08847,0,.46],104:[0,.69444,.07671,0,.51111],105:[0,.65536,.1019,0,.30667],106:[.19444,.65536,.14467,0,.30667],107:[0,.69444,.10764,0,.46],108:[0,.69444,.10333,0,.25555],109:[0,.43056,.07671,0,.81777],110:[0,.43056,.07671,0,.56222],111:[0,.43056,.06312,0,.51111],112:[.19444,.43056,.06312,0,.51111],113:[.19444,.43056,.08847,0,.46],114:[0,.43056,.10764,0,.42166],115:[0,.43056,.08208,0,.40889],116:[0,.61508,.09486,0,.33222],117:[0,.43056,.07671,0,.53666],118:[0,.43056,.10764,0,.46],119:[0,.43056,.10764,0,.66444],120:[0,.43056,.12042,0,.46389],121:[.19444,.43056,.08847,0,.48555],122:[0,.43056,.12292,0,.40889],126:[.35,.31786,.11585,0,.51111],160:[0,0,0,0,.25],168:[0,.66786,.10474,0,.51111],176:[0,.69444,0,0,.83129],184:[.17014,0,0,0,.46],198:[0,.68333,.12028,0,.88277],216:[.04861,.73194,.09403,0,.76666],223:[.19444,.69444,.10514,0,.53666],230:[0,.43056,.07514,0,.71555],248:[.09722,.52778,.09194,0,.51111],338:[0,.68333,.12028,0,.98499],339:[0,.43056,.07514,0,.71555],710:[0,.69444,.06646,0,.51111],711:[0,.62847,.08295,0,.51111],713:[0,.56167,.10333,0,.51111],714:[0,.69444,.09694,0,.51111],715:[0,.69444,0,0,.51111],728:[0,.69444,.10806,0,.51111],729:[0,.66786,.11752,0,.30667],730:[0,.69444,0,0,.83129],732:[0,.66786,.11585,0,.51111],733:[0,.69444,.1225,0,.51111],915:[0,.68333,.13305,0,.62722],916:[0,.68333,0,0,.81777],920:[0,.68333,.09403,0,.76666],923:[0,.68333,0,0,.69222],926:[0,.68333,.15294,0,.66444],928:[0,.68333,.16389,0,.74333],931:[0,.68333,.12028,0,.71555],933:[0,.68333,.11111,0,.76666],934:[0,.68333,.05986,0,.71555],936:[0,.68333,.11111,0,.76666],937:[0,.68333,.10257,0,.71555],8211:[0,.43056,.09208,0,.51111],8212:[0,.43056,.09208,0,1.02222],8216:[0,.69444,.12417,0,.30667],8217:[0,.69444,.12417,0,.30667],8220:[0,.69444,.1685,0,.51444],8221:[0,.69444,.06961,0,.51444],8463:[0,.68889,0,0,.54028]},"Main-Regular":{32:[0,0,0,0,.25],33:[0,.69444,0,0,.27778],34:[0,.69444,0,0,.5],35:[.19444,.69444,0,0,.83334],36:[.05556,.75,0,0,.5],37:[.05556,.75,0,0,.83334],38:[0,.69444,0,0,.77778],39:[0,.69444,0,0,.27778],40:[.25,.75,0,0,.38889],41:[.25,.75,0,0,.38889],42:[0,.75,0,0,.5],43:[.08333,.58333,0,0,.77778],44:[.19444,.10556,0,0,.27778],45:[0,.43056,0,0,.33333],46:[0,.10556,0,0,.27778],47:[.25,.75,0,0,.5],48:[0,.64444,0,0,.5],49:[0,.64444,0,0,.5],50:[0,.64444,0,0,.5],51:[0,.64444,0,0,.5],52:[0,.64444,0,0,.5],53:[0,.64444,0,0,.5],54:[0,.64444,0,0,.5],55:[0,.64444,0,0,.5],56:[0,.64444,0,0,.5],57:[0,.64444,0,0,.5],58:[0,.43056,0,0,.27778],59:[.19444,.43056,0,0,.27778],60:[.0391,.5391,0,0,.77778],61:[-.13313,.36687,0,0,.77778],62:[.0391,.5391,0,0,.77778],63:[0,.69444,0,0,.47222],64:[0,.69444,0,0,.77778],65:[0,.68333,0,0,.75],66:[0,.68333,0,0,.70834],67:[0,.68333,0,0,.72222],68:[0,.68333,0,0,.76389],69:[0,.68333,0,0,.68056],70:[0,.68333,0,0,.65278],71:[0,.68333,0,0,.78472],72:[0,.68333,0,0,.75],73:[0,.68333,0,0,.36111],74:[0,.68333,0,0,.51389],75:[0,.68333,0,0,.77778],76:[0,.68333,0,0,.625],77:[0,.68333,0,0,.91667],78:[0,.68333,0,0,.75],79:[0,.68333,0,0,.77778],80:[0,.68333,0,0,.68056],81:[.19444,.68333,0,0,.77778],82:[0,.68333,0,0,.73611],83:[0,.68333,0,0,.55556],84:[0,.68333,0,0,.72222],85:[0,.68333,0,0,.75],86:[0,.68333,.01389,0,.75],87:[0,.68333,.01389,0,1.02778],88:[0,.68333,0,0,.75],89:[0,.68333,.025,0,.75],90:[0,.68333,0,0,.61111],91:[.25,.75,0,0,.27778],92:[.25,.75,0,0,.5],93:[.25,.75,0,0,.27778],94:[0,.69444,0,0,.5],95:[.31,.12056,.02778,0,.5],97:[0,.43056,0,0,.5],98:[0,.69444,0,0,.55556],99:[0,.43056,0,0,.44445],100:[0,.69444,0,0,.55556],101:[0,.43056,0,0,.44445],102:[0,.69444,.07778,0,.30556],103:[.19444,.43056,.01389,0,.5],104:[0,.69444,0,0,.55556],105:[0,.66786,0,0,.27778],106:[.19444,.66786,0,0,.30556],107:[0,.69444,0,0,.52778],108:[0,.69444,0,0,.27778],109:[0,.43056,0,0,.83334],110:[0,.43056,0,0,.55556],111:[0,.43056,0,0,.5],112:[.19444,.43056,0,0,.55556],113:[.19444,.43056,0,0,.52778],114:[0,.43056,0,0,.39167],115:[0,.43056,0,0,.39445],116:[0,.61508,0,0,.38889],117:[0,.43056,0,0,.55556],118:[0,.43056,.01389,0,.52778],119:[0,.43056,.01389,0,.72222],120:[0,.43056,0,0,.52778],121:[.19444,.43056,.01389,0,.52778],122:[0,.43056,0,0,.44445],123:[.25,.75,0,0,.5],124:[.25,.75,0,0,.27778],125:[.25,.75,0,0,.5],126:[.35,.31786,0,0,.5],160:[0,0,0,0,.25],163:[0,.69444,0,0,.76909],167:[.19444,.69444,0,0,.44445],168:[0,.66786,0,0,.5],172:[0,.43056,0,0,.66667],176:[0,.69444,0,0,.75],177:[.08333,.58333,0,0,.77778],182:[.19444,.69444,0,0,.61111],184:[.17014,0,0,0,.44445],198:[0,.68333,0,0,.90278],215:[.08333,.58333,0,0,.77778],216:[.04861,.73194,0,0,.77778],223:[0,.69444,0,0,.5],230:[0,.43056,0,0,.72222],247:[.08333,.58333,0,0,.77778],248:[.09722,.52778,0,0,.5],305:[0,.43056,0,0,.27778],338:[0,.68333,0,0,1.01389],339:[0,.43056,0,0,.77778],567:[.19444,.43056,0,0,.30556],710:[0,.69444,0,0,.5],711:[0,.62847,0,0,.5],713:[0,.56778,0,0,.5],714:[0,.69444,0,0,.5],715:[0,.69444,0,0,.5],728:[0,.69444,0,0,.5],729:[0,.66786,0,0,.27778],730:[0,.69444,0,0,.75],732:[0,.66786,0,0,.5],733:[0,.69444,0,0,.5],915:[0,.68333,0,0,.625],916:[0,.68333,0,0,.83334],920:[0,.68333,0,0,.77778],923:[0,.68333,0,0,.69445],926:[0,.68333,0,0,.66667],928:[0,.68333,0,0,.75],931:[0,.68333,0,0,.72222],933:[0,.68333,0,0,.77778],934:[0,.68333,0,0,.72222],936:[0,.68333,0,0,.77778],937:[0,.68333,0,0,.72222],8211:[0,.43056,.02778,0,.5],8212:[0,.43056,.02778,0,1],8216:[0,.69444,0,0,.27778],8217:[0,.69444,0,0,.27778],8220:[0,.69444,0,0,.5],8221:[0,.69444,0,0,.5],8224:[.19444,.69444,0,0,.44445],8225:[.19444,.69444,0,0,.44445],8230:[0,.123,0,0,1.172],8242:[0,.55556,0,0,.275],8407:[0,.71444,.15382,0,.5],8463:[0,.68889,0,0,.54028],8465:[0,.69444,0,0,.72222],8467:[0,.69444,0,.11111,.41667],8472:[.19444,.43056,0,.11111,.63646],8476:[0,.69444,0,0,.72222],8501:[0,.69444,0,0,.61111],8592:[-.13313,.36687,0,0,1],8593:[.19444,.69444,0,0,.5],8594:[-.13313,.36687,0,0,1],8595:[.19444,.69444,0,0,.5],8596:[-.13313,.36687,0,0,1],8597:[.25,.75,0,0,.5],8598:[.19444,.69444,0,0,1],8599:[.19444,.69444,0,0,1],8600:[.19444,.69444,0,0,1],8601:[.19444,.69444,0,0,1],8614:[.011,.511,0,0,1],8617:[.011,.511,0,0,1.126],8618:[.011,.511,0,0,1.126],8636:[-.13313,.36687,0,0,1],8637:[-.13313,.36687,0,0,1],8640:[-.13313,.36687,0,0,1],8641:[-.13313,.36687,0,0,1],8652:[.011,.671,0,0,1],8656:[-.13313,.36687,0,0,1],8657:[.19444,.69444,0,0,.61111],8658:[-.13313,.36687,0,0,1],8659:[.19444,.69444,0,0,.61111],8660:[-.13313,.36687,0,0,1],8661:[.25,.75,0,0,.61111],8704:[0,.69444,0,0,.55556],8706:[0,.69444,.05556,.08334,.5309],8707:[0,.69444,0,0,.55556],8709:[.05556,.75,0,0,.5],8711:[0,.68333,0,0,.83334],8712:[.0391,.5391,0,0,.66667],8715:[.0391,.5391,0,0,.66667],8722:[.08333,.58333,0,0,.77778],8723:[.08333,.58333,0,0,.77778],8725:[.25,.75,0,0,.5],8726:[.25,.75,0,0,.5],8727:[-.03472,.46528,0,0,.5],8728:[-.05555,.44445,0,0,.5],8729:[-.05555,.44445,0,0,.5],8730:[.2,.8,0,0,.83334],8733:[0,.43056,0,0,.77778],8734:[0,.43056,0,0,1],8736:[0,.69224,0,0,.72222],8739:[.25,.75,0,0,.27778],8741:[.25,.75,0,0,.5],8743:[0,.55556,0,0,.66667],8744:[0,.55556,0,0,.66667],8745:[0,.55556,0,0,.66667],8746:[0,.55556,0,0,.66667],8747:[.19444,.69444,.11111,0,.41667],8764:[-.13313,.36687,0,0,.77778],8768:[.19444,.69444,0,0,.27778],8771:[-.03625,.46375,0,0,.77778],8773:[-.022,.589,0,0,.778],8776:[-.01688,.48312,0,0,.77778],8781:[-.03625,.46375,0,0,.77778],8784:[-.133,.673,0,0,.778],8801:[-.03625,.46375,0,0,.77778],8804:[.13597,.63597,0,0,.77778],8805:[.13597,.63597,0,0,.77778],8810:[.0391,.5391,0,0,1],8811:[.0391,.5391,0,0,1],8826:[.0391,.5391,0,0,.77778],8827:[.0391,.5391,0,0,.77778],8834:[.0391,.5391,0,0,.77778],8835:[.0391,.5391,0,0,.77778],8838:[.13597,.63597,0,0,.77778],8839:[.13597,.63597,0,0,.77778],8846:[0,.55556,0,0,.66667],8849:[.13597,.63597,0,0,.77778],8850:[.13597,.63597,0,0,.77778],8851:[0,.55556,0,0,.66667],8852:[0,.55556,0,0,.66667],8853:[.08333,.58333,0,0,.77778],8854:[.08333,.58333,0,0,.77778],8855:[.08333,.58333,0,0,.77778],8856:[.08333,.58333,0,0,.77778],8857:[.08333,.58333,0,0,.77778],8866:[0,.69444,0,0,.61111],8867:[0,.69444,0,0,.61111],8868:[0,.69444,0,0,.77778],8869:[0,.69444,0,0,.77778],8872:[.249,.75,0,0,.867],8900:[-.05555,.44445,0,0,.5],8901:[-.05555,.44445,0,0,.27778],8902:[-.03472,.46528,0,0,.5],8904:[.005,.505,0,0,.9],8942:[.03,.903,0,0,.278],8943:[-.19,.313,0,0,1.172],8945:[-.1,.823,0,0,1.282],8968:[.25,.75,0,0,.44445],8969:[.25,.75,0,0,.44445],8970:[.25,.75,0,0,.44445],8971:[.25,.75,0,0,.44445],8994:[-.14236,.35764,0,0,1],8995:[-.14236,.35764,0,0,1],9136:[.244,.744,0,0,.412],9137:[.244,.745,0,0,.412],9651:[.19444,.69444,0,0,.88889],9657:[-.03472,.46528,0,0,.5],9661:[.19444,.69444,0,0,.88889],9667:[-.03472,.46528,0,0,.5],9711:[.19444,.69444,0,0,1],9824:[.12963,.69444,0,0,.77778],9825:[.12963,.69444,0,0,.77778],9826:[.12963,.69444,0,0,.77778],9827:[.12963,.69444,0,0,.77778],9837:[0,.75,0,0,.38889],9838:[.19444,.69444,0,0,.38889],9839:[.19444,.69444,0,0,.38889],10216:[.25,.75,0,0,.38889],10217:[.25,.75,0,0,.38889],10222:[.244,.744,0,0,.412],10223:[.244,.745,0,0,.412],10229:[.011,.511,0,0,1.609],10230:[.011,.511,0,0,1.638],10231:[.011,.511,0,0,1.859],10232:[.024,.525,0,0,1.609],10233:[.024,.525,0,0,1.638],10234:[.024,.525,0,0,1.858],10236:[.011,.511,0,0,1.638],10815:[0,.68333,0,0,.75],10927:[.13597,.63597,0,0,.77778],10928:[.13597,.63597,0,0,.77778],57376:[.19444,.69444,0,0,0]},"Math-BoldItalic":{32:[0,0,0,0,.25],48:[0,.44444,0,0,.575],49:[0,.44444,0,0,.575],50:[0,.44444,0,0,.575],51:[.19444,.44444,0,0,.575],52:[.19444,.44444,0,0,.575],53:[.19444,.44444,0,0,.575],54:[0,.64444,0,0,.575],55:[.19444,.44444,0,0,.575],56:[0,.64444,0,0,.575],57:[.19444,.44444,0,0,.575],65:[0,.68611,0,0,.86944],66:[0,.68611,.04835,0,.8664],67:[0,.68611,.06979,0,.81694],68:[0,.68611,.03194,0,.93812],69:[0,.68611,.05451,0,.81007],70:[0,.68611,.15972,0,.68889],71:[0,.68611,0,0,.88673],72:[0,.68611,.08229,0,.98229],73:[0,.68611,.07778,0,.51111],74:[0,.68611,.10069,0,.63125],75:[0,.68611,.06979,0,.97118],76:[0,.68611,0,0,.75555],77:[0,.68611,.11424,0,1.14201],78:[0,.68611,.11424,0,.95034],79:[0,.68611,.03194,0,.83666],80:[0,.68611,.15972,0,.72309],81:[.19444,.68611,0,0,.86861],82:[0,.68611,.00421,0,.87235],83:[0,.68611,.05382,0,.69271],84:[0,.68611,.15972,0,.63663],85:[0,.68611,.11424,0,.80027],86:[0,.68611,.25555,0,.67778],87:[0,.68611,.15972,0,1.09305],88:[0,.68611,.07778,0,.94722],89:[0,.68611,.25555,0,.67458],90:[0,.68611,.06979,0,.77257],97:[0,.44444,0,0,.63287],98:[0,.69444,0,0,.52083],99:[0,.44444,0,0,.51342],100:[0,.69444,0,0,.60972],101:[0,.44444,0,0,.55361],102:[.19444,.69444,.11042,0,.56806],103:[.19444,.44444,.03704,0,.5449],104:[0,.69444,0,0,.66759],105:[0,.69326,0,0,.4048],106:[.19444,.69326,.0622,0,.47083],107:[0,.69444,.01852,0,.6037],108:[0,.69444,.0088,0,.34815],109:[0,.44444,0,0,1.0324],110:[0,.44444,0,0,.71296],111:[0,.44444,0,0,.58472],112:[.19444,.44444,0,0,.60092],113:[.19444,.44444,.03704,0,.54213],114:[0,.44444,.03194,0,.5287],115:[0,.44444,0,0,.53125],116:[0,.63492,0,0,.41528],117:[0,.44444,0,0,.68102],118:[0,.44444,.03704,0,.56666],119:[0,.44444,.02778,0,.83148],120:[0,.44444,0,0,.65903],121:[.19444,.44444,.03704,0,.59028],122:[0,.44444,.04213,0,.55509],160:[0,0,0,0,.25],915:[0,.68611,.15972,0,.65694],916:[0,.68611,0,0,.95833],920:[0,.68611,.03194,0,.86722],923:[0,.68611,0,0,.80555],926:[0,.68611,.07458,0,.84125],928:[0,.68611,.08229,0,.98229],931:[0,.68611,.05451,0,.88507],933:[0,.68611,.15972,0,.67083],934:[0,.68611,0,0,.76666],936:[0,.68611,.11653,0,.71402],937:[0,.68611,.04835,0,.8789],945:[0,.44444,0,0,.76064],946:[.19444,.69444,.03403,0,.65972],947:[.19444,.44444,.06389,0,.59003],948:[0,.69444,.03819,0,.52222],949:[0,.44444,0,0,.52882],950:[.19444,.69444,.06215,0,.50833],951:[.19444,.44444,.03704,0,.6],952:[0,.69444,.03194,0,.5618],953:[0,.44444,0,0,.41204],954:[0,.44444,0,0,.66759],955:[0,.69444,0,0,.67083],956:[.19444,.44444,0,0,.70787],957:[0,.44444,.06898,0,.57685],958:[.19444,.69444,.03021,0,.50833],959:[0,.44444,0,0,.58472],960:[0,.44444,.03704,0,.68241],961:[.19444,.44444,0,0,.6118],962:[.09722,.44444,.07917,0,.42361],963:[0,.44444,.03704,0,.68588],964:[0,.44444,.13472,0,.52083],965:[0,.44444,.03704,0,.63055],966:[.19444,.44444,0,0,.74722],967:[.19444,.44444,0,0,.71805],968:[.19444,.69444,.03704,0,.75833],969:[0,.44444,.03704,0,.71782],977:[0,.69444,0,0,.69155],981:[.19444,.69444,0,0,.7125],982:[0,.44444,.03194,0,.975],1009:[.19444,.44444,0,0,.6118],1013:[0,.44444,0,0,.48333],57649:[0,.44444,0,0,.39352],57911:[.19444,.44444,0,0,.43889]},"Math-Italic":{32:[0,0,0,0,.25],48:[0,.43056,0,0,.5],49:[0,.43056,0,0,.5],50:[0,.43056,0,0,.5],51:[.19444,.43056,0,0,.5],52:[.19444,.43056,0,0,.5],53:[.19444,.43056,0,0,.5],54:[0,.64444,0,0,.5],55:[.19444,.43056,0,0,.5],56:[0,.64444,0,0,.5],57:[.19444,.43056,0,0,.5],65:[0,.68333,0,.13889,.75],66:[0,.68333,.05017,.08334,.75851],67:[0,.68333,.07153,.08334,.71472],68:[0,.68333,.02778,.05556,.82792],69:[0,.68333,.05764,.08334,.7382],70:[0,.68333,.13889,.08334,.64306],71:[0,.68333,0,.08334,.78625],72:[0,.68333,.08125,.05556,.83125],73:[0,.68333,.07847,.11111,.43958],74:[0,.68333,.09618,.16667,.55451],75:[0,.68333,.07153,.05556,.84931],76:[0,.68333,0,.02778,.68056],77:[0,.68333,.10903,.08334,.97014],78:[0,.68333,.10903,.08334,.80347],79:[0,.68333,.02778,.08334,.76278],80:[0,.68333,.13889,.08334,.64201],81:[.19444,.68333,0,.08334,.79056],82:[0,.68333,.00773,.08334,.75929],83:[0,.68333,.05764,.08334,.6132],84:[0,.68333,.13889,.08334,.58438],85:[0,.68333,.10903,.02778,.68278],86:[0,.68333,.22222,0,.58333],87:[0,.68333,.13889,0,.94445],88:[0,.68333,.07847,.08334,.82847],89:[0,.68333,.22222,0,.58056],90:[0,.68333,.07153,.08334,.68264],97:[0,.43056,0,0,.52859],98:[0,.69444,0,0,.42917],99:[0,.43056,0,.05556,.43276],100:[0,.69444,0,.16667,.52049],101:[0,.43056,0,.05556,.46563],102:[.19444,.69444,.10764,.16667,.48959],103:[.19444,.43056,.03588,.02778,.47697],104:[0,.69444,0,0,.57616],105:[0,.65952,0,0,.34451],106:[.19444,.65952,.05724,0,.41181],107:[0,.69444,.03148,0,.5206],108:[0,.69444,.01968,.08334,.29838],109:[0,.43056,0,0,.87801],110:[0,.43056,0,0,.60023],111:[0,.43056,0,.05556,.48472],112:[.19444,.43056,0,.08334,.50313],113:[.19444,.43056,.03588,.08334,.44641],114:[0,.43056,.02778,.05556,.45116],115:[0,.43056,0,.05556,.46875],116:[0,.61508,0,.08334,.36111],117:[0,.43056,0,.02778,.57246],118:[0,.43056,.03588,.02778,.48472],119:[0,.43056,.02691,.08334,.71592],120:[0,.43056,0,.02778,.57153],121:[.19444,.43056,.03588,.05556,.49028],122:[0,.43056,.04398,.05556,.46505],160:[0,0,0,0,.25],915:[0,.68333,.13889,.08334,.61528],916:[0,.68333,0,.16667,.83334],920:[0,.68333,.02778,.08334,.76278],923:[0,.68333,0,.16667,.69445],926:[0,.68333,.07569,.08334,.74236],928:[0,.68333,.08125,.05556,.83125],931:[0,.68333,.05764,.08334,.77986],933:[0,.68333,.13889,.05556,.58333],934:[0,.68333,0,.08334,.66667],936:[0,.68333,.11,.05556,.61222],937:[0,.68333,.05017,.08334,.7724],945:[0,.43056,.0037,.02778,.6397],946:[.19444,.69444,.05278,.08334,.56563],947:[.19444,.43056,.05556,0,.51773],948:[0,.69444,.03785,.05556,.44444],949:[0,.43056,0,.08334,.46632],950:[.19444,.69444,.07378,.08334,.4375],951:[.19444,.43056,.03588,.05556,.49653],952:[0,.69444,.02778,.08334,.46944],953:[0,.43056,0,.05556,.35394],954:[0,.43056,0,0,.57616],955:[0,.69444,0,0,.58334],956:[.19444,.43056,0,.02778,.60255],957:[0,.43056,.06366,.02778,.49398],958:[.19444,.69444,.04601,.11111,.4375],959:[0,.43056,0,.05556,.48472],960:[0,.43056,.03588,0,.57003],961:[.19444,.43056,0,.08334,.51702],962:[.09722,.43056,.07986,.08334,.36285],963:[0,.43056,.03588,0,.57141],964:[0,.43056,.1132,.02778,.43715],965:[0,.43056,.03588,.02778,.54028],966:[.19444,.43056,0,.08334,.65417],967:[.19444,.43056,0,.05556,.62569],968:[.19444,.69444,.03588,.11111,.65139],969:[0,.43056,.03588,0,.62245],977:[0,.69444,0,.08334,.59144],981:[.19444,.69444,0,.08334,.59583],982:[0,.43056,.02778,0,.82813],1009:[.19444,.43056,0,.08334,.51702],1013:[0,.43056,0,.05556,.4059],57649:[0,.43056,0,.02778,.32246],57911:[.19444,.43056,0,.08334,.38403]},"SansSerif-Bold":{32:[0,0,0,0,.25],33:[0,.69444,0,0,.36667],34:[0,.69444,0,0,.55834],35:[.19444,.69444,0,0,.91667],36:[.05556,.75,0,0,.55],37:[.05556,.75,0,0,1.02912],38:[0,.69444,0,0,.83056],39:[0,.69444,0,0,.30556],40:[.25,.75,0,0,.42778],41:[.25,.75,0,0,.42778],42:[0,.75,0,0,.55],43:[.11667,.61667,0,0,.85556],44:[.10556,.13056,0,0,.30556],45:[0,.45833,0,0,.36667],46:[0,.13056,0,0,.30556],47:[.25,.75,0,0,.55],48:[0,.69444,0,0,.55],49:[0,.69444,0,0,.55],50:[0,.69444,0,0,.55],51:[0,.69444,0,0,.55],52:[0,.69444,0,0,.55],53:[0,.69444,0,0,.55],54:[0,.69444,0,0,.55],55:[0,.69444,0,0,.55],56:[0,.69444,0,0,.55],57:[0,.69444,0,0,.55],58:[0,.45833,0,0,.30556],59:[.10556,.45833,0,0,.30556],61:[-.09375,.40625,0,0,.85556],63:[0,.69444,0,0,.51945],64:[0,.69444,0,0,.73334],65:[0,.69444,0,0,.73334],66:[0,.69444,0,0,.73334],67:[0,.69444,0,0,.70278],68:[0,.69444,0,0,.79445],69:[0,.69444,0,0,.64167],70:[0,.69444,0,0,.61111],71:[0,.69444,0,0,.73334],72:[0,.69444,0,0,.79445],73:[0,.69444,0,0,.33056],74:[0,.69444,0,0,.51945],75:[0,.69444,0,0,.76389],76:[0,.69444,0,0,.58056],77:[0,.69444,0,0,.97778],78:[0,.69444,0,0,.79445],79:[0,.69444,0,0,.79445],80:[0,.69444,0,0,.70278],81:[.10556,.69444,0,0,.79445],82:[0,.69444,0,0,.70278],83:[0,.69444,0,0,.61111],84:[0,.69444,0,0,.73334],85:[0,.69444,0,0,.76389],86:[0,.69444,.01528,0,.73334],87:[0,.69444,.01528,0,1.03889],88:[0,.69444,0,0,.73334],89:[0,.69444,.0275,0,.73334],90:[0,.69444,0,0,.67223],91:[.25,.75,0,0,.34306],93:[.25,.75,0,0,.34306],94:[0,.69444,0,0,.55],95:[.35,.10833,.03056,0,.55],97:[0,.45833,0,0,.525],98:[0,.69444,0,0,.56111],99:[0,.45833,0,0,.48889],100:[0,.69444,0,0,.56111],101:[0,.45833,0,0,.51111],102:[0,.69444,.07639,0,.33611],103:[.19444,.45833,.01528,0,.55],104:[0,.69444,0,0,.56111],105:[0,.69444,0,0,.25556],106:[.19444,.69444,0,0,.28611],107:[0,.69444,0,0,.53056],108:[0,.69444,0,0,.25556],109:[0,.45833,0,0,.86667],110:[0,.45833,0,0,.56111],111:[0,.45833,0,0,.55],112:[.19444,.45833,0,0,.56111],113:[.19444,.45833,0,0,.56111],114:[0,.45833,.01528,0,.37222],115:[0,.45833,0,0,.42167],116:[0,.58929,0,0,.40417],117:[0,.45833,0,0,.56111],118:[0,.45833,.01528,0,.5],119:[0,.45833,.01528,0,.74445],120:[0,.45833,0,0,.5],121:[.19444,.45833,.01528,0,.5],122:[0,.45833,0,0,.47639],126:[.35,.34444,0,0,.55],160:[0,0,0,0,.25],168:[0,.69444,0,0,.55],176:[0,.69444,0,0,.73334],180:[0,.69444,0,0,.55],184:[.17014,0,0,0,.48889],305:[0,.45833,0,0,.25556],567:[.19444,.45833,0,0,.28611],710:[0,.69444,0,0,.55],711:[0,.63542,0,0,.55],713:[0,.63778,0,0,.55],728:[0,.69444,0,0,.55],729:[0,.69444,0,0,.30556],730:[0,.69444,0,0,.73334],732:[0,.69444,0,0,.55],733:[0,.69444,0,0,.55],915:[0,.69444,0,0,.58056],916:[0,.69444,0,0,.91667],920:[0,.69444,0,0,.85556],923:[0,.69444,0,0,.67223],926:[0,.69444,0,0,.73334],928:[0,.69444,0,0,.79445],931:[0,.69444,0,0,.79445],933:[0,.69444,0,0,.85556],934:[0,.69444,0,0,.79445],936:[0,.69444,0,0,.85556],937:[0,.69444,0,0,.79445],8211:[0,.45833,.03056,0,.55],8212:[0,.45833,.03056,0,1.10001],8216:[0,.69444,0,0,.30556],8217:[0,.69444,0,0,.30556],8220:[0,.69444,0,0,.55834],8221:[0,.69444,0,0,.55834]},"SansSerif-Italic":{32:[0,0,0,0,.25],33:[0,.69444,.05733,0,.31945],34:[0,.69444,.00316,0,.5],35:[.19444,.69444,.05087,0,.83334],36:[.05556,.75,.11156,0,.5],37:[.05556,.75,.03126,0,.83334],38:[0,.69444,.03058,0,.75834],39:[0,.69444,.07816,0,.27778],40:[.25,.75,.13164,0,.38889],41:[.25,.75,.02536,0,.38889],42:[0,.75,.11775,0,.5],43:[.08333,.58333,.02536,0,.77778],44:[.125,.08333,0,0,.27778],45:[0,.44444,.01946,0,.33333],46:[0,.08333,0,0,.27778],47:[.25,.75,.13164,0,.5],48:[0,.65556,.11156,0,.5],49:[0,.65556,.11156,0,.5],50:[0,.65556,.11156,0,.5],51:[0,.65556,.11156,0,.5],52:[0,.65556,.11156,0,.5],53:[0,.65556,.11156,0,.5],54:[0,.65556,.11156,0,.5],55:[0,.65556,.11156,0,.5],56:[0,.65556,.11156,0,.5],57:[0,.65556,.11156,0,.5],58:[0,.44444,.02502,0,.27778],59:[.125,.44444,.02502,0,.27778],61:[-.13,.37,.05087,0,.77778],63:[0,.69444,.11809,0,.47222],64:[0,.69444,.07555,0,.66667],65:[0,.69444,0,0,.66667],66:[0,.69444,.08293,0,.66667],67:[0,.69444,.11983,0,.63889],68:[0,.69444,.07555,0,.72223],69:[0,.69444,.11983,0,.59722],70:[0,.69444,.13372,0,.56945],71:[0,.69444,.11983,0,.66667],72:[0,.69444,.08094,0,.70834],73:[0,.69444,.13372,0,.27778],74:[0,.69444,.08094,0,.47222],75:[0,.69444,.11983,0,.69445],76:[0,.69444,0,0,.54167],77:[0,.69444,.08094,0,.875],78:[0,.69444,.08094,0,.70834],79:[0,.69444,.07555,0,.73611],80:[0,.69444,.08293,0,.63889],81:[.125,.69444,.07555,0,.73611],82:[0,.69444,.08293,0,.64584],83:[0,.69444,.09205,0,.55556],84:[0,.69444,.13372,0,.68056],85:[0,.69444,.08094,0,.6875],86:[0,.69444,.1615,0,.66667],87:[0,.69444,.1615,0,.94445],88:[0,.69444,.13372,0,.66667],89:[0,.69444,.17261,0,.66667],90:[0,.69444,.11983,0,.61111],91:[.25,.75,.15942,0,.28889],93:[.25,.75,.08719,0,.28889],94:[0,.69444,.0799,0,.5],95:[.35,.09444,.08616,0,.5],97:[0,.44444,.00981,0,.48056],98:[0,.69444,.03057,0,.51667],99:[0,.44444,.08336,0,.44445],100:[0,.69444,.09483,0,.51667],101:[0,.44444,.06778,0,.44445],102:[0,.69444,.21705,0,.30556],103:[.19444,.44444,.10836,0,.5],104:[0,.69444,.01778,0,.51667],105:[0,.67937,.09718,0,.23889],106:[.19444,.67937,.09162,0,.26667],107:[0,.69444,.08336,0,.48889],108:[0,.69444,.09483,0,.23889],109:[0,.44444,.01778,0,.79445],110:[0,.44444,.01778,0,.51667],111:[0,.44444,.06613,0,.5],112:[.19444,.44444,.0389,0,.51667],113:[.19444,.44444,.04169,0,.51667],114:[0,.44444,.10836,0,.34167],115:[0,.44444,.0778,0,.38333],116:[0,.57143,.07225,0,.36111],117:[0,.44444,.04169,0,.51667],118:[0,.44444,.10836,0,.46111],119:[0,.44444,.10836,0,.68334],120:[0,.44444,.09169,0,.46111],121:[.19444,.44444,.10836,0,.46111],122:[0,.44444,.08752,0,.43472],126:[.35,.32659,.08826,0,.5],160:[0,0,0,0,.25],168:[0,.67937,.06385,0,.5],176:[0,.69444,0,0,.73752],184:[.17014,0,0,0,.44445],305:[0,.44444,.04169,0,.23889],567:[.19444,.44444,.04169,0,.26667],710:[0,.69444,.0799,0,.5],711:[0,.63194,.08432,0,.5],713:[0,.60889,.08776,0,.5],714:[0,.69444,.09205,0,.5],715:[0,.69444,0,0,.5],728:[0,.69444,.09483,0,.5],729:[0,.67937,.07774,0,.27778],730:[0,.69444,0,0,.73752],732:[0,.67659,.08826,0,.5],733:[0,.69444,.09205,0,.5],915:[0,.69444,.13372,0,.54167],916:[0,.69444,0,0,.83334],920:[0,.69444,.07555,0,.77778],923:[0,.69444,0,0,.61111],926:[0,.69444,.12816,0,.66667],928:[0,.69444,.08094,0,.70834],931:[0,.69444,.11983,0,.72222],933:[0,.69444,.09031,0,.77778],934:[0,.69444,.04603,0,.72222],936:[0,.69444,.09031,0,.77778],937:[0,.69444,.08293,0,.72222],8211:[0,.44444,.08616,0,.5],8212:[0,.44444,.08616,0,1],8216:[0,.69444,.07816,0,.27778],8217:[0,.69444,.07816,0,.27778],8220:[0,.69444,.14205,0,.5],8221:[0,.69444,.00316,0,.5]},"SansSerif-Regular":{32:[0,0,0,0,.25],33:[0,.69444,0,0,.31945],34:[0,.69444,0,0,.5],35:[.19444,.69444,0,0,.83334],36:[.05556,.75,0,0,.5],37:[.05556,.75,0,0,.83334],38:[0,.69444,0,0,.75834],39:[0,.69444,0,0,.27778],40:[.25,.75,0,0,.38889],41:[.25,.75,0,0,.38889],42:[0,.75,0,0,.5],43:[.08333,.58333,0,0,.77778],44:[.125,.08333,0,0,.27778],45:[0,.44444,0,0,.33333],46:[0,.08333,0,0,.27778],47:[.25,.75,0,0,.5],48:[0,.65556,0,0,.5],49:[0,.65556,0,0,.5],50:[0,.65556,0,0,.5],51:[0,.65556,0,0,.5],52:[0,.65556,0,0,.5],53:[0,.65556,0,0,.5],54:[0,.65556,0,0,.5],55:[0,.65556,0,0,.5],56:[0,.65556,0,0,.5],57:[0,.65556,0,0,.5],58:[0,.44444,0,0,.27778],59:[.125,.44444,0,0,.27778],61:[-.13,.37,0,0,.77778],63:[0,.69444,0,0,.47222],64:[0,.69444,0,0,.66667],65:[0,.69444,0,0,.66667],66:[0,.69444,0,0,.66667],67:[0,.69444,0,0,.63889],68:[0,.69444,0,0,.72223],69:[0,.69444,0,0,.59722],70:[0,.69444,0,0,.56945],71:[0,.69444,0,0,.66667],72:[0,.69444,0,0,.70834],73:[0,.69444,0,0,.27778],74:[0,.69444,0,0,.47222],75:[0,.69444,0,0,.69445],76:[0,.69444,0,0,.54167],77:[0,.69444,0,0,.875],78:[0,.69444,0,0,.70834],79:[0,.69444,0,0,.73611],80:[0,.69444,0,0,.63889],81:[.125,.69444,0,0,.73611],82:[0,.69444,0,0,.64584],83:[0,.69444,0,0,.55556],84:[0,.69444,0,0,.68056],85:[0,.69444,0,0,.6875],86:[0,.69444,.01389,0,.66667],87:[0,.69444,.01389,0,.94445],88:[0,.69444,0,0,.66667],89:[0,.69444,.025,0,.66667],90:[0,.69444,0,0,.61111],91:[.25,.75,0,0,.28889],93:[.25,.75,0,0,.28889],94:[0,.69444,0,0,.5],95:[.35,.09444,.02778,0,.5],97:[0,.44444,0,0,.48056],98:[0,.69444,0,0,.51667],99:[0,.44444,0,0,.44445],100:[0,.69444,0,0,.51667],101:[0,.44444,0,0,.44445],102:[0,.69444,.06944,0,.30556],103:[.19444,.44444,.01389,0,.5],104:[0,.69444,0,0,.51667],105:[0,.67937,0,0,.23889],106:[.19444,.67937,0,0,.26667],107:[0,.69444,0,0,.48889],108:[0,.69444,0,0,.23889],109:[0,.44444,0,0,.79445],110:[0,.44444,0,0,.51667],111:[0,.44444,0,0,.5],112:[.19444,.44444,0,0,.51667],113:[.19444,.44444,0,0,.51667],114:[0,.44444,.01389,0,.34167],115:[0,.44444,0,0,.38333],116:[0,.57143,0,0,.36111],117:[0,.44444,0,0,.51667],118:[0,.44444,.01389,0,.46111],119:[0,.44444,.01389,0,.68334],120:[0,.44444,0,0,.46111],121:[.19444,.44444,.01389,0,.46111],122:[0,.44444,0,0,.43472],126:[.35,.32659,0,0,.5],160:[0,0,0,0,.25],168:[0,.67937,0,0,.5],176:[0,.69444,0,0,.66667],184:[.17014,0,0,0,.44445],305:[0,.44444,0,0,.23889],567:[.19444,.44444,0,0,.26667],710:[0,.69444,0,0,.5],711:[0,.63194,0,0,.5],713:[0,.60889,0,0,.5],714:[0,.69444,0,0,.5],715:[0,.69444,0,0,.5],728:[0,.69444,0,0,.5],729:[0,.67937,0,0,.27778],730:[0,.69444,0,0,.66667],732:[0,.67659,0,0,.5],733:[0,.69444,0,0,.5],915:[0,.69444,0,0,.54167],916:[0,.69444,0,0,.83334],920:[0,.69444,0,0,.77778],923:[0,.69444,0,0,.61111],926:[0,.69444,0,0,.66667],928:[0,.69444,0,0,.70834],931:[0,.69444,0,0,.72222],933:[0,.69444,0,0,.77778],934:[0,.69444,0,0,.72222],936:[0,.69444,0,0,.77778],937:[0,.69444,0,0,.72222],8211:[0,.44444,.02778,0,.5],8212:[0,.44444,.02778,0,1],8216:[0,.69444,0,0,.27778],8217:[0,.69444,0,0,.27778],8220:[0,.69444,0,0,.5],8221:[0,.69444,0,0,.5]},"Script-Regular":{32:[0,0,0,0,.25],65:[0,.7,.22925,0,.80253],66:[0,.7,.04087,0,.90757],67:[0,.7,.1689,0,.66619],68:[0,.7,.09371,0,.77443],69:[0,.7,.18583,0,.56162],70:[0,.7,.13634,0,.89544],71:[0,.7,.17322,0,.60961],72:[0,.7,.29694,0,.96919],73:[0,.7,.19189,0,.80907],74:[.27778,.7,.19189,0,1.05159],75:[0,.7,.31259,0,.91364],76:[0,.7,.19189,0,.87373],77:[0,.7,.15981,0,1.08031],78:[0,.7,.3525,0,.9015],79:[0,.7,.08078,0,.73787],80:[0,.7,.08078,0,1.01262],81:[0,.7,.03305,0,.88282],82:[0,.7,.06259,0,.85],83:[0,.7,.19189,0,.86767],84:[0,.7,.29087,0,.74697],85:[0,.7,.25815,0,.79996],86:[0,.7,.27523,0,.62204],87:[0,.7,.27523,0,.80532],88:[0,.7,.26006,0,.94445],89:[0,.7,.2939,0,.70961],90:[0,.7,.24037,0,.8212],160:[0,0,0,0,.25]},"Size1-Regular":{32:[0,0,0,0,.25],40:[.35001,.85,0,0,.45834],41:[.35001,.85,0,0,.45834],47:[.35001,.85,0,0,.57778],91:[.35001,.85,0,0,.41667],92:[.35001,.85,0,0,.57778],93:[.35001,.85,0,0,.41667],123:[.35001,.85,0,0,.58334],125:[.35001,.85,0,0,.58334],160:[0,0,0,0,.25],710:[0,.72222,0,0,.55556],732:[0,.72222,0,0,.55556],770:[0,.72222,0,0,.55556],771:[0,.72222,0,0,.55556],8214:[-99e-5,.601,0,0,.77778],8593:[1e-5,.6,0,0,.66667],8595:[1e-5,.6,0,0,.66667],8657:[1e-5,.6,0,0,.77778],8659:[1e-5,.6,0,0,.77778],8719:[.25001,.75,0,0,.94445],8720:[.25001,.75,0,0,.94445],8721:[.25001,.75,0,0,1.05556],8730:[.35001,.85,0,0,1],8739:[-.00599,.606,0,0,.33333],8741:[-.00599,.606,0,0,.55556],8747:[.30612,.805,.19445,0,.47222],8748:[.306,.805,.19445,0,.47222],8749:[.306,.805,.19445,0,.47222],8750:[.30612,.805,.19445,0,.47222],8896:[.25001,.75,0,0,.83334],8897:[.25001,.75,0,0,.83334],8898:[.25001,.75,0,0,.83334],8899:[.25001,.75,0,0,.83334],8968:[.35001,.85,0,0,.47222],8969:[.35001,.85,0,0,.47222],8970:[.35001,.85,0,0,.47222],8971:[.35001,.85,0,0,.47222],9168:[-99e-5,.601,0,0,.66667],10216:[.35001,.85,0,0,.47222],10217:[.35001,.85,0,0,.47222],10752:[.25001,.75,0,0,1.11111],10753:[.25001,.75,0,0,1.11111],10754:[.25001,.75,0,0,1.11111],10756:[.25001,.75,0,0,.83334],10758:[.25001,.75,0,0,.83334]},"Size2-Regular":{32:[0,0,0,0,.25],40:[.65002,1.15,0,0,.59722],41:[.65002,1.15,0,0,.59722],47:[.65002,1.15,0,0,.81111],91:[.65002,1.15,0,0,.47222],92:[.65002,1.15,0,0,.81111],93:[.65002,1.15,0,0,.47222],123:[.65002,1.15,0,0,.66667],125:[.65002,1.15,0,0,.66667],160:[0,0,0,0,.25],710:[0,.75,0,0,1],732:[0,.75,0,0,1],770:[0,.75,0,0,1],771:[0,.75,0,0,1],8719:[.55001,1.05,0,0,1.27778],8720:[.55001,1.05,0,0,1.27778],8721:[.55001,1.05,0,0,1.44445],8730:[.65002,1.15,0,0,1],8747:[.86225,1.36,.44445,0,.55556],8748:[.862,1.36,.44445,0,.55556],8749:[.862,1.36,.44445,0,.55556],8750:[.86225,1.36,.44445,0,.55556],8896:[.55001,1.05,0,0,1.11111],8897:[.55001,1.05,0,0,1.11111],8898:[.55001,1.05,0,0,1.11111],8899:[.55001,1.05,0,0,1.11111],8968:[.65002,1.15,0,0,.52778],8969:[.65002,1.15,0,0,.52778],8970:[.65002,1.15,0,0,.52778],8971:[.65002,1.15,0,0,.52778],10216:[.65002,1.15,0,0,.61111],10217:[.65002,1.15,0,0,.61111],10752:[.55001,1.05,0,0,1.51112],10753:[.55001,1.05,0,0,1.51112],10754:[.55001,1.05,0,0,1.51112],10756:[.55001,1.05,0,0,1.11111],10758:[.55001,1.05,0,0,1.11111]},"Size3-Regular":{32:[0,0,0,0,.25],40:[.95003,1.45,0,0,.73611],41:[.95003,1.45,0,0,.73611],47:[.95003,1.45,0,0,1.04445],91:[.95003,1.45,0,0,.52778],92:[.95003,1.45,0,0,1.04445],93:[.95003,1.45,0,0,.52778],123:[.95003,1.45,0,0,.75],125:[.95003,1.45,0,0,.75],160:[0,0,0,0,.25],710:[0,.75,0,0,1.44445],732:[0,.75,0,0,1.44445],770:[0,.75,0,0,1.44445],771:[0,.75,0,0,1.44445],8730:[.95003,1.45,0,0,1],8968:[.95003,1.45,0,0,.58334],8969:[.95003,1.45,0,0,.58334],8970:[.95003,1.45,0,0,.58334],8971:[.95003,1.45,0,0,.58334],10216:[.95003,1.45,0,0,.75],10217:[.95003,1.45,0,0,.75]},"Size4-Regular":{32:[0,0,0,0,.25],40:[1.25003,1.75,0,0,.79167],41:[1.25003,1.75,0,0,.79167],47:[1.25003,1.75,0,0,1.27778],91:[1.25003,1.75,0,0,.58334],92:[1.25003,1.75,0,0,1.27778],93:[1.25003,1.75,0,0,.58334],123:[1.25003,1.75,0,0,.80556],125:[1.25003,1.75,0,0,.80556],160:[0,0,0,0,.25],710:[0,.825,0,0,1.8889],732:[0,.825,0,0,1.8889],770:[0,.825,0,0,1.8889],771:[0,.825,0,0,1.8889],8730:[1.25003,1.75,0,0,1],8968:[1.25003,1.75,0,0,.63889],8969:[1.25003,1.75,0,0,.63889],8970:[1.25003,1.75,0,0,.63889],8971:[1.25003,1.75,0,0,.63889],9115:[.64502,1.155,0,0,.875],9116:[1e-5,.6,0,0,.875],9117:[.64502,1.155,0,0,.875],9118:[.64502,1.155,0,0,.875],9119:[1e-5,.6,0,0,.875],9120:[.64502,1.155,0,0,.875],9121:[.64502,1.155,0,0,.66667],9122:[-99e-5,.601,0,0,.66667],9123:[.64502,1.155,0,0,.66667],9124:[.64502,1.155,0,0,.66667],9125:[-99e-5,.601,0,0,.66667],9126:[.64502,1.155,0,0,.66667],9127:[1e-5,.9,0,0,.88889],9128:[.65002,1.15,0,0,.88889],9129:[.90001,0,0,0,.88889],9130:[0,.3,0,0,.88889],9131:[1e-5,.9,0,0,.88889],9132:[.65002,1.15,0,0,.88889],9133:[.90001,0,0,0,.88889],9143:[.88502,.915,0,0,1.05556],10216:[1.25003,1.75,0,0,.80556],10217:[1.25003,1.75,0,0,.80556],57344:[-.00499,.605,0,0,1.05556],57345:[-.00499,.605,0,0,1.05556],57680:[0,.12,0,0,.45],57681:[0,.12,0,0,.45],57682:[0,.12,0,0,.45],57683:[0,.12,0,0,.45]},"Typewriter-Regular":{32:[0,0,0,0,.525],33:[0,.61111,0,0,.525],34:[0,.61111,0,0,.525],35:[0,.61111,0,0,.525],36:[.08333,.69444,0,0,.525],37:[.08333,.69444,0,0,.525],38:[0,.61111,0,0,.525],39:[0,.61111,0,0,.525],40:[.08333,.69444,0,0,.525],41:[.08333,.69444,0,0,.525],42:[0,.52083,0,0,.525],43:[-.08056,.53055,0,0,.525],44:[.13889,.125,0,0,.525],45:[-.08056,.53055,0,0,.525],46:[0,.125,0,0,.525],47:[.08333,.69444,0,0,.525],48:[0,.61111,0,0,.525],49:[0,.61111,0,0,.525],50:[0,.61111,0,0,.525],51:[0,.61111,0,0,.525],52:[0,.61111,0,0,.525],53:[0,.61111,0,0,.525],54:[0,.61111,0,0,.525],55:[0,.61111,0,0,.525],56:[0,.61111,0,0,.525],57:[0,.61111,0,0,.525],58:[0,.43056,0,0,.525],59:[.13889,.43056,0,0,.525],60:[-.05556,.55556,0,0,.525],61:[-.19549,.41562,0,0,.525],62:[-.05556,.55556,0,0,.525],63:[0,.61111,0,0,.525],64:[0,.61111,0,0,.525],65:[0,.61111,0,0,.525],66:[0,.61111,0,0,.525],67:[0,.61111,0,0,.525],68:[0,.61111,0,0,.525],69:[0,.61111,0,0,.525],70:[0,.61111,0,0,.525],71:[0,.61111,0,0,.525],72:[0,.61111,0,0,.525],73:[0,.61111,0,0,.525],74:[0,.61111,0,0,.525],75:[0,.61111,0,0,.525],76:[0,.61111,0,0,.525],77:[0,.61111,0,0,.525],78:[0,.61111,0,0,.525],79:[0,.61111,0,0,.525],80:[0,.61111,0,0,.525],81:[.13889,.61111,0,0,.525],82:[0,.61111,0,0,.525],83:[0,.61111,0,0,.525],84:[0,.61111,0,0,.525],85:[0,.61111,0,0,.525],86:[0,.61111,0,0,.525],87:[0,.61111,0,0,.525],88:[0,.61111,0,0,.525],89:[0,.61111,0,0,.525],90:[0,.61111,0,0,.525],91:[.08333,.69444,0,0,.525],92:[.08333,.69444,0,0,.525],93:[.08333,.69444,0,0,.525],94:[0,.61111,0,0,.525],95:[.09514,0,0,0,.525],96:[0,.61111,0,0,.525],97:[0,.43056,0,0,.525],98:[0,.61111,0,0,.525],99:[0,.43056,0,0,.525],100:[0,.61111,0,0,.525],101:[0,.43056,0,0,.525],102:[0,.61111,0,0,.525],103:[.22222,.43056,0,0,.525],104:[0,.61111,0,0,.525],105:[0,.61111,0,0,.525],106:[.22222,.61111,0,0,.525],107:[0,.61111,0,0,.525],108:[0,.61111,0,0,.525],109:[0,.43056,0,0,.525],110:[0,.43056,0,0,.525],111:[0,.43056,0,0,.525],112:[.22222,.43056,0,0,.525],113:[.22222,.43056,0,0,.525],114:[0,.43056,0,0,.525],115:[0,.43056,0,0,.525],116:[0,.55358,0,0,.525],117:[0,.43056,0,0,.525],118:[0,.43056,0,0,.525],119:[0,.43056,0,0,.525],120:[0,.43056,0,0,.525],121:[.22222,.43056,0,0,.525],122:[0,.43056,0,0,.525],123:[.08333,.69444,0,0,.525],124:[.08333,.69444,0,0,.525],125:[.08333,.69444,0,0,.525],126:[0,.61111,0,0,.525],127:[0,.61111,0,0,.525],160:[0,0,0,0,.525],176:[0,.61111,0,0,.525],184:[.19445,0,0,0,.525],305:[0,.43056,0,0,.525],567:[.22222,.43056,0,0,.525],711:[0,.56597,0,0,.525],713:[0,.56555,0,0,.525],714:[0,.61111,0,0,.525],715:[0,.61111,0,0,.525],728:[0,.61111,0,0,.525],730:[0,.61111,0,0,.525],770:[0,.61111,0,0,.525],771:[0,.61111,0,0,.525],776:[0,.61111,0,0,.525],915:[0,.61111,0,0,.525],916:[0,.61111,0,0,.525],920:[0,.61111,0,0,.525],923:[0,.61111,0,0,.525],926:[0,.61111,0,0,.525],928:[0,.61111,0,0,.525],931:[0,.61111,0,0,.525],933:[0,.61111,0,0,.525],934:[0,.61111,0,0,.525],936:[0,.61111,0,0,.525],937:[0,.61111,0,0,.525],8216:[0,.61111,0,0,.525],8217:[0,.61111,0,0,.525],8242:[0,.61111,0,0,.525],9251:[.11111,.21944,0,0,.525]}},sr={slant:[.25,.25,.25],space:[0,0,0],stretch:[0,0,0],shrink:[0,0,0],xHeight:[.431,.431,.431],quad:[1,1.171,1.472],extraSpace:[0,0,0],num1:[.677,.732,.925],num2:[.394,.384,.387],num3:[.444,.471,.504],denom1:[.686,.752,1.025],denom2:[.345,.344,.532],sup1:[.413,.503,.504],sup2:[.363,.431,.404],sup3:[.289,.286,.294],sub1:[.15,.143,.2],sub2:[.247,.286,.4],supDrop:[.386,.353,.494],subDrop:[.05,.071,.1],delim1:[2.39,1.7,1.98],delim2:[1.01,1.157,1.42],axisHeight:[.25,.25,.25],defaultRuleThickness:[.04,.049,.049],bigOpSpacing1:[.111,.111,.111],bigOpSpacing2:[.166,.166,.166],bigOpSpacing3:[.2,.2,.2],bigOpSpacing4:[.6,.611,.611],bigOpSpacing5:[.1,.143,.143],sqrtRuleThickness:[.04,.04,.04],ptPerEm:[10,10,10],doubleRuleSep:[.2,.2,.2],arrayRuleWidth:[.04,.04,.04],fboxsep:[.3,.3,.3],fboxrule:[.04,.04,.04]},p0={Å:"A",Ð:"D",Þ:"o",å:"a",ð:"d",þ:"o",А:"A",Б:"B",В:"B",Г:"F",Д:"A",Е:"E",Ж:"K",З:"3",И:"N",Й:"N",К:"K",Л:"N",М:"M",Н:"H",О:"O",П:"N",Р:"P",С:"C",Т:"T",У:"y",Ф:"O",Х:"X",Ц:"U",Ч:"h",Ш:"W",Щ:"W",Ъ:"B",Ы:"X",Ь:"B",Э:"3",Ю:"X",Я:"R",а:"a",б:"b",в:"a",г:"r",д:"y",е:"e",ж:"m",з:"e",и:"n",й:"n",к:"n",л:"n",м:"m",н:"n",о:"o",п:"n",р:"p",с:"c",т:"o",у:"y",ф:"b",х:"x",ц:"n",ч:"n",ш:"w",щ:"w",ъ:"a",ы:"m",ь:"a",э:"e",ю:"m",я:"r"};function ts(r,e){Qe[r]=e}function ja(r,e,t){if(!Qe[e])throw new Error("Font metrics not found for font: "+e+".");var a=r.charCodeAt(0),i=Qe[e][a];if(!i&&r[0]in p0&&(a=p0[r[0]].charCodeAt(0),i=Qe[e][a]),!i&&t==="text"&&_0(a)&&(i=Qe[e][77]),i)return{depth:i[0],height:i[1],italic:i[2],skew:i[3],width:i[4]}}var Vr={};function rs(r){var e;if(r>=5?e=0:r>=3?e=1:e=2,!Vr[e]){var t=Vr[e]={cssEmPerMu:sr.quad[e]/18};for(var a in sr)sr.hasOwnProperty(a)&&(t[a]=sr[a][e])}return Vr[e]}var xe={math:{},text:{}};function s(r,e,t,a,i,n){xe[r][i]={font:e,group:t,replace:a},n&&a&&(xe[r][a]=xe[r][i])}var d="math",E="text",u="main",v="ams",we="accent-token",U="bin",Fe="close",Gt="inner",ae="mathord",Te="op-token",Ue="open",rr="punct",b="rel",lt="spacing",w="textord";s(d,u,b,"≡","\\equiv",!0);s(d,u,b,"≺","\\prec",!0);s(d,u,b,"≻","\\succ",!0);s(d,u,b,"∼","\\sim",!0);s(d,u,b,"⊥","\\perp");s(d,u,b,"⪯","\\preceq",!0);s(d,u,b,"⪰","\\succeq",!0);s(d,u,b,"≃","\\simeq",!0);s(d,u,b,"∣","\\mid",!0);s(d,u,b,"≪","\\ll",!0);s(d,u,b,"≫","\\gg",!0);s(d,u,b,"≍","\\asymp",!0);s(d,u,b,"∥","\\parallel");s(d,u,b,"⋈","\\bowtie",!0);s(d,u,b,"⌣","\\smile",!0);s(d,u,b,"⊑","\\sqsubseteq",!0);s(d,u,b,"⊒","\\sqsupseteq",!0);s(d,u,b,"≐","\\doteq",!0);s(d,u,b,"⌢","\\frown",!0);s(d,u,b,"∋","\\ni",!0);s(d,u,b,"∝","\\propto",!0);s(d,u,b,"⊢","\\vdash",!0);s(d,u,b,"⊣","\\dashv",!0);s(d,u,b,"∋","\\owns");s(d,u,rr,".","\\ldotp");s(d,u,rr,"⋅","\\cdotp");s(d,u,rr,"⋅","·");s(E,u,w,"⋅","·");s(d,u,w,"#","\\#");s(E,u,w,"#","\\#");s(d,u,w,"&","\\&");s(E,u,w,"&","\\&");s(d,u,w,"ℵ","\\aleph",!0);s(d,u,w,"∀","\\forall",!0);s(d,u,w,"ℏ","\\hbar",!0);s(d,u,w,"∃","\\exists",!0);s(d,u,w,"∇","\\nabla",!0);s(d,u,w,"♭","\\flat",!0);s(d,u,w,"ℓ","\\ell",!0);s(d,u,w,"♮","\\natural",!0);s(d,u,w,"♣","\\clubsuit",!0);s(d,u,w,"℘","\\wp",!0);s(d,u,w,"♯","\\sharp",!0);s(d,u,w,"♢","\\diamondsuit",!0);s(d,u,w,"ℜ","\\Re",!0);s(d,u,w,"♡","\\heartsuit",!0);s(d,u,w,"ℑ","\\Im",!0);s(d,u,w,"♠","\\spadesuit",!0);s(d,u,w,"§","\\S",!0);s(E,u,w,"§","\\S");s(d,u,w,"¶","\\P",!0);s(E,u,w,"¶","\\P");s(d,u,w,"†","\\dag");s(E,u,w,"†","\\dag");s(E,u,w,"†","\\textdagger");s(d,u,w,"‡","\\ddag");s(E,u,w,"‡","\\ddag");s(E,u,w,"‡","\\textdaggerdbl");s(d,u,Fe,"⎱","\\rmoustache",!0);s(d,u,Ue,"⎰","\\lmoustache",!0);s(d,u,Fe,"⟯","\\rgroup",!0);s(d,u,Ue,"⟮","\\lgroup",!0);s(d,u,U,"∓","\\mp",!0);s(d,u,U,"⊖","\\ominus",!0);s(d,u,U,"⊎","\\uplus",!0);s(d,u,U,"⊓","\\sqcap",!0);s(d,u,U,"∗","\\ast");s(d,u,U,"⊔","\\sqcup",!0);s(d,u,U,"◯","\\bigcirc",!0);s(d,u,U,"∙","\\bullet",!0);s(d,u,U,"‡","\\ddagger");s(d,u,U,"≀","\\wr",!0);s(d,u,U,"⨿","\\amalg");s(d,u,U,"&","\\And");s(d,u,b,"⟵","\\longleftarrow",!0);s(d,u,b,"⇐","\\Leftarrow",!0);s(d,u,b,"⟸","\\Longleftarrow",!0);s(d,u,b,"⟶","\\longrightarrow",!0);s(d,u,b,"⇒","\\Rightarrow",!0);s(d,u,b,"⟹","\\Longrightarrow",!0);s(d,u,b,"↔","\\leftrightarrow",!0);s(d,u,b,"⟷","\\longleftrightarrow",!0);s(d,u,b,"⇔","\\Leftrightarrow",!0);s(d,u,b,"⟺","\\Longleftrightarrow",!0);s(d,u,b,"↦","\\mapsto",!0);s(d,u,b,"⟼","\\longmapsto",!0);s(d,u,b,"↗","\\nearrow",!0);s(d,u,b,"↩","\\hookleftarrow",!0);s(d,u,b,"↪","\\hookrightarrow",!0);s(d,u,b,"↘","\\searrow",!0);s(d,u,b,"↼","\\leftharpoonup",!0);s(d,u,b,"⇀","\\rightharpoonup",!0);s(d,u,b,"↙","\\swarrow",!0);s(d,u,b,"↽","\\leftharpoondown",!0);s(d,u,b,"⇁","\\rightharpoondown",!0);s(d,u,b,"↖","\\nwarrow",!0);s(d,u,b,"⇌","\\rightleftharpoons",!0);s(d,v,b,"≮","\\nless",!0);s(d,v,b,"","\\@nleqslant");s(d,v,b,"","\\@nleqq");s(d,v,b,"⪇","\\lneq",!0);s(d,v,b,"≨","\\lneqq",!0);s(d,v,b,"","\\@lvertneqq");s(d,v,b,"⋦","\\lnsim",!0);s(d,v,b,"⪉","\\lnapprox",!0);s(d,v,b,"⊀","\\nprec",!0);s(d,v,b,"⋠","\\npreceq",!0);s(d,v,b,"⋨","\\precnsim",!0);s(d,v,b,"⪹","\\precnapprox",!0);s(d,v,b,"≁","\\nsim",!0);s(d,v,b,"","\\@nshortmid");s(d,v,b,"∤","\\nmid",!0);s(d,v,b,"⊬","\\nvdash",!0);s(d,v,b,"⊭","\\nvDash",!0);s(d,v,b,"⋪","\\ntriangleleft");s(d,v,b,"⋬","\\ntrianglelefteq",!0);s(d,v,b,"⊊","\\subsetneq",!0);s(d,v,b,"","\\@varsubsetneq");s(d,v,b,"⫋","\\subsetneqq",!0);s(d,v,b,"","\\@varsubsetneqq");s(d,v,b,"≯","\\ngtr",!0);s(d,v,b,"","\\@ngeqslant");s(d,v,b,"","\\@ngeqq");s(d,v,b,"⪈","\\gneq",!0);s(d,v,b,"≩","\\gneqq",!0);s(d,v,b,"","\\@gvertneqq");s(d,v,b,"⋧","\\gnsim",!0);s(d,v,b,"⪊","\\gnapprox",!0);s(d,v,b,"⊁","\\nsucc",!0);s(d,v,b,"⋡","\\nsucceq",!0);s(d,v,b,"⋩","\\succnsim",!0);s(d,v,b,"⪺","\\succnapprox",!0);s(d,v,b,"≆","\\ncong",!0);s(d,v,b,"","\\@nshortparallel");s(d,v,b,"∦","\\nparallel",!0);s(d,v,b,"⊯","\\nVDash",!0);s(d,v,b,"⋫","\\ntriangleright");s(d,v,b,"⋭","\\ntrianglerighteq",!0);s(d,v,b,"","\\@nsupseteqq");s(d,v,b,"⊋","\\supsetneq",!0);s(d,v,b,"","\\@varsupsetneq");s(d,v,b,"⫌","\\supsetneqq",!0);s(d,v,b,"","\\@varsupsetneqq");s(d,v,b,"⊮","\\nVdash",!0);s(d,v,b,"⪵","\\precneqq",!0);s(d,v,b,"⪶","\\succneqq",!0);s(d,v,b,"","\\@nsubseteqq");s(d,v,U,"⊴","\\unlhd");s(d,v,U,"⊵","\\unrhd");s(d,v,b,"↚","\\nleftarrow",!0);s(d,v,b,"↛","\\nrightarrow",!0);s(d,v,b,"⇍","\\nLeftarrow",!0);s(d,v,b,"⇏","\\nRightarrow",!0);s(d,v,b,"↮","\\nleftrightarrow",!0);s(d,v,b,"⇎","\\nLeftrightarrow",!0);s(d,v,b,"△","\\vartriangle");s(d,v,w,"ℏ","\\hslash");s(d,v,w,"▽","\\triangledown");s(d,v,w,"◊","\\lozenge");s(d,v,w,"Ⓢ","\\circledS");s(d,v,w,"®","\\circledR");s(E,v,w,"®","\\circledR");s(d,v,w,"∡","\\measuredangle",!0);s(d,v,w,"∄","\\nexists");s(d,v,w,"℧","\\mho");s(d,v,w,"Ⅎ","\\Finv",!0);s(d,v,w,"⅁","\\Game",!0);s(d,v,w,"‵","\\backprime");s(d,v,w,"▲","\\blacktriangle");s(d,v,w,"▼","\\blacktriangledown");s(d,v,w,"■","\\blacksquare");s(d,v,w,"⧫","\\blacklozenge");s(d,v,w,"★","\\bigstar");s(d,v,w,"∢","\\sphericalangle",!0);s(d,v,w,"∁","\\complement",!0);s(d,v,w,"ð","\\eth",!0);s(E,u,w,"ð","ð");s(d,v,w,"╱","\\diagup");s(d,v,w,"╲","\\diagdown");s(d,v,w,"□","\\square");s(d,v,w,"□","\\Box");s(d,v,w,"◊","\\Diamond");s(d,v,w,"¥","\\yen",!0);s(E,v,w,"¥","\\yen",!0);s(d,v,w,"✓","\\checkmark",!0);s(E,v,w,"✓","\\checkmark");s(d,v,w,"ℶ","\\beth",!0);s(d,v,w,"ℸ","\\daleth",!0);s(d,v,w,"ℷ","\\gimel",!0);s(d,v,w,"ϝ","\\digamma",!0);s(d,v,w,"ϰ","\\varkappa");s(d,v,Ue,"┌","\\@ulcorner",!0);s(d,v,Fe,"┐","\\@urcorner",!0);s(d,v,Ue,"└","\\@llcorner",!0);s(d,v,Fe,"┘","\\@lrcorner",!0);s(d,v,b,"≦","\\leqq",!0);s(d,v,b,"⩽","\\leqslant",!0);s(d,v,b,"⪕","\\eqslantless",!0);s(d,v,b,"≲","\\lesssim",!0);s(d,v,b,"⪅","\\lessapprox",!0);s(d,v,b,"≊","\\approxeq",!0);s(d,v,U,"⋖","\\lessdot");s(d,v,b,"⋘","\\lll",!0);s(d,v,b,"≶","\\lessgtr",!0);s(d,v,b,"⋚","\\lesseqgtr",!0);s(d,v,b,"⪋","\\lesseqqgtr",!0);s(d,v,b,"≑","\\doteqdot");s(d,v,b,"≓","\\risingdotseq",!0);s(d,v,b,"≒","\\fallingdotseq",!0);s(d,v,b,"∽","\\backsim",!0);s(d,v,b,"⋍","\\backsimeq",!0);s(d,v,b,"⫅","\\subseteqq",!0);s(d,v,b,"⋐","\\Subset",!0);s(d,v,b,"⊏","\\sqsubset",!0);s(d,v,b,"≼","\\preccurlyeq",!0);s(d,v,b,"⋞","\\curlyeqprec",!0);s(d,v,b,"≾","\\precsim",!0);s(d,v,b,"⪷","\\precapprox",!0);s(d,v,b,"⊲","\\vartriangleleft");s(d,v,b,"⊴","\\trianglelefteq");s(d,v,b,"⊨","\\vDash",!0);s(d,v,b,"⊪","\\Vvdash",!0);s(d,v,b,"⌣","\\smallsmile");s(d,v,b,"⌢","\\smallfrown");s(d,v,b,"≏","\\bumpeq",!0);s(d,v,b,"≎","\\Bumpeq",!0);s(d,v,b,"≧","\\geqq",!0);s(d,v,b,"⩾","\\geqslant",!0);s(d,v,b,"⪖","\\eqslantgtr",!0);s(d,v,b,"≳","\\gtrsim",!0);s(d,v,b,"⪆","\\gtrapprox",!0);s(d,v,U,"⋗","\\gtrdot");s(d,v,b,"⋙","\\ggg",!0);s(d,v,b,"≷","\\gtrless",!0);s(d,v,b,"⋛","\\gtreqless",!0);s(d,v,b,"⪌","\\gtreqqless",!0);s(d,v,b,"≖","\\eqcirc",!0);s(d,v,b,"≗","\\circeq",!0);s(d,v,b,"≜","\\triangleq",!0);s(d,v,b,"∼","\\thicksim");s(d,v,b,"≈","\\thickapprox");s(d,v,b,"⫆","\\supseteqq",!0);s(d,v,b,"⋑","\\Supset",!0);s(d,v,b,"⊐","\\sqsupset",!0);s(d,v,b,"≽","\\succcurlyeq",!0);s(d,v,b,"⋟","\\curlyeqsucc",!0);s(d,v,b,"≿","\\succsim",!0);s(d,v,b,"⪸","\\succapprox",!0);s(d,v,b,"⊳","\\vartriangleright");s(d,v,b,"⊵","\\trianglerighteq");s(d,v,b,"⊩","\\Vdash",!0);s(d,v,b,"∣","\\shortmid");s(d,v,b,"∥","\\shortparallel");s(d,v,b,"≬","\\between",!0);s(d,v,b,"⋔","\\pitchfork",!0);s(d,v,b,"∝","\\varpropto");s(d,v,b,"◀","\\blacktriangleleft");s(d,v,b,"∴","\\therefore",!0);s(d,v,b,"∍","\\backepsilon");s(d,v,b,"▶","\\blacktriangleright");s(d,v,b,"∵","\\because",!0);s(d,v,b,"⋘","\\llless");s(d,v,b,"⋙","\\gggtr");s(d,v,U,"⊲","\\lhd");s(d,v,U,"⊳","\\rhd");s(d,v,b,"≂","\\eqsim",!0);s(d,u,b,"⋈","\\Join");s(d,v,b,"≑","\\Doteq",!0);s(d,v,U,"∔","\\dotplus",!0);s(d,v,U,"∖","\\smallsetminus");s(d,v,U,"⋒","\\Cap",!0);s(d,v,U,"⋓","\\Cup",!0);s(d,v,U,"⩞","\\doublebarwedge",!0);s(d,v,U,"⊟","\\boxminus",!0);s(d,v,U,"⊞","\\boxplus",!0);s(d,v,U,"⋇","\\divideontimes",!0);s(d,v,U,"⋉","\\ltimes",!0);s(d,v,U,"⋊","\\rtimes",!0);s(d,v,U,"⋋","\\leftthreetimes",!0);s(d,v,U,"⋌","\\rightthreetimes",!0);s(d,v,U,"⋏","\\curlywedge",!0);s(d,v,U,"⋎","\\curlyvee",!0);s(d,v,U,"⊝","\\circleddash",!0);s(d,v,U,"⊛","\\circledast",!0);s(d,v,U,"⋅","\\centerdot");s(d,v,U,"⊺","\\intercal",!0);s(d,v,U,"⋒","\\doublecap");s(d,v,U,"⋓","\\doublecup");s(d,v,U,"⊠","\\boxtimes",!0);s(d,v,b,"⇢","\\dashrightarrow",!0);s(d,v,b,"⇠","\\dashleftarrow",!0);s(d,v,b,"⇇","\\leftleftarrows",!0);s(d,v,b,"⇆","\\leftrightarrows",!0);s(d,v,b,"⇚","\\Lleftarrow",!0);s(d,v,b,"↞","\\twoheadleftarrow",!0);s(d,v,b,"↢","\\leftarrowtail",!0);s(d,v,b,"↫","\\looparrowleft",!0);s(d,v,b,"⇋","\\leftrightharpoons",!0);s(d,v,b,"↶","\\curvearrowleft",!0);s(d,v,b,"↺","\\circlearrowleft",!0);s(d,v,b,"↰","\\Lsh",!0);s(d,v,b,"⇈","\\upuparrows",!0);s(d,v,b,"↿","\\upharpoonleft",!0);s(d,v,b,"⇃","\\downharpoonleft",!0);s(d,u,b,"⊶","\\origof",!0);s(d,u,b,"⊷","\\imageof",!0);s(d,v,b,"⊸","\\multimap",!0);s(d,v,b,"↭","\\leftrightsquigarrow",!0);s(d,v,b,"⇉","\\rightrightarrows",!0);s(d,v,b,"⇄","\\rightleftarrows",!0);s(d,v,b,"↠","\\twoheadrightarrow",!0);s(d,v,b,"↣","\\rightarrowtail",!0);s(d,v,b,"↬","\\looparrowright",!0);s(d,v,b,"↷","\\curvearrowright",!0);s(d,v,b,"↻","\\circlearrowright",!0);s(d,v,b,"↱","\\Rsh",!0);s(d,v,b,"⇊","\\downdownarrows",!0);s(d,v,b,"↾","\\upharpoonright",!0);s(d,v,b,"⇂","\\downharpoonright",!0);s(d,v,b,"⇝","\\rightsquigarrow",!0);s(d,v,b,"⇝","\\leadsto");s(d,v,b,"⇛","\\Rrightarrow",!0);s(d,v,b,"↾","\\restriction");s(d,u,w,"‘","`");s(d,u,w,"$","\\$");s(E,u,w,"$","\\$");s(E,u,w,"$","\\textdollar");s(d,u,w,"%","\\%");s(E,u,w,"%","\\%");s(d,u,w,"_","\\_");s(E,u,w,"_","\\_");s(E,u,w,"_","\\textunderscore");s(d,u,w,"∠","\\angle",!0);s(d,u,w,"∞","\\infty",!0);s(d,u,w,"′","\\prime");s(d,u,w,"△","\\triangle");s(d,u,w,"Γ","\\Gamma",!0);s(d,u,w,"Δ","\\Delta",!0);s(d,u,w,"Θ","\\Theta",!0);s(d,u,w,"Λ","\\Lambda",!0);s(d,u,w,"Ξ","\\Xi",!0);s(d,u,w,"Π","\\Pi",!0);s(d,u,w,"Σ","\\Sigma",!0);s(d,u,w,"Υ","\\Upsilon",!0);s(d,u,w,"Φ","\\Phi",!0);s(d,u,w,"Ψ","\\Psi",!0);s(d,u,w,"Ω","\\Omega",!0);s(d,u,w,"A","Α");s(d,u,w,"B","Β");s(d,u,w,"E","Ε");s(d,u,w,"Z","Ζ");s(d,u,w,"H","Η");s(d,u,w,"I","Ι");s(d,u,w,"K","Κ");s(d,u,w,"M","Μ");s(d,u,w,"N","Ν");s(d,u,w,"O","Ο");s(d,u,w,"P","Ρ");s(d,u,w,"T","Τ");s(d,u,w,"X","Χ");s(d,u,w,"¬","\\neg",!0);s(d,u,w,"¬","\\lnot");s(d,u,w,"⊤","\\top");s(d,u,w,"⊥","\\bot");s(d,u,w,"∅","\\emptyset");s(d,v,w,"∅","\\varnothing");s(d,u,ae,"α","\\alpha",!0);s(d,u,ae,"β","\\beta",!0);s(d,u,ae,"γ","\\gamma",!0);s(d,u,ae,"δ","\\delta",!0);s(d,u,ae,"ϵ","\\epsilon",!0);s(d,u,ae,"ζ","\\zeta",!0);s(d,u,ae,"η","\\eta",!0);s(d,u,ae,"θ","\\theta",!0);s(d,u,ae,"ι","\\iota",!0);s(d,u,ae,"κ","\\kappa",!0);s(d,u,ae,"λ","\\lambda",!0);s(d,u,ae,"μ","\\mu",!0);s(d,u,ae,"ν","\\nu",!0);s(d,u,ae,"ξ","\\xi",!0);s(d,u,ae,"ο","\\omicron",!0);s(d,u,ae,"π","\\pi",!0);s(d,u,ae,"ρ","\\rho",!0);s(d,u,ae,"σ","\\sigma",!0);s(d,u,ae,"τ","\\tau",!0);s(d,u,ae,"υ","\\upsilon",!0);s(d,u,ae,"ϕ","\\phi",!0);s(d,u,ae,"χ","\\chi",!0);s(d,u,ae,"ψ","\\psi",!0);s(d,u,ae,"ω","\\omega",!0);s(d,u,ae,"ε","\\varepsilon",!0);s(d,u,ae,"ϑ","\\vartheta",!0);s(d,u,ae,"ϖ","\\varpi",!0);s(d,u,ae,"ϱ","\\varrho",!0);s(d,u,ae,"ς","\\varsigma",!0);s(d,u,ae,"φ","\\varphi",!0);s(d,u,U,"∗","*",!0);s(d,u,U,"+","+");s(d,u,U,"−","-",!0);s(d,u,U,"⋅","\\cdot",!0);s(d,u,U,"∘","\\circ",!0);s(d,u,U,"÷","\\div",!0);s(d,u,U,"±","\\pm",!0);s(d,u,U,"×","\\times",!0);s(d,u,U,"∩","\\cap",!0);s(d,u,U,"∪","\\cup",!0);s(d,u,U,"∖","\\setminus",!0);s(d,u,U,"∧","\\land");s(d,u,U,"∨","\\lor");s(d,u,U,"∧","\\wedge",!0);s(d,u,U,"∨","\\vee",!0);s(d,u,w,"√","\\surd");s(d,u,Ue,"⟨","\\langle",!0);s(d,u,Ue,"∣","\\lvert");s(d,u,Ue,"∥","\\lVert");s(d,u,Fe,"?","?");s(d,u,Fe,"!","!");s(d,u,Fe,"⟩","\\rangle",!0);s(d,u,Fe,"∣","\\rvert");s(d,u,Fe,"∥","\\rVert");s(d,u,b,"=","=");s(d,u,b,":",":");s(d,u,b,"≈","\\approx",!0);s(d,u,b,"≅","\\cong",!0);s(d,u,b,"≥","\\ge");s(d,u,b,"≥","\\geq",!0);s(d,u,b,"←","\\gets");s(d,u,b,">","\\gt",!0);s(d,u,b,"∈","\\in",!0);s(d,u,b,"","\\@not");s(d,u,b,"⊂","\\subset",!0);s(d,u,b,"⊃","\\supset",!0);s(d,u,b,"⊆","\\subseteq",!0);s(d,u,b,"⊇","\\supseteq",!0);s(d,v,b,"⊈","\\nsubseteq",!0);s(d,v,b,"⊉","\\nsupseteq",!0);s(d,u,b,"⊨","\\models");s(d,u,b,"←","\\leftarrow",!0);s(d,u,b,"≤","\\le");s(d,u,b,"≤","\\leq",!0);s(d,u,b,"<","\\lt",!0);s(d,u,b,"→","\\rightarrow",!0);s(d,u,b,"→","\\to");s(d,v,b,"≱","\\ngeq",!0);s(d,v,b,"≰","\\nleq",!0);s(d,u,lt," ","\\ ");s(d,u,lt," ","\\space");s(d,u,lt," ","\\nobreakspace");s(E,u,lt," ","\\ ");s(E,u,lt," "," ");s(E,u,lt," ","\\space");s(E,u,lt," ","\\nobreakspace");s(d,u,lt,"","\\nobreak");s(d,u,lt,"","\\allowbreak");s(d,u,rr,",",",");s(d,u,rr,";",";");s(d,v,U,"⊼","\\barwedge",!0);s(d,v,U,"⊻","\\veebar",!0);s(d,u,U,"⊙","\\odot",!0);s(d,u,U,"⊕","\\oplus",!0);s(d,u,U,"⊗","\\otimes",!0);s(d,u,w,"∂","\\partial",!0);s(d,u,U,"⊘","\\oslash",!0);s(d,v,U,"⊚","\\circledcirc",!0);s(d,v,U,"⊡","\\boxdot",!0);s(d,u,U,"△","\\bigtriangleup");s(d,u,U,"▽","\\bigtriangledown");s(d,u,U,"†","\\dagger");s(d,u,U,"⋄","\\diamond");s(d,u,U,"⋆","\\star");s(d,u,U,"◃","\\triangleleft");s(d,u,U,"▹","\\triangleright");s(d,u,Ue,"{","\\{");s(E,u,w,"{","\\{");s(E,u,w,"{","\\textbraceleft");s(d,u,Fe,"}","\\}");s(E,u,w,"}","\\}");s(E,u,w,"}","\\textbraceright");s(d,u,Ue,"{","\\lbrace");s(d,u,Fe,"}","\\rbrace");s(d,u,Ue,"[","\\lbrack",!0);s(E,u,w,"[","\\lbrack",!0);s(d,u,Fe,"]","\\rbrack",!0);s(E,u,w,"]","\\rbrack",!0);s(d,u,Ue,"(","\\lparen",!0);s(d,u,Fe,")","\\rparen",!0);s(E,u,w,"<","\\textless",!0);s(E,u,w,">","\\textgreater",!0);s(d,u,Ue,"⌊","\\lfloor",!0);s(d,u,Fe,"⌋","\\rfloor",!0);s(d,u,Ue,"⌈","\\lceil",!0);s(d,u,Fe,"⌉","\\rceil",!0);s(d,u,w,"\\","\\backslash");s(d,u,w,"∣","|");s(d,u,w,"∣","\\vert");s(E,u,w,"|","\\textbar",!0);s(d,u,w,"∥","\\|");s(d,u,w,"∥","\\Vert");s(E,u,w,"∥","\\textbardbl");s(E,u,w,"~","\\textasciitilde");s(E,u,w,"\\","\\textbackslash");s(E,u,w,"^","\\textasciicircum");s(d,u,b,"↑","\\uparrow",!0);s(d,u,b,"⇑","\\Uparrow",!0);s(d,u,b,"↓","\\downarrow",!0);s(d,u,b,"⇓","\\Downarrow",!0);s(d,u,b,"↕","\\updownarrow",!0);s(d,u,b,"⇕","\\Updownarrow",!0);s(d,u,Te,"∐","\\coprod");s(d,u,Te,"⋁","\\bigvee");s(d,u,Te,"⋀","\\bigwedge");s(d,u,Te,"⨄","\\biguplus");s(d,u,Te,"⋂","\\bigcap");s(d,u,Te,"⋃","\\bigcup");s(d,u,Te,"∫","\\int");s(d,u,Te,"∫","\\intop");s(d,u,Te,"∬","\\iint");s(d,u,Te,"∭","\\iiint");s(d,u,Te,"∏","\\prod");s(d,u,Te,"∑","\\sum");s(d,u,Te,"⨂","\\bigotimes");s(d,u,Te,"⨁","\\bigoplus");s(d,u,Te,"⨀","\\bigodot");s(d,u,Te,"∮","\\oint");s(d,u,Te,"∯","\\oiint");s(d,u,Te,"∰","\\oiiint");s(d,u,Te,"⨆","\\bigsqcup");s(d,u,Te,"∫","\\smallint");s(E,u,Gt,"…","\\textellipsis");s(d,u,Gt,"…","\\mathellipsis");s(E,u,Gt,"…","\\ldots",!0);s(d,u,Gt,"…","\\ldots",!0);s(d,u,Gt,"⋯","\\@cdots",!0);s(d,u,Gt,"⋱","\\ddots",!0);s(d,u,w,"⋮","\\varvdots");s(E,u,w,"⋮","\\varvdots");s(d,u,we,"ˊ","\\acute");s(d,u,we,"ˋ","\\grave");s(d,u,we,"¨","\\ddot");s(d,u,we,"~","\\tilde");s(d,u,we,"ˉ","\\bar");s(d,u,we,"˘","\\breve");s(d,u,we,"ˇ","\\check");s(d,u,we,"^","\\hat");s(d,u,we,"⃗","\\vec");s(d,u,we,"˙","\\dot");s(d,u,we,"˚","\\mathring");s(d,u,ae,"","\\@imath");s(d,u,ae,"","\\@jmath");s(d,u,w,"ı","ı");s(d,u,w,"ȷ","ȷ");s(E,u,w,"ı","\\i",!0);s(E,u,w,"ȷ","\\j",!0);s(E,u,w,"ß","\\ss",!0);s(E,u,w,"æ","\\ae",!0);s(E,u,w,"œ","\\oe",!0);s(E,u,w,"ø","\\o",!0);s(E,u,w,"Æ","\\AE",!0);s(E,u,w,"Œ","\\OE",!0);s(E,u,w,"Ø","\\O",!0);s(E,u,we,"ˊ","\\'");s(E,u,we,"ˋ","\\`");s(E,u,we,"ˆ","\\^");s(E,u,we,"˜","\\~");s(E,u,we,"ˉ","\\=");s(E,u,we,"˘","\\u");s(E,u,we,"˙","\\.");s(E,u,we,"¸","\\c");s(E,u,we,"˚","\\r");s(E,u,we,"ˇ","\\v");s(E,u,we,"¨",'\\"');s(E,u,we,"˝","\\H");s(E,u,we,"◯","\\textcircled");var ii={"--":!0,"---":!0,"``":!0,"''":!0};s(E,u,w,"–","--",!0);s(E,u,w,"–","\\textendash");s(E,u,w,"—","---",!0);s(E,u,w,"—","\\textemdash");s(E,u,w,"‘","`",!0);s(E,u,w,"‘","\\textquoteleft");s(E,u,w,"’","'",!0);s(E,u,w,"’","\\textquoteright");s(E,u,w,"“","``",!0);s(E,u,w,"“","\\textquotedblleft");s(E,u,w,"”","''",!0);s(E,u,w,"”","\\textquotedblright");s(d,u,w,"°","\\degree",!0);s(E,u,w,"°","\\degree");s(E,u,w,"°","\\textdegree",!0);s(d,u,w,"£","\\pounds");s(d,u,w,"£","\\mathsterling",!0);s(E,u,w,"£","\\pounds");s(E,u,w,"£","\\textsterling",!0);s(d,v,w,"✠","\\maltese");s(E,v,w,"✠","\\maltese");var h0='0123456789/@."';for(var Gr=0;Gr<h0.length;Gr++){var f0=h0.charAt(Gr);s(d,u,w,f0,f0)}var v0='0123456789!@*()-=+";:?/.,';for(var Ur=0;Ur<v0.length;Ur++){var g0=v0.charAt(Ur);s(E,u,w,g0,g0)}var br="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";for(var Wr=0;Wr<br.length;Wr++){var or=br.charAt(Wr);s(d,u,ae,or,or),s(E,u,w,or,or)}s(d,v,w,"C","ℂ");s(E,v,w,"C","ℂ");s(d,v,w,"H","ℍ");s(E,v,w,"H","ℍ");s(d,v,w,"N","ℕ");s(E,v,w,"N","ℕ");s(d,v,w,"P","ℙ");s(E,v,w,"P","ℙ");s(d,v,w,"Q","ℚ");s(E,v,w,"Q","ℚ");s(d,v,w,"R","ℝ");s(E,v,w,"R","ℝ");s(d,v,w,"Z","ℤ");s(E,v,w,"Z","ℤ");s(d,u,ae,"h","ℎ");s(E,u,ae,"h","ℎ");var ne;for(var $e=0;$e<br.length;$e++){var ze=br.charAt($e);ne=String.fromCharCode(55349,56320+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56372+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56424+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56580+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56684+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56736+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56788+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56840+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56944+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),$e<26&&(ne=String.fromCharCode(55349,56632+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne),ne=String.fromCharCode(55349,56476+$e),s(d,u,ae,ze,ne),s(E,u,w,ze,ne))}ne="𝕜";s(d,u,ae,"k",ne);s(E,u,w,"k",ne);for(var yt=0;yt<10;yt++){var ut=yt.toString();ne=String.fromCharCode(55349,57294+yt),s(d,u,ae,ut,ne),s(E,u,w,ut,ne),ne=String.fromCharCode(55349,57314+yt),s(d,u,ae,ut,ne),s(E,u,w,ut,ne),ne=String.fromCharCode(55349,57324+yt),s(d,u,ae,ut,ne),s(E,u,w,ut,ne),ne=String.fromCharCode(55349,57334+yt),s(d,u,ae,ut,ne),s(E,u,w,ut,ne)}var ga="ÐÞþ";for(var Xr=0;Xr<ga.length;Xr++){var lr=ga.charAt(Xr);s(d,u,ae,lr,lr),s(E,u,w,lr,lr)}var ba={mathClass:"mathbf",textClass:"textbf",font:"Main-Bold"},b0={mathClass:"mathnormal",textClass:"textit",font:"Math-Italic"},y0={mathClass:"boldsymbol",textClass:"boldsymbol",font:"Main-BoldItalic"},as={mathClass:"mathscr",textClass:"textscr",font:"Script-Regular"},wt={mathClass:"",textClass:"",font:""},x0={mathClass:"mathfrak",textClass:"textfrak",font:"Fraktur-Regular"},w0={mathClass:"mathbb",textClass:"textbb",font:"AMS-Regular"},k0={mathClass:"mathboldfrak",textClass:"textboldfrak",font:"Fraktur-Regular"},ya={mathClass:"mathsf",textClass:"textsf",font:"SansSerif-Regular"},xa={mathClass:"mathboldsf",textClass:"textboldsf",font:"SansSerif-Bold"},S0={mathClass:"mathitsf",textClass:"textitsf",font:"SansSerif-Italic"},wa={mathClass:"mathtt",textClass:"texttt",font:"Typewriter-Regular"},M0=[ba,ba,b0,b0,y0,y0,as,wt,wt,wt,x0,x0,w0,w0,k0,k0,ya,ya,xa,xa,S0,S0,wt,wt,wa,wa],is=[ba,wt,ya,xa,wa],ns=r=>{var e=r.charCodeAt(0),t=r.charCodeAt(1),a=(e-55296)*1024+(t-56320)+65536;if(119808<=a&&a<120484){var i=Math.floor((a-119808)/26);return M0[i]}else if(120782<=a&&a<=120831){var n=Math.floor((a-120782)/10);return is[n]}else{if(a===120485||a===120486)return M0[0];if(120486<a&&a<120782)return wt;throw new B("Unsupported character: "+r)}},Mr=function(e,t,a){if(xe[a][e]){var i=xe[a][e].replace;i&&(e=i)}return{value:e,metrics:ja(e,t,a)}},Re=function(e,t,a,i,n){var o=Mr(e,t,a),l=o.metrics;e=o.value;var c;if(l){var m=l.italic;(a==="text"||i&&i.font==="mathit")&&(m=0),c=new Ge(e,l.height,l.depth,m,l.skew,l.width,n)}else typeof console<"u"&&console.warn("No character metrics "+("for '"+e+"' in style '"+t+"' and mode '"+a+"'")),c=new Ge(e,0,0,0,0,0,n);if(i){c.maxFontSize=i.sizeMultiplier,i.style.isTight()&&c.classes.push("mtight");var h=i.getColor();h&&(c.style.color=h)}return c},Na=function(e,t,a,i){return i===void 0&&(i=[]),a.font==="boldsymbol"&&Mr(e,"Main-Bold",t).metrics?Re(e,"Main-Bold",t,a,i.concat(["mathbf"])):e==="\\"||xe[t][e].font==="main"?Re(e,"Main-Regular",t,a,i):Re(e,"AMS-Regular",t,a,i.concat(["amsrm"]))},ss=function(e,t,a){return a!=="textord"&&Mr(e,"Math-BoldItalic",t).metrics?{fontName:"Math-BoldItalic",fontClass:"boldsymbol"}:{fontName:"Main-Bold",fontClass:"mathbf"}},zr=function(e,t,a){var i=e.mode,n=e.text,o=["mord"],{font:l,fontFamily:c,fontWeight:m,fontShape:h}=t,f=i==="math"||i==="text"&&!!l,y=f?l:c,g="",C="";if(n.charCodeAt(0)===55349){var z=ns(n);g=z.font,C=z[i+"Class"]}if(g)return Re(n,g,i,t,o.concat(C));if(y){var k,M;if(y==="boldsymbol"){var A=ss(n,i,a);k=A.fontName,M=[A.fontClass]}else f?(k=ka[l].fontName,M=[l]):(k=dr(c,m,h),M=[c,m,h]);if(Mr(n,k,i).metrics)return Re(n,k,i,t,o.concat(M));if(ii.hasOwnProperty(n)&&k.slice(0,10)==="Typewriter"){for(var D=[],$=0;$<n.length;$++)D.push(Re(n[$],k,i,t,o.concat(M)));return dt(D)}}if(a==="mathord")return Re(n,"Math-Italic",i,t,o.concat(["mathnormal"]));if(a==="textord"){var Y=xe[i][n]&&xe[i][n].font;if(Y==="ams"){var Q=dr("amsrm",m,h);return Re(n,Q,i,t,o.concat("amsrm",m,h))}else if(Y==="main"||!Y){var X=dr("textrm",m,h);return Re(n,X,i,t,o.concat(m,h))}else{var K=dr(Y,m,h);return Re(n,K,i,t,o.concat(K,m,h))}}else throw new Error("unexpected type: "+a+" in makeOrd")},os=(r,e)=>{if(pt(r.classes)!==pt(e.classes)||r.skew!==e.skew||r.maxFontSize!==e.maxFontSize||r.italic!==0&&r.hasClass("mathnormal"))return!1;if(r.classes.length===1){var t=r.classes[0];if(t==="mbin"||t==="mord")return!1}for(var a of Object.keys(r.style))if(r.style[a]!==e.style[a])return!1;for(var i of Object.keys(e.style))if(r.style[i]!==e.style[i])return!1;return!0},ni=r=>{for(var e=0;e<r.length-1;e++){var t=r[e],a=r[e+1];t instanceof Ge&&a instanceof Ge&&os(t,a)&&(t.text+=a.text,t.height=Math.max(t.height,a.height),t.depth=Math.max(t.depth,a.depth),t.italic=a.italic,r.splice(e+1,1),e--)}return r},Oa=function(e){for(var t=0,a=0,i=0,n=0;n<e.children.length;n++){var o=e.children[n];o.height>t&&(t=o.height),o.depth>a&&(a=o.depth),o.maxFontSize>i&&(i=o.maxFontSize)}e.height=t,e.depth=a,e.maxFontSize=i},I=function(e,t,a,i){var n=new Vt(e,t,a,i);return Oa(n),n},ft=(r,e,t,a)=>new Vt(r,e,t,a),Nt=function(e,t,a){var i=I([e],[],t);return i.height=Math.max(a||t.fontMetrics().defaultRuleThickness,t.minRuleThickness),i.style.borderBottomWidth=q(i.height),i.maxFontSize=1,i},ls=function(e,t,a,i){var n=new Sr(e,t,a,i);return Oa(n),n},dt=function(e){var t=new Ht(e);return Oa(t),t},Ot=function(e,t){return e instanceof Ht?I([],[e],t):e},ds=function(e){if(e.positionType==="individualShift"){for(var t=e.children,a=[t[0]],i=-t[0].shift-t[0].elem.depth,n=i,o=1;o<t.length;o++){var l=-t[o].shift-n-t[o].elem.depth,c=l-(t[o-1].elem.height+t[o-1].elem.depth);n=n+l,a.push({type:"kern",size:c}),a.push(t[o])}return{children:a,depth:i}}var m;if(e.positionType==="top"){for(var h=e.positionData,f=0;f<e.children.length;f++){var y=e.children[f];h-=y.type==="kern"?y.size:y.elem.height+y.elem.depth}m=h}else if(e.positionType==="bottom")m=-e.positionData;else{var g=e.children[0];if(g.type!=="elem")throw new Error('First child must have type "elem".');if(e.positionType==="shift")m=-g.elem.depth-e.positionData;else if(e.positionType==="firstBaseline")m=-g.elem.depth;else throw new Error("Invalid positionType "+e.positionType+".")}return{children:e.children,depth:m}},pe=function(e,t){for(var{children:a,depth:i}=ds(e),n=0,o=0;o<a.length;o++){var l=a[o];if(l.type==="elem"){var c=l.elem;n=Math.max(n,c.maxFontSize,c.height)}}n+=2;var m=I(["pstrut"],[]);m.style.height=q(n);for(var h=[],f=i,y=i,g=i,C=0;C<a.length;C++){var z=a[C];if(z.type==="kern")g+=z.size;else{var k=z.elem,M=z.wrapperClasses||[],A=z.wrapperStyle||{},D=I(M,[m,k],void 0,A);D.style.top=q(-n-g-k.depth),z.marginLeft&&(D.style.marginLeft=z.marginLeft),z.marginRight&&(D.style.marginRight=z.marginRight),h.push(D),g+=k.height+k.depth}f=Math.min(f,g),y=Math.max(y,g)}var $=I(["vlist"],h);$.style.height=q(y);var Y;if(f<0){var Q=I([],[]),X=I(["vlist"],[Q]);X.style.height=q(-f);var K=I(["vlist-s"],[new Ge("​")]);Y=[I(["vlist-r"],[$,K]),I(["vlist-r"],[X])]}else Y=[I(["vlist-r"],[$])];var R=I(["vlist-t"],Y);return Y.length===2&&R.classes.push("vlist-t2"),R.height=y,R.depth=-f,R},si=(r,e)=>{var t=I(["mspace"],[],e),a=Se(r,e);return t.style.marginRight=q(a),t},dr=(r,e,t)=>{var a,i;switch(r){case"amsrm":a="AMS";break;case"textrm":a="Main";break;case"textsf":a="SansSerif";break;case"texttt":a="Typewriter";break;default:a=r}return e==="textbf"&&t==="textit"?i="BoldItalic":e==="textbf"?i="Bold":t==="textit"?i="Italic":i="Regular",a+"-"+i},ka={mathbf:{variant:"bold",fontName:"Main-Bold"},mathrm:{variant:"normal",fontName:"Main-Regular"},textit:{variant:"italic",fontName:"Main-Italic"},mathit:{variant:"italic",fontName:"Main-Italic"},mathnormal:{variant:"italic",fontName:"Math-Italic"},mathsfit:{variant:"sans-serif-italic",fontName:"SansSerif-Italic"},mathbb:{variant:"double-struck",fontName:"AMS-Regular"},mathcal:{variant:"script",fontName:"Caligraphic-Regular"},mathfrak:{variant:"fraktur",fontName:"Fraktur-Regular"},mathscr:{variant:"script",fontName:"Script-Regular"},mathsf:{variant:"sans-serif",fontName:"SansSerif-Regular"},mathtt:{variant:"monospace",fontName:"Typewriter-Regular"}},oi={vec:["vec",.471,.714],oiintSize1:["oiintSize1",.957,.499],oiintSize2:["oiintSize2",1.472,.659],oiiintSize1:["oiiintSize1",1.304,.499],oiiintSize2:["oiiintSize2",1.98,.659]},li=function(e,t){var[a,i,n]=oi[e],o=new ht(a),l=new st([o],{width:q(i),height:q(n),style:"width:"+q(i),viewBox:"0 0 "+1e3*i+" "+1e3*n,preserveAspectRatio:"xMinYMin"}),c=ft(["overlay"],[l],t);return c.height=n,c.style.height=q(n),c.style.width=q(i),c},ke={number:3,unit:"mu"},xt={number:4,unit:"mu"},rt={number:5,unit:"mu"},cs={mord:{mop:ke,mbin:xt,mrel:rt,minner:ke},mop:{mord:ke,mop:ke,mrel:rt,minner:ke},mbin:{mord:xt,mop:xt,mopen:xt,minner:xt},mrel:{mord:rt,mop:rt,mopen:rt,minner:rt},mopen:{},mclose:{mop:ke,mbin:xt,mrel:rt,minner:ke},mpunct:{mord:ke,mop:ke,mrel:rt,mopen:ke,mclose:ke,mpunct:ke,minner:ke},minner:{mord:ke,mop:ke,mbin:xt,mrel:rt,mopen:ke,mpunct:ke,minner:ke}},us={mord:{mop:ke},mop:{mord:ke,mop:ke},mbin:{},mrel:{},mopen:{},mclose:{mop:ke},mpunct:{},minner:{mop:ke}},di={},yr={},xr={};function V(r){for(var{type:e,names:t,props:a,handler:i,htmlBuilder:n,mathmlBuilder:o}=r,l={type:e,numArgs:a.numArgs,argTypes:a.argTypes,allowedInArgument:!!a.allowedInArgument,allowedInText:!!a.allowedInText,allowedInMath:a.allowedInMath===void 0?!0:a.allowedInMath,numOptionalArgs:a.numOptionalArgs||0,infix:!!a.infix,primitive:!!a.primitive,handler:i},c=0;c<t.length;++c)di[t[c]]=l;e&&(n&&(yr[e]=n),o&&(xr[e]=o))}function Bt(r){var{type:e,htmlBuilder:t,mathmlBuilder:a}=r;V({type:e,names:[],props:{numArgs:0},handler(){throw new Error("Should never be called.")},htmlBuilder:t,mathmlBuilder:a})}var wr=function(e){return e.type==="ordgroup"&&e.body.length===1?e.body[0]:e},Ce=function(e){return e.type==="ordgroup"?e.body:[e]},ms=new Set(["leftmost","mbin","mopen","mrel","mop","mpunct"]),ps=new Set(["rightmost","mrel","mclose","mpunct"]),hs={display:se.DISPLAY,text:se.TEXT,script:se.SCRIPT,scriptscript:se.SCRIPTSCRIPT},fs={mord:"mord",mop:"mop",mbin:"mbin",mrel:"mrel",mopen:"mopen",mclose:"mclose",mpunct:"mpunct",minner:"minner"},Ie=function(e,t,a,i){i===void 0&&(i=[null,null]);for(var n=[],o=0;o<e.length;o++){var l=he(e[o],t);if(l instanceof Ht){var c=l.children;n.push(...c)}else n.push(l)}if(ni(n),!a)return n;var m=t;if(e.length===1){var h=e[0];h.type==="sizing"?m=t.havingSize(h.size):h.type==="styling"&&(m=t.havingStyle(hs[h.style]))}var f=I([i[0]||"leftmost"],[],t),y=I([i[1]||"rightmost"],[],t),g=a==="root";return Sa(n,(C,z)=>{var k=z.classes[0],M=C.classes[0];k==="mbin"&&ps.has(M)?z.classes[0]="mord":M==="mbin"&&ms.has(k)&&(C.classes[0]="mord")},{node:f},y,g),Sa(n,(C,z)=>{var k,M,A=za(z),D=za(C),$=A&&D?C.hasClass("mtight")?(k=us[A])==null?void 0:k[D]:(M=cs[A])==null?void 0:M[D]:null;if($)return si($,m)},{node:f},y,g),n},Sa=function(e,t,a,i,n){i&&e.push(i);for(var o=0;o<e.length;o++){var l=e[o],c=ci(l);if(c){Sa(c.children,t,a,null,n);continue}var m=!l.hasClass("mspace");if(m){var h=t(l,a.node);h&&(a.insertAfter?a.insertAfter(h):(e.unshift(h),o++))}m?a.node=l:n&&l.hasClass("newline")&&(a.node=I(["leftmost"])),a.insertAfter=(f=>y=>{e.splice(f+1,0,y),o++})(o)}i&&e.pop()},ci=function(e){return e instanceof Ht||e instanceof Sr||e instanceof Vt&&e.hasClass("enclosing")?e:null},Ma=function(e,t){var a=ci(e);if(a){var i=a.children;if(i.length){if(t==="right")return Ma(i[i.length-1],"right");if(t==="left")return Ma(i[0],"left")}}return e},za=function(e,t){if(!e)return null;t&&(e=Ma(e,t));var a=e.classes[0];return fs[a]||null},tr=function(e,t){var a=["nulldelimiter"].concat(e.baseSizingClasses());return I(t.concat(a))},he=function(e,t,a){if(!e)return I();if(yr[e.type]){var i=yr[e.type](e,t);if(a&&t.size!==a.size){i=I(t.sizingClasses(a),[i],t);var n=t.sizeMultiplier/a.sizeMultiplier;i.height*=n,i.depth*=n}return i}else throw new B("Got group of unknown type: '"+e.type+"'")};function cr(r,e){var t=I(["base"],r,e),a=I(["strut"]);return a.style.height=q(t.height+t.depth),t.depth&&(a.style.verticalAlign=q(-t.depth)),t.children.unshift(a),t}function Ca(r,e){var t=null;r.length===1&&r[0].type==="tag"&&(t=r[0].tag,r=r[0].body);var a=Ie(r,e,"root"),i;a.length===2&&a[1].hasClass("tag")&&(i=a.pop());for(var n=[],o=[],l=0;l<a.length;l++)if(o.push(a[l]),a[l].hasClass("mbin")||a[l].hasClass("mrel")||a[l].hasClass("allowbreak")){for(var c=!1;l<a.length-1&&a[l+1].hasClass("mspace")&&!a[l+1].hasClass("newline");)l++,o.push(a[l]),a[l].hasClass("nobreak")&&(c=!0);c||(n.push(cr(o,e)),o=[])}else a[l].hasClass("newline")&&(o.pop(),o.length>0&&(n.push(cr(o,e)),o=[]),n.push(a[l]));o.length>0&&n.push(cr(o,e));var m;t?(m=cr(Ie(t,e,!0),e),m.classes=["tag"],n.push(m)):i&&n.push(i);var h=I(["katex-html"],n);if(h.setAttribute("aria-hidden","true"),m){var f=m.children[0];f.style.height=q(h.height+h.depth),h.depth&&(f.style.verticalAlign=q(-h.depth))}return h}function ui(r){return new Ht(r)}class L{constructor(e,t,a){this.type=void 0,this.attributes=void 0,this.children=void 0,this.classes=void 0,this.type=e,this.attributes={},this.children=t||[],this.classes=a||[]}setAttribute(e,t){this.attributes[e]=t}getAttribute(e){return this.attributes[e]}toNode(){var e=document.createElementNS("http://www.w3.org/1998/Math/MathML",this.type);for(var t in this.attributes)Object.prototype.hasOwnProperty.call(this.attributes,t)&&e.setAttribute(t,this.attributes[t]);this.classes.length>0&&(e.className=pt(this.classes));for(var a=0;a<this.children.length;a++)if(this.children[a]instanceof Ae&&this.children[a+1]instanceof Ae){for(var i=this.children[a].toText()+this.children[++a].toText();this.children[a+1]instanceof Ae;)i+=this.children[++a].toText();e.appendChild(new Ae(i).toNode())}else e.appendChild(this.children[a].toNode());return e}toMarkup(){var e="<"+this.type;for(var t in this.attributes)Object.prototype.hasOwnProperty.call(this.attributes,t)&&(e+=" "+t+'="',e+=Le(this.attributes[t]),e+='"');this.classes.length>0&&(e+=' class ="'+Le(pt(this.classes))+'"'),e+=">";for(var a=0;a<this.children.length;a++)e+=this.children[a].toMarkup();return e+="</"+this.type+">",e}toText(){return this.children.map(e=>e.toText()).join("")}}class Ae{constructor(e){this.text=void 0,this.text=e}toNode(){return document.createTextNode(this.text)}toMarkup(){return Le(this.toText())}toText(){return this.text}}class mi{constructor(e){this.width=void 0,this.character=void 0,this.width=e,e>=.05555&&e<=.05556?this.character=" ":e>=.1666&&e<=.1667?this.character=" ":e>=.2222&&e<=.2223?this.character=" ":e>=.2777&&e<=.2778?this.character="  ":e>=-.05556&&e<=-.05555?this.character=" ⁣":e>=-.1667&&e<=-.1666?this.character=" ⁣":e>=-.2223&&e<=-.2222?this.character=" ⁣":e>=-.2778&&e<=-.2777?this.character=" ⁣":this.character=null}toNode(){if(this.character)return document.createTextNode(this.character);var e=document.createElementNS("http://www.w3.org/1998/Math/MathML","mspace");return e.setAttribute("width",q(this.width)),e}toMarkup(){return this.character?"<mtext>"+this.character+"</mtext>":'<mspace width="'+q(this.width)+'"/>'}toText(){return this.character?this.character:" "}}var vs=new Set(["\\imath","\\jmath"]),gs=new Set(["mrow","mtable"]),Ke=function(e,t,a){return xe[t][e]&&xe[t][e].replace&&e.charCodeAt(0)!==55349&&!(ii.hasOwnProperty(e)&&a&&(a.fontFamily&&a.fontFamily.slice(4,6)==="tt"||a.font&&a.font.slice(4,6)==="tt"))&&(e=xe[t][e].replace),new Ae(e)},Ha=function(e){return e.length===1?e[0]:new L("mrow",e)},bs={mathit:"italic",boldsymbol:r=>r.type==="textord"?"bold":"bold-italic",mathbf:"bold",mathbb:"double-struck",mathsfit:"sans-serif-italic",mathfrak:"fraktur",mathscr:"script",mathcal:"script",mathsf:"sans-serif",mathtt:"monospace"},Va=(r,e)=>{if(r.mode==="text"){if(e.fontFamily==="texttt")return"monospace";if(e.fontFamily==="textsf")return e.fontShape==="textit"&&e.fontWeight==="textbf"?"sans-serif-bold-italic":e.fontShape==="textit"?"sans-serif-italic":e.fontWeight==="textbf"?"bold-sans-serif":"sans-serif";if(e.fontShape==="textit"&&e.fontWeight==="textbf")return"bold-italic";if(e.fontShape==="textit")return"italic";if(e.fontWeight==="textbf")return"bold"}var t=e.font;if(!t||t==="mathnormal")return null;var a=r.mode,i=bs[t];if(i)return typeof i=="function"?i(r):i;var n=r.text;if(vs.has(n))return null;if(xe[a][n]){var o=xe[a][n].replace;o&&(n=o)}var l=ka[t].fontName;return ja(n,l,a)?ka[t].variant:null};function Yr(r){if(!r)return!1;if(r.type==="mi"&&r.children.length===1){var e=r.children[0];return e instanceof Ae&&e.text==="."}else if(r.type==="mo"&&r.children.length===1&&r.getAttribute("separator")==="true"&&r.getAttribute("lspace")==="0em"&&r.getAttribute("rspace")==="0em"){var t=r.children[0];return t instanceof Ae&&t.text===","}else return!1}var We=function(e,t,a){if(e.length===1){var i=ge(e[0],t);return a&&i instanceof L&&i.type==="mo"&&(i.setAttribute("lspace","0em"),i.setAttribute("rspace","0em")),[i]}for(var n=[],o,l=0;l<e.length;l++){var c=ge(e[l],t);if(c instanceof L&&o instanceof L){if(c.type==="mtext"&&o.type==="mtext"&&c.getAttribute("mathvariant")===o.getAttribute("mathvariant")){o.children.push(...c.children);continue}else if(c.type==="mn"&&o.type==="mn"){o.children.push(...c.children);continue}else if(Yr(c)&&o.type==="mn"){o.children.push(...c.children);continue}else if(c.type==="mn"&&Yr(o))c.children=[...o.children,...c.children],n.pop();else if((c.type==="msup"||c.type==="msub")&&c.children.length>=1&&(o.type==="mn"||Yr(o))){var m=c.children[0];m instanceof L&&m.type==="mn"&&(m.children=[...o.children,...m.children],n.pop())}else if(o.type==="mi"&&o.children.length===1){var h=o.children[0];if(h instanceof Ae&&h.text==="̸"&&(c.type==="mo"||c.type==="mi"||c.type==="mn")){var f=c.children[0];f instanceof Ae&&f.text.length>0&&(f.text=f.text.slice(0,1)+"̸"+f.text.slice(1),n.pop())}}}n.push(c),o=c}return n},vt=function(e,t,a){return Ha(We(e,t,a))},ge=function(e,t){if(!e)return new L("mrow");if(xr[e.type])return xr[e.type](e,t);throw new B("Got group of unknown type: '"+e.type+"'")};function z0(r,e,t,a,i){var n=We(r,t),o;n.length===1&&n[0]instanceof L&&gs.has(n[0].type)?o=n[0]:o=new L("mrow",n);var l=new L("annotation",[new Ae(e)]);l.setAttribute("encoding","application/x-tex");var c=new L("semantics",[o,l]),m=new L("math",[c]);m.setAttribute("xmlns","http://www.w3.org/1998/Math/MathML"),a&&m.setAttribute("display","block");var h=i?"katex":"katex-mathml";return I([h],[m])}var ys=[[1,1,1],[2,1,1],[3,1,1],[4,2,1],[5,2,1],[6,3,1],[7,4,2],[8,6,3],[9,7,6],[10,8,7],[11,10,9]],C0=[.5,.6,.7,.8,.9,1,1.2,1.44,1.728,2.074,2.488],A0=function(e,t){return t.size<2?e:ys[e-1][t.size-1]};class it{constructor(e){this.style=void 0,this.color=void 0,this.size=void 0,this.textSize=void 0,this.phantom=void 0,this.font=void 0,this.fontFamily=void 0,this.fontWeight=void 0,this.fontShape=void 0,this.sizeMultiplier=void 0,this.maxSize=void 0,this.minRuleThickness=void 0,this._fontMetrics=void 0,this.style=e.style,this.color=e.color,this.size=e.size||it.BASESIZE,this.textSize=e.textSize||this.size,this.phantom=!!e.phantom,this.font=e.font||"",this.fontFamily=e.fontFamily||"",this.fontWeight=e.fontWeight||"",this.fontShape=e.fontShape||"",this.sizeMultiplier=C0[this.size-1],this.maxSize=e.maxSize,this.minRuleThickness=e.minRuleThickness,this._fontMetrics=void 0}extend(e){var t={style:this.style,size:this.size,textSize:this.textSize,color:this.color,phantom:this.phantom,font:this.font,fontFamily:this.fontFamily,fontWeight:this.fontWeight,fontShape:this.fontShape,maxSize:this.maxSize,minRuleThickness:this.minRuleThickness};return Object.assign(t,e),new it(t)}havingStyle(e){return this.style===e?this:this.extend({style:e,size:A0(this.textSize,e)})}havingCrampedStyle(){return this.havingStyle(this.style.cramp())}havingSize(e){return this.size===e&&this.textSize===e?this:this.extend({style:this.style.text(),size:e,textSize:e,sizeMultiplier:C0[e-1]})}havingBaseStyle(e){e=e||this.style.text();var t=A0(it.BASESIZE,e);return this.size===t&&this.textSize===it.BASESIZE&&this.style===e?this:this.extend({style:e,size:t})}havingBaseSizing(){var e;switch(this.style.id){case 4:case 5:e=3;break;case 6:case 7:e=1;break;default:e=6}return this.extend({style:this.style.text(),size:e})}withColor(e){return this.extend({color:e})}withPhantom(){return this.extend({phantom:!0})}withFont(e){return this.extend({font:e})}withTextFontFamily(e){return this.extend({fontFamily:e,font:""})}withTextFontWeight(e){return this.extend({fontWeight:e,font:""})}withTextFontShape(e){return this.extend({fontShape:e,font:""})}sizingClasses(e){return e.size!==this.size?["sizing","reset-size"+e.size,"size"+this.size]:[]}baseSizingClasses(){return this.size!==it.BASESIZE?["sizing","reset-size"+this.size,"size"+it.BASESIZE]:[]}fontMetrics(){return this._fontMetrics||(this._fontMetrics=rs(this.size)),this._fontMetrics}getColor(){return this.phantom?"transparent":this.color}}it.BASESIZE=6;var pi=function(e){return new it({style:e.displayMode?se.DISPLAY:se.TEXT,maxSize:e.maxSize,minRuleThickness:e.minRuleThickness})},hi=function(e,t){if(t.displayMode){var a=["katex-display"];t.leqno&&a.push("leqno"),t.fleqn&&a.push("fleqn"),e=I(a,[e])}return e},xs=function(e,t,a){var i=pi(a),n;if(a.output==="mathml")return z0(e,t,i,a.displayMode,!0);if(a.output==="html"){var o=Ca(e,i);n=I(["katex"],[o])}else{var l=z0(e,t,i,a.displayMode,!1),c=Ca(e,i);n=I(["katex"],[l,c])}return hi(n,a)},ws=function(e,t,a){var i=pi(a),n=Ca(e,i),o=I(["katex"],[n]);return hi(o,a)},ks={widehat:"^",widecheck:"ˇ",widetilde:"~",utilde:"~",overleftarrow:"←",underleftarrow:"←",xleftarrow:"←",overrightarrow:"→",underrightarrow:"→",xrightarrow:"→",underbrace:"⏟",overbrace:"⏞",underbracket:"⎵",overbracket:"⎴",overgroup:"⏠",undergroup:"⏡",overleftrightarrow:"↔",underleftrightarrow:"↔",xleftrightarrow:"↔",Overrightarrow:"⇒",xRightarrow:"⇒",overleftharpoon:"↼",xleftharpoonup:"↼",overrightharpoon:"⇀",xrightharpoonup:"⇀",xLeftarrow:"⇐",xLeftrightarrow:"⇔",xhookleftarrow:"↩",xhookrightarrow:"↪",xmapsto:"↦",xrightharpoondown:"⇁",xleftharpoondown:"↽",xrightleftharpoons:"⇌",xleftrightharpoons:"⇋",xtwoheadleftarrow:"↞",xtwoheadrightarrow:"↠",xlongequal:"=",xtofrom:"⇄",xrightleftarrows:"⇄",xrightequilibrium:"⇌",xleftequilibrium:"⇋","\\cdrightarrow":"→","\\cdleftarrow":"←","\\cdlongequal":"="},Cr=function(e){var t=new L("mo",[new Ae(ks[e.replace(/^\\/,"")])]);return t.setAttribute("stretchy","true"),t},Ss={overrightarrow:[["rightarrow"],.888,522,"xMaxYMin"],overleftarrow:[["leftarrow"],.888,522,"xMinYMin"],underrightarrow:[["rightarrow"],.888,522,"xMaxYMin"],underleftarrow:[["leftarrow"],.888,522,"xMinYMin"],xrightarrow:[["rightarrow"],1.469,522,"xMaxYMin"],"\\cdrightarrow":[["rightarrow"],3,522,"xMaxYMin"],xleftarrow:[["leftarrow"],1.469,522,"xMinYMin"],"\\cdleftarrow":[["leftarrow"],3,522,"xMinYMin"],Overrightarrow:[["doublerightarrow"],.888,560,"xMaxYMin"],xRightarrow:[["doublerightarrow"],1.526,560,"xMaxYMin"],xLeftarrow:[["doubleleftarrow"],1.526,560,"xMinYMin"],overleftharpoon:[["leftharpoon"],.888,522,"xMinYMin"],xleftharpoonup:[["leftharpoon"],.888,522,"xMinYMin"],xleftharpoondown:[["leftharpoondown"],.888,522,"xMinYMin"],overrightharpoon:[["rightharpoon"],.888,522,"xMaxYMin"],xrightharpoonup:[["rightharpoon"],.888,522,"xMaxYMin"],xrightharpoondown:[["rightharpoondown"],.888,522,"xMaxYMin"],xlongequal:[["longequal"],.888,334,"xMinYMin"],"\\cdlongequal":[["longequal"],3,334,"xMinYMin"],xtwoheadleftarrow:[["twoheadleftarrow"],.888,334,"xMinYMin"],xtwoheadrightarrow:[["twoheadrightarrow"],.888,334,"xMaxYMin"],overleftrightarrow:[["leftarrow","rightarrow"],.888,522],overbrace:[["leftbrace","midbrace","rightbrace"],1.6,548],underbrace:[["leftbraceunder","midbraceunder","rightbraceunder"],1.6,548],underleftrightarrow:[["leftarrow","rightarrow"],.888,522],xleftrightarrow:[["leftarrow","rightarrow"],1.75,522],xLeftrightarrow:[["doubleleftarrow","doublerightarrow"],1.75,560],xrightleftharpoons:[["leftharpoondownplus","rightharpoonplus"],1.75,716],xleftrightharpoons:[["leftharpoonplus","rightharpoondownplus"],1.75,716],xhookleftarrow:[["leftarrow","righthook"],1.08,522],xhookrightarrow:[["lefthook","rightarrow"],1.08,522],overlinesegment:[["leftlinesegment","rightlinesegment"],.888,522],underlinesegment:[["leftlinesegment","rightlinesegment"],.888,522],overbracket:[["leftbracketover","rightbracketover"],1.6,440],underbracket:[["leftbracketunder","rightbracketunder"],1.6,410],overgroup:[["leftgroup","rightgroup"],.888,342],undergroup:[["leftgroupunder","rightgroupunder"],.888,342],xmapsto:[["leftmapsto","rightarrow"],1.5,522],xtofrom:[["leftToFrom","rightToFrom"],1.75,528],xrightleftarrows:[["baraboveleftarrow","rightarrowabovebar"],1.75,901],xrightequilibrium:[["baraboveshortleftharpoon","rightharpoonaboveshortbar"],1.75,716],xleftequilibrium:[["shortbaraboveleftharpoon","shortrightharpoonabovebar"],1.75,716]},Ms=new Set(["widehat","widecheck","widetilde","utilde"]),Ar=function(e,t){function a(){var l=4e5,c=e.label.slice(1);if(Ms.has(c)&&"base"in e){var m=e.base.type==="ordgroup"?e.base.body.length:1,h,f,y;if(m>5)c==="widehat"||c==="widecheck"?(h=420,l=2364,y=.42,f=c+"4"):(h=312,l=2340,y=.34,f="tilde4");else{var g=[1,1,2,2,3,3][m];c==="widehat"||c==="widecheck"?(l=[0,1062,2364,2364,2364][g],h=[0,239,300,360,420][g],y=[0,.24,.3,.3,.36,.42][g],f=c+g):(l=[0,600,1033,2339,2340][g],h=[0,260,286,306,312][g],y=[0,.26,.286,.3,.306,.34][g],f="tilde"+g)}var C=new ht(f),z=new st([C],{width:"100%",height:q(y),viewBox:"0 0 "+l+" "+h,preserveAspectRatio:"none"});return{span:ft([],[z],t),minWidth:0,height:y}}else{var k=[],M=Ss[c];if(!M)throw new Error('No SVG data for "'+c+'".');var[A,D,$]=M,Y=$/1e3,Q=A.length,X,K;if(Q===1){if(M.length!==4)throw new Error('Expected 4-tuple for single-path SVG data "'+c+'".');X=["hide-tail"],K=[M[3]]}else if(Q===2)X=["halfarrow-left","halfarrow-right"],K=["xMinYMin","xMaxYMin"];else if(Q===3)X=["brace-left","brace-center","brace-right"],K=["xMinYMin","xMidYMin","xMaxYMin"];else throw new Error(`Correct katexImagesData or update code here to support
                    `+Q+" children.");for(var R=0;R<Q;R++){var J=new ht(A[R]),ie=new st([J],{width:"400em",height:q(Y),viewBox:"0 0 "+l+" "+$,preserveAspectRatio:K[R]+" slice"}),G=ft([X[R]],[ie],t);if(Q===1)return{span:G,minWidth:D,height:Y};G.style.height=q(Y),k.push(G)}return{span:I(["stretchy"],k,t),minWidth:D,height:Y}}}var{span:i,minWidth:n,height:o}=a();return i.height=o,i.style.height=q(o),n>0&&(i.style.minWidth=q(n)),i},zs=function(e,t,a,i,n){var o,l=e.height+e.depth+a+i;if(/fbox|color|angl/.test(t)){if(o=I(["stretchy",t],[],n),t==="fbox"){var c=n.color&&n.getColor();c&&(o.style.borderColor=c)}}else{var m=[];/^[bx]cancel$/.test(t)&&m.push(new va({x1:"0",y1:"0",x2:"100%",y2:"100%","stroke-width":"0.046em"})),/^x?cancel$/.test(t)&&m.push(new va({x1:"0",y1:"100%",x2:"100%",y2:"0","stroke-width":"0.046em"}));var h=new st(m,{width:"100%",height:q(l)});o=ft([],[h],n)}return o.height=l,o.style.height=q(l),o},Cs={bin:1,close:1,inner:1,open:1,punct:1,rel:1},As={"accent-token":1,mathord:1,"op-token":1,spacing:1,textord:1};function Ts(r){return r in Cs}function oe(r,e){if(!r||r.type!==e)throw new Error("Expected node of type "+e+", but got "+(r?"node of type "+r.type:String(r)));return r}function Tr(r){var e=Er(r);if(!e)throw new Error("Expected node of symbol group type, but got "+(r?"node of type "+r.type:String(r)));return e}function Er(r){return r&&(r.type==="atom"||As.hasOwnProperty(r.type))?r:null}var fi=r=>{if(r instanceof Ge)return r;if(es(r)&&r.children.length===1)return fi(r.children[0])},Ga=(r,e)=>{var t,a,i;r&&r.type==="supsub"?(a=oe(r.base,"accent"),t=a.base,r.base=t,i=_n(he(r,e)),r.base=a):(a=oe(r,"accent"),t=a.base);var n=he(t,e.havingCrampedStyle()),o=a.isShifty&&ot(t),l=0;if(o){var c,m;l=(c=(m=fi(n))==null?void 0:m.skew)!=null?c:0}var h=a.label==="\\c",f=h?n.height+n.depth:Math.min(n.height,e.fontMetrics().xHeight),y;if(a.isStretchy)y=Ar(a,e),y=pe({positionType:"firstBaseline",children:[{type:"elem",elem:n},{type:"elem",elem:y,wrapperClasses:["svg-align"],wrapperStyle:l>0?{width:"calc(100% - "+q(2*l)+")",marginLeft:q(2*l)}:void 0}]});else{var g,C;a.label==="\\vec"?(g=li("vec",e),C=oi.vec[1]):(g=zr({mode:a.mode,text:a.label},e,"textord"),g=Qn(g),g.italic=0,C=g.width,h&&(f+=g.depth)),y=I(["accent-body"],[g]);var z=a.label==="\\textcircled";z&&(y.classes.push("accent-full"),f=n.height);var k=l;z||(k-=C/2),y.style.left=q(k),a.label==="\\textcircled"&&(y.style.top=".2em"),y=pe({positionType:"firstBaseline",children:[{type:"elem",elem:n},{type:"kern",size:-f},{type:"elem",elem:y}]})}var M=I(["mord","accent"],[y],e);return i?(i.children[0]=M,i.height=Math.max(M.height,i.height),i.classes[0]="mord",i):M},vi=(r,e)=>{var t=r.isStretchy?Cr(r.label):new L("mo",[Ke(r.label,r.mode)]),a=new L("mover",[ge(r.base,e),t]);return a.setAttribute("accent","true"),a},Es=new RegExp(["\\acute","\\grave","\\ddot","\\tilde","\\bar","\\breve","\\check","\\hat","\\vec","\\dot","\\mathring"].map(r=>"\\"+r).join("|"));V({type:"accent",names:["\\acute","\\grave","\\ddot","\\tilde","\\bar","\\breve","\\check","\\hat","\\vec","\\dot","\\mathring","\\widecheck","\\widehat","\\widetilde","\\overrightarrow","\\overleftarrow","\\Overrightarrow","\\overleftrightarrow","\\overgroup","\\overlinesegment","\\overleftharpoon","\\overrightharpoon"],props:{numArgs:1},handler:(r,e)=>{var t=wr(e[0]),a=!Es.test(r.funcName),i=!a||r.funcName==="\\widehat"||r.funcName==="\\widetilde"||r.funcName==="\\widecheck";return{type:"accent",mode:r.parser.mode,label:r.funcName,isStretchy:a,isShifty:i,base:t}},htmlBuilder:Ga,mathmlBuilder:vi});V({type:"accent",names:["\\'","\\`","\\^","\\~","\\=","\\u","\\.",'\\"',"\\c","\\r","\\H","\\v","\\textcircled"],props:{numArgs:1,allowedInText:!0,allowedInMath:!0,argTypes:["primitive"]},handler:(r,e)=>{var t=e[0],a=r.parser.mode;return a==="math"&&(r.parser.settings.reportNonstrict("mathVsTextAccents","LaTeX's accent "+r.funcName+" works only in text mode"),a="text"),{type:"accent",mode:a,label:r.funcName,isStretchy:!1,isShifty:!0,base:t}},htmlBuilder:Ga,mathmlBuilder:vi});V({type:"accentUnder",names:["\\underleftarrow","\\underrightarrow","\\underleftrightarrow","\\undergroup","\\underlinesegment","\\utilde"],props:{numArgs:1},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=e[0];return{type:"accentUnder",mode:t.mode,label:a,base:i}},htmlBuilder:(r,e)=>{var t=he(r.base,e),a=Ar(r,e),i=r.label==="\\utilde"?.12:0,n=pe({positionType:"top",positionData:t.height,children:[{type:"elem",elem:a,wrapperClasses:["svg-align"]},{type:"kern",size:i},{type:"elem",elem:t}]});return I(["mord","accentunder"],[n],e)},mathmlBuilder:(r,e)=>{var t=Cr(r.label),a=new L("munder",[ge(r.base,e),t]);return a.setAttribute("accentunder","true"),a}});var ur=r=>{var e=new L("mpadded",r?[r]:[]);return e.setAttribute("width","+0.6em"),e.setAttribute("lspace","0.3em"),e};V({type:"xArrow",names:["\\xleftarrow","\\xrightarrow","\\xLeftarrow","\\xRightarrow","\\xleftrightarrow","\\xLeftrightarrow","\\xhookleftarrow","\\xhookrightarrow","\\xmapsto","\\xrightharpoondown","\\xrightharpoonup","\\xleftharpoondown","\\xleftharpoonup","\\xrightleftharpoons","\\xleftrightharpoons","\\xlongequal","\\xtwoheadrightarrow","\\xtwoheadleftarrow","\\xtofrom","\\xrightleftarrows","\\xrightequilibrium","\\xleftequilibrium","\\\\cdrightarrow","\\\\cdleftarrow","\\\\cdlongequal"],props:{numArgs:1,numOptionalArgs:1},handler(r,e,t){var{parser:a,funcName:i}=r;return{type:"xArrow",mode:a.mode,label:i,body:e[0],below:t[0]}},htmlBuilder(r,e){var t=e.style,a=e.havingStyle(t.sup()),i=Ot(he(r.body,a,e),e),n=r.label.slice(0,2)==="\\x"?"x":"cd";i.classes.push(n+"-arrow-pad");var o;r.below&&(a=e.havingStyle(t.sub()),o=Ot(he(r.below,a,e),e),o.classes.push(n+"-arrow-pad"));var l=Ar(r,e),c=-e.fontMetrics().axisHeight+.5*l.height,m=-e.fontMetrics().axisHeight-.5*l.height-.111;(i.depth>.25||r.label==="\\xleftequilibrium")&&(m-=i.depth);var h;if(o){var f=-e.fontMetrics().axisHeight+o.height+.5*l.height+.111;h=pe({positionType:"individualShift",children:[{type:"elem",elem:i,shift:m},{type:"elem",elem:l,shift:c,wrapperClasses:["svg-align"]},{type:"elem",elem:o,shift:f}]})}else h=pe({positionType:"individualShift",children:[{type:"elem",elem:i,shift:m},{type:"elem",elem:l,shift:c,wrapperClasses:["svg-align"]}]});return I(["mrel","x-arrow"],[h],e)},mathmlBuilder(r,e){var t=Cr(r.label);t.setAttribute("minsize",r.label.charAt(0)==="x"?"1.75em":"3.0em");var a;if(r.body){var i=ur(ge(r.body,e));if(r.below){var n=ur(ge(r.below,e));a=new L("munderover",[t,n,i])}else a=new L("mover",[t,i])}else if(r.below){var o=ur(ge(r.below,e));a=new L("munder",[t,o])}else a=ur(),a=new L("mover",[t,a]);return a}});function gi(r,e){var t=Ie(r.body,e,!0);return I([r.mclass],t,e)}function bi(r,e){var t,a=We(r.body,e);return r.mclass==="minner"?t=new L("mpadded",a):r.mclass==="mord"?r.isCharacterBox?(t=a[0],t.type="mi"):t=new L("mi",a):(r.isCharacterBox?(t=a[0],t.type="mo"):t=new L("mo",a),r.mclass==="mbin"?(t.attributes.lspace="0.22em",t.attributes.rspace="0.22em"):r.mclass==="mpunct"?(t.attributes.lspace="0em",t.attributes.rspace="0.17em"):r.mclass==="mopen"||r.mclass==="mclose"?(t.attributes.lspace="0em",t.attributes.rspace="0em"):r.mclass==="minner"&&(t.attributes.lspace="0.0556em",t.attributes.width="+0.1111em")),t}V({type:"mclass",names:["\\mathord","\\mathbin","\\mathrel","\\mathopen","\\mathclose","\\mathpunct","\\mathinner"],props:{numArgs:1,primitive:!0},handler(r,e){var{parser:t,funcName:a}=r,i=e[0];return{type:"mclass",mode:t.mode,mclass:"m"+a.slice(5),body:Ce(i),isCharacterBox:ot(i)}},htmlBuilder:gi,mathmlBuilder:bi});var Ir=r=>{var e=r.type==="ordgroup"&&r.body.length?r.body[0]:r;return e.type==="atom"&&(e.family==="bin"||e.family==="rel")?"m"+e.family:"mord"};V({type:"mclass",names:["\\@binrel"],props:{numArgs:2},handler(r,e){var{parser:t}=r;return{type:"mclass",mode:t.mode,mclass:Ir(e[0]),body:Ce(e[1]),isCharacterBox:ot(e[1])}}});V({type:"mclass",names:["\\stackrel","\\overset","\\underset"],props:{numArgs:2},handler(r,e){var{parser:t,funcName:a}=r,i=e[1],n=e[0],o;a!=="\\stackrel"?o=Ir(i):o="mrel";var l={type:"op",mode:i.mode,limits:!0,alwaysHandleSupSub:!0,parentIsSupSub:!1,symbol:!1,suppressBaseShift:a!=="\\stackrel",body:Ce(i)},c={type:"supsub",mode:n.mode,base:l,sup:a==="\\underset"?null:n,sub:a==="\\underset"?n:null};return{type:"mclass",mode:t.mode,mclass:o,body:[c],isCharacterBox:ot(c)}},htmlBuilder:gi,mathmlBuilder:bi});V({type:"pmb",names:["\\pmb"],props:{numArgs:1,allowedInText:!0},handler(r,e){var{parser:t}=r;return{type:"pmb",mode:t.mode,mclass:Ir(e[0]),body:Ce(e[0])}},htmlBuilder(r,e){var t=Ie(r.body,e,!0),a=I([r.mclass],t,e);return a.style.textShadow="0.02em 0.01em 0.04px",a},mathmlBuilder(r,e){var t=We(r.body,e),a=new L("mstyle",t);return a.setAttribute("style","text-shadow: 0.02em 0.01em 0.04px"),a}});var Is={">":"\\\\cdrightarrow","<":"\\\\cdleftarrow","=":"\\\\cdlongequal",A:"\\uparrow",V:"\\downarrow","|":"\\Vert",".":"no arrow"},T0=()=>({type:"styling",body:[],mode:"math",style:"display",resetFont:!0}),E0=r=>r.type==="textord"&&r.text==="@",Ds=(r,e)=>(r.type==="mathord"||r.type==="atom")&&r.text===e;function Bs(r,e,t){var a=Is[r];switch(a){case"\\\\cdrightarrow":case"\\\\cdleftarrow":return t.callFunction(a,[e[0]],[e[1]]);case"\\uparrow":case"\\downarrow":{var i=t.callFunction("\\\\cdleft",[e[0]],[]),n={type:"atom",text:a,mode:"math",family:"rel"},o=t.callFunction("\\Big",[n],[]),l=t.callFunction("\\\\cdright",[e[1]],[]),c={type:"ordgroup",mode:"math",body:[i,o,l]};return t.callFunction("\\\\cdparent",[c],[])}case"\\\\cdlongequal":return t.callFunction("\\\\cdlongequal",[],[]);case"\\Vert":{var m={type:"textord",text:"\\Vert",mode:"math"};return t.callFunction("\\Big",[m],[])}default:return{type:"textord",text:" ",mode:"math"}}}function Ls(r){var e=[];for(r.gullet.beginGroup(),r.gullet.macros.set("\\cr","\\\\\\relax"),r.gullet.beginGroup();;){e.push(r.parseExpression(!1,"\\\\")),r.gullet.endGroup(),r.gullet.beginGroup();var t=r.fetch().text;if(t==="&"||t==="\\\\")r.consume();else if(t==="\\end"){e[e.length-1].length===0&&e.pop();break}else throw new B("Expected \\\\ or \\cr or \\end",r.nextToken)}for(var a=[],i=[a],n=0;n<e.length;n++){for(var o=e[n],l=T0(),c=0;c<o.length;c++)if(!E0(o[c]))l.body.push(o[c]);else{a.push(l),c+=1;var m=Tr(o[c]).text,h=new Array(2);if(h[0]={type:"ordgroup",mode:"math",body:[]},h[1]={type:"ordgroup",mode:"math",body:[]},!"=|.".includes(m))if("<>AV".includes(m))for(var f=0;f<2;f++){for(var y=!0,g=c+1;g<o.length;g++){if(Ds(o[g],m)){y=!1,c=g;break}if(E0(o[g]))throw new B("Missing a "+m+" character to complete a CD arrow.",o[g]);h[f].body.push(o[g])}if(y)throw new B("Missing a "+m+" character to complete a CD arrow.",o[c])}else throw new B('Expected one of "<>AV=|." after @',o[c]);var C=Bs(m,h,r),z={type:"styling",body:[C],mode:"math",style:"display",resetFont:!0};a.push(z),l=T0()}n%2===0?a.push(l):a.shift(),a=[],i.push(a)}r.gullet.endGroup(),r.gullet.endGroup();var k=new Array(i[0].length).fill({type:"align",align:"c",pregap:.25,postgap:.25});return{type:"array",mode:"math",body:i,arraystretch:1,addJot:!0,rowGaps:[null],cols:k,colSeparationType:"CD",hLinesBeforeRow:new Array(i.length+1).fill([])}}V({type:"cdlabel",names:["\\\\cdleft","\\\\cdright"],props:{numArgs:1},handler(r,e){var{parser:t,funcName:a}=r;return{type:"cdlabel",mode:t.mode,side:a.slice(4),label:e[0]}},htmlBuilder(r,e){var t=e.havingStyle(e.style.sup()),a=Ot(he(r.label,t,e),e);return a.classes.push("cd-label-"+r.side),a.style.bottom=q(.8-a.depth),a.height=0,a.depth=0,a},mathmlBuilder(r,e){var t=new L("mrow",[ge(r.label,e)]);return t=new L("mpadded",[t]),t.setAttribute("width","0"),r.side==="left"&&t.setAttribute("lspace","-1width"),t.setAttribute("voffset","0.7em"),t=new L("mstyle",[t]),t.setAttribute("displaystyle","false"),t.setAttribute("scriptlevel","1"),t}});V({type:"cdlabelparent",names:["\\\\cdparent"],props:{numArgs:1},handler(r,e){var{parser:t}=r;return{type:"cdlabelparent",mode:t.mode,fragment:e[0]}},htmlBuilder(r,e){var t=Ot(he(r.fragment,e),e);return t.classes.push("cd-vert-arrow"),t},mathmlBuilder(r,e){return new L("mrow",[ge(r.fragment,e)])}});V({type:"textord",names:["\\@char"],props:{numArgs:1,allowedInText:!0},handler(r,e){for(var{parser:t}=r,a=oe(e[0],"ordgroup"),i=a.body,n="",o=0;o<i.length;o++){var l=oe(i[o],"textord");n+=l.text}var c=parseInt(n),m;if(isNaN(c))throw new B("\\@char has non-numeric argument "+n);if(c<0||c>=1114111)throw new B("\\@char with invalid code point "+n);return c<=65535?m=String.fromCharCode(c):(c-=65536,m=String.fromCharCode((c>>10)+55296,(c&1023)+56320)),{type:"textord",mode:t.mode,text:m}}});var yi=(r,e)=>{var t=Ie(r.body,e.withColor(r.color),!1);return dt(t)},xi=(r,e)=>{var t=We(r.body,e.withColor(r.color)),a=new L("mstyle",t);return a.setAttribute("mathcolor",r.color),a};V({type:"color",names:["\\textcolor"],props:{numArgs:2,allowedInText:!0,argTypes:["color","original"]},handler(r,e){var{parser:t}=r,a=oe(e[0],"color-token").color,i=e[1];return{type:"color",mode:t.mode,color:a,body:Ce(i)}},htmlBuilder:yi,mathmlBuilder:xi});V({type:"color",names:["\\color"],props:{numArgs:1,allowedInText:!0,argTypes:["color"]},handler(r,e){var{parser:t,breakOnTokenText:a}=r,i=oe(e[0],"color-token").color;t.gullet.macros.set("\\current@color",i);var n=t.parseExpression(!0,a);return{type:"color",mode:t.mode,color:i,body:n}},htmlBuilder:yi,mathmlBuilder:xi});V({type:"cr",names:["\\\\"],props:{numArgs:0,numOptionalArgs:0,allowedInText:!0},handler(r,e,t){var{parser:a}=r,i=a.gullet.future().text==="["?a.parseSizeGroup(!0):null,n=!a.settings.displayMode||!a.settings.useStrictBehavior("newLineInDisplayMode","In LaTeX, \\\\ or \\newline does nothing in display mode");return{type:"cr",mode:a.mode,newLine:n,size:i&&oe(i,"size").value}},htmlBuilder(r,e){var t=I(["mspace"],[],e);return r.newLine&&(t.classes.push("newline"),r.size&&(t.style.marginTop=q(Se(r.size,e)))),t},mathmlBuilder(r,e){var t=new L("mspace");return r.newLine&&(t.setAttribute("linebreak","newline"),r.size&&t.setAttribute("height",q(Se(r.size,e)))),t}});var Aa={"\\global":"\\global","\\long":"\\\\globallong","\\\\globallong":"\\\\globallong","\\def":"\\gdef","\\gdef":"\\gdef","\\edef":"\\xdef","\\xdef":"\\xdef","\\let":"\\\\globallet","\\futurelet":"\\\\globalfuture"},wi=r=>{var e=r.text;if(/^(?:[\\{}$&#^_]|EOF)$/.test(e))throw new B("Expected a control sequence",r);return e},qs=r=>{var e=r.gullet.popToken();return e.text==="="&&(e=r.gullet.popToken(),e.text===" "&&(e=r.gullet.popToken())),e},ki=(r,e,t,a)=>{var i=r.gullet.macros.get(t.text);i==null&&(t.noexpand=!0,i={tokens:[t],numArgs:0,unexpandable:!r.gullet.isExpandable(t.text)}),r.gullet.macros.set(e,i,a)};V({type:"internal",names:["\\global","\\long","\\\\globallong"],props:{numArgs:0,allowedInText:!0},handler(r){var{parser:e,funcName:t}=r;e.consumeSpaces();var a=e.fetch();if(Aa[a.text])return(t==="\\global"||t==="\\\\globallong")&&(a.text=Aa[a.text]),oe(e.parseFunction(),"internal");throw new B("Invalid token after macro prefix",a)}});V({type:"internal",names:["\\def","\\gdef","\\edef","\\xdef"],props:{numArgs:0,allowedInText:!0,primitive:!0},handler(r){var{parser:e,funcName:t}=r,a=e.gullet.popToken(),i=a.text;if(/^(?:[\\{}$&#^_]|EOF)$/.test(i))throw new B("Expected a control sequence",a);for(var n=0,o,l=[[]];e.gullet.future().text!=="{";)if(a=e.gullet.popToken(),a.text==="#"){if(e.gullet.future().text==="{"){o=e.gullet.future(),l[n].push("{");break}if(a=e.gullet.popToken(),!/^[1-9]$/.test(a.text))throw new B('Invalid argument number "'+a.text+'"');if(parseInt(a.text)!==n+1)throw new B('Argument number "'+a.text+'" out of order');n++,l.push([])}else{if(a.text==="EOF")throw new B("Expected a macro definition");l[n].push(a.text)}var{tokens:c}=e.gullet.consumeArg();return o&&c.unshift(o),(t==="\\edef"||t==="\\xdef")&&(c=e.gullet.expandTokens(c),c.reverse()),e.gullet.macros.set(i,{tokens:c,numArgs:n,delimiters:l},t===Aa[t]),{type:"internal",mode:e.mode}}});V({type:"internal",names:["\\let","\\\\globallet"],props:{numArgs:0,allowedInText:!0,primitive:!0},handler(r){var{parser:e,funcName:t}=r,a=wi(e.gullet.popToken());e.gullet.consumeSpaces();var i=qs(e);return ki(e,a,i,t==="\\\\globallet"),{type:"internal",mode:e.mode}}});V({type:"internal",names:["\\futurelet","\\\\globalfuture"],props:{numArgs:0,allowedInText:!0,primitive:!0},handler(r){var{parser:e,funcName:t}=r,a=wi(e.gullet.popToken()),i=e.gullet.popToken(),n=e.gullet.popToken();return ki(e,a,n,t==="\\\\globalfuture"),e.gullet.pushToken(n),e.gullet.pushToken(i),{type:"internal",mode:e.mode}}});var Yt=function(e,t,a){var i=xe.math[e]&&xe.math[e].replace,n=ja(i||e,t,a);if(!n)throw new Error("Unsupported symbol "+e+" and font size "+t+".");return n},Ua=function(e,t,a,i){var n=a.havingBaseStyle(t),o=I(i.concat(n.sizingClasses(a)),[e],a),l=n.sizeMultiplier/a.sizeMultiplier;return o.height*=l,o.depth*=l,o.maxFontSize=n.sizeMultiplier,o},Si=function(e,t,a){var i=t.havingBaseStyle(a),n=(1-t.sizeMultiplier/i.sizeMultiplier)*t.fontMetrics().axisHeight;e.classes.push("delimcenter"),e.style.top=q(n),e.height-=n,e.depth+=n},$s=function(e,t,a,i,n,o){var l=Re(e,"Main-Regular",n,i),c=Ua(l,t,i,o);return Si(c,i,t),c},Rs=function(e,t,a,i){return Re(e,"Size"+t+"-Regular",a,i)},Mi=function(e,t,a,i,n,o){var l=Rs(e,t,n,i),c=Ua(I(["delimsizing","size"+t],[l],i),se.TEXT,i,o);return a&&Si(c,i,se.TEXT),c},Kr=function(e,t,a){var i;t==="Size1-Regular"?i="delim-size1":i="delim-size4";var n=I(["delimsizinginner",i],[I([],[Re(e,t,a)])]);return{type:"elem",elem:n}},Zr=function(e,t,a){var i=Qe["Size4-Regular"][e.charCodeAt(0)]?Qe["Size4-Regular"][e.charCodeAt(0)][4]:Qe["Size1-Regular"][e.charCodeAt(0)][4],n=new ht("inner",Un(e,Math.round(1e3*t))),o=new st([n],{width:q(i),height:q(t),style:"width:"+q(i),viewBox:"0 0 "+1e3*i+" "+Math.round(1e3*t),preserveAspectRatio:"xMinYMin"}),l=ft([],[o],a);return l.height=t,l.style.height=q(t),l.style.width=q(i),{type:"elem",elem:l}},Ta=.008,mr={type:"kern",size:-1*Ta},Ps=new Set(["|","\\lvert","\\rvert","\\vert"]),Fs=new Set(["\\|","\\lVert","\\rVert","\\Vert"]),zi=function(e,t,a,i,n,o){var l,c,m,h,f="",y=0;l=m=h=e,c=null;var g="Size1-Regular";e==="\\uparrow"?m=h="⏐":e==="\\Uparrow"?m=h="‖":e==="\\downarrow"?l=m="⏐":e==="\\Downarrow"?l=m="‖":e==="\\updownarrow"?(l="\\uparrow",m="⏐",h="\\downarrow"):e==="\\Updownarrow"?(l="\\Uparrow",m="‖",h="\\Downarrow"):Ps.has(e)?(m="∣",f="vert",y=333):Fs.has(e)?(m="∥",f="doublevert",y=556):e==="["||e==="\\lbrack"?(l="⎡",m="⎢",h="⎣",g="Size4-Regular",f="lbrack",y=667):e==="]"||e==="\\rbrack"?(l="⎤",m="⎥",h="⎦",g="Size4-Regular",f="rbrack",y=667):e==="\\lfloor"||e==="⌊"?(m=l="⎢",h="⎣",g="Size4-Regular",f="lfloor",y=667):e==="\\lceil"||e==="⌈"?(l="⎡",m=h="⎢",g="Size4-Regular",f="lceil",y=667):e==="\\rfloor"||e==="⌋"?(m=l="⎥",h="⎦",g="Size4-Regular",f="rfloor",y=667):e==="\\rceil"||e==="⌉"?(l="⎤",m=h="⎥",g="Size4-Regular",f="rceil",y=667):e==="("||e==="\\lparen"?(l="⎛",m="⎜",h="⎝",g="Size4-Regular",f="lparen",y=875):e===")"||e==="\\rparen"?(l="⎞",m="⎟",h="⎠",g="Size4-Regular",f="rparen",y=875):e==="\\{"||e==="\\lbrace"?(l="⎧",c="⎨",h="⎩",m="⎪",g="Size4-Regular"):e==="\\}"||e==="\\rbrace"?(l="⎫",c="⎬",h="⎭",m="⎪",g="Size4-Regular"):e==="\\lgroup"||e==="⟮"?(l="⎧",h="⎩",m="⎪",g="Size4-Regular"):e==="\\rgroup"||e==="⟯"?(l="⎫",h="⎭",m="⎪",g="Size4-Regular"):e==="\\lmoustache"||e==="⎰"?(l="⎧",h="⎭",m="⎪",g="Size4-Regular"):(e==="\\rmoustache"||e==="⎱")&&(l="⎫",h="⎩",m="⎪",g="Size4-Regular");var C=Yt(l,g,n),z=C.height+C.depth,k=Yt(m,g,n),M=k.height+k.depth,A=Yt(h,g,n),D=A.height+A.depth,$=0,Y=1;if(c!==null){var Q=Yt(c,g,n);$=Q.height+Q.depth,Y=2}var X=z+D+$,K=Math.max(0,Math.ceil((t-X)/(Y*M))),R=X+K*Y*M,J=i.fontMetrics().axisHeight;a&&(J*=i.sizeMultiplier);var ie=R/2-J,G=[];if(f.length>0){var F=R-z-D,_=Math.round(R*1e3),ee=Wn(f,Math.round(F*1e3)),re=new ht(f,ee),le=q(y/1e3),ue=q(_/1e3),fe=new st([re],{width:le,height:ue,viewBox:"0 0 "+y+" "+_}),S=ft([],[fe],i);S.height=_/1e3,S.style.width=le,S.style.height=ue,G.push({type:"elem",elem:S})}else{if(G.push(Kr(h,g,n)),G.push(mr),c===null){var x=R-z-D+2*Ta;G.push(Zr(m,x,i))}else{var N=(R-z-D-$)/2+2*Ta;G.push(Zr(m,N,i)),G.push(mr),G.push(Kr(c,g,n)),G.push(mr),G.push(Zr(m,N,i))}G.push(mr),G.push(Kr(l,g,n))}var T=i.havingBaseStyle(se.TEXT),O=pe({positionType:"bottom",positionData:ie,children:G});return Ua(I(["delimsizing","mult"],[O],T),se.TEXT,i,o)},Jr=80,Qr=.08,_r=function(e,t,a,i,n){var o=Gn(e,i,a),l=new ht(e,o),c=new st([l],{width:"400em",height:q(t),viewBox:"0 0 400000 "+a,preserveAspectRatio:"xMinYMin slice"});return ft(["hide-tail"],[c],n)},js=function(e,t){var a=t.havingBaseSizing(),i=Ii("\\surd",e*a.sizeMultiplier,Ei,a),n=a.sizeMultiplier,o=Math.max(0,t.minRuleThickness-t.fontMetrics().sqrtRuleThickness),l,c,m,h,f;return i.type==="small"?(h=1e3+1e3*o+Jr,e<1?n=1:e<1.4&&(n=.7),c=(1+o+Qr)/n,m=(1+o)/n,l=_r("sqrtMain",c,h,o,t),l.style.minWidth="0.853em",f=.833/n):i.type==="large"?(h=(1e3+Jr)*Jt[i.size],m=(Jt[i.size]+o)/n,c=(Jt[i.size]+o+Qr)/n,l=_r("sqrtSize"+i.size,c,h,o,t),l.style.minWidth="1.02em",f=1/n):(c=e+o+Qr,m=e+o,h=Math.floor(1e3*e+o)+Jr,l=_r("sqrtTall",c,h,o,t),l.style.minWidth="0.742em",f=1.056),l.height=m,l.style.height=q(c),{span:l,advanceWidth:f,ruleWidth:(t.fontMetrics().sqrtRuleThickness+o)*n}},Ci=new Set(["(","\\lparen",")","\\rparen","[","\\lbrack","]","\\rbrack","\\{","\\lbrace","\\}","\\rbrace","\\lfloor","\\rfloor","⌊","⌋","\\lceil","\\rceil","⌈","⌉","\\surd"]),Ns=new Set(["\\uparrow","\\downarrow","\\updownarrow","\\Uparrow","\\Downarrow","\\Updownarrow","|","\\|","\\vert","\\Vert","\\lvert","\\rvert","\\lVert","\\rVert","\\lgroup","\\rgroup","⟮","⟯","\\lmoustache","\\rmoustache","⎰","⎱"]),Ai=new Set(["<",">","\\langle","\\rangle","/","\\backslash","\\lt","\\gt"]),Jt=[0,1.2,1.8,2.4,3],Ti=function(e,t,a,i,n){if(e==="<"||e==="\\lt"||e==="⟨"?e="\\langle":(e===">"||e==="\\gt"||e==="⟩")&&(e="\\rangle"),Ci.has(e)||Ai.has(e))return Mi(e,t,!1,a,i,n);if(Ns.has(e))return zi(e,Jt[t],!1,a,i,n);throw new B("Illegal delimiter: '"+e+"'")},Os=[{type:"small",style:se.SCRIPTSCRIPT},{type:"small",style:se.SCRIPT},{type:"small",style:se.TEXT},{type:"large",size:1},{type:"large",size:2},{type:"large",size:3},{type:"large",size:4}],Hs=[{type:"small",style:se.SCRIPTSCRIPT},{type:"small",style:se.SCRIPT},{type:"small",style:se.TEXT},{type:"stack"}],Ei=[{type:"small",style:se.SCRIPTSCRIPT},{type:"small",style:se.SCRIPT},{type:"small",style:se.TEXT},{type:"large",size:1},{type:"large",size:2},{type:"large",size:3},{type:"large",size:4},{type:"stack"}],Vs=function(e){if(e.type==="small")return"Main-Regular";if(e.type==="large")return"Size"+e.size+"-Regular";if(e.type==="stack")return"Size4-Regular";var t=e.type;throw new Error("Add support for delim type '"+t+"' here.")},Ii=function(e,t,a,i){for(var n=Math.min(2,3-i.style.size),o=n;o<a.length;o++){var l=a[o];if(l.type==="stack")break;var c=Yt(e,Vs(l),"math"),m=c.height+c.depth;if(l.type==="small"){var h=i.havingBaseStyle(l.style);m*=h.sizeMultiplier}if(m>t)return l}return a[a.length-1]},Ea=function(e,t,a,i,n,o){e==="<"||e==="\\lt"||e==="⟨"?e="\\langle":(e===">"||e==="\\gt"||e==="⟩")&&(e="\\rangle");var l;Ai.has(e)?l=Os:Ci.has(e)?l=Ei:l=Hs;var c=Ii(e,t,l,i);return c.type==="small"?$s(e,c.style,a,i,n,o):c.type==="large"?Mi(e,c.size,a,i,n,o):zi(e,t,a,i,n,o)},ea=function(e,t,a,i,n,o){var l=i.fontMetrics().axisHeight*i.sizeMultiplier,c=901,m=5/i.fontMetrics().ptPerEm,h=Math.max(t-l,a+l),f=Math.max(h/500*c,2*h-m);return Ea(e,f,!0,i,n,o)},I0={"\\bigl":{mclass:"mopen",size:1},"\\Bigl":{mclass:"mopen",size:2},"\\biggl":{mclass:"mopen",size:3},"\\Biggl":{mclass:"mopen",size:4},"\\bigr":{mclass:"mclose",size:1},"\\Bigr":{mclass:"mclose",size:2},"\\biggr":{mclass:"mclose",size:3},"\\Biggr":{mclass:"mclose",size:4},"\\bigm":{mclass:"mrel",size:1},"\\Bigm":{mclass:"mrel",size:2},"\\biggm":{mclass:"mrel",size:3},"\\Biggm":{mclass:"mrel",size:4},"\\big":{mclass:"mord",size:1},"\\Big":{mclass:"mord",size:2},"\\bigg":{mclass:"mord",size:3},"\\Bigg":{mclass:"mord",size:4}},Gs=new Set(["(","\\lparen",")","\\rparen","[","\\lbrack","]","\\rbrack","\\{","\\lbrace","\\}","\\rbrace","\\lfloor","\\rfloor","⌊","⌋","\\lceil","\\rceil","⌈","⌉","<",">","\\langle","⟨","\\rangle","⟩","\\lt","\\gt","\\lvert","\\rvert","\\lVert","\\rVert","\\lgroup","\\rgroup","⟮","⟯","\\lmoustache","\\rmoustache","⎰","⎱","/","\\backslash","|","\\vert","\\|","\\Vert","\\uparrow","\\Uparrow","\\downarrow","\\Downarrow","\\updownarrow","\\Updownarrow","."]);function D0(r){return"isMiddle"in r}function Dr(r,e){var t=Er(r);if(t&&Gs.has(t.text))return t;throw t?new B("Invalid delimiter '"+t.text+"' after '"+e.funcName+"'",r):new B("Invalid delimiter type '"+r.type+"'",r)}V({type:"delimsizing",names:["\\bigl","\\Bigl","\\biggl","\\Biggl","\\bigr","\\Bigr","\\biggr","\\Biggr","\\bigm","\\Bigm","\\biggm","\\Biggm","\\big","\\Big","\\bigg","\\Bigg"],props:{numArgs:1,argTypes:["primitive"]},handler:(r,e)=>{var t=Dr(e[0],r);return{type:"delimsizing",mode:r.parser.mode,size:I0[r.funcName].size,mclass:I0[r.funcName].mclass,delim:t.text}},htmlBuilder:(r,e)=>r.delim==="."?I([r.mclass]):Ti(r.delim,r.size,e,r.mode,[r.mclass]),mathmlBuilder:r=>{var e=[];r.delim!=="."&&e.push(Ke(r.delim,r.mode));var t=new L("mo",e);r.mclass==="mopen"||r.mclass==="mclose"?t.setAttribute("fence","true"):t.setAttribute("fence","false"),t.setAttribute("stretchy","true");var a=q(Jt[r.size]);return t.setAttribute("minsize",a),t.setAttribute("maxsize",a),t}});function B0(r){if(!r.body)throw new Error("Bug: The leftright ParseNode wasn't fully parsed.")}V({type:"leftright-right",names:["\\right"],props:{numArgs:1,primitive:!0},handler:(r,e)=>{var t=r.parser.gullet.macros.get("\\current@color");if(t&&typeof t!="string")throw new B("\\current@color set to non-string in \\right");return{type:"leftright-right",mode:r.parser.mode,delim:Dr(e[0],r).text,color:t}}});V({type:"leftright",names:["\\left"],props:{numArgs:1,primitive:!0},handler:(r,e)=>{var t=Dr(e[0],r),a=r.parser;++a.leftrightDepth;var i=a.parseExpression(!1);--a.leftrightDepth,a.expect("\\right",!1);var n=oe(a.parseFunction(),"leftright-right");return{type:"leftright",mode:a.mode,body:i,left:t.text,right:n.delim,rightColor:n.color}},htmlBuilder:(r,e)=>{B0(r);for(var t=Ie(r.body,e,!0,["mopen","mclose"]),a=0,i=0,n=!1,o=0;o<t.length;o++){var l=t[o];D0(l)?n=!0:(a=Math.max(t[o].height,a),i=Math.max(t[o].depth,i))}a*=e.sizeMultiplier,i*=e.sizeMultiplier;var c;if(r.left==="."?c=tr(e,["mopen"]):c=ea(r.left,a,i,e,r.mode,["mopen"]),t.unshift(c),n)for(var m=1;m<t.length;m++){var h=t[m];if(D0(h)){var f=h.isMiddle;t[m]=ea(f.delim,a,i,f.options,r.mode,[])}}var y;if(r.right===".")y=tr(e,["mclose"]);else{var g=r.rightColor?e.withColor(r.rightColor):e;y=ea(r.right,a,i,g,r.mode,["mclose"])}return t.push(y),I(["minner"],t,e)},mathmlBuilder:(r,e)=>{B0(r);var t=We(r.body,e);if(r.left!=="."){var a=new L("mo",[Ke(r.left,r.mode)]);a.setAttribute("fence","true"),t.unshift(a)}if(r.right!=="."){var i=new L("mo",[Ke(r.right,r.mode)]);i.setAttribute("fence","true"),r.rightColor&&i.setAttribute("mathcolor",r.rightColor),t.push(i)}return Ha(t)}});V({type:"middle",names:["\\middle"],props:{numArgs:1,primitive:!0},handler:(r,e)=>{var t=Dr(e[0],r);if(!r.parser.leftrightDepth)throw new B("\\middle without preceding \\left",t);return{type:"middle",mode:r.parser.mode,delim:t.text}},htmlBuilder:(r,e)=>{var t;return r.delim==="."?t=tr(e,[]):(t=Ti(r.delim,1,e,r.mode,[]),t.isMiddle={delim:r.delim,options:e}),t},mathmlBuilder:(r,e)=>{var t=r.delim==="\\vert"||r.delim==="|"?Ke("|","text"):Ke(r.delim,r.mode),a=new L("mo",[t]);return a.setAttribute("fence","true"),a.setAttribute("lspace","0.05em"),a.setAttribute("rspace","0.05em"),a}});var Br=(r,e)=>{var t=Ot(he(r.body,e),e),a=r.label.slice(1),i=e.sizeMultiplier,n,o,l=ot(r.body);if(a==="sout")n=I(["stretchy","sout"]),n.height=e.fontMetrics().defaultRuleThickness/i,o=-.5*e.fontMetrics().xHeight;else if(a==="phase"){var c=Se({number:.6,unit:"pt"},e),m=Se({number:.35,unit:"ex"},e),h=e.havingBaseSizing();i=i/h.sizeMultiplier;var f=t.height+t.depth+c+m;t.style.paddingLeft=q(f/2+c);var y=Math.floor(1e3*f*i),g=Hn(y),C=new st([new ht("phase",g)],{width:"400em",height:q(y/1e3),viewBox:"0 0 400000 "+y,preserveAspectRatio:"xMinYMin slice"});n=ft(["hide-tail"],[C],e),n.style.height=q(f),o=t.depth+c+m}else{/cancel/.test(a)?l||t.classes.push("cancel-pad"):a==="angl"?t.classes.push("anglpad"):t.classes.push("boxpad");var z,k,M=0;/box/.test(a)?(M=Math.max(e.fontMetrics().fboxrule,e.minRuleThickness),z=e.fontMetrics().fboxsep+(a==="colorbox"?0:M),k=z):a==="angl"?(M=Math.max(e.fontMetrics().defaultRuleThickness,e.minRuleThickness),z=4*M,k=Math.max(0,.25-t.depth)):(z=l?.2:0,k=z),n=zs(t,a,z,k,e),/fbox|boxed|fcolorbox/.test(a)?(n.style.borderStyle="solid",n.style.borderWidth=q(M)):a==="angl"&&M!==.049&&(n.style.borderTopWidth=q(M),n.style.borderRightWidth=q(M)),o=t.depth+k,r.backgroundColor&&(n.style.backgroundColor=r.backgroundColor,r.borderColor&&(n.style.borderColor=r.borderColor))}var A;if(r.backgroundColor)A=pe({positionType:"individualShift",children:[{type:"elem",elem:n,shift:o},{type:"elem",elem:t,shift:0}]});else{var D=/cancel|phase/.test(a)?["svg-align"]:[];A=pe({positionType:"individualShift",children:[{type:"elem",elem:t,shift:0},{type:"elem",elem:n,shift:o,wrapperClasses:D}]})}return/cancel/.test(a)&&(A.height=t.height,A.depth=t.depth),/cancel/.test(a)&&!l?I(["mord","cancel-lap"],[A],e):I(["mord"],[A],e)},Lr=(r,e)=>{var t,a=new L(r.label.includes("colorbox")?"mpadded":"menclose",[ge(r.body,e)]);switch(r.label){case"\\cancel":a.setAttribute("notation","updiagonalstrike");break;case"\\bcancel":a.setAttribute("notation","downdiagonalstrike");break;case"\\phase":a.setAttribute("notation","phasorangle");break;case"\\sout":a.setAttribute("notation","horizontalstrike");break;case"\\fbox":a.setAttribute("notation","box");break;case"\\angl":a.setAttribute("notation","actuarial");break;case"\\fcolorbox":case"\\colorbox":if(t=e.fontMetrics().fboxsep*e.fontMetrics().ptPerEm,a.setAttribute("width","+"+2*t+"pt"),a.setAttribute("height","+"+2*t+"pt"),a.setAttribute("lspace",t+"pt"),a.setAttribute("voffset",t+"pt"),r.label==="\\fcolorbox"){var i=Math.max(e.fontMetrics().fboxrule,e.minRuleThickness);a.setAttribute("style","border: "+q(i)+" solid "+r.borderColor)}break;case"\\xcancel":a.setAttribute("notation","updiagonalstrike downdiagonalstrike");break}return r.backgroundColor&&a.setAttribute("mathbackground",r.backgroundColor),a};V({type:"enclose",names:["\\colorbox"],props:{numArgs:2,allowedInText:!0,argTypes:["color","hbox"]},handler(r,e,t){var{parser:a,funcName:i}=r,n=oe(e[0],"color-token").color,o=e[1];return{type:"enclose",mode:a.mode,label:i,backgroundColor:n,body:o}},htmlBuilder:Br,mathmlBuilder:Lr});V({type:"enclose",names:["\\fcolorbox"],props:{numArgs:3,allowedInText:!0,argTypes:["color","color","hbox"]},handler(r,e,t){var{parser:a,funcName:i}=r,n=oe(e[0],"color-token").color,o=oe(e[1],"color-token").color,l=e[2];return{type:"enclose",mode:a.mode,label:i,backgroundColor:o,borderColor:n,body:l}},htmlBuilder:Br,mathmlBuilder:Lr});V({type:"enclose",names:["\\fbox"],props:{numArgs:1,argTypes:["hbox"],allowedInText:!0},handler(r,e){var{parser:t}=r;return{type:"enclose",mode:t.mode,label:"\\fbox",body:e[0]}}});V({type:"enclose",names:["\\cancel","\\bcancel","\\xcancel","\\phase"],props:{numArgs:1},handler(r,e){var{parser:t,funcName:a}=r,i=e[0];return{type:"enclose",mode:t.mode,label:a,body:i}},htmlBuilder:Br,mathmlBuilder:Lr});V({type:"enclose",names:["\\sout"],props:{numArgs:1,allowedInText:!0},handler(r,e){var{parser:t,funcName:a}=r;t.mode==="math"&&t.settings.reportNonstrict("mathVsSout","LaTeX's \\sout works only in text mode");var i=e[0];return{type:"enclose",mode:t.mode,label:a,body:i}},htmlBuilder:Br,mathmlBuilder:Lr});V({type:"enclose",names:["\\angl"],props:{numArgs:1,argTypes:["hbox"],allowedInText:!1},handler(r,e){var{parser:t}=r;return{type:"enclose",mode:t.mode,label:"\\angl",body:e[0]}}});var Di={};function _e(r){for(var{type:e,names:t,props:a,handler:i,htmlBuilder:n,mathmlBuilder:o}=r,l={type:e,numArgs:a.numArgs||0,allowedInText:!1,numOptionalArgs:0,handler:i},c=0;c<t.length;++c)Di[t[c]]=l;n&&(yr[e]=n),o&&(xr[e]=o)}var Bi={};function p(r,e){Bi[r]=e}class Ne{constructor(e,t,a){this.lexer=void 0,this.start=void 0,this.end=void 0,this.lexer=e,this.start=t,this.end=a}static range(e,t){return t?!e||!e.loc||!t.loc||e.loc.lexer!==t.loc.lexer?null:new Ne(e.loc.lexer,e.loc.start,t.loc.end):e&&e.loc}}class Ve{constructor(e,t){this.text=void 0,this.loc=void 0,this.noexpand=void 0,this.treatAsRelax=void 0,this.text=e,this.loc=t}range(e,t){return new Ve(t,Ne.range(this,e))}}function L0(r){var e=[];r.consumeSpaces();var t=r.fetch().text;for(t==="\\relax"&&(r.consume(),r.consumeSpaces(),t=r.fetch().text);t==="\\hline"||t==="\\hdashline";)r.consume(),e.push(t==="\\hdashline"),r.consumeSpaces(),t=r.fetch().text;return e}var qr=r=>{var e=r.parser.settings;if(!e.displayMode)throw new B("{"+r.envName+"} can be used only in display mode.")},Us=new Set(["gather","gather*"]);function Wa(r){if(!r.includes("ed"))return!r.includes("*")}function gt(r,e,t){var{hskipBeforeAndAfter:a,addJot:i,cols:n,arraystretch:o,colSeparationType:l,autoTag:c,singleRow:m,emptySingleRow:h,maxNumCols:f,leqno:y}=e;if(r.gullet.beginGroup(),m||r.gullet.macros.set("\\cr","\\\\\\relax"),!o){var g=r.gullet.expandMacroAsText("\\arraystretch");if(g==null)o=1;else if(o=parseFloat(g),!o||o<0)throw new B("Invalid \\arraystretch: "+g)}r.gullet.beginGroup();var C=[],z=[C],k=[],M=[],A=c!=null?[]:void 0;function D(){c&&r.gullet.macros.set("\\@eqnsw","1",!0)}function $(){A&&(r.gullet.macros.get("\\df@tag")?(A.push(r.subparse([new Ve("\\df@tag")])),r.gullet.macros.set("\\df@tag",void 0,!0)):A.push(!!c&&r.gullet.macros.get("\\@eqnsw")==="1"))}for(D(),M.push(L0(r));;){var Y=r.parseExpression(!1,m?"\\end":"\\\\");r.gullet.endGroup(),r.gullet.beginGroup();var Q={type:"ordgroup",mode:r.mode,body:Y};t&&(Q={type:"styling",mode:r.mode,style:t,resetFont:!0,body:[Q]}),C.push(Q);var X=r.fetch().text;if(X==="&"){if(f&&C.length===f){if(m||l)throw new B("Too many tab characters: &",r.nextToken);r.settings.reportNonstrict("textEnv","Too few columns specified in the {array} column argument.")}r.consume()}else if(X==="\\end"){$(),C.length===1&&Q.type==="styling"&&Q.body.length===1&&Q.body[0].type==="ordgroup"&&Q.body[0].body.length===0&&(z.length>1||!h)&&z.pop(),M.length<z.length+1&&M.push([]);break}else if(X==="\\\\"){r.consume();var K=void 0;r.gullet.future().text!==" "&&(K=r.parseSizeGroup(!0)),k.push(K?K.value:null),$(),M.push(L0(r)),C=[],z.push(C),D()}else throw new B("Expected & or \\\\ or \\cr or \\end",r.nextToken)}return r.gullet.endGroup(),r.gullet.endGroup(),{type:"array",mode:r.mode,addJot:i,arraystretch:o,body:z,cols:n,rowGaps:k,hskipBeforeAndAfter:a,hLinesBeforeRow:M,colSeparationType:l,tags:A,leqno:y}}function Xa(r){return r.slice(0,1)==="d"?"display":"text"}var et=function(e,t){var a,i,n=e.body.length,o=e.hLinesBeforeRow,l=0,c=new Array(n),m=[],h=Math.max(t.fontMetrics().arrayRuleWidth,t.minRuleThickness),f=1/t.fontMetrics().ptPerEm,y=5*f;if(e.colSeparationType&&e.colSeparationType==="small"){var g=t.havingStyle(se.SCRIPT).sizeMultiplier;y=.2778*(g/t.sizeMultiplier)}var C=e.colSeparationType==="CD"?Se({number:3,unit:"ex"},t):12*f,z=3*f,k=e.arraystretch*C,M=.7*k,A=.3*k,D=0;function $(Lt){for(var bt=0;bt<Lt.length;++bt)bt>0&&(D+=.25),m.push({pos:D,isDashed:Lt[bt]})}for($(o[0]),a=0;a<e.body.length;++a){var Y=e.body[a],Q=M,X=A;l<Y.length&&(l=Y.length);var K={cells:new Array(Y.length),height:0,depth:0,pos:0};for(i=0;i<Y.length;++i){var R=he(Y[i],t);X<R.depth&&(X=R.depth),Q<R.height&&(Q=R.height),K.cells[i]=R}var J=e.rowGaps[a],ie=0;J&&(ie=Se(J,t),ie>0&&(ie+=A,X<ie&&(X=ie),ie=0)),e.addJot&&a<e.body.length-1&&(X+=z),K.height=Q,K.depth=X,D+=Q,K.pos=D,D+=X+ie,c[a]=K,$(o[a+1])}var G=D/2+t.fontMetrics().axisHeight,F=e.cols||[],_=[],ee,re,le=[];if(e.tags&&e.tags.some(Lt=>Lt))for(a=0;a<n;++a){var ue=c[a],fe=ue.pos-G,S=e.tags[a],x=void 0;S===!0?x=I(["eqn-num"],[],t):S===!1?x=I([],[],t):x=I([],Ie(S,t,!0),t),x.depth=ue.depth,x.height=ue.height,le.push({type:"elem",elem:x,shift:fe})}for(i=0,re=0;i<l||re<F.length;++i,++re){for(var N,T=F[re],O=!0;((P=T)==null?void 0:P.type)==="separator";){var P;if(O||(ee=I(["arraycolsep"],[]),ee.style.width=q(t.fontMetrics().doubleRuleSep),_.push(ee)),T.separator==="|"||T.separator===":"){var W=T.separator==="|"?"solid":"dashed",H=I(["vertical-separator"],[],t);H.style.height=q(D),H.style.borderRightWidth=q(h),H.style.borderRightStyle=W,H.style.margin="0 "+q(-h/2);var Z=D-G;Z&&(H.style.verticalAlign=q(-Z)),_.push(H)}else throw new B("Invalid separator type: "+T.separator);re++,T=F[re],O=!1}if(!(i>=l)){var te=void 0;if(i>0||e.hskipBeforeAndAfter){var be,ve;te=(be=(ve=T)==null?void 0:ve.pregap)!=null?be:y,te!==0&&(ee=I(["arraycolsep"],[]),ee.style.width=q(te),_.push(ee))}var ye=[];for(a=0;a<n;++a){var Me=c[a],de=Me.cells[i];if(de){var De=Me.pos-G;de.depth=Me.depth,de.height=Me.height,ye.push({type:"elem",elem:de,shift:De})}}var Oe=pe({positionType:"individualShift",children:ye}),He=I(["col-align-"+(((N=T)==null?void 0:N.align)||"c")],[Oe]);if(_.push(He),i<l-1||e.hskipBeforeAndAfter){var Xe,Ze;te=(Xe=(Ze=T)==null?void 0:Ze.postgap)!=null?Xe:y,te!==0&&(ee=I(["arraycolsep"],[]),ee.style.width=q(te),_.push(ee))}}}var qe=I(["mtable"],_);if(m.length>0){for(var Rr=Nt("hline",t,h),Pr=Nt("hdashline",t,h),Wt=[{type:"elem",elem:qe,shift:0}];m.length>0;){var Xt=m.pop(),ir=Xt.pos-G;Xt.isDashed?Wt.push({type:"elem",elem:Pr,shift:ir}):Wt.push({type:"elem",elem:Rr,shift:ir})}qe=pe({positionType:"individualShift",children:Wt})}if(le.length===0)return I(["mord"],[qe],t);var nr=pe({positionType:"individualShift",children:le}),Fr=I(["tag"],[nr],t);return dt([qe,Fr])},Ws={c:"center ",l:"left ",r:"right "},tt=function(e,t){for(var a=[],i=new L("mtd",[],["mtr-glue"]),n=new L("mtd",[],["mml-eqn-num"]),o=0;o<e.body.length;o++){for(var l=e.body[o],c=[],m=0;m<l.length;m++)c.push(new L("mtd",[ge(l[m],t)]));e.tags&&e.tags[o]&&(c.unshift(i),c.push(i),e.leqno?c.unshift(n):c.push(n)),a.push(new L("mtr",c))}var h=new L("mtable",a),f=e.arraystretch===.5?.1:.16+e.arraystretch-1+(e.addJot?.09:0);h.setAttribute("rowspacing",q(f));var y="",g="";if(e.cols&&e.cols.length>0){var C=e.cols,z="",k=!1,M=0,A=C.length;C[0].type==="separator"&&(y+="top ",M=1),C[C.length-1].type==="separator"&&(y+="bottom ",A-=1);for(var D=M;D<A;D++){var $=C[D];$.type==="align"?(g+=Ws[$.align],k&&(z+="none "),k=!0):$.type==="separator"&&k&&(z+=$.separator==="|"?"solid ":"dashed ",k=!1)}h.setAttribute("columnalign",g.trim()),/[sd]/.test(z)&&h.setAttribute("columnlines",z.trim())}if(e.colSeparationType==="align"){for(var Y=e.cols||[],Q="",X=1;X<Y.length;X++)Q+=X%2?"0em ":"1em ";h.setAttribute("columnspacing",Q.trim())}else e.colSeparationType==="alignat"||e.colSeparationType==="gather"?h.setAttribute("columnspacing","0em"):e.colSeparationType==="small"?h.setAttribute("columnspacing","0.2778em"):e.colSeparationType==="CD"?h.setAttribute("columnspacing","0.5em"):h.setAttribute("columnspacing","1em");var K="",R=e.hLinesBeforeRow;y+=R[0].length>0?"left ":"",y+=R[R.length-1].length>0?"right ":"";for(var J=1;J<R.length-1;J++)K+=R[J].length===0?"none ":R[J][0]?"dashed ":"solid ";return/[sd]/.test(K)&&h.setAttribute("rowlines",K.trim()),y!==""&&(h=new L("menclose",[h]),h.setAttribute("notation",y.trim())),e.arraystretch&&e.arraystretch<1&&(h=new L("mstyle",[h]),h.setAttribute("scriptlevel","1")),h},Li=function(e,t){e.envName.includes("ed")||qr(e);var a=[],i=e.envName.includes("at")?"alignat":"align",n=e.envName==="split",o=gt(e.parser,{cols:a,addJot:!0,autoTag:n?void 0:Wa(e.envName),emptySingleRow:!0,colSeparationType:i,maxNumCols:n?2:void 0,leqno:e.parser.settings.leqno},"display"),l=0,c=0,m={type:"ordgroup",mode:e.mode,body:[]};if(t[0]&&t[0].type==="ordgroup"){for(var h="",f=0;f<t[0].body.length;f++){var y=oe(t[0].body[f],"textord");h+=y.text}l=Number(h),c=l*2}var g=!c;o.body.forEach(function(M){for(var A=1;A<M.length;A+=2){var D=oe(M[A],"styling"),$=oe(D.body[0],"ordgroup");$.body.unshift(m)}if(g)c<M.length&&(c=M.length);else{var Y=M.length/2;if(l<Y)throw new B("Too many math in a row: "+("expected "+l+", but got "+Y),M[0])}});for(var C=0;C<c;++C){var z="r",k=0;C%2===1?z="l":C>0&&g&&(k=1),a[C]={type:"align",align:z,pregap:k,postgap:0}}return o.colSeparationType=g?"align":"alignat",o};_e({type:"array",names:["array","darray"],props:{numArgs:1},handler(r,e){var t=Er(e[0]),a=t?[e[0]]:oe(e[0],"ordgroup").body,i=a.map(function(o){var l=Tr(o),c=l.text;if("lcr".includes(c))return{type:"align",align:c};if(c==="|")return{type:"separator",separator:"|"};if(c===":")return{type:"separator",separator:":"};throw new B("Unknown column alignment: "+c,o)}),n={cols:i,hskipBeforeAndAfter:!0,maxNumCols:i.length};return gt(r.parser,n,Xa(r.envName))},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["matrix","pmatrix","bmatrix","Bmatrix","vmatrix","Vmatrix","matrix*","pmatrix*","bmatrix*","Bmatrix*","vmatrix*","Vmatrix*"],props:{numArgs:0},handler(r){var e={matrix:null,pmatrix:["(",")"],bmatrix:["[","]"],Bmatrix:["\\{","\\}"],vmatrix:["|","|"],Vmatrix:["\\Vert","\\Vert"]}[r.envName.replace("*","")],t="c",a={hskipBeforeAndAfter:!1,cols:[{type:"align",align:t}]};if(r.envName.charAt(r.envName.length-1)==="*"){var i=r.parser;if(i.consumeSpaces(),i.fetch().text==="["){if(i.consume(),i.consumeSpaces(),t=i.fetch().text,!"lcr".includes(t))throw new B("Expected l or c or r",i.nextToken);i.consume(),i.consumeSpaces(),i.expect("]"),i.consume(),a.cols=[{type:"align",align:t}]}}var n=gt(r.parser,a,Xa(r.envName)),o=Math.max(0,...n.body.map(l=>l.length));return n.cols=new Array(o).fill({type:"align",align:t}),e?{type:"leftright",mode:r.mode,body:[n],left:e[0],right:e[1],rightColor:void 0}:n},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["smallmatrix"],props:{numArgs:0},handler(r){var e={arraystretch:.5},t=gt(r.parser,e,"script");return t.colSeparationType="small",t},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["subarray"],props:{numArgs:1},handler(r,e){var t=Er(e[0]),a=t?[e[0]]:oe(e[0],"ordgroup").body,i=a.map(function(l){var c=Tr(l),m=c.text;if("lc".includes(m))return{type:"align",align:m};throw new B("Unknown column alignment: "+m,l)});if(i.length>1)throw new B("{subarray} can contain only one column");var n={cols:i,hskipBeforeAndAfter:!1,arraystretch:.5},o=gt(r.parser,n,"script");if(o.body.length>0&&o.body[0].length>1)throw new B("{subarray} can contain only one column");return o},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["cases","dcases","rcases","drcases"],props:{numArgs:0},handler(r){var e={arraystretch:1.2,cols:[{type:"align",align:"l",pregap:0,postgap:1},{type:"align",align:"l",pregap:0,postgap:0}]},t=gt(r.parser,e,Xa(r.envName));return{type:"leftright",mode:r.mode,body:[t],left:r.envName.includes("r")?".":"\\{",right:r.envName.includes("r")?"\\}":".",rightColor:void 0}},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["align","align*","aligned","split"],props:{numArgs:0},handler:Li,htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["gathered","gather","gather*"],props:{numArgs:0},handler(r){Us.has(r.envName)&&qr(r);var e={cols:[{type:"align",align:"c"}],addJot:!0,colSeparationType:"gather",autoTag:Wa(r.envName),emptySingleRow:!0,leqno:r.parser.settings.leqno};return gt(r.parser,e,"display")},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["alignat","alignat*","alignedat"],props:{numArgs:1},handler:Li,htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["equation","equation*"],props:{numArgs:0},handler(r){qr(r);var e={autoTag:Wa(r.envName),emptySingleRow:!0,singleRow:!0,maxNumCols:1,leqno:r.parser.settings.leqno};return gt(r.parser,e,"display")},htmlBuilder:et,mathmlBuilder:tt});_e({type:"array",names:["CD"],props:{numArgs:0},handler(r){return qr(r),Ls(r.parser)},htmlBuilder:et,mathmlBuilder:tt});p("\\nonumber","\\gdef\\@eqnsw{0}");p("\\notag","\\nonumber");V({type:"text",names:["\\hline","\\hdashline"],props:{numArgs:0,allowedInText:!0,allowedInMath:!0},handler(r,e){throw new B(r.funcName+" valid only within array environment")}});var q0=Di;V({type:"environment",names:["\\begin","\\end"],props:{numArgs:1,argTypes:["text"]},handler(r,e){var{parser:t,funcName:a}=r,i=e[0];if(i.type!=="ordgroup")throw new B("Invalid environment name",i);for(var n="",o=0;o<i.body.length;++o)n+=oe(i.body[o],"textord").text;if(a==="\\begin"){if(!q0.hasOwnProperty(n))throw new B("No such environment: "+n,i);var l=q0[n],{args:c,optArgs:m}=t.parseArguments("\\begin{"+n+"}",l),h={mode:t.mode,envName:n,parser:t},f=l.handler(h,c,m);t.expect("\\end",!1);var y=t.nextToken,g=oe(t.parseFunction(),"environment");if(g.name!==n)throw new B("Mismatch: \\begin{"+n+"} matched by \\end{"+g.name+"}",y);return f}return{type:"environment",mode:t.mode,name:n,nameGroup:i}}});var qi=(r,e)=>{var t=r.font,a=e.withFont(t);return he(r.body,a)},$i=(r,e)=>{var t=r.font,a=e.withFont(t);return ge(r.body,a)},$0={"\\Bbb":"\\mathbb","\\bold":"\\mathbf","\\frak":"\\mathfrak"};V({type:"font",names:["\\mathrm","\\mathit","\\mathbf","\\mathnormal","\\mathsfit","\\mathbb","\\mathcal","\\mathfrak","\\mathscr","\\mathsf","\\mathtt","\\Bbb","\\bold","\\frak"],props:{numArgs:1,allowedInArgument:!0},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=wr(e[0]),n=a;return n in $0&&(n=$0[n]),{type:"font",mode:t.mode,font:n.slice(1),body:i}},htmlBuilder:qi,mathmlBuilder:$i});V({type:"mclass",names:["\\boldsymbol","\\bm"],props:{numArgs:1},handler:(r,e)=>{var{parser:t}=r,a=e[0];return{type:"mclass",mode:t.mode,mclass:Ir(a),body:[{type:"font",mode:t.mode,font:"boldsymbol",body:a}],isCharacterBox:ot(a)}}});V({type:"font",names:["\\rm","\\sf","\\tt","\\bf","\\it","\\cal"],props:{numArgs:0,allowedInText:!0},handler:(r,e)=>{var{parser:t,funcName:a,breakOnTokenText:i}=r,{mode:n}=t,o=t.parseExpression(!0,i);return{type:"font",mode:n,font:"math"+a.slice(1),body:{type:"ordgroup",mode:t.mode,body:o}}},htmlBuilder:qi,mathmlBuilder:$i});var Xs=(r,e)=>{var t=e.style,a=t.fracNum(),i=t.fracDen(),n;n=e.havingStyle(a);var o=he(r.numer,n,e);if(r.continued){var l=8.5/e.fontMetrics().ptPerEm,c=3.5/e.fontMetrics().ptPerEm;o.height=o.height<l?l:o.height,o.depth=o.depth<c?c:o.depth}n=e.havingStyle(i);var m=he(r.denom,n,e),h,f,y;r.hasBarLine?(r.barSize?(f=Se(r.barSize,e),h=Nt("frac-line",e,f)):h=Nt("frac-line",e),f=h.height,y=h.height):(h=null,f=0,y=e.fontMetrics().defaultRuleThickness);var g,C,z;t.size===se.DISPLAY.size?(g=e.fontMetrics().num1,f>0?C=3*y:C=7*y,z=e.fontMetrics().denom1):(f>0?(g=e.fontMetrics().num2,C=y):(g=e.fontMetrics().num3,C=3*y),z=e.fontMetrics().denom2);var k;if(h){var A=e.fontMetrics().axisHeight;g-o.depth-(A+.5*f)<C&&(g+=C-(g-o.depth-(A+.5*f))),A-.5*f-(m.height-z)<C&&(z+=C-(A-.5*f-(m.height-z)));var D=-(A-.5*f);k=pe({positionType:"individualShift",children:[{type:"elem",elem:m,shift:z},{type:"elem",elem:h,shift:D},{type:"elem",elem:o,shift:-g}]})}else{var M=g-o.depth-(m.height-z);M<C&&(g+=.5*(C-M),z+=.5*(C-M)),k=pe({positionType:"individualShift",children:[{type:"elem",elem:m,shift:z},{type:"elem",elem:o,shift:-g}]})}n=e.havingStyle(t),k.height*=n.sizeMultiplier/e.sizeMultiplier,k.depth*=n.sizeMultiplier/e.sizeMultiplier;var $;t.size===se.DISPLAY.size?$=e.fontMetrics().delim1:t.size===se.SCRIPTSCRIPT.size?$=e.havingStyle(se.SCRIPT).fontMetrics().delim2:$=e.fontMetrics().delim2;var Y,Q;return r.leftDelim==null?Y=tr(e,["mopen"]):Y=Ea(r.leftDelim,$,!0,e.havingStyle(t),r.mode,["mopen"]),r.continued?Q=I([]):r.rightDelim==null?Q=tr(e,["mclose"]):Q=Ea(r.rightDelim,$,!0,e.havingStyle(t),r.mode,["mclose"]),I(["mord"].concat(n.sizingClasses(e)),[Y,I(["mfrac"],[k]),Q],e)},Ys=(r,e)=>{var t=new L("mfrac",[ge(r.numer,e),ge(r.denom,e)]);if(!r.hasBarLine)t.setAttribute("linethickness","0px");else if(r.barSize){var a=Se(r.barSize,e);t.setAttribute("linethickness",q(a))}if(r.leftDelim!=null||r.rightDelim!=null){var i=[];if(r.leftDelim!=null){var n=new L("mo",[new Ae(r.leftDelim.replace("\\",""))]);n.setAttribute("fence","true"),i.push(n)}if(i.push(t),r.rightDelim!=null){var o=new L("mo",[new Ae(r.rightDelim.replace("\\",""))]);o.setAttribute("fence","true"),i.push(o)}return Ha(i)}return t},Ri=(r,e)=>{if(!e)return r;var t={type:"styling",mode:r.mode,style:e,body:[r]};return t};V({type:"genfrac",names:["\\cfrac","\\dfrac","\\frac","\\tfrac","\\dbinom","\\binom","\\tbinom","\\\\atopfrac","\\\\bracefrac","\\\\brackfrac"],props:{numArgs:2,allowedInArgument:!0},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=e[0],n=e[1],o,l=null,c=null;switch(a){case"\\cfrac":case"\\dfrac":case"\\frac":case"\\tfrac":o=!0;break;case"\\\\atopfrac":o=!1;break;case"\\dbinom":case"\\binom":case"\\tbinom":o=!1,l="(",c=")";break;case"\\\\bracefrac":o=!1,l="\\{",c="\\}";break;case"\\\\brackfrac":o=!1,l="[",c="]";break;default:throw new Error("Unrecognized genfrac command")}var m=a==="\\cfrac",h=null;return m||a.startsWith("\\d")?h="display":a.startsWith("\\t")&&(h="text"),Ri({type:"genfrac",mode:t.mode,numer:i,denom:n,continued:m,hasBarLine:o,leftDelim:l,rightDelim:c,barSize:null},h)},htmlBuilder:Xs,mathmlBuilder:Ys});V({type:"infix",names:["\\over","\\choose","\\atop","\\brace","\\brack"],props:{numArgs:0,infix:!0},handler(r){var{parser:e,funcName:t,token:a}=r,i;switch(t){case"\\over":i="\\frac";break;case"\\choose":i="\\binom";break;case"\\atop":i="\\\\atopfrac";break;case"\\brace":i="\\\\bracefrac";break;case"\\brack":i="\\\\brackfrac";break;default:throw new Error("Unrecognized infix genfrac command")}return{type:"infix",mode:e.mode,replaceWith:i,token:a}}});var R0=["display","text","script","scriptscript"],P0=function(e){var t=null;return e.length>0&&(t=e,t=t==="."?null:t),t};V({type:"genfrac",names:["\\genfrac"],props:{numArgs:6,allowedInArgument:!0,argTypes:["math","math","size","text","math","math"]},handler(r,e){var{parser:t}=r,a=e[4],i=e[5],n=wr(e[0]),o=n.type==="atom"&&n.family==="open"?P0(n.text):null,l=wr(e[1]),c=l.type==="atom"&&l.family==="close"?P0(l.text):null,m=oe(e[2],"size"),h,f=null;m.isBlank?h=!0:(f=m.value,h=f.number>0);var y=null,g=e[3];if(g.type==="ordgroup"){if(g.body.length>0){var C=oe(g.body[0],"textord");y=R0[Number(C.text)]}}else g=oe(g,"textord"),y=R0[Number(g.text)];return Ri({type:"genfrac",mode:t.mode,numer:a,denom:i,continued:!1,hasBarLine:h,barSize:f,leftDelim:o,rightDelim:c},y)}});V({type:"infix",names:["\\above"],props:{numArgs:1,argTypes:["size"],infix:!0},handler(r,e){var{parser:t,funcName:a,token:i}=r;return{type:"infix",mode:t.mode,replaceWith:"\\\\abovefrac",size:oe(e[0],"size").value,token:i}}});V({type:"genfrac",names:["\\\\abovefrac"],props:{numArgs:3,argTypes:["math","size","math"]},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=e[0],n=oe(e[1],"infix").size;if(!n)throw new Error("\\\\abovefrac expected size, but got "+String(n));var o=e[2],l=n.number>0;return{type:"genfrac",mode:t.mode,numer:i,denom:o,continued:!1,hasBarLine:l,barSize:n,leftDelim:null,rightDelim:null}}});var Pi=(r,e)=>{var t=e.style,a,i;r.type==="supsub"?(a=r.sup?he(r.sup,e.havingStyle(t.sup()),e):he(r.sub,e.havingStyle(t.sub()),e),i=oe(r.base,"horizBrace")):i=oe(r,"horizBrace");var n=he(i.base,e.havingBaseStyle(se.DISPLAY)),o=Ar(i,e),l;if(i.isOver?l=pe({positionType:"firstBaseline",children:[{type:"elem",elem:n},{type:"kern",size:.1},{type:"elem",elem:o,wrapperClasses:["svg-align"]}]}):l=pe({positionType:"bottom",positionData:n.depth+.1+o.height,children:[{type:"elem",elem:o,wrapperClasses:["svg-align"]},{type:"kern",size:.1},{type:"elem",elem:n}]}),a){var c=I(["minner",i.isOver?"mover":"munder"],[l],e);i.isOver?l=pe({positionType:"firstBaseline",children:[{type:"elem",elem:c},{type:"kern",size:.2},{type:"elem",elem:a}]}):l=pe({positionType:"bottom",positionData:c.depth+.2+a.height+a.depth,children:[{type:"elem",elem:a},{type:"kern",size:.2},{type:"elem",elem:c}]})}return I(["minner",i.isOver?"mover":"munder"],[l],e)},Ks=(r,e)=>{var t=Cr(r.label);return new L(r.isOver?"mover":"munder",[ge(r.base,e),t])};V({type:"horizBrace",names:["\\overbrace","\\underbrace","\\overbracket","\\underbracket"],props:{numArgs:1},handler(r,e){var{parser:t,funcName:a}=r;return{type:"horizBrace",mode:t.mode,label:a,isOver:a.includes("\\over"),base:e[0]}},htmlBuilder:Pi,mathmlBuilder:Ks});V({type:"href",names:["\\href"],props:{numArgs:2,argTypes:["url","original"],allowedInText:!0},handler:(r,e)=>{var{parser:t}=r,a=e[1],i=oe(e[0],"url").url;return t.settings.isTrusted({command:"\\href",url:i})?{type:"href",mode:t.mode,href:i,body:Ce(a)}:t.formatUnsupportedCmd("\\href")},htmlBuilder:(r,e)=>{var t=Ie(r.body,e,!1);return ls(r.href,[],t,e)},mathmlBuilder:(r,e)=>{var t=vt(r.body,e);return t instanceof L||(t=new L("mrow",[t])),t.setAttribute("href",r.href),t}});V({type:"href",names:["\\url"],props:{numArgs:1,argTypes:["url"],allowedInText:!0},handler:(r,e)=>{var{parser:t}=r,a=oe(e[0],"url").url;if(!t.settings.isTrusted({command:"\\url",url:a}))return t.formatUnsupportedCmd("\\url");for(var i=[],n=0;n<a.length;n++){var o=a[n];o==="~"&&(o="\\textasciitilde"),i.push({type:"textord",mode:"text",text:o})}var l={type:"text",mode:t.mode,font:"\\texttt",body:i};return{type:"href",mode:t.mode,href:a,body:Ce(l)}}});V({type:"hbox",names:["\\hbox"],props:{numArgs:1,argTypes:["text"],allowedInText:!0,primitive:!0},handler(r,e){var{parser:t}=r;return{type:"hbox",mode:t.mode,body:Ce(e[0])}},htmlBuilder(r,e){var t=Ie(r.body,e.withFont(""),!1);return dt(t)},mathmlBuilder(r,e){return new L("mrow",We(r.body,e.withFont("")))}});V({type:"html",names:["\\htmlClass","\\htmlId","\\htmlStyle","\\htmlData"],props:{numArgs:2,argTypes:["raw","original"],allowedInText:!0},handler:(r,e)=>{var{parser:t,funcName:a,token:i}=r,n=oe(e[0],"raw").string,o=e[1];t.settings.strict&&t.settings.reportNonstrict("htmlExtension","HTML extension is disabled on strict mode");var l,c={};switch(a){case"\\htmlClass":c.class=n,l={command:"\\htmlClass",class:n};break;case"\\htmlId":c.id=n,l={command:"\\htmlId",id:n};break;case"\\htmlStyle":c.style=n,l={command:"\\htmlStyle",style:n};break;case"\\htmlData":{for(var m=n.split(","),h=0;h<m.length;h++){var f=m[h],y=f.indexOf("=");if(y<0)throw new B("\\htmlData key/value '"+f+"' missing equals sign");var g=f.slice(0,y),C=f.slice(y+1);c["data-"+g.trim()]=C}l={command:"\\htmlData",attributes:c};break}default:throw new Error("Unrecognized html command")}return t.settings.isTrusted(l)?{type:"html",mode:t.mode,attributes:c,body:Ce(o)}:t.formatUnsupportedCmd(a)},htmlBuilder:(r,e)=>{var t=Ie(r.body,e,!1),a=["enclosing"];r.attributes.class&&a.push(...r.attributes.class.trim().split(/\s+/));var i=I(a,t,e);for(var n in r.attributes)n!=="class"&&r.attributes.hasOwnProperty(n)&&i.setAttribute(n,r.attributes[n]);return i},mathmlBuilder:(r,e)=>vt(r.body,e)});V({type:"htmlmathml",names:["\\html@mathml"],props:{numArgs:2,allowedInArgument:!0,allowedInText:!0},handler:(r,e)=>{var{parser:t}=r;return{type:"htmlmathml",mode:t.mode,html:Ce(e[0]),mathml:Ce(e[1])}},htmlBuilder:(r,e)=>{var t=Ie(r.html,e,!1);return dt(t)},mathmlBuilder:(r,e)=>vt(r.mathml,e)});var ta=function(e){if(/^[-+]? *(\d+(\.\d*)?|\.\d+)$/.test(e))return{number:+e,unit:"bp"};var t=/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(e);if(!t)throw new B("Invalid size: '"+e+"' in \\includegraphics");var a={number:+(t[1]+t[2]),unit:t[3]};if(!ei(a))throw new B("Invalid unit: '"+a.unit+"' in \\includegraphics.");return a};V({type:"includegraphics",names:["\\includegraphics"],props:{numArgs:1,numOptionalArgs:1,argTypes:["raw","url"],allowedInText:!1},handler:(r,e,t)=>{var{parser:a}=r,i={number:0,unit:"em"},n={number:.9,unit:"em"},o={number:0,unit:"em"},l="";if(t[0])for(var c=oe(t[0],"raw").string,m=c.split(","),h=0;h<m.length;h++){var f=m[h].split("=");if(f.length===2){var y=f[1].trim();switch(f[0].trim()){case"alt":l=y;break;case"width":i=ta(y);break;case"height":n=ta(y);break;case"totalheight":o=ta(y);break;default:throw new B("Invalid key: '"+f[0]+"' in \\includegraphics.")}}}var g=oe(e[0],"url").url;return l===""&&(l=g,l=l.replace(/^.*[\\/]/,""),l=l.substring(0,l.lastIndexOf("."))),a.settings.isTrusted({command:"\\includegraphics",url:g})?{type:"includegraphics",mode:a.mode,alt:l,width:i,height:n,totalheight:o,src:g}:a.formatUnsupportedCmd("\\includegraphics")},htmlBuilder:(r,e)=>{var t=Se(r.height,e),a=0;r.totalheight.number>0&&(a=Se(r.totalheight,e)-t);var i=0;r.width.number>0&&(i=Se(r.width,e));var n={height:q(t+a)};i>0&&(n.width=q(i)),a>0&&(n.verticalAlign=q(-a));var o=new Zn(r.src,r.alt,n);return o.height=t,o.depth=a,o},mathmlBuilder:(r,e)=>{var t=new L("mglyph",[]);t.setAttribute("alt",r.alt);var a=Se(r.height,e),i=0;if(r.totalheight.number>0&&(i=Se(r.totalheight,e)-a,t.setAttribute("valign",q(-i))),t.setAttribute("height",q(a+i)),r.width.number>0){var n=Se(r.width,e);t.setAttribute("width",q(n))}return t.setAttribute("src",r.src),t}});V({type:"kern",names:["\\kern","\\mkern","\\hskip","\\mskip"],props:{numArgs:1,argTypes:["size"],primitive:!0,allowedInText:!0},handler(r,e){var{parser:t,funcName:a}=r,i=oe(e[0],"size");if(t.settings.strict){var n=a[1]==="m",o=i.value.unit==="mu";n?(o||t.settings.reportNonstrict("mathVsTextUnits","LaTeX's "+a+" supports only mu units, "+("not "+i.value.unit+" units")),t.mode!=="math"&&t.settings.reportNonstrict("mathVsTextUnits","LaTeX's "+a+" works only in math mode")):o&&t.settings.reportNonstrict("mathVsTextUnits","LaTeX's "+a+" doesn't support mu units")}return{type:"kern",mode:t.mode,dimension:i.value}},htmlBuilder(r,e){return si(r.dimension,e)},mathmlBuilder(r,e){var t=Se(r.dimension,e);return new mi(t)}});V({type:"lap",names:["\\mathllap","\\mathrlap","\\mathclap"],props:{numArgs:1,allowedInText:!0},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=e[0];return{type:"lap",mode:t.mode,alignment:a.slice(5),body:i}},htmlBuilder:(r,e)=>{var t;r.alignment==="clap"?(t=I([],[he(r.body,e)]),t=I(["inner"],[t],e)):t=I(["inner"],[he(r.body,e)]);var a=I(["fix"],[]),i=I([r.alignment],[t,a],e),n=I(["strut"]);return n.style.height=q(i.height+i.depth),i.depth&&(n.style.verticalAlign=q(-i.depth)),i.children.unshift(n),i=I(["thinbox"],[i],e),I(["mord","vbox"],[i],e)},mathmlBuilder:(r,e)=>{var t=new L("mpadded",[ge(r.body,e)]);if(r.alignment!=="rlap"){var a=r.alignment==="llap"?"-1":"-0.5";t.setAttribute("lspace",a+"width")}return t.setAttribute("width","0px"),t}});V({type:"styling",names:["\\(","$"],props:{numArgs:0,allowedInText:!0,allowedInMath:!1},handler(r,e){var{funcName:t,parser:a}=r,i=a.mode;a.switchMode("math");var n=t==="\\("?"\\)":"$",o=a.parseExpression(!1,n);return a.expect(n),a.switchMode(i),{type:"styling",mode:a.mode,style:"text",resetFont:!0,body:o}}});V({type:"text",names:["\\)","\\]"],props:{numArgs:0,allowedInText:!0,allowedInMath:!1},handler(r,e){throw new B("Mismatched "+r.funcName)}});var F0=(r,e)=>{switch(e.style.size){case se.DISPLAY.size:return r.display;case se.TEXT.size:return r.text;case se.SCRIPT.size:return r.script;case se.SCRIPTSCRIPT.size:return r.scriptscript;default:return r.text}};V({type:"mathchoice",names:["\\mathchoice"],props:{numArgs:4,primitive:!0},handler:(r,e)=>{var{parser:t}=r;return{type:"mathchoice",mode:t.mode,display:Ce(e[0]),text:Ce(e[1]),script:Ce(e[2]),scriptscript:Ce(e[3])}},htmlBuilder:(r,e)=>{var t=F0(r,e),a=Ie(t,e,!1);return dt(a)},mathmlBuilder:(r,e)=>{var t=F0(r,e);return vt(t,e)}});var Fi=(r,e,t,a,i,n,o)=>{r=I([],[r]);var l=t&&ot(t),c,m;if(e){var h=he(e,a.havingStyle(i.sup()),a);m={elem:h,kern:Math.max(a.fontMetrics().bigOpSpacing1,a.fontMetrics().bigOpSpacing3-h.depth)}}if(t){var f=he(t,a.havingStyle(i.sub()),a);c={elem:f,kern:Math.max(a.fontMetrics().bigOpSpacing2,a.fontMetrics().bigOpSpacing4-f.height)}}var y;if(m&&c){var g=a.fontMetrics().bigOpSpacing5+c.elem.height+c.elem.depth+c.kern+r.depth+o;y=pe({positionType:"bottom",positionData:g,children:[{type:"kern",size:a.fontMetrics().bigOpSpacing5},{type:"elem",elem:c.elem,marginLeft:q(-n)},{type:"kern",size:c.kern},{type:"elem",elem:r},{type:"kern",size:m.kern},{type:"elem",elem:m.elem,marginLeft:q(n)},{type:"kern",size:a.fontMetrics().bigOpSpacing5}]})}else if(c){var C=r.height-o;y=pe({positionType:"top",positionData:C,children:[{type:"kern",size:a.fontMetrics().bigOpSpacing5},{type:"elem",elem:c.elem,marginLeft:q(-n)},{type:"kern",size:c.kern},{type:"elem",elem:r}]})}else if(m){var z=r.depth+o;y=pe({positionType:"bottom",positionData:z,children:[{type:"elem",elem:r},{type:"kern",size:m.kern},{type:"elem",elem:m.elem,marginLeft:q(n)},{type:"kern",size:a.fontMetrics().bigOpSpacing5}]})}else return r;var k=[y];if(c&&n!==0&&!l){var M=I(["mspace"],[],a);M.style.marginRight=q(n),k.unshift(M)}return I(["mop","op-limits"],k,a)},ji=new Set(["\\smallint"]),Ut=(r,e)=>{var t,a,i=!1,n;r.type==="supsub"?(t=r.sup,a=r.sub,n=oe(r.base,"op"),i=!0):n=oe(r,"op");var o=e.style,l=!1;o.size===se.DISPLAY.size&&n.symbol&&!ji.has(n.name)&&(l=!0);var c,m;if(n.symbol){var h=l?"Size2-Regular":"Size1-Regular",f="";if((n.name==="\\oiint"||n.name==="\\oiiint")&&(f=n.name.slice(1),n.name=f==="oiint"?"\\iint":"\\iiint"),c=Re(n.name,h,"math",e,["mop","op-symbol",l?"large-op":"small-op"]),m=c.italic,f.length>0){var y=li(f+"Size"+(l?"2":"1"),e);c=pe({positionType:"individualShift",children:[{type:"elem",elem:c,shift:0},{type:"elem",elem:y,shift:l?.08:0}]}),n.name="\\"+f,c.classes.unshift("mop"),c.italic=m}}else if(n.body){var g=Ie(n.body,e,!0);g.length===1&&g[0]instanceof Ge?(c=g[0],c.classes[0]="mop"):c=I(["mop"],g,e)}else{for(var C=[],z=1;z<n.name.length;z++)C.push(Na(n.name[z],n.mode,e));c=I(["mop"],C,e)}var k=0,M=0;if((c instanceof Ge||n.name==="\\oiint"||n.name==="\\oiiint")&&!n.suppressBaseShift){var A;k=(c.height-c.depth)/2-e.fontMetrics().axisHeight,M=(A=c.italic)!=null?A:0}return i?Fi(c,t,a,e,o,M,k):(k&&(c.style.position="relative",c.style.top=q(k)),c)},ar=(r,e)=>{var t;if(r.symbol)t=new L("mo",[Ke(r.name,r.mode)]),ji.has(r.name)&&t.setAttribute("largeop","false");else if(r.body)t=new L("mo",We(r.body,e));else{t=new L("mi",[new Ae(r.name.slice(1))]);var a=new L("mo",[Ke("⁡","text")]);r.parentIsSupSub?t=new L("mrow",[t,a]):t=ui([t,a])}return t},Zs={"∏":"\\prod","∐":"\\coprod","∑":"\\sum","⋀":"\\bigwedge","⋁":"\\bigvee","⋂":"\\bigcap","⋃":"\\bigcup","⨀":"\\bigodot","⨁":"\\bigoplus","⨂":"\\bigotimes","⨄":"\\biguplus","⨆":"\\bigsqcup"};V({type:"op",names:["\\coprod","\\bigvee","\\bigwedge","\\biguplus","\\bigcap","\\bigcup","\\intop","\\prod","\\sum","\\bigotimes","\\bigoplus","\\bigodot","\\bigsqcup","\\smallint","∏","∐","∑","⋀","⋁","⋂","⋃","⨀","⨁","⨂","⨄","⨆"],props:{numArgs:0},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=a;return i.length===1&&(i=Zs[i]),{type:"op",mode:t.mode,limits:!0,parentIsSupSub:!1,symbol:!0,name:i}},htmlBuilder:Ut,mathmlBuilder:ar});V({type:"op",names:["\\mathop"],props:{numArgs:1,primitive:!0},handler:(r,e)=>{var{parser:t}=r,a=e[0];return{type:"op",mode:t.mode,limits:!1,parentIsSupSub:!1,symbol:!1,body:Ce(a)}},htmlBuilder:Ut,mathmlBuilder:ar});var Js={"∫":"\\int","∬":"\\iint","∭":"\\iiint","∮":"\\oint","∯":"\\oiint","∰":"\\oiiint"};V({type:"op",names:["\\arcsin","\\arccos","\\arctan","\\arctg","\\arcctg","\\arg","\\ch","\\cos","\\cosec","\\cosh","\\cot","\\cotg","\\coth","\\csc","\\ctg","\\cth","\\deg","\\dim","\\exp","\\hom","\\ker","\\lg","\\ln","\\log","\\sec","\\sin","\\sinh","\\sh","\\tan","\\tanh","\\tg","\\th"],props:{numArgs:0},handler(r){var{parser:e,funcName:t}=r;return{type:"op",mode:e.mode,limits:!1,parentIsSupSub:!1,symbol:!1,name:t}},htmlBuilder:Ut,mathmlBuilder:ar});V({type:"op",names:["\\det","\\gcd","\\inf","\\lim","\\max","\\min","\\Pr","\\sup"],props:{numArgs:0},handler(r){var{parser:e,funcName:t}=r;return{type:"op",mode:e.mode,limits:!0,parentIsSupSub:!1,symbol:!1,name:t}},htmlBuilder:Ut,mathmlBuilder:ar});V({type:"op",names:["\\int","\\iint","\\iiint","\\oint","\\oiint","\\oiiint","∫","∬","∭","∮","∯","∰"],props:{numArgs:0,allowedInArgument:!0},handler(r){var{parser:e,funcName:t}=r,a=t;return a.length===1&&(a=Js[a]),{type:"op",mode:e.mode,limits:!1,parentIsSupSub:!1,symbol:!0,name:a}},htmlBuilder:Ut,mathmlBuilder:ar});var Ni=(r,e)=>{var t,a,i=!1,n;r.type==="supsub"?(t=r.sup,a=r.sub,n=oe(r.base,"operatorname"),i=!0):n=oe(r,"operatorname");var o;if(n.body.length>0){for(var l=n.body.map(f=>{var y="text"in f?f.text:void 0;return typeof y=="string"?{type:"textord",mode:f.mode,text:y}:f}),c=Ie(l,e.withFont("mathrm"),!0),m=0;m<c.length;m++){var h=c[m];h instanceof Ge&&(h.text=h.text.replace(/\u2212/,"-").replace(/\u2217/,"*"))}o=I(["mop"],c,e)}else o=I(["mop"],[],e);return i?Fi(o,t,a,e,e.style,0,0):o},Qs=(r,e)=>{for(var t=We(r.body,e.withFont("mathrm")),a=!0,i=0;i<t.length;i++){var n=t[i];if(!(n instanceof mi))if(n instanceof L)switch(n.type){case"mi":case"mn":case"mspace":case"mtext":break;case"mo":{var o=n.children[0];n.children.length===1&&o instanceof Ae?o.text=o.text.replace(/\u2212/,"-").replace(/\u2217/,"*"):a=!1;break}default:a=!1}else a=!1}if(a){var l=t.map(h=>h.toText()).join("");t=[new Ae(l)]}var c=new L("mi",t);c.setAttribute("mathvariant","normal");var m=new L("mo",[Ke("⁡","text")]);return r.parentIsSupSub?new L("mrow",[c,m]):ui([c,m])};V({type:"operatorname",names:["\\operatorname@","\\operatornamewithlimits"],props:{numArgs:1},handler:(r,e)=>{var{parser:t,funcName:a}=r,i=e[0];return{type:"operatorname",mode:t.mode,body:Ce(i),alwaysHandleSupSub:a==="\\operatornamewithlimits",limits:!1,parentIsSupSub:!1}},htmlBuilder:Ni,mathmlBuilder:Qs});p("\\operatorname","\\@ifstar\\operatornamewithlimits\\operatorname@");Bt({type:"ordgroup",htmlBuilder(r,e){return r.semisimple?dt(Ie(r.body,e,!1)):I(["mord"],Ie(r.body,e,!0),e)},mathmlBuilder(r,e){return vt(r.body,e,!0)}});V({type:"overline",names:["\\overline"],props:{numArgs:1},handler(r,e){var{parser:t}=r,a=e[0];return{type:"overline",mode:t.mode,body:a}},htmlBuilder(r,e){var t=he(r.body,e.havingCrampedStyle()),a=Nt("overline-line",e),i=e.fontMetrics().defaultRuleThickness,n=pe({positionType:"firstBaseline",children:[{type:"elem",elem:t},{type:"kern",size:3*i},{type:"elem",elem:a},{type:"kern",size:i}]});return I(["mord","overline"],[n],e)},mathmlBuilder(r,e){var t=new L("mo",[new Ae("‾")]);t.setAttribute("stretchy","true");var a=new L("mover",[ge(r.body,e),t]);return a.setAttribute("accent","true"),a}});V({type:"phantom",names:["\\phantom"],props:{numArgs:1,allowedInText:!0},handler:(r,e)=>{var{parser:t}=r,a=e[0];return{type:"phantom",mode:t.mode,body:Ce(a)}},htmlBuilder:(r,e)=>{var t=Ie(r.body,e.withPhantom(),!1);return dt(t)},mathmlBuilder:(r,e)=>{var t=We(r.body,e);return new L("mphantom",t)}});p("\\hphantom","\\smash{\\phantom{#1}}");V({type:"vphantom",names:["\\vphantom"],props:{numArgs:1,allowedInText:!0},handler:(r,e)=>{var{parser:t}=r,a=e[0];return{type:"vphantom",mode:t.mode,body:a}},htmlBuilder:(r,e)=>{var t=I(["inner"],[he(r.body,e.withPhantom())]),a=I(["fix"],[]);return I(["mord","rlap"],[t,a],e)},mathmlBuilder:(r,e)=>{var t=We(Ce(r.body),e),a=new L("mphantom",t),i=new L("mpadded",[a]);return i.setAttribute("width","0px"),i}});V({type:"raisebox",names:["\\raisebox"],props:{numArgs:2,argTypes:["size","hbox"],allowedInText:!0},handler(r,e){var{parser:t}=r,a=oe(e[0],"size").value,i=e[1];return{type:"raisebox",mode:t.mode,dy:a,body:i}},htmlBuilder(r,e){var t=he(r.body,e),a=Se(r.dy,e);return pe({positionType:"shift",positionData:-a,children:[{type:"elem",elem:t}]})},mathmlBuilder(r,e){var t=new L("mpadded",[ge(r.body,e)]),a=r.dy.number+r.dy.unit;return t.setAttribute("voffset",a),t}});V({type:"internal",names:["\\relax"],props:{numArgs:0,allowedInText:!0,allowedInArgument:!0},handler(r){var{parser:e}=r;return{type:"internal",mode:e.mode}}});V({type:"rule",names:["\\rule"],props:{numArgs:2,numOptionalArgs:1,allowedInText:!0,allowedInMath:!0,argTypes:["size","size","size"]},handler(r,e,t){var{parser:a}=r,i=t[0],n=oe(e[0],"size"),o=oe(e[1],"size");return{type:"rule",mode:a.mode,shift:i&&oe(i,"size").value,width:n.value,height:o.value}},htmlBuilder(r,e){var t=I(["mord","rule"],[],e),a=Se(r.width,e),i=Se(r.height,e),n=r.shift?Se(r.shift,e):0;return t.style.borderRightWidth=q(a),t.style.borderTopWidth=q(i),t.style.bottom=q(n),t.width=a,t.height=i+n,t.depth=-n,t.maxFontSize=i*1.125*e.sizeMultiplier,t},mathmlBuilder(r,e){var t=Se(r.width,e),a=Se(r.height,e),i=r.shift?Se(r.shift,e):0,n=e.color&&e.getColor()||"black",o=new L("mspace");o.setAttribute("mathbackground",n),o.setAttribute("width",q(t)),o.setAttribute("height",q(a));var l=new L("mpadded",[o]);return i>=0?l.setAttribute("height",q(i)):(l.setAttribute("height",q(i)),l.setAttribute("depth",q(-i))),l.setAttribute("voffset",q(i)),l}});function Oi(r,e,t){for(var a=Ie(r,e,!1),i=e.sizeMultiplier/t.sizeMultiplier,n=0;n<a.length;n++){var o=a[n].classes.indexOf("sizing");o<0?Array.prototype.push.apply(a[n].classes,e.sizingClasses(t)):a[n].classes[o+1]==="reset-size"+e.size&&(a[n].classes[o+1]="reset-size"+t.size),a[n].height*=i,a[n].depth*=i}return dt(a)}var j0=["\\tiny","\\sixptsize","\\scriptsize","\\footnotesize","\\small","\\normalsize","\\large","\\Large","\\LARGE","\\huge","\\Huge"],_s=(r,e)=>{var t=e.havingSize(r.size);return Oi(r.body,t,e)};V({type:"sizing",names:j0,props:{numArgs:0,allowedInText:!0},handler:(r,e)=>{var{breakOnTokenText:t,funcName:a,parser:i}=r,n=i.parseExpression(!1,t);return{type:"sizing",mode:i.mode,size:j0.indexOf(a)+1,body:n}},htmlBuilder:_s,mathmlBuilder:(r,e)=>{var t=e.havingSize(r.size),a=We(r.body,t),i=new L("mstyle",a);return i.setAttribute("mathsize",q(t.sizeMultiplier)),i}});V({type:"smash",names:["\\smash"],props:{numArgs:1,numOptionalArgs:1,allowedInText:!0},handler:(r,e,t)=>{var{parser:a}=r,i=!1,n=!1,o=t[0]&&oe(t[0],"ordgroup");if(o)for(var l,c=0;c<o.body.length;++c){var m=o.body[c];if(l=Tr(m).text,l==="t")i=!0;else if(l==="b")n=!0;else{i=!1,n=!1;break}}else i=!0,n=!0;var h=e[0];return{type:"smash",mode:a.mode,body:h,smashHeight:i,smashDepth:n}},htmlBuilder:(r,e)=>{var t=I([],[he(r.body,e)]);if(!r.smashHeight&&!r.smashDepth)return t;if(r.smashHeight&&(t.height=0),r.smashDepth&&(t.depth=0),r.smashHeight&&r.smashDepth)return I(["mord","smash"],[t],e);if(t.children)for(var a=0;a<t.children.length;a++)r.smashHeight&&(t.children[a].height=0),r.smashDepth&&(t.children[a].depth=0);var i=pe({positionType:"firstBaseline",children:[{type:"elem",elem:t}]});return I(["mord"],[i],e)},mathmlBuilder:(r,e)=>{var t=new L("mpadded",[ge(r.body,e)]);return r.smashHeight&&t.setAttribute("height","0px"),r.smashDepth&&t.setAttribute("depth","0px"),t}});V({type:"sqrt",names:["\\sqrt"],props:{numArgs:1,numOptionalArgs:1},handler(r,e,t){var{parser:a}=r,i=t[0],n=e[0];return{type:"sqrt",mode:a.mode,body:n,index:i}},htmlBuilder(r,e){var t=he(r.body,e.havingCrampedStyle());t.height===0&&(t.height=e.fontMetrics().xHeight),t=Ot(t,e);var a=e.fontMetrics(),i=a.defaultRuleThickness,n=i;e.style.id<se.TEXT.id&&(n=e.fontMetrics().xHeight);var o=i+n/4,l=t.height+t.depth+o+i,{span:c,ruleWidth:m,advanceWidth:h}=js(l,e),f=c.height-m;f>t.height+t.depth+o&&(o=(o+f-t.height-t.depth)/2);var y=c.height-t.height-o-m;t.style.paddingLeft=q(h);var g=pe({positionType:"firstBaseline",children:[{type:"elem",elem:t,wrapperClasses:["svg-align"]},{type:"kern",size:-(t.height+y)},{type:"elem",elem:c},{type:"kern",size:m}]});if(r.index){var C=e.havingStyle(se.SCRIPTSCRIPT),z=he(r.index,C,e),k=.6*(g.height-g.depth),M=pe({positionType:"shift",positionData:-k,children:[{type:"elem",elem:z}]}),A=I(["root"],[M]);return I(["mord","sqrt"],[A,g],e)}else return I(["mord","sqrt"],[g],e)},mathmlBuilder(r,e){var{body:t,index:a}=r;return a?new L("mroot",[ge(t,e),ge(a,e)]):new L("msqrt",[ge(t,e)])}});var Ia={display:se.DISPLAY,text:se.TEXT,script:se.SCRIPT,scriptscript:se.SCRIPTSCRIPT};function eo(r){return r in Ia}V({type:"styling",names:["\\displaystyle","\\textstyle","\\scriptstyle","\\scriptscriptstyle"],props:{numArgs:0,allowedInText:!0,primitive:!0},handler(r,e){var{breakOnTokenText:t,funcName:a,parser:i}=r,n=i.parseExpression(!0,t),o=a.slice(1,a.length-5);if(!eo(o))throw new Error("Unknown style: "+o);return{type:"styling",mode:i.mode,style:o,body:n}},htmlBuilder(r,e){var t=Ia[r.style],a=e.havingStyle(t);return r.resetFont&&(a=a.withFont("")),Oi(r.body,a,e)},mathmlBuilder(r,e){var t=Ia[r.style],a=e.havingStyle(t);r.resetFont&&(a=a.withFont(""));var i=We(r.body,a),n=new L("mstyle",i),o={display:["0","true"],text:["0","false"],script:["1","false"],scriptscript:["2","false"]},l=o[r.style];return n.setAttribute("scriptlevel",l[0]),n.setAttribute("displaystyle",l[1]),n}});var to=function(e,t){var a=e.base;if(a)if(a.type==="op"){var i=a.limits&&(t.style.size===se.DISPLAY.size||a.alwaysHandleSupSub);return i?Ut:null}else if(a.type==="operatorname"){var n=a.alwaysHandleSupSub&&(t.style.size===se.DISPLAY.size||a.limits);return n?Ni:null}else{if(a.type==="accent")return ot(a.base)?Ga:null;if(a.type==="horizBrace"){var o=!e.sub;return o===a.isOver?Pi:null}else return null}else return null};Bt({type:"supsub",htmlBuilder(r,e){var t=to(r,e);if(t)return t(r,e);var{base:a,sup:i,sub:n}=r,o=he(a,e),l,c,m=e.fontMetrics(),h=0,f=0,y=a&&ot(a);if(i){var g=e.havingStyle(e.style.sup());l=he(i,g,e),y||(h=o.height-g.fontMetrics().supDrop*g.sizeMultiplier/e.sizeMultiplier)}if(n){var C=e.havingStyle(e.style.sub());c=he(n,C,e),y||(f=o.depth+C.fontMetrics().subDrop*C.sizeMultiplier/e.sizeMultiplier)}var z;e.style===se.DISPLAY?z=m.sup1:e.style.cramped?z=m.sup3:z=m.sup2;var k=e.sizeMultiplier,M=q(.5/m.ptPerEm/k),A=null;if(c){var D=r.base&&r.base.type==="op"&&r.base.name&&(r.base.name==="\\oiint"||r.base.name==="\\oiiint");if(o instanceof Ge||D){var $;A=q(-(($=o.italic)!=null?$:0))}}var Y;if(l&&c){h=Math.max(h,z,l.depth+.25*m.xHeight),f=Math.max(f,m.sub2);var Q=m.defaultRuleThickness,X=4*Q;if(h-l.depth-(c.height-f)<X){f=X-(h-l.depth)+c.height;var K=.8*m.xHeight-(h-l.depth);K>0&&(h+=K,f-=K)}var R=[{type:"elem",elem:c,shift:f,marginRight:M,marginLeft:A},{type:"elem",elem:l,shift:-h,marginRight:M}];Y=pe({positionType:"individualShift",children:R})}else if(c){f=Math.max(f,m.sub1,c.height-.8*m.xHeight);var J=[{type:"elem",elem:c,marginLeft:A,marginRight:M}];Y=pe({positionType:"shift",positionData:f,children:J})}else if(l)h=Math.max(h,z,l.depth+.25*m.xHeight),Y=pe({positionType:"shift",positionData:-h,children:[{type:"elem",elem:l,marginRight:M}]});else throw new Error("supsub must have either sup or sub.");var ie=za(o,"right")||"mord";return I([ie],[o,I(["msupsub"],[Y])],e)},mathmlBuilder(r,e){var t=!1,a,i;r.base&&r.base.type==="horizBrace"&&(i=!!r.sup,i===r.base.isOver&&(t=!0,a=r.base.isOver)),r.base&&(r.base.type==="op"||r.base.type==="operatorname")&&(r.base.parentIsSupSub=!0);var n=[ge(r.base,e)];r.sub&&n.push(ge(r.sub,e)),r.sup&&n.push(ge(r.sup,e));var o;if(t)o=a?"mover":"munder";else if(r.sub)if(r.sup){var m=r.base;m&&m.type==="op"&&m.limits&&e.style===se.DISPLAY||m&&m.type==="operatorname"&&m.alwaysHandleSupSub&&(e.style===se.DISPLAY||m.limits)?o="munderover":o="msubsup"}else{var c=r.base;c&&c.type==="op"&&c.limits&&(e.style===se.DISPLAY||c.alwaysHandleSupSub)||c&&c.type==="operatorname"&&c.alwaysHandleSupSub&&(c.limits||e.style===se.DISPLAY)?o="munder":o="msub"}else{var l=r.base;l&&l.type==="op"&&l.limits&&(e.style===se.DISPLAY||l.alwaysHandleSupSub)||l&&l.type==="operatorname"&&l.alwaysHandleSupSub&&(l.limits||e.style===se.DISPLAY)?o="mover":o="msup"}return new L(o,n)}});Bt({type:"atom",htmlBuilder(r,e){return Na(r.text,r.mode,e,["m"+r.family])},mathmlBuilder(r,e){var t=new L("mo",[Ke(r.text,r.mode)]);if(r.family==="bin"){var a=Va(r,e);a==="bold-italic"&&t.setAttribute("mathvariant",a)}else r.family==="punct"?t.setAttribute("separator","true"):(r.family==="open"||r.family==="close")&&t.setAttribute("stretchy","false");return t}});var Hi={mi:"italic",mn:"normal",mtext:"normal"};Bt({type:"mathord",htmlBuilder(r,e){return zr(r,e,"mathord")},mathmlBuilder(r,e){var t=new L("mi",[Ke(r.text,r.mode,e)]),a=Va(r,e)||"italic";return a!==Hi[t.type]&&t.setAttribute("mathvariant",a),t}});Bt({type:"textord",htmlBuilder(r,e){return zr(r,e,"textord")},mathmlBuilder(r,e){var t=Ke(r.text,r.mode,e),a=Va(r,e)||"normal",i;return r.mode==="text"?i=new L("mtext",[t]):/[0-9]/.test(r.text)?i=new L("mn",[t]):r.text==="\\prime"?i=new L("mo",[t]):i=new L("mi",[t]),a!==Hi[i.type]&&i.setAttribute("mathvariant",a),i}});var ra={"\\nobreak":"nobreak","\\allowbreak":"allowbreak"},aa={" ":{},"\\ ":{},"~":{className:"nobreak"},"\\space":{},"\\nobreakspace":{className:"nobreak"}};Bt({type:"spacing",htmlBuilder(r,e){if(aa.hasOwnProperty(r.text)){var t=aa[r.text].className||"";if(r.mode==="text"){var a=zr(r,e,"textord");return a.classes.push(t),a}else return I(["mspace",t],[Na(r.text,r.mode,e)],e)}else{if(ra.hasOwnProperty(r.text))return I(["mspace",ra[r.text]],[],e);throw new B('Unknown type of space "'+r.text+'"')}},mathmlBuilder(r,e){var t;if(aa.hasOwnProperty(r.text))t=new L("mtext",[new Ae(" ")]);else{if(ra.hasOwnProperty(r.text))return new L("mspace");throw new B('Unknown type of space "'+r.text+'"')}return t}});var N0=()=>{var r=new L("mtd",[]);return r.setAttribute("width","50%"),r};Bt({type:"tag",mathmlBuilder(r,e){var t=new L("mtable",[new L("mtr",[N0(),new L("mtd",[vt(r.body,e)]),N0(),new L("mtd",[vt(r.tag,e)])])]);return t.setAttribute("width","100%"),t}});var O0={"\\text":void 0,"\\textrm":"textrm","\\textsf":"textsf","\\texttt":"texttt","\\textnormal":"textrm"},H0={"\\textbf":"textbf","\\textmd":"textmd"},ro={"\\textit":"textit","\\textup":"textup"},V0=(r,e)=>{var t=r.font;if(t){if(O0[t])return e.withTextFontFamily(O0[t]);if(H0[t])return e.withTextFontWeight(H0[t]);if(t==="\\emph")return e.fontShape==="textit"?e.withTextFontShape("textup"):e.withTextFontShape("textit")}else return e;return e.withTextFontShape(ro[t])};V({type:"text",names:["\\text","\\textrm","\\textsf","\\texttt","\\textnormal","\\textbf","\\textmd","\\textit","\\textup","\\emph"],props:{numArgs:1,argTypes:["text"],allowedInArgument:!0,allowedInText:!0},handler(r,e){var{parser:t,funcName:a}=r,i=e[0];return{type:"text",mode:t.mode,body:Ce(i),font:a}},htmlBuilder(r,e){var t=V0(r,e),a=Ie(r.body,t,!0);return I(["mord","text"],a,t)},mathmlBuilder(r,e){var t=V0(r,e);return vt(r.body,t)}});V({type:"underline",names:["\\underline"],props:{numArgs:1,allowedInText:!0},handler(r,e){var{parser:t}=r;return{type:"underline",mode:t.mode,body:e[0]}},htmlBuilder(r,e){var t=he(r.body,e),a=Nt("underline-line",e),i=e.fontMetrics().defaultRuleThickness,n=pe({positionType:"top",positionData:t.height,children:[{type:"kern",size:i},{type:"elem",elem:a},{type:"kern",size:3*i},{type:"elem",elem:t}]});return I(["mord","underline"],[n],e)},mathmlBuilder(r,e){var t=new L("mo",[new Ae("‾")]);t.setAttribute("stretchy","true");var a=new L("munder",[ge(r.body,e),t]);return a.setAttribute("accentunder","true"),a}});V({type:"vcenter",names:["\\vcenter"],props:{numArgs:1,argTypes:["original"],allowedInText:!1},handler(r,e){var{parser:t}=r;return{type:"vcenter",mode:t.mode,body:e[0]}},htmlBuilder(r,e){var t=he(r.body,e),a=e.fontMetrics().axisHeight,i=.5*(t.height-a-(t.depth+a));return pe({positionType:"shift",positionData:i,children:[{type:"elem",elem:t}]})},mathmlBuilder(r,e){var t=new L("mpadded",[ge(r.body,e)],["vcenter"]);return new L("mrow",[t])}});V({type:"verb",names:["\\verb"],props:{numArgs:0,allowedInText:!0},handler(r,e,t){throw new B("\\verb ended by end of line instead of matching delimiter")},htmlBuilder(r,e){for(var t=G0(r),a=[],i=e.havingStyle(e.style.text()),n=0;n<t.length;n++){var o=t[n];o==="~"&&(o="\\textasciitilde"),a.push(Re(o,"Typewriter-Regular",r.mode,i,["mord","texttt"]))}return I(["mord","text"].concat(i.sizingClasses(e)),ni(a),i)},mathmlBuilder(r,e){var t=new Ae(G0(r)),a=new L("mtext",[t]);return a.setAttribute("mathvariant","monospace"),a}});var G0=r=>r.body.replace(/ /g,r.star?"␣":" "),mt=di,Vi=`[ \r
	]`,ao="\\\\[a-zA-Z@]+",io="\\\\[^\uD800-\uDFFF]",no="("+ao+")"+Vi+"*",so=`\\\\(
|[ \r	]+
?)[ \r	]*`,Da="[̀-ͯ]",oo=new RegExp(Da+"+$"),lo="("+Vi+"+)|"+(so+"|")+"([!-\\[\\]-‧‪-퟿豈-￿]"+(Da+"*")+"|[\uD800-\uDBFF][\uDC00-\uDFFF]"+(Da+"*")+"|\\\\verb\\*([^]).*?\\4|\\\\verb([^*a-zA-Z]).*?\\5"+("|"+no)+("|"+io+")");class U0{constructor(e,t){this.input=void 0,this.settings=void 0,this.tokenRegex=void 0,this.catcodes=void 0,this.input=e,this.settings=t,this.tokenRegex=new RegExp(lo,"g"),this.catcodes={"%":14,"~":13}}setCatcode(e,t){this.catcodes[e]=t}lex(){var e=this.input,t=this.tokenRegex.lastIndex;if(t===e.length)return new Ve("EOF",new Ne(this,t,t));var a=this.tokenRegex.exec(e);if(a===null||a.index!==t)throw new B("Unexpected character: '"+e[t]+"'",new Ve(e[t],new Ne(this,t,t+1)));var i=a[6]||a[3]||(a[2]?"\\ ":" ");if(this.catcodes[i]===14){var n=e.indexOf(`
`,this.tokenRegex.lastIndex);return n===-1?(this.tokenRegex.lastIndex=e.length,this.settings.reportNonstrict("commentAtEnd","% comment has no terminating newline; LaTeX would fail because of commenting the end of math mode (e.g. $)")):this.tokenRegex.lastIndex=n+1,this.lex()}return new Ve(i,new Ne(this,t,this.tokenRegex.lastIndex))}}class co{constructor(e,t){e===void 0&&(e={}),t===void 0&&(t={}),this.current=void 0,this.builtins=void 0,this.undefStack=void 0,this.current=t,this.builtins=e,this.undefStack=[]}beginGroup(){this.undefStack.push({})}endGroup(){if(this.undefStack.length===0)throw new B("Unbalanced namespace destruction: attempt to pop global namespace; please report this as a bug");var e=this.undefStack.pop();for(var t in e)e.hasOwnProperty(t)&&(e[t]==null?delete this.current[t]:this.current[t]=e[t])}endGroups(){for(;this.undefStack.length>0;)this.endGroup()}has(e){return this.current.hasOwnProperty(e)||this.builtins.hasOwnProperty(e)}get(e){return this.current.hasOwnProperty(e)?this.current[e]:this.builtins[e]}set(e,t,a){if(a===void 0&&(a=!1),a){for(var i=0;i<this.undefStack.length;i++)delete this.undefStack[i][e];this.undefStack.length>0&&(this.undefStack[this.undefStack.length-1][e]=t)}else{var n=this.undefStack[this.undefStack.length-1];n&&!n.hasOwnProperty(e)&&(n[e]=this.current[e])}t==null?delete this.current[e]:this.current[e]=t}}var uo=Bi;p("\\noexpand",function(r){var e=r.popToken();return r.isExpandable(e.text)&&(e.noexpand=!0,e.treatAsRelax=!0),{tokens:[e],numArgs:0}});p("\\expandafter",function(r){var e=r.popToken();return r.expandOnce(!0),{tokens:[e],numArgs:0}});p("\\@firstoftwo",function(r){var e=r.consumeArgs(2);return{tokens:e[0],numArgs:0}});p("\\@secondoftwo",function(r){var e=r.consumeArgs(2);return{tokens:e[1],numArgs:0}});p("\\@ifnextchar",function(r){var e=r.consumeArgs(3);r.consumeSpaces();var t=r.future();return e[0].length===1&&e[0][0].text===t.text?{tokens:e[1],numArgs:0}:{tokens:e[2],numArgs:0}});p("\\@ifstar","\\@ifnextchar *{\\@firstoftwo{#1}}");p("\\TextOrMath",function(r){var e=r.consumeArgs(2);return r.mode==="text"?{tokens:e[0],numArgs:0}:{tokens:e[1],numArgs:0}});var W0={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,A:10,b:11,B:11,c:12,C:12,d:13,D:13,e:14,E:14,f:15,F:15};p("\\char",function(r){var e=r.popToken(),t,a=0;if(e.text==="'")t=8,e=r.popToken();else if(e.text==='"')t=16,e=r.popToken();else if(e.text==="`")if(e=r.popToken(),e.text[0]==="\\")a=e.text.charCodeAt(1);else{if(e.text==="EOF")throw new B("\\char` missing argument");a=e.text.charCodeAt(0)}else t=10;if(t){if(a=W0[e.text],a==null||a>=t)throw new B("Invalid base-"+t+" digit "+e.text);for(var i;(i=W0[r.future().text])!=null&&i<t;)a*=t,a+=i,r.popToken()}return"\\@char{"+a+"}"});var Ya=(r,e,t,a)=>{var i=r.consumeArg().tokens;if(i.length!==1)throw new B("\\newcommand's first argument must be a macro name");var n=i[0].text,o=r.isDefined(n);if(o&&!e)throw new B("\\newcommand{"+n+"} attempting to redefine "+(n+"; use \\renewcommand"));if(!o&&!t)throw new B("\\renewcommand{"+n+"} when command "+n+" does not yet exist; use \\newcommand");var l=0;if(i=r.consumeArg().tokens,i.length===1&&i[0].text==="["){for(var c="",m=r.expandNextToken();m.text!=="]"&&m.text!=="EOF";)c+=m.text,m=r.expandNextToken();if(!c.match(/^\s*[0-9]+\s*$/))throw new B("Invalid number of arguments: "+c);l=parseInt(c),i=r.consumeArg().tokens}return o&&a||r.macros.set(n,{tokens:i,numArgs:l}),""};p("\\newcommand",r=>Ya(r,!1,!0,!1));p("\\renewcommand",r=>Ya(r,!0,!1,!1));p("\\providecommand",r=>Ya(r,!0,!0,!0));p("\\message",r=>{var e=r.consumeArgs(1)[0];return console.log(e.reverse().map(t=>t.text).join("")),""});p("\\errmessage",r=>{var e=r.consumeArgs(1)[0];return console.error(e.reverse().map(t=>t.text).join("")),""});p("\\show",r=>{var e=r.popToken(),t=e.text;return console.log(e,r.macros.get(t),mt[t],xe.math[t],xe.text[t]),""});p("\\bgroup","{");p("\\egroup","}");p("~","\\nobreakspace");p("\\lq","`");p("\\rq","'");p("\\aa","\\r a");p("\\AA","\\r A");p("\\textcopyright","\\html@mathml{\\textcircled{c}}{\\char`©}");p("\\copyright","\\TextOrMath{\\textcopyright}{\\text{\\textcopyright}}");p("\\textregistered","\\html@mathml{\\textcircled{\\scriptsize R}}{\\char`®}");p("ℬ","\\mathscr{B}");p("ℰ","\\mathscr{E}");p("ℱ","\\mathscr{F}");p("ℋ","\\mathscr{H}");p("ℐ","\\mathscr{I}");p("ℒ","\\mathscr{L}");p("ℳ","\\mathscr{M}");p("ℛ","\\mathscr{R}");p("ℭ","\\mathfrak{C}");p("ℌ","\\mathfrak{H}");p("ℨ","\\mathfrak{Z}");p("\\Bbbk","\\Bbb{k}");p("\\llap","\\mathllap{\\textrm{#1}}");p("\\rlap","\\mathrlap{\\textrm{#1}}");p("\\clap","\\mathclap{\\textrm{#1}}");p("\\mathstrut","\\vphantom{(}");p("\\underbar","\\underline{\\text{#1}}");p("\\not",'\\html@mathml{\\mathrel{\\mathrlap\\@not}\\nobreak}{\\char"338}');p("\\neq","\\html@mathml{\\mathrel{\\not=}}{\\mathrel{\\char`≠}}");p("\\ne","\\neq");p("≠","\\neq");p("\\notin","\\html@mathml{\\mathrel{{\\in}\\mathllap{/\\mskip1mu}}}{\\mathrel{\\char`∉}}");p("∉","\\notin");p("≘","\\html@mathml{\\mathrel{=\\kern{-1em}\\raisebox{0.4em}{$\\scriptsize\\frown$}}}{\\mathrel{\\char`≘}}");p("≙","\\html@mathml{\\stackrel{\\tiny\\wedge}{=}}{\\mathrel{\\char`≘}}");p("≚","\\html@mathml{\\stackrel{\\tiny\\vee}{=}}{\\mathrel{\\char`≚}}");p("≛","\\html@mathml{\\stackrel{\\scriptsize\\star}{=}}{\\mathrel{\\char`≛}}");p("≝","\\html@mathml{\\stackrel{\\tiny\\mathrm{def}}{=}}{\\mathrel{\\char`≝}}");p("≞","\\html@mathml{\\stackrel{\\tiny\\mathrm{m}}{=}}{\\mathrel{\\char`≞}}");p("≟","\\html@mathml{\\stackrel{\\tiny?}{=}}{\\mathrel{\\char`≟}}");p("⟂","\\perp");p("‼","\\mathclose{!\\mkern-0.8mu!}");p("∌","\\notni");p("⌜","\\ulcorner");p("⌝","\\urcorner");p("⌞","\\llcorner");p("⌟","\\lrcorner");p("©","\\copyright");p("®","\\textregistered");p("\\ulcorner",'\\html@mathml{\\@ulcorner}{\\mathop{\\char"231c}}');p("\\urcorner",'\\html@mathml{\\@urcorner}{\\mathop{\\char"231d}}');p("\\llcorner",'\\html@mathml{\\@llcorner}{\\mathop{\\char"231e}}');p("\\lrcorner",'\\html@mathml{\\@lrcorner}{\\mathop{\\char"231f}}');p("\\vdots","{\\varvdots\\rule{0pt}{15pt}}");p("⋮","\\vdots");p("\\varGamma","\\mathit{\\Gamma}");p("\\varDelta","\\mathit{\\Delta}");p("\\varTheta","\\mathit{\\Theta}");p("\\varLambda","\\mathit{\\Lambda}");p("\\varXi","\\mathit{\\Xi}");p("\\varPi","\\mathit{\\Pi}");p("\\varSigma","\\mathit{\\Sigma}");p("\\varUpsilon","\\mathit{\\Upsilon}");p("\\varPhi","\\mathit{\\Phi}");p("\\varPsi","\\mathit{\\Psi}");p("\\varOmega","\\mathit{\\Omega}");p("\\substack","\\begin{subarray}{c}#1\\end{subarray}");p("\\colon","\\nobreak\\mskip2mu\\mathpunct{}\\mathchoice{\\mkern-3mu}{\\mkern-3mu}{}{}{:}\\mskip6mu\\relax");p("\\boxed","\\fbox{$\\displaystyle{#1}$}");p("\\iff","\\DOTSB\\;\\Longleftrightarrow\\;");p("\\implies","\\DOTSB\\;\\Longrightarrow\\;");p("\\impliedby","\\DOTSB\\;\\Longleftarrow\\;");p("\\dddot","{\\overset{\\raisebox{-0.1ex}{\\normalsize ...}}{#1}}");p("\\ddddot","{\\overset{\\raisebox{-0.1ex}{\\normalsize ....}}{#1}}");var X0={",":"\\dotsc","\\not":"\\dotsb","+":"\\dotsb","=":"\\dotsb","<":"\\dotsb",">":"\\dotsb","-":"\\dotsb","*":"\\dotsb",":":"\\dotsb","\\DOTSB":"\\dotsb","\\coprod":"\\dotsb","\\bigvee":"\\dotsb","\\bigwedge":"\\dotsb","\\biguplus":"\\dotsb","\\bigcap":"\\dotsb","\\bigcup":"\\dotsb","\\prod":"\\dotsb","\\sum":"\\dotsb","\\bigotimes":"\\dotsb","\\bigoplus":"\\dotsb","\\bigodot":"\\dotsb","\\bigsqcup":"\\dotsb","\\And":"\\dotsb","\\longrightarrow":"\\dotsb","\\Longrightarrow":"\\dotsb","\\longleftarrow":"\\dotsb","\\Longleftarrow":"\\dotsb","\\longleftrightarrow":"\\dotsb","\\Longleftrightarrow":"\\dotsb","\\mapsto":"\\dotsb","\\longmapsto":"\\dotsb","\\hookrightarrow":"\\dotsb","\\doteq":"\\dotsb","\\mathbin":"\\dotsb","\\mathrel":"\\dotsb","\\relbar":"\\dotsb","\\Relbar":"\\dotsb","\\xrightarrow":"\\dotsb","\\xleftarrow":"\\dotsb","\\DOTSI":"\\dotsi","\\int":"\\dotsi","\\oint":"\\dotsi","\\iint":"\\dotsi","\\iiint":"\\dotsi","\\iiiint":"\\dotsi","\\idotsint":"\\dotsi","\\DOTSX":"\\dotsx"},mo=new Set(["bin","rel"]);p("\\dots",function(r){var e="\\dotso",t=r.expandAfterFuture().text;return t in X0?e=X0[t]:(t.slice(0,4)==="\\not"||t in xe.math&&mo.has(xe.math[t].group))&&(e="\\dotsb"),e});var Ka={")":!0,"]":!0,"\\rbrack":!0,"\\}":!0,"\\rbrace":!0,"\\rangle":!0,"\\rceil":!0,"\\rfloor":!0,"\\rgroup":!0,"\\rmoustache":!0,"\\right":!0,"\\bigr":!0,"\\biggr":!0,"\\Bigr":!0,"\\Biggr":!0,$:!0,";":!0,".":!0,",":!0};p("\\dotso",function(r){var e=r.future().text;return e in Ka?"\\ldots\\,":"\\ldots"});p("\\dotsc",function(r){var e=r.future().text;return e in Ka&&e!==","?"\\ldots\\,":"\\ldots"});p("\\cdots",function(r){var e=r.future().text;return e in Ka?"\\@cdots\\,":"\\@cdots"});p("\\dotsb","\\cdots");p("\\dotsm","\\cdots");p("\\dotsi","\\!\\cdots");p("\\dotsx","\\ldots\\,");p("\\DOTSI","\\relax");p("\\DOTSB","\\relax");p("\\DOTSX","\\relax");p("\\tmspace","\\TextOrMath{\\kern#1#3}{\\mskip#1#2}\\relax");p("\\,","\\tmspace+{3mu}{.1667em}");p("\\thinspace","\\,");p("\\>","\\mskip{4mu}");p("\\:","\\tmspace+{4mu}{.2222em}");p("\\medspace","\\:");p("\\;","\\tmspace+{5mu}{.2777em}");p("\\thickspace","\\;");p("\\!","\\tmspace-{3mu}{.1667em}");p("\\negthinspace","\\!");p("\\negmedspace","\\tmspace-{4mu}{.2222em}");p("\\negthickspace","\\tmspace-{5mu}{.277em}");p("\\enspace","\\kern.5em ");p("\\enskip","\\hskip.5em\\relax");p("\\quad","\\hskip1em\\relax");p("\\qquad","\\hskip2em\\relax");p("\\tag","\\@ifstar\\tag@literal\\tag@paren");p("\\tag@paren","\\tag@literal{({#1})}");p("\\tag@literal",r=>{if(r.macros.get("\\df@tag"))throw new B("Multiple \\tag");return"\\gdef\\df@tag{\\text{#1}}"});p("\\bmod","\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}\\mathbin{\\rm mod}\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}");p("\\pod","\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern8mu}{\\mkern8mu}{\\mkern8mu}(#1)");p("\\pmod","\\pod{{\\rm mod}\\mkern6mu#1}");p("\\mod","\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern12mu}{\\mkern12mu}{\\mkern12mu}{\\rm mod}\\,\\,#1");p("\\newline","\\\\\\relax");p("\\TeX","\\textrm{\\html@mathml{T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX}{TeX}}");var Gi=q(Qe["Main-Regular"][84][1]-.7*Qe["Main-Regular"][65][1]);p("\\LaTeX","\\textrm{\\html@mathml{"+("L\\kern-.36em\\raisebox{"+Gi+"}{\\scriptstyle A}")+"\\kern-.15em\\TeX}{LaTeX}}");p("\\KaTeX","\\textrm{\\html@mathml{"+("K\\kern-.17em\\raisebox{"+Gi+"}{\\scriptstyle A}")+"\\kern-.15em\\TeX}{KaTeX}}");p("\\hspace","\\@ifstar\\@hspacer\\@hspace");p("\\@hspace","\\hskip #1\\relax");p("\\@hspacer","\\rule{0pt}{0pt}\\hskip #1\\relax");p("\\ordinarycolon",":");p("\\vcentcolon","\\mathrel{\\mathop\\ordinarycolon}");p("\\dblcolon",'\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon}}{\\mathop{\\char"2237}}');p("\\coloneqq",'\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char"2254}}');p("\\Coloneqq",'\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char"2237\\char"3d}}');p("\\coloneq",'\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char"3a\\char"2212}}');p("\\Coloneq",'\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char"2237\\char"2212}}');p("\\eqqcolon",'\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char"2255}}');p("\\Eqqcolon",'\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char"3d\\char"2237}}');p("\\eqcolon",'\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char"2239}}');p("\\Eqcolon",'\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char"2212\\char"2237}}');p("\\colonapprox",'\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char"3a\\char"2248}}');p("\\Colonapprox",'\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char"2237\\char"2248}}');p("\\colonsim",'\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char"3a\\char"223c}}');p("\\Colonsim",'\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char"2237\\char"223c}}');p("∷","\\dblcolon");p("∹","\\eqcolon");p("≔","\\coloneqq");p("≕","\\eqqcolon");p("⩴","\\Coloneqq");p("\\ratio","\\vcentcolon");p("\\coloncolon","\\dblcolon");p("\\colonequals","\\coloneqq");p("\\coloncolonequals","\\Coloneqq");p("\\equalscolon","\\eqqcolon");p("\\equalscoloncolon","\\Eqqcolon");p("\\colonminus","\\coloneq");p("\\coloncolonminus","\\Coloneq");p("\\minuscolon","\\eqcolon");p("\\minuscoloncolon","\\Eqcolon");p("\\coloncolonapprox","\\Colonapprox");p("\\coloncolonsim","\\Colonsim");p("\\simcolon","\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon}");p("\\simcoloncolon","\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon}");p("\\approxcolon","\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon}");p("\\approxcoloncolon","\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon}");p("\\notni","\\html@mathml{\\not\\ni}{\\mathrel{\\char`∌}}");p("\\limsup","\\DOTSB\\operatorname*{lim\\,sup}");p("\\liminf","\\DOTSB\\operatorname*{lim\\,inf}");p("\\injlim","\\DOTSB\\operatorname*{inj\\,lim}");p("\\projlim","\\DOTSB\\operatorname*{proj\\,lim}");p("\\varlimsup","\\DOTSB\\operatorname*{\\overline{lim}}");p("\\varliminf","\\DOTSB\\operatorname*{\\underline{lim}}");p("\\varinjlim","\\DOTSB\\operatorname*{\\underrightarrow{lim}}");p("\\varprojlim","\\DOTSB\\operatorname*{\\underleftarrow{lim}}");p("\\gvertneqq","\\html@mathml{\\@gvertneqq}{≩}");p("\\lvertneqq","\\html@mathml{\\@lvertneqq}{≨}");p("\\ngeqq","\\html@mathml{\\@ngeqq}{≱}");p("\\ngeqslant","\\html@mathml{\\@ngeqslant}{≱}");p("\\nleqq","\\html@mathml{\\@nleqq}{≰}");p("\\nleqslant","\\html@mathml{\\@nleqslant}{≰}");p("\\nshortmid","\\html@mathml{\\@nshortmid}{∤}");p("\\nshortparallel","\\html@mathml{\\@nshortparallel}{∦}");p("\\nsubseteqq","\\html@mathml{\\@nsubseteqq}{⊈}");p("\\nsupseteqq","\\html@mathml{\\@nsupseteqq}{⊉}");p("\\varsubsetneq","\\html@mathml{\\@varsubsetneq}{⊊}");p("\\varsubsetneqq","\\html@mathml{\\@varsubsetneqq}{⫋}");p("\\varsupsetneq","\\html@mathml{\\@varsupsetneq}{⊋}");p("\\varsupsetneqq","\\html@mathml{\\@varsupsetneqq}{⫌}");p("\\imath","\\html@mathml{\\@imath}{ı}");p("\\jmath","\\html@mathml{\\@jmath}{ȷ}");p("\\llbracket","\\html@mathml{\\mathopen{[\\mkern-3.2mu[}}{\\mathopen{\\char`⟦}}");p("\\rrbracket","\\html@mathml{\\mathclose{]\\mkern-3.2mu]}}{\\mathclose{\\char`⟧}}");p("⟦","\\llbracket");p("⟧","\\rrbracket");p("\\lBrace","\\html@mathml{\\mathopen{\\{\\mkern-3.2mu[}}{\\mathopen{\\char`⦃}}");p("\\rBrace","\\html@mathml{\\mathclose{]\\mkern-3.2mu\\}}}{\\mathclose{\\char`⦄}}");p("⦃","\\lBrace");p("⦄","\\rBrace");p("\\minuso","\\mathbin{\\html@mathml{{\\mathrlap{\\mathchoice{\\kern{0.145em}}{\\kern{0.145em}}{\\kern{0.1015em}}{\\kern{0.0725em}}\\circ}{-}}}{\\char`⦵}}");p("⦵","\\minuso");p("\\darr","\\downarrow");p("\\dArr","\\Downarrow");p("\\Darr","\\Downarrow");p("\\lang","\\langle");p("\\rang","\\rangle");p("\\uarr","\\uparrow");p("\\uArr","\\Uparrow");p("\\Uarr","\\Uparrow");p("\\N","\\mathbb{N}");p("\\R","\\mathbb{R}");p("\\Z","\\mathbb{Z}");p("\\alef","\\aleph");p("\\alefsym","\\aleph");p("\\Alpha","\\mathrm{A}");p("\\Beta","\\mathrm{B}");p("\\bull","\\bullet");p("\\Chi","\\mathrm{X}");p("\\clubs","\\clubsuit");p("\\cnums","\\mathbb{C}");p("\\Complex","\\mathbb{C}");p("\\Dagger","\\ddagger");p("\\diamonds","\\diamondsuit");p("\\empty","\\emptyset");p("\\Epsilon","\\mathrm{E}");p("\\Eta","\\mathrm{H}");p("\\exist","\\exists");p("\\harr","\\leftrightarrow");p("\\hArr","\\Leftrightarrow");p("\\Harr","\\Leftrightarrow");p("\\hearts","\\heartsuit");p("\\image","\\Im");p("\\infin","\\infty");p("\\Iota","\\mathrm{I}");p("\\isin","\\in");p("\\Kappa","\\mathrm{K}");p("\\larr","\\leftarrow");p("\\lArr","\\Leftarrow");p("\\Larr","\\Leftarrow");p("\\lrarr","\\leftrightarrow");p("\\lrArr","\\Leftrightarrow");p("\\Lrarr","\\Leftrightarrow");p("\\Mu","\\mathrm{M}");p("\\natnums","\\mathbb{N}");p("\\Nu","\\mathrm{N}");p("\\Omicron","\\mathrm{O}");p("\\plusmn","\\pm");p("\\rarr","\\rightarrow");p("\\rArr","\\Rightarrow");p("\\Rarr","\\Rightarrow");p("\\real","\\Re");p("\\reals","\\mathbb{R}");p("\\Reals","\\mathbb{R}");p("\\Rho","\\mathrm{P}");p("\\sdot","\\cdot");p("\\sect","\\S");p("\\spades","\\spadesuit");p("\\sub","\\subset");p("\\sube","\\subseteq");p("\\supe","\\supseteq");p("\\Tau","\\mathrm{T}");p("\\thetasym","\\vartheta");p("\\weierp","\\wp");p("\\Zeta","\\mathrm{Z}");p("\\argmin","\\DOTSB\\operatorname*{arg\\,min}");p("\\argmax","\\DOTSB\\operatorname*{arg\\,max}");p("\\plim","\\DOTSB\\mathop{\\operatorname{plim}}\\limits");p("\\bra","\\mathinner{\\langle{#1}|}");p("\\ket","\\mathinner{|{#1}\\rangle}");p("\\braket","\\mathinner{\\langle{#1}\\rangle}");p("\\Bra","\\left\\langle#1\\right|");p("\\Ket","\\left|#1\\right\\rangle");var Ui=r=>e=>{var t=e.consumeArg().tokens,a=e.consumeArg().tokens,i=e.consumeArg().tokens,n=e.consumeArg().tokens,o=e.macros.get("|"),l=e.macros.get("\\|");e.macros.beginGroup();var c=f=>y=>{r&&(y.macros.set("|",o),i.length&&y.macros.set("\\|",l));var g=f;if(!f&&i.length){var C=y.future();C.text==="|"&&(y.popToken(),g=!0)}return{tokens:g?i:a,numArgs:0}};e.macros.set("|",c(!1)),i.length&&e.macros.set("\\|",c(!0));var m=e.consumeArg().tokens,h=e.expandTokens([...n,...m,...t]);return e.macros.endGroup(),{tokens:h.reverse(),numArgs:0}};p("\\bra@ket",Ui(!1));p("\\bra@set",Ui(!0));p("\\Braket","\\bra@ket{\\left\\langle}{\\,\\middle\\vert\\,}{\\,\\middle\\vert\\,}{\\right\\rangle}");p("\\Set","\\bra@set{\\left\\{\\:}{\\;\\middle\\vert\\;}{\\;\\middle\\Vert\\;}{\\:\\right\\}}");p("\\set","\\bra@set{\\{\\,}{\\mid}{}{\\,\\}}");p("\\angln","{\\angl n}");p("\\blue","\\textcolor{##6495ed}{#1}");p("\\orange","\\textcolor{##ffa500}{#1}");p("\\pink","\\textcolor{##ff00af}{#1}");p("\\red","\\textcolor{##df0030}{#1}");p("\\green","\\textcolor{##28ae7b}{#1}");p("\\gray","\\textcolor{gray}{#1}");p("\\purple","\\textcolor{##9d38bd}{#1}");p("\\blueA","\\textcolor{##ccfaff}{#1}");p("\\blueB","\\textcolor{##80f6ff}{#1}");p("\\blueC","\\textcolor{##63d9ea}{#1}");p("\\blueD","\\textcolor{##11accd}{#1}");p("\\blueE","\\textcolor{##0c7f99}{#1}");p("\\tealA","\\textcolor{##94fff5}{#1}");p("\\tealB","\\textcolor{##26edd5}{#1}");p("\\tealC","\\textcolor{##01d1c1}{#1}");p("\\tealD","\\textcolor{##01a995}{#1}");p("\\tealE","\\textcolor{##208170}{#1}");p("\\greenA","\\textcolor{##b6ffb0}{#1}");p("\\greenB","\\textcolor{##8af281}{#1}");p("\\greenC","\\textcolor{##74cf70}{#1}");p("\\greenD","\\textcolor{##1fab54}{#1}");p("\\greenE","\\textcolor{##0d923f}{#1}");p("\\goldA","\\textcolor{##ffd0a9}{#1}");p("\\goldB","\\textcolor{##ffbb71}{#1}");p("\\goldC","\\textcolor{##ff9c39}{#1}");p("\\goldD","\\textcolor{##e07d10}{#1}");p("\\goldE","\\textcolor{##a75a05}{#1}");p("\\redA","\\textcolor{##fca9a9}{#1}");p("\\redB","\\textcolor{##ff8482}{#1}");p("\\redC","\\textcolor{##f9685d}{#1}");p("\\redD","\\textcolor{##e84d39}{#1}");p("\\redE","\\textcolor{##bc2612}{#1}");p("\\maroonA","\\textcolor{##ffbde0}{#1}");p("\\maroonB","\\textcolor{##ff92c6}{#1}");p("\\maroonC","\\textcolor{##ed5fa6}{#1}");p("\\maroonD","\\textcolor{##ca337c}{#1}");p("\\maroonE","\\textcolor{##9e034e}{#1}");p("\\purpleA","\\textcolor{##ddd7ff}{#1}");p("\\purpleB","\\textcolor{##c6b9fc}{#1}");p("\\purpleC","\\textcolor{##aa87ff}{#1}");p("\\purpleD","\\textcolor{##7854ab}{#1}");p("\\purpleE","\\textcolor{##543b78}{#1}");p("\\mintA","\\textcolor{##f5f9e8}{#1}");p("\\mintB","\\textcolor{##edf2df}{#1}");p("\\mintC","\\textcolor{##e0e5cc}{#1}");p("\\grayA","\\textcolor{##f6f7f7}{#1}");p("\\grayB","\\textcolor{##f0f1f2}{#1}");p("\\grayC","\\textcolor{##e3e5e6}{#1}");p("\\grayD","\\textcolor{##d6d8da}{#1}");p("\\grayE","\\textcolor{##babec2}{#1}");p("\\grayF","\\textcolor{##888d93}{#1}");p("\\grayG","\\textcolor{##626569}{#1}");p("\\grayH","\\textcolor{##3b3e40}{#1}");p("\\grayI","\\textcolor{##21242c}{#1}");p("\\kaBlue","\\textcolor{##314453}{#1}");p("\\kaGreen","\\textcolor{##71B307}{#1}");var Wi={"^":!0,_:!0,"\\limits":!0,"\\nolimits":!0};class po{constructor(e,t,a){this.settings=void 0,this.expansionCount=void 0,this.lexer=void 0,this.macros=void 0,this.stack=void 0,this.mode=void 0,this.settings=t,this.expansionCount=0,this.feed(e),this.macros=new co(uo,t.macros),this.mode=a,this.stack=[]}feed(e){this.lexer=new U0(e,this.settings)}switchMode(e){this.mode=e}beginGroup(){this.macros.beginGroup()}endGroup(){this.macros.endGroup()}endGroups(){this.macros.endGroups()}future(){return this.stack.length===0&&this.pushToken(this.lexer.lex()),this.stack[this.stack.length-1]}popToken(){return this.future(),this.stack.pop()}pushToken(e){this.stack.push(e)}pushTokens(e){this.stack.push(...e)}scanArgument(e){var t,a,i;if(e){if(this.consumeSpaces(),this.future().text!=="[")return null;t=this.popToken(),{tokens:i,end:a}=this.consumeArg(["]"])}else({tokens:i,start:t,end:a}=this.consumeArg());return this.pushToken(new Ve("EOF",a.loc)),this.pushTokens(i),new Ve("",Ne.range(t,a))}consumeSpaces(){for(;;){var e=this.future();if(e.text===" ")this.stack.pop();else break}}consumeArg(e){var t=[],a=e&&e.length>0;a||this.consumeSpaces();var i=this.future(),n,o=0,l=0;do{if(n=this.popToken(),t.push(n),n.text==="{")++o;else if(n.text==="}"){if(--o,o===-1)throw new B("Extra }",n)}else if(n.text==="EOF")throw new B("Unexpected end of input in a macro argument, expected '"+(e&&a?e[l]:"}")+"'",n);if(e&&a)if((o===0||o===1&&e[l]==="{")&&n.text===e[l]){if(++l,l===e.length){t.splice(-l,l);break}}else l=0}while(o!==0||a);return i.text==="{"&&t[t.length-1].text==="}"&&(t.pop(),t.shift()),t.reverse(),{tokens:t,start:i,end:n}}consumeArgs(e,t){if(t){if(t.length!==e+1)throw new B("The length of delimiters doesn't match the number of args!");for(var a=t[0],i=0;i<a.length;i++){var n=this.popToken();if(a[i]!==n.text)throw new B("Use of the macro doesn't match its definition",n)}}for(var o=[],l=0;l<e;l++)o.push(this.consumeArg(t&&t[l+1]).tokens);return o}countExpansion(e){if(this.expansionCount+=e,this.expansionCount>this.settings.maxExpand)throw new B("Too many expansions: infinite loop or need to increase maxExpand setting")}expandOnce(e){var t=this.popToken(),a=t.text,i=t.noexpand?null:this._getExpansion(a);if(i==null||e&&i.unexpandable){if(e&&i==null&&a[0]==="\\"&&!this.isDefined(a))throw new B("Undefined control sequence: "+a);return this.pushToken(t),!1}this.countExpansion(1);var n=i.tokens,o=this.consumeArgs(i.numArgs,i.delimiters);if(i.numArgs){n=n.slice();for(var l=n.length-1;l>=0;--l){var c=n[l];if(c.text==="#"){if(l===0)throw new B("Incomplete placeholder at end of macro body",c);if(c=n[--l],c.text==="#")n.splice(l+1,1);else if(/^[1-9]$/.test(c.text))n.splice(l,2,...o[+c.text-1]);else throw new B("Not a valid argument number",c)}}}return this.pushTokens(n),n.length}expandAfterFuture(){return this.expandOnce(),this.future()}expandNextToken(){for(;;)if(this.expandOnce()===!1){var e=this.stack.pop();return e.treatAsRelax&&(e.text="\\relax"),e}}expandMacro(e){return this.macros.has(e)?this.expandTokens([new Ve(e)]):void 0}expandTokens(e){var t=[],a=this.stack.length;for(this.pushTokens(e);this.stack.length>a;)if(this.expandOnce(!0)===!1){var i=this.stack.pop();i.treatAsRelax&&(i.noexpand=!1,i.treatAsRelax=!1),t.push(i)}return this.countExpansion(t.length),t}expandMacroAsText(e){var t=this.expandMacro(e);return t&&t.map(a=>a.text).join("")}_getExpansion(e){var t=this.macros.get(e);if(t==null)return t;if(e.length===1){var a=this.lexer.catcodes[e];if(a!=null&&a!==13)return}var i=typeof t=="function"?t(this):t;if(typeof i=="string"){var n=0;if(i.includes("#"))for(var o=i.replace(/##/g,"");o.includes("#"+(n+1));)++n;for(var l=new U0(i,this.settings),c=[],m=l.lex();m.text!=="EOF";)c.push(m),m=l.lex();c.reverse();var h={tokens:c,numArgs:n};return h}return i}isDefined(e){return this.macros.has(e)||mt.hasOwnProperty(e)||xe.math.hasOwnProperty(e)||xe.text.hasOwnProperty(e)||Wi.hasOwnProperty(e)}isExpandable(e){var t=this.macros.get(e);return t!=null?typeof t=="string"||typeof t=="function"||!t.unexpandable:mt.hasOwnProperty(e)&&!mt[e].primitive}}var Y0=/^[₊₋₌₍₎₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓᵦᵧᵨᵩᵪ]/,pr=Object.freeze({"₊":"+","₋":"-","₌":"=","₍":"(","₎":")","₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","ₐ":"a","ₑ":"e","ₕ":"h","ᵢ":"i","ⱼ":"j","ₖ":"k","ₗ":"l","ₘ":"m","ₙ":"n","ₒ":"o","ₚ":"p","ᵣ":"r","ₛ":"s","ₜ":"t","ᵤ":"u","ᵥ":"v","ₓ":"x","ᵦ":"β","ᵧ":"γ","ᵨ":"ρ","ᵩ":"ϕ","ᵪ":"χ","⁺":"+","⁻":"-","⁼":"=","⁽":"(","⁾":")","⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","ᴬ":"A","ᴮ":"B","ᴰ":"D","ᴱ":"E","ᴳ":"G","ᴴ":"H","ᴵ":"I","ᴶ":"J","ᴷ":"K","ᴸ":"L","ᴹ":"M","ᴺ":"N","ᴼ":"O","ᴾ":"P","ᴿ":"R","ᵀ":"T","ᵁ":"U","ⱽ":"V","ᵂ":"W","ᵃ":"a","ᵇ":"b","ᶜ":"c","ᵈ":"d","ᵉ":"e","ᶠ":"f","ᵍ":"g",ʰ:"h","ⁱ":"i",ʲ:"j","ᵏ":"k",ˡ:"l","ᵐ":"m",ⁿ:"n","ᵒ":"o","ᵖ":"p",ʳ:"r",ˢ:"s","ᵗ":"t","ᵘ":"u","ᵛ":"v",ʷ:"w",ˣ:"x",ʸ:"y","ᶻ":"z","ᵝ":"β","ᵞ":"γ","ᵟ":"δ","ᵠ":"ϕ","ᵡ":"χ","ᶿ":"θ"}),ia={"́":{text:"\\'",math:"\\acute"},"̀":{text:"\\`",math:"\\grave"},"̈":{text:'\\"',math:"\\ddot"},"̃":{text:"\\~",math:"\\tilde"},"̄":{text:"\\=",math:"\\bar"},"̆":{text:"\\u",math:"\\breve"},"̌":{text:"\\v",math:"\\check"},"̂":{text:"\\^",math:"\\hat"},"̇":{text:"\\.",math:"\\dot"},"̊":{text:"\\r",math:"\\mathring"},"̋":{text:"\\H"},"̧":{text:"\\c"}},K0={á:"á",à:"à",ä:"ä",ǟ:"ǟ",ã:"ã",ā:"ā",ă:"ă",ắ:"ắ",ằ:"ằ",ẵ:"ẵ",ǎ:"ǎ",â:"â",ấ:"ấ",ầ:"ầ",ẫ:"ẫ",ȧ:"ȧ",ǡ:"ǡ",å:"å",ǻ:"ǻ",ḃ:"ḃ",ć:"ć",ḉ:"ḉ",č:"č",ĉ:"ĉ",ċ:"ċ",ç:"ç",ď:"ď",ḋ:"ḋ",ḑ:"ḑ",é:"é",è:"è",ë:"ë",ẽ:"ẽ",ē:"ē",ḗ:"ḗ",ḕ:"ḕ",ĕ:"ĕ",ḝ:"ḝ",ě:"ě",ê:"ê",ế:"ế",ề:"ề",ễ:"ễ",ė:"ė",ȩ:"ȩ",ḟ:"ḟ",ǵ:"ǵ",ḡ:"ḡ",ğ:"ğ",ǧ:"ǧ",ĝ:"ĝ",ġ:"ġ",ģ:"ģ",ḧ:"ḧ",ȟ:"ȟ",ĥ:"ĥ",ḣ:"ḣ",ḩ:"ḩ",í:"í",ì:"ì",ï:"ï",ḯ:"ḯ",ĩ:"ĩ",ī:"ī",ĭ:"ĭ",ǐ:"ǐ",î:"î",ǰ:"ǰ",ĵ:"ĵ",ḱ:"ḱ",ǩ:"ǩ",ķ:"ķ",ĺ:"ĺ",ľ:"ľ",ļ:"ļ",ḿ:"ḿ",ṁ:"ṁ",ń:"ń",ǹ:"ǹ",ñ:"ñ",ň:"ň",ṅ:"ṅ",ņ:"ņ",ó:"ó",ò:"ò",ö:"ö",ȫ:"ȫ",õ:"õ",ṍ:"ṍ",ṏ:"ṏ",ȭ:"ȭ",ō:"ō",ṓ:"ṓ",ṑ:"ṑ",ŏ:"ŏ",ǒ:"ǒ",ô:"ô",ố:"ố",ồ:"ồ",ỗ:"ỗ",ȯ:"ȯ",ȱ:"ȱ",ő:"ő",ṕ:"ṕ",ṗ:"ṗ",ŕ:"ŕ",ř:"ř",ṙ:"ṙ",ŗ:"ŗ",ś:"ś",ṥ:"ṥ",š:"š",ṧ:"ṧ",ŝ:"ŝ",ṡ:"ṡ",ş:"ş",ẗ:"ẗ",ť:"ť",ṫ:"ṫ",ţ:"ţ",ú:"ú",ù:"ù",ü:"ü",ǘ:"ǘ",ǜ:"ǜ",ǖ:"ǖ",ǚ:"ǚ",ũ:"ũ",ṹ:"ṹ",ū:"ū",ṻ:"ṻ",ŭ:"ŭ",ǔ:"ǔ",û:"û",ů:"ů",ű:"ű",ṽ:"ṽ",ẃ:"ẃ",ẁ:"ẁ",ẅ:"ẅ",ŵ:"ŵ",ẇ:"ẇ",ẘ:"ẘ",ẍ:"ẍ",ẋ:"ẋ",ý:"ý",ỳ:"ỳ",ÿ:"ÿ",ỹ:"ỹ",ȳ:"ȳ",ŷ:"ŷ",ẏ:"ẏ",ẙ:"ẙ",ź:"ź",ž:"ž",ẑ:"ẑ",ż:"ż",Á:"Á",À:"À",Ä:"Ä",Ǟ:"Ǟ",Ã:"Ã",Ā:"Ā",Ă:"Ă",Ắ:"Ắ",Ằ:"Ằ",Ẵ:"Ẵ",Ǎ:"Ǎ",Â:"Â",Ấ:"Ấ",Ầ:"Ầ",Ẫ:"Ẫ",Ȧ:"Ȧ",Ǡ:"Ǡ",Å:"Å",Ǻ:"Ǻ",Ḃ:"Ḃ",Ć:"Ć",Ḉ:"Ḉ",Č:"Č",Ĉ:"Ĉ",Ċ:"Ċ",Ç:"Ç",Ď:"Ď",Ḋ:"Ḋ",Ḑ:"Ḑ",É:"É",È:"È",Ë:"Ë",Ẽ:"Ẽ",Ē:"Ē",Ḗ:"Ḗ",Ḕ:"Ḕ",Ĕ:"Ĕ",Ḝ:"Ḝ",Ě:"Ě",Ê:"Ê",Ế:"Ế",Ề:"Ề",Ễ:"Ễ",Ė:"Ė",Ȩ:"Ȩ",Ḟ:"Ḟ",Ǵ:"Ǵ",Ḡ:"Ḡ",Ğ:"Ğ",Ǧ:"Ǧ",Ĝ:"Ĝ",Ġ:"Ġ",Ģ:"Ģ",Ḧ:"Ḧ",Ȟ:"Ȟ",Ĥ:"Ĥ",Ḣ:"Ḣ",Ḩ:"Ḩ",Í:"Í",Ì:"Ì",Ï:"Ï",Ḯ:"Ḯ",Ĩ:"Ĩ",Ī:"Ī",Ĭ:"Ĭ",Ǐ:"Ǐ",Î:"Î",İ:"İ",Ĵ:"Ĵ",Ḱ:"Ḱ",Ǩ:"Ǩ",Ķ:"Ķ",Ĺ:"Ĺ",Ľ:"Ľ",Ļ:"Ļ",Ḿ:"Ḿ",Ṁ:"Ṁ",Ń:"Ń",Ǹ:"Ǹ",Ñ:"Ñ",Ň:"Ň",Ṅ:"Ṅ",Ņ:"Ņ",Ó:"Ó",Ò:"Ò",Ö:"Ö",Ȫ:"Ȫ",Õ:"Õ",Ṍ:"Ṍ",Ṏ:"Ṏ",Ȭ:"Ȭ",Ō:"Ō",Ṓ:"Ṓ",Ṑ:"Ṑ",Ŏ:"Ŏ",Ǒ:"Ǒ",Ô:"Ô",Ố:"Ố",Ồ:"Ồ",Ỗ:"Ỗ",Ȯ:"Ȯ",Ȱ:"Ȱ",Ő:"Ő",Ṕ:"Ṕ",Ṗ:"Ṗ",Ŕ:"Ŕ",Ř:"Ř",Ṙ:"Ṙ",Ŗ:"Ŗ",Ś:"Ś",Ṥ:"Ṥ",Š:"Š",Ṧ:"Ṧ",Ŝ:"Ŝ",Ṡ:"Ṡ",Ş:"Ş",Ť:"Ť",Ṫ:"Ṫ",Ţ:"Ţ",Ú:"Ú",Ù:"Ù",Ü:"Ü",Ǘ:"Ǘ",Ǜ:"Ǜ",Ǖ:"Ǖ",Ǚ:"Ǚ",Ũ:"Ũ",Ṹ:"Ṹ",Ū:"Ū",Ṻ:"Ṻ",Ŭ:"Ŭ",Ǔ:"Ǔ",Û:"Û",Ů:"Ů",Ű:"Ű",Ṽ:"Ṽ",Ẃ:"Ẃ",Ẁ:"Ẁ",Ẅ:"Ẅ",Ŵ:"Ŵ",Ẇ:"Ẇ",Ẍ:"Ẍ",Ẋ:"Ẋ",Ý:"Ý",Ỳ:"Ỳ",Ÿ:"Ÿ",Ỹ:"Ỹ",Ȳ:"Ȳ",Ŷ:"Ŷ",Ẏ:"Ẏ",Ź:"Ź",Ž:"Ž",Ẑ:"Ẑ",Ż:"Ż",ά:"ά",ὰ:"ὰ",ᾱ:"ᾱ",ᾰ:"ᾰ",έ:"έ",ὲ:"ὲ",ή:"ή",ὴ:"ὴ",ί:"ί",ὶ:"ὶ",ϊ:"ϊ",ΐ:"ΐ",ῒ:"ῒ",ῑ:"ῑ",ῐ:"ῐ",ό:"ό",ὸ:"ὸ",ύ:"ύ",ὺ:"ὺ",ϋ:"ϋ",ΰ:"ΰ",ῢ:"ῢ",ῡ:"ῡ",ῠ:"ῠ",ώ:"ώ",ὼ:"ὼ",Ύ:"Ύ",Ὺ:"Ὺ",Ϋ:"Ϋ",Ῡ:"Ῡ",Ῠ:"Ῠ",Ώ:"Ώ",Ὼ:"Ὼ"};class $r{constructor(e,t){this.mode=void 0,this.gullet=void 0,this.settings=void 0,this.leftrightDepth=void 0,this.nextToken=void 0,this.mode="math",this.gullet=new po(e,t,this.mode),this.settings=t,this.leftrightDepth=0,this.nextToken=null}expect(e,t){if(t===void 0&&(t=!0),this.fetch().text!==e)throw new B("Expected '"+e+"', got '"+this.fetch().text+"'",this.fetch());t&&this.consume()}consume(){this.nextToken=null}fetch(){return this.nextToken==null&&(this.nextToken=this.gullet.expandNextToken()),this.nextToken}switchMode(e){this.mode=e,this.gullet.switchMode(e)}parse(){this.settings.globalGroup||this.gullet.beginGroup(),this.settings.colorIsTextColor&&this.gullet.macros.set("\\color","\\textcolor");try{var e=this.parseExpression(!1);return this.expect("EOF"),this.settings.globalGroup||this.gullet.endGroup(),e}finally{this.gullet.endGroups()}}subparse(e){var t=this.nextToken;this.consume(),this.gullet.pushToken(new Ve("}")),this.gullet.pushTokens(e);var a=this.parseExpression(!1);return this.expect("}"),this.nextToken=t,a}parseExpression(e,t){for(var a=[];;){this.mode==="math"&&this.consumeSpaces();var i=this.fetch();if($r.endOfExpression.has(i.text)||t&&i.text===t||e&&mt[i.text]&&mt[i.text].infix)break;var n=this.parseAtom(t);if(n){if(n.type==="internal")continue}else break;a.push(n)}return this.mode==="text"&&this.formLigatures(a),this.handleInfixNodes(a)}handleInfixNodes(e){for(var t=-1,a,i=0;i<e.length;i++){var n=e[i];if(n.type==="infix"){if(t!==-1)throw new B("only one infix operator per group",n.token);t=i,a=n.replaceWith}}if(t!==-1&&a){var o,l,c=e.slice(0,t),m=e.slice(t+1);c.length===1&&c[0].type==="ordgroup"?o=c[0]:o={type:"ordgroup",mode:this.mode,body:c},m.length===1&&m[0].type==="ordgroup"?l=m[0]:l={type:"ordgroup",mode:this.mode,body:m};var h;return a==="\\\\abovefrac"?h=this.callFunction(a,[o,e[t],l],[]):h=this.callFunction(a,[o,l],[]),[h]}else return e}handleSupSubscript(e){var t=this.fetch(),a=t.text;this.consume(),this.consumeSpaces();var i;do{var n;i=this.parseGroup(e)}while(((n=i)==null?void 0:n.type)==="internal");if(!i)throw new B("Expected group after '"+a+"'",t);return i}formatUnsupportedCmd(e){for(var t=[],a=0;a<e.length;a++)t.push({type:"textord",mode:"text",text:e[a]});var i={type:"text",mode:this.mode,body:t},n={type:"color",mode:this.mode,color:this.settings.errorColor,body:[i]};return n}parseAtom(e){var t=this.parseGroup("atom",e);if((t==null?void 0:t.type)==="internal"||this.mode==="text")return t;for(var a,i;;){this.consumeSpaces();var n=this.fetch();if(n.text==="\\limits"||n.text==="\\nolimits"){if(t&&t.type==="op"){var o=n.text==="\\limits";t.limits=o,t.alwaysHandleSupSub=!0}else if(t&&t.type==="operatorname")t.alwaysHandleSupSub&&(t.limits=n.text==="\\limits");else throw new B("Limit controls must follow a math operator",n);this.consume()}else if(n.text==="^"){if(a)throw new B("Double superscript",n);a=this.handleSupSubscript("superscript")}else if(n.text==="_"){if(i)throw new B("Double subscript",n);i=this.handleSupSubscript("subscript")}else if(n.text==="'"){if(a)throw new B("Double superscript",n);var l={type:"textord",mode:this.mode,text:"\\prime"},c=[l];for(this.consume();this.fetch().text==="'";)c.push(l),this.consume();this.fetch().text==="^"&&c.push(this.handleSupSubscript("superscript")),a={type:"ordgroup",mode:this.mode,body:c}}else if(pr[n.text]){var m=Y0.test(n.text),h=[];for(h.push(new Ve(pr[n.text])),this.consume();;){var f=this.fetch().text;if(!pr[f]||Y0.test(f)!==m)break;h.unshift(new Ve(pr[f])),this.consume()}var y=this.subparse(h);m?i={type:"ordgroup",mode:"math",body:y}:a={type:"ordgroup",mode:"math",body:y}}else break}return a||i?{type:"supsub",mode:this.mode,base:t,sup:a,sub:i}:t}parseFunction(e,t){var a=this.fetch(),i=a.text,n=mt[i];if(!n)return null;if(this.consume(),t&&t!=="atom"&&!n.allowedInArgument)throw new B("Got function '"+i+"' with no arguments"+(t?" as "+t:""),a);if(this.mode==="text"&&!n.allowedInText)throw new B("Can't use function '"+i+"' in text mode",a);if(this.mode==="math"&&n.allowedInMath===!1)throw new B("Can't use function '"+i+"' in math mode",a);var{args:o,optArgs:l}=this.parseArguments(i,n);return this.callFunction(i,o,l,a,e)}callFunction(e,t,a,i,n){var o={funcName:e,parser:this,token:i,breakOnTokenText:n},l=mt[e];if(l&&l.handler)return l.handler(o,t,a);throw new B("No function handler for "+e)}parseArguments(e,t){var a=t.numArgs+t.numOptionalArgs;if(a===0)return{args:[],optArgs:[]};for(var i=[],n=[],o=0;o<a;o++){var l=t.argTypes&&t.argTypes[o],c=o<t.numOptionalArgs;("primitive"in t&&t.primitive&&l==null||t.type==="sqrt"&&o===1&&n[0]==null)&&(l="primitive");var m=this.parseGroupOfType("argument to '"+e+"'",l,c);if(c)n.push(m);else if(m!=null)i.push(m);else throw new B("Null argument, please report this as a bug")}return{args:i,optArgs:n}}parseGroupOfType(e,t,a){switch(t){case"color":return this.parseColorGroup(a);case"size":return this.parseSizeGroup(a);case"url":return this.parseUrlGroup(a);case"math":case"text":return this.parseArgumentGroup(a,t);case"hbox":{var i=this.parseArgumentGroup(a,"text");return i!=null?{type:"styling",mode:i.mode,body:[i],style:"text",resetFont:!0}:null}case"raw":{var n=this.parseStringGroup("raw",a);return n!=null?{type:"raw",mode:"text",string:n.text}:null}case"primitive":{if(a)throw new B("A primitive argument cannot be optional");var o=this.parseGroup(e);if(o==null)throw new B("Expected group as "+e,this.fetch());return o}case"original":case null:case void 0:return this.parseArgumentGroup(a);default:throw new B("Unknown group type as "+e,this.fetch())}}consumeSpaces(){for(;this.fetch().text===" ";)this.consume()}parseStringGroup(e,t){var a=this.gullet.scanArgument(t);if(a==null)return null;for(var i="",n;(n=this.fetch()).text!=="EOF";)i+=n.text,this.consume();return this.consume(),a.text=i,a}parseRegexGroup(e,t){for(var a=this.fetch(),i=a,n="",o;(o=this.fetch()).text!=="EOF"&&e.test(n+o.text);)i=o,n+=i.text,this.consume();if(n==="")throw new B("Invalid "+t+": '"+a.text+"'",a);return a.range(i,n)}parseColorGroup(e){var t=this.parseStringGroup("color",e);if(t==null)return null;var a=/^(#[a-f0-9]{3,4}|#[a-f0-9]{6}|#[a-f0-9]{8}|[a-f0-9]{6}|[a-z]+)$/i.exec(t.text);if(!a)throw new B("Invalid color: '"+t.text+"'",t);var i=a[0];return/^[0-9a-f]{6}$/i.test(i)&&(i="#"+i),{type:"color-token",mode:this.mode,color:i}}parseSizeGroup(e){var t,a=!1;if(this.gullet.consumeSpaces(),!e&&this.gullet.future().text!=="{"?t=this.parseRegexGroup(/^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/,"size"):t=this.parseStringGroup("size",e),!t)return null;!e&&t.text.length===0&&(t.text="0pt",a=!0);var i=/([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(t.text);if(!i)throw new B("Invalid size: '"+t.text+"'",t);var n={number:+(i[1]+i[2]),unit:i[3]};if(!ei(n))throw new B("Invalid unit: '"+n.unit+"'",t);return{type:"size",mode:this.mode,value:n,isBlank:a}}parseUrlGroup(e){this.gullet.lexer.setCatcode("%",13),this.gullet.lexer.setCatcode("~",12);var t=this.parseStringGroup("url",e);if(this.gullet.lexer.setCatcode("%",14),this.gullet.lexer.setCatcode("~",13),t==null)return null;var a=t.text.replace(/\\([#$%&~_^{}])/g,"$1");return{type:"url",mode:this.mode,url:a}}parseArgumentGroup(e,t){var a=this.gullet.scanArgument(e);if(a==null)return null;var i=this.mode;t&&this.switchMode(t),this.gullet.beginGroup();var n=this.parseExpression(!1,"EOF");this.expect("EOF"),this.gullet.endGroup();var o={type:"ordgroup",mode:this.mode,loc:a.loc,body:n};return t&&this.switchMode(i),o}parseGroup(e,t){var a=this.fetch(),i=a.text,n;if(i==="{"||i==="\\begingroup"){this.consume();var o=i==="{"?"}":"\\endgroup";this.gullet.beginGroup();var l=this.parseExpression(!1,o),c=this.fetch();this.expect(o),this.gullet.endGroup(),n={type:"ordgroup",mode:this.mode,loc:Ne.range(a,c),body:l,semisimple:i==="\\begingroup"||void 0}}else if(n=this.parseFunction(t,e)||this.parseSymbol(),n==null&&i[0]==="\\"&&!Wi.hasOwnProperty(i)){if(this.settings.throwOnError)throw new B("Undefined control sequence: "+i,a);n=this.formatUnsupportedCmd(i),this.consume()}return n}formLigatures(e){for(var t=e.length-1,a=0;a<t;++a){var i=e[a];if(i.type==="textord"){var n=i.text,o=e[a+1];if(!(!o||o.type!=="textord")){if(n==="-"&&o.text==="-"){var l=e[a+2];a+1<t&&l&&l.type==="textord"&&l.text==="-"?(e.splice(a,3,{type:"textord",mode:"text",loc:Ne.range(i,l),text:"---"}),t-=2):(e.splice(a,2,{type:"textord",mode:"text",loc:Ne.range(i,o),text:"--"}),t-=1)}(n==="'"||n==="`")&&o.text===n&&(e.splice(a,2,{type:"textord",mode:"text",loc:Ne.range(i,o),text:n+n}),t-=1)}}}}parseSymbol(){var e=this.fetch(),t=e.text;if(/^\\verb[^a-zA-Z]/.test(t)){this.consume();var a=t.slice(5),i=a.charAt(0)==="*";if(i&&(a=a.slice(1)),a.length<2||a.charAt(0)!==a.slice(-1))throw new B(`\\verb assertion failed --
                    please report what input caused this bug`);return a=a.slice(1,-1),{type:"verb",mode:"text",body:a,star:i}}K0.hasOwnProperty(t[0])&&!xe[this.mode][t[0]]&&(this.settings.strict&&this.mode==="math"&&this.settings.reportNonstrict("unicodeTextInMathMode",'Accented Unicode text character "'+t[0]+'" used in math mode',e),t=K0[t[0]]+t.slice(1));var n=oo.exec(t);n&&(t=t.substring(0,n.index),t==="i"?t="ı":t==="j"&&(t="ȷ"));var o;if(xe[this.mode][t]){this.settings.strict&&this.mode==="math"&&ga.includes(t)&&this.settings.reportNonstrict("unicodeTextInMathMode",'Latin-1/Unicode text character "'+t[0]+'" used in math mode',e);var l=xe[this.mode][t].group,c=Ne.range(e),m;Ts(l)?m={type:"atom",mode:this.mode,family:l,loc:c,text:t}:m={type:l,mode:this.mode,loc:c,text:t},o=m}else if(t.charCodeAt(0)>=128)this.settings.strict&&(_0(t.charCodeAt(0))?this.mode==="math"&&this.settings.reportNonstrict("unicodeTextInMathMode",'Unicode text character "'+t[0]+'" used in math mode',e):this.settings.reportNonstrict("unknownSymbol",'Unrecognized Unicode character "'+t[0]+'"'+(" ("+t.charCodeAt(0)+")"),e)),o={type:"textord",mode:"text",loc:Ne.range(e),text:t};else return null;if(this.consume(),n)for(var h=0;h<n[0].length;h++){var f=n[0][h];if(!ia[f])throw new B("Unknown accent ' "+f+"'",e);var y=ia[f][this.mode]||ia[f].text;if(!y)throw new B("Accent "+f+" unsupported in "+this.mode+" mode",e);o={type:"accent",mode:this.mode,loc:Ne.range(e),label:y,isStretchy:!1,isShifty:!0,base:o}}return o}}$r.endOfExpression=new Set(["}","\\endgroup","\\end","\\right","&"]);var Za=function(e,t){if(!(typeof e=="string"||e instanceof String))throw new TypeError("KaTeX can only parse string typed expression");var a=new $r(e,t);delete a.gullet.macros.current["\\df@tag"];var i=a.parse();if(delete a.gullet.macros.current["\\current@color"],delete a.gullet.macros.current["\\color"],a.gullet.macros.get("\\df@tag")){if(!t.displayMode)throw new B("\\tag works only in display equations");i=[{type:"tag",mode:"text",body:i,tag:a.subparse([new Ve("\\df@tag")])}]}return i},Xi=function(e,t,a){t.textContent="";var i=Ja(e,a).toNode();t.appendChild(i)};typeof document<"u"&&document.compatMode!=="CSS1Compat"&&(typeof console<"u"&&console.warn("Warning: KaTeX doesn't work in quirks mode. Make sure your website has a suitable doctype."),Xi=function(){throw new B("KaTeX doesn't work in quirks mode.")});var ho=function(e,t){var a=Ja(e,t).toMarkup();return a},fo=function(e,t){var a=new Ra(t);return Za(e,a)},Yi=function(e,t,a){if(a.throwOnError||!(e instanceof B))throw e;var i=I(["katex-error"],[new Ge(t)]);return i.setAttribute("title",e.toString()),i.setAttribute("style","color:"+a.errorColor),i},Ja=function(e,t){var a=new Ra(t);try{var i=Za(e,a);return xs(i,e,a)}catch(n){return Yi(n,e,a)}},vo=function(e,t){var a=new Ra(t);try{var i=Za(e,a);return ws(i,e,a)}catch(n){return Yi(n,e,a)}},go="0.16.47",bo={Span:Vt,Anchor:Sr,SymbolNode:Ge,SvgNode:st,PathNode:ht,LineNode:va},yo={version:go,render:Xi,renderToString:ho,ParseError:B,SETTINGS_SCHEMA:pa,__parse:fo,__renderToDomTree:Ja,__renderToHTMLTree:vo,__setFontMetrics:ts,__defineSymbol:s,__defineFunction:V,__defineMacro:p,__domTree:bo};const Tt=class Tt{constructor(){}static getInstance(){return Tt.instance||(Tt.instance=new Tt),Tt.instance}renderMath(e,t=!1){try{return yo.renderToString(e,{displayMode:t,throwOnError:!1,output:"htmlAndMathml"})}catch{return`<span class="katex-error">${e}</span>`}}parseAndRender(e){if(!e)return"";let t=e.replace(/\$\$([\s\S]+?)\$\$/g,(a,i)=>`<div class="katex-block-container">${this.renderMath(i.trim(),!0)}</div>`);return t=t.replace(/\$([^\$\n]+?)\$/g,(a,i)=>`<span class="katex-inline-container">${this.renderMath(i.trim(),!1)}</span>`),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(new RegExp("(?<!\\*)\\*([^*]+)\\*(?!\\*)","g"),"<em>$1</em>"),t=t.replace(/\n/g,"<br/>"),t}};ce(Tt,"instance");let Ba=Tt;const Be=Ba.getInstance();function xo(r,e){const t=j.getDeckStats(r.id),a=t.dueCards,i=t.newCards,n=t.learningCards,o=t.masteredCards,l=t.totalCards,c=Math.max(1,i+n+o),m=Math.round(i/c*100),h=Math.round(n/c*100),f=Math.round(o/c*100),y=r.settings.algorithmType==="fsrs"?"FSRS (Inteligente)":r.settings.algorithmType==="quick"?"Revisión rápida":r.settings.algorithmType==="languages"?"Aprendizaje de idiomas":r.settings.algorithmType==="medical"?"Aprendizaje médico":r.settings.algorithmType==="general"?"Repaso espaciado general":"Personalizado",g=j.getCardsByDeck(r.id,!0),C=new Set,z=[];for(const k of g)if(k.groupId&&k.type==="image_occlusion"){if(C.has(k.groupId))continue;C.add(k.groupId);const M=j.getCardsByGroupId(k.groupId),A=M[0]||k,D=!!(A.frontImage||A.backImage||A.occlusionImage);z.push(`
        <div class="figma-card-item apple-glass-panel selectable-card-target card-stacked-bottom-effect" data-group-id="${k.groupId}" style="cursor:pointer; padding:14px 18px; border-radius:16px; margin-bottom:18px;">
          <div class="occlusion-group-header" data-toggle-group="${k.groupId}">
            <!-- Top Row Oclu -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Oclu</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn-toggle-group-accordion" data-group-id="${k.groupId}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.1rem; cursor:pointer; padding:0 2px; line-height:1;" title="Desplegar">
                  ▸
                </button>
                <button class="btn-card-item-dots" data-card-id="${A.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones">
                  ⋮
                </button>
              </div>
            </div>

            <!-- Front Title -->
            <div class="figma-card-title-bold" style="font-size:0.98rem; font-weight:700; color:#ffffff; line-height:1.42;">
              ${Be.parseAndRender(A.front)}
            </div>

            <!-- Back Description -->
            ${A.back?`
              <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                ${Be.parseAndRender(A.back)}
              </div>
            `:""}

            <!-- Attached Image SVG icon -->
            ${D?`
              <div style="display:flex; align-items:center; gap:6px; margin-top:10px; color:var(--f-text-muted);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
            `:""}
          </div>

          <!-- Subtarjetas desglosadas al click (Ocultas por defecto) -->
          <div class="occlusion-group-body" id="group-body-${k.groupId}" style="display:none; margin-top:12px; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            ${M.map(($,Y)=>`
              <div class="figma-card-item apple-glass-panel selectable-card-target" data-card-id="${$.id}" title="Toca para previsualizar • Mantén presionado para seleccionar" style="cursor:pointer; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.03); margin-bottom:0;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                  <span style="font-size:0.75rem; font-weight:800; color:var(--f-blue); background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px;">
                    Máscara #${Y+1}
                  </span>
                  <button class="btn-card-item-dots" data-card-id="${$.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.2rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones">⋮</button>
                </div>
                <div class="figma-card-title-bold" style="font-size:0.92rem; font-weight:700; color:#fff; line-height:1.4;">
                  ${Be.parseAndRender($.front)}
                </div>
                ${$.back?`
                  <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.84rem; line-height:1.4; margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${Be.parseAndRender($.back)}
                  </div>
                `:""}
              </div>
            `).join("")}
          </div>
        </div>
      `)}else if(k.groupId&&k.isInverted){if(C.has(k.groupId))continue;C.add(k.groupId);const M=j.getCardsByGroupId(k.groupId),A=M[0]||k,D=!!(A.frontImage||A.backImage);z.push(`
        <div class="figma-card-item apple-glass-panel selectable-card-target card-stacked-bottom-effect" data-group-id="${k.groupId}" style="cursor:pointer; padding:14px 18px; border-radius:16px; margin-bottom:18px;">
          <div class="occlusion-group-header" data-toggle-group="${k.groupId}">
            <!-- Top Row Invertido -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <span style="font-size:0.95rem;">⇄</span>
                <span>Invertido</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn-toggle-group-accordion" data-group-id="${k.groupId}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.1rem; cursor:pointer; padding:0 2px; line-height:1;" title="Desplegar">
                  ▸
                </button>
                <button class="btn-card-item-dots" data-card-id="${A.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones">
                  ⋮
                </button>
              </div>
            </div>

            <!-- Front Title -->
            <div class="figma-card-title-bold" style="font-size:0.98rem; font-weight:700; color:#ffffff; line-height:1.42;">
              ${Be.parseAndRender(A.front)}
            </div>

            <!-- Back Description -->
            ${A.back?`
              <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                ${Be.parseAndRender(A.back)}
              </div>
            `:""}

            <!-- Attached Image SVG icon -->
            ${D?`
              <div style="display:flex; align-items:center; gap:6px; margin-top:10px; color:var(--f-text-muted);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
            `:""}
          </div>

          <!-- Subtarjetas del par invertido desglosadas al click (Ocultas por defecto) -->
          <div class="occlusion-group-body" id="group-body-${k.groupId}" style="display:none; margin-top:12px; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            ${M.map(($,Y)=>`
              <div class="figma-card-item apple-glass-panel selectable-card-target" data-card-id="${$.id}" title="Toca para previsualizar • Mantén presionado para seleccionar" style="cursor:pointer; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.03); margin-bottom:0;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                  <span style="font-size:0.75rem; font-weight:800; color:#a855f7; background:rgba(168,85,247,0.14); padding:2px 8px; border-radius:6px;">
                    ${Y===0?"Normal (A → R)":"Invertida (R → A)"}
                  </span>
                  <button class="btn-card-item-dots" data-card-id="${$.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.2rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones">⋮</button>
                </div>
                <div class="figma-card-title-bold" style="font-size:0.92rem; font-weight:700; color:#fff; line-height:1.4;">
                  ${Be.parseAndRender($.front)}
                </div>
                ${$.back?`
                  <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.84rem; line-height:1.4; margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${Be.parseAndRender($.back)}
                  </div>
                `:""}
              </div>
            `).join("")}
          </div>
        </div>
      `)}else if(!k.groupId){const M=!!(k.frontImage||k.backImage||k.type==="image_occlusion"&&k.occlusionImage),A=k.isInverted,D=k.type==="image_occlusion";z.push(`
        <div class="figma-card-item apple-glass-panel selectable-card-target" data-card-id="${k.id}" title="Toca para previsualizar • Mantén presionado para seleccionar" style="cursor:pointer; padding:14px 18px; border-radius:16px; margin-bottom:10px;">
          
          ${A?`
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <span style="font-size:0.95rem;">⇄</span>
                <span>Invertido</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${k.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
            <div class="figma-card-title-bold" style="font-size:0.98rem; font-weight:700; color:#ffffff; line-height:1.42;">
              ${Be.parseAndRender(k.front)}
            </div>
          `:D?`
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Oclu</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${k.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
            <div class="figma-card-title-bold" style="font-size:0.98rem; font-weight:700; color:#ffffff; line-height:1.42;">
              ${Be.parseAndRender(k.front)}
            </div>
          `:`
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
              <div class="figma-card-title-bold" style="font-size:0.98rem; font-weight:700; color:#ffffff; line-height:1.42; flex:1;">
                ${Be.parseAndRender(k.front)}
              </div>
              <button class="btn-card-item-dots" data-card-id="${k.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1; flex-shrink:0; margin-top:-2px;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
          `}

          ${k.back?`
            <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
              ${Be.parseAndRender(k.back)}
            </div>
          `:""}

          ${M?`
            <div style="display:flex; align-items:center; gap:6px; margin-top:10px; color:var(--f-text-muted);">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
          `:""}

        </div>
      `)}return`
    <div>
      <!-- Action Header with 3-level Breadcrumb -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs" style="font-size:1.2rem;">
          <button class="figma-icon-btn-dark" id="btn-dash-back" style="margin-right:6px;" title="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="figma-crumb-link" id="dash-crumb-inicio">Inicio</span>
          ${e?`
            <span class="figma-crumb-sep">/</span>
            <span class="figma-crumb-link" id="dash-crumb-parent">${e.name}</span>
          `:""}
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-current">${r.name}</span>
        </div>

        <div class="figma-header-actions-group">
          <button class="figma-icon-btn-dark" id="btn-dash-code" title="Exportar JSON">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <button class="figma-icon-btn-dark" id="btn-dash-share" title="Compartir Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button class="figma-icon-btn-dark" id="btn-dash-menu" title="Ajustes del Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <!-- Title & Algorithm Info -->
      <div class="figma-dashboard-header">
        <div>
          <h1 class="figma-dash-title">${r.name}</h1>
          <p class="figma-dash-subtitle">
            Algoritmo de aprendizaje: <strong id="btn-open-algo-settings" style="cursor:pointer; color:var(--f-blue); text-decoration:underline;">${y} ⓘ</strong>
          </p>
        </div>
      </div>

      <!-- Hero Metric Box -->
      <div class="figma-hero-metric-box apple-glass-panel">
        <div class="figma-hero-large-number">${a}</div>
        <div class="figma-hero-label">tarjetas para hoy</div>

        <div class="figma-three-stats-row">
          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#94a3b8;">
              <span>+</span> <span>${i}</span>
            </div>
            <span class="figma-stat-name">No estudiadas</span>
          </div>

          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#10b981;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${n}</span>
            </div>
            <span class="figma-stat-name">En aprendizaje</span>
          </div>

          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#38bdf8;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>${o}</span>
            </div>
            <span class="figma-stat-name">Dominadas</span>
          </div>
        </div>

        <button class="figma-btn-study-large" id="btn-study-cards-main">
          ${a>0?"Estudiar tarjetas":"✨ Repasar mazo"}
        </button>
      </div>

      <!-- Progress Section: Tarjetas en el mazo -->
      <div class="figma-progress-section">
        <div class="figma-progress-title-row">
          <span>Tarjetas en el mazo (${l})</span>
          <span style="color:var(--f-text-muted); cursor:pointer;" id="btn-deck-info-icon">ⓘ</span>
        </div>

        <div class="figma-segment-bar">
          <div class="f-seg-gray" style="width: ${m}%;"></div>
          <div class="f-seg-green" style="width: ${h}%;"></div>
          <div class="f-seg-blue" style="width: ${f}%;"></div>
        </div>

        <div class="figma-bar-legend">
          <div class="f-legend-item">
            <div class="f-dot" style="background:#64748b;"></div>
            <span><strong>${i}</strong> No estudiadas</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#10b981;"></div>
            <span><strong>${n}</strong> En aprendizaje</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#38bdf8;"></div>
            <span><strong>${o}</strong> Dominadas</span>
          </div>
        </div>

        <!-- Search and Action Bar -->
        <div class="figma-search-bar-row" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div class="figma-search-input-wrap" style="flex:1; min-width:180px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="figma-search-input" placeholder="Buscar tarjetas en el mazo..." id="dash-search-input" />
          </div>

          <button class="figma-btn-white-pill" id="btn-dash-add-card" style="padding:10px 18px; font-size:0.88rem;">
            + Agregar tarjetas
          </button>
        </div>

        <!-- Cards List Container with Accordions and Long-Press Multi-Selection -->
        <div id="dash-cards-list-mount" style="margin-top:18px;">
          ${z.length>0?z.join(""):`
            <div style="text-align:center; padding:36px 16px; color:var(--f-text-muted);">
              No hay tarjetas en este mazo todavía. ¡Agrega una con el botón de arriba!
            </div>
          `}
        </div>
      </div>

      <!-- Floating Batch Actions Bar (Visible when cards are selected) -->
      <div id="figma-batch-dock" class="figma-batch-actions-dock" style="display:none;">
        <div class="batch-info">
          <span class="batch-count-badge" id="batch-selected-count">0 seleccionadas</span>
          <button class="batch-text-btn" id="btn-batch-select-all">Todas</button>
        </div>

        <div class="batch-actions-btns">
          <button class="batch-action-btn btn-batch-edit" id="btn-batch-edit-action" title="Editar tarjeta" style="display:none;">
            ✏️ Editar
          </button>
          <button class="batch-action-btn btn-batch-move" id="btn-batch-move-action" title="Mover a otra carpeta/mazo">
            📁 Mover
          </button>
          <button class="batch-action-btn btn-batch-invert" id="btn-batch-invert-action" title="Revertir o desrevertir">
            ⇄ Revertir
          </button>
          <button class="batch-action-btn btn-batch-reset" id="btn-batch-reset-action" title="Restablecer progreso a nuevo" style="background:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.35);">
            🔄 Borrar Progreso
          </button>
          <button class="batch-action-btn btn-batch-delete" id="btn-batch-delete-action" title="Eliminar seleccionadas">
            🗑️ Borrar
          </button>
          <button class="batch-action-btn btn-batch-close" id="btn-batch-close-action" title="Cancelar selección">
            ✕
          </button>
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <button class="figma-fab-gift" id="btn-fab-gift" title="Recompensas">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
      </button>

      <button class="figma-fab-help" id="btn-fab-help" title="Ayuda">
        ?
      </button>
    </div>
  `}function wo(r,e,t){var m,h,f,y,g,C,z,k,M,A,D,$,Y,Q,X,K;(m=r.querySelector("#btn-dash-back"))==null||m.addEventListener("click",()=>t.onBackToSubdecks()),(h=r.querySelector("#dash-crumb-inicio"))==null||h.addEventListener("click",()=>t.onBackToRoot()),(f=r.querySelector("#dash-crumb-parent"))==null||f.addEventListener("click",()=>t.onBackToSubdecks()),(y=r.querySelector("#btn-study-cards-main"))==null||y.addEventListener("click",()=>t.onStudy(e.id)),(g=r.querySelector("#btn-dash-add-card"))==null||g.addEventListener("click",()=>t.onAddCard(e.id)),(C=r.querySelector("#btn-dash-menu"))==null||C.addEventListener("click",()=>t.onConfigureDeck(e.id)),(z=r.querySelector("#btn-open-algo-settings"))==null||z.addEventListener("click",()=>t.onConfigureDeck(e.id)),(k=r.querySelector("#btn-deck-info-icon"))==null||k.addEventListener("click",()=>t.onConfigureDeck(e.id)),(M=r.querySelector("#btn-dash-code"))==null||M.addEventListener("click",()=>{const R=j.exportDeck(e.id),J=new Blob([R],{type:"application/json"}),ie=URL.createObjectURL(J),G=document.createElement("a");G.href=ie,G.download=`${e.name.toLowerCase().replace(/\s+/g,"_")}_cards.json`,G.click()}),(A=r.querySelector("#btn-dash-share"))==null||A.addEventListener("click",()=>{me.showAlert({title:`Compartir "${e.name}"`,message:`Enlace para compartir este mazo:
https://eureka.app/deck/${e.id}`})});const a=new Set,i=r.querySelector("#figma-batch-dock"),n=r.querySelector("#batch-selected-count"),o=r.querySelector("#btn-batch-edit-action"),l=()=>{!i||!n||(a.size>0?(i.style.display="flex",n.textContent=`${a.size} sel.`,o&&(o.style.display=a.size===1?"inline-flex":"none")):i.style.display="none",r.querySelectorAll(".selectable-card-target").forEach(R=>{const J=R.dataset.cardId,ie=R.dataset.groupId;let G=!1;if(J&&a.has(J))G=!0;else if(ie){const F=j.getCardsByGroupId(ie);F.length>0&&F.every(_=>a.has(_.id))&&(G=!0)}G?R.classList.add("card-selected-active"):R.classList.remove("card-selected-active")}))};o==null||o.addEventListener("click",()=>{if(a.size===1){const R=Array.from(a)[0];a.clear(),l(),t.onEditCard(R)}}),(D=r.querySelector("#btn-batch-select-all"))==null||D.addEventListener("click",()=>{const R=j.getCardsByDeck(e.id,!0);a.size===R.length?a.clear():R.forEach(J=>a.add(J.id)),l()}),($=r.querySelector("#btn-batch-close-action"))==null||$.addEventListener("click",()=>{a.clear(),l()}),(Y=r.querySelector("#btn-batch-delete-action"))==null||Y.addEventListener("click",()=>{a.size!==0&&me.showConfirm({title:"Eliminar Tarjetas",message:`¿Estás seguro de eliminar ${a.size} tarjeta(s) definitivamente? Esta acción no se puede deshacer.`,confirmText:"Eliminar",isDanger:!0,onConfirm:()=>{j.deleteCards(Array.from(a)),a.clear(),l()}})}),(Q=r.querySelector("#btn-batch-invert-action"))==null||Q.addEventListener("click",()=>{a.size!==0&&(j.toggleInvertCards(Array.from(a)),a.clear(),l())}),(X=r.querySelector("#btn-batch-reset-action"))==null||X.addEventListener("click",()=>{if(a.size===0)return;const R=a.size;me.showConfirm({title:"Restablecer Progreso",message:`¿Deseas restablecer el progreso de ${R} tarjeta(s) seleccionada(s) a estado nuevo?`,confirmText:"Continuar",onConfirm:()=>{me.showConfirm({title:"⚠️ Confirmación Final",message:`Esta acción borrará todo el historial de repasos e intervalos de estas ${R} tarjeta(s). ¿Confirmar por segunda vez?`,confirmText:"Restablecer Definitivamente",isDanger:!0,onConfirm:()=>{j.resetCardsProgress(Array.from(a)),a.clear(),l(),t.onConfigureDeck(e.id)}})}})}),(K=r.querySelector("#btn-batch-move-action"))==null||K.addEventListener("click",()=>{var ie;if(a.size===0)return;const R=j.getAllDecks(),J=document.createElement("div");J.className="apple-modal-overlay",J.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff;">Mover ${a.size} tarjeta(s)</h3>
          <button id="btn-close-move-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>
        <p style="color:var(--f-text-secondary); font-size:0.9rem; margin-bottom:16px;">
          Selecciona el mazo o submazo de destino:
        </p>

        <div style="display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto; margin-bottom:18px;">
          ${R.map(G=>{const F=G.id===e.id;return`
              <button class="target-deck-btn ${F?"disabled":""}" data-target-id="${G.id}" style="text-align:left; padding:12px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; cursor:${F?"not-allowed":"pointer"}; display:flex; align-items:center; justify-content:space-between;">
                <span>${G.parentId?"↳ ":"📁 "} ${G.name}</span>
                ${F?'<span style="font-size:0.75rem; color:var(--f-text-muted);">(Actual)</span>':'<span style="color:var(--f-blue);">Mover aquí ›</span>'}
              </button>
            `}).join("")}
        </div>
      </div>
    `,document.body.appendChild(J),(ie=J.querySelector("#btn-close-move-modal"))==null||ie.addEventListener("click",()=>J.remove()),J.addEventListener("click",G=>{G.target===J&&J.remove()}),J.querySelectorAll(".target-deck-btn").forEach(G=>{G.addEventListener("click",()=>{const F=G.dataset.targetId;F&&F!==e.id&&(j.moveCards(Array.from(a),F),a.clear(),J.remove(),l())})})}),(()=>{r.querySelectorAll("[data-toggle-group]").forEach(R=>{R.addEventListener("click",()=>{if(a.size>0)return;const J=R.dataset.toggleGroup;if(J){const ie=r.querySelector(`#group-body-${J}`),G=R.querySelector(".btn-toggle-group-accordion");if(ie){const F=ie.style.display==="none";ie.style.display=F?"flex":"none",G&&(G.textContent=F?"▾":"▸")}}})}),r.querySelectorAll(".selectable-card-target").forEach(R=>{let J=null,ie=!1,G=0,F=0;const _=(re,le)=>{ie=!1,G=re,F=le,J=window.setTimeout(()=>{ie=!0;try{navigator.vibrate&&navigator.vibrate(40)}catch{}const ue=R.dataset.cardId,fe=R.dataset.groupId;if(ue)a.has(ue)?a.delete(ue):a.add(ue);else if(fe){const S=j.getCardsByGroupId(fe);S.every(N=>a.has(N.id))?S.forEach(N=>a.delete(N.id)):S.forEach(N=>a.add(N.id))}l()},450)},ee=()=>{J&&(clearTimeout(J),J=null)};R.addEventListener("mousedown",re=>{re.button===0&&_(re.clientX,re.clientY)}),R.addEventListener("mouseup",ee),R.addEventListener("mouseleave",ee),R.addEventListener("touchstart",re=>{re.touches.length===1&&_(re.touches[0].clientX,re.touches[0].clientY)},{passive:!0}),R.addEventListener("touchmove",re=>{if(re.touches.length===1){const le=Math.abs(re.touches[0].clientX-G),ue=Math.abs(re.touches[0].clientY-F);(le>10||ue>10)&&ee()}},{passive:!0}),R.addEventListener("touchend",ee),R.addEventListener("touchcancel",ee),R.addEventListener("click",re=>{if(re.target.closest(".btn-card-item-dots"))return;if(ie){re.preventDefault(),re.stopPropagation(),ie=!1;return}const le=R.dataset.cardId,ue=R.dataset.groupId;if(a.size>0){if(re.stopPropagation(),le)a.has(le)?a.delete(le):a.add(le);else if(ue){const fe=j.getCardsByGroupId(ue);fe.every(x=>a.has(x.id))?fe.forEach(x=>a.delete(x.id)):fe.forEach(x=>a.add(x.id))}l();return}le&&t.onStudySpecificCard(e.id,le)})}),r.querySelectorAll(".btn-card-item-dots").forEach(R=>{R.addEventListener("click",J=>{var ee,re,le,ue,fe;J.stopPropagation(),J.preventDefault();const ie=R.dataset.cardId;if(!ie)return;const G=j.getCardById(ie);if(!G)return;const F=document.createElement("div");F.className="apple-modal-overlay",F.innerHTML=`
          <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:92%; padding:22px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de Tarjeta</h3>
              <button id="btn-close-card-item-menu" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="menu-action-item-btn" id="btn-cmenu-study" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">👁️</span>
                <div>
                  <div>Ver / Previsualizar</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Inspeccionar a pantalla completa</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-edit" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">✏️</span>
                <div>
                  <div>Editar tarjeta</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Modificar anverso o reverso</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-reset" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">🔄</span>
                <div>
                  <div>Reiniciar progreso</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Restablecer a tarjeta nueva</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-delete" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">🗑️</span>
                <div>
                  <div>Eliminar tarjeta</div>
                  <div style="font-size:0.75rem; color:#fca5a5; font-weight:500;">Borrar definitivamente</div>
                </div>
              </button>
            </div>
          </div>
        `,document.body.appendChild(F);const _=()=>F.remove();(ee=F.querySelector("#btn-close-card-item-menu"))==null||ee.addEventListener("click",_),F.addEventListener("click",S=>{S.target===F&&_()}),(re=F.querySelector("#btn-cmenu-study"))==null||re.addEventListener("click",()=>{_(),t.onStudySpecificCard(e.id,G.id)}),(le=F.querySelector("#btn-cmenu-edit"))==null||le.addEventListener("click",()=>{_(),t.onEditCard(G.id)}),(ue=F.querySelector("#btn-cmenu-reset"))==null||ue.addEventListener("click",()=>{_(),j.resetCardProgress(G.id),t.onConfigureDeck(e.id)}),(fe=F.querySelector("#btn-cmenu-delete"))==null||fe.addEventListener("click",()=>{_(),me.showConfirm({title:"Eliminar Tarjeta",message:"¿Estás seguro de eliminar esta tarjeta definitivamente?",confirmText:"Eliminar",isDanger:!0,onConfirm:()=>{j.deleteCard(G.id),t.onConfigureDeck(e.id)}})})})})})()}const Et=class Et{constructor(){ce(this,"synth",null);ce(this,"isSpeaking",!1);ce(this,"onStateChangeListeners",[]);typeof window<"u"&&"speechSynthesis"in window&&(this.synth=window.speechSynthesis)}static getInstance(){return Et.instance||(Et.instance=new Et),Et.instance}addListener(e){return this.onStateChangeListeners.push(e),()=>{this.onStateChangeListeners=this.onStateChangeListeners.filter(t=>t!==e)}}notify(e){this.isSpeaking=e,this.onStateChangeListeners.forEach(t=>t(e))}getAvailableVoices(){return this.synth?this.synth.getVoices():[]}speak(e,t="es-ES",a){if(!this.synth){console.warn("SpeechSynthesis no está disponible en este entorno.");return}this.stop();const i=e.replace(/<[^>]*>?/gm,"").replace(/\$+/g,"").trim();if(!i)return;const n=new SpeechSynthesisUtterance(i);n.lang=t,n.rate=(a==null?void 0:a.rate)||1,n.pitch=(a==null?void 0:a.pitch)||1;const o=this.getAvailableVoices(),l=o.find(c=>c.lang.startsWith(t.split("-")[0]))||o.find(c=>c.default);l&&(n.voice=l),n.onstart=()=>{this.notify(!0)},n.onend=()=>{var c;this.notify(!1),(c=a==null?void 0:a.onEnd)==null||c.call(a)},n.onerror=c=>{console.warn("Error en reproducción TTS:",c),this.notify(!1)},this.synth.speak(n)}stop(){this.synth&&(this.synth.cancel(),this.notify(!1))}isCurrentlySpeaking(){return this.isSpeaking}};ce(Et,"instance");let La=Et;const Rt=La.getInstance();function ko(r){var K,R,J,ie,G;const e=document.getElementById("modal-occlusion-root");e&&e.remove();let t=r.initialImage||Qt,a=r.initialMasks?[...r.initialMasks]:[],i=r.initialMode||"hide_all_reveal_one";const n=`
    <div class="modal-backdrop figma-modal-backdrop" id="modal-occlusion-root">
      <div class="apple-glass-modal" style="max-width:920px; max-height:92vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 22px; border-bottom:1px solid var(--f-border);">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="apple-glass-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.18rem; font-weight:800; color:#fff;">Oclusión de Imágenes Inteligente</h3>
              <p style="font-size:0.78rem; color:var(--f-text-secondary);">Arrastra para dibujar máscaras, muévelas o bórralas libremente</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button class="figma-btn-ghost" id="btn-cancel-occlusion">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-confirm-occlusion" style="padding:10px 22px;">
              <span id="btn-confirm-text">✓ Listo</span>
            </button>
          </div>
        </div>

        <!-- Toolbar Superior con Botones con Nombre -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 22px; background:rgba(255,255,255,0.02); border-bottom:1px solid var(--f-border); flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="apple-btn-outline-pill" id="btn-load-photo">
              📷 Cargar Foto
            </button>
            <input type="file" id="occ-file-input" accept="image/*" style="display:none;" />

            <button class="apple-btn-outline-pill" id="btn-template-heart">
              🫀 Plantilla Corazón
            </button>

            <button class="apple-btn-outline-pill" id="btn-clear-all-masks" style="color:#f87171;">
              🗑️ Borrar Todo
            </button>
          </div>

          <!-- Switch Modo Oclusión -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.85rem; font-weight:700; color:var(--f-text-secondary);">Modo de Estudio:</span>
            <div style="display:flex; background:#1c1d22; border-radius:10px; padding:3px; border:1px solid var(--f-border);">
              <button class="apple-tab-pill ${i==="hide_all_reveal_one"?"active":""}" id="btn-mode-hide-all" style="font-size:0.78rem; padding:5px 10px; border-radius:8px; border:none; cursor:pointer;">
                🔒 Ocluir 1, Ocultar Todas
              </button>
              <button class="apple-tab-pill ${i==="hide_one_reveal_one"?"active":""}" id="btn-mode-hide-one" style="font-size:0.78rem; padding:5px 10px; border-radius:8px; border:none; cursor:pointer;">
                👁️ Ocluir 1, Ocultar 1
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Stage -->
        <div style="flex:1; overflow:auto; padding:20px; display:flex; justify-content:center; align-items:center; min-height:380px; background:#07080a;" id="occ-drop-canvas-zone">
          <div class="figma-stage-inner" id="occ-canvas-stage">
            <img src="${t}" id="occ-target-img" alt="Lienzo de Oclusión" draggable="false" style="max-height:55vh; width:auto; max-width:100%; border-radius:14px; display:block;" />
            <div class="figma-mask-overlay" id="occ-overlay-layer"></div>
          </div>
        </div>

        <!-- Footer Info -->
        <div style="padding:14px 22px; border-top:1px solid var(--f-border); display:flex; align-items:center; justify-content:space-between; font-size:0.86rem; color:var(--f-text-secondary);">
          <span style="color:#fbbf24;">💡 <strong>División Inteligente:</strong> Cada máscara se convertirá en una tarjeta independiente. Puedes mover las máscaras arrastrándolas.</span>
          <span style="font-weight:800; color:var(--f-blue);" id="lbl-active-masks">Máscaras activas: ${a.length}</span>
        </div>

      </div>
    </div>
  `;document.body.insertAdjacentHTML("beforeend",n);const o=document.getElementById("occ-target-img"),l=document.getElementById("occ-overlay-layer"),c=document.getElementById("lbl-active-masks"),m=document.getElementById("btn-confirm-text");let h=!1,f=0,y=0,g=null,C=null,z=0,k=0;const M=()=>{c&&(c.textContent=`Máscaras activas: ${a.length}`),m&&(m.textContent=`✓ Listo (${a.length} máscaras)`)},A=()=>{l&&(l.innerHTML="",a.forEach((F,_)=>{const ee=document.createElement("div");ee.className="figma-drawn-mask",ee.style.left=`${F.x}%`,ee.style.top=`${F.y}%`,ee.style.width=`${F.width}%`,ee.style.height=`${F.height}%`,ee.style.cursor="grab",ee.dataset.maskIdx=String(_),ee.innerHTML=`
        <span class="f-mask-idx">#${_+1}</span>
        <button class="f-mask-del" data-del-idx="${_}" title="Eliminar máscara">×</button>
      `,ee.addEventListener("pointerdown",re=>{if(re.target.classList.contains("f-mask-del"))return;re.stopPropagation(),re.preventDefault();const le=l.getBoundingClientRect();C=_;const ue=F.x/100*le.width,fe=F.y/100*le.height,S=re.clientX-le.left,x=re.clientY-le.top;z=S-ue,k=x-fe,ee.style.cursor="grabbing"}),l.appendChild(ee)}),l.querySelectorAll(".f-mask-del").forEach(F=>{F.addEventListener("click",_=>{_.stopPropagation();const ee=parseInt(F.dataset.delIdx||"0",10);a.splice(ee,1),A(),M()})}),M())};o.onload=()=>{A()},o.complete&&A(),l.addEventListener("pointerdown",F=>{if(C!==null||F.target.classList.contains("f-mask-del")||F.target.classList.contains("figma-drawn-mask"))return;const _=l.getBoundingClientRect();h=!0,f=F.clientX-_.left,y=F.clientY-_.top,g=document.createElement("div"),g.className="figma-drawing-preview",g.style.left=`${f}px`,g.style.top=`${y}px`,g.style.width="0px",g.style.height="0px",l.appendChild(g)}),window.addEventListener("pointermove",F=>{const _=l.getBoundingClientRect();if(C!==null&&C<a.length){const x=F.clientX-_.left,N=F.clientY-_.top,T=x-z,O=N-k,P=a[C],W=Math.max(0,Math.min(100-P.width,T/_.width*100)),H=Math.max(0,Math.min(100-P.height,O/_.height*100));P.x=Number(W.toFixed(2)),P.y=Number(H.toFixed(2));const Z=l.querySelector(`[data-mask-idx="${C}"]`);Z&&(Z.style.left=`${P.x}%`,Z.style.top=`${P.y}%`);return}if(!h||!g)return;const ee=Math.max(0,Math.min(_.width,F.clientX-_.left)),re=Math.max(0,Math.min(_.height,F.clientY-_.top)),le=Math.min(f,ee),ue=Math.min(y,re),fe=Math.abs(ee-f),S=Math.abs(re-y);g.style.left=`${le}px`,g.style.top=`${ue}px`,g.style.width=`${fe}px`,g.style.height=`${S}px`}),window.addEventListener("pointerup",()=>{if(C!==null&&(C=null,A()),h&&g){h=!1;const F=l.getBoundingClientRect(),_=parseFloat(g.style.left),ee=parseFloat(g.style.top),re=parseFloat(g.style.width),le=parseFloat(g.style.height);if(g.remove(),g=null,re>12&&le>12&&F.width>0&&F.height>0){const ue=Number((_/F.width*100).toFixed(2)),fe=Number((ee/F.height*100).toFixed(2)),S=Number((re/F.width*100).toFixed(2)),x=Number((le/F.height*100).toFixed(2));a.push({id:`mask-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,x:ue,y:fe,width:S,height:x,label:`Estructura #${a.length+1}`}),A(),M()}}});const D=document.getElementById("occ-file-input");(K=document.getElementById("btn-load-photo"))==null||K.addEventListener("click",()=>D.click()),D==null||D.addEventListener("change",()=>{if(D.files&&D.files[0]){const F=new FileReader;F.onload=_=>{var ee;t=(ee=_.target)==null?void 0:ee.result,o.src=t,a=[],A()},F.readAsDataURL(D.files[0])}});const $=document.getElementById("occ-drop-canvas-zone");$==null||$.addEventListener("dragover",F=>F.preventDefault()),$==null||$.addEventListener("drop",F=>{var _;if(F.preventDefault(),(_=F.dataTransfer)!=null&&_.files&&F.dataTransfer.files.length>0){const ee=F.dataTransfer.files[0];if(ee.type.startsWith("image/")){const re=new FileReader;re.onload=le=>{var ue;t=(ue=le.target)==null?void 0:ue.result,o.src=t,a=[],A()},re.readAsDataURL(ee)}}}),(R=document.getElementById("btn-template-heart"))==null||R.addEventListener("click",()=>{t=Qt,o.src=t,a=[{id:"m1",x:4.1,y:22.2,width:25,height:7.2,label:"Vena Cava Superior"},{id:"m2",x:70,y:15.5,width:25,height:7.2,label:"Cayado de la Aorta"},{id:"m3",x:4.1,y:43.3,width:25,height:7.2,label:"Aurícula Derecha"},{id:"m4",x:70,y:61.1,width:25.8,height:7.2,label:"Ventrículo Izquierdo"}],A()}),(J=document.getElementById("btn-clear-all-masks"))==null||J.addEventListener("click",()=>{a=[],A()});const Y=document.getElementById("btn-mode-hide-all"),Q=document.getElementById("btn-mode-hide-one");Y==null||Y.addEventListener("click",()=>{i="hide_all_reveal_one",Y.classList.add("active"),Q==null||Q.classList.remove("active")}),Q==null||Q.addEventListener("click",()=>{i="hide_one_reveal_one",Q.classList.add("active"),Y==null||Y.classList.remove("active")}),(ie=document.getElementById("btn-confirm-occlusion"))==null||ie.addEventListener("click",()=>{var F;r.onConfirm(t,a,i),(F=document.getElementById("modal-occlusion-root"))==null||F.remove()});const X=()=>{var F;(F=document.getElementById("modal-occlusion-root"))==null||F.remove()};(G=document.getElementById("btn-cancel-occlusion"))==null||G.addEventListener("click",X)}function So(r,e,t){return`
    <div class="ios-fullscreen-view">
      
      <!-- Top Action Navigation Header matching Reference Images 2 & 3 -->
      <div class="ios-navbar" style="padding-bottom:12px; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; font-size:1.15rem; font-weight:700;">
          <button class="ios-back-btn" id="btn-card-edit-back" style="padding:0; margin-right:4px;" title="Volver">
            <span class="ios-back-chevron">‹</span>
          </button>
          <span class="figma-crumb-link" id="crumb-e-inicio" style="color:var(--f-text-secondary); cursor:pointer;">Inicio</span>
          ${e?`
            <span style="color:var(--f-text-muted);">/</span>
            <span class="figma-crumb-link" id="crumb-e-parent" style="color:var(--f-text-secondary); cursor:pointer;">${e.name}</span>
          `:""}
          <span style="color:var(--f-text-muted);">/</span>
          <span class="figma-crumb-link" id="crumb-e-deck" style="color:var(--f-text-secondary); cursor:pointer;">${r.name}</span>
          <span style="color:var(--f-text-muted);">/</span>
          <span style="color:#ffffff; font-weight:800;">${t?"Editar tarjeta":"Agregar nueva tarjeta"}</span>
        </div>

        <div style="display:flex; align-items:center; gap:10px; margin-left:auto;">
          <button class="cupertino-icon-square" id="btn-toggle-editor-split" style="width:44px; height:44px;" title="Vista dividida">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </button>

          <button class="cupertino-btn-check-save" id="btn-save-card-check" style="width:auto; padding:0 20px; gap:8px; font-weight:800; font-size:0.95rem; color:#07080a;" title="${t?"Confirmar cambios":"Crear"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07080a" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${t?"Confirmar cambios":"Crear"}</span>
          </button>
        </div>
      </div>

      <!-- Editor Container (Matching Images 2 & 3 Exactly) -->
      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:18px;">
        
        <!-- ANVERSO -->
        <div class="cupertino-editor-block">
          <label class="cupertino-editor-label">Anverso</label>
          
          <div class="cupertino-editor-card-box" id="drop-zone-anverso">
            
            <textarea 
              id="f-anverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce el texto aquí"
            >${(t==null?void 0:t.front)||""}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card (Matching Image 3) -->
            <div id="f-anverso-img-preview" class="cupertino-thumbnail-box ${t!=null&&t.frontImage||t!=null&&t.occlusionImage?"":"hidden"}">
              <img src="${(t==null?void 0:t.frontImage)||(t==null?void 0:t.occlusionImage)||""}" id="f-anverso-img-tag" alt="Anverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-anverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-anverso-img" title="Opciones de imagen">
                ${(t==null?void 0:t.type)==="image_occlusion"?"🔲 Oclusión":"🔍 Ver"}
              </div>
            </div>

            <!-- Toolbar Anverso (Matching Image 2 & 3) -->
            <div class="cupertino-rich-toolbar-dock">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-anverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-anverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-anverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-draw-anverso" title="Dibujo libre">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-occlusion-btn" title="Oclusión de Imagen" style="color:var(--f-blue);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-audio-anverso" title="Audio TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-a-anverso" title="Tamaño de Fuente" style="font-weight:800;">A</button>

              <span class="cupertino-tool-divider"></span>

              <button type="button" class="cupertino-tool-icon" data-fmt="**" title="Negrita"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="*" title="Cursiva"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="__" title="Subrayado"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="~~" title="Tachado"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="## " title="Encabezado">H</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="- " title="Lista con viñetas">≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="$_2$" title="Subíndice">X₂</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="$^2$" title="Superíndice">X²</button>
              <button type="button" class="cupertino-tool-icon" id="tool-katex-anverso" title="Fórmula KaTeX" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="\`\`\`" title="Bloque de código">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- REVERSO -->
        <div class="cupertino-editor-block">
          <label class="cupertino-editor-label">Reverso</label>
          
          <div class="cupertino-editor-card-box" id="drop-zone-reverso">
            
            <textarea 
              id="f-reverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce el texto aquí"
            >${(t==null?void 0:t.back)||""}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card (Matching Image 3) -->
            <div id="f-reverso-img-preview" class="cupertino-thumbnail-box ${t!=null&&t.backImage?"":"hidden"}">
              <img src="${(t==null?void 0:t.backImage)||""}" id="f-reverso-img-tag" alt="Reverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-reverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-reverso-img" title="Ver imagen">
                🔍 Ver
              </div>
            </div>

            <!-- Toolbar Reverso (Matching Image 2 & 3) -->
            <div class="cupertino-rich-toolbar-dock">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-reverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-reverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-reverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-audio-reverso" title="Audio TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" data-fmt-r="**" title="Negrita"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="*" title="Cursiva"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="__" title="Subrayado"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="~~" title="Tachado"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="## " title="Encabezado">H</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="- " title="Lista">≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="$_2$" title="Subíndice">X₂</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="$^2$" title="Superíndice">X²</button>
              <button type="button" class="cupertino-tool-icon" id="tool-katex-reverso" title="Fórmula KaTeX" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="\`\`\`" title="Código">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- Toggle Tarjetas Invertidas (Matching Image 2) -->
        <div class="apple-card-grouped" style="padding:18px 22px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              <span style="font-size:1.05rem; font-weight:700; color:#fff;">Tarjetas invertidas</span>
              <span style="color:var(--f-text-muted); cursor:pointer; font-size:1rem;" title="Genera dos tarjetas recíprocas (Anverso -> Reverso y Reverso -> Anverso)">ⓘ</span>
            </div>

            <label class="figma-switch">
              <input type="checkbox" id="toggle-inverted-cards" ${t!=null&&t.isInverted?"checked":""} />
              <span class="figma-slider"></span>
            </label>
          </div>
        </div>

      </div>

    </div>
  `}function Mo(r,e,t,a){var Q,X,K,R,J,ie,G,F,_,ee,re,le,ue,fe,S,x,N;const i=r.querySelector("#f-anverso-input"),n=r.querySelector("#f-reverso-input"),o=r.querySelector("#toggle-inverted-cards");let l=t==null?void 0:t.frontImage,c=t==null?void 0:t.backImage,m=t==null?void 0:t.occlusionImage,h=(t==null?void 0:t.occlusionMasks)||[],f=(t==null?void 0:t.occlusionMode)||"hide_all_reveal_one";const y=()=>{const T=r.querySelector("#f-anverso-img-preview"),O=r.querySelector("#f-anverso-img-tag"),P=l||m;T&&O&&(P?(O.src=P,T.classList.remove("hidden")):T.classList.add("hidden"));const W=r.querySelector("#f-reverso-img-preview"),H=r.querySelector("#f-reverso-img-tag");W&&H&&(c?(H.src=c,W.classList.remove("hidden")):W.classList.add("hidden"))},g=(T,O)=>{const P=new FileReader;P.onload=W=>{var Z;const H=(Z=W.target)==null?void 0:Z.result;H&&(O?l=H:c=H,y())},P.readAsDataURL(T)},C=(T,O)=>{T==null||T.addEventListener("paste",P=>{var H;const W=(H=P.clipboardData)==null?void 0:H.items;if(W){for(let Z=0;Z<W.length;Z++)if(W[Z].type.indexOf("image")!==-1){const te=W[Z].getAsFile();if(te){P.preventDefault(),g(te,O);break}}}})};C(i,!0),C(n,!1);const z=(T,O)=>{const P=r.querySelector(T);P&&(P.addEventListener("dragover",W=>{W.preventDefault(),P.style.borderColor="var(--f-blue)"}),P.addEventListener("dragleave",()=>{P.style.borderColor=""}),P.addEventListener("drop",W=>{var H;if(W.preventDefault(),P.style.borderColor="",(H=W.dataTransfer)!=null&&H.files&&W.dataTransfer.files.length>0){const Z=W.dataTransfer.files[0];Z.type.startsWith("image/")&&g(Z,O)}}))};z("#drop-zone-anverso",!0),z("#drop-zone-reverso",!1);const k=r.querySelector("#f-file-anverso");(Q=r.querySelector("#tool-img-anverso"))==null||Q.addEventListener("click",()=>k==null?void 0:k.click()),k==null||k.addEventListener("change",()=>{k.files&&k.files[0]&&g(k.files[0],!0)});const M=r.querySelector("#f-file-reverso");(X=r.querySelector("#tool-img-reverso"))==null||X.addEventListener("click",()=>M==null?void 0:M.click()),M==null||M.addEventListener("change",()=>{M.files&&M.files[0]&&g(M.files[0],!1)}),(K=r.querySelector("#btn-del-anverso-img"))==null||K.addEventListener("click",T=>{T.stopPropagation(),l=void 0,m=void 0,h=[],y()}),(R=r.querySelector("#btn-del-reverso-img"))==null||R.addEventListener("click",T=>{T.stopPropagation(),c=void 0,y()});const A=()=>{ko({deckId:e.id,initialImage:l||m||Qt,initialMasks:h,initialMode:f,onConfirm:(T,O,P)=>{m=T,l=T,h=O,f=P,y()},onClose:()=>{}})};(J=r.querySelector("#btn-manage-anverso-img"))==null||J.addEventListener("click",A),(ie=r.querySelector("#tool-occlusion-btn"))==null||ie.addEventListener("click",A);const D=(T,O,P="")=>{if(!T)return;const W=T.selectionStart,H=T.selectionEnd,Z=T.value,te=Z.substring(W,H)||"texto";T.value=Z.substring(0,W)+O+te+(P||O)+Z.substring(H),T.focus()};r.querySelectorAll("[data-fmt]").forEach(T=>{T.addEventListener("click",()=>{const O=T.dataset.fmt;O&&D(i,O)})}),r.querySelectorAll("[data-fmt-r]").forEach(T=>{T.addEventListener("click",()=>{const O=T.dataset.fmtR;O&&D(n,O)})}),(G=r.querySelector("#btn-card-edit-back"))==null||G.addEventListener("click",()=>a.onBack()),(F=r.querySelector("#crumb-e-inicio"))==null||F.addEventListener("click",()=>a.onBack()),(_=r.querySelector("#crumb-e-parent"))==null||_.addEventListener("click",()=>a.onBack()),(ee=r.querySelector("#crumb-e-deck"))==null||ee.addEventListener("click",()=>a.onBack());const $=()=>{$a({deckId:e.id,onInsertToEditor:T=>{i&&(i.value=T.front),n&&(n.value=T.back)},onBatchAdded:()=>{a.onSaved()},onClose:()=>{}})};(re=r.querySelector("#btn-ai-anverso"))==null||re.addEventListener("click",$),(le=r.querySelector("#btn-ai-reverso"))==null||le.addEventListener("click",$),(ue=r.querySelector("#tool-katex-anverso"))==null||ue.addEventListener("click",()=>{i&&(i.value+=" $$E = mc^2$$ ",i.focus())}),(fe=r.querySelector("#tool-katex-reverso"))==null||fe.addEventListener("click",()=>{n&&(n.value+=" $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$ ",n.focus())}),(S=r.querySelector("#tool-audio-anverso"))==null||S.addEventListener("click",()=>{const T=(i==null?void 0:i.value)||"Audio de prueba";Rt.speak(T,e.settings.ttsVoiceLang)}),(x=r.querySelector("#tool-audio-reverso"))==null||x.addEventListener("click",()=>{const T=(n==null?void 0:n.value)||"Respuesta de prueba";Rt.speak(T,e.settings.ttsVoiceLang)});const Y=()=>{const T=(i==null?void 0:i.value.trim())||"Pregunta",O=(n==null?void 0:n.value.trim())||"Respuesta",P=h.length>0,W=T.includes("$")||O.includes("$"),H=(o==null?void 0:o.checked)||!1,Z=P?"image_occlusion":W?"latex":"standard";if(t)P?j.syncOcclusionCards(e.id,t,m||l||"",h,f,T):j.updateCard(t.id,{deckId:e.id,type:Z,front:T,back:O,frontImage:l,backImage:c,occlusionImage:void 0,occlusionMasks:void 0,activeMaskId:void 0,occlusionMode:f}),a.onSaved();else{P?j.createOcclusionCards(e.id,m||l||Qt,h,f):j.createCard({deckId:e.id,type:Z,front:T,back:O,frontImage:l,backImage:c,occlusionImage:void 0,occlusionMasks:void 0,activeMaskId:void 0,occlusionMode:f},H),i&&(i.value=""),n&&(n.value=""),l=void 0,c=void 0,m=void 0,h=[],y(),i==null||i.focus();const te=document.createElement("div");te.className="figma-toast-banner",te.style.position="fixed",te.style.top="24px",te.style.left="50%",te.style.transform="translateX(-50%)",te.style.background="rgba(16, 185, 129, 0.95)",te.style.color="#ffffff",te.style.padding="12px 24px",te.style.borderRadius="14px",te.style.fontWeight="800",te.style.fontSize="0.95rem",te.style.zIndex="999999",te.style.boxShadow="0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.4)",te.innerHTML="✓ ¡Tarjeta agregada! Escribe la siguiente o pulsa ‹ Volver al terminar.",document.body.appendChild(te),setTimeout(()=>te.remove(),2500)}};(N=r.querySelector("#btn-save-card-check"))==null||N.addEventListener("click",Y)}function zo(){const r=j.getAllDecks().flatMap(e=>j.getCardsByDeck(e.id,!1));return`
    <div style="padding-bottom:90px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2 class="figma-dash-title">Biblioteca de Tarjetas</h2>
          <p class="figma-dash-subtitle">Explora y busca en todas las flashcards del sistema</p>
        </div>
        <button class="figma-btn-white-pill" id="btn-lib-add-card">+ Nueva Tarjeta</button>
      </div>

      <!-- Search Input -->
      <div class="figma-search-input-wrap" style="margin-bottom:20px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="figma-search-input" placeholder="Buscar por anverso, reverso o etiquetas..." id="lib-search-input" />
      </div>

      <!-- Cards Counter -->
      <div style="font-size:0.88rem; font-weight:700; color:var(--f-text-secondary); margin-bottom:14px;">
        Total: <strong style="color:#fff;">${r.length}</strong> tarjetas registradas
      </div>

      <!-- Cards Grid -->
      <div style="display:flex; flex-direction:column; gap:12px;" id="lib-cards-mount">
        ${r.map(e=>`
          <div class="figma-card-item apple-glass-panel selectable-card-target" data-lib-card-id="${e.id}" data-lib-deck-id="${e.deckId}" style="cursor:pointer;" title="Toca para estudiar esta tarjeta">
            <div class="figma-card-top-tag-row" style="margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="figma-tag-invertido" style="font-size:0.75rem; padding:2px 8px;">
                  ${e.isInverted?"<span>⇄ Invertida</span>":e.type==="latex"?"<span>📐 LaTeX</span>":"<span>Estándar</span>"}
                </div>
                <span class="micro-study-badge" title="Estudiar">🎯</span>
              </div>

              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn-lib-card-edit" data-edit-id="${e.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.85rem; font-weight:700;">✏️</button>
                <button class="btn-lib-card-del" data-del-id="${e.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; font-weight:700;">🗑️</button>
              </div>
            </div>

            <div class="figma-card-title-bold">${Be.parseAndRender(e.front)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Co(r,e){var t;(t=r.querySelector("#btn-lib-add-card"))==null||t.addEventListener("click",()=>e.onAddCard()),r.querySelectorAll(".selectable-card-target").forEach(a=>{a.addEventListener("click",i=>{const n=i.target;if(n.classList.contains("btn-lib-card-edit")||n.classList.contains("btn-lib-card-del"))return;const o=a.dataset.libCardId,l=a.dataset.libDeckId;o&&l&&e.onStudySpecificCard(l,o)})}),r.querySelectorAll(".btn-lib-card-edit").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation();const n=a.dataset.editId;n&&e.onEditCard(n)})}),r.querySelectorAll(".btn-lib-card-del").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation();const n=a.dataset.delId;n&&me.showConfirm({title:"Eliminar Tarjeta",message:"¿Estás seguro de eliminar esta tarjeta definitivamente?",confirmText:"Eliminar",isDanger:!0,onConfirm:()=>{j.deleteCard(n)}})})})}function Ao(r){const e=r.settings.algorithmType==="fsrs"?"FSRS (Inteligente)":r.settings.algorithmType==="quick"?"Revisión rápida":r.settings.algorithmType==="languages"?"Aprendizaje de idiomas":r.settings.algorithmType==="medical"?"Aprendizaje médico":r.settings.algorithmType==="general"?"Repaso espaciado general":"Personalizado";return`
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-deck-settings-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Ajustes del Mazo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll">
        
        <div style="margin-bottom:12px;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">${r.name}</h2>
          <p style="font-size:0.88rem; color:var(--f-text-secondary);">Configura los parámetros de repetición espaciada</p>
        </div>

        <!-- Inset Grouped Container (Foto 1) -->
        <div class="apple-card-grouped" style="margin-bottom:20px;">
          
          <!-- Row 1: Algoritmo -->
          <div class="apple-list-row" id="row-view-select-algo" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="apple-icon-circle-sm" style="background:rgba(56,189,248,0.15); color:var(--f-blue);">
                ⥯
              </div>
              <span style="font-size:1.05rem; font-weight:700; color:#fff;">${e}</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <!-- Row 2: Tarjetas nuevas por día -->
          <div class="apple-list-row" id="row-view-new-cards" style="cursor:pointer;">
            <span style="font-size:1rem; font-weight:600; color:#fff;">Tarjetas nuevas por día</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-view-new-cards">${r.settings.newCardsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Row 3: Máximo de tarjetas por día -->
          <div class="apple-list-row" id="row-view-max-cards" style="cursor:pointer;">
            <span style="font-size:1rem; font-weight:600; color:#fff;">Máximo de tarjetas por día</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-view-max-cards">${r.settings.maxReviewsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
        <button class="ios-back-btn" id="btn-deck-settings-back">
          <span class="ios-back-chevron">‹</span> Mazo
        </button>
        <h1 class="ios-nav-title">Opciones</h1>
        <button class="ios-action-btn" id="btn-open-advanced-sheet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>

      <!-- Scrollable Settings List -->
      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:20px;">

        <!-- Group 1: General & Algoritmo -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-algo-selector">
            <span class="apple-list-label">Algoritmo de aprendizaje</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-algo-label">${e}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row">
            <span class="apple-list-label">Mezclar tarjetas</span>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-view-mix-cards" ${r.settings.mixCards?"checked":""} />
              <span class="apple-slider"></span>
            </label>
          </div>
        </div>

        <!-- Group 2: Límites Diarios -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-new-cards">
            <span class="apple-list-label">Tarjetas nuevas por día</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-new-cards">${r.settings.newCardsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="row-view-max-cards">
            <span class="apple-list-label">Máximo de tarjetas por día</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-max-cards">${r.settings.maxReviewsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Group 3: Minijuegos de Descanso -->
        <div class="apple-card-grouped">
          <div class="apple-list-row">
            <div>
              <span class="apple-list-label" style="display:block;">🎮 Minijuegos de descanso</span>
              <span style="font-size:0.75rem; color:var(--f-text-muted); display:block;">Sin carga alostática ni fatiga cognitiva</span>
            </div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-view-microgames" ${r.settings.enableMicroGames!==!1?"checked":""} />
              <span class="apple-slider"></span>
            </label>
          </div>

          <div class="apple-list-row" id="row-view-microgame-freq">
            <span class="apple-list-label">Frecuencia de juego</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-microgame-freq">
                ${(r.settings.microGameInterval||5)===0?"Desactivado":`Cada ${r.settings.microGameInterval||5} tarjetas`}
              </span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `}function To(r,e,t){var n,o,l,c,m,h;(n=r.querySelector("#btn-deck-settings-back"))==null||n.addEventListener("click",()=>t.onBack()),(o=r.querySelector("#btn-open-advanced-sheet"))==null||o.addEventListener("click",()=>t.onOpenAdvancedMenu()),(l=r.querySelector("#row-view-algo-selector"))==null||l.addEventListener("click",()=>t.onOpenAlgorithmSelector());const a=r.querySelector("#toggle-view-mix-cards");a==null||a.addEventListener("change",()=>{j.updateDeck(e.id,{settings:{...e.settings,mixCards:a.checked}})});const i=r.querySelector("#toggle-view-microgames");i==null||i.addEventListener("change",()=>{j.updateDeck(e.id,{settings:{...e.settings,enableMicroGames:i.checked}})}),(c=r.querySelector("#row-view-microgame-freq"))==null||c.addEventListener("click",()=>{me.showPrompt({title:"Frecuencia de Minijuegos",message:"¿Cada cuántas tarjetas deseas una pausa de minijuego? (ej: 5, 10, 15, 20 o 0 para desactivar)",defaultValue:String(e.settings.microGameInterval!==void 0?e.settings.microGameInterval:5),inputType:"number",confirmText:"Guardar",onConfirm:f=>{if(f!==null&&!isNaN(Number(f))){const y=Math.max(0,parseInt(f,10));j.updateDeck(e.id,{settings:{...e.settings,microGameInterval:y,enableMicroGames:y>0}});const g=r.querySelector("#val-view-microgame-freq");g&&(g.textContent=y===0?"Desactivado":`Cada ${y} tarjetas`)}}})}),(m=r.querySelector("#row-view-new-cards"))==null||m.addEventListener("click",()=>{me.showPrompt({title:"Tarjetas Nuevas por Día",defaultValue:String(e.settings.newCardsPerDay),inputType:"number",confirmText:"Guardar",onConfirm:f=>{if(f&&!isNaN(Number(f))){const y=Math.max(1,parseInt(f,10));j.updateDeck(e.id,{settings:{...e.settings,newCardsPerDay:y}});const g=r.querySelector("#val-view-new-cards");g&&(g.textContent=String(y))}}})}),(h=r.querySelector("#row-view-max-cards"))==null||h.addEventListener("click",()=>{me.showPrompt({title:"Máximo de Tarjetas por Día",defaultValue:String(e.settings.maxReviewsPerDay),inputType:"number",confirmText:"Guardar",onConfirm:f=>{if(f&&!isNaN(Number(f))){const y=Math.max(1,parseInt(f,10));j.updateDeck(e.id,{settings:{...e.settings,maxReviewsPerDay:y}});const g=r.querySelector("#val-view-max-cards");g&&(g.textContent=String(y))}}})})}function Eo(r){return`
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-adv-view-back">
          <span class="ios-back-chevron">‹</span> Ajustes
        </button>
        <h1 class="ios-nav-title">Opciones de Mazo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Group 1: Algoritmo -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-algo" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="apple-icon-circle-sm" style="background:rgba(56,189,248,0.15); color:var(--f-blue);">
                ⥯
              </div>
              <div>
                <div style="font-size:1.02rem; font-weight:700; color:#fff;">Personalizado</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">Ajustes predeterminados del algoritmo</div>
              </div>
            </div>
            <span class="apple-chevron">›</span>
          </div>
        </div>

        <!-- Group 2: Audio, Tema & Estilo -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-theme" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🎨</span>
              <div>
                <div style="font-size:1.02rem; font-weight:600; color:#fff;">Tema Visual y Fondo de la App</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">OLED, Liquid Glass o Emerald</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-size:0.92rem; font-weight:700; text-transform:capitalize;" id="lbl-active-theme">${localStorage.getItem("eureka_theme")||"oled"}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-tts" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🔊</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Texto a voz</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-text-secondary); font-size:0.9rem;">${r.settings.ttsVoiceLang}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>
        </div>

        <!-- Group 3: Compartir y Biblioteca -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-share" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬆</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Compartir mazo</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-text-secondary); font-size:0.9rem;">Off</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-publish" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🖫</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Publicar en la biblioteca</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>
        </div>

        <!-- Group 4: Acciones Avanzadas -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-ai" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem; color:#ec4899;">✨</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Generar tarjetas con IA</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="apple-badge-beta">Beta</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-import" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬇</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Importar tarjetas</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-rename" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">✏️</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Cambiar el nombre del mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-move" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">↪</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Mover mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-duplicate" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🗎</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Duplicar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-reset" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">↺</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Restablecer progreso</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-archive" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">📥</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Archivar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-export" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬆</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Exportar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-delete" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem; color:#ef4444;">🗑️</span>
              <span style="font-size:1.02rem; font-weight:700; color:#ef4444;">Eliminar mazo</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `}function Io(r,e,t){var a,i,n,o,l,c,m,h,f,y,g,C;(a=r.querySelector("#btn-adv-view-back"))==null||a.addEventListener("click",()=>t.onBack()),(i=r.querySelector("#adv-view-row-algo"))==null||i.addEventListener("click",()=>t.onOpenAlgorithmSelector()),(n=r.querySelector("#adv-view-row-ai"))==null||n.addEventListener("click",()=>t.onOpenAiBuilder()),(o=r.querySelector("#adv-view-row-import"))==null||o.addEventListener("click",()=>t.onOpenBatchImport()),(l=r.querySelector("#adv-view-row-theme"))==null||l.addEventListener("click",()=>{const z=["oled","glass","emerald"],k=localStorage.getItem("eureka_theme")||"oled",M=(z.indexOf(k)+1)%z.length,A=z[M];localStorage.setItem("eureka_theme",A),document.body.className="",document.body.classList.add(`theme-${A}`);const D=r.querySelector("#lbl-active-theme");D&&(D.textContent=A)}),(c=r.querySelector("#adv-view-row-rename"))==null||c.addEventListener("click",()=>{me.showPrompt({title:"Renombrar Mazo",defaultValue:e.name,confirmText:"Guardar",onConfirm:z=>{z&&z.trim()&&(j.renameDeck(e.id,z.trim()),t.onActionCompleted())}})}),(m=r.querySelector("#adv-view-row-duplicate"))==null||m.addEventListener("click",()=>{j.duplicateDeck(e.id),t.onActionCompleted()}),(h=r.querySelector("#adv-view-row-reset"))==null||h.addEventListener("click",()=>{me.showConfirm({title:"Restablecer Progreso",message:`¿Estás seguro de restablecer todo el progreso de estudio en "${e.name}"? Todas las tarjetas volverán al estado nuevo.`,confirmText:"Restablecer",isDanger:!0,onConfirm:()=>{j.resetDeckProgress(e.id),t.onActionCompleted()}})}),(f=r.querySelector("#adv-view-row-archive"))==null||f.addEventListener("click",()=>{me.showConfirm({title:"Archivar Mazo",message:`¿Deseas archivar el mazo "${e.name}"?`,confirmText:"Archivar",onConfirm:()=>{j.archiveDeck(e.id),t.onActionCompleted()}})}),(y=r.querySelector("#adv-view-row-export"))==null||y.addEventListener("click",()=>{const z=j.exportDeck(e.id),k=new Blob([z],{type:"application/json"}),M=URL.createObjectURL(k),A=document.createElement("a");A.href=M,A.download=`${e.name.toLowerCase().replace(/\s+/g,"_")}_backup.json`,A.click()}),(g=r.querySelector("#adv-view-row-delete"))==null||g.addEventListener("click",()=>{me.showConfirm({title:"Eliminar Mazo Definitivamente",message:`¿ELIMINAR DEFINITIVAMENTE el mazo "${e.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`,confirmText:"Eliminar Mazo",isDanger:!0,onConfirm:()=>{j.deleteDeck(e.id),t.onActionCompleted()}})}),(C=r.querySelector("#adv-view-row-tts"))==null||C.addEventListener("click",()=>{me.showPrompt({title:"Voz y Pronunciación (TTS)",message:"Código de idioma de voz (ej: es-ES, en-US, fr-FR, de-DE, ja-JP):",defaultValue:e.settings.ttsVoiceLang||"es-ES",confirmText:"Guardar Idioma",onConfirm:z=>{z&&z.trim()&&(j.updateDeck(e.id,{settings:{...e.settings,ttsVoiceLang:z.trim()}}),t.onActionCompleted())}})})}function Do(r){const e=r.settings.algorithmType||"custom";return`
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-algo-view-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Elegir algoritmo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Option 1: FSRS -->
        <div class="apple-algo-card ${e==="fsrs"?"selected":""}" data-algo-key="fsrs">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="apple-algo-icon">🗎</span>
              <span class="apple-algo-title">Repetición espaciada inteligente (FSRS)</span>
              <span class="apple-badge-beta">Beta</span>
            </div>
            <input type="checkbox" class="apple-checkbox" ${e==="fsrs"?"checked":""} readonly />
          </div>
          <p class="apple-algo-desc">
            El algoritmo de programación más reciente y avanzado: aprende tus patrones de memoria personales y programa cada repaso justo para el momento en que estás a punto de olvidar, para que recuerdes más con menos repasos.
          </p>
        </div>

        <!-- Option 2: Revisión rápida -->
        <div class="apple-algo-card ${e==="quick"?"selected":""}" data-algo-key="quick">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="apple-algo-icon">🗎</span>
              <span class="apple-algo-title">Revisión rápida</span>
            </div>
            <input type="checkbox" class="apple-checkbox" ${e==="quick"?"checked":""} readonly />
          </div>
          <p class="apple-algo-desc">
            Revisa tarjetas sin ningún horario, solo una por una. Las tarjetas siempre están disponibles para estudiar cuando lo desees, lo que te permite repasar el material a tu propio ritmo sin seguir los intervalos de repaso espaciado.
          </p>
        </div>

        <!-- Option 3: Repaso espaciado general -->
        <div class="apple-algo-card ${e==="general"?"selected":""}" data-algo-key="general">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="apple-algo-icon">🗎</span>
              <span class="apple-algo-title">Repaso espaciado general</span>
            </div>
            <input type="checkbox" class="apple-checkbox" ${e==="general"?"checked":""} readonly />
          </div>
          <p class="apple-algo-desc">
            Un sistema inteligente que programa las revisiones según qué tan bien recuerdas cada tarjeta. Las tarjetas fáciles aparecen con menos frecuencia, mientras que las más difíciles se muestran más seguido, ayudándote a aprender de forma eficiente y a retener el conocimiento a largo plazo.
          </p>
        </div>

        <!-- Option 4: Aprendizaje de idiomas -->
        <div class="apple-algo-card ${e==="languages"?"selected":""}" data-algo-key="languages">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="apple-algo-icon" style="color:#38bdf8;">🔤</span>
              <span class="apple-algo-title">Aprendizaje de idiomas</span>
            </div>
            <span style="font-size:0.9rem; color:var(--f-blue);">🔓</span>
          </div>
          <div style="margin-bottom:8px;">
            <span class="apple-badge-subpill">+ Repaso espaciado</span>
          </div>
          <p class="apple-algo-desc">
            Una variación de repaso espaciado diseñada para aprender palabras nuevas. Las nuevas tarjetas se muestran con frecuencia al principio y luego se repasan en intervalos más largos para ayudarte a recordarlas a largo plazo.
          </p>
        </div>

        <!-- Option 5: Aprendizaje médico -->
        <div class="apple-algo-card ${e==="medical"?"selected":""}" data-algo-key="medical">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="apple-algo-icon" style="color:#38bdf8;">⚕️</span>
              <span class="apple-algo-title">Aprendizaje médico</span>
            </div>
            <span style="font-size:0.9rem; color:var(--f-blue);">🔓</span>
          </div>
          <div style="margin-bottom:8px;">
            <span class="apple-badge-subpill">+ Repaso espaciado</span>
          </div>
          <p class="apple-algo-desc">
            Este ajuste predeterminado de repaso espaciado se basa en técnicas utilizadas por estudiantes de medicina de alto rendimiento. Elimina los límites diarios y evita la repetición excesiva de tarjetas, ayudándote a cubrir grandes volúmenes de material de manera eficiente a corto plazo.
          </p>
        </div>

        <!-- Botón para personalizar los 12 pasos exactos (Foto 4) -->
        <button class="apple-btn-secondary" id="btn-view-custom-phases" style="width:100%; padding:16px; border-radius:16px; margin-top:8px; font-weight:700; font-size:1.02rem;">
          ⚙️ Personalizar Escalera de Fases (12 Pasos)
        </button>

      </div>

    </div>
  `}function Bo(r,e,t){var a,i;(a=r.querySelector("#btn-algo-view-back"))==null||a.addEventListener("click",()=>t.onBack()),(i=r.querySelector("#btn-view-custom-phases"))==null||i.addEventListener("click",()=>t.onOpenCustomLearningPhases()),r.querySelectorAll(".apple-algo-card").forEach(n=>{n.addEventListener("click",()=>{const o=n.dataset.algoKey;o&&(j.updateDeck(e.id,{settings:{...e.settings,algorithmType:o}}),t.onSaved())})})}function Lo(r){return`
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-learning-phase-back">
          <span class="ios-back-chevron">‹</span> Algoritmo
        </button>
        <h1 class="ios-nav-title">Fase de aprendizaje</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="apple-btn-outline-pill" id="btn-view-how-it-works" style="font-weight:700;">
            ¿Cómo funciona el algoritmo?
          </button>
          <span style="font-size:0.85rem; color:var(--f-text-secondary); font-weight:700;">${r.name}</span>
        </div>

        <div>
          <h2 style="font-size:1.6rem; font-weight:800; color:#ffffff; margin-bottom:6px; letter-spacing:-0.02em;">Fase de aprendizaje</h2>
          <div style="font-size:1.02rem; font-weight:700; color:#fff; margin-bottom:4px;">Pasos del aprendizaje</div>
          <p style="font-size:0.86rem; color:var(--f-text-secondary); line-height:1.5;">
            Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos de longitud fija. Cuando presionas <strong style="color:var(--f-green);">Bien</strong>, la tarjeta pasa al siguiente paso de aprendizaje hasta que se gradúa.
          </p>
        </div>

        <!-- Steps List (Foto 4) -->
        <div id="learning-phase-steps-container" class="apple-card-grouped" style="padding:4px 0;">
        </div>

        <!-- Add step button -->
        <button class="apple-btn-secondary" id="btn-view-add-step" style="padding:14px; border-radius:14px; font-weight:700; font-size:0.95rem;">
          + Agregar paso de revisión
        </button>

        <!-- Save button -->
        <div style="margin-top:12px; padding-bottom:30px;">
          <button class="apple-btn-primary" id="btn-view-save-steps" style="width:100%; padding:16px; border-radius:16px; font-size:1.05rem; justify-content:center; background:var(--f-blue); color:#07080a; font-weight:800;">
            🔒 Guardar los cambios
          </button>
        </div>

      </div>

    </div>
  `}function qo(r,e,t){var o,l,c,m;(o=r.querySelector("#btn-learning-phase-back"))==null||o.addEventListener("click",()=>t.onBack());let a=e.settings.learningSteps&&e.settings.learningSteps.length>0?[...e.settings.learningSteps]:[4,1440,2880,7200,15840,25920,41760,82080,146880,246240,400320,633600];const i=r.querySelector("#learning-phase-steps-container"),n=()=>{i&&(i.innerHTML=a.map((h,f)=>`
      <div class="apple-list-row apple-step-editable-row" data-step-index="${f}" style="cursor:pointer;">
        <div style="font-size:1.02rem; font-weight:600; color:#ffffff;">
          Revisión ${f+1}: <span style="color:var(--f-blue); font-weight:800; margin-left:6px;" id="step-label-${f}">${_t.formatMinutesToHuman(h)}</span>
        </div>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="apple-btn-outline-pill btn-quick-edit-step" data-step-index="${f}" style="padding:4px 10px; font-size:0.75rem;">Editar</button>
          ${f>0?`<button class="apple-icon-del-btn btn-del-step" data-step-index="${f}" title="Eliminar paso">×</button>`:'<span style="width:28px;"></span>'}
        </div>
      </div>
    `).join(""),i.querySelectorAll(".apple-step-editable-row").forEach(h=>{h.addEventListener("click",f=>{if(f.target.classList.contains("btn-del-step"))return;const y=parseInt(h.dataset.stepIndex||"0",10);me.showIntervalPicker({title:`Modificar Revisión ${y+1}`,subtitle:"Ajusta el tiempo exacto en días, horas y minutos:",initialMinutes:a[y],onConfirm:g=>{a[y]=g,n()}})})}),i.querySelectorAll(".btn-del-step").forEach(h=>{h.addEventListener("click",f=>{f.stopPropagation();const y=parseInt(h.dataset.stepIndex||"0",10);a.splice(y,1),n()})}))};n(),(l=r.querySelector("#btn-view-add-step"))==null||l.addEventListener("click",()=>{me.showIntervalPicker({title:"Agregar Nuevo Paso de Revisión",subtitle:"Configura el intervalo para el nuevo escalón:",initialMinutes:864e3,onConfirm:h=>{a.push(h),n()}})}),(c=r.querySelector("#btn-view-how-it-works"))==null||c.addEventListener("click",()=>{me.showAlert({title:"¿Cómo funciona el algoritmo?",message:`1. Cada tarjeta inicia en la Revisión 1.
2. Al calificar "Bien" o "Fácil", la tarjeta avanza secuencialmente al siguiente escalón de repaso.
3. Al responder "Muy Difícil", regresa al paso 1 para consolidar la retención.
4. Puedes personalizar cualquiera de los pasos tocando sobre él y ajustando días, horas o minutos.`})}),(m=r.querySelector("#btn-view-save-steps"))==null||m.addEventListener("click",()=>{j.updateDeck(e.id,{settings:{...e.settings,algorithmType:"custom",learningSteps:a}}),t.onSaved()})}function $o(){const r=$t.getTheme();return`
    <div class="ios-fullscreen-view">
      
      <!-- iOS Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-app-settings-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Personalización & Estilo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:20px; padding-bottom:40px;">
        
        <div>
          <h2 style="font-size:1.8rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Atmósfera & Estilo Visual</h2>
          <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-top:4px;">Diseño moderno futurista con gradientes y mallas cromáticas</p>
        </div>

        <!-- 1. Atmósferas y Fondos Futuristas -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Atmósfera y Fondo de la App
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
            
            <div class="theme-preset-card ${r.bgTheme==="modern_black"?"selected":""}" data-bg="modern_black">
              <div class="theme-preview-box preview-modern-black">
                <span class="theme-badge-glow">Default</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Modern Lead Black</div>
                <div class="theme-card-desc">Plomo oscuro elegante y sutil, estilo Noji/AnkiPro nativo</div>
              </div>
            </div>

            <div class="theme-preset-card ${r.bgTheme==="holo_cyber"?"selected":""}" data-bg="holo_cyber">
              <div class="theme-preview-box preview-holo-cyber">
                <span class="theme-badge-glow" style="background:#ec4899;">Holo 3D</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Holo Prism Chrome</div>
                <div class="theme-card-desc">Efecto holográfico iridiscente con mallas de color</div>
              </div>
            </div>

            <div class="theme-preset-card ${r.bgTheme==="digital_blue"?"selected":""}" data-bg="digital_blue">
              <div class="theme-preview-box preview-digital-blue">
                <span class="theme-badge-glow" style="background:#38bdf8;">Digital</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Digital Technology</div>
                <div class="theme-card-desc">Aura azul eléctrico y cian futurista profundo</div>
              </div>
            </div>

            <div class="theme-preset-card ${r.bgTheme==="emerald_vision"?"selected":""}" data-bg="emerald_vision">
              <div class="theme-preview-box preview-emerald-vision">
                <span class="theme-badge-glow" style="background:#10b981;">Vision</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Vision Emerald</div>
                <div class="theme-card-desc">Anillo de luz verde neón y esmeralda cósmico</div>
              </div>
            </div>

            <div class="theme-preset-card ${r.bgTheme==="sunset_magenta"?"selected":""}" data-bg="sunset_magenta">
              <div class="theme-preview-box preview-sunset-magenta">
                <span class="theme-badge-glow" style="background:#a855f7;">Unlocking</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Sunset Magenta</div>
                <div class="theme-card-desc">Gradiente violeta, púrpura y magenta resplandeciente</div>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. Color de Acento -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Color de Acento de Botones y Resaltados
          </div>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <button class="theme-color-circle ${r.accentName==="blue"?"active":""}" data-accent="blue" style="background:linear-gradient(135deg, #38bdf8, #0284c7);" title="Cyber Blue"></button>
            <button class="theme-color-circle ${r.accentName==="green"?"active":""}" data-accent="green" style="background:linear-gradient(135deg, #10b981, #059669);" title="Neon Emerald"></button>
            <button class="theme-color-circle ${r.accentName==="purple"?"active":""}" data-accent="purple" style="background:linear-gradient(135deg, #a855f7, #7e22ce);" title="Electric Purple"></button>
            <button class="theme-color-circle ${r.accentName==="amber"?"active":""}" data-accent="amber" style="background:linear-gradient(135deg, #f59e0b, #d97706);" title="Sunset Amber"></button>
            <button class="theme-color-circle ${r.accentName==="pink"?"active":""}" data-accent="pink" style="background:linear-gradient(135deg, #ec4899, #be185d);" title="Coral Pink"></button>
            <button class="theme-color-circle ${r.accentName==="red"?"active":""}" data-accent="red" style="background:linear-gradient(135deg, #ef4444, #b91c1c);" title="Crimson"></button>
          </div>
        </div>

        <!-- 3. Formas y Bordes de las Tarjetas -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Formas y Bordes de las Flashcards
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px;">
            <button class="apple-btn-outline-pill ${r.cardRadius==="super_rounded"?"active-pill":""}" data-radius="super_rounded" style="padding:16px 12px; font-weight:800; text-align:center;">
              Super Redondo (28px)
            </button>
            <button class="apple-btn-outline-pill ${r.cardRadius==="standard"?"active-pill":""}" data-radius="standard" style="padding:16px 12px; font-weight:800; text-align:center;">
              Estándar iOS (18px)
            </button>
            <button class="apple-btn-outline-pill ${r.cardRadius==="sharp"?"active-pill":""}" data-radius="sharp" style="padding:16px 12px; font-weight:800; text-align:center;">
              Futurista Recto (10px)
            </button>
          </div>
        </div>

        <!-- 4. Escala Táctil de Botones Grandes -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Tamaño de Botones y Ergonomía Táctil
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
            <button class="apple-btn-secondary ${r.uiScale==="comfortable"?"active-pill":""}" data-scale="comfortable" style="padding:18px; border-radius:18px; font-weight:800; font-size:1.05rem;">
              ✨ Cómodo y Grande (Recomendado)
            </button>
            <button class="apple-btn-secondary ${r.uiScale==="normal"?"active-pill":""}" data-scale="normal" style="padding:18px; border-radius:18px; font-weight:800; font-size:1.05rem;">
              Normal
            </button>
          </div>
        </div>

      </div>

    </div>
  `}function Ro(r,e){var t;(t=r.querySelector("#btn-app-settings-back"))==null||t.addEventListener("click",()=>e.onBack()),r.querySelectorAll(".theme-color-circle").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.accent;i&&($t.setTheme({accentName:i}),r.querySelectorAll(".theme-color-circle").forEach(n=>n.classList.remove("active")),a.classList.add("active"),e.onThemeChanged())})}),r.querySelectorAll(".theme-preset-card").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.bg;i&&($t.setTheme({bgTheme:i}),r.querySelectorAll(".theme-preset-card").forEach(n=>n.classList.remove("selected")),a.classList.add("selected"),e.onThemeChanged())})}),r.querySelectorAll("button[data-radius]").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.radius;i&&($t.setTheme({cardRadius:i}),r.querySelectorAll("button[data-radius]").forEach(n=>n.classList.remove("active-pill")),a.classList.add("active-pill"),e.onThemeChanged())})}),r.querySelectorAll("button[data-scale]").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.scale;i&&($t.setTheme({uiScale:i}),r.querySelectorAll("button[data-scale]").forEach(n=>n.classList.remove("active-pill")),a.classList.add("active-pill"),e.onThemeChanged())})})}var Qa={};(function r(e,t,a,i){var n=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.OffscreenCanvasRenderingContext2D&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL),o=typeof Path2D=="function"&&typeof DOMMatrix=="function",l=(function(){if(!e.OffscreenCanvas)return!1;try{var S=new OffscreenCanvas(1,1),x=S.getContext("2d");x.fillRect(0,0,1,1);var N=S.transferToImageBitmap();x.createPattern(N,"no-repeat")}catch{return!1}return!0})();function c(){}function m(S){var x=t.exports.Promise,N=x!==void 0?x:e.Promise;return typeof N=="function"?new N(S):(S(c,c),null)}var h=(function(S,x){return{transform:function(N){if(S)return N;if(x.has(N))return x.get(N);var T=new OffscreenCanvas(N.width,N.height),O=T.getContext("2d");return O.drawImage(N,0,0),x.set(N,T),T},clear:function(){x.clear()}}})(l,new Map),f=(function(){var S=Math.floor(16.666666666666668),x,N,T={},O=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(x=function(P){var W=Math.random();return T[W]=requestAnimationFrame(function H(Z){O===Z||O+S-1<Z?(O=Z,delete T[W],P()):T[W]=requestAnimationFrame(H)}),W},N=function(P){T[P]&&cancelAnimationFrame(T[P])}):(x=function(P){return setTimeout(P,S)},N=function(P){return clearTimeout(P)}),{frame:x,cancel:N}})(),y=(function(){var S,x,N={};function T(O){function P(W,H){O.postMessage({options:W||{},callback:H})}O.init=function(H){var Z=H.transferControlToOffscreen();O.postMessage({canvas:Z},[Z])},O.fire=function(H,Z,te){if(x)return P(H,null),x;var be=Math.random().toString(36).slice(2);return x=m(function(ve){function ye(Me){Me.data.callback===be&&(delete N[be],O.removeEventListener("message",ye),x=null,h.clear(),te(),ve())}O.addEventListener("message",ye),P(H,be),N[be]=ye.bind(null,{data:{callback:be}})}),x},O.reset=function(){O.postMessage({reset:!0});for(var H in N)N[H](),delete N[H]}}return function(){if(S)return S;if(!a&&n){var O=["var CONFETTI, SIZE = {}, module = {};","("+r.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{S=new Worker(URL.createObjectURL(new Blob([O])))}catch(P){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",P),null}T(S)}return S}})(),g={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function C(S,x){return x?x(S):S}function z(S){return S!=null}function k(S,x,N){return C(S&&z(S[x])?S[x]:g[x],N)}function M(S){return S<0?0:Math.floor(S)}function A(S,x){return Math.floor(Math.random()*(x-S))+S}function D(S){return parseInt(S,16)}function $(S){return S.map(Y)}function Y(S){var x=String(S).replace(/[^0-9a-f]/gi,"");return x.length<6&&(x=x[0]+x[0]+x[1]+x[1]+x[2]+x[2]),{r:D(x.substring(0,2)),g:D(x.substring(2,4)),b:D(x.substring(4,6))}}function Q(S){var x=k(S,"origin",Object);return x.x=k(x,"x",Number),x.y=k(x,"y",Number),x}function X(S){S.width=document.documentElement.clientWidth,S.height=document.documentElement.clientHeight}function K(S){var x=S.getBoundingClientRect();S.width=x.width,S.height=x.height}function R(S){var x=document.createElement("canvas");return x.style.position="fixed",x.style.top="0px",x.style.left="0px",x.style.pointerEvents="none",x.style.zIndex=S,x}function J(S,x,N,T,O,P,W,H,Z){S.save(),S.translate(x,N),S.rotate(P),S.scale(T,O),S.arc(0,0,1,W,H,Z),S.restore()}function ie(S){var x=S.angle*(Math.PI/180),N=S.spread*(Math.PI/180);return{x:S.x,y:S.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:S.startVelocity*.5+Math.random()*S.startVelocity,angle2D:-x+(.5*N-Math.random()*N),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:S.color,shape:S.shape,tick:0,totalTicks:S.ticks,decay:S.decay,drift:S.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:S.gravity*3,ovalScalar:.6,scalar:S.scalar,flat:S.flat}}function G(S,x){x.x+=Math.cos(x.angle2D)*x.velocity+x.drift,x.y+=Math.sin(x.angle2D)*x.velocity+x.gravity,x.velocity*=x.decay,x.flat?(x.wobble=0,x.wobbleX=x.x+10*x.scalar,x.wobbleY=x.y+10*x.scalar,x.tiltSin=0,x.tiltCos=0,x.random=1):(x.wobble+=x.wobbleSpeed,x.wobbleX=x.x+10*x.scalar*Math.cos(x.wobble),x.wobbleY=x.y+10*x.scalar*Math.sin(x.wobble),x.tiltAngle+=.1,x.tiltSin=Math.sin(x.tiltAngle),x.tiltCos=Math.cos(x.tiltAngle),x.random=Math.random()+2);var N=x.tick++/x.totalTicks,T=x.x+x.random*x.tiltCos,O=x.y+x.random*x.tiltSin,P=x.wobbleX+x.random*x.tiltCos,W=x.wobbleY+x.random*x.tiltSin;if(S.fillStyle="rgba("+x.color.r+", "+x.color.g+", "+x.color.b+", "+(1-N)+")",S.beginPath(),o&&x.shape.type==="path"&&typeof x.shape.path=="string"&&Array.isArray(x.shape.matrix))S.fill(le(x.shape.path,x.shape.matrix,x.x,x.y,Math.abs(P-T)*.1,Math.abs(W-O)*.1,Math.PI/10*x.wobble));else if(x.shape.type==="bitmap"){var H=Math.PI/10*x.wobble,Z=Math.abs(P-T)*.1,te=Math.abs(W-O)*.1,be=x.shape.bitmap.width*x.scalar,ve=x.shape.bitmap.height*x.scalar,ye=new DOMMatrix([Math.cos(H)*Z,Math.sin(H)*Z,-Math.sin(H)*te,Math.cos(H)*te,x.x,x.y]);ye.multiplySelf(new DOMMatrix(x.shape.matrix));var Me=S.createPattern(h.transform(x.shape.bitmap),"no-repeat");Me.setTransform(ye),S.globalAlpha=1-N,S.fillStyle=Me,S.fillRect(x.x-be/2,x.y-ve/2,be,ve),S.globalAlpha=1}else if(x.shape==="circle")S.ellipse?S.ellipse(x.x,x.y,Math.abs(P-T)*x.ovalScalar,Math.abs(W-O)*x.ovalScalar,Math.PI/10*x.wobble,0,2*Math.PI):J(S,x.x,x.y,Math.abs(P-T)*x.ovalScalar,Math.abs(W-O)*x.ovalScalar,Math.PI/10*x.wobble,0,2*Math.PI);else if(x.shape==="star")for(var de=Math.PI/2*3,De=4*x.scalar,Oe=8*x.scalar,He=x.x,Xe=x.y,Ze=5,qe=Math.PI/Ze;Ze--;)He=x.x+Math.cos(de)*Oe,Xe=x.y+Math.sin(de)*Oe,S.lineTo(He,Xe),de+=qe,He=x.x+Math.cos(de)*De,Xe=x.y+Math.sin(de)*De,S.lineTo(He,Xe),de+=qe;else S.moveTo(Math.floor(x.x),Math.floor(x.y)),S.lineTo(Math.floor(x.wobbleX),Math.floor(O)),S.lineTo(Math.floor(P),Math.floor(W)),S.lineTo(Math.floor(T),Math.floor(x.wobbleY));return S.closePath(),S.fill(),x.tick<x.totalTicks}function F(S,x,N,T,O){var P=x.slice(),W=S.getContext("2d"),H,Z,te=m(function(be){function ve(){H=Z=null,W.clearRect(0,0,T.width,T.height),h.clear(),O(),be()}function ye(){a&&!(T.width===i.width&&T.height===i.height)&&(T.width=S.width=i.width,T.height=S.height=i.height),!T.width&&!T.height&&(N(S),T.width=S.width,T.height=S.height),W.clearRect(0,0,T.width,T.height),P=P.filter(function(Me){return G(W,Me)}),P.length?H=f.frame(ye):ve()}H=f.frame(ye),Z=ve});return{addFettis:function(be){return P=P.concat(be),te},canvas:S,promise:te,reset:function(){H&&f.cancel(H),Z&&Z()}}}function _(S,x){var N=!S,T=!!k(x||{},"resize"),O=!1,P=k(x,"disableForReducedMotion",Boolean),W=n&&!!k(x||{},"useWorker"),H=W?y():null,Z=N?X:K,te=S&&H?!!S.__confetti_initialized:!1,be=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,ve;function ye(de,De,Oe){for(var He=k(de,"particleCount",M),Xe=k(de,"angle",Number),Ze=k(de,"spread",Number),qe=k(de,"startVelocity",Number),Rr=k(de,"decay",Number),Pr=k(de,"gravity",Number),Wt=k(de,"drift",Number),Xt=k(de,"colors",$),ir=k(de,"ticks",Number),nr=k(de,"shapes"),Fr=k(de,"scalar"),Lt=!!k(de,"flat"),bt=Q(de),_a=He,jr=[],Ki=S.width*bt.x,Zi=S.height*bt.y;_a--;)jr.push(ie({x:Ki,y:Zi,angle:Xe,spread:Ze,startVelocity:qe,color:Xt[_a%Xt.length],shape:nr[A(0,nr.length)],ticks:ir,decay:Rr,gravity:Pr,drift:Wt,scalar:Fr,flat:Lt}));return ve?ve.addFettis(jr):(ve=F(S,jr,Z,De,Oe),ve.promise)}function Me(de){var De=P||k(de,"disableForReducedMotion",Boolean),Oe=k(de,"zIndex",Number);if(De&&be)return m(function(qe){qe()});N&&ve?S=ve.canvas:N&&!S&&(S=R(Oe),document.body.appendChild(S)),T&&!te&&Z(S);var He={width:S.width,height:S.height};H&&!te&&H.init(S),te=!0,H&&(S.__confetti_initialized=!0);function Xe(){if(H){var qe={getBoundingClientRect:function(){if(!N)return S.getBoundingClientRect()}};Z(qe),H.postMessage({resize:{width:qe.width,height:qe.height}});return}He.width=He.height=null}function Ze(){ve=null,T&&(O=!1,e.removeEventListener("resize",Xe)),N&&S&&(document.body.contains(S)&&document.body.removeChild(S),S=null,te=!1)}return T&&!O&&(O=!0,e.addEventListener("resize",Xe,!1)),H?H.fire(de,He,Ze):ye(de,He,Ze)}return Me.reset=function(){H&&H.reset(),ve&&ve.reset()},Me}var ee;function re(){return ee||(ee=_(null,{useWorker:!0,resize:!0})),ee}function le(S,x,N,T,O,P,W){var H=new Path2D(S),Z=new Path2D;Z.addPath(H,new DOMMatrix(x));var te=new Path2D;return te.addPath(Z,new DOMMatrix([Math.cos(W)*O,Math.sin(W)*O,-Math.sin(W)*P,Math.cos(W)*P,N,T])),te}function ue(S){if(!o)throw new Error("path confetti are not supported in this browser");var x,N;typeof S=="string"?x=S:(x=S.path,N=S.matrix);var T=new Path2D(x),O=document.createElement("canvas"),P=O.getContext("2d");if(!N){for(var W=1e3,H=W,Z=W,te=0,be=0,ve,ye,Me=0;Me<W;Me+=2)for(var de=0;de<W;de+=2)P.isPointInPath(T,Me,de,"nonzero")&&(H=Math.min(H,Me),Z=Math.min(Z,de),te=Math.max(te,Me),be=Math.max(be,de));ve=te-H,ye=be-Z;var De=10,Oe=Math.min(De/ve,De/ye);N=[Oe,0,0,Oe,-Math.round(ve/2+H)*Oe,-Math.round(ye/2+Z)*Oe]}return{type:"path",path:x,matrix:N}}function fe(S){var x,N=1,T="#000000",O='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof S=="string"?x=S:(x=S.text,N="scalar"in S?S.scalar:N,O="fontFamily"in S?S.fontFamily:O,T="color"in S?S.color:T);var P=10*N,W=""+P+"px "+O,H=new OffscreenCanvas(P,P),Z=H.getContext("2d");Z.font=W;var te=Z.measureText(x),be=Math.ceil(te.actualBoundingBoxRight+te.actualBoundingBoxLeft),ve=Math.ceil(te.actualBoundingBoxAscent+te.actualBoundingBoxDescent),ye=2,Me=te.actualBoundingBoxLeft+ye,de=te.actualBoundingBoxAscent+ye;be+=ye+ye,ve+=ye+ye,H=new OffscreenCanvas(be,ve),Z=H.getContext("2d"),Z.font=W,Z.fillStyle=T,Z.fillText(x,Me,de);var De=1/N;return{type:"bitmap",bitmap:H.transferToImageBitmap(),matrix:[De,0,0,De,-be*De/2,-ve*De/2]}}t.exports=function(){return re().apply(this,arguments)},t.exports.reset=function(){re().reset()},t.exports.create=_,t.exports.shapeFromPath=ue,t.exports.shapeFromText=fe})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),Qa,!1);const Kt=Qa.exports;Qa.exports.create;function at(r){try{const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const t=new e,a=t.createOscillator(),i=t.createGain();a.connect(i),i.connect(t.destination);const n=t.currentTime;r==="tap"?(a.type="sine",a.frequency.setValueAtTime(587.33,n),a.frequency.exponentialRampToValueAtTime(1174.66,n+.06),i.gain.setValueAtTime(.2,n),i.gain.linearRampToValueAtTime(.001,n+.06),a.start(n),a.stop(n+.06)):r==="laser"?(a.type="sawtooth",a.frequency.setValueAtTime(1100,n),a.frequency.exponentialRampToValueAtTime(200,n+.1),i.gain.setValueAtTime(.25,n),i.gain.linearRampToValueAtTime(.001,n+.1),a.start(n),a.stop(n+.1)):r==="shatter"?(a.type="triangle",a.frequency.setValueAtTime(800,n),a.frequency.exponentialRampToValueAtTime(1600,n+.14),i.gain.setValueAtTime(.3,n),i.gain.linearRampToValueAtTime(.001,n+.14),a.start(n),a.stop(n+.14)):r==="combo"?(a.type="sine",a.frequency.setValueAtTime(783.99,n),a.frequency.exponentialRampToValueAtTime(1567.98,n+.08),i.gain.setValueAtTime(.25,n),i.gain.linearRampToValueAtTime(.001,n+.08),a.start(n),a.stop(n+.08)):r==="victory"&&(a.type="sine",a.frequency.setValueAtTime(523.25,n),a.frequency.setValueAtTime(659.25,n+.07),a.frequency.setValueAtTime(783.99,n+.14),a.frequency.setValueAtTime(1046.5,n+.21),i.gain.setValueAtTime(.3,n),i.gain.linearRampToValueAtTime(.001,n+.35),a.start(n),a.stop(n+.35))}catch{}}function Po(r){var m,h;const e=document.getElementById("modal-microgame-root");e&&e.remove();const t=["crystal_shatter","tap_frenzy","meteor_smash","flash_reflex"],a=t[Math.floor(Math.random()*t.length)],i=document.createElement("div");i.id="modal-microgame-root",i.className="apple-modal-overlay",i.style.zIndex="99999";let n="";a==="crystal_shatter"?n=`
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(56,189,248,0.18); color:var(--f-blue); border:1px solid rgba(56,189,248,0.4);">
            💎 ROMPE-CRISTAL • ¡${r.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          CRISTAL CÓSMICO
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Dale <strong>3 impactos rápidos</strong> para romper el cristal y recargar energía!
        </p>

        <!-- Crystal health bar -->
        <div style="display:flex; justify-content:center; gap:6px; margin-bottom:18px;">
          <div class="crystal-hp-bar active" id="hp-1"></div>
          <div class="crystal-hp-bar active" id="hp-2"></div>
          <div class="crystal-hp-bar active" id="hp-3"></div>
        </div>

        <!-- 3D Glowing Crystal Button -->
        <div style="margin-bottom:16px; height:140px; display:flex; align-items:center; justify-content:center;">
          <div id="btn-hit-crystal" class="cyber-crystal-core">
            <span id="crystal-glyph" style="font-size:4.2rem; filter:drop-shadow(0 0 25px #38bdf8); transition:all 0.1s ease; user-select:none;">💎</span>
          </div>
        </div>

        <div id="crystal-status-msg" style="font-size:1.05rem; font-weight:800; color:var(--f-blue); min-height:26px;">
          ¡TOCA EL CRISTAL! ⚡
        </div>
      </div>
    `:a==="tap_frenzy"?n=`
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.4);">
            ⚡ RÁFAGA TURBO • ¡${r.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          FRENESÍ DE TOQUES
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Toca a máxima velocidad <strong>10 VECES</strong> seguidas!
        </p>

        <!-- Timer bar -->
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; margin-bottom:16px;">
          <div id="turbo-timer-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #f59e0b, #ef4444); transition:width 0.05s linear;"></div>
        </div>

        <!-- Giant Turbo Tap Button -->
        <div style="margin-bottom:16px;">
          <button id="btn-turbo-frenzy" class="turbo-tap-btn">
            <span style="font-size:2.6rem; display:block; filter:drop-shadow(0 0 14px #f59e0b);">⚡</span>
            <span id="turbo-tap-count" style="font-size:1.25rem; font-weight:900; color:#fff;">¡DALE YA! (0/10)</span>
          </button>
        </div>

        <div id="frenzy-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:26px;">
          ¡Prepárate... DALE!
        </div>
      </div>
    `:a==="meteor_smash"?n=`
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(239,68,68,0.18); color:#f87171; border:1px solid rgba(239,68,68,0.4);">
            💥 DESTRUCCIÓN ULTRA • ¡${r.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          METEOR SMASH
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Revienta los 6 meteoros cósmicos que caen en pantalla!
        </p>

        <!-- Arena -->
        <div id="meteor-smash-arena" style="position:relative; width:100%; height:180px; background:radial-gradient(circle at 50% 50%, rgba(239,68,68,0.12), rgba(0,0,0,0.6)); border:1.5px solid rgba(239,68,68,0.3); border-radius:20px; overflow:hidden; margin-bottom:14px;">
          <div class="meteor-target" data-m-id="1" style="top:15px; left:25px; animation-duration:1.5s;">☄️</div>
          <div class="meteor-target" data-m-id="2" style="top:75px; left:110px; animation-duration:1.8s;">💥</div>
          <div class="meteor-target" data-m-id="3" style="top:25px; right:35px; animation-duration:1.4s;">🚀</div>
          <div class="meteor-target" data-m-id="4" style="bottom:20px; left:50px; animation-duration:2.0s;">☄️</div>
          <div class="meteor-target" data-m-id="5" style="bottom:65px; right:75px; animation-duration:1.6s;">🔥</div>
          <div class="meteor-target" data-m-id="6" style="bottom:15px; right:25px; animation-duration:2.1s;">💥</div>
        </div>

        <div id="meteor-status-feedback" style="font-size:1.05rem; font-weight:800; color:#f87171; min-height:26px;">
          ¡Destruye todos! (0/6)
        </div>
      </div>
    `:n=`
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(168,85,247,0.18); color:#c084fc; border:1px solid rgba(168,85,247,0.4);">
            🎯 REACCIÓN LÁSER • ¡${r.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          CAZA-DESTELLOS
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Toca el botón neón en cuanto parpadee! (Ronda <span id="flash-round-num">1</span>/3)
        </p>

        <!-- 4 Grid targets -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:270px; margin:0 auto 16px;">
          <button class="flash-target-btn" data-target-id="0" style="--c:#38bdf8;">🔷</button>
          <button class="flash-target-btn" data-target-id="1" style="--c:#a855f7;">🟣</button>
          <button class="flash-target-btn" data-target-id="2" style="--c:#10b981;">🟢</button>
          <button class="flash-target-btn" data-target-id="3" style="--c:#f59e0b;">🟡</button>
        </div>

        <div id="flash-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:26px;">
          ¡Atento a la luz...!
        </div>
      </div>
    `,i.innerHTML=`
    <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:92%; padding:24px; animation: modalPopIn 0.2s ease-out; position:relative;">
      <button id="btn-skip-microgame-x" style="position:absolute; top:14px; right:14px; background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px;">✕</button>

      ${n}

      <div style="display:flex; justify-content:center; gap:10px; margin-top:14px;">
        <button class="dialog-btn dialog-btn-primary" id="btn-continue-studying-now" style="width:100%; padding:13px; border-radius:14px; font-size:0.98rem; font-weight:800; background:var(--f-blue); color:#07080a; justify-content:center;">
          ⚡ Continuar Repaso ›
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);let o=!1;const l=()=>{o||(o=!0,window.removeEventListener("keydown",c),i.remove(),r.onContinue())};(m=i.querySelector("#btn-skip-microgame-x"))==null||m.addEventListener("click",l),(h=i.querySelector("#btn-continue-studying-now"))==null||h.addEventListener("click",l);const c=f=>{f.key==="Escape"&&l()};if(window.addEventListener("keydown",c),a==="crystal_shatter"){let f=0;const y=3,g=i.querySelector("#btn-hit-crystal"),C=i.querySelector("#crystal-glyph"),z=i.querySelector("#crystal-status-msg");g==null||g.addEventListener("click",()=>{if(f>=y)return;f++,at("shatter"),je.triggerHaptics("heavy");const k=i.querySelector(`#hp-${f}`);k&&k.classList.remove("active"),f===1?(C.textContent="💠",C.style.transform="scale(1.2) rotate(8deg)",z.textContent="¡IMPACTO CRÍTICO 1! 🔥"):f===2?(C.textContent="✨",C.style.transform="scale(1.35) rotate(-12deg)",z.textContent="¡A PUNTO DE ESTALLAR! 💥"):f===3&&(C.textContent="💥",C.style.transform="scale(1.8)",at("victory"),Kt({particleCount:60,spread:80,origin:{y:.6}}),z.innerHTML='<span style="color:#10b981; font-weight:900;">✨ ¡CRISTAL DESTRUIDO! (+30 XP)</span>',setTimeout(l,900)),setTimeout(()=>{f<y&&(C.style.transform="scale(1)")},120)})}else if(a==="tap_frenzy"){let f=0;const y=10,g=Date.now(),C=i.querySelector("#btn-turbo-frenzy"),z=i.querySelector("#turbo-tap-count"),k=i.querySelector("#frenzy-status-feedback"),M=i.querySelector("#turbo-timer-bar"),A=setInterval(()=>{if(o){clearInterval(A);return}const D=Date.now()-g,$=Math.max(0,100-D/5e3*100);M&&(M.style.width=`${$}%`),$<=0&&(clearInterval(A),f<y&&(k.innerHTML=`<span style="color:#f59e0b;">⏱️ ¡Buen intento! (${f}/${y})</span>`,setTimeout(l,700)))},40);C==null||C.addEventListener("click",()=>{if(!(f>=y)&&(f++,at("tap"),je.triggerHaptics("light"),C.classList.add("tap-pulse"),setTimeout(()=>C.classList.remove("tap-pulse"),70),z.textContent=`¡TAP! (${f}/${y})`,k.textContent=`COMBO x${f}! 🔥`,f>=y)){clearInterval(A);const D=((Date.now()-g)/1e3).toFixed(2);at("victory"),je.triggerHaptics("heavy"),Kt({particleCount:50,spread:75,origin:{y:.6}}),k.innerHTML=`<span style="color:#10b981; font-weight:900;">⚡ ¡RÁFAGA EN ${D}s! (+25 XP)</span>`,setTimeout(l,1e3)}})}else if(a==="meteor_smash"){let f=0;const y=6,g=i.querySelector("#meteor-status-feedback");i.querySelectorAll(".meteor-target").forEach(C=>{C.addEventListener("click",()=>{C.classList.contains("smashed")||(C.classList.add("smashed"),f++,at("laser"),je.triggerHaptics("medium"),g.textContent=`¡SMASH! (${f}/${y}) 🔥`,f>=y&&(at("victory"),je.triggerHaptics("heavy"),Kt({particleCount:50,spread:70,origin:{y:.6}}),g.innerHTML='<span style="color:#10b981; font-weight:900;">💥 ¡ESPACIO LIMPIO! (+25 XP)</span>',setTimeout(l,900)))})})}else{let f=1;const y=3;let g=-1,C=0;const z=[],k=i.querySelector("#flash-status-feedback"),M=i.querySelector("#flash-round-num"),A=i.querySelectorAll(".flash-target-btn"),D=()=>{o||(A.forEach($=>$.classList.remove("flashing")),g=-1,k.textContent="¡Atento a la luz...! 👀",setTimeout(()=>{var $;o||(g=Math.floor(Math.random()*4),C=Date.now(),($=A[g])==null||$.classList.add("flashing"),at("combo"),je.triggerHaptics("medium"),k.textContent="💥 ¡TOCA AHORA!")},400+Math.random()*700))};A.forEach($=>{$.addEventListener("click",()=>{if(parseInt($.dataset.targetId||"-1",10)===g&&g!==-1){const Q=Date.now()-C;if(z.push(Q),$.classList.remove("flashing"),g=-1,at("laser"),je.triggerHaptics("heavy"),f<y)f++,M&&(M.textContent=String(f)),k.innerHTML=`<span style="color:#10b981;">✓ ${Q}ms ¡Rápido!</span>`,D();else{const X=Math.round(z.reduce((K,R)=>K+R,0)/z.length);at("victory"),Kt({particleCount:45,spread:65,origin:{y:.6}}),k.innerHTML=`<span style="color:#10b981; font-weight:900;">⚡ Promedio: ${X}ms • ¡Reflejos Dios!</span>`,setTimeout(l,1e3)}}})}),D()}}class Fo{constructor(e){ce(this,"deck");ce(this,"queue",[]);ce(this,"currentCardIndex",0);ce(this,"isFlipped",!1);ce(this,"isSingleCardMode",!1);ce(this,"isPreviewMode",!1);ce(this,"isTypeAnswerMode",!1);ce(this,"isGameActive",!1);ce(this,"typedAnswer","");ce(this,"onExitCallback");ce(this,"onEditCardCallback");ce(this,"historyStack",[]);ce(this,"sessionStats",{startTime:Date.now(),againCount:0,hardCount:0,goodCount:0,easyCount:0,totalReviewed:0});const t=j.getDeckById(e.deckId);if(!t)throw new Error(`Deck not found: ${e.deckId}`);if(this.deck=t,this.onExitCallback=e.onExit,this.onEditCardCallback=e.onEditCard,this.isPreviewMode=!!e.isPreviewMode||!!e.specificCardId,e.specificCardId){const a=j.getCardsByDeck(e.deckId,!0),i=a.findIndex(n=>n.id===e.specificCardId);if(i!==-1)this.queue=a,this.currentCardIndex=i;else{const n=j.getCardById(e.specificCardId);n&&(this.queue=[n])}this.isSingleCardMode=!1}else if(e.forceAllCards){const a=j.getCardsByDeck(e.deckId,!0);this.queue=t.settings.mixCards?[...a].sort(()=>Math.random()-.5):[...a]}else{const a=j.getDueCardsByDeck(e.deckId,!0);this.queue=t.settings.mixCards?[...a].sort(()=>Math.random()-.5):[...a]}}render(e){if(this.queue.length===0){this.renderEmptyState(e);return}if(this.currentCardIndex>=this.queue.length){this.renderCompletionScreen(e);return}const t=this.queue[this.currentCardIndex],a=this.queue.length,i=this.currentCardIndex+1,n=a>0?Math.round(i/a*100):0,o=_t.projectIntervals(t,this.deck.settings);if(this.deck.settings.autoPlayAudio&&!this.isFlipped){const l=t.audioText||t.front;l&&Rt.speak(l,t.audioLang||this.deck.settings.ttsVoiceLang)}e.innerHTML=`
      <div class="cupertino-study-container">
        
        <!-- Header matching Reference Image 3 & 5 -->
        <div class="cupertino-study-header">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
              <button class="ios-back-btn" id="btn-study-exit" style="padding:0; font-size:1.1rem; color:#fff; flex-shrink:0;">
                <span class="ios-back-chevron">‹</span> Salir
              </button>
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${this.deck.name}
                </h2>
                ${this.isPreviewMode?'<span class="apple-badge-subpill" style="font-size:0.75rem; background:rgba(56,189,248,0.15); color:var(--f-blue); border:1px solid rgba(56,189,248,0.3); flex-shrink:0;">🔍 Vista Previa</span>':""}
              </div>
            </div>

            <button class="cupertino-icon-square" id="btn-study-audio" title="Pronunciación TTS">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
          </div>

          <!-- Progress track matching Image 3 (Pill 1/10 + Green Dot Track) -->
          <div class="cupertino-progress-row">
            <div class="cupertino-progress-pill">${i}/${a}</div>
            <div class="cupertino-track-bar">
              <div class="cupertino-track-fill" style="width: ${n}%;"></div>
              <div class="cupertino-track-thumb" style="left: ${n}%;"></div>
            </div>
          </div>
        </div>

        <!-- Main Card Canvas with Lateral Navigation Arrows -->
        <div class="cupertino-study-arena-row">
          <button class="cupertino-nav-arrow left" id="btn-nav-prev-card" title="Tarjeta anterior (←)" ${this.currentCardIndex===0?'style="opacity:0.25; pointer-events:none;"':""}>
            ‹
          </button>

          <div class="cupertino-flashcard-box" id="f-study-scene">
            
            <!-- Top 3-dots icon for Card Actions / Editing -->
            <div class="cupertino-card-top-action">
              <button class="cupertino-btn-card-menu" id="btn-card-more-action" title="Editar o gestionar tarjeta">⋮</button>
            </div>

            <!-- Card Content (Front or Back) -->
            <div class="cupertino-card-body-content">
              ${this.isFlipped?this.renderBackContent(t):this.renderFrontContent(t)}
            </div>

            ${!this.isFlipped&&!this.isTypeAnswerMode?`
              <div class="cupertino-card-hint-text">
                Toca la tarjeta o presiona Espacio para voltear
              </div>
            `:""}
          </div>

          <button class="cupertino-nav-arrow right" id="btn-nav-next-card" title="Siguiente tarjeta (→)" ${this.currentCardIndex>=this.queue.length-1?'style="opacity:0.25; pointer-events:none;"':""}>
            ›
          </button>
        </div>

        <!-- Bottom Controls matching Image 3 & Image 5 -->
        <div class="cupertino-bottom-controls">
          ${this.isPreviewMode?`
            <!-- Modo Vista Previa: Sin modificadores ni calificaciones -->
            <div class="cupertino-front-controls-row" style="justify-content:center;">
              <button class="cupertino-btn-show-answer" id="btn-f-show-answer" style="max-width:320px; font-weight:800;">
                ${this.isFlipped?"🔄 Voltear al Anverso":"👁️ Voltear al Reverso"}
              </button>
            </div>
          `:this.isFlipped?`
            <!-- Rating Bar Back (Image 5): 4 Frosted Cupertino Buttons -->
            <div class="cupertino-rating-row">
              <button class="cupertino-rate-pill rate-again" data-rating="again" title="Presiona [1]">
                <span class="c-rate-title">De nuevo</span>
                <span class="c-rate-subtitle">${o[0].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-hard" data-rating="hard" title="Presiona [2]">
                <span class="c-rate-title">Difícil</span>
                <span class="c-rate-subtitle">${o[1].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-good" data-rating="good" title="Presiona [3]">
                <span class="c-rate-title">Bien</span>
                <span class="c-rate-subtitle">${o[2].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-easy" data-rating="easy" title="Presiona [4]">
                <span class="c-rate-title">Fácil</span>
                <span class="c-rate-subtitle">${o[3].displayTime}</span>
              </button>
            </div>
          `:`
            <!-- Control Bar Front: [⌨ Escribir respuesta] [Mostrar respuesta] -->
            <div class="cupertino-front-controls-row">
              <button class="cupertino-icon-square ${this.isTypeAnswerMode?"active-keyboard-mode":""}" id="btn-toggle-type-mode" title="Escribir la respuesta (Modo teclado)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
              </button>

              <button class="cupertino-btn-show-answer" id="btn-f-show-answer">
                ${this.isTypeAnswerMode?"Comprobar respuesta":"Mostrar respuesta"}
              </button>
            </div>
          `}
        </div>

      </div>
    `,this.bindEvents(e)}renderFrontContent(e){let t="";if(e.type==="image_occlusion"&&e.occlusionImage){const i=e.occlusionMode||"hide_all_reveal_one";t=`
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${e.occlusionImage}" alt="Oclusión" draggable="false" class="cupertino-responsive-img" />
            ${(e.occlusionMasks||[]).map(n=>n.id===e.activeMaskId?`<div class="figma-drawn-mask active-question-mask" style="left:${n.x}%; top:${n.y}%; width:${n.width}%; height:${n.height}%; background:#ef4444; border:2px solid #ffffff; font-size:1.1rem; font-weight:900; color:#fff;">?</div>`:i==="hide_all_reveal_one"?`<div class="figma-drawn-mask other-hidden-mask" style="left:${n.x}%; top:${n.y}%; width:${n.width}%; height:${n.height}%; background:#1c1d22; border:1px solid #3f3f46;"></div>`:"").join("")}
          </div>
        </div>
      `}else e.frontImage&&(t=`<img src="${e.frontImage}" class="cupertino-responsive-img" alt="Front Attachment" />`);const a=this.isTypeAnswerMode?`
      <div class="cupertino-type-answer-box" style="margin-top:16px; width:100%; max-width:440px;">
        <input 
          type="text" 
          id="study-typed-answer-input" 
          class="cupertino-typed-input" 
          placeholder="Escribe la respuesta aquí..." 
          value="${this.typedAnswer}" 
          autocomplete="off" 
          autocorrect="off" 
          spellcheck="false" 
        />
      </div>
    `:"";return`
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; width:100%;">
        ${t}
        <div class="cupertino-card-main-title">
          ${Be.parseAndRender(e.front)}
        </div>
        ${a}
      </div>
    `}renderBackContent(e){let t="";e.type==="image_occlusion"&&e.occlusionImage?t=`
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${e.occlusionImage}" alt="Oclusión Revelada" draggable="false" class="cupertino-responsive-img" />
            ${(e.occlusionMasks||[]).map(i=>i.id===e.activeMaskId?"":`<div class="figma-drawn-mask other-hidden-mask" style="left:${i.x}%; top:${i.y}%; width:${i.width}%; height:${i.height}%; background:#1c1d22; border:1px solid #3f3f46;"></div>`).join("")}
          </div>
        </div>
      `:e.backImage&&(t=`<img src="${e.backImage}" class="cupertino-responsive-img" style="margin-bottom:14px;" alt="Back Attachment" />`);let a="";if(this.isTypeAnswerMode&&this.typedAnswer.trim()){const i=e.back.replace(/<[^>]*>?/gm,"").replace(/[*_#`$]/g,"").trim().toLowerCase(),o=this.typedAnswer.trim().toLowerCase()===i;a=`
        <div class="cupertino-typed-comparison-card apple-glass-panel" style="margin-bottom:14px; width:100%; max-width:440px; padding:12px 16px; border-radius:14px; text-align:left;">
          <div style="font-size:0.78rem; font-weight:800; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">
            Tu respuesta escrita:
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:1.05rem; font-weight:700; color:${o?"#10b981":"#f87171"};">
              ${this.typedAnswer}
            </span>
            <span class="apple-badge-subpill" style="font-size:0.75rem; background:${o?"rgba(16,185,129,0.18)":"rgba(239,68,68,0.18)"}; color:${o?"#10b981":"#f87171"}; border:1px solid ${o?"#10b981":"#ef4444"};">
              ${o?"✓ Exacto":"Discrepancia"}
            </span>
          </div>
        </div>
      `}return`
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
        ${t}
        <div class="cupertino-card-main-title" style="color:var(--f-text-secondary); font-size:1.15rem;">
          ${Be.parseAndRender(e.front)}
        </div>
        
        <div class="cupertino-card-divider"></div>

        ${a}

        <div class="cupertino-card-answer-text">
          ${Be.parseAndRender(e.back)}
        </div>
      </div>
    `}openCardMenu(e,t){var n,o,l,c;const a=document.createElement("div");a.className="apple-modal-overlay",a.innerHTML=`
      <div class="apple-modal-content apple-glass-panel" style="max-width:380px; width:90%; padding:20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de la Tarjeta</h3>
          <button id="btn-close-card-menu" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="menu-action-item-btn" id="btn-menu-edit-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">✏️</span>
            <div>
              <div>Editar esta tarjeta</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Modificar anverso, reverso o multimedia</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-reset-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">🔄</span>
            <div>
              <div>Reiniciar progreso</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Restablecer a tarjeta nueva</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-delete-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">🗑️</span>
            <div>
              <div>Eliminar tarjeta</div>
              <div style="font-size:0.75rem; color:#fca5a5; font-weight:500;">Borrar definitivamente del mazo</div>
            </div>
          </button>
        </div>
      </div>
    `,document.body.appendChild(a);const i=()=>a.remove();(n=a.querySelector("#btn-close-card-menu"))==null||n.addEventListener("click",i),a.addEventListener("click",m=>{m.target===a&&i()}),(o=a.querySelector("#btn-menu-edit-card"))==null||o.addEventListener("click",()=>{i(),window.onkeydown=null,this.onEditCardCallback&&this.onEditCardCallback(e.id)}),(l=a.querySelector("#btn-menu-reset-card"))==null||l.addEventListener("click",()=>{i(),me.showConfirm({title:"Restablecer Progreso",message:"¿Deseas restablecer el progreso de esta tarjeta a estado nuevo?",confirmText:"Continuar",onConfirm:()=>{me.showConfirm({title:"⚠️ Confirmación Final",message:"Esta acción borrará todo el historial e intervalos acumulados de esta tarjeta. ¿Confirmar por segunda vez?",confirmText:"Restablecer Definitivamente",isDanger:!0,onConfirm:()=>{j.resetCardProgress(e.id),this.render(t)}})}})}),(c=a.querySelector("#btn-menu-delete-card"))==null||c.addEventListener("click",()=>{me.showConfirm({title:"Eliminar Tarjeta",message:"¿Estás seguro de eliminar esta tarjeta definitivamente?",confirmText:"Eliminar",isDanger:!0,onConfirm:()=>{j.deleteCard(e.id),i(),this.queue.splice(this.currentCardIndex,1),this.isFlipped=!1,this.render(t)}})})}bindEvents(e){var i,n,o,l,c,m,h,f,y,g,C,z,k;const t=this.queue[this.currentCardIndex];if((i=document.getElementById("btn-study-exit"))==null||i.addEventListener("click",()=>{window.onkeydown=null,Rt.stop(),this.onExitCallback()}),(n=document.getElementById("btn-card-more-action"))==null||n.addEventListener("click",M=>{M.stopPropagation(),this.openCardMenu(t,e)}),this.isPreviewMode){const M=()=>{this.isFlipped=!this.isFlipped,this.render(e)};(o=document.getElementById("btn-f-show-answer"))==null||o.addEventListener("click",M),(l=document.getElementById("f-study-scene"))==null||l.addEventListener("click",A=>{const D=A.target;D.id==="btn-card-more-action"||D.tagName==="BUTTON"||M()}),(c=document.getElementById("btn-nav-prev-card"))==null||c.addEventListener("click",A=>{A.stopPropagation(),this.currentCardIndex>0&&(this.currentCardIndex--,this.isFlipped=!1,this.render(e))}),(m=document.getElementById("btn-nav-next-card"))==null||m.addEventListener("click",A=>{A.stopPropagation(),this.currentCardIndex<this.queue.length-1&&(this.currentCardIndex++,this.isFlipped=!1,this.render(e))}),(h=document.getElementById("btn-study-audio"))==null||h.addEventListener("click",A=>{A.stopPropagation();const D=this.isFlipped?t.back:t.front;Rt.speak(D,t.audioLang||this.deck.settings.ttsVoiceLang)}),window.onkeydown=A=>{this.isGameActive||document.getElementById("modal-microgame-root")||document.querySelector(".apple-modal-overlay")||document.querySelector(".modal-backdrop")||(A.key==="ArrowLeft"?this.currentCardIndex>0&&(A.preventDefault(),this.currentCardIndex--,this.isFlipped=!1,this.render(e)):A.key==="ArrowRight"?this.currentCardIndex<this.queue.length-1&&(A.preventDefault(),this.currentCardIndex++,this.isFlipped=!1,this.render(e)):(A.code==="Space"||A.code==="Enter")&&(A.preventDefault(),M()))};return}if(this.isTypeAnswerMode&&!this.isFlipped){const M=document.getElementById("study-typed-answer-input");M&&(M.focus(),M.addEventListener("input",A=>{this.typedAnswer=A.target.value}),M.addEventListener("keydown",A=>{A.key==="Enter"&&(A.preventDefault(),a())}))}const a=()=>{if(!this.isFlipped){const M=document.getElementById("study-typed-answer-input");M&&(this.typedAnswer=M.value),this.historyStack.push({cardIndex:this.currentCardIndex,isFlipped:!1}),this.isFlipped=!0,this.render(e)}};(f=document.getElementById("btn-toggle-type-mode"))==null||f.addEventListener("click",()=>{this.isTypeAnswerMode=!this.isTypeAnswerMode,this.typedAnswer="",this.render(e)}),(y=document.getElementById("btn-f-show-answer"))==null||y.addEventListener("click",a),(g=document.getElementById("f-study-scene"))==null||g.addEventListener("click",M=>{const A=M.target;A.id==="btn-card-more-action"||A.tagName==="INPUT"||A.tagName==="BUTTON"||this.isTypeAnswerMode||a()}),(C=document.getElementById("btn-nav-prev-card"))==null||C.addEventListener("click",M=>{M.stopPropagation(),this.currentCardIndex>0&&(this.currentCardIndex--,this.isFlipped=!1,this.typedAnswer="",this.render(e))}),(z=document.getElementById("btn-nav-next-card"))==null||z.addEventListener("click",M=>{M.stopPropagation(),this.currentCardIndex<this.queue.length-1&&(this.currentCardIndex++,this.isFlipped=!1,this.typedAnswer="",this.render(e))}),(k=document.getElementById("btn-study-audio"))==null||k.addEventListener("click",M=>{M.stopPropagation();const A=this.isFlipped?t.back:t.front;Rt.speak(A,t.audioLang||this.deck.settings.ttsVoiceLang)}),e.querySelectorAll(".cupertino-rate-pill").forEach(M=>{M.addEventListener("click",A=>{A.stopPropagation();const D=M.dataset.rating;D&&this.handleRating(D,e)})}),window.onkeydown=M=>{if(this.isGameActive||document.getElementById("modal-microgame-root")||document.querySelector(".apple-modal-overlay")||document.querySelector(".modal-backdrop"))return;const A=document.activeElement,D=A&&(A.tagName==="INPUT"||A.tagName==="TEXTAREA");if(M.key==="ArrowLeft"){if(!D&&this.currentCardIndex>0){M.preventDefault(),this.currentCardIndex--,this.isFlipped=!1,this.typedAnswer="",this.render(e);return}}else if(M.key==="ArrowRight"&&!D&&this.currentCardIndex<this.queue.length-1){M.preventDefault(),this.currentCardIndex++,this.isFlipped=!1,this.typedAnswer="",this.render(e);return}if(!this.isFlipped)(M.code==="Space"||M.code==="Enter")&&(M.preventDefault(),a());else{if(D)return;M.key==="1"||M.code==="Numpad1"?(M.preventDefault(),this.handleRating("again",e)):M.key==="2"||M.code==="Numpad2"?(M.preventDefault(),this.handleRating("hard",e)):M.key==="3"||M.code==="Numpad3"?(M.preventDefault(),this.handleRating("good",e)):M.key==="4"||M.code==="Numpad4"?(M.preventDefault(),this.handleRating("easy",e)):(M.code==="Space"||M.code==="Enter")&&(M.preventDefault(),this.handleRating("good",e))}}}handleRating(e,t){const a=this.queue[this.currentCardIndex];j.reviewCard(a.id,e),this.sessionStats.totalReviewed++,e==="again"?(this.sessionStats.againCount++,this.isSingleCardMode||this.queue.push(a)):e==="hard"?this.sessionStats.hardCount++:e==="good"?this.sessionStats.goodCount++:e==="easy"&&this.sessionStats.easyCount++,this.currentCardIndex++,this.isFlipped=!1,this.typedAnswer="";const i=this.deck.settings.microGameInterval!==void 0?this.deck.settings.microGameInterval:5,n=this.deck.settings.enableMicroGames!==!1,o=this.currentCardIndex<this.queue.length;if(n&&i>0&&this.sessionStats.totalReviewed>0&&this.sessionStats.totalReviewed%i===0&&o){this.isGameActive=!0,Po({streakCount:this.sessionStats.totalReviewed,gameType:this.deck.settings.preferredMicroGame||"all",onContinue:()=>{this.isGameActive=!1,this.render(t)}});return}this.render(t)}renderCompletionScreen(e){var i;window.onkeydown=null;try{Kt({particleCount:90,spread:75,origin:{y:.6}})}catch{}const t=this.sessionStats.goodCount+this.sessionStats.easyCount,a=this.sessionStats.totalReviewed>0?Math.round(t/this.sessionStats.totalReviewed*100):100;e.innerHTML=`
      <div class="cupertino-study-container" style="align-items:center; text-align:center; padding:40px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🎉</div>
        <h2 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Sesión Completada!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:24px; font-size:1rem;">
          Repasaste ${this.sessionStats.totalReviewed} tarjetas con ${a}% de retención.
        </p>

        <div class="apple-card-grouped" style="width:100%; max-width:480px; text-align:left; margin-bottom:24px;">
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#f87171; font-weight:700;">🔴 De nuevo</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.againCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#fbbf24; font-weight:700;">🟠 Difícil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.hardCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#10b981; font-weight:700;">🔵 Bien</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.goodCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#38bdf8; font-weight:700;">🟢 Fácil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.easyCount}</strong>
          </div>
        </div>

        <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 36px; font-size:1.05rem;">
          Volver a Mis Mazos
        </button>
      </div>
    `,(i=document.getElementById("btn-study-finish-all"))==null||i.addEventListener("click",()=>{this.onExitCallback()})}renderEmptyState(e){var t,a;e.innerHTML=`
      <div class="cupertino-study-container" style="align-items:center; text-align:center; padding:60px 10px;">
        <div style="font-size:4rem; margin-bottom:12px;">🏆</div>
        <h2 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Todo al día!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:28px; font-size:1.05rem; max-width:460px; line-height:1.5;">
          Has repasado todas las tarjetas programadas para este momento. Tus próximas revisiones se habilitarán automáticamente al cumplirse sus intervalos espaciados.
        </p>

        <div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 32px; font-size:1.05rem;">
            Volver a Mis Mazos
          </button>
          <button class="apple-btn-secondary" id="btn-study-force-all" style="padding:16px 26px; border-radius:9999px; font-weight:700;">
            🎯 Repasar mazo completo
          </button>
        </div>
      </div>
    `,(t=document.getElementById("btn-study-finish-all"))==null||t.addEventListener("click",()=>{this.onExitCallback()}),(a=document.getElementById("btn-study-force-all"))==null||a.addEventListener("click",()=>{const i=j.getCardsByDeck(this.deck.id,!0);this.queue=this.deck.settings.mixCards?[...i].sort(()=>Math.random()-.5):[...i],this.currentCardIndex=0,this.isFlipped=!1,this.render(e)})}}class jo{constructor(){ce(this,"currentTab","inicio");ce(this,"currentView","root");ce(this,"selectedRootDeckId","deck-mates");ce(this,"selectedSubdeckId","deck-mates-sub");ce(this,"editingCardId",null);ce(this,"appElement");ce(this,"activeStudySession",null);ce(this,"toastTimeout",null);const e=document.getElementById("app");if(!e)throw new Error("Root container #app not found");this.appElement=e}async init(){$t.applyTheme(),await je.initialize(),j.subscribe(()=>{this.currentView!=="study"&&this.render()}),this.render()}showToast(e){const t=document.getElementById("eureka-toast");t&&t.remove();const a=document.createElement("div");a.id="eureka-toast",a.className="toast-notice",a.innerHTML=`<span>${e}</span>`,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("show")),this.toastTimeout&&window.clearTimeout(this.toastTimeout),this.toastTimeout=window.setTimeout(()=>{a.classList.remove("show"),setTimeout(()=>a.remove(),250)},2400)}startStudy(e,t){je.triggerHaptics("medium"),this.currentView="study",this.activeStudySession=new Fo({deckId:e,specificCardId:t,onExit:()=>{this.activeStudySession=null,this.currentView="dashboard",this.render()},onEditCard:i=>{const n=j.getCardById(i);if(n){this.selectedSubdeckId=n.deckId;const o=j.getDeckById(n.deckId);o!=null&&o.parentId?this.selectedRootDeckId=o.parentId:this.selectedRootDeckId=n.deckId}this.activeStudySession=null,this.editingCardId=i,this.currentTab="inicio",this.currentView="editor",this.render()}}),this.appElement.innerHTML=`
      <div class="figma-app-layout" id="study-mount"></div>
    `;const a=document.getElementById("study-mount");a&&this.activeStudySession.render(a)}openBatchImport(e){je.triggerHaptics("light"),Q0({deckId:e,onImported:t=>{this.showToast(`¡${t} tarjetas importadas con éxito!`),this.render()},onClose:()=>{}})}promptCreateDeck(e){const t=e?j.getDeckById(e):void 0;me.showPrompt({title:t?`Nuevo Submazo en "${t.name}"`:"Crear Nuevo Mazo",placeholder:"Nombre del mazo...",confirmText:"Crear Mazo",onConfirm:a=>{a&&a.trim()&&(j.createDeck({name:a.trim(),parentId:e||null}),this.showToast(`Mazo "${a}" creado con éxito`),this.render())}})}render(){if(this.currentView==="study")return;const e=j.getDeckById(this.selectedRootDeckId)||j.getRootDecks()[0],t=j.getDeckById(this.selectedSubdeckId)||e,a=this.editingCardId?j.getCardById(this.editingCardId):void 0;let i="",n=!0;if(this.currentView==="editor")n=!1,i=So(t,e.id!==t.id?e:void 0,a);else if(this.currentView==="deck_settings")n=!1,i=Ao(t);else if(this.currentView==="advanced_menu")n=!1,i=Eo(t);else if(this.currentView==="algorithm_selector")n=!1,i=Do(t);else if(this.currentView==="learning_phase")n=!1,i=Lo(t);else if(this.currentTab==="biblioteca")i=zo();else if(this.currentTab==="ajustes"||this.currentView==="app_settings")i=$o();else switch(this.currentView){case"root":i=u0();break;case"subdeck":i=yn(e);break;case"dashboard":i=xo(t,e.id!==t.id?e:void 0);break;default:i=u0();break}this.appElement.innerHTML=`
      <div class="figma-app-layout" id="main-layout-mount">
        ${n?hn(this.currentTab):""}
        <main>
          ${i}
        </main>
      </div>
    `,this.bindEvents()}bindEvents(){var i,n,o,l,c;const e=document.getElementById("main-layout-mount");if(!e)return;e.querySelectorAll(".figma-nav-tab-btn, .mobile-nav-item").forEach(m=>{m.addEventListener("click",()=>{const h=m.dataset.tab;h&&h!==this.currentTab&&(je.triggerHaptics("light"),this.currentTab=h,h==="inicio"&&(this.currentView="root"),this.render())})}),(i=e.querySelector("#nav-brand-logo"))==null||i.addEventListener("click",()=>{this.currentTab="inicio",this.currentView="root",this.render()}),(n=e.querySelector("#btn-header-avatar"))==null||n.addEventListener("click",()=>{this.currentTab="ajustes",this.render()}),(o=e.querySelector("#btn-header-theme-mobile"))==null||o.addEventListener("click",()=>{this.currentTab="ajustes",this.render()}),(l=e.querySelector("#btn-fab-gift"))==null||l.addEventListener("click",()=>{this.showToast("🎁 ¡Racha de hoy completada! +50 XP")}),(c=e.querySelector("#btn-fab-help"))==null||c.addEventListener("click",()=>{this.showToast("Atajos: Espacio = Voltear | 1, 2, 3, 4 = Calificar")});const t=j.getDeckById(this.selectedRootDeckId)||j.getRootDecks()[0],a=j.getDeckById(this.selectedSubdeckId)||t;if(this.currentView==="editor"){const m=this.editingCardId?j.getCardById(this.editingCardId):void 0;Mo(e,a,m,{onBack:()=>{this.editingCardId=null,this.currentView="dashboard",this.render()},onSaved:()=>{this.showToast("¡Tarjeta guardada con éxito!"),this.editingCardId=null,this.currentView="dashboard",this.render()}});return}if(this.currentView==="deck_settings"){To(e,a,{onBack:()=>{this.currentView="dashboard",this.render()},onOpenAlgorithmSelector:()=>{this.currentView="algorithm_selector",this.render()},onOpenAdvancedMenu:()=>{this.currentView="advanced_menu",this.render()},onSaved:()=>{this.showToast("Ajustes guardados"),this.render()}});return}if(this.currentView==="advanced_menu"){Io(e,a,{onBack:()=>{this.currentView="deck_settings",this.render()},onOpenAlgorithmSelector:()=>{this.currentView="algorithm_selector",this.render()},onOpenAiBuilder:()=>{$a({deckId:a.id,onBatchAdded:()=>{this.showToast("Tarjetas añadidas"),this.currentView="dashboard",this.render()},onClose:()=>{}})},onOpenBatchImport:()=>{this.openBatchImport(a.id)},onActionCompleted:()=>{this.showToast("Acción completada"),this.currentView="dashboard",this.render()}});return}if(this.currentView==="algorithm_selector"){Bo(e,a,{onBack:()=>{this.currentView="deck_settings",this.render()},onOpenCustomLearningPhases:()=>{this.currentView="learning_phase",this.render()},onSaved:()=>{this.showToast("Algoritmo actualizado"),this.currentView="deck_settings",this.render()}});return}if(this.currentView==="learning_phase"){qo(e,a,{onBack:()=>{this.currentView="algorithm_selector",this.render()},onSaved:()=>{this.showToast("Escalera de 12 pasos guardada"),this.currentView="deck_settings",this.render()}});return}if(this.currentTab==="ajustes"||this.currentView==="app_settings"){Ro(e,{onBack:()=>{this.currentTab="inicio",this.currentView="root",this.render()},onThemeChanged:()=>{this.showToast("Estilo visual aplicado"),this.render()}});return}this.currentTab==="inicio"&&this.currentView==="root"?fn(e,{onSelectDeck:m=>{je.triggerHaptics("light"),this.selectedRootDeckId=m;const h=j.getSubdecks(m);h.length>0?(this.selectedSubdeckId=h[0].id,this.currentView="subdeck"):(this.selectedSubdeckId=m,this.currentView="dashboard"),this.render()},onAddCard:()=>{je.triggerHaptics("light"),this.editingCardId=null,this.currentView="editor",this.render()},onCreateDeck:()=>this.promptCreateDeck(),onImportBatch:()=>this.openBatchImport(this.selectedSubdeckId),onManageDecks:()=>{this.currentView="deck_settings",this.render()}}):this.currentTab==="inicio"&&this.currentView==="subdeck"?xn(e,t,{onBack:()=>{this.currentView="root",this.render()},onSelectSubdeck:m=>{je.triggerHaptics("light"),this.selectedSubdeckId=m,this.currentView="dashboard",this.render()},onAddCard:()=>{this.editingCardId=null,this.currentView="editor",this.render()},onImportBatch:m=>this.openBatchImport(m),onConfigureDeck:()=>{this.currentView="deck_settings",this.render()}}):this.currentTab==="inicio"&&this.currentView==="dashboard"?wo(e,a,{onBackToSubdecks:()=>{a.parentId?this.currentView="subdeck":this.currentView="root",this.render()},onBackToRoot:()=>{this.currentView="root",this.render()},onStudy:m=>this.startStudy(m),onStudySpecificCard:(m,h)=>{this.startStudy(m,h)},onAddCard:()=>{this.editingCardId=null,this.currentView="editor",this.render()},onConfigureDeck:()=>{this.currentView="deck_settings",this.render()},onEditCard:m=>{this.editingCardId=m,this.currentView="editor",this.render()}}):this.currentTab==="biblioteca"&&Co(e,{onAddCard:()=>{this.editingCardId=null,this.currentTab="inicio",this.currentView="editor",this.render()},onEditCard:m=>{this.editingCardId=m,this.currentTab="inicio",this.currentView="editor",this.render()},onStudySpecificCard:(m,h)=>{this.startStudy(m,h)}})}}window.addEventListener("DOMContentLoaded",()=>{new jo().init()});export{Zt as I,na as N,J0 as W};
//# sourceMappingURL=index-DItV8bZ-.js.map
