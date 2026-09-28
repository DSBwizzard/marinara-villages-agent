var B$=Object.create;var $d=Object.defineProperty;var L$=Object.getOwnPropertyDescriptor;var j$=Object.getOwnPropertyNames;var G$=Object.getPrototypeOf,Y$=Object.prototype.hasOwnProperty;var X$=(e,t,a)=>t in e?$d(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var tn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var Q$=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of j$(t))!Y$.call(e,o)&&o!==a&&$d(e,o,{get:()=>t[o],enumerable:!(i=L$(t,o))||i.enumerable});return e};var ql=(e,t,a)=>(a=e!=null?B$(G$(e)):{},Q$(t||!e||!e.__esModule?$d(a,"default",{value:e,enumerable:!0}):a,e));var Qg=(e,t,a)=>X$(e,typeof t!="symbol"?t+"":t,a);var sf=tn(se=>{"use strict";var Sd=Symbol.for("react.transitional.element"),Z$=Symbol.for("react.portal"),K$=Symbol.for("react.fragment"),J$=Symbol.for("react.strict_mode"),P$=Symbol.for("react.profiler"),F$=Symbol.for("react.consumer"),W$=Symbol.for("react.context"),ex=Symbol.for("react.forward_ref"),tx=Symbol.for("react.suspense"),ax=Symbol.for("react.memo"),Fg=Symbol.for("react.lazy"),nx=Symbol.for("react.activity"),ix=Symbol.for("react.view_transition"),Zg=Symbol.iterator;function ox(e){return e===null||typeof e!="object"?null:(e=Zg&&e[Zg]||e["@@iterator"],typeof e=="function"?e:null)}var Wg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ef=Object.assign,tf={};function Do(e,t,a){this.props=e,this.context=t,this.refs=tf,this.updater=a||Wg}Do.prototype.isReactComponent={};Do.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Do.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function af(){}af.prototype=Do.prototype;function kd(e,t,a){this.props=e,this.context=t,this.refs=tf,this.updater=a||Wg}var Td=kd.prototype=new af;Td.constructor=kd;ef(Td,Do.prototype);Td.isPureReactComponent=!0;var Kg=Array.isArray;function Nd(){}var Ge={H:null,A:null,T:null,S:null},nf=Object.prototype.hasOwnProperty;function Ed(e,t,a){var i=a.ref;return{$$typeof:Sd,type:e,key:t,ref:i!==void 0?i:null,props:a}}function rx(e,t){return Ed(e.type,t,e.props)}function Cd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Sd}function sx(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Jg=/\/+/g;function xd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?sx(""+e.key):t.toString(36)}function lx(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Nd,Nd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Vo(e,t,a,i,o){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Sd:case Z$:c=!0;break;case Fg:return c=e._init,Vo(c(e._payload),t,a,i,o)}}if(c)return o=o(e),c=i===""?"."+xd(e,0):i,Kg(o)?(a="",c!=null&&(a=c.replace(Jg,"$&/")+"/"),Vo(o,t,a,"",function(g){return g})):o!=null&&(Cd(o)&&(o=rx(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Jg,"$&/")+"/")+c)),t.push(o)),1;c=0;var u=i===""?".":i+":";if(Kg(e))for(var h=0;h<e.length;h++)i=e[h],s=u+xd(i,h),c+=Vo(i,t,a,s,o);else if(h=ox(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=u+xd(i,h++),c+=Vo(i,t,a,s,o);else if(s==="object"){if(typeof e.then=="function")return Vo(lx(e),t,a,i,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Bl(e,t,a){if(e==null)return e;var i=[],o=0;return Vo(e,i,"","",function(s){return t.call(a,s,o++)}),i}function cx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Pg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function of(e){var t=Ge.T,a={};a.types=t!==null?t.types:null,Ge.T=a;try{var i=e(),o=Ge.S;o!==null&&o(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Nd,Pg)}catch(s){Pg(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),Ge.T=t}}function rf(e){var t=Ge.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else of(rf.bind(null,e))}var ux={map:Bl,forEach:function(e,t,a){Bl(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Bl(e,function(){t++}),t},toArray:function(e){return Bl(e,function(t){return t})||[]},only:function(e){if(!Cd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};se.Activity=nx;se.Children=ux;se.Component=Do;se.Fragment=K$;se.Profiler=P$;se.PureComponent=kd;se.StrictMode=J$;se.Suspense=tx;se.ViewTransition=ix;se.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ge;se.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ge.H.useMemoCache(e)}};se.addTransitionType=rf;se.cache=function(e){return function(){return e.apply(null,arguments)}};se.cacheSignal=function(){return null};se.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=ef({},e.props),o=e.key;if(t!=null)for(s in t.key!==void 0&&(o=""+t.key),t)!nf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),u=0;u<s;u++)c[u]=arguments[u+2];i.children=c}return Ed(e.type,o,i)};se.createContext=function(e){return e={$$typeof:W$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:F$,_context:e},e};se.createElement=function(e,t,a){var i,o={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)nf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(o[i]=t[i]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var u=Array(c),h=0;h<c;h++)u[h]=arguments[h+2];o.children=u}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)o[i]===void 0&&(o[i]=c[i]);return Ed(e,s,o)};se.createRef=function(){return{current:null}};se.forwardRef=function(e){return{$$typeof:ex,render:e}};se.isValidElement=Cd;se.lazy=function(e){return{$$typeof:Fg,_payload:{_status:-1,_result:e},_init:cx}};se.memo=function(e,t){return{$$typeof:ax,type:e,compare:t===void 0?null:t}};se.startTransition=of;se.unstable_useCacheRefresh=function(){return Ge.H.useCacheRefresh()};se.use=function(e){return Ge.H.use(e)};se.useActionState=function(e,t,a){return Ge.H.useActionState(e,t,a)};se.useCallback=function(e,t){return Ge.H.useCallback(e,t)};se.useContext=function(e){return Ge.H.useContext(e)};se.useDebugValue=function(){};se.useDeferredValue=function(e,t){return Ge.H.useDeferredValue(e,t)};se.useEffect=function(e,t){return Ge.H.useEffect(e,t)};se.useEffectEvent=function(e){return Ge.H.useEffectEvent(e)};se.useId=function(){return Ge.H.useId()};se.useImperativeHandle=function(e,t,a){return Ge.H.useImperativeHandle(e,t,a)};se.useInsertionEffect=function(e,t){return Ge.H.useInsertionEffect(e,t)};se.useLayoutEffect=function(e,t){return Ge.H.useLayoutEffect(e,t)};se.useMemo=function(e,t){return Ge.H.useMemo(e,t)};se.useOptimistic=function(e,t){return Ge.H.useOptimistic(e,t)};se.useReducer=function(e,t,a){return Ge.H.useReducer(e,t,a)};se.useRef=function(e){return Ge.H.useRef(e)};se.useState=function(e){return Ge.H.useState(e)};se.useSyncExternalStore=function(e,t,a){return Ge.H.useSyncExternalStore(e,t,a)};se.useTransition=function(){return Ge.H.useTransition()};se.version="19.3.0"});var Ll=tn((R2,lf)=>{"use strict";lf.exports=sf()});var vf=tn(Fe=>{"use strict";function Md(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,o=e[i];if(0<jl(o,t))e[i]=t,e[a]=o,a=i;else break e}}function an(e){return e.length===0?null:e[0]}function Yl(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,o=e.length,s=o>>>1;i<s;){var c=2*(i+1)-1,u=e[c],h=c+1,g=e[h];if(0>jl(u,a))h<o&&0>jl(g,u)?(e[i]=g,e[h]=a,i=h):(e[i]=u,e[c]=a,i=c);else if(h<o&&0>jl(g,a))e[i]=g,e[h]=a,i=h;else break e}}return t}function jl(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Fe.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(cf=performance,Fe.unstable_now=function(){return cf.now()}):(zd=Date,uf=zd.now(),Fe.unstable_now=function(){return zd.now()-uf});var cf,zd,uf,Nn=[],Yn=[],dx=1,xa=null,It=3,Od=!1,ns=!1,is=!1,Vd=!1,mf=typeof setTimeout=="function"?setTimeout:null,pf=typeof clearTimeout=="function"?clearTimeout:null,df=typeof setImmediate<"u"?setImmediate:null;function Gl(e){for(var t=an(Yn);t!==null;){if(t.callback===null)Yl(Yn);else if(t.startTime<=e)Yl(Yn),t.sortIndex=t.expirationTime,Md(Nn,t);else break;t=an(Yn)}}function Dd(e){if(is=!1,Gl(e),!ns)if(an(Nn)!==null)ns=!0,Io||(Io=!0,_o());else{var t=an(Yn);t!==null&&_d(Dd,t.startTime-e)}}var Io=!1,os=-1,gf=5,ff=-1;function bf(){return Vd?!0:!(Fe.unstable_now()-ff<gf)}function Ad(){if(Vd=!1,Io){var e=Fe.unstable_now();ff=e;var t=!0;try{e:{ns=!1,is&&(is=!1,pf(os),os=-1),Od=!0;var a=It;try{t:{for(Gl(e),xa=an(Nn);xa!==null&&!(xa.expirationTime>e&&bf());){var i=xa.callback;if(typeof i=="function"){xa.callback=null,It=xa.priorityLevel;var o=i(xa.expirationTime<=e);if(e=Fe.unstable_now(),typeof o=="function"){xa.callback=o,Gl(e),t=!0;break t}xa===an(Nn)&&Yl(Nn),Gl(e)}else Yl(Nn);xa=an(Nn)}if(xa!==null)t=!0;else{var s=an(Yn);s!==null&&_d(Dd,s.startTime-e),t=!1}}break e}finally{xa=null,It=a,Od=!1}t=void 0}}finally{t?_o():Io=!1}}}var _o;typeof df=="function"?_o=function(){df(Ad)}:typeof MessageChannel<"u"?(Rd=new MessageChannel,hf=Rd.port2,Rd.port1.onmessage=Ad,_o=function(){hf.postMessage(null)}):_o=function(){mf(Ad,0)};var Rd,hf;function _d(e,t){os=mf(function(){e(Fe.unstable_now())},t)}Fe.unstable_IdlePriority=5;Fe.unstable_ImmediatePriority=1;Fe.unstable_LowPriority=4;Fe.unstable_NormalPriority=3;Fe.unstable_Profiling=null;Fe.unstable_UserBlockingPriority=2;Fe.unstable_cancelCallback=function(e){e.callback=null};Fe.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):gf=0<e?Math.floor(1e3/e):5};Fe.unstable_getCurrentPriorityLevel=function(){return It};Fe.unstable_next=function(e){switch(It){case 1:case 2:case 3:var t=3;break;default:t=It}var a=It;It=t;try{return e()}finally{It=a}};Fe.unstable_requestPaint=function(){Vd=!0};Fe.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=It;It=e;try{return t()}finally{It=a}};Fe.unstable_scheduleCallback=function(e,t,a){var i=Fe.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:dx++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>i?(e.sortIndex=a,Md(Yn,e),an(Nn)===null&&e===an(Yn)&&(is?(pf(os),os=-1):is=!0,_d(Dd,a-i))):(e.sortIndex=o,Md(Nn,e),ns||Od||(ns=!0,Io||(Io=!0,_o()))),e};Fe.unstable_shouldYield=bf;Fe.unstable_wrapCallback=function(e){var t=It;return function(){var a=It;It=t;try{return e.apply(this,arguments)}finally{It=a}}}});var wf=tn((O2,yf)=>{"use strict";yf.exports=vf()});var Nf=tn(Ht=>{"use strict";var hx=Ll();function xf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Xn(){}var Gt={d:{f:Xn,r:function(){throw Error(xf(522))},D:Xn,C:Xn,L:Xn,m:Xn,X:Xn,S:Xn,M:Xn},p:0,findDOMNode:null},mx=Symbol.for("react.portal"),px=Symbol.for("react.recoverable"),$f=Symbol.for("react.optimistic_key");function gx(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:mx,key:i==null?null:i===$f?$f:""+i,children:e,containerInfo:t,implementation:a}}var rs=hx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Xl(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Ht.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Gt;Ht.browser=function(e){return{$$typeof:px,_reason:e}};Ht.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(xf(299));return gx(e,t,null,a)};Ht.flushSync=function(e){var t=rs.T,a=Gt.p;try{if(rs.T=null,Gt.p=2,e)return e()}finally{rs.T=t,Gt.p=a,Gt.d.f()}};Ht.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Gt.d.C(e,t))};Ht.prefetchDNS=function(e){typeof e=="string"&&Gt.d.D(e)};Ht.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=Xl(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Gt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:o,fetchPriority:s}):a==="script"&&Gt.d.X(e,{crossOrigin:i,integrity:o,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Ht.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Xl(t.as,t.crossOrigin);Gt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Gt.d.M(e)};Ht.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=Xl(a,t.crossOrigin);Gt.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Ht.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Xl(t.as,t.crossOrigin);Gt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Gt.d.m(e)};Ht.requestFormReset=function(e){Gt.d.r(e)};Ht.unstable_batchedUpdates=function(e,t){return e(t)};Ht.useFormState=function(e,t,a){return rs.H.useFormState(e,t,a)};Ht.useFormStatus=function(){return rs.H.useHostTransitionStatus()};Ht.version="19.3.0"});var Tf=tn((D2,kf)=>{"use strict";function Sf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Sf)}catch(e){console.error(e)}}Sf(),kf.exports=Nf()});var h0=tn(Eu=>{"use strict";var bt=wf(),dv=Ll(),fx=Tf();function M(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function hv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Qs(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function mv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function pv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ef(e){if(Qs(e)!==e)throw Error(M(188))}function bx(e){var t=e.alternate;if(!t){if(t=Qs(e),t===null)throw Error(M(188));return t!==e?null:e}for(var a=e,i=t;;){var o=a.return;if(o===null)break;var s=o.alternate;if(s===null){if(i=o.return,i!==null){a=i;continue}break}if(o.child===s.child){for(s=o.child;s;){if(s===a)return Ef(o),e;if(s===i)return Ef(o),t;s=s.sibling}throw Error(M(188))}if(a.return!==i.return)a=o,i=s;else{for(var c=!1,u=o.child;u;){if(u===a){c=!0,a=o,i=s;break}if(u===i){c=!0,i=o,a=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===a){c=!0,a=s,i=o;break}if(u===i){c=!0,i=s,a=o;break}u=u.sibling}if(!c)throw Error(M(189))}}if(a.alternate!==i)throw Error(M(190))}if(a.tag!==3)throw Error(M(188));return a.stateNode.current===a?e:t}function gv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=gv(e),t!==null)return t;e=e.sibling}return null}function aa(e,t,a,i,o,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,o,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&aa(e.child,t,a,i,o,s))return!0;e=e.sibling}return!1}function eo(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Cf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function fv(e){var t=[null,null],a=eo(e);return a===null||bv(t,e,a.child,{foundSelf:!1}),t}function bv(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&bv(e,t,a.child,i))return!0;a=a.sibling}return!1}function ft(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(M(559))}}var Go=null,ph=null;function vx(e,t,a){return e===a?!0:e===t?(Go=e,!0):!1}function yx(e,t,a){return e===a?(ph=e,!1):e===t?(ph!==null&&(Go=e),!0):!1}function zf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function gh(e,t,a){for(var i=0,o=e;o;o=a(o))i++;o=0;for(var s=t;s;s=a(s))o++;for(;0<i-o;)e=a(e),i--;for(;0<o-i;)t=a(t),o--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Le=Object.assign,wx=Symbol.for("react.element"),Ql=Symbol.for("react.transitional.element"),ms=Symbol.for("react.portal"),Yo=Symbol.for("react.fragment"),vv=Symbol.for("react.strict_mode"),fh=Symbol.for("react.profiler"),yv=Symbol.for("react.consumer"),cn=Symbol.for("react.context"),km=Symbol.for("react.forward_ref"),bh=Symbol.for("react.suspense"),vh=Symbol.for("react.suspense_list"),Tm=Symbol.for("react.memo"),Jn=Symbol.for("react.lazy"),yh=Symbol.for("react.activity"),$x=Symbol.for("react.legacy_hidden"),xx=Symbol.for("react.memo_cache_sentinel"),wh=Symbol.for("react.view_transition"),Nx=Symbol.for("react.recoverable"),Af=Symbol.iterator;function ss(e){return e===null||typeof e!="object"?null:(e=Af&&e[Af]||e["@@iterator"],typeof e=="function"?e:null)}var Sx=Symbol.for("react.client.reference");function $h(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===Sx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Yo:return"Fragment";case fh:return"Profiler";case vv:return"StrictMode";case bh:return"Suspense";case vh:return"SuspenseList";case yh:return"Activity";case wh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ms:return"Portal";case cn:return e.displayName||"Context";case yv:return(e._context.displayName||"Context")+".Consumer";case km:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Tm:return t=e.displayName||null,t!==null?t:$h(e.type)||"Memo";case Jn:t=e._payload,e=e._init;try{return $h(e(t))}catch{}}return null}var ps=Array.isArray,te=dv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ke=fx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Bi={pending:!1,data:null,method:null,action:null},xh=[],Xo=-1;function fn(e){return{current:e}}function Mt(e){0>Xo||(e.current=xh[Xo],xh[Xo]=null,Xo--)}function Qe(e,t){Xo++,xh[Xo]=e.current,e.current=t}var mn=fn(null),Rs=fn(null),oi=fn(null),Oc=fn(null);function Vc(e,t){switch(Qe(oi,t),Qe(Rs,e),Qe(mn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Gb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Gb(t),e=Bw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}Mt(mn),Qe(mn,e)}function hr(){Mt(mn),Mt(Rs),Mt(oi)}function Nh(e){var t=e.memoizedState;t!==null&&(xr._currentValue=t.memoizedState,Qe(Oc,e)),t=mn.current;var a=Bw(t,e.type);t!==a&&(Qe(Rs,e),Qe(mn,a))}function Dc(e){Rs.current===e&&(Mt(mn),Mt(Rs)),Oc.current===e&&(Mt(Oc),xr._currentValue=Bi)}var Id,Rf;function Zn(e){if(Id===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Id=t&&t[1]||"",Rf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Id+e+Rf}var Hd=!1;function Ud(e,t){if(!e||Hd)return"";Hd=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(C){var p=C}Reflect.construct(e,[],x)}else{try{x.call()}catch(C){p=C}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(C){p=C}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(C){if(C&&p&&typeof C.stack=="string")return[C.stack,p.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],u=s[1];if(c&&u){var h=c.split(`
`),g=u.split(`
`);for(o=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(i===h.length||o===g.length)for(i=h.length-1,o=g.length-1;1<=i&&0<=o&&h[i]!==g[o];)o--;for(;1<=i&&0<=o;i--,o--)if(h[i]!==g[o]){if(i!==1||o!==1)do if(i--,o--,0>o||h[i]!==g[o]){var $=`
`+h[i].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=i&&0<=o);break}}}finally{Hd=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Zn(a):""}function kx(e,t){switch(e.tag){case 26:case 27:case 5:return Zn(e.type);case 16:return Zn("Lazy");case 13:return e.child!==t&&t!==null?Zn("Suspense Fallback"):Zn("Suspense");case 19:return Zn("SuspenseList");case 0:case 15:return Ud(e.type,!1);case 11:return Ud(e.type.render,!1);case 1:return Ud(e.type,!0);case 31:return Zn("Activity");case 30:return Zn("ViewTransition");default:return""}}function Mf(e){try{var t="",a=null;do t+=kx(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Sh=Object.prototype.hasOwnProperty,Em=bt.unstable_scheduleCallback,qd=bt.unstable_cancelCallback,Tx=bt.unstable_shouldYield,Ex=bt.unstable_requestPaint,da=bt.unstable_now,Cx=bt.unstable_getCurrentPriorityLevel,wv=bt.unstable_ImmediatePriority,$v=bt.unstable_UserBlockingPriority,_c=bt.unstable_NormalPriority,zx=bt.unstable_LowPriority,xv=bt.unstable_IdlePriority,Ax=bt.log,Rx=bt.unstable_setDisableYieldValue,Zs=null,ha=null;function Wn(e){if(typeof Ax=="function"&&Rx(e),ha&&typeof ha.setStrictMode=="function")try{ha.setStrictMode(Zs,e)}catch{}}var ma=Math.clz32?Math.clz32:Vx,Mx=Math.log,Ox=Math.LN2;function Vx(e){return e>>>=0,e===0?32:31-(Mx(e)/Ox|0)|0}var Zl=256,Kl=262144,Jl=4194304;function _i(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function lu(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var o=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var u=i&134217727;return u!==0?(i=u&~s,i!==0?o=_i(i):(c&=u,c!==0?o=_i(c):a||(a=u&~e,a!==0&&(o=_i(a))))):(u=i&~s,u!==0?o=_i(u):c!==0?o=_i(c):a||(a=i&~e,a!==0&&(o=_i(a)))),o===0?0:t!==0&&t!==o&&(t&s)===0&&(s=o&-o,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:o}function Ks(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Nv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-ma(a),o=1<<i;t|=e[i],a&=~o}return t}function Dx(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Sv(){var e=Jl;return Jl<<=1,(Jl&62914560)===0&&(Jl=4194304),e}function Bd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Js(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function _x(e,t,a,i,o,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var u=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-ma(a),x=1<<$;u[$]=0,h[$]=-1;var p=g[$];if(p!==null)for(g[$]=null,$=0;$<p.length;$++){var b=p[$];b!==null&&(b.lane&=-536870913)}a&=~x}i!==0&&kv(e,i,0),s!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function kv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-ma(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Tv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-ma(a),o=1<<i;o&t|e[i]&t&&(e[i]|=t),a&=~o}}function Ev(e,t){var a=t&-t;return a=(a&42)!==0?1:Cm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Cm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function zm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Cv(){var e=ke.p;return e!==0?e:(e=window.event,e===void 0?32:c0(e.type))}function Of(e,t){var a=ke.p;try{return ke.p=e,t()}finally{ke.p=a}}var _n=Math.random().toString(36).slice(2),At="__reactFiber$"+_n,na="__reactProps$"+_n,kr="__reactContainer$"+_n,Vf="__reactEvents$"+_n,Ix="__reactListeners$"+_n,Hx="__reactHandles$"+_n,Df="__reactResources$"+_n,Ps="__reactMarker$"+_n,Ic="__reactLoad$"+_n;function cu(e){delete e[At],delete e[na],delete e[Ix],delete e[Hx]}function Ui(e){var t;if(t=e[At])return t;for(var a=e.parentNode;a;){if(t=a[kr]||a[At]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Fb(e);e!==null;){if(a=e[At])return a;e=Fb(e)}return t}e=a,a=e.parentNode}return null}function Tr(e){if(e=e[At]||e[kr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function gs(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(M(33))}function ar(e){var t=e[Df];return t||(t=e[Df]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function xt(e){e[Ps]=!0}function zv(e){e[Ic]=void 0}var Av=new Set,Rv={};function to(e,t){mr(e,t),mr(e+"Capture",t)}function mr(e,t){for(Rv[e]=t,e=0;e<t.length;e++)Av.add(t[e])}var Ux=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),_f={},If={};function qx(e){return Sh.call(If,e)?!0:Sh.call(_f,e)?!1:Ux.test(e)?If[e]=!0:(_f[e]=!0,!1)}var Ne=!1;function Hf(){var e=Ne;return Ne=!1,e}function pc(e,t,a){if(qx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Pl(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function Sn(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function sa(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Mv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Bx(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var o=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function kh(e){if(!e._valueTracker){var t=Mv(e)?"checked":"value";e._valueTracker=Bx(e,t,""+e[t])}}function Ov(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=Mv(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var Lx=/[\n"\\]/g;function Ea(e){return e.replace(Lx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Th(e,t,a,i,o,s,c,u){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+sa(t)):e.value!==""+sa(t)&&(e.value=""+sa(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Ld(e,sa(e.value)):Ld(e,sa(t)):a!=null?Ld(e,sa(a)):i!=null&&e.removeAttribute("value"),o==null&&s!=null&&(e.defaultChecked=!!s),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.name=""+sa(u):e.removeAttribute("name")}function Vv(e,t,a,i,o,s,c,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){kh(e);return}a=a!=null?""+sa(a):"",t=t!=null?""+sa(t):a,u||t===e.value||(e.value=t),e.defaultValue=t}i=i??o,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=u?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),kh(e)}function Ld(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function nr(e,t,a,i){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&i&&(e[a].defaultSelected=!0)}else{for(a=""+sa(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,i&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Dv(e,t,a){if(t!=null&&(t=""+sa(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+sa(a):""}function _v(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(M(92));if(ps(i)){if(1<i.length)throw Error(M(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=sa(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),kh(e)}function pr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var jx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Uf(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||jx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Iv(e,t,a){if(t!=null&&typeof t!="object")throw Error(M(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",Ne=!0);for(var o in t)i=t[o],t.hasOwnProperty(o)&&a[o]!==i&&(Uf(e,o,i),Ne=!0)}else for(var s in t)t.hasOwnProperty(s)&&Uf(e,s,t[s])}function Am(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Gx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Yx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function gc(e){return Yx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function un(){}var Eh=null;function Rm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Qo=null,ir=null;function qf(e){var t=Tr(e);if(t&&(e=t.stateNode)){var a=e[na]||null;e:switch(e=t.stateNode,t.type){case"input":if(Th(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Ea(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var o=i[na]||null;if(!o)throw Error(M(90));Th(i,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Ov(i)}break e;case"textarea":Dv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&nr(e,!!a.multiple,t,!1)}}}var jd=!1;function Hv(e,t,a){if(jd)return e(t,a);jd=!0;try{var i=e(t);return i}finally{if(jd=!1,(Qo!==null||ir!==null)&&(Nu(),Qo&&(t=Qo,e=ir,ir=Qo=null,qf(t),e)))for(t=0;t<e.length;t++)qf(e[t])}}function Ms(e,t){var a=e.stateNode;if(a===null)return null;var i=a[na]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(M(231,t,typeof a));return a}var An=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Ch=!1;if(An)try{Ho={},Object.defineProperty(Ho,"passive",{get:function(){Ch=!0}}),window.addEventListener("test",Ho,Ho),window.removeEventListener("test",Ho,Ho)}catch{Ch=!1}var Ho,ei=null,Mm=null,fc=null;function Uv(){if(fc)return fc;var e,t=Mm,a=t.length,i,o="value"in ei?ei.value:ei.textContent,s=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===o[s-i];i++);return fc=o.slice(e,1<i?1-i:void 0)}function bc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Fl(){return!0}function Bf(){return!1}function Zt(e){function t(a,i,o,s,c){this._reactName=a,this._targetInst=o,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(a=e[u],this[u]=a?a(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Fl:Bf,this.isPropagationStopped=Bf,this}return Le(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Fl)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Fl)},persist:function(){},isPersistent:Fl}),t}var wi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},uu=Zt(wi),Fs=Le({},wi,{view:0,detail:0}),Xx=Zt(Fs),Gd,Yd,ls,du=Le({},Fs,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Om,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==ls&&(ls&&e.type==="mousemove"?(Gd=e.screenX-ls.screenX,Yd=e.screenY-ls.screenY):Yd=Gd=0,ls=e),Gd)},movementY:function(e){return"movementY"in e?e.movementY:Yd}}),Lf=Zt(du),Qx=Le({},du,{dataTransfer:0}),Zx=Zt(Qx),Kx=Le({},Fs,{relatedTarget:0}),Xd=Zt(Kx),Jx=Le({},wi,{animationName:0,elapsedTime:0,pseudoElement:0}),Px=Zt(Jx),Fx=Le({},wi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Wx=Zt(Fx),eN=Le({},wi,{data:0}),jf=Zt(eN),tN={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},aN={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},nN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function iN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=nN[e])?!!t[e]:!1}function Om(){return iN}var oN=Le({},Fs,{key:function(e){if(e.key){var t=tN[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=bc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?aN[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Om,charCode:function(e){return e.type==="keypress"?bc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?bc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),rN=Zt(oN),sN=Le({},du,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Gf=Zt(sN),lN=Le({},wi,{submitter:0}),cN=Zt(lN),uN=Le({},Fs,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Om}),dN=Zt(uN),hN=Le({},wi,{propertyName:0,elapsedTime:0,pseudoElement:0}),mN=Zt(hN),pN=Le({},du,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),gN=Zt(pN),fN=Le({},wi,{newState:0,oldState:0,source:0}),bN=Zt(fN),vN=[9,13,27,32],Vm=An&&"CompositionEvent"in window,vs=null;An&&"documentMode"in document&&(vs=document.documentMode);var yN=An&&"TextEvent"in window&&!vs,qv=An&&(!Vm||vs&&8<vs&&11>=vs),Yf=" ",Xf=!1;function Bv(e,t){switch(e){case"keyup":return vN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Lv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Zo=!1;function wN(e,t){switch(e){case"compositionend":return Lv(t);case"keypress":return t.which!==32?null:(Xf=!0,Yf);case"textInput":return e=t.data,e===Yf&&Xf?null:e;default:return null}}function $N(e,t){if(Zo)return e==="compositionend"||!Vm&&Bv(e,t)?(e=Uv(),fc=Mm=ei=null,Zo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return qv&&t.locale!=="ko"?null:t.data;default:return null}}var xN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Qf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!xN[e.type]:t==="textarea"}function jv(e,t,a,i){Qo?ir?ir.push(i):ir=[i]:Qo=i,t=ou(t,"onChange"),0<t.length&&(a=new uu("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var ys=null,Os=null;function NN(e){Hw(e,0)}function hu(e){var t=gs(e);if(Ov(t))return e}function Zf(e,t){if(e==="change")return t}var Gv=!1;An&&(An?(ec="oninput"in document,ec||(Qd=document.createElement("div"),Qd.setAttribute("oninput","return;"),ec=typeof Qd.oninput=="function"),Wl=ec):Wl=!1,Gv=Wl&&(!document.documentMode||9<document.documentMode));var Wl,ec,Qd;function Kf(){ys&&(ys.detachEvent("onpropertychange",Yv),Os=ys=null)}function Yv(e){if(e.propertyName==="value"&&hu(Os)){var t=[];jv(t,Os,e,Rm(e)),Hv(NN,t)}}function SN(e,t,a){e==="focusin"?(Kf(),ys=t,Os=a,ys.attachEvent("onpropertychange",Yv)):e==="focusout"&&Kf()}function kN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return hu(Os)}function TN(e,t){if(e==="click")return hu(t)}function EN(e,t){if(e==="input"||e==="change")return hu(t)}function CN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ga=typeof Object.is=="function"?Object.is:CN;function Vs(e,t){if(ga(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var o=a[i];if(!Sh.call(t,o)||!ga(e[o],t[o]))return!1}return!0}function zh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Jf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Pf(e,t){var a=Jf(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Jf(a)}}function Xv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Xv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Qv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=zh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=zh(e.document)}return t}function Dm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var zN=An&&"documentMode"in document&&11>=document.documentMode,Ko=null,Ah=null,ws=null,Rh=!1;function Ff(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Rh||Ko==null||Ko!==zh(i)||(i=Ko,"selectionStart"in i&&Dm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ws&&Vs(ws,i)||(ws=i,i=ou(Ah,"onSelect"),0<i.length&&(t=new uu("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=Ko)))}function Vi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Jo={animationend:Vi("Animation","AnimationEnd"),animationiteration:Vi("Animation","AnimationIteration"),animationstart:Vi("Animation","AnimationStart"),transitionrun:Vi("Transition","TransitionRun"),transitionstart:Vi("Transition","TransitionStart"),transitioncancel:Vi("Transition","TransitionCancel"),transitionend:Vi("Transition","TransitionEnd")},Zd={},Zv={};An&&(Zv=document.createElement("div").style,"AnimationEvent"in window||(delete Jo.animationend.animation,delete Jo.animationiteration.animation,delete Jo.animationstart.animation),"TransitionEvent"in window||delete Jo.transitionend.transition);function ao(e){if(Zd[e])return Zd[e];if(!Jo[e])return e;var t=Jo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Zv)return Zd[e]=t[a];return e}var Kv=ao("animationend"),Jv=ao("animationiteration"),Pv=ao("animationstart"),AN=ao("transitionrun"),RN=ao("transitionstart"),MN=ao("transitioncancel"),Fv=ao("transitionend"),Wv=new Map,Mh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Mh.push("scrollEnd");function Qa(e,t){Wv.set(e,t),to(t,[e])}var ON=0;function Rn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Xa.identifierPrefix;var a=ON++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Wf(e){if(e==null||typeof e=="string")return e;var t=null,a=dr;if(a!==null)for(var i=0;i<a.length;i++){var o=e[a[i]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function In(e,t){return e=Wf(e),t=Wf(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Hc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Sa=[],Po=0,_m=0;function mu(){for(var e=Po,t=_m=Po=0;t<e;){var a=Sa[t];Sa[t++]=null;var i=Sa[t];Sa[t++]=null;var o=Sa[t];Sa[t++]=null;var s=Sa[t];if(Sa[t++]=null,i!==null&&o!==null){var c=i.pending;c===null?o.next=o:(o.next=c.next,c.next=o),i.pending=o}s!==0&&ey(a,o,s)}}function pu(e,t,a,i){Sa[Po++]=e,Sa[Po++]=t,Sa[Po++]=a,Sa[Po++]=i,_m|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Im(e,t,a,i){return pu(e,t,a,i),Uc(e)}function no(e,t){return pu(e,null,null,t),Uc(e)}function ey(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var o=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(o=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,o&&t!==null&&(o=31-ma(a),e=s.hiddenUpdates,i=e[o],i===null?e[o]=[t]:i.push(t),t.lane=a|536870912),s):null}function Uc(e){if(50<As)throw As=0,Ec=null,Error(M(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Fo={};function VN(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ea(e,t,a,i){return new VN(e,t,a,i)}function Hm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Cn(e,t){var a=e.alternate;return a===null?(a=ea(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function ty(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function vc(e,t,a,i,o,s){var c=0;if(i=e,typeof i=="function")Hm(i)&&(c=1);else if(typeof i=="string")c=rS(e,a,mn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case yh:return e=ea(31,a,t,o),e.elementType=yh,e.lanes=s,e;case Yo:return Li(a.children,o,s,t);case vv:c=8,o|=24;break;case fh:return e=ea(12,a,t,o|2),e.elementType=fh,e.lanes=s,e;case bh:return e=ea(13,a,t,o),e.elementType=bh,e.lanes=s,e;case vh:return e=ea(19,a,t,o),e.elementType=vh,e.lanes=s,e;case $x:case wh:return e=o|32,e=ea(30,a,t,e),e.elementType=wh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case cn:c=10;break e;case yv:c=9;break e;case km:c=11;break e;case Tm:c=14;break e;case Jn:c=16,i=null;break e}c=29,a=Error(M(130,e===null?"null":typeof e,"")),i=null}return t=ea(c,a,t,o),t.elementType=e,t.type=i,t.lanes=s,t}function Li(e,t,a,i){return e=ea(7,e,i,t),e.lanes=a,e}function Kd(e,t,a){return e=ea(6,e,null,t),e.lanes=a,e}function ay(e){var t=ea(18,null,null,0);return t.stateNode=e,t}function Jd(e,t,a){return t=ea(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var eb=new WeakMap;function Ca(e,t){if(typeof e=="object"&&e!==null){var a=eb.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Mf(t)},eb.set(e,t),t)}return{value:e,source:t,stack:Mf(t)}}var Wo=[],er=0,qc=null,Ds=0,ka=[],Ta=0,gi=null,dn=1,hn="";function Tn(e,t){Wo[er++]=Ds,Wo[er++]=qc,qc=e,Ds=t}function ny(e,t,a){ka[Ta++]=dn,ka[Ta++]=hn,ka[Ta++]=gi,gi=e;var i=dn;e=hn;var o=32-ma(i)-1;i&=~(1<<o),a+=1;var s=32-ma(t)+o;if(30<s){var c=o-o%5;s=(i&(1<<c)-1).toString(32),i>>=c,o-=c,dn=1<<32-ma(t)+o|a<<o|i,hn=s+e}else dn=1<<s|a<<o|i,hn=e}function gu(e){e.return!==null&&(Tn(e,1),ny(e,1,0))}function Um(e){for(;e===qc;)qc=Wo[--er],Wo[er]=null,Ds=Wo[--er],Wo[er]=null;for(;e===gi;)gi=ka[--Ta],ka[Ta]=null,hn=ka[--Ta],ka[Ta]=null,dn=ka[--Ta],ka[Ta]=null}function iy(e,t){ka[Ta++]=dn,ka[Ta++]=hn,ka[Ta++]=gi,dn=t.id,hn=t.overflow,gi=e}var Nt=null,Xe=null,me=!1,ri=null,za=!1,Oh=Error(M(519));function fi(e){var t=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw _s(Ca(t,e)),Oh}function tb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[At]=e,t[na]=i,a){case"dialog":ge("cancel",t),ge("close",t);break;case"iframe":case"object":case"embed":ge("load",t);break;case"video":case"audio":for(a=0;a<qs.length;a++)ge(qs[a],t);break;case"source":ge("error",t);break;case"img":case"image":case"link":ge("error",t),ge("load",t);break;case"details":ge("toggle",t);break;case"input":ge("invalid",t),Vv(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":ge("invalid",t);break;case"textarea":ge("invalid",t),_v(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||qw(t.textContent,a)?(i.popover!=null&&(ge("beforetoggle",t),ge("toggle",t)),i.onScroll!=null&&ge("scroll",t),i.onScrollEnd!=null&&ge("scrollend",t),i.onClick!=null&&(t.onclick=un),t=!0):t=!1,t||fi(e,!0)}function Bc(e){for(Nt=e.return;Nt;)switch(Nt.tag){case 5:case 31:case 13:za=!1;return;case 27:case 3:za=!0;return;default:Nt=Nt.return}}function Uo(e){if(e!==Nt)return!1;if(!me)return Bc(e),me=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||bm(e.type,e.memoizedProps)),a=!a),a&&Xe&&fi(e),Bc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Xe=Pb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Xe=Pb(e)}else t===27?(t=Xe,$i(e.type)?(e=$m,$m=null,Xe=e):Xe=t):Xe=Nt?Aa(e.stateNode.nextSibling):null;return!0}function Xi(){Xe=Nt=null,me=!1}function Pd(){var e=ri;return e!==null&&(Ft===null?Ft=e:Ft.push.apply(Ft,e),ri=null),e}function _s(e){ri===null?ri=[e]:ri.push(e)}var Vh=fn(null),io=null,En=null;function ti(e,t,a){Qe(Vh,t._currentValue),t._currentValue=a}function zn(e){e._currentValue=Vh.current,Mt(Vh)}function yc(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function Dh(e,t,a,i){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var s=o.dependencies;if(s!==null){var c=o.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=o;for(var h=0;h<t.length;h++)if(u.context===t[h]){s.lanes|=a,u=s.alternate,u!==null&&(u.lanes|=a),yc(s.return,a,e),i||(c=null);break e}s=u.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(M(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),yc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),yc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Qi(e,t,a,i){e=null;for(var o=t,s=!1;o!==null;){if(!s){if((o.flags&524288)!==0)s=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(M(387));if(c=c.memoizedProps,c!==null){var u=o.type;ga(o.pendingProps.value,c.value)||(e!==null?e.push(u):e=[u])}}else if(o===Oc.current){if(c=o.alternate,c===null)throw Error(M(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(xr):e=[xr])}o=o.return}return e!==null&&Dh(t,e,a,i),t.flags|=262144,e!==null}function Lc(e){for(e=e.firstContext;e!==null;){if(!ga(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Zi(e){io=e,En=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Rt(e){return oy(io,e)}function tc(e,t){return io===null&&Zi(e),oy(e,t)}function oy(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},En===null){if(e===null)throw Error(M(308));En=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else En=En.next=t;return a}var DN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},_N=bt.unstable_scheduleCallback,IN=bt.unstable_NormalPriority,ht={$$typeof:cn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function qm(){return{controller:new DN,data:new Map,refCount:0}}function Ws(e){e.refCount--,e.refCount===0&&_N(IN,function(){e.controller.abort()})}function ab(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var fs=null;function HN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var $s=null,_h=0,Ki=0,or=null;function UN(e,t){if($s===null){var a=$s=[];_h=0,Ki=pp(),or={status:"pending",value:void 0,then:function(i){a.push(i)}}}return _h++,t.then(nb,nb),t}function nb(){if(--_h===0&&(fs=null,$s!==null)){or!==null&&(or.status="fulfilled");var e=$s;$s=null,Ki=0,or=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function qN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(i.status="rejected",i.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),i}var ib=te.S;te.S=function(e,t){if(Nw=da(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&UN(e,t),fs!==null)for(var a=yr;a!==null;)ab(a,fs),a=a.next;if(a=e.types,a!==null){for(var i=yr;i!==null;)ab(i,a),i=i.next;if(Ki!==0){i=fs,i===null&&(i=fs=[]);for(var o=0;o<a.length;o++){var s=a[o];i.indexOf(s)===-1&&i.push(s)}}}ib!==null&&ib(e,t)};var ji=fn(null);function Bm(){var e=ji.current;return e!==null?e:Be.pooledCache}function wc(e,t){t===null?Qe(ji,ji.current):Qe(ji,t.pool)}function ry(){var e=Bm();return e===null?null:{parent:ht._currentValue,pool:e}}var Er=Error(M(460)),Lm=Error(M(474)),fu=Error(M(542)),jc={then:function(){}};function ob(e){return e=e.status,e==="fulfilled"||e==="rejected"}function sy(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(un,un),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,sb(e),e===void 0&&!("reason"in t)?Error(M(600)):e;default:if(typeof t.status=="string")t.then(un,un);else{if(e=Be,e!==null&&100<e.shellSuspendCounter)throw Error(M(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=i}},function(i){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,sb(e),e}throw Gi=t,Er}}function Ii(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Gi=a,Er):a}}var Gi=null;function rb(){if(Gi===null)throw Error(M(459));var e=Gi;return Gi=null,e}function sb(e){if(e===Er||e===fu)throw Error(M(483))}var rr=null,Is=0;function ac(e){var t=Is;return Is+=1,rr===null&&(rr=[]),sy(rr,e,t)}function Qn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function nc(e,t){throw t.$$typeof===wx?Error(M(525)):(e=Object.prototype.toString.call(t),Error(M(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function ly(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function i(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function o(w,y){return w=Cn(w,y),w.index=0,w.sibling=null,w}function s(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function u(w,y,v,S){return y===null||y.tag!==6?(y=Kd(v,w.mode,S),y.return=w,y):(y=o(y,v),y.return=w,y)}function h(w,y,v,S){var O=v.type;return O===Yo?(w=$(w,y,v.props.children,S,v.key),Qn(w,v),w):y!==null&&(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Jn&&Ii(O)===y.type)?(y=o(y,v.props),Qn(y,v),y.return=w,y):(y=vc(v.type,v.key,v.props,null,w.mode,S),Qn(y,v),y.return=w,y)}function g(w,y,v,S){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=Jd(v,w.mode,S),y.return=w,y):(y=o(y,v.children||[]),y.return=w,y)}function $(w,y,v,S,O){return y===null||y.tag!==7?(y=Li(v,w.mode,S,O),y.return=w,y):(y=o(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=Kd(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Ql:return v=vc(y.type,y.key,y.props,null,w.mode,v),Qn(v,y),v.return=w,v;case ms:return y=Jd(y,w.mode,v),y.return=w,y;case Jn:return y=Ii(y),x(w,y,v)}if(ps(y)||ss(y))return y=Li(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,ac(y),v);if(y.$$typeof===cn)return x(w,tc(w,y),v);nc(w,y)}return null}function p(w,y,v,S){var O=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return O!==null?null:u(w,y,""+v,S);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Ql:return v.key===O?h(w,y,v,S):null;case ms:return v.key===O?g(w,y,v,S):null;case Jn:return v=Ii(v),p(w,y,v,S)}if(ps(v)||ss(v))return O!==null?null:$(w,y,v,S,null);if(typeof v.then=="function")return p(w,y,ac(v),S);if(v.$$typeof===cn)return p(w,y,tc(w,v),S);nc(w,v)}return null}function b(w,y,v,S,O){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return w=w.get(v)||null,u(y,w,""+S,O);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Ql:return w=w.get(S.key===null?v:S.key)||null,h(y,w,S,O);case ms:return w=w.get(S.key===null?v:S.key)||null,g(y,w,S,O);case Jn:return S=Ii(S),b(w,y,v,S,O)}if(ps(S)||ss(S))return w=w.get(v)||null,$(y,w,S,O,null);if(typeof S.then=="function")return b(w,y,v,ac(S),O);if(S.$$typeof===cn)return b(w,y,v,tc(y,S),O);nc(y,S)}return null}function C(w,y,v,S){for(var O=null,W=null,U=y,L=y=0,ye=null;U!==null&&L<v.length;L++){U.index>L?(ye=U,U=null):ye=U.sibling;var Q=p(w,U,v[L],S);if(Q===null){U===null&&(U=ye);break}e&&U&&Q.alternate===null&&t(w,U),y=s(Q,y,L),W===null?O=Q:W.sibling=Q,W=Q,U=ye}if(L===v.length)return a(w,U),me&&Tn(w,L),O;if(U===null){for(;L<v.length;L++)U=x(w,v[L],S),U!==null&&(y=s(U,y,L),W===null?O=U:W.sibling=U,W=U);return me&&Tn(w,L),O}for(U=i(U);L<v.length;L++)ye=b(U,w,L,v[L],S),ye!==null&&(e&&(Q=ye.alternate,Q!==null&&U.delete(Q.key===null?L:Q.key)),y=s(ye,y,L),W===null?O=ye:W.sibling=ye,W=ye);return e&&U.forEach(function(Ve){return t(w,Ve)}),me&&Tn(w,L),O}function T(w,y,v,S){if(v==null)throw Error(M(151));for(var O=null,W=null,U=y,L=y=0,ye=null,Q=v.next();U!==null&&!Q.done;L++,Q=v.next()){U.index>L?(ye=U,U=null):ye=U.sibling;var Ve=p(w,U,Q.value,S);if(Ve===null){U===null&&(U=ye);break}e&&U&&Ve.alternate===null&&t(w,U),y=s(Ve,y,L),W===null?O=Ve:W.sibling=Ve,W=Ve,U=ye}if(Q.done)return a(w,U),me&&Tn(w,L),O;if(U===null){for(;!Q.done;L++,Q=v.next())Q=x(w,Q.value,S),Q!==null&&(y=s(Q,y,L),W===null?O=Q:W.sibling=Q,W=Q);return me&&Tn(w,L),O}for(U=i(U);!Q.done;L++,Q=v.next())Q=b(U,w,L,Q.value,S),Q!==null&&(e&&(ye=Q.alternate,ye!==null&&U.delete(ye.key===null?L:ye.key)),y=s(Q,y,L),W===null?O=Q:W.sibling=Q,W=Q);return e&&U.forEach(function(ze){return t(w,ze)}),me&&Tn(w,L),O}function R(w,y,v,S){if(typeof v=="object"&&v!==null&&v.type===Yo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Ql:e:{for(var O=v.key;y!==null;){if(y.key===O){if(O=v.type,O===Yo){if(y.tag===7){a(w,y.sibling),S=o(y,v.props.children),Qn(S,v),S.return=w,w=S;break e}}else if(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Jn&&Ii(O)===y.type){a(w,y.sibling),S=o(y,v.props),Qn(S,v),S.return=w,w=S;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===Yo?(S=Li(v.props.children,w.mode,S,v.key),Qn(S,v),S.return=w,w=S):(S=vc(v.type,v.key,v.props,null,w.mode,S),Qn(S,v),S.return=w,w=S)}return c(w);case ms:e:{for(O=v.key;y!==null;){if(y.key===O)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),S=o(y,v.children||[]),S.return=w,w=S;break e}else{a(w,y);break}else t(w,y);y=y.sibling}S=Jd(v,w.mode,S),S.return=w,w=S}return c(w);case Jn:return v=Ii(v),R(w,y,v,S)}if(ps(v))return C(w,y,v,S);if(ss(v)){if(O=ss(v),typeof O!="function")throw Error(M(150));return v=O.call(v),T(w,y,v,S)}if(typeof v.then=="function")return R(w,y,ac(v),S);if(v.$$typeof===cn)return R(w,y,tc(w,v),S);nc(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),S=o(y,v),S.return=w,w=S):(a(w,y),S=Kd(v,w.mode,S),S.return=w,w=S),c(w)):a(w,y)}return function(w,y,v,S){try{Is=0;var O=R(w,y,v,S);return rr=null,O}catch(U){if(U===Er||U===fu)throw U;var W=ea(29,U,null,w.mode);return W.lanes=S,W.return=w,W}}}var Ji=ly(!0),cy=ly(!1),Pn=!1;function jm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ih(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function si(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function li(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Se&2)!==0){var o=i.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),i.pending=t,t=Uc(e),ey(e,null,a),t}return pu(e,i,t,a),Uc(e)}function xs(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Tv(e,a)}}function Fd(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var o=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?o=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?o=s=t:s=s.next=t}else o=s=t;a={baseState:i.baseState,firstBaseUpdate:o,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Hh=!1;function Ns(){if(Hh){var e=or;if(e!==null)throw e}}function Ss(e,t,a,i){Hh=!1;var o=e.updateQueue;Pn=!1;var s=o.firstBaseUpdate,c=o.lastBaseUpdate,u=o.shared.pending;if(u!==null){o.shared.pending=null;var h=u,g=h.next;h.next=null,c===null?s=g:c.next=g,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,u=$.lastBaseUpdate,u!==c&&(u===null?$.firstBaseUpdate=g:u.next=g,$.lastBaseUpdate=h))}if(s!==null){var x=o.baseState;c=0,$=g=h=null,u=s;do{var p=u.lane&-536870913,b=p!==u.lane;if(b?(be&p)===p:(i&p)===p){p!==0&&p===Ki&&(Hh=!0),$!==null&&($=$.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var C=e,T=u;p=t;var R=a;switch(T.tag){case 1:if(C=T.payload,typeof C=="function"){x=C.call(R,x,p);break e}x=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=T.payload,p=typeof C=="function"?C.call(R,x,p):C,p==null)break e;x=Le({},x,p);break e;case 2:Pn=!0}}p=u.callback,p!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[p]:b.push(p))}else b={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},$===null?(g=$=b,h=x):$=$.next=b,c|=p;if(u=u.next,u===null){if(u=o.shared.pending,u===null)break;b=u,u=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);$===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=$,s===null&&(o.shared.lanes=0),yi|=c,e.lanes=c,e.memoizedState=x}}function uy(e,t){if(typeof e!="function")throw Error(M(191,e));e.call(t)}function dy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)uy(a[e],t)}var bi=fn(null),Gc=fn(0);function lb(e,t){e=Dn,Qe(Gc,e),Qe(bi,t),Dn=e|t.baseLanes}function Uh(){Qe(Gc,Dn),Qe(bi,bi.current)}function Gm(){Dn=Gc.current,Mt(bi),Mt(Gc)}var Dt=fn(null),Ut=null;function ci(e){var t=e.alternate;Qe(Ot,Ot.current&1),Qe(Dt,e),Ut===null&&(t===null||bi.current!==null||t.memoizedState!==null)&&(Ut=e)}function qh(e){Qe(Ot,Ot.current),Qe(Dt,e),Ut===null&&(Ut=e)}function hy(e){e.tag===22?(Qe(Ot,Ot.current),Qe(Dt,e),Ut===null&&(Ut=e)):ui()}function ui(){Qe(Ot,Ot.current),Qe(Dt,Dt.current)}function la(e){Mt(Dt),Ut===e&&(Ut=null),Mt(Ot)}var Ot=fn(0);function Hs(e,t){Qe(Dt,Dt.current),Qe(Ot,t)}function Ym(e){Mt(Ot),Mt(Dt),Ut===e&&(Ut=null)}function Yc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||wm(a)||vp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Mn=0,ue=null,Ue=null,dt=null,Xc=!1,sr=!1,Pi=!1,Qc=0,Us=0,lr=null,BN=0;function it(){throw Error(M(321))}function Xm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!ga(e[a],t[a]))return!1;return!0}function Qm(e,t,a,i,o,s){return Mn=s,ue=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,te.H=e===null||e.memoizedState===null?jy:Gy,Pi=!1,s=a(i,o),Pi=!1,sr&&(s=py(t,a,i,o)),my(e),s}function my(e){te.H=Zc;var t=Ue!==null&&Ue.next!==null;if(Mn=0,dt=Ue=ue=null,Xc=!1,Us=0,lr=null,t)throw Error(M(300));e===null||mt||(e=e.dependencies,e!==null&&Lc(e)&&(mt=!0))}function py(e,t,a,i){ue=e;var o=0;do{if(sr&&(lr=null),Us=0,sr=!1,25<=o)throw Error(M(301));if(o+=1,dt=Ue=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}te.H=KN,s=t(a,i)}while(sr);return s}function LN(){var e=te.H,t=e.useState()[0];return t=typeof t.then=="function"?el(t):t,e=e.useState()[0],(Ue!==null?Ue.memoizedState:null)!==e&&(ue.flags|=1024),t}function Zm(){var e=Qc!==0;return Qc=0,e}function Km(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Jm(e){if(Xc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Xc=!1}Mn=0,dt=Ue=ue=null,sr=!1,Us=Qc=0,lr=null}function Qt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return dt===null?ue.memoizedState=dt=e:dt=dt.next=e,dt}function lt(){if(Ue===null){var e=ue.alternate;e=e!==null?e.memoizedState:null}else e=Ue.next;var t=dt===null?ue.memoizedState:dt.next;if(t!==null)dt=t,Ue=e;else{if(e===null)throw ue.alternate===null?Error(M(467)):Error(M(310));Ue=e,e={memoizedState:Ue.memoizedState,baseState:Ue.baseState,baseQueue:Ue.baseQueue,queue:Ue.queue,next:null},dt===null?ue.memoizedState=dt=e:dt=dt.next=e}return dt}function bu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function el(e){var t=Us;return Us+=1,lr===null&&(lr=[]),e=sy(lr,e,t),t=ue,(dt===null?t.memoizedState:dt.next)===null&&(t=t.alternate,te.H=t===null||t.memoizedState===null?jy:Gy),e}function vu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return el(e);if(e.$$typeof===Nx)return;if(e.$$typeof===cn)return Rt(e)}throw Error(M(438,String(e)))}function Pm(e){var t=null,a=ue.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=ue.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=bu(),ue.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=xx;return t.index++,a}function On(e,t){return typeof t=="function"?t(e):t}function $c(e){var t=lt();return Fm(t,Ue,e)}function Fm(e,t,a){var i=e.queue;if(i===null)throw Error(M(311));i.lastRenderedReducer=a;var o=e.baseQueue,s=i.pending;if(s!==null){if(o!==null){var c=o.next;o.next=s.next,s.next=c}t.baseQueue=o=s,i.pending=null}if(s=e.baseState,o===null)e.memoizedState=s;else{t=o.next;var u=c=null,h=null,g=t,$=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(be&x)===x:(Mn&x)===x){var p=g.revertLane;if(p===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===Ki&&($=!0);else if((Mn&p)===p){g=g.next,p===Ki&&($=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=x,c=s):h=h.next=x,ue.lanes|=p,yi|=p;x=g.action,Pi&&a(s,x),s=g.hasEagerState?g.eagerState:a(s,x)}else p={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=p,c=s):h=h.next=p,ue.lanes|=x,yi|=x;g=g.next}while(g!==null&&g!==t);if(h===null?c=s:h.next=u,!ga(s,e.memoizedState)&&(mt=!0,$&&(a=or,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return o===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Wd(e){var t=lt(),a=t.queue;if(a===null)throw Error(M(311));a.lastRenderedReducer=e;var i=a.dispatch,o=a.pending,s=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do s=e(s,c.action),c=c.next;while(c!==o);ga(s,t.memoizedState)||(mt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function gy(e,t,a){var i=ue,o=lt(),s=me;if(s){if(a===void 0)throw Error(M(407));a=a()}else a=t();var c=!ga((Ue||o).memoizedState,a);if(c&&(o.memoizedState=a,mt=!0),o=o.queue,Wm(vy.bind(null,i,o,e),[e]),e=o.getSnapshot!==t||c||dt!==null&&(dt.memoizedState.tag&1)!==0,gr(e?9:8,{destroy:void 0},by.bind(null,i,o,a,t),null),e){if(i.flags|=2048,Be===null)throw Error(M(349));s||(Mn&127)!==0||fy(i,t,a)}return a}function fy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ue.updateQueue,t===null?(t=bu(),ue.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function by(e,t,a,i){t.value=a,t.getSnapshot=i,yy(t)&&wy(e)}function vy(e,t,a){return a(function(){yy(t)&&wy(e)})}function yy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!ga(e,a)}catch{return!0}}function wy(e){var t=no(e,2);t!==null&&ta(t,e,2)}function Bh(e){var t=Qt();if(typeof e=="function"){var a=e;if(e=a(),Pi){Wn(!0);try{a()}finally{Wn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:On,lastRenderedState:e},t}function $y(e,t,a,i){return e.baseState=a,Fm(e,Ue,typeof i=="function"?i:On)}function jN(e,t,a,i,o){if(wu(e))throw Error(M(485));if(e=t.action,e!==null){var s={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};te.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,xy(t,s)):(s.next=a.next,t.pending=a.next=s)}}function xy(e,t){var a=t.action,i=t.payload,o=e.state;if(t.isTransition){var s=te.T,c={};c.types=s!==null?s.types:null,te.T=c;try{var u=a(o,i),h=te.S;h!==null&&h(c,u),cb(e,t,u)}catch(g){Lh(e,t,g)}finally{s!==null&&c.types!==null&&(s.types=c.types),te.T=s}}else try{s=a(o,i),cb(e,t,s)}catch(g){Lh(e,t,g)}}function cb(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){ub(e,t,i)},function(i){return Lh(e,t,i)}):ub(e,t,a)}function ub(e,t,a){t.status="fulfilled",t.value=a,Ny(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,xy(e,a)))}function Lh(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,Ny(t),t=t.next;while(t!==i)}e.action=null}function Ny(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Sy(e,t){return t}function db(e,t){if(me){var a=Be.formState;if(a!==null){e:{var i=ue;if(me){if(Xe){t:{for(var o=Xe,s=za;o.nodeType!==8;){if(!s){o=null;break t}if(o=Aa(o.nextSibling),o===null){o=null;break t}}s=o.data,o=s==="F!"||s==="F"?o:null}if(o){Xe=Aa(o.nextSibling),i=o.data==="F!";break e}}fi(i)}i=!1}i&&(t=a[0])}}return a=Qt(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Sy,lastRenderedState:t},a.queue=i,a=qy.bind(null,ue,i),i.dispatch=a,i=Bh(!1),s=np.bind(null,ue,!1,i.queue),i=Qt(),o={state:t,dispatch:null,action:e,pending:null},i.queue=o,a=jN.bind(null,ue,o,s,a),o.dispatch=a,i.memoizedState=e,[t,a,!1]}function hb(e){var t=lt();return ky(t,Ue,e)}function ky(e,t,a){if(t=Fm(e,t,Sy)[0],e=$c(On)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=el(t)}catch(c){throw c===Er?fu:c}else i=t;t=lt();var o=t.queue,s=o.dispatch;return a!==t.memoizedState&&(ue.flags|=2048,gr(9,{destroy:void 0},GN.bind(null,o,a),null)),[i,s,e]}function GN(e,t){e.action=t}function mb(e){var t=lt(),a=Ue;if(a!==null)return ky(t,a,e);lt(),t=t.memoizedState,a=lt();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function gr(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=ue.updateQueue,t===null&&(t=bu(),ue.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Ty(){return lt().memoizedState}function xc(e,t,a,i){var o=Qt();ue.flags|=e,o.memoizedState=gr(1|t,{destroy:void 0},a,i===void 0?null:i)}function yu(e,t,a,i){var o=lt();i=i===void 0?null:i;var s=o.memoizedState.inst;Ue!==null&&i!==null&&Xm(i,Ue.memoizedState.deps)?o.memoizedState=gr(t,s,a,i):(ue.flags|=e,o.memoizedState=gr(1|t,s,a,i))}function pb(e,t){xc(8390656,8,e,t)}function Wm(e,t){yu(2048,8,e,t)}function YN(e){ue.flags|=4;var t=ue.updateQueue;if(t===null)t=bu(),ue.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Ey(e){var t=lt().memoizedState;return YN({ref:t,nextImpl:e}),function(){if((Se&2)!==0)throw Error(M(440));return t.impl.apply(void 0,arguments)}}function Cy(e,t){return yu(4,2,e,t)}function zy(e,t){return yu(4,4,e,t)}function Ay(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ry(e,t,a){a=a!=null?a.concat([e]):null,yu(4,4,Ay.bind(null,t,e),a)}function ep(){}function My(e,t){var a=lt();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&Xm(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Oy(e,t){var a=lt();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&Xm(t,i[1]))return i[0];if(i=e(),Pi){Wn(!0);try{e()}finally{Wn(!1)}}return a.memoizedState=[i,t],i}function tp(e,t,a){return a===void 0||(Mn&1073741824)!==0&&(be&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=kw(),ue.lanes|=e,yi|=e,a)}function Vy(e,t,a,i){return ga(a,t)?a:bi.current!==null?(e=tp(e,a,i),ga(e,t)||(mt=!0),e):(Mn&106)===0||(Mn&1073741824)!==0&&(be&261930)===0?(mt=!0,e.memoizedState=a):(e=kw(),ue.lanes|=e,yi|=e,t)}function Dy(e,t,a,i,o){var s=ke.p;ke.p=s!==0&&8>s?s:8;var c=te.T,u={};u.types=c!==null?c.types:null,te.T=u,np(e,!1,t,a);try{var h=o(),g=te.S;if(g!==null&&g(u,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=qN(h,i);ks(e,t,$,pa(e))}else ks(e,t,i,pa(e))}catch(x){ks(e,t,{then:function(){},status:"rejected",reason:x},pa())}finally{ke.p=s,c!==null&&u.types!==null&&(c.types=u.types),te.T=c}}function XN(){}function jh(e,t,a,i){if(e.tag!==5)throw Error(M(476));var o=_y(e).queue;Dy(e,o,t,Bi,a===null?XN:function(){return Iy(e),a(i)})}function _y(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Bi,baseState:Bi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:On,lastRenderedState:Bi},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:On,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Iy(e){var t=_y(e);t.next===null&&(t=e.alternate.memoizedState),ks(e,t.next.queue,{},pa())}function ap(){return Rt(xr)}function Hy(){return lt().memoizedState}function Uy(){return lt().memoizedState}function QN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=pa();e=si(a);var i=li(t,e,a);i!==null&&(ta(i,t,a),xs(i,t,a)),t={cache:qm()},e.payload=t;return}t=t.return}}function ZN(e,t,a){var i=pa();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},wu(e)?By(t,a):(a=Im(e,t,a,i),a!==null&&(ta(a,e,i),Ly(a,t,i)))}function qy(e,t,a){var i=pa();ks(e,t,a,i)}function ks(e,t,a,i){var o={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(wu(e))By(t,o);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,u=s(c,a);if(o.hasEagerState=!0,o.eagerState=u,ga(u,c))return pu(e,t,o,0),Be===null&&mu(),!1}catch{}if(a=Im(e,t,o,i),a!==null)return ta(a,e,i),Ly(a,t,i),!0}return!1}function np(e,t,a,i){if(i={lane:2,revertLane:pp(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},wu(e)){if(t)throw Error(M(479))}else t=Im(e,a,i,2),t!==null&&ta(t,e,2)}function wu(e){var t=e.alternate;return e===ue||t!==null&&t===ue}function By(e,t){sr=Xc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Ly(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Tv(e,a)}}var Zc={readContext:Rt,use:vu,useCallback:it,useContext:it,useEffect:it,useImperativeHandle:it,useLayoutEffect:it,useInsertionEffect:it,useMemo:it,useReducer:it,useRef:it,useState:it,useDebugValue:it,useDeferredValue:it,useTransition:it,useSyncExternalStore:it,useId:it,useHostTransitionStatus:it,useFormState:it,useActionState:it,useOptimistic:it,useMemoCache:it,useCacheRefresh:it,useEffectEvent:it},jy={readContext:Rt,use:vu,useCallback:function(e,t){return Qt().memoizedState=[e,t===void 0?null:t],e},useContext:Rt,useEffect:pb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,xc(4194308,4,Ay.bind(null,t,e),a)},useLayoutEffect:function(e,t){return xc(4194308,4,e,t)},useInsertionEffect:function(e,t){xc(4,2,e,t)},useMemo:function(e,t){var a=Qt();t=t===void 0?null:t;var i=e();if(Pi){Wn(!0);try{e()}finally{Wn(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=Qt();if(a!==void 0){var o=a(t);if(Pi){Wn(!0);try{a(t)}finally{Wn(!1)}}}else o=t;return i.memoizedState=i.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},i.queue=e,e=e.dispatch=ZN.bind(null,ue,e),[i.memoizedState,e]},useRef:function(e){var t=Qt();return e={current:e},t.memoizedState=e},useState:function(e){e=Bh(e);var t=e.queue,a=qy.bind(null,ue,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:ep,useDeferredValue:function(e,t){var a=Qt();return tp(a,e,t)},useTransition:function(){var e=Bh(!1);return e=Dy.bind(null,ue,e.queue,!0,!1),Qt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=ue,o=Qt();if(me){if(a===void 0)throw Error(M(407));a=a()}else{if(a=t(),Be===null)throw Error(M(349));(be&127)!==0||fy(i,t,a)}o.memoizedState=a;var s={value:a,getSnapshot:t};return o.queue=s,pb(vy.bind(null,i,s,e),[e]),i.flags|=2048,gr(9,{destroy:void 0},by.bind(null,i,s,a,t),null),a},useId:function(){var e=Qt(),t=Be.identifierPrefix;if(me){var a=hn,i=dn;a=(i&~(1<<32-ma(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Qc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=BN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:ap,useFormState:db,useActionState:db,useOptimistic:function(e){var t=Qt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=np.bind(null,ue,!0,a),a.dispatch=t,[e,t]},useMemoCache:Pm,useCacheRefresh:function(){return Qt().memoizedState=QN.bind(null,ue)},useEffectEvent:function(e){var t=Qt(),a={impl:e};return t.memoizedState=a,function(){if((Se&2)!==0)throw Error(M(440));return a.impl.apply(void 0,arguments)}}},Gy={readContext:Rt,use:vu,useCallback:My,useContext:Rt,useEffect:Wm,useImperativeHandle:Ry,useInsertionEffect:Cy,useLayoutEffect:zy,useMemo:Oy,useReducer:$c,useRef:Ty,useState:function(){return $c(On)},useDebugValue:ep,useDeferredValue:function(e,t){var a=lt();return Vy(a,Ue.memoizedState,e,t)},useTransition:function(){var e=$c(On)[0],t=lt().memoizedState;return[typeof e=="boolean"?e:el(e),t]},useSyncExternalStore:gy,useId:Hy,useHostTransitionStatus:ap,useFormState:hb,useActionState:hb,useOptimistic:function(e,t){var a=lt();return $y(a,Ue,e,t)},useMemoCache:Pm,useCacheRefresh:Uy,useEffectEvent:Ey},KN={readContext:Rt,use:vu,useCallback:My,useContext:Rt,useEffect:Wm,useImperativeHandle:Ry,useInsertionEffect:Cy,useLayoutEffect:zy,useMemo:Oy,useReducer:Wd,useRef:Ty,useState:function(){return Wd(On)},useDebugValue:ep,useDeferredValue:function(e,t){var a=lt();return Ue===null?tp(a,e,t):Vy(a,Ue.memoizedState,e,t)},useTransition:function(){var e=Wd(On)[0],t=lt().memoizedState;return[typeof e=="boolean"?e:el(e),t]},useSyncExternalStore:gy,useId:Hy,useHostTransitionStatus:ap,useFormState:mb,useActionState:mb,useOptimistic:function(e,t){var a=lt();return Ue!==null?$y(a,Ue,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Pm,useCacheRefresh:Uy,useEffectEvent:Ey};function eh(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:Le({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Gh={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=pa(),o=si(i);o.payload=t,a!=null&&(o.callback=a),t=li(e,o,i),t!==null&&(ta(t,e,i),xs(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=pa(),o=si(i);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=li(e,o,i),t!==null&&(ta(t,e,i),xs(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=pa(),i=si(a);i.tag=2,t!=null&&(i.callback=t),t=li(e,i,a),t!==null&&(ta(t,e,a),xs(t,e,a))}};function gb(e,t,a,i,o,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!Vs(a,i)||!Vs(o,s):!0}function fb(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&Gh.enqueueReplaceState(t,t.state,null)}function Fi(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=Le({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Yy(e){Hc(e)}function Xy(e){console.error(e)}function Qy(e){Hc(e)}function Kc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function bb(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Yh(e,t,a){return a=si(a),a.tag=3,a.payload={element:null},a.callback=function(){Kc(e,t)},a}function Zy(e){return e=si(e),e.tag=3,e}function Ky(e,t,a,i){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var s=i.value;e.payload=function(){return o(s)},e.callback=function(){bb(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){bb(t,a,i),typeof o!="function"&&(di===null?di=new Set([this]):di.add(this));var u=i.stack;this.componentDidCatch(i.value,{componentStack:u!==null?u:""})})}function JN(e,t,a,i,o){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&Qi(t,a,o,!0),a=Dt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Ut===null?nu():a.alternate===null&&ot===0&&(ot=3),a.flags&=-257,a.flags|=65536,a.lanes=o,i===jc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),sh(e,i,o)),!1;case 22:return a.flags|=65536,i===jc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),sh(e,i,o)),!1}throw Error(M(435,a.tag))}return sh(e,i,o),nu(),!1}if(me)return t=Dt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,i!==Oh&&(e=Error(M(422),{cause:i}),_s(Ca(e,a)))):(i!==Oh&&(t=Error(M(423),{cause:i}),_s(Ca(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,i=Ca(i,a),o=Yh(e.stateNode,i,o),Fd(e,o),ot!==4&&(ot=2)),!1;var s=Error(M(520),{cause:i});if(s=Ca(s,a),zs===null?zs=[s]:zs.push(s),ot!==4&&(ot=2),t===null)return!0;i=Ca(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Yh(a.stateNode,i,e),Fd(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(di===null||!di.has(s))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Zy(o),Ky(o,e,a,i),Fd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var ip=Error(M(461)),mt=!1;function gt(e,t,a,i){t.child=e===null?cy(t,null,a,i):Ji(t,e.child,a,i)}function vb(e,t,a,i,o){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var u in i)u!=="ref"&&(c[u]=i[u])}else c=i;return Zi(t),i=Qm(e,t,a,c,s,o),u=Zm(),e!==null&&!mt?(Km(e,t,o),Vn(e,t,o)):(me&&u&&gu(t),t.flags|=1,gt(e,t,i,o),t.child)}function yb(e,t,a,i,o){if(e===null){var s=a.type;return typeof s=="function"&&!Hm(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,Jy(e,t,s,i,o)):(e=vc(a.type,null,i,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!rp(e,o)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:Vs,a(c,i)&&e.ref===t.ref)return Vn(e,t,o)}return t.flags|=1,e=Cn(s,i),e.ref=t.ref,e.return=t,t.child=e}function Jy(e,t,a,i,o){if(e!==null){var s=e.memoizedProps;if(Vs(s,i)&&e.ref===t.ref)if(mt=!1,t.pendingProps=i=s,rp(e,o))(e.flags&131072)!==0&&(mt=!0);else return t.lanes=e.lanes,Vn(e,t,o)}return Xh(e,t,a,i,o)}function Py(e,t,a,i){var o=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,o=0;i!==null;)o=o|i.lanes|i.childLanes,i=i.sibling;i=o&~s}else i=0,t.child=null;return wb(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&wc(t,s!==null?s.cachePool:null),s!==null?lb(t,s):Uh(),hy(t);else return i=t.lanes=536870912,wb(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(wc(t,s.cachePool),lb(t,s),ui(),t.memoizedState=null):(e!==null&&wc(t,null),Uh(),ui());return gt(e,t,o,a),t.child}function Ts(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function wb(e,t,a,i,o){var s=Bm();return s=s===null?null:{parent:ht._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&wc(t,null),Uh(),hy(t),e!==null&&Qi(e,t,i,!0),t.childLanes=o,null}function Nc(e,t){return t=$u({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function $b(e,t,a){return Ji(t,e.child,null,a),e=Nc(t,t.pendingProps),e.flags|=2,la(t),t.memoizedState=null,e}function PN(e,t,a){var i=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(me){if(i.mode==="hidden")return e=Nc(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Ts(null,e);if(qh(t),(e=Xe)?(e=Pw(e,za),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:gi!==null?{id:dn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=ay(e),a.return=t,t.child=a,Nt=t,Xe=null)):e=null,e===null)throw fi(t);return t.lanes=536870912,null}return Nc(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(qh(t),o)if(t.flags&256)t.flags&=-257,t=$b(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(M(558));else if(mt||Qi(e,t,a,!1),o=(a&e.childLanes)!==0,mt||o){if(bi.current===null){if(i=Be,i!==null&&(c=Ev(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,no(e,c),ta(i,e,c),ip;nu()}t=$b(e,t,a)}else e=s.treeContext,Xe=Aa(c.nextSibling),Nt=t,me=!0,ri=null,za=!1,e!==null&&iy(t,e),t=Nc(t,i),t.flags|=134221824;return t}return e=Cn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Bo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(M(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Xh(e,t,a,i,o){return Zi(t),a=Qm(e,t,a,i,void 0,o),i=Zm(),e!==null&&!mt?(Km(e,t,o),Vn(e,t,o)):(me&&i&&gu(t),t.flags|=1,gt(e,t,a,o),t.child)}function xb(e,t,a,i,o,s){return Zi(t),t.updateQueue=null,a=py(t,i,a,o),my(e),i=Zm(),e!==null&&!mt?(Km(e,t,s),Vn(e,t,s)):(me&&i&&gu(t),t.flags|=1,gt(e,t,a,s),t.child)}function Nb(e,t,a,i,o){if(Zi(t),t.stateNode===null){var s=Fo,c=a.contextType;typeof c=="object"&&c!==null&&(s=Rt(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Gh,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},jm(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?Rt(c):Fo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(eh(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Gh.enqueueReplaceState(s,s.state,null),Ss(t,i,s,o),Ns(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var u=t.memoizedProps,h=Fi(a,u);s.props=h;var g=s.context,$=a.contextType;c=Fo,typeof $=="object"&&$!==null&&(c=Rt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=t.pendingProps!==u,$||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||g!==c)&&fb(t,s,i,c),Pn=!1;var p=t.memoizedState;s.state=p,Ss(t,i,s,o),Ns(),g=t.memoizedState,u||p!==g||Pn?(typeof x=="function"&&(eh(t,a,x,i),g=t.memoizedState),(h=Pn||gb(t,a,h,i,p,g,c))?($||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=g),s.props=i,s.state=g,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,Ih(e,t),c=t.memoizedProps,$=Fi(a,c),s.props=$,x=t.pendingProps,p=s.context,g=a.contextType,h=Fo,typeof g=="object"&&g!==null&&(h=Rt(g)),u=a.getDerivedStateFromProps,(g=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==x||p!==h)&&fb(t,s,i,h),Pn=!1,p=t.memoizedState,s.state=p,Ss(t,i,s,o),Ns();var b=t.memoizedState;c!==x||p!==b||Pn||e!==null&&e.dependencies!==null&&Lc(e.dependencies)?(typeof u=="function"&&(eh(t,a,u,i),b=t.memoizedState),($=Pn||gb(t,a,$,i,p,b,h)||e!==null&&e.dependencies!==null&&Lc(e.dependencies))?(g||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,b,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,b,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=b),s.props=i,s.state=b,s.context=h,i=$):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,Bo(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=Ji(t,e.child,null,o),t.child=Ji(t,null,a,o)):gt(e,t,a,o),t.memoizedState=s.state,e=t.child):e=Vn(e,t,o),e}function Sb(e,t,a,i){return Xi(),t.flags|=256,gt(e,t,a,i),t.child}var Qh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Zh(e){return{baseLanes:e,cachePool:ry()}}function Kh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ua),e}function Fy(e,t,a){var i=t.pendingProps,o=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(Ot.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(me){if(o?ci(t):ui(),(e=Xe)?(e=Pw(e,za),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:gi!==null?{id:dn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=ay(e),a.return=t,t.child=a,Nt=t,Xe=null)):e=null,e===null)throw fi(t);return vp(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,o?(ui(),o=t.mode,s=$u({mode:"hidden",children:s},o),i=Li(i,o,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=Zh(a),i.childLanes=Kh(e,c,a),t.memoizedState=Qh,Ts(null,i)):(ci(t),op(t,s))}var u=e.memoizedState;if(u!==null){var h=u.dehydrated;if(h!==null)return FN(e,t,s,c,i,h,u,a)}return o?(ui(),o=i.fallback,s=t.mode,u=e.child,h=u.sibling,i=Cn(u,{mode:"hidden",children:i.children}),i.subtreeFlags=u.subtreeFlags&1206910976,h!==null?o=Cn(h,o):(o=Li(o,s,a,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,Ts(null,i),i=t.child,o=e.child.memoizedState,o===null?o=Zh(a):(s=o.cachePool,s!==null?(u=ht._currentValue,s=s.parent!==u?{parent:u,pool:u}:s):s=ry(),o={baseLanes:o.baseLanes|a,cachePool:s}),i.memoizedState=o,i.childLanes=Kh(e,c,a),t.memoizedState=Qh,Ts(e.child,i)):(ci(t),a=e.child,e=a.sibling,a=Cn(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function op(e,t){return t=$u({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function $u(e,t){return e=ea(22,e,null,t),e.lanes=0,e}function ic(e,t,a){return Ji(t,e.child,null,a),e=op(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function FN(e,t,a,i,o,s,c,u){if(a)return t.flags&256?(ci(t),t.flags&=-257,ic(e,t,u)):t.memoizedState!==null?(ui(),t.child=e.child,t.flags|=128,null):(ui(),s=o.fallback,c=t.mode,o=$u({mode:"visible",children:o.children},c),s=Li(s,c,u,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,Ji(t,e.child,null,u),o=t.child,o.memoizedState=Zh(u),o.childLanes=Kh(e,i,u),t.memoizedState=Qh,Ts(null,o));if(ci(t),vp(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(o=Error(M(419)),o.stack="",o.digest=i,_s({value:o,source:null,stack:null})),ic(e,t,u)}if(mt||Qi(e,t,u,!1),i=(u&e.childLanes)!==0,mt||i){if(bi.current!==null)return ic(e,t,u);if(i=Be,i!==null&&(o=Ev(i,u),o!==0&&o!==c.retryLane))throw c.retryLane=o,no(e,o),ta(i,e,o),ip;return wm(s)||nu(),ic(e,t,u)}return wm(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Xe=Aa(s.nextSibling),Nt=t,me=!0,ri=null,za=!1,e!==null&&iy(t,e),t=op(t,o.children),t.flags|=134221824,t)}function kb(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),yc(e.return,t,a)}function Tb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Yc(a)===null&&(t=e),e=e.sibling}return t}function oc(e,t,a,i,o,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:o,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=o,c.treeForkCount=s)}function th(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Jh(e,t,a){var i=t.pendingProps,o=i.revealOrder,s=i.tail;i=i.children;var c=Ot.current;if(t.flags&128)return Hs(t,c),null;var u=(c&2)!==0;if(u?(c=c&1|2,t.flags|=128):c&=1,Hs(t,c),o==="backwards"&&e!==null?(th(e),gt(e,t,i,a),th(e)):gt(e,t,i,a),i=me?Ds:0,!u&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&kb(e,a,t);else if(e.tag===19)kb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=Tb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,th(t)),oc(t,!0,o,null,s,i);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Yc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}oc(t,!0,a,null,s,i);break;case"together":oc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Tb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),oc(t,!1,o,a,s,i)}return t.child}function Eb(e,t,a){var i=t.pendingProps;return ti(t,t.type,i.value),gt(e,t,i.children,a),t.child}function Vn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),yi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Qi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(M(153));if(t.child!==null){for(e=t.child,a=Cn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Cn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function rp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Lc(e)))}function WN(e,t,a){switch(t.tag){case 3:Vc(t,t.stateNode.containerInfo),ti(t,ht,e.memoizedState.cache),Xi();break;case 27:case 5:Nh(t);break;case 4:Vc(t,t.stateNode.containerInfo);break;case 10:ti(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,qh(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return ci(t),t.flags|=128,null;i=Qi(e,t,a,!1);var o=t.child.childLanes;return i||(a&o)!==0?Fy(e,t,a):(ci(t),e=Vn(e,t,a),e!==null?e.sibling:null)}ci(t);break;case 19:if(t.flags&128)return Jh(e,t,a);if(o=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(Qi(e,t,a,!1),i=(a&t.childLanes)!==0),o){if(i)return Jh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Hs(t,Ot.current),i)break;return null;case 22:return t.lanes=0,Py(e,t,a,t.pendingProps);case 24:ti(t,ht,e.memoizedState.cache)}return Vn(e,t,a)}function Wy(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)mt=!0;else{if(!rp(e,a)&&(t.flags&128)===0)return mt=!1,WN(e,t,a);mt=(e.flags&131072)!==0}else mt=!1,me&&(t.flags&1048576)!==0&&ny(t,Ds,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=Ii(t.elementType),t.type=e,typeof e=="function")Hm(e)?(i=Fi(e,i),t.tag=1,t=Nb(null,t,e,i,a)):(t.tag=0,t=Xh(null,t,e,i,a));else{if(e!=null){var o=e.$$typeof;if(o===km){t.tag=11,t=vb(null,t,e,i,a);break e}else if(o===Tm){t.tag=14,t=yb(null,t,e,i,a);break e}else if(o===cn){t.tag=10,t.type=e,t=Eb(null,t,a);break e}}throw t=$h(e)||e,Error(M(306,t,""))}}return t;case 0:return Xh(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,o=Fi(i,t.pendingProps),Nb(e,t,i,o,a);case 3:e:{if(Vc(t,t.stateNode.containerInfo),e===null)throw Error(M(387));i=t.pendingProps;var s=t.memoizedState;o=s.element,Ih(e,t),Ss(t,i,null,a);var c=t.memoizedState;if(i=c.cache,ti(t,ht,i),i!==s.cache&&Dh(t,[ht],a,!0),Ns(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Sb(e,t,i,a);break e}else if(i!==o){o=Ca(Error(M(424)),t),_s(o),t=Sb(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Xe=Aa(e.firstChild),Nt=t,me=!0,ri=null,za=!0,a=cy(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Xi(),i===o){t=Vn(e,t,a);break e}gt(e,t,i,a)}t=t.child}return t;case 26:return Bo(e,t),e===null?(a=ev(t.type,null,t.pendingProps,null))?t.memoizedState=a:me||(t.stateNode=Lw(t.type,t.pendingProps,oi.current,t)):t.memoizedState=ev(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Nh(t),e===null&&me&&(i=t.stateNode=Fw(t.type,t.pendingProps,oi.current),Nt=t,za=!0,o=Xe,$i(t.type)?($m=o,Xe=Aa(i.firstChild)):Xe=o),gt(e,t,t.pendingProps.children,a),Bo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&me&&((o=i=Xe)&&(i=Y5(i,t.type,t.pendingProps,za),i!==null?(t.stateNode=i,Nt=t,Xe=Aa(i.firstChild),za=!1,o=!0):o=!1),o||fi(t)),Nh(t),o=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,bm(o,s)?i=null:c!==null&&bm(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Qm(e,t,LN,null,null,a),xr._currentValue=o),Bo(e,t),gt(e,t,i,a),t.child;case 6:return e===null&&me&&((e=a=Xe)&&(a=X5(a,t.pendingProps,za),a!==null?(t.stateNode=a,Nt=t,Xe=null,e=!0):e=!1),e||fi(t)),null;case 13:return Fy(e,t,a);case 4:return Vc(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Ji(t,null,i,a):gt(e,t,i,a),t.child;case 11:return vb(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,Bo(e,t),gt(e,t,i,a),t.child;case 8:return gt(e,t,t.pendingProps.children,a),t.child;case 12:return gt(e,t,t.pendingProps.children,a),t.child;case 10:return Eb(e,t,a);case 9:return o=t.type._context,i=t.pendingProps.children,Zi(t),o=Rt(o),i=i(o),t.flags|=1,gt(e,t,i,a),t.child;case 14:return yb(e,t,t.type,t.pendingProps,a);case 15:return Jy(e,t,t.type,t.pendingProps,a);case 19:return Jh(e,t,a);case 31:return PN(e,t,a);case 22:return Py(e,t,a,t.pendingProps);case 24:return Zi(t),i=Rt(ht),e===null?(o=Bm(),o===null&&(o=Be,s=qm(),o.pooledCache=s,s.refCount++,s!==null&&(o.pooledCacheLanes|=a),o=s),t.memoizedState={parent:i,cache:o},jm(t),ti(t,ht,o)):((e.lanes&a)!==0&&(Ih(e,t),Ss(t,null,null,a),Ns()),o=e.memoizedState,s=t.memoizedState,o.parent!==i?(o={parent:i,cache:i},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),ti(t,ht,i)):(i=s.cache,ti(t,ht,i),i!==o.cache&&Dh(t,[ht],a,!0))),gt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:me&&gu(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:Bo(e,t),gt(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(M(156,t.tag))}function kn(e){e.flags|=4}function ah(e,t,a,i,o){var s;if((s=(e.mode&32)!==0)&&(s=a===null?nv(t,i):nv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Cw())e.flags|=8192;else throw Gi=jc,Lm}else e.flags&=-16777217}function Cb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!a0(t))if(Cw())e.flags|=8192;else throw Gi=jc,Lm}function rc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Sv():536870912,e.lanes|=t,fr|=t)}function cs(e,t){if(!me)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Ye(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,i|=o.subtreeFlags&1206910976,i|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,i|=o.subtreeFlags,i|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function e5(e,t,a){var i=t.pendingProps;switch(Um(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ye(t),null;case 1:return Ye(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),zn(ht),hr(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Uo(t)?kn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Pd())),Ye(t),null;case 26:var o=t.type,s=t.memoizedState;return e===null?(kn(t),s!==null?(Ye(t),Cb(t,s)):(Ye(t),ah(t,o,null,i,a))):s?s!==e.memoizedState?(kn(t),Ye(t),Cb(t,s)):(Ye(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&kn(t),Ye(t),ah(t,o,e,i,a)),null;case 27:if(Dc(t),a=oi.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&kn(t);else{if(!i){if(t.stateNode===null)throw Error(M(166));return Ye(t),t.subtreeFlags&=-33554433,null}e=mn.current,Uo(t)?tb(t,e):(e=Fw(o,i,a),t.stateNode=e,kn(t))}return Ye(t),t.subtreeFlags&=-33554433,null;case 5:if(Dc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&kn(t);else{if(!i){if(t.stateNode===null)throw Error(M(166));return Ye(t),t.subtreeFlags&=-33554433,null}if(s=mn.current,Uo(t))tb(t,s);else{var c=Ls(oi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(o,{is:i.is}):c.createElement(o)}}s[At]=t,s[na]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Vt(s,o,i),o){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&kn(t)}}return Ye(t),t.subtreeFlags&=-33554433,ah(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&kn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(M(166));if(e=oi.current,Uo(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,o=Nt,o!==null)switch(o.tag){case 27:case 5:i=o.memoizedProps}e[At]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||qw(e.nodeValue,a)),e||fi(t,!0)}else e=Ls(e).createTextNode(i),e[At]=t,t.stateNode=e}return Ye(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=Uo(t),a!==null){if(e===null){if(!i)throw Error(M(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(557));e[At]=t}else Xi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ye(t),e=!1}else a=Pd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(la(t),t):(la(t),null);if((t.flags&128)!==0)throw Error(M(558))}return Ye(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Uo(t),i!==null&&i.dehydrated!==null){if(e===null){if(!o)throw Error(M(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(M(317));o[At]=t}else Xi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ye(t),o=!1}else o=Pd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(la(t),t):(la(t),null)}return la(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,o=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(o=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==o&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),rc(t,t.updateQueue),Ye(t),null);case 4:return hr(),e===null&&gp(t.stateNode.containerInfo),t.flags|=67108864,Ye(t),null;case 10:return zn(t.type),Ye(t),null;case 19:if(Ym(t),i=t.memoizedState,i===null)return Ye(t),null;if(o=(t.flags&128)!==0,s=i.rendering,s===null)if(o)cs(i,!1);else{if(ot!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Yc(e),s!==null){for(t.flags|=128,cs(i,!1),e=s.updateQueue,t.updateQueue=e,rc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)ty(a,e),a=a.sibling;return Hs(t,Ot.current&1|2),me&&Tn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&da()>tu&&(t.flags|=128,o=!0,cs(i,!1),t.lanes=4194304)}else{if(!o)if(e=Yc(s),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,rc(t,e),cs(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!me)return Ye(t),null}else 2*da()-i.renderingStartTime>tu&&a!==536870912&&(t.flags|=128,o=!0,cs(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=da(),e.sibling=null,s=Ot.current,s=o?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||me?Hs(t,s):(a=s,Qe(Dt,t),Qe(Ot,a),Ut===null&&(Ut=t)),me&&Tn(t,i.treeForkCount),e}return Ye(t),null;case 22:case 23:return la(t),Gm(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(Ye(t),t.subtreeFlags&6&&(t.flags|=8192)):Ye(t),a=t.updateQueue,a!==null&&rc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&Mt(ji),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),zn(ht),Ye(t),null;case 25:return null;case 30:return t.flags|=33554432,Ye(t),null}throw Error(M(156,t.tag))}function t5(e,t){switch(Um(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return zn(ht),hr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Dc(t),null;case 31:if(t.memoizedState!==null){if(la(t),t.alternate===null)throw Error(M(340));Xi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(la(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(M(340));Xi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ym(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return hr(),null;case 10:return zn(t.type),null;case 22:case 23:return la(t),Gm(),e!==null&&Mt(ji),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return zn(ht),null;case 25:return null;default:return null}}function ew(e,t){switch(Um(t),t.tag){case 3:zn(ht),hr();break;case 26:case 27:case 5:Dc(t);break;case 4:hr();break;case 31:t.memoizedState!==null&&la(t);break;case 13:la(t);break;case 19:Ym(t);break;case 10:zn(t.type);break;case 22:case 23:la(t),Gm(),e!==null&&Mt(ji);break;case 24:zn(ht)}}function tl(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var o=i.next;a=o;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==o)}}catch(u){Oe(t,t.return,u)}}function vi(e,t,a){try{var i=t.updateQueue,o=i!==null?i.lastEffect:null;if(o!==null){var s=o.next;i=s;do{if((i.tag&e)===e){var c=i.inst,u=c.destroy;if(u!==void 0){c.destroy=void 0,o=t;var h=a,g=u;try{g()}catch($){Oe(o,h,$)}}}i=i.next}while(i!==s)}}catch($){Oe(t,t.return,$)}}function tw(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{dy(t,a)}catch(i){Oe(e,e.return,i)}}}function aw(e,t,a){a.props=Fi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){Oe(e,t,i)}}function sn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var o=e.stateNode,s=Rn(e.memoizedProps,o);(o.ref===null||o.ref.name!==s)&&(o.ref=Xw(s)),i=o.ref;break;case 7:if(e.stateNode===null){var c=new fa(e);aa(e.child,!1,j5,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(u){Oe(e,t,u)}}function zt(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(o){Oe(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){Oe(e,t,o)}else a.current=null}function Jc(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)Jw(e.stateNode,t[a])}function zb(e){for(var t=e.return;t!==null&&(lp(t)&&Jw(e.stateNode,t.stateNode),!sp(t));)t=t.return}function Es(e){for(var t=e.return;t!==null&&(lp(t)&&G5(e.stateNode,t.stateNode),!sp(t));)t=t.return}function sp(e){return e.tag===5||e.tag===3||e.tag===27}function lp(e){return e&&e.tag===7&&e.stateNode!==null}function Ph(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(o){Oe(e,e.return,o)}}function nh(e,t,a){try{var i=e.stateNode;k5(i,e.type,a,t),i[na]=t}catch(o){Oe(e,e.return,o)}}function nw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&$i(e.type)||e.tag===4}function ih(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||nw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&$i(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Fh(e,t,a,i){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=un)),Jc(e,i),Ne=!0;else if(o!==4&&(o===27&&(Jc(e,i),i=null,$i(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Fh(e,t,a,i),e=e.sibling;e!==null;)Fh(e,t,a,i),e=e.sibling}function Pc(e,t,a,i){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Jc(e,i),Ne=!0;else if(o!==4&&(o===27&&(Jc(e,i),i=null,$i(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Pc(e,t,a,i),e=e.sibling;e!==null;)Pc(e,t,a,i),e=e.sibling}function iw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);Vt(t,i,a),t[At]=e,t[na]=a}catch(s){Oe(e,e.return,s)}}var Fc=!1,ca=null;function Ab(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Fc=!0)}var ln=null;function Rb(){var e=ln;return ln=null,e}var Wt=0;function Cr(e,t,a,i,o){return Wt=0,ow(e.child,t,a,i,o)}function ow(e,t,a,i,o){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var u=vm(c);i.push(u),u.view&&(s=!0)}else s||vm(c).view&&(s=!0);Fc=!0,jw(c,Wt===0?t:t+"_"+Wt,a),Wt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||ow(e.child,t,a,i,o)&&(s=!0));e=e.sibling}return s}function gn(e,t){for(;e!==null;)e.tag===5?Gw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||gn(e.child,t)),e=e.sibling}function Sc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Sc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(M(544));var a=t.name;t=In(t.default,t.share),t!=="none"&&(Cr(e,a,t,null,!1)||gn(e.child,!1))}e=e.sibling}}function Wh(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,o=Rn(i,a),s=In(i.default,a.paired?i.share:i.enter);s!=="none"?Cr(e,o,s,null,!1)?(Sc(e),a.paired||t||br(e,i.onEnter)):gn(e.child,!1):Sc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Wh(e,t),e=e.sibling;else Sc(e)}function em(e){if(ca!==null&&ca.size!==0){var t=ca;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var o=t.get(i);if(o!==void 0){var s=In(a.default,a.share);if(s!=="none"&&(Cr(e,i,s,null,!1)?(s=e.stateNode,o.paired=s,s.paired=o,br(e,a.onShare)):gn(e.child,!1)),t.delete(i),t.size===0)break}}}em(e)}e=e.sibling}}}function tm(e){if(e.tag===30){var t=e.memoizedProps,a=Rn(t,e.stateNode),i=ca!==null?ca.get(a):void 0,o=In(t.default,i!==void 0?t.share:t.exit);o!=="none"&&(Cr(e,a,o,null,!1)?i!==void 0?(o=e.stateNode,i.paired=o,o.paired=i,ca.delete(a),br(e,t.onShare)):br(e,t.onExit):gn(e.child,!1)),ca!==null&&em(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)tm(e),e=e.sibling;else ca!==null&&em(e)}function rw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=Rn(t,e.stateNode);t=In(t.default,t.update),e.flags&=-5,t!=="none"&&Cr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&rw(e);e=e.sibling}}function am(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,gn(e.child,!1))}am(e)}e=e.sibling}}function kc(e){if(e.tag===30)e.stateNode.paired=null,gn(e.child,!1),am(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)kc(e),e=e.sibling;else am(e)}function sw(e){for(e=e.child;e!==null;)e.tag===30?gn(e.child,!1):(e.subtreeFlags&33554432)!==0&&sw(e),e=e.sibling}function cp(e,t,a,i,o,s,c){for(var u=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Wt<s.length){var g=s[Wt],$=vm(h);(g.view||$.view)&&(u=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=g.rect;var p=$.rect;x=x.y!==p.y||x.x!==p.x||x.height!==p.height||x.width!==p.width}x&&(e.flags|=4),$.abs?$=!g.abs:(g=g.rect,$=$.rect,$=g.height!==$.height||g.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&jw(h,Wt===0?a:a+"_"+Wt,o),u&&(e.flags&4)!==0||(ln===null&&(ln=[]),ln.push(h,Wt===0?i:i+"_"+Wt,t.memoizedProps)),Wt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:cp(e,t.child,a,i,o,s,c)&&(u=!0));t=t.sibling}return u}function lw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,o=Rn(a,i),s=In(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(R5)}else c=e.memoizedState,e.memoizedState=null;i=e;var u=e.child;Wt=0,o=cp(i,u,o,o,s,c,!1),(e.flags&4)!==0&&o&&(t||br(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&lw(e,t);e=e.sibling}}var wt=!1,Ce=!1,nn=!1,oh=!1,Mb=typeof WeakSet=="function"?WeakSet:Set,$t=null,on=!1,bs=!1,Wc=!1,nm=!1;function a5(e,t,a){if(e=e.containerInfo,gm=Nr,e=Qv(e),Dm(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var o=i.getSelection&&i.getSelection();if(o&&o.rangeCount!==0){i=o.anchorNode;var s=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var u=0,h=-1,g=-1,$=0,x=0,p=e,b=null;t:for(;;){for(var C;p!==i||s!==0&&p.nodeType!==3||(h=u+s),p!==c||o!==0&&p.nodeType!==3||(g=u+o),p.nodeType===3&&(u+=p.nodeValue.length),(C=p.firstChild)!==null;)b=p,p=C;for(;;){if(p===e)break t;if(b===i&&++$===s&&(h=u),b===c&&++x===o&&(g=u),(C=p.nextSibling)!==null)break;p=b,b=p.parentNode}p=C}i=h===-1||g===-1?null:{start:h,end:g}}else i=null}i=i||{start:0,end:0}}else i=null;for(fm={focusedElem:e,selectionRange:i},Nr=!1,a=(a&335544064)===a,$t=t,t=a?9270:1024;$t!==null;){if(e=$t,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&tm(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Ab(e),sc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&tm(i),sc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&Ab(e),sc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,$t=i):(a&&rw(e),sc(a))}}ca=null}function sc(e){for(;$t!==null;){var t=$t,a=e,i=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&i!==null){a=void 0,o=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=Fi(t.type,o);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(u){Oe(t,t.return,u)}}break;case 3:if((o&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)ym(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":ym(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=Rn(i.memoizedProps,i.stateNode),o=t.memoizedProps,o=In(o.default,o.update),o!=="none"&&Cr(i,a,o,i.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(M(163))}if(i=t.sibling,i!==null){i.return=t.return,$t=i;break}$t=t.return}}function cw(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:rn(e,a),i&4&&tl(5,a);break;case 1:if(rn(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Oe(a,a.return,c)}else{var o=Fi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Oe(a,a.return,c)}}i&64&&tw(a),i&512&&sn(a,a.return);break;case 3:if(rn(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{dy(e,t)}catch(c){Oe(a,a.return,c)}}break;case 27:t===null&&i&4&&iw(a);case 26:case 5:rn(e,a),t===null&&i&4&&Ph(a),i&512&&sn(a,a.return);break;case 12:rn(e,a);break;case 31:rn(e,a),i&4&&mw(e,a);break;case 13:rn(e,a),i&4&&pw(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=p5.bind(null,a),Q5(e,a))));break;case 22:if(i=a.memoizedState!==null||wt,!i){var s=t!==null&&t.memoizedState!==null||Ce;t=wt,o=Ce,wt=i,(Ce=s)&&!o?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),ja(e,a,i)):rn(e,a),wt=t,Ce=o}break;case 30:rn(e,a),i&512&&sn(a,a.return);break;case 7:i&512&&sn(a,a.return);default:rn(e,a)}}function im(e,t){for(e=e.child;e!==null;)uw(e,t),e=e.sibling}function uw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var o=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Oe(e,e.return,h)}om(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Ne=!0}catch(h){Oe(e,e.return,h)}break;case 18:try{var u=e.stateNode;t?Zb(u,!0):Zb(e.stateNode,!1)}catch(h){Oe(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&im(e,t);break;default:im(e,t)}}function om(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:uw(a,i);break e;case 22:a.memoizedState===null&&om(a,i);break e;default:om(a,i)}}e=e.sibling}}function dw(e){var t=e.alternate;t!==null&&(e.alternate=null,dw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&cu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var We=null,Pt=!1;function La(e,t,a){for(a=a.child;a!==null;)hw(e,t,a),a=a.sibling}function hw(e,t,a){if(ha&&typeof ha.onCommitFiberUnmount=="function")try{ha.onCommitFiberUnmount(Zs,a)}catch{}switch(a.tag){case 26:Ce||zt(a,t),La(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Ce&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Ce||zt(a,t),Es(a);var i=We,o=Pt;$i(a.type)&&(We=a.stateNode,Pt=!1),La(e,t,a),Ww(a.stateNode,a.type,a.memoizedProps),We=i,Pt=o;break;case 5:Ce||zt(a,t),Es(a);case 6:if(a.tag===6&&Es(a),i=We,o=Pt,We=null,La(e,t,a),We=i,Pt=o,We!==null)if(Pt)try{(We.nodeType===9?We.body:We.nodeName==="HTML"?We.ownerDocument.body:We).removeChild(a.stateNode),Ne=!0}catch(s){Oe(a,t,s)}else try{We.removeChild(a.stateNode),Ne=!0}catch(s){Oe(a,t,s)}break;case 18:We!==null&&(Pt?(e=We,Qb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Sr(e)):Qb(We,a.stateNode));break;case 4:i=We,o=Pt,We=a.stateNode.containerInfo,Pt=!0,La(e,t,a),We=i,Pt=o;break;case 0:case 11:case 14:case 15:vi(2,a,t),Ce||vi(4,a,t),La(e,t,a);break;case 1:Ce||(zt(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&aw(a,t,i)),La(e,t,a);break;case 21:La(e,t,a);break;case 22:Ce=(i=Ce)||a.memoizedState!==null,La(e,t,a),Ce=i;break;case 30:zt(a,t),La(e,t,a);break;case 7:Ce||zt(a,t),La(e,t,a);break;default:La(e,t,a)}}function mw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Sr(e)}catch(a){Oe(t,t.return,a)}}}function pw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Sr(e)}catch(a){Oe(t,t.return,a)}}function n5(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Mb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Mb),t;default:throw Error(M(435,e.tag))}}function lc(e,t){var a=n5(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var o=g5.bind(null,e,i);i.then(o,o)}})}function Yt(e,t,a){var i=t.deletions;if(i!==null)for(var o=0;o<i.length;o++){var s=i[o],c=e,u=t,h=u;e:for(;h!==null;){switch(h.tag){case 27:if($i(h.type)){We=h.stateNode,Pt=!1;break e}break;case 5:We=h.stateNode,Pt=!1;break e;case 3:case 4:We=h.stateNode.containerInfo,Pt=!0;break e}h=h.return}if(We===null)throw Error(M(160));hw(c,u,s),We=null,Pt=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)gw(t,e,a),t=t.sibling}var Ga=null;function gw(e,t,a){var i=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}Yt(t,e,a),Xt(e),o&4&&(vi(3,e,e.return),tl(3,e),vi(5,e,e.return));break;case 1:Yt(t,e,a),Xt(e),o&512&&(Ce||i===null||zt(i,i.return)),o&64&&wt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=Ga,Yt(t,e,a),Xt(e),o&512&&(Ce||i===null||zt(i,i.return)),o&4)if(o=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(wt)e.stateNode=Lw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=s.ownerDocument||s;t:switch(t){case"title":i=o.getElementsByTagName("title")[0],(!i||i[Ps]||i[At]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=o.createElement(t),o.head.insertBefore(i,o.querySelector("head > title"))),Vt(i,t,a),i[At]=e,xt(i),t=i;break e;case"link":if(s=av("link","href",o).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=o.createElement(t),Vt(i,t,a),o.head.appendChild(i);break;case"meta":if(s=av("meta","content",o).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=o.createElement(t),Vt(i,t,a),o.head.appendChild(i);break;default:throw Error(M(468,t))}i[At]=e,xt(i),t=i}e.stateNode=t}else wt||xm(s,e.type,e.stateNode);else e.stateNode=tv(s,a,e.memoizedProps);else o!==a?(o===null?(t=i.stateNode,t===null||Ce||t.parentNode.removeChild(t)):o.count--,a===null?wt||xm(s,e.type,e.stateNode):tv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&nh(e,e.memoizedProps,i.memoizedProps);break;case 27:Yt(t,e,a),Xt(e),o&512&&(Ce||i===null||zt(i,i.return)),i!==null&&o&4&&nh(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=nn,nn=!1,Yt(t,e,a),nn=s,Xt(e),o&512&&(Ce||i===null||zt(i,i.return)),e.flags&32){t=e.stateNode;try{pr(t,""),Ne=!0}catch($){Oe(e,e.return,$)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,nh(e,t,i!==null?i.memoizedProps:t)),o&1024&&(oh=!0);break;case 6:if(Yt(t,e,a),Xt(e),o&4){if(e.stateNode===null)throw Error(M(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Ne=!0}catch($){Oe(e,e.return,$)}}break;case 3:if(Ne=!1,zc=null,s=Ga,Ga=js(t.containerInfo),Yt(t,e,a),Ga=s,Xt(e),o&4&&i!==null&&i.memoizedState.isDehydrated)try{Sr(t.containerInfo)}catch($){Oe(e,e.return,$)}oh&&(oh=!1,fw(e)),Ne=!1;break;case 4:o=nn,nn=wt,i=Hf(),s=Ga,Ga=js(e.stateNode.containerInfo),Yt(t,e,a),Xt(e),Ga=s,Ne&&bs&&(Wc=!0),Ne=i,nn=o;break;case 12:Yt(t,e,a),Xt(e);break;case 31:Yt(t,e,a),Xt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,lc(e,t)));break;case 13:Yt(t,e,a),Xt(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(xu=da()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,lc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var u=wt,h=Ce,g=nn;wt=u||s,nn=g||s,Ce=h||c,Yt(t,e,a),Ce=h,nn=g,wt=u,Xt(e),o&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||wt||Ce||(t=c||Ce,a=wt,i=Ce,wt=s||wt,Ce=t,Kn(e,2),wt=a,Ce=i),!s&&nn||im(e,s)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,lc(e,a))));break;case 19:Yt(t,e,a),Xt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,lc(e,t)));break;case 30:o&512&&(Ce||i===null||zt(i,i.return)),o=Hf(),s=bs,c=(a&335544064)===a,u=e.memoizedProps,bs=c&&In(u.default,u.update)!=="none",Yt(t,e,a),Xt(e),c&&i!==null&&Ne&&(e.flags|=4),bs=s,Ne=o;break;case 21:break;case 7:o&512&&(Ce||i===null||zt(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:Yt(t,e,a),Xt(e)}}function Xt(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(nw(i)){a=i;break}i=i.return}i=null;for(var o=e.return;o!==null;){if(lp(o)){var s=o.stateNode;i===null?i=[s]:i.push(s)}if(sp(o))break;o=o.return}var c=i;if(a==null)throw Error(M(160));switch(a.tag){case 27:var u=a.stateNode,h=ih(e);Pc(e,h,u,c);break;case 5:var g=a.stateNode;a.flags&32&&(pr(g,""),a.flags&=-33);var $=ih(e);Pc(e,$,g,c);break;case 3:case 4:var x=a.stateNode.containerInfo,p=ih(e);Fh(e,p,x,c);break;default:throw Error(M(161))}}catch(b){Oe(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function fw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;fw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Nr=!0,t.reset(),Nr=!1),e=e.sibling}}function qo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)bw(t,e),t=t.sibling;else lw(t,!1)}function bw(e,t){var a=e.alternate;if(a===null)Wh(e,!1);else switch(e.tag){case 3:if(nm=on=!1,Rb(),qo(t,e),!on&&!Wc){if(e=ln,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var o=e[i+1];Gw(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),nm=!0}ln=null;break;case 5:qo(t,e);break;case 4:i=on,on=!1,qo(t,e),on&&(Wc=!0),on=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Wh(e,!1):qo(t,e));break;case 30:i=on,o=Rb(),on=!1,qo(t,e),on&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=Rn(s,c),c=Rn(a.memoizedProps,c);var u=In(s.default,s.update);u==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Wt=0,t=cp(e,a,t,c,u,s,!0),Wt!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(br(e,e.memoizedProps.onUpdate),ln=o):o!==null&&(o.push.apply(o,ln),ln=o),on=(e.flags&32)!==0?!0:i;break;default:qo(t,e)}}function rn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)cw(e,t.alternate,t),t=t.sibling}function Kn(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:vi(4,a,a.return),Kn(a,i);break;case 1:zt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&aw(a,a.return,o),Kn(a,i);break;case 27:(i&2)!==0&&Ww(a.stateNode,a.type,a.memoizedProps);case 5:zt(a,a.return),a.tag!==5&&a.tag!==27||Es(a),Kn(a,i);break;case 6:Es(a);break;case 26:zt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||Ce||o.parentNode.removeChild(o),Kn(a,i);break;case 22:a.memoizedState===null&&Kn(a,i);break;case 30:zt(a,a.return),Kn(a,i);break;case 7:zt(a,a.return);default:Kn(a,i)}e=e.sibling}}function ja(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,o=e,s=t,c=s.flags,u=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:ja(o,s,a),tl(4,s);break;case 1:if(ja(o,s,a),i=s,o=i.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch($){Oe(i,i.return,$)}if(i=s,o=i.updateQueue,o!==null){var h=i.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)uy(g[o],h)}catch($){Oe(i,i.return,$)}}u&&c&64&&tw(s),sn(s,s.return);break;case 27:(a&2)!==0&&iw(s);case 5:s.tag!==5&&s.tag!==27||zb(s),ja(o,s,a),u&&i===null&&c&4&&Ph(s),sn(s,s.return);break;case 6:zb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||wt||xm(js(h.ownerDocument),s.type,h),ja(o,s,a),u&&i===null&&c&4&&Ph(s),sn(s,s.return);break;case 12:ja(o,s,a);break;case 31:ja(o,s,a),u&&c&4&&mw(o,s);break;case 13:ja(o,s,a),u&&c&4&&pw(o,s);break;case 22:s.memoizedState===null&&ja(o,s,a),sn(s,s.return);break;case 30:ja(o,s,a),sn(s,s.return);break;case 7:sn(s,s.return);default:ja(o,s,a)}t=t.sibling}}function up(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ws(a))}function dp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Ws(e))}function Na(e,t,a,i){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)vw(e,t,a,i),t=t.sibling;else o&&sw(t)}function vw(e,t,a,i){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&kc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Na(e,t,a,i),s&2048&&tl(9,t);break;case 1:Na(e,t,a,i);break;case 3:Na(e,t,a,i),o&&nm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Ws(s)));break;case 12:if(s&2048){Na(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,u=c.id,h=c.onPostCommit;typeof h=="function"&&h(u,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(g){Oe(t,t.return,g)}}else Na(e,t,a,i);break;case 31:Na(e,t,a,i);break;case 13:Na(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,u=t.alternate,t.memoizedState!==null?(o&&u!==null&&u.memoizedState===null&&kc(u),c._visibility&2?Na(e,t,a,i):Cs(e,t)):(o&&u!==null&&u.memoizedState!==null&&kc(t),c._visibility&2?Na(e,t,a,i):(c._visibility|=2,Lo(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&up(u,t);break;case 24:Na(e,t,a,i),s&2048&&dp(t.alternate,t);break;case 30:o&&(s=t.alternate,s!==null&&(gn(s.child,!0),gn(t.child,!0))),Na(e,t,a,i);break;default:Na(e,t,a,i)}}function Lo(e,t,a,i,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,u=a,h=i,g=c.flags;switch(c.tag){case 0:case 11:case 15:Lo(s,c,u,h,o),tl(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?Lo(s,c,u,h,o):Cs(s,c):($._visibility|=2,Lo(s,c,u,h,o)),o&&g&2048&&up(c.alternate,c);break;case 24:Lo(s,c,u,h,o),o&&g&2048&&dp(c.alternate,c);break;default:Lo(s,c,u,h,o)}t=t.sibling}}function Cs(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,o=i.flags;switch(i.tag){case 22:Cs(a,i),o&2048&&up(i.alternate,i);break;case 24:Cs(a,i),o&2048&&dp(i.alternate,i);break;default:Cs(a,i)}t=t.sibling}}var Hi=8192;function Di(e,t,a){if(e.subtreeFlags&Hi)for(e=e.child;e!==null;)yw(e,t,a),e=e.sibling}function yw(e,t,a){switch(e.tag){case 26:Di(e,t,a),e.flags&Hi&&(e.memoizedState!==null?sS(a,Ga,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&iv(a,e)));break;case 5:Di(e,t,a),e.flags&Hi&&(e=e.stateNode,(t&335544128)===t&&iv(a,e));break;case 3:case 4:var i=Ga;Ga=js(e.stateNode.containerInfo),Di(e,t,a),Ga=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Hi,Hi=16777216,Di(e,t,a),Hi=i):Di(e,t,a));break;case 30:if((e.flags&Hi)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var o=e.stateNode;o.paired=null,ca===null&&(ca=new Map),ca.set(i,o)}Di(e,t,a);break;default:Di(e,t,a)}}function ww(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function us(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];$t=i,xw(i,e)}ww(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)$w(e),e=e.sibling}function $w(e){switch(e.tag){case 0:case 11:case 15:us(e),e.flags&2048&&vi(9,e,e.return);break;case 3:us(e);break;case 12:us(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Tc(e)):us(e);break;default:us(e)}}function Tc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];$t=i,xw(i,e)}ww(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:vi(8,t,t.return),Tc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Tc(t));break;default:Tc(t)}e=e.sibling}}function xw(e,t){for(;$t!==null;){var a=$t;switch(a.tag){case 0:case 11:case 15:vi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Ws(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,$t=i;else e:for(a=e;$t!==null;){i=$t;var o=i.sibling,s=i.return;if(dw(i),i===a){$t=null;break e}if(o!==null){o.return=s,$t=o;break e}$t=s}}}var i5={getCacheForType:function(e){var t=Rt(ht),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return Rt(ht).controller.signal}},o5=typeof WeakMap=="function"?WeakMap:Map,Se=0,Be=null,fe=null,be=0,Re=0,ra=null,ai=!1,zr=!1,hp=!1,Dn=0,ot=0,yi=0,Yi=0,eu=0,ua=0,fr=0,zs=null,Ft=null,rm=!1,xu=0,Nw=0,tu=1/0,au=null,di=null,at=0,Xa=null,Wi=null,pn=0,sm=0,lm=null,Sw=null,cr=null,ur=null,dr=null,As=0,Ec=null;function pa(){return(Se&2)!==0&&be!==0?be&-be:te.T!==null?pp():Cv()}function kw(){if(ua===0)if((be&536870912)===0||me){var e=Kl;Kl<<=1,(Kl&3932160)===0&&(Kl=262144),ua=e}else ua=536870912;return e=Dt.current,e!==null&&(e.flags|=32),ua}function br(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=Xw(Rn(e.memoizedProps,a))),ur===null&&(ur=[]),ur.push(t.bind(null,i))}}function ta(e,t,a){(e===Be&&(Re===2||Re===9)||e.cancelPendingCommit!==null)&&(vr(e,0),ni(e,be,ua,!1)),Js(e,a),((Se&2)===0||e!==Be)&&(e===Be&&((Se&2)===0&&(Yi|=a),ot===4&&ni(e,be,ua,!1)),bn(e))}function Tw(e,t,a){if((Se&6)!==0)throw Error(M(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Ks(e,t),o=i?l5(e,t):rh(e,t,!0),s=i;do{if(o===0){zr&&!i&&ni(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!r5(a)){o=rh(e,t,!1),s=!1;continue}if(o===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var u=e;o=zs;var h=u.current.memoizedState.isDehydrated;if(h&&(vr(u,c).flags|=256),c=rh(u,c,!1),c!==2&&c!==6){if(hp&&!h){u.errorRecoveryDisabledLanes|=s,Yi|=s,o=4;break e}s=Ft,Ft=o,s!==null&&(Ft===null?Ft=s:Ft.push.apply(Ft,s))}o=c}if(s=!1,o!==2)continue}}if(o===1){vr(e,0),ni(e,t,0,!0);break}e:{switch(i=e,s=o,s){case 0:case 1:throw Error(M(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ni(i,t,ua,!ai);break e;case 2:Ft=null;break;case 3:case 5:break;default:throw Error(M(329))}if((t&62914560)===t&&(o=xu+300-da(),10<o)){if(ni(i,t,ua,!ai),lu(i,0,!0)!==0)break e;pn=t,i.timeoutHandle=fp(Ob.bind(null,i,a,Ft,au,rm,t,ua,Yi,fr,ai,s,"Throttled",-0,0),o);break e}Ob(i,a,Ft,au,rm,t,ua,Yi,fr,ai,s,null,-0,0)}}break}while(!0);bn(e)}function Ob(e,t,a,i,o,s,c,u,h,g,$,x,p,b){e.timeoutHandle=-1;var C=t.subtreeFlags,T=(s&335544064)===s;if(x=null,(T||C&8192||(C&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:un},ca=null,yw(t,s,x),T&&(C=x,T=e.containerInfo,T=(T.nodeType===9?T:T.ownerDocument).__reactViewTransition,T!=null&&(C.count++,C.waitingForViewTransition=!0,C=Gs.bind(C),T.finished.then(C,C))),C=(s&62914560)===s?xu-da():(s&4194048)===s?Nw-da():0,C=lS(x,C),C!==null)){pn=s,e.cancelPendingCommit=C(Db.bind(null,e,t,s,a,i,o,c,u,h,g,$,x,null,p,b)),ni(e,s,c,!g);return}Db(e,t,s,a,i,o,c,u,h,g,$,x)}function r5(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var o=a[i],s=o.getSnapshot;o=o.value;try{if(!ga(s(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ni(e,t,a,i){t=Nv(e,t),t&=~eu,t&=~Yi,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var o=t;0<o;){var s=31-ma(o),c=1<<s;i[s]=-1,o&=~c}a!==0&&kv(e,a,t)}function Nu(){return(Se&6)===0?(al(0,!1),!1):!0}function mp(){if(fe!==null){if(Re===0)var e=fe.return;else e=fe,En=io=null,Jm(e),rr=null,Is=0,e=fe;for(;e!==null;)ew(e.alternate,e),e=e.return;fe=null}}function vr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,C5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),pn=0,mp(),Be=e,fe=a=Cn(e.current,null),be=t,Re=0,ra=null,ai=!1,zr=Ks(e,t),hp=!1,fr=ua=eu=Yi=yi=ot=0,Ft=zs=null,rm=!1,Dn=Nv(e,t),mu(),a}function Ew(e,t){ue=null,te.H=Zc,t===Er||t===fu?(t=rb(),Re=3):t===Lm?(t=rb(),Re=4):Re=t===ip?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ra=t,fe===null&&(ot=1,Kc(e,Ca(t,e.current)))}function Cw(){var e=Dt.current;return e===null?!0:(be&4194048)===be?Ut===null:(be&62914560)===be||(be&536870912)!==0?e===Ut:!1}function zw(){var e=te.H;return te.H=Zc,e===null?Zc:e}function Aw(){var e=te.A;return te.A=i5,e}function nu(){ot=4,ai||(be&4194048)!==be&&Dt.current!==null||(zr=!0),(yi&134217727)===0&&(Yi&134217727)===0||Be===null||ni(Be,be,ua,!1)}function rh(e,t,a){var i=Se;Se|=2;var o=zw(),s=Aw();(Be!==e||be!==t)&&(au=null,vr(e,t)),t=!1;var c=ot;e:do try{if(Re!==0&&fe!==null){var u=fe,h=ra;switch(Re){case 8:mp(),c=6;break e;case 3:case 2:case 9:case 6:Dt.current===null&&(t=!0);var g=Re;if(Re=0,ra=null,tr(e,u,h,g),a&&zr){c=0;break e}break;default:g=Re,Re=0,ra=null,tr(e,u,h,g)}}s5(),c=ot;break}catch($){Ew(e,$)}while(!0);return t&&e.shellSuspendCounter++,En=io=null,Se=i,te.H=o,te.A=s,fe===null&&(Be=null,be=0,mu()),c}function s5(){for(;fe!==null;)Rw(fe)}function l5(e,t){var a=Se;Se|=2;var i=zw(),o=Aw();Be!==e||be!==t?(au=null,tu=da()+500,vr(e,t)):zr=Ks(e,t);e:do try{if(Re!==0&&fe!==null){t=fe;var s=ra;t:switch(Re){case 1:Re=0,ra=null,tr(e,t,s,1);break;case 2:case 9:if(ob(s)){Re=0,ra=null,Vb(t);break}t=function(){Re!==2&&Re!==9||Be!==e||(Re=7),bn(e)},s.then(t,t);break e;case 3:Re=7;break e;case 4:Re=5;break e;case 7:ob(s)?(Re=0,ra=null,Vb(t)):(Re=0,ra=null,tr(e,t,s,7));break;case 5:var c=null;switch(fe.tag){case 26:c=fe.memoizedState;case 5:case 27:var u=fe;if(c?a0(c):u.stateNode.complete){Re=0,ra=null;var h=u.sibling;if(h!==null)fe=h;else{var g=u.return;g!==null?(fe=g,Su(g)):fe=null}break t}}Re=0,ra=null,tr(e,t,s,5);break;case 6:Re=0,ra=null,tr(e,t,s,6);break;case 8:mp(),ot=6;break e;default:throw Error(M(462))}}c5();break}catch($){Ew(e,$)}while(!0);return En=io=null,te.H=i,te.A=o,Se=a,fe!==null?0:(Be=null,be=0,mu(),ot)}function c5(){for(;fe!==null&&!Tx();)Rw(fe)}function Rw(e){var t=Wy(e.alternate,e,Dn);e.memoizedProps=e.pendingProps,t===null?Su(e):fe=t}function Vb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=xb(a,t,t.pendingProps,t.type,void 0,be);break;case 11:t=xb(a,t,t.pendingProps,t.type.render,t.ref,be);break;case 5:Jm(t);var i=t;i===Nt&&(me?(Bc(i),i.tag===5&&i.stateNode!=null&&(Xe=i.stateNode)):(Bc(i),me=!0));default:ew(a,t),t=fe=ty(t,Dn),t=Wy(a,t,Dn)}e.memoizedProps=e.pendingProps,t===null?Su(e):fe=t}function tr(e,t,a,i){En=io=null,Jm(t),rr=null,Is=0;var o=t.return;try{if(JN(e,o,t,a,be)){ot=1,Kc(e,Ca(a,e.current)),fe=null;return}}catch(s){if(o!==null)throw fe=o,s;ot=1,Kc(e,Ca(a,e.current)),fe=null;return}t.flags&32768?(me||i===1?e=!0:zr||(be&536870912)!==0?e=!1:(ai=e=!0,(i===2||i===9||i===3||i===6)&&(i=Dt.current,i!==null&&i.tag===13&&(i.flags|=16384))),Mw(t,e)):Su(t)}function Su(e){var t=e;do{if((t.flags&32768)!==0){Mw(t,ai);return}e=t.return;var a=e5(t.alternate,t,Dn);if(a!==null){fe=a;return}if(t=t.sibling,t!==null){fe=t;return}fe=t=e}while(t!==null);ot===0&&(ot=5)}function Mw(e,t){do{var a=t5(e.alternate,e);if(a!==null){a.flags&=32767,fe=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){fe=e;return}fe=e=a}while(e!==null);ot=6,fe=null}function Db(e,t,a,i,o,s,c,u,h,g,$,x){e.cancelPendingCommit=null;do ku();while(at!==0);if((Se&6)!==0)throw Error(M(327));if(t!==null){if(t===e.current)throw Error(M(177));e===Be&&(fe=Be=null,be=0),Wi=t,Xa=e,pn=a,lm=o,Sw=i,u5(e,t,a,c,u,h,x)}}function u5(e,t,a,i,o,s,c){var u=t.lanes|t.childLanes;if(sm=u,u|=_m,_x(e,a,u,i,o,s),ur=null,(a&335544064)===a?(dr=HN(e),i=10262):(dr=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,f5(_c,function(){return hm(),null})):(e.callbackNode=null,e.callbackPriority=0),Fc=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=te.T,te.T=null,o=ke.p,ke.p=2,s=Se,Se|=4;try{a5(e,t,a)}finally{Se=s,ke.p=o,te.T=i}}at=1,Fc?cr=V5(c,e.containerInfo,dr,cm,um,h5,dm,hm,d5,null,null):(cm(),um(),dm())}function d5(e){if(at!==0){var t=Xa.onRecoverableError;t(e,{componentStack:null})}}function h5(){at===3&&(at=0,bw(Wi,Xa),at=4)}function cm(){if(at===1){at=0;var e=Xa,t=Wi,a=pn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=te.T,te.T=null;var o=ke.p;ke.p=2;var s=Se;Se|=4;try{bs=Wc=!1,gw(t,e,a),a=fm;var c=Qv(e.containerInfo),u=a.focusedElem,h=a.selectionRange;if(c!==u&&u&&u.ownerDocument&&Xv(u.ownerDocument.documentElement,u)){if(h!==null&&Dm(u)){var g=h.start,$=h.end;if($===void 0&&($=g),"selectionStart"in u)u.selectionStart=g,u.selectionEnd=Math.min($,u.value.length);else{var x=u.ownerDocument||document,p=x&&x.defaultView||window;if(p.getSelection){var b=p.getSelection(),C=u.textContent.length,T=Math.min(h.start,C),R=h.end===void 0?T:Math.min(h.end,C);!b.extend&&T>R&&(c=R,R=T,T=c);var w=Pf(u,T),y=Pf(u,R);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),T>R?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=u;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<x.length;u++){var S=x[u];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}Nr=!!gm,fm=gm=null}finally{Se=s,ke.p=o,te.T=i}}e.current=t,at=2}}function um(){if(at===2){at=0;var e=Xa,t=Wi,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=te.T,te.T=null;var i=ke.p;ke.p=2;var o=Se;Se|=4;try{cw(e,t.alternate,t)}finally{Se=o,ke.p=i,te.T=a}}at=3}}function dm(){if(at===4||at===3){at=0;var e=cr;cr=null,Ex();var t=Xa,a=Wi,i=pn,o=Sw,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?at=5:(at=0,Wi=Xa=null,Ow(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(di=null),zm(i),a=a.stateNode,ha&&typeof ha.onCommitFiberRoot=="function")try{ha.onCommitFiberRoot(Zs,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=te.T,s=ke.p,ke.p=2,te.T=null;try{for(var c=t.onRecoverableError,u=0;u<o.length;u++){var h=o[u];c(h.value,{componentStack:h.stack})}}finally{te.T=a,ke.p=s}}if(o=ur,c=dr,dr=null,o!==null&&(ur=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(pn&3)!==0&&ku(),bn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===Ec?As++:(As=0,Ec=t):(As=0,Ec=null),al(0,!1)}}function Ow(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Ws(t)))}function ku(){return cr!==null&&(cr.skipTransition(),cr=null),cm(),um(),dm(),hm()}function hm(){if(at!==5)return!1;var e=Xa,t=sm;sm=0;var a=zm(pn),i=te.T,o=ke.p;try{ke.p=32>a?32:a,te.T=null,a=lm,lm=null;var s=Xa,c=pn;if(at=0,Wi=Xa=null,pn=0,(Se&6)!==0)throw Error(M(331));var u=Se;if(Se|=4,$w(s.current),vw(s,s.current,c,a),Se=u,al(0,!1),ha&&typeof ha.onPostCommitFiberRoot=="function")try{ha.onPostCommitFiberRoot(Zs,s)}catch{}return!0}finally{ke.p=o,te.T=i,Ow(e,t)}}function _b(e,t,a){t=Ca(a,t),t=Yh(e.stateNode,t,2),e=li(e,t,2),e!==null&&(Js(e,2),bn(e))}function Oe(e,t,a){if(e.tag===3)_b(e,e,a);else for(;t!==null;){if(t.tag===3){_b(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(di===null||!di.has(i))){e=Ca(a,e),a=Zy(2),i=li(t,a,2),i!==null&&(Ky(a,i,t,e),Js(i,2),bn(i));break}}t=t.return}}function sh(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new o5;var o=new Set;i.set(t,o)}else o=i.get(t),o===void 0&&(o=new Set,i.set(t,o));o.has(a)||(hp=!0,o.add(a),e=m5.bind(null,e,t,a),t.then(e,e))}function m5(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Be===e&&(be&a)===a&&((ot===4||ot===3&&(be&62914560)===be&&300>da()-xu)&&(Se&2)===0?vr(e,0):eu|=a,fr===be&&(fr=0)),bn(e)}function Vw(e,t){t===0&&(t=Sv()),e=no(e,t),e!==null&&(Js(e,t),bn(e))}function p5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Vw(e,a)}function g5(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(M(314))}i!==null&&i.delete(t),Vw(e,a)}function f5(e,t){return Em(e,t)}var yr=null,jo=null,mm=!1,iu=!1,lh=!1,ii=0;function bn(e){e!==jo&&e.next===null&&(jo===null?yr=jo=e:jo=jo.next=e),iu=!0,mm||(mm=!0,v5())}function al(e,t){if(!lh&&iu){lh=!0;do for(var a=!1,i=yr;i!==null;){if(!t)if(e!==0){var o=i.pendingLanes;if(o===0)var s=0;else{var c=i.suspendedLanes,u=i.pingedLanes;s=(1<<31-ma(42|e)+1)-1,s&=o&~(c&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Ib(i,s))}else s=be,s=lu(i,i===Be?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||Ks(i,s)||(a=!0,Ib(i,s));i=i.next}while(a);lh=!1}}function b5(){Dw()}function Dw(){iu=mm=!1;var e=0;ii!==0&&E5()&&(e=ii);for(var t=da(),a=null,i=yr;i!==null;){var o=i.next,s=_w(i,t);s===0?(i.next=null,a===null?yr=o:a.next=o,o===null&&(jo=a)):(a=i,(e!==0||(s&3)!==0)&&(iu=!0)),i=o}at!==0&&at!==5||al(e,!1),ii!==0&&(ii=0)}function _w(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,o=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-ma(s),u=1<<c,h=o[c];h===-1?((u&a)===0||(u&i)!==0)&&(o[c]=Dx(u,t)):h<=t&&(e.expiredLanes|=u),s&=~u}if(t=Be,a=be,a=lu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(Re===2||Re===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&qd(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Ks(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&qd(i),zm(a)){case 2:case 8:a=$v;break;case 32:a=_c;break;case 268435456:a=xv;break;default:a=_c}return i=Iw.bind(null,e),a=Em(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&qd(i),e.callbackPriority=2,e.callbackNode=null,2}function Iw(e,t){if(at!==0&&at!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(ku()&&e.callbackNode!==a)return null;var i=be;return i=lu(e,e===Be?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Tw(e,i,t),_w(e,da()),e.callbackNode!=null&&e.callbackNode===a?Iw.bind(null,e):null)}function Ib(e,t){if(ku())return null;Tw(e,t,!0)}function v5(){z5(function(){(Se&6)!==0?Em(wv,b5):Dw()})}function pp(){if(ii===0){var e=Ki;e===0&&(e=Zl,Zl<<=1,(Zl&261888)===0&&(Zl=256)),ii=e}return ii}function Hb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:gc(e)}function y5(e,t,a,i,o){if(t==="submit"&&a&&a.stateNode===o){var s=Hb((o[na]||null).action),c=i.submitter;c&&(t=(t=c[na]||null)?Hb(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var u=new uu("action","action",null,i,o);e.push({event:u,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(ii!==0){var h=new FormData(o,c);jh(a,{pending:!0,data:h,method:o.method,action:s},null,h)}}else typeof s=="function"&&(u.preventDefault(),h=new FormData(o,c),jh(a,{pending:!0,data:h,method:o.method,action:s},s,h))},currentTarget:o}]})}}for(cc=0;cc<Mh.length;cc++)uc=Mh[cc],Ub=uc.toLowerCase(),qb=uc[0].toUpperCase()+uc.slice(1),Qa(Ub,"on"+qb);var uc,Ub,qb,cc;Qa(Kv,"onAnimationEnd");Qa(Jv,"onAnimationIteration");Qa(Pv,"onAnimationStart");Qa("dblclick","onDoubleClick");Qa("focusin","onFocus");Qa("focusout","onBlur");Qa(AN,"onTransitionRun");Qa(RN,"onTransitionStart");Qa(MN,"onTransitionCancel");Qa(Fv,"onTransitionEnd");mr("onMouseEnter",["mouseout","mouseover"]);mr("onMouseLeave",["mouseout","mouseover"]);mr("onPointerEnter",["pointerout","pointerover"]);mr("onPointerLeave",["pointerout","pointerover"]);to("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));to("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));to("onBeforeInput",["compositionend","keypress","textInput","paste"]);to("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));to("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));to("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var qs="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),w5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(qs));function Hw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],o=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var u=i[c],h=u.instance,g=u.currentTarget;if(u=u.listener,h!==s&&o.isPropagationStopped())break e;s=u,o.currentTarget=g;try{s(o)}catch($){Hc($)}o.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(u=i[c],h=u.instance,g=u.currentTarget,u=u.listener,h!==s&&o.isPropagationStopped())break e;s=u,o.currentTarget=g;try{s(o)}catch($){Hc($)}o.currentTarget=null,s=h}}}}function ge(e,t){var a=t[Vf];a===void 0&&(a=t[Vf]=new Set);var i=e+"__bubble";a.has(i)||(Uw(t,e,2,!1),a.add(i))}function ch(e,t,a){var i=0;t&&(i|=4),Uw(a,e,i,t)}var dc="_reactListening"+Math.random().toString(36).slice(2);function gp(e){if(!e[dc]){e[dc]=!0,Av.forEach(function(a){a!=="selectionchange"&&(w5.has(a)||ch(a,!1,e),ch(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[dc]||(t[dc]=!0,ch("selectionchange",!1,t))}}function Uw(e,t,a,i){switch(c0(t)){case 2:var o=hS;break;case 8:o=mS;break;default:o=xp}a=o.bind(null,t,a,e),o=void 0,!Ch||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),i?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function uh(e,t,a,i,o){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var u=i.stateNode.containerInfo;if(u===o)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;u!==null;){if(c=Ui(u),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}u=u.parentNode}}i=i.return}Hv(function(){var g=s,$=Rm(a),x=[];e:{var p=Wv.get(e);if(p!==void 0){var b=uu,C=e;switch(e){case"keypress":if(bc(a)===0)break e;case"keydown":case"keyup":b=rN;break;case"focusin":C="focus",b=Xd;break;case"focusout":C="blur",b=Xd;break;case"beforeblur":case"afterblur":b=Xd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=Lf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=Zx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=dN;break;case Kv:case Jv:case Pv:b=Px;break;case Fv:b=mN;break;case"scroll":case"scrollend":b=Xx;break;case"wheel":b=gN;break;case"copy":case"cut":case"paste":b=Wx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=Gf;break;case"submit":b=cN;break;case"toggle":case"beforetoggle":b=bN}var T=(t&4)!==0,R=!T&&(e==="scroll"||e==="scrollend"),w=T?p!==null?p+"Capture":null:p;T=[];for(var y=g,v;y!==null;){var S=y;if(v=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||v===null||w===null||(S=Ms(y,w),S!=null&&T.push(Bs(y,S,v))),R)break;y=y.return}0<T.length&&(p=new b(p,C,null,a,$),x.push({event:p,listeners:T}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",p=e==="mouseout"||e==="pointerout",b&&a!==Eh&&(C=a.relatedTarget||a.fromElement)&&(Ui(C)||C[kr]))break e;(p||b)&&(C=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,p?(b=a.relatedTarget||a.toElement,p=g,b=b?Ui(b):null,b!==null&&(R=Qs(b),T=b.tag,b!==R||T!==5&&T!==27&&T!==6)&&(b=null)):(p=null,b=g),p!==b&&(T=Lf,S="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(T=Gf,S="onPointerLeave",w="onPointerEnter",y="pointer"),R=p==null?C:gs(p),v=b==null?C:gs(b),C=new T(S,y+"leave",p,a,$),C.target=R,C.relatedTarget=v,S=null,Ui($)===g&&(T=new T(w,y+"enter",b,a,$),T.target=v,T.relatedTarget=R,S=T),R=S,T=p&&b?gh(p,b,$5):null,p!==null&&Bb(x,C,p,T,!1),b!==null&&R!==null&&Bb(x,R,b,T,!0)))}e:{if(p=g?gs(g):window,b=p.nodeName&&p.nodeName.toLowerCase(),b==="select"||b==="input"&&p.type==="file")var O=Zf;else if(Qf(p))if(Gv)O=EN;else{O=kN;var W=SN}else b=p.nodeName,!b||b.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?g&&Am(g.elementType)&&(O=Zf):O=TN;if(O&&(O=O(e,g))){jv(x,O,a,$);break e}W&&W(e,p,g)}switch(W=g?gs(g):window,e){case"focusin":(Qf(W)||W.contentEditable==="true")&&(Ko=W,Ah=g,ws=null);break;case"focusout":ws=Ah=Ko=null;break;case"mousedown":Rh=!0;break;case"contextmenu":case"mouseup":case"dragend":Rh=!1,Ff(x,a,$);break;case"selectionchange":if(zN)break;case"keydown":case"keyup":Ff(x,a,$)}var U;if(Vm)e:{switch(e){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else Zo?Bv(e,a)&&(L="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(L="onCompositionStart");L&&(qv&&a.locale!=="ko"&&(Zo||L!=="onCompositionStart"?L==="onCompositionEnd"&&Zo&&(U=Uv()):(ei=$,Mm="value"in ei?ei.value:ei.textContent,Zo=!0)),W=ou(g,L),0<W.length&&(L=new jf(L,e,null,a,$),x.push({event:L,listeners:W}),U?L.data=U:(U=Lv(a),U!==null&&(L.data=U)))),(U=yN?wN(e,a):$N(e,a))&&(L=ou(g,"onBeforeInput"),0<L.length&&(W=new jf("onBeforeInput","beforeinput",null,a,$),x.push({event:W,listeners:L}),W.data=U)),y5(x,e,g,a,$)}Hw(x,t)})}function Bs(e,t,a){return{instance:e,listener:t,currentTarget:a}}function ou(e,t){for(var a=t+"Capture",i=[];e!==null;){var o=e,s=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||s===null||(o=Ms(e,a),o!=null&&i.unshift(Bs(e,o,s)),o=Ms(e,t),o!=null&&i.push(Bs(e,o,s))),e.tag===3)return i;e=e.return}return[]}function $5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Bb(e,t,a,i,o){for(var s=t._reactName,c=[];a!==null&&a!==i;){var u=a,h=u.alternate,g=u.stateNode;if(u=u.tag,h!==null&&h===i)break;u!==5&&u!==26&&u!==27||g===null||(h=g,o?(g=Ms(a,s),g!=null&&c.unshift(Bs(a,g,h))):o||(g=Ms(a,s),g!=null&&c.push(Bs(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var x5=/\r\n?/g,N5=/\u0000|\uFFFD/g;function Lb(e){return(typeof e=="string"?e:""+e).replace(x5,`
`).replace(N5,"")}function qw(e,t){return t=Lb(t),Lb(e)===t}function Me(e,t,a,i,o,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||pr(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&pr(e,""+i);else return;break;case"className":Pl(e,"class",i);break;case"tabIndex":Pl(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":Pl(e,a,i);break;case"style":Iv(e,i,s);return;case"data":if(t!=="object"){Pl(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=gc(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&Me(e,t,"name",o.name,o,null),Me(e,t,"formEncType",o.formEncType,o,null),Me(e,t,"formMethod",o.formMethod,o,null),Me(e,t,"formTarget",o.formTarget,o,null)):(Me(e,t,"encType",o.encType,o,null),Me(e,t,"method",o.method,o,null),Me(e,t,"target",o.target,o,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=gc(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=un);return;case"onScroll":i!=null&&ge("scroll",e);return;case"onScrollEnd":i!=null&&ge("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(M(61));if(a=i.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=gc(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":ge("beforetoggle",e),ge("toggle",e),pc(e,"popover",i);break;case"xlinkActuate":Sn(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Sn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Sn(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Sn(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Sn(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Sn(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Sn(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Sn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Sn(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":pc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=Gx.get(a)||a,pc(e,a,i);else return}Ne=!0}function pm(e,t,a,i,o,s){switch(a){case"style":Iv(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(M(61));if(a=i.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")pr(e,i);else if(typeof i=="number"||typeof i=="bigint")pr(e,""+i);else return;break;case"onScroll":i!=null&&ge("scroll",e);return;case"onScrollEnd":i!=null&&ge("scrollend",e);return;case"onClick":i!=null&&(e.onclick=un);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Rv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),s=a.slice(2,o?a.length-7:void 0),t=e[na]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,o),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,o);break e}Ne=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):pc(e,a,i)}return}Ne=!0}function Vt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ge("error",e),ge("load",e);var i=!1,o=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Me(e,t,s,c,a,null)}}o&&Me(e,t,"srcSet",a.srcSet,a,null),i&&Me(e,t,"src",a.src,a,null);return;case"input":ge("invalid",e);var u=s=c=o=null,h=null,g=null;for(i in a)if(a.hasOwnProperty(i)){var $=a[i];if($!=null)switch(i){case"name":o=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":g=$;break;case"value":s=$;break;case"defaultValue":u=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(M(137,t));break;default:Me(e,t,i,$,a,null)}}Vv(e,s,u,h,g,c,o,!1);return;case"select":ge("invalid",e),i=c=s=null;for(o in a)if(a.hasOwnProperty(o)&&(u=a[o],u!=null))switch(o){case"value":s=u;break;case"defaultValue":c=u;break;case"multiple":i=u;default:Me(e,t,o,u,a,null)}t=s,a=c,e.multiple=!!i,t!=null?nr(e,!!i,t,!1):a!=null&&nr(e,!!i,a,!0);return;case"textarea":ge("invalid",e),s=o=i=null;for(c in a)if(a.hasOwnProperty(c)&&(u=a[c],u!=null))switch(c){case"value":i=u;break;case"defaultValue":o=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(M(91));break;default:Me(e,t,c,u,a,null)}_v(e,i,o,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Me(e,t,h,i,a,null));return;case"dialog":ge("beforetoggle",e),ge("toggle",e),ge("cancel",e),ge("close",e);break;case"iframe":case"object":ge("load",e);break;case"video":case"audio":for(i=0;i<qs.length;i++)ge(qs[i],e);break;case"image":ge("error",e),ge("load",e);break;case"details":ge("toggle",e);break;case"embed":case"source":case"link":ge("error",e),ge("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(i=a[g],i!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Me(e,t,g,i,a,null)}return;default:if(Am(t)){for($ in a)a.hasOwnProperty($)&&(i=a[$],i!==void 0&&pm(e,t,$,i,a,void 0));return}}for(u in a)a.hasOwnProperty(u)&&(i=a[u],i!=null&&Me(e,t,u,i,a,null))}var S5={};function k5(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,s=null,c=null,u=null,h=null,g=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:i.hasOwnProperty(b)||Me(e,t,b,null,i,x)}}for(var p in i){var b=i[p];if(x=a[p],i.hasOwnProperty(p)&&(b!=null||x!=null))switch(p){case"type":b!==x&&(Ne=!0),s=b;break;case"name":b!==x&&(Ne=!0),o=b;break;case"checked":b!==x&&(Ne=!0),g=b;break;case"defaultChecked":b!==x&&(Ne=!0),$=b;break;case"value":b!==x&&(Ne=!0),c=b;break;case"defaultValue":b!==x&&(Ne=!0),u=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(M(137,t));break;default:b!==x&&Me(e,t,p,b,i,x)}}Th(e,c,u,h,g,$,s,o);return;case"select":b=c=u=p=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":b=h;default:i.hasOwnProperty(s)||Me(e,t,s,null,i,h)}for(o in i)if(s=i[o],h=a[o],i.hasOwnProperty(o)&&(s!=null||h!=null))switch(o){case"value":s!==h&&(Ne=!0),p=s;break;case"defaultValue":s!==h&&(Ne=!0),u=s;break;case"multiple":s!==h&&(Ne=!0),c=s;default:s!==h&&Me(e,t,o,s,i,h)}t=u,a=c,i=b,p!=null?nr(e,!!a,p,!1):!!i!=!!a&&(t!=null?nr(e,!!a,t,!0):nr(e,!!a,a?[]:"",!1));return;case"textarea":b=p=null;for(u in a)if(o=a[u],a.hasOwnProperty(u)&&o!=null&&!i.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Me(e,t,u,null,i,o)}for(c in i)if(o=i[c],s=a[c],i.hasOwnProperty(c)&&(o!=null||s!=null))switch(c){case"value":o!==s&&(Ne=!0),p=o;break;case"defaultValue":o!==s&&(Ne=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(M(91));break;default:o!==s&&Me(e,t,c,o,i,s)}Dv(e,p,b);return;case"option":for(var C in a)p=a[C],a.hasOwnProperty(C)&&p!=null&&!i.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Me(e,t,C,null,i,p));for(h in i)p=i[h],b=a[h],i.hasOwnProperty(h)&&p!==b&&(p!=null||b!=null)&&(h==="selected"?(p!==b&&(Ne=!0),e.selected=p&&typeof p!="function"&&typeof p!="symbol"):Me(e,t,h,p,i,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var T in a)p=a[T],a.hasOwnProperty(T)&&p!=null&&!i.hasOwnProperty(T)&&Me(e,t,T,null,i,p);for(g in i)if(p=i[g],b=a[g],i.hasOwnProperty(g)&&p!==b&&(p!=null||b!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(M(137,t));break;default:Me(e,t,g,p,i,b)}return;default:if(Am(t)){for(var R in a)p=a[R],a.hasOwnProperty(R)&&p!==void 0&&!i.hasOwnProperty(R)&&pm(e,t,R,void 0,i,p);for($ in i)p=i[$],b=a[$],!i.hasOwnProperty($)||p===b||p===void 0&&b===void 0||pm(e,t,$,p,i,b);return}}for(var w in a)p=a[w],a.hasOwnProperty(w)&&p!=null&&!i.hasOwnProperty(w)&&Me(e,t,w,null,i,p);for(x in i)p=i[x],b=a[x],!i.hasOwnProperty(x)||p===b||p==null&&b==null||Me(e,t,x,p,i,b)}function jb(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function T5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var o=a[i],s=o.transferSize,c=o.initiatorType,u=o.duration;if(s&&u&&jb(c)){for(c=0,u=o.responseEnd,i+=1;i<a.length;i++){var h=a[i],g=h.startTime;if(g>u)break;var $=h.transferSize,x=h.initiatorType;$&&jb(x)&&(h=h.responseEnd,c+=$*(h<u?1:(u-g)/(h-g)))}if(--i,t+=8*(s+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var gm=null,fm=null;function Ls(e){return e.nodeType===9?e:e.ownerDocument}function Gb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Bw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Lw(e,t,a,i){return a=Ls(a).createElement(e),a[At]=i,a[na]=t,Vt(a,e,t),xt(a),a}function bm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var dh=null;function E5(){var e=window.event;return e&&e.type==="popstate"?e===dh?!1:(dh=e,!0):(dh=null,!1)}var fp=typeof setTimeout=="function"?setTimeout:void 0,C5=typeof clearTimeout=="function"?clearTimeout:void 0,Yb=typeof Promise=="function"?Promise:void 0,Xb=typeof requestAnimationFrame=="function"?requestAnimationFrame:fp,z5=typeof queueMicrotask=="function"?queueMicrotask:typeof Yb<"u"?function(e){return Yb.resolve(null).then(e).catch(A5)}:fp;function A5(e){setTimeout(function(){throw e})}function $i(e){return e==="head"}function Qb(e,t){var a=t,i=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(o),Sr(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")mh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,mh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,u=s.nodeName;s[Ps]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&mh(e.ownerDocument.body);a=o}while(a);Sr(t)}function Zb(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function jw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var o=i=0;o<t.length;o++){var s=t[o];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Gw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Yw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function vm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Yw(t,a,e)}function R5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Yw(t,a,e)}function M5(e){return e.documentElement.clientHeight}function O5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function V5(e,t,a,i,o,s,c,u,h){var g=t.nodeType===9?t:t.ownerDocument;try{var $=g.startViewTransition({update:function(){var p=g.defaultView,b=p.navigation&&p.navigation.transition,C=g.fonts.status;i();var T=[];if(C==="loaded"&&(M5(g),g.fonts.status==="loading"&&T.push(g.fonts.ready)),C=T.length,e!==null)for(var R=e.suspenseyImages,w=0,y=0;y<R.length;y++){var v=R[y];if(!v.complete){var S=v.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<p.innerHeight&&S.left<p.innerWidth){if(w+=n0(v),w>Ac){T.length=C;break}v=new Promise(O5.bind(v)),T.push(v)}}}if(0<T.length)return p=Promise.race([Promise.all(T),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),(b?Promise.allSettled([b.finished,p]):p).then(s,s);if(o(),b)return b.finished.then(s,s);s()},types:a});g.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var p=g.documentElement.getAnimations({subtree:!0}),b=0;b<p.length;b++){var C=p[b],T=C.effect,R=T.pseudoElement;if(R!=null&&R.startsWith("::view-transition")){x.push(C),C=T.getKeyframes();for(var w=R=void 0,y=!0,v=0;v<C.length;v++){var S=C[v],O=S.width;if(R===void 0)R=O;else if(R!==O){y=!1;break}if(O=S.height,w===void 0)w=O;else if(w!==O){y=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}y&&R!==void 0&&w!==void 0&&(T.setKeyframes(C),y=getComputedStyle(T.target,T.pseudoElement),y.width!==R||y.height!==w)&&(y=C[0],y.width=R,y.height=w,y=C[C.length-1],y.width=R,y.height=w,T.setKeyframes(C))}}c()},function(p){g.__reactViewTransition===$&&(g.__reactViewTransition=null);try{typeof p=="object"&&p!==null&&p.name==="InvalidStateError"&&(p.message==="View transition was skipped because document visibility state is hidden."||p.message==="Skipping view transition because document visibility state has become hidden."||p.message==="Skipping view transition because viewport size changed."||p.message==="Transition was aborted because of invalid state")&&(p=null),p!==null&&h(p)}finally{i(),o(),c()}}),$.finished.finally(function(){for(var p=0;p<x.length;p++)x[p].cancel();g.__reactViewTransition===$&&(g.__reactViewTransition=null),u()}),$}catch{return i(),o(),c(),null}}function qi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}qi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Le({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};qi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],o=0;o<a.length;o++){var s=a[o].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[o])}return i};qi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Xw(e){return{name:e,group:new qi("group",e),imagePair:new qi("image-pair",e),old:new qi("old",e),new:new qi("new",e)}}function fa(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}fa.prototype.addEventListener=function(e,t,a){var i=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(Qw(s,e,t,a)===-1){var c=this,u=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(u=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(o=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",o,{once:!0}),o=i.removeEventListener.bind(i,"abort",o)),i=wr(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:u,cleanup:o}),aa(this._fragmentFiber.child,!1,D5,e,u,i)}this._eventListeners=s}};function D5(e,t,a,i){return ft(e).addEventListener(t,a,i),!1}fa.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=Qw(i,e,t,a),t!==-1)){var o=i[t];a=o.attachedListener;var s=o.cleanup;o=wr(o.optionsOrUseCapture),aa(this._fragmentFiber.child,!1,_5,e,a,o),i.splice(t,1),s!==null&&s()}};function _5(e,t,a,i){return ft(e).removeEventListener(t,a,i),!1}function wr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Kb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Qw(e,t,a,i){if(e.length===0)return-1;i=Kb(i);for(var o=0;o<e.length;o++){var s=e[o];if(s.type===t&&s.listener===a&&Kb(s.optionsOrUseCapture)===i)return o}return-1}fa.prototype.dispatchEvent=function(e){var t=eo(this._fragmentFiber);if(t===null)return!0;t=ft(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var s=a[o];i.addEventListener(s.type,s.attachedListener,wr(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(o=0;o<a.length;o++)s=a[o],i.removeEventListener(s.type,s.attachedListener,wr(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};fa.prototype.focus=function(e){aa(this._fragmentFiber.child,!0,Zw,e,void 0,void 0)};function Zw(e,t){return e.tag===6?!1:(e=ft(e),Z5(e,t))}fa.prototype.focusLast=function(e){var t=[];aa(this._fragmentFiber.child,!0,bp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Zw(t[a],e);a--);};function bp(e,t){return t.push(e),!1}fa.prototype.blur=function(){var e=eo(this._fragmentFiber);e!==null&&(e=ft(e),e=Ls(e).activeElement,e!==null&&aa(this._fragmentFiber.child,!1,I5,e,void 0,void 0))};function I5(e,t){return e.tag===6?!1:(e=ft(e),e===t||e.contains(t)?(t.blur(),!0):!1)}fa.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),aa(this._fragmentFiber.child,!1,H5,e,void 0,void 0)};function H5(e,t){return e.tag===6||(e=ft(e),t.observe(e)),!1}fa.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),aa(this._fragmentFiber.child,!1,U5,e,void 0,void 0);for(var a=t=0;a<Ya.length;a++){var i=Ya[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):Ya[t++]=i}Ya.length=t}};function U5(e,t){return e.tag===6||(e=ft(e),t.unobserve(e)),!1}var Ya=[],hh=!1;function q5(e,t,a){Ya.push({fragmentInstance:e,observer:t,instance:a}),hh||(hh=!0,K5(function(){hh=!1;var i=Ya;Ya=[];for(var o=0;o<i.length;o++){var s=i[o];s.observer.unobserve(s.instance)}}))}fa.prototype.getClientRects=function(){var e=[];return aa(this._fragmentFiber.child,!1,B5,e,void 0,void 0),e};function B5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=ft(e),t.push.apply(t,e.getClientRects());return!1}fa.prototype.getRootNode=function(e){var t=eo(this._fragmentFiber);return t===null?this:ft(t).getRootNode(e)};fa.prototype.compareDocumentPosition=function(e){var t=eo(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];aa(this._fragmentFiber.child,!1,bp,a,void 0,void 0);var i=ft(t);if(a.length===0){if(a=i,Cf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=i=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=fv(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=ft(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=ft(a[0]),o=ft(a[a.length-1]);var s=Cf(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),u=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||u&Node.DOCUMENT_POSITION_CONTAINED_BY;return u=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&u&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&o===e||h||u?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||L5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function L5(e,t,a,i,o){var s=Ui(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=o.ownerDocument,o===s||o===s.documentElement||o===s.body;e:{for(s=t,t=eo(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=gh(a,s,zf),t===null?t=!1:(aa(t,!0,vx,s,a),s=Go,Go=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=gh(i,s,zf),t===null?t=!1:(aa(t,!0,yx,s,i),s=Go,ph=Go=null,t=s!==null)),t):!1}function Jb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}fa.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(M(566));var t=[];aa(this._fragmentFiber.child,!1,bp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=fv(this._fragmentFiber);if(i=a?i[1]||i[0]||eo(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=ft(i),Jb(e,a);return}if(i=ft(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var o=t[i];o.tag===6?(o=ft(o),Jb(o,a)):ft(o).scrollIntoView(e),i+=a?-1:1}};function j5(e,t){return e=ft(e),Kw(e,t),!1}function Kw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function Jw(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var o=a[i];e.addEventListener(o.type,o.attachedListener,wr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,u=0;u<Ya.length;u++){var h=Ya[u];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(Ya[c++]=h)}Ya.length=c,s.observe(e)}),Kw(e,t))}function G5(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var o=a[i];e.removeEventListener(o.type,o.attachedListener,wr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?q5(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function ym(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":ym(a),cu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function Y5(e,t,a,i){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Ps])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=Aa(e.nextSibling),e===null)break}return null}function X5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Aa(e.nextSibling),e===null))return null;return e}function Pw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Aa(e.nextSibling),e===null))return null;return e}function wm(e){return e.data==="$?"||e.data==="$~"}function vp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function Q5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Aa(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var $m=null;function Pb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Aa(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Fb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function Z5(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function K5(e){Xb(function(){Xb(function(t){return e(t)})})}function Fw(e,t,a){switch(t=Ls(a),e){case"html":if(e=t.documentElement,!e)throw Error(M(452));return e;case"head":if(e=t.head,!e)throw Error(M(453));return e;case"body":if(e=t.body,!e)throw Error(M(454));return e;default:throw Error(M(451))}}function Ww(e,t,a){for(var i in a){var o=a[i];a.hasOwnProperty(i)&&o!=null&&Me(e,t,i,null,S5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===un&&(e.onclick=null),cu(e)}function mh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);cu(e)}var Ra=new Map,Wb=new Set;function js(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Hn=ke.d;ke.d={f:J5,r:P5,D:F5,C:W5,L:eS,m:tS,X:nS,S:aS,M:iS};function J5(){var e=Hn.f(),t=Nu();return e||t}function P5(e){var t=Tr(e);t!==null&&t.tag===5&&t.type==="form"?Iy(t):Hn.r(e)}var Ar=typeof document>"u"?null:document;function e0(e,t,a){var i=Ar;if(i&&typeof t=="string"&&t){var o=Ea(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Wb.has(o)||(Wb.add(o),e={rel:e,crossOrigin:a,href:t},i.querySelector(o)===null&&(t=i.createElement("link"),Vt(t,"link",e),xt(t),i.head.appendChild(t)))}}function F5(e){Hn.D(e),e0("dns-prefetch",e,null)}function W5(e,t){Hn.C(e,t),e0("preconnect",e,t)}function eS(e,t,a){Hn.L(e,t,a);var i=Ar;if(i&&e&&t){var o='link[rel="preload"][as="'+Ea(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+Ea(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+Ea(a.imageSizes)+'"]')):o+='[href="'+Ea(e)+'"]';var s=o;switch(t){case"style":s=$r(e);break;case"script":s=Rr(e)}if(!(Ra.has(s)||(e=Le({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ra.set(s,e),i.querySelector(o)!==null||t==="style"&&i.querySelector(nl(s))||t==="script"&&i.querySelector(il(s))))){var c=i.createElement("link");Vt(c,"link",e),t==="style"&&(c[Ic]=!0,c.onload=c.onerror=function(){zv(c)}),xt(c),i.head.appendChild(c)}}}function tS(e,t){Hn.m(e,t);var a=Ar;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+Ea(i)+'"][href="'+Ea(e)+'"]',s=o;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Rr(e)}if(!Ra.has(s)&&(e=Le({rel:"modulepreload",href:e},t),Ra.set(s,e),a.querySelector(o)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(il(s)))return}i=a.createElement("link"),Vt(i,"link",e),xt(i),a.head.appendChild(i)}}}function aS(e,t,a){Hn.S(e,t,a);var i=Ar;if(i&&e){var o=ar(i).hoistableStyles,s=$r(e);t=t||"default";var c=o.get(s);if(!c){var u={loading:0,preload:null};if(c=i.querySelector(nl(s)))u.loading=5;else{e=Le({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ra.get(s))&&yp(e,a);var h=c=i.createElement("link");xt(h),Vt(h,"link",e),h._p=new Promise(function(g,$){h.onload=g,h.onerror=$}),h.addEventListener("load",function(){u.loading|=1}),h.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Cc(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:u},o.set(s,c)}}}function nS(e,t){Hn.X(e,t);var a=Ar;if(a&&e){var i=ar(a).hoistableScripts,o=Rr(e),s=i.get(o);s||(s=a.querySelector(il(o)),s||(e=Le({src:e,async:!0},t),(t=Ra.get(o))&&wp(e,t),s=a.createElement("script"),xt(s),Vt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(o,s))}}function iS(e,t){Hn.M(e,t);var a=Ar;if(a&&e){var i=ar(a).hoistableScripts,o=Rr(e),s=i.get(o);s||(s=a.querySelector(il(o)),s||(e=Le({src:e,async:!0,type:"module"},t),(t=Ra.get(o))&&wp(e,t),s=a.createElement("script"),xt(s),Vt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(o,s))}}function ev(e,t,a,i){var o=(o=oi.current)?js(o):null;if(!o)throw Error(M(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=$r(a.href),t=ar(o).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=$r(a.href);var s=ar(o).hoistableStyles,c=s.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=o.querySelector(nl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Ra.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ra.set(e,s)),oS(o,e,s,c.state))),t&&i===null)throw Error(M(528,""));return c}if(t&&i!==null)throw Error(M(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Rr(a),t=ar(o).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,e))}}function $r(e){return'href="'+Ea(e)+'"'}function nl(e){return'link[rel="stylesheet"]['+e+"]"}function t0(e){return Le({},e,{"data-precedence":e.precedence,precedence:null})}function oS(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Ic]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[Ic]=!0,t.onload=t.onerror=zv.bind(null,t),Vt(t,"link",a),xt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function Rr(e){return'[src="'+Ea(e)+'"]'}function il(e){return"script[async]"+e}function tv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+Ea(a.href)+'"]');if(i)return t.instance=i,xt(i),i;var o=Le({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),xt(i),Vt(i,"style",o),Cc(i,a.precedence,e),t.instance=i;case"stylesheet":o=$r(a.href);var s=e.querySelector(nl(o));if(s)return t.state.loading|=4,t.instance=s,xt(s),s;i=t0(a),(o=Ra.get(o))&&yp(i,o),s=(e.ownerDocument||e).createElement("link"),xt(s);var c=s;return c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),Vt(s,"link",i),t.state.loading|=4,Cc(s,a.precedence,e),t.instance=s;case"script":return s=Rr(a.src),(o=e.querySelector(il(s)))?(t.instance=o,xt(o),o):(i=a,(o=Ra.get(s))&&(i=Le({},a),wp(i,o)),e=e.ownerDocument||e,o=e.createElement("script"),xt(o),Vt(o,"link",i),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(M(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Cc(i,a.precedence,e));return t.instance}function Cc(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=i.length?i[i.length-1]:null,s=o,c=0;c<i.length;c++){var u=i[c];if(u.dataset.precedence===t)s=u;else if(s!==o)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function yp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function wp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var zc=null;function av(e,t,a){if(zc===null){var i=new Map,o=zc=new Map;o.set(a,i)}else o=zc,i=o.get(a),i||(i=new Map,o.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var s=a[o];if(!(s[Ps]||s[At]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var u=i.get(c);u?u.push(s):i.set(c,[s])}}return i}function xm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function rS(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function nv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function a0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function n0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function iv(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=n0(t),e.suspenseyImages.push(t)),e=cS.bind(e),t.decode().then(e,e))}function sS(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=$r(i.href),s=t.querySelector(nl(o));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Gs.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,xt(s);return}s=t.ownerDocument||t,i=t0(i),(o=Ra.get(o))&&yp(i,o),s=s.createElement("link"),xt(s);var c=s;c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),Vt(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Gs.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Ac=0;function lS(e,t){return e.stylesheets&&e.count===0&&Rc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&Rc(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&Ac===0&&(Ac=62500*T5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Rc(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>Ac?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(o)}}:null}function i0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Rc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Gs(){this.count--,i0(this)}function cS(){this.imgCount--,i0(this)}var ru=null;function Rc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ru=new Map,t.forEach(uS,e),ru=null,Gs.call(e))}function uS(e,t){if(!(t.state.loading&4)){var a=ru.get(e);if(a)var i=a.get(null);else{a=new Map,ru.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<o.length;s++){var c=o[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}o=t.instance,c=o.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,o),a.set(c,o),this.count++,i=Gs.bind(this),o.addEventListener("load",i),o.addEventListener("error",i),s?s.parentNode.insertBefore(o,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var xr={$$typeof:cn,Provider:null,Consumer:null,_currentValue:Bi,_currentValue2:Bi,_threadCount:0};function dS(e,t,a,i,o,s,c,u,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Bd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Bd(0),this.hiddenUpdates=Bd(null),this.identifierPrefix=i,this.onUncaughtError=o,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function o0(e,t,a,i,o,s,c,u,h,g,$,x){return e=new dS(e,t,a,c,h,g,$,x,u),t=1,s===!0&&(t|=24),s=ea(3,null,null,t),e.current=s,s.stateNode=e,t=qm(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},jm(s),e}function r0(e){return e?(e=Fo,e):Fo}function s0(e,t,a,i,o,s){o=r0(o),i.context===null?i.context=o:i.pendingContext=o,i=si(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=li(e,i,t),a!==null&&(ta(a,e,t),xs(a,e,t))}function ov(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function $p(e,t){ov(e,t),(e=e.alternate)&&ov(e,t)}function l0(e){if(e.tag===13||e.tag===31){var t=no(e,67108864);t!==null&&ta(t,e,67108864),$p(e,67108864)}}function rv(e){if(e.tag===13||e.tag===31){var t=pa();t=Cm(t);var a=no(e,t);a!==null&&ta(a,e,t),$p(e,t)}}var Nr=!0;function hS(e,t,a,i){var o=te.T;te.T=null;var s=ke.p;try{ke.p=2,xp(e,t,a,i)}finally{ke.p=s,te.T=o}}function mS(e,t,a,i){var o=te.T;te.T=null;var s=ke.p;try{ke.p=8,xp(e,t,a,i)}finally{ke.p=s,te.T=o}}function xp(e,t,a,i){if(Nr){var o=Nm(i);if(o===null)uh(e,t,i,su,a),sv(e,i);else if(gS(o,e,t,a,i))i.stopPropagation();else if(sv(e,i),t&4&&-1<pS.indexOf(e)){for(;o!==null;){var s=Tr(o);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=_i(s.pendingLanes);if(c!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;c;){var h=1<<31-ma(c);u.entanglements[1]|=h,c&=~h}bn(s),(Se&6)===0&&(tu=da()+500,al(0,!1))}}break;case 31:case 13:u=no(s,2),u!==null&&ta(u,s,2),Nu(),$p(s,2)}if(s=Nm(i),s===null&&uh(e,t,i,su,a),s===o)break;o=s}o!==null&&i.stopPropagation()}else uh(e,t,i,null,a)}}function Nm(e){return e=Rm(e),Np(e)}var su=null;function Np(e){if(su=null,e=Ui(e),e!==null){var t=Qs(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=mv(t),e!==null)return e;e=null}else if(a===31){if(e=pv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return su=e,null}function c0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Cx()){case wv:return 2;case $v:return 8;case _c:case zx:return 32;case xv:return 268435456;default:return 32}default:return 32}}var Sm=!1,hi=null,mi=null,pi=null,Ys=new Map,Xs=new Map,Fn=[],pS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function sv(e,t){switch(e){case"focusin":case"focusout":hi=null;break;case"dragenter":case"dragleave":mi=null;break;case"mouseover":case"mouseout":pi=null;break;case"pointerover":case"pointerout":Ys.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Xs.delete(t.pointerId)}}function ds(e,t,a,i,o,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[o]},t!==null&&(t=Tr(t),t!==null&&l0(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function gS(e,t,a,i,o){switch(t){case"focusin":return hi=ds(hi,e,t,a,i,o),!0;case"dragenter":return mi=ds(mi,e,t,a,i,o),!0;case"mouseover":return pi=ds(pi,e,t,a,i,o),!0;case"pointerover":var s=o.pointerId;return Ys.set(s,ds(Ys.get(s)||null,e,t,a,i,o)),!0;case"gotpointercapture":return s=o.pointerId,Xs.set(s,ds(Xs.get(s)||null,e,t,a,i,o)),!0}return!1}function u0(e){var t=Ui(e.target);if(t!==null){var a=Qs(t);if(a!==null){if(t=a.tag,t===13){if(t=mv(a),t!==null){e.blockedOn=t,Of(e.priority,function(){rv(a)});return}}else if(t===31){if(t=pv(a),t!==null){e.blockedOn=t,Of(e.priority,function(){rv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Mc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Nm(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);Eh=i,a.target.dispatchEvent(i),Eh=null}else return t=Tr(a),t!==null&&l0(t),e.blockedOn=a,!1;t.shift()}return!0}function lv(e,t,a){Mc(e)&&a.delete(t)}function fS(){Sm=!1,hi!==null&&Mc(hi)&&(hi=null),mi!==null&&Mc(mi)&&(mi=null),pi!==null&&Mc(pi)&&(pi=null),Ys.forEach(lv),Xs.forEach(lv)}function hc(e,t){e.blockedOn===t&&(e.blockedOn=null,Sm||(Sm=!0,bt.unstable_scheduleCallback(bt.unstable_NormalPriority,fS)))}var mc=null;function cv(e){mc!==e&&(mc=e,bt.unstable_scheduleCallback(bt.unstable_NormalPriority,function(){mc===e&&(mc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],o=e[t+2];if(typeof i!="function"){if(Np(i||a)===null)continue;break}var s=Tr(a);s!==null&&(e.splice(t,3),t-=3,jh(s,{pending:!0,data:o,method:a.method,action:i},i,o))}}))}function Sr(e){function t(h){return hc(h,e)}hi!==null&&hc(hi,e),mi!==null&&hc(mi,e),pi!==null&&hc(pi,e),Ys.forEach(t),Xs.forEach(t);for(var a=0;a<Fn.length;a++){var i=Fn[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Fn.length&&(a=Fn[0],a.blockedOn===null);)u0(a),a.blockedOn===null&&Fn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var o=a[i],s=a[i+1],c=o[na]||null;if(typeof s=="function")c||cv(a);else if(c){var u=null;if(s&&s.hasAttribute("formAction")){if(o=s,c=s[na]||null)u=c.formAction;else if(Np(o)!==null)continue}else u=c.action;typeof u=="function"?a[i+1]=u:(a.splice(i,3),i-=3),cv(a)}}}function d0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Sp(e){this._internalRoot=e}Tu.prototype.render=Sp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(M(409));var a=t.current,i=pa();s0(a,i,e,t,null,null)};Tu.prototype.unmount=Sp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;s0(e.current,2,null,e,null,null),Nu(),t[kr]=null}};function Tu(e){this._internalRoot=e}Tu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Cv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Fn.length&&t!==0&&t<Fn[a].priority;a++);Fn.splice(a,0,e),a===0&&u0(e)}};var uv=dv.version;if(uv!=="19.3.0")throw Error(M(527,uv,"19.3.0"));ke.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(M(188)):(e=Object.keys(e).join(","),Error(M(268,e)));return e=bx(t),e=e!==null?gv(e):null,e=e===null?null:e.stateNode,e};var bS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:te,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(hs=__REACT_DEVTOOLS_GLOBAL_HOOK__,!hs.isDisabled&&hs.supportsFiber))try{Zs=hs.inject(bS),ha=hs}catch{}var hs;Eu.createRoot=function(e,t){if(!hv(e))throw Error(M(299));var a=!1,i="",o=Yy,s=Xy,c=Qy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=o0(e,1,!1,null,null,a,i,null,o,s,c,d0),e[kr]=t.current,gp(e),new Sp(t)};Eu.hydrateRoot=function(e,t,a){if(!hv(e))throw Error(M(299));var i=!1,o="",s=Yy,c=Xy,u=Qy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(u=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=o0(e,1,!0,t,a??null,i,o,h,s,c,u,d0),t.context=r0(null),a=t.current,i=pa(),i=Cm(i),o=si(i),o.callback=null,li(a,o,i),a=i,t.current.lanes=a,Js(t,a),bn(t),e[kr]=t.current,gp(e),new Tu(t)};Eu.version="19.3.0"});var g0=tn((I2,p0)=>{"use strict";function m0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(m0)}catch(e){console.error(e)}}m0(),p0.exports=h0()});var O0=tn(Au=>{"use strict";var SS=Symbol.for("react.transitional.element"),kS=Symbol.for("react.fragment");function M0(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:SS,type:e,key:i,ref:t!==void 0?t:null,props:a}}Au.Fragment=kS;Au.jsx=M0;Au.jsxs=M0});var Ep=tn((Q2,V0)=>{"use strict";V0.exports=O0()});var m=ql(Ll()),n1=ql(g0());function vS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",o=[],s=[];for(let c=0;c<a.length;c++){let u=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(u)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!u.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&s.push(g),o=[]}else o.push(u)}if(!t){let c=o.join(`
`).trim();c&&s.push(c)}return s}var yS=['"',"'","\u201D","\u2019","\xBB","\u300D"],wS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function f0(e){let t=e.trim();return yS.includes(t.slice(-1))&&wS.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function b0(e,t){let a=vS(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let o=[],s=[],c=[],u=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),s.push(u),c.push(g.expression??null),u=[];continue}let $={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?s[s.length-1].push($):u.push($)}return o.length===0?i():{paragraphs:o,asides:s,expressions:c}}var $S="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function oo(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp($S,"g"),o=0,s,c=u=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+u};return}a.push({kind:"text",text:u})};for(;(s=i.exec(e))!==null;)s.index>o&&c(e.slice(o,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:oo(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:oo(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:oo(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:oo(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:oo(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:oo(s[10]??s[11],t+1)}),o=s.index+s[0].length;return o<e.length&&c(e.slice(o)),a}function v0(e){return oo(e,0)}function Un(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function y0(e){return e===null||typeof e=="string"}function w0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Cu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function xS(e){return e===null?!0:Un(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function NS(e){if(!Un(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Cu(e.capabilities)||!Un(e.presentation)||!Un(e.occupancy)||!Un(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return xS(t.image)&&w0(t.x)&&w0(t.y)&&typeof a.playerHome=="boolean"&&y0(a.residentCharacterId)&&y0(a.homeKind)&&typeof i.condition=="string"&&Cu(i.upgrades)&&Cu(i.furniture)&&Cu(i.publicFacts)&&typeof i.updatedAt=="string"}function $0(e){if(!Un(e)||!Un(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(NS),i=Array.isArray(e.venueRequests)?e.venueRequests:[],o=i.filter(s=>Un(s)&&typeof s.id=="string"&&Un(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&o.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function x0(e,t,a){return e==="Enter"&&!t&&!a}function ol(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function N0(e,t,a,i){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(i,o)}function Mr(e,t){return t?.roomId===e}function S0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function k0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function T0(e,t,a){let i=a==="front"?"front":"side",o=e.find(s=>s.view===i&&s.label===t)??e.find(s=>s.view===i&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function E0(e,t,a){let i=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<o)}function C0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var xi=(e,t,a)=>Math.min(a,Math.max(t,e));function zu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function kp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,zu(e,t)),s=e.width*i*o,c=e.height*i*o,u=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:xi(u,t.width-s,0),top:c<=t.height?(t.height-c)/2:xi(h,t.height-c,0),width:s,height:c}}function z0(e,t,a,i,o,s){let c=kp(e,t,a);if(!c.width||!c.height)return a;let u=zu(e,t),h=xi(a.zoom*s,u,Math.max(4,u*2)),g=h/Math.max(a.zoom,u),$=c.width*g,x=c.height*g,p=(i.x-c.left)/c.width,b=(i.y-c.top)/c.height,C=o.x-p*$,T=o.y-b*x;return{zoom:h,centerX:xi((t.width/2-C)/$,0,1),centerY:xi((t.height/2-T)/x,0,1)}}function A0(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((xi(e,a,i)-a)/(i-a))}function R0(e,t){return t?Math.max(1,e):e}function Tp(e,t,a){let i=Math.min(90,t.width/2),o=64,s=116,c=e.left+a.x*e.width,u=e.top+a.y*e.height,h=u+o,g=h+s<=t.height?h:u-o-s;return{left:xi(c,i,t.width-i),top:xi(g,0,Math.max(0,t.height-s))}}var r=ql(Ep()),n="marinara-capability-villages",D0="marinara-capability-villages-styles",TS="/api/villages",ES=.7,Ip=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Cp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),CS={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},co=e=>Ip.find(t=>t.value===e),zS=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,_0={roads:"auto",structures:"auto",water:"auto"},Ru=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],I0=1,zp=3,AS={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Ap="__villages_image_disabled__",Du=["neutral","happy","sad","angry","surprised","thinking"];function H0(e,t,a,i,o=!1,s=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function RS(e){let t=[];for(let a of e){let i=t[t.length-1];i&&i.label===a.dateLabel?i.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var i1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function Mu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function MS(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${o}m left`:`${o}m left`}function OS({library:e,busy:t,onRefresh:a,onForget:i}){let[o,s]=(0,m.useState)("all"),[c,u]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[p,b]=(0,m.useState)(""),C=Date.now(),T=(v,S)=>(!h.trim()||`${v} ${S.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(O=>O.id===c)),R=(e?.recollections??[]).filter(v=>T(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>T(v.text,[...v.subjects,...v.knownBy])),y=async(v,S)=>{try{let O=await D(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:O.visit,lineIds:S}),b("")}catch(O){x(null),b(B(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${n}-memory-library`,children:[(0,r.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,S])=>(0,r.jsx)("button",{type:"button","data-active":o===v,onClick:()=>s(v),children:S},v))}),(0,r.jsx)("input",{type:"search",value:h,onChange:v=>g(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:v=>u(v.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,r.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&R.length>0?(0,r.jsxs)("section",{className:`${n}-memory-section`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${n}-memory-grid`,children:R.map(v=>{let S=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:MS(v.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Mu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Mu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,r.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{y(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${n}-memory-section`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${n}-memory-grid`,children:w.map(v=>(0,r.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${n}-memory-pill`,children:v.memoryCategory?i1[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[v.dateLabel,Hp(v)?` \xB7 ${Hp(v)}`:""]})]}),(0,r.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Mu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Mu(v.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${n}-memory-card-actions`,children:[v.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(o!=="durable"&&R.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,p?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:p}):null,$?(0,r.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:v.name||"Player"}),(0,r.jsxs)("small",{children:[_u(v.at)," \xB7 heard by"," ",v.heardBy.map(S=>$.visit.participants.find(O=>O.characterId===S)?.name??S).join(", ")||"no one"]})]}),Vr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function _u(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":c1.format(t)}function Hp(e){return _u(e.occurredAt)}function VS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function U0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Rp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var DS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function _S(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${DS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function IS(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?St(a,t.spaceClass).image:null)?.url??"":""}var Up=class extends m.Component{constructor(){super(...arguments);Qg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},HS=`
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
`;function q0(){let e=document.getElementById(D0);if(!document.querySelector(n)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=D0,t.textContent=HS,document.head.appendChild(t)}var US="marinara_admin_secret";function o1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(US)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var qS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function r1(e,t,a){let i=e?.error,o=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${qS} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${TS}${e}`,{...t,headers:o1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw r1(i,a.status,`The village replied ${a.status}.`);return $0(i)}async function Lp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:o1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw r1(i,a.status,`The Engine replied ${a.status}.`);return i}var ro=e=>typeof e=="number"&&Number.isFinite(e);function jp(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:o,srcWidth:s,srcHeight:c}=a;if(ro(i)&&ro(o)&&ro(s)&&ro(c))return s<=0||c<=0||i<0||o<0||i+s>1.001||o+c>1.001?null:{srcX:i,srcY:o,srcWidth:s,srcHeight:c};let{zoom:u,offsetX:h,offsetY:g,fullImage:$}=a;return!ro(u)||u<=0||!ro(h)||!ro(g)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:u,offsetX:h,offsetY:g}:{zoom:u,offsetX:h,offsetY:g,fullImage:$}}function BS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function LS(e,t){if(e.length===0)return{};let a=await Lp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let o of a){let s=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:jp(o.avatarCrop)})}return i}async function jS(e,t){let a=e.trim();if(a.length===0)return null;let i=await Lp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return o.length===0?null:{url:o,crop:jp(i.avatarCrop)}}function GS(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function B(e,t){return e instanceof Error&&e.message?e.message:t}function Or(e){let t=B(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function B0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function L0(e,t){try{let{visit:a}=await D(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return S0(a,t)?a:null}catch{return null}}function j0(e){let t=B(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Iu(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Vr(e,t){return s1(v0(e),t)}function s1(e,t){let a=0;return e.map(i=>{let o=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,r.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},o);case"link":return(0,r.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},o);default:return YS(i,o)}})}function YS(e,t){let a=s1(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function XS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Dr(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var l1=["residence","workplace","gathering","other"];function vn(e){return e.classes?.length?e.classes:Dr(e)?["residence"]:["other"]}function G0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Hu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function St(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function Y0({draft:e,existing:t,villagers:a,editableClasses:i,onChange:o}){let s=vn(e),c=(u,h)=>{let g=s.map($=>$===u?{...St(e,$),...h}:St(e,$));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["Name",(0,r.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:u=>o({...e,name:u.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,r.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:u=>o({...e,form:u.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${n}-row`,children:["x","y"].map(u=>(0,r.jsxs)("label",{className:`${n}-label`,children:[u==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[u]??"",disabled:t&&Hu(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[u]:h.target.value===""?null:Number(h.target.value)}})})]},u))}),t&&Hu(e)>0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${n}-row`,children:l1.map(u=>(0,r.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(u),disabled:t||!s.includes(u)&&s.length>=2,onChange:h=>{let g=h.target.checked?[...s,u]:s.filter($=>$!==u);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map($=>St(e,$))})}})," ",u]},u))}),t?(0,r.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,r.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:u=>o({...e,residenceCapacity:Number(u.target.value)})}),t?(0,r.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(u=>(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(u.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],u.characterId]:(e.workerIds??[]).filter(g=>g!==u.characterId)})})," ",u.name]},u.characterId)),a.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(u=>!i||i.includes(u)).map(u=>{let h=St(e,u);return(0,r.jsxs)("section",{className:`${n}-field`,children:[(0,r.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[u," space"]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(u,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:g=>c(u,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(u,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(u,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,$)=>(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("input",{className:`${n}-notice-input`,value:g.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(p=>p.id===g.id?{...p,text:x.target.value}:p)}})}),(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(p=>p.id===g.id?{...p,locked:x.target.checked}:p)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(u,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(u,{state:{...h.state,features:[...h.state.features,{id:ol(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},u)})]})}function qp(e){return e.filter(t=>Dr(t))}function qn(e){return e.filter(t=>!Dr(t)||vn(t).some(a=>a!=="residence"))}function QS(e,t){let a=qp(e);return a.length!==t.length?!1:t.every((i,o)=>{let s=a[o];return s.id===i.id&&s.name===i.name&&(s.form??"Home")===i.form&&s.occupancy.playerHome===i.isPlayerHome&&s.occupancy.residentCharacterId===i.characterId&&s.description===i.description&&Math.abs((s.presentation.x??-1)-(i.x??-1))<1e-4&&Math.abs((s.presentation.y??-1)-(i.y??-1))<1e-4})}function ZS(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let s=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...St(s??{id:o.id,name:o.name,description:o.description,category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:s?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:s?.improvements??[null,null],description:o.description,category:s?.category??"",presentation:{image:s?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:s?.capabilities??[],state:s?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!Dr(o))]}function rl(){return Math.random().toString(36).slice(2,10)}function so(e){return Math.round(e*1e4)/1e4}var KS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),c1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),JS=6e4,PS=700;function X0(e){return`${KS.format(e)} \xB7 ${c1.format(e)}`}function FS(){let[e,t]=(0,m.useState)(()=>X0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(X0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function WS(){let[e,t]=FS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function e2({weather:e}){return(0,r.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,r.jsx)(WS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:t2(e)})]})}function t2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function Q0(e){return e?.closest(n)??null}function a2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(Q0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:o=>{let s=Q0(o.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function n2({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let u=()=>s(c.open);return c.addEventListener("toggle",u),()=>c.removeEventListener("toggle",u)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=u=>{!(u.target instanceof Node)||i.current?.contains(u.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,r.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${n}-news-panel`,children:[(0,r.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function u1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function i2(e){return e.length>0?u1(e,!0):"Empty house"}function Z0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function K0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function o2(e,t){return t.length>0?u1(t,!0):e.name||"An empty house"}function Ou(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var r2=.028;function sl(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function Mp(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var J0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Op(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Vp(e,t,a){return e<t?t:e>a?a:e}function s2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),u=e.width*c,h=e.height*c;return{left:(t.width-u)/2,top:(t.height-h)/2,width:u,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*i,s=e.height*i;return{left:(t.width-o)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:o,height:s}}function l2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Vu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Dp({src:e,alt:t,pins:a,placing:i,view:o,shape:s,zoom:c,onPlace:u,onView:h,onDismiss:g,compact:$,fitToRoom:x,mobile:p,photoPins:b,children:C}){let T=u!==void 0,R=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,S]=(0,m.useState)(null),[O,W]=(0,m.useState)(null),[U,L]=(0,m.useState)(null),ye=(0,m.useRef)(null),Q=(0,m.useRef)(new Map),Ve=(0,m.useRef)(null),[ze,rt]=(0,m.useState)(null),[Za,kt]=(0,m.useState)(null),nt=(0,m.useRef)(null),H=(0,m.useRef)(null),oe=(0,m.useRef)(!1),[Ae,F]=(0,m.useState)(null),G=(0,m.useMemo)(()=>Ae?{...o,...Ae}:o,[Ae,o]),le=e?v?.src===e?v:null:s,_t={zoom:le&&O?zu(le,O):1,centerX:.5,centerY:.5},V=U??_t,J=(0,m.useMemo)(()=>p?le&&O?kp(le,O,V):null:e?v&&v.src===e&&O?s2(v,O,G):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[v,O,G,p,le,V,e]);(0,m.useEffect)(()=>{L(null),ye.current=null,Q.current.clear(),Ve.current=null},[e,O?.width,O?.height]);let vt=s?x&&ze?{width:`${ze.width}px`,height:`${ze.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Ke=(0,m.useCallback)(()=>{let A=y.current;if(!A)return;let j=A.getBoundingClientRect();j.width===0||j.height===0||W(ve=>ve&&ve.width===j.width&&ve.height===j.height?ve:{width:j.width,height:j.height})},[]);(0,m.useEffect)(()=>{let A=y.current;if(!A||typeof ResizeObserver>"u")return;let j=new ResizeObserver(()=>Ke());return j.observe(A),()=>j.disconnect()},[Ke]);let st=(0,m.useCallback)(()=>{let A=w.current?.parentElement;if(!A||!s)return;let j=A.getBoundingClientRect(),ve=getComputedStyle(A),_e=ct=>Number.parseFloat(ve.getPropertyValue(ct))||0,Te=j.width-_e("padding-left")-_e("padding-right"),et=j.height-_e("padding-top")-_e("padding-bottom"),ae=s.width/s.height,K=Math.min(Te,et*ae);K>0&&rt(ct=>ct&&Math.abs(ct.width-K)<.5?ct:{width:K,height:K/ae})},[s]);(0,m.useLayoutEffect)(()=>{if(!x||(st(),typeof ResizeObserver>"u"))return;let A=w.current?.parentElement;if(!A)return;let j=new ResizeObserver(()=>st());return j.observe(A),()=>j.disconnect()},[x,st]);let de=(0,m.useCallback)(A=>{if(!T||!u||!J)return;let j=A.currentTarget.getBoundingClientRect(),ve=(A.clientX-j.left-J.left)/J.width,_e=(A.clientY-j.top-J.top)/J.height;if(!(ve>=0&&ve<=1)||!(_e>=0&&_e<=1))return;let et=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();u(so(ve),so(_e),{width:J.width,height:J.height,photoWidth:et?.width??58,photoHeight:et?.height??58})},[u,T,J]),De=(0,m.useCallback)(A=>{if(!R||!J||!h||G.fit!=="cover")return;let j=A.currentTarget.getBoundingClientRect();nt.current={x:A.clientX,y:A.clientY,focusX:G.focusX,focusY:G.focusY,spanX:j.width-J.width,spanY:j.height-J.height},F({focusX:G.focusX,focusY:G.focusY}),A.currentTarget.setPointerCapture(A.pointerId),A.preventDefault()},[R,G.focusX,G.focusY,G.fit,h,J]),re=(0,m.useCallback)(A=>{let j=nt.current;if(!j)return;let ve=j.spanX===0?j.focusX:j.focusX+(A.clientX-j.x)/j.spanX*100,_e=j.spanY===0?j.focusY:j.focusY+(A.clientY-j.y)/j.spanY*100;F({focusX:so(Vp(ve,0,100)),focusY:so(Vp(_e,0,100))})},[]),he=(0,m.useCallback)(A=>{if(!nt.current)return;nt.current=null,A.currentTarget.hasPointerCapture(A.pointerId)&&A.currentTarget.releasePointerCapture(A.pointerId);let j=Ae;F(null),j&&h&&h({...o,...j})},[Ae,h,o]),qt=(0,m.useCallback)(A=>{!h||!c||h({...o,zoom:so(Vp(A,c.min,c.max))})},[h,o,c]),Kt=()=>{let A=[...Q.current.values()];if(A.length===0){Ve.current=null;return}let j=A[0],ve=A[1];Ve.current={view:ye.current??V,x:ve?(j.x+ve.x)/2:j.x,y:ve?(j.y+ve.y)/2:j.y,distance:ve?Math.hypot(j.x-ve.x,j.y-ve.y):1}},Ma=A=>{if(!p||A.pointerType!=="touch"||(A.isPrimary&&(Q.current.clear(),oe.current=!1),!y.current)||A.target instanceof Element&&A.target.closest(`.${n}-doors, .${n}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let j=y.current.getBoundingClientRect();Q.current.set(A.pointerId,{x:A.clientX-j.left,y:A.clientY-j.top}),Q.current.size>1&&(oe.current=!0),Kt()},yt=A=>{if(!p||!Q.current.has(A.pointerId)||!le||!O||!y.current)return;let j=y.current.getBoundingClientRect();Q.current.set(A.pointerId,{x:A.clientX-j.left,y:A.clientY-j.top});let ve=[...Q.current.values()],_e=ve[0],Te=ve[1],et=Te?(_e.x+Te.x)/2:_e.x,ae=Te?(_e.y+Te.y)/2:_e.y,K=Te?Math.hypot(_e.x-Te.x,_e.y-Te.y):1,ct=Ve.current;if(!ct||!C0(ct,{x:et,y:ae,distance:K})&&!oe.current)return;oe.current||g?.(),oe.current=!0;let ba=z0(le,O,ct.view,{x:ct.x,y:ct.y},{x:et,y:ae},Te&&ct.distance>0?K/ct.distance:1);ye.current=ba,L(ba)},Ka=(A,j=!1)=>{if(!p||!Q.current.has(A.pointerId))return;let ve=!j&&Q.current.size===1&&!oe.current;if(Q.current.delete(A.pointerId),Q.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),Kt(),!ve||!(A.target instanceof Element))return;let _e=A.target.closest(`.${n}-pin`)?.dataset.pinId,Te=_e?a.find(et=>et.id===_e):null;if(Te?.onSelect){oe.current=!0,Te.onSelect();return}if(!(!A.target.closest(`.${n}-canvas`)||A.target.closest("button")))if(T&&i&&u&&J){let et=y.current.getBoundingClientRect(),ae=(A.clientX-et.left-J.left)/J.width,K=(A.clientY-et.top-J.top)/J.height;if(ae>=0&&ae<=1&&K>=0&&K<=1){oe.current=!0;let Tt=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();u(so(ae),so(K),{width:J.width,height:J.height,photoWidth:Tt?.width??72,photoHeight:Tt?.height??72})}}else g&&(oe.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${n}-stage${$?` ${n}-stage-compact`:""}`,style:vt,"data-shaped":s?"true":"false","data-framing":R&&G.fit==="cover"?"true":"false","data-mobile":p?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:A=>{if(p){Ma(A);return}oe.current=!1,H.current=A.pointerType==="touch"?{x:A.clientX,y:A.clientY}:null},onPointerMoveCapture:A=>{if(p){yt(A);return}let j=H.current;j&&(Math.abs(A.clientX-j.x)>8||Math.abs(A.clientY-j.y)>8)&&(oe.current=!0)},onPointerUpCapture:p?Ka:void 0,onPointerCancelCapture:A=>{p&&Ka(A,!0),H.current&&(oe.current=!0)},onClickCapture:A=>{oe.current&&(oe.current=!1,A.preventDefault(),A.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:y,className:`${n}-canvas`,"data-placing":T&&i?"true":"false","data-dragging":Ae?"true":"false",onClick:T&&i?de:g?()=>g():void 0,onPointerDown:R?De:void 0,onPointerMove:R?re:void 0,onPointerUp:R?he:void 0,onPointerCancel:R?he:void 0,children:[e?(0,r.jsx)("img",{className:`${n}-canvas-img`,style:p&&J?{position:"absolute",left:J.left,top:J.top,width:J.width,height:J.height,objectFit:"fill"}:l2(G),src:e,alt:t,draggable:!1,onLoad:A=>{let{naturalWidth:j,naturalHeight:ve}=A.currentTarget;j<=0||ve<=0||(S({src:e,width:j,height:ve}),Ke())},onError:()=>kt(e)}):(0,r.jsxs)(r.Fragment,{children:[p&&J?(0,r.jsx)("span",{className:`${n}-mobile-logical`,style:{left:J.left,top:J.top,width:J.width,height:J.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&Za===e?(0,r.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,J?a.map(A=>(0,r.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":A.selected?"true":"false",style:{left:`${J.left+A.x*J.width}px`,top:`${J.top+(A.y+(p&&A.kind!=="person"?0:A.dy??0))*J.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":A.id,"data-tone":A.tone,"data-kind":A.kind??"place","data-selected":A.selected?"true":"false","aria-expanded":A.doors?!0:void 0,disabled:A.onSelect===void 0,title:A.text,onClick:j=>{j.stopPropagation(),A.onSelect?.()},children:(p||b)&&A.kind!=="person"?(0,r.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${R0(p?A0(V.zoom,_t.zoom):ES,A.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[A.image?(0,r.jsx)("img",{src:A.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${n}-pin-name`,children:A.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${n}-pin-name`,children:A.text})]})}),A.onRemove?(0,r.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${A.text} off the map`,onClick:j=>{j.stopPropagation(),A.onRemove?.()},children:"\xD7"}):null,A.onResume?(0,r.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:j=>{j.stopPropagation(),A.onResume?.()},children:"DEBUG: Resume Chat"}):null]},A.id)):null]}),J?a.filter(A=>A.doors!==void 0&&A.doors.length>0).map(A=>(0,r.jsx)("div",{className:`${n}-doors`,style:{left:`${O?Tp(J,O,A).left:J.left+A.x*J.width}px`,top:`${O?Tp(J,O,A).top:J.top+(A.y+(A.dy??0))*J.height}px`},children:A.doors?.map(j=>(0,r.jsx)("button",{type:"button",className:`${n}-door`,onClick:ve=>{ve.stopPropagation(),j.onSelect()},children:j.label},j.label))},`doors:${A.id}`)):null,R&&c&&G.fit==="cover"?(0,r.jsxs)("div",{className:`${n}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:G.zoom>=c.max,onClick:()=>qt(G.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:G.zoom<=c.min,onClick:()=>qt(G.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:G.focusX===50&&G.focusY===50&&G.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function lo(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function c2({scenario:e}){let t=zS(e),[a,i]=(0,m.useState)(null);return(0,r.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,r.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,r.jsx)("img",{src:t,alt:`${co(e).label} village scene`,onError:()=>i(t)}),(0,r.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:co(e).description})]})]})}function u2({label:e,choices:t,selectedId:a,onSelect:i,disabled:o,emptyMessage:s}){return t.length?(0,r.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,r.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:o,onClick:()=>i(c.id),children:[(0,r.jsx)(uo,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,r.jsx)("strong",{children:c.name}),c.hint?(0,r.jsx)("small",{children:c.hint}):null]},c.id))}):(0,r.jsx)("p",{className:`${n}-hint`,children:s})}function d2({value:e}){return(0,r.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,r.jsx)(uo,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,r.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,r.jsx)("h3",{children:e.name}),e.overview?(0,r.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,r.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:t}),(0,r.jsx)("dd",{children:a})]},t))}):null,(0,r.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function P0(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),o=a.indexOf(" ",t);return`${a.slice(0,i>0?i:o>0?o:a.length).trimEnd()}\u2026`}function F0(e){return e.avatarPath?{url:e.avatarPath,crop:jp(e.avatarCrop)}:void 0}function h2({personas:e,draft:t,onDraft:a,disabled:i}){let[o,s]=(0,m.useState)(""),[c,u]=(0,m.useState)(null),[h,g]=(0,m.useState)(""),$=e?.find(T=>T.id===t),x=$?.id,p=o.trim().toLocaleLowerCase(),b=(e??[]).filter(T=>!p||`${T.name} ${T.summary}`.toLocaleLowerCase().includes(p)).sort((T,R)=>T.name.localeCompare(R.name,void 0,{sensitivity:"base"})).map(T=>({id:T.id,name:T.name,portrait:F0(T),hint:T.summary}));(0,m.useEffect)(()=>{if(u(null),g(""),!t||!x)return;let T=new AbortController;return D(`/personas/${encodeURIComponent(t)}`,{signal:T.signal}).then(R=>{T.signal.aborted||u(R.persona)}).catch(R=>{T.signal.aborted||g(B(R,"This Persona could not be read."))}),()=>T.abort()},[t,x]);let C=c&&c.id===t?{id:c.id,name:c.name,portrait:F0(c),overview:P0(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,T])=>T.trim()).map(([T,R])=>({label:T,text:P0(R,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,r.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,r.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,r.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:o,placeholder:"Search Personas",onChange:T=>s(T.target.value),disabled:i||e===null})]}),(0,r.jsx)(u2,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):C?(0,r.jsx)(d2,{value:C}):h?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):$?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,r.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function m2({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:o,storedName:s,storedMissing:c,disabled:u}){let h=(t??[]).find(p=>p.id===a)??null,g=h?.name??(a===o?s:""),$=c&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:u||t===null||t.length===0,onChange:p=>i(p.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(p=>(0,r.jsx)("option",{value:p.id,children:p.isActive?`${p.name} \u2014 your Persona`:p.name},p.id))]}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(p=>p.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function W0({books:e,error:t,selected:a,onChange:i,disabled:o}){let[s,c]=(0,m.useState)(""),u=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),g=a.filter(b=>!u.has(b)),x=[...h,...g.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),p=x.slice(0,50);return(0,r.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,r.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,r.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,r.jsxs)("span",{children:[u.get(b)?.name??b,e===null?" (checking)":u.has(b)?u.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,r.jsx)("button",{type:"button","aria-label":`Remove ${u.get(b)?.name??b}`,disabled:o,onClick:()=>i(a.filter(C=>C!==b)),children:"\xD7"})]},b)):(0,r.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,r.jsxs)("details",{className:`${n}-lore-options`,children:[(0,r.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,r.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,r.jsxs)("div",{className:`${n}-lore-results`,children:[p.map(b=>{let C=a.includes(b.id),T=g.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${n}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:C,disabled:o||!b.enabled&&!C||!C&&a.length>=24,onChange:()=>i(C?a.filter(R=>R!==b.id):[...a,b.id])}),b.name,T?` (${T})`:""]},b.id)}),e!==null&&x.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,x.length>p.length?(0,r.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function p2({homes:e,villagers:t,disabled:a,selectedId:i,onPatch:o,onRemove:s,onSelect:c,lockedIds:u,showDescriptions:h,onGenerateDescription:g}){let $=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${n}-home-list`,children:e.map((x,p)=>{let b=u?.has(x.id)??!1,C=t.find(T=>T.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${n}-home-row`,"data-selected":x.id===i?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,r.jsx)("span",{className:`${n}-home-index`,"aria-hidden":"true",children:p+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${n}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${n}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${n}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${p+1}`,onChange:T=>o(x.id,{characterId:T.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(T=>{let R=T.id!==x.characterId&&$.has(T.id);return(0,r.jsx)("option",{value:T.id,disabled:R,children:R?`${T.name} \u2014 already housed`:T.name},T.id)})]}):null]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${n}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:T=>o(x.id,{name:T.target.value})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${n}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:T=>o(x.id,{form:T.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("textarea",{className:`${n}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${p+1}`,onChange:T=>o(x.id,{description:T.target.value})}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:a||b,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-remove`,disabled:a||b,"aria-label":`Take home ${p+1} off the map`,onClick:()=>s(x.id),children:"\xD7"}),b?(0,r.jsx)("span",{className:`${n}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function e1({id:e,label:t,hint:a,options:i,value:o,disabled:s,onChange:c}){let u=o.length>0&&!i.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${n}-select`,value:o,disabled:s,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),u?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${n}-hint`,children:a})]})}function _p({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,o]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let R=!1;return(async()=>{try{let[w,y]=await Promise.all([D("/connections"),Lp("/api/connections")]);if(R)return;o(w),c(GS(Array.isArray(y)?y:[]))}catch(w){R||h(B(w,"This agent's connections could not be read."))}})(),()=>{R=!0}},[]);let x=(0,m.useCallback)(async R=>{$(!0),h("");try{o(await D("/connections",{method:"PUT",body:JSON.stringify(R)}))}catch(w){h(B(w,"That connection could not be saved."))}finally{$(!1)}},[]),p=s.filter(R=>R.category==="language"),b=s.filter(R=>R.category==="image_generation"),C=b.some(R=>R.defaultForAgents),T=i!==null&&(i.imageConnectionId===Ap||b.length===0||i.imageConnectionId.length===0&&!C);return(0,m.useEffect)(()=>{if(!e)return;let R=i?.systemConnectionId??"",w=i?.narrationConnectionId??"";i?R.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!p.some(y=>y.id===R)||!p.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,p]),(0,m.useEffect)(()=>{t?.(T)},[T,t]),(0,r.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,r.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,r.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,r.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,r.jsx)(e1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:p,value:i.systemConnectionId,disabled:g,onChange:R=>{x({systemConnectionId:R})}}),(0,r.jsx)(e1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:p,value:i.narrationConnectionId,disabled:g,onChange:R=>{x({narrationConnectionId:R})}}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:g,onChange:R=>{x({imageConnectionId:R.target.value})},children:[(0,r.jsx)("option",{value:Ap,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==Ap&&!b.some(R=>R.id===i.imageConnectionId)?(0,r.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(R=>(0,r.jsx)("option",{value:R.id,children:R.name},R.id))]}),(0,r.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,r.jsxs)(r.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):u.length===0?(0,r.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:u}):null]})}function d1(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[o,s]=(0,m.useState)(!1),[c,u]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then($=>{g||t($)}).catch($=>{g||i(B($,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{s(!0),u(!1),i("");try{let $=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t($),u(!0),$}catch($){return i(B($,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function g2(){let{view:e,error:t,busy:a,saved:i,save:o}=d1(),[s,c]=(0,m.useState)(null),u=s??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:n+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:n+"-textarea","aria-label":"Narration style",value:u,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||u===e.styleInstructions,onClick:()=>{o({styleInstructions:u}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||u===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:n+"-row",children:[(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:n+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,r.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function f2(){let{view:e,error:t,busy:a,saved:i,save:o}=d1(),[s,c]=(0,m.useState)(null),u=s??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:n+"-panel",children:[(0,r.jsx)("h2",{className:n+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:n+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:n+"-textarea","aria-label":"Villager reply guidance",value:u,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:n+"-row",children:[(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||u===e.replyGuidance,onClick:()=>{o({replyGuidance:u}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||u===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:n+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:n+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,r.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function uo({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:BS(e.crop)}):i==="person"?(0,r.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function b2({villager:e,portrait:t,selected:a,onSelect:i}){return(0,r.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${n}-tile-head`,children:[(0,r.jsx)(uo,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${n}-tag`,children:o},o))]})]})}function t1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function v2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,p)=>{let b=C=>{let T=Du.indexOf(C);return T<0?Du.length:T};return b(x.label)-b(p.label)||x.label.localeCompare(p.label)||x.view.localeCompare(p.view)}),i=512,o=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*o;let u=c.getContext("2d");if(!u)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let p=a[x],b=new Image;b.src=p.url,await b.decode();let C=x%s*i,T=Math.floor(x/s)*o,R=Math.min(i/b.naturalWidth,o/b.naturalHeight),w=Math.round(b.naturalWidth*R),y=Math.round(b.naturalHeight*R);u.drawImage(b,C+Math.floor((i-w)/2),T+o-y,w,y),h.push({view:p.view,expression:p.label,x:C,y:T,width:i,height:o})}let g=await new Promise((x,p)=>c.toBlob(b=>b?x(b):p(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";t1(`${$}-sprites.png`,g),t1(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function y2({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[i,o]=(0,m.useState)("front"),[s,c]=(0,m.useState)("neutral"),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(""),[x,p]=(0,m.useState)(!0),[b,C]=(0,m.useState)(null),[T,R]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,S]=(0,m.useState)(""),[O,W]=(0,m.useState)(""),U=(0,m.useRef)(null),L=e.sprite?.images??[],ye=L.filter(H=>H.view===i),Q=L.some(H=>H.view==="front"&&H.label==="neutral"),Ve=ye.some(H=>H.label==="neutral"),ze=s==="custom"?u.trim().toLowerCase().replace(/\s+/g,"_"):s,rt=ye.find(H=>H.label===ze),Za=[...Du,...L.map(H=>H.label).filter(H=>!Du.includes(H))].filter((H,oe,Ae)=>Ae.indexOf(H)===oe);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),S(""),D(`${a}/source`).then(H=>R(H.sprites)).catch(()=>R([]))},[a]);async function kt(H){y(!0),S(""),W("");try{await H()}catch(oe){S(B(oe,"The sprite could not be prepared."))}finally{y(!1)}}function nt(){if(!/^[a-z0-9_-]{1,40}$/.test(ze))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(i==="side"&&!Q)throw new Error("Approve the front neutral sprite first.");if(ze!=="neutral"&&!Ve)throw new Error(`Approve the ${i} neutral sprite first.`);return ze}return(0,r.jsxs)("section",{className:`${n}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${n}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${n}-sprite-count`,children:[L.length," approved"]})]}),(0,r.jsx)("div",{className:`${n}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(H=>(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-view`,"aria-pressed":i===H,"data-active":i===H?"true":"false",disabled:w,onClick:()=>{o(H),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:H==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[L.filter(oe=>oe.view===H).length," approved \xB7"," ",H==="front"?"front":"side, mirrored left or right"]})]},H))}),(0,r.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${n}-sprite-choices`,children:[Za.map(H=>{let oe=ye.find(Ae=>Ae.label===H);return(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s===H?"true":"false","aria-pressed":s===H,disabled:w,onClick:()=>{c(H),C(null)},children:[(0,r.jsx)("span",{className:`${n}-sprite-choice-art`,children:oe?(0,r.jsx)("img",{src:oe.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:H}),(0,r.jsx)("small",{children:oe?"Approved":"Open"})]},H)}),(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s==="custom"?"true":"false","aria-pressed":s==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${n}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),s==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:u,maxLength:40,disabled:w,onChange:H=>{h(H.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${n}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[i==="front"?"Front":"Side"," \xB7 ",ze||"custom"]}),(0,r.jsx)("span",{children:rt?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),i==="side"&&!Q?(0,r.jsx)("p",{className:`${n}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,ze!=="neutral"&&!Ve?(0,r.jsx)("p",{className:`${n}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:H=>$(H.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${n}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:H=>p(H.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${n}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!Q||ze!=="neutral"&&!Ve,onClick:()=>{kt(async()=>{let H=nt(),oe=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:i,expression:H,appearance:g,useReference:x})});C({view:i,label:H,image:oe.image}),W(`Candidate: ${oe.width} \xD7 ${oe.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${i} ${ze||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!Q||ze!=="neutral"&&!Ve,onClick:()=>U.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:U,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:H=>{kt(async()=>{let oe=nt(),Ae=H.target.files?.[0];Ae&&C({view:i,label:oe,image:await sl(Ae)}),H.target.value=""})}})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,r.jsxs)("div",{className:`${n}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,r.jsxs)("div",{className:`${n}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${n}-sprite-mirrored`,src:b.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{kt(async()=>{let H=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(H),C(null),W(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,T.length&&i==="front"?(0,r.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${n}-row`,children:T.map(H=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||H.expression!=="neutral"&&!Ve,onClick:()=>{kt(async()=>{let oe=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:i,expression:H.expression})});t(oe),W(`${H.expression} copied to this Village.`)})},children:H.expression},H.expression))})]}):null,L.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:H=>{kt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:H.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:H=>{kt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(H.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{kt(()=>v2(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,v?(0,r.jsx)("p",{role:"alert",children:v}):null]})}function w2({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[o,s]=(0,m.useState)(e.improvement?.description??""),[c,u]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[p,b]=(0,m.useState)(""),C=R=>{x(!0),b(""),t(R,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>b(B(w,"That Venue request could not be decided."))).finally(()=>x(!1))},T=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:R=>i(R.target.value)})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:o,onChange:R=>s(R.target.value)})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:R=>u(Number(R.target.value))})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:R=>g(Number(R.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:$||!a.trim()||!o.trim(),onClick:()=>C(!0),children:T?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:$,onClick:()=>C(!1),children:"Decline"})]}),p?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:p}):null]})}function $2({room:e,nameColors:t,speechColors:a,picture:i,draft:o,mode:s,targetId:c,busy:u,error:h,greetingNotice:g,ruling:$,open:x,ended:p,playerName:b,playerPortrait:C,portraits:T,sprites:R,onDraft:w,onMode:y,onTarget:v,onSend:S,onViewVenue:O,onEnterPrivate:W,privateSpaceOwnerName:U,onEnd:L,onLeavePending:ye,endFailed:Q,onRetryGreeting:Ve,onContinueWithoutGreeting:ze,notices:rt,onDismissNotice:Za,debugDiscardEnabled:kt,onDebugDiscard:nt,onUseMailbox:H,onProjects:oe}){let[Ae,F]=(0,m.useState)(0),[G,le]=(0,m.useState)(!1),[_t,V]=(0,m.useState)(!1),[J,vt]=(0,m.useState)(!1),[Ke,st]=(0,m.useState)(!1),[de,De]=(0,m.useState)(null),re=(0,m.useRef)(null),he=(0,m.useRef)(null),qt=(0,m.useRef)(null),Kt=(0,m.useRef)(null),Ma=(0,m.useRef)(null),yt=(0,m.useRef)(null),Ka=(0,m.useRef)(null),A=(0,m.useRef)(null),j=(0,m.useRef)(null),ve=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(rt.map(P=>P.id)),pe=rt.some(P=>P.kind==="memory"&&!ve.current.has(P.id));ve.current=E,pe?vt(!0):rt.length===0&&vt(!1)},[rt,e.id]),(0,m.useEffect)(()=>{G&&window.requestAnimationFrame(()=>yt.current?.focus())},[G]),(0,m.useEffect)(()=>{if(!_t)return;let E=P=>{A.current?.contains(P.target)||V(!1)},pe=P=>{P.key==="Escape"&&V(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",pe),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",pe)}},[_t]),(0,m.useEffect)(()=>{if(!Ke)return;let E=P=>{Kt.current?.contains(P.target)||st(!1)},pe=P=>{P.key==="Escape"&&st(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",pe),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",pe)}},[Ke]);let _e=(0,m.useCallback)(()=>{De(null),window.requestAnimationFrame(()=>re.current?.focus())},[]);(0,m.useEffect)(()=>{if(!de)return;window.requestAnimationFrame(()=>he.current?.focus());let E=pe=>{if(pe.key==="Tab"){pe.preventDefault(),he.current?.focus();return}pe.key==="Escape"&&(pe.preventDefault(),_e())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[_e,de]);let Te=(0,m.useMemo)(()=>{let E=[],pe=new Map;for(let P of e.lines){if(P.kind!=="side"&&P.kind!=="whisper"||!P.asideFor)continue;let Et=pe.get(P.asideFor)??[];Et.push({register:P.kind,text:P.content,...P.targetId?{target:e.participants.find(Je=>Je.characterId===P.targetId)?.name??P.targetId}:{},speakerId:P.speakerId,name:P.name,expression:P.expression,gazeAt:P.gazeAt}),pe.set(P.asideFor,Et)}for(let P of e.lines){if(P.kind==="side"||P.kind==="whisper")continue;let Et=P.speakerId.length===0,Je=b0(P.content,P.beats??null);Je.paragraphs.forEach((Va,Ja)=>{E.push({key:`${E.length}`,speakerId:Et?"":P.speakerId,name:Et?b:P.name,player:Et,text:Va,asides:[...Je.asides[Ja]??[],...Ja===Je.paragraphs.length-1?pe.get(P.id??"")??[]:[]],...P.kind?{register:P.kind==="narration"?"narration":"speech"}:{},...P.expression?{expression:P.expression}:{},...P.gazeAt?{gazeAt:P.gazeAt}:{}})})}return E},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{F(E=>N0(j.current,e.id,Te.length,E)),j.current={roomId:e.id,stepCount:Te.length}},[e.id,Te.length]);let et=Math.min(Ae,Math.max(0,Te.length-1)),ae=Te[et],K=et>0,ct=et<Te.length-1,Tt=!p&&e.status==="active"&&!ct,ba=(0,m.useCallback)(()=>{let E=qt.current;if(!E)return;let pe=window.getComputedStyle(E),P=Number.parseFloat(pe.lineHeight),Et=Number.parseFloat(pe.paddingTop)+Number.parseFloat(pe.paddingBottom),Je=Math.ceil(P+Et),Va=Math.ceil(P*2+Et);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,Je),Va)}px`,E.style.overflowY=E.scrollHeight>Va+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{ba()},[Tt,o,ba]),(0,m.useEffect)(()=>{let E=qt.current?.parentElement;if(!E)return;let pe=E.clientWidth,P=new ResizeObserver(()=>{E.clientWidth!==pe&&(pe=E.clientWidth,ba())});return P.observe(E),()=>P.disconnect()},[Tt,ba]);let ho=()=>{!Tt||u||s!=="conclude"&&!o.trim()||s==="fulfill"&&!c||(st(!1),S())};(0,m.useLayoutEffect)(()=>{Ka.current&&(Ka.current.scrollTop=0)},[et,e.id]);let mo=ae?.register??(ae===void 0||ae.speakerId==="__venue_scene__"?"narration":ae.player||f0(ae.text)==="speech"?"speech":"narration"),po=ae===void 0?void 0:ae.player?C:T[ae.speakerId],ia=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Ni=e.status==="closed"&&ia.length===0?e.participants:ia,go=Ni.find(E=>E.characterId===ae?.speakerId),Oa=E=>Iu(a[E]),Bn=E=>Iu(t[E]),Ln=Ni.slice(0,4),Si=Ni.filter(E=>!Ln.some(pe=>pe.characterId===E.characterId)),Uu=Ln.findIndex(E=>E.characterId===go?.characterId)>=2?"left":"right",ll=(0,r.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${n}-chat`,"data-open":x?"true":"false","data-ended":p?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${ia.length?ia.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,r.jsx)("span",{className:`${n}-chat-scrim`}),(0,r.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${n}-chat-head`,children:[(0,r.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:A,className:`${n}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>V(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":_t,children:"\xB7\xB7\xB7"}),_t?(0,r.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{V(!1),O()},disabled:u,children:"View Venue"}),W?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{V(!1),W()},disabled:u,children:["Enter ",U??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{V(!1),L()},disabled:u,children:p?"Return to map":"End visit now"}),Q||e.status==="closing"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{V(!1),ye()},children:"Leave with memory pending"}):null,kt&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{V(!1),nt()},disabled:u,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,rt.length>0?(0,r.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>vt(E=>!E),"aria-expanded":J,"aria-label":`${rt.length} village ${rt.length===1?"notice":"notices"}`,children:["\u2726 ",rt.length]}),J?(0,r.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:rt.map(E=>(0,r.jsxs)("div",{className:`${n}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,r.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:pe=>{re.current=pe.currentTarget,De(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,r.jsx)("span",{children:E.text}),(0,r.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{de?.id===E.id&&De(null),Za(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,de?.detail?(0,r.jsx)("div",{className:`${n}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&_e()},children:(0,r.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${n}-memory-dialog-title`,children:de.text}),(0,r.jsx)("button",{ref:he,type:"button",onClick:_e,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:de.detail})]})}):null,ia.length>0?(0,r.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ia.map(E=>(0,r.jsx)("span",{className:`${n}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,r.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${n}-chat-cast`,children:Ln.map((E,pe)=>{let P=R[E.characterId],Et=E.characterId===go?.characterId,Je=ae?.asides.find(fo=>fo.speakerId===E.characterId),Va=Et?ae?.expression??"neutral":Je?.expression??"neutral",Ja=Et?ae?.gazeAt:Je?.gazeAt??(E.characterId===ae?.gazeAt?go?.characterId:void 0),cl=Ln.findIndex(fo=>fo.characterId===Ja),yn=T0(P?.images??[],Va,k0(pe,cl));return(0,r.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":E.characterId===go?.characterId?"true":"false","data-sprite":yn?"true":"false",children:[yn?(0,r.jsx)("img",{src:yn.image.url,alt:"","data-framing":P?.framing.mode??"full","data-facing":yn.mirrored?"left":"right"}):(0,r.jsx)(uo,{portrait:T[E.characterId],name:E.name,className:`${n}-avatar`}),(0,r.jsx)("span",{style:Bn(E.characterId),children:E.name})]},E.characterId)})}),Si.length>0?(0,r.jsx)("div",{className:`${n}-chat-cast-rest`,children:Si.map(E=>(0,r.jsxs)("span",{children:[(0,r.jsx)(uo,{portrait:T[E.characterId],name:E.name,className:`${n}-avatar`}),(0,r.jsx)("span",{style:Bn(E.characterId),children:E.name})]},E.characterId))}):null]}),(0,r.jsxs)("div",{className:`${n}-chat-vn`,children:[G?(0,r.jsx)("div",{ref:yt,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(le(!1),window.requestAnimationFrame(()=>Ma.current?.focus()))},children:e.lines.map((E,pe)=>(0,r.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,r.jsxs)("strong",{style:E.role==="assistant"&&E.kind!=="narration"?Bn(E.speakerId):void 0,children:[E.role==="user"?b:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,r.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?Oa(E.speakerId):void 0,children:Vr(E.content,`history-${pe}-`)})]},E.id??pe))}):null,ae&&ae.asides.length>0?(0,r.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":Uu,"aria-live":"polite",children:ae.asides.map((E,pe)=>(0,r.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":E.register,children:[(0,r.jsx)(uo,{portrait:E.speakerId?T[E.speakerId]:po,name:E.name??ae.name,glyph:ae.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:Bn(E.speakerId??ae.speakerId),children:E.name??ae.name}),E.register==="whisper"&&E.target?(0,r.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,r.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:Oa(E.speakerId??ae.speakerId),children:Vr(E.text,`vn-aside-${pe}-`)})]})]},`${pe}-${E.register}`))}):null,(0,r.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":mo,children:(0,r.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${n}-chat-vn-column`,children:[mo==="narration"?(0,r.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${n}-chat-vn-name`,style:ae?.player?void 0:Bn(ae?.speakerId??""),children:ae?.name??""}),(0,r.jsxs)("div",{ref:Ka,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[ae?mo==="narration"?(0,r.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:Vr(ae.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${n}-chat-vn-text`,style:ae.player?void 0:Oa(ae.speakerId),children:Vr(ae.text,"vn-")}):(0,r.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:ia.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!p&&u?ll:null]})]})})}),(0,r.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:Ma,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":G,onClick:()=>le(E=>!E),children:G?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${et+1} / ${Math.max(1,Te.length)}`}),(0,r.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>F(et-1),disabled:!K,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),ct?(0,r.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>F(et+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):p?(0,r.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:L,disabled:u,children:"Return to map"}):null]})]}),h&&e.status==="opening"?(0,r.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:h}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:L,disabled:u,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Ve,disabled:u,children:"Retry opening"}),e.id?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:ze,disabled:u,children:"Continue without opening"}):null]}):null,g?(0,r.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,r.jsx)("p",{children:g})}):null,$?(0,r.jsx)("p",{className:`${n}-empty`,children:$}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${n}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,Tt&&s==="fulfill"&&ia.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Tt?(0,r.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&ia.length>0?(0,r.jsxs)("select",{value:c,onChange:E=>v(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:u||p||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),ia.map(E=>(0,r.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,r.jsx)("div",{className:`${n}-composer-row`,children:(0,r.jsxs)("span",{className:`${n}-chat-input`,children:[(0,r.jsxs)("span",{ref:Kt,className:`${n}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>st(E=>!E),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":Ke,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),Ke?(0,r.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===E,disabled:u||E==="fulfill"&&ia.length===0,onClick:()=>{y(E),st(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),H?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:H,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,oe?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:oe,children:"Projects"}):null,(0,r.jsx)("textarea",{ref:qt,className:`${n}-textarea`,rows:1,value:o,onChange:E=>w(E.target.value),onKeyDown:E=>{x0(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),ho())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:u||p||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:ho,disabled:u||p||e.status!=="active"||s!=="conclude"&&o.trim().length===0||s==="fulfill"&&!c,"aria-label":u?"Sending":"Send",title:u?"Sending":"Send",children:u?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,r.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:h})}):null]})]})}var a1="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function x2({snapshot:e,room:t,onSnapshot:a,onReturn:i}){let[o,s]=(0,m.useState)(""),[c,u]=(0,m.useState)(""),[h,g]=(0,m.useState)("workplace"),[$,x]=(0,m.useState)("power-source"),[p,b]=(0,m.useState)(""),[C,T]=(0,m.useState)(""),[R,w]=(0,m.useState)(""),[y,v]=(0,m.useState)(""),[S,O]=(0,m.useState)(""),[W,U]=(0,m.useState)("limited-opportunity"),[L,ye]=(0,m.useState)(!1),[Q,Ve]=(0,m.useState)(""),[ze,rt]=(0,m.useState)(!1),[Za,kt]=(0,m.useState)(""),nt=(t?.lines??[]).filter(F=>F.role==="assistant"&&!!F.speakerId&&!!F.id),H=F=>t?.submissions?.find(G=>G.at===F.at),oe=async(F,G)=>{rt(!0),kt("");try{a(await D(F,{method:"POST",body:JSON.stringify(G)}))}catch(le){kt(B(le,"The project could not be updated."))}finally{rt(!1)}},Ae=(F,G,le={})=>oe(`/projects/${encodeURIComponent(F)}/${G}`,le);return(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Projects"}),t?.status==="active"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):null,(0,r.jsx)("p",{className:`${n}-macro-help`,children:"A request starts planning. Spoken offers, recovered supplies, committed supplies, and a resident's build shift are recorded separately. A scene description alone cannot finish a project."}),e.villageCapabilities.length?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Village capabilities: ",e.villageCapabilities.join(", ")]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("h3",{children:"Propose a new venue"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Proposed venue name",value:o,onChange:F=>s(F.target.value),placeholder:"Power plant"}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Proposed venue class",value:h,onChange:F=>g(F.target.value),children:[(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${n}-textarea`,"aria-label":"Proposed venue description",value:c,onChange:F=>u(F.target.value),placeholder:"What would this place be like in this village?"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze||!o.trim()||!c.trim(),onClick:()=>{oe("/projects",{name:o,classes:[h],description:c})},children:"Create planning draft"})]}),(e.projects??[]).filter(F=>F.kind==="build-venue"&&F.plan).map(F=>{let G=F.plan,le=`/projects/${encodeURIComponent(F.id)}`,_t=e.villagers.find(V=>V.characterId===G.builderId);return(0,r.jsxs)("details",{className:`${n}-notice-row`,open:F.status!=="complete",children:[(0,r.jsxs)("summary",{children:[(0,r.jsx)("strong",{children:F.title})," \xB7 ",F.status," \xB7 plan ",G.revision]}),(0,r.jsx)("p",{children:F.venueDraft?.description}),(0,r.jsxs)("p",{children:["Need: ",G.need]}),G.blockedReason?(0,r.jsxs)("p",{role:"status",children:["Blocked: ",G.blockedReason]}):null,G.workOrder?(0,r.jsxs)("p",{children:["Builder: ",_t?.name??G.builderId??"needs reassignment",". Shift ends"," ",new Date(G.workOrder.completesAt).toLocaleString(),"."]}):null,G.capability?(0,r.jsxs)("p",{children:["Completion outcome: ",G.capability]}):null,F.status==="draft"?(0,r.jsxs)("label",{className:`${n}-field`,children:["Site beside",(0,r.jsx)("select",{className:`${n}-notice-input`,value:G.siteVenueId,disabled:ze,onChange:V=>{Ae(F.id,"site",{venueId:V.target.value})},children:e.settings.venues.filter(V=>V.constructionStatus!=="worksite").map(V=>(0,r.jsx)("option",{value:V.id,children:V.name},V.id))})]}):null,F.status==="draft"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze,onClick:()=>{Ae(F.id,"agree")},children:"Agree to these terms"}):null,(0,r.jsx)("ul",{className:`${n}-notices`,children:G.requirements.map(V=>{let J=G.receipts.some(vt=>(V.id==="site-permission"?vt.kind==="promise":vt.kind==="committed")&&vt.requirementId===V.id&&!G.receipts.some(Ke=>Ke.kind==="released"&&Ke.sourceLineId===vt.id));return(0,r.jsxs)("li",{children:[(0,r.jsx)("strong",{children:V.title})," \xB7 ",J?"committed":"open"]},V.id)})}),G.sources.map(V=>{let J=e.settings.venues.find(he=>he.id===V.venueId),vt=e.villagers.find(he=>he.characterId===V.supplierId),Ke=G.receipts.some(he=>he.kind==="promise"&&he.sourceId===V.id),st=G.receipts.find(he=>he.kind==="acquired"&&he.sourceId===V.id),de=st&&G.receipts.some(he=>he.kind==="committed"&&he.sourceLineId===st.id&&!G.receipts.some(qt=>qt.kind==="released"&&qt.sourceLineId===he.id)),De=nt.findLast(he=>t?.placeId===V.venueId&&he.speakerId===V.supplierId&&he.content.toLowerCase().includes(V.itemName.toLowerCase())&&H(he)?.mode==="chat"),re=nt.findLast(he=>t?.placeId===V.venueId&&(V.kind==="existing-item"||he.speakerId===V.supplierId)&&he.content.toLowerCase().includes(V.itemName.toLowerCase())&&/\b(?:i (?:give|hand|provide|deliver|entrust) you|here (?:is|are)|you (?:may|can) take)\b/iu.test(he.content)&&H(he)?.mode==="chat");return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:V.itemName}),(0,r.jsxs)("p",{children:[V.kind==="limited-opportunity"?`Limited offer from ${vt?.name??"a resident"}`:"Existing recorded item"," ","at ",J?.name??"missing source","; yield remaining ",V.remaining,". ",V.prerequisite," ","Cost: ",V.cost]}),(0,r.jsx)("p",{children:V.requirementId==="site-permission"?`Site agreement: ${Ke?"recorded":"needed"}`:`${V.kind==="existing-item"?"Recorded item":`Promise: ${Ke?"recorded":"needed"}`} \xB7 acquired: ${st?"yes":"no"} \xB7 committed: ${de?"yes":"no"}`}),F.status==="active"&&V.kind==="limited-opportunity"&&!Ke?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze||!t||!De,onClick:()=>De&&void Ae(F.id,"promise",{sourceId:V.id,sessionId:t?.id,submissionId:H(De)?.id,lineId:De.id}),children:"Record spoken offer"}):null,F.status==="active"&&V.requirementId!=="site-permission"&&!st?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze||!t||!re,onClick:()=>{Ae(F.id,"acquire",{sourceId:V.id,sessionId:t?.id,submissionId:re?H(re)?.id:"",lineId:re?.id})},children:"Record recovered supply"}):null,F.status==="active"&&st&&!de?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze,onClick:()=>{Ae(F.id,"commit",{acquiredReceiptId:st.id,submissionId:ol()})},children:"Commit this supply"}):null]},V.id)}),F.status==="draft"||F.status==="active"?(0,r.jsxs)("details",{className:`${n}-field`,children:[(0,r.jsxs)("summary",{children:["Add an alternative route",F.status==="active"?" (revised plan)":""]}),(0,r.jsx)("select",{className:`${n}-notice-input`,"aria-label":"Requirement for alternative",value:G.requirements.some(V=>V.id===$)?$:G.requirements[0]?.id??"",onChange:V=>x(V.target.value),children:G.requirements.map(V=>(0,r.jsx)("option",{value:V.id,children:V.title},V.id))}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Source venue",value:p,onChange:V=>b(V.target.value),children:[(0,r.jsx)("option",{value:"",children:"Choose source venue"}),e.settings.venues.filter(V=>V.constructionStatus!=="worksite").map(V=>(0,r.jsx)("option",{value:V.id,children:V.name},V.id))]}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Source kind",value:W,onChange:V=>U(V.target.value),children:[(0,r.jsx)("option",{value:"limited-opportunity",children:"Limited resident opportunity"}),(0,r.jsx)("option",{value:"existing-item",children:"Existing recorded item"})]}),W==="limited-opportunity"?(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Supplier",value:C,onChange:V=>T(V.target.value),children:[(0,r.jsx)("option",{value:"",children:"Choose resident supplier"}),e.villagers.map(V=>(0,r.jsx)("option",{value:V.characterId,children:V.name},V.characterId))]}):null,(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Source item",value:R,onChange:V=>w(V.target.value),placeholder:"Exact item or offered supply"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Route prerequisite",value:S,onChange:V=>O(V.target.value),placeholder:"What must be done first?"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Route cost",value:y,onChange:V=>v(V.target.value),placeholder:"Favor, tradeoff, or recorded item debit"}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:L,onChange:V=>ye(V.target.checked)})," ","Established magic"]}),L?(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Exact lore quote",value:Q,onChange:V=>Ve(V.target.value),placeholder:"Exact setting or lore excerpt"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze||!p||W==="limited-opportunity"&&!C||!R.trim()||!y.trim()||!S.trim(),onClick:()=>{oe(`${le}/routes`,{requirementId:G.requirements.some(V=>V.id===$)?$:G.requirements[0]?.id,venueId:p,supplierId:C,itemName:R,kind:W,cost:y,prerequisite:S,magic:L,loreQuote:Q})},children:"Add route"})]}):null,F.status==="active"||F.status==="blocked"?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:"Resident builder"}),(0,r.jsx)("p",{children:_t?`${_t.name} agreed to build.`:"Ask a resident to explicitly agree to build this venue in a visit."}),nt.filter(V=>/\bbuild\b/iu.test(V.content)&&H(V)).slice(-4).map(V=>(0,r.jsxs)("button",{type:"button",className:`${n}-button`,disabled:ze,onClick:()=>{Ae(F.id,"recruit",{sessionId:t?.id,submissionId:H(V)?.id,lineId:V.id,residentId:V.speakerId})},children:["Record ",V.name,"'s agreement: \u201C",V.content.slice(0,70),"\u201D"]},V.id)),F.status==="active"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:ze||!_t,onClick:()=>{Ae(F.id,"start")},children:"Start resident construction shift"}):null]}):null]},F.id)}),Za?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Za}):null]})}function N2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let f=e.getBoundingClientRect();a(f.width<=704||f.width<=880&&f.height<=512)};l();let d=new ResizeObserver(l);return d.observe(e),()=>d.disconnect()},[e]);let[i,o]=(0,m.useState)(null),[s,c]=(0,m.useState)(null),[u,h]=(0,m.useState)(null),[g,$]=(0,m.useState)(0),[x,p]=(0,m.useState)("residents"),[b,C]=(0,m.useState)(null),[T,R]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,S]=(0,m.useState)(0),[O,W]=(0,m.useState)(0),[U,L]=(0,m.useState)(null),[ye,Q]=(0,m.useState)(!1),[Ve,ze]=(0,m.useState)(""),[rt,Za]=(0,m.useState)(""),[kt,nt]=(0,m.useState)(""),[H,oe]=(0,m.useState)(null),[Ae,F]=(0,m.useState)(!1),[G,le]=(0,m.useState)("home"),[_t,V]=(0,m.useState)(null),[J,vt]=(0,m.useState)("view"),[Ke,st]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(Ke==="exterior")return;let l=i?.settings.venues.find(f=>f.id===_t);(Ke.startsWith("class:")?l&&vn(l).includes(Ke.slice(6)):l&&Ke.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(Ke.slice(8))&&l.privateSpaces?.some(f=>f.ownerId===Ke.slice(8)))||st("exterior")},[i,_t,Ke]);let[de,De]=(0,m.useState)(null),[re,he]=(0,m.useState)(null),[qt,Kt]=(0,m.useState)(!1),[Ma,yt]=(0,m.useState)(""),[Ka,A]=(0,m.useState)(""),[j,ve]=(0,m.useState)(""),[_e,Te]=(0,m.useState)(null),[et,ae]=(0,m.useState)(!1),[K,ct]=(0,m.useState)("village"),[Tt,ba]=(0,m.useState)("index"),[ho,mo]=(0,m.useState)({}),[po,ia]=(0,m.useState)(null),[Ni,go]=(0,m.useState)({}),[Oa,Bn]=(0,m.useState)({}),[Ln,Si]=(0,m.useState)(""),[Uu,ll]=(0,m.useState)(null),[E,pe]=(0,m.useState)(""),[P,Et]=(0,m.useState)(""),[Je,Va]=(0,m.useState)(""),[Ja,cl]=(0,m.useState)(null),[yn,fo]=(0,m.useState)(""),[ul,Gp]=(0,m.useState)([]),[qu,Yp]=(0,m.useState)(1600),[Da,Xp]=(0,m.useState)([]),[bo,Qp]=(0,m.useState)(1600),[Bu,p1]=(0,m.useState)(null),[Zp,Kp]=(0,m.useState)(""),[dl,vo]=(0,m.useState)([]),[Jp,g1]=(0,m.useState)(""),[va,hl]=(0,m.useState)([]),[ki,Jt]=(0,m.useState)(!1),[ml,Ti]=(0,m.useState)(!1),[f1,Lu]=(0,m.useState)(null),[b1,Pp]=(0,m.useState)(null),[pl,Fp]=(0,m.useState)(null),[gl,Wp]=(0,m.useState)(""),[Ie,fl]=(0,m.useState)(0),[Pa,eg]=(0,m.useState)(""),[Ct,tg]=(0,m.useState)(""),[wn,ag]=(0,m.useState)("rebuild"),[ya,ju]=(0,m.useState)(co("rebuild").premise),[_r,ng]=(0,m.useState)(""),[v1,y1]=(0,m.useState)(Cp),[$n,ig]=(0,m.useState)([]),[w1,bl]=(0,m.useState)([]),[Pe,Ei]=(0,m.useState)([]),[Ir,_a]=(0,m.useState)(null),[$1,og]=(0,m.useState)(0),[rg,Gu]=(0,m.useState)(!1),[Yu,Ci]=(0,m.useState)(null),[Hr,jn]=(0,m.useState)(null),[Fa,vl]=(0,m.useState)(!1),[sg,Xu]=(0,m.useState)(""),[yl,lg]=(0,m.useState)(_0),[He,zi]=(0,m.useState)("generate"),[x1,Qu]=(0,m.useState)(""),[wl,Zu]=(0,m.useState)(null),[N1,cg]=(0,m.useState)(""),[Ur,Ku]=(0,m.useState)(null),[yo,Ju]=(0,m.useState)(""),[wo,Pu]=(0,m.useState)(""),qr=JSON.stringify({scenario:wn,premise:ya.trim(),direction:_r.trim(),setting:Ct.trim(),lorebooks:Da,loreBudget:bo}),Fu=(0,m.useRef)(qr);(0,m.useEffect)(()=>{Fu.current!==qr&&!i?.isFounded&&jn(null),Fu.current=qr},[qr,i?.isFounded]);let Wu=JSON.stringify({setting:Ct.trim(),worldFacts:i?.isFounded?$n:null,lorebooks:Da,structure:yo,negative:wo,options:yl}),[Bt,Br]=(0,m.useState)(!1),[ug,$l]=(0,m.useState)(""),[ed,S1]=(0,m.useState)("Connections are still loading."),[dg,hg]=(0,m.useState)(!1),[k1,Lr]=(0,m.useState)(!1),[mg,we]=(0,m.useState)(""),[T1,xl]=(0,m.useState)(!1),[Nl,Sl]=(0,m.useState)(""),[Ia,td]=(0,m.useState)(null),[ad,jr]=(0,m.useState)(null),[E1,nd]=(0,m.useState)(!1),[Wa,$o]=(0,m.useState)(""),[pg,Gn]=(0,m.useState)(null),xo=i?.settings.townMapView??Vu("cover"),gg=i?Ia?.size??{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,fg=i?He==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:Ur&&wl===He?Ur:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,C1=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},kl=Ia?Ia.image:Nl||null,Ai=He==="none"?null:He==="existing"?Nl||null:wl===He&&(He!=="generate"||N1===Wu)&&x1||null,Tl=Ia!==null||E1,Gr=Tl?ad??xo:xo,id=Ia?Op(Ia.size):null,[Yr,qe]=(0,m.useState)(""),[Lt,ee]=(0,m.useState)(""),[_,Z]=(0,m.useState)(!1),[q,Ze]=(0,m.useState)(null),[z1,Xr]=(0,m.useState)(!1),[A1,Ha]=(0,m.useState)(!1),[Qr,xn]=(0,m.useState)(""),[Zr,El]=(0,m.useState)("chat"),[Kr,od]=(0,m.useState)(""),[R1,bg]=(0,m.useState)(""),[M1,Ua]=(0,m.useState)([]),qa=(0,m.useRef)(new Set),[rd,O1]=(0,m.useState)(!1),vg=(0,m.useRef)(0),No=(0,m.useRef)(0),yg=(0,m.useRef)(""),[sd,So]=(0,m.useState)(""),[Ba,ut]=(0,m.useState)(!1),ko=(0,m.useRef)(!1),Ri=(0,m.useRef)(null),Jr=(0,m.useRef)(null),jt=(0,m.useRef)(null),To=(0,m.useCallback)(l=>{let d=[];for(let f of l)qa.current.has(f.id)||(qa.current.add(f.id),d.push(f));d.length>0&&Ua(f=>[...f,...d])},[]),Pr=(0,m.useRef)(!1),[V1,pt]=(0,m.useState)(""),[D1,Mi]=(0,m.useState)(""),[Fr,Eo]=(0,m.useState)(!1),[Cl,ld]=(0,m.useState)(""),wg=(0,m.useRef)(""),zl=(0,m.useRef)(!1),[Al,$g]=(0,m.useState)(!1),cd=(0,m.useRef)(null),ud=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=ud.current,d=cd.current;l===null||!d||(ud.current=null,d.focus(),d.setSelectionRange(l,l))},[P]);let Rl=(0,m.useCallback)(async(l=!1)=>{if(zl.current)return null;zl.current=!0;let d=setTimeout(()=>$g(!0),PS);try{let f=await D("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return o(f),f}catch{return null}finally{clearTimeout(d),$g(!1),zl.current=!1}},[]),xg=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";ld("Writing...");let d=await Rl(!0);if(!d){ld("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}ld((d.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,Rl]),Ee=(0,m.useCallback)(async(l={})=>{try{let d=await D("",{signal:l.signal});o(d),qe("")}catch(d){if(l.signal?.aborted||l.quiet)return;o(null),qe(B(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===wg.current||(wg.current=l,i?.isFounded&&Rl())},[i,Rl]);let en=(0,m.useCallback)(async l=>{try{let d=await D("/catalog",{signal:l});c(d.characters),qe("")}catch(d){if(l?.aborted)return;qe(B(d,"Could not read your character library."))}},[]),Co=(0,m.useCallback)(async l=>{try{let d=await D("/personas",{signal:l});cl(d.personas)}catch(d){if(l?.aborted)return;cl([]),qe(B(d,"Could not read your Personas."))}},[]),zo=(0,m.useCallback)(async l=>{try{let d=await D("/lorebooks",{signal:l});p1(d.books),Kp("")}catch(d){if(l?.aborted)return;Kp(B(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Ng=(0,m.useCallback)(async l=>{try{let d=await D("/story?offset=0&limit=50",{signal:l});h(d.entries),$(d.total)}catch(d){if(l?.aborted)return;h(null),qe(B(d,"Could not read the village story."))}},[]),Ml=(0,m.useCallback)(async l=>{try{let d=await D("/memories",{signal:l});C(d),qe("")}catch(d){if(l?.aborted)return;C(null),qe(B(d,"Could not read villager memories."))}},[]),_1=(0,m.useCallback)(async(l,d)=>{let f=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(f)){Z(!0);try{await D(`/memories/${l}/${encodeURIComponent(d)}`,{method:"DELETE"}),await Ml()}catch(N){qe(B(N,"That memory could not be removed."))}finally{Z(!1)}}},[Ml]),I1=(0,m.useCallback)(async l=>{Z(!0);try{let d=await D(`/story/${encodeURIComponent(l)}`,{method:"DELETE"});h(d.entries),$(d.total),qe("")}catch(d){qe(B(d,"That memory could not be removed."))}finally{Z(!1)}},[]),H1=(0,m.useCallback)(async()=>{let l=u?.length??0;try{let d=await D(`/story?offset=${l}&limit=50`);h(f=>[...f??[],...d.entries]),$(d.total)}catch(d){qe(B(d,"Could not read more memories."))}},[u]),Ol=(0,m.useCallback)(async l=>{try{let d=await D("/agendas",{signal:l});oe(d.villagers)}catch(d){if(l?.aborted)return;oe(null),qe(B(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(G!=="menu"||K!=="agendas"&&K!=="schedules"||!H?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Ol()},5e3);return()=>window.clearInterval(l)},[H,Ol,K,G]);let U1=(0,m.useCallback)(async l=>{Z(!0);try{let d=await D(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});oe(d.villagers),qe("")}catch(d){qe(B(d,"That villager could not be asked again."))}finally{Z(!1)}},[]),q1=(0,m.useCallback)(async(l,d)=>{Z(!0);try{let f=await D(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});oe(f.villagers),qe("")}catch(f){qe(B(f,"That wish completion could not be corrected."))}finally{Z(!1)}},[]),B1=(0,m.useCallback)(async(l,d)=>{Z(!0);try{let f=await D(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});oe(f.villagers),qe("")}catch(f){qe(B(f,"Schedule use could not be changed."))}finally{Z(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ee({signal:l.signal}),()=>l.abort()},[Ee]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ee({quiet:!0})},d=setInterval(()=>{document.hidden||zl.current||Ee({quiet:!0})},JS);return document.addEventListener("visibilitychange",l),()=>{clearInterval(d),document.removeEventListener("visibilitychange",l)}},[Ee]),(0,m.useEffect)(()=>{if(!q?.id||q.status==="closed"||G!=="room")return;yg.current!==q.id?(yg.current=q.id,No.current=Date.parse(q.lastActivityAt||q.startedAt)||Date.now()):No.current=Math.max(No.current,Date.parse(q.lastActivityAt||q.startedAt)||0);let l=!1,d=I=>{l||Mr(q.id,jt.current)||(Ze(null),Ha(!1),Ua([]),qa.current.clear(),So(I==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),le("home"),Ee())},f=(I=!1)=>{Mr(q.id,jt.current)||D("/rooms/active").then(async({session:Y})=>{if(l||Mr(q.id,jt.current))return;if(Y?.id===q.id){I&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}),No.current=Date.now());return}let $e=await D(`/rooms/archive/${encodeURIComponent(q.id)}`).catch(()=>null);l||Mr(q.id,jt.current)||d($e?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(Y=>{let $e=Or(Y);$e&&d($e)})},N=I=>{if(!Mr(q.id,jt.current)){if(Date.now()-No.current>=30*6e4){I.cancelable&&I.preventDefault(),I.stopImmediatePropagation(),f(!0);return}No.current=Date.now(),!(Date.now()-vg.current<15e3)&&(vg.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}).catch(Y=>{let $e=Or(Y);$e?d($e):f()}))}},z=()=>f();window.addEventListener("focus",z),document.addEventListener("visibilitychange",z);for(let I of["pointerdown","keydown","input","scroll"])window.addEventListener(I,N,!0);return()=>{l=!0,window.removeEventListener("focus",z),document.removeEventListener("visibilitychange",z);for(let I of["pointerdown","keydown","input","scroll"])window.removeEventListener(I,N,!0)}},[q?.id,q?.status,q?.lastActivityAt,q?.startedAt,G,Ee]),(0,m.useEffect)(()=>{let l=new AbortController;return D("/rooms/active",{signal:l.signal}).then(({session:d,debugDiscardEnabled:f})=>{O1(f),!(l.signal.aborted||!d)&&(Ze(d),El("chat"),Ha(!0),le("room"),d.status==="opening"&&(ut(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{l.signal.aborted||Ze(N)}).catch(async N=>{if(l.signal.aborted)return;let z=await B0(d.id);l.signal.aborted||(z?Ze(z):pt(j0(N)))}).finally(()=>{l.signal.aborted||ut(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(K!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,d=new URLSearchParams;return Ve&&d.set("venueId",Ve),rt&&d.set("characterId",rt),d.set("offset",String(v)),d.set("limit","20"),R(null),D(`/rooms/archive?${d.toString()}`,{signal:l.signal}).then(({visits:f,total:N})=>{l.signal.aborted||(R(f),y(N),nt(""))}).catch(f=>{l.signal.aborted||nt(B(f,"Venue visits could not be read."))}),()=>l.abort()},[Ve,rt,v,O,K,i?.isFounded]);let dd=(0,m.useCallback)(async l=>{try{let d=await D(`/rooms/archive/${encodeURIComponent(l)}`);L(d.visit),nt("")}catch(d){nt(B(d,"That visit could not be read."))}},[]),L1=(0,m.useCallback)(async l=>{Z(!0);try{await D(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await dd(l),W(d=>d+1),nt("")}catch(d){nt(B(d,"Memory filing is still pending."))}finally{Z(!1)}},[dd]),Sg=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){Z(!0);try{await D(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),L(null),S(0),W(d=>d+1),nt("")}catch(d){nt(B(d,"Visit transcripts could not be deleted."))}finally{Z(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ae)return;let l=new AbortController;return en(l.signal),()=>l.abort()},[Ae,en]);let kg=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(kg===null)return;let l=new AbortController;return(async()=>{try{let d=await D("/town-map",{signal:l.signal});Sl(d.image)}catch{l.signal.aborted||Sl("")}})(),()=>l.abort()},[kg]);let j1=(0,m.useCallback)(async l=>{Z(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),qe(""),await en()}catch(d){qe(B(d,"That character could not move in."))}finally{Z(!1)}},[en]),G1=(0,m.useCallback)(async l=>{Z(!0);try{o(await D(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),qe(""),s&&await en()}catch(d){qe(B(d,"That villager could not leave."))}finally{Z(!1)}},[s,en]),Y1=(0,m.useCallback)(async l=>{Si(l);try{let d=await D(`/villagers/${encodeURIComponent(l)}/refresh`);Bn(f=>({...f,[l]:d})),qe("")}catch(d){qe(B(d,"That villager's card could not be compared."))}finally{Si("")}},[]),X1=(0,m.useCallback)(async l=>{Si(l);try{o(await D(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Bn(d=>{let f={...d};return delete f[l],f}),qe("")}catch(d){qe(B(d,"That villager's card could not be refreshed."))}finally{Si("")}},[]),tt=(0,m.useCallback)(l=>{ba(l==="noticeboard"?"noticeboard":l==="general"?"general":l==="replyGuidance"||l==="story"||l==="chatlogs"||l==="agendas"||l==="schedules"?"debug":"village"),ee(""),ae(!1),l==="villagers"&&en(),l==="villagers"&&(G!=="menu"||K!=="villagers")&&p("residents"),l==="village"&&Co(),l==="village"&&zo(),l==="story"&&Ng(),(l==="agendas"||l==="schedules")&&Ol(),l==="village"&&(G!=="menu"||K!=="village")&&i&&(Et(i.settings.promptKnowledge),Va(i.settings.playerPersonaId),fo(i.settings.setting),Gp(i.settings.selectedLorebookIds),Yp(i.settings.loreTokenBudget),vo(qn(i.settings.venues).map(f=>({...f})))),ct(l),le("menu")},[Ol,en,zo,Co,Ng,K,G,i]),hd=(0,m.useCallback)(()=>{F(!1),ee(""),Te(null),ae(!1),le("home")},[]),Q1=(0,m.useCallback)(async()=>{if(!(!q||Ba)){if(!q.id||q.status==="closed"||Fr){jt.current=null,Ha(!1),Ze(null),Ua([]),qa.current.clear(),xn(""),Mi(""),le("home"),Ee();return}ut(!0),pt(""),Q(!1),Ze({...q,status:"closing"}),jt.current={roomId:q.id,submissionId:""};try{let l=await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:q.id})});if(ko.current)return;Ze(l.session),Eo(!0),To(l.recordEvents??[]),xn(""),Mi(""),Ee()}catch(l){if(ko.current)return;jt.current=null;let d=Or(l);if(d){Ze(null),Ha(!1),Ua([]),qa.current.clear(),So(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),le("home"),Ee();return}pt(B(l,"You could not leave the venue.")),Q(!0)}finally{ut(!1)}}},[Ee,To,q,Ba,Fr]),Z1=(0,m.useCallback)(async()=>{if(!q?.id||q.status!=="active"||Ba||Pr.current)return;let l=Jr.current??ol();Jr.current=l,jt.current={roomId:q.id,submissionId:l},ut(!0),pt(""),Q(!1);try{let d=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:q.id,submissionId:l,message:Qr}),signal:AbortSignal.timeout(3e5)});Ze(d.session),Eo(!0),To(d.recordEvents??[]),Jr.current=null,xn(""),Ee()}catch(d){let f=await L0(q.id,l);if(f){Ze(f),Eo(!0),xn(""),pt(""),Q(!1),Jr.current=null,Ee();return}jt.current=null;let N=Or(d);if(N){Ze(null),Ha(!1),Ua([]),qa.current.clear(),So(N==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),le("home"),Ee();return}pt(B(d,"The scene could not end yet.")),Q(!0)}finally{ut(!1)}},[Ee,To,q,Ba,Qr]),K1=(0,m.useCallback)(async()=>{if(!(!q?.id||ko.current)){ko.current=!0,ut(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:q.id})}),jt.current=null,Ha(!1),Ze(null),Ua([]),qa.current.clear(),le("home"),Q(!1),Ee()}catch(l){pt(B(l,"The visit could not be left yet.")),ko.current=!1}finally{ut(!1)}}},[Ee,q]),J1=(0,m.useCallback)(async()=>{if(!(!q?.id||!rd||Ba)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){ut(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:q.id})}),Ze(null),Ha(!1),Ua([]),qa.current.clear(),xn(""),le("home"),Ee()}catch(l){pt(B(l,"The debug discard failed."))}finally{ut(!1)}}},[q,rd,Ba,Ee]),P1=(0,m.useCallback)(async()=>{let l=Qr.trim();if(q===null||!q.id||Fr||Ba||Pr.current||l.length===0)return;Pr.current=!0;let d=Ri.current??ol();Ri.current=d;let f=q;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})})}catch(z){Pr.current=!1;let I=Or(z);I?(Ze(null),Ha(!1),Ua([]),qa.current.clear(),So(I==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),le("home"),Ee()):pt(B(z,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};ut(!0),pt(""),xn(""),Ze({...q,lines:[...q.lines,N]}),jt.current={roomId:q.id,submissionId:d};try{let z=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:q.id,message:l,mode:Zr,targetId:Zr==="fulfill"?Kr:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});Ze(z.session),Eo(z.session.status==="closed"),z.session.status!=="closed"&&(jt.current=null),To(z.recordEvents??[]),Kr&&!z.session.activeIds.includes(Kr)&&od(""),bg(z.verdict?.reason??""),El("chat"),Ri.current=null,Mi(""),Ee()}catch(z){let I=await L0(q.id,d);if(I){Ze(I),Eo(!0),pt(""),Ri.current=null,Mi(""),Ee();return}jt.current=null;let Y=Or(z);if(Y){Ze(null),Ha(!1),Ua([]),qa.current.clear(),So(Y==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),le("home"),Ee();return}Ze(f),xn(l),pt(B(z,"That line could not be sent."))}finally{Pr.current=!1,ut(!1)}},[Ee,To,q,Ba,Qr,Fr,Zr,Kr]),F1=(0,m.useCallback)(l=>(i?.villagers??[]).filter(d=>d.place?.id===l),[i]),Vl=(0,m.useCallback)(l=>{Te(null),ae(!1),V(l.id),vt("view"),st("exterior"),De(null),he(null),le("venue")},[]),md=(0,m.useCallback)(async l=>{ut(!0),pt(""),Mi("");try{let d=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Ze(d.session),Ee()}catch(d){let f=await B0(l);f?Ze(f):pt(j0(d))}finally{ut(!1)}},[Ee]),W1=(0,m.useCallback)(async l=>{ut(!0);try{let{session:d}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Ze(d),Mi(d.lines.length===0?"The opening failed. You can start the conversation now.":""),pt("")}catch(d){pt(B(d,"The visit could not continue. Retry or leave the venue."))}finally{ut(!1)}},[]),Dl=(0,m.useCallback)(async(l,d,f="",N)=>{ko.current=!1,jt.current=null,Te(null),ae(!1),Gn(null),xn(""),Eo(!1),pt(""),Mi(""),Ua([]),qa.current.clear(),ut(!0),Ze({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ha(!0),le("room");try{let{session:z}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:d,privateOwnerId:f,entryArea:N}),signal:AbortSignal.timeout(2e4)});Ze(z),El("chat"),od(""),bg(""),So(""),Ha(!0),Ee(),z.status==="opening"&&await md(z.id)}catch(z){pt(B(z,"That room could not be opened. Retry or leave the venue."))}finally{ut(!1)}},[md,Ee]),Tg=(0,m.useCallback)(l=>{ae(!1),Te(l.id),le("home")},[]),Eg=(0,m.useCallback)(()=>{V(null),vt("view"),st("exterior"),De(null),he(null),Te(null),le("home")},[]),e$=(0,m.useCallback)(async()=>{Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:P,playerPersonaId:Je,setting:yn,selectedLorebookIds:ul,loreTokenBudget:qu})}))}catch(l){ee(B(l,"Those settings could not be saved."))}finally{Z(!1)}},[P,ul,qu,Je,yn]),t$=(0,m.useCallback)(async l=>{Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(d){ee(B(d,"That could not be saved."))}finally{Z(!1)}},[]),a$=(0,m.useCallback)(async l=>{let d=i?.settings.characterSpeechColors??!0;o(f=>f&&{...f,settings:{...f.settings,characterSpeechColors:l}}),Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(f){o(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:d}}),ee(B(f,"Character speech colors could not be saved."))}finally{Z(!1)}},[i?.settings.characterSpeechColors]),Cg=(0,m.useCallback)(async l=>{Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),W(d=>d+1)}catch(d){ee(B(d,"Visit retention could not be saved."))}finally{Z(!1)}},[]),n$=(0,m.useCallback)(async()=>{if(!(i&&qn(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){Z(!0),ee("");try{let l=await D("/bootstrap",{method:"POST"});vo(l.places.map(d=>({id:rl(),name:d.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){ee(B(l,"The village did not suggest any places."))}finally{Z(!1)}}},[i]),i$=(0,m.useCallback)(async()=>{if(Ct.trim().length===0){we("Describe what the village is like before generating its map.");return}Br(!0),we("");try{let l=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:yo===i?.settings.townMapLayoutPrompt?void 0:yo,negative:wo===i?.settings.townMapNegativePrompt?void 0:wo,setting:Ct,options:yl,selectedLorebookIds:Da,scenarioImprint:i?.isFounded?{origin:"",worldFacts:$n,openingConditions:[],visualCues:[]}:null})}),d=await Mp(l.image);if(d.width!==l.width||d.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Qu(l.image),Zu("generate"),cg(Wu),Ku(d),zi("generate")}catch(l){we(B(l,"The village map could not be generated."))}finally{Br(!1)}},[Da,wo,yo,Ct,yl,Wu,$n,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),o$=(0,m.useCallback)(async()=>{we(""),Z(!0);try{let l=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Ct,selectedLorebookIds:Da,loreTokenBudget:bo})});bl(l.names)}catch(l){we(B(l,"The village could not suggest names for the public venue."))}finally{Z(!1)}},[Da,bo,Ct]),r$=(0,m.useCallback)(async l=>{if(!l||!i)return;we("");let d=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>d){let f=N=>Math.round(N/1e5)/10;we(`That picture is ${f(l.size)} MB and a village map holds ${f(d)} MB. Choose a smaller copy.`);return}Br(!0);try{let f=await sl(l),N=await Mp(f);Qu(f),Zu("upload"),Ku(N),zi("upload")}catch(f){we(B(f,"That picture could not be used as the village map."))}finally{Br(!1)}},[i]),zg=(0,m.useCallback)(async l=>{if(!l||!i)return;ee("");let d=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>d){let f=N=>Math.round(N/1e5)/10;ee(`That picture is ${f(l.size)} MB and the village map holds ${f(d)} MB. Try a smaller copy.`);return}Z(!0);try{let f=await sl(l),N=await Mp(f);td({image:f,size:N}),jr(Vu("cover"))}catch(f){ee(B(f,"That picture could not be used as the town map."))}finally{Z(!1)}},[i]),Ag=(0,m.useCallback)(async()=>{if(!i)return;let l=Ia?Ia.image:Nl;Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:l,townMapView:ad??i.settings.townMapView})})),Sl(l),td(null),jr(null),nd(!1)}catch(d){ee(B(d,"The town map could not be saved."))}finally{Z(!1)}},[i,ad,Nl,Ia]),_l=(0,m.useCallback)(()=>{td(null),jr(null),nd(!1),ee("")},[]),Rg=(0,m.useCallback)(async()=>{Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Sl(""),_l()}catch(l){ee(B(l,"The town map could not be taken down."))}finally{Z(!1)}},[_l]),s$=(0,m.useCallback)(async(l,d,f="")=>{if(!Wa){$o(l),Gn(null),ee("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:d,privateOwnerId:f})}))}catch(N){Gn({id:l,text:B(N,"That place could not be drawn.")})}finally{$o("")}}},[Wa]),l$=(0,m.useCallback)(async(l,d,f,N="")=>{if(!(!d||!i||Wa)){$o(l),Gn(null),ee("");try{let z=Y=>Math.round(Y/1e5)/10;if(d.size>i.settings.maxVenueImageBytes){Gn({id:l,text:`That picture is ${z(d.size)} MB and a place holds ${z(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let I=await sl(d);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:I,spaceClass:f,privateOwnerId:N})}))}catch(z){Gn({id:l,text:B(z,"That picture could not be kept.")})}finally{$o("")}}},[Wa,i]),c$=(0,m.useCallback)(async(l,d,f="")=>{if(!Wa){$o(l),Gn(null),ee("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:d,privateOwnerId:f})}))}catch(N){Gn({id:l,text:B(N,"That picture could not be taken away.")})}finally{$o("")}}},[Wa]),u$=i?.settings.maxPlaces??48,Ao=i?.settings.setupMaxVillagerCount??zp,Mg=(i?.settings.homeBuildings??[]).map(l=>({...l,name:i?.settings.homeBuildingNames?.[l.kind]??l.name})),d$=i&&!i.isFounded?1+Ao:u$,Il=Math.max(0,d$-qn(i?.settings.venues??[]).length),h$=(i?.settings.venues.length??0)+dl.filter(l=>!i?.settings.venues.some(d=>d.id===l.id)).length,Wr=(0,m.useCallback)(l=>{let d=qp(l);hl(d.map(f=>({id:f.id,name:f.name,form:f.form??"Home",description:f.description,x:f.presentation.x,y:f.presentation.y,building:f.occupancy.homeKind,isPlayerHome:f.occupancy.playerHome,characterId:f.occupancy.residentCharacterId}))),Lu(d[0]?.id??null),Jt(!1)},[]),Og=(0,m.useCallback)(()=>{ee(""),i&&Wr(i.settings.venues),ba("village"),ct("homes"),le("menu")},[Wr,i]),Vg=(0,m.useCallback)((l,d)=>{if(ee(""),va.length>=Il||va.length>=1+Ao)return;let f=rl(),N=va.length===0;hl(z=>[...z,{id:f,name:N?"Your residence":`Residence ${z.length+1}`,form:"Home",description:"",x:l,y:d,building:null,isPlayerHome:N,characterId:null}]),Lu(f)},[va.length,Il,Ao]),m$=(0,m.useCallback)((l,d,f)=>{let N=Pe.find(I=>I.category==="public-center"),z=Yu??(ml?N?.id:void 0);if(E0({x:l,y:d},Pe.filter(I=>I.id!==z).map(I=>I.presentation),f??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Xu("That photograph would cover another venue. Place it a little to the side.");return}if(Xu(""),z)Ei(I=>I.map(Y=>Y.id===z?{...Y,presentation:{...Y.presentation,x:l,y:d}}:Y)),_a(z);else if(ml){let I=H0(rl(),"gathering",l,d);Ei(Y=>[...Y,I]),_a(I.id)}else if(ki){let I=Pe.filter($e=>$e.classes?.includes("residence"));if(I.length>=1+Ao)return;let Y=H0(rl(),"residence",l,d,I.length===0,I.length+1);Ei($e=>[...$e,Y]),_a(Y.id)}Ci(null),Jt(!1),Ti(!1)},[Yu,ki,ml,Ao,Pe]),Oi=(0,m.useCallback)((l,d)=>{Ei(f=>f.map(N=>N.id===l?d(N):N))},[]),p$=(0,m.useCallback)(l=>{Ei(d=>{let f=d.filter(N=>N.id!==l);if(!f.some(N=>N.occupancy.playerHome)){let N=f.findIndex(z=>z.classes?.includes("residence"));N>=0&&(f[N]={...f[N],occupancy:{...f[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return f}),_a(d=>d===l?null:d)},[]),g$=(0,m.useCallback)((l,d)=>{Vg(l,d),Jt(!1),le("menu")},[Vg]),Dg=(0,m.useCallback)((l,d)=>{i?.settings.venues.some(f=>f.id===l&&f.occupancy.residentCharacterId)||hl(f=>f.map(N=>N.id===l?{...N,...d}:N))},[i]),f$=(0,m.useCallback)(l=>{if(i?.settings.venues.some(d=>d.id===l&&d.occupancy.residentCharacterId)){ee("Move the resident to another venue before removing this home.");return}hl(d=>{let f=d.filter(N=>N.id!==l);return f.length>0&&!f.some(N=>N.isPlayerHome)&&(f[0]={...f[0],isPlayerHome:!0,characterId:null}),f})},[i]),b$=(0,m.useCallback)(async()=>{if(i){if(va.some(l=>!l.description.trim())){ee("Review a description for every home before saving.");return}Z(!0),ee("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:ZS(i.settings.venues,va),venueScope:"homes"})})),Jt(!1)}catch(l){ee(B(l,"Those homes could not be saved."))}finally{Z(!1)}}},[va,i]),v$=async l=>{if(!i)return;let d=i.villagers.find(N=>N.characterId===l.characterId)?.name,f=l.isPlayerHome?`${lo(i)}'s home`:d?`${d}'s home`:Z0(Mg,l.building).name;Z(!0),ee("");try{let N=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:f,homeKind:l.building}]})});Dg(l.id,{description:N.descriptions[l.id]??""})}catch(N){ee(B(N,"The home description could not be generated. You can write it by hand."))}finally{Z(!1)}},y$=l=>{if(i?.isFounded||l===wn)return;let d=co(wn).premise,f=!!ya.trim()&&ya!==d;ag(l),f||ju(co(l).premise),ng(""),we("")},es=(0,m.useCallback)((l,d)=>{ee(""),we(""),hg(!1),Lr(!1),xl(!1),F(!1),pe(""),fl(0),eg(l?"":d?.village.name??""),tg(l?"":d?.village.setting??"");let f=l?"":d?.settings.foundingReason??"",N=Ip.some(Mo=>Mo.value===f),z=N?f:f?"custom":"rebuild",I=CS[f]??f,Y=d?.settings.foundingDetails??"",$e=[I,Y].filter(Boolean).join(" "),wa=$e.length>(d?.settings.foundingDetailsMaxLength??500),Ro=d?.isFounded?Y:f&&!N?wa?Y:$e:l||!f?co(z).premise:Y,bd=l?"":d?.isFounded?d.settings.foundingGuidance??"":[wa?I:"",d?.settings.foundingGuidance??""].filter(Boolean).join(" ");ag(z),ju(Ro),ng(z==="none"?"":bd),y1(l?Cp():d?.settings.scenarioImprint??Cp()),ig(l?[]:d?.settings.worldFacts??[]),bl([]);let $a=l||!d?[]:d.settings.venues.filter(Mo=>Mo.classes?.includes("residence")||Mo.category==="public-center");Ei($a),_a($a[0]?.id??null),Ci(null),jn(null),Xu(""),Xp(l?[]:d?.settings.selectedLorebookIds??[]),Qp(l?1600:d?.settings.loreTokenBudget??1600),lg({..._0}),zi(l?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Qu(""),Zu(null),cg(""),Ku(null),Ju(d?.settings.townMapLayoutPrompt??""),Pu(d?.settings.townMapNegativePrompt??""),Br(!1),Va(l?"":d?.settings.playerPersonaId??""),Co(),zo(),Wr(l||!d?[]:d.settings.venues),le("setup")},[zo,Co,Wr]),_g=(0,m.useCallback)(l=>{if(Ie===0&&l>0){if(Pa.trim().length===0){we("Give the village a name before continuing.");return}if(Ct.trim().length===0){we("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!ya.trim()){we("Describe the village's first day before continuing.");return}}if(Ie===1&&l>1){if(!Je.trim()){we("Choose the Persona who lives in this village.");return}if(!Ja?.some(d=>d.id===Je)){we("That Persona is no longer in your library. Choose another one to continue.");return}if(ed.length>0){we(ed);return}if(dg){Lr(!0);return}}if(Ie===2&&l>2&&He!=="none"&&!Ai){we(He==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ie===3&&l>3){let d=Pe.filter(Y=>Y.classes?.includes("residence")),f=d.filter(Y=>!Y.occupancy.playerHome),N=f.length;if(!d.some(Y=>Y.occupancy.playerHome)||N<I0||N>zp||!Pe.some(Y=>Y.category==="public-center")){we("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let z=f.map(Y=>Y.occupancy.residentCharacterId).filter(Boolean);if(z.length!==f.length||new Set(z).size!==z.length){we("Assign a different villager to each villager Residence before review.");return}let I=Pe.map(Y=>({venue:Y,field:Y.name.trim()?Y.form?.trim()?Y.description.trim()?Y.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:Y})=>Y);if(I){_a(I.venue.id),we(`Complete ${I.field.replaceAll("-"," ")} for ${I.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${I.field}`)?.focus(),0);return}}Lr(!1),we(""),fl(l),l===1&&Co(),l===0&&zo(),l===3&&en(),Jt(!1),Ti(!1),Ci(null)},[ed,Pe,dg,en,Co,zo,Je,Ja,He,Ai,Pa,ya,i?.isFounded,Ct,Ie,e]),w$=(0,m.useCallback)(()=>{Lr(!1),we(""),fl(2),Jt(!1),Ti(!1)},[]),$$=(0,m.useCallback)(()=>{Lr(!1),we("")},[]),xe=Pe.find(l=>l.id===Ir)??null,ts=xe?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{og(0),Gu(!1)},[Ir,ts]),(0,m.useEffect)(()=>{if(!Ir||xe?.form?.trim()||rg)return;let l=window.setInterval(()=>og(d=>(d+1)%5),4e3);return()=>window.clearInterval(l)},[Ir,xe?.form,rg]);let pd=xe?St(xe,xe.category==="public-center"?"gathering":"residence"):null,x$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),N$=async(l,d)=>{if(Fa)return;if(!(d==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){_a(l.id),we(`Add an ${d} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${d}-description`)?.focus(),0);return}let N=qr;vl(!0),we("");try{let z=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:x$(l),area:d,villageName:Pa,setting:Ct,foundingDetails:ya,scenarioImprint:i?.isFounded?v1:null,worldFacts:i?.isFounded?$n:[],selectedLorebookIds:Da})});Fu.current===N&&jn({venueId:l.id,area:d,image:z})}catch(z){we(B(z,"Venue art could not be generated."))}finally{vl(!1)}},S$=async(l,d,f)=>{if(!(!f||Fa)){if(f.size>(i?.settings.maxVenueImageBytes??8e6)){we("That venue image is too large. Choose a smaller file.");return}vl(!0),we("");try{let N=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await sl(f)})});jn({venueId:l.id,area:d,image:N})}catch(N){we(B(N,"That venue image could not be uploaded."))}finally{vl(!1)}}},k$=()=>{if(!Hr)return;let{venueId:l,area:d,image:f}=Hr;Oi(l,N=>d==="exterior"?{...N,presentation:{...N.presentation,image:f}}:{...N,spaces:[{...St(N,N.classes?.includes("gathering")?"gathering":"residence"),image:f}]}),jn(null)},Ig=(0,m.useCallback)(()=>{if(Pa.trim().length===0)return"Give the village a name.";if(Je.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!ya.trim())return"Describe the village's first day.";let l=$n.map(z=>z.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(z=>z.length>160)))return"Use at most four current world facts of 160 characters each.";if(Ct.trim().length===0)return"Describe what the village is like.";if(He!=="none"&&!Ai)return"Choose, generate, or upload the village map.";let d=Pe.filter(z=>z.classes?.includes("residence")),f=d.filter(z=>!z.occupancy.playerHome);if(f.length<I0||f.length>zp)return"Place one to three homes for initial villagers.";if(!d.some(z=>z.occupancy.playerHome))return"One Residence has to be yours.";if(Pe.some(z=>!z.name.trim()||!z.form?.trim()||!z.description.trim()||!z.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=f.map(z=>z.occupancy.residentCharacterId).filter(z=>z!==null);return N.length!==f.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":Pe.filter(z=>z.category==="public-center").length!==1?"Place one Gathering Place.":""},[Pe,Je,He,Ai,Pa,ya,i?.isFounded,$n,Ct]),T$=(0,m.useCallback)(async()=>{let l=Ig();if(l){let d=Pe.find(f=>!f.name.trim()||!f.form?.trim()||!f.description.trim()||!f.spaces?.[0]?.description.trim());if(d){let f=d.name.trim()?d.form?.trim()?d.description.trim()?"interior-description":"exterior-description":"form":"venue-name";_a(d.id),fl(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${f}`)?.focus(),0)}we(l);return}Z(!0),we("");try{let d=await D("/setup",{method:"POST",body:JSON.stringify({name:Pa.trim(),setting:Ct.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:wn,foundingDetails:i?.isFounded?i.settings.foundingDetails:ya.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:_r.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?$n.map(f=>f.trim()).filter(Boolean):[],selectedLorebookIds:Da,loreTokenBudget:bo,playerPersonaId:Je,townMapImage:Ai??"",townMapView:He==="existing"?xo:Vu("cover"),venues:Pe})});o(d),Jt(!1),le(!i?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){we(B(d,"The village could not be founded."))}finally{Z(!1)}},[e,Pe,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,Je,xo,Ig,He,Ai,Pa,wn,ya,_r,$n,Da,bo,Ct]),E$=(0,m.useCallback)(async()=>{Z(!0),ee("");try{let l=await D("/setup/reset",{method:"POST"});o(l),c(null),es(!0,l)}catch(l){ee(B(l,"The village could not be reset."))}finally{Z(!1),xl(!1)}},[es]),Hg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||Hg.current||(Hg.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&le("preparing"):es(!1,i))},[es,i]),(0,m.useEffect)(()=>{if(G!=="preparing")return;let l=!1,d=async()=>{try{let N=await D("/setup/preparation");if(l)return;o(N),$l(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&le("home")}catch(N){l||$l(B(N,"Preparation status could not be read."))}};d();let f=window.setInterval(()=>{d()},2500);return()=>{l=!0,window.clearInterval(f)}},[G]);let C$=(0,m.useCallback)(async()=>{$l("");try{o(await D("/setup/preparation/retry",{method:"POST"}))}catch(l){$l(B(l,"Preparation could not be retried."))}},[]),z$=(0,m.useCallback)(()=>{De({id:rl(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),A$=(0,m.useCallback)(async l=>{Z(!0),ee("");try{let d=i?.settings.venues.some(I=>I.id===l.id)??!1,f=vn(l).map(I=>St(l,I)),N=await D(d?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:d?"PUT":"POST",body:JSON.stringify(d?{name:l.name,description:f[0]?.description??l.description}:{name:l.name,classes:l.classes,description:f[0]?.description??l.description})}),z=qn(N.settings.venues).find(I=>d?I.id===l.id:I.name.toLowerCase()===l.name.trim().toLowerCase());o(N),De(null),d||tt("projects"),vo(I=>{let Y=I.map($e=>$e.id===l.id&&z?z:$e);return[...Y,...qn(N.settings.venues).filter($e=>!Y.some(wa=>wa.id===$e.id))]})}catch(d){ee(B(d,"That place could not be saved."))}finally{Z(!1)}},[i,tt]),R$=(0,m.useCallback)(async l=>{let d=i?.settings.venues.find(f=>f.id===l);if(!d){vo(f=>f.filter(N=>N.id!==l));return}Z(!0),ee("");try{let f=await D(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(f.roomPresent||f.playerHome||f.residentCharacterIds.length||f.pendingMailCount){ee(f.roomPresent?"End the active visit before deleting this Venue.":f.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=f.residentCharacterIds.length+f.pendingResidenceCharacterIds.length,z=N||f.workerCharacterIds.length||f.remapCount||f.eventCount?`This place is referenced by ${N} pending moves, ${f.workerCharacterIds.length} workers, ${f.remapCount} schedule moves, and ${f.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(z))return;let I=await D(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(I),vo(Y=>Y.filter($e=>$e.id!==l))}catch(f){ee(B(f,"That place could not be removed."))}finally{Z(!1)}},[i]),Ug=(0,m.useCallback)(async(l,d)=>{Z(!0),ee("");try{let f=ho[l.id]??l.venueDraft,N=await D(`/venue-requests/${encodeURIComponent(l.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(f):void 0});if(o(N),d){let z=new Set(dl.map(I=>I.id));vo(I=>[...I,...qn(N.settings.venues).filter(Y=>!z.has(Y.id))])}mo(z=>{let I={...z};return delete I[l.id],I})}catch(f){ee(B(f,d?"That venue could not be approved.":"That request could not be denied."))}finally{Z(!1)}},[ho,dl]),M$=(0,m.useCallback)(l=>{let d=cd.current,f=d?.selectionStart??P.length,N=d?.selectionEnd??f;ud.current=f+l.length,Et(`${P.slice(0,f)}${l}${P.slice(N)}`)},[P]),qg=(0,m.useCallback)(async()=>{let l=gl.trim();if(l.length!==0){Z(!0),ee("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Wp("")}catch(d){ee(B(d,"That notice could not be pinned up."))}finally{Z(!1)}}},[gl]),O$=(0,m.useCallback)(async l=>{Z(!0),ee("");try{o(await D(`/noticeboard/${l}`,{method:"DELETE"}))}catch(d){ee(B(d,"That notice could not be taken down."))}finally{Z(!1)}},[]),Hl=E.trim().toLowerCase(),gd=(s??[]).filter(l=>Hl.length===0||l.name.toLowerCase().includes(Hl)||l.comment.toLowerCase().includes(Hl)||l.tags.some(d=>d.toLowerCase().includes(Hl))),Bg=[...(i?.villagers??[]).map(l=>l.characterId),...Ae?gd.map(l=>l.id):[]].join(`
`),Lg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Bg.split(`
`).filter(f=>f.length>0&&!Lg.current.has(f));if(l.length===0)return;for(let f of l)Lg.current.add(f);let d=new AbortController;return(async()=>{try{let f=await LS(l,d.signal);d.signal.aborted||go(N=>({...N,...f}))}catch{}})(),()=>d.abort()},[Bg]);let fd=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(ll(null),fd.length===0)return;let l=new AbortController;return(async()=>{try{let d=await jS(fd,l.signal);l.signal.aborted||ll(d)}catch{}})(),()=>l.abort()},[fd]);let oa=(0,m.useCallback)(l=>l?s?.find(d=>d.id===l)?.name??i?.villagers.find(d=>d.characterId===l)?.name??"":"",[s,i]),V$=(()=>{let l=i?.settings.venues??[],d=[],f=new Map;for(let N of i?.villagers??[]){let z=N.place?.id;if(!z)continue;let I=f.get(z);I?I.push(N):f.set(z,[N])}for(let N of l){let z=Ou(N);if(!z)continue;let I=N.occupancy.residentCharacterId,Y=Dr(N),$e=N.occupancy.playerHome?lo(i):oa(I);d.push({id:N.id,x:z.x,y:z.y,text:Y?i2($e):N.name,image:N.presentation.image?.url??null,tone:Y?K0({isPlayerHome:N.occupancy.playerHome,occupant:I}):"venue",selected:_e===N.id,doors:_e===N.id?[{label:"View venue",onSelect:()=>Vl(N)},{label:"Visit",onSelect:()=>{Dl(N)}}]:void 0,onSelect:()=>Tg(N)}),(f.get(N.id)??[]).forEach((wa,Ro)=>{d.push({id:`villager:${wa.characterId}`,x:z.x,y:z.y,dy:r2*(Ro+1),text:wa.name,tone:"resident",kind:"person"})})}return d})(),D$=Pe.flatMap(l=>{let d=Ou(l);return d?[{id:l.id,x:d.x,y:d.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>_a(l.id)}]:[]});if(G==="room")return(0,r.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[q?(0,r.jsx)($2,{room:q,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:IS(i?.settings.venues??[],q),draft:Qr,mode:Zr,targetId:Kr,busy:Ba,error:V1,greetingNotice:D1,ruling:R1,open:A1,ended:Fr,playerName:lo(i),playerPortrait:Uu??void 0,portraits:Ni,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{Ri.current=null,Jr.current=null,xn(l)},onMode:l=>{Ri.current=null,El(l)},onTarget:l=>{Ri.current=null,od(l)},onSend:()=>{Zr==="conclude"?Z1():P1()},onViewVenue:()=>{V(q.placeId),De(null),le("venue"),Ee()},onEnterPrivate:q.area==="shared"&&q.privateAccessOwnerId?()=>{ut(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:q.id,ownerId:q.privateAccessOwnerId})}).then(({session:l})=>{Ze(l),Ee()}).catch(l=>pt(B(l,"That private space could not be entered."))).finally(()=>ut(!1))}:void 0,privateSpaceOwnerName:oa(q.privateAccessOwnerId),onEnd:()=>{Q1()},notices:M1,onDismissNotice:l=>Ua(d=>d.filter(f=>f.id!==l)),debugDiscardEnabled:rd,onDebugDiscard:()=>{J1()},onLeavePending:()=>{K1()},endFailed:ye,onRetryGreeting:()=>{if(q.id)md(q.id);else{let l=i?.settings.venues.find(d=>d.id===q.placeId);l&&Dl(l)}},onContinueWithoutGreeting:()=>{q.id&&W1(q.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===q.placeId&&l.occupancy.playerHome&&(!q.spaceClass||q.spaceClass==="residence"))?()=>Xr(!0):void 0,onProjects:()=>tt("projects")}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:hd,children:"Back to village"}),z1&&i?(0,r.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>Xr(!1),children:(0,r.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Xr(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsx)("strong",{children:l.title}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[oa(d.characterId),":"]})," ",d.reply]},d.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,r.jsx)(w2,{entry:l,onDecide:async(d,f)=>{o(await D(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...f})}))}}):null,l.error?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,r.jsx)("p",{children:l.venueDraft.classes.map(d=>d[0].toUpperCase()+d.slice(1)).join(" / ")}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Xr(!1),tt("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Xr(!1),tt("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(G==="venue"){let l=(i?.settings.venues??[]).find(k=>k.id===_t)??null;if(!i||!l)return(0,r.jsx)("div",{className:`${n}-root`,children:(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Eg,children:"Back to map"})]})});let d=F1(l.id),f=vn(l),N=l.occupancy.homeKind?Z0(Mg,l.occupancy.homeKind).name:"",z=l.occupancy.playerHome?lo(i):oa(l.occupancy.residentCharacterId),I=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),Y=f.includes("residence")&&I.length>0,$e=q?.placeId===l.id&&(q.area==="shared"||q.area==="private"),wa=q?.placeId===l.id&&q.area==="private"?q.privateOwnerId:"",Ro=l.occupancy.playerHome||l.playerSeenShared||$e,bd=(l.privateSpaces??[]).filter(k=>l.playerSeenPrivateIds?.includes(k.ownerId)||k.ownerId===wa),$a=q?.status!=="closed"&&q?.id?q:null,Mo=(l.playerInvitations??[]).some(k=>I.includes(k.residentId)),vd=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:f[0],ownerId:"",image:l.presentation.image,description:l.form||N||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...f.map(k=>{let ce=St(l,k),X=k==="residence",ie=X?!Ro:!l.playerSeenPublic&&!($a?.placeId===l.id&&$a.area==="public"),je=!X||!Y||l.occupancy.playerHome||Mo;return{key:`class:${k}`,label:f.length===1?"Interior":`${k[0].toUpperCase()}${k.slice(1)} interior`,subtitle:X?"Shared living space":`${k[0].toUpperCase()}${k.slice(1)} space`,area:X?"shared":"public",spaceClass:k,ownerId:"",image:ie?null:ce.image,description:ie?"":ce.description,state:ie?void 0:ce.state,locked:ie,canEnter:je,accessLabel:je?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(k=>I.includes(k.ownerId)).map(k=>{let ce=oa(k.ownerId),X=!l.playerSeenPrivateIds?.includes(k.ownerId)&&k.ownerId!==wa,ie=(l.playerInvitations??[]).some(je=>je.scope==="private"&&je.ownerId===k.ownerId&&je.residentId===k.ownerId);return{key:`private:${k.ownerId}`,label:`${ce}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:k.ownerId,image:X?null:k.image,description:X?"":k.description,state:X?void 0:k.state,locked:X,canEnter:ie,accessLabel:ie?"Owner's invitation available":"Owner's invitation required",adaptationPending:!X&&k.adaptationPending}})],ne=vd.find(k=>k.key===Ke)??vd[0],jg=(l.editProposals??[]).filter(k=>ne.area==="shared"?k.target==="shared":ne.area==="private"&&k.target==="private"&&k.ownerId===ne.ownerId),yd=ne.description&&ne.description!==l.form&&ne.description!==N?ne.description:"",_$=!ne.locked&&!!(yd||ne.adaptationPending||ne.state?.condition||ne.state?.items.length||ne.state?.publicFacts.length||ne.state?.features.length||ne.area==="outside"&&i.village.setting||jg.length),Ul=$a?.placeId===l.id&&$a.area===ne.area&&(ne.area==="outside"||$a.spaceClass===ne.spaceClass)&&(ne.area!=="private"||$a.privateOwnerId===ne.ownerId),wd=(k,ce,X,ie="")=>(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h3",{className:`${n}-panel-title`,children:k}),ce?(0,r.jsx)("img",{className:`${n}-venue-space-picture`,src:ce.url,alt:`${k} at ${l.name}`}):(0,r.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Wa||_,onClick:()=>{s$(l.id,X,ie)},children:ce?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${k.toLowerCase()} image`,disabled:!!Wa||_,onChange:je=>{let as=je.target.files?.[0];je.target.value="",l$(l.id,as,X,ie)}}),ce?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Wa||_,onClick:()=>{c$(l.id,X,ie)},children:"Remove image"}):null]})]},ie||X||"exterior"),Oo=k=>({name:k.name,form:k.form,workerIds:k.workerIds,position:{x:k.presentation.x,y:k.presentation.y},spaces:f.map(ce=>{let X=St(k,ce);return{description:X.description,condition:X.state.condition,items:X.state.items,publicFacts:X.state.publicFacts,features:X.state.features.map(({id:ie,text:je,locked:as})=>({id:ie,text:je,locked:as}))}}),privateSpaces:k.privateSpaces?.map(ce=>({ownerId:ce.ownerId,description:ce.description,condition:ce.state.condition,items:ce.state.items,publicFacts:ce.state.publicFacts,features:ce.state.features.map(({id:X,text:ie,locked:je})=>({id:X,text:ie,locked:je}))}))}),I$=!!(de&&JSON.stringify(Oo(de))!==JSON.stringify(Oo(l))),H$=!!(re&&(JSON.stringify(re.classes)!==JSON.stringify(f)||re.capacity!==(l.residenceCapacity??1)||re.slot!==0||re.title||re.description||re.extraBeds)),U$=()=>{(J==="edit"&&I$||J==="proposal"&&H$)&&!window.confirm("Discard your unsaved changes?")||(vt("view"),De(null),he(null),yt(""),A(""))},Gg=(k,ce)=>{o(k);let X=k.settings.venues.find(ie=>ie.id===l.id);X&&De(structuredClone(X)),A(ce)},q$=async()=>{if(de){if(de.form!==l.form||JSON.stringify(de.classes)!==JSON.stringify(l.classes)||JSON.stringify(de.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(de.state)!==JSON.stringify(l.state)||de.presentation.x!==l.presentation.x||de.presentation.y!==l.presentation.y){yt("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(Y){let k=Oo(de),ce=Oo(l),X=f.indexOf("residence");if((X>=0&&JSON.stringify(k.spaces[X])!==JSON.stringify(ce.spaces[X])||JSON.stringify(k.privateSpaces)!==JSON.stringify(ce.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Kt(!0),yt(""),A("");try{let k=await D(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:de.name,description:de.description})});Gg(k,"Venue details saved.")}catch(k){yt(B(k,"The Venue could not be saved."))}finally{Kt(!1)}}},Yg=async(k,ce="")=>{if(!de)return;let X=k==="private"?de.privateSpaces?.find(je=>je.ownerId===ce):St(de,"residence");if(!X)return;let ie=structuredClone(de);if(k==="shared"?ie.spaces=ie.spaces?.map(je=>je.venueClass==="residence"?St(l,"residence"):je):ie.privateSpaces=ie.privateSpaces?.map(je=>je.ownerId===ce?l.privateSpaces?.find(as=>as.ownerId===ce)??je:je),!(JSON.stringify(Oo(ie))!==JSON.stringify(Oo(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Kt(!0),yt(""),A("");try{let je=await D(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:k,ownerId:ce,description:X.description,state:X.state})});Gg(je,`${k==="private"?"Private":"Shared"} room edit proposed.`)}catch(je){yt(B(je,"That room edit could not be proposed."))}finally{Kt(!1)}}},Xg=o2(l,z);return(0,r.jsxs)("div",{className:`${n}-root`,"data-venue-view":J==="view"?"true":void 0,children:[(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:J==="view"?Xg:`${J==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Xg}`}),(0,r.jsx)("p",{className:`${n}-subtitle`,children:J==="view"?l.form||N||(d.length===0?"Nobody is here right now":`Villagers here: ${d.map(k=>k.name).join(", ")}`):J==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,r.jsx)("div",{className:`${n}-actions`,children:J==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{De(structuredClone(l)),yt(""),A(""),vt("edit")},children:"Edit Venue"}),f.includes("residence")&&!l.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{yt(""),D(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(o).catch(k=>yt(B(k,"The move could not be requested.")))},children:"Request to live here"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{he({classes:f,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),yt(""),A(""),vt("proposal")},children:"Propose Change"}),$a?.placeId===l.id?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>le("room"),children:"Return to scene"}):null]}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:U$,children:J==="edit"?"Close Editor":"Exit Change Proposal"})}),J==="view"&&Ma?(0,r.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:Ma}):null]})]}),J==="view"?(0,r.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,r.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,r.jsx)("button",{type:"button",className:n+"-venue-back",onClick:Eg,children:"\u2190 Back to map"}),vd.map(k=>(0,r.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":ne.key===k.key?"true":"false","aria-current":ne.key===k.key?"page":void 0,onClick:()=>st(k.key),children:[(0,r.jsx)("span",{className:n+"-venue-zone-thumb",children:k.image&&!k.locked?(0,r.jsx)("img",{src:k.image.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:k.locked?"\u25C8":"\u2302"})}),(0,r.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,r.jsx)("strong",{children:k.label}),(0,r.jsx)("small",{children:k.subtitle})]})]},k.key))]}),(0,r.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,r.jsx)("section",{className:n+"-venue-zone-main","aria-label":ne.label,children:(0,r.jsx)("div",{className:n+"-venue-artwork",children:ne.image&&!ne.locked?(0,r.jsx)("img",{src:ne.image.url,alt:ne.label+" at "+l.name}):(0,r.jsx)("div",{className:n+"-venue-artwork-empty",children:ne.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,r.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,r.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,r.jsx)("h2",{children:ne.label}),(0,r.jsx)("p",{children:ne.subtitle}),(0,r.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Occupancy"}),(0,r.jsx)("strong",{children:f.includes("residence")?Hu(l)+" / "+G0(l)+" residents":d.length+" here now"})]}),(0,r.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Accessibility"}),(0,r.jsx)("strong",{children:ne.accessLabel})]}),_$?(0,r.jsxs)("details",{className:n+"-venue-more",children:[(0,r.jsx)("summary",{children:"Area details"}),yd?(0,r.jsx)("p",{children:yd}):null,ne.adaptationPending?(0,r.jsx)("p",{children:"This room is still being adapted after a move."}):null,ne.state?.condition?(0,r.jsxs)("p",{children:["Condition: ",ne.state.condition]}):null,ne.state?.items.length?(0,r.jsxs)("p",{children:["Present items: ",ne.state.items.join(", ")]}):null,ne.state?.publicFacts.length?(0,r.jsxs)("p",{children:["Established facts: ",ne.state.publicFacts.join(" \xB7 ")]}):null,ne.state?.features.length?(0,r.jsxs)("p",{children:["Defining features: ",ne.state.features.map(k=>k.text).join(" \xB7 ")]}):null,ne.area==="outside"&&i.village.setting?(0,r.jsxs)("p",{children:["Village: ",i.village.setting]}):null,jg.map(k=>(0,r.jsxs)("p",{children:["Proposed room edit:"," ",k.declined?"declined or stale":`approved by ${k.approvedIds.length} of ${k.requiredIds.length} residents`]},k.id))]}):null,ne.locked&&!ne.canEnter?(0,r.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,$a&&!Ul?(0,r.jsx)("p",{className:n+"-venue-zone-guidance",children:"Finish the active visit before entering another area."}):null,(0,r.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:Ba||!Ul&&(!!$a||!ne.canEnter),onClick:()=>Ul?le("room"):void Dl(l,ne.spaceClass,ne.ownerId,ne.area),children:Ba?"Opening visit\u2026":Ul?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):J==="edit"?(0,r.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${n}-venue-space-grid`,children:[wd("Exterior image",l.presentation.image),f.filter(k=>k!=="residence"||Ro).map(k=>wd(k==="residence"?"Shared Residence image":`${k} space image`,St(l,k).image,k)),bd.map(k=>wd(`${oa(k.ownerId)}'s private image`,k.image,"residence",k.ownerId))]}),Wa===l.id?(0,r.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,pg?.id===l.id?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:pg.text}):null,de?(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,r.jsx)(Y0,{draft:de,existing:!0,villagers:i.villagers,editableClasses:f.filter(k=>k!=="residence"||!Y||$e),onChange:De}),Y?(0,r.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||!de.name.trim(),onClick:()=>{q$()},children:"Save Venue details"}),Y&&$e?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||!St(de,"residence").description.trim(),onClick:()=>{Yg("shared")},children:"Propose shared room edit"}):null]}),Y&&!$e?(0,r.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,wa&&de?.privateSpaces?.filter(k=>k.ownerId===wa).map(k=>(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",oa(k.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:k.description,onChange:ce=>De(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ie=>ie.ownerId===k.ownerId?{...ie,description:ce.target.value}:ie)})})]}),(0,r.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:k.state.condition,onChange:ce=>De(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ie=>ie.ownerId===k.ownerId?{...ie,state:{...ie.state,condition:ce.target.value}}:ie)})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:k.state.items.join(`
`),onChange:ce=>De(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ie=>ie.ownerId===k.ownerId?{...ie,state:{...ie.state,items:ce.target.value.split(`
`)}}:ie)})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:k.state.publicFacts.join(`
`),onChange:ce=>De(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ie=>ie.ownerId===k.ownerId?{...ie,state:{...ie.state,publicFacts:ce.target.value.split(`
`)}}:ie)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||!k.description.trim(),onClick:()=>{Yg("private",k.ownerId)},children:"Propose private room edit"})]},k.ownerId)),Y&&(l.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:j,onChange:k=>ve(k.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(k=>k.id!==l.id&&vn(k).includes("residence")&&Hu(k)<G0(k)).map(k=>(0,r.jsx)("option",{value:k.id,children:k.name},k.id))]}),(l.residentIds??[]).map(k=>{let ce=i.residences.find(X=>X.characterId===k&&X.status!=="current");return(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("strong",{children:oa(k)}),ce?(0,r.jsx)("span",{className:`${n}-hint`,children:ce.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!j||qt,onClick:()=>{Kt(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:k,venueId:j})}).then(o).catch(X=>yt(B(X,"The move could not be requested."))).finally(()=>Kt(!1))},children:"Ask to move"})]},k)})]}):null,Ka?(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:Ka}):null,Ma?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Ma}):null]}):(0,r.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),re?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${n}-row`,children:l1.map(k=>(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:re.classes.includes(k),disabled:!re.classes.includes(k)&&re.classes.length>=2,onChange:ce=>he(X=>X&&{...X,classes:ce.target.checked?[...X.classes,k]:X.classes.filter(ie=>ie!==k)})})," ",k]},k))})]}),re.classes.includes("residence")?(0,r.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:re.capacity,onChange:k=>he({...re,capacity:Number(k.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:re.slot,onChange:k=>he({...re,slot:Number(k.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${n}-notice-input`,value:re.title,onChange:k=>he({...re,title:k.target.value}),placeholder:"A second sleeping alcove"})]}),re.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:re.description,onChange:k=>he({...re,description:k.target.value})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:re.extraBeds,onChange:k=>he({...re,extraBeds:Number(k.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||re.classes.length<1||re.title.trim().length>0&&!re.description.trim(),onClick:()=>{Kt(!0),yt(""),D(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:re.classes,capacity:re.capacity,...re.title.trim()?{slot:re.slot,improvement:{title:re.title,description:re.description,extraBeds:re.extraBeds}}:{},title:re.title||`Change ${l.name}`,detail:re.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(k=>{o(k),he(null),A("Proposal submitted.")}).catch(k=>yt(B(k,"The proposal could not be saved."))).finally(()=>Kt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:Ka||"Proposal submitted."}),Ma?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Ma}):null]})})]})}if(G==="menu")return(0,r.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":Tt,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[Tt]}),t?null:(0,r.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${n}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Tt!=="index"?()=>ba("index"):hd,children:Tt!=="index"?"Back to menu":"Back to the village"})})]}),Yr?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Yr}):null,(0,r.jsx)("nav",{className:`${n}-mobile-menu-nav`,"aria-label":"Village menu",children:Tt==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>tt("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>tt("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>tt("story"),children:"DEBUG Settings"})]}):Tt==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["projects","Projects"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([l,d])=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,"data-active":K===l,onClick:()=>l==="homes"?Og():tt(l),children:d},l))}):Tt==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([l,d])=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,"data-active":K===l,onClick:()=>tt(l),children:d},l)),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||_||Al,onClick:()=>{xg()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${n}-status`,children:a1}),Cl?(0,r.jsx)("p",{className:`${n}-status`,role:"status",children:Cl}):null]}):null}),(0,r.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="villagers","data-active":K==="villagers"?"true":"false",disabled:!i||_,onClick:()=>tt("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="noticeboard","data-active":K==="noticeboard"?"true":"false",disabled:!i||_,onClick:()=>tt("noticeboard"),children:`Noticeboard (${i?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="venueRequests","data-active":K==="venueRequests"?"true":"false",disabled:!i||_,onClick:()=>tt("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="projects","data-active":K==="projects"?"true":"false",disabled:!i||_,onClick:()=>tt("projects"),children:`Projects (${i?.projects?.filter(l=>l.kind==="build-venue"&&l.status!=="complete").length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="homes","data-active":K==="homes"?"true":"false",disabled:!i||_,onClick:Og,children:`Homes (${qp(i?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="map","data-active":K==="map"?"true":"false",disabled:!i||_,onClick:()=>tt("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="village","data-active":K==="village"?"true":"false",onClick:()=>tt("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="general","data-active":K==="general"?"true":"false",onClick:()=>tt("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="replyGuidance","data-active":K==="replyGuidance"?"true":"false",disabled:!i||_,onClick:()=>tt("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="story","data-active":K==="story"?"true":"false",disabled:!i||_,onClick:()=>tt("story"),children:`DEBUG: Village Story (${u?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="chatlogs","data-active":K==="chatlogs"?"true":"false",disabled:!i||_,onClick:()=>tt("chatlogs"),children:`DEBUG: Venue Visits (${T?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="agendas","data-active":K==="agendas"?"true":"false",disabled:!i||_,onClick:()=>tt("agendas"),children:`DEBUG: Villager Wishes (${H?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":K==="schedules","data-active":K==="schedules"?"true":"false",disabled:!i||_,onClick:()=>tt("schedules"),children:`Villager Agendas (${H?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||_||Al,onClick:()=>{xg()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${n}-status`,children:a1}),Cl?(0,r.jsx)("p",{className:`${n}-status`,role:"status",children:Cl}):null]})]}),K==="general"?(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,r.jsx)(_p,{}),i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,r.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:_,onChange:l=>{a$(l.target.checked)}}),(0,r.jsx)("span",{children:"Character chat colors"})]}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:_,onChange:l=>{t$(l.target.value)},children:i.settings.storyPaces.map(l=>(0,r.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,r.jsx)("span",{className:`${n}-hint`,children:XS(i.settings.storyPace)})]}):null,i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:_,onChange:l=>{let d=l.target.value;Cg({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let d=Number(l.target.value);d!==i.settings.visitRetention.value&&Cg({mode:i.settings.visitRetention.mode,value:d})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!i,onClick:()=>es(!1,i),children:"Run setup again"}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${n}-row`,children:T1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:_,onClick:()=>{E$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>xl(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!i,onClick:()=>xl(!0),children:"Reset the village and start over"})})]}),Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):K==="village"?(0,r.jsxs)("div",{className:`${n}-menu-body`,children:[i?(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(g2,{}),t?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Map background image"}),kl?(0,r.jsx)("img",{className:`${n}-mobile-map-preview`,src:kl,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${n}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:l=>{let d=l.target.files?.[0];l.target.value="",zg(d)}}),Ia?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Ag()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:_l,children:"Cancel"})]}):i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Rg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:yn,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>fo(l.target.value)}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,r.jsx)(W0,{books:Bu,error:Zp,selected:ul,onChange:Gp,disabled:_}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:qu,disabled:_,onChange:l=>Yp(Number(l.target.value))}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${n}-field`,children:[(0,r.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:z$,disabled:_||h$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${n}-notice-input`,type:"search",value:Jp,onChange:l=>g1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${vn(l).join(" ")}`.toLowerCase().includes(Jp.toLowerCase())).map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${n}-hint`,children:[l.form,vn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),vn(l).includes("residence")?(0,r.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Vl(l),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>De(structuredClone(l)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{R$(l.id)},"aria-label":`Delete ${l.name}`,disabled:_,children:"\xD7"})]})]},l.id))}),de?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===de.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(Y0,{draft:de,existing:i.settings.venues.some(l=>l.id===de.id),villagers:i.villagers,onChange:De}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!de.name.trim()||!vn(de).every(l=>St(de,l).description.trim()),onClick:()=>{A$(de)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>De(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{n$()},disabled:_,children:"Suggest Venues"})}),dl.filter(l=>!i.settings.venues.some(d=>d.id===l.id)).map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name}),(0,r.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>De(l),children:"Review suggestion"})]},l.id))]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${n}-knowledge`,ref:cd,className:`${n}-preset`,value:P,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>Et(l.target.value)}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,r.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>M$(l.token),children:l.token},l.token))}),(0,r.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(m2,{idPrefix:"settings",personas:Ja,draft:Je,onDraft:Va,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:_}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{e$()},disabled:_,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Et(i.settings.defaultPromptKnowledge)},disabled:_,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${n}-hint`,children:P===i.settings.promptKnowledge&&Je===i.settings.playerPersonaId&&yn===i.settings.setting&&JSON.stringify(ul)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):(0,r.jsxs)("div",{className:`${n}-menu-body`,children:[K==="villagers"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${n}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>p("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[i?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{p("memories"),C(null),Ml()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>F(l=>!l),disabled:_,children:Ae?"Close the list":"Add a villager"})}),Ae?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("input",{className:`${n}-search`,type:"search",value:E,onChange:l=>pe(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),s===null?(0,r.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):gd.length===0?(0,r.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${n}-picker-list`,children:gd.map(l=>(0,r.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,r.jsx)(uo,{portrait:Ni[l.id],name:l.name,className:`${n}-avatar`}),(0,r.jsxs)("div",{className:`${n}-picker-text`,children:[(0,r.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,r.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,r.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{j1(l.id)},disabled:_||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,r.jsx)(b2,{villager:l,portrait:Ni[l.characterId],selected:!1,onSelect:!l.place||q!==null?void 0:()=>{let d=i.settings.venues.find(f=>f.id===l.place?.id);d&&Tg(d)}},l.characterId))}),(0,r.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,r.jsxs)("div",{className:`${n}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${n}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,Oa[l.characterId]?(0,r.jsx)("div",{className:`${n}-tile-summary`,children:Oa[l.characterId].changed?`New card: ${Oa[l.characterId].proposed?.name??"unavailable"}`:Oa[l.characterId].sourceAvailable?`Snapshot revision ${Oa[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ia(po===l.characterId?null:l.characterId),"aria-expanded":po===l.characterId,children:po===l.characterId?"Close sprite studio":`Sprites \xB7 ${l.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Y1(l.characterId)},disabled:_||Ln.length>0,children:"Compare card"}),Oa[l.characterId]?.changed&&Oa[l.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{X1(l.characterId)},disabled:_||Ln.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{G1(l.characterId)},disabled:_||Ln.length>0,children:"Move out"})]})]}),po===l.characterId?(0,r.jsx)(y2,{villager:l,onSaved:o}):null]},l.characterId))})]}):(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(OS,{library:b,busy:_,onRefresh:()=>{C(null),Ml()},onForget:(l,d)=>{_1(l,d)}})]}):null,K==="noticeboard"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,d)=>(0,r.jsxs)("li",{className:`${n}-notice-row`,children:[(0,r.jsxs)("span",{children:[l.author.length>0?(0,r.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{O$(d)},disabled:_,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${d}:${l.text}`))}),(0,r.jsxs)("div",{className:`${n}-notice-add`,children:[(0,r.jsx)("input",{className:`${n}-notice-input`,type:"text",value:gl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Wp(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),qg())}}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{qg()},disabled:_||gl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,K==="projects"&&i?(0,r.jsx)(x2,{snapshot:i,room:q,onSnapshot:o,onReturn:()=>le("room")}):null,K==="venueRequests"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Approval starts a planning draft in Projects; the venue appears only after supplies, a resident builder, and construction."}),i.venueRequests.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let d=ho[l.id]??l.venueDraft,f=N=>mo(z=>({...z,[l.id]:{...d,...N}}));return(0,r.jsx)("li",{className:`${n}-notice-row`,children:(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,r.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,r.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:d.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:N=>f({name:N.target.value})}),(0,r.jsxs)("select",{className:`${n}-notice-input`,value:d.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:N=>f({classes:[N.target.value]}),children:[(0,r.jsx)("option",{value:"residence",children:"Residence"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:N=>f({description:N.target.value})}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!d.name.trim(),onClick:()=>{Z(!0),ee(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:d.name,classes:d.classes}]})}).then(N=>f({description:N.descriptions[l.id]??""})).catch(N=>ee(B(N,"The description draft could not be generated."))).finally(()=>Z(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||!d.name.trim()||d.classes.length===0||!d.description?.trim(),onClick:()=>{Ug(l,!0)},children:d.name!==l.venueDraft.name||JSON.stringify(d.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Ug(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,r.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("span",{children:l.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Z(!0),ee(""),D(`/venue-upgrades/${encodeURIComponent(l.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(f=>ee(B(f,"The upgrade request could not be decided."))).finally(()=>Z(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},l.id)),(0,r.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let d=oa(l.characterId),f=i.settings.venues.find(N=>N.id===l.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${f}`}),l.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Z(!0),ee(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(N=>ee(B(N,"The move could not be completed."))).finally(()=>Z(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,r.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(N=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Z(!0),ee(""),D(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(z=>ee(B(z,"The move request could not be decided."))).finally(()=>Z(!1))},children:N?"Approve move":"Deny"},String(N)))]},l.characterId)}),Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):null,K==="homes"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||va.length>=Il,onClick:()=>{Jt(!0),hd()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${n}-hint`,children:`${va.length} of at most ${Il}`})]}),va.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(p2,{homes:va,villagers:(i?.villagers??[]).map(l=>({id:l.characterId,name:l.name})),disabled:_,selectedId:f1,onPatch:Dg,onRemove:f$,onSelect:Lu,showDescriptions:!0,onGenerateDescription:l=>{v$(l)},lockedIds:new Set(i.settings.venues.filter(l=>l.occupancy.residentCharacterId).map(l=>l.id))}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{b$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>Wr(i.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${n}-hint`,children:QS(i.settings.venues,va)?"No unsaved changes.":"Unsaved changes."})]})]}):null,K==="map"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Dp,{src:kl,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:i.settings.venues.flatMap(l=>{let d=Ou(l);if(!d)return[];let f=l.occupancy.residentCharacterId?oa(l.occupancy.residentCharacterId):l.occupancy.playerHome?lo(i):"";return[{id:l.id,x:d.x,y:d.y,text:f?`${l.name||"Home"} \xB7 ${f}`:l.name,tone:Dr(l)?K0({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>Pp(l.id)}]}),placing:pl!==null,view:Gr,shape:gg,zoom:C1,onView:Tl?jr:void 0,onPlace:pl?(l,d)=>{let f=pl;Z(!0),ee(""),D(`/locations/venue/${encodeURIComponent(f)}`,{method:"PUT",body:JSON.stringify({presentation:{x:l,y:d}})}).then(o).catch(N=>ee(B(N,"The venue could not be placed."))).finally(()=>{Z(!1),Fp(null)})}:void 0}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Venue positions and residents"}),i.settings.venues.map(l=>{let d=l.occupancy.residentCharacterId?oa(l.occupancy.residentCharacterId):l.occupancy.playerHome?lo(i):"";return(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":b1===l.id,onClick:()=>Pp(l.id),children:l.name||"Home"}),(0,r.jsx)("span",{className:`${n}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${n}-hint`,children:Ou(l)?"On map":"Not placed"}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Pin moves need a future project."})]},l.id)}),pl?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Fp(null),children:"Cancel pin placement"}):null,Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}),Tl?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${n}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:J0.map(l=>(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Gr.fit===l.fit?"true":"false","aria-pressed":Gr.fit===l.fit,onClick:()=>jr({...Gr,fit:l.fit}),children:l.label},l.fit))}),(0,r.jsx)("p",{className:`${n}-hint`,children:J0.find(l=>l.fit===Gr.fit)?.help})]}):null,id?(0,r.jsx)("p",{className:`${n}-hint`,"data-tone":id.tone,children:id.text}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:l=>{let d=l.target.files?.[0];l.target.value="",zg(d)}}),i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Rg()},children:"Remove background image"}):null]}),Tl?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Ag()},children:Ia?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:_l,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("p",{className:`${n}-hint`,children:i.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>nd(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${n}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:i.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),qn(i.settings.venues).length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${n}-places`,children:qn(i.settings.venues).map(l=>(0,r.jsxs)("li",{className:`${n}-place`,children:[l.presentation.image?(0,r.jsx)("img",{className:`${n}-place-thumb`,src:l.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${n}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${n}-place-body`,children:[(0,r.jsx)("span",{className:`${n}-place-name`,children:l.name}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Vl(l)},children:"View Venue"})})]})]},l.id))})]})]}):null,K==="replyGuidance"?(0,r.jsx)(f2,{}):null,K==="story"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),u===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading what the village remembers\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):RS(u).map(l=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${n}-story-day`,children:l.label}),(0,r.jsx)("ul",{className:`${n}-story`,children:l.entries.map(d=>{let f=Hp(d),N=d.actors.map(z=>z.name).join(", ");return(0,r.jsxs)("li",{className:`${n}-story-row`,children:[(0,r.jsxs)("span",{children:[f.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${n}-story-meta`,children:[f,d.scope==="private"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:` \xB7 private to ${N}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,disabled:_,onClick:()=>{I1(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${l.label}:${l.entries[0]?.id??""}`)),u&&u.length<g?(0,r.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{H1()},children:["Load more memories (",u.length," of ",g,")"]}):null]}):null,K==="chatlogs"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:Ve,onChange:l=>{ze(l.target.value),S(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,r.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:rt,onChange:l=>{Za(l.target.value),S(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,r.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||w===0,onClick:()=>{Sg()},children:"Delete all completed logs"}),kt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:kt}):null,T===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):T.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):T.map(l=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",_u(l.startedAt)]}),(0,r.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(d=>d.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{dd(l.id)},children:U?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{L1(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Sg(l.id)},children:"Delete log"})]}),U?.id===l.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${n}-story`,children:U.lines.map((d,f)=>(0,r.jsx)("li",{className:`${n}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${n}-story-meta`,children:[(0,r.jsx)("span",{style:i?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?Iu(i.villagers.find(N=>N.characterId===d.speakerId)?.nameColor):void 0,children:d.name||lo(i)})," \xB7 ",_u(d.at)]}),(0,r.jsx)("span",{style:i?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?Iu(i.villagers.find(N=>N.characterId===d.speakerId)?.dialogueColor):void 0,children:Vr(d.content,`venue-${l.id}-${f}-`)}),(0,r.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(N=>U.participants.find(z=>z.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${l.id}:${f}`))}),(U.submissions??[]).some(d=>d.recollections?.length)?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${n}-story`,children:(U.submissions??[]).flatMap(d=>(d.recollections??[]).map(f=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:f.text}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${f.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${f.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${f.lineIds.join(", ")}`})]},f.id)))})]}):null,U.memoryReview&&U.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,open:U.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${U.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${n}-story-meta`,children:[`${U.memoryReview?.attempts??0} review attempts`,U.memoryReview?.error?` \xB7 Last error: ${U.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${n}-story`,children:(U.memoryReview?.decisions??[]).map(d=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:`${d.action==="promote"?"Promoted":"Rejected"}${d.category?` \xB7 ${i1[d.category]}`:""}`}),d.text?(0,r.jsx)("p",{children:d.text}):null,(0,r.jsx)("p",{className:`${n}-wish-meta`,children:d.reason}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${d.recollectionIds.join(", ")}`})]},d.id))})]})]}):null]}):null]},l.id)),w>20?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:v===0,onClick:()=>{S(Math.max(0,v-20)),L(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:v+20>=w,onClick:()=>{S(v+20),L(null)},children:"Next"})]}):null]}):null,K==="agendas"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),H===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):H.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:H.map(l=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${_S(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),l.completedWishes.length>0?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${n}-story`,children:l.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{q1(l.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},l.characterId))})]}):null,K==="schedules"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),H===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):H.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${n}-agenda-list`,children:H.map(l=>(0,r.jsxs)("details",{className:`${n}-week`,children:[(0,r.jsx)("summary",{className:`${n}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,r.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Rp(l)?(0,r.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,r.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:_,onChange:d=>{B1(l.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{U1(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,r.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Rp(l)?" Earlier hours retain the previous plan.":""]}):Rp(l)?(0,r.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,r.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,r.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(d=>{let f=d.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[d.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[d.weekday]:void 0)??l.agenda?.week?.[d.weekday]??[],N=l.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${n}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${n}-agenda-blocks`,children:f.map((z,I)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[U0(z.startMinute),"\u2013",U0(z.endMinute)]}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{children:z.venueId?VS(i?.settings.venues??[],z.venueId):"Home"}),(0,r.jsx)("span",{children:z.reason}),(0,r.jsx)("span",{className:`${n}-story-scope`,children:z.status==="idle"?"Available":z.status==="dnd"?"Busy":z.status==="offline"?"Offline":"Online"})]},`${z.startMinute}-${z.endMinute}-${I}`))})]}),l.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,r.jsx)("ol",{className:`${n}-agenda-blocks`,children:N.map((z,I)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:z.time}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{className:`${n}-story-scope`,children:z.status||"No availability set"})]},`${z.time}-${I}`))}):(0,r.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},l.characterId))})]}):null,Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]})]});if(G==="preparing"){let l=i?.foundingPreparation,d=i?.villagers.length??0,f=l?.completedIds.length??0,N=i?.villagers.find($e=>$e.characterId===l?.currentId)?.name,z=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",I=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,Y=l?.status==="pending"&&Number.isFinite(I)?Math.max(0,Math.floor((Date.now()-I)/1e3)):null;return(0,r.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${f} of ${d} villagers ready`}),l?.status==="pending"&&l.stage?(0,r.jsxs)("p",{children:[z,N?` for ${N}`:"","."]}):null,l?.attempt?(0,r.jsx)("p",{children:`Attempt ${l.attempt} of 3${Y!==null?` \xB7 ${Y}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,r.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,r.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{C$()},children:"Retry this villager"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(_p,{})]})]}):null,ug?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:ug}):null]})})}if(G==="setup"){let l=(s??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,r.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Ie,children:[(0,r.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:Ru.map((d,f)=>(0,r.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":f===Ie?"true":"false","data-done":f<Ie?"true":"false","aria-current":f===Ie?"step":void 0,children:[(0,r.jsx)("span",{className:`${n}-setup-rail-number`,children:f+1}),(0,r.jsx)("span",{children:d})]},d))}),(0,r.jsx)("div",{className:`${n}-side`,children:(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Ie+1," of ",Ru.length," \xB7 ",Ru[Ie]]}),Ie===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:Pa,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:_,onChange:d=>eg(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${n}-scenario-options`,children:Ip.filter(d=>d.value!=="custom"||i?.isFounded&&wn==="custom").map(d=>(0,r.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:wn===d.value,disabled:_||i?.isFounded,onChange:()=>y$(d.value)}),(0,r.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:d.icon}),(0,r.jsx)("strong",{children:d.label}),(0,r.jsx)("small",{children:d.description})]},d.value))})]}),i?.isFounded?(0,r.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ie===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(h2,{personas:Ja,draft:Je,onDraft:Va,disabled:_}),(0,r.jsx)(_p,{onSetupProblem:S1,onImageWarningChange:hg,compact:!0}),k1?(0,r.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:$$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:w$,children:"I understand, continue"})]})]}):null]}):null,Ie===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Ct,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:_||Bt,onChange:d=>{tg(d.target.value),bl([])}}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:"Day 1 record"}),(0,r.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,r.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,r.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:ya,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:_,onChange:d=>ju(d.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:$n.join(`
`),disabled:_,placeholder:"One stable fact per line, up to four.",onChange:d=>ig(d.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,r.jsx)(W0,{books:Bu,error:Zp,selected:Da,onChange:d=>{Xp(d),bl([])},disabled:_}),(0,r.jsxs)("details",{className:`${n}-field`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:bo,disabled:_,onChange:d=>Qp(Number(d.target.value))}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ie===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":He==="generate"?"true":"false","aria-pressed":He==="generate",disabled:Bt,onClick:()=>zi("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":He==="upload"?"true":"false","aria-pressed":He==="upload",disabled:Bt,onClick:()=>zi("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":He==="none"?"true":"false","aria-pressed":He==="none",disabled:Bt,onClick:()=>zi("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":He==="existing"?"true":"false","aria-pressed":He==="existing",disabled:Bt,onClick:()=>zi("existing"),children:"Keep current map"}):null]}),He==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,r.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,f])=>(0,r.jsxs)("label",{className:`${n}-label`,children:[f,(0,r.jsxs)("select",{className:`${n}-select`,value:yl[d],disabled:Bt,onChange:N=>lg(z=>({...z,[d]:N.target.value})),children:[(0,r.jsx)("option",{value:"auto",children:"Auto"}),(0,r.jsx)("option",{value:"include",children:"Include"}),(0,r.jsx)("option",{value:"exclude",children:"Exclude"})]})]},d))})]}),(0,r.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:yo,maxLength:1500,disabled:Bt,onChange:d=>Ju(d.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:wo,maxLength:1500,disabled:Bt,onChange:d=>Pu(d.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Bt||yo===i?.settings.townMapLayoutPrompt&&wo===i?.settings.townMapNegativePrompt,onClick:()=>{Ju(i?.settings.townMapLayoutPrompt??""),Pu(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Bt||Ct.trim().length===0,onClick:()=>{i$()},children:Bt?"Generating map\u2026":wl==="generate"?"Generate again":"Generate map"})})]}):null,He==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Bt,"aria-label":"Choose a village map image",onChange:d=>{let f=d.target.files?.[0];d.target.value="",r$(f)}}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,He==="none"?(0,r.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Ur&&He!=="none"&&wl===He&&fg?(0,r.jsx)("p",{className:`${n}-hint`,"data-tone":Op(Ur).tone,children:Op(Ur).text}):null]}):null,Ie===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Fa||Pe.filter(d=>d.classes?.includes("residence")).length>=1+Ao,onClick:()=>{Jt(!0),Ti(!1),Ci(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Fa||Pe.some(d=>d.category==="public-center"),onClick:()=>{Jt(!1),Ti(!0),Ci(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Fa||Pe.length===0,onClick:()=>{Ei([]),_a(null),jn(null),Ci(null),Jt(!1),Ti(!1)},children:"Reset all venues"})]}),sg?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:sg}):null,(0,r.jsx)("div",{className:`${n}-setup-venue-list`,children:Pe.map(d=>(0,r.jsxs)("button",{type:"button",className:`${n}-setup-venue-card`,"data-selected":d.id===Ir?"true":"false",onClick:()=>_a(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":oa(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),xe&&pd?(0,r.jsxs)("div",{className:`${n}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${n}-panel-title`,children:[xe.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",xe.name]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ci(xe.id),Jt(!1),Ti(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>p$(xe.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Name",(0,r.jsx)("input",{id:`${n}-setup-venue-name`,className:`${n}-notice-input`,value:xe.name,maxLength:100,onChange:d=>Oi(xe.id,f=>({...f,name:d.target.value}))})]}),xe.category==="public-center"?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Fa,onClick:()=>{o$()},children:"Suggest three names"}),w1.map(d=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Oi(xe.id,f=>({...f,name:d})),children:d},d))]}):null,(0,r.jsxs)("p",{className:`${n}-hint`,children:["Class: ",ts==="gathering"?"Gathering":"Residence"]}),(0,r.jsxs)("div",{className:`${n}-setup-form-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-form`,children:"Form"}),(0,r.jsx)("textarea",{id:`${n}-setup-form`,className:`${n}-textarea`,rows:2,value:xe.form??"",maxLength:240,placeholder:AS[ts][$1],onFocus:()=>Gu(!0),onBlur:()=>Gu(!1),onChange:d=>{Oi(xe.id,f=>({...f,form:d.target.value})),we("")}}),(0,r.jsx)("small",{className:`${n}-hint`,children:"What the Venue actually is"})]}),xe.category!=="public-center"?(0,r.jsxs)("label",{className:`${n}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${n}-select`,value:xe.occupancy.residentCharacterId??"",disabled:xe.occupancy.playerHome,onChange:d=>Oi(xe.id,f=>({...f,residentIds:d.target.value?[d.target.value]:[],occupancy:{...f.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:xe.occupancy.playerHome?"You":"Choose a villager"}),l.map(d=>(0,r.jsx)("option",{value:d.id,disabled:Pe.some(f=>f.id!==xe.id&&f.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsx)("div",{className:`${n}-setup-place-spaces`,children:["exterior","interior"].map(d=>{let f=d==="exterior",N=f?"Exterior":"Interior",z=f?xe.presentation.image:pd.image;return(0,r.jsxs)("section",{className:`${n}-setup-place-space`,children:[(0,r.jsx)("h4",{children:N}),(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-${d}-description`,children:[N," Description \xB7 required"]}),(0,r.jsx)("textarea",{id:`${n}-setup-${d}-description`,className:`${n}-textarea`,value:f?xe.description:pd.description,maxLength:1e3,onChange:I=>{let Y=I.target.value;Oi(xe.id,$e=>f?{...$e,description:Y}:{...$e,spaces:[{...St($e,ts),description:Y}]}),we(""),jn(null)}}),(0,r.jsxs)("span",{className:`${n}-label`,children:[N," Image \xB7 optional"]}),z?(0,r.jsx)("img",{className:`${n}-setup-image-preview`,src:z.url,alt:`${d} of ${xe.name}`}):(0,r.jsx)("p",{className:`${n}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Fa,onClick:()=>{N$(xe,d)},children:z?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*",disabled:Fa,"aria-label":`Upload ${d} image for ${xe.name}`,onChange:I=>{let Y=I.target.files?.[0];I.target.value="",S$(xe,d,Y)}}),z?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Oi(xe.id,I=>f?{...I,presentation:{...I.presentation,image:null}}:{...I,spaces:[{...St(I,ts),image:null}]}),children:"Remove image"}):null]}),Hr?.venueId===xe.id&&Hr.area===d?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("img",{className:`${n}-setup-image-preview`,src:Hr.image.url,alt:`New ${d} image preview`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:k$,children:"Use this image"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>jn(null),children:"Discard"})]}):null]},d)})})]}):(0,r.jsx)("p",{className:`${n}-hint`,children:"Place or select a venue to edit it."}),s===null?(0,r.jsx)("p",{className:`${n}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ie===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Village Beginning"}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:Pa.trim()})," \xB7 ",Ct.trim()]}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",Ja?.find(d=>d.id===Je)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",co(wn).label]}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Day 1:"})," ",ya||"No first-day description was recorded."]}),_r?(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Original founding direction:"})," ",_r]}):null]}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Map and lore"}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",He==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",Da.map(d=>Bu?.find(f=>f.id===d)?.name??d).join(", ")||"None"]})]}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Starting places"}),(0,r.jsx)("div",{className:`${n}-setup-venue-list`,children:Pe.map(d=>(0,r.jsxs)("div",{className:`${n}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":oa(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),Pe.map(d=>(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]})]}):null,mg?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:mg}):null,Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]})}),(0,r.jsxs)("div",{className:`${n}-setup-visual`,children:[Ie<=1?(0,r.jsx)(c2,{scenario:wn}):(0,r.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${n}-setup-map-viewport`,children:(0,r.jsx)(Dp,{src:Ai,alt:`A map of ${Pa.trim()||"your new village"}.`,pins:Ie<3?[]:D$,placing:Ie===3&&(ki||ml||Yu!==null),view:He==="existing"?xo:Vu("cover"),shape:fg,onPlace:Ie===3?m$:void 0,compact:Ie<2,mobile:t&&Ie>=2,photoPins:Ie>=3})})}),(0,r.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Ie>0?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_||Bt||Fa,onClick:()=>_g(Ie-1),children:"\u2190 Back"}):null,Ie<Ru.length-1?(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:_||Bt||Fa,onClick:()=>_g(Ie+1),children:"Next \u2192"}):(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:_||Bt||!i,onClick:()=>{T$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:_,onClick:()=>{Jt(!1),le("home")},children:"Show me the village"}):null]})]})]})})}return(0,r.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${n}-home-bar`,children:[(0,r.jsx)(e2,{weather:i?.village.weather??""}),!t&&i?.isFounded&&qn(i.settings.venues).length>0?(0,r.jsxs)("div",{className:`${n}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":et,"aria-controls":`${n}-places-list`,disabled:_,onClick:()=>{Te(null),ae(l=>!l)},children:"Places"}),et?(0,r.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,r.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,r.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Vl(l),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Dl(l)},children:"Visit"})]},l.id))}):null]}):null,(0,r.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||_,onClick:()=>tt("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,r.jsx)(n2,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:_||!i,onClick:()=>{ba("index"),le("menu")},children:"\u2630"}),t?null:(0,r.jsx)(a2,{}),ki?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Jt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${n}-room`,children:(0,r.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,r.jsx)(Dp,{src:kl,alt:`A map of ${i?.village.name??"the village"}.`,pins:V$,placing:ki,view:xo,shape:gg,onPlace:g$,onDismiss:()=>{Te(null),ae(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Yr||Lt||ki||Al||sd?(0,r.jsxs)("div",{className:`${n}-notice`,children:[Yr?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Yr}):null,Lt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null,ki?(0,r.jsx)("span",{className:`${n}-status`,children:"Click the map where the house stands."}):null,Al?(0,r.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,sd?(0,r.jsx)("p",{className:`${n}-status`,children:sd}):null]}):null})})})]})}var Bp=class extends HTMLElement{connectedCallback(){q0(),this.__root??(this.__root=(0,n1.createRoot)(this)),this.__root.render((0,r.jsx)(Up,{element:this,children:(0,r.jsx)(S2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),q0()})}};function S2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(C2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(E2,{props:e.capabilityProps??{}}):(0,r.jsx)(N2,{element:e})}function k2(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var T2="marinara-active-chat-id";function h1(){try{window.localStorage.removeItem(T2)}catch{}window.location.reload()}function m1(e,t){let[a,i]=(0,m.useState)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let u=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(u??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function E2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=m1(t,a&&t.length>0),[u,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!u)return;let b=T=>{g.current?.contains(T.target)||h(!1)},C=T=>{T.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",C)}},[u]),!a||!c||s===null)return null;let $=s.name||"your villager",x=s.villageName||"your village",p=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":u,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":u,title:p,"aria-label":p,children:[(0,r.jsx)(k2,{}),(0,r.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),u?(0,r.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),s.resident?(0,r.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:h1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function C2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:o}=m1(t,a&&t.length>0);if(!a||!o)return null;if(i===null)return(0,r.jsx)("div",{className:`${n}-panel-view`,children:(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,r.jsxs)("div",{className:`${n}-panel-view`,children:[(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:i.room})]}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:h1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,Bp);
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
