var ex=Object.create;var Cd=Object.defineProperty;var tx=Object.getOwnPropertyDescriptor;var ax=Object.getOwnPropertyNames;var nx=Object.getPrototypeOf,ix=Object.prototype.hasOwnProperty;var ox=(e,t,a)=>t in e?Cd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var an=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var rx=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of ax(t))!ix.call(e,r)&&r!==a&&Cd(e,r,{get:()=>t[r],enumerable:!(i=tx(t,r))||i.enumerable});return e};var Kl=(e,t,a)=>(a=e!=null?ex(nx(e)):{},rx(t||!e||!e.__esModule?Cd(a,"default",{value:e,enumerable:!0}):a,e));var rf=(e,t,a)=>ox(e,typeof t!="symbol"?t+"":t,a);var yf=an(re=>{"use strict";var Rd=Symbol.for("react.transitional.element"),sx=Symbol.for("react.portal"),lx=Symbol.for("react.fragment"),cx=Symbol.for("react.strict_mode"),ux=Symbol.for("react.profiler"),dx=Symbol.for("react.consumer"),hx=Symbol.for("react.context"),mx=Symbol.for("react.forward_ref"),px=Symbol.for("react.suspense"),gx=Symbol.for("react.memo"),df=Symbol.for("react.lazy"),fx=Symbol.for("react.activity"),bx=Symbol.for("react.view_transition"),sf=Symbol.iterator;function vx(e){return e===null||typeof e!="object"?null:(e=sf&&e[sf]||e["@@iterator"],typeof e=="function"?e:null)}var hf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},mf=Object.assign,pf={};function Bo(e,t,a){this.props=e,this.context=t,this.refs=pf,this.updater=a||hf}Bo.prototype.isReactComponent={};Bo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Bo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function gf(){}gf.prototype=Bo.prototype;function Md(e,t,a){this.props=e,this.context=t,this.refs=pf,this.updater=a||hf}var Od=Md.prototype=new gf;Od.constructor=Md;mf(Od,Bo.prototype);Od.isPureReactComponent=!0;var lf=Array.isArray;function Ad(){}var Ge={H:null,A:null,T:null,S:null},ff=Object.prototype.hasOwnProperty;function Vd(e,t,a){var i=a.ref;return{$$typeof:Rd,type:e,key:t,ref:i!==void 0?i:null,props:a}}function yx(e,t){return Vd(e.type,t,e.props)}function Dd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Rd}function wx(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var cf=/\/+/g;function zd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?wx(""+e.key):t.toString(36)}function $x(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Ad,Ad):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function qo(e,t,a,i,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Rd:case sx:c=!0;break;case df:return c=e._init,qo(c(e._payload),t,a,i,r)}}if(c)return r=r(e),c=i===""?"."+zd(e,0):i,lf(r)?(a="",c!=null&&(a=c.replace(cf,"$&/")+"/"),qo(r,t,a,"",function(f){return f})):r!=null&&(Dd(r)&&(r=yx(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(cf,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=i===""?".":i+":";if(lf(e))for(var h=0;h<e.length;h++)i=e[h],s=d+zd(i,h),c+=qo(i,t,a,s,r);else if(h=vx(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+zd(i,h++),c+=qo(i,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return qo($x(e),t,a,i,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Jl(e,t,a){if(e==null)return e;var i=[],r=0;return qo(e,i,"","",function(s){return t.call(a,s,r++)}),i}function xx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var uf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function bf(e){var t=Ge.T,a={};a.types=t!==null?t.types:null,Ge.T=a;try{var i=e(),r=Ge.S;r!==null&&r(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Ad,uf)}catch(s){uf(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),Ge.T=t}}function vf(e){var t=Ge.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else bf(vf.bind(null,e))}var Nx={map:Jl,forEach:function(e,t,a){Jl(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Jl(e,function(){t++}),t},toArray:function(e){return Jl(e,function(t){return t})||[]},only:function(e){if(!Dd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};re.Activity=fx;re.Children=Nx;re.Component=Bo;re.Fragment=lx;re.Profiler=ux;re.PureComponent=Md;re.StrictMode=cx;re.Suspense=px;re.ViewTransition=bx;re.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ge;re.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ge.H.useMemoCache(e)}};re.addTransitionType=vf;re.cache=function(e){return function(){return e.apply(null,arguments)}};re.cacheSignal=function(){return null};re.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=mf({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!ff.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return Vd(e.type,r,i)};re.createContext=function(e){return e={$$typeof:hx,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:dx,_context:e},e};re.createElement=function(e,t,a){var i,r={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)ff.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=t[i]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)r[i]===void 0&&(r[i]=c[i]);return Vd(e,s,r)};re.createRef=function(){return{current:null}};re.forwardRef=function(e){return{$$typeof:mx,render:e}};re.isValidElement=Dd;re.lazy=function(e){return{$$typeof:df,_payload:{_status:-1,_result:e},_init:xx}};re.memo=function(e,t){return{$$typeof:gx,type:e,compare:t===void 0?null:t}};re.startTransition=bf;re.unstable_useCacheRefresh=function(){return Ge.H.useCacheRefresh()};re.use=function(e){return Ge.H.use(e)};re.useActionState=function(e,t,a){return Ge.H.useActionState(e,t,a)};re.useCallback=function(e,t){return Ge.H.useCallback(e,t)};re.useContext=function(e){return Ge.H.useContext(e)};re.useDebugValue=function(){};re.useDeferredValue=function(e,t){return Ge.H.useDeferredValue(e,t)};re.useEffect=function(e,t){return Ge.H.useEffect(e,t)};re.useEffectEvent=function(e){return Ge.H.useEffectEvent(e)};re.useId=function(){return Ge.H.useId()};re.useImperativeHandle=function(e,t,a){return Ge.H.useImperativeHandle(e,t,a)};re.useInsertionEffect=function(e,t){return Ge.H.useInsertionEffect(e,t)};re.useLayoutEffect=function(e,t){return Ge.H.useLayoutEffect(e,t)};re.useMemo=function(e,t){return Ge.H.useMemo(e,t)};re.useOptimistic=function(e,t){return Ge.H.useOptimistic(e,t)};re.useReducer=function(e,t,a){return Ge.H.useReducer(e,t,a)};re.useRef=function(e){return Ge.H.useRef(e)};re.useState=function(e){return Ge.H.useState(e)};re.useSyncExternalStore=function(e,t,a){return Ge.H.useSyncExternalStore(e,t,a)};re.useTransition=function(){return Ge.H.useTransition()};re.version="19.3.0"});var Fl=an((YS,wf)=>{"use strict";wf.exports=yf()});var Af=an(We=>{"use strict";function Ud(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,r=e[i];if(0<Wl(r,t))e[i]=t,e[a]=r,a=i;else break e}}function nn(e){return e.length===0?null:e[0]}function tc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,r=e.length,s=r>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,f=e[h];if(0>Wl(d,a))h<r&&0>Wl(f,d)?(e[i]=f,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<r&&0>Wl(f,a))e[i]=f,e[h]=a,i=h;else break e}}return t}function Wl(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}We.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?($f=performance,We.unstable_now=function(){return $f.now()}):(Id=Date,xf=Id.now(),We.unstable_now=function(){return Id.now()-xf});var $f,Id,xf,zn=[],ei=[],Sx=1,za=null,_t=3,qd=!1,hs=!1,ms=!1,Bd=!1,kf=typeof setTimeout=="function"?setTimeout:null,Tf=typeof clearTimeout=="function"?clearTimeout:null,Nf=typeof setImmediate<"u"?setImmediate:null;function ec(e){for(var t=nn(ei);t!==null;){if(t.callback===null)tc(ei);else if(t.startTime<=e)tc(ei),t.sortIndex=t.expirationTime,Ud(zn,t);else break;t=nn(ei)}}function jd(e){if(ms=!1,ec(e),!hs)if(nn(zn)!==null)hs=!0,Lo||(Lo=!0,jo());else{var t=nn(ei);t!==null&&Ld(jd,t.startTime-e)}}var Lo=!1,ps=-1,Ef=5,Cf=-1;function zf(){return Bd?!0:!(We.unstable_now()-Cf<Ef)}function _d(){if(Bd=!1,Lo){var e=We.unstable_now();Cf=e;var t=!0;try{e:{hs=!1,ms&&(ms=!1,Tf(ps),ps=-1),qd=!0;var a=_t;try{t:{for(ec(e),za=nn(zn);za!==null&&!(za.expirationTime>e&&zf());){var i=za.callback;if(typeof i=="function"){za.callback=null,_t=za.priorityLevel;var r=i(za.expirationTime<=e);if(e=We.unstable_now(),typeof r=="function"){za.callback=r,ec(e),t=!0;break t}za===nn(zn)&&tc(zn),ec(e)}else tc(zn);za=nn(zn)}if(za!==null)t=!0;else{var s=nn(ei);s!==null&&Ld(jd,s.startTime-e),t=!1}}break e}finally{za=null,_t=a,qd=!1}t=void 0}}finally{t?jo():Lo=!1}}}var jo;typeof Nf=="function"?jo=function(){Nf(_d)}:typeof MessageChannel<"u"?(Hd=new MessageChannel,Sf=Hd.port2,Hd.port1.onmessage=_d,jo=function(){Sf.postMessage(null)}):jo=function(){kf(_d,0)};var Hd,Sf;function Ld(e,t){ps=kf(function(){e(We.unstable_now())},t)}We.unstable_IdlePriority=5;We.unstable_ImmediatePriority=1;We.unstable_LowPriority=4;We.unstable_NormalPriority=3;We.unstable_Profiling=null;We.unstable_UserBlockingPriority=2;We.unstable_cancelCallback=function(e){e.callback=null};We.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Ef=0<e?Math.floor(1e3/e):5};We.unstable_getCurrentPriorityLevel=function(){return _t};We.unstable_next=function(e){switch(_t){case 1:case 2:case 3:var t=3;break;default:t=_t}var a=_t;_t=t;try{return e()}finally{_t=a}};We.unstable_requestPaint=function(){Bd=!0};We.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=_t;_t=e;try{return t()}finally{_t=a}};We.unstable_scheduleCallback=function(e,t,a){var i=We.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:Sx++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>i?(e.sortIndex=a,Ud(ei,e),nn(zn)===null&&e===nn(ei)&&(ms?(Tf(ps),ps=-1):ms=!0,Ld(jd,a-i))):(e.sortIndex=r,Ud(zn,e),hs||qd||(hs=!0,Lo||(Lo=!0,jo()))),e};We.unstable_shouldYield=zf;We.unstable_wrapCallback=function(e){var t=_t;return function(){var a=_t;_t=t;try{return e.apply(this,arguments)}finally{_t=a}}}});var Mf=an((QS,Rf)=>{"use strict";Rf.exports=Af()});var Df=an(Ht=>{"use strict";var kx=Fl();function Vf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ti(){}var Yt={d:{f:ti,r:function(){throw Error(Vf(522))},D:ti,C:ti,L:ti,m:ti,X:ti,S:ti,M:ti},p:0,findDOMNode:null},Tx=Symbol.for("react.portal"),Ex=Symbol.for("react.recoverable"),Of=Symbol.for("react.optimistic_key");function Cx(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Tx,key:i==null?null:i===Of?Of:""+i,children:e,containerInfo:t,implementation:a}}var gs=kx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function ac(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Ht.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Yt;Ht.browser=function(e){return{$$typeof:Ex,_reason:e}};Ht.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Vf(299));return Cx(e,t,null,a)};Ht.flushSync=function(e){var t=gs.T,a=Yt.p;try{if(gs.T=null,Yt.p=2,e)return e()}finally{gs.T=t,Yt.p=a,Yt.d.f()}};Ht.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Yt.d.C(e,t))};Ht.prefetchDNS=function(e){typeof e=="string"&&Yt.d.D(e)};Ht.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=ac(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Yt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):a==="script"&&Yt.d.X(e,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Ht.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=ac(t.as,t.crossOrigin);Yt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Yt.d.M(e)};Ht.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=ac(a,t.crossOrigin);Yt.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Ht.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=ac(t.as,t.crossOrigin);Yt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Yt.d.m(e)};Ht.requestFormReset=function(e){Yt.d.r(e)};Ht.unstable_batchedUpdates=function(e,t){return e(t)};Ht.useFormState=function(e,t,a){return gs.H.useFormState(e,t,a)};Ht.useFormStatus=function(){return gs.H.useHostTransitionStatus()};Ht.version="19.3.0"});var Hf=an((PS,_f)=>{"use strict";function If(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(If)}catch(e){console.error(e)}}If(),_f.exports=Df()});var S0=an(_u=>{"use strict";var ft=Mf(),Nv=Fl(),zx=Hf();function O(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Sv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function al(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function kv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Tv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Uf(e){if(al(e)!==e)throw Error(O(188))}function Ax(e){var t=e.alternate;if(!t){if(t=al(e),t===null)throw Error(O(188));return t!==e?null:e}for(var a=e,i=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){a=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Uf(r),e;if(s===i)return Uf(r),t;s=s.sibling}throw Error(O(188))}if(a.return!==i.return)a=r,i=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,i=s;break}if(d===i){c=!0,i=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=r;break}if(d===i){c=!0,i=s,a=r;break}d=d.sibling}if(!c)throw Error(O(189))}}if(a.alternate!==i)throw Error(O(190))}if(a.tag!==3)throw Error(O(188));return a.stateNode.current===a?e:t}function Ev(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Ev(e),t!==null)return t;e=e.sibling}return null}function ca(e,t,a,i,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&ca(e.child,t,a,i,r,s))return!0;e=e.sibling}return!1}function uo(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function qf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Cv(e){var t=[null,null],a=uo(e);return a===null||zv(t,e,a.child,{foundSelf:!1}),t}function zv(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&zv(e,t,a.child,i))return!0;a=a.sibling}return!1}function gt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(O(559))}}var Ko=null,$h=null;function Rx(e,t,a){return e===a?!0:e===t?(Ko=e,!0):!1}function Mx(e,t,a){return e===a?($h=e,!1):e===t?($h!==null&&(Ko=e),!0):!1}function Bf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function xh(e,t,a){for(var i=0,r=e;r;r=a(r))i++;r=0;for(var s=t;s;s=a(s))r++;for(;0<i-r;)e=a(e),i--;for(;0<r-i;)t=a(t),r--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var je=Object.assign,Ox=Symbol.for("react.element"),nc=Symbol.for("react.transitional.element"),xs=Symbol.for("react.portal"),Jo=Symbol.for("react.fragment"),Av=Symbol.for("react.strict_mode"),Nh=Symbol.for("react.profiler"),Rv=Symbol.for("react.consumer"),un=Symbol.for("react.context"),Mm=Symbol.for("react.forward_ref"),Sh=Symbol.for("react.suspense"),kh=Symbol.for("react.suspense_list"),Om=Symbol.for("react.memo"),oi=Symbol.for("react.lazy"),Th=Symbol.for("react.activity"),Vx=Symbol.for("react.legacy_hidden"),Dx=Symbol.for("react.memo_cache_sentinel"),Eh=Symbol.for("react.view_transition"),Ix=Symbol.for("react.recoverable"),jf=Symbol.iterator;function fs(e){return e===null||typeof e!="object"?null:(e=jf&&e[jf]||e["@@iterator"],typeof e=="function"?e:null)}var _x=Symbol.for("react.client.reference");function Ch(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===_x?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Jo:return"Fragment";case Nh:return"Profiler";case Av:return"StrictMode";case Sh:return"Suspense";case kh:return"SuspenseList";case Th:return"Activity";case Eh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case xs:return"Portal";case un:return e.displayName||"Context";case Rv:return(e._context.displayName||"Context")+".Consumer";case Mm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Om:return t=e.displayName||null,t!==null?t:Ch(e.type)||"Memo";case oi:t=e._payload,e=e._init;try{return Ch(e(t))}catch{}}return null}var Ns=Array.isArray,ee=Nv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ce=zx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ji={pending:!1,data:null,method:null,action:null},zh=[],Fo=-1;function bn(e){return{current:e}}function At(e){0>Fo||(e.current=zh[Fo],zh[Fo]=null,Fo--)}function Qe(e,t){Fo++,zh[Fo]=e.current,e.current=t}var pn=bn(null),qs=bn(null),pi=bn(null),Lc=bn(null);function Gc(e,t){switch(Qe(pi,t),Qe(qs,e),Qe(pn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?av(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=av(t),e=Ww(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}At(pn),Qe(pn,e)}function vr(){At(pn),At(qs),At(pi)}function Ah(e){var t=e.memoizedState;t!==null&&(Cr._currentValue=t.memoizedState,Qe(Lc,e)),t=pn.current;var a=Ww(t,e.type);t!==a&&(Qe(qs,e),Qe(pn,a))}function Yc(e){qs.current===e&&(At(pn),At(qs)),Lc.current===e&&(At(Lc),Cr._currentValue=Ji)}var Gd,Lf;function ni(e){if(Gd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Gd=t&&t[1]||"",Lf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Gd+e+Lf}var Yd=!1;function Xd(e,t){if(!e||Yd)return"";Yd=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(A){var g=A}Reflect.construct(e,[],x)}else{try{x.call()}catch(A){g=A}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(A){g=A}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(A){if(A&&g&&typeof A.stack=="string")return[A.stack,g.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),f=d.split(`
`);for(r=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;r<f.length&&!f[r].includes("DetermineComponentFrameRoot");)r++;if(i===h.length||r===f.length)for(i=h.length-1,r=f.length-1;1<=i&&0<=r&&h[i]!==f[r];)r--;for(;1<=i&&0<=r;i--,r--)if(h[i]!==f[r]){if(i!==1||r!==1)do if(i--,r--,0>r||h[i]!==f[r]){var $=`
`+h[i].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=i&&0<=r);break}}}finally{Yd=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?ni(a):""}function Hx(e,t){switch(e.tag){case 26:case 27:case 5:return ni(e.type);case 16:return ni("Lazy");case 13:return e.child!==t&&t!==null?ni("Suspense Fallback"):ni("Suspense");case 19:return ni("SuspenseList");case 0:case 15:return Xd(e.type,!1);case 11:return Xd(e.type.render,!1);case 1:return Xd(e.type,!0);case 31:return ni("Activity");case 30:return ni("ViewTransition");default:return""}}function Gf(e){try{var t="",a=null;do t+=Hx(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Rh=Object.prototype.hasOwnProperty,Vm=ft.unstable_scheduleCallback,Qd=ft.unstable_cancelCallback,Ux=ft.unstable_shouldYield,qx=ft.unstable_requestPaint,va=ft.unstable_now,Bx=ft.unstable_getCurrentPriorityLevel,Mv=ft.unstable_ImmediatePriority,Ov=ft.unstable_UserBlockingPriority,Xc=ft.unstable_NormalPriority,jx=ft.unstable_LowPriority,Vv=ft.unstable_IdlePriority,Lx=ft.log,Gx=ft.unstable_setDisableYieldValue,nl=null,ya=null;function li(e){if(typeof Lx=="function"&&Gx(e),ya&&typeof ya.setStrictMode=="function")try{ya.setStrictMode(nl,e)}catch{}}var wa=Math.clz32?Math.clz32:Qx,Yx=Math.log,Xx=Math.LN2;function Qx(e){return e>>>=0,e===0?32:31-(Yx(e)/Xx|0)|0}var ic=256,oc=262144,rc=4194304;function Xi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function vu(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?r=Xi(i):(c&=d,c!==0?r=Xi(c):a||(a=d&~e,a!==0&&(r=Xi(a))))):(d=i&~s,d!==0?r=Xi(d):c!==0?r=Xi(c):a||(a=i&~e,a!==0&&(r=Xi(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function il(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Dv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-wa(a),r=1<<i;t|=e[i],a&=~r}return t}function Zx(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Iv(){var e=rc;return rc<<=1,(rc&62914560)===0&&(rc=4194304),e}function Zd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function ol(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Px(e,t,a,i,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,f=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-wa(a),x=1<<$;d[$]=0,h[$]=-1;var g=f[$];if(g!==null)for(f[$]=null,$=0;$<g.length;$++){var b=g[$];b!==null&&(b.lane&=-536870913)}a&=~x}i!==0&&_v(e,i,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function _v(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-wa(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Hv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-wa(a),r=1<<i;r&t|e[i]&t&&(e[i]|=t),a&=~r}}function Uv(e,t){var a=t&-t;return a=(a&42)!==0?1:Dm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Dm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Im(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function qv(){var e=Ce.p;return e!==0?e:(e=window.event,e===void 0?32:$0(e.type))}function Yf(e,t){var a=Ce.p;try{return Ce.p=e,t()}finally{Ce.p=a}}var jn=Math.random().toString(36).slice(2),Ct="__reactFiber$"+jn,ua="__reactProps$"+jn,Rr="__reactContainer$"+jn,Xf="__reactEvents$"+jn,Kx="__reactListeners$"+jn,Jx="__reactHandles$"+jn,Qf="__reactResources$"+jn,rl="__reactMarker$"+jn,Qc="__reactLoad$"+jn;function yu(e){delete e[Ct],delete e[ua],delete e[Kx],delete e[Jx]}function Pi(e){var t;if(t=e[Ct])return t;for(var a=e.parentNode;a;){if(t=a[Rr]||a[Ct]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=uv(e);e!==null;){if(a=e[Ct])return a;e=uv(e)}return t}e=a,a=e.parentNode}return null}function Mr(e){if(e=e[Ct]||e[Rr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ss(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(O(33))}function lr(e){var t=e[Qf];return t||(t=e[Qf]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function xt(e){e[rl]=!0}function Bv(e){e[Qc]=void 0}var jv=new Set,Lv={};function ho(e,t){yr(e,t),yr(e+"Capture",t)}function yr(e,t){for(Lv[e]=t,e=0;e<t.length;e++)jv.add(t[e])}var Fx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Zf={},Pf={};function Wx(e){return Rh.call(Pf,e)?!0:Rh.call(Zf,e)?!1:Fx.test(e)?Pf[e]=!0:(Zf[e]=!0,!1)}var Te=!1;function Kf(){var e=Te;return Te=!1,e}function Sc(e,t,a){if(Wx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function sc(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function An(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function pa(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Gv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function eN(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Mh(e){if(!e._valueTracker){var t=Gv(e)?"checked":"value";e._valueTracker=eN(e,t,""+e[t])}}function Yv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=Gv(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var tN=/[\n"\\]/g;function Va(e){return e.replace(tN,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Oh(e,t,a,i,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+pa(t)):e.value!==""+pa(t)&&(e.value=""+pa(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Pd(e,pa(e.value)):Pd(e,pa(t)):a!=null?Pd(e,pa(a)):i!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+pa(d):e.removeAttribute("name")}function Xv(e,t,a,i,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){Mh(e);return}a=a!=null?""+pa(a):"",t=t!=null?""+pa(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),Mh(e)}function Pd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function cr(e,t,a,i){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&i&&(e[a].defaultSelected=!0)}else{for(a=""+pa(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,i&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Qv(e,t,a){if(t!=null&&(t=""+pa(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+pa(a):""}function Zv(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(O(92));if(Ns(i)){if(1<i.length)throw Error(O(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=pa(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),Mh(e)}function wr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var aN=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Jf(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||aN.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Pv(e,t,a){if(t!=null&&typeof t!="object")throw Error(O(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",Te=!0);for(var r in t)i=t[r],t.hasOwnProperty(r)&&a[r]!==i&&(Jf(e,r,i),Te=!0)}else for(var s in t)t.hasOwnProperty(s)&&Jf(e,s,t[s])}function _m(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var nN=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),iN=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function kc(e){return iN.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function dn(){}var Vh=null;function Hm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Wo=null,ur=null;function Ff(e){var t=Mr(e);if(t&&(e=t.stateNode)){var a=e[ua]||null;e:switch(e=t.stateNode,t.type){case"input":if(Oh(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Va(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var r=i[ua]||null;if(!r)throw Error(O(90));Oh(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Yv(i)}break e;case"textarea":Qv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&cr(e,!!a.multiple,t,!1)}}}var Kd=!1;function Kv(e,t,a){if(Kd)return e(t,a);Kd=!0;try{var i=e(t);return i}finally{if(Kd=!1,(Wo!==null||ur!==null)&&(Ou(),Wo&&(t=Wo,e=ur,ur=Wo=null,Ff(t),e)))for(t=0;t<e.length;t++)Ff(e[t])}}function Bs(e,t){var a=e.stateNode;if(a===null)return null;var i=a[ua]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(O(231,t,typeof a));return a}var In=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Dh=!1;if(In)try{Go={},Object.defineProperty(Go,"passive",{get:function(){Dh=!0}}),window.addEventListener("test",Go,Go),window.removeEventListener("test",Go,Go)}catch{Dh=!1}var Go,ci=null,Um=null,Tc=null;function Jv(){if(Tc)return Tc;var e,t=Um,a=t.length,i,r="value"in ci?ci.value:ci.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===r[s-i];i++);return Tc=r.slice(e,1<i?1-i:void 0)}function Ec(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function lc(){return!0}function Wf(){return!1}function Pt(e){function t(a,i,r,s,c){this._reactName=a,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?lc:Wf,this.isPropagationStopped=Wf,this}return je(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=lc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=lc)},persist:function(){},isPersistent:lc}),t}var zi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},wu=Pt(zi),sl=je({},zi,{view:0,detail:0}),oN=Pt(sl),Jd,Fd,bs,$u=je({},sl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:qm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==bs&&(bs&&e.type==="mousemove"?(Jd=e.screenX-bs.screenX,Fd=e.screenY-bs.screenY):Fd=Jd=0,bs=e),Jd)},movementY:function(e){return"movementY"in e?e.movementY:Fd}}),eb=Pt($u),rN=je({},$u,{dataTransfer:0}),sN=Pt(rN),lN=je({},sl,{relatedTarget:0}),Wd=Pt(lN),cN=je({},zi,{animationName:0,elapsedTime:0,pseudoElement:0}),uN=Pt(cN),dN=je({},zi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),hN=Pt(dN),mN=je({},zi,{data:0}),tb=Pt(mN),pN={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},gN={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},fN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function bN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=fN[e])?!!t[e]:!1}function qm(){return bN}var vN=je({},sl,{key:function(e){if(e.key){var t=pN[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Ec(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?gN[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:qm,charCode:function(e){return e.type==="keypress"?Ec(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Ec(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),yN=Pt(vN),wN=je({},$u,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),ab=Pt(wN),$N=je({},zi,{submitter:0}),xN=Pt($N),NN=je({},sl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:qm}),SN=Pt(NN),kN=je({},zi,{propertyName:0,elapsedTime:0,pseudoElement:0}),TN=Pt(kN),EN=je({},$u,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),CN=Pt(EN),zN=je({},zi,{newState:0,oldState:0,source:0}),AN=Pt(zN),RN=[9,13,27,32],Bm=In&&"CompositionEvent"in window,Es=null;In&&"documentMode"in document&&(Es=document.documentMode);var MN=In&&"TextEvent"in window&&!Es,Fv=In&&(!Bm||Es&&8<Es&&11>=Es),nb=" ",ib=!1;function Wv(e,t){switch(e){case"keyup":return RN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function ey(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var er=!1;function ON(e,t){switch(e){case"compositionend":return ey(t);case"keypress":return t.which!==32?null:(ib=!0,nb);case"textInput":return e=t.data,e===nb&&ib?null:e;default:return null}}function VN(e,t){if(er)return e==="compositionend"||!Bm&&Wv(e,t)?(e=Jv(),Tc=Um=ci=null,er=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Fv&&t.locale!=="ko"?null:t.data;default:return null}}var DN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ob(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!DN[e.type]:t==="textarea"}function ty(e,t,a,i){Wo?ur?ur.push(i):ur=[i]:Wo=i,t=gu(t,"onChange"),0<t.length&&(a=new wu("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var Cs=null,js=null;function IN(e){Kw(e,0)}function xu(e){var t=Ss(e);if(Yv(t))return e}function rb(e,t){if(e==="change")return t}var ay=!1;In&&(In?(uc="oninput"in document,uc||(eh=document.createElement("div"),eh.setAttribute("oninput","return;"),uc=typeof eh.oninput=="function"),cc=uc):cc=!1,ay=cc&&(!document.documentMode||9<document.documentMode));var cc,uc,eh;function sb(){Cs&&(Cs.detachEvent("onpropertychange",ny),js=Cs=null)}function ny(e){if(e.propertyName==="value"&&xu(js)){var t=[];ty(t,js,e,Hm(e)),Kv(IN,t)}}function _N(e,t,a){e==="focusin"?(sb(),Cs=t,js=a,Cs.attachEvent("onpropertychange",ny)):e==="focusout"&&sb()}function HN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return xu(js)}function UN(e,t){if(e==="click")return xu(t)}function qN(e,t){if(e==="input"||e==="change")return xu(t)}function BN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var xa=typeof Object.is=="function"?Object.is:BN;function Ls(e,t){if(xa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var r=a[i];if(!Rh.call(t,r)||!xa(e[r],t[r]))return!1}return!0}function Ih(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function lb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function cb(e,t){var a=lb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=lb(a)}}function iy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?iy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function oy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ih(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Ih(e.document)}return t}function jm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var jN=In&&"documentMode"in document&&11>=document.documentMode,tr=null,_h=null,zs=null,Hh=!1;function ub(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Hh||tr==null||tr!==Ih(i)||(i=tr,"selectionStart"in i&&jm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),zs&&Ls(zs,i)||(zs=i,i=gu(_h,"onSelect"),0<i.length&&(t=new wu("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=tr)))}function Gi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var ar={animationend:Gi("Animation","AnimationEnd"),animationiteration:Gi("Animation","AnimationIteration"),animationstart:Gi("Animation","AnimationStart"),transitionrun:Gi("Transition","TransitionRun"),transitionstart:Gi("Transition","TransitionStart"),transitioncancel:Gi("Transition","TransitionCancel"),transitionend:Gi("Transition","TransitionEnd")},th={},ry={};In&&(ry=document.createElement("div").style,"AnimationEvent"in window||(delete ar.animationend.animation,delete ar.animationiteration.animation,delete ar.animationstart.animation),"TransitionEvent"in window||delete ar.transitionend.transition);function mo(e){if(th[e])return th[e];if(!ar[e])return e;var t=ar[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in ry)return th[e]=t[a];return e}var sy=mo("animationend"),ly=mo("animationiteration"),cy=mo("animationstart"),LN=mo("transitionrun"),GN=mo("transitionstart"),YN=mo("transitioncancel"),uy=mo("transitionend"),dy=new Map,Uh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Uh.push("scrollEnd");function Ja(e,t){dy.set(e,t),ho(t,[e])}var XN=0;function _n(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ka.identifierPrefix;var a=XN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function db(e){if(e==null||typeof e=="string")return e;var t=null,a=br;if(a!==null)for(var i=0;i<a.length;i++){var r=e[a[i]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function Ln(e,t){return e=db(e),t=db(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Zc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Ra=[],nr=0,Lm=0;function Nu(){for(var e=nr,t=Lm=nr=0;t<e;){var a=Ra[t];Ra[t++]=null;var i=Ra[t];Ra[t++]=null;var r=Ra[t];Ra[t++]=null;var s=Ra[t];if(Ra[t++]=null,i!==null&&r!==null){var c=i.pending;c===null?r.next=r:(r.next=c.next,c.next=r),i.pending=r}s!==0&&hy(a,r,s)}}function Su(e,t,a,i){Ra[nr++]=e,Ra[nr++]=t,Ra[nr++]=a,Ra[nr++]=i,Lm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Gm(e,t,a,i){return Su(e,t,a,i),Pc(e)}function po(e,t){return Su(e,null,null,t),Pc(e)}function hy(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-wa(a),e=s.hiddenUpdates,i=e[r],i===null?e[r]=[t]:i.push(t),t.lane=a|536870912),s):null}function Pc(e){if(50<Us)throw Us=0,_c=null,Error(O(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ir={};function QN(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function sa(e,t,a,i){return new QN(e,t,a,i)}function Ym(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Vn(e,t){var a=e.alternate;return a===null?(a=sa(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function my(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Cc(e,t,a,i,r,s){var c=0;if(i=e,typeof i=="function")Ym(i)&&(c=1);else if(typeof i=="string")c=y2(e,a,pn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case Th:return e=sa(31,a,t,r),e.elementType=Th,e.lanes=s,e;case Jo:return Fi(a.children,r,s,t);case Av:c=8,r|=24;break;case Nh:return e=sa(12,a,t,r|2),e.elementType=Nh,e.lanes=s,e;case Sh:return e=sa(13,a,t,r),e.elementType=Sh,e.lanes=s,e;case kh:return e=sa(19,a,t,r),e.elementType=kh,e.lanes=s,e;case Vx:case Eh:return e=r|32,e=sa(30,a,t,e),e.elementType=Eh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case un:c=10;break e;case Rv:c=9;break e;case Mm:c=11;break e;case Om:c=14;break e;case oi:c=16,i=null;break e}c=29,a=Error(O(130,e===null?"null":typeof e,"")),i=null}return t=sa(c,a,t,r),t.elementType=e,t.type=i,t.lanes=s,t}function Fi(e,t,a,i){return e=sa(7,e,i,t),e.lanes=a,e}function ah(e,t,a){return e=sa(6,e,null,t),e.lanes=a,e}function py(e){var t=sa(18,null,null,0);return t.stateNode=e,t}function nh(e,t,a){return t=sa(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var hb=new WeakMap;function Da(e,t){if(typeof e=="object"&&e!==null){var a=hb.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Gf(t)},hb.set(e,t),t)}return{value:e,source:t,stack:Gf(t)}}var or=[],rr=0,Kc=null,Gs=0,Ma=[],Oa=0,Si=null,hn=1,mn="";function Mn(e,t){or[rr++]=Gs,or[rr++]=Kc,Kc=e,Gs=t}function gy(e,t,a){Ma[Oa++]=hn,Ma[Oa++]=mn,Ma[Oa++]=Si,Si=e;var i=hn;e=mn;var r=32-wa(i)-1;i&=~(1<<r),a+=1;var s=32-wa(t)+r;if(30<s){var c=r-r%5;s=(i&(1<<c)-1).toString(32),i>>=c,r-=c,hn=1<<32-wa(t)+r|a<<r|i,mn=s+e}else hn=1<<s|a<<r|i,mn=e}function ku(e){e.return!==null&&(Mn(e,1),gy(e,1,0))}function Xm(e){for(;e===Kc;)Kc=or[--rr],or[rr]=null,Gs=or[--rr],or[rr]=null;for(;e===Si;)Si=Ma[--Oa],Ma[Oa]=null,mn=Ma[--Oa],Ma[Oa]=null,hn=Ma[--Oa],Ma[Oa]=null}function fy(e,t){Ma[Oa++]=hn,Ma[Oa++]=mn,Ma[Oa++]=Si,hn=t.id,mn=t.overflow,Si=e}var Nt=null,Xe=null,ge=!1,gi=null,Ia=!1,qh=Error(O(519));function ki(e){var t=Error(O(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ys(Da(t,e)),qh}function mb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[Ct]=e,t[ua]=i,a){case"dialog":fe("cancel",t),fe("close",t);break;case"iframe":case"object":case"embed":fe("load",t);break;case"video":case"audio":for(a=0;a<Ps.length;a++)fe(Ps[a],t);break;case"source":fe("error",t);break;case"img":case"image":case"link":fe("error",t),fe("load",t);break;case"details":fe("toggle",t);break;case"input":fe("invalid",t),Xv(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":fe("invalid",t);break;case"textarea":fe("invalid",t),Zv(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||Fw(t.textContent,a)?(i.popover!=null&&(fe("beforetoggle",t),fe("toggle",t)),i.onScroll!=null&&fe("scroll",t),i.onScrollEnd!=null&&fe("scrollend",t),i.onClick!=null&&(t.onclick=dn),t=!0):t=!1,t||ki(e,!0)}function Jc(e){for(Nt=e.return;Nt;)switch(Nt.tag){case 5:case 31:case 13:Ia=!1;return;case 27:case 3:Ia=!0;return;default:Nt=Nt.return}}function Yo(e){if(e!==Nt)return!1;if(!ge)return Jc(e),ge=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Sm(e.type,e.memoizedProps)),a=!a),a&&Xe&&ki(e),Jc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(O(317));Xe=cv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(O(317));Xe=cv(e)}else t===27?(t=Xe,Ai(e.type)?(e=Cm,Cm=null,Xe=e):Xe=t):Xe=Nt?_a(e.stateNode.nextSibling):null;return!0}function ao(){Xe=Nt=null,ge=!1}function ih(){var e=gi;return e!==null&&(oa===null?oa=e:oa.push.apply(oa,e),gi=null),e}function Ys(e){gi===null?gi=[e]:gi.push(e)}var Bh=bn(null),go=null,On=null;function ui(e,t,a){Qe(Bh,t._currentValue),t._currentValue=a}function Dn(e){e._currentValue=Bh.current,At(Bh)}function zc(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function jh(e,t,a,i){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),zc(s.return,a,e),i||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(O(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),zc(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),zc(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function no(e,t,a,i){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(O(387));if(c=c.memoizedProps,c!==null){var d=r.type;xa(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===Lc.current){if(c=r.alternate,c===null)throw Error(O(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(Cr):e=[Cr])}r=r.return}return e!==null&&jh(t,e,a,i),t.flags|=262144,e!==null}function Fc(e){for(e=e.firstContext;e!==null;){if(!xa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function io(e){go=e,On=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function zt(e){return by(go,e)}function dc(e,t){return go===null&&io(e),by(e,t)}function by(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},On===null){if(e===null)throw Error(O(308));On=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else On=On.next=t;return a}var ZN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},PN=ft.unstable_scheduleCallback,KN=ft.unstable_NormalPriority,ht={$$typeof:un,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Qm(){return{controller:new ZN,data:new Map,refCount:0}}function ll(e){e.refCount--,e.refCount===0&&PN(KN,function(){e.controller.abort()})}function pb(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var ks=null;function JN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var As=null,Lh=0,oo=0,dr=null;function FN(e,t){if(As===null){var a=As=[];Lh=0,oo=$p(),dr={status:"pending",value:void 0,then:function(i){a.push(i)}}}return Lh++,t.then(gb,gb),t}function gb(){if(--Lh===0&&(ks=null,As!==null)){dr!==null&&(dr.status="fulfilled");var e=As;As=null,oo=0,dr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function WN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(i.status="rejected",i.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),i}var fb=ee.S;ee.S=function(e,t){if(Dw=va(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&FN(e,t),ks!==null)for(var a=kr;a!==null;)pb(a,ks),a=a.next;if(a=e.types,a!==null){for(var i=kr;i!==null;)pb(i,a),i=i.next;if(oo!==0){i=ks,i===null&&(i=ks=[]);for(var r=0;r<a.length;r++){var s=a[r];i.indexOf(s)===-1&&i.push(s)}}}fb!==null&&fb(e,t)};var Wi=bn(null);function Zm(){var e=Wi.current;return e!==null?e:Be.pooledCache}function Ac(e,t){t===null?Qe(Wi,Wi.current):Qe(Wi,t.pool)}function vy(){var e=Zm();return e===null?null:{parent:ht._currentValue,pool:e}}var Or=Error(O(460)),Pm=Error(O(474)),Tu=Error(O(542)),Wc={then:function(){}};function bb(e){return e=e.status,e==="fulfilled"||e==="rejected"}function yy(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(dn,dn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,yb(e),e===void 0&&!("reason"in t)?Error(O(600)):e;default:if(typeof t.status=="string")t.then(dn,dn);else{if(e=Be,e!==null&&100<e.shellSuspendCounter)throw Error(O(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=i}},function(i){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,yb(e),e}throw eo=t,Or}}function Qi(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(eo=a,Or):a}}var eo=null;function vb(){if(eo===null)throw Error(O(459));var e=eo;return eo=null,e}function yb(e){if(e===Or||e===Tu)throw Error(O(483))}var hr=null,Xs=0;function hc(e){var t=Xs;return Xs+=1,hr===null&&(hr=[]),yy(hr,e,t)}function ai(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function mc(e,t){throw t.$$typeof===Ox?Error(O(525)):(e=Object.prototype.toString.call(t),Error(O(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function wy(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function i(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function r(w,y){return w=Vn(w,y),w.index=0,w.sibling=null,w}function s(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function d(w,y,v,k){return y===null||y.tag!==6?(y=ah(v,w.mode,k),y.return=w,y):(y=r(y,v),y.return=w,y)}function h(w,y,v,k){var V=v.type;return V===Jo?(w=$(w,y,v.props.children,k,v.key),ai(w,v),w):y!==null&&(y.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===oi&&Qi(V)===y.type)?(y=r(y,v.props),ai(y,v),y.return=w,y):(y=Cc(v.type,v.key,v.props,null,w.mode,k),ai(y,v),y.return=w,y)}function f(w,y,v,k){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=nh(v,w.mode,k),y.return=w,y):(y=r(y,v.children||[]),y.return=w,y)}function $(w,y,v,k,V){return y===null||y.tag!==7?(y=Fi(v,w.mode,k,V),y.return=w,y):(y=r(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=ah(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case nc:return v=Cc(y.type,y.key,y.props,null,w.mode,v),ai(v,y),v.return=w,v;case xs:return y=nh(y,w.mode,v),y.return=w,y;case oi:return y=Qi(y),x(w,y,v)}if(Ns(y)||fs(y))return y=Fi(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,hc(y),v);if(y.$$typeof===un)return x(w,dc(w,y),v);mc(w,y)}return null}function g(w,y,v,k){var V=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return V!==null?null:d(w,y,""+v,k);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case nc:return v.key===V?h(w,y,v,k):null;case xs:return v.key===V?f(w,y,v,k):null;case oi:return v=Qi(v),g(w,y,v,k)}if(Ns(v)||fs(v))return V!==null?null:$(w,y,v,k,null);if(typeof v.then=="function")return g(w,y,hc(v),k);if(v.$$typeof===un)return g(w,y,dc(w,v),k);mc(w,v)}return null}function b(w,y,v,k,V){if(typeof k=="string"&&k!==""||typeof k=="number"||typeof k=="bigint")return w=w.get(v)||null,d(y,w,""+k,V);if(typeof k=="object"&&k!==null){switch(k.$$typeof){case nc:return w=w.get(k.key===null?v:k.key)||null,h(y,w,k,V);case xs:return w=w.get(k.key===null?v:k.key)||null,f(y,w,k,V);case oi:return k=Qi(k),b(w,y,v,k,V)}if(Ns(k)||fs(k))return w=w.get(v)||null,$(y,w,k,V,null);if(typeof k.then=="function")return b(w,y,v,hc(k),V);if(k.$$typeof===un)return b(w,y,v,dc(y,k),V);mc(y,k)}return null}function A(w,y,v,k){for(var V=null,P=null,H=y,L=y=0,ve=null;H!==null&&L<v.length;L++){H.index>L?(ve=H,H=null):ve=H.sibling;var Z=g(w,H,v[L],k);if(Z===null){H===null&&(H=ve);break}e&&H&&Z.alternate===null&&t(w,H),y=s(Z,y,L),P===null?V=Z:P.sibling=Z,P=Z,H=ve}if(L===v.length)return a(w,H),ge&&Mn(w,L),V;if(H===null){for(;L<v.length;L++)H=x(w,v[L],k),H!==null&&(y=s(H,y,L),P===null?V=H:P.sibling=H,P=H);return ge&&Mn(w,L),V}for(H=i(H);L<v.length;L++)ve=b(H,w,L,v[L],k),ve!==null&&(e&&(Z=ve.alternate,Z!==null&&H.delete(Z.key===null?L:Z.key)),y=s(ve,y,L),P===null?V=ve:P.sibling=ve,P=ve);return e&&H.forEach(function(De){return t(w,De)}),ge&&Mn(w,L),V}function C(w,y,v,k){if(v==null)throw Error(O(151));for(var V=null,P=null,H=y,L=y=0,ve=null,Z=v.next();H!==null&&!Z.done;L++,Z=v.next()){H.index>L?(ve=H,H=null):ve=H.sibling;var De=g(w,H,Z.value,k);if(De===null){H===null&&(H=ve);break}e&&H&&De.alternate===null&&t(w,H),y=s(De,y,L),P===null?V=De:P.sibling=De,P=De,H=ve}if(Z.done)return a(w,H),ge&&Mn(w,L),V;if(H===null){for(;!Z.done;L++,Z=v.next())Z=x(w,Z.value,k),Z!==null&&(y=s(Z,y,L),P===null?V=Z:P.sibling=Z,P=Z);return ge&&Mn(w,L),V}for(H=i(H);!Z.done;L++,Z=v.next())Z=b(H,w,L,Z.value,k),Z!==null&&(e&&(ve=Z.alternate,ve!==null&&H.delete(ve.key===null?L:ve.key)),y=s(Z,y,L),P===null?V=Z:P.sibling=Z,P=Z);return e&&H.forEach(function(tt){return t(w,tt)}),ge&&Mn(w,L),V}function M(w,y,v,k){if(typeof v=="object"&&v!==null&&v.type===Jo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case nc:e:{for(var V=v.key;y!==null;){if(y.key===V){if(V=v.type,V===Jo){if(y.tag===7){a(w,y.sibling),k=r(y,v.props.children),ai(k,v),k.return=w,w=k;break e}}else if(y.elementType===V||typeof V=="object"&&V!==null&&V.$$typeof===oi&&Qi(V)===y.type){a(w,y.sibling),k=r(y,v.props),ai(k,v),k.return=w,w=k;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===Jo?(k=Fi(v.props.children,w.mode,k,v.key),ai(k,v),k.return=w,w=k):(k=Cc(v.type,v.key,v.props,null,w.mode,k),ai(k,v),k.return=w,w=k)}return c(w);case xs:e:{for(V=v.key;y!==null;){if(y.key===V)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),k=r(y,v.children||[]),k.return=w,w=k;break e}else{a(w,y);break}else t(w,y);y=y.sibling}k=nh(v,w.mode,k),k.return=w,w=k}return c(w);case oi:return v=Qi(v),M(w,y,v,k)}if(Ns(v))return A(w,y,v,k);if(fs(v)){if(V=fs(v),typeof V!="function")throw Error(O(150));return v=V.call(v),C(w,y,v,k)}if(typeof v.then=="function")return M(w,y,hc(v),k);if(v.$$typeof===un)return M(w,y,dc(w,v),k);mc(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),k=r(y,v),k.return=w,w=k):(a(w,y),k=ah(v,w.mode,k),k.return=w,w=k),c(w)):a(w,y)}return function(w,y,v,k){try{Xs=0;var V=M(w,y,v,k);return hr=null,V}catch(H){if(H===Or||H===Tu)throw H;var P=sa(29,H,null,w.mode);return P.lanes=k,P.return=w,P}}}var ro=wy(!0),$y=wy(!1),ri=!1;function Km(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Gh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function fi(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function bi(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Ee&2)!==0){var r=i.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),i.pending=t,t=Pc(e),hy(e,null,a),t}return Su(e,i,t,a),Pc(e)}function Rs(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Hv(e,a)}}function oh(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Yh=!1;function Ms(){if(Yh){var e=dr;if(e!==null)throw e}}function Os(e,t,a,i){Yh=!1;var r=e.updateQueue;ri=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,f=h.next;h.next=null,c===null?s=f:c.next=f,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,d=$.lastBaseUpdate,d!==c&&(d===null?$.firstBaseUpdate=f:d.next=f,$.lastBaseUpdate=h))}if(s!==null){var x=r.baseState;c=0,$=f=h=null,d=s;do{var g=d.lane&-536870913,b=g!==d.lane;if(b?(ye&g)===g:(i&g)===g){g!==0&&g===oo&&(Yh=!0),$!==null&&($=$.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var A=e,C=d;g=t;var M=a;switch(C.tag){case 1:if(A=C.payload,typeof A=="function"){x=A.call(M,x,g);break e}x=A;break e;case 3:A.flags=A.flags&-65537|128;case 0:if(A=C.payload,g=typeof A=="function"?A.call(M,x,g):A,g==null)break e;x=je({},x,g);break e;case 2:ri=!0}}g=d.callback,g!==null&&(e.flags|=64,b&&(e.flags|=8192),b=r.callbacks,b===null?r.callbacks=[g]:b.push(g))}else b={lane:g,tag:d.tag,payload:d.payload,callback:d.callback,next:null},$===null?(f=$=b,h=x):$=$.next=b,c|=g;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;b=d,d=b.next,b.next=null,r.lastBaseUpdate=b,r.shared.pending=null}}while(!0);$===null&&(h=x),r.baseState=h,r.firstBaseUpdate=f,r.lastBaseUpdate=$,s===null&&(r.shared.lanes=0),Ci|=c,e.lanes=c,e.memoizedState=x}}function xy(e,t){if(typeof e!="function")throw Error(O(191,e));e.call(t)}function Ny(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)xy(a[e],t)}var Ti=bn(null),eu=bn(0);function wb(e,t){e=Bn,Qe(eu,e),Qe(Ti,t),Bn=e|t.baseLanes}function Xh(){Qe(eu,Bn),Qe(Ti,Ti.current)}function Jm(){Bn=eu.current,At(Ti),At(eu)}var Ot=bn(null),Ut=null;function vi(e){var t=e.alternate;Qe(Rt,Rt.current&1),Qe(Ot,e),Ut===null&&(t===null||Ti.current!==null||t.memoizedState!==null)&&(Ut=e)}function Qh(e){Qe(Rt,Rt.current),Qe(Ot,e),Ut===null&&(Ut=e)}function Sy(e){e.tag===22?(Qe(Rt,Rt.current),Qe(Ot,e),Ut===null&&(Ut=e)):yi()}function yi(){Qe(Rt,Rt.current),Qe(Ot,Ot.current)}function ga(e){At(Ot),Ut===e&&(Ut=null),At(Rt)}var Rt=bn(0);function Qs(e,t){Qe(Ot,Ot.current),Qe(Rt,t)}function Fm(e){At(Rt),At(Ot),Ut===e&&(Ut=null)}function tu(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Em(a)||kp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Hn=0,de=null,He=null,dt=null,au=!1,mr=!1,so=!1,nu=0,Zs=0,pr=null,e5=0;function ot(){throw Error(O(321))}function Wm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!xa(e[a],t[a]))return!1;return!0}function ep(e,t,a,i,r,s){return Hn=s,de=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ee.H=e===null||e.memoizedState===null?tw:aw,so=!1,s=a(i,r),so=!1,mr&&(s=Ty(t,a,i,r)),ky(e),s}function ky(e){ee.H=iu;var t=He!==null&&He.next!==null;if(Hn=0,dt=He=de=null,au=!1,Zs=0,pr=null,t)throw Error(O(300));e===null||mt||(e=e.dependencies,e!==null&&Fc(e)&&(mt=!0))}function Ty(e,t,a,i){de=e;var r=0;do{if(mr&&(pr=null),Zs=0,mr=!1,25<=r)throw Error(O(301));if(r+=1,dt=He=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ee.H=l5,s=t(a,i)}while(mr);return s}function t5(){var e=ee.H,t=e.useState()[0];return t=typeof t.then=="function"?cl(t):t,e=e.useState()[0],(He!==null?He.memoizedState:null)!==e&&(de.flags|=1024),t}function tp(){var e=nu!==0;return nu=0,e}function ap(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function np(e){if(au){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}au=!1}Hn=0,dt=He=de=null,mr=!1,Zs=nu=0,pr=null}function Zt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return dt===null?de.memoizedState=dt=e:dt=dt.next=e,dt}function st(){if(He===null){var e=de.alternate;e=e!==null?e.memoizedState:null}else e=He.next;var t=dt===null?de.memoizedState:dt.next;if(t!==null)dt=t,He=e;else{if(e===null)throw de.alternate===null?Error(O(467)):Error(O(310));He=e,e={memoizedState:He.memoizedState,baseState:He.baseState,baseQueue:He.baseQueue,queue:He.queue,next:null},dt===null?de.memoizedState=dt=e:dt=dt.next=e}return dt}function Eu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function cl(e){var t=Zs;return Zs+=1,pr===null&&(pr=[]),e=yy(pr,e,t),t=de,(dt===null?t.memoizedState:dt.next)===null&&(t=t.alternate,ee.H=t===null||t.memoizedState===null?tw:aw),e}function Cu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return cl(e);if(e.$$typeof===Ix)return;if(e.$$typeof===un)return zt(e)}throw Error(O(438,String(e)))}function ip(e){var t=null,a=de.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=de.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Eu(),de.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=Dx;return t.index++,a}function Un(e,t){return typeof t=="function"?t(e):t}function Rc(e){var t=st();return op(t,He,e)}function op(e,t,a){var i=e.queue;if(i===null)throw Error(O(311));i.lastRenderedReducer=a;var r=e.baseQueue,s=i.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,i.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,f=t,$=!1;do{var x=f.lane&-536870913;if(x!==f.lane?(ye&x)===x:(Hn&x)===x){var g=f.revertLane;if(g===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),x===oo&&($=!0);else if((Hn&g)===g){f=f.next,g===oo&&($=!0);continue}else x={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=x,c=s):h=h.next=x,de.lanes|=g,Ci|=g;x=f.action,so&&a(s,x),s=f.hasEagerState?f.eagerState:a(s,x)}else g={lane:x,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=g,c=s):h=h.next=g,de.lanes|=x,Ci|=x;f=f.next}while(f!==null&&f!==t);if(h===null?c=s:h.next=d,!xa(s,e.memoizedState)&&(mt=!0,$&&(a=dr,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return r===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function rh(e){var t=st(),a=t.queue;if(a===null)throw Error(O(311));a.lastRenderedReducer=e;var i=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);xa(s,t.memoizedState)||(mt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function Ey(e,t,a){var i=de,r=st(),s=ge;if(s){if(a===void 0)throw Error(O(407));a=a()}else a=t();var c=!xa((He||r).memoizedState,a);if(c&&(r.memoizedState=a,mt=!0),r=r.queue,rp(Ay.bind(null,i,r,e),[e]),e=r.getSnapshot!==t||c||dt!==null&&(dt.memoizedState.tag&1)!==0,$r(e?9:8,{destroy:void 0},zy.bind(null,i,r,a,t),null),e){if(i.flags|=2048,Be===null)throw Error(O(349));s||(Hn&127)!==0||Cy(i,t,a)}return a}function Cy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=de.updateQueue,t===null?(t=Eu(),de.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function zy(e,t,a,i){t.value=a,t.getSnapshot=i,Ry(t)&&My(e)}function Ay(e,t,a){return a(function(){Ry(t)&&My(e)})}function Ry(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!xa(e,a)}catch{return!0}}function My(e){var t=po(e,2);t!==null&&la(t,e,2)}function Zh(e){var t=Zt();if(typeof e=="function"){var a=e;if(e=a(),so){li(!0);try{a()}finally{li(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Un,lastRenderedState:e},t}function Oy(e,t,a,i){return e.baseState=a,op(e,He,typeof i=="function"?i:Un)}function a5(e,t,a,i,r){if(Au(e))throw Error(O(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};ee.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,Vy(t,s)):(s.next=a.next,t.pending=a.next=s)}}function Vy(e,t){var a=t.action,i=t.payload,r=e.state;if(t.isTransition){var s=ee.T,c={};c.types=s!==null?s.types:null,ee.T=c;try{var d=a(r,i),h=ee.S;h!==null&&h(c,d),$b(e,t,d)}catch(f){Ph(e,t,f)}finally{s!==null&&c.types!==null&&(s.types=c.types),ee.T=s}}else try{s=a(r,i),$b(e,t,s)}catch(f){Ph(e,t,f)}}function $b(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){xb(e,t,i)},function(i){return Ph(e,t,i)}):xb(e,t,a)}function xb(e,t,a){t.status="fulfilled",t.value=a,Dy(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Vy(e,a)))}function Ph(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,Dy(t),t=t.next;while(t!==i)}e.action=null}function Dy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Iy(e,t){return t}function Nb(e,t){if(ge){var a=Be.formState;if(a!==null){e:{var i=de;if(ge){if(Xe){t:{for(var r=Xe,s=Ia;r.nodeType!==8;){if(!s){r=null;break t}if(r=_a(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){Xe=_a(r.nextSibling),i=r.data==="F!";break e}}ki(i)}i=!1}i&&(t=a[0])}}return a=Zt(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Iy,lastRenderedState:t},a.queue=i,a=Fy.bind(null,de,i),i.dispatch=a,i=Zh(!1),s=up.bind(null,de,!1,i.queue),i=Zt(),r={state:t,dispatch:null,action:e,pending:null},i.queue=r,a=a5.bind(null,de,r,s,a),r.dispatch=a,i.memoizedState=e,[t,a,!1]}function Sb(e){var t=st();return _y(t,He,e)}function _y(e,t,a){if(t=op(e,t,Iy)[0],e=Rc(Un)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=cl(t)}catch(c){throw c===Or?Tu:c}else i=t;t=st();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(de.flags|=2048,$r(9,{destroy:void 0},n5.bind(null,r,a),null)),[i,s,e]}function n5(e,t){e.action=t}function kb(e){var t=st(),a=He;if(a!==null)return _y(t,a,e);st(),t=t.memoizedState,a=st();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function $r(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=de.updateQueue,t===null&&(t=Eu(),de.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Hy(){return st().memoizedState}function Mc(e,t,a,i){var r=Zt();de.flags|=e,r.memoizedState=$r(1|t,{destroy:void 0},a,i===void 0?null:i)}function zu(e,t,a,i){var r=st();i=i===void 0?null:i;var s=r.memoizedState.inst;He!==null&&i!==null&&Wm(i,He.memoizedState.deps)?r.memoizedState=$r(t,s,a,i):(de.flags|=e,r.memoizedState=$r(1|t,s,a,i))}function Tb(e,t){Mc(8390656,8,e,t)}function rp(e,t){zu(2048,8,e,t)}function i5(e){de.flags|=4;var t=de.updateQueue;if(t===null)t=Eu(),de.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Uy(e){var t=st().memoizedState;return i5({ref:t,nextImpl:e}),function(){if((Ee&2)!==0)throw Error(O(440));return t.impl.apply(void 0,arguments)}}function qy(e,t){return zu(4,2,e,t)}function By(e,t){return zu(4,4,e,t)}function jy(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ly(e,t,a){a=a!=null?a.concat([e]):null,zu(4,4,jy.bind(null,t,e),a)}function sp(){}function Gy(e,t){var a=st();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&Wm(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Yy(e,t){var a=st();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&Wm(t,i[1]))return i[0];if(i=e(),so){li(!0);try{e()}finally{li(!1)}}return a.memoizedState=[i,t],i}function lp(e,t,a){return a===void 0||(Hn&1073741824)!==0&&(ye&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=_w(),de.lanes|=e,Ci|=e,a)}function Xy(e,t,a,i){return xa(a,t)?a:Ti.current!==null?(e=lp(e,a,i),xa(e,t)||(mt=!0),e):(Hn&106)===0||(Hn&1073741824)!==0&&(ye&261930)===0?(mt=!0,e.memoizedState=a):(e=_w(),de.lanes|=e,Ci|=e,t)}function Qy(e,t,a,i,r){var s=Ce.p;Ce.p=s!==0&&8>s?s:8;var c=ee.T,d={};d.types=c!==null?c.types:null,ee.T=d,up(e,!1,t,a);try{var h=r(),f=ee.S;if(f!==null&&f(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=WN(h,i);Vs(e,t,$,$a(e))}else Vs(e,t,i,$a(e))}catch(x){Vs(e,t,{then:function(){},status:"rejected",reason:x},$a())}finally{Ce.p=s,c!==null&&d.types!==null&&(c.types=d.types),ee.T=c}}function o5(){}function Kh(e,t,a,i){if(e.tag!==5)throw Error(O(476));var r=Zy(e).queue;Qy(e,r,t,Ji,a===null?o5:function(){return Py(e),a(i)})}function Zy(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ji,baseState:Ji,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Un,lastRenderedState:Ji},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Un,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Py(e){var t=Zy(e);t.next===null&&(t=e.alternate.memoizedState),Vs(e,t.next.queue,{},$a())}function cp(){return zt(Cr)}function Ky(){return st().memoizedState}function Jy(){return st().memoizedState}function r5(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=$a();e=fi(a);var i=bi(t,e,a);i!==null&&(la(i,t,a),Rs(i,t,a)),t={cache:Qm()},e.payload=t;return}t=t.return}}function s5(e,t,a){var i=$a();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Au(e)?Wy(t,a):(a=Gm(e,t,a,i),a!==null&&(la(a,e,i),ew(a,t,i)))}function Fy(e,t,a){var i=$a();Vs(e,t,a,i)}function Vs(e,t,a,i){var r={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Au(e))Wy(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,xa(d,c))return Su(e,t,r,0),Be===null&&Nu(),!1}catch{}if(a=Gm(e,t,r,i),a!==null)return la(a,e,i),ew(a,t,i),!0}return!1}function up(e,t,a,i){if(i={lane:2,revertLane:$p(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Au(e)){if(t)throw Error(O(479))}else t=Gm(e,a,i,2),t!==null&&la(t,e,2)}function Au(e){var t=e.alternate;return e===de||t!==null&&t===de}function Wy(e,t){mr=au=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function ew(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Hv(e,a)}}var iu={readContext:zt,use:Cu,useCallback:ot,useContext:ot,useEffect:ot,useImperativeHandle:ot,useLayoutEffect:ot,useInsertionEffect:ot,useMemo:ot,useReducer:ot,useRef:ot,useState:ot,useDebugValue:ot,useDeferredValue:ot,useTransition:ot,useSyncExternalStore:ot,useId:ot,useHostTransitionStatus:ot,useFormState:ot,useActionState:ot,useOptimistic:ot,useMemoCache:ot,useCacheRefresh:ot,useEffectEvent:ot},tw={readContext:zt,use:Cu,useCallback:function(e,t){return Zt().memoizedState=[e,t===void 0?null:t],e},useContext:zt,useEffect:Tb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Mc(4194308,4,jy.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Mc(4194308,4,e,t)},useInsertionEffect:function(e,t){Mc(4,2,e,t)},useMemo:function(e,t){var a=Zt();t=t===void 0?null:t;var i=e();if(so){li(!0);try{e()}finally{li(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=Zt();if(a!==void 0){var r=a(t);if(so){li(!0);try{a(t)}finally{li(!1)}}}else r=t;return i.memoizedState=i.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},i.queue=e,e=e.dispatch=s5.bind(null,de,e),[i.memoizedState,e]},useRef:function(e){var t=Zt();return e={current:e},t.memoizedState=e},useState:function(e){e=Zh(e);var t=e.queue,a=Fy.bind(null,de,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:sp,useDeferredValue:function(e,t){var a=Zt();return lp(a,e,t)},useTransition:function(){var e=Zh(!1);return e=Qy.bind(null,de,e.queue,!0,!1),Zt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=de,r=Zt();if(ge){if(a===void 0)throw Error(O(407));a=a()}else{if(a=t(),Be===null)throw Error(O(349));(ye&127)!==0||Cy(i,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,Tb(Ay.bind(null,i,s,e),[e]),i.flags|=2048,$r(9,{destroy:void 0},zy.bind(null,i,s,a,t),null),a},useId:function(){var e=Zt(),t=Be.identifierPrefix;if(ge){var a=mn,i=hn;a=(i&~(1<<32-wa(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=nu++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=e5++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:cp,useFormState:Nb,useActionState:Nb,useOptimistic:function(e){var t=Zt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=up.bind(null,de,!0,a),a.dispatch=t,[e,t]},useMemoCache:ip,useCacheRefresh:function(){return Zt().memoizedState=r5.bind(null,de)},useEffectEvent:function(e){var t=Zt(),a={impl:e};return t.memoizedState=a,function(){if((Ee&2)!==0)throw Error(O(440));return a.impl.apply(void 0,arguments)}}},aw={readContext:zt,use:Cu,useCallback:Gy,useContext:zt,useEffect:rp,useImperativeHandle:Ly,useInsertionEffect:qy,useLayoutEffect:By,useMemo:Yy,useReducer:Rc,useRef:Hy,useState:function(){return Rc(Un)},useDebugValue:sp,useDeferredValue:function(e,t){var a=st();return Xy(a,He.memoizedState,e,t)},useTransition:function(){var e=Rc(Un)[0],t=st().memoizedState;return[typeof e=="boolean"?e:cl(e),t]},useSyncExternalStore:Ey,useId:Ky,useHostTransitionStatus:cp,useFormState:Sb,useActionState:Sb,useOptimistic:function(e,t){var a=st();return Oy(a,He,e,t)},useMemoCache:ip,useCacheRefresh:Jy,useEffectEvent:Uy},l5={readContext:zt,use:Cu,useCallback:Gy,useContext:zt,useEffect:rp,useImperativeHandle:Ly,useInsertionEffect:qy,useLayoutEffect:By,useMemo:Yy,useReducer:rh,useRef:Hy,useState:function(){return rh(Un)},useDebugValue:sp,useDeferredValue:function(e,t){var a=st();return He===null?lp(a,e,t):Xy(a,He.memoizedState,e,t)},useTransition:function(){var e=rh(Un)[0],t=st().memoizedState;return[typeof e=="boolean"?e:cl(e),t]},useSyncExternalStore:Ey,useId:Ky,useHostTransitionStatus:cp,useFormState:kb,useActionState:kb,useOptimistic:function(e,t){var a=st();return He!==null?Oy(a,He,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:ip,useCacheRefresh:Jy,useEffectEvent:Uy};function sh(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:je({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Jh={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=$a(),r=fi(i);r.payload=t,a!=null&&(r.callback=a),t=bi(e,r,i),t!==null&&(la(t,e,i),Rs(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=$a(),r=fi(i);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=bi(e,r,i),t!==null&&(la(t,e,i),Rs(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=$a(),i=fi(a);i.tag=2,t!=null&&(i.callback=t),t=bi(e,i,a),t!==null&&(la(t,e,a),Rs(t,e,a))}};function Eb(e,t,a,i,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!Ls(a,i)||!Ls(r,s):!0}function Cb(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&Jh.enqueueReplaceState(t,t.state,null)}function lo(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=je({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function nw(e){Zc(e)}function iw(e){console.error(e)}function ow(e){Zc(e)}function ou(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function zb(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Fh(e,t,a){return a=fi(a),a.tag=3,a.payload={element:null},a.callback=function(){ou(e,t)},a}function rw(e){return e=fi(e),e.tag=3,e}function sw(e,t,a,i){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;e.payload=function(){return r(s)},e.callback=function(){zb(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){zb(t,a,i),typeof r!="function"&&(wi===null?wi=new Set([this]):wi.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function c5(e,t,a,i,r){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&no(t,a,r,!0),a=Ot.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Ut===null?mu():a.alternate===null&&rt===0&&(rt=3),a.flags&=-257,a.flags|=65536,a.lanes=r,i===Wc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),ph(e,i,r)),!1;case 22:return a.flags|=65536,i===Wc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),ph(e,i,r)),!1}throw Error(O(435,a.tag))}return ph(e,i,r),mu(),!1}if(ge)return t=Ot.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,i!==qh&&(e=Error(O(422),{cause:i}),Ys(Da(e,a)))):(i!==qh&&(t=Error(O(423),{cause:i}),Ys(Da(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,i=Da(i,a),r=Fh(e.stateNode,i,r),oh(e,r),rt!==4&&(rt=2)),!1;var s=Error(O(520),{cause:i});if(s=Da(s,a),Hs===null?Hs=[s]:Hs.push(s),rt!==4&&(rt=2),t===null)return!0;i=Da(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=Fh(a.stateNode,i,e),oh(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(wi===null||!wi.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=rw(r),sw(r,e,a,i),oh(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var dp=Error(O(461)),mt=!1;function pt(e,t,a,i){t.child=e===null?$y(t,null,a,i):ro(t,e.child,a,i)}function Ab(e,t,a,i,r){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return io(t),i=ep(e,t,a,c,s,r),d=tp(),e!==null&&!mt?(ap(e,t,r),qn(e,t,r)):(ge&&d&&ku(t),t.flags|=1,pt(e,t,i,r),t.child)}function Rb(e,t,a,i,r){if(e===null){var s=a.type;return typeof s=="function"&&!Ym(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,lw(e,t,s,i,r)):(e=Cc(a.type,null,i,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!mp(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:Ls,a(c,i)&&e.ref===t.ref)return qn(e,t,r)}return t.flags|=1,e=Vn(s,i),e.ref=t.ref,e.return=t,t.child=e}function lw(e,t,a,i,r){if(e!==null){var s=e.memoizedProps;if(Ls(s,i)&&e.ref===t.ref)if(mt=!1,t.pendingProps=i=s,mp(e,r))(e.flags&131072)!==0&&(mt=!0);else return t.lanes=e.lanes,qn(e,t,r)}return Wh(e,t,a,i,r)}function cw(e,t,a,i){var r=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,t.child=null;return Mb(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ac(t,s!==null?s.cachePool:null),s!==null?wb(t,s):Xh(),Sy(t);else return i=t.lanes=536870912,Mb(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(Ac(t,s.cachePool),wb(t,s),yi(),t.memoizedState=null):(e!==null&&Ac(t,null),Xh(),yi());return pt(e,t,r,a),t.child}function Ds(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Mb(e,t,a,i,r){var s=Zm();return s=s===null?null:{parent:ht._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&Ac(t,null),Xh(),Sy(t),e!==null&&no(e,t,i,!0),t.childLanes=r,null}function Oc(e,t){return t=Ru({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Ob(e,t,a){return ro(t,e.child,null,a),e=Oc(t,t.pendingProps),e.flags|=2,ga(t),t.memoizedState=null,e}function u5(e,t,a){var i=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ge){if(i.mode==="hidden")return e=Oc(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Ds(null,e);if(Qh(t),(e=Xe)?(e=c0(e,Ia),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Si!==null?{id:hn,overflow:mn}:null,retryLane:536870912,hydrationErrors:null},a=py(e),a.return=t,t.child=a,Nt=t,Xe=null)):e=null,e===null)throw ki(t);return t.lanes=536870912,null}return Oc(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(Qh(t),r)if(t.flags&256)t.flags&=-257,t=Ob(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(O(558));else if(mt||no(e,t,a,!1),r=(a&e.childLanes)!==0,mt||r){if(Ti.current===null){if(i=Be,i!==null&&(c=Uv(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,po(e,c),la(i,e,c),dp;mu()}t=Ob(e,t,a)}else e=s.treeContext,Xe=_a(c.nextSibling),Nt=t,ge=!0,gi=null,Ia=!1,e!==null&&fy(t,e),t=Oc(t,i),t.flags|=134221824;return t}return e=Vn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Qo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(O(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Wh(e,t,a,i,r){return io(t),a=ep(e,t,a,i,void 0,r),i=tp(),e!==null&&!mt?(ap(e,t,r),qn(e,t,r)):(ge&&i&&ku(t),t.flags|=1,pt(e,t,a,r),t.child)}function Vb(e,t,a,i,r,s){return io(t),t.updateQueue=null,a=Ty(t,i,a,r),ky(e),i=tp(),e!==null&&!mt?(ap(e,t,s),qn(e,t,s)):(ge&&i&&ku(t),t.flags|=1,pt(e,t,a,s),t.child)}function Db(e,t,a,i,r){if(io(t),t.stateNode===null){var s=ir,c=a.contextType;typeof c=="object"&&c!==null&&(s=zt(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Jh,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},Km(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?zt(c):ir,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(sh(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Jh.enqueueReplaceState(s,s.state,null),Os(t,i,s,r),Ms(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=lo(a,d);s.props=h;var f=s.context,$=a.contextType;c=ir,typeof $=="object"&&$!==null&&(c=zt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,$||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||f!==c)&&Cb(t,s,i,c),ri=!1;var g=t.memoizedState;s.state=g,Os(t,i,s,r),Ms(),f=t.memoizedState,d||g!==f||ri?(typeof x=="function"&&(sh(t,a,x,i),f=t.memoizedState),(h=ri||Eb(t,a,h,i,g,f,c))?($||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=f),s.props=i,s.state=f,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,Gh(e,t),c=t.memoizedProps,$=lo(a,c),s.props=$,x=t.pendingProps,g=s.context,f=a.contextType,h=ir,typeof f=="object"&&f!==null&&(h=zt(f)),d=a.getDerivedStateFromProps,(f=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==x||g!==h)&&Cb(t,s,i,h),ri=!1,g=t.memoizedState,s.state=g,Os(t,i,s,r),Ms();var b=t.memoizedState;c!==x||g!==b||ri||e!==null&&e.dependencies!==null&&Fc(e.dependencies)?(typeof d=="function"&&(sh(t,a,d,i),b=t.memoizedState),($=ri||Eb(t,a,$,i,g,b,h)||e!==null&&e.dependencies!==null&&Fc(e.dependencies))?(f||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,b,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,b,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=b),s.props=i,s.state=b,s.context=h,i=$):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,Qo(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=ro(t,e.child,null,r),t.child=ro(t,null,a,r)):pt(e,t,a,r),t.memoizedState=s.state,e=t.child):e=qn(e,t,r),e}function Ib(e,t,a,i){return ao(),t.flags|=256,pt(e,t,a,i),t.child}var em={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function tm(e){return{baseLanes:e,cachePool:vy()}}function am(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ba),e}function uw(e,t,a){var i=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(Rt.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ge){if(r?vi(t):yi(),(e=Xe)?(e=c0(e,Ia),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Si!==null?{id:hn,overflow:mn}:null,retryLane:536870912,hydrationErrors:null},a=py(e),a.return=t,t.child=a,Nt=t,Xe=null)):e=null,e===null)throw ki(t);return kp(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,r?(yi(),r=t.mode,s=Ru({mode:"hidden",children:s},r),i=Fi(i,r,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=tm(a),i.childLanes=am(e,c,a),t.memoizedState=em,Ds(null,i)):(vi(t),hp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return d5(e,t,s,c,i,h,d,a)}return r?(yi(),r=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=Vn(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=Vn(h,r):(r=Fi(r,s,a,null),r.flags|=2),r.return=t,i.return=t,i.sibling=r,t.child=i,Ds(null,i),i=t.child,r=e.child.memoizedState,r===null?r=tm(a):(s=r.cachePool,s!==null?(d=ht._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=vy(),r={baseLanes:r.baseLanes|a,cachePool:s}),i.memoizedState=r,i.childLanes=am(e,c,a),t.memoizedState=em,Ds(e.child,i)):(vi(t),a=e.child,e=a.sibling,a=Vn(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function hp(e,t){return t=Ru({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Ru(e,t){return e=sa(22,e,null,t),e.lanes=0,e}function pc(e,t,a){return ro(t,e.child,null,a),e=hp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function d5(e,t,a,i,r,s,c,d){if(a)return t.flags&256?(vi(t),t.flags&=-257,pc(e,t,d)):t.memoizedState!==null?(yi(),t.child=e.child,t.flags|=128,null):(yi(),s=r.fallback,c=t.mode,r=Ru({mode:"visible",children:r.children},c),s=Fi(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,ro(t,e.child,null,d),r=t.child,r.memoizedState=tm(d),r.childLanes=am(e,i,d),t.memoizedState=em,Ds(null,r));if(vi(t),kp(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(r=Error(O(419)),r.stack="",r.digest=i,Ys({value:r,source:null,stack:null})),pc(e,t,d)}if(mt||no(e,t,d,!1),i=(d&e.childLanes)!==0,mt||i){if(Ti.current!==null)return pc(e,t,d);if(i=Be,i!==null&&(r=Uv(i,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,po(e,r),la(i,e,r),dp;return Em(s)||mu(),pc(e,t,d)}return Em(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Xe=_a(s.nextSibling),Nt=t,ge=!0,gi=null,Ia=!1,e!==null&&fy(t,e),t=hp(t,r.children),t.flags|=134221824,t)}function _b(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),zc(e.return,t,a)}function Hb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&tu(a)===null&&(t=e),e=e.sibling}return t}function gc(e,t,a,i,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function lh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function nm(e,t,a){var i=t.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var c=Rt.current;if(t.flags&128)return Qs(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Qs(t,c),r==="backwards"&&e!==null?(lh(e),pt(e,t,i,a),lh(e)):pt(e,t,i,a),i=ge?Gs:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&_b(e,a,t);else if(e.tag===19)_b(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=Hb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,lh(t)),gc(t,!0,r,null,s,i);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&tu(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}gc(t,!0,a,null,s,i);break;case"together":gc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Hb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),gc(t,!1,r,a,s,i)}return t.child}function Ub(e,t,a){var i=t.pendingProps;return ui(t,t.type,i.value),pt(e,t,i.children,a),t.child}function qn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Ci|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(no(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(O(153));if(t.child!==null){for(e=t.child,a=Vn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Vn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function mp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Fc(e)))}function h5(e,t,a){switch(t.tag){case 3:Gc(t,t.stateNode.containerInfo),ui(t,ht,e.memoizedState.cache),ao();break;case 27:case 5:Ah(t);break;case 4:Gc(t,t.stateNode.containerInfo);break;case 10:ui(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Qh(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return vi(t),t.flags|=128,null;i=no(e,t,a,!1);var r=t.child.childLanes;return i||(a&r)!==0?uw(e,t,a):(vi(t),e=qn(e,t,a),e!==null?e.sibling:null)}vi(t);break;case 19:if(t.flags&128)return nm(e,t,a);if(r=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(no(e,t,a,!1),i=(a&t.childLanes)!==0),r){if(i)return nm(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Qs(t,Rt.current),i)break;return null;case 22:return t.lanes=0,cw(e,t,a,t.pendingProps);case 24:ui(t,ht,e.memoizedState.cache)}return qn(e,t,a)}function dw(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)mt=!0;else{if(!mp(e,a)&&(t.flags&128)===0)return mt=!1,h5(e,t,a);mt=(e.flags&131072)!==0}else mt=!1,ge&&(t.flags&1048576)!==0&&gy(t,Gs,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=Qi(t.elementType),t.type=e,typeof e=="function")Ym(e)?(i=lo(e,i),t.tag=1,t=Db(null,t,e,i,a)):(t.tag=0,t=Wh(null,t,e,i,a));else{if(e!=null){var r=e.$$typeof;if(r===Mm){t.tag=11,t=Ab(null,t,e,i,a);break e}else if(r===Om){t.tag=14,t=Rb(null,t,e,i,a);break e}else if(r===un){t.tag=10,t.type=e,t=Ub(null,t,a);break e}}throw t=Ch(e)||e,Error(O(306,t,""))}}return t;case 0:return Wh(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,r=lo(i,t.pendingProps),Db(e,t,i,r,a);case 3:e:{if(Gc(t,t.stateNode.containerInfo),e===null)throw Error(O(387));i=t.pendingProps;var s=t.memoizedState;r=s.element,Gh(e,t),Os(t,i,null,a);var c=t.memoizedState;if(i=c.cache,ui(t,ht,i),i!==s.cache&&jh(t,[ht],a,!0),Ms(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Ib(e,t,i,a);break e}else if(i!==r){r=Da(Error(O(424)),t),Ys(r),t=Ib(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Xe=_a(e.firstChild),Nt=t,ge=!0,gi=null,Ia=!0,a=$y(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(ao(),i===r){t=qn(e,t,a);break e}pt(e,t,i,a)}t=t.child}return t;case 26:return Qo(e,t),e===null?(a=hv(t.type,null,t.pendingProps,null))?t.memoizedState=a:ge||(t.stateNode=e0(t.type,t.pendingProps,pi.current,t)):t.memoizedState=hv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Ah(t),e===null&&ge&&(i=t.stateNode=u0(t.type,t.pendingProps,pi.current),Nt=t,Ia=!0,r=Xe,Ai(t.type)?(Cm=r,Xe=_a(i.firstChild)):Xe=r),pt(e,t,t.pendingProps.children,a),Qo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ge&&((r=i=Xe)&&(i=i2(i,t.type,t.pendingProps,Ia),i!==null?(t.stateNode=i,Nt=t,Xe=_a(i.firstChild),Ia=!1,r=!0):r=!1),r||ki(t)),Ah(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,Sm(r,s)?i=null:c!==null&&Sm(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=ep(e,t,t5,null,null,a),Cr._currentValue=r),Qo(e,t),pt(e,t,i,a),t.child;case 6:return e===null&&ge&&((e=a=Xe)&&(a=o2(a,t.pendingProps,Ia),a!==null?(t.stateNode=a,Nt=t,Xe=null,e=!0):e=!1),e||ki(t)),null;case 13:return uw(e,t,a);case 4:return Gc(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=ro(t,null,i,a):pt(e,t,i,a),t.child;case 11:return Ab(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,Qo(e,t),pt(e,t,i,a),t.child;case 8:return pt(e,t,t.pendingProps.children,a),t.child;case 12:return pt(e,t,t.pendingProps.children,a),t.child;case 10:return Ub(e,t,a);case 9:return r=t.type._context,i=t.pendingProps.children,io(t),r=zt(r),i=i(r),t.flags|=1,pt(e,t,i,a),t.child;case 14:return Rb(e,t,t.type,t.pendingProps,a);case 15:return lw(e,t,t.type,t.pendingProps,a);case 19:return nm(e,t,a);case 31:return u5(e,t,a);case 22:return cw(e,t,a,t.pendingProps);case 24:return io(t),i=zt(ht),e===null?(r=Zm(),r===null&&(r=Be,s=Qm(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:i,cache:r},Km(t),ui(t,ht,r)):((e.lanes&a)!==0&&(Gh(e,t),Os(t,null,null,a),Ms()),r=e.memoizedState,s=t.memoizedState,r.parent!==i?(r={parent:i,cache:i},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),ui(t,ht,i)):(i=s.cache,ui(t,ht,i),i!==r.cache&&jh(t,[ht],a,!0))),pt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:ge&&ku(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:Qo(e,t),pt(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(O(156,t.tag))}function Rn(e){e.flags|=4}function ch(e,t,a,i,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?gv(t,i):gv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(qw())e.flags|=8192;else throw eo=Wc,Pm}else e.flags&=-16777217}function qb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!p0(t))if(qw())e.flags|=8192;else throw eo=Wc,Pm}function fc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Iv():536870912,e.lanes|=t,xr|=t)}function vs(e,t){if(!ge)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Ye(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags&1206910976,i|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function m5(e,t,a){var i=t.pendingProps;switch(Xm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ye(t),null;case 1:return Ye(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Dn(ht),vr(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Yo(t)?Rn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,ih())),Ye(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(Rn(t),s!==null?(Ye(t),qb(t,s)):(Ye(t),ch(t,r,null,i,a))):s?s!==e.memoizedState?(Rn(t),Ye(t),qb(t,s)):(Ye(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Rn(t),Ye(t),ch(t,r,e,i,a)),null;case 27:if(Yc(t),a=pi.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Rn(t);else{if(!i){if(t.stateNode===null)throw Error(O(166));return Ye(t),t.subtreeFlags&=-33554433,null}e=pn.current,Yo(t)?mb(t,e):(e=u0(r,i,a),t.stateNode=e,Rn(t))}return Ye(t),t.subtreeFlags&=-33554433,null;case 5:if(Yc(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Rn(t);else{if(!i){if(t.stateNode===null)throw Error(O(166));return Ye(t),t.subtreeFlags&=-33554433,null}if(s=pn.current,Yo(t))mb(t,s);else{var c=Js(pi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(r,{is:i.is}):c.createElement(r)}}s[Ct]=t,s[ua]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Mt(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Rn(t)}}return Ye(t),t.subtreeFlags&=-33554433,ch(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Rn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(O(166));if(e=pi.current,Yo(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,r=Nt,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}e[Ct]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||Fw(e.nodeValue,a)),e||ki(t,!0)}else e=Js(e).createTextNode(i),e[Ct]=t,t.stateNode=e}return Ye(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=Yo(t),a!==null){if(e===null){if(!i)throw Error(O(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(O(557));e[Ct]=t}else ao(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ye(t),e=!1}else a=ih(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(ga(t),t):(ga(t),null);if((t.flags&128)!==0)throw Error(O(558))}return Ye(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=Yo(t),i!==null&&i.dehydrated!==null){if(e===null){if(!r)throw Error(O(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(O(317));r[Ct]=t}else ao(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ye(t),r=!1}else r=ih(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(ga(t),t):(ga(t),null)}return ga(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),fc(t,t.updateQueue),Ye(t),null);case 4:return vr(),e===null&&xp(t.stateNode.containerInfo),t.flags|=67108864,Ye(t),null;case 10:return Dn(t.type),Ye(t),null;case 19:if(Fm(t),i=t.memoizedState,i===null)return Ye(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)vs(i,!1);else{if(rt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=tu(e),s!==null){for(t.flags|=128,vs(i,!1),e=s.updateQueue,t.updateQueue=e,fc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)my(a,e),a=a.sibling;return Qs(t,Rt.current&1|2),ge&&Mn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&va()>du&&(t.flags|=128,r=!0,vs(i,!1),t.lanes=4194304)}else{if(!r)if(e=tu(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,fc(t,e),vs(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!ge)return Ye(t),null}else 2*va()-i.renderingStartTime>du&&a!==536870912&&(t.flags|=128,r=!0,vs(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=va(),e.sibling=null,s=Rt.current,s=r?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||ge?Qs(t,s):(a=s,Qe(Ot,t),Qe(Rt,a),Ut===null&&(Ut=t)),ge&&Mn(t,i.treeForkCount),e}return Ye(t),null;case 22:case 23:return ga(t),Jm(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(Ye(t),t.subtreeFlags&6&&(t.flags|=8192)):Ye(t),a=t.updateQueue,a!==null&&fc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&At(Wi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Dn(ht),Ye(t),null;case 25:return null;case 30:return t.flags|=33554432,Ye(t),null}throw Error(O(156,t.tag))}function p5(e,t){switch(Xm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Dn(ht),vr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Yc(t),null;case 31:if(t.memoizedState!==null){if(ga(t),t.alternate===null)throw Error(O(340));ao()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ga(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(O(340));ao()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Fm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return vr(),null;case 10:return Dn(t.type),null;case 22:case 23:return ga(t),Jm(),e!==null&&At(Wi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Dn(ht),null;case 25:return null;default:return null}}function hw(e,t){switch(Xm(t),t.tag){case 3:Dn(ht),vr();break;case 26:case 27:case 5:Yc(t);break;case 4:vr();break;case 31:t.memoizedState!==null&&ga(t);break;case 13:ga(t);break;case 19:Fm(t);break;case 10:Dn(t.type);break;case 22:case 23:ga(t),Jm(),e!==null&&At(Wi);break;case 24:Dn(ht)}}function ul(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==r)}}catch(d){Ve(t,t.return,d)}}function Ei(e,t,a){try{var i=t.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,f=d;try{f()}catch($){Ve(r,h,$)}}}i=i.next}while(i!==s)}}catch($){Ve(t,t.return,$)}}function mw(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Ny(t,a)}catch(i){Ve(e,e.return,i)}}}function pw(e,t,a){a.props=lo(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){Ve(e,t,i)}}function ln(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var r=e.stateNode,s=_n(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=i0(s)),i=r.ref;break;case 7:if(e.stateNode===null){var c=new Na(e);ca(e.child,!1,a2,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){Ve(e,t,d)}}function Et(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(r){Ve(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){Ve(e,t,r)}else a.current=null}function ru(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)l0(e.stateNode,t[a])}function Bb(e){for(var t=e.return;t!==null&&(gp(t)&&l0(e.stateNode,t.stateNode),!pp(t));)t=t.return}function Is(e){for(var t=e.return;t!==null&&(gp(t)&&n2(e.stateNode,t.stateNode),!pp(t));)t=t.return}function pp(e){return e.tag===5||e.tag===3||e.tag===27}function gp(e){return e&&e.tag===7&&e.stateNode!==null}function im(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(r){Ve(e,e.return,r)}}function uh(e,t,a){try{var i=e.stateNode;H5(i,e.type,a,t),i[ua]=t}catch(r){Ve(e,e.return,r)}}function gw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Ai(e.type)||e.tag===4}function dh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||gw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Ai(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function om(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=dn)),ru(e,i),Te=!0;else if(r!==4&&(r===27&&(ru(e,i),i=null,Ai(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(om(e,t,a,i),e=e.sibling;e!==null;)om(e,t,a,i),e=e.sibling}function su(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),ru(e,i),Te=!0;else if(r!==4&&(r===27&&(ru(e,i),i=null,Ai(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(su(e,t,a,i),e=e.sibling;e!==null;)su(e,t,a,i),e=e.sibling}function fw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);Mt(t,i,a),t[Ct]=e,t[ua]=a}catch(s){Ve(e,e.return,s)}}var lu=!1,fa=null;function jb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(lu=!0)}var cn=null;function Lb(){var e=cn;return cn=null,e}var ra=0;function Vr(e,t,a,i,r){return ra=0,bw(e.child,t,a,i,r)}function bw(e,t,a,i,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=km(c);i.push(d),d.view&&(s=!0)}else s||km(c).view&&(s=!0);lu=!0,t0(c,ra===0?t:t+"_"+ra,a),ra++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||bw(e.child,t,a,i,r)&&(s=!0));e=e.sibling}return s}function fn(e,t){for(;e!==null;)e.tag===5?a0(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||fn(e.child,t)),e=e.sibling}function Vc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Vc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(O(544));var a=t.name;t=Ln(t.default,t.share),t!=="none"&&(Vr(e,a,t,null,!1)||fn(e.child,!1))}e=e.sibling}}function rm(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,r=_n(i,a),s=Ln(i.default,a.paired?i.share:i.enter);s!=="none"?Vr(e,r,s,null,!1)?(Vc(e),a.paired||t||Nr(e,i.onEnter)):fn(e.child,!1):Vc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)rm(e,t),e=e.sibling;else Vc(e)}function sm(e){if(fa!==null&&fa.size!==0){var t=fa;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var r=t.get(i);if(r!==void 0){var s=Ln(a.default,a.share);if(s!=="none"&&(Vr(e,i,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,Nr(e,a.onShare)):fn(e.child,!1)),t.delete(i),t.size===0)break}}}sm(e)}e=e.sibling}}}function lm(e){if(e.tag===30){var t=e.memoizedProps,a=_n(t,e.stateNode),i=fa!==null?fa.get(a):void 0,r=Ln(t.default,i!==void 0?t.share:t.exit);r!=="none"&&(Vr(e,a,r,null,!1)?i!==void 0?(r=e.stateNode,i.paired=r,r.paired=i,fa.delete(a),Nr(e,t.onShare)):Nr(e,t.onExit):fn(e.child,!1)),fa!==null&&sm(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)lm(e),e=e.sibling;else fa!==null&&sm(e)}function vw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=_n(t,e.stateNode);t=Ln(t.default,t.update),e.flags&=-5,t!=="none"&&Vr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&vw(e);e=e.sibling}}function cm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,fn(e.child,!1))}cm(e)}e=e.sibling}}function Dc(e){if(e.tag===30)e.stateNode.paired=null,fn(e.child,!1),cm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Dc(e),e=e.sibling;else cm(e)}function yw(e){for(e=e.child;e!==null;)e.tag===30?fn(e.child,!1):(e.subtreeFlags&33554432)!==0&&yw(e),e=e.sibling}function fp(e,t,a,i,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&ra<s.length){var f=s[ra],$=km(h);(f.view||$.view)&&(d=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=f.rect;var g=$.rect;x=x.y!==g.y||x.x!==g.x||x.height!==g.height||x.width!==g.width}x&&(e.flags|=4),$.abs?$=!f.abs:(f=f.rect,$=$.rect,$=f.height!==$.height||f.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&t0(h,ra===0?a:a+"_"+ra,r),d&&(e.flags&4)!==0||(cn===null&&(cn=[]),cn.push(h,ra===0?i:i+"_"+ra,t.memoizedProps)),ra++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:fp(e,t.child,a,i,r,s,c)&&(d=!0));t=t.sibling}return d}function ww(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,r=_n(a,i),s=Ln(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(G5)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;ra=0,r=fp(i,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||Nr(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&ww(e,t);e=e.sibling}}var wt=!1,Ae=!1,on=!1,hh=!1,Gb=typeof WeakSet=="function"?WeakSet:Set,$t=null,rn=!1,Ts=!1,cu=!1,um=!1;function g5(e,t,a){if(e=e.containerInfo,xm=zr,e=oy(e),jm(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var r=i.getSelection&&i.getSelection();if(r&&r.rangeCount!==0){i=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,f=-1,$=0,x=0,g=e,b=null;t:for(;;){for(var A;g!==i||s!==0&&g.nodeType!==3||(h=d+s),g!==c||r!==0&&g.nodeType!==3||(f=d+r),g.nodeType===3&&(d+=g.nodeValue.length),(A=g.firstChild)!==null;)b=g,g=A;for(;;){if(g===e)break t;if(b===i&&++$===s&&(h=d),b===c&&++x===r&&(f=d),(A=g.nextSibling)!==null)break;g=b,b=g.parentNode}g=A}i=h===-1||f===-1?null:{start:h,end:f}}else i=null}i=i||{start:0,end:0}}else i=null;for(Nm={focusedElem:e,selectionRange:i},zr=!1,a=(a&335544064)===a,$t=t,t=a?9270:1024;$t!==null;){if(e=$t,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&lm(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&jb(e),bc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&lm(i),bc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&jb(e),bc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,$t=i):(a&&vw(e),bc(a))}}fa=null}function bc(e){for(;$t!==null;){var t=$t,a=e,i=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&i!==null){a=void 0,r=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=lo(t.type,r);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){Ve(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)Tm(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":Tm(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=_n(i.memoizedProps,i.stateNode),r=t.memoizedProps,r=Ln(r.default,r.update),r!=="none"&&Vr(i,a,r,i.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(O(163))}if(i=t.sibling,i!==null){i.return=t.return,$t=i;break}$t=t.return}}function $w(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:sn(e,a),i&4&&ul(5,a);break;case 1:if(sn(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Ve(a,a.return,c)}else{var r=lo(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Ve(a,a.return,c)}}i&64&&mw(a),i&512&&ln(a,a.return);break;case 3:if(sn(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Ny(e,t)}catch(c){Ve(a,a.return,c)}}break;case 27:t===null&&i&4&&fw(a);case 26:case 5:sn(e,a),t===null&&i&4&&im(a),i&512&&ln(a,a.return);break;case 12:sn(e,a);break;case 31:sn(e,a),i&4&&kw(e,a);break;case 13:sn(e,a),i&4&&Tw(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=E5.bind(null,a),r2(e,a))));break;case 22:if(i=a.memoizedState!==null||wt,!i){var s=t!==null&&t.memoizedState!==null||Ae;t=wt,r=Ae,wt=i,(Ae=s)&&!r?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),Qa(e,a,i)):sn(e,a),wt=t,Ae=r}break;case 30:sn(e,a),i&512&&ln(a,a.return);break;case 7:i&512&&ln(a,a.return);default:sn(e,a)}}function dm(e,t){for(e=e.child;e!==null;)xw(e,t),e=e.sibling}function xw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Ve(e,e.return,h)}hm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Te=!0}catch(h){Ve(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?rv(d,!0):rv(e.stateNode,!1)}catch(h){Ve(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&dm(e,t);break;default:dm(e,t)}}function hm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:xw(a,i);break e;case 22:a.memoizedState===null&&hm(a,i);break e;default:hm(a,i)}}e=e.sibling}}function Nw(e){var t=e.alternate;t!==null&&(e.alternate=null,Nw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&yu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var et=null,ia=!1;function Xa(e,t,a){for(a=a.child;a!==null;)Sw(e,t,a),a=a.sibling}function Sw(e,t,a){if(ya&&typeof ya.onCommitFiberUnmount=="function")try{ya.onCommitFiberUnmount(nl,a)}catch{}switch(a.tag){case 26:Ae||Et(a,t),Xa(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Ae&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Ae||Et(a,t),Is(a);var i=et,r=ia;Ai(a.type)&&(et=a.stateNode,ia=!1),Xa(e,t,a),d0(a.stateNode,a.type,a.memoizedProps),et=i,ia=r;break;case 5:Ae||Et(a,t),Is(a);case 6:if(a.tag===6&&Is(a),i=et,r=ia,et=null,Xa(e,t,a),et=i,ia=r,et!==null)if(ia)try{(et.nodeType===9?et.body:et.nodeName==="HTML"?et.ownerDocument.body:et).removeChild(a.stateNode),Te=!0}catch(s){Ve(a,t,s)}else try{et.removeChild(a.stateNode),Te=!0}catch(s){Ve(a,t,s)}break;case 18:et!==null&&(ia?(e=et,ov(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Ar(e)):ov(et,a.stateNode));break;case 4:i=et,r=ia,et=a.stateNode.containerInfo,ia=!0,Xa(e,t,a),et=i,ia=r;break;case 0:case 11:case 14:case 15:Ei(2,a,t),Ae||Ei(4,a,t),Xa(e,t,a);break;case 1:Ae||(Et(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&pw(a,t,i)),Xa(e,t,a);break;case 21:Xa(e,t,a);break;case 22:Ae=(i=Ae)||a.memoizedState!==null,Xa(e,t,a),Ae=i;break;case 30:Et(a,t),Xa(e,t,a);break;case 7:Ae||Et(a,t),Xa(e,t,a);break;default:Xa(e,t,a)}}function kw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Ar(e)}catch(a){Ve(t,t.return,a)}}}function Tw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Ar(e)}catch(a){Ve(t,t.return,a)}}function f5(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Gb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Gb),t;default:throw Error(O(435,e.tag))}}function vc(e,t){var a=f5(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var r=C5.bind(null,e,i);i.then(r,r)}})}function Xt(e,t,a){var i=t.deletions;if(i!==null)for(var r=0;r<i.length;r++){var s=i[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(Ai(h.type)){et=h.stateNode,ia=!1;break e}break;case 5:et=h.stateNode,ia=!1;break e;case 3:case 4:et=h.stateNode.containerInfo,ia=!0;break e}h=h.return}if(et===null)throw Error(O(160));Sw(c,d,s),et=null,ia=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Ew(t,e,a),t=t.sibling}var Za=null;function Ew(e,t,a){var i=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}Xt(t,e,a),Qt(e),r&4&&(Ei(3,e,e.return),ul(3,e),Ei(5,e,e.return));break;case 1:Xt(t,e,a),Qt(e),r&512&&(Ae||i===null||Et(i,i.return)),r&64&&wt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=Za,Xt(t,e,a),Qt(e),r&512&&(Ae||i===null||Et(i,i.return)),r&4)if(r=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(wt)e.stateNode=e0(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":i=r.getElementsByTagName("title")[0],(!i||i[rl]||i[Ct]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(t),r.head.insertBefore(i,r.querySelector("head > title"))),Mt(i,t,a),i[Ct]=e,xt(i),t=i;break e;case"link":if(s=pv("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=r.createElement(t),Mt(i,t,a),r.head.appendChild(i);break;case"meta":if(s=pv("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=r.createElement(t),Mt(i,t,a),r.head.appendChild(i);break;default:throw Error(O(468,t))}i[Ct]=e,xt(i),t=i}e.stateNode=t}else wt||zm(s,e.type,e.stateNode);else e.stateNode=mv(s,a,e.memoizedProps);else r!==a?(r===null?(t=i.stateNode,t===null||Ae||t.parentNode.removeChild(t)):r.count--,a===null?wt||zm(s,e.type,e.stateNode):mv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&uh(e,e.memoizedProps,i.memoizedProps);break;case 27:Xt(t,e,a),Qt(e),r&512&&(Ae||i===null||Et(i,i.return)),i!==null&&r&4&&uh(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=on,on=!1,Xt(t,e,a),on=s,Qt(e),r&512&&(Ae||i===null||Et(i,i.return)),e.flags&32){t=e.stateNode;try{wr(t,""),Te=!0}catch($){Ve(e,e.return,$)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,uh(e,t,i!==null?i.memoizedProps:t)),r&1024&&(hh=!0);break;case 6:if(Xt(t,e,a),Qt(e),r&4){if(e.stateNode===null)throw Error(O(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Te=!0}catch($){Ve(e,e.return,$)}}break;case 3:if(Te=!1,Uc=null,s=Za,Za=Fs(t.containerInfo),Xt(t,e,a),Za=s,Qt(e),r&4&&i!==null&&i.memoizedState.isDehydrated)try{Ar(t.containerInfo)}catch($){Ve(e,e.return,$)}hh&&(hh=!1,Cw(e)),Te=!1;break;case 4:r=on,on=wt,i=Kf(),s=Za,Za=Fs(e.stateNode.containerInfo),Xt(t,e,a),Qt(e),Za=s,Te&&Ts&&(cu=!0),Te=i,on=r;break;case 12:Xt(t,e,a),Qt(e);break;case 31:Xt(t,e,a),Qt(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 13:Xt(t,e,a),Qt(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(Mu=va()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=wt,h=Ae,f=on;wt=d||s,on=f||s,Ae=h||c,Xt(t,e,a),Ae=h,on=f,wt=d,Qt(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||wt||Ae||(t=c||Ae,a=wt,i=Ae,wt=s||wt,Ae=t,ii(e,2),wt=a,Ae=i),!s&&on||dm(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,vc(e,a))));break;case 19:Xt(t,e,a),Qt(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 30:r&512&&(Ae||i===null||Et(i,i.return)),r=Kf(),s=Ts,c=(a&335544064)===a,d=e.memoizedProps,Ts=c&&Ln(d.default,d.update)!=="none",Xt(t,e,a),Qt(e),c&&i!==null&&Te&&(e.flags|=4),Ts=s,Te=r;break;case 21:break;case 7:r&512&&(Ae||i===null||Et(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:Xt(t,e,a),Qt(e)}}function Qt(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(gw(i)){a=i;break}i=i.return}i=null;for(var r=e.return;r!==null;){if(gp(r)){var s=r.stateNode;i===null?i=[s]:i.push(s)}if(pp(r))break;r=r.return}var c=i;if(a==null)throw Error(O(160));switch(a.tag){case 27:var d=a.stateNode,h=dh(e);su(e,h,d,c);break;case 5:var f=a.stateNode;a.flags&32&&(wr(f,""),a.flags&=-33);var $=dh(e);su(e,$,f,c);break;case 3:case 4:var x=a.stateNode.containerInfo,g=dh(e);om(e,g,x,c);break;default:throw Error(O(161))}}catch(b){Ve(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Cw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Cw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,zr=!0,t.reset(),zr=!1),e=e.sibling}}function Xo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)zw(t,e),t=t.sibling;else ww(t,!1)}function zw(e,t){var a=e.alternate;if(a===null)rm(e,!1);else switch(e.tag){case 3:if(um=rn=!1,Lb(),Xo(t,e),!rn&&!cu){if(e=cn,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var r=e[i+1];a0(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),um=!0}cn=null;break;case 5:Xo(t,e);break;case 4:i=rn,rn=!1,Xo(t,e),rn&&(cu=!0),rn=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?rm(e,!1):Xo(t,e));break;case 30:i=rn,r=Lb(),rn=!1,Xo(t,e),rn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=_n(s,c),c=_n(a.memoizedProps,c);var d=Ln(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,ra=0,t=fp(e,a,t,c,d,s,!0),ra!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Nr(e,e.memoizedProps.onUpdate),cn=r):r!==null&&(r.push.apply(r,cn),cn=r),rn=(e.flags&32)!==0?!0:i;break;default:Xo(t,e)}}function sn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)$w(e,t.alternate,t),t=t.sibling}function ii(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:Ei(4,a,a.return),ii(a,i);break;case 1:Et(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&pw(a,a.return,r),ii(a,i);break;case 27:(i&2)!==0&&d0(a.stateNode,a.type,a.memoizedProps);case 5:Et(a,a.return),a.tag!==5&&a.tag!==27||Is(a),ii(a,i);break;case 6:Is(a);break;case 26:Et(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||Ae||r.parentNode.removeChild(r),ii(a,i);break;case 22:a.memoizedState===null&&ii(a,i);break;case 30:Et(a,a.return),ii(a,i);break;case 7:Et(a,a.return);default:ii(a,i)}e=e.sibling}}function Qa(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:Qa(r,s,a),ul(4,s);break;case 1:if(Qa(r,s,a),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch($){Ve(i,i.return,$)}if(i=s,r=i.updateQueue,r!==null){var h=i.stateNode;try{var f=r.shared.hiddenCallbacks;if(f!==null)for(r.shared.hiddenCallbacks=null,r=0;r<f.length;r++)xy(f[r],h)}catch($){Ve(i,i.return,$)}}d&&c&64&&mw(s),ln(s,s.return);break;case 27:(a&2)!==0&&fw(s);case 5:s.tag!==5&&s.tag!==27||Bb(s),Qa(r,s,a),d&&i===null&&c&4&&im(s),ln(s,s.return);break;case 6:Bb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||wt||zm(Fs(h.ownerDocument),s.type,h),Qa(r,s,a),d&&i===null&&c&4&&im(s),ln(s,s.return);break;case 12:Qa(r,s,a);break;case 31:Qa(r,s,a),d&&c&4&&kw(r,s);break;case 13:Qa(r,s,a),d&&c&4&&Tw(r,s);break;case 22:s.memoizedState===null&&Qa(r,s,a),ln(s,s.return);break;case 30:Qa(r,s,a),ln(s,s.return);break;case 7:ln(s,s.return);default:Qa(r,s,a)}t=t.sibling}}function bp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&ll(a))}function vp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ll(e))}function Aa(e,t,a,i){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)Aw(e,t,a,i),t=t.sibling;else r&&yw(t)}function Aw(e,t,a,i){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Dc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Aa(e,t,a,i),s&2048&&ul(9,t);break;case 1:Aa(e,t,a,i);break;case 3:Aa(e,t,a,i),r&&um&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&ll(s)));break;case 12:if(s&2048){Aa(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(f){Ve(t,t.return,f)}}else Aa(e,t,a,i);break;case 31:Aa(e,t,a,i);break;case 13:Aa(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&Dc(d),c._visibility&2?Aa(e,t,a,i):_s(e,t)):(r&&d!==null&&d.memoizedState!==null&&Dc(t),c._visibility&2?Aa(e,t,a,i):(c._visibility|=2,Zo(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&bp(d,t);break;case 24:Aa(e,t,a,i),s&2048&&vp(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(fn(s.child,!0),fn(t.child,!0))),Aa(e,t,a,i);break;default:Aa(e,t,a,i)}}function Zo(e,t,a,i,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,f=c.flags;switch(c.tag){case 0:case 11:case 15:Zo(s,c,d,h,r),ul(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?Zo(s,c,d,h,r):_s(s,c):($._visibility|=2,Zo(s,c,d,h,r)),r&&f&2048&&bp(c.alternate,c);break;case 24:Zo(s,c,d,h,r),r&&f&2048&&vp(c.alternate,c);break;default:Zo(s,c,d,h,r)}t=t.sibling}}function _s(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,r=i.flags;switch(i.tag){case 22:_s(a,i),r&2048&&bp(i.alternate,i);break;case 24:_s(a,i),r&2048&&vp(i.alternate,i);break;default:_s(a,i)}t=t.sibling}}var Zi=8192;function Yi(e,t,a){if(e.subtreeFlags&Zi)for(e=e.child;e!==null;)Rw(e,t,a),e=e.sibling}function Rw(e,t,a){switch(e.tag){case 26:Yi(e,t,a),e.flags&Zi&&(e.memoizedState!==null?w2(a,Za,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&fv(a,e)));break;case 5:Yi(e,t,a),e.flags&Zi&&(e=e.stateNode,(t&335544128)===t&&fv(a,e));break;case 3:case 4:var i=Za;Za=Fs(e.stateNode.containerInfo),Yi(e,t,a),Za=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Zi,Zi=16777216,Yi(e,t,a),Zi=i):Yi(e,t,a));break;case 30:if((e.flags&Zi)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var r=e.stateNode;r.paired=null,fa===null&&(fa=new Map),fa.set(i,r)}Yi(e,t,a);break;default:Yi(e,t,a)}}function Mw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ys(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];$t=i,Vw(i,e)}Mw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Ow(e),e=e.sibling}function Ow(e){switch(e.tag){case 0:case 11:case 15:ys(e),e.flags&2048&&Ei(9,e,e.return);break;case 3:ys(e);break;case 12:ys(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Ic(e)):ys(e);break;default:ys(e)}}function Ic(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];$t=i,Vw(i,e)}Mw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ei(8,t,t.return),Ic(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Ic(t));break;default:Ic(t)}e=e.sibling}}function Vw(e,t){for(;$t!==null;){var a=$t;switch(a.tag){case 0:case 11:case 15:Ei(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:ll(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,$t=i;else e:for(a=e;$t!==null;){i=$t;var r=i.sibling,s=i.return;if(Nw(i),i===a){$t=null;break e}if(r!==null){r.return=s,$t=r;break e}$t=s}}}var b5={getCacheForType:function(e){var t=zt(ht),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return zt(ht).controller.signal}},v5=typeof WeakMap=="function"?WeakMap:Map,Ee=0,Be=null,be=null,ye=0,Me=0,ma=null,di=!1,Dr=!1,yp=!1,Bn=0,rt=0,Ci=0,to=0,uu=0,ba=0,xr=0,Hs=null,oa=null,mm=!1,Mu=0,Dw=0,du=1/0,hu=null,wi=null,nt=0,Ka=null,co=null,gn=0,pm=0,gm=null,Iw=null,gr=null,fr=null,br=null,Us=0,_c=null;function $a(){return(Ee&2)!==0&&ye!==0?ye&-ye:ee.T!==null?$p():qv()}function _w(){if(ba===0)if((ye&536870912)===0||ge){var e=oc;oc<<=1,(oc&3932160)===0&&(oc=262144),ba=e}else ba=536870912;return e=Ot.current,e!==null&&(e.flags|=32),ba}function Nr(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=i0(_n(e.memoizedProps,a))),fr===null&&(fr=[]),fr.push(t.bind(null,i))}}function la(e,t,a){(e===Be&&(Me===2||Me===9)||e.cancelPendingCommit!==null)&&(Sr(e,0),hi(e,ye,ba,!1)),ol(e,a),((Ee&2)===0||e!==Be)&&(e===Be&&((Ee&2)===0&&(to|=a),rt===4&&hi(e,ye,ba,!1)),vn(e))}function Hw(e,t,a){if((Ee&6)!==0)throw Error(O(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||il(e,t),r=i?$5(e,t):mh(e,t,!0),s=i;do{if(r===0){Dr&&!i&&hi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!y5(a)){r=mh(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=Hs;var h=d.current.memoizedState.isDehydrated;if(h&&(Sr(d,c).flags|=256),c=mh(d,c,!1),c!==2&&c!==6){if(yp&&!h){d.errorRecoveryDisabledLanes|=s,to|=s,r=4;break e}s=oa,oa=r,s!==null&&(oa===null?oa=s:oa.push.apply(oa,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){Sr(e,0),hi(e,t,0,!0);break}e:{switch(i=e,s=r,s){case 0:case 1:throw Error(O(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:hi(i,t,ba,!di);break e;case 2:oa=null;break;case 3:case 5:break;default:throw Error(O(329))}if((t&62914560)===t&&(r=Mu+300-va(),10<r)){if(hi(i,t,ba,!di),vu(i,0,!0)!==0)break e;gn=t,i.timeoutHandle=Np(Yb.bind(null,i,a,oa,hu,mm,t,ba,to,xr,di,s,"Throttled",-0,0),r);break e}Yb(i,a,oa,hu,mm,t,ba,to,xr,di,s,null,-0,0)}}break}while(!0);vn(e)}function Yb(e,t,a,i,r,s,c,d,h,f,$,x,g,b){e.timeoutHandle=-1;var A=t.subtreeFlags,C=(s&335544064)===s;if(x=null,(C||A&8192||(A&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:dn},fa=null,Rw(t,s,x),C&&(A=x,C=e.containerInfo,C=(C.nodeType===9?C:C.ownerDocument).__reactViewTransition,C!=null&&(A.count++,A.waitingForViewTransition=!0,A=Ws.bind(A),C.finished.then(A,A))),A=(s&62914560)===s?Mu-va():(s&4194048)===s?Dw-va():0,A=$2(x,A),A!==null)){gn=s,e.cancelPendingCommit=A(Qb.bind(null,e,t,s,a,i,r,c,d,h,f,$,x,null,g,b)),hi(e,s,c,!f);return}Qb(e,t,s,a,i,r,c,d,h,f,$,x)}function y5(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var r=a[i],s=r.getSnapshot;r=r.value;try{if(!xa(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function hi(e,t,a,i){t=Dv(e,t),t&=~uu,t&=~to,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var r=t;0<r;){var s=31-wa(r),c=1<<s;i[s]=-1,r&=~c}a!==0&&_v(e,a,t)}function Ou(){return(Ee&6)===0?(dl(0,!1),!1):!0}function wp(){if(be!==null){if(Me===0)var e=be.return;else e=be,On=go=null,np(e),hr=null,Xs=0,e=be;for(;e!==null;)hw(e.alternate,e),e=e.return;be=null}}function Sr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,B5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),gn=0,wp(),Be=e,be=a=Vn(e.current,null),ye=t,Me=0,ma=null,di=!1,Dr=il(e,t),yp=!1,xr=ba=uu=to=Ci=rt=0,oa=Hs=null,mm=!1,Bn=Dv(e,t),Nu(),a}function Uw(e,t){de=null,ee.H=iu,t===Or||t===Tu?(t=vb(),Me=3):t===Pm?(t=vb(),Me=4):Me=t===dp?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ma=t,be===null&&(rt=1,ou(e,Da(t,e.current)))}function qw(){var e=Ot.current;return e===null?!0:(ye&4194048)===ye?Ut===null:(ye&62914560)===ye||(ye&536870912)!==0?e===Ut:!1}function Bw(){var e=ee.H;return ee.H=iu,e===null?iu:e}function jw(){var e=ee.A;return ee.A=b5,e}function mu(){rt=4,di||(ye&4194048)!==ye&&Ot.current!==null||(Dr=!0),(Ci&134217727)===0&&(to&134217727)===0||Be===null||hi(Be,ye,ba,!1)}function mh(e,t,a){var i=Ee;Ee|=2;var r=Bw(),s=jw();(Be!==e||ye!==t)&&(hu=null,Sr(e,t)),t=!1;var c=rt;e:do try{if(Me!==0&&be!==null){var d=be,h=ma;switch(Me){case 8:wp(),c=6;break e;case 3:case 2:case 9:case 6:Ot.current===null&&(t=!0);var f=Me;if(Me=0,ma=null,sr(e,d,h,f),a&&Dr){c=0;break e}break;default:f=Me,Me=0,ma=null,sr(e,d,h,f)}}w5(),c=rt;break}catch($){Uw(e,$)}while(!0);return t&&e.shellSuspendCounter++,On=go=null,Ee=i,ee.H=r,ee.A=s,be===null&&(Be=null,ye=0,Nu()),c}function w5(){for(;be!==null;)Lw(be)}function $5(e,t){var a=Ee;Ee|=2;var i=Bw(),r=jw();Be!==e||ye!==t?(hu=null,du=va()+500,Sr(e,t)):Dr=il(e,t);e:do try{if(Me!==0&&be!==null){t=be;var s=ma;t:switch(Me){case 1:Me=0,ma=null,sr(e,t,s,1);break;case 2:case 9:if(bb(s)){Me=0,ma=null,Xb(t);break}t=function(){Me!==2&&Me!==9||Be!==e||(Me=7),vn(e)},s.then(t,t);break e;case 3:Me=7;break e;case 4:Me=5;break e;case 7:bb(s)?(Me=0,ma=null,Xb(t)):(Me=0,ma=null,sr(e,t,s,7));break;case 5:var c=null;switch(be.tag){case 26:c=be.memoizedState;case 5:case 27:var d=be;if(c?p0(c):d.stateNode.complete){Me=0,ma=null;var h=d.sibling;if(h!==null)be=h;else{var f=d.return;f!==null?(be=f,Vu(f)):be=null}break t}}Me=0,ma=null,sr(e,t,s,5);break;case 6:Me=0,ma=null,sr(e,t,s,6);break;case 8:wp(),rt=6;break e;default:throw Error(O(462))}}x5();break}catch($){Uw(e,$)}while(!0);return On=go=null,ee.H=i,ee.A=r,Ee=a,be!==null?0:(Be=null,ye=0,Nu(),rt)}function x5(){for(;be!==null&&!Ux();)Lw(be)}function Lw(e){var t=dw(e.alternate,e,Bn);e.memoizedProps=e.pendingProps,t===null?Vu(e):be=t}function Xb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Vb(a,t,t.pendingProps,t.type,void 0,ye);break;case 11:t=Vb(a,t,t.pendingProps,t.type.render,t.ref,ye);break;case 5:np(t);var i=t;i===Nt&&(ge?(Jc(i),i.tag===5&&i.stateNode!=null&&(Xe=i.stateNode)):(Jc(i),ge=!0));default:hw(a,t),t=be=my(t,Bn),t=dw(a,t,Bn)}e.memoizedProps=e.pendingProps,t===null?Vu(e):be=t}function sr(e,t,a,i){On=go=null,np(t),hr=null,Xs=0;var r=t.return;try{if(c5(e,r,t,a,ye)){rt=1,ou(e,Da(a,e.current)),be=null;return}}catch(s){if(r!==null)throw be=r,s;rt=1,ou(e,Da(a,e.current)),be=null;return}t.flags&32768?(ge||i===1?e=!0:Dr||(ye&536870912)!==0?e=!1:(di=e=!0,(i===2||i===9||i===3||i===6)&&(i=Ot.current,i!==null&&i.tag===13&&(i.flags|=16384))),Gw(t,e)):Vu(t)}function Vu(e){var t=e;do{if((t.flags&32768)!==0){Gw(t,di);return}e=t.return;var a=m5(t.alternate,t,Bn);if(a!==null){be=a;return}if(t=t.sibling,t!==null){be=t;return}be=t=e}while(t!==null);rt===0&&(rt=5)}function Gw(e,t){do{var a=p5(e.alternate,e);if(a!==null){a.flags&=32767,be=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){be=e;return}be=e=a}while(e!==null);rt=6,be=null}function Qb(e,t,a,i,r,s,c,d,h,f,$,x){e.cancelPendingCommit=null;do Du();while(nt!==0);if((Ee&6)!==0)throw Error(O(327));if(t!==null){if(t===e.current)throw Error(O(177));e===Be&&(be=Be=null,ye=0),co=t,Ka=e,gn=a,gm=r,Iw=i,N5(e,t,a,c,d,h,x)}}function N5(e,t,a,i,r,s,c){var d=t.lanes|t.childLanes;if(pm=d,d|=Lm,Px(e,a,d,i,r,s),fr=null,(a&335544064)===a?(br=JN(e),i=10262):(br=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,z5(Xc,function(){return ym(),null})):(e.callbackNode=null,e.callbackPriority=0),lu=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=ee.T,ee.T=null,r=Ce.p,Ce.p=2,s=Ee,Ee|=4;try{g5(e,t,a)}finally{Ee=s,Ce.p=r,ee.T=i}}nt=1,lu?gr=Q5(c,e.containerInfo,br,fm,bm,k5,vm,ym,S5,null,null):(fm(),bm(),vm())}function S5(e){if(nt!==0){var t=Ka.onRecoverableError;t(e,{componentStack:null})}}function k5(){nt===3&&(nt=0,zw(co,Ka),nt=4)}function fm(){if(nt===1){nt=0;var e=Ka,t=co,a=gn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=ee.T,ee.T=null;var r=Ce.p;Ce.p=2;var s=Ee;Ee|=4;try{Ts=cu=!1,Ew(t,e,a),a=Nm;var c=oy(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&iy(d.ownerDocument.documentElement,d)){if(h!==null&&jm(d)){var f=h.start,$=h.end;if($===void 0&&($=f),"selectionStart"in d)d.selectionStart=f,d.selectionEnd=Math.min($,d.value.length);else{var x=d.ownerDocument||document,g=x&&x.defaultView||window;if(g.getSelection){var b=g.getSelection(),A=d.textContent.length,C=Math.min(h.start,A),M=h.end===void 0?C:Math.min(h.end,A);!b.extend&&C>M&&(c=M,M=C,C=c);var w=cb(d,C),y=cb(d,M);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),C>M?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=d;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<x.length;d++){var k=x[d];k.element.scrollLeft=k.left,k.element.scrollTop=k.top}}zr=!!xm,Nm=xm=null}finally{Ee=s,Ce.p=r,ee.T=i}}e.current=t,nt=2}}function bm(){if(nt===2){nt=0;var e=Ka,t=co,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=ee.T,ee.T=null;var i=Ce.p;Ce.p=2;var r=Ee;Ee|=4;try{$w(e,t.alternate,t)}finally{Ee=r,Ce.p=i,ee.T=a}}nt=3}}function vm(){if(nt===4||nt===3){nt=0;var e=gr;gr=null,qx();var t=Ka,a=co,i=gn,r=Iw,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?nt=5:(nt=0,co=Ka=null,Yw(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(wi=null),Im(i),a=a.stateNode,ya&&typeof ya.onCommitFiberRoot=="function")try{ya.onCommitFiberRoot(nl,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=ee.T,s=Ce.p,Ce.p=2,ee.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{ee.T=a,Ce.p=s}}if(r=fr,c=br,br=null,r!==null&&(fr=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(gn&3)!==0&&Du(),vn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===_c?Us++:(Us=0,_c=t):(Us=0,_c=null),dl(0,!1)}}function Yw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ll(t)))}function Du(){return gr!==null&&(gr.skipTransition(),gr=null),fm(),bm(),vm(),ym()}function ym(){if(nt!==5)return!1;var e=Ka,t=pm;pm=0;var a=Im(gn),i=ee.T,r=Ce.p;try{Ce.p=32>a?32:a,ee.T=null,a=gm,gm=null;var s=Ka,c=gn;if(nt=0,co=Ka=null,gn=0,(Ee&6)!==0)throw Error(O(331));var d=Ee;if(Ee|=4,Ow(s.current),Aw(s,s.current,c,a),Ee=d,dl(0,!1),ya&&typeof ya.onPostCommitFiberRoot=="function")try{ya.onPostCommitFiberRoot(nl,s)}catch{}return!0}finally{Ce.p=r,ee.T=i,Yw(e,t)}}function Zb(e,t,a){t=Da(a,t),t=Fh(e.stateNode,t,2),e=bi(e,t,2),e!==null&&(ol(e,2),vn(e))}function Ve(e,t,a){if(e.tag===3)Zb(e,e,a);else for(;t!==null;){if(t.tag===3){Zb(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(wi===null||!wi.has(i))){e=Da(a,e),a=rw(2),i=bi(t,a,2),i!==null&&(sw(a,i,t,e),ol(i,2),vn(i));break}}t=t.return}}function ph(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new v5;var r=new Set;i.set(t,r)}else r=i.get(t),r===void 0&&(r=new Set,i.set(t,r));r.has(a)||(yp=!0,r.add(a),e=T5.bind(null,e,t,a),t.then(e,e))}function T5(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Be===e&&(ye&a)===a&&((rt===4||rt===3&&(ye&62914560)===ye&&300>va()-Mu)&&(Ee&2)===0?Sr(e,0):uu|=a,xr===ye&&(xr=0)),vn(e)}function Xw(e,t){t===0&&(t=Iv()),e=po(e,t),e!==null&&(ol(e,t),vn(e))}function E5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Xw(e,a)}function C5(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(O(314))}i!==null&&i.delete(t),Xw(e,a)}function z5(e,t){return Vm(e,t)}var kr=null,Po=null,wm=!1,pu=!1,gh=!1,mi=0;function vn(e){e!==Po&&e.next===null&&(Po===null?kr=Po=e:Po=Po.next=e),pu=!0,wm||(wm=!0,R5())}function dl(e,t){if(!gh&&pu){gh=!0;do for(var a=!1,i=kr;i!==null;){if(!t)if(e!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-wa(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Pb(i,s))}else s=ye,s=vu(i,i===Be?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||il(i,s)||(a=!0,Pb(i,s));i=i.next}while(a);gh=!1}}function A5(){Qw()}function Qw(){pu=wm=!1;var e=0;mi!==0&&q5()&&(e=mi);for(var t=va(),a=null,i=kr;i!==null;){var r=i.next,s=Zw(i,t);s===0?(i.next=null,a===null?kr=r:a.next=r,r===null&&(Po=a)):(a=i,(e!==0||(s&3)!==0)&&(pu=!0)),i=r}nt!==0&&nt!==5||dl(e,!1),mi!==0&&(mi=0)}function Zw(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-wa(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&i)!==0)&&(r[c]=Zx(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=Be,a=ye,a=vu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(Me===2||Me===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Qd(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||il(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&Qd(i),Im(a)){case 2:case 8:a=Ov;break;case 32:a=Xc;break;case 268435456:a=Vv;break;default:a=Xc}return i=Pw.bind(null,e),a=Vm(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&Qd(i),e.callbackPriority=2,e.callbackNode=null,2}function Pw(e,t){if(nt!==0&&nt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Du()&&e.callbackNode!==a)return null;var i=ye;return i=vu(e,e===Be?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Hw(e,i,t),Zw(e,va()),e.callbackNode!=null&&e.callbackNode===a?Pw.bind(null,e):null)}function Pb(e,t){if(Du())return null;Hw(e,t,!0)}function R5(){j5(function(){(Ee&6)!==0?Vm(Mv,A5):Qw()})}function $p(){if(mi===0){var e=oo;e===0&&(e=ic,ic<<=1,(ic&261888)===0&&(ic=256)),mi=e}return mi}function Kb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:kc(e)}function M5(e,t,a,i,r){if(t==="submit"&&a&&a.stateNode===r){var s=Kb((r[ua]||null).action),c=i.submitter;c&&(t=(t=c[ua]||null)?Kb(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new wu("action","action",null,i,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(mi!==0){var h=new FormData(r,c);Kh(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),Kh(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(yc=0;yc<Uh.length;yc++)wc=Uh[yc],Jb=wc.toLowerCase(),Fb=wc[0].toUpperCase()+wc.slice(1),Ja(Jb,"on"+Fb);var wc,Jb,Fb,yc;Ja(sy,"onAnimationEnd");Ja(ly,"onAnimationIteration");Ja(cy,"onAnimationStart");Ja("dblclick","onDoubleClick");Ja("focusin","onFocus");Ja("focusout","onBlur");Ja(LN,"onTransitionRun");Ja(GN,"onTransitionStart");Ja(YN,"onTransitionCancel");Ja(uy,"onTransitionEnd");yr("onMouseEnter",["mouseout","mouseover"]);yr("onMouseLeave",["mouseout","mouseover"]);yr("onPointerEnter",["pointerout","pointerover"]);yr("onPointerLeave",["pointerout","pointerover"]);ho("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ho("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ho("onBeforeInput",["compositionend","keypress","textInput","paste"]);ho("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ho("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ho("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ps="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),O5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ps));function Kw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],r=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,f=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=f;try{s(r)}catch($){Zc($)}r.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,f=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=f;try{s(r)}catch($){Zc($)}r.currentTarget=null,s=h}}}}function fe(e,t){var a=t[Xf];a===void 0&&(a=t[Xf]=new Set);var i=e+"__bubble";a.has(i)||(Jw(t,e,2,!1),a.add(i))}function fh(e,t,a){var i=0;t&&(i|=4),Jw(a,e,i,t)}var $c="_reactListening"+Math.random().toString(36).slice(2);function xp(e){if(!e[$c]){e[$c]=!0,jv.forEach(function(a){a!=="selectionchange"&&(O5.has(a)||fh(a,!1,e),fh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[$c]||(t[$c]=!0,fh("selectionchange",!1,t))}}function Jw(e,t,a,i){switch($0(t)){case 2:var r=k2;break;case 8:r=T2;break;default:r=zp}a=r.bind(null,t,a,e),r=void 0,!Dh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),i?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function bh(e,t,a,i,r){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=Pi(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}Kv(function(){var f=s,$=Hm(a),x=[];e:{var g=dy.get(e);if(g!==void 0){var b=wu,A=e;switch(e){case"keypress":if(Ec(a)===0)break e;case"keydown":case"keyup":b=yN;break;case"focusin":A="focus",b=Wd;break;case"focusout":A="blur",b=Wd;break;case"beforeblur":case"afterblur":b=Wd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=eb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=sN;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=SN;break;case sy:case ly:case cy:b=uN;break;case uy:b=TN;break;case"scroll":case"scrollend":b=oN;break;case"wheel":b=CN;break;case"copy":case"cut":case"paste":b=hN;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=ab;break;case"submit":b=xN;break;case"toggle":case"beforetoggle":b=AN}var C=(t&4)!==0,M=!C&&(e==="scroll"||e==="scrollend"),w=C?g!==null?g+"Capture":null:g;C=[];for(var y=f,v;y!==null;){var k=y;if(v=k.stateNode,k=k.tag,k!==5&&k!==26&&k!==27||v===null||w===null||(k=Bs(y,w),k!=null&&C.push(Ks(y,k,v))),M)break;y=y.return}0<C.length&&(g=new b(g,A,null,a,$),x.push({event:g,listeners:C}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",b&&a!==Vh&&(A=a.relatedTarget||a.fromElement)&&(Pi(A)||A[Rr]))break e;(g||b)&&(A=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,g?(b=a.relatedTarget||a.toElement,g=f,b=b?Pi(b):null,b!==null&&(M=al(b),C=b.tag,b!==M||C!==5&&C!==27&&C!==6)&&(b=null)):(g=null,b=f),g!==b&&(C=eb,k="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(C=ab,k="onPointerLeave",w="onPointerEnter",y="pointer"),M=g==null?A:Ss(g),v=b==null?A:Ss(b),A=new C(k,y+"leave",g,a,$),A.target=M,A.relatedTarget=v,k=null,Pi($)===f&&(C=new C(w,y+"enter",b,a,$),C.target=v,C.relatedTarget=M,k=C),M=k,C=g&&b?xh(g,b,V5):null,g!==null&&Wb(x,A,g,C,!1),b!==null&&M!==null&&Wb(x,M,b,C,!0)))}e:{if(g=f?Ss(f):window,b=g.nodeName&&g.nodeName.toLowerCase(),b==="select"||b==="input"&&g.type==="file")var V=rb;else if(ob(g))if(ay)V=qN;else{V=HN;var P=_N}else b=g.nodeName,!b||b.toLowerCase()!=="input"||g.type!=="checkbox"&&g.type!=="radio"?f&&_m(f.elementType)&&(V=rb):V=UN;if(V&&(V=V(e,f))){ty(x,V,a,$);break e}P&&P(e,g,f)}switch(P=f?Ss(f):window,e){case"focusin":(ob(P)||P.contentEditable==="true")&&(tr=P,_h=f,zs=null);break;case"focusout":zs=_h=tr=null;break;case"mousedown":Hh=!0;break;case"contextmenu":case"mouseup":case"dragend":Hh=!1,ub(x,a,$);break;case"selectionchange":if(jN)break;case"keydown":case"keyup":ub(x,a,$)}var H;if(Bm)e:{switch(e){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else er?Wv(e,a)&&(L="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(L="onCompositionStart");L&&(Fv&&a.locale!=="ko"&&(er||L!=="onCompositionStart"?L==="onCompositionEnd"&&er&&(H=Jv()):(ci=$,Um="value"in ci?ci.value:ci.textContent,er=!0)),P=gu(f,L),0<P.length&&(L=new tb(L,e,null,a,$),x.push({event:L,listeners:P}),H?L.data=H:(H=ey(a),H!==null&&(L.data=H)))),(H=MN?ON(e,a):VN(e,a))&&(L=gu(f,"onBeforeInput"),0<L.length&&(P=new tb("onBeforeInput","beforeinput",null,a,$),x.push({event:P,listeners:L}),P.data=H)),M5(x,e,f,a,$)}Kw(x,t)})}function Ks(e,t,a){return{instance:e,listener:t,currentTarget:a}}function gu(e,t){for(var a=t+"Capture",i=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Bs(e,a),r!=null&&i.unshift(Ks(e,r,s)),r=Bs(e,t),r!=null&&i.push(Ks(e,r,s))),e.tag===3)return i;e=e.return}return[]}function V5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Wb(e,t,a,i,r){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,f=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||f===null||(h=f,r?(f=Bs(a,s),f!=null&&c.unshift(Ks(a,f,h))):r||(f=Bs(a,s),f!=null&&c.push(Ks(a,f,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var D5=/\r\n?/g,I5=/\u0000|\uFFFD/g;function ev(e){return(typeof e=="string"?e:""+e).replace(D5,`
`).replace(I5,"")}function Fw(e,t){return t=ev(t),ev(e)===t}function Oe(e,t,a,i,r,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||wr(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&wr(e,""+i);else return;break;case"className":sc(e,"class",i);break;case"tabIndex":sc(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":sc(e,a,i);break;case"style":Pv(e,i,s);return;case"data":if(t!=="object"){sc(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=kc(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&Oe(e,t,"name",r.name,r,null),Oe(e,t,"formEncType",r.formEncType,r,null),Oe(e,t,"formMethod",r.formMethod,r,null),Oe(e,t,"formTarget",r.formTarget,r,null)):(Oe(e,t,"encType",r.encType,r,null),Oe(e,t,"method",r.method,r,null),Oe(e,t,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=kc(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=dn);return;case"onScroll":i!=null&&fe("scroll",e);return;case"onScrollEnd":i!=null&&fe("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(O(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(O(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=kc(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":fe("beforetoggle",e),fe("toggle",e),Sc(e,"popover",i);break;case"xlinkActuate":An(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":An(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":An(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":An(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":An(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":An(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":An(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":An(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":An(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Sc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=nN.get(a)||a,Sc(e,a,i);else return}Te=!0}function $m(e,t,a,i,r,s){switch(a){case"style":Pv(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(O(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(O(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")wr(e,i);else if(typeof i=="number"||typeof i=="bigint")wr(e,""+i);else return;break;case"onScroll":i!=null&&fe("scroll",e);return;case"onScrollEnd":i!=null&&fe("scrollend",e);return;case"onClick":i!=null&&(e.onclick=dn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Lv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[ua]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,r);break e}Te=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):Sc(e,a,i)}return}Te=!0}function Mt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":fe("error",e),fe("load",e);var i=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(O(137,t));default:Oe(e,t,s,c,a,null)}}r&&Oe(e,t,"srcSet",a.srcSet,a,null),i&&Oe(e,t,"src",a.src,a,null);return;case"input":fe("invalid",e);var d=s=c=r=null,h=null,f=null;for(i in a)if(a.hasOwnProperty(i)){var $=a[i];if($!=null)switch(i){case"name":r=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":f=$;break;case"value":s=$;break;case"defaultValue":d=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(O(137,t));break;default:Oe(e,t,i,$,a,null)}}Xv(e,s,d,h,f,c,r,!1);return;case"select":fe("invalid",e),i=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:Oe(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?cr(e,!!i,t,!1):a!=null&&cr(e,!!i,a,!0);return;case"textarea":fe("invalid",e),s=r=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(O(91));break;default:Oe(e,t,c,d,a,null)}Zv(e,i,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Oe(e,t,h,i,a,null));return;case"dialog":fe("beforetoggle",e),fe("toggle",e),fe("cancel",e),fe("close",e);break;case"iframe":case"object":fe("load",e);break;case"video":case"audio":for(i=0;i<Ps.length;i++)fe(Ps[i],e);break;case"image":fe("error",e),fe("load",e);break;case"details":fe("toggle",e);break;case"embed":case"source":case"link":fe("error",e),fe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in a)if(a.hasOwnProperty(f)&&(i=a[f],i!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(O(137,t));default:Oe(e,t,f,i,a,null)}return;default:if(_m(t)){for($ in a)a.hasOwnProperty($)&&(i=a[$],i!==void 0&&$m(e,t,$,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&Oe(e,t,d,i,a,null))}var _5={};function H5(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,f=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:i.hasOwnProperty(b)||Oe(e,t,b,null,i,x)}}for(var g in i){var b=i[g];if(x=a[g],i.hasOwnProperty(g)&&(b!=null||x!=null))switch(g){case"type":b!==x&&(Te=!0),s=b;break;case"name":b!==x&&(Te=!0),r=b;break;case"checked":b!==x&&(Te=!0),f=b;break;case"defaultChecked":b!==x&&(Te=!0),$=b;break;case"value":b!==x&&(Te=!0),c=b;break;case"defaultValue":b!==x&&(Te=!0),d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(O(137,t));break;default:b!==x&&Oe(e,t,g,b,i,x)}}Oh(e,c,d,h,f,$,s,r);return;case"select":b=c=d=g=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":b=h;default:i.hasOwnProperty(s)||Oe(e,t,s,null,i,h)}for(r in i)if(s=i[r],h=a[r],i.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(Te=!0),g=s;break;case"defaultValue":s!==h&&(Te=!0),d=s;break;case"multiple":s!==h&&(Te=!0),c=s;default:s!==h&&Oe(e,t,r,s,i,h)}t=d,a=c,i=b,g!=null?cr(e,!!a,g,!1):!!i!=!!a&&(t!=null?cr(e,!!a,t,!0):cr(e,!!a,a?[]:"",!1));return;case"textarea":b=g=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:Oe(e,t,d,null,i,r)}for(c in i)if(r=i[c],s=a[c],i.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(Te=!0),g=r;break;case"defaultValue":r!==s&&(Te=!0),b=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(O(91));break;default:r!==s&&Oe(e,t,c,r,i,s)}Qv(e,g,b);return;case"option":for(var A in a)g=a[A],a.hasOwnProperty(A)&&g!=null&&!i.hasOwnProperty(A)&&(A==="selected"?e.selected=!1:Oe(e,t,A,null,i,g));for(h in i)g=i[h],b=a[h],i.hasOwnProperty(h)&&g!==b&&(g!=null||b!=null)&&(h==="selected"?(g!==b&&(Te=!0),e.selected=g&&typeof g!="function"&&typeof g!="symbol"):Oe(e,t,h,g,i,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var C in a)g=a[C],a.hasOwnProperty(C)&&g!=null&&!i.hasOwnProperty(C)&&Oe(e,t,C,null,i,g);for(f in i)if(g=i[f],b=a[f],i.hasOwnProperty(f)&&g!==b&&(g!=null||b!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(g!=null)throw Error(O(137,t));break;default:Oe(e,t,f,g,i,b)}return;default:if(_m(t)){for(var M in a)g=a[M],a.hasOwnProperty(M)&&g!==void 0&&!i.hasOwnProperty(M)&&$m(e,t,M,void 0,i,g);for($ in i)g=i[$],b=a[$],!i.hasOwnProperty($)||g===b||g===void 0&&b===void 0||$m(e,t,$,g,i,b);return}}for(var w in a)g=a[w],a.hasOwnProperty(w)&&g!=null&&!i.hasOwnProperty(w)&&Oe(e,t,w,null,i,g);for(x in i)g=i[x],b=a[x],!i.hasOwnProperty(x)||g===b||g==null&&b==null||Oe(e,t,x,g,i,b)}function tv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function U5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var r=a[i],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&tv(c)){for(c=0,d=r.responseEnd,i+=1;i<a.length;i++){var h=a[i],f=h.startTime;if(f>d)break;var $=h.transferSize,x=h.initiatorType;$&&tv(x)&&(h=h.responseEnd,c+=$*(h<d?1:(d-f)/(h-f)))}if(--i,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var xm=null,Nm=null;function Js(e){return e.nodeType===9?e:e.ownerDocument}function av(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Ww(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function e0(e,t,a,i){return a=Js(a).createElement(e),a[Ct]=i,a[ua]=t,Mt(a,e,t),xt(a),a}function Sm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var vh=null;function q5(){var e=window.event;return e&&e.type==="popstate"?e===vh?!1:(vh=e,!0):(vh=null,!1)}var Np=typeof setTimeout=="function"?setTimeout:void 0,B5=typeof clearTimeout=="function"?clearTimeout:void 0,nv=typeof Promise=="function"?Promise:void 0,iv=typeof requestAnimationFrame=="function"?requestAnimationFrame:Np,j5=typeof queueMicrotask=="function"?queueMicrotask:typeof nv<"u"?function(e){return nv.resolve(null).then(e).catch(L5)}:Np;function L5(e){setTimeout(function(){throw e})}function Ai(e){return e==="head"}function ov(e,t){var a=t,i=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(r),Ar(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")wh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,wh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[rl]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&wh(e.ownerDocument.body);a=r}while(a);Ar(t)}function rv(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function t0(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var r=i=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function a0(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function n0(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function km(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return n0(t,a,e)}function G5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return n0(t,a,e)}function Y5(e){return e.documentElement.clientHeight}function X5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function Q5(e,t,a,i,r,s,c,d,h){var f=t.nodeType===9?t:t.ownerDocument;try{var $=f.startViewTransition({update:function(){var g=f.defaultView,b=g.navigation&&g.navigation.transition,A=f.fonts.status;i();var C=[];if(A==="loaded"&&(Y5(f),f.fonts.status==="loading"&&C.push(f.fonts.ready)),A=C.length,e!==null)for(var M=e.suspenseyImages,w=0,y=0;y<M.length;y++){var v=M[y];if(!v.complete){var k=v.getBoundingClientRect();if(0<k.bottom&&0<k.right&&k.top<g.innerHeight&&k.left<g.innerWidth){if(w+=g0(v),w>qc){C.length=A;break}v=new Promise(X5.bind(v)),C.push(v)}}}if(0<C.length)return g=Promise.race([Promise.all(C),new Promise(function(V){return setTimeout(V,500)})]).then(r,r),(b?Promise.allSettled([b.finished,g]):g).then(s,s);if(r(),b)return b.finished.then(s,s);s()},types:a});f.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var g=f.documentElement.getAnimations({subtree:!0}),b=0;b<g.length;b++){var A=g[b],C=A.effect,M=C.pseudoElement;if(M!=null&&M.startsWith("::view-transition")){x.push(A),A=C.getKeyframes();for(var w=M=void 0,y=!0,v=0;v<A.length;v++){var k=A[v],V=k.width;if(M===void 0)M=V;else if(M!==V){y=!1;break}if(V=k.height,w===void 0)w=V;else if(w!==V){y=!1;break}delete k.width,delete k.height,k.transform==="none"&&delete k.transform}y&&M!==void 0&&w!==void 0&&(C.setKeyframes(A),y=getComputedStyle(C.target,C.pseudoElement),y.width!==M||y.height!==w)&&(y=A[0],y.width=M,y.height=w,y=A[A.length-1],y.width=M,y.height=w,C.setKeyframes(A))}}c()},function(g){f.__reactViewTransition===$&&(f.__reactViewTransition=null);try{typeof g=="object"&&g!==null&&g.name==="InvalidStateError"&&(g.message==="View transition was skipped because document visibility state is hidden."||g.message==="Skipping view transition because document visibility state has become hidden."||g.message==="Skipping view transition because viewport size changed."||g.message==="Transition was aborted because of invalid state")&&(g=null),g!==null&&h(g)}finally{i(),r(),c()}}),$.finished.finally(function(){for(var g=0;g<x.length;g++)x[g].cancel();f.__reactViewTransition===$&&(f.__reactViewTransition=null),d()}),$}catch{return i(),r(),c(),null}}function Ki(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Ki.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:je({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Ki.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[r])}return i};Ki.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function i0(e){return{name:e,group:new Ki("group",e),imagePair:new Ki("image-pair",e),old:new Ki("old",e),new:new Ki("new",e)}}function Na(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Na.prototype.addEventListener=function(e,t,a){var i=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(o0(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(r=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",r,{once:!0}),r=i.removeEventListener.bind(i,"abort",r)),i=Tr(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),ca(this._fragmentFiber.child,!1,Z5,e,d,i)}this._eventListeners=s}};function Z5(e,t,a,i){return gt(e).addEventListener(t,a,i),!1}Na.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=o0(i,e,t,a),t!==-1)){var r=i[t];a=r.attachedListener;var s=r.cleanup;r=Tr(r.optionsOrUseCapture),ca(this._fragmentFiber.child,!1,P5,e,a,r),i.splice(t,1),s!==null&&s()}};function P5(e,t,a,i){return gt(e).removeEventListener(t,a,i),!1}function Tr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function sv(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function o0(e,t,a,i){if(e.length===0)return-1;i=sv(i);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&sv(s.optionsOrUseCapture)===i)return r}return-1}Na.prototype.dispatchEvent=function(e){var t=uo(this._fragmentFiber);if(t===null)return!0;t=gt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];i.addEventListener(s.type,s.attachedListener,Tr(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],i.removeEventListener(s.type,s.attachedListener,Tr(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};Na.prototype.focus=function(e){ca(this._fragmentFiber.child,!0,r0,e,void 0,void 0)};function r0(e,t){return e.tag===6?!1:(e=gt(e),s2(e,t))}Na.prototype.focusLast=function(e){var t=[];ca(this._fragmentFiber.child,!0,Sp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!r0(t[a],e);a--);};function Sp(e,t){return t.push(e),!1}Na.prototype.blur=function(){var e=uo(this._fragmentFiber);e!==null&&(e=gt(e),e=Js(e).activeElement,e!==null&&ca(this._fragmentFiber.child,!1,K5,e,void 0,void 0))};function K5(e,t){return e.tag===6?!1:(e=gt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Na.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),ca(this._fragmentFiber.child,!1,J5,e,void 0,void 0)};function J5(e,t){return e.tag===6||(e=gt(e),t.observe(e)),!1}Na.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),ca(this._fragmentFiber.child,!1,F5,e,void 0,void 0);for(var a=t=0;a<Pa.length;a++){var i=Pa[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):Pa[t++]=i}Pa.length=t}};function F5(e,t){return e.tag===6||(e=gt(e),t.unobserve(e)),!1}var Pa=[],yh=!1;function W5(e,t,a){Pa.push({fragmentInstance:e,observer:t,instance:a}),yh||(yh=!0,l2(function(){yh=!1;var i=Pa;Pa=[];for(var r=0;r<i.length;r++){var s=i[r];s.observer.unobserve(s.instance)}}))}Na.prototype.getClientRects=function(){var e=[];return ca(this._fragmentFiber.child,!1,e2,e,void 0,void 0),e};function e2(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=gt(e),t.push.apply(t,e.getClientRects());return!1}Na.prototype.getRootNode=function(e){var t=uo(this._fragmentFiber);return t===null?this:gt(t).getRootNode(e)};Na.prototype.compareDocumentPosition=function(e){var t=uo(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];ca(this._fragmentFiber.child,!1,Sp,a,void 0,void 0);var i=gt(t);if(a.length===0){if(a=i,qf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=i=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Cv(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=gt(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=gt(a[0]),r=gt(a[a.length-1]);var s=qf(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||t2(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function t2(e,t,a,i,r){var s=Pi(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=uo(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=xh(a,s,Bf),t===null?t=!1:(ca(t,!0,Rx,s,a),s=Ko,Ko=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=xh(i,s,Bf),t===null?t=!1:(ca(t,!0,Mx,s,i),s=Ko,$h=Ko=null,t=s!==null)),t):!1}function lv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Na.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(O(566));var t=[];ca(this._fragmentFiber.child,!1,Sp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=Cv(this._fragmentFiber);if(i=a?i[1]||i[0]||uo(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=gt(i),lv(e,a);return}if(i=gt(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var r=t[i];r.tag===6?(r=gt(r),lv(r,a)):gt(r).scrollIntoView(e),i+=a?-1:1}};function a2(e,t){return e=gt(e),s0(e,t),!1}function s0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function l0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.addEventListener(r.type,r.attachedListener,Tr(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<Pa.length;d++){var h=Pa[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(Pa[c++]=h)}Pa.length=c,s.observe(e)}),s0(e,t))}function n2(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.removeEventListener(r.type,r.attachedListener,Tr(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?W5(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Tm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Tm(a),yu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function i2(e,t,a,i){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[rl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=_a(e.nextSibling),e===null)break}return null}function o2(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=_a(e.nextSibling),e===null))return null;return e}function c0(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=_a(e.nextSibling),e===null))return null;return e}function Em(e){return e.data==="$?"||e.data==="$~"}function kp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function r2(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function _a(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Cm=null;function cv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return _a(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function uv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function s2(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function l2(e){iv(function(){iv(function(t){return e(t)})})}function u0(e,t,a){switch(t=Js(a),e){case"html":if(e=t.documentElement,!e)throw Error(O(452));return e;case"head":if(e=t.head,!e)throw Error(O(453));return e;case"body":if(e=t.body,!e)throw Error(O(454));return e;default:throw Error(O(451))}}function d0(e,t,a){for(var i in a){var r=a[i];a.hasOwnProperty(i)&&r!=null&&Oe(e,t,i,null,_5,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===dn&&(e.onclick=null),yu(e)}function wh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);yu(e)}var Ha=new Map,dv=new Set;function Fs(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Gn=Ce.d;Ce.d={f:c2,r:u2,D:d2,C:h2,L:m2,m:p2,X:f2,S:g2,M:b2};function c2(){var e=Gn.f(),t=Ou();return e||t}function u2(e){var t=Mr(e);t!==null&&t.tag===5&&t.type==="form"?Py(t):Gn.r(e)}var Ir=typeof document>"u"?null:document;function h0(e,t,a){var i=Ir;if(i&&typeof t=="string"&&t){var r=Va(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),dv.has(r)||(dv.add(r),e={rel:e,crossOrigin:a,href:t},i.querySelector(r)===null&&(t=i.createElement("link"),Mt(t,"link",e),xt(t),i.head.appendChild(t)))}}function d2(e){Gn.D(e),h0("dns-prefetch",e,null)}function h2(e,t){Gn.C(e,t),h0("preconnect",e,t)}function m2(e,t,a){Gn.L(e,t,a);var i=Ir;if(i&&e&&t){var r='link[rel="preload"][as="'+Va(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+Va(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+Va(a.imageSizes)+'"]')):r+='[href="'+Va(e)+'"]';var s=r;switch(t){case"style":s=Er(e);break;case"script":s=_r(e)}if(!(Ha.has(s)||(e=je({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ha.set(s,e),i.querySelector(r)!==null||t==="style"&&i.querySelector(hl(s))||t==="script"&&i.querySelector(ml(s))))){var c=i.createElement("link");Mt(c,"link",e),t==="style"&&(c[Qc]=!0,c.onload=c.onerror=function(){Bv(c)}),xt(c),i.head.appendChild(c)}}}function p2(e,t){Gn.m(e,t);var a=Ir;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+Va(i)+'"][href="'+Va(e)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=_r(e)}if(!Ha.has(s)&&(e=je({rel:"modulepreload",href:e},t),Ha.set(s,e),a.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(ml(s)))return}i=a.createElement("link"),Mt(i,"link",e),xt(i),a.head.appendChild(i)}}}function g2(e,t,a){Gn.S(e,t,a);var i=Ir;if(i&&e){var r=lr(i).hoistableStyles,s=Er(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector(hl(s)))d.loading=5;else{e=je({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ha.get(s))&&Tp(e,a);var h=c=i.createElement("link");xt(h),Mt(h,"link",e),h._p=new Promise(function(f,$){h.onload=f,h.onerror=$}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,Hc(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function f2(e,t){Gn.X(e,t);var a=Ir;if(a&&e){var i=lr(a).hoistableScripts,r=_r(e),s=i.get(r);s||(s=a.querySelector(ml(r)),s||(e=je({src:e,async:!0},t),(t=Ha.get(r))&&Ep(e,t),s=a.createElement("script"),xt(s),Mt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function b2(e,t){Gn.M(e,t);var a=Ir;if(a&&e){var i=lr(a).hoistableScripts,r=_r(e),s=i.get(r);s||(s=a.querySelector(ml(r)),s||(e=je({src:e,async:!0,type:"module"},t),(t=Ha.get(r))&&Ep(e,t),s=a.createElement("script"),xt(s),Mt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function hv(e,t,a,i){var r=(r=pi.current)?Fs(r):null;if(!r)throw Error(O(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Er(a.href),t=lr(r).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Er(a.href);var s=lr(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector(hl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Ha.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ha.set(e,s)),v2(r,e,s,c.state))),t&&i===null)throw Error(O(528,""));return c}if(t&&i!==null)throw Error(O(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=_r(a),t=lr(r).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(O(444,e))}}function Er(e){return'href="'+Va(e)+'"'}function hl(e){return'link[rel="stylesheet"]['+e+"]"}function m0(e){return je({},e,{"data-precedence":e.precedence,precedence:null})}function v2(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Qc]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[Qc]=!0,t.onload=t.onerror=Bv.bind(null,t),Mt(t,"link",a),xt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function _r(e){return'[src="'+Va(e)+'"]'}function ml(e){return"script[async]"+e}function mv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+Va(a.href)+'"]');if(i)return t.instance=i,xt(i),i;var r=je({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),xt(i),Mt(i,"style",r),Hc(i,a.precedence,e),t.instance=i;case"stylesheet":r=Er(a.href);var s=e.querySelector(hl(r));if(s)return t.state.loading|=4,t.instance=s,xt(s),s;i=m0(a),(r=Ha.get(r))&&Tp(i,r),s=(e.ownerDocument||e).createElement("link"),xt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Mt(s,"link",i),t.state.loading|=4,Hc(s,a.precedence,e),t.instance=s;case"script":return s=_r(a.src),(r=e.querySelector(ml(s)))?(t.instance=r,xt(r),r):(i=a,(r=Ha.get(s))&&(i=je({},a),Ep(i,r)),e=e.ownerDocument||e,r=e.createElement("script"),xt(r),Mt(r,"link",i),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(O(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Hc(i,a.precedence,e));return t.instance}function Hc(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Tp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Ep(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Uc=null;function pv(e,t,a){if(Uc===null){var i=new Map,r=Uc=new Map;r.set(a,i)}else r=Uc,i=r.get(a),i||(i=new Map,r.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[rl]||s[Ct]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function zm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function y2(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function gv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function p0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function g0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function fv(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=g0(t),e.suspenseyImages.push(t)),e=x2.bind(e),t.decode().then(e,e))}function w2(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=Er(i.href),s=t.querySelector(hl(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Ws.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,xt(s);return}s=t.ownerDocument||t,i=m0(i),(r=Ha.get(r))&&Tp(i,r),s=s.createElement("link"),xt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Mt(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Ws.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var qc=0;function $2(e,t){return e.stylesheets&&e.count===0&&Bc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&Bc(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&qc===0&&(qc=62500*U5());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Bc(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>qc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function f0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Bc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Ws(){this.count--,f0(this)}function x2(){this.imgCount--,f0(this)}var fu=null;function Bc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,fu=new Map,t.forEach(N2,e),fu=null,Ws.call(e))}function N2(e,t){if(!(t.state.loading&4)){var a=fu.get(e);if(a)var i=a.get(null);else{a=new Map,fu.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,r),a.set(c,r),this.count++,i=Ws.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var Cr={$$typeof:un,Provider:null,Consumer:null,_currentValue:Ji,_currentValue2:Ji,_threadCount:0};function S2(e,t,a,i,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Zd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Zd(0),this.hiddenUpdates=Zd(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function b0(e,t,a,i,r,s,c,d,h,f,$,x){return e=new S2(e,t,a,c,h,f,$,x,d),t=1,s===!0&&(t|=24),s=sa(3,null,null,t),e.current=s,s.stateNode=e,t=Qm(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},Km(s),e}function v0(e){return e?(e=ir,e):ir}function y0(e,t,a,i,r,s){r=v0(r),i.context===null?i.context=r:i.pendingContext=r,i=fi(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=bi(e,i,t),a!==null&&(la(a,e,t),Rs(a,e,t))}function bv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Cp(e,t){bv(e,t),(e=e.alternate)&&bv(e,t)}function w0(e){if(e.tag===13||e.tag===31){var t=po(e,67108864);t!==null&&la(t,e,67108864),Cp(e,67108864)}}function vv(e){if(e.tag===13||e.tag===31){var t=$a();t=Dm(t);var a=po(e,t);a!==null&&la(a,e,t),Cp(e,t)}}var zr=!0;function k2(e,t,a,i){var r=ee.T;ee.T=null;var s=Ce.p;try{Ce.p=2,zp(e,t,a,i)}finally{Ce.p=s,ee.T=r}}function T2(e,t,a,i){var r=ee.T;ee.T=null;var s=Ce.p;try{Ce.p=8,zp(e,t,a,i)}finally{Ce.p=s,ee.T=r}}function zp(e,t,a,i){if(zr){var r=Am(i);if(r===null)bh(e,t,i,bu,a),yv(e,i);else if(C2(r,e,t,a,i))i.stopPropagation();else if(yv(e,i),t&4&&-1<E2.indexOf(e)){for(;r!==null;){var s=Mr(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=Xi(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-wa(c);d.entanglements[1]|=h,c&=~h}vn(s),(Ee&6)===0&&(du=va()+500,dl(0,!1))}}break;case 31:case 13:d=po(s,2),d!==null&&la(d,s,2),Ou(),Cp(s,2)}if(s=Am(i),s===null&&bh(e,t,i,bu,a),s===r)break;r=s}r!==null&&i.stopPropagation()}else bh(e,t,i,null,a)}}function Am(e){return e=Hm(e),Ap(e)}var bu=null;function Ap(e){if(bu=null,e=Pi(e),e!==null){var t=al(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=kv(t),e!==null)return e;e=null}else if(a===31){if(e=Tv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return bu=e,null}function $0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Bx()){case Mv:return 2;case Ov:return 8;case Xc:case jx:return 32;case Vv:return 268435456;default:return 32}default:return 32}}var Rm=!1,$i=null,xi=null,Ni=null,el=new Map,tl=new Map,si=[],E2="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function yv(e,t){switch(e){case"focusin":case"focusout":$i=null;break;case"dragenter":case"dragleave":xi=null;break;case"mouseover":case"mouseout":Ni=null;break;case"pointerover":case"pointerout":el.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":tl.delete(t.pointerId)}}function ws(e,t,a,i,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},t!==null&&(t=Mr(t),t!==null&&w0(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function C2(e,t,a,i,r){switch(t){case"focusin":return $i=ws($i,e,t,a,i,r),!0;case"dragenter":return xi=ws(xi,e,t,a,i,r),!0;case"mouseover":return Ni=ws(Ni,e,t,a,i,r),!0;case"pointerover":var s=r.pointerId;return el.set(s,ws(el.get(s)||null,e,t,a,i,r)),!0;case"gotpointercapture":return s=r.pointerId,tl.set(s,ws(tl.get(s)||null,e,t,a,i,r)),!0}return!1}function x0(e){var t=Pi(e.target);if(t!==null){var a=al(t);if(a!==null){if(t=a.tag,t===13){if(t=kv(a),t!==null){e.blockedOn=t,Yf(e.priority,function(){vv(a)});return}}else if(t===31){if(t=Tv(a),t!==null){e.blockedOn=t,Yf(e.priority,function(){vv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function jc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Am(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);Vh=i,a.target.dispatchEvent(i),Vh=null}else return t=Mr(a),t!==null&&w0(t),e.blockedOn=a,!1;t.shift()}return!0}function wv(e,t,a){jc(e)&&a.delete(t)}function z2(){Rm=!1,$i!==null&&jc($i)&&($i=null),xi!==null&&jc(xi)&&(xi=null),Ni!==null&&jc(Ni)&&(Ni=null),el.forEach(wv),tl.forEach(wv)}function xc(e,t){e.blockedOn===t&&(e.blockedOn=null,Rm||(Rm=!0,ft.unstable_scheduleCallback(ft.unstable_NormalPriority,z2)))}var Nc=null;function $v(e){Nc!==e&&(Nc=e,ft.unstable_scheduleCallback(ft.unstable_NormalPriority,function(){Nc===e&&(Nc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],r=e[t+2];if(typeof i!="function"){if(Ap(i||a)===null)continue;break}var s=Mr(a);s!==null&&(e.splice(t,3),t-=3,Kh(s,{pending:!0,data:r,method:a.method,action:i},i,r))}}))}function Ar(e){function t(h){return xc(h,e)}$i!==null&&xc($i,e),xi!==null&&xc(xi,e),Ni!==null&&xc(Ni,e),el.forEach(t),tl.forEach(t);for(var a=0;a<si.length;a++){var i=si[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<si.length&&(a=si[0],a.blockedOn===null);)x0(a),a.blockedOn===null&&si.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var r=a[i],s=a[i+1],c=r[ua]||null;if(typeof s=="function")c||$v(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[ua]||null)d=c.formAction;else if(Ap(r)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),$v(a)}}}function N0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function Rp(e){this._internalRoot=e}Iu.prototype.render=Rp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(O(409));var a=t.current,i=$a();y0(a,i,e,t,null,null)};Iu.prototype.unmount=Rp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;y0(e.current,2,null,e,null,null),Ou(),t[Rr]=null}};function Iu(e){this._internalRoot=e}Iu.prototype.unstable_scheduleHydration=function(e){if(e){var t=qv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<si.length&&t!==0&&t<si[a].priority;a++);si.splice(a,0,e),a===0&&x0(e)}};var xv=Nv.version;if(xv!=="19.3.0")throw Error(O(527,xv,"19.3.0"));Ce.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(O(188)):(e=Object.keys(e).join(","),Error(O(268,e)));return e=Ax(t),e=e!==null?Ev(e):null,e=e===null?null:e.stateNode,e};var A2={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ee,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&($s=__REACT_DEVTOOLS_GLOBAL_HOOK__,!$s.isDisabled&&$s.supportsFiber))try{nl=$s.inject(A2),ya=$s}catch{}var $s;_u.createRoot=function(e,t){if(!Sv(e))throw Error(O(299));var a=!1,i="",r=nw,s=iw,c=ow;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=b0(e,1,!1,null,null,a,i,null,r,s,c,N0),e[Rr]=t.current,xp(e),new Rp(t)};_u.hydrateRoot=function(e,t,a){if(!Sv(e))throw Error(O(299));var i=!1,r="",s=nw,c=iw,d=ow,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=b0(e,1,!0,t,a??null,i,r,h,s,c,d,N0),t.context=v0(null),a=t.current,i=$a(),i=Dm(i),r=fi(i),r.callback=null,bi(a,r,i),a=i,t.current.lanes=a,ol(t,a),vn(t),e[Rr]=t.current,xp(e),new Iu(t)};_u.version="19.3.0"});var E0=an((JS,T0)=>{"use strict";function k0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(k0)}catch(e){console.error(e)}}k0(),T0.exports=S0()});var Y0=an(Bu=>{"use strict";var _2=Symbol.for("react.transitional.element"),H2=Symbol.for("react.fragment");function G0(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:_2,type:e,key:i,ref:t!==void 0?t:null,props:a}}Bu.Fragment=H2;Bu.jsx=G0;Bu.jsxs=G0});var Vp=an((sk,X0)=>{"use strict";X0.exports=Y0()});var m=Kl(Fl()),f1=Kl(E0());function R2(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let f=r.join(`
`).trim();f&&s.push(f),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var M2=['"',"'","\u201D","\u2019","\xBB","\u300D"],O2=['"',"'","\u201C","\u2018","\xAB","\u300C"];function C0(e){let t=e.trim();return M2.includes(t.slice(-1))&&O2.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function z0(e,t){let a=R2(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let f=t[h];if(f.kind==="untagged"){r.push(a[h]),s.push(d),c.push(f.expression??null),d=[];continue}let $={register:f.kind==="whisper"?"whisper":"side",text:f.text,...f.target?{target:f.target}:{}};r.length?s[s.length-1].push($):d.push($)}return r.length===0?i():{paragraphs:r,asides:s,expressions:c}}var V2="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function fo(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp(V2,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:fo(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:fo(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:fo(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:fo(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:fo(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:fo(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function A0(e){return fo(e,0)}function Yn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function R0(e){return e===null||typeof e=="string"}function M0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Hu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function D2(e){return e===null?!0:Yn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function I2(e){if(!Yn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Hu(e.capabilities)||!Yn(e.presentation)||!Yn(e.occupancy)||!Yn(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return D2(t.image)&&M0(t.x)&&M0(t.y)&&typeof a.playerHome=="boolean"&&R0(a.residentCharacterId)&&R0(a.homeKind)&&typeof i.condition=="string"&&Hu(i.upgrades)&&Hu(i.furniture)&&Hu(i.publicFacts)&&typeof i.updatedAt=="string"}function O0(e){if(!Yn(e)||!Yn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(I2),i=Array.isArray(e.venueRequests)?e.venueRequests:[],r=i.filter(s=>Yn(s)&&typeof s.id=="string"&&Yn(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function V0(e,t,a){return e==="Enter"&&!t&&!a}function Uu(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function D0(e,t,a,i){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(i,r)}function Hr(e,t){return t?.roomId===e}function I0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function _0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function H0(e,t,a){let i=a==="front"?"front":"side",r=e.find(s=>s.view===i&&s.label===t)??e.find(s=>s.view===i&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return r?{image:r,mirrored:r.view==="side"&&a==="left"}:null}function U0(e,t,a){let i=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<r)}function q0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Ri=(e,t,a)=>Math.min(a,Math.max(t,e));function qu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Mp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,qu(e,t)),s=e.width*i*r,c=e.height*i*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:Ri(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:Ri(h,t.height-c,0),width:s,height:c}}function B0(e,t,a,i,r,s){let c=Mp(e,t,a);if(!c.width||!c.height)return a;let d=qu(e,t),h=Ri(a.zoom*s,d,Math.max(4,d*2)),f=h/Math.max(a.zoom,d),$=c.width*f,x=c.height*f,g=(i.x-c.left)/c.width,b=(i.y-c.top)/c.height,A=r.x-g*$,C=r.y-b*x;return{zoom:h,centerX:Ri((t.width/2-A)/$,0,1),centerY:Ri((t.height/2-C)/x,0,1)}}function j0(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((Ri(e,a,i)-a)/(i-a))}function L0(e,t){return t?Math.max(1,e):e}function Op(e,t,a){let i=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,f=h+s<=t.height?h:d-r-s;return{left:Ri(c,i,t.width-i),top:Ri(f,0,Math.max(0,t.height-s))}}var o=Kl(Vp()),n="marinara-capability-villages",Q0="marinara-capability-villages-styles",U2="/api/villages",q2=.7,Yp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Dp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),B2={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},wo=e=>Yp.find(t=>t.value===e),j2=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,Z0={roads:"auto",structures:"auto",water:"auto"},ju=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],P0=1,Ip=3,L2={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},_p="__villages_image_disabled__",Xu=["neutral","happy","sad","angry","surprised","thinking"];function K0(e,t,a,i,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function G2(e){let t=[];for(let a of e){let i=t[t.length-1];i&&i.label===a.dateLabel?i.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var b1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function Lu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function Y2(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${r}m left`:`${r}m left`}function X2({library:e,busy:t,onRefresh:a,onForget:i}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,f]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[g,b]=(0,m.useState)(""),A=Date.now(),C=(v,k)=>(!h.trim()||`${v} ${k.map(V=>V.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||k.some(V=>V.id===c)),M=(e?.recollections??[]).filter(v=>C(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>C(v.text,[...v.subjects,...v.knownBy])),y=async(v,k)=>{try{let V=await D(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:V.visit,lineIds:k}),b("")}catch(V){x(null),b(q(V,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${n}-memory-library`,children:[(0,o.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,k])=>(0,o.jsx)("button",{type:"button","data-active":r===v,onClick:()=>s(v),children:k},v))}),(0,o.jsx)("input",{type:"search",value:h,onChange:v=>f(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:v=>d(v.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,o.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&M.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:M.map(v=>{let k=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:Y2(v.expiresAt,A)})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:Lu(v.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:Lu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,o.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{y(k.visitId,k.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&r!=="passing"&&w.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:w.map(v=>(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:v.memoryCategory?b1[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[v.dateLabel,Xp(v)?` \xB7 ${Xp(v)}`:""]})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:Lu(v.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:Lu(v.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[v.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(r!=="durable"&&M.length||r!=="passing"&&w.length)===0?(0,o.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,g?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:g}):null,$?(0,o.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:v.name||"Player"}),(0,o.jsxs)("small",{children:[Qu(v.at)," \xB7 heard by"," ",v.heardBy.map(k=>$.visit.participants.find(V=>V.characterId===k)?.name??k).join(", ")||"no one"]})]}),qr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Qu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":x1.format(t)}function Xp(e){return Qu(e.occurredAt)}function Q2(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function J0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Hp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var Z2=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function P2(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${Z2.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function K2(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?St(a,t.spaceClass).image:null)?.url??"":""}var Qp=class extends m.Component{constructor(){super(...arguments);rf(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},J2=`
/*
  THE TAB'S OWN SIZES, DECLARED ONCE AND READ EVERYWHERE.

  Two of them: the padding a screen keeps from its own edge, and the gap between
  the things on it. Those are the two that have to answer to the room the tab was
  given, because a phone has a third of the height a monitor has and cannot afford
  the same margin twice over. Both are written so that a wide, tall tab gets
  exactly the numbers this sheet was tuned against before there was a scale at all
  \u2014 1.25rem and 1rem \u2014 and simply gets less when there is less.

  What is deliberately NOT here is the type. Every font-size in this sheet stays
  the size it has always been, on every device. GachaForge shrinks its type with
  its frame because its game is a 16:9 stage that has to fit inside the box
  whole, and words that do not shrink with the picture do not fit the picture.
  This tab is a panel and not a stage: its prose wraps and its lists scroll, and
  a list that scrolls is not improved by being printed smaller. Twelve-pixel body
  text is as legible on a phone as it is on a monitor, and what a phone actually
  needs is its room back \u2014 which is what the fullscreen toggle on the map and the
  queries at the foot of this sheet are for.

  0.4.45 took the word "landscape" out of that sentence, and out of one more in
  this sheet, and put nothing in its place. The tab is drawn for whichever way up
  a phone is held now, so the size a phone is told to print at no longer has a
  side to it; see the PORTRAIT block at the foot of the sheet for what replaced
  the instruction to turn over.

  Both numbers are measured against the TAB rather than the window: the tab
  shares the screen with the Engine's own furniture and takes the whole screen in
  fullscreen, and a window query cannot tell those two apart.
*/
.${n}-root {
  --${n}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${n}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${n}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${n}-pad);
  color: var(--foreground);
}
.${n}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${n}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${n}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${n}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${n}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${n}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${n}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${n}-avatar {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto; width: 2.25rem; height: 2.25rem;
  border-radius: 999px; border: 1px solid var(--border);
  background: var(--background);
  font-size: .875rem; font-weight: 600;
  overflow: hidden;
}
/* The circle is the frame, so the picture gives up its own shape to it rather
   than the frame growing around whatever the Engine happened to store. The
   card's own avatar crop is drawn on top of this by the picture's own styles \u2014
   see avatarCropStyle \u2014 which is why the frame is what clips it: a framing is
   drawn by enlarging the picture and pushing the rest of it out of the box, and
   a box that did not clip would be a frame with the whole photograph still
   around it. A crop in the older zoom-and-offset format is a transform on this
   same picture, and one in the current format replaces this rule's geometry
   outright; both end up framed by the circle and neither needs a second rule. */
.${n}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
/*
  The Engine's own person mark, for the one face in this drawer that is nobody's
  picture.

  It is what the Engine draws for the player in its own chats, and it is here
  rather than an initial for the reason an initial is right for a villager and
  wrong for the player: a villager's name is on the map in front of the player,
  and the player's is whatever they called themselves in the wizard, in whatever
  language, possibly one word and possibly five, said in a village that may know
  them by something else entirely. A letter off the front of that is a guess about
  which word a person goes by, and the person mark guesses nothing at all. The
  AvatarFace component draws it.

  Sized in em rather than in rem so that it takes the frame's own scale: the two
  frames here set their own font-size for the initial they used to draw, and a
  mark that read against that initial is one that reads in both. It is drawn a
  little larger than the initial beside it because a line drawing with air inside
  it reads smaller than a block of type at the same measure. The stroke is
  currentColor and the path is filled nowhere, so the mark takes the frame's own
  colour the way a picture would have taken its own.
*/
.${n}-person { width: 1.5em; height: 1.5em; }
.${n}-villager-name { font-size: .8125rem; font-weight: 600; }
.${n}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${n}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${n}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-actions { display: flex; align-items: center; gap: .625rem; }
.${n}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${n}-button:hover { border-color: var(--primary); color: var(--primary); }
.${n}-button:disabled { opacity: .6; cursor: default; }
.${n}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${n}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${n}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${n}-menu-group > .${n}-panel-title { margin: 0; }
.${n}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${n}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${n}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${n}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${n}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${n}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${n}-roster-row > .${n}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${n}-status { font-size: .75rem; color: var(--muted-foreground); }
.${n}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${n}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${n}-tile:hover { border-color: var(--primary); }
.${n}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${n}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${n}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${n}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${n}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${n}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${n}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${n}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${n}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${n}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${n}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${n}-picker-item[data-resident="true"] { opacity: .6; }
.${n}-picker-text { flex: 1 1 auto; min-width: 0; }
/*
  A villager's conversation, as a Visual Novel stage over the whole map.

  IT USED TO BE A DRAWER DOWN THE RIGHT-HAND SHARE, and the shape changed because
  the Engine's own roleplay chats have a Visual Novel presentation and this is the
  village's version of it: the picture fills the tab, the villager stands in it,
  and the words are read a paragraph at a time in a card held just above the box
  the player types in. A card of that kind needs the width the whole tab has \u2014
  the whole point of it is one paragraph set at a comfortable measure, and a
  paragraph in two fifths of a phone is a column of single words.

  It is still parked off the right edge and slides in rather than appearing, and
  the reason has not changed: the map is never resized out from under the pins
  just because the player started talking to somebody. Absolute positioning rather
  than fixed keeps it inside the tab \u2014 fixed would escape to the viewport and
  leave the Engine's own furniture behind \u2014 and the homepage's overflow: hidden
  is what clips the parked position. visibility is what takes the shut stage out
  of the tab order and the accessibility tree, since a translated box is still on
  the page.

  NO BORDER, NO RADIUS AND NO WIDTH, because it is the tab: a panel with an edge
  inside a tab that also has an edge is a picture in a frame inside a frame. The
  padding stays, and it is what the picture bleeds past \u2014 the stage layer is
  inset to this box, so the map behind the words runs to the tab's own edge
  rather than stopping a gutter short of it.

  The fill is still the theme's popover, because the layer above it \u2014 the head,
  the reader and the composer \u2014 is drawn over the picture in that colour at an
  opacity, and a picture with no fill under it would be a picture over whatever
  happened to be behind the tab.
*/
.${n}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${n}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${n}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${n}-room-screen > .${n}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${n}-room-screen .${n}-chat-scene { pointer-events: none; }
.${n}-room-screen .${n}-chat-head {
  align-items: center;
}
.${n}-room-screen .${n}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${n}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${n}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${n}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${n}-room-star > span:nth-child(2) { flex: 1; }
.${n}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${n}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${n}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${n}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${n}-chat, .${n}-chat[data-open="true"] { transition: none; }
}
/*
  THE PICTURE IS THE GROUND FLOOR, and everything else is a layer drawn over it.

  The stage is taken out of the column and pinned to the whole tab, so it is not
  a flex row's child any more and it reserves no height at all: the head, the
  reading card, the way out and the composer lay themselves out as if the picture
  were not there, and the picture fills whatever space they leave. That is the
  whole difference between a stage and a column \u2014 the picture is BEHIND the words
  rather than beside them, which is what lets the words have the tab's full
  width.

  A positioned box paints over in-flow content, so every layer has to say that it
  is above the picture rather than rely on document order. The list is written
  once, here, rather than a z-index being repeated into each rule below: a layer
  added to the column later is one line in this selector list, and forgetting it
  is a layer that disappears behind the map rather than a subtle stacking bug,
  which is the kind of failure a list like this exists to make obvious.

  The child combinator rather than a descendant one, because several of these
  names \u2014 error, composer, the two panel classes \u2014 are drawn by the rest of the
  sheet as well, and a bare descendant selector would hand a stacking context to
  every one of them.

  The head is NOT in this list, and its absence is deliberate rather than an
  oversight: it is the floating top chrome and it carries its own, higher
  z-index in its own rule. Everything named here sits above the picture and below
  the chrome, which is the one ordering the whole sheet depends on.

  The way out is not in the list either, and its absence is the other deliberate
  one rather than a second oversight: it is not a row of this column any more.
  It is drawn inside the bottom stack and pinned to the top of it, so it is
  already above the picture by being above the reading \u2014 see its own rule.
*/
.${n}-chat > .${n}-chat-stage,
.${n}-chat > .${n}-chat-activities,
.${n}-chat > .${n}-chat-vn,
.${n}-chat > .${n}-chat-confirm,
.${n}-chat > .${n}-error,
.${n}-chat > .${n}-room-error,
.${n}-chat > .${n}-composer,
.${n}-chat > .${n}-chat-ended { position: relative; z-index: 1; }
/*
  THE TOP CHROME, floating over the picture.

  It used to be a row in the column with a wash of its own behind it \u2014 a header,
  in other words \u2014 and it is now a bar laid over the stage, which is what the
  Engine's own roleplay surface does with the top of its chats: the picture runs
  to all four edges of the tab and everything the tab has to say is drawn on top
  of it.

  pointer-events: none on the bar and auto on its children, because a bar that
  spanned the tab and swallowed presses would be a bar that took the room away
  from the player: the badge is a thing to read, and the only thing in here to
  press is the options button at the far end.

  The wash the row used to wear is gone with the row, and it has not been
  replaced by nothing: each thing in here carries its own surface, which is the
  statement the Engine makes in the same place \u2014 its top chrome is a row of
  individually surfaced controls rather than a plate across the tab, so that the
  picture is visible between them.

  0.4.50 took the "right now" chip out of here and with it the last of the prose.
  What is left is one badge and one button, so the row no longer needs wrapping
  room and no longer competes with the reading for the top of the tab \u2014 see the
  note on the head itself. The badge is still first in the row and the button is
  still held at the far end by the auto margin on the actions beside it.
*/
.${n}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${n}-chat-head > * { pointer-events: auto; }
/*
  THE THREE DOTS, and everything the room can do behind them.

  There used to be a bare row of buttons here \u2014 End conversation and Forget, then
  the spin-off verb, then the debug pair \u2014 and it was read as a row of five equal
  things when only one of them was the player's ordinary way out. The Engine's
  own roleplay chats keep their commands behind a "..." in the corner, and this
  is the same control doing the same job: the room is not a toolbar, and the two
  presses a player makes in an hour should not be the two loudest things on the
  screen.

  NO BACKDROP and no focus trap, deliberately: the menu hangs off a button in the
  top chrome rather than covering the tab, and the paragraph the player was
  reading stays readable behind it. Closing it is one press anywhere else, or
  Escape \u2014 see the effect on the panel.
*/
.${n}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${n}-chat-menu-anchor { position: relative; display: inline-flex; }
/*
  The button itself, cut to the Engine's own toolbar button.

  The Engine keeps one shape for everything in the chrome \u2014 a control square, a
  rounded corner, a translucency over the picture and a blurred backdrop behind
  the translucency \u2014 and this is that shape, in the Engine's own chrome tokens.
  Those are declared on the document root, so they arrive here already resolved
  for whatever theme the Engine is wearing; the fallbacks beside them are what
  keeps the button drawn if a name is ever missing.

  The narrow-container step to a slightly larger square is an override at the end
  of the sheet, where the container queries live, because it is a change of size
  rather than a second button.
*/
.${n}-chat-menu-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: .5rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${n}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${n}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${n}-chat-tool:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
/*
  The popover, modelled on the tracker menu so there is one popover in this
  package rather than two that look almost the same.

  It is bounded in both directions and scrolls inside that bound. Its height is
  the reason: this list is the longest one in the tab now \u2014 four verbs, the way
  between the two ways of reading, and a debug group \u2014 and on a phone held
  sideways an unbounded one would be taller than the tab it hangs off. cqh rather
  than vh, because the container is the tab the Engine drew and not the window:
  in fullscreen those are two different boxes, and it is the tab this menu has to
  fit in.

  The surface is the Engine's own panel, in the Engine's own tokens, so that a
  popover and the button it hangs off are cut from one cloth. It used to be the
  theme's popover colour, which was the right surface for a menu inside a header
  row and is the wrong one for a menu hanging off a translucent control over a
  photograph: the panel tokens already carry the blur-friendly opacity and the
  accent-tinted edge that keep the two reading as a pair.
*/
.${n}-chat-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 19rem; max-width: min(19rem, 82cqw);
  max-height: min(26rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${n}-chat-menu-note {
  margin: 0; font-size: .6875rem; line-height: 1.5;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
/*
  Ending is the ordinary way out and forgetting is the rare, total one, so the
  pair is drawn as a plain button and a red one rather than as two buttons of
  equal weight. Forget is RED because it is a debug action: nothing a player of
  this game is meant to be able to do leaves the village with no memory of a
  conversation that happened, and the colour is the part of that statement a
  player reads before they read the words.

  Both are drawn full width in the menu, because a menu is a list of things to
  press and a ragged cluster of differently sized ones is a list nobody scans.
*/
.${n}-chat-menu .${n}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  DEBUG. The two fixture controls, at the foot of the menu behind a rule.

  A different promise from the pair above them, which belongs to the conversation
  and comes and goes with it: these two are a fixture of the tab while it is being
  worked on, so they are drawn whatever the phase, whatever the card, and whether
  or not anybody has said a word. Nothing about them is conditional, and that is
  the point \u2014 a control that is only sometimes there is a control that has to be
  looked for.

  The rule above them is the whole of what marks them apart. They used to be
  pushed to the far end of a header row, which is where a second claim on the
  space is made; in a menu the same statement is made by a divider, because the
  menu is already the corner and there is no further end to push anything to.
*/
.${n}-chat-debug {
  display: flex; flex-direction: column; gap: .375rem;
  margin-top: .125rem; padding-top: .5625rem; border-top: 1px solid var(--border);
}
/*
  The last press, floating over the room just above the box.

  A room the village has already remembered wears End conversation here, and it
  is the only control of its kind on the screen: the first press \u2014 Leave this
  conversation, which 0.4.49 moved into the menu under the box \u2014 is what spends
  the goodbye and files the memory away, and this is what closes the drawer
  afterwards. A player who sees it has finished rather than being asked to
  confirm something they did a second ago.

  The rooms with no ending to give draw Close in the same slot: the one whose
  villager could not be reached at all. Neither name is a lie about what pressing
  it does \u2014 it closes the drawer and releases the map.

  It is drawn as CHROME rather than as a message, and that is one of the two
  things 0.4.49 changed about it. It used to be a plate centred between the
  reading and the box with a message's own padding on it, and the padding was the
  mistake: a button with a message's insides reads as part of what somebody said,
  and a way out is not something anybody said. So it wears the Engine's own
  toolbar surface \u2014 the translucent chip, the blurred backdrop, the pill radius,
  the shadow \u2014 and nothing is drawn behind it.

  AND IT FLOATS, which is the other thing. It is a child of the bottom stack and
  it hangs off the TOP of it, so it is over the room rather than in a row of the
  column: the reading and the box keep the position they have in every other
  room, and all this state adds is a chip over the room above them. A row of its
  own \u2014 which is what it was \u2014 pushed the card up the room for as long as it was
  drawn, and a room that moves because a button appeared is the one thing this
  drawer's reading is not allowed to do.

  It hangs off the bottom stack rather than sitting in a corner, and that is the
  Visual Novel's own arrangement rather than a preference: the reading is the
  card and the history is a pane the player opens, so there is no log to write a
  button into, and one written into the transcript would come and go with the
  history instead of sitting where the reading ends.

  WHO sees it was narrowed in the same release \u2014 see showFoot. It used to be
  drawn for anything that was not mid-answer, which included a room whose card is
  gone, where the head already carries the same press, and a room whose villager
  is still finding their first line.
*/
.${n}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${n}-chat-end > .${n}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${n}-chat-end > .${n}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${n}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about \u2014 a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button \u2014 and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${n}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${n}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${n}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${n}-image-recommendation { color: #d68a18; }
/*
  Where the composer was, once the conversation has been ended.

  Everything that could still say something to a villager who has been left is
  taken off the screen rather than disabled: a row of greyed-out verbs would be
  an invitation to keep talking to somebody who has already been said goodbye
  to, and the one thing left to do with a conversation that has been remembered
  is close it. The box is hidden rather than unmounted so the half-written
  sentence in it survives, which is the same promise the Fulfill verb makes.

  dashed rather than solid, because this is not a control: it is the drawer
  saying it is finished with the player.
*/
.${n}-chat[data-ended="true"] .${n}-composer { display: none; }
/*
  And the same hiding, for the two states of an opening that has not landed.

  The scene opens first, so while its first moment is being written there is
  nothing to answer: the box would take a sentence the player cannot send, and
  every verb above it would be a greyed-out version of itself. Hiding rather than
  unmounting keeps the half-written line in the box across a retry that succeeds,
  which is the same promise the ended state above makes, and it keeps the change
  to one property.

  failed hides it for a different reason: there is no conversation. Nothing was
  written down, the order of the room was never established, so the only control
  on offer is the one that gets the player out.

  Both rules sit BELOW the ended rule rather than beside it because the ended
  state is the one that matters when they could overlap, and they are separate
  selectors rather than one list so that each keeps its own reason.
*/
.${n}-chat[data-greeting="writing"] .${n}-composer { display: none; }
.${n}-chat[data-greeting="failed"] .${n}-composer { display: none; }
.${n}-chat-ended {
  margin: 0; padding: .5rem .625rem; border: 1px dashed var(--border); border-radius: .5rem;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground); text-align: center;
}
/*
  THE ROOM, and the floor the villager stands on.

  The scene used to be a bounded column BESIDE the words, and it is the whole
  backdrop now: the picture of the place the villager is standing in runs to the
  tab's own edges and everything else in the aside is read over the top of it.
  That is the Engine's own Visual Novel shape, and it is the reason the card can
  be a card at all \u2014 a paragraph set at a comfortable measure needs the tab's
  full width, and two fifths of a phone is a column of single words.

  It keeps the muted plate the places list uses for a picture it does not have, so
  a place with no picture reads as a place with no picture rather than as a
  picture that failed: the same statement, made the same way, in both lists.
*/
.${n}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${n}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${n}-chat-scene-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); font-size: .85rem; text-align: center; padding: 1rem;
}
/*
  THE TWO LAYERS BETWEEN THE PICTURE AND THE WORDS.

  The Engine draws both of these over its own roleplay backdrop and this tab had
  neither, which is the whole of why its room read as a photograph with a card
  lying on it rather than as a stage:

  The scrim is a vertical wash of the theme's own background \u2014 dark in a dark
  theme, light in a light one \u2014 so it darkens the picture where the chrome sits
  and leaves it most visible in the middle. It is mixed rather than painted a
  fixed near-black, because a fixed near-black over a pale theme's map is a black
  band across a drawing rather than a photograph going into shadow, and the
  Engine's own light theme makes exactly the same substitution.

  The vignette is the other half of the same statement, around the edges instead
  of above and below: the eye is drawn to the middle of the room, and the corners
  of a photograph stop competing with the words laid over them. It is the
  Engine's own radius and the Engine's own opacity.

  Both are inside the scene rather than beside it because the scene is the layer
  that knows where the picture is, and neither is drawn for a place that has no
  picture \u2014 there is nothing to darken and nothing to frame.
*/
.${n}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${n}-chat-vignette {
  position: absolute; inset: 0; display: block;
  background: radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, #000 30%, transparent) 100%);
}
/*
  THE FLOOR, and it is a row of the tab rather than a layer on the stage.

  The villager used to stand at the head of the reading column, and the note that
  used to be here explained at length that this was the one place the tab departed
  from the Engine and that it departed for the length of a face. It was a real
  problem \u2014 the Engine's sprite is a whole body, so a card across its shins still
  leaves a head thirty centimetres above the card, and ours is a square crop
  whose chin is not far below its eyes \u2014 but standing the figure in the reading
  column answered it by putting the villager inside the words, which is the one
  thing a Visual Novel stage is for.

  So the figure is on the floor, the way the Engine's is, and the problem is
  answered by the floor being the right size rather than by moving the person. The
  floor is this row, and the figure stands on the bottom of it and grows upward. It
  cannot be walked over by the card, because the card is not in this row \u2014 and on a
  tab with almost no height left it shrinks like a sprite rather than being clipped
  like one.

  The floor CLAIMS a share of the tab and yields proportionally when the tab cannot
  pay it. A flex-basis of 34cqh is the same share the figure is allowed to ask for;
  a shrink factor of 1 is what lets a tab with a long paragraph in it take the
  shortfall off the floor and off the card together rather than off one of them
  alone. A floor that took only what was LEFT OVER \u2014 flex-basis auto, which is what
  this rule used to say \u2014 is paid last and can be paid nothing, and that is how a
  figure ends up standing above the top edge of the tab with its head cut off.

  container-type: size is what lets the figure ask the FLOOR how tall it is instead
  of asking the tab and hoping the arithmetic comes out. Every cq unit inside this
  row is the row's own square from here on, which is why the figure's height share
  is 100cqh below rather than a number tuned against the chrome around it. The
  price is stated plainly: the floor's size no longer answers to its contents, so
  neither the figure nor the plate can push the row outward. That is the point \u2014 it
  is why the figure is allowed to shrink at all \u2014 and it is also why the row needs
  a basis of its own rather than a basis of its content.

  It comes BEFORE the bottom stack in the document, and it is the bottom stack
  that is drawn last, so the order the layers paint in is the order the room reads
  in whether or not every rule's z-index survives a future edit.

  0.4.49 makes the floor GROW as well as shrink, and that is the difference
  between a stage and a block at the top of the tab. The card and the composer
  both have ceilings of their own, so on a tab taller than 34cqh the share the
  floor claimed was all it ever took and the rest of the tab sat empty under the
  card: measured at 1200x800 the row was 272 pixels and the 240 under the composer
  were nobody's. A grow factor of 1 hands that slack back to the row, which is what
  puts the room over the whole tab with the card and the box laid out at the foot
  of it.

  It is also the foundation the spritesheet is going to be drawn on. A villager is
  a framed square crop today, and a full-body sprite is the art that is coming; the
  row it will stand in is now the row the tab actually has rather than a fixed
  share of it, so the ground a sprite will need already belongs to the figure's row
  and nothing about the card, the composer or the chrome has to move again to make
  room for it.
*/
.${n}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${n}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${n}-chat-activity {
  padding: .15rem .4rem; border-radius: .4rem;
  background: color-mix(in srgb, var(--background) 80%, transparent);
}
/*
  THE BOTTOM STACK: the tab, the card, and the whole of the reading.

  One block, directly above the composer, with its contents justified to the end
  so that the card always sits on the box the player types in. That is the
  Engine's own arrangement \u2014 its visual-novel card is pinned to the bottom of the
  input chrome and the room is what is left above it \u2014 and it is what makes the
  card's position stable: a card that floated up and down the tab with the length
  of the paragraph would be a different screen every turn.

  It is the flexible row, and the stage above it is the other one, so the two
  share what the tab has left between them. The card cannot grow into the stage
  because a card has its own ceiling \u2014 see the reading box \u2014 and neither can an
  open history, which is capped where it is declared.
*/
.${n}-chat-vn {
  flex: 0 1 auto; min-height: 0;
  display: flex; flex-direction: column; justify-content: flex-end; gap: .375rem;
}
/*  Square, and that is a requirement rather than a preference: the card's own
    framing of its picture is a square region of it, and the arithmetic that
    draws a framing \u2014 see avatarCropStyle \u2014 only lands undistorted on a frame
    of the same shape. A tall frame would show the same crop with the face
    stretched through it.

    Centred rather than stretched across the tab: it is a person standing in a
    room, and a person is not the width of a room.

    ONE width, and the square follows from it, which is what keeps the two
    dimensions from ever disagreeing. It is the smaller of a share of the tab's
    width and the room the floor actually has, because a figure that only answered
    width would eat a landscape tab's height \u2014 and the second term is measured
    against the FLOOR rather than against the tab, because the floor is a size
    container of its own. That is the whole answer to a short tab, and it is why
    the short-tab queries at the end of the sheet no longer carry a figure size of
    their own: the figure is exactly as big as the row it stands in, so it cannot
    stand above the top edge of the tab however little room the card and the
    composer have left it. The 2.5rem is the gap, the plate and the floor's own
    padding, spent so that the plate is not pushed off the bottom of the tab by a
    figure that filled the row.

    flex: 0 0 auto, because the stage is justified to its end and the plate below
    is the row that may give way. A shrinkable figure means a long place name
    squashes the face to buy the plate a line it did not need.

    0.4.49 raises the width share from 30cqw to 38cqw, and only because the floor
    now grows: the figure is capped by the row it stands in either way, and a row
    that owns the whole tab can afford a bigger person in it. What it is NOT is a
    spritesheet \u2014 a villager is still a square crop in a soft frame, at a size
    that leaves the room around them, and the extra room the floor now owns is
    what the full-body art is going to be drawn into. The radius, the border and
    the drop shadow below are the shape that art has to arrive in.
*/
.${n}-chat-figure {
  position: relative; z-index: 1;
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  width: min(38cqw, calc(100cqh - 2.5rem)); aspect-ratio: 1 / 1;
  border-radius: .625rem; border: 1px solid var(--border);
  background: var(--popover);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .35);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, .5));
  font-size: 1.5rem; font-weight: 600;
  overflow: hidden;
}
.${n}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${n}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${n}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${n}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
.${n}-sprite-editor { min-width: 0; border-top: 1px solid var(--border); padding: 1rem .125rem .25rem; margin-top: .625rem; display: grid; gap: .875rem; }
.${n}-sprite-heading, .${n}-sprite-section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .5rem 1rem; }
.${n}-sprite-heading h3 { margin: 0; font-size: 1.1rem; }
.${n}-sprite-heading p { margin: .25rem 0 0; color: var(--muted-foreground); font-size: .8125rem; }
.${n}-sprite-count { border: 1px solid var(--border); border-radius: 99rem; padding: .25rem .625rem; white-space: nowrap; font-size: .75rem; }
.${n}-sprite-views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.${n}-sprite-view { display: grid; gap: .2rem; min-width: 0; text-align: left; border: 1px solid var(--border); border-radius: .7rem; padding: .7rem .8rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; }
.${n}-sprite-view span { color: var(--muted-foreground); font-size: .75rem; }
.${n}-sprite-view[data-active="true"], .${n}-sprite-choice[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--popover)); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-sprite-section-head { color: var(--foreground); font-size: .8125rem; }
.${n}-sprite-section-head span { color: var(--muted-foreground); }
.${n}-sprite-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: .5rem; }
.${n}-sprite-choice { display: grid; justify-items: center; gap: .15rem; min-width: 0; border: 1px solid var(--border); border-radius: .65rem; padding: .4rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; text-transform: capitalize; }
.${n}-sprite-choice-art { display: grid; place-items: center; width: 100%; height: 6rem; border-radius: .4rem; background: color-mix(in srgb, var(--muted) 75%, transparent); color: var(--muted-foreground); font-size: 1.3rem; overflow: hidden; }
.${n}-sprite-choice-art img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${n}-sprite-choice small { color: var(--muted-foreground); font-size: .6875rem; text-transform: none; }
.${n}-sprite-selected { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem .75rem; font-size: .8125rem; text-transform: capitalize; }
.${n}-sprite-selected span { color: var(--muted-foreground); text-transform: none; }
.${n}-sprite-editor label { display: grid; gap: .25rem; font-size: .8125rem; }
.${n}-sprite-editor label.${n}-row { display: flex; align-items: center; }
.${n}-sprite-editor textarea { min-height: 5rem; }
.${n}-sprite-actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.${n}-sprite-candidate { display: grid; gap: .75rem; border: 1px solid var(--border); border-radius: .7rem; padding: .75rem; background: var(--popover); }
.${n}-sprite-candidate-views { display: flex; flex-wrap: wrap; gap: .75rem; }
.${n}-sprite-candidate-views > div { display: grid; gap: .25rem; justify-items: center; flex: 0 1 12rem; min-width: 0; font-size: .75rem; color: var(--muted-foreground); }
.${n}-sprite-candidate-views img { display: block; width: 100%; height: 14rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${n}-sprite-mirrored { transform: scaleX(-1); }
.${n}-sprite-more { border-top: 1px solid var(--border); padding-top: .5rem; }
.${n}-sprite-more summary { cursor: pointer; font-size: .8125rem; }
.${n}-sprite-more > .${n}-row { margin-top: .75rem; }
.${n}-sprite-view:focus-visible, .${n}-sprite-choice:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
/*
  THE ROOM'S OWN CAST, standing in the floor the villager stands in.

  A private conversation has one figure on the floor and the card repeats them a
  paragraph at a time. A room has everybody who was in it, and this is the same
  drawing made plural: the faces stand at the foot of the room as themselves
  rather than as the card's illustration of whoever happens to be talking.

  The ENGINE's own avatar frame is reused rather than a second frame at a second
  size, because the two things that frame has to do \u2014 clip a crop, and hold a
  person's initial \u2014 are done by that rule and would have to be copied to be done
  again. The row wraps, because a mill with six people in it is a mill with six
  people in it, and a row that overflowed the tab would push the plate off the
  bottom of it.
*/
.${n}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${n}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${n}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${n}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${n}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${n}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${n}-chat-cast-person > .${n}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${n}-chat-cast-person > span:not(.${n}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${n}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${n}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${n}-chat-cast-rest .${n}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${n}-room-screen .${n}-chat-activities { display: none; }
.${n}-room-screen .${n}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${n}-room-screen .${n}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${n}-room-screen .${n}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${n}-chat-scene-place {
  position: relative; z-index: 1; max-width: 100%;
  border-radius: 999px; padding: .1875rem .5rem;
  background: color-mix(in srgb, var(--popover) 88%, transparent);
  font-size: .6875rem; color: var(--foreground); text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  THE HISTORY, and the little tab that opens it.

  The log is the old transcript in a pane rather than in the tab's own flow: the
  villager's answers and the player's own lines, in order, in the bubbles they
  have always been drawn in, and the only change is that it is something the
  player OPENS rather than the only thing on screen. That is what the Engine's
  Visual Novel does, and it is why the card can show one paragraph at a time
  without the player losing the thread: the whole of the conversation is one press
  away, and it scrolls inside its own frame instead of growing the tab.

  It is capped in height rather than left to fill, and the cap is cqh for the
  same reason every other measurement in this sheet is: the container is the tab
  the Engine drew. What the cap buys is the stage \u2014 a history that grew to the
  ceiling of the tab would be a history with no room behind it, and the room is
  what the player is reading the conversation IN.

  READ ONLY, deliberately: nothing here can be edited, and the history is the
  village's own record of what was said rather than a draft.
*/
.${n}-chat-log {
  display: flex; flex-direction: column; gap: .5rem;
  flex: 0 1 auto; min-height: 6rem; max-height: min(52cqh, 28rem); overflow-y: auto;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem; padding: .5rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
/*
  THE LITTLE TAB, and it is the Engine's own.

  It used to be a labelled pill \u2014 a chevron and the words "Chat history" \u2014 and
  the words are the whole of what changed. The Engine's Visual Novel hangs a bare
  chevron the width of a thumb off the top of its card, and it can, because the
  card is directly under it and the thing being opened is obviously the history of
  the thing being read: the label was doing work the position had already done.

  The words are not gone, they are out of the way: the accessible name and the
  title still say "Show chat history" and "Return to Visual Novel" in both
  directions, so anything reading the tab aloud, and anything hovering it, is told
  exactly what the pill used to say.

  The shape is the Engine's shape, and the shape is the state: a tab rounded at
  the top and open at the bottom when the card is up, rounded at the bottom and
  open at the top when the history is, so the control and the thing it opened
  read as one object. The pseudo-element is the Engine's own trick \u2014 a hit area
  taller and wider than the drawing, so a 24-pixel tab is not a 24-pixel target
  on a phone.
*/
.${n}-chat-tab { display: flex; justify-content: center; }
.${n}-chat-history-toggle {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 1.5rem; padding: 0; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-bottom: 0; border-radius: .5rem .5rem 0 0;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer; font-family: inherit;
}
.${n}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${n}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${n}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${n}-chat-history-toggle[aria-expanded="true"] {
  margin-top: -1px;
  border-top: 0; border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: 0 0 .5rem .5rem;
}
/*
  THE READING CARD, and it is the Engine's visual-novel bubble.

  A surface of its own holding the speaker's face, the speaker's name and one
  paragraph of what they said, with the arrows under it to walk the rest. It is
  drawn at the FOOT of the stack, directly above the composer, because that is
  where the eye already is at the end of a turn \u2014 the player looks down at the box
  they type in, and the answer arrives just above it.

  The face and the name are the two things this card did not have and the Engine's
  has. A card that shows a paragraph of somebody's speech without saying who is
  speaking is a card that only works while there is a heading above it saying the
  same thing \u2014 and the heading is gone, because the Engine has no heading: it has
  a card with a face in it, which is the same statement made where the player is
  already looking.

  It is the ENGINE'S OWN double structure that puts the face in two places at
  once, and it is worth being plain about it: the Engine stands a sprite on the
  stage floor AND draws a square portrait in the card, because those are two
  different pictures \u2014 a body and a head. A village has one picture per villager,
  so both frames show it, and the one on the floor is the one the card is read
  across. The card's is the one that is always fully visible.

  THE PADDING IS ON THE ROW, not on the card, and that is the Engine's own
  structure rather than a preference: the Engine's plate holds a padded dialogue
  block and then a rule with the arrows in it, so the rule reaches both edges of
  the surface while the face and the words are held in from them. Padding on the
  card would inset the rule as well and draw a short line across the middle of the
  plate, which is a divider between nothing and nothing.
*/
.${n}-chat-vn-card {
  display: flex; flex-direction: column;
  flex: 0 1 auto; min-height: 0; overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 94%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .4);
}
/*
  The row and the column are the two boxes the reading shrinks inside of.

  flex-start on the row would size the column to its own content, and a box whose
  size IS its content is a box whose child cannot be made smaller than it \u2014 so the
  column stretches to the row instead and the reading is what gives way. That is
  the order the card yields in, and it is worth stating: the paragraph first, the
  arrows never. A paragraph is the one part of a card that can be scrolled, and a
  clipped arrow is a control the player cannot press at all.
*/
.${n}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${n}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${n}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${n}-chat-vn-name {
  margin: 0; min-width: 0;
  font-size: .875rem; font-weight: 600; line-height: 1.3;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  The paragraph, in a box with a ceiling on it.

  This is the one place the card CANNOT be allowed to grow, and the number is the
  Engine's own: min(30dvh, 18rem) there, min(30cqh, 18rem) here, for the reason
  every other measurement in this sheet is in cqh \u2014 the container is the tab, and
  in fullscreen the tab and the window are two different boxes. Thirty percent of
  the tab is where a long answer stops pushing the card up the screen and starts
  scrolling inside it, which is what keeps the figure on the floor visible and
  the composer where the player left it.

  That ceiling keeps the card from GROWING, and flex: 0 1 auto is what lets it
  SHRINK: a short tab takes its height off the paragraph rather than off the arrows
  under it, and the reading is the one box in the card that can give that height up
  without reading as broken.
*/
.${n}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${n}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${n}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${n}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${n}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
/*
  THE TWO REGISTERS OF A BEAT, and they are the Engine's own.

  A villager's turn is two things at once: what they SAY, and the room going on
  around them. Game Mode draws those as two registers in one window, and what
  separates them is ATTRIBUTION rather than decoration:

    - somebody speaking is drawn under their own face and their own name
    - the room describing itself is drawn under the word NARRATION and a bubble
      with no face over it at all. The Engine's own comment on that branch is
      "no avatar", and the pill below is its pill, copied to the values:
      rounded-full, the muted wash, .625rem, uppercase, wide tracking.

  0.4.56 got the second one wrong, and the mistake is worth naming rather than
  only fixing. The description was drawn in a bubble INSIDE the speaking
  register \u2014 under the villager's name and under the villager's face \u2014 which
  reads as that villager having said it, quietly. The words were in the right
  place on the card and attributed to the wrong speaker.

  So the label below is the fix, and it is a register of its own rather than an
  extra: the head of the card carries the speaker's name OR the word NARRATION
  and never both, because a beat belongs to whoever spoke it or to the room, and
  to nothing in between. The bubble underneath is the room's, drawn with nobody
  standing behind it \u2014 see the chat-vn-beat rule below, which is the bubble and
  no longer the whole register.

  This is the SHAPE of a beat, and deliberately not its line TYPE. The Engine's
  stage draws three more registers beside speech \u2014 something said across a room,
  something said to one listener, and somebody's private thought \u2014 and a village
  with one villager in the room can produce none of them. data-register is
  therefore this tab saying which of the two drawings it used, and the line
  types arrive with the room that can produce one: "side" for something said
  aloud to everybody present, "whisper" for something said to one listener, and
  "thought" if a room ever wants it.

  THE LINE TYPES HAVE ARRIVED \u2014 the first two of them, and as a stored field
  rather than as a second read of the words. The package's own turn reader takes
  a side tag or a whisper tag with a listener's name off the front of a line,
  stores the register beside the prose, and writes the content with the tag taken
  off, so a message can now arrive knowing two things a paragraph shape cannot
  describe: a remark said aloud but not offered to whoever is in front of them,
  and something said to one listener alone. Both of those are ordinary sentences
  and there is no punctuation that makes them otherwise \u2014 which is exactly why
  the villager marks them and why the client must not guess.

  So data-register now carries four names rather than two, and it lives on the
  CARD rather than on the bubble. That is the whole reason for the move: the
  head of the card is the speaker's name for a spoken beat and the word NARRATION
  for a described one, the bubble is the plate for anything the villager said and
  the room's own bubble only for the room, an aside leaves the plate for a small
  floating bubble of its own \u2014 see the aside rules further down, which are the
  Engine's second surface for exactly those lines \u2014 and a card that announces
  which drawing it is in lets all three dress from one fact instead of three
  rules guessing at the same thing.

  "thought" is still not here, and the reason is not that it is hard. An inner
  monologue the player is SHOWN is a different decision from something said out
  of the side of somebody's mouth, and it is a decision about whether the player
  may see it at all. The name is free when somebody makes that decision.

  INTENDED, NOT BUILT: a sprite system, and an expression per beat.

  The Engine's stage puts a character on the floor of the visual novel and lets
  a line carry the expression that goes with it \u2014 the nine effects its
  ExpressionReaction table knows, keyed to a mood and pinned to the face in the
  portrait. Villages has no sprite layer at all yet, so there is nothing here to
  attach an expression to. When there is, this is where it goes: one expression
  per beat, read beside the register below and drawn on the portrait above, not
  as a second drawing of the same words somewhere else.
*/
.${n}-chat-vn-label {
  margin: 0; align-self: flex-start;
  padding: .125rem .5rem; border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 12%, transparent);
  font-size: .625rem; font-weight: 600; line-height: 1.5;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--muted-foreground);
}
/*
  THE ASIDES, AND THEY ARE DRAWN IN THE BAND ABOVE THE PLATE.

  This is the box the bubbles stand in rather than a bubble itself, and it exists
  because of WHERE the Engine draws these lines rather than because of what they
  look like. A side remark is "a small floating box shown with the dialogue it
  follows", so it cannot be drawn inside the plate and it cannot be drawn inside
  the room's own portrait either. It goes in the band between them \u2014 the dead
  room the vignette leaves above the card \u2014 justified to the END of it, which is
  where the Engine puts it and which is also the side of the window that is not
  the speaker's own face.

  Four things are decided here and each of them is deliberate:

    - flex-end, so the bubbles stack against the right-hand edge and a short
      remark sits at the end of the band instead of floating in the middle of it.
      The bubbles themselves are therefore content-sized: end alignment does not
      stretch, so a bubble is as wide as its own words and no wider.

    - a CEILING, because a villager who writes six asides is not a reason for the
      plate to be pushed off the bottom of the tab. The Engine caps its own block
      at min(16rem, 38vh); this is the same idea at this surface's own number,
      and it is a cqh rather than a vh because in fullscreen the tab and the
      window are two different boxes. Past the ceiling it scrolls, exactly as the
      Engine's own block does.

    - nothing at all when it is empty. The block is not drawn at all rather than
      drawn empty, so a turn that carries no aside draws precisely what it drew
      before any of this existed \u2014 the stage does not lose a band's worth of room
      to a box with no bubbles in it.

    - a 75 percent cap on each bubble, which is the Engine's own ratio kept
      because it is what makes a bubble read as an aside rather than as another
      paragraph. It is the one measurement in here that comes off the Engine's
      window rather than off this card's own furniture.
*/
.${n}-chat-vn-asides {
  display: flex; flex-direction: column; align-items: flex-end; gap: .375rem;
  flex: 0 1 auto; min-height: 0; max-height: min(12rem, 30cqh);
  overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding-right: .25rem;
}
/*
  ONE BUBBLE, and it is the Engine's own small floating box copied to the values
  rather than imported: a round face a seventh of the card's own portrait, the
  type's mark beside the speaker's name at eleven pixels semibold, the listener
  after an arrow, and the words under both at twelve. The arrow is the Engine's
  own and so is the italic on a whisper, and both are kept because a whisper
  whose listener is not written down is an ordinary line with a symbol in front
  of it.

  Two translations, and both are forced by the surface underneath rather than
  chosen. The Engine draws these over a picture and fills them with black at
  three quarters, with a white hairline; this band is over a vignette and a card
  and not over a picture in the Engine's sense, so the same fill on it is a bubble
  with no edge at all \u2014 the fills are therefore this tab's own panel and border
  tokens at the Engine's own measured sizes, which is what makes the bubble read
  as a bubble here rather than as a hole in the stage. And the shadow is the
  Engine's, kept, because that is the half of the drawing that makes it float: a
  second surface that is only a second colour reads as another paragraph.

  flex: 0 0 auto, so a long bubble in a capped band scrolls rather than squashes.

  It has been in two wrong places before it got here, and both are worth naming
  because the sheet is where the mistake was both times. 0.4.56 drew an aside as
  a badge in the speaker's own row, which is a fact in the right place told inside
  the plate \u2014 the one thing the Engine never does with these lines. 0.4.57 took
  the badge out and pushed the whole bubble into the plate instead, which was
  worse: the aside stopped being a badge and started being the PARAGRAPH, so the
  line it followed left the card entirely and the player had to step the arrows
  to find it. This release fixes the second mistake and does not reintroduce the
  first: the plate is the plate, whatever the turn carries, and an aside is only
  ever something floating above it.
*/
.${n}-chat-vn-aside {
  flex: 0 0 auto;
  display: flex; align-items: flex-start; gap: .5rem;
  max-width: 75%;
  padding: .5rem .75rem; border-radius: .75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  box-shadow: 0 1rem 2.375rem rgba(0, 0, 0, .45);
}
/* The whisper is the one aside that changes colour as well as mark. It is the
   pair of tokens this sheet already reserves for the thing being pointed at, and
   the Engine's own whisper bubble is the same pair \u2014 a whisper is the register
   whose whole meaning is WHO it was aimed at, so it is the register that gets the
   colour that means pointed at. */
.${n}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${n}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${n}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${n}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${n}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${n}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${n}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${n}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${n}-chat-vn-aside[data-register="whisper"] .${n}-chat-vn-aside-text { font-style: italic; }
.${n}-chat-vn-beat {
  margin: 0; align-self: flex-start; max-width: 100%;
  padding: .5rem .625rem; border-radius: .625rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 60%, transparent));
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  color: var(--muted-foreground);
  font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
/*
  The marks a villager's line can carry, read by villages-inline-markdown.ts and
  assembled by renderVillagesMarkdown above.

  Only three of them need a rule. Bold and italic are the browser's own strong and
  em, and underline and strikethrough are the browser's own u and del, so the sheet
  says nothing about them; a code span, a link and a highlight would otherwise be
  indistinguishable from the words on either side of them.

  The Engine draws these same three \u2014 packages/client/src/styles/globals.css, at
  mari-md-inline-code and friends \u2014 and those rules cannot be borrowed, only
  copied: every one of them is scoped to mari-message-content, which is the
  Engine's chat bubble and not this card. The colours here are deliberately the
  Engine's, so a backtick span and a highlighted phrase look the same in a village
  as they do in a roleplay, and a highlight stays a colour the reader already
  knows rather than a new one this tab invented.
*/
.${n}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${n}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${n}-chat-md-link:hover { opacity: .85; }
.${n}-chat-md-highlight {
  background: rgba(250, 204, 21, .15); color: #facc15;
  border-radius: 2px; padding: 0 .1em;
}
/*
  The arrows, drawn as a rule-separated row under the paragraph.

  They are hidden when there is nowhere to go at all, which is the common case for
  a short answer that came in one piece: a pair of dead arrows under every line of
  a village's small talk would be two controls that say "there is nothing more"
  fifty times a session. One step in either direction is enough to draw them, and
  the step may cross from one speaker to the other \u2014 the reading is the whole
  conversation, so the arrows walk out of the villager's line into the player's own
  and back again. The turns memo above the drawer is the list they walk.

  The rule above them is the Engine's own, drawn at half the weight of the card's
  edge because it separates two things inside one surface rather than ending a
  surface: the paragraph and the controls that walk it. The row carries the
  plate's own horizontal padding, so it reaches both edges of the plate while the
  two arrows sit in from them \u2014 the Engine's own inset, at the Engine's own size.

  The words are the Engine's own two as well, and they are worth being long: the
  card is one paragraph of a longer answer, and a control called Next on a card
  that is holding somebody's speech is a control next to what? The room above the
  arrows already knows where it is; the arrows are the only thing in the plate that
  has to say what they walk.
*/
.${n}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${n}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${n}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${n}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${n}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${n}-chat-vn-button:disabled {
  cursor: default; opacity: .3;
  pointer-events: none;
}
/*
  The wait: one dot going round at the end of the reading.

  It stands in for two sentences \u2014 "N is thinking..." in the card and "N is
  saying goodbye..." in the log \u2014 and that is the whole argument for it. A line
  saying that somebody is thinking is a line the player reads once and has to
  read again on every turn, and the only thing it carries that a moving dot does
  not is a name the tab already has across the top of it.

  It is drawn in the place the answer is about to arrive rather than in a corner
  of its own: at the head of the reading, directly under the last thing the
  villager said, which is where the eye already is at the end of a turn and where
  the reply will appear a moment later. The same row is drawn while the villager
  is finding their first line and while an ordinary reply is in flight, because
  both are the same fact.

  The dot is not announced. What it means for anybody who cannot see it is in a
  hidden span beside it, since a spinner on its own is nothing to read out.
*/
.${n}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${n}-chat-spinner {
  flex: 0 0 auto;
  width: .75rem; height: .75rem; border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--muted-foreground) 30%, transparent);
  border-top-color: var(--muted-foreground);
}
/*
  Words for the accessibility tree and nobody else.

  Not the display:none form, which takes them out of the tree as well, and not a
  zero-width box, which some readers skip: this is the shape that is laid out as
  a one-pixel box with a one-pixel clip, so it keeps its name without keeping any
  room on the screen. The package had none of these until the spinner needed one,
  because every other control in the tab says what it is in visible words.
*/
.${n}-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
/*
  NEVER BREAK A WORD.

  overflow-wrap: anywhere is the one that looks harmless and is not. It lets the
  layout engine count a box's smallest possible width as a single character, so
  any box with no other floor shrinks until the letters stack one per line.
  GachaForge measured its narrowest rail drawing "Inven/tory/scree/n" at 33
  pixels of text width, and this keyword was the cause.

  break-word still breaks a word that cannot fit \u2014 a URL, a name with no spaces \u2014
  but it does not tell the layout engine that every word is a thing to be broken
  up, so the box keeps a floor of its longest word instead of a floor of one
  letter.
*/
.${n}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
/*
  Two speakers, two washes.

  Both bubbles are the same construction: one soft gradient, light at the top
  left and very slightly deeper at the bottom right, mixed over the theme's own
  background so a change of theme carries through and so the mix knows how dark
  the surface it is landing on is. The text colour is --foreground in both cases
  and is never taken from the gradient, which is what keeps both readable in
  both themes: the wash is always most of the background's own colour, and
  --foreground is the colour the theme has already promised contrasts with that.

  The villager's is the quieter of the two \u2014 the theme's own accent at a low
  mix, which is a cool grey-blue in a dark theme and a pale lilac in a light
  one \u2014 because it is the surface an answer arrives on. The player's is a soft,
  light blue, built from a fixed blue HUE rather than from --primary: what makes
  it read as blue is the hue, and what makes it light or dark is the background
  it is mixed over. A hard-coded light blue would be unreadable in a dark theme
  and invisible in a light one, and the blue is the one thing here the player
  asked for by name.

  The player's is the stronger of the two on purpose: it is the one they wrote,
  it is the one they will look for, and if the two were equally loud the log
  would read as two people shouting, which is not what either of them is doing.
*/
.${n}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${n}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${n}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said \u2014 it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${n}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${n}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  How to talk, behind one button.

  The three verbs used to be three pills in a row across the bar, and the row was
  the problem: "Chat", "Ask something" and "Fulfill something" are about thirty
  characters of the twenty a phone's bar has, so on the screen this tab shares with
  the Engine's own panels the row WAS the bar and the box the player types in was
  an afterthought under it. The Engine's own answer is the shape this copies \u2014 its
  Connections switcher \u2014 and the reason is the same: what would be a row of words
  on a phone becomes one small square with a glyph on it, and the words live in a
  menu above it where there is room to say what each one is. It is also the shape
  the composer wants at its left-hand edge, where the glyph it now sits at the end
  of a line of words rather than in a corner of the row: a control at the edge of
  a box that opens something should look like one.

  A CIRCLE rather than the toolbar's rounded square. The options button in the
  head is a square and it presses something; this one opens a menu, and two
  controls over the same photograph should not look like each other when they do
  different things. The Engine makes the same distinction \u2014 its own attach button
  is round and its toolbar squares are not \u2014 and both are drawn in the chrome's
  tokens, since the bar is a translucent surface over a picture and a control that
  was not would be a hole in it.
*/
.${n}-chat-mode-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${n}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${n}-chat-mode-button svg { width: 1rem; height: 1rem; }
/*
  The menu the button opens, modelled on the Connections switcher: a titled head
  over a list of rows, the row in force marked with a tick, and the whole thing
  bounded in both directions so a translation of the labels cannot push it off the
  tab. It is the second popover in the drawer and it is deliberately the same
  panel as the first \u2014 same tokens, same radius, same blur, same shadow \u2014 because
  a drawer with two kinds of menu in it is a drawer the player has to read twice.

  It opens UPWARD, off the box's own top edge, which is the other thing it has in
  common with the Connections switcher and with the Engine's own popovers: the box
  is on the floor of the tab, at the foot of the screen, and a menu that opened
  downward would be a menu off the bottom of it. It measures itself from the box
  rather than from the button inside it \u2014 the box is what the anchor inside it is
  static for, which is what puts the panel flush with the frame's top edge instead
  of a button's height into it.

  z-index 40 is the popover layer the options menu also sits on: both are drawn
  over the room, neither is ever over the other, since a press closes whichever
  one is not being pressed.
*/
.${n}-chat-modes {
  position: absolute; left: 0; bottom: calc(100% + .375rem); z-index: 40;
  width: 15rem; max-width: min(15rem, 82cqw);
  max-height: min(20rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35);
}
.${n}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${n}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${n}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${n}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${n}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${n}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${n}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${n}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave \u2014 see showLeave \u2014 and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${n}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${n}-chat-modes-foot > .${n}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it \u2014 the draft belongs to the drawer, not to this box.
*/
.${n}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${n}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${n}-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 3.25rem; max-height: 9rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .75rem; font-family: inherit; line-height: 1.5;
}
/*
  One row under the box, and it is the Engine's own composer.

  It used to be a grid of three columns \u2014 Leave on the left, the verbs centred,
  Send on the right \u2014 and 0.4.49 takes it apart for the shape the Engine's own
  roleplay composer has. 0.4.50 finishes the job: the way to talk moved inside the
  box, at its left-hand edge, where the press that sends already was at its
  right-hand edge \u2014 so the only thing left in this row is the box itself. Nothing
  is pinned to a corner because nothing is in a corner any more: how to talk is a
  menu rather than a row of words. Conclude selects an ending in that menu, and
  Send performs it.

  It stays a row of its own rather than being folded into the composer above it,
  because the box is what the row is for and a wrapper that says so reads better
  than a column whose only child is the thing the column is named after. The one
  child still takes the row: flex 1 1 auto with min-width 0, so a long line wraps
  inside the box rather than widening the row past the tab, and the box is the
  thing that shrinks on a narrow tab \u2014 the override that used to spread Leave and
  Send across two rows went with them.
*/
.${n}-composer-row { display: flex; }
.${n}-composer-row > .${n}-claim,
.${n}-composer-row > .${n}-chat-input { flex: 1 1 auto; min-width: 0; }
/*
  The box, and both of the glyphs that belong to it.

  The press that sends is INSIDE the box, on its right-hand edge, and so is the
  button that chooses how the line will be taken, at its left-hand edge. The
  second one is what 0.4.50 moved: the box used to be the frame around the
  player's words with the way to talk standing outside it in the row, which made
  that button the one piece of the composer that was not in the composer. Both are
  glyphs, both are inside the same frame as the words they act on, and both are
  centred on the frame's height. The words are the only thing whose height
  changes as they wrap.

  The frame is the ENGINE'S OWN input shell, in the Engine's own words: the same
  rounded-2xl radius, the same input border and input fill, the same blurred
  backdrop, and the same focus behaviour \u2014 the border lights up and a one-pixel
  ring goes round the whole box when the caret is anywhere inside it, which is why
  the ring is on :focus-within rather than on the textarea. The press used to be a
  glyph button floating over a framed textarea's right edge; two frames around one
  act were one frame too many, and the shell is the one the Engine's composer
  already wears.

  The textarea inside it is stripped of its frame rather than given a second one:
  no border, no fill, no resize grip. The grip matters \u2014 a dragged corner would
  sit exactly where the glyph now is. The room composer grows from one line to
  two and then scrolls inside the frame.

  The button that sends is a glyph rather than a word in every one of the three
  verbs. The box already says what mode the player is in, so a label saying Send,
  Tell them or anything else would be a second statement of the same thing in the
  one part of the tab where there is no room for it. What it does NOT do is move
  when it does: the disabled state is the whole difference between an empty box
  and a full one, and it is opacity, which is what the Engine uses too.
*/
.${n}-chat-input {
  position: relative; display: flex; align-items: center; gap: .5rem;
  padding: .375rem .5rem;
  border: 1px solid var(--marinara-chat-chrome-input-border, var(--border));
  border-radius: 1rem;
  background: var(--marinara-chat-chrome-input-bg, var(--background));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  box-shadow: 0 .0625rem .125rem rgba(0, 0, 0, .18);
  backdrop-filter: blur(12px);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.${n}-chat-input:focus-within {
  border-color: var(--marinara-chat-chrome-input-border-focus, var(--primary));
  box-shadow: 0 0 0 1px var(--marinara-chat-chrome-focus-ring, var(--primary));
}
/*
  The way to talk, at the frame's left-hand edge.

  Static rather than relative, and that is the whole of what this rule is for:
  the anchor is the thing the menu above it measures itself from, so taking its
  own positioning away hands that job up to the box, which is the nearest
  positioned thing over it. The menu therefore opens off the box's own top edge
  rather than off a button sitting in the middle of it \u2014 flush with the frame
  instead of a button's height into it.

  It keeps its own width, because it is a glyph and not a thing that stretches:
  flex 0 0 auto, so a long line cannot squash the control that says how the line
  will be read.
*/
.${n}-chat-input > .${n}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${n}-chat-input > .${n}-textarea {
  flex: 1 1 auto; min-width: 0;
  border: 0; border-radius: 0; box-shadow: none; resize: none;
  background: transparent; color: inherit;
  min-height: 2.75rem; max-height: 9rem;
  padding: .3125rem 0;
}
/*
  The sentence the frame says when there is nothing to put in it.

  It is drawn INSIDE the frame rather than in the frame's place, because the frame
  carries the way back to the other verbs: a claim with nothing to settle is the
  one state where the player has a box they cannot type in, and a state with no
  frame would be a state with no way out of the verb. The sentence stretches to
  fill what the glyph beside it leaves and is a wrapping item rather than a rigid
  one, so it wraps inside the box instead of widening it.
*/
.${n}-chat-input > .${n}-hint { flex: 1 1 auto; min-width: 0; }
.${n}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${n}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-send:disabled { cursor: default; opacity: .45; }
.${n}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${n}-chat-send svg { width: 1rem; height: 1rem; }
.${n}-room-screen .${n}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${n}-room-screen .${n}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${n}-room-screen .${n}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${n}-room-screen .${n}-chat-pending { align-items: center; gap: .5rem; }
.${n}-room-screen .${n}-chat-pending-label { font-size: .75rem; }
.${n}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${n}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${n}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${n}-room-mode:disabled { opacity: .5; cursor: default; }
.${n}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${n}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${n}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${n}-room-error .${n}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${n}-room-screen .${n}-chat[data-opening-error="true"] .${n}-chat-vn { display: none; }
.${n}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${n}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${n}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${n}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${n}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${n}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${n}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${n}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${n}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${n}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${n}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${n}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${n}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${n}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${n}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${n}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${n}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${n}-notice-author { font-weight: 600; color: var(--foreground); }
.${n}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${n}-notice-input {
  flex: 1 1 auto; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
/*
  A place and its picture: the picture on the left, its name and the buttons
  that act on it on the right. A grid rather than a flex row so the names line
  up down the column even when one of them wraps to two lines, which is what
  makes the list read as a list instead of as a stack of unrelated things.
*/
.${n}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${n}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${n}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty \u2014 dashed rather than solid \u2014 so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${n}-place-thumb[data-empty="true"] { border-style: dashed; }
.${n}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${n}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${n}-place-body .${n}-row { margin-top: 0; }
.${n}-place-body .${n}-file { font-size: .625rem; }
/*
  THE PLACE ITSELF, as the screen that stands in it: its picture on one side and
  what the village knows on the other.

  flex-wrap rather than a media query, because the tab is not the window. In
  fullscreen the Engine hands this package a box whose width has nothing to do
  with the viewport, so a query on max-width would be answering a different
  question; two items whose bases add up to more than the row fall onto two rows
  wherever that line happens to be. The picture keeps its basis and the text grows
  into the rest, so the only two shapes are "beside" and "under".

  A place nobody has drawn is the same box with nothing in it, dashed, which is
  the statement the places list already makes for a picture that is not there yet.
*/
.${n}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${n}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${n}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${n}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${n}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${n}-venue-body .${n}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${n}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${n}-venue-page, .${n}-venue-editor-page, .${n}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${n}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${n}-venue-hero > .${n}-venue-picture,
.${n}-venue-hero > .${n}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${n}-venue-context, .${n}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${n}-venue-context p, .${n}-venue-card p { margin: 0; }
.${n}-venue-context { align-self: center; }
.${n}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${n}-venue-card .${n}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${n}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${n}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${n}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${n}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${n}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${n}-venue-hero { grid-template-columns: 1fr; }
  .${n}-venue-page .${n}-button,
  .${n}-venue-editor-page .${n}-button,
  .${n}-venue-proposal-page .${n}-button { min-height: 2.5rem; }
}
/* Villages' current UI language: dark navy, blue glass surfaces, violet focus.
   These scoped values can become a selectable theme palette in a later release. */
.${n}-root[data-venue-view="true"] {
  --venue-bg: #091431;
  --venue-panel: #132653;
  --venue-border: #2d4a91;
  --venue-text: #f3f4ff;
  --venue-muted: #c0c9ee;
  --venue-accent: #7545fb;
  display: grid; grid-template-columns: clamp(13rem, 18cqw, 16rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr); gap: 0; padding: 0;
  background: radial-gradient(circle at 78% 25%, #172d61 0, transparent 52%), linear-gradient(120deg, #09132f, #0e1e43);
  color: var(--venue-text);
}
.${n}-root[data-venue-view="true"] > .${n}-header {
  grid-column: 2; grid-row: 1; align-items: center; padding: 1.25rem 1.5rem .75rem;
}
.${n}-root[data-venue-view="true"] .${n}-venue-header-controls { display: flex; flex-direction: column; align-items: flex-end; gap: .5rem; min-width: 0; }
.${n}-root[data-venue-view="true"] .${n}-actions { flex-wrap: wrap; justify-content: flex-end; }
.${n}-venue-move-error { max-width: 27rem; margin: 0; color: #ffb7c1; font-size: .8rem; line-height: 1.4; text-align: right; }
.${n}-root[data-venue-view="true"] .${n}-title { font-size: clamp(1.35rem, 2.4cqw, 2rem); font-weight: 700; }
.${n}-root[data-venue-view="true"] .${n}-subtitle { color: var(--venue-muted); font-size: .88rem; }
.${n}-root[data-venue-view="true"] .${n}-header .${n}-button,
.${n}-venue-back {
  border: 1px solid #6478c1; border-radius: .7rem; background: #142653;
  color: var(--venue-text); padding: .65rem .9rem; font: inherit; cursor: pointer;
}
.${n}-root[data-venue-view="true"] .${n}-header .${n}-button:hover,
.${n}-venue-back:hover { border-color: #aa92ff; background: #203774; }
.${n}-root[data-venue-view="true"] > .${n}-venue-page { display: contents; }
.${n}-venue-zones {
  grid-column: 1; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: .65rem;
  min-height: 0; overflow-y: auto; padding: 1rem .65rem;
  border-right: 1px solid #314782;
  background: radial-gradient(circle at 30% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${n}-venue-back { min-height: 2.7rem; margin: 0 .1rem 1rem; }
.${n}-venue-zone-tab {
  display: flex; align-items: center; gap: .65rem; min-width: 0; width: 100%;
  border: 1px solid transparent; border-radius: .72rem; padding: .45rem;
  background: transparent; color: var(--venue-text); text-align: left; font: inherit; cursor: pointer;
}
.${n}-venue-zone-tab:hover { background: #253b75; }
.${n}-venue-zone-tab[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  box-shadow: 0 0 0 2px #8756ff, 0 0 1.1rem #683cf977;
}
.${n}-venue-zone-tab:focus-visible, .${n}-venue-back:focus-visible,
.${n}-venue-visit:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${n}-venue-zone-thumb {
  flex: 0 0 3.4rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
  overflow: hidden; border: 1px solid #5570b0; border-radius: .42rem; background: #18254d;
}
.${n}-venue-zone-thumb img { width: 100%; height: 100%; object-fit: cover; }
.${n}-venue-zone-thumb > span { font-size: 1.5rem; color: #b5c3ec; }
.${n}-venue-zone-copy { min-width: 0; }
.${n}-venue-zone-copy strong, .${n}-venue-zone-copy small { display: block; overflow-wrap: anywhere; }
.${n}-venue-zone-copy strong { font-size: .78rem; line-height: 1.3; }
.${n}-venue-zone-copy small { color: var(--venue-muted); font-size: .68rem; line-height: 1.35; }
.${n}-venue-zone-content {
  grid-column: 2; grid-row: 2; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 1fr);
  align-items: start; gap: 1rem; min-width: 0; padding: .75rem 1.5rem 1.5rem;
}
.${n}-venue-zone-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.${n}-venue-artwork { overflow: hidden; border: 1px solid var(--venue-border); border-radius: .85rem; background: #0c1732; }
.${n}-venue-artwork img, .${n}-venue-artwork-empty {
  display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover;
}
.${n}-venue-artwork-empty { display: grid; place-items: center; color: var(--venue-muted); text-align: center; }
.${n}-venue-zone-context {
  min-width: 0; border: 1px solid var(--venue-border); border-radius: .8rem;
  background: linear-gradient(145deg, #142753, #101e42); padding: 1rem 1.15rem;
}
.${n}-venue-zone-context h2 { margin: 0 0 .55rem; font-size: 1.2rem; }
.${n}-venue-zone-context p { margin: 0; color: var(--venue-muted); line-height: 1.6; }
.${n}-venue-more { margin-top: 1rem; border: 1px solid var(--venue-border); border-radius: .6rem; padding: .7rem .9rem; }
.${n}-venue-more summary { cursor: pointer; }
.${n}-venue-more p { margin-top: .65rem; }
.${n}-venue-zone-context { display: flex; flex-direction: column; min-height: min(31rem, 63cqh); }
.${n}-venue-kicker { color: #b9c5ff; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.${n}-venue-zone-stat { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid #29447f; margin-top: 1.1rem; padding: 1rem 0 0; }
.${n}-venue-zone-stat span { color: var(--venue-muted); }
.${n}-venue-zone-stat strong { font-weight: 500; text-align: right; }
.${n}-venue-zone-guidance { margin-top: 1rem !important; font-size: .85rem; }
.${n}-venue-visit {
  width: 100%; min-height: 3.25rem; margin-top: auto; border: 0; border-radius: .55rem;
  background: linear-gradient(100deg, #3156e8, var(--venue-accent));
  color: white; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
}
.${n}-venue-visit:disabled { opacity: .48; cursor: default; }
@container (max-width: 48rem) {
  .${n}-root[data-venue-view="true"] { display: flex; flex-direction: column; }
  .${n}-root[data-venue-view="true"] > .${n}-header { order: 0; padding: 1rem; }
  .${n}-root[data-venue-view="true"] .${n}-venue-header-controls { align-items: flex-start; }
  .${n}-root[data-venue-view="true"] .${n}-actions { justify-content: flex-start; }
  .${n}-root[data-venue-view="true"] .${n}-venue-move-error { text-align: left; }
  .${n}-root[data-venue-view="true"] > .${n}-venue-page { order: 1; display: flex; flex-direction: column; margin: 0; }
  .${n}-venue-zones { order: 0; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: .7rem; border-right: 0; border-bottom: 1px solid #314782; }
  .${n}-venue-back { flex: 0 0 auto; margin: 0; }
  .${n}-venue-zone-tab { flex: 0 0 11rem; }
  .${n}-venue-zone-content { order: 2; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 1rem; }
  .${n}-venue-zone-main, .${n}-venue-zone-context { width: 100%; box-sizing: border-box; }
  .${n}-venue-zone-context { min-height: 0; gap: .25rem; }
  .${n}-venue-visit { margin-top: 1rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${n}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${n}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${n}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${n}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${n}-story-scope { color: var(--primary); }
/* Villagers \u2192 Memories: a calm library, not a diagnostic table. */
.${n}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${n}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${n}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${n}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${n}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${n}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${n}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${n}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${n}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${n}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${n}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${n}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${n}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${n}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${n}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${n}-memory-layers strong { font-size: .7rem; }
.${n}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${n}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${n}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${n}-memory-health > div { flex: 1; min-width: 0; }
.${n}-memory-health strong { font-size: .72rem; }
.${n}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${n}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${n}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${n}-memory-toolbar input, .${n}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${n}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${n}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${n}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${n}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${n}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${n}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${n}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${n}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${n}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${n}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${n}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${n}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${n}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${n}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${n}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${n}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${n}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${n}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${n}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${n}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${n}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${n}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${n}-memory-reinforced, .${n}-memory-footnote, .${n}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${n}-memory-card-actions button, .${n}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${n}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${n}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${n}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${n}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${n}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${n}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${n}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${n}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${n}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${n}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${n}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${n}-memory-hero { grid-template-columns: 1fr; }
  .${n}-memory-layers { grid-template-columns: 1fr; }
  .${n}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${n}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${n}-memory-section-head > span { display: none; }
}
.${n}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${n}-wish-card p { margin: 0; }
.${n}-wish-card p + p { margin-top: .25rem; }
.${n}-wish-text { color: var(--foreground); font-weight: 600; }
.${n}-wish-tell { color: var(--muted-foreground); }
.${n}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
/*
  The schedules panel's own explanation, shut.

  The panel used to open with three paragraphs of prose, and print the whole
  translation prompt under every villager, before a reader had seen an hour of
  anybody's day: the answers sat below the documentation for them. The prose and
  the prompt are what a reader reaches for when a row reads wrong, so they are
  kept exactly as they were written and put behind a disclosure rather than cut.
  What stays open is the week itself \u2014 the name, the badges, the timetable, and
  the two labelled lines inside each block \u2014 so the panel reads as a week first
  and as an explanation second.

  The summary is a button and the marker is hidden for the same reason the news
  toggle hides its own: the browser's triangle cannot be sized, coloured or placed
  with the rest of the control, and the button already says it can be pressed. The
  body carries no frame of its own because what is inside it does \u2014 the sentences
  are prose and the prompt is a scroll box of its own.
*/
.${n}-agenda-notes { margin: 0 0 .625rem; }
.${n}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${n}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${n}-agenda-notes > summary::marker { content: ""; }
.${n}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${n}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${n}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${n}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

/*
  The week, resident by resident, shut.

  Every resident is a disclosure and every one of them starts shut, because the
  panel is opened to CHECK one week rather than to read a village: shut, it is a
  list of names with their state beside them, which is the question a reader
  arrives with. The summary carries the heading's type rather than a button's,
  because it is a heading rather than a control, and the browser's own triangle is
  hidden for the reason the news toggle hides its own: it cannot be sized or
  placed with the rest of the control.

  The frame is the sheet's ordinary border and background, so an open resident
  reads as one card among several rather than as a run-on list.
*/
.${n}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${n}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${n}-week-toggle::-webkit-details-marker { display: none; }
.${n}-week-toggle::marker { content: ""; }
.${n}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${n}-week-toggle:hover > .${n}-week-head,
.${n}-week[open] > .${n}-week-toggle > .${n}-week-head { color: var(--primary); }
.${n}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${n}-agenda-list { display: grid; gap: .5rem; }
.${n}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${n}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${n}-agenda-switch input { accent-color: var(--primary); }
.${n}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${n}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${n}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${n}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${n}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${n}-agenda-compare section { min-width: 0; }
.${n}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${n}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${n}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${n}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${n}-agenda-blocks strong { font-weight: 600; }
@container ${n} (max-width: 35rem) {
  .${n}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${n}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${n}-agenda-blocks time { grid-row: auto; }
}

/*
  The founding wizard is two columns: the questions on the left and the map
  beside them on the right, so the player can answer and mark their own houses
  without either one being drawn over the other. The columns are measured in rem
  and allowed to wrap, which is what keeps the wizard honest when the Engine's
  own side panels open: the room the tab has shrinks with them, and past a point
  the map drops underneath the questions instead of squeezing to a sliver beside
  them. The homepage does not use them; it is the map.
*/
/* Both of these are the root's own two numbers at a smaller share of them, so a
   narrow tab tightens every screen at once rather than one screen at a time. */
.${n}-home {
  gap: calc(var(--${n}-gap) * .75);
  padding: calc(var(--${n}-pad) * .8);
  overflow-y: auto;
}
.${n}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${n}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${n}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${n}-setup-map-viewport > .${n}-stage:not(.${n}-stage-compact) { width: 100%; flex: none; border: 0; }
.${n}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${n}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${n}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${n}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${n}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${n}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
/*
  The homepage is the map, and the map is the whole tab. The map's shape is its
  own \u2014 a fixed ratio that comes from the settings, not from whatever shape this
  tab happens to be \u2014 so this row gives it the room it has left over and lets
  the space it does not fill show, rather than stretching the picture into a
  shape no map has.

  A row of two columns: the village's news down the left, the map in what is
  left. Both are children of this row, so the news is never drawn over the
  picture. The old shape was neither \u2014 the news was a window laid on top of a
  tab-wide map, which only looked right while the tab was wide enough for the
  map to be shorter than it and leave a gutter on each side. The Engine's own
  side panels narrow the tab until the map fills it edge to edge, and then the
  window landed on the picture. A row cannot do that: whatever width the tab
  has, the news takes its share and the map is fitted to the rest.

  The news is the only thing in this row besides the map. The readout and the
  notices are not in the row at all \u2014 they are drawn inside the map's own frame,
  because the frame is the only box whose corner is the picture's corner.

  There is no min-height floor. A floor taller than the visible tab is a floor
  the map is fitted against and then cropped by the overflow below \u2014 the map
  would be measured against a box bigger than the one it is seen in, and the
  bottom of the picture, and the pins on it, would be behind the tab's edge.
  A short tab is meant to give a small map, not a cut-off one.

  The two numbers next to this comment are the map's whole frame: the wood is
  the thickness of the wooden frame and the mat the margin inside it. They are
  written down once here and read everywhere they are needed, so the frame and
  the room that keeps it clear of the tab's edge cannot disagree.

  The shared bar takes its own row above the map on both phone and desktop, so
  its controls cannot cover a place pinned near the map's top edge.
*/
.${n}-home-full {
  --${n}-map-wood: .75rem;
  --${n}-map-mat: .5rem;
  position: relative;
  box-sizing: border-box;
  display: flex; flex-direction: column; align-items: stretch;
  gap: .5rem;
  height: 100%; min-height: 0;
  padding: .5rem; overflow: hidden;
}
/*
  The space below the controls is the box the desktop map is fitted against.
  The frame stays centered in it; notices belong to the frame itself.

  The padding is the buffer the wooden frame is drawn into. It is the wood and
  the mat plus a pixel, which is exactly enough for the frame to exist without
  ever reaching the edge of a box that clips its overflow, and it is written as
  that sum rather than as a length so it stays true if either is retuned. The
  frame is drawn outwards from the picture, so this padding is the frame's own
  width and a pixel of clearance, and the picture itself is unchanged by it.
*/
.${n}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${n}-map-wood) + var(--${n}-map-mat) + 1px);
}
/*
  The frame's border and rounding belong to the wizard, where the map shares the
  tab with the questions. On the homepage the wood replaces both, so this rule
  takes them away.

  No width is stated here on purpose. The measurement gives the frame BOTH of
  its sides inline, and a width would fight it: a frame left to the room's width
  alone is a frame taller than the room, and a frame taller than the room is a
  frame the map is cropped to fill \u2014 which is how four houses on the four
  corners of the map went missing.

  The clipping this frame used to do has not gone anywhere, it moved down to the
  picture's own layer, which is the same box. Splitting it that way is what lets
  the wood be drawn outside the frame while a pin on a corner house is still cut
  off at the edge of the map rather than floating over the wood.

  isolation makes this frame a stacking context, which is what keeps the two
  wood layers behind the picture. Without it a layer at a negative depth is not
  contained by anything here and paints behind whatever it finds further up \u2014
  the wood would still be in the file and nowhere on the screen.
*/
.${n}-home-full .${n}-stage {
  flex: 0 0 auto;
  border: 0; border-radius: 0;
  overflow: visible;
  isolation: isolate;
}
/*
  Until the picture has been read there is no shape to fit it to, so there is
  nothing to measure and no inline size to fall back on: the frame takes the
  column's width instead of letting the picture's own width decide it, which
  would be a frame as wide as the file and wider than the tab.
*/
.${n}-home-full .${n}-stage:not([data-shaped="true"]) { width: 100%; }
.${n}-home-full .${n}-canvas {
  overflow: hidden;
  z-index: 1;
}
/*
  The wooden frame, drawn outside the map's box rather than inside it.

  Outside, because a frame drawn inside would have to come out of the picture,
  and the picture is the map: a frame inside it would crop the map or mat it,
  and would move every pin as it did. Grown outwards, the map's box stays
  exactly the map, and nothing about where a house sits changes.

  Two layers because a picture frame has two faces \u2014 the wood itself, and the
  mat inside it that keeps the picture off the wood. The mat is painted second
  and so covers the wood's inner edge, which is what leaves the wood showing as
  a ring. A single layer would be a solid slab behind the map.

  The grain is a set of repeating gradients \u2014 plank bands down the frame crossed
  by finer, uneven ones \u2014 which is as much wood as a band this thin can hold.
  The insets are written as sums of the same two numbers the frame's thickness
  and the room's buffer are made of, so the wood always fits the space it is
  given: this is the one place the two must not drift apart.

  Scoped to the homepage's frame. The wizard and the town map editor keep the
  plain border they have always had.
*/
.${n}-home-full .${n}-stage::before,
.${n}-home-full .${n}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${n}-home-full .${n}-stage::before {
  inset: calc(-1 * (var(--${n}-map-wood) + var(--${n}-map-mat)));
  border-radius: .625rem;
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, .18) 0 1px, rgba(0, 0, 0, 0) 1px 11px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .06) 0 1px, rgba(255, 255, 255, 0) 1px 29px),
    linear-gradient(168deg, #a97641 0%, #8a5c2c 30%, #96683a 52%, #744a20 78%, #8d5f31 100%);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, .35),
    inset 0 0 0 3px rgba(255, 255, 255, .055),
    0 .5rem 1.5rem rgba(0, 0, 0, .34);
}
.${n}-home-full .${n}-stage::after {
  inset: calc(-1 * var(--${n}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
.${n}-places-picker { position: relative; pointer-events: auto; }
.${n}-places-list {
  position: absolute; top: calc(100% + .375rem); left: 0; z-index: 10;
  display: flex; flex-direction: column; gap: .375rem;
  min-width: min(19rem, 80vw); max-width: min(24rem, 90vw); max-height: 60vh; overflow: auto;
  padding: .5rem; border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${n}-places-list-row { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${n}-places-list-name { flex: 1 1 100%; font-size: .8125rem; font-weight: 600; }
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${n}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${n}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${n}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${n}-notice .${n}-status,
.${n}-notice .${n}-error {
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  padding: .3125rem .5rem;
}
/*
  The village's news, behind a button in the shared bar above the map.

  It used to be a column of the homepage: a permanent gutter down one side of
  the map, holding a list that is usually short and often empty. A column that is
  always there is a column the map always pays for, and on a phone held sideways
  there is no width to pay it with \u2014 the map would have been fitted to whatever
  the news left of the tab, which is a strange thing for reading the news to do.

  So the news is a disclosure instead. The button says the feed is there and the
  panel unrolls beneath it, over the picture: it costs the map nothing while it
  is shut and covers a corner of it while it is open. What the rail said is still
  said; it is said on request.

  A details element rather than a button and a box of state, because the
  open-and-shut flag, the keyboard behaviour and the expanded-or-collapsed
  announcement are all the element's own and none of them can drift out of step
  with the panel. What it does not do by itself is shut when the player presses
  somewhere else, which is the one thing the component adds: a panel that can
  only be dismissed by finding the button again sits over the game while the game
  is being played.

  Hung below its own button rather than centred on the map, so the panel opens
  where the button is. Both of its limits are shares of the tab rather than
  lengths, so a small tab gets a panel that fits and scrolls instead of one
  taller or wider than the screen it is on.
*/
.${n}-news { position: relative; }
.${n}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${n}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${n}-news-toggle::-webkit-details-marker { display: none; }
.${n}-news-toggle::marker { content: ""; }
.${n}-news[open] > .${n}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${n}-news-panel {
  position: absolute; top: calc(100% + .375rem); right: 0; z-index: 4;
  box-sizing: border-box; width: min(20rem, 72cqw);
  max-height: min(24rem, 60cqh);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover);
  padding: .5rem .625rem;
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
.${n}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${n}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${n}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${n}-mapbar-title { font-size: .8125rem; font-weight: 600; }
/*
  The map's own frame: beside the wizard's questions, in a column of prose, or
  filling the homepage. Its shape is the map's rather than the container's \u2014 the
  ratio is set inline from the picture size the settings named \u2014 so the same
  picture is drawn at the same shape everywhere, and a picture that is not that
  shape is cropped, stretched or letterboxed inside it by choice rather than by
  accident. The frame's background is what shows wherever the picture is not:
  the part of the frame that is not the picture should not look like somewhere a
  house can go. MapStage measures the frame and the picture separately and pins
  the homes to the picture.
*/
.${n}-stage {
  position: relative;
  flex: 1 1 26rem; min-width: 0;
  border: 1px solid var(--border); border-radius: .75rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--muted-foreground) 12%, var(--background));
}
/*
  Before the settings name the map's shape there is no shape to be, so the frame
  stands at a usable height rather than at nothing. Once the settings arrive the
  ratio set inline takes over and the height follows the width, the way a
  picture's does.
*/
.${n}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${n}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${n}-canvas { position: absolute; inset: 0; }
.${n}-stage[data-empty="true"] .${n}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${n}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${n}-canvas[data-placing="true"] { cursor: crosshair; }
.${n}-canvas[data-dragging="true"] { cursor: grabbing; }
.${n}-stage[data-framing="true"] .${n}-canvas { cursor: grab; touch-action: none; }
.${n}-stage[data-framing="true"] .${n}-canvas[data-dragging="true"] { cursor: grabbing; }
.${n}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${n}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${n}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${n}-zoom-button:disabled { opacity: .5; cursor: default; }
.${n}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${n}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${n}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${n}-pin:hover { color: var(--primary); }
.${n}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${n}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${n}-pin[data-tone="player"] { border-color: var(--primary); }
.${n}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read \u2014 there is nothing behind it to press yet.
*/
.${n}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${n}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
.${n}-pin[data-kind="person"] .${n}-pin-tack { display: none; }
/*
  A thumbtack, because that is what the thing on a map is: something pushed
  through the paper to say a building is here. Drawn rather than taken from a
  font or an emoji, so it is the same tack on every machine the Engine runs on.
*/
.${n}-pin-tack { flex: 0 0 auto; width: 1rem; height: 1rem; color: var(--destructive, #e5484d); }
.${n}-pin-tack svg { display: block; width: 100%; height: 100%; fill: currentColor; }
.${n}-pin[data-tone="empty"] .${n}-pin-tack { color: var(--muted-foreground); }
.${n}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${n}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  DEBUG. The way back into a conversation that was closed without being ended.

  Outside the pin's own box rather than in it: the pin is placed by its centre
  on a building, and a second row inside it would move the pin up the picture by
  half of the control's height, so a house would stop being marked where it is.
  Hung below the pin's box, the pin stays exactly where it was and the control
  reads as belonging to it.

  Drawn in the destructive colour for the same reason the debug verbs in the
  drawer are: a control that is not part of the game should not be mistaken for
  one, and a player of this game never has a conversation in hand whose window is
  shut. Unlike them it is never disabled \u2014 on a locked map it is the only thing
  that answers a click, and a locked map with nothing to press is a tab that has
  to be reloaded.
*/
.${n}-pin-resume {
  position: absolute; top: calc(100% + .1875rem); left: 50%; transform: translateX(-50%);
  white-space: nowrap; cursor: pointer; font: inherit; font-size: .625rem; line-height: 1.4;
  border: 1px solid var(--destructive, #e5484d); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  color: var(--destructive, #e5484d); padding: .125rem .375rem;
}
/*
  THE TWO DOORS A PLACE WITH SOMEBODY IN IT OFFERS.

  Hung under the pin it belongs to and drawn outside the frame rather than inside
  it. The frame is the picture's box and it is also what cuts off anything that
  reaches past a corner house, so a pair of buttons under a pin near the bottom of
  the map would be half a pair of buttons. The offsets are set inline from the same
  two numbers the pin above is placed with, so the list opens exactly under its own
  pin at every size the picture is drawn at.

  The step down is a length rather than a share of the picture on purpose: what it
  has to clear is a pin, and a pin is a fixed size however large the map is.

  A list rather than one button, because the two answers are genuinely different.
  Looking at a place and walking in to talk to whoever is standing in it are two
  things a player can want, and the map used to decide between them: a pin with one
  person behind it opened their conversation and skipped the place entirely, so a
  house with somebody in it could not be looked at. A card rather than two loose
  pills, because the pair belongs to one pin and has to read as one thing.
*/
.${n}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${n}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${n}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${n}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${n}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${n}-overlay-head > .${n}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${n}-setup-root {
  box-sizing: border-box; container-type: inline-size; overflow-x: hidden; overflow-y: auto;
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${n}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${n}-setup-body { flex: 0 0 auto; min-height: 0; }
.${n}-setup-body > .${n}-side { flex: 1 1 34rem; }
.${n}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${n}-setup-visual > .${n}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
.${n}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${n}-setup-footer > .${n}-button { flex: 1 1 0; min-width: 0; }
.${n}-setup-footer > .${n}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${n}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${n}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${n}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${n}-setup-rail-step[data-done="true"] { opacity: 1; }
.${n}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${n}-setup-rail-step[data-active="true"] .${n}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${n}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${n}-setup-body {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: stretch; color: var(--foreground);
}
.${n}-setup-body > .${n}-side { flex-basis: 35rem; min-height: 0; }
.${n}-setup-body .${n}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${n}-setup-body .${n}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${n}-setup-body .${n}-field { margin-top: .15rem; }
.${n}-setup-body[data-step="1"] .${n}-overlay { height: 100%; min-height: 0; overflow: hidden; }
.${n}-setup-body .${n}-search,
.${n}-setup-body .${n}-textarea,
.${n}-setup-body .${n}-select,
.${n}-setup-body .${n}-notice-input {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${n}-setup-beginning-textarea { min-height: 4.5rem; }
.${n}-setup-form-field { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .6rem; align-items: start; }
.${n}-setup-form-field > .${n}-label { padding-top: .55rem; }
.${n}-setup-form-field > .${n}-hint { grid-column: 2; }
.${n}-setup-place-spaces { display: grid; gap: .65rem; }
.${n}-setup-place-space { display: grid; gap: .4rem; border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .7rem; }
.${n}-setup-place-space h4 { margin: 0; color: #f5f5ff; font-size: 1rem; }
.${n}-setup-advanced {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .55rem .65rem;
}
.${n}-setup-advanced > summary { cursor: pointer; }
.${n}-setup-advanced .${n}-reason-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.${n}-setup-advanced .${n}-label { min-width: 0; }
.${n}-setup-review-card {
  display: grid; gap: .3rem; border: 1px solid #5265ac; border-radius: .85rem;
  background: #1c254b; padding: .65rem;
}
.${n}-setup-review-card h3 { margin: 0; color: #f5f5ff; font-size: .9rem; }
.${n}-setup-review-card p { margin: 0; }
.${n}-setup-body .${n}-setup-venue-card {
  border-color: #5265ac; border-radius: .85rem; background: #1c254b; color: #f0f2ff;
}
.${n}-setup-body .${n}-setup-venue-card[data-selected="true"] {
  border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff;
}
.${n}-setup-body .${n}-setup-map-shell {
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${n}-setup-body .${n}-step[data-clickable="true"] {
  border-color: #5265ac; border-radius: .65rem; background: #1c254b; color: #d3ddfa; padding: .4rem .7rem;
}
.${n}-setup-body .${n}-step[data-active="true"] {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff; color: #f5f5ff;
}
.${n}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${n}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${n}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${n}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${n}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${n}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${n}-scenario-option strong { font-size: max(.72rem, 13px); }
.${n}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${n}-scenario-art-panel {
  position: relative; flex: 1 1 12rem; min-width: 0; min-height: 8rem;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${n}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${n}-scenario-art-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #d3ddfa; font-size: 2rem;
}
.${n}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${n}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${n}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${n}-scenario-art-content strong { font-weight: 500; }
/* World setup uses the same indigo panels and borders as Identity and Persona. */
.${n}-lore-picker {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .65rem;
}
.${n}-lore-selected { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 5rem; overflow-y: auto; margin: .4rem 0; }
.${n}-lore-chip {
  display: inline-flex; align-items: center; gap: .3rem; max-width: 100%; padding: .15rem .25rem .15rem .5rem;
  border: 1px solid #6684d4; border-radius: 999px; background: #303d85; color: #f0f2ff; font-size: .72rem;
}
.${n}-lore-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-lore-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${n}-lore-chip button:focus-visible { outline: 2px solid #f2d6ff; border-radius: 50%; }
.${n}-lore-options > summary { cursor: pointer; list-style-position: inside; }
.${n}-lore-options > .${n}-search { width: 100%; box-sizing: border-box; margin: .5rem 0; }
.${n}-lore-results { display: grid; gap: .15rem; max-height: 12rem; overflow-y: auto; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${n}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${n}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${n}-identity-picker-head > .${n}-label { flex: 0 0 auto; }
.${n}-identity-picker-head > .${n}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${n}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${n}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${n}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${n}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${n}-identity-card-face, .${n}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${n}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${n}-identity-card-face > img, .${n}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${n}-identity-card-face svg, .${n}-identity-preview-face svg { width: 55%; height: 55%; }
.${n}-identity-card strong, .${n}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${n}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${n}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${n}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${n}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${n}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${n}-identity-preview-copy p { margin: .12rem 0; }
.${n}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${n}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${n}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${n}-identity-details dd { margin: 0; }
.${n}-identity-context { color: #bdc8ed; }
.${n}-connections-compact { min-height: 0; }
.${n}-connections-compact > .${n}-hint { margin: 0; }
.${n}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${n}-connections-grid > .${n}-field { min-width: 0; }
.${n}-connections-grid .${n}-select { width: 100%; }
.${n}-connections-grid .${n}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${n}-scenario-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (max-width: 70rem) {
  .${n}-setup-body { flex-wrap: wrap; }
  .${n}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${n}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${n}-setup-body > .${n}-side { flex-basis: 25rem; }
  .${n}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${n}-setup-body { flex: none; }
  .${n}-setup-body > .${n}-side,
  .${n}-setup-visual { flex: 1 1 100%; }
  .${n}-setup-body[data-step="1"] .${n}-overlay { height: auto; overflow: visible; }
  .${n}-identity-preview { max-height: none; }
  .${n}-connections-grid { grid-template-columns: 1fr; }
  .${n}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${n}-setup-advanced .${n}-reason-options { grid-template-columns: 1fr; }
  .${n}-scenario-art-panel { flex: none; height: 18rem; }
  .${n}-setup-form-field { grid-template-columns: 1fr; }
  .${n}-setup-form-field > .${n}-hint { grid-column: 1; }
}
.${n}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute \u2014 a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${n}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${n}-step[data-clickable="true"] { cursor: pointer; }
.${n}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${n}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${n}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${n}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${n}-home-row[data-selected="true"] { border-color: var(--primary); }
.${n}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${n}-home-index {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem; border-radius: 999px;
  border: 1px solid var(--border); font-size: .625rem; color: var(--muted-foreground);
}
/*
  What the house IS, straight from the village's own catalogue. Drawn as a
  fixed chip rather than a field because there is nothing here to answer \u2014 the
  question the row asks is who lives in it. The class rides along beside the
  name so "housing" is visible rather than merely stored.
*/
.${n}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${n}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${n}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${n}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${n}-spacer { flex: 1 1 auto; }
.${n}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

/*
  ==============================================================================
  THE TAB ITSELF, AND WHAT IT DOES WHEN THE SCREEN IS A PHONE
  ==============================================================================
*/

/*
  THE HOST, WHICH IS THE ONE BOX EVERY SIZE IN THIS SHEET IS MEASURED AGAINST.

  The Engine makes this element and gives it the classes it was mounted with \u2014
  block, h-full, min-h-0, w-full, from the Home hub \u2014 and nothing else: there is
  no class on it carrying this package's name. So the rules for it are written
  against the TAG, which is the only thing on the element that is ours to name.
  The old .marinara-capability-villages rule was a class the element never had:
  dead on arrival, and the tab stood up anyway only because Tailwind happened to
  say the same three things.

  container-type: size is what makes the tab answerable to the room it was
  actually given rather than to the window. This package is mounted in a tab that
  shares the screen with the Engine's own furniture, and in fullscreen it has the
  whole screen instead \u2014 no viewport query can tell those two apart. A phone held
  sideways is 844x390 and a laptop is 1400x760, so the width is not the telling
  difference and the height is, which is why this is size and not inline-size and
  why the queries at the foot of this sheet ask about both.

  Containment means this element's own size can no longer come from its children,
  which is why the height is stated here outright rather than left to whatever
  mounted it. An element one hundred percent of a definite box is itself
  definite \u2014 the hub's main is flex-1 and this element is h-full inside it \u2014 and
  an element whose percentage ever resolved to auto would now collapse to nothing
  instead of falling back to the size of its content.

  ponytail: that is the ceiling of this line. If this tab is ever mounted into a
  box with no definite height, this is the rule to look at first.

  text-size-adjust is the same argument made the other way round: a phone browser
  will otherwise inflate the text of a page it decides is too small to read, block
  by block and by its own rules, which changes a layout nobody measured and cannot
  be seen from inside this file.
*/
${n} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${n};
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

/*
  FULLSCREEN.

  The HOST goes fullscreen, and only the host. It is the one node the Engine does
  not re-make when the tab re-renders, so it is the one node that can hold the
  whole screen while everything inside it is replaced; put the screen on an inner
  box and the next render throws the fullscreen state away with the box. That is
  also why there is no state here: the browser is already keeping the answer, and
  document.fullscreenElement reads it back.

  One toggle and not two. GachaForge draws a button in its header bar and a second
  one in the corner of its stage, because its header can be pushed off screen;
  this tab's controls live on the picture and travel with it, so the one button is
  always where it was and there is nothing for a second one to cover.

  The map is not stretched to fill the screen, and that is the whole point of
  asking for it: MapStage measures the room it was given and fits the frame to its
  own ratio, so a bigger room gives a bigger map. Filling and fitting are the same
  thing on a 16:9 monitor and are not on a phone, where stretching the height
  would fatten every pin away from the house it was put on.

  The background is stated because a fullscreen element keeps a transparent
  background and the browser paints its own black backdrop behind it: without
  this, every letterboxed inch around the picture would be black rather than the
  Engine's surface.

  The safe-area insets are for the notch, which on a phone held sideways is on the
  LEFT or the RIGHT edge and upright is along the TOP \u2014 and sideways is where the
  chat drawer's own header sits while upright is where the map's controls are now
  drawn. All four sides are written for that reason: which pair matters depends on
  the way up the phone is, and on a phone that is not a phone they are zero. They
  need the Engine's own page to declare a cover viewport to be anything but zero,
  and this package cannot set that: two numbers a package cannot import are being
  written down here a second time.
*/
${n}:fullscreen {
  background: var(--background);
  --${n}-safe-top: env(safe-area-inset-top, 0px);
  --${n}-safe-right: env(safe-area-inset-right, 0px);
  --${n}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${n}-safe-left: env(safe-area-inset-left, 0px);
}
${n}:fullscreen .${n}-root {
  padding:
    calc(var(--${n}-pad) + var(--${n}-safe-top))
    calc(var(--${n}-pad) + var(--${n}-safe-right))
    calc(var(--${n}-pad) + var(--${n}-safe-bottom))
    calc(var(--${n}-pad) + var(--${n}-safe-left));
}
${n}:fullscreen .${n}-home-full {
  padding:
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-top))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-right))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-bottom))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-left));
}

/*
  \u2500\u2500 DORMANT 0.4.45 \u2014 the notice that told a phone held upright to turn over. \u2500\u2500

  This is the one rule in the sheet that decided which way up a phone had to be
  held. It is SWITCHED OFF, and it is not retired: 0.4.45 draws the tab for
  portrait, so there is nothing left for this to answer and nothing left to read
  it \u2014 the four pieces of the component that drew it are dormant beside their own
  definitions, and the RotateNotice element is dormant on the homepage. Left live,
  the media query below would match every portrait phone in the world and put a
  full-bleed panel over the village; the block is commented out for that reason
  and not for tidiness.

  It is kept rather than deleted because the decision is not final. The map is
  still a wide 19:13 surface fitted WHOLE to its frame \u2014 the frame is the two
  numbers above and the reason it is fitted rather than cropped is that a house
  on a corner of the map that nobody can see is a house nobody can open \u2014 and a
  map still wants a wide box. A later lane may decide it wants the map on its side
  again and may want to say so again.

  To bring it back: uncomment this block, uncomment the four pieces of the notice
  beside hostOf, and put the RotateNotice element back on the homepage at the foot
  of the row. Nothing else changed; the rule is exactly what it was.

  What it would take to REMOVE it rather than leave it dormant: nothing. It is a
  media query and a sentence, and neither of them is load-bearing. Delete the
  block and the four pieces when the portrait layout has been lived with and
  nobody wants the sideways map back \u2014 or delete them now, if that is already
  known to be the answer. It is left here unanswered on purpose.
*/
/*
.${n}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${n}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${n}-pad) * 2) var(--${n}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${n}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${n}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${n}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${n}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
*/
/*
  ON A TOUCH SCREEN, EVERY CONTROL IS AT LEAST A THUMB.

  The paddings above draw most of these controls about twenty-six pixels tall:
  comfortable to click with a mouse and too small to tap reliably with a thumb,
  and a control exists to be pressed.

  Forty-four is the number the guidance asks for and it is more than a map can pay
  everywhere \u2014 a taller row is a taller row, and the rows around these are the
  picture \u2014 so the ones that stand in a row of their own take the full amount and
  the ones that sit in a cluster take less, which is still a real improvement over
  twenty-six and still leaves the map its room.

  Only where the pointer is coarse. A finger is not a mouse and a mouse is not a
  thumb: nothing moves on a desktop.

  The square ones are centred as well, because a box grown around a glyph lets the
  glyph sit at the top of it. The map's own pin controls are the exception and are
  left as small as a finger can manage, because every pixel one of them takes is a
  pixel of the picture: a pin's remove button sits on the house, not in a bar.
*/
@media (pointer: coarse) {
  .${n}-button,
  .${n}-select,
  .${n}-search,
  .${n}-notice-input,
  .${n}-macro,
  .${n}-chat-mode-button,
  .${n}-chat-send,
  .${n}-step[data-clickable="true"],
  .${n}-zoom-button,
  .${n}-remove { min-height: 2.25rem; }
  .${n}-icon-button,
  .${n}-chat-mode-button,
  .${n}-chat-send { min-width: 2.25rem; }
  .${n}-zoom-button,
  .${n}-icon-button,
  .${n}-chat-mode-button,
  .${n}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${n}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${n}-textarea { min-height: 4.5rem; }
}

/*
  WHAT THE TAB DOES WHEN IT HAS LESS ROOM.

  Container queries, not window queries, and the container is named. This sheet is
  injected into the document rather than into a shadow root, so it is a global
  stylesheet, and an unnamed query in a global stylesheet is a query that matches
  whatever container happens to be nearest. Naming the host's container says which
  box is being asked about, and there is exactly one.

  Five states: four the tab has always answered to, in the order they take room
  away, and one for the way up a phone is held, which is the release after this
  one and has a block of its own below.

  A tab narrower than 44rem is a phone, or a tab squeezed by the Engine's own side
  panels. The stage is already the whole tab at every width, so what is left for
  this query is the paragraph: the card keeps less of its own padding, because on
  a phone the tab's edges are close enough to be their own margins and every
  pixel spent on a gutter is a pixel off a line the player is reading. The tab's
  own padding comes in with it, so the picture keeps running to the edge.

  A tab shorter than 30rem is a phone held sideways, and very little else. It
  cannot afford the villager a figure as big as the floor would like, and the
  words need the height more than the picture does. The figure shrinks rather than
  the card moving somewhere else: the card is already directly above the composer,
  and a card that moved when the phone turned over would be a different screen
  every time the player shifted their grip. Shrinks, not narrows, and the two are
  not the same edit: it is HEIGHT that this tab is short of, and a square that
  answers a height the tab does not have is a square squeezing the paragraph.

  The figure's own share of the floor is asked for in the FLOOR's units now, so the
  only thing this block still has to say about it is how much of the row to keep
  clear under it: with the plate gone, half a rem is the row's own padding and
  nothing else.

  The tab gives up a row here too, and the row it gives up is the plate. The name
  of the villager is on the card, and the plate only says where they are, so a tab
  with 390 pixels of height spends its last one on the words rather than on the
  place they are said from. The portrait in the card goes with it, and for the
  same reason: the figure is still standing on the floor, and a second copy of it
  in the card is the first thing a short tab can do without.

  These fixes are not cosmetics and the reason is worth writing down, because it
  is a property of the stack rather than of any one row: the bottom stack is
  justified to its END, so anything that does not fit does not extend past the
  composer. It cannot spill upward either \u2014 the floor above it is the flexible
  row, so the stage yields first and the chrome stays where it is. That is the
  whole reason the figure has a floor of its own rather than a place at the head
  of the reading: a row that shrinks is a row nothing can be printed on top of.

  A tab narrower than 34rem gets the Menu as a column of full-width buttons
  instead of a wrapped cluster of ragged ones, which is how a phone draws a menu
  and how a thumb presses one. The figure used to shrink again here and no longer
  has to: a narrow tab is a handset, a handset is a tall tab, and a figure that is
  a share of the floor's height is width-limited by its own rule long before this
  block is reached.

  One ordering hazard runs through all five, and it is worth stating where the
  blocks are: a container query does not raise a rule's weight, so an override
  only wins by being read later. Every rule overridden below is declared a
  thousand lines above, which is why these blocks sit here at the end of the
  sheet rather than beside the rules they belong to.

  A tab that is taller than it is wide is a phone held the way a phone is normally
  held, and it is the case these three were never written for: every one of them
  asks about room, and portrait has the room \u2014 it is the SHAPE of the map that is
  the problem, because a wide picture in a tall box leaves most of the box under
  the picture rather than beside it. That state is the portrait block below, and it
  is the one that decides where the readout and the controls are drawn.
*/
@container ${n} (max-width: 44rem) {
  .${n}-chat { padding: .625rem; }
  .${n}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${n}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${n}-room-screen > .${n}-chat { overflow-y: auto; }
  .${n}-room-screen .${n}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${n}-room-screen .${n}-chat-cast { height: 100%; max-height: none; }
  .${n}-room-screen .${n}-chat-cast-person,
  .${n}-room-screen .${n}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(4rem, 100%); }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${n}-room-screen .${n}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${n}-room-screen .${n}-chat > .${n}-composer { flex: 0 0 auto; }
  .${n}-room-screen .${n}-chat > .${n}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${n} (max-width: 55rem) and (max-height: 32rem) {
  .${n}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${n} (max-height: 30rem) {
  .${n}-chat { gap: .5rem; padding: .625rem; }
  .${n}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${n}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${n}-chat-scene-place { display: none; }
  .${n}-chat-log { gap: .375rem; }
  .${n}-chat-vn-portrait { display: none; }
  .${n}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${n} (min-width: 34rem) and (max-height: 30rem) {
  .${n}-room-screen .${n}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${n}-room-screen .${n}-chat-cast-person { font-size: .5625rem; }
  .${n}-room-screen .${n}-chat-vn,
  .${n}-room-screen .${n}-chat > .${n}-row,
  .${n}-room-screen .${n}-chat > .${n}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${n}-room-screen .${n}-chat-vn { margin-top: auto; }
}
@container ${n} (max-width: 34rem) {
  .${n}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${n}-chat-menu { max-width: 88cqw; }
  .${n}-chat-modes { max-width: 88cqw; }
  .${n}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${n}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${n} (max-width: 34rem) and (max-height: 32rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(3.25rem, 100%); }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 3.5rem; }
}
/*
  A tab shorter than 22rem is 352 pixels of height, and at that height the top
  chrome, the card, the history tab, the composer and its own padding have already
  spent the tab: what is left for the floor is a strip, which is a villager's
  shoulders and nothing else. So this block buys the card's room from the three
  things that can most afford to give it up: the gap between the figure and its
  plate, the ceiling on the paragraph, and the size of the speaker's name.

  It used to take its share from the "right now" line as well, and 0.4.50 deleted
  that line rather than override it here \u2014 there is nothing left in the block to
  hide, so the row of chrome above the card is one badge and one button at every
  height. What the block does now is what it always did underneath: the paragraph
  is the box that shrinks, and the ceiling on it is what stops a long answer
  pushing the composer off a tab this short.

  It is last of the three on purpose: at 640x360 or 390x340 every one of these
  queries matches at once, and the floor is squeezed hardest by whichever block is
  read last. The shares are smaller here than in either block above for the same
  reason.

  ponytail: the ceiling of this block is about 19rem, and it is lower than it used
  to be because the card now carries a face, a name and a paragraph rather than a
  paragraph alone. Under 19rem the chrome, the card and the composer are the whole
  tab and the floor is a strip, so the figure is a strip too \u2014 it is a share of the
  row it stands in, and the row is whatever the card and the composer leave. What
  is accepted here is that a strip is what the player gets: a villager's shoulders
  and not their face. There is no honest alternative left to trade for \u2014 the row is
  the first thing this tab is short of, and the card is what is being read \u2014 and a
  figure that were allowed to keep its size would be a figure with its head above
  the top edge of the tab. If a tab this short ever has to work properly, the fix
  is a compact composer: the figure is already at its floor here and there is
  nothing left to take from the card.
*/
@container ${n} (max-height: 22rem) {
  .${n}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${n}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${n}-chat-vn-name { font-size: .8125rem; }
}

@container ${n} (max-width: 44rem) {
  .${n}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}

/*
  There is no rule here for the way into a roleplay, and its absence is the fix.

  A section of its own used to live at the foot of the drawer: a heading, a verb
  in a row of its own, and a paragraph explaining what the verb does. On a phone
  held sideways that is a hundred and forty pixels of a three-hundred-and-ninety
  pixel drawer, and the drawer pays for it in the only currency it has left \u2014
  the conversation, which came out at twenty-six pixels on an 844x390 screen and
  at NOTHING at all at 844x340 and 740x360, with the villager's square portrait
  flattened to two pixels in the column beside it. The room the player opened the
  drawer for was the thing being spent.

  So the verb is drawn in the drawer's own options menu, where it costs no height
  at all: the list is drawn over the reading rather than beside it, and it is
  closed when it is not being read. The paragraph it used to carry is the button's
  title now, which costs nothing and is where a player looks for it anyway.
*/
/*
  The spawn sheet: the questions asked between pressing Create spinoff chat and
the roleplay existing.

  It is a SHEET over the whole window rather than a panel inside the tab, and
  that is the one thing about it the player has to feel rather than read. Making
a chat is the moment this tab stops being a picture of a village and starts
  being a real roleplay in the player's own library, and a control that simply
  changed a dropdown would let that happen without anybody noticing. The dim is
  gentle on purpose \u2014 the game is still visible behind it and nothing is
  destroyed \u2014 but it is there, because what is about to happen is not a setting.

  Fixed rather than absolute, because the tab scrolls: a sheet anchored to the
  document would open somewhere up the page from wherever the player was
  standing. A transform on an ancestor would make this relative to that ancestor
  instead of to the window \u2014 the one thing that could move it, and the reason
  this is stated here rather than assumed.
*/
.${n}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${n}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${n}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${n}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${n}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${n}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${n}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${n}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${n}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences \u2014 it decides how the
    whole roleplay reads \u2014 and a dropdown hides the consequences behind a click. */
.${n}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${n}-choice:hover { border-color: var(--primary); }
.${n}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${n}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${n}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${n}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${n}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${n}-var-option:hover { border-color: var(--primary); }
.${n}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${n}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${n}-var-list {
  font: inherit; font-size: .75rem; max-width: 100%; min-height: 7rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground); padding: .25rem;
}
/*
  RETIRED 0.4.43 \u2014 the gate: what the tab used to be while one of its villagers
  was away in a scene.

  The whole village was replaced rather than dimmed, and that was the narrative
  rule the old feature was built on \u2014 while the player was doing something with
  one character, the village was not a place to be rearranging. It said so, and
  then gave three ways out: go to the chat, bring them home, or let the link go.

  No element carries these classes any more: the component that drew them,
  SceneGate, is retired next to the place it used to be defined. They are kept for
  the same reason it is \u2014 they are the only drawing of a village standing still,
  and a later lane that wants one again will want them again. Nothing reads a
  -gate- rule, so nothing here costs anything.
*/
.${n}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${n}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${n}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${n}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${n}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${n}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${n}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  The chip's width, released from the host's square.

  The Engine hands every package toolbar control the same class, and that class
  is a fixed square because every other control in that strip is one icon and
  nothing else. This one is not: its whole job is to tell the player that the chat
  they are reading belongs to their village, and an icon cannot tell them that.
  So the width is released here, the label is worn inside the button, and the
  colour, the radius, the border and the states all stay the host's \u2014 this rule
  adds a width and a gap and paints nothing.
*/
.${n}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${n}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${n}-tracker[data-compact="true"] .${n}-tracker-label { display: none; }
.${n}-tracker[data-open="true"] .${n}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own \u2014 only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${n}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${n}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${n}-panel-view-key { color: var(--muted-foreground); }
.${n}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
/*
  The tracker button, which is drawn inside the Engine's own chat chrome rather
  than inside this tab. Its colours and its size are the host's: the class the
  Engine hands over is worn whole, and everything here is only what the host has
  no opinion about \u2014 that the button and its icon share the host's own colour
  rather than this tab's.

  The data-state=done rule below and the spinner under it have nothing to match
  since 0.4.43 \u2014 there is one state now, because there is nothing the chip can be
  waiting for. Kept with the icons they belonged to; see the RETIRED note in the
  chrome further down.

  THE SPINNER HAS AN OWNER AGAIN as of 0.4.47, and it is not this one. It is the
  dot in the corner of a chat that is waiting on a villager \u2014 see chat-pending \u2014
  which is the same animation doing the same job that the chip's spinner did: a
  turn going round while a model is out. The style itself was never the surprise;
  what went missing in 0.4.43 was the thing being waited for.
*/
.${n}-tracker { position: relative; display: inline-flex; align-items: center; }
.${n}-tracker svg { width: 1rem; height: 1rem; }
.${n}-tracker[data-state="done"] { opacity: .7; }
.${n}-spin { animation: ${n}-spin .9s linear infinite; }
@keyframes ${n}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${n}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${n}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${n}-home-full[data-mobile="true"] .${n}-room { min-height: 0; padding: calc(var(--${n}-map-wood) + var(--${n}-map-mat) + 1px); }
.${n}-home-full[data-mobile="true"] .${n}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${n}-home-full[data-mobile="true"] .${n}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${n}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${n}-stage[data-mobile="true"] .${n}-canvas { overflow: hidden; }
.${n}-stage[data-mobile="true"] .${n}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${n}-stage[data-mobile="true"][data-empty="true"] .${n}-canvas { background: var(--background); }
.${n}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${n}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${n}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${n}-home-bar .${n}-button { min-height: 2.5rem; }
.${n}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${n}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${n}-mobile-board-button, .${n}-mobile-menu-button, .${n}-home-bar .${n}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${n}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${n}-mobile-board-button:disabled { opacity: .55; }
.${n}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${n}-home-bar .${n}-news-toggle { position: relative; }
.${n}-home-bar .${n}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${n}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${n}-home-bar .${n}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${n}-home-full[data-mobile="false"] .${n}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${n}-home-full[data-mobile="false"] .${n}-mobile-clock { font-size: .75rem; }
.${n}-stage[data-mobile="true"] .${n}-pin-holder { z-index: 2; }
.${n}-stage .${n}-pin-holder[data-selected="true"] { z-index: 7; }
.${n}-home-full .${n}-pin[data-kind="place"], .${n}-stage[data-mobile="true"] .${n}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${n}-home-full .${n}-pin-photo-card, .${n}-stage[data-mobile="true"] .${n}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${n}-stage[data-mobile="true"] .${n}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${n}-home-full .${n}-pin-photo, .${n}-stage[data-mobile="true"] .${n}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${n}-home-full .${n}-pin-photo img, .${n}-stage[data-mobile="true"] .${n}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-home-full .${n}-pin-photo-tack, .${n}-stage[data-mobile="true"] .${n}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${n}-home-full .${n}-pin-name, .${n}-stage[data-mobile="true"] .${n}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${n}-stage[data-mobile="true"] .${n}-pin[data-kind="person"] { max-width: 7rem; }
.${n}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${n}-pin-photo-card { transition: none; }
.${n}-stage[data-mobile="true"] .${n}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${n}-sectioned-menu .${n}-menu-nav { display: none; }
/* Projects owns the full menu canvas; its phase rail replaces the menu's navigation. */
.${n}-sectioned-menu[data-projects="true"] .${n}-mobile-menu-nav { display: none; }
.${n}-sectioned-menu[data-projects="true"] .${n}-subtitle { display: none; }
.${n}-project-screen { display: grid; gap: 1.25rem; min-height: 0; color: #eef2ff; }
.${n}-project-head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding: .25rem .25rem .5rem; }
.${n}-project-head h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin: .25rem 0; color: #f6f4ff; }
.${n}-project-head p { margin: 0; color: #adbee8; }
.${n}-project-eyebrow { color: #b8adff; font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
.${n}-project-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.${n}-project-slot, .${n}-project-card { border: 1px solid #3f59ab; border-radius: 1rem; background: linear-gradient(145deg, #182b62, #101d44); box-shadow: 0 1rem 2rem #070e2b44; color: #f1f3ff; }
.${n}-project-slot { display: grid; gap: .6rem; min-height: 11rem; text-align: left; padding: 1.3rem; cursor: pointer; }
.${n}-project-slot:hover, .${n}-project-slot:focus-visible { border-color: #a78bfa; box-shadow: 0 0 0 2px #8d6cf6; }
.${n}-project-slot span { color: #aa9eff; font-size: .78rem; font-weight: 800; letter-spacing: .1em; }
.${n}-project-slot strong { font-size: 1.3rem; }
.${n}-project-slot small { color: #b8c6eb; }
.${n}-project-create { grid-column: 1 / -1; }
.${n}-project-layout { display: grid; grid-template-columns: minmax(10rem, 13rem) minmax(19rem, 1fr); gap: 1rem; align-items: start; min-height: 0; }
.${n}-project-rail { display: grid; gap: .6rem; }
.${n}-project-step { display: flex; align-items: center; gap: .7rem; color: #8da2d4; padding: .7rem; border-radius: .7rem; }
.${n}-project-step b { display: grid; place-items: center; flex: 0 0 2.3rem; height: 2.3rem; border: 1px solid #6480cd; border-radius: 50%; }
.${n}-project-step[data-state="active"] { color: white; background: linear-gradient(110deg, #344af1, #192c69); }
.${n}-project-step[data-state="active"] b { background: #8b4cf4; border-color: #8b4cf4; }
.${n}-project-step[data-state="done"] { color: #b8d6ff; }
.${n}-project-card { display: grid; gap: .85rem; padding: 1.25rem; }
.${n}-project-card h3, .${n}-project-card h4 { margin: 0; }
.${n}-project-card p { margin: .1rem 0; line-height: 1.45; color: #c7d4f6; }
.${n}-project-card label { display: grid; gap: .4rem; font-weight: 650; }
.${n}-project-card input:not([type="file"]), .${n}-project-card select, .${n}-project-card textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${n}-project-card textarea { min-height: 7rem; resize: vertical; }
.${n}-project-card > .${n}-button { background: linear-gradient(100deg, #3656f6, #9448ef); color: white; min-height: 2.75rem; }
.${n}-project-material { display: grid; gap: .35rem; border: 1px solid #425ba1; border-radius: .65rem; padding: .7rem; }
.${n}-project-material span { color: #b6c5ea; }
.${n}-project-finish-visit { display: grid; gap: 1rem; max-width: 62rem; margin: 0 auto; padding: 1.25rem; border: 1px solid #536cc0; border-radius: 1rem; background: #142657; color: #f4f6ff; }
.${n}-project-finish-visit header { display: grid; gap: .5rem; }
.${n}-project-finish-visit h2, .${n}-project-finish-visit p { margin: 0; }
.${n}-project-finish-visit label { display: grid; gap: .4rem; }
.${n}-project-finish-visit input:not([type="file"]), .${n}-project-finish-visit textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${n}-project-finish-visit textarea { min-height: 7rem; }
.${n}-project-image { display: grid; gap: .5rem; border-top: 1px solid #425ba1; padding-top: .8rem; }
.${n}-project-image img { max-width: min(100%, 20rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${n}-project-footer { display: flex; justify-content: flex-start; border-top: 1px solid #425ba1; padding-top: .8rem; }
@media (max-width: 700px) { .${n}-project-slots, .${n}-project-layout { grid-template-columns: 1fr; } .${n}-project-rail { display: flex; overflow-x: auto; } .${n}-project-step { flex: 0 0 9rem; } }
.${n}-mobile-menu-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .5rem; }
.${n}-mobile-menu-nav .${n}-button { min-height: 2.75rem; text-align: left; }
.${n}-mobile-menu-nav .${n}-status { grid-column: 1 / -1; margin: 0; line-height: 1.45; }
.${n}-sectioned-menu[data-section="index"] > .${n}-panel, .${n}-sectioned-menu[data-section="index"] > .${n}-menu-body { display: none; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-overlay { border: .8rem solid #9e6835; border-radius: .5rem; background: repeating-linear-gradient(90deg, #ba854d 0 21px, #a9733d 21px 24px); box-shadow: inset 0 0 0 2px #6b3d1e, 0 .5rem 1rem #0005; padding: .8rem; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-notice-row { border: 1px solid #d9c69c; background: #fff7db; color: #33281d; padding: .6rem; box-shadow: 1px 2px 3px #0005; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-notice-author { color: #33281d; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-overlay-head > .${n}-panel-title { color: #2e2116; font-size: 1rem; }
.${n}-sectioned-menu[data-mobile="false"] .${n}-mobile-menu-nav { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
.${n}-sectioned-menu[data-mobile="false"] .${n}-mobile-menu-nav .${n}-button { min-height: 2.5rem; }
.${n}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${n}-setup-map-viewport:has(> .${n}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${n}-setup-map-viewport > .${n}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${n}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${n}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${n}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${n}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${n}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${n}-setup-venue-card img, .${n}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${n}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${n}-pin-photo-card { transition: none; } }
.${n}-setup-venue-card strong, .${n}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${n}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${n}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${n}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${n}-settle 2.5s ease-in-out infinite; }
@keyframes ${n}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${n}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${n}-root.${n}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${n}-room-screen .${n}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${n}-room-screen .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${n}-room-screen .${n}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${n}-room-screen .${n}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${n}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${n}-room-screen .${n}-chat-history-toggle { min-height: 2rem; }
.${n}-room-screen .${n}-composer { min-width: 0; }
.${n}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${n}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${n}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${n}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${n}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${n}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${n}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${n}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${n}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${n}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${n}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${n}-room-mode-toggle:focus-visible, .${n}-room-mode-menu button:focus-visible, .${n}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${n}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${n}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${n}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${n}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${n}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${n}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${n}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${n} (max-width: 44rem) { .${n}-room-screen .${n}-chat-vn { width: 100%; padding: .45rem; } .${n}-room-screen .${n}-chat-vn-asides { width: min(85%, 22rem); } .${n}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${n} (min-width: 34rem) and (max-height: 30rem) { .${n}-room-screen .${n}-chat-vn { width: 64%; align-self: flex-end; } }
.${n}-room-screen[data-mobile="true"] .${n}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${n}-room-screen[data-mobile="true"] .${n}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${n}-room-screen[data-mobile="true"] .${n}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-memory-backdrop { padding: .5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

/* Venue visits use a single shallow reading dock so the stage owns the remaining height. */
.${n}-room-screen > .${n}-chat { gap: 0; padding: 0; overflow: hidden; }
.${n}-room-screen .${n}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${n}-room-screen .${n}-chat-vignette { opacity: .45; }
.${n}-room-screen .${n}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${n}-room-place, .${n}-room-actions-trigger, .${n}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${n}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${n}-room-screen .${n}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${n}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${n}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${n}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${n}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${n}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${n}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${n}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${n}-room-screen .${n}-room-stars, .${n}-room-screen[data-mobile="true"] .${n}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${n}-room-screen .${n}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${n}-room-screen .${n}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${n}-room-screen .${n}-chat-cast-person,
.${n}-room-screen .${n}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${n}-room-screen .${n}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${n}-room-screen .${n}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${n}-room-screen .${n}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(8rem, 80%); }
.${n}-room-screen .${n}-chat-cast-person > span:not(.${n}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${n}-room-screen .${n}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${n}-room-screen .${n}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${n}-room-screen .${n}-chat[data-opening-error="true"] .${n}-chat-vn { display: flex; }
.${n}-room-screen .${n}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${n}-room-screen .${n}-chat-vn-row { padding: 0; }
.${n}-room-screen .${n}-chat-vn-column { gap: .18rem; }
.${n}-room-screen .${n}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${n}-room-screen .${n}-chat-vn-text,
.${n}-room-screen .${n}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${n}-room-screen .${n}-chat-vn-name,
.${n}-room-screen .${n}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${n}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${n}-room-panel-tools .${n}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${n}-room-panel-tools .${n}-chat-vn-counter { justify-self: center; }
.${n}-room-panel-tools .${n}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${n}-room-panel-tools .${n}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${n}-room-screen .${n}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${n}-room-screen .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${n}-room-screen .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${n}-room-screen .${n}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${n}-room-screen .${n}-chat-input > .${n}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${n}-room-actions-trigger:focus-visible, .${n}-room-actions-menu button:focus-visible, .${n}-room-notices-trigger:focus-visible, .${n}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${n} (max-width: 44rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${n}-room-screen .${n}-chat-cast-person, .${n}-room-screen .${n}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 100%; }
  .${n}-room-screen .${n}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${n}-room-screen .${n}-chat-vn-asides, .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${n}-room-screen .${n}-chat-vn-asides[data-side="left"], .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${n} (max-height: 30rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${n}-room-screen .${n}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${n}-room-screen .${n}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${n} (max-width: 44rem) and (min-height: 40rem) {
  .${n}-room-screen .${n}-chat-vn-asides, .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
@media (prefers-reduced-motion: reduce) { .${n}-room-screen .${n}-chat-cast-person { transition: none; } }
`;function F0(){let e=document.getElementById(Q0);if(!document.querySelector(n)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=Q0,t.textContent=J2,document.head.appendChild(t)}var F2="marinara_admin_secret";function v1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(F2)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var W2="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function y1(e,t,a){let i=e?.error,r=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${W2} (${r})`):new Error(r)}async function D(e,t){let a=await fetch(`${U2}${e}`,{...t,headers:v1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw y1(i,a.status,`The village replied ${a.status}.`);return O0(i)}async function Kp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:v1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw y1(i,a.status,`The Engine replied ${a.status}.`);return i}var bo=e=>typeof e=="number"&&Number.isFinite(e);function Jp(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:r,srcWidth:s,srcHeight:c}=a;if(bo(i)&&bo(r)&&bo(s)&&bo(c))return s<=0||c<=0||i<0||r<0||i+s>1.001||r+c>1.001?null:{srcX:i,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:f,fullImage:$}=a;return!bo(d)||d<=0||!bo(h)||!bo(f)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:d,offsetX:h,offsetY:f}:{zoom:d,offsetX:h,offsetY:f,fullImage:$}}function eS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function tS(e,t){if(e.length===0)return{};let a=await Kp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:Jp(r.avatarCrop)})}return i}async function aS(e,t){let a=e.trim();if(a.length===0)return null;let i=await Kp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return r.length===0?null:{url:r,crop:Jp(i.avatarCrop)}}function nS(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function q(e,t){return e instanceof Error&&e.message?e.message:t}function Ur(e){let t=q(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function W0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function e1(e,t){try{let{visit:a}=await D(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return I0(a,t)?a:null}catch{return null}}function t1(e){let t=q(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Zu(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function qr(e,t){return w1(A0(e),t)}function w1(e,t){let a=0;return e.map(i=>{let r=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,o.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},r);case"link":return(0,o.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},r);default:return iS(i,r)}})}function iS(e,t){let a=w1(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function oS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function jr(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var $1=["residence","workplace","gathering","other"];function yn(e){return e.classes?.length?e.classes:jr(e)?["residence"]:["other"]}function a1(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Pu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function St(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function n1({draft:e,existing:t,villagers:a,editableClasses:i,onChange:r}){let s=yn(e),c=(d,h)=>{let f=s.map($=>$===d?{...St(e,$),...h}:St(e,$));r({...e,spaces:f,description:f[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,o.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&Pu(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&Pu(e)>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:$1.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let f=h.target.checked?[...s,d]:s.filter($=>$!==d);f.length<1||f.length>2||r({...e,classes:f,spaces:f.map($=>St(e,$))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(f=>f!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=St(e,d);return(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:f=>c(d,{description:f.target.value})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:f=>c(d,{state:{...h.state,condition:f.target.value}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:f=>c(d,{state:{...h.state,items:f.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:f=>c(d,{state:{...h.state,publicFacts:f.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((f,$)=>(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,value:f.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(d,{state:{...h.state,features:h.state.features.map(g=>g.id===f.id?{...g,text:x.target.value}:g)}})}),(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:f.locked,onChange:x=>c(d,{state:{...h.state,features:h.state.features.map(g=>g.id===f.id?{...g,locked:x.target.checked}:g)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(x=>x.id!==f.id)}}),children:"\xD7"})]},f.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:Uu(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function Zp(e){return e.filter(t=>jr(t))}function Xn(e){return e.filter(t=>!jr(t)||yn(t).some(a=>a!=="residence"))}function rS(e,t){let a=Zp(e);return a.length!==t.length?!1:t.every((i,r)=>{let s=a[r];return s.id===i.id&&s.name===i.name&&(s.form??"Home")===i.form&&s.occupancy.playerHome===i.isPlayerHome&&s.occupancy.residentCharacterId===i.characterId&&s.description===i.description&&Math.abs((s.presentation.x??-1)-(i.x??-1))<1e-4&&Math.abs((s.presentation.y??-1)-(i.y??-1))<1e-4})}function sS(e,t){let a=new Map(e.map(r=>[r.id,r]));return[...t.map(r=>{let s=a.get(r.id);return{id:r.id,name:r.name,form:r.form,classes:["residence"],spaces:[{...St(s??{id:r.id,name:r.name,description:r.description,category:"",presentation:{image:null,x:r.x,y:r.y},occupancy:{playerHome:r.isPlayerHome,residentCharacterId:r.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:r.description}],residenceCapacity:s?.residenceCapacity??1,residentIds:r.characterId?[r.characterId]:[],improvements:s?.improvements??[null,null],description:r.description,category:s?.category??"",presentation:{image:s?.presentation.image??null,x:r.x,y:r.y},occupancy:{playerHome:r.isPlayerHome,residentCharacterId:r.characterId,homeKind:null},capabilities:s?.capabilities??[],state:s?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(r=>!jr(r))]}function pl(){return Math.random().toString(36).slice(2,10)}function vo(e){return Math.round(e*1e4)/1e4}var lS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),x1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),cS=6e4,uS=700;function i1(e){return`${lS.format(e)} \xB7 ${x1.format(e)}`}function dS(){let[e,t]=(0,m.useState)(()=>i1(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(i1(new Date)),1e3);return()=>clearInterval(a)},[]),e}function hS(){let[e,t]=dS().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function mS({weather:e}){return(0,o.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,o.jsx)(hS,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:pS(e)})]})}function pS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function o1(e){return e?.closest(n)??null}function gS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(o1(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:r=>{let s=o1(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function fS({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,o.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${n}-news-panel`,children:[(0,o.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function N1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function bS(e){return e.length>0?N1(e,!0):"Empty house"}function r1(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function s1(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function vS(e,t){return t.length>0?N1(t,!0):e.name||"An empty house"}function Gu(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var yS=.028;function Br(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function Up(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var l1=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function qp(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var wS=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function Bp(e,t,a){return e<t?t:e>a?a:e}function $S(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*i,s=e.height*i;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function xS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Yu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function jp({src:e,alt:t,pins:a,placing:i,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:f,compact:$,fitToRoom:x,mobile:g,photoPins:b,children:A}){let C=d!==void 0,M=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,k]=(0,m.useState)(null),[V,P]=(0,m.useState)(null),[H,L]=(0,m.useState)(null),ve=(0,m.useRef)(null),Z=(0,m.useRef)(new Map),De=(0,m.useRef)(null),[tt,Sa]=(0,m.useState)(null),[bt,Vt]=(0,m.useState)(null),at=(0,m.useRef)(null),j=(0,m.useRef)(null),te=(0,m.useRef)(!1),[Ke,Kt]=(0,m.useState)(null),he=(0,m.useMemo)(()=>Ke?{...r,...Ke}:r,[Ke,r]),se=e?v?.src===e?v:null:s,wn={zoom:se&&V?qu(se,V):1,centerX:.5,centerY:.5},Dt=H??wn,K=(0,m.useMemo)(()=>g?se&&V?Mp(se,V,Dt):null:e?v&&v.src===e&&V?$S(v,V,he):null:V?{left:0,top:0,width:V.width,height:V.height}:null,[v,V,he,g,se,Dt,e]);(0,m.useEffect)(()=>{L(null),ve.current=null,Z.current.clear(),De.current=null},[e,V?.width,V?.height]);let Jt=s?x&&tt?{width:`${tt.width}px`,height:`${tt.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Ft=(0,m.useCallback)(()=>{let z=y.current;if(!z)return;let U=z.getBoundingClientRect();U.width===0||U.height===0||P(oe=>oe&&oe.width===U.width&&oe.height===U.height?oe:{width:U.width,height:U.height})},[]);(0,m.useEffect)(()=>{let z=y.current;if(!z||typeof ResizeObserver>"u")return;let U=new ResizeObserver(()=>Ft());return U.observe(z),()=>U.disconnect()},[Ft]);let Wt=(0,m.useCallback)(()=>{let z=w.current?.parentElement;if(!z||!s)return;let U=z.getBoundingClientRect(),oe=getComputedStyle(z),pe=S=>Number.parseFloat(oe.getPropertyValue(S))||0,we=U.width-pe("padding-left")-pe("padding-right"),lt=U.height-pe("padding-top")-pe("padding-bottom"),Ue=s.width/s.height,Se=Math.min(we,lt*Ue);Se>0&&Sa(S=>S&&Math.abs(S.width-Se)<.5?S:{width:Se,height:Se/Ue})},[s]);(0,m.useLayoutEffect)(()=>{if(!x||(Wt(),typeof ResizeObserver>"u"))return;let z=w.current?.parentElement;if(!z)return;let U=new ResizeObserver(()=>Wt());return U.observe(z),()=>U.disconnect()},[x,Wt]);let qt=(0,m.useCallback)(z=>{if(!C||!d||!K)return;let U=z.currentTarget.getBoundingClientRect(),oe=(z.clientX-U.left-K.left)/K.width,pe=(z.clientY-U.top-K.top)/K.height;if(!(oe>=0&&oe<=1)||!(pe>=0&&pe<=1))return;let lt=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(vo(oe),vo(pe),{width:K.width,height:K.height,photoWidth:lt?.width??58,photoHeight:lt?.height??58})},[d,C,K]),Je=(0,m.useCallback)(z=>{if(!M||!K||!h||he.fit!=="cover")return;let U=z.currentTarget.getBoundingClientRect();at.current={x:z.clientX,y:z.clientY,focusX:he.focusX,focusY:he.focusY,spanX:U.width-K.width,spanY:U.height-K.height},Kt({focusX:he.focusX,focusY:he.focusY}),z.currentTarget.setPointerCapture(z.pointerId),z.preventDefault()},[M,he.focusX,he.focusY,he.fit,h,K]),Ze=(0,m.useCallback)(z=>{let U=at.current;if(!U)return;let oe=U.spanX===0?U.focusX:U.focusX+(z.clientX-U.x)/U.spanX*100,pe=U.spanY===0?U.focusY:U.focusY+(z.clientY-U.y)/U.spanY*100;Kt({focusX:vo(Bp(oe,0,100)),focusY:vo(Bp(pe,0,100))})},[]),vt=(0,m.useCallback)(z=>{if(!at.current)return;at.current=null,z.currentTarget.hasPointerCapture(z.pointerId)&&z.currentTarget.releasePointerCapture(z.pointerId);let U=Ke;Kt(null),U&&h&&h({...r,...U})},[Ke,h,r]),it=(0,m.useCallback)(z=>{!h||!c||h({...r,zoom:vo(Bp(z,c.min,c.max))})},[h,r,c]),ea=()=>{let z=[...Z.current.values()];if(z.length===0){De.current=null;return}let U=z[0],oe=z[1];De.current={view:ve.current??Dt,x:oe?(U.x+oe.x)/2:U.x,y:oe?(U.y+oe.y)/2:U.y,distance:oe?Math.hypot(U.x-oe.x,U.y-oe.y):1}},Y=z=>{if(!g||z.pointerType!=="touch"||(z.isPrimary&&(Z.current.clear(),te.current=!1),!y.current)||z.target instanceof Element&&z.target.closest(`.${n}-doors, .${n}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let U=y.current.getBoundingClientRect();Z.current.set(z.pointerId,{x:z.clientX-U.left,y:z.clientY-U.top}),Z.current.size>1&&(te.current=!0),ea()},le=z=>{if(!g||!Z.current.has(z.pointerId)||!se||!V||!y.current)return;let U=y.current.getBoundingClientRect();Z.current.set(z.pointerId,{x:z.clientX-U.left,y:z.clientY-U.top});let oe=[...Z.current.values()],pe=oe[0],we=oe[1],lt=we?(pe.x+we.x)/2:pe.x,Ue=we?(pe.y+we.y)/2:pe.y,Se=we?Math.hypot(pe.x-we.x,pe.y-we.y):1,S=De.current;if(!S||!q0(S,{x:lt,y:Ue,distance:Se})&&!te.current)return;te.current||f?.(),te.current=!0;let xe=B0(se,V,S.view,{x:S.x,y:S.y},{x:lt,y:Ue},we&&S.distance>0?Se/S.distance:1);ve.current=xe,L(xe)},ie=(z,U=!1)=>{if(!g||!Z.current.has(z.pointerId))return;let oe=!U&&Z.current.size===1&&!te.current;if(Z.current.delete(z.pointerId),Z.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),ea(),!oe||!(z.target instanceof Element))return;let pe=z.target.closest(`.${n}-pin`)?.dataset.pinId,we=pe?a.find(lt=>lt.id===pe):null;if(we?.onSelect){te.current=!0,we.onSelect();return}if(!(!z.target.closest(`.${n}-canvas`)||z.target.closest("button")))if(C&&i&&d&&K){let lt=y.current.getBoundingClientRect(),Ue=(z.clientX-lt.left-K.left)/K.width,Se=(z.clientY-lt.top-K.top)/K.height;if(Ue>=0&&Ue<=1&&Se>=0&&Se<=1){te.current=!0;let me=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(vo(Ue),vo(Se),{width:K.width,height:K.height,photoWidth:me?.width??72,photoHeight:me?.height??72})}}else f&&(te.current=!0,f())};return(0,o.jsxs)("div",{ref:w,className:`${n}-stage${$?` ${n}-stage-compact`:""}`,style:Jt,"data-shaped":s?"true":"false","data-framing":M&&he.fit==="cover"?"true":"false","data-mobile":g?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:z=>{if(g){Y(z);return}te.current=!1,j.current=z.pointerType==="touch"?{x:z.clientX,y:z.clientY}:null},onPointerMoveCapture:z=>{if(g){le(z);return}let U=j.current;U&&(Math.abs(z.clientX-U.x)>8||Math.abs(z.clientY-U.y)>8)&&(te.current=!0)},onPointerUpCapture:g?ie:void 0,onPointerCancelCapture:z=>{g&&ie(z,!0),j.current&&(te.current=!0)},onClickCapture:z=>{te.current&&(te.current=!1,z.preventDefault(),z.stopPropagation())},children:[A,(0,o.jsxs)("div",{ref:y,className:`${n}-canvas`,"data-placing":C&&i?"true":"false","data-dragging":Ke?"true":"false",onClick:C&&i?qt:f?()=>f():void 0,onPointerDown:M?Je:void 0,onPointerMove:M?Ze:void 0,onPointerUp:M?vt:void 0,onPointerCancel:M?vt:void 0,children:[e?(0,o.jsx)("img",{className:`${n}-canvas-img`,style:g&&K?{position:"absolute",left:K.left,top:K.top,width:K.width,height:K.height,objectFit:"fill"}:xS(he),src:e,alt:t,draggable:!1,onLoad:z=>{let{naturalWidth:U,naturalHeight:oe}=z.currentTarget;U<=0||oe<=0||(k({src:e,width:U,height:oe}),Ft())},onError:()=>Vt(e)}):(0,o.jsxs)(o.Fragment,{children:[g&&K?(0,o.jsx)("span",{className:`${n}-mobile-logical`,style:{left:K.left,top:K.top,width:K.width,height:K.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&bt===e?(0,o.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,K?a.map(z=>(0,o.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":z.selected?"true":"false",style:{left:`${K.left+z.x*K.width}px`,top:`${K.top+(z.y+(g&&z.kind!=="person"?0:z.dy??0))*K.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":z.id,"data-tone":z.tone,"data-kind":z.kind??"place","data-selected":z.selected?"true":"false","aria-expanded":z.doors?!0:void 0,disabled:z.onSelect===void 0,title:z.text,onClick:U=>{U.stopPropagation(),z.onSelect?.()},children:(g||b)&&z.kind!=="person"?(0,o.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${L0(g?j0(Dt.zoom,wn.zoom):q2,z.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[z.image?(0,o.jsx)("img",{src:z.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:z.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:z.text})]})}),z.onRemove?(0,o.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${z.text} off the map`,onClick:U=>{U.stopPropagation(),z.onRemove?.()},children:"\xD7"}):null,z.onResume?(0,o.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:U=>{U.stopPropagation(),z.onResume?.()},children:"DEBUG: Resume Chat"}):null]},z.id)):null]}),K?a.filter(z=>z.doors!==void 0&&z.doors.length>0).map(z=>(0,o.jsx)("div",{className:`${n}-doors`,style:{left:`${V?Op(K,V,z).left:K.left+z.x*K.width}px`,top:`${V?Op(K,V,z).top:K.top+(z.y+(z.dy??0))*K.height}px`},children:z.doors?.map(U=>(0,o.jsx)("button",{type:"button",className:`${n}-door`,onClick:oe=>{oe.stopPropagation(),U.onSelect()},children:U.label},U.label))},`doors:${z.id}`)):null,M&&c&&he.fit==="cover"?(0,o.jsxs)("div",{className:`${n}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:he.zoom>=c.max,onClick:()=>it(he.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:he.zoom<=c.min,onClick:()=>it(he.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:he.focusX===50&&he.focusY===50&&he.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function yo(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function NS({scenario:e}){let t=j2(e),[a,i]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${wo(e).label} village scene`,onError:()=>i(t)}),(0,o.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:wo(e).description})]})]})}function SS({label:e,choices:t,selectedId:a,onSelect:i,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>i(c.id),children:[(0,o.jsx)($o,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${n}-hint`,children:s})}function kS({value:e}){return(0,o.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)($o,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function c1(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,i>0?i:r>0?r:a.length).trimEnd()}\u2026`}function u1(e){return e.avatarPath?{url:e.avatarPath,crop:Jp(e.avatarCrop)}:void 0}function TS({personas:e,draft:t,onDraft:a,disabled:i}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,f]=(0,m.useState)(""),$=e?.find(C=>C.id===t),x=$?.id,g=r.trim().toLocaleLowerCase(),b=(e??[]).filter(C=>!g||`${C.name} ${C.summary}`.toLocaleLowerCase().includes(g)).sort((C,M)=>C.name.localeCompare(M.name,void 0,{sensitivity:"base"})).map(C=>({id:C.id,name:C.name,portrait:u1(C),hint:C.summary}));(0,m.useEffect)(()=>{if(d(null),f(""),!t||!x)return;let C=new AbortController;return D(`/personas/${encodeURIComponent(t)}`,{signal:C.signal}).then(M=>{C.signal.aborted||d(M.persona)}).catch(M=>{C.signal.aborted||f(q(M,"This Persona could not be read."))}),()=>C.abort()},[t,x]);let A=c&&c.id===t?{id:c.id,name:c.name,portrait:u1(c),overview:c1(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,C])=>C.trim()).map(([C,M])=>({label:C,text:c1(M,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:C=>s(C.target.value),disabled:i||e===null})]}),(0,o.jsx)(SS,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):A?(0,o.jsx)(kS,{value:A}):h?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):$?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function ES({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(g=>g.id===a)??null,f=h?.name??(a===r?s:""),$=c&&a===r,x=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:g=>i(g.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(g=>(0,o.jsx)("option",{value:g.id,children:g.isActive?`${g.name} \u2014 your Persona`:g.name},g.id))]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(g=>g.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":f.length>0?`The villagers know you as ${f}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function d1({books:e,error:t,selected:a,onChange:i,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),f=a.filter(b=>!d.has(b)),x=[...h,...f.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),g=x.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,o.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(b)?.name??b,e===null?" (checking)":d.has(b)?d.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(b)?.name??b}`,disabled:r,onClick:()=>i(a.filter(A=>A!==b)),children:"\xD7"})]},b)):(0,o.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${n}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,o.jsxs)("div",{className:`${n}-lore-results`,children:[g.map(b=>{let A=a.includes(b.id),C=f.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${n}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:A,disabled:r||!b.enabled&&!A||!A&&a.length>=24,onChange:()=>i(A?a.filter(M=>M!==b.id):[...a,b.id])}),b.name,C?` (${C})`:""]},b.id)}),e!==null&&x.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,x.length>g.length?(0,o.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function CS({homes:e,villagers:t,disabled:a,selectedId:i,onPatch:r,onRemove:s,onSelect:c,lockedIds:d,showDescriptions:h,onGenerateDescription:f}){let $=new Set(e.map(x=>x.characterId));return(0,o.jsx)("div",{className:`${n}-home-list`,children:e.map((x,g)=>{let b=d?.has(x.id)??!1,A=t.find(C=>C.id===x.characterId)?.name??"";return(0,o.jsxs)("div",{className:`${n}-home-row`,"data-selected":x.id===i?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,o.jsx)("span",{className:`${n}-home-index`,"aria-hidden":"true",children:g+1}),x.isPlayerHome?(0,o.jsx)("span",{className:`${n}-who`,children:"You live here"}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{className:`${n}-who`,children:A?`${A} lives here`:"No villager lives here"}),t.length>0?(0,o.jsxs)("select",{className:`${n}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${g+1}`,onChange:C=>r(x.id,{characterId:C.target.value||null}),children:[(0,o.jsx)("option",{value:"",children:"Nobody yet"}),t.map(C=>{let M=C.id!==x.characterId&&$.has(C.id);return(0,o.jsx)("option",{value:C.id,disabled:M,children:M?`${C.name} \u2014 already housed`:C.name},C.id)})]}):null]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Venue name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:C=>r(x.id,{name:C.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form \xB7 what is it?",(0,o.jsx)("input",{className:`${n}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:C=>r(x.id,{form:C.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("textarea",{className:`${n}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${g+1}`,onChange:C=>r(x.id,{description:C.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:a||b,onClick:()=>f?.(x),children:"Generate description draft"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-remove`,disabled:a||b,"aria-label":`Take home ${g+1} off the map`,onClick:()=>s(x.id),children:"\xD7"}),b?(0,o.jsx)("span",{className:`${n}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function h1({id:e,label:t,hint:a,options:i,value:r,disabled:s,onChange:c}){let d=r.length>0&&!i.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${n}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a})]})}function Lp({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[f,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let M=!1;return(async()=>{try{let[w,y]=await Promise.all([D("/connections"),Kp("/api/connections")]);if(M)return;r(w),c(nS(Array.isArray(y)?y:[]))}catch(w){M||h(q(w,"This agent's connections could not be read."))}})(),()=>{M=!0}},[]);let x=(0,m.useCallback)(async M=>{$(!0),h("");try{r(await D("/connections",{method:"PUT",body:JSON.stringify(M)}))}catch(w){h(q(w,"That connection could not be saved."))}finally{$(!1)}},[]),g=s.filter(M=>M.category==="language"),b=s.filter(M=>M.category==="image_generation"),A=b.some(M=>M.defaultForAgents),C=i!==null&&(i.imageConnectionId===_p||b.length===0||i.imageConnectionId.length===0&&!A);return(0,m.useEffect)(()=>{if(!e)return;let M=i?.systemConnectionId??"",w=i?.narrationConnectionId??"";i?M.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!g.some(y=>y.id===M)||!g.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,g]),(0,m.useEffect)(()=>{t?.(C)},[C,t]),(0,o.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,o.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,o.jsx)(h1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:g,value:i.systemConnectionId,disabled:f,onChange:M=>{x({systemConnectionId:M})}}),(0,o.jsx)(h1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:g,value:i.narrationConnectionId,disabled:f,onChange:M=>{x({narrationConnectionId:M})}}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:f,onChange:M=>{x({imageConnectionId:M.target.value})},children:[(0,o.jsx)("option",{value:_p,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==_p&&!b.some(M=>M.id===i.imageConnectionId)?(0,o.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(M=>(0,o.jsx)("option",{value:M.id,children:M.name},M.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function S1(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let f=!1;return D("/narration").then($=>{f||t($)}).catch($=>{f||i(q($,"Village writing settings could not be read."))}),()=>{f=!0}},[]);let h=(0,m.useCallback)(async f=>{s(!0),d(!1),i("");try{let $=await D("/narration",{method:"PUT",body:JSON.stringify(f)});return t($),d(!0),$}catch($){return i(q($,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function zS(){let{view:e,error:t,busy:a,saved:i,save:r}=S1(),[s,c]=(0,m.useState)(null),d=s??e?.styleInstructions??"";return(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Narration style"}),(0,o.jsx)("p",{className:n+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Narration style",value:d,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.styleInstructions,onClick:()=>{r({styleInstructions:d}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.defaultStyleInstructions,onClick:()=>{r({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading narration style\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function AS(){let{view:e,error:t,busy:a,saved:i,save:r}=S1(),[s,c]=(0,m.useState)(null),d=s??e?.replyGuidance??"";return(0,o.jsxs)("section",{className:n+"-panel",children:[(0,o.jsx)("h2",{className:n+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,o.jsx)("p",{className:n+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Villager reply guidance",value:d,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.replyGuidance,onClick:()=>{r({replyGuidance:d}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.defaultReplyGuidance,onClick:()=>{r({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Show built-in guidance"}),(0,o.jsx)("pre",{className:n+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function $o({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:eS(e.crop)}):i==="person"?(0,o.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function RS({villager:e,portrait:t,selected:a,onSelect:i}){return(0,o.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-tile-head`,children:[(0,o.jsx)($o,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${n}-tag`,children:r},r))]})]})}function m1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function MS(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,g)=>{let b=A=>{let C=Xu.indexOf(A);return C<0?Xu.length:C};return b(x.label)-b(g.label)||x.label.localeCompare(g.label)||x.view.localeCompare(g.view)}),i=512,r=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let g=a[x],b=new Image;b.src=g.url,await b.decode();let A=x%s*i,C=Math.floor(x/s)*r,M=Math.min(i/b.naturalWidth,r/b.naturalHeight),w=Math.round(b.naturalWidth*M),y=Math.round(b.naturalHeight*M);d.drawImage(b,A+Math.floor((i-w)/2),C+r-y,w,y),h.push({view:g.view,expression:g.label,x:A,y:C,width:i,height:r})}let f=await new Promise((x,g)=>c.toBlob(b=>b?x(b):g(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";m1(`${$}-sprites.png`,f),m1(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function OS({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[i,r]=(0,m.useState)("front"),[s,c]=(0,m.useState)("neutral"),[d,h]=(0,m.useState)(""),[f,$]=(0,m.useState)(""),[x,g]=(0,m.useState)(!0),[b,A]=(0,m.useState)(null),[C,M]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,k]=(0,m.useState)(""),[V,P]=(0,m.useState)(""),H=(0,m.useRef)(null),L=e.sprite?.images??[],ve=L.filter(j=>j.view===i),Z=L.some(j=>j.view==="front"&&j.label==="neutral"),De=ve.some(j=>j.label==="neutral"),tt=s==="custom"?d.trim().toLowerCase().replace(/\s+/g,"_"):s,Sa=ve.find(j=>j.label===tt),bt=[...Xu,...L.map(j=>j.label).filter(j=>!Xu.includes(j))].filter((j,te,Ke)=>Ke.indexOf(j)===te);(0,m.useEffect)(()=>{A(null),r("front"),c("neutral"),k(""),D(`${a}/source`).then(j=>M(j.sprites)).catch(()=>M([]))},[a]);async function Vt(j){y(!0),k(""),P("");try{await j()}catch(te){k(q(te,"The sprite could not be prepared."))}finally{y(!1)}}function at(){if(!/^[a-z0-9_-]{1,40}$/.test(tt))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(i==="side"&&!Z)throw new Error("Approve the front neutral sprite first.");if(tt!=="neutral"&&!De)throw new Error(`Approve the ${i} neutral sprite first.`);return tt}return(0,o.jsxs)("section",{className:`${n}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,o.jsxs)("div",{className:`${n}-sprite-heading`,children:[(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,o.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,o.jsxs)("span",{className:`${n}-sprite-count`,children:[L.length," approved"]})]}),(0,o.jsx)("div",{className:`${n}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(j=>(0,o.jsxs)("button",{type:"button",className:`${n}-sprite-view`,"aria-pressed":i===j,"data-active":i===j?"true":"false",disabled:w,onClick:()=>{r(j),c("neutral"),A(null)},children:[(0,o.jsx)("strong",{children:j==="front"?"Facing you":"Facing villagers"}),(0,o.jsxs)("span",{children:[L.filter(te=>te.view===j).length," approved \xB7"," ",j==="front"?"front":"side, mirrored left or right"]})]},j))}),(0,o.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,o.jsx)("strong",{children:"Choose an expression"}),(0,o.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,o.jsxs)("div",{className:`${n}-sprite-choices`,children:[bt.map(j=>{let te=ve.find(Ke=>Ke.label===j);return(0,o.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s===j?"true":"false","aria-pressed":s===j,disabled:w,onClick:()=>{c(j),A(null)},children:[(0,o.jsx)("span",{className:`${n}-sprite-choice-art`,children:te?(0,o.jsx)("img",{src:te.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,o.jsx)("span",{children:j}),(0,o.jsx)("small",{children:te?"Approved":"Open"})]},j)}),(0,o.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s==="custom"?"true":"false","aria-pressed":s==="custom",disabled:w,onClick:()=>{c("custom"),A(null)},children:[(0,o.jsx)("span",{className:`${n}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,o.jsx)("span",{children:"Custom"}),(0,o.jsx)("small",{children:"Name your own"})]})]}),s==="custom"?(0,o.jsxs)("label",{children:["Custom expression name",(0,o.jsx)("input",{value:d,maxLength:40,disabled:w,onChange:j=>{h(j.target.value),A(null)}})]}):null,(0,o.jsxs)("div",{className:`${n}-sprite-selected`,children:[(0,o.jsxs)("strong",{children:[i==="front"?"Front":"Side"," \xB7 ",tt||"custom"]}),(0,o.jsx)("span",{children:Sa?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),i==="side"&&!Z?(0,o.jsx)("p",{className:`${n}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,tt!=="neutral"&&!De?(0,o.jsx)("p",{className:`${n}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,o.jsxs)("label",{children:["Appearance details for generation",(0,o.jsx)("textarea",{value:f,maxLength:2e3,disabled:w,onChange:j=>$(j.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,o.jsxs)("label",{className:`${n}-row`,children:[(0,o.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:j=>g(j.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,o.jsxs)("div",{className:`${n}-sprite-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!Z||tt!=="neutral"&&!De,onClick:()=>{Vt(async()=>{let j=at(),te=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:i,expression:j,appearance:f,useReference:x})});A({view:i,label:j,image:te.image}),P(`Candidate: ${te.width} \xD7 ${te.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${i} ${tt||"sprite"} \xB7 1 image request`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!Z||tt!=="neutral"&&!De,onClick:()=>H.current?.click(),children:"Upload candidate"}),(0,o.jsx)("input",{ref:H,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:j=>{Vt(async()=>{let te=at(),Ke=j.target.files?.[0];Ke&&A({view:i,label:te,image:await Br(Ke)}),j.target.value=""})}})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,o.jsxs)("div",{className:`${n}-sprite-candidate`,children:[(0,o.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,o.jsx)("strong",{children:"Review candidate"}),(0,o.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,o.jsxs)("div",{className:`${n}-sprite-candidate-views`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,o.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,o.jsxs)("div",{children:[(0,o.jsx)("img",{className:`${n}-sprite-mirrored`,src:b.image,alt:""}),(0,o.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{Vt(async()=>{let j=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(j),A(null),P(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>A(null),children:"Discard candidate"})]})]}):null,C.length&&i==="front"?(0,o.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,o.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,o.jsx)("div",{className:`${n}-row`,children:C.map(j=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||j.expression!=="neutral"&&!De,onClick:()=>{Vt(async()=>{let te=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:i,expression:j.expression})});t(te),P(`${j.expression} copied to this Village.`)})},children:j.expression},j.expression))})]}):null,L.length?(0,o.jsx)(o.Fragment,{children:(0,o.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,o.jsx)("summary",{children:"Display framing and export"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("label",{children:["Display framing"," ",(0,o.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:j=>{Vt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:j.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,o.jsx)("option",{value:"full",children:"Full body"}),(0,o.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,o.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,o.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:j=>{Vt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(j.target.value)})})))}})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{Vt(()=>MS(e))},children:"Download both views and manifest"})]})]})}):null,V?(0,o.jsx)("p",{role:"status",children:V}):null,v?(0,o.jsx)("p",{role:"alert",children:v}):null]})}function VS({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,f]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[g,b]=(0,m.useState)(""),A=M=>{x(!0),b(""),t(M,{title:a,description:r,extraBeds:c,slot:h}).catch(w=>b(q(w,"That Venue request could not be decided."))).finally(()=>x(!1))},C=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:M=>i(M.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:r,onChange:M=>s(M.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:M=>d(Number(M.target.value))})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:M=>f(Number(M.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:$||!a.trim()||!r.trim(),onClick:()=>A(!0),children:C?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:$,onClick:()=>A(!1),children:"Decline"})]}),g?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:g}):null]})}function DS({room:e,nameColors:t,speechColors:a,picture:i,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:f,ruling:$,open:x,ended:g,playerName:b,playerPortrait:A,portraits:C,sprites:M,onDraft:w,onMode:y,onTarget:v,onSend:k,onViewVenue:V,onEnterPrivate:P,privateSpaceOwnerName:H,onEnd:L,onLeavePending:ve,endFailed:Z,reviewing:De,onRetryGreeting:tt,onContinueWithoutGreeting:Sa,notices:bt,onDismissNotice:Vt,debugDiscardEnabled:at,onDebugDiscard:j,onUseMailbox:te,onProjects:Ke}){let[Kt,he]=(0,m.useState)(0),[se,wn]=(0,m.useState)(!1),[Dt,K]=(0,m.useState)(!1),[Jt,Ft]=(0,m.useState)(!1),[Wt,qt]=(0,m.useState)(!1),[Je,Ze]=(0,m.useState)(null),vt=(0,m.useRef)(null),it=(0,m.useRef)(null),ea=(0,m.useRef)(null),Y=(0,m.useRef)(null),le=(0,m.useRef)(null),ie=(0,m.useRef)(null),z=(0,m.useRef)(null),U=(0,m.useRef)(null),oe=(0,m.useRef)(null),pe=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let T=new Set(bt.map(W=>W.id)),ce=bt.some(W=>W.kind==="memory"&&!pe.current.has(W.id));pe.current=T,ce?Ft(!0):bt.length===0&&Ft(!1)},[bt,e.id]),(0,m.useEffect)(()=>{se&&window.requestAnimationFrame(()=>ie.current?.focus())},[se]),(0,m.useEffect)(()=>{if(!Dt)return;let T=W=>{U.current?.contains(W.target)||K(!1)},ce=W=>{W.key==="Escape"&&K(!1)};return document.addEventListener("pointerdown",T),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",T),document.removeEventListener("keydown",ce)}},[Dt]),(0,m.useEffect)(()=>{if(!Wt)return;let T=W=>{Y.current?.contains(W.target)||qt(!1)},ce=W=>{W.key==="Escape"&&qt(!1)};return document.addEventListener("pointerdown",T),document.addEventListener("focusin",T),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",T),document.removeEventListener("focusin",T),document.removeEventListener("keydown",ce)}},[Wt]);let we=(0,m.useCallback)(()=>{Ze(null),window.requestAnimationFrame(()=>vt.current?.focus())},[]),lt=new Set((e.submissions??[]).flatMap(T=>(T.recollections??[]).map(ce=>ce.id))).size;(0,m.useEffect)(()=>{if(!Je)return;window.requestAnimationFrame(()=>it.current?.focus());let T=ce=>{if(ce.key==="Tab"){ce.preventDefault(),it.current?.focus();return}ce.key==="Escape"&&(ce.preventDefault(),we())};return window.addEventListener("keydown",T),()=>window.removeEventListener("keydown",T)},[we,Je]);let Ue=(0,m.useMemo)(()=>{let T=[],ce=new Map;for(let W of e.lines){if(W.kind!=="side"&&W.kind!=="whisper"||!W.asideFor)continue;let Bt=ce.get(W.asideFor)??[];Bt.push({register:W.kind,text:W.content,...W.targetId?{target:e.participants.find(da=>da.characterId===W.targetId)?.name??W.targetId}:{},speakerId:W.speakerId,name:W.name,expression:W.expression,gazeAt:W.gazeAt}),ce.set(W.asideFor,Bt)}for(let W of e.lines){if(W.kind==="side"||W.kind==="whisper")continue;let Bt=W.speakerId.length===0,da=z0(W.content,W.beats??null);da.paragraphs.forEach((Nn,ta)=>{T.push({key:`${T.length}`,speakerId:Bt?"":W.speakerId,name:Bt?b:W.name,player:Bt,text:Nn,asides:[...da.asides[ta]??[],...ta===da.paragraphs.length-1?ce.get(W.id??"")??[]:[]],...W.kind?{register:W.kind==="narration"?"narration":"speech"}:{},...W.expression?{expression:W.expression}:{},...W.gazeAt?{gazeAt:W.gazeAt}:{}})})}return T},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{he(T=>D0(oe.current,e.id,Ue.length,T)),oe.current={roomId:e.id,stepCount:Ue.length}},[e.id,Ue.length]);let Se=Math.min(Kt,Math.max(0,Ue.length-1)),S=Ue[Se],me=Se>0,xe=Se<Ue.length-1,kt=!g&&e.status==="active"&&!xe,ka=(0,m.useCallback)(()=>{let T=ea.current;if(!T)return;let ce=window.getComputedStyle(T),W=Number.parseFloat(ce.lineHeight),Bt=Number.parseFloat(ce.paddingTop)+Number.parseFloat(ce.paddingBottom),da=Math.ceil(W+Bt),Nn=Math.ceil(W*2+Bt);T.style.height="auto",T.style.height=`${Math.min(Math.max(T.scrollHeight,da),Nn)}px`,T.style.overflowY=T.scrollHeight>Nn+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{ka()},[kt,r,ka]),(0,m.useEffect)(()=>{let T=ea.current?.parentElement;if(!T)return;let ce=T.clientWidth,W=new ResizeObserver(()=>{T.clientWidth!==ce&&(ce=T.clientWidth,ka())});return W.observe(T),()=>W.disconnect()},[kt,ka]);let F=()=>{!kt||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(qt(!1),k())};(0,m.useLayoutEffect)(()=>{z.current&&(z.current.scrollTop=0)},[Se,e.id]);let xo=S?.register??(S===void 0||S.speakerId==="__venue_scene__"?"narration":S.player||C0(S.text)==="speech"?"speech":"narration"),$n=S===void 0?void 0:S.player?A:C[S.speakerId],It=e.participants.filter(T=>e.activeIds.includes(T.characterId)),Mi=e.status==="closed"&&It.length===0?e.participants:It,Oi=Mi.find(T=>T.characterId===S?.speakerId),Qn=T=>Zu(a[T]),Vi=T=>Zu(t[T]),Zn=Mi.slice(0,4),gl=Mi.filter(T=>!Zn.some(ce=>ce.characterId===T.characterId)),xn=Zn.findIndex(T=>T.characterId===Oi?.characterId)>=2?"left":"right",fl=(0,o.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${n}-chat`,"data-open":x?"true":"false","data-ended":g?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${It.length?It.map(T=>`${T.name}${T.doing?` is ${T.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,o.jsx)("span",{className:`${n}-chat-scrim`}),(0,o.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${n}-chat-head`,children:[(0,o.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:U,className:`${n}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>K(T=>!T),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":Dt,children:"\xB7\xB7\xB7"}),Dt?(0,o.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),V()},disabled:d,children:"View Venue"}),P?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),P()},disabled:d,children:["Enter ",H??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),g&&e.memoryPending?ve():L()},disabled:d,children:g&&e.memoryPending?"Leave with memory pending":g?"Return to map":"End visit now"}),(Z||e.status==="closing"||e.memoryPending)&&!g?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),ve()},children:"Leave with memory pending"}):null,at&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),j()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,bt.length>0?(0,o.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>Ft(T=>!T),"aria-expanded":Jt,"aria-label":`${bt.length} village ${bt.length===1?"notice":"notices"}`,children:["\u2726 ",bt.length]}),Jt?(0,o.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:bt.map(T=>(0,o.jsxs)("div",{className:`${n}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),T.kind==="memory"&&T.detail?(0,o.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:ce=>{vt.current=ce.currentTarget,Ze(T)},"aria-label":`View memory: ${T.text}`,title:"View saved memory",children:T.text}):(0,o.jsx)("span",{children:T.text}),(0,o.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{Je?.id===T.id&&Ze(null),Vt(T.id)},"aria-label":`Dismiss ${T.text}`,title:"Dismiss notice",children:"\xD7"})]},T.id))}):null]}):null,Je?.detail?(0,o.jsx)("div",{className:`${n}-memory-backdrop`,onClick:T=>{T.currentTarget===T.target&&we()},children:(0,o.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${n}-memory-dialog-title`,children:Je.text}),(0,o.jsx)("button",{ref:it,type:"button",onClick:we,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:Je.detail})]})}):null,It.length>0?(0,o.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:It.map(T=>(0,o.jsx)("span",{className:`${n}-chat-activity`,children:`${T.name}: ${T.doing||"spending time here"}`},T.characterId))}):null,(0,o.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${n}-chat-cast`,children:Zn.map((T,ce)=>{let W=M[T.characterId],Bt=T.characterId===Oi?.characterId,da=S?.asides.find(Pn=>Pn.speakerId===T.characterId),Nn=Bt?S?.expression??"neutral":da?.expression??"neutral",ta=Bt?S?.gazeAt:da?.gazeAt??(T.characterId===S?.gazeAt?Oi?.characterId:void 0),No=Zn.findIndex(Pn=>Pn.characterId===ta),yt=H0(W?.images??[],Nn,_0(ce,No));return(0,o.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":T.characterId===Oi?.characterId?"true":"false","data-sprite":yt?"true":"false",children:[yt?(0,o.jsx)("img",{src:yt.image.url,alt:"","data-framing":W?.framing.mode??"full","data-facing":yt.mirrored?"left":"right"}):(0,o.jsx)($o,{portrait:C[T.characterId],name:T.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:Vi(T.characterId),children:T.name})]},T.characterId)})}),gl.length>0?(0,o.jsx)("div",{className:`${n}-chat-cast-rest`,children:gl.map(T=>(0,o.jsxs)("span",{children:[(0,o.jsx)($o,{portrait:C[T.characterId],name:T.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:Vi(T.characterId),children:T.name})]},T.characterId))}):null]}),(0,o.jsxs)("div",{className:`${n}-chat-vn`,children:[se?(0,o.jsx)("div",{ref:ie,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:T=>{T.key==="Escape"&&(wn(!1),window.requestAnimationFrame(()=>le.current?.focus()))},children:e.lines.map((T,ce)=>(0,o.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:T.role==="assistant"&&T.kind!=="narration"?Vi(T.speakerId):void 0,children:[T.role==="user"?b:T.kind==="narration"||T.speakerId==="__venue_scene__"?"Narration":T.name||"Resident",T.kind==="side"?" \xB7 aside":T.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:T.role==="assistant"&&T.kind!=="narration"?Qn(T.speakerId):void 0,children:qr(T.content,`history-${ce}-`)})]},T.id??ce))}):null,S&&S.asides.length>0?(0,o.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":xn,"aria-live":"polite",children:S.asides.map((T,ce)=>(0,o.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":T.register,children:[(0,o.jsx)($o,{portrait:T.speakerId?C[T.speakerId]:$n,name:T.name??S.name,glyph:S.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:T.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:Vi(T.speakerId??S.speakerId),children:T.name??S.name}),T.register==="whisper"&&T.target?(0,o.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${T.target}`}):null]}),(0,o.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:Qn(T.speakerId??S.speakerId),children:qr(T.text,`vn-aside-${ce}-`)})]})]},`${ce}-${T.register}`))}):null,(0,o.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":xo,children:(0,o.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${n}-chat-vn-column`,children:[xo==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${n}-chat-vn-name`,style:S?.player?void 0:Vi(S?.speakerId??""),children:S?.name??""}),(0,o.jsxs)("div",{ref:z,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[S?xo==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:qr(S.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,style:S.player?void 0:Qn(S.speakerId),children:qr(S.text,"vn-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:It.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!g&&d?fl:null]})]})})}),(0,o.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:le,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":se,onClick:()=>wn(T=>!T),children:se?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${Se+1} / ${Math.max(1,Ue.length)}`}),(0,o.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>he(Se-1),disabled:!me,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),xe?(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>he(Se+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):g?(0,o.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?ve:L,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:L,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:tt,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Sa,disabled:d,children:"Continue without opening"}):null]}):null,f?(0,o.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,o.jsx)("p",{children:f})}):null,$?(0,o.jsx)("p",{className:`${n}-empty`,children:$}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${De?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${lt} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,g&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(T=>T.action==="promote")?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,kt&&s==="fulfill"&&It.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,kt?(0,o.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&It.length>0?(0,o.jsxs)("select",{value:c,onChange:T=>v(T.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||g||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),It.map(T=>(0,o.jsx)("option",{value:T.characterId,children:T.name},T.characterId))]}):null,(0,o.jsx)("div",{className:`${n}-composer-row`,children:(0,o.jsxs)("span",{className:`${n}-chat-input`,children:[(0,o.jsxs)("span",{ref:Y,className:`${n}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>qt(T=>!T),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":Wt,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),Wt?(0,o.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(T=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===T,disabled:d||T==="fulfill"&&It.length===0,onClick:()=>{y(T),qt(!1)},children:T==="chat"?"Chat":T==="fulfill"?"Fulfill":"Conclude"},T))}):null]}),te?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:te,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,Ke?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Ke,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:ea,className:`${n}-textarea`,rows:1,value:r,onChange:T=>w(T.target.value),onKeyDown:T=>{V0(T.key,T.shiftKey,T.nativeEvent.isComposing)&&(T.preventDefault(),F())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||g||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:F,disabled:d||g||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}var p1="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",Gp=["concept","approval","builder","requirements","materials","construction","finishing"],g1={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function IS({snapshot:e,room:t,onSnapshot:a,onReturn:i,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:f}){let[$,x]=(0,m.useState)(h),[g,b]=(0,m.useState)(""),[A,C]=(0,m.useState)(""),[M,w]=(0,m.useState)("gathering"),[y,v]=(0,m.useState)(""),[k,V]=(0,m.useState)(""),[P,H]=(0,m.useState)("upgrade"),[L,ve]=(0,m.useState)("workplace"),[Z,De]=(0,m.useState)(2),[tt,Sa]=(0,m.useState)(0),[bt,Vt]=(0,m.useState)(0),[at,j]=(0,m.useState)(""),[te,Ke]=(0,m.useState)(""),[Kt,he]=(0,m.useState)(""),[se,wn]=(0,m.useState)(null),[Dt,K]=(0,m.useState)(null),[Jt,Ft]=(0,m.useState)(null),[Wt,qt]=(0,m.useState)(!1),[Je,Ze]=(0,m.useState)(!1),[vt,it]=(0,m.useState)("");(0,m.useEffect)(()=>{h&&x(h)},[h]);let ea=e.projects.filter(S=>(S.kind==="new-venue"||S.kind==="renovation")&&S.lifecycle?.phase!=="complete"),Y=ea.find(S=>S.id===$)??null,le=Y?.lifecycle,ie=e.settings.venues.find(S=>S.id===Y?.venueId),z=e.settings.venues.find(S=>S.id===k),U=["residence","workplace","gathering","other"].filter(S=>!z?.classes?.includes(S)).includes(L)?L:["residence","workplace","gathering","other"].find(S=>!z?.classes?.includes(S)),oe=async(S,me={})=>{Ze(!0),it("");try{let xe=await D(S,{method:"POST",body:JSON.stringify(me)});return a(xe),xe}catch(xe){return it(q(xe,"The Project could not be updated.")),null}finally{Ze(!1)}},pe=(S,me={})=>Y&&oe(`/projects/${encodeURIComponent(Y.id)}/${S}`,me),we=async()=>{let S=g==="new-venue"?{name:A,venueClass:M,description:y}:{title:A,detail:y,...P==="class"&&z&&U?{classes:[...new Set([...z.classes??[],U])]}:{},...P==="capacity"?{capacity:Z}:{},...P==="upgrade"?{slot:tt,improvement:{title:A,description:y,extraBeds:bt}}:{},...P==="remove-upgrade"?{slot:tt,improvement:null}:{}},xe=(await oe(g==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(k)}`,S))?.projects.find(kt=>kt.kind===g&&kt.lifecycle?.phase!=="complete");xe&&(x(xe.id),b(""))},lt=async S=>{if(Y){Ze(!0),it("");try{let me=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{name:Y.title,form:at||Y.title,description:te||Y.venueDraft?.description||ie?.description,spaceDescription:Kt||ie?.spaces?.[0]?.description||te,venueClass:Y.venueDraft?.classes?.[0]??ie?.classes?.[0]??"other"},area:S,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds})});Ft({area:S,image:me})}catch(me){it(q(me,"The Venue image could not be generated."))}finally{Ze(!1)}}},Ue=async(S,me)=>{if(!(!me||!Y)){Ze(!0),it("");try{let xe=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:Y.title,image:await Br(me)})});Ft({area:S,image:xe})}catch(xe){it(q(xe,"The Venue image could not be uploaded."))}finally{Ze(!1)}}},Se=le?.phase;return Y&&Se==="finishing"&&Wt?(0,o.jsxs)("div",{className:`${n}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>qt(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:Y.kind==="new-venue"?`Open ${Y.title}`:`Review ${Y.title}`}),(0,o.jsx)("p",{children:Y.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the finished change and update its exterior image if you wish."})]}),Y.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:at,onChange:S=>j(S.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:te,onChange:S=>Ke(S.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:Kt,onChange:S=>he(S.target.value)})]})]}):(0,o.jsx)("p",{children:le?.change?.detail}),["exterior",...Y.kind==="new-venue"?["interior"]:[]].map(S=>{let me=S==="exterior"?se:Dt;return(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsxs)("h3",{children:[S==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),me?(0,o.jsx)("img",{src:me.url,alt:`${S} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{lt(S)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${S} image`,disabled:Je,onChange:xe=>{let kt=xe.target.files?.[0];xe.target.value="",Ue(S,kt)}})]},S)}),Jt?(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsx)("img",{src:Jt.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Jt.area==="exterior"?wn(Jt.image):K(Jt.image),Ft(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ft(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je||Y.kind==="new-venue"&&(!at.trim()||!te.trim()||!Kt.trim()),onClick:async()=>{await pe("open",{form:at,exteriorDescription:te,interiorDescription:Kt,exteriorImage:se,interiorImage:Dt})&&qt(!1)},children:"Open Venue"}),vt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:vt}):null]}):(0,o.jsxs)("div",{className:`${n}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${n}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:Y?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:Y?Y.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),Y?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>x(""),children:"All Projects"}):null]}),Y?(0,o.jsxs)("div",{className:`${n}-project-layout`,children:[(0,o.jsx)("nav",{className:`${n}-project-rail`,"aria-label":"Project phases",children:Gp.filter(S=>S!=="approval"||Y.kind==="renovation").map((S,me)=>{let xe=Gp.indexOf(Se),kt=Gp.indexOf(S);return(0,o.jsxs)("div",{className:`${n}-project-step`,"data-state":kt===xe?"active":kt<xe?"done":"locked",children:[(0,o.jsx)("b",{children:kt<xe?"\u2713":me+1}),(0,o.jsx)("span",{children:g1[S]})]},S)})}),(0,o.jsxs)("main",{className:`${n}-project-card`,children:[Se==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:Y.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>s(Y.id),children:"Place on Village map"})]}):null,Se==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),le?.affectedIds.map(S=>(0,o.jsxs)("p",{children:[e.villagers.find(me=>me.characterId===S)?.name??S,":"," ",le.approvals.some(me=>me.residentId===S)?"Approved":"Awaiting approval"]},S)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,Se==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here."}),le?.candidates.length?le.candidates.map(S=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("builder",{residentId:S.residentId})},children:["Assign"," ",e.villagers.find(me=>me.characterId===S.residentId)?.name??"this Villager"]},S.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,Se==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(S=>S.characterId===le?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies."]}),le?.requirements.length?(0,o.jsxs)("div",{children:[le.requirements.map(S=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:S.category})," \xB7 ",S.needed?S.title:"Not needed"]},S.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),le?.candidates.filter(S=>S.residentId!==le.builderId).map(S=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("builder",{residentId:S.residentId})},children:["Switch to"," ",e.villagers.find(me=>me.characterId===S.residentId)?.name??"another Builder"]},S.residentId))]}):null,Se==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Deliveries update the list here."}),le?.requirements.filter(S=>S.needed).map(S=>(0,o.jsxs)("div",{className:`${n}-project-material`,children:[(0,o.jsx)("strong",{children:S.title}),(0,o.jsx)("span",{children:S.deliveredAt?"Delivered":S.carriedAt?"Ready to deliver":"Find and obtain"}),S.carriedAt&&!S.deliveredAt&&f===Y.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("deliver",{requirementId:S.id})},children:"Deliver at blueprint site"}):null,S.carriedAt&&!S.deliveredAt&&f!==Y.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},S.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je||le?.requirements.some(S=>S.needed&&!S.deliveredAt),onClick:()=>{pe("start")},children:"Begin construction"})]}):null,Se==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(S=>S.characterId===le?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),le?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(le.workOrder.completesAt).toLocaleString()]}):null,le?.blockedReason?(0,o.jsx)("p",{role:"status",children:le.blockedReason}):null,Y.status==="blocked"?le?.candidates.filter(S=>S.residentId!==le.builderId).map(S=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{pe("builder",{residentId:S.residentId})},children:["Continue with"," ",e.villagers.find(me=>me.characterId===S.residentId)?.name??"Builder"]},S.residentId)):null,d&&Y.status==="building"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je,onClick:()=>{pe("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,Se==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",Y.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>qt(!0),children:"Visit finished Venue"})]}):null,vt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:vt}):null,(0,o.jsx)("footer",{className:`${n}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${n}-project-slots`,children:[["new-venue","renovation"].map(S=>{let me=ea.find(xe=>xe.kind===S);return(0,o.jsxs)("button",{type:"button",className:`${n}-project-slot`,onClick:()=>me?x(me.id):b(S),children:[(0,o.jsx)("span",{children:S==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:me?.title??(S==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:me?.lifecycle?g1[me.lifecycle.phase]??"Opening":"Available"})]},S)}),g?(0,o.jsxs)("section",{className:`${n}-project-card ${n}-project-create`,children:[(0,o.jsx)("h3",{children:g==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),g==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:k,onChange:S=>V(S.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(S=>S.constructionStatus!=="worksite").map(S=>(0,o.jsx)("option",{value:S.id,children:S.name},S.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:P,onChange:S=>H(S.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Add a second Class"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),P==="class"?(z?.classes?.length??0)>=2?(0,o.jsx)("p",{children:"This Venue already has two Classes."}):(0,o.jsxs)("label",{children:["Second Class",(0,o.jsx)("select",{value:U??"",onChange:S=>ve(S.target.value),children:["residence","workplace","gathering","other"].filter(S=>!z?.classes?.includes(S)).map(S=>(0,o.jsx)("option",{value:S,children:S},S))})]}):null,P==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:Z,onChange:S=>De(Number(S.target.value))})]}):null,P==="upgrade"||P==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:tt,onChange:S=>Sa(Number(S.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",z?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",z?.improvements?.[1]?.title??"empty"]})]})]}):null,P==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:bt,onChange:S=>Vt(Number(S.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:M,onChange:S=>w(S.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[g==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:A,onChange:S=>C(S.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",g==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:y,onChange:S=>v(S.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Je||!A.trim()||!y.trim()||g==="renovation"&&(!k||P==="class"&&(!U||(z?.classes?.length??0)>=2)),onClick:()=>{we()},children:g==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!Y&&vt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:vt}):null]})}function _S({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)(null),[d,h]=(0,m.useState)(null),[f,$]=(0,m.useState)(0),[x,g]=(0,m.useState)("residents"),[b,A]=(0,m.useState)(null),[C,M]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,k]=(0,m.useState)(0),[V,P]=(0,m.useState)(0),[H,L]=(0,m.useState)(null),[ve,Z]=(0,m.useState)(!1),[De,tt]=(0,m.useState)(""),[Sa,bt]=(0,m.useState)(""),[Vt,at]=(0,m.useState)(""),[j,te]=(0,m.useState)(null),[Ke,Kt]=(0,m.useState)(!1),[he,se]=(0,m.useState)("home"),[wn,Dt]=(0,m.useState)(""),[K,Jt]=(0,m.useState)(""),[Ft,Wt]=(0,m.useState)(""),[qt,Je]=(0,m.useState)(null),[Ze,vt]=(0,m.useState)("view"),[it,ea]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(it==="exterior")return;let l=i?.settings.venues.find(p=>p.id===qt);(it.startsWith("class:")?l&&yn(l).includes(it.slice(6)):l&&it.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(it.slice(8))&&l.privateSpaces?.some(p=>p.ownerId===it.slice(8)))||ea("exterior")},[i,qt,it]);let[Y,le]=(0,m.useState)(null),[ie,z]=(0,m.useState)(null),[U,oe]=(0,m.useState)(!1),[pe,we]=(0,m.useState)(""),[lt,Ue]=(0,m.useState)(""),[Se,S]=(0,m.useState)(""),[me,xe]=(0,m.useState)(null),[kt,ka]=(0,m.useState)(!1),[F,xo]=(0,m.useState)("village"),[$n,It]=(0,m.useState)("index"),[Mi,Oi]=(0,m.useState)({}),[Qn,Vi]=(0,m.useState)(null),[Zn,gl]=(0,m.useState)({}),[xn,fl]=(0,m.useState)({}),[T,ce]=(0,m.useState)(""),[W,Bt]=(0,m.useState)(null),[da,Nn]=(0,m.useState)(""),[ta,No]=(0,m.useState)(""),[yt,Pn]=(0,m.useState)(""),[Lr,Fp]=(0,m.useState)(null),[bl,Wp]=(0,m.useState)(""),[vl,eg]=(0,m.useState)([]),[Ku,tg]=(0,m.useState)(1600),[Ua,ag]=(0,m.useState)([]),[So,ng]=(0,m.useState)(1600),[Ju,E1]=(0,m.useState)(null),[ig,og]=(0,m.useState)(""),[yl,ko]=(0,m.useState)([]),[rg,C1]=(0,m.useState)(""),[Ta,wl]=(0,m.useState)([]),[Di,aa]=(0,m.useState)(!1),[$l,Ii]=(0,m.useState)(!1),[z1,Fu]=(0,m.useState)(null),[A1,sg]=(0,m.useState)(null),[xl,lg]=(0,m.useState)(null),[Nl,cg]=(0,m.useState)(""),[Ie,Sl]=(0,m.useState)(0),[Fa,ug]=(0,m.useState)(""),[Tt,dg]=(0,m.useState)(""),[Sn,hg]=(0,m.useState)("rebuild"),[Ea,Wu]=(0,m.useState)(wo("rebuild").premise),[Gr,mg]=(0,m.useState)(""),[R1,M1]=(0,m.useState)(Dp),[kn,pg]=(0,m.useState)([]),[O1,kl]=(0,m.useState)([]),[Fe,_i]=(0,m.useState)([]),[Yr,qa]=(0,m.useState)(null),[V1,gg]=(0,m.useState)(0),[fg,ed]=(0,m.useState)(!1),[td,Hi]=(0,m.useState)(null),[Xr,Kn]=(0,m.useState)(null),[Wa,Tl]=(0,m.useState)(!1),[bg,ad]=(0,m.useState)(""),[El,vg]=(0,m.useState)(Z0),[_e,Ui]=(0,m.useState)("generate"),[D1,nd]=(0,m.useState)(""),[Cl,id]=(0,m.useState)(null),[I1,yg]=(0,m.useState)(""),[Qr,od]=(0,m.useState)(null),[To,rd]=(0,m.useState)(""),[Eo,sd]=(0,m.useState)(""),Zr=JSON.stringify({scenario:Sn,premise:Ea.trim(),direction:Gr.trim(),setting:Tt.trim(),lorebooks:Ua,loreBudget:So}),ld=(0,m.useRef)(Zr);(0,m.useEffect)(()=>{ld.current!==Zr&&!i?.isFounded&&Kn(null),ld.current=Zr},[Zr,i?.isFounded]);let cd=JSON.stringify({setting:Tt.trim(),worldFacts:i?.isFounded?kn:null,lorebooks:Ua,structure:To,negative:Eo,options:El}),[jt,Pr]=(0,m.useState)(!1),[wg,zl]=(0,m.useState)(""),[ud,_1]=(0,m.useState)("Connections are still loading."),[$g,xg]=(0,m.useState)(!1),[H1,Kr]=(0,m.useState)(!1),[Ng,Ne]=(0,m.useState)(""),[U1,Al]=(0,m.useState)(!1),[Rl,Ml]=(0,m.useState)(""),[Ba,dd]=(0,m.useState)(null),[hd,Jr]=(0,m.useState)(null),[q1,md]=(0,m.useState)(!1),[en,Co]=(0,m.useState)(""),[Sg,Jn]=(0,m.useState)(null),zo=i?.settings.townMapView??Yu("cover"),kg=i?Ba?.size??{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,Tg=i?_e==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:Qr&&Cl===_e?Qr:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,B1=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},Ol=Ba?Ba.image:Rl||null,qi=_e==="none"?null:_e==="existing"?Rl||null:Cl===_e&&(_e!=="generate"||I1===cd)&&D1||null,Vl=Ba!==null||q1,Fr=Vl?hd??zo:zo,pd=Ba?qp(Ba.size):null,[Wr,Re]=(0,m.useState)(""),[Lt,J]=(0,m.useState)(""),[_,X]=(0,m.useState)(!1),[B,qe]=(0,m.useState)(null),[j1,es]=(0,m.useState)(!1),[L1,ja]=(0,m.useState)(!1),[ts,Tn]=(0,m.useState)(""),[as,Dl]=(0,m.useState)("chat"),[ns,gd]=(0,m.useState)(""),[G1,Eg]=(0,m.useState)(""),[Y1,La]=(0,m.useState)([]),Ga=(0,m.useRef)(new Set),[Il,X1]=(0,m.useState)(!1),Cg=(0,m.useRef)(0),Ao=(0,m.useRef)(0),zg=(0,m.useRef)(""),[fd,Ro]=(0,m.useState)(""),[Ya,ct]=(0,m.useState)(!1),[is,Ag]=(0,m.useState)(""),_l=(0,m.useRef)(new Set),En=(0,m.useRef)(!1),Bi=(0,m.useRef)(null),os=(0,m.useRef)(null),Gt=(0,m.useRef)(null),Fn=(0,m.useCallback)(l=>{let u=[];for(let p of l)Ga.current.has(p.id)||(Ga.current.add(p.id),u.push(p));u.length>0&&La(p=>[...p,...u])},[]),rs=(0,m.useRef)(!1),[Q1,ut]=(0,m.useState)(""),[Z1,ji]=(0,m.useState)(""),[Mo,Oo]=(0,m.useState)(!1),[Hl,bd]=(0,m.useState)(""),Rg=(0,m.useRef)(""),Ul=(0,m.useRef)(!1),[ql,Mg]=(0,m.useState)(!1),vd=(0,m.useRef)(null),yd=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=yd.current,u=vd.current;l===null||!u||(yd.current=null,u.focus(),u.setSelectionRange(l,l))},[ta]);let Bl=(0,m.useCallback)(async(l=!1)=>{if(Ul.current)return null;Ul.current=!0;let u=setTimeout(()=>Mg(!0),uS);try{let p=await D("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return r(p),p}catch{return null}finally{clearTimeout(u),Mg(!1),Ul.current=!1}},[]),Og=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";bd("Writing...");let u=await Bl(!0);if(!u){bd("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}bd((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,Bl]),ze=(0,m.useCallback)(async(l={})=>{try{let u=await D("",{signal:l.signal});r(u),Re("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),Re(q(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===Rg.current||(Rg.current=l,i?.isFounded&&Bl())},[i,Bl]);let tn=(0,m.useCallback)(async l=>{try{let u=await D("/catalog",{signal:l});c(u.characters),Re("")}catch(u){if(l?.aborted)return;Re(q(u,"Could not read your character library."))}},[]),Vo=(0,m.useCallback)(async l=>{try{let u=await D("/personas",{signal:l});Fp(u.personas)}catch(u){if(l?.aborted)return;Fp([]),Re(q(u,"Could not read your Personas."))}},[]),Do=(0,m.useCallback)(async l=>{try{let u=await D("/lorebooks",{signal:l});E1(u.books),og("")}catch(u){if(l?.aborted)return;og(q(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Vg=(0,m.useCallback)(async l=>{try{let u=await D("/story?offset=0&limit=50",{signal:l});h(u.entries),$(u.total)}catch(u){if(l?.aborted)return;h(null),Re(q(u,"Could not read the village story."))}},[]),Dg=(0,m.useRef)(new Set),jl=(0,m.useCallback)(async l=>{try{let u=await D("/memories",{signal:l});A(u),Re("");let p=u.archive.pendingReviewId;p&&!Dg.current.has(p)&&!l?.aborted&&(Dg.current.add(p),window.setTimeout(()=>{l?.aborted||D(`/rooms/archive/${encodeURIComponent(p)}/retry-memory`,{method:"POST"}).then(()=>D("/memories")).then(N=>{l?.aborted||A(N)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;A(null),Re(q(u,"Could not read villager memories."))}},[]),P1=(0,m.useCallback)(async(l,u)=>{let p=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){X(!0);try{await D(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await jl()}catch(N){Re(q(N,"That memory could not be removed."))}finally{X(!1)}}},[jl]),K1=(0,m.useCallback)(async l=>{X(!0);try{let u=await D(`/story/${encodeURIComponent(l)}`,{method:"DELETE"});h(u.entries),$(u.total),Re("")}catch(u){Re(q(u,"That memory could not be removed."))}finally{X(!1)}},[]),J1=(0,m.useCallback)(async()=>{let l=d?.length??0;try{let u=await D(`/story?offset=${l}&limit=50`);h(p=>[...p??[],...u.entries]),$(u.total)}catch(u){Re(q(u,"Could not read more memories."))}},[d]),Ll=(0,m.useCallback)(async l=>{try{let u=await D("/agendas",{signal:l});te(u.villagers)}catch(u){if(l?.aborted)return;te(null),Re(q(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(he!=="menu"||F!=="agendas"&&F!=="schedules"||!j?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Ll()},5e3);return()=>window.clearInterval(l)},[j,Ll,F,he]);let F1=(0,m.useCallback)(async l=>{X(!0);try{let u=await D(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});te(u.villagers),Re("")}catch(u){Re(q(u,"That villager could not be asked again."))}finally{X(!1)}},[]),W1=(0,m.useCallback)(async(l,u)=>{X(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});te(p.villagers),Re("")}catch(p){Re(q(p,"That wish completion could not be corrected."))}finally{X(!1)}},[]),e$=(0,m.useCallback)(async(l,u)=>{X(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});te(p.villagers),Re("")}catch(p){Re(q(p,"Schedule use could not be changed."))}finally{X(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return ze({signal:l.signal}),()=>l.abort()},[ze]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||ze({quiet:!0})},u=setInterval(()=>{document.hidden||Ul.current||ze({quiet:!0})},cS);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[ze]),(0,m.useEffect)(()=>{if(!B?.id||B.status==="closed"||he!=="room")return;zg.current!==B.id?(zg.current=B.id,Ao.current=Date.parse(B.lastActivityAt||B.startedAt)||Date.now()):Ao.current=Math.max(Ao.current,Date.parse(B.lastActivityAt||B.startedAt)||0);let l=!1,u=I=>{l||Hr(B.id,Gt.current)||(qe(null),ja(!1),La([]),Ga.current.clear(),Ro(I==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),ze())},p=(I=!1)=>{Hr(B.id,Gt.current)||D("/rooms/active").then(async({session:G})=>{if(l||Hr(B.id,Gt.current))return;if(G?.id===B.id){I&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:B.id})}),Ao.current=Date.now());return}let $e=await D(`/rooms/archive/${encodeURIComponent(B.id)}`).catch(()=>null);l||Hr(B.id,Gt.current)||u($e?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(G=>{let $e=Ur(G);$e&&u($e)})},N=I=>{if(!Hr(B.id,Gt.current)){if(Date.now()-Ao.current>=30*6e4){I.cancelable&&I.preventDefault(),I.stopImmediatePropagation(),p(!0);return}Ao.current=Date.now(),!(Date.now()-Cg.current<15e3)&&(Cg.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:B.id})}).catch(G=>{let $e=Ur(G);$e?u($e):p()}))}},R=()=>p();window.addEventListener("focus",R),document.addEventListener("visibilitychange",R);for(let I of["pointerdown","keydown","input","scroll"])window.addEventListener(I,N,!0);return()=>{l=!0,window.removeEventListener("focus",R),document.removeEventListener("visibilitychange",R);for(let I of["pointerdown","keydown","input","scroll"])window.removeEventListener(I,N,!0)}},[B?.id,B?.status,B?.lastActivityAt,B?.startedAt,he,ze]),(0,m.useEffect)(()=>{let l=new AbortController;return D("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:p})=>{X1(p),!(l.signal.aborted||!u)&&(qe(u),Dl("chat"),ja(!0),se("room"),u.status==="opening"&&(ct(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{l.signal.aborted||qe(N)}).catch(async N=>{if(l.signal.aborted)return;let R=await W0(u.id);l.signal.aborted||(R?qe(R):ut(t1(N)))}).finally(()=>{l.signal.aborted||ct(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(F!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return De&&u.set("venueId",De),Sa&&u.set("characterId",Sa),u.set("offset",String(v)),u.set("limit","20"),M(null),D(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:p,total:N})=>{l.signal.aborted||(M(p),y(N),at(""))}).catch(p=>{l.signal.aborted||at(q(p,"Venue visits could not be read."))}),()=>l.abort()},[De,Sa,v,V,F,i?.isFounded]);let wd=(0,m.useCallback)(async l=>{try{let u=await D(`/rooms/archive/${encodeURIComponent(l)}`);L(u.visit),at("")}catch(u){at(q(u,"That visit could not be read."))}},[]),t$=(0,m.useCallback)(async l=>{X(!0);try{await D(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await wd(l),P(u=>u+1),at("")}catch(u){at(q(u,"Memory filing is still pending."))}finally{X(!1)}},[wd]),Ig=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){X(!0);try{await D(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),L(null),k(0),P(u=>u+1),at("")}catch(u){at(q(u,"Visit transcripts could not be deleted."))}finally{X(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ke)return;let l=new AbortController;return tn(l.signal),()=>l.abort()},[Ke,tn]);let _g=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(_g===null)return;let l=new AbortController;return(async()=>{try{let u=await D("/town-map",{signal:l.signal});Ml(u.image)}catch{l.signal.aborted||Ml("")}})(),()=>l.abort()},[_g]);let a$=(0,m.useCallback)(async l=>{X(!0);try{r(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),Re(""),await tn()}catch(u){Re(q(u,"That character could not move in."))}finally{X(!1)}},[tn]),n$=(0,m.useCallback)(async l=>{X(!0);try{r(await D(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),Re(""),s&&await tn()}catch(u){Re(q(u,"That villager could not leave."))}finally{X(!1)}},[s,tn]),i$=(0,m.useCallback)(async l=>{ce(l);try{let u=await D(`/villagers/${encodeURIComponent(l)}/refresh`);fl(p=>({...p,[l]:u})),Re("")}catch(u){Re(q(u,"That villager's card could not be compared."))}finally{ce("")}},[]),o$=(0,m.useCallback)(async l=>{ce(l);try{r(await D(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),fl(u=>{let p={...u};return delete p[l],p}),Re("")}catch(u){Re(q(u,"That villager's card could not be refreshed."))}finally{ce("")}},[]),Pe=(0,m.useCallback)(l=>{l==="projects"&&Wt(""),It(l==="noticeboard"?"noticeboard":l==="general"?"general":l==="replyGuidance"||l==="story"||l==="chatlogs"||l==="agendas"||l==="schedules"?"debug":"village"),J(""),ka(!1),l==="villagers"&&tn(),l==="villagers"&&(he!=="menu"||F!=="villagers")&&g("residents"),l==="village"&&Vo(),l==="village"&&Do(),l==="story"&&Vg(),(l==="agendas"||l==="schedules")&&Ll(),l==="village"&&(he!=="menu"||F!=="village")&&i&&(No(i.settings.promptKnowledge),Pn(i.settings.playerPersonaId),Wp(i.settings.setting),eg(i.settings.selectedLorebookIds),tg(i.settings.loreTokenBudget),ko(Xn(i.settings.venues).map(p=>({...p})))),xo(l),se("menu")},[Ll,tn,Do,Vo,Vg,F,he,i]),ss=(0,m.useCallback)(()=>{Kt(!1),J(""),xe(null),ka(!1),se("home")},[]),Wn=(0,m.useCallback)(l=>{!l.memoryPending||_l.current.has(l.id)||(_l.current.add(l.id),Ag(l.id),D(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{En.current||(qe(p=>p?.id===l.id?u.session:p),Fn(u.recordEvents??[]))}).catch(u=>{En.current||ut(q(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{_l.current.delete(l.id),Ag(u=>u===l.id?"":u)}))},[Fn]);(0,m.useEffect)(()=>{if(!is)return;let l=window.setInterval(()=>{D(`/rooms/archive/${encodeURIComponent(is)}`).then(({visit:u})=>{En.current||!_l.current.has(is)||qe(p=>p?.id===u.id&&p.memoryPending?{...p,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:p)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[is]);let r$=(0,m.useCallback)(async()=>{if(!(!B||Ya)&&!(B.memoryPending&&(B.status==="closed"||Mo))){if(!B.id||B.status==="closed"||Mo){Gt.current=null,ja(!1),qe(null),La([]),Ga.current.clear(),Tn(""),ji(""),se("home"),ze();return}ct(!0),ut(""),Z(!1),qe({...B,status:"closing"}),Gt.current={roomId:B.id,submissionId:""};try{let l=await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:B.id})});if(En.current)return;qe(l.session),Oo(!0),Fn(l.recordEvents??[]),Wn(l.session),Tn(""),ji(""),ze()}catch(l){if(En.current)return;Gt.current=null;let u=Ur(l);if(u){qe(null),ja(!1),La([]),Ga.current.clear(),Ro(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),ze();return}ut(q(l,"You could not leave the venue.")),Z(!0)}finally{ct(!1)}}},[ze,Fn,B,Ya,Mo,Wn]),s$=(0,m.useCallback)(async()=>{if(!B?.id||B.status!=="active"||Ya||rs.current)return;let l=os.current??Uu();os.current=l,Gt.current={roomId:B.id,submissionId:l},ct(!0),ut(""),Z(!1);try{let u=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:B.id,submissionId:l,message:ts}),signal:AbortSignal.timeout(3e5)});qe(u.session),Oo(!0),Fn(u.recordEvents??[]),Wn(u.session),os.current=null,Tn(""),ze()}catch(u){let p=await e1(B.id,l);if(p){qe(p),Oo(!0),Wn(p),Tn(""),ut(""),Z(!1),os.current=null,ze();return}Gt.current=null;let N=Ur(u);if(N){qe(null),ja(!1),La([]),Ga.current.clear(),Ro(N==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),ze();return}ut(q(u,"The scene could not end yet.")),Z(!0)}finally{ct(!1)}},[ze,Fn,B,Ya,ts,Wn]),l$=(0,m.useCallback)(async()=>{if(!(!B?.id||En.current)){En.current=!0,ct(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:B.id})}),Gt.current=null,ja(!1),qe(null),La([]),Ga.current.clear(),se("home"),Z(!1),ze()}catch(l){ut(q(l,"The visit could not be left yet.")),En.current=!1}finally{ct(!1)}}},[ze,B]),c$=(0,m.useCallback)(async()=>{if(!(!B?.id||!Il||Ya)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){ct(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:B.id})}),qe(null),ja(!1),La([]),Ga.current.clear(),Tn(""),se("home"),ze()}catch(l){ut(q(l,"The debug discard failed."))}finally{ct(!1)}}},[B,Il,Ya,ze]),u$=(0,m.useCallback)(async()=>{let l=ts.trim();if(B===null||!B.id||Mo||Ya||rs.current||l.length===0)return;rs.current=!0;let u=Bi.current??Uu();Bi.current=u;let p=B;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:B.id})})}catch(R){rs.current=!1;let I=Ur(R);I?(qe(null),ja(!1),La([]),Ga.current.clear(),Ro(I==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),ze()):ut(q(R,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};ct(!0),ut(""),Tn(""),qe({...B,lines:[...B.lines,N]}),Gt.current={roomId:B.id,submissionId:u};try{let R=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:B.id,message:l,mode:as,targetId:as==="fulfill"?ns:"",submissionId:u}),signal:AbortSignal.timeout(3e5)});qe(R.session),Oo(R.session.status==="closed"),R.session.status!=="closed"&&(Gt.current=null),Fn(R.recordEvents??[]),R.session.status==="closed"&&Wn(R.session),ns&&!R.session.activeIds.includes(ns)&&gd(""),Eg(R.verdict?.reason??""),Dl("chat"),Bi.current=null,ji(""),ze()}catch(R){let I=await e1(B.id,u);if(I){qe(I),Oo(!0),Wn(I),ut(""),Bi.current=null,ji(""),ze();return}Gt.current=null;let G=Ur(R);if(G){qe(null),ja(!1),La([]),Ga.current.clear(),Ro(G==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),ze();return}qe(p),Tn(l),ut(q(R,"That line could not be sent."))}finally{rs.current=!1,ct(!1)}},[ze,Fn,B,Ya,ts,Mo,as,ns,Wn]),d$=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),Gl=(0,m.useCallback)(l=>{xe(null),ka(!1),Je(l.id),vt("view"),ea("exterior"),le(null),z(null),se("venue")},[]),$d=(0,m.useCallback)(async l=>{ct(!0),ut(""),ji("");try{let u=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});qe(u.session),ze()}catch(u){let p=await W0(l);p?qe(p):ut(t1(u))}finally{ct(!1)}},[ze]),h$=(0,m.useCallback)(async l=>{ct(!0);try{let{session:u}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});qe(u),ji(u.lines.length===0?"The opening failed. You can start the conversation now.":""),ut("")}catch(u){ut(q(u,"The visit could not continue. Retry or leave the venue."))}finally{ct(!1)}},[]),Yl=(0,m.useCallback)(async(l,u,p="",N)=>{En.current=!1,Gt.current=null,xe(null),ka(!1),Jn(null),Tn(""),Oo(!1),ut(""),ji(""),La([]),Ga.current.clear(),ct(!0),qe({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),ja(!0),se("room");try{let{session:R}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:p,entryArea:N}),signal:AbortSignal.timeout(2e4)});qe(R),Dl("chat"),gd(""),Eg(""),Ro(""),ja(!0),ze(),R.status==="opening"&&await $d(R.id)}catch(R){ut(q(R,"That room could not be opened. Retry or leave the venue."))}finally{ct(!1)}},[$d,ze]),Hg=(0,m.useCallback)(l=>{ka(!1),xe(l.id),se("home")},[]),Ug=(0,m.useCallback)(()=>{Je(null),vt("view"),ea("exterior"),le(null),z(null),xe(null),se("home")},[]),m$=(0,m.useCallback)(async()=>{X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:ta,playerPersonaId:yt,setting:bl,selectedLorebookIds:vl,loreTokenBudget:Ku})}))}catch(l){J(q(l,"Those settings could not be saved."))}finally{X(!1)}},[ta,vl,Ku,yt,bl]),p$=(0,m.useCallback)(async l=>{X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){J(q(u,"That could not be saved."))}finally{X(!1)}},[]),g$=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;r(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:l}}),X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(p){r(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:u}}),J(q(p,"Character speech colors could not be saved."))}finally{X(!1)}},[i?.settings.characterSpeechColors]),qg=(0,m.useCallback)(async l=>{X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),P(u=>u+1)}catch(u){J(q(u,"Visit retention could not be saved."))}finally{X(!1)}},[]),f$=(0,m.useCallback)(async()=>{if(!(i&&Xn(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){X(!0),J("");try{let l=await D("/bootstrap",{method:"POST"});ko(l.places.map(u=>({id:pl(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){J(q(l,"The village did not suggest any places."))}finally{X(!1)}}},[i]),b$=(0,m.useCallback)(async()=>{if(Tt.trim().length===0){Ne("Describe what the village is like before generating its map.");return}Pr(!0),Ne("");try{let l=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:To===i?.settings.townMapLayoutPrompt?void 0:To,negative:Eo===i?.settings.townMapNegativePrompt?void 0:Eo,setting:Tt,options:El,selectedLorebookIds:Ua,scenarioImprint:i?.isFounded?{origin:"",worldFacts:kn,openingConditions:[],visualCues:[]}:null})}),u=await Up(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");nd(l.image),id("generate"),yg(cd),od(u),Ui("generate")}catch(l){Ne(q(l,"The village map could not be generated."))}finally{Pr(!1)}},[Ua,Eo,To,Tt,El,cd,kn,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),v$=(0,m.useCallback)(async()=>{Ne(""),X(!0);try{let l=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Tt,selectedLorebookIds:Ua,loreTokenBudget:So})});kl(l.names)}catch(l){Ne(q(l,"The village could not suggest names for the public venue."))}finally{X(!1)}},[Ua,So,Tt]),y$=(0,m.useCallback)(async l=>{if(!l||!i)return;Ne("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=N=>Math.round(N/1e5)/10;Ne(`That picture is ${p(l.size)} MB and a village map holds ${p(u)} MB. Choose a smaller copy.`);return}Pr(!0);try{let p=await Br(l),N=await Up(p);nd(p),id("upload"),od(N),Ui("upload")}catch(p){Ne(q(p,"That picture could not be used as the village map."))}finally{Pr(!1)}},[i]),Bg=(0,m.useCallback)(async l=>{if(!l||!i)return;J("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=N=>Math.round(N/1e5)/10;J(`That picture is ${p(l.size)} MB and the village map holds ${p(u)} MB. Try a smaller copy.`);return}X(!0);try{let p=await Br(l),N=await Up(p);dd({image:p,size:N}),Jr(Yu("cover"))}catch(p){J(q(p,"That picture could not be used as the town map."))}finally{X(!1)}},[i]),jg=(0,m.useCallback)(async()=>{if(!i)return;let l=Ba?Ba.image:Rl;X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:l,townMapView:hd??i.settings.townMapView})})),Ml(l),dd(null),Jr(null),md(!1)}catch(u){J(q(u,"The town map could not be saved."))}finally{X(!1)}},[i,hd,Rl,Ba]),Xl=(0,m.useCallback)(()=>{dd(null),Jr(null),md(!1),J("")},[]),Lg=(0,m.useCallback)(async()=>{X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Ml(""),Xl()}catch(l){J(q(l,"The town map could not be taken down."))}finally{X(!1)}},[Xl]),w$=(0,m.useCallback)(async(l,u,p="")=>{if(!en){Co(l),Jn(null),J("");try{r(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(N){Jn({id:l,text:q(N,"That place could not be drawn.")})}finally{Co("")}}},[en]),$$=(0,m.useCallback)(async(l,u,p,N="")=>{if(!(!u||!i||en)){Co(l),Jn(null),J("");try{let R=G=>Math.round(G/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){Jn({id:l,text:`That picture is ${R(u.size)} MB and a place holds ${R(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let I=await Br(u);r(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:I,spaceClass:p,privateOwnerId:N})}))}catch(R){Jn({id:l,text:q(R,"That picture could not be kept.")})}finally{Co("")}}},[en,i]),x$=(0,m.useCallback)(async(l,u,p="")=>{if(!en){Co(l),Jn(null),J("");try{r(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(N){Jn({id:l,text:q(N,"That picture could not be taken away.")})}finally{Co("")}}},[en]),N$=i?.settings.maxPlaces??48,Io=i?.settings.setupMaxVillagerCount??Ip,Gg=(i?.settings.homeBuildings??[]).map(l=>({...l,name:i?.settings.homeBuildingNames?.[l.kind]??l.name})),S$=i&&!i.isFounded?1+Io:N$,Ql=Math.max(0,S$-Xn(i?.settings.venues??[]).length),k$=(i?.settings.venues.length??0)+yl.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,ls=(0,m.useCallback)(l=>{let u=Zp(l);wl(u.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Fu(u[0]?.id??null),aa(!1)},[]),Yg=(0,m.useCallback)(()=>{J(""),i&&ls(i.settings.venues),It("village"),xo("homes"),se("menu")},[ls,i]),Xg=(0,m.useCallback)((l,u)=>{if(J(""),Ta.length>=Ql||Ta.length>=1+Io)return;let p=pl(),N=Ta.length===0;wl(R=>[...R,{id:p,name:N?"Your residence":`Residence ${R.length+1}`,form:"Home",description:"",x:l,y:u,building:null,isPlayerHome:N,characterId:null}]),Fu(p)},[Ta.length,Ql,Io]),T$=(0,m.useCallback)((l,u,p)=>{let N=Fe.find(I=>I.category==="public-center"),R=td??($l?N?.id:void 0);if(U0({x:l,y:u},Fe.filter(I=>I.id!==R).map(I=>I.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){ad("That photograph would cover another venue. Place it a little to the side.");return}if(ad(""),R)_i(I=>I.map(G=>G.id===R?{...G,presentation:{...G.presentation,x:l,y:u}}:G)),qa(R);else if($l){let I=K0(pl(),"gathering",l,u);_i(G=>[...G,I]),qa(I.id)}else if(Di){let I=Fe.filter($e=>$e.classes?.includes("residence"));if(I.length>=1+Io)return;let G=K0(pl(),"residence",l,u,I.length===0,I.length+1);_i($e=>[...$e,G]),qa(G.id)}Hi(null),aa(!1),Ii(!1)},[td,Di,$l,Io,Fe]),Li=(0,m.useCallback)((l,u)=>{_i(p=>p.map(N=>N.id===l?u(N):N))},[]),E$=(0,m.useCallback)(l=>{_i(u=>{let p=u.filter(N=>N.id!==l);if(!p.some(N=>N.occupancy.playerHome)){let N=p.findIndex(R=>R.classes?.includes("residence"));N>=0&&(p[N]={...p[N],occupancy:{...p[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),qa(u=>u===l?null:u)},[]),C$=(0,m.useCallback)((l,u)=>{Xg(l,u),aa(!1),se("menu")},[Xg]),Qg=(0,m.useCallback)((l,u)=>{i?.settings.venues.some(p=>p.id===l&&p.occupancy.residentCharacterId)||wl(p=>p.map(N=>N.id===l?{...N,...u}:N))},[i]),z$=(0,m.useCallback)(l=>{if(i?.settings.venues.some(u=>u.id===l&&u.occupancy.residentCharacterId)){J("Move the resident to another venue before removing this home.");return}wl(u=>{let p=u.filter(N=>N.id!==l);return p.length>0&&!p.some(N=>N.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[i]),A$=(0,m.useCallback)(async()=>{if(i){if(Ta.some(l=>!l.description.trim())){J("Review a description for every home before saving.");return}X(!0),J("");try{r(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:sS(i.settings.venues,Ta),venueScope:"homes"})})),aa(!1)}catch(l){J(q(l,"Those homes could not be saved."))}finally{X(!1)}}},[Ta,i]),R$=async l=>{if(!i)return;let u=i.villagers.find(N=>N.characterId===l.characterId)?.name,p=l.isPlayerHome?`${yo(i)}'s home`:u?`${u}'s home`:r1(Gg,l.building).name;X(!0),J("");try{let N=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:p,homeKind:l.building}]})});Qg(l.id,{description:N.descriptions[l.id]??""})}catch(N){J(q(N,"The home description could not be generated. You can write it by hand."))}finally{X(!1)}},M$=l=>{if(i?.isFounded||l===Sn)return;let u=wo(Sn).premise,p=!!Ea.trim()&&Ea!==u;hg(l),p||Wu(wo(l).premise),mg(""),Ne("")},cs=(0,m.useCallback)((l,u)=>{J(""),Ne(""),xg(!1),Kr(!1),Al(!1),Kt(!1),Nn(""),Sl(0),ug(l?"":u?.village.name??""),dg(l?"":u?.village.setting??"");let p=l?"":u?.settings.foundingReason??"",N=Yp.some(Ho=>Ho.value===p),R=N?p:p?"custom":"rebuild",I=B2[p]??p,G=u?.settings.foundingDetails??"",$e=[I,G].filter(Boolean).join(" "),Ca=$e.length>(u?.settings.foundingDetailsMaxLength??500),_o=u?.isFounded?G:p&&!N?Ca?G:$e:l||!p?wo(R).premise:G,Cn=l?"":u?.isFounded?u.settings.foundingGuidance??"":[Ca?I:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");hg(R),Wu(_o),mg(R==="none"?"":Cn),M1(l?Dp():u?.settings.scenarioImprint??Dp()),pg(l?[]:u?.settings.worldFacts??[]),kl([]);let na=l||!u?[]:u.settings.venues.filter(Ho=>Ho.classes?.includes("residence")||Ho.category==="public-center");_i(na),qa(na[0]?.id??null),Hi(null),Kn(null),ad(""),ag(l?[]:u?.settings.selectedLorebookIds??[]),ng(l?1600:u?.settings.loreTokenBudget??1600),vg({...Z0}),Ui(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),nd(""),id(null),yg(""),od(null),rd(u?.settings.townMapLayoutPrompt??""),sd(u?.settings.townMapNegativePrompt??""),Pr(!1),Pn(l?"":u?.settings.playerPersonaId??""),Vo(),Do(),ls(l||!u?[]:u.settings.venues),se("setup")},[Do,Vo,ls]),Zg=(0,m.useCallback)(l=>{if(Ie===0&&l>0){if(Fa.trim().length===0){Ne("Give the village a name before continuing.");return}if(Tt.trim().length===0){Ne("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!Ea.trim()){Ne("Describe the village's first day before continuing.");return}}if(Ie===1&&l>1){if(!yt.trim()){Ne("Choose the Persona who lives in this village.");return}if(!Lr?.some(u=>u.id===yt)){Ne("That Persona is no longer in your library. Choose another one to continue.");return}if(ud.length>0){Ne(ud);return}if($g){Kr(!0);return}}if(Ie===2&&l>2&&_e!=="none"&&!qi){Ne(_e==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ie===3&&l>3){let u=Fe.filter(G=>G.classes?.includes("residence")),p=u.filter(G=>!G.occupancy.playerHome),N=p.length;if(!u.some(G=>G.occupancy.playerHome)||N<P0||N>Ip||!Fe.some(G=>G.category==="public-center")){Ne("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let R=p.map(G=>G.occupancy.residentCharacterId).filter(Boolean);if(R.length!==p.length||new Set(R).size!==R.length){Ne("Assign a different villager to each villager Residence before review.");return}let I=Fe.map(G=>({venue:G,field:G.name.trim()?G.form?.trim()?G.description.trim()?G.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:G})=>G);if(I){qa(I.venue.id),Ne(`Complete ${I.field.replaceAll("-"," ")} for ${I.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${I.field}`)?.focus(),0);return}}Kr(!1),Ne(""),Sl(l),l===1&&Vo(),l===0&&Do(),l===3&&tn(),aa(!1),Ii(!1),Hi(null)},[ud,Fe,$g,tn,Vo,Do,yt,Lr,_e,qi,Fa,Ea,i?.isFounded,Tt,Ie,e]),O$=(0,m.useCallback)(()=>{Kr(!1),Ne(""),Sl(2),aa(!1),Ii(!1)},[]),V$=(0,m.useCallback)(()=>{Kr(!1),Ne("")},[]),ke=Fe.find(l=>l.id===Yr)??null,us=ke?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{gg(0),ed(!1)},[Yr,us]),(0,m.useEffect)(()=>{if(!Yr||ke?.form?.trim()||fg)return;let l=window.setInterval(()=>gg(u=>(u+1)%5),4e3);return()=>window.clearInterval(l)},[Yr,ke?.form,fg]);let xd=ke?St(ke,ke.category==="public-center"?"gathering":"residence"):null,D$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),I$=async(l,u)=>{if(Wa)return;if(!(u==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){qa(l.id),Ne(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let N=Zr;Tl(!0),Ne("");try{let R=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:D$(l),area:u,villageName:Fa,setting:Tt,foundingDetails:Ea,scenarioImprint:i?.isFounded?R1:null,worldFacts:i?.isFounded?kn:[],selectedLorebookIds:Ua})});ld.current===N&&Kn({venueId:l.id,area:u,image:R})}catch(R){Ne(q(R,"Venue art could not be generated."))}finally{Tl(!1)}},_$=async(l,u,p)=>{if(!(!p||Wa)){if(p.size>(i?.settings.maxVenueImageBytes??8e6)){Ne("That venue image is too large. Choose a smaller file.");return}Tl(!0),Ne("");try{let N=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await Br(p)})});Kn({venueId:l.id,area:u,image:N})}catch(N){Ne(q(N,"That venue image could not be uploaded."))}finally{Tl(!1)}}},H$=()=>{if(!Xr)return;let{venueId:l,area:u,image:p}=Xr;Li(l,N=>u==="exterior"?{...N,presentation:{...N.presentation,image:p}}:{...N,spaces:[{...St(N,N.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),Kn(null)},Pg=(0,m.useCallback)(()=>{if(Fa.trim().length===0)return"Give the village a name.";if(yt.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!Ea.trim())return"Describe the village's first day.";let l=kn.map(R=>R.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(R=>R.length>160)))return"Use at most four current world facts of 160 characters each.";if(Tt.trim().length===0)return"Describe what the village is like.";if(_e!=="none"&&!qi)return"Choose, generate, or upload the village map.";let u=Fe.filter(R=>R.classes?.includes("residence")),p=u.filter(R=>!R.occupancy.playerHome);if(p.length<P0||p.length>Ip)return"Place one to three homes for initial villagers.";if(!u.some(R=>R.occupancy.playerHome))return"One Residence has to be yours.";if(Fe.some(R=>!R.name.trim()||!R.form?.trim()||!R.description.trim()||!R.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=p.map(R=>R.occupancy.residentCharacterId).filter(R=>R!==null);return N.length!==p.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":Fe.filter(R=>R.category==="public-center").length!==1?"Place one Gathering Place.":""},[Fe,yt,_e,qi,Fa,Ea,i?.isFounded,kn,Tt]),U$=(0,m.useCallback)(async()=>{let l=Pg();if(l){let u=Fe.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(u){let p=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";qa(u.id),Sl(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${p}`)?.focus(),0)}Ne(l);return}X(!0),Ne("");try{let u=await D("/setup",{method:"POST",body:JSON.stringify({name:Fa.trim(),setting:Tt.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:Sn,foundingDetails:i?.isFounded?i.settings.foundingDetails:Ea.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:Gr.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?kn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:Ua,loreTokenBudget:So,playerPersonaId:yt,townMapImage:qi??"",townMapView:_e==="existing"?zo:Yu("cover"),venues:Fe})});r(u),aa(!1),se(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){Ne(q(u,"The village could not be founded."))}finally{X(!1)}},[e,Fe,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,yt,zo,Pg,_e,qi,Fa,Sn,Ea,Gr,kn,Ua,So,Tt]),q$=(0,m.useCallback)(async()=>{X(!0),J("");try{let l=await D("/setup/reset",{method:"POST"});r(l),c(null),cs(!0,l)}catch(l){J(q(l,"The village could not be reset."))}finally{X(!1),Al(!1)}},[cs]),Kg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||Kg.current||(Kg.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&se("preparing"):cs(!1,i))},[cs,i]),(0,m.useEffect)(()=>{if(he!=="preparing")return;let l=!1,u=async()=>{try{let N=await D("/setup/preparation");if(l)return;r(N),zl(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&se("home")}catch(N){l||zl(q(N,"Preparation status could not be read."))}};u();let p=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(p)}},[he]);let B$=(0,m.useCallback)(async()=>{zl("");try{r(await D("/setup/preparation/retry",{method:"POST"}))}catch(l){zl(q(l,"Preparation could not be retried."))}},[]),j$=(0,m.useCallback)(()=>{le({id:pl(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),L$=(0,m.useCallback)(async l=>{X(!0),J("");try{let u=i?.settings.venues.some(I=>I.id===l.id)??!1,p=yn(l).map(I=>St(l,I)),N=await D(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:p[0]?.description??l.description}:{name:l.name,classes:l.classes,description:p[0]?.description??l.description})}),R=Xn(N.settings.venues).find(I=>u?I.id===l.id:I.name.toLowerCase()===l.name.trim().toLowerCase());r(N),le(null),u||Pe("projects"),ko(I=>{let G=I.map($e=>$e.id===l.id&&R?R:$e);return[...G,...Xn(N.settings.venues).filter($e=>!G.some(Ca=>Ca.id===$e.id))]})}catch(u){J(q(u,"That place could not be saved."))}finally{X(!1)}},[i,Pe]),G$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(p=>p.id===l);if(!u){ko(p=>p.filter(N=>N.id!==l));return}X(!0),J("");try{let p=await D(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){J(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,R=N||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${N} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(R))return;let I=await D(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(I),ko(G=>G.filter($e=>$e.id!==l))}catch(p){J(q(p,"That place could not be removed."))}finally{X(!1)}},[i]),Jg=(0,m.useCallback)(async(l,u)=>{X(!0),J("");try{let p=Mi[l.id]??l.venueDraft,N=await D(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(p):void 0});if(r(N),u){let R=new Set(yl.map(I=>I.id));ko(I=>[...I,...Xn(N.settings.venues).filter(G=>!R.has(G.id))])}Oi(R=>{let I={...R};return delete I[l.id],I})}catch(p){J(q(p,u?"That venue could not be approved.":"That request could not be denied."))}finally{X(!1)}},[Mi,yl]),Y$=(0,m.useCallback)(l=>{let u=vd.current,p=u?.selectionStart??ta.length,N=u?.selectionEnd??p;yd.current=p+l.length,No(`${ta.slice(0,p)}${l}${ta.slice(N)}`)},[ta]),Fg=(0,m.useCallback)(async()=>{let l=Nl.trim();if(l.length!==0){X(!0),J("");try{r(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),cg("")}catch(u){J(q(u,"That notice could not be pinned up."))}finally{X(!1)}}},[Nl]),X$=(0,m.useCallback)(async l=>{X(!0),J("");try{r(await D(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){J(q(u,"That notice could not be taken down."))}finally{X(!1)}},[]),Zl=da.trim().toLowerCase(),Nd=(s??[]).filter(l=>Zl.length===0||l.name.toLowerCase().includes(Zl)||l.comment.toLowerCase().includes(Zl)||l.tags.some(u=>u.toLowerCase().includes(Zl))),Wg=[...(i?.villagers??[]).map(l=>l.characterId),...Ke?Nd.map(l=>l.id):[]].join(`
`),ef=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Wg.split(`
`).filter(p=>p.length>0&&!ef.current.has(p));if(l.length===0)return;for(let p of l)ef.current.add(p);let u=new AbortController;return(async()=>{try{let p=await tS(l,u.signal);u.signal.aborted||gl(N=>({...N,...p}))}catch{}})(),()=>u.abort()},[Wg]);let Sd=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Bt(null),Sd.length===0)return;let l=new AbortController;return(async()=>{try{let u=await aS(Sd,l.signal);l.signal.aborted||Bt(u)}catch{}})(),()=>l.abort()},[Sd]);let ha=(0,m.useCallback)(l=>l?s?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[s,i]),Q$=(()=>{let l=i?.settings.venues??[],u=[],p=new Map;for(let N of i?.villagers??[]){let R=N.place?.id;if(!R)continue;let I=p.get(R);I?I.push(N):p.set(R,[N])}for(let N of l){let R=Gu(N);if(!R)continue;let I=i?.projects.find(Cn=>Cn.venueId===N.id&&Cn.lifecycle?.phase!=="complete"),G=()=>{I&&(Pe("projects"),Dt(I.id),Wt(I.id))},$e=N.occupancy.residentCharacterId,Ca=jr(N),_o=N.occupancy.playerHome?yo(i):ha($e);u.push({id:N.id,x:R.x,y:R.y,text:Ca?bS(_o):N.name,image:I?wS:N.presentation.image?.url??null,tone:Ca?s1({isPlayerHome:N.occupancy.playerHome,occupant:$e}):"venue",selected:me===N.id,doors:me===N.id?[...I?[{label:"View Project",onSelect:G}]:[],...I?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>Gl(N)},{label:"Visit",onSelect:()=>{Yl(N)}}]]:void 0,onSelect:I?.kind==="new-venue"?G:()=>Hg(N)}),(p.get(N.id)??[]).forEach((Cn,na)=>{u.push({id:`villager:${Cn.characterId}`,x:R.x,y:R.y,dy:yS*(na+1),text:Cn.name,tone:"resident",kind:"person"})})}return u})(),Z$=Fe.flatMap(l=>{let u=Gu(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>qa(l.id)}]:[]});if(he==="room")return(0,o.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[B?(0,o.jsx)(DS,{room:B,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:K2(i?.settings.venues??[],B),draft:ts,mode:as,targetId:ns,busy:Ya,error:Q1,greetingNotice:Z1,ruling:G1,open:L1,ended:Mo,playerName:yo(i),playerPortrait:W??void 0,portraits:Zn,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{Bi.current=null,os.current=null,Tn(l)},onMode:l=>{Bi.current=null,Dl(l)},onTarget:l=>{Bi.current=null,gd(l)},onSend:()=>{as==="conclude"?s$():u$()},onViewVenue:()=>{Je(B.placeId),le(null),se("venue"),ze()},onEnterPrivate:B.area==="shared"&&B.privateAccessOwnerId?()=>{ct(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:B.id,ownerId:B.privateAccessOwnerId})}).then(({session:l})=>{qe(l),ze()}).catch(l=>ut(q(l,"That private space could not be entered."))).finally(()=>ct(!1))}:void 0,privateSpaceOwnerName:ha(B.privateAccessOwnerId),onEnd:()=>{r$()},notices:Y1,onDismissNotice:l=>La(u=>u.filter(p=>p.id!==l)),debugDiscardEnabled:Il,onDebugDiscard:()=>{c$()},onLeavePending:()=>{l$()},endFailed:ve,reviewing:is===B.id,onRetryGreeting:()=>{if(B.id)$d(B.id);else{let l=i?.settings.venues.find(u=>u.id===B.placeId);l&&Yl(l)}},onContinueWithoutGreeting:()=>{B.id&&h$(B.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===B.placeId&&l.occupancy.playerHome&&(!B.spaceClass||B.spaceClass==="residence"))?()=>es(!0):void 0,onProjects:()=>Pe("projects")}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:ss,children:"Back to village"}),j1&&i?(0,o.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>es(!1),children:(0,o.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>es(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[ha(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(VS,{entry:l,onDecide:async(u,p)=>{r(await D(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...p})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{es(!1),Pe("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{es(!1),Pe("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(he==="venue"){let l=(i?.settings.venues??[]).find(E=>E.id===qt)??null;if(!i||!l)return(0,o.jsx)("div",{className:`${n}-root`,children:(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Ug,children:"Back to map"})]})});let u=d$(l.id),p=yn(l),N=l.occupancy.homeKind?r1(Gg,l.occupancy.homeKind).name:"",R=l.occupancy.playerHome?yo(i):ha(l.occupancy.residentCharacterId),I=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),G=p.includes("residence")&&I.length>0,$e=B?.placeId===l.id&&(B.area==="shared"||B.area==="private"),Ca=B?.placeId===l.id&&B.area==="private"?B.privateOwnerId:"",_o=l.occupancy.playerHome||l.playerSeenShared||$e,Cn=(l.privateSpaces??[]).filter(E=>l.playerSeenPrivateIds?.includes(E.ownerId)||E.ownerId===Ca),na=B?.status!=="closed"&&B?.id?B:null,Ho=(l.playerInvitations??[]).some(E=>I.includes(E.residentId)),kd=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:p[0],ownerId:"",image:l.presentation.image,description:l.form||N||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...p.map(E=>{let ue=St(l,E),Q=E==="residence",ne=Q?!_o:!l.playerSeenPublic&&!(na?.placeId===l.id&&na.area==="public"),Le=!Q||!G||l.occupancy.playerHome||Ho;return{key:`class:${E}`,label:p.length===1?"Interior":`${E[0].toUpperCase()}${E.slice(1)} interior`,subtitle:Q?"Shared living space":`${E[0].toUpperCase()}${E.slice(1)} space`,area:Q?"shared":"public",spaceClass:E,ownerId:"",image:ne?null:ue.image,description:ne?"":ue.description,state:ne?void 0:ue.state,locked:ne,canEnter:Le,accessLabel:Le?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(E=>I.includes(E.ownerId)).map(E=>{let ue=ha(E.ownerId),Q=!l.playerSeenPrivateIds?.includes(E.ownerId)&&E.ownerId!==Ca,ne=(l.playerInvitations??[]).some(Le=>Le.scope==="private"&&Le.ownerId===E.ownerId&&Le.residentId===E.ownerId);return{key:`private:${E.ownerId}`,label:`${ue}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:E.ownerId,image:Q?null:E.image,description:Q?"":E.description,state:Q?void 0:E.state,locked:Q,canEnter:ne,accessLabel:ne?"Owner's invitation available":"Owner's invitation required",adaptationPending:!Q&&E.adaptationPending}})],ae=kd.find(E=>E.key===it)??kd[0],tf=(l.editProposals??[]).filter(E=>ae.area==="shared"?E.target==="shared":ae.area==="private"&&E.target==="private"&&E.ownerId===ae.ownerId),Td=ae.description&&ae.description!==l.form&&ae.description!==N?ae.description:"",P$=!ae.locked&&!!(Td||ae.adaptationPending||ae.state?.condition||ae.state?.items.length||ae.state?.publicFacts.length||ae.state?.features.length||ae.area==="outside"&&i.village.setting||tf.length),Pl=na?.placeId===l.id&&na.area===ae.area&&(ae.area==="outside"||na.spaceClass===ae.spaceClass)&&(ae.area!=="private"||na.privateOwnerId===ae.ownerId),Ed=(E,ue,Q,ne="")=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:E}),ue?(0,o.jsx)("img",{className:`${n}-venue-space-picture`,src:ue.url,alt:`${E} at ${l.name}`}):(0,o.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!en||_,onClick:()=>{w$(l.id,Q,ne)},children:ue?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${E.toLowerCase()} image`,disabled:!!en||_,onChange:Le=>{let ds=Le.target.files?.[0];Le.target.value="",$$(l.id,ds,Q,ne)}}),ue?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!en||_,onClick:()=>{x$(l.id,Q,ne)},children:"Remove image"}):null]})]},ne||Q||"exterior"),Uo=E=>({name:E.name,form:E.form,workerIds:E.workerIds,position:{x:E.presentation.x,y:E.presentation.y},spaces:p.map(ue=>{let Q=St(E,ue);return{description:Q.description,condition:Q.state.condition,items:Q.state.items,publicFacts:Q.state.publicFacts,features:Q.state.features.map(({id:ne,text:Le,locked:ds})=>({id:ne,text:Le,locked:ds}))}}),privateSpaces:E.privateSpaces?.map(ue=>({ownerId:ue.ownerId,description:ue.description,condition:ue.state.condition,items:ue.state.items,publicFacts:ue.state.publicFacts,features:ue.state.features.map(({id:Q,text:ne,locked:Le})=>({id:Q,text:ne,locked:Le}))}))}),K$=!!(Y&&JSON.stringify(Uo(Y))!==JSON.stringify(Uo(l))),J$=!!(ie&&(JSON.stringify(ie.classes)!==JSON.stringify(p)||ie.capacity!==(l.residenceCapacity??1)||ie.slot!==0||ie.title||ie.description||ie.extraBeds)),F$=()=>{(Ze==="edit"&&K$||Ze==="proposal"&&J$)&&!window.confirm("Discard your unsaved changes?")||(vt("view"),le(null),z(null),we(""),Ue(""))},af=(E,ue)=>{r(E);let Q=E.settings.venues.find(ne=>ne.id===l.id);Q&&le(structuredClone(Q)),Ue(ue)},W$=async()=>{if(Y){if(Y.form!==l.form||JSON.stringify(Y.classes)!==JSON.stringify(l.classes)||JSON.stringify(Y.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(Y.state)!==JSON.stringify(l.state)||Y.presentation.x!==l.presentation.x||Y.presentation.y!==l.presentation.y){we("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(G){let E=Uo(Y),ue=Uo(l),Q=p.indexOf("residence");if((Q>=0&&JSON.stringify(E.spaces[Q])!==JSON.stringify(ue.spaces[Q])||JSON.stringify(E.privateSpaces)!==JSON.stringify(ue.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}oe(!0),we(""),Ue("");try{let E=await D(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:Y.name,description:Y.description})});af(E,"Venue details saved.")}catch(E){we(q(E,"The Venue could not be saved."))}finally{oe(!1)}}},nf=async(E,ue="")=>{if(!Y)return;let Q=E==="private"?Y.privateSpaces?.find(Le=>Le.ownerId===ue):St(Y,"residence");if(!Q)return;let ne=structuredClone(Y);if(E==="shared"?ne.spaces=ne.spaces?.map(Le=>Le.venueClass==="residence"?St(l,"residence"):Le):ne.privateSpaces=ne.privateSpaces?.map(Le=>Le.ownerId===ue?l.privateSpaces?.find(ds=>ds.ownerId===ue)??Le:Le),!(JSON.stringify(Uo(ne))!==JSON.stringify(Uo(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){oe(!0),we(""),Ue("");try{let Le=await D(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:E,ownerId:ue,description:Q.description,state:Q.state})});af(Le,`${E==="private"?"Private":"Shared"} room edit proposed.`)}catch(Le){we(q(Le,"That room edit could not be proposed."))}finally{oe(!1)}}},of=vS(l,R);return(0,o.jsxs)("div",{className:`${n}-root`,"data-venue-view":Ze==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:Ze==="view"?of:`${Ze==="edit"?"Edit Venue":"Propose Change"} \xB7 ${of}`}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:Ze==="view"?l.form||N||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(E=>E.name).join(", ")}`):Ze==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${n}-actions`,children:Ze==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{le(structuredClone(l)),we(""),Ue(""),vt("edit")},children:"Edit Venue"}),p.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{we(""),D(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(E=>we(q(E,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{z({classes:p,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),we(""),Ue(""),vt("proposal")},children:"Propose Change"}),na?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>se("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:F$,children:Ze==="edit"?"Close Editor":"Exit Change Proposal"})}),Ze==="view"&&pe?(0,o.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:pe}):null]})]}),Ze==="view"?(0,o.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:n+"-venue-back",onClick:Ug,children:"\u2190 Back to map"}),kd.map(E=>(0,o.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":ae.key===E.key?"true":"false","aria-current":ae.key===E.key?"page":void 0,onClick:()=>ea(E.key),children:[(0,o.jsx)("span",{className:n+"-venue-zone-thumb",children:E.image&&!E.locked?(0,o.jsx)("img",{src:E.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:E.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:E.label}),(0,o.jsx)("small",{children:E.subtitle})]})]},E.key))]}),(0,o.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,o.jsx)("section",{className:n+"-venue-zone-main","aria-label":ae.label,children:(0,o.jsx)("div",{className:n+"-venue-artwork",children:ae.image&&!ae.locked?(0,o.jsx)("img",{src:ae.image.url,alt:ae.label+" at "+l.name}):(0,o.jsx)("div",{className:n+"-venue-artwork-empty",children:ae.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,o.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:ae.label}),(0,o.jsx)("p",{children:ae.subtitle}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:p.includes("residence")?Pu(l)+" / "+a1(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:ae.accessLabel})]}),P$?(0,o.jsxs)("details",{className:n+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),Td?(0,o.jsx)("p",{children:Td}):null,ae.adaptationPending?(0,o.jsx)("p",{children:"This room is still being adapted after a move."}):null,ae.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",ae.state.condition]}):null,ae.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",ae.state.items.join(", ")]}):null,ae.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",ae.state.publicFacts.join(" \xB7 ")]}):null,ae.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",ae.state.features.map(E=>E.text).join(" \xB7 ")]}):null,ae.area==="outside"&&i.village.setting?(0,o.jsxs)("p",{children:["Village: ",i.village.setting]}):null,tf.map(E=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",E.declined?"declined or stale":`approved by ${E.approvedIds.length} of ${E.requiredIds.length} residents`]},E.id))]}):null,ae.locked&&!ae.canEnter?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,na&&!Pl?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Finish the active visit before entering another area."}):null,(0,o.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:Ya||!Pl&&(!!na||!ae.canEnter),onClick:()=>Pl?se("room"):void Yl(l,ae.spaceClass,ae.ownerId,ae.area),children:Ya?"Opening visit\u2026":Pl?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):Ze==="edit"?(0,o.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,o.jsxs)("div",{className:`${n}-venue-space-grid`,children:[Ed("Exterior image",l.presentation.image),p.filter(E=>E!=="residence"||_o).map(E=>Ed(E==="residence"?"Shared Residence image":`${E} space image`,St(l,E).image,E)),Cn.map(E=>Ed(`${ha(E.ownerId)}'s private image`,E.image,"residence",E.ownerId))]}),en===l.id?(0,o.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,Sg?.id===l.id?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Sg.text}):null,Y?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,o.jsx)(n1,{draft:Y,existing:!0,villagers:i.villagers,editableClasses:p.filter(E=>E!=="residence"||!G||$e),onChange:le}),G?(0,o.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:U||!Y.name.trim(),onClick:()=>{W$()},children:"Save Venue details"}),G&&$e?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:U||!St(Y,"residence").description.trim(),onClick:()=>{nf("shared")},children:"Propose shared room edit"}):null]}),G&&!$e?(0,o.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,Ca&&Y?.privateSpaces?.filter(E=>E.ownerId===Ca).map(E=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",ha(E.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.description,onChange:ue=>le(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===E.ownerId?{...ne,description:ue.target.value}:ne)})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.condition,onChange:ue=>le(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===E.ownerId?{...ne,state:{...ne.state,condition:ue.target.value}}:ne)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.items.join(`
`),onChange:ue=>le(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===E.ownerId?{...ne,state:{...ne.state,items:ue.target.value.split(`
`)}}:ne)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.publicFacts.join(`
`),onChange:ue=>le(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===E.ownerId?{...ne,state:{...ne.state,publicFacts:ue.target.value.split(`
`)}}:ne)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:U||!E.description.trim(),onClick:()=>{nf("private",E.ownerId)},children:"Propose private room edit"})]},E.ownerId)),G&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:Se,onChange:E=>S(E.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(E=>E.id!==l.id&&yn(E).includes("residence")&&Pu(E)<a1(E)).map(E=>(0,o.jsx)("option",{value:E.id,children:E.name},E.id))]}),(l.residentIds??[]).map(E=>{let ue=i.residences.find(Q=>Q.characterId===E&&Q.status!=="current");return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("strong",{children:ha(E)}),ue?(0,o.jsx)("span",{className:`${n}-hint`,children:ue.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!Se||U,onClick:()=>{oe(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:E,venueId:Se})}).then(r).catch(Q=>we(q(Q,"The move could not be requested."))).finally(()=>oe(!1))},children:"Ask to move"})]},E)})]}):null,lt?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:lt}):null,pe?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:pe}):null]}):(0,o.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ie?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:$1.map(E=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:ie.classes.includes(E),disabled:!ie.classes.includes(E)&&ie.classes.length>=2,onChange:ue=>z(Q=>Q&&{...Q,classes:ue.target.checked?[...Q.classes,E]:Q.classes.filter(ne=>ne!==E)})})," ",E]},E))})]}),ie.classes.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:ie.capacity,onChange:E=>z({...ie,capacity:Number(E.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:ie.slot,onChange:E=>z({...ie,slot:Number(E.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${n}-notice-input`,value:ie.title,onChange:E=>z({...ie,title:E.target.value}),placeholder:"A second sleeping alcove"})]}),ie.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:ie.description,onChange:E=>z({...ie,description:E.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:ie.extraBeds,onChange:E=>z({...ie,extraBeds:Number(E.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:U||ie.classes.length<1||ie.title.trim().length>0&&!ie.description.trim(),onClick:()=>{oe(!0),we(""),D(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ie.classes,capacity:ie.capacity,...ie.title.trim()?{slot:ie.slot,improvement:{title:ie.title,description:ie.description,extraBeds:ie.extraBeds}}:{},title:ie.title||`Change ${l.name}`,detail:ie.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(E=>{r(E),z(null),Ue("Proposal submitted.")}).catch(E=>we(q(E,"The proposal could not be saved."))).finally(()=>oe(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:lt||"Proposal submitted."}),pe?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:pe}):null]})})]})}if(he==="menu")return(0,o.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":$n,"data-projects":F==="projects"?"true":"false","data-mobile":t,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[$n]}),t?null:(0,o.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${n}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:$n!=="index"?()=>It("index"):ss,children:$n!=="index"?"Back to menu":"Back to the village"})})]}),Wr?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Wr}):null,(0,o.jsx)("nav",{className:`${n}-mobile-menu-nav`,"aria-label":"Village menu",children:$n==="index"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Pe("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Pe("village"),children:"Village Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Pe("story"),children:"DEBUG Settings"})]}):$n==="village"?(0,o.jsx)(o.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["projects","Projects"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([l,u])=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,"data-active":F===l,onClick:()=>l==="homes"?Yg():Pe(l),children:u},l))}):$n==="debug"?(0,o.jsxs)(o.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([l,u])=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,"data-active":F===l,onClick:()=>Pe(l),children:u},l)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||_||ql,onClick:()=>{Og()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${n}-status`,children:p1}),Hl?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:Hl}):null]}):null}),(0,o.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Everything you can change",children:[(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="villagers","data-active":F==="villagers"?"true":"false",disabled:!i||_,onClick:()=>Pe("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="noticeboard","data-active":F==="noticeboard"?"true":"false",disabled:!i||_,onClick:()=>Pe("noticeboard"),children:`Noticeboard (${i?.noticeboard.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="venueRequests","data-active":F==="venueRequests"?"true":"false",disabled:!i||_,onClick:()=>Pe("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="projects","data-active":F==="projects"?"true":"false",disabled:!i||_,onClick:()=>Pe("projects"),children:`Projects (${i?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="homes","data-active":F==="homes"?"true":"false",disabled:!i||_,onClick:Yg,children:`Homes (${Zp(i?.settings.venues??[]).length})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="map","data-active":F==="map"?"true":"false",disabled:!i||_,onClick:()=>Pe("map"),children:"Town map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="village","data-active":F==="village"?"true":"false",onClick:()=>Pe("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="general","data-active":F==="general"?"true":"false",onClick:()=>Pe("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="replyGuidance","data-active":F==="replyGuidance"?"true":"false",disabled:!i||_,onClick:()=>Pe("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="story","data-active":F==="story"?"true":"false",disabled:!i||_,onClick:()=>Pe("story"),children:`DEBUG: Village Story (${d?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="chatlogs","data-active":F==="chatlogs"?"true":"false",disabled:!i||_,onClick:()=>Pe("chatlogs"),children:`DEBUG: Venue Visits (${C?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="agendas","data-active":F==="agendas"?"true":"false",disabled:!i||_,onClick:()=>Pe("agendas"),children:`DEBUG: Villager Wishes (${j?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":F==="schedules","data-active":F==="schedules"?"true":"false",disabled:!i||_,onClick:()=>Pe("schedules"),children:`Villager Agendas (${j?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||_||ql,onClick:()=>{Og()},children:"Force Village Update"})]}),(0,o.jsx)("p",{className:`${n}-status`,children:p1}),Hl?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:Hl}):null]})]}),F==="general"?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,o.jsx)(Lp,{}),i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,o.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:_,onChange:l=>{g$(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Story pace"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,o.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:_,onChange:l=>{p$(l.target.value)},children:i.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${n}-hint`,children:oS(i.settings.storyPace)})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:_,onChange:l=>{let u=l.target.value;qg({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&qg({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!i,onClick:()=>cs(!1,i),children:"Run setup again"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${n}-row`,children:U1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:_,onClick:()=>{q$()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>Al(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!i,onClick:()=>Al(!0),children:"Reset the village and start over"})})]}),Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):F==="village"?(0,o.jsxs)("div",{className:`${n}-menu-body`,children:[i?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,o.jsx)(zS,{}),t?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Map background image"}),Ol?(0,o.jsx)("img",{className:`${n}-mobile-map-preview`,src:Ol,alt:"Current village map background"}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The map has no background image."}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Bg(u)}}),Ba?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{jg()},children:"Use this map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:Xl,children:"Cancel"})]}):i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Lg()},children:"Remove background image"}):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:bl,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>Wp(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(d1,{books:Ju,error:ig,selected:vl,onChange:eg,disabled:_}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:Ku,disabled:_,onChange:l=>tg(Number(l.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:j$,disabled:_||k$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${n}-notice-input`,type:"search",value:rg,onChange:l=>C1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${yn(l).join(" ")}`.toLowerCase().includes(rg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${n}-hint`,children:[l.form,yn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),yn(l).includes("residence")?(0,o.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Gl(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>le(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{G$(l.id)},"aria-label":`Delete ${l.name}`,disabled:_,children:"\xD7"})]})]},l.id))}),Y?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===Y.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(n1,{draft:Y,existing:i.settings.venues.some(l=>l.id===Y.id),villagers:i.villagers,onChange:le}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!Y.name.trim()||!yn(Y).every(l=>St(Y,l).description.trim()),onClick:()=>{L$(Y)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>le(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{f$()},disabled:_,children:"Suggest Venues"})}),yl.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>le(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${n}-knowledge`,ref:vd,className:`${n}-preset`,value:ta,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>No(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,o.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>Y$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(ES,{idPrefix:"settings",personas:Lr,draft:yt,onDraft:Pn,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:_}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{m$()},disabled:_,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{No(i.settings.defaultPromptKnowledge)},disabled:_,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${n}-hint`,children:ta===i.settings.promptKnowledge&&yt===i.settings.playerPersonaId&&bl===i.settings.setting&&JSON.stringify(vl)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):(0,o.jsxs)("div",{className:`${n}-menu-body`,children:[F==="villagers"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,o.jsxs)("nav",{className:`${n}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,o.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>g("residents"),children:[(0,o.jsx)("span",{children:"Residents"}),(0,o.jsxs)("small",{children:[i?.villagers.length??0," living here"]})]}),(0,o.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{g("memories"),A(null),jl()},children:[(0,o.jsx)("span",{children:"Memories"}),(0,o.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Kt(l=>!l),disabled:_,children:Ke?"Close the list":"Add a villager"})}),Ke?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("input",{className:`${n}-search`,type:"search",value:da,onChange:l=>Nn(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),s===null?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Nd.length===0?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${n}-picker-list`,children:Nd.map(l=>(0,o.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)($o,{portrait:Zn[l.id],name:l.name,className:`${n}-avatar`}),(0,o.jsxs)("div",{className:`${n}-picker-text`,children:[(0,o.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{a$(l.id)},disabled:_||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,o.jsx)(RS,{villager:l,portrait:Zn[l.characterId],selected:!1,onSelect:!l.place||B!==null?void 0:()=>{let u=i.settings.venues.find(p=>p.id===l.place?.id);u&&Hg(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,o.jsxs)("div",{className:`${n}-roster-entry`,children:[(0,o.jsxs)("div",{className:`${n}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,xn[l.characterId]?(0,o.jsx)("div",{className:`${n}-tile-summary`,children:xn[l.characterId].changed?`New card: ${xn[l.characterId].proposed?.name??"unavailable"}`:xn[l.characterId].sourceAvailable?`Snapshot revision ${xn[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Vi(Qn===l.characterId?null:l.characterId),"aria-expanded":Qn===l.characterId,children:Qn===l.characterId?"Close sprite studio":`Sprites \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{i$(l.characterId)},disabled:_||T.length>0,children:"Compare card"}),xn[l.characterId]?.changed&&xn[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{o$(l.characterId)},disabled:_||T.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{n$(l.characterId)},disabled:_||T.length>0,children:"Move out"})]})]}),Qn===l.characterId?(0,o.jsx)(OS,{villager:l,onSaved:r}):null]},l.characterId))})]}):(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,o.jsx)(X2,{library:b,busy:_,onRefresh:()=>{A(null),jl()},onForget:(l,u)=>{P1(l,u)}})]}):null,F==="noticeboard"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${n}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{X$(u)},disabled:_,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${n}-notice-add`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,type:"text",value:Nl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>cg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Fg())}}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Fg()},disabled:_||Nl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,F==="projects"&&i?(0,o.jsx)(IS,{snapshot:i,room:B,onSnapshot:r,onReturn:()=>se("room"),onMap:()=>{Wt(""),ss()},onPlaceOnMap:l=>{Dt(l),Jt(l),ss()},mobile:t,debugEnabled:Il,focusProjectId:wn,siteProjectId:Ft}):null,F==="venueRequests"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),i.venueRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=Mi[l.id]??l.venueDraft,p=N=>Oi(R=>({...R,[l.id]:{...u,...N}}));return(0,o.jsx)("li",{className:`${n}-notice-row`,children:(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:N=>p({name:N.target.value})}),(0,o.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:N=>p({classes:[N.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:N=>p({description:N.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!u.name.trim(),onClick:()=>{X(!0),J(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(N=>p({description:N.descriptions[l.id]??""})).catch(N=>J(q(N,"The description draft could not be generated."))).finally(()=>X(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{Jg(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Jg(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{X(!0),J(""),D(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(p=>J(q(p,"The upgrade request could not be decided."))).finally(()=>X(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=ha(l.characterId),p=i.settings.venues.find(N=>N.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${p}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{X(!0),J(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(N=>J(q(N,"The move could not be completed."))).finally(()=>X(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(N=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{X(!0),J(""),D(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(R=>J(q(R,"The move request could not be decided."))).finally(()=>X(!1))},children:N?"Approve move":"Deny"},String(N)))]},l.characterId)}),Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):null,F==="homes"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Homes on the map"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Ta.length>=Ql,onClick:()=>{aa(!0),ss()},children:"Put a home on the map"}),(0,o.jsx)("span",{className:`${n}-hint`,children:`${Ta.length} of at most ${Ql}`})]}),Ta.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No homes on the map yet."}):(0,o.jsx)(CS,{homes:Ta,villagers:(i?.villagers??[]).map(l=>({id:l.characterId,name:l.name})),disabled:_,selectedId:z1,onPatch:Qg,onRemove:z$,onSelect:Fu,showDescriptions:!0,onGenerateDescription:l=>{R$(l)},lockedIds:new Set(i.settings.venues.filter(l=>l.occupancy.residentCharacterId).map(l=>l.id))}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{A$()},children:"Save the homes"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>ls(i.settings.venues),children:"Put them back"}),(0,o.jsx)("span",{className:`${n}-hint`,children:rS(i.settings.venues,Ta)?"No unsaved changes.":"Unsaved changes."})]})]}):null,F==="map"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Town map"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,o.jsx)(jp,{src:Ol,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:i.settings.venues.flatMap(l=>{let u=Gu(l);if(!u)return[];let p=l.occupancy.residentCharacterId?ha(l.occupancy.residentCharacterId):l.occupancy.playerHome?yo(i):"";return[{id:l.id,x:u.x,y:u.y,text:p?`${l.name||"Home"} \xB7 ${p}`:l.name,tone:jr(l)?s1({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>sg(l.id)}]}),placing:xl!==null,view:Fr,shape:kg,zoom:B1,onView:Vl?Jr:void 0,onPlace:xl?(l,u)=>{let p=xl;X(!0),J(""),D(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:l,y:u}})}).then(r).catch(N=>J(q(N,"The venue could not be placed."))).finally(()=>{X(!1),lg(null)})}:void 0}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Venue positions and residents"}),i.settings.venues.map(l=>{let u=l.occupancy.residentCharacterId?ha(l.occupancy.residentCharacterId):l.occupancy.playerHome?yo(i):"";return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":A1===l.id,onClick:()=>sg(l.id),children:l.name||"Home"}),(0,o.jsx)("span",{className:`${n}-hint`,children:u?`Lives here: ${u}`:"No villager lives here"}),(0,o.jsx)("span",{className:`${n}-hint`,children:Gu(l)?"On map":"Not placed"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Pin moves need a future project."})]},l.id)}),xl?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>lg(null),children:"Cancel pin placement"}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}),Vl?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:l1.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Fr.fit===l.fit?"true":"false","aria-pressed":Fr.fit===l.fit,onClick:()=>Jr({...Fr,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsx)("p",{className:`${n}-hint`,children:l1.find(l=>l.fit===Fr.fit)?.help})]}):null,pd?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":pd.tone,children:pd.text}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Bg(u)}}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Lg()},children:"Remove background image"}):null]}),Vl?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{jg()},children:Ba?"Use this map":"Keep this framing"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:Xl,children:"Leave it as it was"})]}):(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>md(!0),children:"Crop or fit it again"}):null]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Pictures of the places"}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,o.jsx)("strong",{children:i.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),Xn(i.settings.venues).length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No places yet, so there is nothing to draw."}):(0,o.jsx)("ul",{className:`${n}-places`,children:Xn(i.settings.venues).map(l=>(0,o.jsxs)("li",{className:`${n}-place`,children:[l.presentation.image?(0,o.jsx)("img",{className:`${n}-place-thumb`,src:l.presentation.image.url,alt:"",loading:"lazy"}):(0,o.jsx)("span",{className:`${n}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,o.jsxs)("div",{className:`${n}-place-body`,children:[(0,o.jsx)("span",{className:`${n}-place-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Gl(l)},children:"View Venue"})})]})]},l.id))})]})]}):null,F==="replyGuidance"?(0,o.jsx)(AS,{}):null,F==="story"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village story"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),d===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the village remembers\u2026"}):d.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):G2(d).map(l=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{className:`${n}-story-day`,children:l.label}),(0,o.jsx)("ul",{className:`${n}-story`,children:l.entries.map(u=>{let p=Xp(u),N=u.actors.map(R=>R.name).join(", ");return(0,o.jsxs)("li",{className:`${n}-story-row`,children:[(0,o.jsxs)("span",{children:[p.length>0||u.scope==="private"||u.kind==="favour"?(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[p,u.scope==="private"?(0,o.jsx)("span",{className:`${n}-story-scope`,children:` \xB7 private to ${N}`}):null,u.kind==="favour"?(0,o.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 a favour"}):null,u.kind==="tick"?(0,o.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,u.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,disabled:_,onClick:()=>{K1(u.id)},"aria-label":`Forget: ${u.text}`,children:"\xD7"})]},u.id)})})]},`${l.label}:${l.entries[0]?.id??""}`)),d&&d.length<f?(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{J1()},children:["Load more memories (",d.length," of ",f,")"]}):null]}):null,F==="chatlogs"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:De,onChange:l=>{tt(l.target.value),k(0),L(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:Sa,onChange:l=>{bt(l.target.value),k(0),L(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||w===0,onClick:()=>{Ig()},children:"Delete all completed logs"}),Vt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Vt}):null,C===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):C.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):C.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",Qu(l.startedAt)]}),(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{wd(l.id)},children:H?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{t$(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Ig(l.id)},children:"Delete log"})]}),H?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${n}-story`,children:H.lines.map((u,p)=>(0,o.jsx)("li",{className:`${n}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Zu(i.villagers.find(N=>N.characterId===u.speakerId)?.nameColor):void 0,children:u.name||yo(i)})," \xB7 ",Qu(u.at)]}),(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Zu(i.villagers.find(N=>N.characterId===u.speakerId)?.dialogueColor):void 0,children:qr(u.content,`venue-${l.id}-${p}-`)}),(0,o.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(N=>H.participants.find(R=>R.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${l.id}:${p}`))}),(H.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${n}-story`,children:(H.submissions??[]).flatMap(u=>(u.recollections??[]).map(p=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:p.text}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,H.memoryReview&&H.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,open:H.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${H.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[`${H.memoryReview?.attempts??0} review attempts \xB7 ${H.memoryReview?.nextRecollection??0} recollections reviewed`,H.memoryReview?.error?` \xB7 Last error: ${H.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${n}-story`,children:(H.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${b1[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),w>20?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:v===0,onClick:()=>{k(Math.max(0,v-20)),L(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:v+20>=w,onClick:()=>{k(v+20),L(null)},children:"Next"})]}):null]}):null,F==="agendas"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),j===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):j.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:j.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,o.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${P2(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),l.completedWishes.length>0?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,o.jsx)("ul",{className:`${n}-story`,children:l.completedWishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish.wish}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{W1(l.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},l.characterId))})]}):null,F==="schedules"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),j===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):j.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${n}-agenda-list`,children:j.map(l=>(0,o.jsxs)("details",{className:`${n}-week`,children:[(0,o.jsx)("summary",{className:`${n}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Hp(l)?(0,o.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:_,onChange:u=>{e$(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{F1(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Hp(l)?" Earlier hours retain the previous plan.":""]}):Hp(l)?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let p=u.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],N=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:p.map((R,I)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[J0(R.startMinute),"\u2013",J0(R.endMinute)]}),(0,o.jsx)("strong",{children:R.activity}),(0,o.jsx)("span",{children:R.venueId?Q2(i?.settings.venues??[],R.venueId):"Home"}),(0,o.jsx)("span",{children:R.reason}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:R.status==="idle"?"Available":R.status==="dnd"?"Busy":R.status==="offline"?"Offline":"Online"})]},`${R.startMinute}-${R.endMinute}-${I}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:N.map((R,I)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:R.time}),(0,o.jsx)("strong",{children:R.activity}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:R.status||"No availability set"})]},`${R.time}-${I}`))}):(0,o.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]})]});if(he==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,p=l?.completedIds.length??0,N=i?.villagers.find($e=>$e.characterId===l?.currentId)?.name,R=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",I=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,G=l?.status==="pending"&&Number.isFinite(I)?Math.max(0,Math.floor((Date.now()-I)/1e3)):null;return(0,o.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${p} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[R,N?` for ${N}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${G!==null?` \xB7 ${G}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{B$()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(Lp,{})]})]}):null,wg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:wg}):null]})})}if(he==="setup"){let l=(s??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,o.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Ie,children:[(0,o.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:ju.map((u,p)=>(0,o.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":p===Ie?"true":"false","data-done":p<Ie?"true":"false","aria-current":p===Ie?"step":void 0,children:[(0,o.jsx)("span",{className:`${n}-setup-rail-number`,children:p+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${n}-side`,children:(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Ie+1," of ",ju.length," \xB7 ",ju[Ie]]}),Ie===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:Fa,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:_,onChange:u=>ug(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${n}-scenario-options`,children:Yp.filter(u=>u.value!=="custom"||i?.isFounded&&Sn==="custom").map(u=>(0,o.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:Sn===u.value,disabled:_||i?.isFounded,onChange:()=>M$(u.value)}),(0,o.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ie===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(TS,{personas:Lr,draft:yt,onDraft:Pn,disabled:_}),(0,o.jsx)(Lp,{onSetupProblem:_1,onImageWarningChange:xg,compact:!0}),H1?(0,o.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:V$,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:O$,children:"I understand, continue"})]})]}):null]}):null,Ie===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Tt,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:_||jt,onChange:u=>{dg(u.target.value),kl([])}}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Ea,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:_,onChange:u=>Wu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:kn.join(`
`),disabled:_,placeholder:"One stable fact per line, up to four.",onChange:u=>pg(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(d1,{books:Ju,error:ig,selected:Ua,onChange:u=>{ag(u),kl([])},disabled:_}),(0,o.jsxs)("details",{className:`${n}-field`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:So,disabled:_,onChange:u=>ng(Number(u.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ie===2?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="generate"?"true":"false","aria-pressed":_e==="generate",disabled:jt,onClick:()=>Ui("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="upload"?"true":"false","aria-pressed":_e==="upload",disabled:jt,onClick:()=>Ui("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="none"?"true":"false","aria-pressed":_e==="none",disabled:jt,onClick:()=>Ui("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="existing"?"true":"false","aria-pressed":_e==="existing",disabled:jt,onClick:()=>Ui("existing"),children:"Keep current map"}):null]}),_e==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,p])=>(0,o.jsxs)("label",{className:`${n}-label`,children:[p,(0,o.jsxs)("select",{className:`${n}-select`,value:El[u],disabled:jt,onChange:N=>vg(R=>({...R,[u]:N.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:To,maxLength:1500,disabled:jt,onChange:u=>rd(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:Eo,maxLength:1500,disabled:jt,onChange:u=>sd(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:jt||To===i?.settings.townMapLayoutPrompt&&Eo===i?.settings.townMapNegativePrompt,onClick:()=>{rd(i?.settings.townMapLayoutPrompt??""),sd(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:jt||Tt.trim().length===0,onClick:()=>{b$()},children:jt?"Generating map\u2026":Cl==="generate"?"Generate again":"Generate map"})})]}):null,_e==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:jt,"aria-label":"Choose a village map image",onChange:u=>{let p=u.target.files?.[0];u.target.value="",y$(p)}}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,_e==="none"?(0,o.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Qr&&_e!=="none"&&Cl===_e&&Tg?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":qp(Qr).tone,children:qp(Qr).text}):null]}):null,Ie===3?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Wa||Fe.filter(u=>u.classes?.includes("residence")).length>=1+Io,onClick:()=>{aa(!0),Ii(!1),Hi(null)},children:"Place a Residence"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Wa||Fe.some(u=>u.category==="public-center"),onClick:()=>{aa(!1),Ii(!0),Hi(null)},children:"Place a Gathering Place"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Wa||Fe.length===0,onClick:()=>{_i([]),qa(null),Kn(null),Hi(null),aa(!1),Ii(!1)},children:"Reset all venues"})]}),bg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:bg}):null,(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:Fe.map(u=>(0,o.jsxs)("button",{type:"button",className:`${n}-setup-venue-card`,"data-selected":u.id===Yr?"true":"false",onClick:()=>qa(u.id),children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,o.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":ha(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),ke&&xd?(0,o.jsxs)("div",{className:`${n}-setup-venue-editor`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,children:[ke.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",ke.name]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Hi(ke.id),aa(!1),Ii(!1)},children:"Move on map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>E$(ke.id),children:"Remove venue"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{id:`${n}-setup-venue-name`,className:`${n}-notice-input`,value:ke.name,maxLength:100,onChange:u=>Li(ke.id,p=>({...p,name:u.target.value}))})]}),ke.category==="public-center"?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Wa,onClick:()=>{v$()},children:"Suggest three names"}),O1.map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Li(ke.id,p=>({...p,name:u})),children:u},u))]}):null,(0,o.jsxs)("p",{className:`${n}-hint`,children:["Class: ",us==="gathering"?"Gathering":"Residence"]}),(0,o.jsxs)("div",{className:`${n}-setup-form-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-form`,children:"Form"}),(0,o.jsx)("textarea",{id:`${n}-setup-form`,className:`${n}-textarea`,rows:2,value:ke.form??"",maxLength:240,placeholder:L2[us][V1],onFocus:()=>ed(!0),onBlur:()=>ed(!1),onChange:u=>{Li(ke.id,p=>({...p,form:u.target.value})),Ne("")}}),(0,o.jsx)("small",{className:`${n}-hint`,children:"What the Venue actually is"})]}),ke.category!=="public-center"?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident",(0,o.jsxs)("select",{className:`${n}-select`,value:ke.occupancy.residentCharacterId??"",disabled:ke.occupancy.playerHome,onChange:u=>Li(ke.id,p=>({...p,residentIds:u.target.value?[u.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,o.jsx)("option",{value:"",children:ke.occupancy.playerHome?"You":"Choose a villager"}),l.map(u=>(0,o.jsx)("option",{value:u.id,disabled:Fe.some(p=>p.id!==ke.id&&p.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,o.jsx)("div",{className:`${n}-setup-place-spaces`,children:["exterior","interior"].map(u=>{let p=u==="exterior",N=p?"Exterior":"Interior",R=p?ke.presentation.image:xd.image;return(0,o.jsxs)("section",{className:`${n}-setup-place-space`,children:[(0,o.jsx)("h4",{children:N}),(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-${u}-description`,children:[N," Description \xB7 required"]}),(0,o.jsx)("textarea",{id:`${n}-setup-${u}-description`,className:`${n}-textarea`,value:p?ke.description:xd.description,maxLength:1e3,onChange:I=>{let G=I.target.value;Li(ke.id,$e=>p?{...$e,description:G}:{...$e,spaces:[{...St($e,us),description:G}]}),Ne(""),Kn(null)}}),(0,o.jsxs)("span",{className:`${n}-label`,children:[N," Image \xB7 optional"]}),R?(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:R.url,alt:`${u} of ${ke.name}`}):(0,o.jsx)("p",{className:`${n}-hint`,children:"No image yet. A placeholder will be used."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Wa,onClick:()=>{I$(ke,u)},children:R?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*",disabled:Wa,"aria-label":`Upload ${u} image for ${ke.name}`,onChange:I=>{let G=I.target.files?.[0];I.target.value="",_$(ke,u,G)}}),R?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Li(ke.id,I=>p?{...I,presentation:{...I.presentation,image:null}}:{...I,spaces:[{...St(I,us),image:null}]}),children:"Remove image"}):null]}),Xr?.venueId===ke.id&&Xr.area===u?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:Xr.image.url,alt:`New ${u} image preview`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:H$,children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Kn(null),children:"Discard"})]}):null]},u)})})]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Place or select a venue to edit it."}),s===null?(0,o.jsx)("p",{className:`${n}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ie===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:Fa.trim()})," \xB7 ",Tt.trim()]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",Lr?.find(u=>u.id===yt)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",wo(Sn).label]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Ea||"No first-day description was recorded."]}),Gr?(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",Gr]}):null]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",_e==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",Ua.map(u=>Ju?.find(p=>p.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:Fe.map(u=>(0,o.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":ha(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Fe.map(u=>(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Ng?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ng}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]})}),(0,o.jsxs)("div",{className:`${n}-setup-visual`,children:[Ie<=1?(0,o.jsx)(NS,{scenario:Sn}):(0,o.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${n}-setup-map-viewport`,children:(0,o.jsx)(jp,{src:qi,alt:`A map of ${Fa.trim()||"your new village"}.`,pins:Ie<3?[]:Z$,placing:Ie===3&&(Di||$l||td!==null),view:_e==="existing"?zo:Yu("cover"),shape:Tg,onPlace:Ie===3?T$:void 0,compact:Ie<2,mobile:t&&Ie>=2,photoPins:Ie>=3})})}),(0,o.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Ie>0?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||jt||Wa,onClick:()=>Zg(Ie-1),children:"\u2190 Back"}):null,Ie<ju.length-1?(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:_||jt||Wa,onClick:()=>Zg(Ie+1),children:"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:_||jt||!i,onClick:()=>{U$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{aa(!1),se("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-home-bar`,children:[(0,o.jsx)(mS,{weather:i?.village.weather??""}),!t&&i?.isFounded&&Xn(i.settings.venues).length>0?(0,o.jsxs)("div",{className:`${n}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":kt,"aria-controls":`${n}-places-list`,disabled:_,onClick:()=>{xe(null),ka(l=>!l)},children:"Places"}),kt?(0,o.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,o.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Gl(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Yl(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||_,onClick:()=>Pe("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,o.jsx)(fS,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:_||!i,onClick:()=>{It("index"),se("menu")},children:"\u2630"}),t?null:(0,o.jsx)(gS,{}),Di||K?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{aa(!1),Jt("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${n}-room`,children:(0,o.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,o.jsx)(jp,{src:Ol,alt:`A map of ${i?.village.name??"the village"}.`,pins:Q$,placing:Di||!!K,view:zo,shape:kg,onPlace:(l,u)=>{if(!K){C$(l,u);return}let p=K;X(!0),Re(""),D(`/projects/${encodeURIComponent(p)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(N=>{r(N),Jt(""),Dt(p),Pe("projects")}).catch(N=>Re(q(N,"The blueprint could not be placed here."))).finally(()=>X(!1))},onDismiss:()=>{xe(null),ka(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Wr||Lt||Di||ql||fd?(0,o.jsxs)("div",{className:`${n}-notice`,children:[Wr?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Wr}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null,Di?(0,o.jsx)("span",{className:`${n}-status`,children:"Click the map where the house stands."}):null,ql?(0,o.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,fd?(0,o.jsx)("p",{className:`${n}-status`,children:fd}):null]}):null})})})]})}var Pp=class extends HTMLElement{connectedCallback(){F0(),this.__root??(this.__root=(0,f1.createRoot)(this)),this.__root.render((0,o.jsx)(Qp,{element:this,children:(0,o.jsx)(HS,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),F0()})}};function HS({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(jS,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(BS,{props:e.capabilityProps??{}}):(0,o.jsx)(_S,{element:e})}function US(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var qS="marinara-active-chat-id";function k1(){try{window.localStorage.removeItem(qS)}catch{}window.location.reload()}function T1(e,t){let[a,i]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function BS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=T1(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),f=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let b=C=>{f.current?.contains(C.target)||h(!1)},A=C=>{C.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",A),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",A)}},[d]),!a||!c||s===null)return null;let $=s.name||"your villager",x=s.villageName||"your village",g=`Villages \u2014 this roleplay spun off from ${x}`;return(0,o.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:f,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":d,title:g,"aria-label":g,children:[(0,o.jsx)(US,{}),(0,o.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,o.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),s.resident?(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:k1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function jS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:r}=T1(t,a&&t.length>0);if(!a||!r)return null;if(i===null)return(0,o.jsx)("div",{className:`${n}-panel-view`,children:(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,o.jsxs)("div",{className:`${n}-panel-view`,children:[(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:i.room})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:k1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,Pp);
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
