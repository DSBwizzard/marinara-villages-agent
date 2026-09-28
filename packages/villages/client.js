var I$=Object.create;var $d=Object.defineProperty;var U$=Object.getOwnPropertyDescriptor;var q$=Object.getOwnPropertyNames;var B$=Object.getPrototypeOf,L$=Object.prototype.hasOwnProperty;var j$=(e,t,a)=>t in e?$d(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Pa=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var G$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of q$(t))!L$.call(e,o)&&o!==a&&$d(e,o,{get:()=>t[o],enumerable:!(n=U$(t,o))||n.enumerable});return e};var Ul=(e,t,a)=>(a=e!=null?I$(B$(e)):{},G$(t||!e||!e.__esModule?$d(a,"default",{value:e,enumerable:!0}):a,e));var Yg=(e,t,a)=>j$(e,typeof t!="symbol"?t+"":t,a);var of=Pa(ae=>{"use strict";var Sd=Symbol.for("react.transitional.element"),Y$=Symbol.for("react.portal"),X$=Symbol.for("react.fragment"),Q$=Symbol.for("react.strict_mode"),Z$=Symbol.for("react.profiler"),K$=Symbol.for("react.consumer"),J$=Symbol.for("react.context"),F$=Symbol.for("react.forward_ref"),P$=Symbol.for("react.suspense"),W$=Symbol.for("react.memo"),Jg=Symbol.for("react.lazy"),ex=Symbol.for("react.activity"),tx=Symbol.for("react.view_transition"),Xg=Symbol.iterator;function ax(e){return e===null||typeof e!="object"?null:(e=Xg&&e[Xg]||e["@@iterator"],typeof e=="function"?e:null)}var Fg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Pg=Object.assign,Wg={};function Oo(e,t,a){this.props=e,this.context=t,this.refs=Wg,this.updater=a||Fg}Oo.prototype.isReactComponent={};Oo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Oo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function ef(){}ef.prototype=Oo.prototype;function Td(e,t,a){this.props=e,this.context=t,this.refs=Wg,this.updater=a||Fg}var kd=Td.prototype=new ef;kd.constructor=Td;Pg(kd,Oo.prototype);kd.isPureReactComponent=!0;var Qg=Array.isArray;function Nd(){}var Ie={H:null,A:null,T:null,S:null},tf=Object.prototype.hasOwnProperty;function Ed(e,t,a){var n=a.ref;return{$$typeof:Sd,type:e,key:t,ref:n!==void 0?n:null,props:a}}function nx(e,t){return Ed(e.type,t,e.props)}function Cd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Sd}function ix(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Zg=/\/+/g;function xd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?ix(""+e.key):t.toString(36)}function ox(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Nd,Nd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Mo(e,t,a,n,o){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Sd:case Y$:c=!0;break;case Jg:return c=e._init,Mo(c(e._payload),t,a,n,o)}}if(c)return o=o(e),c=n===""?"."+xd(e,0):n,Qg(o)?(a="",c!=null&&(a=c.replace(Zg,"$&/")+"/"),Mo(o,t,a,"",function(g){return g})):o!=null&&(Cd(o)&&(o=nx(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Zg,"$&/")+"/")+c)),t.push(o)),1;c=0;var u=n===""?".":n+":";if(Qg(e))for(var h=0;h<e.length;h++)n=e[h],s=u+xd(n,h),c+=Mo(n,t,a,s,o);else if(h=ax(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,s=u+xd(n,h++),c+=Mo(n,t,a,s,o);else if(s==="object"){if(typeof e.then=="function")return Mo(ox(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function ql(e,t,a){if(e==null)return e;var n=[],o=0;return Mo(e,n,"","",function(s){return t.call(a,s,o++)}),n}function rx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Kg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function af(e){var t=Ie.T,a={};a.types=t!==null?t.types:null,Ie.T=a;try{var n=e(),o=Ie.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(Nd,Kg)}catch(s){Kg(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),Ie.T=t}}function nf(e){var t=Ie.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else af(nf.bind(null,e))}var sx={map:ql,forEach:function(e,t,a){ql(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return ql(e,function(){t++}),t},toArray:function(e){return ql(e,function(t){return t})||[]},only:function(e){if(!Cd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ae.Activity=ex;ae.Children=sx;ae.Component=Oo;ae.Fragment=X$;ae.Profiler=Z$;ae.PureComponent=Td;ae.StrictMode=Q$;ae.Suspense=P$;ae.ViewTransition=tx;ae.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ie;ae.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ie.H.useMemoCache(e)}};ae.addTransitionType=nf;ae.cache=function(e){return function(){return e.apply(null,arguments)}};ae.cacheSignal=function(){return null};ae.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Pg({},e.props),o=e.key;if(t!=null)for(s in t.key!==void 0&&(o=""+t.key),t)!tf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(n[s]=t[s]);var s=arguments.length-2;if(s===1)n.children=a;else if(1<s){for(var c=Array(s),u=0;u<s;u++)c[u]=arguments[u+2];n.children=c}return Ed(e.type,o,n)};ae.createContext=function(e){return e={$$typeof:J$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:K$,_context:e},e};ae.createElement=function(e,t,a){var n,o={},s=null;if(t!=null)for(n in t.key!==void 0&&(s=""+t.key),t)tf.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var u=Array(c),h=0;h<c;h++)u[h]=arguments[h+2];o.children=u}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return Ed(e,s,o)};ae.createRef=function(){return{current:null}};ae.forwardRef=function(e){return{$$typeof:F$,render:e}};ae.isValidElement=Cd;ae.lazy=function(e){return{$$typeof:Jg,_payload:{_status:-1,_result:e},_init:rx}};ae.memo=function(e,t){return{$$typeof:W$,type:e,compare:t===void 0?null:t}};ae.startTransition=af;ae.unstable_useCacheRefresh=function(){return Ie.H.useCacheRefresh()};ae.use=function(e){return Ie.H.use(e)};ae.useActionState=function(e,t,a){return Ie.H.useActionState(e,t,a)};ae.useCallback=function(e,t){return Ie.H.useCallback(e,t)};ae.useContext=function(e){return Ie.H.useContext(e)};ae.useDebugValue=function(){};ae.useDeferredValue=function(e,t){return Ie.H.useDeferredValue(e,t)};ae.useEffect=function(e,t){return Ie.H.useEffect(e,t)};ae.useEffectEvent=function(e){return Ie.H.useEffectEvent(e)};ae.useId=function(){return Ie.H.useId()};ae.useImperativeHandle=function(e,t,a){return Ie.H.useImperativeHandle(e,t,a)};ae.useInsertionEffect=function(e,t){return Ie.H.useInsertionEffect(e,t)};ae.useLayoutEffect=function(e,t){return Ie.H.useLayoutEffect(e,t)};ae.useMemo=function(e,t){return Ie.H.useMemo(e,t)};ae.useOptimistic=function(e,t){return Ie.H.useOptimistic(e,t)};ae.useReducer=function(e,t,a){return Ie.H.useReducer(e,t,a)};ae.useRef=function(e){return Ie.H.useRef(e)};ae.useState=function(e){return Ie.H.useState(e)};ae.useSyncExternalStore=function(e,t,a){return Ie.H.useSyncExternalStore(e,t,a)};ae.useTransition=function(){return Ie.H.useTransition()};ae.version="19.3.0"});var Bl=Pa((ES,rf)=>{"use strict";rf.exports=of()});var ff=Pa(Ge=>{"use strict";function Md(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<Ll(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Wa(e){return e.length===0?null:e[0]}function Gl(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,s=o>>>1;n<s;){var c=2*(n+1)-1,u=e[c],h=c+1,g=e[h];if(0>Ll(u,a))h<o&&0>Ll(g,u)?(e[n]=g,e[h]=a,n=h):(e[n]=u,e[c]=a,n=c);else if(h<o&&0>Ll(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function Ll(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Ge.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(sf=performance,Ge.unstable_now=function(){return sf.now()}):(zd=Date,lf=zd.now(),Ge.unstable_now=function(){return zd.now()-lf});var sf,zd,lf,$n=[],jn=[],lx=1,$a=null,Mt=3,Od=!1,ns=!1,is=!1,Vd=!1,df=typeof setTimeout=="function"?setTimeout:null,hf=typeof clearTimeout=="function"?clearTimeout:null,cf=typeof setImmediate<"u"?setImmediate:null;function jl(e){for(var t=Wa(jn);t!==null;){if(t.callback===null)Gl(jn);else if(t.startTime<=e)Gl(jn),t.sortIndex=t.expirationTime,Md($n,t);else break;t=Wa(jn)}}function Dd(e){if(is=!1,jl(e),!ns)if(Wa($n)!==null)ns=!0,Do||(Do=!0,Vo());else{var t=Wa(jn);t!==null&&_d(Dd,t.startTime-e)}}var Do=!1,os=-1,mf=5,pf=-1;function gf(){return Vd?!0:!(Ge.unstable_now()-pf<mf)}function Ad(){if(Vd=!1,Do){var e=Ge.unstable_now();pf=e;var t=!0;try{e:{ns=!1,is&&(is=!1,hf(os),os=-1),Od=!0;var a=Mt;try{t:{for(jl(e),$a=Wa($n);$a!==null&&!($a.expirationTime>e&&gf());){var n=$a.callback;if(typeof n=="function"){$a.callback=null,Mt=$a.priorityLevel;var o=n($a.expirationTime<=e);if(e=Ge.unstable_now(),typeof o=="function"){$a.callback=o,jl(e),t=!0;break t}$a===Wa($n)&&Gl($n),jl(e)}else Gl($n);$a=Wa($n)}if($a!==null)t=!0;else{var s=Wa(jn);s!==null&&_d(Dd,s.startTime-e),t=!1}}break e}finally{$a=null,Mt=a,Od=!1}t=void 0}}finally{t?Vo():Do=!1}}}var Vo;typeof cf=="function"?Vo=function(){cf(Ad)}:typeof MessageChannel<"u"?(Rd=new MessageChannel,uf=Rd.port2,Rd.port1.onmessage=Ad,Vo=function(){uf.postMessage(null)}):Vo=function(){df(Ad,0)};var Rd,uf;function _d(e,t){os=df(function(){e(Ge.unstable_now())},t)}Ge.unstable_IdlePriority=5;Ge.unstable_ImmediatePriority=1;Ge.unstable_LowPriority=4;Ge.unstable_NormalPriority=3;Ge.unstable_Profiling=null;Ge.unstable_UserBlockingPriority=2;Ge.unstable_cancelCallback=function(e){e.callback=null};Ge.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):mf=0<e?Math.floor(1e3/e):5};Ge.unstable_getCurrentPriorityLevel=function(){return Mt};Ge.unstable_next=function(e){switch(Mt){case 1:case 2:case 3:var t=3;break;default:t=Mt}var a=Mt;Mt=t;try{return e()}finally{Mt=a}};Ge.unstable_requestPaint=function(){Vd=!0};Ge.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=Mt;Mt=e;try{return t()}finally{Mt=a}};Ge.unstable_scheduleCallback=function(e,t,a){var n=Ge.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:lx++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,Md(jn,e),Wa($n)===null&&e===Wa(jn)&&(is?(hf(os),os=-1):is=!0,_d(Dd,a-n))):(e.sortIndex=o,Md($n,e),ns||Od||(ns=!0,Do||(Do=!0,Vo()))),e};Ge.unstable_shouldYield=gf;Ge.unstable_wrapCallback=function(e){var t=Mt;return function(){var a=Mt;Mt=t;try{return e.apply(this,arguments)}finally{Mt=a}}}});var vf=Pa((zS,bf)=>{"use strict";bf.exports=ff()});var $f=Pa(Ot=>{"use strict";var cx=Bl();function wf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Gn(){}var Bt={d:{f:Gn,r:function(){throw Error(wf(522))},D:Gn,C:Gn,L:Gn,m:Gn,X:Gn,S:Gn,M:Gn},p:0,findDOMNode:null},ux=Symbol.for("react.portal"),dx=Symbol.for("react.recoverable"),yf=Symbol.for("react.optimistic_key");function hx(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ux,key:n==null?null:n===yf?yf:""+n,children:e,containerInfo:t,implementation:a}}var rs=cx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Yl(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Ot.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Bt;Ot.browser=function(e){return{$$typeof:dx,_reason:e}};Ot.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(wf(299));return hx(e,t,null,a)};Ot.flushSync=function(e){var t=rs.T,a=Bt.p;try{if(rs.T=null,Bt.p=2,e)return e()}finally{rs.T=t,Bt.p=a,Bt.d.f()}};Ot.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Bt.d.C(e,t))};Ot.prefetchDNS=function(e){typeof e=="string"&&Bt.d.D(e)};Ot.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=Yl(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Bt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:s}):a==="script"&&Bt.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Ot.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Yl(t.as,t.crossOrigin);Bt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Bt.d.M(e)};Ot.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=Yl(a,t.crossOrigin);Bt.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Ot.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Yl(t.as,t.crossOrigin);Bt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Bt.d.m(e)};Ot.requestFormReset=function(e){Bt.d.r(e)};Ot.unstable_batchedUpdates=function(e,t){return e(t)};Ot.useFormState=function(e,t,a){return rs.H.useFormState(e,t,a)};Ot.useFormStatus=function(){return rs.H.useHostTransitionStatus()};Ot.version="19.3.0"});var Sf=Pa((RS,Nf)=>{"use strict";function xf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xf)}catch(e){console.error(e)}}xf(),Nf.exports=$f()});var u0=Pa(ku=>{"use strict";var ht=vf(),cv=Bl(),mx=Sf();function R(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function uv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Qs(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function dv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function hv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Tf(e){if(Qs(e)!==e)throw Error(R(188))}function px(e){var t=e.alternate;if(!t){if(t=Qs(e),t===null)throw Error(R(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var s=o.alternate;if(s===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===s.child){for(s=o.child;s;){if(s===a)return Tf(o),e;if(s===n)return Tf(o),t;s=s.sibling}throw Error(R(188))}if(a.return!==n.return)a=o,n=s;else{for(var c=!1,u=o.child;u;){if(u===a){c=!0,a=o,n=s;break}if(u===n){c=!0,n=o,a=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===a){c=!0,a=s,n=o;break}if(u===n){c=!0,n=s,a=o;break}u=u.sibling}if(!c)throw Error(R(189))}}if(a.alternate!==n)throw Error(R(190))}if(a.tag!==3)throw Error(R(188));return a.stateNode.current===a?e:t}function mv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=mv(e),t!==null)return t;e=e.sibling}return null}function ea(e,t,a,n,o,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&ea(e.child,t,a,n,o,s))return!0;e=e.sibling}return!1}function to(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function kf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function pv(e){var t=[null,null],a=to(e);return a===null||gv(t,e,a.child,{foundSelf:!1}),t}function gv(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&gv(e,t,a.child,n))return!0;a=a.sibling}return!1}function dt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(R(559))}}var Lo=null,ph=null;function gx(e,t,a){return e===a?!0:e===t?(Lo=e,!0):!1}function fx(e,t,a){return e===a?(ph=e,!1):e===t?(ph!==null&&(Lo=e),!0):!1}function Ef(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function gh(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var s=t;s;s=a(s))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var De=Object.assign,bx=Symbol.for("react.element"),Xl=Symbol.for("react.transitional.element"),ms=Symbol.for("react.portal"),jo=Symbol.for("react.fragment"),fv=Symbol.for("react.strict_mode"),fh=Symbol.for("react.profiler"),bv=Symbol.for("react.consumer"),rn=Symbol.for("react.context"),Tm=Symbol.for("react.forward_ref"),bh=Symbol.for("react.suspense"),vh=Symbol.for("react.suspense_list"),km=Symbol.for("react.memo"),Zn=Symbol.for("react.lazy"),yh=Symbol.for("react.activity"),vx=Symbol.for("react.legacy_hidden"),yx=Symbol.for("react.memo_cache_sentinel"),wh=Symbol.for("react.view_transition"),wx=Symbol.for("react.recoverable"),Cf=Symbol.iterator;function ss(e){return e===null||typeof e!="object"?null:(e=Cf&&e[Cf]||e["@@iterator"],typeof e=="function"?e:null)}var $x=Symbol.for("react.client.reference");function $h(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===$x?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case jo:return"Fragment";case fh:return"Profiler";case fv:return"StrictMode";case bh:return"Suspense";case vh:return"SuspenseList";case yh:return"Activity";case wh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ms:return"Portal";case rn:return e.displayName||"Context";case bv:return(e._context.displayName||"Context")+".Consumer";case Tm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case km:return t=e.displayName||null,t!==null?t:$h(e.type)||"Memo";case Zn:t=e._payload,e=e._init;try{return $h(e(t))}catch{}}return null}var ps=Array.isArray,ee=cv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ne=mx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Li={pending:!1,data:null,method:null,action:null},xh=[],Go=-1;function mn(e){return{current:e}}function kt(e){0>Go||(e.current=xh[Go],xh[Go]=null,Go--)}function Be(e,t){Go++,xh[Go]=e.current,e.current=t}var un=mn(null),Rs=mn(null),ni=mn(null),Mc=mn(null);function Oc(e,t){switch(Be(ni,t),Be(Rs,e),Be(un,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Lb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Lb(t),e=Uw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}kt(un),Be(un,e)}function ur(){kt(un),kt(Rs),kt(ni)}function Nh(e){var t=e.memoizedState;t!==null&&(wr._currentValue=t.memoizedState,Be(Mc,e)),t=un.current;var a=Uw(t,e.type);t!==a&&(Be(Rs,e),Be(un,a))}function Vc(e){Rs.current===e&&(kt(un),kt(Rs)),Mc.current===e&&(kt(Mc),wr._currentValue=Li)}var Hd,zf;function Xn(e){if(Hd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Hd=t&&t[1]||"",zf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Hd+e+zf}var Id=!1;function Ud(e,t){if(!e||Id)return"";Id=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(C){var f=C}Reflect.construct(e,[],x)}else{try{x.call()}catch(C){f=C}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(C){f=C}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(C){if(C&&f&&typeof C.stack=="string")return[C.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=n.DetermineComponentFrameRoot(),c=s[0],u=s[1];if(c&&u){var h=c.split(`
`),g=u.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var $=`
`+h[n].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=n&&0<=o);break}}}finally{Id=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Xn(a):""}function xx(e,t){switch(e.tag){case 26:case 27:case 5:return Xn(e.type);case 16:return Xn("Lazy");case 13:return e.child!==t&&t!==null?Xn("Suspense Fallback"):Xn("Suspense");case 19:return Xn("SuspenseList");case 0:case 15:return Ud(e.type,!1);case 11:return Ud(e.type.render,!1);case 1:return Ud(e.type,!0);case 31:return Xn("Activity");case 30:return Xn("ViewTransition");default:return""}}function Af(e){try{var t="",a=null;do t+=xx(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Sh=Object.prototype.hasOwnProperty,Em=ht.unstable_scheduleCallback,qd=ht.unstable_cancelCallback,Nx=ht.unstable_shouldYield,Sx=ht.unstable_requestPaint,ua=ht.unstable_now,Tx=ht.unstable_getCurrentPriorityLevel,vv=ht.unstable_ImmediatePriority,yv=ht.unstable_UserBlockingPriority,Dc=ht.unstable_NormalPriority,kx=ht.unstable_LowPriority,wv=ht.unstable_IdlePriority,Ex=ht.log,Cx=ht.unstable_setDisableYieldValue,Zs=null,da=null;function Fn(e){if(typeof Ex=="function"&&Cx(e),da&&typeof da.setStrictMode=="function")try{da.setStrictMode(Zs,e)}catch{}}var ha=Math.clz32?Math.clz32:Rx,zx=Math.log,Ax=Math.LN2;function Rx(e){return e>>>=0,e===0?32:31-(zx(e)/Ax|0)|0}var Ql=256,Zl=262144,Kl=4194304;function Hi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function su(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var u=n&134217727;return u!==0?(n=u&~s,n!==0?o=Hi(n):(c&=u,c!==0?o=Hi(c):a||(a=u&~e,a!==0&&(o=Hi(a))))):(u=n&~s,u!==0?o=Hi(u):c!==0?o=Hi(c):a||(a=n&~e,a!==0&&(o=Hi(a)))),o===0?0:t!==0&&t!==o&&(t&s)===0&&(s=o&-o,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:o}function Ks(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function $v(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-ha(a),o=1<<n;t|=e[n],a&=~o}return t}function Mx(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function xv(){var e=Kl;return Kl<<=1,(Kl&62914560)===0&&(Kl=4194304),e}function Bd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Js(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Ox(e,t,a,n,o,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var u=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-ha(a),x=1<<$;u[$]=0,h[$]=-1;var f=g[$];if(f!==null)for(g[$]=null,$=0;$<f.length;$++){var b=f[$];b!==null&&(b.lane&=-536870913)}a&=~x}n!==0&&Nv(e,n,0),s!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Nv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-ha(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function Sv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-ha(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function Tv(e,t){var a=t&-t;return a=(a&42)!==0?1:Cm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Cm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function zm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function kv(){var e=Ne.p;return e!==0?e:(e=window.event,e===void 0?32:s0(e.type))}function Rf(e,t){var a=Ne.p;try{return Ne.p=e,t()}finally{Ne.p=a}}var Vn=Math.random().toString(36).slice(2),St="__reactFiber$"+Vn,ta="__reactProps$"+Vn,Nr="__reactContainer$"+Vn,Mf="__reactEvents$"+Vn,Vx="__reactListeners$"+Vn,Dx="__reactHandles$"+Vn,Of="__reactResources$"+Vn,Fs="__reactMarker$"+Vn,_c="__reactLoad$"+Vn;function lu(e){delete e[St],delete e[ta],delete e[Vx],delete e[Dx]}function qi(e){var t;if(t=e[St])return t;for(var a=e.parentNode;a;){if(t=a[Nr]||a[St]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Jb(e);e!==null;){if(a=e[St])return a;e=Jb(e)}return t}e=a,a=e.parentNode}return null}function Sr(e){if(e=e[St]||e[Nr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function gs(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(R(33))}function er(e){var t=e[Of];return t||(t=e[Of]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function yt(e){e[Fs]=!0}function Ev(e){e[_c]=void 0}var Cv=new Set,zv={};function ao(e,t){dr(e,t),dr(e+"Capture",t)}function dr(e,t){for(zv[e]=t,e=0;e<t.length;e++)Cv.add(t[e])}var _x=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Vf={},Df={};function Hx(e){return Sh.call(Df,e)?!0:Sh.call(Vf,e)?!1:_x.test(e)?Df[e]=!0:(Vf[e]=!0,!1)}var we=!1;function _f(){var e=we;return we=!1,e}function mc(e,t,a){if(Hx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Jl(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function xn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function ra(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Av(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Ix(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,s=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Th(e){if(!e._valueTracker){var t=Av(e)?"checked":"value";e._valueTracker=Ix(e,t,""+e[t])}}function Rv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Av(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var Ux=/[\n"\\]/g;function ka(e){return e.replace(Ux,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function kh(e,t,a,n,o,s,c,u){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+ra(t)):e.value!==""+ra(t)&&(e.value=""+ra(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Ld(e,ra(e.value)):Ld(e,ra(t)):a!=null?Ld(e,ra(a)):n!=null&&e.removeAttribute("value"),o==null&&s!=null&&(e.defaultChecked=!!s),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.name=""+ra(u):e.removeAttribute("name")}function Mv(e,t,a,n,o,s,c,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){Th(e);return}a=a!=null?""+ra(a):"",t=t!=null?""+ra(t):a,u||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=u?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),Th(e)}function Ld(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function tr(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+ra(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Ov(e,t,a){if(t!=null&&(t=""+ra(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+ra(a):""}function Vv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(R(92));if(ps(n)){if(1<n.length)throw Error(R(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=ra(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Th(e)}function hr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var qx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Hf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||qx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Dv(e,t,a){if(t!=null&&typeof t!="object")throw Error(R(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",we=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(Hf(e,o,n),we=!0)}else for(var s in t)t.hasOwnProperty(s)&&Hf(e,s,t[s])}function Am(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Bx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Lx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function pc(e){return Lx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function sn(){}var Eh=null;function Rm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Yo=null,ar=null;function If(e){var t=Sr(e);if(t&&(e=t.stateNode)){var a=e[ta]||null;e:switch(e=t.stateNode,t.type){case"input":if(kh(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+ka(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[ta]||null;if(!o)throw Error(R(90));kh(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Rv(n)}break e;case"textarea":Ov(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&tr(e,!!a.multiple,t,!1)}}}var jd=!1;function _v(e,t,a){if(jd)return e(t,a);jd=!0;try{var n=e(t);return n}finally{if(jd=!1,(Yo!==null||ar!==null)&&(xu(),Yo&&(t=Yo,e=ar,ar=Yo=null,If(t),e)))for(t=0;t<e.length;t++)If(e[t])}}function Ms(e,t){var a=e.stateNode;if(a===null)return null;var n=a[ta]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(R(231,t,typeof a));return a}var Cn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Ch=!1;if(Cn)try{_o={},Object.defineProperty(_o,"passive",{get:function(){Ch=!0}}),window.addEventListener("test",_o,_o),window.removeEventListener("test",_o,_o)}catch{Ch=!1}var _o,Pn=null,Mm=null,gc=null;function Hv(){if(gc)return gc;var e,t=Mm,a=t.length,n,o="value"in Pn?Pn.value:Pn.textContent,s=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===o[s-n];n++);return gc=o.slice(e,1<n?1-n:void 0)}function fc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Fl(){return!0}function Uf(){return!1}function Yt(e){function t(a,n,o,s,c){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(a=e[u],this[u]=a?a(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Fl:Uf,this.isPropagationStopped=Uf,this}return De(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Fl)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Fl)},persist:function(){},isPersistent:Fl}),t}var vi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},cu=Yt(vi),Ps=De({},vi,{view:0,detail:0}),jx=Yt(Ps),Gd,Yd,ls,uu=De({},Ps,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Om,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==ls&&(ls&&e.type==="mousemove"?(Gd=e.screenX-ls.screenX,Yd=e.screenY-ls.screenY):Yd=Gd=0,ls=e),Gd)},movementY:function(e){return"movementY"in e?e.movementY:Yd}}),qf=Yt(uu),Gx=De({},uu,{dataTransfer:0}),Yx=Yt(Gx),Xx=De({},Ps,{relatedTarget:0}),Xd=Yt(Xx),Qx=De({},vi,{animationName:0,elapsedTime:0,pseudoElement:0}),Zx=Yt(Qx),Kx=De({},vi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Jx=Yt(Kx),Fx=De({},vi,{data:0}),Bf=Yt(Fx),Px={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Wx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},eN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function tN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=eN[e])?!!t[e]:!1}function Om(){return tN}var aN=De({},Ps,{key:function(e){if(e.key){var t=Px[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=fc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Wx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Om,charCode:function(e){return e.type==="keypress"?fc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?fc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),nN=Yt(aN),iN=De({},uu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Lf=Yt(iN),oN=De({},vi,{submitter:0}),rN=Yt(oN),sN=De({},Ps,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Om}),lN=Yt(sN),cN=De({},vi,{propertyName:0,elapsedTime:0,pseudoElement:0}),uN=Yt(cN),dN=De({},uu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),hN=Yt(dN),mN=De({},vi,{newState:0,oldState:0,source:0}),pN=Yt(mN),gN=[9,13,27,32],Vm=Cn&&"CompositionEvent"in window,vs=null;Cn&&"documentMode"in document&&(vs=document.documentMode);var fN=Cn&&"TextEvent"in window&&!vs,Iv=Cn&&(!Vm||vs&&8<vs&&11>=vs),jf=" ",Gf=!1;function Uv(e,t){switch(e){case"keyup":return gN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function qv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Xo=!1;function bN(e,t){switch(e){case"compositionend":return qv(t);case"keypress":return t.which!==32?null:(Gf=!0,jf);case"textInput":return e=t.data,e===jf&&Gf?null:e;default:return null}}function vN(e,t){if(Xo)return e==="compositionend"||!Vm&&Uv(e,t)?(e=Hv(),gc=Mm=Pn=null,Xo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Iv&&t.locale!=="ko"?null:t.data;default:return null}}var yN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Yf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!yN[e.type]:t==="textarea"}function Bv(e,t,a,n){Yo?ar?ar.push(n):ar=[n]:Yo=n,t=iu(t,"onChange"),0<t.length&&(a=new cu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var ys=null,Os=null;function wN(e){_w(e,0)}function du(e){var t=gs(e);if(Rv(t))return e}function Xf(e,t){if(e==="change")return t}var Lv=!1;Cn&&(Cn?(Wl="oninput"in document,Wl||(Qd=document.createElement("div"),Qd.setAttribute("oninput","return;"),Wl=typeof Qd.oninput=="function"),Pl=Wl):Pl=!1,Lv=Pl&&(!document.documentMode||9<document.documentMode));var Pl,Wl,Qd;function Qf(){ys&&(ys.detachEvent("onpropertychange",jv),Os=ys=null)}function jv(e){if(e.propertyName==="value"&&du(Os)){var t=[];Bv(t,Os,e,Rm(e)),_v(wN,t)}}function $N(e,t,a){e==="focusin"?(Qf(),ys=t,Os=a,ys.attachEvent("onpropertychange",jv)):e==="focusout"&&Qf()}function xN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return du(Os)}function NN(e,t){if(e==="click")return du(t)}function SN(e,t){if(e==="input"||e==="change")return du(t)}function TN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var pa=typeof Object.is=="function"?Object.is:TN;function Vs(e,t){if(pa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!Sh.call(t,o)||!pa(e[o],t[o]))return!1}return!0}function zh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Zf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Kf(e,t){var a=Zf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Zf(a)}}function Gv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Gv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Yv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=zh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=zh(e.document)}return t}function Dm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var kN=Cn&&"documentMode"in document&&11>=document.documentMode,Qo=null,Ah=null,ws=null,Rh=!1;function Jf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Rh||Qo==null||Qo!==zh(n)||(n=Qo,"selectionStart"in n&&Dm(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),ws&&Vs(ws,n)||(ws=n,n=iu(Ah,"onSelect"),0<n.length&&(t=new cu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Qo)))}function Di(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Zo={animationend:Di("Animation","AnimationEnd"),animationiteration:Di("Animation","AnimationIteration"),animationstart:Di("Animation","AnimationStart"),transitionrun:Di("Transition","TransitionRun"),transitionstart:Di("Transition","TransitionStart"),transitioncancel:Di("Transition","TransitionCancel"),transitionend:Di("Transition","TransitionEnd")},Zd={},Xv={};Cn&&(Xv=document.createElement("div").style,"AnimationEvent"in window||(delete Zo.animationend.animation,delete Zo.animationiteration.animation,delete Zo.animationstart.animation),"TransitionEvent"in window||delete Zo.transitionend.transition);function no(e){if(Zd[e])return Zd[e];if(!Zo[e])return e;var t=Zo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Xv)return Zd[e]=t[a];return e}var Qv=no("animationend"),Zv=no("animationiteration"),Kv=no("animationstart"),EN=no("transitionrun"),CN=no("transitionstart"),zN=no("transitioncancel"),Jv=no("transitionend"),Fv=new Map,Mh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Mh.push("scrollEnd");function Xa(e,t){Fv.set(e,t),ao(t,[e])}var AN=0;function zn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ya.identifierPrefix;var a=AN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Ff(e){if(e==null||typeof e=="string")return e;var t=null,a=cr;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function Dn(e,t){return e=Ff(e),t=Ff(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Hc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Na=[],Ko=0,_m=0;function hu(){for(var e=Ko,t=_m=Ko=0;t<e;){var a=Na[t];Na[t++]=null;var n=Na[t];Na[t++]=null;var o=Na[t];Na[t++]=null;var s=Na[t];if(Na[t++]=null,n!==null&&o!==null){var c=n.pending;c===null?o.next=o:(o.next=c.next,c.next=o),n.pending=o}s!==0&&Pv(a,o,s)}}function mu(e,t,a,n){Na[Ko++]=e,Na[Ko++]=t,Na[Ko++]=a,Na[Ko++]=n,_m|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function Hm(e,t,a,n){return mu(e,t,a,n),Ic(e)}function io(e,t){return mu(e,null,null,t),Ic(e)}function Pv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,s=e.return;s!==null;)s.childLanes|=a,n=s.alternate,n!==null&&(n.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(o=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,o&&t!==null&&(o=31-ha(a),e=s.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),s):null}function Ic(e){if(50<As)throw As=0,kc=null,Error(R(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Jo={};function RN(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Pt(e,t,a,n){return new RN(e,t,a,n)}function Im(e){return e=e.prototype,!(!e||!e.isReactComponent)}function kn(e,t){var a=e.alternate;return a===null?(a=Pt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Wv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function bc(e,t,a,n,o,s){var c=0;if(n=e,typeof n=="function")Im(n)&&(c=1);else if(typeof n=="string")c=n2(e,a,un.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case yh:return e=Pt(31,a,t,o),e.elementType=yh,e.lanes=s,e;case jo:return ji(a.children,o,s,t);case fv:c=8,o|=24;break;case fh:return e=Pt(12,a,t,o|2),e.elementType=fh,e.lanes=s,e;case bh:return e=Pt(13,a,t,o),e.elementType=bh,e.lanes=s,e;case vh:return e=Pt(19,a,t,o),e.elementType=vh,e.lanes=s,e;case vx:case wh:return e=o|32,e=Pt(30,a,t,e),e.elementType=wh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case rn:c=10;break e;case bv:c=9;break e;case Tm:c=11;break e;case km:c=14;break e;case Zn:c=16,n=null;break e}c=29,a=Error(R(130,e===null?"null":typeof e,"")),n=null}return t=Pt(c,a,t,o),t.elementType=e,t.type=n,t.lanes=s,t}function ji(e,t,a,n){return e=Pt(7,e,n,t),e.lanes=a,e}function Kd(e,t,a){return e=Pt(6,e,null,t),e.lanes=a,e}function ey(e){var t=Pt(18,null,null,0);return t.stateNode=e,t}function Jd(e,t,a){return t=Pt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Pf=new WeakMap;function Ea(e,t){if(typeof e=="object"&&e!==null){var a=Pf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Af(t)},Pf.set(e,t),t)}return{value:e,source:t,stack:Af(t)}}var Fo=[],Po=0,Uc=null,Ds=0,Sa=[],Ta=0,mi=null,ln=1,cn="";function Sn(e,t){Fo[Po++]=Ds,Fo[Po++]=Uc,Uc=e,Ds=t}function ty(e,t,a){Sa[Ta++]=ln,Sa[Ta++]=cn,Sa[Ta++]=mi,mi=e;var n=ln;e=cn;var o=32-ha(n)-1;n&=~(1<<o),a+=1;var s=32-ha(t)+o;if(30<s){var c=o-o%5;s=(n&(1<<c)-1).toString(32),n>>=c,o-=c,ln=1<<32-ha(t)+o|a<<o|n,cn=s+e}else ln=1<<s|a<<o|n,cn=e}function pu(e){e.return!==null&&(Sn(e,1),ty(e,1,0))}function Um(e){for(;e===Uc;)Uc=Fo[--Po],Fo[Po]=null,Ds=Fo[--Po],Fo[Po]=null;for(;e===mi;)mi=Sa[--Ta],Sa[Ta]=null,cn=Sa[--Ta],Sa[Ta]=null,ln=Sa[--Ta],Sa[Ta]=null}function ay(e,t){Sa[Ta++]=ln,Sa[Ta++]=cn,Sa[Ta++]=mi,ln=t.id,cn=t.overflow,mi=e}var wt=null,qe=null,le=!1,ii=null,Ca=!1,Oh=Error(R(519));function pi(e){var t=Error(R(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw _s(Ea(t,e)),Oh}function Wf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[St]=e,t[ta]=n,a){case"dialog":he("cancel",t),he("close",t);break;case"iframe":case"object":case"embed":he("load",t);break;case"video":case"audio":for(a=0;a<qs.length;a++)he(qs[a],t);break;case"source":he("error",t);break;case"img":case"image":case"link":he("error",t),he("load",t);break;case"details":he("toggle",t);break;case"input":he("invalid",t),Mv(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":he("invalid",t);break;case"textarea":he("invalid",t),Vv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Iw(t.textContent,a)?(n.popover!=null&&(he("beforetoggle",t),he("toggle",t)),n.onScroll!=null&&he("scroll",t),n.onScrollEnd!=null&&he("scrollend",t),n.onClick!=null&&(t.onclick=sn),t=!0):t=!1,t||pi(e,!0)}function qc(e){for(wt=e.return;wt;)switch(wt.tag){case 5:case 31:case 13:Ca=!1;return;case 27:case 3:Ca=!0;return;default:wt=wt.return}}function Ho(e){if(e!==wt)return!1;if(!le)return qc(e),le=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||bm(e.type,e.memoizedProps)),a=!a),a&&qe&&pi(e),qc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(317));qe=Kb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(317));qe=Kb(e)}else t===27?(t=qe,yi(e.type)?(e=$m,$m=null,qe=e):qe=t):qe=wt?za(e.stateNode.nextSibling):null;return!0}function Qi(){qe=wt=null,le=!1}function Fd(){var e=ii;return e!==null&&(Jt===null?Jt=e:Jt.push.apply(Jt,e),ii=null),e}function _s(e){ii===null?ii=[e]:ii.push(e)}var Vh=mn(null),oo=null,Tn=null;function Wn(e,t,a){Be(Vh,t._currentValue),t._currentValue=a}function En(e){e._currentValue=Vh.current,kt(Vh)}function vc(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function Dh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var s=o.dependencies;if(s!==null){var c=o.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=o;for(var h=0;h<t.length;h++)if(u.context===t[h]){s.lanes|=a,u=s.alternate,u!==null&&(u.lanes|=a),vc(s.return,a,e),n||(c=null);break e}s=u.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(R(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),vc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),vc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Zi(e,t,a,n){e=null;for(var o=t,s=!1;o!==null;){if(!s){if((o.flags&524288)!==0)s=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(R(387));if(c=c.memoizedProps,c!==null){var u=o.type;pa(o.pendingProps.value,c.value)||(e!==null?e.push(u):e=[u])}}else if(o===Mc.current){if(c=o.alternate,c===null)throw Error(R(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(wr):e=[wr])}o=o.return}return e!==null&&Dh(t,e,a,n),t.flags|=262144,e!==null}function Bc(e){for(e=e.firstContext;e!==null;){if(!pa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ki(e){oo=e,Tn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Tt(e){return ny(oo,e)}function ec(e,t){return oo===null&&Ki(e),ny(e,t)}function ny(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Tn===null){if(e===null)throw Error(R(308));Tn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Tn=Tn.next=t;return a}var MN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},ON=ht.unstable_scheduleCallback,VN=ht.unstable_NormalPriority,nt={$$typeof:rn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function qm(){return{controller:new MN,data:new Map,refCount:0}}function Ws(e){e.refCount--,e.refCount===0&&ON(VN,function(){e.controller.abort()})}function eb(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var fs=null;function DN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var $s=null,_h=0,Ji=0,nr=null;function _N(e,t){if($s===null){var a=$s=[];_h=0,Ji=pp(),nr={status:"pending",value:void 0,then:function(n){a.push(n)}}}return _h++,t.then(tb,tb),t}function tb(){if(--_h===0&&(fs=null,$s!==null)){nr!==null&&(nr.status="fulfilled");var e=$s;$s=null,Ji=0,nr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function HN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var ab=ee.S;ee.S=function(e,t){if($w=ua(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&_N(e,t),fs!==null)for(var a=br;a!==null;)eb(a,fs),a=a.next;if(a=e.types,a!==null){for(var n=br;n!==null;)eb(n,a),n=n.next;if(Ji!==0){n=fs,n===null&&(n=fs=[]);for(var o=0;o<a.length;o++){var s=a[o];n.indexOf(s)===-1&&n.push(s)}}}ab!==null&&ab(e,t)};var Gi=mn(null);function Bm(){var e=Gi.current;return e!==null?e:Ve.pooledCache}function yc(e,t){t===null?Be(Gi,Gi.current):Be(Gi,t.pool)}function iy(){var e=Bm();return e===null?null:{parent:nt._currentValue,pool:e}}var Tr=Error(R(460)),Lm=Error(R(474)),gu=Error(R(542)),Lc={then:function(){}};function nb(e){return e=e.status,e==="fulfilled"||e==="rejected"}function oy(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(sn,sn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ob(e),e===void 0&&!("reason"in t)?Error(R(600)):e;default:if(typeof t.status=="string")t.then(sn,sn);else{if(e=Ve,e!==null&&100<e.shellSuspendCounter)throw Error(R(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ob(e),e}throw Yi=t,Tr}}function Ii(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Yi=a,Tr):a}}var Yi=null;function ib(){if(Yi===null)throw Error(R(459));var e=Yi;return Yi=null,e}function ob(e){if(e===Tr||e===gu)throw Error(R(483))}var ir=null,Hs=0;function tc(e){var t=Hs;return Hs+=1,ir===null&&(ir=[]),oy(ir,e,t)}function Yn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function ac(e,t){throw t.$$typeof===bx?Error(R(525)):(e=Object.prototype.toString.call(t),Error(R(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function ry(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function n(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function o(w,y){return w=kn(w,y),w.index=0,w.sibling=null,w}function s(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function u(w,y,v,S){return y===null||y.tag!==6?(y=Kd(v,w.mode,S),y.return=w,y):(y=o(y,v),y.return=w,y)}function h(w,y,v,S){var O=v.type;return O===jo?(w=$(w,y,v.props.children,S,v.key),Yn(w,v),w):y!==null&&(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Zn&&Ii(O)===y.type)?(y=o(y,v.props),Yn(y,v),y.return=w,y):(y=bc(v.type,v.key,v.props,null,w.mode,S),Yn(y,v),y.return=w,y)}function g(w,y,v,S){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=Jd(v,w.mode,S),y.return=w,y):(y=o(y,v.children||[]),y.return=w,y)}function $(w,y,v,S,O){return y===null||y.tag!==7?(y=ji(v,w.mode,S,O),y.return=w,y):(y=o(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=Kd(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Xl:return v=bc(y.type,y.key,y.props,null,w.mode,v),Yn(v,y),v.return=w,v;case ms:return y=Jd(y,w.mode,v),y.return=w,y;case Zn:return y=Ii(y),x(w,y,v)}if(ps(y)||ss(y))return y=ji(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,tc(y),v);if(y.$$typeof===rn)return x(w,ec(w,y),v);ac(w,y)}return null}function f(w,y,v,S){var O=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return O!==null?null:u(w,y,""+v,S);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Xl:return v.key===O?h(w,y,v,S):null;case ms:return v.key===O?g(w,y,v,S):null;case Zn:return v=Ii(v),f(w,y,v,S)}if(ps(v)||ss(v))return O!==null?null:$(w,y,v,S,null);if(typeof v.then=="function")return f(w,y,tc(v),S);if(v.$$typeof===rn)return f(w,y,ec(w,v),S);ac(w,v)}return null}function b(w,y,v,S,O){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return w=w.get(v)||null,u(y,w,""+S,O);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Xl:return w=w.get(S.key===null?v:S.key)||null,h(y,w,S,O);case ms:return w=w.get(S.key===null?v:S.key)||null,g(y,w,S,O);case Zn:return S=Ii(S),b(w,y,v,S,O)}if(ps(S)||ss(S))return w=w.get(v)||null,$(y,w,S,O,null);if(typeof S.then=="function")return b(w,y,v,tc(S),O);if(S.$$typeof===rn)return b(w,y,v,ec(y,S),O);ac(y,S)}return null}function C(w,y,v,S){for(var O=null,F=null,H=y,j=y=0,ve=null;H!==null&&j<v.length;j++){H.index>j?(ve=H,H=null):ve=H.sibling;var X=f(w,H,v[j],S);if(X===null){H===null&&(H=ve);break}e&&H&&X.alternate===null&&t(w,H),y=s(X,y,j),F===null?O=X:F.sibling=X,F=X,H=ve}if(j===v.length)return a(w,H),le&&Sn(w,j),O;if(H===null){for(;j<v.length;j++)H=x(w,v[j],S),H!==null&&(y=s(H,y,j),F===null?O=H:F.sibling=H,F=H);return le&&Sn(w,j),O}for(H=n(H);j<v.length;j++)ve=b(H,w,j,v[j],S),ve!==null&&(e&&(X=ve.alternate,X!==null&&H.delete(X.key===null?j:X.key)),y=s(ve,y,j),F===null?O=ve:F.sibling=ve,F=ve);return e&&H.forEach(function(_e){return t(w,_e)}),le&&Sn(w,j),O}function k(w,y,v,S){if(v==null)throw Error(R(151));for(var O=null,F=null,H=y,j=y=0,ve=null,X=v.next();H!==null&&!X.done;j++,X=v.next()){H.index>j?(ve=H,H=null):ve=H.sibling;var _e=f(w,H,X.value,S);if(_e===null){H===null&&(H=ve);break}e&&H&&_e.alternate===null&&t(w,H),y=s(_e,y,j),F===null?O=_e:F.sibling=_e,F=_e,H=ve}if(X.done)return a(w,H),le&&Sn(w,j),O;if(H===null){for(;!X.done;j++,X=v.next())X=x(w,X.value,S),X!==null&&(y=s(X,y,j),F===null?O=X:F.sibling=X,F=X);return le&&Sn(w,j),O}for(H=n(H);!X.done;j++,X=v.next())X=b(H,w,j,X.value,S),X!==null&&(e&&(ve=X.alternate,ve!==null&&H.delete(ve.key===null?j:ve.key)),y=s(X,y,j),F===null?O=X:F.sibling=X,F=X);return e&&H.forEach(function(rt){return t(w,rt)}),le&&Sn(w,j),O}function M(w,y,v,S){if(typeof v=="object"&&v!==null&&v.type===jo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Xl:e:{for(var O=v.key;y!==null;){if(y.key===O){if(O=v.type,O===jo){if(y.tag===7){a(w,y.sibling),S=o(y,v.props.children),Yn(S,v),S.return=w,w=S;break e}}else if(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Zn&&Ii(O)===y.type){a(w,y.sibling),S=o(y,v.props),Yn(S,v),S.return=w,w=S;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===jo?(S=ji(v.props.children,w.mode,S,v.key),Yn(S,v),S.return=w,w=S):(S=bc(v.type,v.key,v.props,null,w.mode,S),Yn(S,v),S.return=w,w=S)}return c(w);case ms:e:{for(O=v.key;y!==null;){if(y.key===O)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),S=o(y,v.children||[]),S.return=w,w=S;break e}else{a(w,y);break}else t(w,y);y=y.sibling}S=Jd(v,w.mode,S),S.return=w,w=S}return c(w);case Zn:return v=Ii(v),M(w,y,v,S)}if(ps(v))return C(w,y,v,S);if(ss(v)){if(O=ss(v),typeof O!="function")throw Error(R(150));return v=O.call(v),k(w,y,v,S)}if(typeof v.then=="function")return M(w,y,tc(v),S);if(v.$$typeof===rn)return M(w,y,ec(w,v),S);ac(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),S=o(y,v),S.return=w,w=S):(a(w,y),S=Kd(v,w.mode,S),S.return=w,w=S),c(w)):a(w,y)}return function(w,y,v,S){try{Hs=0;var O=M(w,y,v,S);return ir=null,O}catch(H){if(H===Tr||H===gu)throw H;var F=Pt(29,H,null,w.mode);return F.lanes=S,F.return=w,F}}}var Fi=ry(!0),sy=ry(!1),Kn=!1;function jm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Hh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function oi(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ri(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(xe&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=Ic(e),Pv(e,null,a),t}return mu(e,n,t,a),Ic(e)}function xs(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Sv(e,a)}}function Pd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?o=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?o=s=t:s=s.next=t}else o=s=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:s,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Ih=!1;function Ns(){if(Ih){var e=nr;if(e!==null)throw e}}function Ss(e,t,a,n){Ih=!1;var o=e.updateQueue;Kn=!1;var s=o.firstBaseUpdate,c=o.lastBaseUpdate,u=o.shared.pending;if(u!==null){o.shared.pending=null;var h=u,g=h.next;h.next=null,c===null?s=g:c.next=g,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,u=$.lastBaseUpdate,u!==c&&(u===null?$.firstBaseUpdate=g:u.next=g,$.lastBaseUpdate=h))}if(s!==null){var x=o.baseState;c=0,$=g=h=null,u=s;do{var f=u.lane&-536870913,b=f!==u.lane;if(b?(pe&f)===f:(n&f)===f){f!==0&&f===Ji&&(Ih=!0),$!==null&&($=$.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var C=e,k=u;f=t;var M=a;switch(k.tag){case 1:if(C=k.payload,typeof C=="function"){x=C.call(M,x,f);break e}x=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=k.payload,f=typeof C=="function"?C.call(M,x,f):C,f==null)break e;x=De({},x,f);break e;case 2:Kn=!0}}f=u.callback,f!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[f]:b.push(f))}else b={lane:f,tag:u.tag,payload:u.payload,callback:u.callback,next:null},$===null?(g=$=b,h=x):$=$.next=b,c|=f;if(u=u.next,u===null){if(u=o.shared.pending,u===null)break;b=u,u=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);$===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=$,s===null&&(o.shared.lanes=0),bi|=c,e.lanes=c,e.memoizedState=x}}function ly(e,t){if(typeof e!="function")throw Error(R(191,e));e.call(t)}function cy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)ly(a[e],t)}var gi=mn(null),jc=mn(0);function rb(e,t){e=On,Be(jc,e),Be(gi,t),On=e|t.baseLanes}function Uh(){Be(jc,On),Be(gi,gi.current)}function Gm(){On=jc.current,kt(gi),kt(jc)}var zt=mn(null),Vt=null;function si(e){var t=e.alternate;Be(Et,Et.current&1),Be(zt,e),Vt===null&&(t===null||gi.current!==null||t.memoizedState!==null)&&(Vt=e)}function qh(e){Be(Et,Et.current),Be(zt,e),Vt===null&&(Vt=e)}function uy(e){e.tag===22?(Be(Et,Et.current),Be(zt,e),Vt===null&&(Vt=e)):li()}function li(){Be(Et,Et.current),Be(zt,zt.current)}function sa(e){kt(zt),Vt===e&&(Vt=null),kt(Et)}var Et=mn(0);function Is(e,t){Be(zt,zt.current),Be(Et,t)}function Ym(e){kt(Et),kt(zt),Vt===e&&(Vt=null)}function Gc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||wm(a)||vp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var An=0,ne=null,Me=null,at=null,Yc=!1,or=!1,Pi=!1,Xc=0,Us=0,rr=null,IN=0;function Fe(){throw Error(R(321))}function Xm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!pa(e[a],t[a]))return!1;return!0}function Qm(e,t,a,n,o,s){return An=s,ne=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ee.H=e===null||e.memoizedState===null?By:Ly,Pi=!1,s=a(n,o),Pi=!1,or&&(s=hy(t,a,n,o)),dy(e),s}function dy(e){ee.H=Qc;var t=Me!==null&&Me.next!==null;if(An=0,at=Me=ne=null,Yc=!1,Us=0,rr=null,t)throw Error(R(300));e===null||it||(e=e.dependencies,e!==null&&Bc(e)&&(it=!0))}function hy(e,t,a,n){ne=e;var o=0;do{if(or&&(rr=null),Us=0,or=!1,25<=o)throw Error(R(301));if(o+=1,at=Me=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ee.H=XN,s=t(a,n)}while(or);return s}function UN(){var e=ee.H,t=e.useState()[0];return t=typeof t.then=="function"?el(t):t,e=e.useState()[0],(Me!==null?Me.memoizedState:null)!==e&&(ne.flags|=1024),t}function Zm(){var e=Xc!==0;return Xc=0,e}function Km(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Jm(e){if(Yc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Yc=!1}An=0,at=Me=ne=null,or=!1,Us=Xc=0,rr=null}function Gt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return at===null?ne.memoizedState=at=e:at=at.next=e,at}function We(){if(Me===null){var e=ne.alternate;e=e!==null?e.memoizedState:null}else e=Me.next;var t=at===null?ne.memoizedState:at.next;if(t!==null)at=t,Me=e;else{if(e===null)throw ne.alternate===null?Error(R(467)):Error(R(310));Me=e,e={memoizedState:Me.memoizedState,baseState:Me.baseState,baseQueue:Me.baseQueue,queue:Me.queue,next:null},at===null?ne.memoizedState=at=e:at=at.next=e}return at}function fu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function el(e){var t=Us;return Us+=1,rr===null&&(rr=[]),e=oy(rr,e,t),t=ne,(at===null?t.memoizedState:at.next)===null&&(t=t.alternate,ee.H=t===null||t.memoizedState===null?By:Ly),e}function bu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return el(e);if(e.$$typeof===wx)return;if(e.$$typeof===rn)return Tt(e)}throw Error(R(438,String(e)))}function Fm(e){var t=null,a=ne.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ne.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=fu(),ne.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=yx;return t.index++,a}function Rn(e,t){return typeof t=="function"?t(e):t}function wc(e){var t=We();return Pm(t,Me,e)}function Pm(e,t,a){var n=e.queue;if(n===null)throw Error(R(311));n.lastRenderedReducer=a;var o=e.baseQueue,s=n.pending;if(s!==null){if(o!==null){var c=o.next;o.next=s.next,s.next=c}t.baseQueue=o=s,n.pending=null}if(s=e.baseState,o===null)e.memoizedState=s;else{t=o.next;var u=c=null,h=null,g=t,$=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(pe&x)===x:(An&x)===x){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===Ji&&($=!0);else if((An&f)===f){g=g.next,f===Ji&&($=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=x,c=s):h=h.next=x,ne.lanes|=f,bi|=f;x=g.action,Pi&&a(s,x),s=g.hasEagerState?g.eagerState:a(s,x)}else f={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=f,c=s):h=h.next=f,ne.lanes|=x,bi|=x;g=g.next}while(g!==null&&g!==t);if(h===null?c=s:h.next=u,!pa(s,e.memoizedState)&&(it=!0,$&&(a=nr,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,n.lastRenderedState=s}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Wd(e){var t=We(),a=t.queue;if(a===null)throw Error(R(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,s=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do s=e(s,c.action),c=c.next;while(c!==o);pa(s,t.memoizedState)||(it=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,n]}function my(e,t,a){var n=ne,o=We(),s=le;if(s){if(a===void 0)throw Error(R(407));a=a()}else a=t();var c=!pa((Me||o).memoizedState,a);if(c&&(o.memoizedState=a,it=!0),o=o.queue,Wm(fy.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||c||at!==null&&(at.memoizedState.tag&1)!==0,mr(e?9:8,{destroy:void 0},gy.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Ve===null)throw Error(R(349));s||(An&127)!==0||py(n,t,a)}return a}function py(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ne.updateQueue,t===null?(t=fu(),ne.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function gy(e,t,a,n){t.value=a,t.getSnapshot=n,by(t)&&vy(e)}function fy(e,t,a){return a(function(){by(t)&&vy(e)})}function by(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!pa(e,a)}catch{return!0}}function vy(e){var t=io(e,2);t!==null&&Wt(t,e,2)}function Bh(e){var t=Gt();if(typeof e=="function"){var a=e;if(e=a(),Pi){Fn(!0);try{a()}finally{Fn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rn,lastRenderedState:e},t}function yy(e,t,a,n){return e.baseState=a,Pm(e,Me,typeof n=="function"?n:Rn)}function qN(e,t,a,n,o){if(yu(e))throw Error(R(485));if(e=t.action,e!==null){var s={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};ee.T!==null?a(!0):s.isTransition=!1,n(s),a=t.pending,a===null?(s.next=t.pending=s,wy(t,s)):(s.next=a.next,t.pending=a.next=s)}}function wy(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var s=ee.T,c={};c.types=s!==null?s.types:null,ee.T=c;try{var u=a(o,n),h=ee.S;h!==null&&h(c,u),sb(e,t,u)}catch(g){Lh(e,t,g)}finally{s!==null&&c.types!==null&&(s.types=c.types),ee.T=s}}else try{s=a(o,n),sb(e,t,s)}catch(g){Lh(e,t,g)}}function sb(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){lb(e,t,n)},function(n){return Lh(e,t,n)}):lb(e,t,a)}function lb(e,t,a){t.status="fulfilled",t.value=a,$y(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,wy(e,a)))}function Lh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,$y(t),t=t.next;while(t!==n)}e.action=null}function $y(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function xy(e,t){return t}function cb(e,t){if(le){var a=Ve.formState;if(a!==null){e:{var n=ne;if(le){if(qe){t:{for(var o=qe,s=Ca;o.nodeType!==8;){if(!s){o=null;break t}if(o=za(o.nextSibling),o===null){o=null;break t}}s=o.data,o=s==="F!"||s==="F"?o:null}if(o){qe=za(o.nextSibling),n=o.data==="F!";break e}}pi(n)}n=!1}n&&(t=a[0])}}return a=Gt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:xy,lastRenderedState:t},a.queue=n,a=Iy.bind(null,ne,n),n.dispatch=a,n=Bh(!1),s=np.bind(null,ne,!1,n.queue),n=Gt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=qN.bind(null,ne,o,s,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function ub(e){var t=We();return Ny(t,Me,e)}function Ny(e,t,a){if(t=Pm(e,t,xy)[0],e=wc(Rn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=el(t)}catch(c){throw c===Tr?gu:c}else n=t;t=We();var o=t.queue,s=o.dispatch;return a!==t.memoizedState&&(ne.flags|=2048,mr(9,{destroy:void 0},BN.bind(null,o,a),null)),[n,s,e]}function BN(e,t){e.action=t}function db(e){var t=We(),a=Me;if(a!==null)return Ny(t,a,e);We(),t=t.memoizedState,a=We();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function mr(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ne.updateQueue,t===null&&(t=fu(),ne.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function Sy(){return We().memoizedState}function $c(e,t,a,n){var o=Gt();ne.flags|=e,o.memoizedState=mr(1|t,{destroy:void 0},a,n===void 0?null:n)}function vu(e,t,a,n){var o=We();n=n===void 0?null:n;var s=o.memoizedState.inst;Me!==null&&n!==null&&Xm(n,Me.memoizedState.deps)?o.memoizedState=mr(t,s,a,n):(ne.flags|=e,o.memoizedState=mr(1|t,s,a,n))}function hb(e,t){$c(8390656,8,e,t)}function Wm(e,t){vu(2048,8,e,t)}function LN(e){ne.flags|=4;var t=ne.updateQueue;if(t===null)t=fu(),ne.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Ty(e){var t=We().memoizedState;return LN({ref:t,nextImpl:e}),function(){if((xe&2)!==0)throw Error(R(440));return t.impl.apply(void 0,arguments)}}function ky(e,t){return vu(4,2,e,t)}function Ey(e,t){return vu(4,4,e,t)}function Cy(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function zy(e,t,a){a=a!=null?a.concat([e]):null,vu(4,4,Cy.bind(null,t,e),a)}function ep(){}function Ay(e,t){var a=We();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Xm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Ry(e,t){var a=We();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Xm(t,n[1]))return n[0];if(n=e(),Pi){Fn(!0);try{e()}finally{Fn(!1)}}return a.memoizedState=[n,t],n}function tp(e,t,a){return a===void 0||(An&1073741824)!==0&&(pe&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Nw(),ne.lanes|=e,bi|=e,a)}function My(e,t,a,n){return pa(a,t)?a:gi.current!==null?(e=tp(e,a,n),pa(e,t)||(it=!0),e):(An&106)===0||(An&1073741824)!==0&&(pe&261930)===0?(it=!0,e.memoizedState=a):(e=Nw(),ne.lanes|=e,bi|=e,t)}function Oy(e,t,a,n,o){var s=Ne.p;Ne.p=s!==0&&8>s?s:8;var c=ee.T,u={};u.types=c!==null?c.types:null,ee.T=u,np(e,!1,t,a);try{var h=o(),g=ee.S;if(g!==null&&g(u,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=HN(h,n);Ts(e,t,$,ma(e))}else Ts(e,t,n,ma(e))}catch(x){Ts(e,t,{then:function(){},status:"rejected",reason:x},ma())}finally{Ne.p=s,c!==null&&u.types!==null&&(c.types=u.types),ee.T=c}}function jN(){}function jh(e,t,a,n){if(e.tag!==5)throw Error(R(476));var o=Vy(e).queue;Oy(e,o,t,Li,a===null?jN:function(){return Dy(e),a(n)})}function Vy(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Li,baseState:Li,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rn,lastRenderedState:Li},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Rn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Dy(e){var t=Vy(e);t.next===null&&(t=e.alternate.memoizedState),Ts(e,t.next.queue,{},ma())}function ap(){return Tt(wr)}function _y(){return We().memoizedState}function Hy(){return We().memoizedState}function GN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=ma();e=oi(a);var n=ri(t,e,a);n!==null&&(Wt(n,t,a),xs(n,t,a)),t={cache:qm()},e.payload=t;return}t=t.return}}function YN(e,t,a){var n=ma();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},yu(e)?Uy(t,a):(a=Hm(e,t,a,n),a!==null&&(Wt(a,e,n),qy(a,t,n)))}function Iy(e,t,a){var n=ma();Ts(e,t,a,n)}function Ts(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(yu(e))Uy(t,o);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,u=s(c,a);if(o.hasEagerState=!0,o.eagerState=u,pa(u,c))return mu(e,t,o,0),Ve===null&&hu(),!1}catch{}if(a=Hm(e,t,o,n),a!==null)return Wt(a,e,n),qy(a,t,n),!0}return!1}function np(e,t,a,n){if(n={lane:2,revertLane:pp(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},yu(e)){if(t)throw Error(R(479))}else t=Hm(e,a,n,2),t!==null&&Wt(t,e,2)}function yu(e){var t=e.alternate;return e===ne||t!==null&&t===ne}function Uy(e,t){or=Yc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function qy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Sv(e,a)}}var Qc={readContext:Tt,use:bu,useCallback:Fe,useContext:Fe,useEffect:Fe,useImperativeHandle:Fe,useLayoutEffect:Fe,useInsertionEffect:Fe,useMemo:Fe,useReducer:Fe,useRef:Fe,useState:Fe,useDebugValue:Fe,useDeferredValue:Fe,useTransition:Fe,useSyncExternalStore:Fe,useId:Fe,useHostTransitionStatus:Fe,useFormState:Fe,useActionState:Fe,useOptimistic:Fe,useMemoCache:Fe,useCacheRefresh:Fe,useEffectEvent:Fe},By={readContext:Tt,use:bu,useCallback:function(e,t){return Gt().memoizedState=[e,t===void 0?null:t],e},useContext:Tt,useEffect:hb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,$c(4194308,4,Cy.bind(null,t,e),a)},useLayoutEffect:function(e,t){return $c(4194308,4,e,t)},useInsertionEffect:function(e,t){$c(4,2,e,t)},useMemo:function(e,t){var a=Gt();t=t===void 0?null:t;var n=e();if(Pi){Fn(!0);try{e()}finally{Fn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Gt();if(a!==void 0){var o=a(t);if(Pi){Fn(!0);try{a(t)}finally{Fn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=YN.bind(null,ne,e),[n.memoizedState,e]},useRef:function(e){var t=Gt();return e={current:e},t.memoizedState=e},useState:function(e){e=Bh(e);var t=e.queue,a=Iy.bind(null,ne,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:ep,useDeferredValue:function(e,t){var a=Gt();return tp(a,e,t)},useTransition:function(){var e=Bh(!1);return e=Oy.bind(null,ne,e.queue,!0,!1),Gt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ne,o=Gt();if(le){if(a===void 0)throw Error(R(407));a=a()}else{if(a=t(),Ve===null)throw Error(R(349));(pe&127)!==0||py(n,t,a)}o.memoizedState=a;var s={value:a,getSnapshot:t};return o.queue=s,hb(fy.bind(null,n,s,e),[e]),n.flags|=2048,mr(9,{destroy:void 0},gy.bind(null,n,s,a,t),null),a},useId:function(){var e=Gt(),t=Ve.identifierPrefix;if(le){var a=cn,n=ln;a=(n&~(1<<32-ha(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Xc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=IN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:ap,useFormState:cb,useActionState:cb,useOptimistic:function(e){var t=Gt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=np.bind(null,ne,!0,a),a.dispatch=t,[e,t]},useMemoCache:Fm,useCacheRefresh:function(){return Gt().memoizedState=GN.bind(null,ne)},useEffectEvent:function(e){var t=Gt(),a={impl:e};return t.memoizedState=a,function(){if((xe&2)!==0)throw Error(R(440));return a.impl.apply(void 0,arguments)}}},Ly={readContext:Tt,use:bu,useCallback:Ay,useContext:Tt,useEffect:Wm,useImperativeHandle:zy,useInsertionEffect:ky,useLayoutEffect:Ey,useMemo:Ry,useReducer:wc,useRef:Sy,useState:function(){return wc(Rn)},useDebugValue:ep,useDeferredValue:function(e,t){var a=We();return My(a,Me.memoizedState,e,t)},useTransition:function(){var e=wc(Rn)[0],t=We().memoizedState;return[typeof e=="boolean"?e:el(e),t]},useSyncExternalStore:my,useId:_y,useHostTransitionStatus:ap,useFormState:ub,useActionState:ub,useOptimistic:function(e,t){var a=We();return yy(a,Me,e,t)},useMemoCache:Fm,useCacheRefresh:Hy,useEffectEvent:Ty},XN={readContext:Tt,use:bu,useCallback:Ay,useContext:Tt,useEffect:Wm,useImperativeHandle:zy,useInsertionEffect:ky,useLayoutEffect:Ey,useMemo:Ry,useReducer:Wd,useRef:Sy,useState:function(){return Wd(Rn)},useDebugValue:ep,useDeferredValue:function(e,t){var a=We();return Me===null?tp(a,e,t):My(a,Me.memoizedState,e,t)},useTransition:function(){var e=Wd(Rn)[0],t=We().memoizedState;return[typeof e=="boolean"?e:el(e),t]},useSyncExternalStore:my,useId:_y,useHostTransitionStatus:ap,useFormState:db,useActionState:db,useOptimistic:function(e,t){var a=We();return Me!==null?yy(a,Me,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Fm,useCacheRefresh:Hy,useEffectEvent:Ty};function eh(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:De({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Gh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=ma(),o=oi(n);o.payload=t,a!=null&&(o.callback=a),t=ri(e,o,n),t!==null&&(Wt(t,e,n),xs(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=ma(),o=oi(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=ri(e,o,n),t!==null&&(Wt(t,e,n),xs(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=ma(),n=oi(a);n.tag=2,t!=null&&(n.callback=t),t=ri(e,n,a),t!==null&&(Wt(t,e,a),xs(t,e,a))}};function mb(e,t,a,n,o,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,s,c):t.prototype&&t.prototype.isPureReactComponent?!Vs(a,n)||!Vs(o,s):!0}function pb(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Gh.enqueueReplaceState(t,t.state,null)}function Wi(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=De({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function jy(e){Hc(e)}function Gy(e){console.error(e)}function Yy(e){Hc(e)}function Zc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function gb(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Yh(e,t,a){return a=oi(a),a.tag=3,a.payload={element:null},a.callback=function(){Zc(e,t)},a}function Xy(e){return e=oi(e),e.tag=3,e}function Qy(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var s=n.value;e.payload=function(){return o(s)},e.callback=function(){gb(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){gb(t,a,n),typeof o!="function"&&(ci===null?ci=new Set([this]):ci.add(this));var u=n.stack;this.componentDidCatch(n.value,{componentStack:u!==null?u:""})})}function QN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Zi(t,a,o,!0),a=zt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Vt===null?au():a.alternate===null&&Pe===0&&(Pe=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===Lc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),sh(e,n,o)),!1;case 22:return a.flags|=65536,n===Lc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),sh(e,n,o)),!1}throw Error(R(435,a.tag))}return sh(e,n,o),au(),!1}if(le)return t=zt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Oh&&(e=Error(R(422),{cause:n}),_s(Ea(e,a)))):(n!==Oh&&(t=Error(R(423),{cause:n}),_s(Ea(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Ea(n,a),o=Yh(e.stateNode,n,o),Pd(e,o),Pe!==4&&(Pe=2)),!1;var s=Error(R(520),{cause:n});if(s=Ea(s,a),zs===null?zs=[s]:zs.push(s),Pe!==4&&(Pe=2),t===null)return!0;n=Ea(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Yh(a.stateNode,n,e),Pd(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(ci===null||!ci.has(s))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Xy(o),Qy(o,e,a,n),Pd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var ip=Error(R(461)),it=!1;function ut(e,t,a,n){t.child=e===null?sy(t,null,a,n):Fi(t,e.child,a,n)}function fb(e,t,a,n,o){a=a.render;var s=t.ref;if("ref"in n){var c={};for(var u in n)u!=="ref"&&(c[u]=n[u])}else c=n;return Ki(t),n=Qm(e,t,a,c,s,o),u=Zm(),e!==null&&!it?(Km(e,t,o),Mn(e,t,o)):(le&&u&&pu(t),t.flags|=1,ut(e,t,n,o),t.child)}function bb(e,t,a,n,o){if(e===null){var s=a.type;return typeof s=="function"&&!Im(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,Zy(e,t,s,n,o)):(e=bc(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!rp(e,o)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:Vs,a(c,n)&&e.ref===t.ref)return Mn(e,t,o)}return t.flags|=1,e=kn(s,n),e.ref=t.ref,e.return=t,t.child=e}function Zy(e,t,a,n,o){if(e!==null){var s=e.memoizedProps;if(Vs(s,n)&&e.ref===t.ref)if(it=!1,t.pendingProps=n=s,rp(e,o))(e.flags&131072)!==0&&(it=!0);else return t.lanes=e.lanes,Mn(e,t,o)}return Xh(e,t,a,n,o)}function Ky(e,t,a,n){var o=n.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~s}else n=0,t.child=null;return vb(e,t,s,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&yc(t,s!==null?s.cachePool:null),s!==null?rb(t,s):Uh(),uy(t);else return n=t.lanes=536870912,vb(e,t,s!==null?s.baseLanes|a:a,a,n)}else s!==null?(yc(t,s.cachePool),rb(t,s),li(),t.memoizedState=null):(e!==null&&yc(t,null),Uh(),li());return ut(e,t,o,a),t.child}function ks(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function vb(e,t,a,n,o){var s=Bm();return s=s===null?null:{parent:nt._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&yc(t,null),Uh(),uy(t),e!==null&&Zi(e,t,n,!0),t.childLanes=o,null}function xc(e,t){return t=wu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function yb(e,t,a){return Fi(t,e.child,null,a),e=xc(t,t.pendingProps),e.flags|=2,sa(t),t.memoizedState=null,e}function ZN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(le){if(n.mode==="hidden")return e=xc(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},ks(null,e);if(qh(t),(e=qe)?(e=Kw(e,Ca),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:mi!==null?{id:ln,overflow:cn}:null,retryLane:536870912,hydrationErrors:null},a=ey(e),a.return=t,t.child=a,wt=t,qe=null)):e=null,e===null)throw pi(t);return t.lanes=536870912,null}return xc(t,n)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(qh(t),o)if(t.flags&256)t.flags&=-257,t=yb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(R(558));else if(it||Zi(e,t,a,!1),o=(a&e.childLanes)!==0,it||o){if(gi.current===null){if(n=Ve,n!==null&&(c=Tv(n,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,io(e,c),Wt(n,e,c),ip;au()}t=yb(e,t,a)}else e=s.treeContext,qe=za(c.nextSibling),wt=t,le=!0,ii=null,Ca=!1,e!==null&&ay(t,e),t=xc(t,n),t.flags|=134221824;return t}return e=kn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Uo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(R(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Xh(e,t,a,n,o){return Ki(t),a=Qm(e,t,a,n,void 0,o),n=Zm(),e!==null&&!it?(Km(e,t,o),Mn(e,t,o)):(le&&n&&pu(t),t.flags|=1,ut(e,t,a,o),t.child)}function wb(e,t,a,n,o,s){return Ki(t),t.updateQueue=null,a=hy(t,n,a,o),dy(e),n=Zm(),e!==null&&!it?(Km(e,t,s),Mn(e,t,s)):(le&&n&&pu(t),t.flags|=1,ut(e,t,a,s),t.child)}function $b(e,t,a,n,o){if(Ki(t),t.stateNode===null){var s=Jo,c=a.contextType;typeof c=="object"&&c!==null&&(s=Tt(c)),s=new a(n,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Gh,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=n,s.state=t.memoizedState,s.refs={},jm(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?Tt(c):Jo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(eh(t,a,c,n),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Gh.enqueueReplaceState(s,s.state,null),Ss(t,n,s,o),Ns(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){s=t.stateNode;var u=t.memoizedProps,h=Wi(a,u);s.props=h;var g=s.context,$=a.contextType;c=Jo,typeof $=="object"&&$!==null&&(c=Tt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=t.pendingProps!==u,$||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||g!==c)&&pb(t,s,n,c),Kn=!1;var f=t.memoizedState;s.state=f,Ss(t,n,s,o),Ns(),g=t.memoizedState,u||f!==g||Kn?(typeof x=="function"&&(eh(t,a,x,n),g=t.memoizedState),(h=Kn||mb(t,a,h,n,f,g,c))?($||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),s.props=n,s.state=g,s.context=c,n=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{s=t.stateNode,Hh(e,t),c=t.memoizedProps,$=Wi(a,c),s.props=$,x=t.pendingProps,f=s.context,g=a.contextType,h=Jo,typeof g=="object"&&g!==null&&(h=Tt(g)),u=a.getDerivedStateFromProps,(g=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==x||f!==h)&&pb(t,s,n,h),Kn=!1,f=t.memoizedState,s.state=f,Ss(t,n,s,o),Ns();var b=t.memoizedState;c!==x||f!==b||Kn||e!==null&&e.dependencies!==null&&Bc(e.dependencies)?(typeof u=="function"&&(eh(t,a,u,n),b=t.memoizedState),($=Kn||mb(t,a,$,n,f,b,h)||e!==null&&e.dependencies!==null&&Bc(e.dependencies))?(g||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(n,b,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(n,b,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=b),s.props=n,s.state=b,s.context=h,n=$):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return s=n,Uo(e,t),n=(t.flags&128)!==0,s||n?(s=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&n?(t.child=Fi(t,e.child,null,o),t.child=Fi(t,null,a,o)):ut(e,t,a,o),t.memoizedState=s.state,e=t.child):e=Mn(e,t,o),e}function xb(e,t,a,n){return Qi(),t.flags|=256,ut(e,t,a,n),t.child}var Qh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Zh(e){return{baseLanes:e,cachePool:iy()}}function Kh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ca),e}function Jy(e,t,a){var n=t.pendingProps,o=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(Et.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(le){if(o?si(t):li(),(e=qe)?(e=Kw(e,Ca),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:mi!==null?{id:ln,overflow:cn}:null,retryLane:536870912,hydrationErrors:null},a=ey(e),a.return=t,t.child=a,wt=t,qe=null)):e=null,e===null)throw pi(t);return vp(e)?t.lanes=32:t.lanes=536870912,null}return s=n.children,n=n.fallback,o?(li(),o=t.mode,s=wu({mode:"hidden",children:s},o),n=ji(n,o,a,null),s.return=t,n.return=t,s.sibling=n,t.child=s,n=t.child,n.memoizedState=Zh(a),n.childLanes=Kh(e,c,a),t.memoizedState=Qh,ks(null,n)):(si(t),op(t,s))}var u=e.memoizedState;if(u!==null){var h=u.dehydrated;if(h!==null)return KN(e,t,s,c,n,h,u,a)}return o?(li(),o=n.fallback,s=t.mode,u=e.child,h=u.sibling,n=kn(u,{mode:"hidden",children:n.children}),n.subtreeFlags=u.subtreeFlags&1206910976,h!==null?o=kn(h,o):(o=ji(o,s,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,ks(null,n),n=t.child,o=e.child.memoizedState,o===null?o=Zh(a):(s=o.cachePool,s!==null?(u=nt._currentValue,s=s.parent!==u?{parent:u,pool:u}:s):s=iy(),o={baseLanes:o.baseLanes|a,cachePool:s}),n.memoizedState=o,n.childLanes=Kh(e,c,a),t.memoizedState=Qh,ks(e.child,n)):(si(t),a=e.child,e=a.sibling,a=kn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function op(e,t){return t=wu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function wu(e,t){return e=Pt(22,e,null,t),e.lanes=0,e}function nc(e,t,a){return Fi(t,e.child,null,a),e=op(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function KN(e,t,a,n,o,s,c,u){if(a)return t.flags&256?(si(t),t.flags&=-257,nc(e,t,u)):t.memoizedState!==null?(li(),t.child=e.child,t.flags|=128,null):(li(),s=o.fallback,c=t.mode,o=wu({mode:"visible",children:o.children},c),s=ji(s,c,u,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,Fi(t,e.child,null,u),o=t.child,o.memoizedState=Zh(u),o.childLanes=Kh(e,n,u),t.memoizedState=Qh,ks(null,o));if(si(t),vp(s)){if(n=s.nextSibling&&s.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(R(419)),o.stack="",o.digest=n,_s({value:o,source:null,stack:null})),nc(e,t,u)}if(it||Zi(e,t,u,!1),n=(u&e.childLanes)!==0,it||n){if(gi.current!==null)return nc(e,t,u);if(n=Ve,n!==null&&(o=Tv(n,u),o!==0&&o!==c.retryLane))throw c.retryLane=o,io(e,o),Wt(n,e,o),ip;return wm(s)||au(),nc(e,t,u)}return wm(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,qe=za(s.nextSibling),wt=t,le=!0,ii=null,Ca=!1,e!==null&&ay(t,e),t=op(t,o.children),t.flags|=134221824,t)}function Nb(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),vc(e.return,t,a)}function Sb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Gc(a)===null&&(t=e),e=e.sibling}return t}function ic(e,t,a,n,o,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=o,c.treeForkCount=s)}function th(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Jh(e,t,a){var n=t.pendingProps,o=n.revealOrder,s=n.tail;n=n.children;var c=Et.current;if(t.flags&128)return Is(t,c),null;var u=(c&2)!==0;if(u?(c=c&1|2,t.flags|=128):c&=1,Is(t,c),o==="backwards"&&e!==null?(th(e),ut(e,t,n,a),th(e)):ut(e,t,n,a),n=le?Ds:0,!u&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Nb(e,a,t);else if(e.tag===19)Nb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=Sb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,th(t)),ic(t,!0,o,null,s,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Gc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ic(t,!0,a,null,s,n);break;case"together":ic(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=Sb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ic(t,!1,o,a,s,n)}return t.child}function Tb(e,t,a){var n=t.pendingProps;return Wn(t,t.type,n.value),ut(e,t,n.children,a),t.child}function Mn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),bi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Zi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(R(153));if(t.child!==null){for(e=t.child,a=kn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=kn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function rp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Bc(e)))}function JN(e,t,a){switch(t.tag){case 3:Oc(t,t.stateNode.containerInfo),Wn(t,nt,e.memoizedState.cache),Qi();break;case 27:case 5:Nh(t);break;case 4:Oc(t,t.stateNode.containerInfo);break;case 10:Wn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,qh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return si(t),t.flags|=128,null;n=Zi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Jy(e,t,a):(si(t),e=Mn(e,t,a),e!==null?e.sibling:null)}si(t);break;case 19:if(t.flags&128)return Jh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Zi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Jh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Is(t,Et.current),n)break;return null;case 22:return t.lanes=0,Ky(e,t,a,t.pendingProps);case 24:Wn(t,nt,e.memoizedState.cache)}return Mn(e,t,a)}function Fy(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)it=!0;else{if(!rp(e,a)&&(t.flags&128)===0)return it=!1,JN(e,t,a);it=(e.flags&131072)!==0}else it=!1,le&&(t.flags&1048576)!==0&&ty(t,Ds,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Ii(t.elementType),t.type=e,typeof e=="function")Im(e)?(n=Wi(e,n),t.tag=1,t=$b(null,t,e,n,a)):(t.tag=0,t=Xh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===Tm){t.tag=11,t=fb(null,t,e,n,a);break e}else if(o===km){t.tag=14,t=bb(null,t,e,n,a);break e}else if(o===rn){t.tag=10,t.type=e,t=Tb(null,t,a);break e}}throw t=$h(e)||e,Error(R(306,t,""))}}return t;case 0:return Xh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Wi(n,t.pendingProps),$b(e,t,n,o,a);case 3:e:{if(Oc(t,t.stateNode.containerInfo),e===null)throw Error(R(387));n=t.pendingProps;var s=t.memoizedState;o=s.element,Hh(e,t),Ss(t,n,null,a);var c=t.memoizedState;if(n=c.cache,Wn(t,nt,n),n!==s.cache&&Dh(t,[nt],a,!0),Ns(),n=c.element,s.isDehydrated)if(s={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=xb(e,t,n,a);break e}else if(n!==o){o=Ea(Error(R(424)),t),_s(o),t=xb(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,qe=za(e.firstChild),wt=t,le=!0,ii=null,Ca=!0,a=sy(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Qi(),n===o){t=Mn(e,t,a);break e}ut(e,t,n,a)}t=t.child}return t;case 26:return Uo(e,t),e===null?(a=Pb(t.type,null,t.pendingProps,null))?t.memoizedState=a:le||(t.stateNode=qw(t.type,t.pendingProps,ni.current,t)):t.memoizedState=Pb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Nh(t),e===null&&le&&(n=t.stateNode=Jw(t.type,t.pendingProps,ni.current),wt=t,Ca=!0,o=qe,yi(t.type)?($m=o,qe=za(n.firstChild)):qe=o),ut(e,t,t.pendingProps.children,a),Uo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&le&&((o=n=qe)&&(n=L5(n,t.type,t.pendingProps,Ca),n!==null?(t.stateNode=n,wt=t,qe=za(n.firstChild),Ca=!1,o=!0):o=!1),o||pi(t)),Nh(t),o=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,n=s.children,bm(o,s)?n=null:c!==null&&bm(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Qm(e,t,UN,null,null,a),wr._currentValue=o),Uo(e,t),ut(e,t,n,a),t.child;case 6:return e===null&&le&&((e=a=qe)&&(a=j5(a,t.pendingProps,Ca),a!==null?(t.stateNode=a,wt=t,qe=null,e=!0):e=!1),e||pi(t)),null;case 13:return Jy(e,t,a);case 4:return Oc(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Fi(t,null,n,a):ut(e,t,n,a),t.child;case 11:return fb(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Uo(e,t),ut(e,t,n,a),t.child;case 8:return ut(e,t,t.pendingProps.children,a),t.child;case 12:return ut(e,t,t.pendingProps.children,a),t.child;case 10:return Tb(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Ki(t),o=Tt(o),n=n(o),t.flags|=1,ut(e,t,n,a),t.child;case 14:return bb(e,t,t.type,t.pendingProps,a);case 15:return Zy(e,t,t.type,t.pendingProps,a);case 19:return Jh(e,t,a);case 31:return ZN(e,t,a);case 22:return Ky(e,t,a,t.pendingProps);case 24:return Ki(t),n=Tt(nt),e===null?(o=Bm(),o===null&&(o=Ve,s=qm(),o.pooledCache=s,s.refCount++,s!==null&&(o.pooledCacheLanes|=a),o=s),t.memoizedState={parent:n,cache:o},jm(t),Wn(t,nt,o)):((e.lanes&a)!==0&&(Hh(e,t),Ss(t,null,null,a),Ns()),o=e.memoizedState,s=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Wn(t,nt,n)):(n=s.cache,Wn(t,nt,n),n!==o.cache&&Dh(t,[nt],a,!0))),ut(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:le&&pu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Uo(e,t),ut(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(R(156,t.tag))}function Nn(e){e.flags|=4}function ah(e,t,a,n,o){var s;if((s=(e.mode&32)!==0)&&(s=a===null?tv(t,n):tv(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(kw())e.flags|=8192;else throw Yi=Lc,Lm}else e.flags&=-16777217}function kb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!e0(t))if(kw())e.flags|=8192;else throw Yi=Lc,Lm}function oc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?xv():536870912,e.lanes|=t,pr|=t)}function cs(e,t){if(!le)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Ue(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function FN(e,t,a){var n=t.pendingProps;switch(Um(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ue(t),null;case 1:return Ue(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),En(nt),ur(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Ho(t)?Nn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Fd())),Ue(t),null;case 26:var o=t.type,s=t.memoizedState;return e===null?(Nn(t),s!==null?(Ue(t),kb(t,s)):(Ue(t),ah(t,o,null,n,a))):s?s!==e.memoizedState?(Nn(t),Ue(t),kb(t,s)):(Ue(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&Nn(t),Ue(t),ah(t,o,e,n,a)),null;case 27:if(Vc(t),a=ni.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(!n){if(t.stateNode===null)throw Error(R(166));return Ue(t),t.subtreeFlags&=-33554433,null}e=un.current,Ho(t)?Wf(t,e):(e=Jw(o,n,a),t.stateNode=e,Nn(t))}return Ue(t),t.subtreeFlags&=-33554433,null;case 5:if(Vc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(!n){if(t.stateNode===null)throw Error(R(166));return Ue(t),t.subtreeFlags&=-33554433,null}if(s=un.current,Ho(t))Wf(t,s);else{var c=Ls(ni.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?s.multiple=!0:n.size&&(s.size=n.size);break;default:s=typeof n.is=="string"?c.createElement(o,{is:n.is}):c.createElement(o)}}s[St]=t,s[ta]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Ct(s,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&Nn(t)}}return Ue(t),t.subtreeFlags&=-33554433,ah(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(R(166));if(e=ni.current,Ho(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=wt,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[St]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Iw(e.nodeValue,a)),e||pi(t,!0)}else e=Ls(e).createTextNode(n),e[St]=t,t.stateNode=e}return Ue(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Ho(t),a!==null){if(e===null){if(!n)throw Error(R(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(557));e[St]=t}else Qi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ue(t),e=!1}else a=Fd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(sa(t),t):(sa(t),null);if((t.flags&128)!==0)throw Error(R(558))}return Ue(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Ho(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(R(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(R(317));o[St]=t}else Qi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Ue(t),o=!1}else o=Fd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(sa(t),t):(sa(t),null)}return sa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),oc(t,t.updateQueue),Ue(t),null);case 4:return ur(),e===null&&gp(t.stateNode.containerInfo),t.flags|=67108864,Ue(t),null;case 10:return En(t.type),Ue(t),null;case 19:if(Ym(t),n=t.memoizedState,n===null)return Ue(t),null;if(o=(t.flags&128)!==0,s=n.rendering,s===null)if(o)cs(n,!1);else{if(Pe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Gc(e),s!==null){for(t.flags|=128,cs(n,!1),e=s.updateQueue,t.updateQueue=e,oc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Wv(a,e),a=a.sibling;return Is(t,Et.current&1|2),le&&Sn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&ua()>eu&&(t.flags|=128,o=!0,cs(n,!1),t.lanes=4194304)}else{if(!o)if(e=Gc(s),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,oc(t,e),cs(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!s.alternate&&!le)return Ue(t),null}else 2*ua()-n.renderingStartTime>eu&&a!==536870912&&(t.flags|=128,o=!0,cs(n,!1),t.lanes=4194304);n.isBackwards?(s.sibling=t.child,t.child=s):(e=n.last,e!==null?e.sibling=s:t.child=s,n.last=s)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=ua(),e.sibling=null,s=Et.current,s=o?s&1|2:s&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||le?Is(t,s):(a=s,Be(zt,t),Be(Et,a),Vt===null&&(Vt=t)),le&&Sn(t,n.treeForkCount),e}return Ue(t),null;case 22:case 23:return sa(t),Gm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(Ue(t),t.subtreeFlags&6&&(t.flags|=8192)):Ue(t),a=t.updateQueue,a!==null&&oc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&kt(Gi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),En(nt),Ue(t),null;case 25:return null;case 30:return t.flags|=33554432,Ue(t),null}throw Error(R(156,t.tag))}function PN(e,t){switch(Um(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return En(nt),ur(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Vc(t),null;case 31:if(t.memoizedState!==null){if(sa(t),t.alternate===null)throw Error(R(340));Qi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(sa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(R(340));Qi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ym(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return ur(),null;case 10:return En(t.type),null;case 22:case 23:return sa(t),Gm(),e!==null&&kt(Gi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return En(nt),null;case 25:return null;default:return null}}function Py(e,t){switch(Um(t),t.tag){case 3:En(nt),ur();break;case 26:case 27:case 5:Vc(t);break;case 4:ur();break;case 31:t.memoizedState!==null&&sa(t);break;case 13:sa(t);break;case 19:Ym(t);break;case 10:En(t.type);break;case 22:case 23:sa(t),Gm(),e!==null&&kt(Gi);break;case 24:En(nt)}}function tl(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var s=a.create,c=a.inst;n=s(),c.destroy=n}a=a.next}while(a!==o)}}catch(u){ze(t,t.return,u)}}function fi(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var s=o.next;n=s;do{if((n.tag&e)===e){var c=n.inst,u=c.destroy;if(u!==void 0){c.destroy=void 0,o=t;var h=a,g=u;try{g()}catch($){ze(o,h,$)}}}n=n.next}while(n!==s)}}catch($){ze(t,t.return,$)}}function Wy(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{cy(t,a)}catch(n){ze(e,e.return,n)}}}function ew(e,t,a){a.props=Wi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){ze(e,t,n)}}function nn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,s=zn(e.memoizedProps,o);(o.ref===null||o.ref.name!==s)&&(o.ref=Gw(s)),n=o.ref;break;case 7:if(e.stateNode===null){var c=new ga(e);ea(e.child,!1,q5,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(u){ze(e,t,u)}}function Nt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){ze(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){ze(e,t,o)}else a.current=null}function Kc(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)Zw(e.stateNode,t[a])}function Eb(e){for(var t=e.return;t!==null&&(lp(t)&&Zw(e.stateNode,t.stateNode),!sp(t));)t=t.return}function Es(e){for(var t=e.return;t!==null&&(lp(t)&&B5(e.stateNode,t.stateNode),!sp(t));)t=t.return}function sp(e){return e.tag===5||e.tag===3||e.tag===27}function lp(e){return e&&e.tag===7&&e.stateNode!==null}function Fh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){ze(e,e.return,o)}}function nh(e,t,a){try{var n=e.stateNode;x5(n,e.type,a,t),n[ta]=t}catch(o){ze(e,e.return,o)}}function tw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&yi(e.type)||e.tag===4}function ih(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||tw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&yi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ph(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=sn)),Kc(e,n),we=!0;else if(o!==4&&(o===27&&(Kc(e,n),n=null,yi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Ph(e,t,a,n),e=e.sibling;e!==null;)Ph(e,t,a,n),e=e.sibling}function Jc(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Kc(e,n),we=!0;else if(o!==4&&(o===27&&(Kc(e,n),n=null,yi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Jc(e,t,a,n),e=e.sibling;e!==null;)Jc(e,t,a,n),e=e.sibling}function aw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);Ct(t,n,a),t[St]=e,t[ta]=a}catch(s){ze(e,e.return,s)}}var Fc=!1,la=null;function Cb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Fc=!0)}var on=null;function zb(){var e=on;return on=null,e}var Ft=0;function kr(e,t,a,n,o){return Ft=0,nw(e.child,t,a,n,o)}function nw(e,t,a,n,o){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var u=vm(c);n.push(u),u.view&&(s=!0)}else s||vm(c).view&&(s=!0);Fc=!0,Bw(c,Ft===0?t:t+"_"+Ft,a),Ft++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||nw(e.child,t,a,n,o)&&(s=!0));e=e.sibling}return s}function hn(e,t){for(;e!==null;)e.tag===5?Lw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||hn(e.child,t)),e=e.sibling}function Nc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Nc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(R(544));var a=t.name;t=Dn(t.default,t.share),t!=="none"&&(kr(e,a,t,null,!1)||hn(e.child,!1))}e=e.sibling}}function Wh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=zn(n,a),s=Dn(n.default,a.paired?n.share:n.enter);s!=="none"?kr(e,o,s,null,!1)?(Nc(e),a.paired||t||gr(e,n.onEnter)):hn(e.child,!1):Nc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Wh(e,t),e=e.sibling;else Nc(e)}function em(e){if(la!==null&&la.size!==0){var t=la;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var s=Dn(a.default,a.share);if(s!=="none"&&(kr(e,n,s,null,!1)?(s=e.stateNode,o.paired=s,s.paired=o,gr(e,a.onShare)):hn(e.child,!1)),t.delete(n),t.size===0)break}}}em(e)}e=e.sibling}}}function tm(e){if(e.tag===30){var t=e.memoizedProps,a=zn(t,e.stateNode),n=la!==null?la.get(a):void 0,o=Dn(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(kr(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,la.delete(a),gr(e,t.onShare)):gr(e,t.onExit):hn(e.child,!1)),la!==null&&em(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)tm(e),e=e.sibling;else la!==null&&em(e)}function iw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=zn(t,e.stateNode);t=Dn(t.default,t.update),e.flags&=-5,t!=="none"&&kr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&iw(e);e=e.sibling}}function am(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,hn(e.child,!1))}am(e)}e=e.sibling}}function Sc(e){if(e.tag===30)e.stateNode.paired=null,hn(e.child,!1),am(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Sc(e),e=e.sibling;else am(e)}function ow(e){for(e=e.child;e!==null;)e.tag===30?hn(e.child,!1):(e.subtreeFlags&33554432)!==0&&ow(e),e=e.sibling}function cp(e,t,a,n,o,s,c){for(var u=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Ft<s.length){var g=s[Ft],$=vm(h);(g.view||$.view)&&(u=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=g.rect;var f=$.rect;x=x.y!==f.y||x.x!==f.x||x.height!==f.height||x.width!==f.width}x&&(e.flags|=4),$.abs?$=!g.abs:(g=g.rect,$=$.rect,$=g.height!==$.height||g.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Bw(h,Ft===0?a:a+"_"+Ft,o),u&&(e.flags&4)!==0||(on===null&&(on=[]),on.push(h,Ft===0?n:n+"_"+Ft,t.memoizedProps)),Ft++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:cp(e,t.child,a,n,o,s,c)&&(u=!0));t=t.sibling}return u}function rw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=zn(a,n),s=Dn(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(C5)}else c=e.memoizedState,e.memoizedState=null;n=e;var u=e.child;Ft=0,o=cp(n,u,o,o,s,c,!1),(e.flags&4)!==0&&o&&(t||gr(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&rw(e,t);e=e.sibling}}var bt=!1,ke=!1,en=!1,oh=!1,Ab=typeof WeakSet=="function"?WeakSet:Set,vt=null,tn=!1,bs=!1,Pc=!1,nm=!1;function WN(e,t,a){if(e=e.containerInfo,gm=$r,e=Yv(e),Dm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var s=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var u=0,h=-1,g=-1,$=0,x=0,f=e,b=null;t:for(;;){for(var C;f!==n||s!==0&&f.nodeType!==3||(h=u+s),f!==c||o!==0&&f.nodeType!==3||(g=u+o),f.nodeType===3&&(u+=f.nodeValue.length),(C=f.firstChild)!==null;)b=f,f=C;for(;;){if(f===e)break t;if(b===n&&++$===s&&(h=u),b===c&&++x===o&&(g=u),(C=f.nextSibling)!==null)break;f=b,b=f.parentNode}f=C}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(fm={focusedElem:e,selectionRange:n},$r=!1,a=(a&335544064)===a,vt=t,t=a?9270:1024;vt!==null;){if(e=vt,a&&(n=e.deletions,n!==null))for(s=0;s<n.length;s++)a&&tm(n[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Cb(e),rc(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&tm(n),rc(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Cb(e),rc(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,vt=n):(a&&iw(e),rc(a))}}la=null}function rc(e){for(;vt!==null;){var t=vt,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var s=t.stateNode;try{var c=Wi(t.type,o);a=s.getSnapshotBeforeUpdate(c,n),s.__reactInternalSnapshotBeforeUpdate=a}catch(u){ze(t,t.return,u)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)ym(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":ym(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=zn(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=Dn(o.default,o.update),o!=="none"&&kr(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(R(163))}if(n=t.sibling,n!==null){n.return=t.return,vt=n;break}vt=t.return}}function sw(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:an(e,a),n&4&&tl(5,a);break;case 1:if(an(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){ze(a,a.return,c)}else{var o=Wi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){ze(a,a.return,c)}}n&64&&Wy(a),n&512&&nn(a,a.return);break;case 3:if(an(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{cy(e,t)}catch(c){ze(a,a.return,c)}}break;case 27:t===null&&n&4&&aw(a);case 26:case 5:an(e,a),t===null&&n&4&&Fh(a),n&512&&nn(a,a.return);break;case 12:an(e,a);break;case 31:an(e,a),n&4&&dw(e,a);break;case 13:an(e,a),n&4&&hw(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=d5.bind(null,a),G5(e,a))));break;case 22:if(n=a.memoizedState!==null||bt,!n){var s=t!==null&&t.memoizedState!==null||ke;t=bt,o=ke,bt=n,(ke=s)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),La(e,a,n)):an(e,a),bt=t,ke=o}break;case 30:an(e,a),n&512&&nn(a,a.return);break;case 7:n&512&&nn(a,a.return);default:an(e,a)}}function im(e,t){for(e=e.child;e!==null;)lw(e,t),e=e.sibling}function lw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){ze(e,e.return,h)}om(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,we=!0}catch(h){ze(e,e.return,h)}break;case 18:try{var u=e.stateNode;t?Xb(u,!0):Xb(e.stateNode,!1)}catch(h){ze(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&im(e,t);break;default:im(e,t)}}function om(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:lw(a,n);break e;case 22:a.memoizedState===null&&om(a,n);break e;default:om(a,n)}}e=e.sibling}}function cw(e){var t=e.alternate;t!==null&&(e.alternate=null,cw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&lu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ye=null,Kt=!1;function Ba(e,t,a){for(a=a.child;a!==null;)uw(e,t,a),a=a.sibling}function uw(e,t,a){if(da&&typeof da.onCommitFiberUnmount=="function")try{da.onCommitFiberUnmount(Zs,a)}catch{}switch(a.tag){case 26:ke||Nt(a,t),Ba(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!ke&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:ke||Nt(a,t),Es(a);var n=Ye,o=Kt;yi(a.type)&&(Ye=a.stateNode,Kt=!1),Ba(e,t,a),Fw(a.stateNode,a.type,a.memoizedProps),Ye=n,Kt=o;break;case 5:ke||Nt(a,t),Es(a);case 6:if(a.tag===6&&Es(a),n=Ye,o=Kt,Ye=null,Ba(e,t,a),Ye=n,Kt=o,Ye!==null)if(Kt)try{(Ye.nodeType===9?Ye.body:Ye.nodeName==="HTML"?Ye.ownerDocument.body:Ye).removeChild(a.stateNode),we=!0}catch(s){ze(a,t,s)}else try{Ye.removeChild(a.stateNode),we=!0}catch(s){ze(a,t,s)}break;case 18:Ye!==null&&(Kt?(e=Ye,Yb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),xr(e)):Yb(Ye,a.stateNode));break;case 4:n=Ye,o=Kt,Ye=a.stateNode.containerInfo,Kt=!0,Ba(e,t,a),Ye=n,Kt=o;break;case 0:case 11:case 14:case 15:fi(2,a,t),ke||fi(4,a,t),Ba(e,t,a);break;case 1:ke||(Nt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&ew(a,t,n)),Ba(e,t,a);break;case 21:Ba(e,t,a);break;case 22:ke=(n=ke)||a.memoizedState!==null,Ba(e,t,a),ke=n;break;case 30:Nt(a,t),Ba(e,t,a);break;case 7:ke||Nt(a,t),Ba(e,t,a);break;default:Ba(e,t,a)}}function dw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{xr(e)}catch(a){ze(t,t.return,a)}}}function hw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{xr(e)}catch(a){ze(t,t.return,a)}}function e5(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Ab),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Ab),t;default:throw Error(R(435,e.tag))}}function sc(e,t){var a=e5(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=h5.bind(null,e,n);n.then(o,o)}})}function Lt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var s=n[o],c=e,u=t,h=u;e:for(;h!==null;){switch(h.tag){case 27:if(yi(h.type)){Ye=h.stateNode,Kt=!1;break e}break;case 5:Ye=h.stateNode,Kt=!1;break e;case 3:case 4:Ye=h.stateNode.containerInfo,Kt=!0;break e}h=h.return}if(Ye===null)throw Error(R(160));uw(c,u,s),Ye=null,Kt=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)mw(t,e,a),t=t.sibling}var ja=null;function mw(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var s=0;s<n.length;s++){var c=n[s];c.ref.impl=c.nextImpl}Lt(t,e,a),jt(e),o&4&&(fi(3,e,e.return),tl(3,e),fi(5,e,e.return));break;case 1:Lt(t,e,a),jt(e),o&512&&(ke||n===null||Nt(n,n.return)),o&64&&bt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=ja,Lt(t,e,a),jt(e),o&512&&(ke||n===null||Nt(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(bt)e.stateNode=qw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=s.ownerDocument||s;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Fs]||n[St]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),Ct(n,t,a),n[St]=e,yt(n),t=n;break e;case"link":if(s=ev("link","href",o).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}n=o.createElement(t),Ct(n,t,a),o.head.appendChild(n);break;case"meta":if(s=ev("meta","content",o).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}n=o.createElement(t),Ct(n,t,a),o.head.appendChild(n);break;default:throw Error(R(468,t))}n[St]=e,yt(n),t=n}e.stateNode=t}else bt||xm(s,e.type,e.stateNode);else e.stateNode=Wb(s,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||ke||t.parentNode.removeChild(t)):o.count--,a===null?bt||xm(s,e.type,e.stateNode):Wb(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&nh(e,e.memoizedProps,n.memoizedProps);break;case 27:Lt(t,e,a),jt(e),o&512&&(ke||n===null||Nt(n,n.return)),n!==null&&o&4&&nh(e,e.memoizedProps,n.memoizedProps);break;case 5:if(s=en,en=!1,Lt(t,e,a),en=s,jt(e),o&512&&(ke||n===null||Nt(n,n.return)),e.flags&32){t=e.stateNode;try{hr(t,""),we=!0}catch($){ze(e,e.return,$)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,nh(e,t,n!==null?n.memoizedProps:t)),o&1024&&(oh=!0);break;case 6:if(Lt(t,e,a),jt(e),o&4){if(e.stateNode===null)throw Error(R(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,we=!0}catch($){ze(e,e.return,$)}}break;case 3:if(we=!1,Cc=null,s=ja,ja=js(t.containerInfo),Lt(t,e,a),ja=s,jt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{xr(t.containerInfo)}catch($){ze(e,e.return,$)}oh&&(oh=!1,pw(e)),we=!1;break;case 4:o=en,en=bt,n=_f(),s=ja,ja=js(e.stateNode.containerInfo),Lt(t,e,a),jt(e),ja=s,we&&bs&&(Pc=!0),we=n,en=o;break;case 12:Lt(t,e,a),jt(e);break;case 31:Lt(t,e,a),jt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,sc(e,t)));break;case 13:Lt(t,e,a),jt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($u=ua()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,sc(e,t)));break;case 22:s=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var u=bt,h=ke,g=en;bt=u||s,en=g||s,ke=h||c,Lt(t,e,a),ke=h,en=g,bt=u,jt(e),o&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||n===null||c||bt||ke||(t=c||ke,a=bt,n=ke,bt=s||bt,ke=t,Qn(e,2),bt=a,ke=n),!s&&en||im(e,s)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,sc(e,a))));break;case 19:Lt(t,e,a),jt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,sc(e,t)));break;case 30:o&512&&(ke||n===null||Nt(n,n.return)),o=_f(),s=bs,c=(a&335544064)===a,u=e.memoizedProps,bs=c&&Dn(u.default,u.update)!=="none",Lt(t,e,a),jt(e),c&&n!==null&&we&&(e.flags|=4),bs=s,we=o;break;case 21:break;case 7:o&512&&(ke||n===null||Nt(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Lt(t,e,a),jt(e)}}function jt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(tw(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(lp(o)){var s=o.stateNode;n===null?n=[s]:n.push(s)}if(sp(o))break;o=o.return}var c=n;if(a==null)throw Error(R(160));switch(a.tag){case 27:var u=a.stateNode,h=ih(e);Jc(e,h,u,c);break;case 5:var g=a.stateNode;a.flags&32&&(hr(g,""),a.flags&=-33);var $=ih(e);Jc(e,$,g,c);break;case 3:case 4:var x=a.stateNode.containerInfo,f=ih(e);Ph(e,f,x,c);break;default:throw Error(R(161))}}catch(b){ze(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function pw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;pw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,$r=!0,t.reset(),$r=!1),e=e.sibling}}function Io(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)gw(t,e),t=t.sibling;else rw(t,!1)}function gw(e,t){var a=e.alternate;if(a===null)Wh(e,!1);else switch(e.tag){case 3:if(nm=tn=!1,zb(),Io(t,e),!tn&&!Pc){if(e=on,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];Lw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),nm=!0}on=null;break;case 5:Io(t,e);break;case 4:n=tn,tn=!1,Io(t,e),tn&&(Pc=!0),tn=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Wh(e,!1):Io(t,e));break;case 30:n=tn,o=zb(),tn=!1,Io(t,e),tn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=zn(s,c),c=zn(a.memoizedProps,c);var u=Dn(s.default,s.update);u==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Ft=0,t=cp(e,a,t,c,u,s,!0),Ft!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(gr(e,e.memoizedProps.onUpdate),on=o):o!==null&&(o.push.apply(o,on),on=o),tn=(e.flags&32)!==0?!0:n;break;default:Io(t,e)}}function an(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)sw(e,t.alternate,t),t=t.sibling}function Qn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:fi(4,a,a.return),Qn(a,n);break;case 1:Nt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&ew(a,a.return,o),Qn(a,n);break;case 27:(n&2)!==0&&Fw(a.stateNode,a.type,a.memoizedProps);case 5:Nt(a,a.return),a.tag!==5&&a.tag!==27||Es(a),Qn(a,n);break;case 6:Es(a);break;case 26:Nt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||ke||o.parentNode.removeChild(o),Qn(a,n);break;case 22:a.memoizedState===null&&Qn(a,n);break;case 30:Nt(a,a.return),Qn(a,n);break;case 7:Nt(a,a.return);default:Qn(a,n)}e=e.sibling}}function La(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,s=t,c=s.flags,u=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:La(o,s,a),tl(4,s);break;case 1:if(La(o,s,a),n=s,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch($){ze(n,n.return,$)}if(n=s,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)ly(g[o],h)}catch($){ze(n,n.return,$)}}u&&c&64&&Wy(s),nn(s,s.return);break;case 27:(a&2)!==0&&aw(s);case 5:s.tag!==5&&s.tag!==27||Eb(s),La(o,s,a),u&&n===null&&c&4&&Fh(s),nn(s,s.return);break;case 6:Eb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||bt||xm(js(h.ownerDocument),s.type,h),La(o,s,a),u&&n===null&&c&4&&Fh(s),nn(s,s.return);break;case 12:La(o,s,a);break;case 31:La(o,s,a),u&&c&4&&dw(o,s);break;case 13:La(o,s,a),u&&c&4&&hw(o,s);break;case 22:s.memoizedState===null&&La(o,s,a),nn(s,s.return);break;case 30:La(o,s,a),nn(s,s.return);break;case 7:nn(s,s.return);default:La(o,s,a)}t=t.sibling}}function up(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ws(a))}function dp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Ws(e))}function xa(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)fw(e,t,a,n),t=t.sibling;else o&&ow(t)}function fw(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Sc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:xa(e,t,a,n),s&2048&&tl(9,t);break;case 1:xa(e,t,a,n);break;case 3:xa(e,t,a,n),o&&nm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Ws(s)));break;case 12:if(s&2048){xa(e,t,a,n),s=t.stateNode;try{var c=t.memoizedProps,u=c.id,h=c.onPostCommit;typeof h=="function"&&h(u,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(g){ze(t,t.return,g)}}else xa(e,t,a,n);break;case 31:xa(e,t,a,n);break;case 13:xa(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,u=t.alternate,t.memoizedState!==null?(o&&u!==null&&u.memoizedState===null&&Sc(u),c._visibility&2?xa(e,t,a,n):Cs(e,t)):(o&&u!==null&&u.memoizedState!==null&&Sc(t),c._visibility&2?xa(e,t,a,n):(c._visibility|=2,qo(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),s&2048&&up(u,t);break;case 24:xa(e,t,a,n),s&2048&&dp(t.alternate,t);break;case 30:o&&(s=t.alternate,s!==null&&(hn(s.child,!0),hn(t.child,!0))),xa(e,t,a,n);break;default:xa(e,t,a,n)}}function qo(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,u=a,h=n,g=c.flags;switch(c.tag){case 0:case 11:case 15:qo(s,c,u,h,o),tl(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?qo(s,c,u,h,o):Cs(s,c):($._visibility|=2,qo(s,c,u,h,o)),o&&g&2048&&up(c.alternate,c);break;case 24:qo(s,c,u,h,o),o&&g&2048&&dp(c.alternate,c);break;default:qo(s,c,u,h,o)}t=t.sibling}}function Cs(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:Cs(a,n),o&2048&&up(n.alternate,n);break;case 24:Cs(a,n),o&2048&&dp(n.alternate,n);break;default:Cs(a,n)}t=t.sibling}}var Ui=8192;function _i(e,t,a){if(e.subtreeFlags&Ui)for(e=e.child;e!==null;)bw(e,t,a),e=e.sibling}function bw(e,t,a){switch(e.tag){case 26:_i(e,t,a),e.flags&Ui&&(e.memoizedState!==null?i2(a,ja,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&av(a,e)));break;case 5:_i(e,t,a),e.flags&Ui&&(e=e.stateNode,(t&335544128)===t&&av(a,e));break;case 3:case 4:var n=ja;ja=js(e.stateNode.containerInfo),_i(e,t,a),ja=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Ui,Ui=16777216,_i(e,t,a),Ui=n):_i(e,t,a));break;case 30:if((e.flags&Ui)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,la===null&&(la=new Map),la.set(n,o)}_i(e,t,a);break;default:_i(e,t,a)}}function vw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function us(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];vt=n,ww(n,e)}vw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)yw(e),e=e.sibling}function yw(e){switch(e.tag){case 0:case 11:case 15:us(e),e.flags&2048&&fi(9,e,e.return);break;case 3:us(e);break;case 12:us(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Tc(e)):us(e);break;default:us(e)}}function Tc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];vt=n,ww(n,e)}vw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:fi(8,t,t.return),Tc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Tc(t));break;default:Tc(t)}e=e.sibling}}function ww(e,t){for(;vt!==null;){var a=vt;switch(a.tag){case 0:case 11:case 15:fi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Ws(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,vt=n;else e:for(a=e;vt!==null;){n=vt;var o=n.sibling,s=n.return;if(cw(n),n===a){vt=null;break e}if(o!==null){o.return=s,vt=o;break e}vt=s}}}var t5={getCacheForType:function(e){var t=Tt(nt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return Tt(nt).controller.signal}},a5=typeof WeakMap=="function"?WeakMap:Map,xe=0,Ve=null,me=null,pe=0,Ee=0,oa=null,ei=!1,Er=!1,hp=!1,On=0,Pe=0,bi=0,Xi=0,Wc=0,ca=0,pr=0,zs=null,Jt=null,rm=!1,$u=0,$w=0,eu=1/0,tu=null,ci=null,Ze=0,Ya=null,eo=null,dn=0,sm=0,lm=null,xw=null,sr=null,lr=null,cr=null,As=0,kc=null;function ma(){return(xe&2)!==0&&pe!==0?pe&-pe:ee.T!==null?pp():kv()}function Nw(){if(ca===0)if((pe&536870912)===0||le){var e=Zl;Zl<<=1,(Zl&3932160)===0&&(Zl=262144),ca=e}else ca=536870912;return e=zt.current,e!==null&&(e.flags|=32),ca}function gr(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=Gw(zn(e.memoizedProps,a))),lr===null&&(lr=[]),lr.push(t.bind(null,n))}}function Wt(e,t,a){(e===Ve&&(Ee===2||Ee===9)||e.cancelPendingCommit!==null)&&(fr(e,0),ti(e,pe,ca,!1)),Js(e,a),((xe&2)===0||e!==Ve)&&(e===Ve&&((xe&2)===0&&(Xi|=a),Pe===4&&ti(e,pe,ca,!1)),pn(e))}function Sw(e,t,a){if((xe&6)!==0)throw Error(R(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Ks(e,t),o=n?o5(e,t):rh(e,t,!0),s=n;do{if(o===0){Er&&!n&&ti(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!n5(a)){o=rh(e,t,!1),s=!1;continue}if(o===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var u=e;o=zs;var h=u.current.memoizedState.isDehydrated;if(h&&(fr(u,c).flags|=256),c=rh(u,c,!1),c!==2&&c!==6){if(hp&&!h){u.errorRecoveryDisabledLanes|=s,Xi|=s,o=4;break e}s=Jt,Jt=o,s!==null&&(Jt===null?Jt=s:Jt.push.apply(Jt,s))}o=c}if(s=!1,o!==2)continue}}if(o===1){fr(e,0),ti(e,t,0,!0);break}e:{switch(n=e,s=o,s){case 0:case 1:throw Error(R(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ti(n,t,ca,!ei);break e;case 2:Jt=null;break;case 3:case 5:break;default:throw Error(R(329))}if((t&62914560)===t&&(o=$u+300-ua(),10<o)){if(ti(n,t,ca,!ei),su(n,0,!0)!==0)break e;dn=t,n.timeoutHandle=fp(Rb.bind(null,n,a,Jt,tu,rm,t,ca,Xi,pr,ei,s,"Throttled",-0,0),o);break e}Rb(n,a,Jt,tu,rm,t,ca,Xi,pr,ei,s,null,-0,0)}}break}while(!0);pn(e)}function Rb(e,t,a,n,o,s,c,u,h,g,$,x,f,b){e.timeoutHandle=-1;var C=t.subtreeFlags,k=(s&335544064)===s;if(x=null,(k||C&8192||(C&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:sn},la=null,bw(t,s,x),k&&(C=x,k=e.containerInfo,k=(k.nodeType===9?k:k.ownerDocument).__reactViewTransition,k!=null&&(C.count++,C.waitingForViewTransition=!0,C=Gs.bind(C),k.finished.then(C,C))),C=(s&62914560)===s?$u-ua():(s&4194048)===s?$w-ua():0,C=o2(x,C),C!==null)){dn=s,e.cancelPendingCommit=C(Ob.bind(null,e,t,s,a,n,o,c,u,h,g,$,x,null,f,b)),ti(e,s,c,!g);return}Ob(e,t,s,a,n,o,c,u,h,g,$,x)}function n5(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],s=o.getSnapshot;o=o.value;try{if(!pa(s(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ti(e,t,a,n){t=$v(e,t),t&=~Wc,t&=~Xi,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var s=31-ha(o),c=1<<s;n[s]=-1,o&=~c}a!==0&&Nv(e,a,t)}function xu(){return(xe&6)===0?(al(0,!1),!1):!0}function mp(){if(me!==null){if(Ee===0)var e=me.return;else e=me,Tn=oo=null,Jm(e),ir=null,Hs=0,e=me;for(;e!==null;)Py(e.alternate,e),e=e.return;me=null}}function fr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,T5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),dn=0,mp(),Ve=e,me=a=kn(e.current,null),pe=t,Ee=0,oa=null,ei=!1,Er=Ks(e,t),hp=!1,pr=ca=Wc=Xi=bi=Pe=0,Jt=zs=null,rm=!1,On=$v(e,t),hu(),a}function Tw(e,t){ne=null,ee.H=Qc,t===Tr||t===gu?(t=ib(),Ee=3):t===Lm?(t=ib(),Ee=4):Ee=t===ip?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,oa=t,me===null&&(Pe=1,Zc(e,Ea(t,e.current)))}function kw(){var e=zt.current;return e===null?!0:(pe&4194048)===pe?Vt===null:(pe&62914560)===pe||(pe&536870912)!==0?e===Vt:!1}function Ew(){var e=ee.H;return ee.H=Qc,e===null?Qc:e}function Cw(){var e=ee.A;return ee.A=t5,e}function au(){Pe=4,ei||(pe&4194048)!==pe&&zt.current!==null||(Er=!0),(bi&134217727)===0&&(Xi&134217727)===0||Ve===null||ti(Ve,pe,ca,!1)}function rh(e,t,a){var n=xe;xe|=2;var o=Ew(),s=Cw();(Ve!==e||pe!==t)&&(tu=null,fr(e,t)),t=!1;var c=Pe;e:do try{if(Ee!==0&&me!==null){var u=me,h=oa;switch(Ee){case 8:mp(),c=6;break e;case 3:case 2:case 9:case 6:zt.current===null&&(t=!0);var g=Ee;if(Ee=0,oa=null,Wo(e,u,h,g),a&&Er){c=0;break e}break;default:g=Ee,Ee=0,oa=null,Wo(e,u,h,g)}}i5(),c=Pe;break}catch($){Tw(e,$)}while(!0);return t&&e.shellSuspendCounter++,Tn=oo=null,xe=n,ee.H=o,ee.A=s,me===null&&(Ve=null,pe=0,hu()),c}function i5(){for(;me!==null;)zw(me)}function o5(e,t){var a=xe;xe|=2;var n=Ew(),o=Cw();Ve!==e||pe!==t?(tu=null,eu=ua()+500,fr(e,t)):Er=Ks(e,t);e:do try{if(Ee!==0&&me!==null){t=me;var s=oa;t:switch(Ee){case 1:Ee=0,oa=null,Wo(e,t,s,1);break;case 2:case 9:if(nb(s)){Ee=0,oa=null,Mb(t);break}t=function(){Ee!==2&&Ee!==9||Ve!==e||(Ee=7),pn(e)},s.then(t,t);break e;case 3:Ee=7;break e;case 4:Ee=5;break e;case 7:nb(s)?(Ee=0,oa=null,Mb(t)):(Ee=0,oa=null,Wo(e,t,s,7));break;case 5:var c=null;switch(me.tag){case 26:c=me.memoizedState;case 5:case 27:var u=me;if(c?e0(c):u.stateNode.complete){Ee=0,oa=null;var h=u.sibling;if(h!==null)me=h;else{var g=u.return;g!==null?(me=g,Nu(g)):me=null}break t}}Ee=0,oa=null,Wo(e,t,s,5);break;case 6:Ee=0,oa=null,Wo(e,t,s,6);break;case 8:mp(),Pe=6;break e;default:throw Error(R(462))}}r5();break}catch($){Tw(e,$)}while(!0);return Tn=oo=null,ee.H=n,ee.A=o,xe=a,me!==null?0:(Ve=null,pe=0,hu(),Pe)}function r5(){for(;me!==null&&!Nx();)zw(me)}function zw(e){var t=Fy(e.alternate,e,On);e.memoizedProps=e.pendingProps,t===null?Nu(e):me=t}function Mb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=wb(a,t,t.pendingProps,t.type,void 0,pe);break;case 11:t=wb(a,t,t.pendingProps,t.type.render,t.ref,pe);break;case 5:Jm(t);var n=t;n===wt&&(le?(qc(n),n.tag===5&&n.stateNode!=null&&(qe=n.stateNode)):(qc(n),le=!0));default:Py(a,t),t=me=Wv(t,On),t=Fy(a,t,On)}e.memoizedProps=e.pendingProps,t===null?Nu(e):me=t}function Wo(e,t,a,n){Tn=oo=null,Jm(t),ir=null,Hs=0;var o=t.return;try{if(QN(e,o,t,a,pe)){Pe=1,Zc(e,Ea(a,e.current)),me=null;return}}catch(s){if(o!==null)throw me=o,s;Pe=1,Zc(e,Ea(a,e.current)),me=null;return}t.flags&32768?(le||n===1?e=!0:Er||(pe&536870912)!==0?e=!1:(ei=e=!0,(n===2||n===9||n===3||n===6)&&(n=zt.current,n!==null&&n.tag===13&&(n.flags|=16384))),Aw(t,e)):Nu(t)}function Nu(e){var t=e;do{if((t.flags&32768)!==0){Aw(t,ei);return}e=t.return;var a=FN(t.alternate,t,On);if(a!==null){me=a;return}if(t=t.sibling,t!==null){me=t;return}me=t=e}while(t!==null);Pe===0&&(Pe=5)}function Aw(e,t){do{var a=PN(e.alternate,e);if(a!==null){a.flags&=32767,me=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){me=e;return}me=e=a}while(e!==null);Pe=6,me=null}function Ob(e,t,a,n,o,s,c,u,h,g,$,x){e.cancelPendingCommit=null;do Su();while(Ze!==0);if((xe&6)!==0)throw Error(R(327));if(t!==null){if(t===e.current)throw Error(R(177));e===Ve&&(me=Ve=null,pe=0),eo=t,Ya=e,dn=a,lm=o,xw=n,s5(e,t,a,c,u,h,x)}}function s5(e,t,a,n,o,s,c){var u=t.lanes|t.childLanes;if(sm=u,u|=_m,Ox(e,a,u,n,o,s),lr=null,(a&335544064)===a?(cr=DN(e),n=10262):(cr=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,m5(Dc,function(){return hm(),null})):(e.callbackNode=null,e.callbackPriority=0),Fc=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null,o=Ne.p,Ne.p=2,s=xe,xe|=4;try{WN(e,t,a)}finally{xe=s,Ne.p=o,ee.T=n}}Ze=1,Fc?sr=R5(c,e.containerInfo,cr,cm,um,c5,dm,hm,l5,null,null):(cm(),um(),dm())}function l5(e){if(Ze!==0){var t=Ya.onRecoverableError;t(e,{componentStack:null})}}function c5(){Ze===3&&(Ze=0,gw(eo,Ya),Ze=4)}function cm(){if(Ze===1){Ze=0;var e=Ya,t=eo,a=dn,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null;var o=Ne.p;Ne.p=2;var s=xe;xe|=4;try{bs=Pc=!1,mw(t,e,a),a=fm;var c=Yv(e.containerInfo),u=a.focusedElem,h=a.selectionRange;if(c!==u&&u&&u.ownerDocument&&Gv(u.ownerDocument.documentElement,u)){if(h!==null&&Dm(u)){var g=h.start,$=h.end;if($===void 0&&($=g),"selectionStart"in u)u.selectionStart=g,u.selectionEnd=Math.min($,u.value.length);else{var x=u.ownerDocument||document,f=x&&x.defaultView||window;if(f.getSelection){var b=f.getSelection(),C=u.textContent.length,k=Math.min(h.start,C),M=h.end===void 0?k:Math.min(h.end,C);!b.extend&&k>M&&(c=M,M=k,k=c);var w=Kf(u,k),y=Kf(u,M);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),k>M?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=u;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<x.length;u++){var S=x[u];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}$r=!!gm,fm=gm=null}finally{xe=s,Ne.p=o,ee.T=n}}e.current=t,Ze=2}}function um(){if(Ze===2){Ze=0;var e=Ya,t=eo,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=ee.T,ee.T=null;var n=Ne.p;Ne.p=2;var o=xe;xe|=4;try{sw(e,t.alternate,t)}finally{xe=o,Ne.p=n,ee.T=a}}Ze=3}}function dm(){if(Ze===4||Ze===3){Ze=0;var e=sr;sr=null,Sx();var t=Ya,a=eo,n=dn,o=xw,s=(n&335544064)===n?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?Ze=5:(Ze=0,eo=Ya=null,Rw(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(ci=null),zm(n),a=a.stateNode,da&&typeof da.onCommitFiberRoot=="function")try{da.onCommitFiberRoot(Zs,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=ee.T,s=Ne.p,Ne.p=2,ee.T=null;try{for(var c=t.onRecoverableError,u=0;u<o.length;u++){var h=o[u];c(h.value,{componentStack:h.stack})}}finally{ee.T=a,Ne.p=s}}if(o=lr,c=cr,cr=null,o!==null&&(lr=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(dn&3)!==0&&Su(),pn(t),s=t.pendingLanes,(n&261930)!==0&&(s&42)!==0?t===kc?As++:(As=0,kc=t):(As=0,kc=null),al(0,!1)}}function Rw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Ws(t)))}function Su(){return sr!==null&&(sr.skipTransition(),sr=null),cm(),um(),dm(),hm()}function hm(){if(Ze!==5)return!1;var e=Ya,t=sm;sm=0;var a=zm(dn),n=ee.T,o=Ne.p;try{Ne.p=32>a?32:a,ee.T=null,a=lm,lm=null;var s=Ya,c=dn;if(Ze=0,eo=Ya=null,dn=0,(xe&6)!==0)throw Error(R(331));var u=xe;if(xe|=4,yw(s.current),fw(s,s.current,c,a),xe=u,al(0,!1),da&&typeof da.onPostCommitFiberRoot=="function")try{da.onPostCommitFiberRoot(Zs,s)}catch{}return!0}finally{Ne.p=o,ee.T=n,Rw(e,t)}}function Vb(e,t,a){t=Ea(a,t),t=Yh(e.stateNode,t,2),e=ri(e,t,2),e!==null&&(Js(e,2),pn(e))}function ze(e,t,a){if(e.tag===3)Vb(e,e,a);else for(;t!==null;){if(t.tag===3){Vb(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(ci===null||!ci.has(n))){e=Ea(a,e),a=Xy(2),n=ri(t,a,2),n!==null&&(Qy(a,n,t,e),Js(n,2),pn(n));break}}t=t.return}}function sh(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new a5;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(hp=!0,o.add(a),e=u5.bind(null,e,t,a),t.then(e,e))}function u5(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Ve===e&&(pe&a)===a&&((Pe===4||Pe===3&&(pe&62914560)===pe&&300>ua()-$u)&&(xe&2)===0?fr(e,0):Wc|=a,pr===pe&&(pr=0)),pn(e)}function Mw(e,t){t===0&&(t=xv()),e=io(e,t),e!==null&&(Js(e,t),pn(e))}function d5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Mw(e,a)}function h5(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(R(314))}n!==null&&n.delete(t),Mw(e,a)}function m5(e,t){return Em(e,t)}var br=null,Bo=null,mm=!1,nu=!1,lh=!1,ai=0;function pn(e){e!==Bo&&e.next===null&&(Bo===null?br=Bo=e:Bo=Bo.next=e),nu=!0,mm||(mm=!0,g5())}function al(e,t){if(!lh&&nu){lh=!0;do for(var a=!1,n=br;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var s=0;else{var c=n.suspendedLanes,u=n.pingedLanes;s=(1<<31-ha(42|e)+1)-1,s&=o&~(c&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Db(n,s))}else s=pe,s=su(n,n===Ve?s:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(s&3)===0||Ks(n,s)||(a=!0,Db(n,s));n=n.next}while(a);lh=!1}}function p5(){Ow()}function Ow(){nu=mm=!1;var e=0;ai!==0&&S5()&&(e=ai);for(var t=ua(),a=null,n=br;n!==null;){var o=n.next,s=Vw(n,t);s===0?(n.next=null,a===null?br=o:a.next=o,o===null&&(Bo=a)):(a=n,(e!==0||(s&3)!==0)&&(nu=!0)),n=o}Ze!==0&&Ze!==5||al(e,!1),ai!==0&&(ai=0)}function Vw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-ha(s),u=1<<c,h=o[c];h===-1?((u&a)===0||(u&n)!==0)&&(o[c]=Mx(u,t)):h<=t&&(e.expiredLanes|=u),s&=~u}if(t=Ve,a=pe,a=su(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(Ee===2||Ee===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&qd(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Ks(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&qd(n),zm(a)){case 2:case 8:a=yv;break;case 32:a=Dc;break;case 268435456:a=wv;break;default:a=Dc}return n=Dw.bind(null,e),a=Em(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&qd(n),e.callbackPriority=2,e.callbackNode=null,2}function Dw(e,t){if(Ze!==0&&Ze!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Su()&&e.callbackNode!==a)return null;var n=pe;return n=su(e,e===Ve?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(Sw(e,n,t),Vw(e,ua()),e.callbackNode!=null&&e.callbackNode===a?Dw.bind(null,e):null)}function Db(e,t){if(Su())return null;Sw(e,t,!0)}function g5(){k5(function(){(xe&6)!==0?Em(vv,p5):Ow()})}function pp(){if(ai===0){var e=Ji;e===0&&(e=Ql,Ql<<=1,(Ql&261888)===0&&(Ql=256)),ai=e}return ai}function _b(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:pc(e)}function f5(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var s=_b((o[ta]||null).action),c=n.submitter;c&&(t=(t=c[ta]||null)?_b(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var u=new cu("action","action",null,n,o);e.push({event:u,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(ai!==0){var h=new FormData(o,c);jh(a,{pending:!0,data:h,method:o.method,action:s},null,h)}}else typeof s=="function"&&(u.preventDefault(),h=new FormData(o,c),jh(a,{pending:!0,data:h,method:o.method,action:s},s,h))},currentTarget:o}]})}}for(lc=0;lc<Mh.length;lc++)cc=Mh[lc],Hb=cc.toLowerCase(),Ib=cc[0].toUpperCase()+cc.slice(1),Xa(Hb,"on"+Ib);var cc,Hb,Ib,lc;Xa(Qv,"onAnimationEnd");Xa(Zv,"onAnimationIteration");Xa(Kv,"onAnimationStart");Xa("dblclick","onDoubleClick");Xa("focusin","onFocus");Xa("focusout","onBlur");Xa(EN,"onTransitionRun");Xa(CN,"onTransitionStart");Xa(zN,"onTransitionCancel");Xa(Jv,"onTransitionEnd");dr("onMouseEnter",["mouseout","mouseover"]);dr("onMouseLeave",["mouseout","mouseover"]);dr("onPointerEnter",["pointerout","pointerover"]);dr("onPointerLeave",["pointerout","pointerover"]);ao("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ao("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ao("onBeforeInput",["compositionend","keypress","textInput","paste"]);ao("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var qs="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),b5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(qs));function _w(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var s=void 0;if(t)for(var c=n.length-1;0<=c;c--){var u=n[c],h=u.instance,g=u.currentTarget;if(u=u.listener,h!==s&&o.isPropagationStopped())break e;s=u,o.currentTarget=g;try{s(o)}catch($){Hc($)}o.currentTarget=null,s=h}else for(c=0;c<n.length;c++){if(u=n[c],h=u.instance,g=u.currentTarget,u=u.listener,h!==s&&o.isPropagationStopped())break e;s=u,o.currentTarget=g;try{s(o)}catch($){Hc($)}o.currentTarget=null,s=h}}}}function he(e,t){var a=t[Mf];a===void 0&&(a=t[Mf]=new Set);var n=e+"__bubble";a.has(n)||(Hw(t,e,2,!1),a.add(n))}function ch(e,t,a){var n=0;t&&(n|=4),Hw(a,e,n,t)}var uc="_reactListening"+Math.random().toString(36).slice(2);function gp(e){if(!e[uc]){e[uc]=!0,Cv.forEach(function(a){a!=="selectionchange"&&(b5.has(a)||ch(a,!1,e),ch(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[uc]||(t[uc]=!0,ch("selectionchange",!1,t))}}function Hw(e,t,a,n){switch(s0(t)){case 2:var o=c2;break;case 8:o=u2;break;default:o=xp}a=o.bind(null,t,a,e),o=void 0,!Ch||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function uh(e,t,a,n,o){var s=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var u=n.stateNode.containerInfo;if(u===o)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;u!==null;){if(c=qi(u),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=s=c;continue e}u=u.parentNode}}n=n.return}_v(function(){var g=s,$=Rm(a),x=[];e:{var f=Fv.get(e);if(f!==void 0){var b=cu,C=e;switch(e){case"keypress":if(fc(a)===0)break e;case"keydown":case"keyup":b=nN;break;case"focusin":C="focus",b=Xd;break;case"focusout":C="blur",b=Xd;break;case"beforeblur":case"afterblur":b=Xd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=qf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=Yx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=lN;break;case Qv:case Zv:case Kv:b=Zx;break;case Jv:b=uN;break;case"scroll":case"scrollend":b=jx;break;case"wheel":b=hN;break;case"copy":case"cut":case"paste":b=Jx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=Lf;break;case"submit":b=rN;break;case"toggle":case"beforetoggle":b=pN}var k=(t&4)!==0,M=!k&&(e==="scroll"||e==="scrollend"),w=k?f!==null?f+"Capture":null:f;k=[];for(var y=g,v;y!==null;){var S=y;if(v=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||v===null||w===null||(S=Ms(y,w),S!=null&&k.push(Bs(y,S,v))),M)break;y=y.return}0<k.length&&(f=new b(f,C,null,a,$),x.push({event:f,listeners:k}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",b&&a!==Eh&&(C=a.relatedTarget||a.fromElement)&&(qi(C)||C[Nr]))break e;(f||b)&&(C=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,f?(b=a.relatedTarget||a.toElement,f=g,b=b?qi(b):null,b!==null&&(M=Qs(b),k=b.tag,b!==M||k!==5&&k!==27&&k!==6)&&(b=null)):(f=null,b=g),f!==b&&(k=qf,S="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(k=Lf,S="onPointerLeave",w="onPointerEnter",y="pointer"),M=f==null?C:gs(f),v=b==null?C:gs(b),C=new k(S,y+"leave",f,a,$),C.target=M,C.relatedTarget=v,S=null,qi($)===g&&(k=new k(w,y+"enter",b,a,$),k.target=v,k.relatedTarget=M,S=k),M=S,k=f&&b?gh(f,b,v5):null,f!==null&&Ub(x,C,f,k,!1),b!==null&&M!==null&&Ub(x,M,b,k,!0)))}e:{if(f=g?gs(g):window,b=f.nodeName&&f.nodeName.toLowerCase(),b==="select"||b==="input"&&f.type==="file")var O=Xf;else if(Yf(f))if(Lv)O=SN;else{O=xN;var F=$N}else b=f.nodeName,!b||b.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Am(g.elementType)&&(O=Xf):O=NN;if(O&&(O=O(e,g))){Bv(x,O,a,$);break e}F&&F(e,f,g)}switch(F=g?gs(g):window,e){case"focusin":(Yf(F)||F.contentEditable==="true")&&(Qo=F,Ah=g,ws=null);break;case"focusout":ws=Ah=Qo=null;break;case"mousedown":Rh=!0;break;case"contextmenu":case"mouseup":case"dragend":Rh=!1,Jf(x,a,$);break;case"selectionchange":if(kN)break;case"keydown":case"keyup":Jf(x,a,$)}var H;if(Vm)e:{switch(e){case"compositionstart":var j="onCompositionStart";break e;case"compositionend":j="onCompositionEnd";break e;case"compositionupdate":j="onCompositionUpdate";break e}j=void 0}else Xo?Uv(e,a)&&(j="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(j="onCompositionStart");j&&(Iv&&a.locale!=="ko"&&(Xo||j!=="onCompositionStart"?j==="onCompositionEnd"&&Xo&&(H=Hv()):(Pn=$,Mm="value"in Pn?Pn.value:Pn.textContent,Xo=!0)),F=iu(g,j),0<F.length&&(j=new Bf(j,e,null,a,$),x.push({event:j,listeners:F}),H?j.data=H:(H=qv(a),H!==null&&(j.data=H)))),(H=fN?bN(e,a):vN(e,a))&&(j=iu(g,"onBeforeInput"),0<j.length&&(F=new Bf("onBeforeInput","beforeinput",null,a,$),x.push({event:F,listeners:j}),F.data=H)),f5(x,e,g,a,$)}_w(x,t)})}function Bs(e,t,a){return{instance:e,listener:t,currentTarget:a}}function iu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,s=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||s===null||(o=Ms(e,a),o!=null&&n.unshift(Bs(e,o,s)),o=Ms(e,t),o!=null&&n.push(Bs(e,o,s))),e.tag===3)return n;e=e.return}return[]}function v5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Ub(e,t,a,n,o){for(var s=t._reactName,c=[];a!==null&&a!==n;){var u=a,h=u.alternate,g=u.stateNode;if(u=u.tag,h!==null&&h===n)break;u!==5&&u!==26&&u!==27||g===null||(h=g,o?(g=Ms(a,s),g!=null&&c.unshift(Bs(a,g,h))):o||(g=Ms(a,s),g!=null&&c.push(Bs(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var y5=/\r\n?/g,w5=/\u0000|\uFFFD/g;function qb(e){return(typeof e=="string"?e:""+e).replace(y5,`
`).replace(w5,"")}function Iw(e,t){return t=qb(t),qb(e)===t}function Ce(e,t,a,n,o,s){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||hr(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&hr(e,""+n);else return;break;case"className":Jl(e,"class",n);break;case"tabIndex":Jl(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Jl(e,a,n);break;case"style":Dv(e,n,s);return;case"data":if(t!=="object"){Jl(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=pc(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&Ce(e,t,"name",o.name,o,null),Ce(e,t,"formEncType",o.formEncType,o,null),Ce(e,t,"formMethod",o.formMethod,o,null),Ce(e,t,"formTarget",o.formTarget,o,null)):(Ce(e,t,"encType",o.encType,o,null),Ce(e,t,"method",o.method,o,null),Ce(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=pc(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=sn);return;case"onScroll":n!=null&&he("scroll",e);return;case"onScrollEnd":n!=null&&he("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(R(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(R(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=pc(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":he("beforetoggle",e),he("toggle",e),mc(e,"popover",n);break;case"xlinkActuate":xn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":xn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":xn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":xn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":xn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":xn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":xn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":xn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":xn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":mc(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=Bx.get(a)||a,mc(e,a,n);else return}we=!0}function pm(e,t,a,n,o,s){switch(a){case"style":Dv(e,n,s);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(R(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(R(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")hr(e,n);else if(typeof n=="number"||typeof n=="bigint")hr(e,""+n);else return;break;case"onScroll":n!=null&&he("scroll",e);return;case"onScrollEnd":n!=null&&he("scrollend",e);return;case"onClick":n!=null&&(e.onclick=sn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!zv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),s=a.slice(2,o?a.length-7:void 0),t=e[ta]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,n,o);break e}we=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):mc(e,a,n)}return}we=!0}function Ct(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":he("error",e),he("load",e);var n=!1,o=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(R(137,t));default:Ce(e,t,s,c,a,null)}}o&&Ce(e,t,"srcSet",a.srcSet,a,null),n&&Ce(e,t,"src",a.src,a,null);return;case"input":he("invalid",e);var u=s=c=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var $=a[n];if($!=null)switch(n){case"name":o=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":g=$;break;case"value":s=$;break;case"defaultValue":u=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(R(137,t));break;default:Ce(e,t,n,$,a,null)}}Mv(e,s,u,h,g,c,o,!1);return;case"select":he("invalid",e),n=c=s=null;for(o in a)if(a.hasOwnProperty(o)&&(u=a[o],u!=null))switch(o){case"value":s=u;break;case"defaultValue":c=u;break;case"multiple":n=u;default:Ce(e,t,o,u,a,null)}t=s,a=c,e.multiple=!!n,t!=null?tr(e,!!n,t,!1):a!=null&&tr(e,!!n,a,!0);return;case"textarea":he("invalid",e),s=o=n=null;for(c in a)if(a.hasOwnProperty(c)&&(u=a[c],u!=null))switch(c){case"value":n=u;break;case"defaultValue":o=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(R(91));break;default:Ce(e,t,c,u,a,null)}Vv(e,n,o,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":Ce(e,t,h,n,a,null));return;case"dialog":he("beforetoggle",e),he("toggle",e),he("cancel",e),he("close",e);break;case"iframe":case"object":he("load",e);break;case"video":case"audio":for(n=0;n<qs.length;n++)he(qs[n],e);break;case"image":he("error",e),he("load",e);break;case"details":he("toggle",e);break;case"embed":case"source":case"link":he("error",e),he("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(R(137,t));default:Ce(e,t,g,n,a,null)}return;default:if(Am(t)){for($ in a)a.hasOwnProperty($)&&(n=a[$],n!==void 0&&pm(e,t,$,n,a,void 0));return}}for(u in a)a.hasOwnProperty(u)&&(n=a[u],n!=null&&Ce(e,t,u,n,a,null))}var $5={};function x5(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,s=null,c=null,u=null,h=null,g=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:n.hasOwnProperty(b)||Ce(e,t,b,null,n,x)}}for(var f in n){var b=n[f];if(x=a[f],n.hasOwnProperty(f)&&(b!=null||x!=null))switch(f){case"type":b!==x&&(we=!0),s=b;break;case"name":b!==x&&(we=!0),o=b;break;case"checked":b!==x&&(we=!0),g=b;break;case"defaultChecked":b!==x&&(we=!0),$=b;break;case"value":b!==x&&(we=!0),c=b;break;case"defaultValue":b!==x&&(we=!0),u=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(R(137,t));break;default:b!==x&&Ce(e,t,f,b,n,x)}}kh(e,c,u,h,g,$,s,o);return;case"select":b=c=u=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":b=h;default:n.hasOwnProperty(s)||Ce(e,t,s,null,n,h)}for(o in n)if(s=n[o],h=a[o],n.hasOwnProperty(o)&&(s!=null||h!=null))switch(o){case"value":s!==h&&(we=!0),f=s;break;case"defaultValue":s!==h&&(we=!0),u=s;break;case"multiple":s!==h&&(we=!0),c=s;default:s!==h&&Ce(e,t,o,s,n,h)}t=u,a=c,n=b,f!=null?tr(e,!!a,f,!1):!!n!=!!a&&(t!=null?tr(e,!!a,t,!0):tr(e,!!a,a?[]:"",!1));return;case"textarea":b=f=null;for(u in a)if(o=a[u],a.hasOwnProperty(u)&&o!=null&&!n.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ce(e,t,u,null,n,o)}for(c in n)if(o=n[c],s=a[c],n.hasOwnProperty(c)&&(o!=null||s!=null))switch(c){case"value":o!==s&&(we=!0),f=o;break;case"defaultValue":o!==s&&(we=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(R(91));break;default:o!==s&&Ce(e,t,c,o,n,s)}Ov(e,f,b);return;case"option":for(var C in a)f=a[C],a.hasOwnProperty(C)&&f!=null&&!n.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Ce(e,t,C,null,n,f));for(h in n)f=n[h],b=a[h],n.hasOwnProperty(h)&&f!==b&&(f!=null||b!=null)&&(h==="selected"?(f!==b&&(we=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):Ce(e,t,h,f,n,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)f=a[k],a.hasOwnProperty(k)&&f!=null&&!n.hasOwnProperty(k)&&Ce(e,t,k,null,n,f);for(g in n)if(f=n[g],b=a[g],n.hasOwnProperty(g)&&f!==b&&(f!=null||b!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(R(137,t));break;default:Ce(e,t,g,f,n,b)}return;default:if(Am(t)){for(var M in a)f=a[M],a.hasOwnProperty(M)&&f!==void 0&&!n.hasOwnProperty(M)&&pm(e,t,M,void 0,n,f);for($ in n)f=n[$],b=a[$],!n.hasOwnProperty($)||f===b||f===void 0&&b===void 0||pm(e,t,$,f,n,b);return}}for(var w in a)f=a[w],a.hasOwnProperty(w)&&f!=null&&!n.hasOwnProperty(w)&&Ce(e,t,w,null,n,f);for(x in n)f=n[x],b=a[x],!n.hasOwnProperty(x)||f===b||f==null&&b==null||Ce(e,t,x,f,n,b)}function Bb(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function N5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],s=o.transferSize,c=o.initiatorType,u=o.duration;if(s&&u&&Bb(c)){for(c=0,u=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>u)break;var $=h.transferSize,x=h.initiatorType;$&&Bb(x)&&(h=h.responseEnd,c+=$*(h<u?1:(u-g)/(h-g)))}if(--n,t+=8*(s+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var gm=null,fm=null;function Ls(e){return e.nodeType===9?e:e.ownerDocument}function Lb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Uw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function qw(e,t,a,n){return a=Ls(a).createElement(e),a[St]=n,a[ta]=t,Ct(a,e,t),yt(a),a}function bm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var dh=null;function S5(){var e=window.event;return e&&e.type==="popstate"?e===dh?!1:(dh=e,!0):(dh=null,!1)}var fp=typeof setTimeout=="function"?setTimeout:void 0,T5=typeof clearTimeout=="function"?clearTimeout:void 0,jb=typeof Promise=="function"?Promise:void 0,Gb=typeof requestAnimationFrame=="function"?requestAnimationFrame:fp,k5=typeof queueMicrotask=="function"?queueMicrotask:typeof jb<"u"?function(e){return jb.resolve(null).then(e).catch(E5)}:fp;function E5(e){setTimeout(function(){throw e})}function yi(e){return e==="head"}function Yb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),xr(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")mh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,mh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,u=s.nodeName;s[Fs]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&mh(e.ownerDocument.body);a=o}while(a);xr(t)}function Xb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Bw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var s=t[o];0<s.width&&0<s.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Lw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function jw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function vm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return jw(t,a,e)}function C5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return jw(t,a,e)}function z5(e){return e.documentElement.clientHeight}function A5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function R5(e,t,a,n,o,s,c,u,h){var g=t.nodeType===9?t:t.ownerDocument;try{var $=g.startViewTransition({update:function(){var f=g.defaultView,b=f.navigation&&f.navigation.transition,C=g.fonts.status;n();var k=[];if(C==="loaded"&&(z5(g),g.fonts.status==="loading"&&k.push(g.fonts.ready)),C=k.length,e!==null)for(var M=e.suspenseyImages,w=0,y=0;y<M.length;y++){var v=M[y];if(!v.complete){var S=v.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<f.innerHeight&&S.left<f.innerWidth){if(w+=t0(v),w>zc){k.length=C;break}v=new Promise(A5.bind(v)),k.push(v)}}}if(0<k.length)return f=Promise.race([Promise.all(k),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),(b?Promise.allSettled([b.finished,f]):f).then(s,s);if(o(),b)return b.finished.then(s,s);s()},types:a});g.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),b=0;b<f.length;b++){var C=f[b],k=C.effect,M=k.pseudoElement;if(M!=null&&M.startsWith("::view-transition")){x.push(C),C=k.getKeyframes();for(var w=M=void 0,y=!0,v=0;v<C.length;v++){var S=C[v],O=S.width;if(M===void 0)M=O;else if(M!==O){y=!1;break}if(O=S.height,w===void 0)w=O;else if(w!==O){y=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}y&&M!==void 0&&w!==void 0&&(k.setKeyframes(C),y=getComputedStyle(k.target,k.pseudoElement),y.width!==M||y.height!==w)&&(y=C[0],y.width=M,y.height=w,y=C[C.length-1],y.width=M,y.height=w,k.setKeyframes(C))}}c()},function(f){g.__reactViewTransition===$&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),c()}}),$.finished.finally(function(){for(var f=0;f<x.length;f++)x[f].cancel();g.__reactViewTransition===$&&(g.__reactViewTransition=null),u()}),$}catch{return n(),o(),c(),null}}function Bi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Bi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:De({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Bi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var s=a[o].effect;s!==null&&s.target===e&&s.pseudoElement===t&&n.push(a[o])}return n};Bi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Gw(e){return{name:e,group:new Bi("group",e),imagePair:new Bi("image-pair",e),old:new Bi("old",e),new:new Bi("new",e)}}function ga(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ga.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(Yw(s,e,t,a)===-1){var c=this,u=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(u=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=vr(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:u,cleanup:o}),ea(this._fragmentFiber.child,!1,M5,e,u,n)}this._eventListeners=s}};function M5(e,t,a,n){return dt(e).addEventListener(t,a,n),!1}ga.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=Yw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var s=o.cleanup;o=vr(o.optionsOrUseCapture),ea(this._fragmentFiber.child,!1,O5,e,a,o),n.splice(t,1),s!==null&&s()}};function O5(e,t,a,n){return dt(e).removeEventListener(t,a,n),!1}function vr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Qb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Yw(e,t,a,n){if(e.length===0)return-1;n=Qb(n);for(var o=0;o<e.length;o++){var s=e[o];if(s.type===t&&s.listener===a&&Qb(s.optionsOrUseCapture)===n)return o}return-1}ga.prototype.dispatchEvent=function(e){var t=to(this._fragmentFiber);if(t===null)return!0;t=dt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var s=a[o];n.addEventListener(s.type,s.attachedListener,vr(s.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)s=a[o],n.removeEventListener(s.type,s.attachedListener,vr(s.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ga.prototype.focus=function(e){ea(this._fragmentFiber.child,!0,Xw,e,void 0,void 0)};function Xw(e,t){return e.tag===6?!1:(e=dt(e),Y5(e,t))}ga.prototype.focusLast=function(e){var t=[];ea(this._fragmentFiber.child,!0,bp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Xw(t[a],e);a--);};function bp(e,t){return t.push(e),!1}ga.prototype.blur=function(){var e=to(this._fragmentFiber);e!==null&&(e=dt(e),e=Ls(e).activeElement,e!==null&&ea(this._fragmentFiber.child,!1,V5,e,void 0,void 0))};function V5(e,t){return e.tag===6?!1:(e=dt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ga.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),ea(this._fragmentFiber.child,!1,D5,e,void 0,void 0)};function D5(e,t){return e.tag===6||(e=dt(e),t.observe(e)),!1}ga.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),ea(this._fragmentFiber.child,!1,_5,e,void 0,void 0);for(var a=t=0;a<Ga.length;a++){var n=Ga[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Ga[t++]=n}Ga.length=t}};function _5(e,t){return e.tag===6||(e=dt(e),t.unobserve(e)),!1}var Ga=[],hh=!1;function H5(e,t,a){Ga.push({fragmentInstance:e,observer:t,instance:a}),hh||(hh=!0,X5(function(){hh=!1;var n=Ga;Ga=[];for(var o=0;o<n.length;o++){var s=n[o];s.observer.unobserve(s.instance)}}))}ga.prototype.getClientRects=function(){var e=[];return ea(this._fragmentFiber.child,!1,I5,e,void 0,void 0),e};function I5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=dt(e),t.push.apply(t,e.getClientRects());return!1}ga.prototype.getRootNode=function(e){var t=to(this._fragmentFiber);return t===null?this:dt(t).getRootNode(e)};ga.prototype.compareDocumentPosition=function(e){var t=to(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];ea(this._fragmentFiber.child,!1,bp,a,void 0,void 0);var n=dt(t);if(a.length===0){if(a=n,kf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=pv(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=dt(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=dt(a[0]),o=dt(a[a.length-1]);var s=kf(this._fragmentFiber)?t.parentElement:n;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),u=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||u&Node.DOCUMENT_POSITION_CONTAINED_BY;return u=n&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&u&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||s&&o===e||h||u?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!s&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||U5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function U5(e,t,a,n,o){var s=qi(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=o.ownerDocument,o===s||o===s.documentElement||o===s.body;e:{for(s=t,t=to(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=gh(a,s,Ef),t===null?t=!1:(ea(t,!0,gx,s,a),s=Lo,Lo=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===n)&&(t=gh(n,s,Ef),t===null?t=!1:(ea(t,!0,fx,s,n),s=Lo,ph=Lo=null,t=s!==null)),t):!1}function Zb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ga.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(R(566));var t=[];ea(this._fragmentFiber.child,!1,bp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=pv(this._fragmentFiber);if(n=a?n[1]||n[0]||to(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=dt(n),Zb(e,a);return}if(n=dt(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=dt(o),Zb(o,a)):dt(o).scrollIntoView(e),n+=a?-1:1}};function q5(e,t){return e=dt(e),Qw(e,t),!1}function Qw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function Zw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,vr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,u=0;u<Ga.length;u++){var h=Ga[u];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(Ga[c++]=h)}Ga.length=c,s.observe(e)}),Qw(e,t))}function B5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,vr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?H5(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function ym(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":ym(a),lu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function L5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Fs])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=za(e.nextSibling),e===null)break}return null}function j5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=za(e.nextSibling),e===null))return null;return e}function Kw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=za(e.nextSibling),e===null))return null;return e}function wm(e){return e.data==="$?"||e.data==="$~"}function vp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function G5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function za(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var $m=null;function Kb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return za(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Jb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function Y5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function X5(e){Gb(function(){Gb(function(t){return e(t)})})}function Jw(e,t,a){switch(t=Ls(a),e){case"html":if(e=t.documentElement,!e)throw Error(R(452));return e;case"head":if(e=t.head,!e)throw Error(R(453));return e;case"body":if(e=t.body,!e)throw Error(R(454));return e;default:throw Error(R(451))}}function Fw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&Ce(e,t,n,null,$5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===sn&&(e.onclick=null),lu(e)}function mh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);lu(e)}var Aa=new Map,Fb=new Set;function js(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var _n=Ne.d;Ne.d={f:Q5,r:Z5,D:K5,C:J5,L:F5,m:P5,X:e2,S:W5,M:t2};function Q5(){var e=_n.f(),t=xu();return e||t}function Z5(e){var t=Sr(e);t!==null&&t.tag===5&&t.type==="form"?Dy(t):_n.r(e)}var Cr=typeof document>"u"?null:document;function Pw(e,t,a){var n=Cr;if(n&&typeof t=="string"&&t){var o=ka(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Fb.has(o)||(Fb.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),Ct(t,"link",e),yt(t),n.head.appendChild(t)))}}function K5(e){_n.D(e),Pw("dns-prefetch",e,null)}function J5(e,t){_n.C(e,t),Pw("preconnect",e,t)}function F5(e,t,a){_n.L(e,t,a);var n=Cr;if(n&&e&&t){var o='link[rel="preload"][as="'+ka(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+ka(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+ka(a.imageSizes)+'"]')):o+='[href="'+ka(e)+'"]';var s=o;switch(t){case"style":s=yr(e);break;case"script":s=zr(e)}if(!(Aa.has(s)||(e=De({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Aa.set(s,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(nl(s))||t==="script"&&n.querySelector(il(s))))){var c=n.createElement("link");Ct(c,"link",e),t==="style"&&(c[_c]=!0,c.onload=c.onerror=function(){Ev(c)}),yt(c),n.head.appendChild(c)}}}function P5(e,t){_n.m(e,t);var a=Cr;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+ka(n)+'"][href="'+ka(e)+'"]',s=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=zr(e)}if(!Aa.has(s)&&(e=De({rel:"modulepreload",href:e},t),Aa.set(s,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(il(s)))return}n=a.createElement("link"),Ct(n,"link",e),yt(n),a.head.appendChild(n)}}}function W5(e,t,a){_n.S(e,t,a);var n=Cr;if(n&&e){var o=er(n).hoistableStyles,s=yr(e);t=t||"default";var c=o.get(s);if(!c){var u={loading:0,preload:null};if(c=n.querySelector(nl(s)))u.loading=5;else{e=De({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Aa.get(s))&&yp(e,a);var h=c=n.createElement("link");yt(h),Ct(h,"link",e),h._p=new Promise(function(g,$){h.onload=g,h.onerror=$}),h.addEventListener("load",function(){u.loading|=1}),h.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Ec(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:u},o.set(s,c)}}}function e2(e,t){_n.X(e,t);var a=Cr;if(a&&e){var n=er(a).hoistableScripts,o=zr(e),s=n.get(o);s||(s=a.querySelector(il(o)),s||(e=De({src:e,async:!0},t),(t=Aa.get(o))&&wp(e,t),s=a.createElement("script"),yt(s),Ct(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(o,s))}}function t2(e,t){_n.M(e,t);var a=Cr;if(a&&e){var n=er(a).hoistableScripts,o=zr(e),s=n.get(o);s||(s=a.querySelector(il(o)),s||(e=De({src:e,async:!0,type:"module"},t),(t=Aa.get(o))&&wp(e,t),s=a.createElement("script"),yt(s),Ct(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(o,s))}}function Pb(e,t,a,n){var o=(o=ni.current)?js(o):null;if(!o)throw Error(R(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=yr(a.href),t=er(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=yr(a.href);var s=er(o).hoistableStyles,c=s.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=o.querySelector(nl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Aa.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Aa.set(e,s)),a2(o,e,s,c.state))),t&&n===null)throw Error(R(528,""));return c}if(t&&n!==null)throw Error(R(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=zr(a),t=er(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(R(444,e))}}function yr(e){return'href="'+ka(e)+'"'}function nl(e){return'link[rel="stylesheet"]['+e+"]"}function Ww(e){return De({},e,{"data-precedence":e.precedence,precedence:null})}function a2(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[_c]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[_c]=!0,t.onload=t.onerror=Ev.bind(null,t),Ct(t,"link",a),yt(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function zr(e){return'[src="'+ka(e)+'"]'}function il(e){return"script[async]"+e}function Wb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+ka(a.href)+'"]');if(n)return t.instance=n,yt(n),n;var o=De({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),yt(n),Ct(n,"style",o),Ec(n,a.precedence,e),t.instance=n;case"stylesheet":o=yr(a.href);var s=e.querySelector(nl(o));if(s)return t.state.loading|=4,t.instance=s,yt(s),s;n=Ww(a),(o=Aa.get(o))&&yp(n,o),s=(e.ownerDocument||e).createElement("link"),yt(s);var c=s;return c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),Ct(s,"link",n),t.state.loading|=4,Ec(s,a.precedence,e),t.instance=s;case"script":return s=zr(a.src),(o=e.querySelector(il(s)))?(t.instance=o,yt(o),o):(n=a,(o=Aa.get(s))&&(n=De({},a),wp(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),yt(o),Ct(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(R(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,Ec(n,a.precedence,e));return t.instance}function Ec(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,s=o,c=0;c<n.length;c++){var u=n[c];if(u.dataset.precedence===t)s=u;else if(s!==o)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function yp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function wp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Cc=null;function ev(e,t,a){if(Cc===null){var n=new Map,o=Cc=new Map;o.set(a,n)}else o=Cc,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var s=a[o];if(!(s[Fs]||s[St]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var u=n.get(c);u?u.push(s):n.set(c,[s])}}return n}function xm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function n2(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function tv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function e0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function t0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function av(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=t0(t),e.suspenseyImages.push(t)),e=r2.bind(e),t.decode().then(e,e))}function i2(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=yr(n.href),s=t.querySelector(nl(o));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Gs.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,yt(s);return}s=t.ownerDocument||t,n=Ww(n),(o=Aa.get(o))&&yp(n,o),s=s.createElement("link"),yt(s);var c=s;c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),Ct(s,"link",n),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Gs.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var zc=0;function o2(e,t){return e.stylesheets&&e.count===0&&Ac(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&Ac(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&zc===0&&(zc=62500*N5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Ac(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>zc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function a0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Ac(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Gs(){this.count--,a0(this)}function r2(){this.imgCount--,a0(this)}var ou=null;function Ac(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ou=new Map,t.forEach(s2,e),ou=null,Gs.call(e))}function s2(e,t){if(!(t.state.loading&4)){var a=ou.get(e);if(a)var n=a.get(null);else{a=new Map,ou.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<o.length;s++){var c=o[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}o=t.instance,c=o.getAttribute("data-precedence"),s=a.get(c)||n,s===n&&a.set(null,o),a.set(c,o),this.count++,n=Gs.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),s?s.parentNode.insertBefore(o,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var wr={$$typeof:rn,Provider:null,Consumer:null,_currentValue:Li,_currentValue2:Li,_threadCount:0};function l2(e,t,a,n,o,s,c,u,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Bd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Bd(0),this.hiddenUpdates=Bd(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function n0(e,t,a,n,o,s,c,u,h,g,$,x){return e=new l2(e,t,a,c,h,g,$,x,u),t=1,s===!0&&(t|=24),s=Pt(3,null,null,t),e.current=s,s.stateNode=e,t=qm(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:n,isDehydrated:a,cache:t},jm(s),e}function i0(e){return e?(e=Jo,e):Jo}function o0(e,t,a,n,o,s){o=i0(o),n.context===null?n.context=o:n.pendingContext=o,n=oi(t),n.payload={element:a},s=s===void 0?null:s,s!==null&&(n.callback=s),a=ri(e,n,t),a!==null&&(Wt(a,e,t),xs(a,e,t))}function nv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function $p(e,t){nv(e,t),(e=e.alternate)&&nv(e,t)}function r0(e){if(e.tag===13||e.tag===31){var t=io(e,67108864);t!==null&&Wt(t,e,67108864),$p(e,67108864)}}function iv(e){if(e.tag===13||e.tag===31){var t=ma();t=Cm(t);var a=io(e,t);a!==null&&Wt(a,e,t),$p(e,t)}}var $r=!0;function c2(e,t,a,n){var o=ee.T;ee.T=null;var s=Ne.p;try{Ne.p=2,xp(e,t,a,n)}finally{Ne.p=s,ee.T=o}}function u2(e,t,a,n){var o=ee.T;ee.T=null;var s=Ne.p;try{Ne.p=8,xp(e,t,a,n)}finally{Ne.p=s,ee.T=o}}function xp(e,t,a,n){if($r){var o=Nm(n);if(o===null)uh(e,t,n,ru,a),ov(e,n);else if(h2(o,e,t,a,n))n.stopPropagation();else if(ov(e,n),t&4&&-1<d2.indexOf(e)){for(;o!==null;){var s=Sr(o);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=Hi(s.pendingLanes);if(c!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;c;){var h=1<<31-ha(c);u.entanglements[1]|=h,c&=~h}pn(s),(xe&6)===0&&(eu=ua()+500,al(0,!1))}}break;case 31:case 13:u=io(s,2),u!==null&&Wt(u,s,2),xu(),$p(s,2)}if(s=Nm(n),s===null&&uh(e,t,n,ru,a),s===o)break;o=s}o!==null&&n.stopPropagation()}else uh(e,t,n,null,a)}}function Nm(e){return e=Rm(e),Np(e)}var ru=null;function Np(e){if(ru=null,e=qi(e),e!==null){var t=Qs(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=dv(t),e!==null)return e;e=null}else if(a===31){if(e=hv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return ru=e,null}function s0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Tx()){case vv:return 2;case yv:return 8;case Dc:case kx:return 32;case wv:return 268435456;default:return 32}default:return 32}}var Sm=!1,ui=null,di=null,hi=null,Ys=new Map,Xs=new Map,Jn=[],d2="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ov(e,t){switch(e){case"focusin":case"focusout":ui=null;break;case"dragenter":case"dragleave":di=null;break;case"mouseover":case"mouseout":hi=null;break;case"pointerover":case"pointerout":Ys.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Xs.delete(t.pointerId)}}function ds(e,t,a,n,o,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:s,targetContainers:[o]},t!==null&&(t=Sr(t),t!==null&&r0(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function h2(e,t,a,n,o){switch(t){case"focusin":return ui=ds(ui,e,t,a,n,o),!0;case"dragenter":return di=ds(di,e,t,a,n,o),!0;case"mouseover":return hi=ds(hi,e,t,a,n,o),!0;case"pointerover":var s=o.pointerId;return Ys.set(s,ds(Ys.get(s)||null,e,t,a,n,o)),!0;case"gotpointercapture":return s=o.pointerId,Xs.set(s,ds(Xs.get(s)||null,e,t,a,n,o)),!0}return!1}function l0(e){var t=qi(e.target);if(t!==null){var a=Qs(t);if(a!==null){if(t=a.tag,t===13){if(t=dv(a),t!==null){e.blockedOn=t,Rf(e.priority,function(){iv(a)});return}}else if(t===31){if(t=hv(a),t!==null){e.blockedOn=t,Rf(e.priority,function(){iv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Rc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Nm(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Eh=n,a.target.dispatchEvent(n),Eh=null}else return t=Sr(a),t!==null&&r0(t),e.blockedOn=a,!1;t.shift()}return!0}function rv(e,t,a){Rc(e)&&a.delete(t)}function m2(){Sm=!1,ui!==null&&Rc(ui)&&(ui=null),di!==null&&Rc(di)&&(di=null),hi!==null&&Rc(hi)&&(hi=null),Ys.forEach(rv),Xs.forEach(rv)}function dc(e,t){e.blockedOn===t&&(e.blockedOn=null,Sm||(Sm=!0,ht.unstable_scheduleCallback(ht.unstable_NormalPriority,m2)))}var hc=null;function sv(e){hc!==e&&(hc=e,ht.unstable_scheduleCallback(ht.unstable_NormalPriority,function(){hc===e&&(hc=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(Np(n||a)===null)continue;break}var s=Sr(a);s!==null&&(e.splice(t,3),t-=3,jh(s,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function xr(e){function t(h){return dc(h,e)}ui!==null&&dc(ui,e),di!==null&&dc(di,e),hi!==null&&dc(hi,e),Ys.forEach(t),Xs.forEach(t);for(var a=0;a<Jn.length;a++){var n=Jn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Jn.length&&(a=Jn[0],a.blockedOn===null);)l0(a),a.blockedOn===null&&Jn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],s=a[n+1],c=o[ta]||null;if(typeof s=="function")c||sv(a);else if(c){var u=null;if(s&&s.hasAttribute("formAction")){if(o=s,c=s[ta]||null)u=c.formAction;else if(Np(o)!==null)continue}else u=c.action;typeof u=="function"?a[n+1]=u:(a.splice(n,3),n-=3),sv(a)}}}function c0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Sp(e){this._internalRoot=e}Tu.prototype.render=Sp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(R(409));var a=t.current,n=ma();o0(a,n,e,t,null,null)};Tu.prototype.unmount=Sp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;o0(e.current,2,null,e,null,null),xu(),t[Nr]=null}};function Tu(e){this._internalRoot=e}Tu.prototype.unstable_scheduleHydration=function(e){if(e){var t=kv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Jn.length&&t!==0&&t<Jn[a].priority;a++);Jn.splice(a,0,e),a===0&&l0(e)}};var lv=cv.version;if(lv!=="19.3.0")throw Error(R(527,lv,"19.3.0"));Ne.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(R(188)):(e=Object.keys(e).join(","),Error(R(268,e)));return e=px(t),e=e!==null?mv(e):null,e=e===null?null:e.stateNode,e};var p2={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ee,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(hs=__REACT_DEVTOOLS_GLOBAL_HOOK__,!hs.isDisabled&&hs.supportsFiber))try{Zs=hs.inject(p2),da=hs}catch{}var hs;ku.createRoot=function(e,t){if(!uv(e))throw Error(R(299));var a=!1,n="",o=jy,s=Gy,c=Yy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=n0(e,1,!1,null,null,a,n,null,o,s,c,c0),e[Nr]=t.current,gp(e),new Sp(t)};ku.hydrateRoot=function(e,t,a){if(!uv(e))throw Error(R(299));var n=!1,o="",s=jy,c=Gy,u=Yy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(u=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=n0(e,1,!0,t,a??null,n,o,h,s,c,u,c0),t.context=i0(null),a=t.current,n=ma(),n=Cm(n),o=oi(n),o.callback=null,ri(a,o,n),a=n,t.current.lanes=a,Js(t,a),pn(t),e[Nr]=t.current,gp(e),new Tu(t)};ku.version="19.3.0"});var m0=Pa((OS,h0)=>{"use strict";function d0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(d0)}catch(e){console.error(e)}}d0(),h0.exports=u0()});var R0=Pa(Au=>{"use strict";var $2=Symbol.for("react.transitional.element"),x2=Symbol.for("react.fragment");function A0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:$2,type:e,key:n,ref:t!==void 0?t:null,props:a}}Au.Fragment=x2;Au.jsx=A0;Au.jsxs=A0});var Ep=Pa((jS,M0)=>{"use strict";M0.exports=R0()});var m=Ul(Bl()),t1=Ul(m0());function g2(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],s=[];for(let c=0;c<a.length;c++){let u=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(u)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!u.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&s.push(g),o=[]}else o.push(u)}if(!t){let c=o.join(`
`).trim();c&&s.push(c)}return s}var f2=['"',"'","\u201D","\u2019","\xBB","\u300D"],b2=['"',"'","\u201C","\u2018","\xAB","\u300C"];function p0(e){let t=e.trim();return f2.includes(t.slice(-1))&&b2.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function g0(e,t){let a=g2(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],s=[],c=[],u=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),s.push(u),c.push(g.expression??null),u=[];continue}let $={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?s[s.length-1].push($):u.push($)}return o.length===0?n():{paragraphs:o,asides:s,expressions:c}}var v2="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function ro(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(v2,"g"),o=0,s,c=u=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+u};return}a.push({kind:"text",text:u})};for(;(s=n.exec(e))!==null;)s.index>o&&c(e.slice(o,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:ro(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:ro(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:ro(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:ro(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:ro(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:ro(s[10]??s[11],t+1)}),o=s.index+s[0].length;return o<e.length&&c(e.slice(o)),a}function f0(e){return ro(e,0)}function Hn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function b0(e){return e===null||typeof e=="string"}function v0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Eu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function y2(e){return e===null?!0:Hn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function w2(e){if(!Hn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Eu(e.capabilities)||!Hn(e.presentation)||!Hn(e.occupancy)||!Hn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return y2(t.image)&&v0(t.x)&&v0(t.y)&&typeof a.playerHome=="boolean"&&b0(a.residentCharacterId)&&b0(a.homeKind)&&typeof n.condition=="string"&&Eu(n.upgrades)&&Eu(n.furniture)&&Eu(n.publicFacts)&&typeof n.updatedAt=="string"}function y0(e){if(!Hn(e)||!Hn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(w2),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(s=>Hn(s)&&typeof s.id=="string"&&Hn(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function w0(e,t,a){return e==="Enter"&&!t&&!a}function Cu(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function $0(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function Ar(e,t){return t?.roomId===e}function x0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function N0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function S0(e,t,a){let n=a==="front"?"front":"side",o=e.find(s=>s.view===n&&s.label===t)??e.find(s=>s.view===n&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function T0(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<n&&Math.abs(s.y-e.y)<o)}function k0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var wi=(e,t,a)=>Math.min(a,Math.max(t,e));function zu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Tp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,zu(e,t)),s=e.width*n*o,c=e.height*n*o,u=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:wi(u,t.width-s,0),top:c<=t.height?(t.height-c)/2:wi(h,t.height-c,0),width:s,height:c}}function E0(e,t,a,n,o,s){let c=Tp(e,t,a);if(!c.width||!c.height)return a;let u=zu(e,t),h=wi(a.zoom*s,u,Math.max(4,u*2)),g=h/Math.max(a.zoom,u),$=c.width*g,x=c.height*g,f=(n.x-c.left)/c.width,b=(n.y-c.top)/c.height,C=o.x-f*$,k=o.y-b*x;return{zoom:h,centerX:wi((t.width/2-C)/$,0,1),centerY:wi((t.height/2-k)/x,0,1)}}function C0(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((wi(e,a,n)-a)/(n-a))}function z0(e,t){return t?Math.max(1,e):e}function kp(e,t,a){let n=Math.min(90,t.width/2),o=64,s=116,c=e.left+a.x*e.width,u=e.top+a.y*e.height,h=u+o,g=h+s<=t.height?h:u-o-s;return{left:wi(c,n,t.width-n),top:wi(g,0,Math.max(0,t.height-s))}}var r=Ul(Ep()),i="marinara-capability-villages",O0="marinara-capability-villages-styles",N2="/api/villages",S2=.7,Hp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Cp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),T2={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},uo=e=>Hp.find(t=>t.value===e),k2=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,V0={roads:"auto",structures:"auto",water:"auto"},Ru=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],D0=1,zp=3,E2={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Ap="__villages_image_disabled__",Vu=["neutral","happy","sad","angry","surprised","thinking"];function _0(e,t,a,n,o=!1,s=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function C2(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var a1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function Mu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function z2(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${o}m left`:`${o}m left`}function A2({library:e,busy:t,onRefresh:a,onForget:n}){let[o,s]=(0,m.useState)("all"),[c,u]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[f,b]=(0,m.useState)(""),C=Date.now(),k=(v,S)=>(!h.trim()||`${v} ${S.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(O=>O.id===c)),M=(e?.recollections??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),y=async(v,S)=>{try{let O=await V(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:O.visit,lineIds:S}),b("")}catch(O){x(null),b(U(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${i}-memory-library`,children:[(0,r.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,S])=>(0,r.jsx)("button",{type:"button","data-active":o===v,onClick:()=>s(v),children:S},v))}),(0,r.jsx)("input",{type:"search",value:h,onChange:v=>g(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:v=>u(v.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,r.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&M.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:M.map(v=>{let S=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:z2(v.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Mu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Mu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,r.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{y(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:w.map(v=>(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:v.memoryCategory?a1[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[v.dateLabel,Ip(v)?` \xB7 ${Ip(v)}`:""]})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Mu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Mu(v.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[v.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(o!=="durable"&&M.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,$?(0,r.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:v.name||"Player"}),(0,r.jsxs)("small",{children:[Du(v.at)," \xB7 heard by"," ",v.heardBy.map(S=>$.visit.participants.find(O=>O.characterId===S)?.name??S).join(", ")||"no one"]})]}),Mr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Du(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":s1.format(t)}function Ip(e){return Du(e.occurredAt)}function R2(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function H0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Rp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var M2=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function O2(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let s=Math.floor((Date.now()-n)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${M2.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function V2(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?ot(a,t.spaceClass).image:null)?.url??"":""}var Up=class extends m.Component{constructor(){super(...arguments);Yg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},D2=`
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
.${i}-root {
  --${i}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${i}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${i}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${i}-pad);
  color: var(--foreground);
}
.${i}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${i}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${i}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${i}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${i}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${i}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${i}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${i}-avatar {
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
.${i}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
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
.${i}-person { width: 1.5em; height: 1.5em; }
.${i}-villager-name { font-size: .8125rem; font-weight: 600; }
.${i}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${i}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${i}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-actions { display: flex; align-items: center; gap: .625rem; }
.${i}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${i}-button:hover { border-color: var(--primary); color: var(--primary); }
.${i}-button:disabled { opacity: .6; cursor: default; }
.${i}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${i}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${i}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${i}-menu-group > .${i}-panel-title { margin: 0; }
.${i}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${i}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${i}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${i}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${i}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${i}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${i}-roster-row > .${i}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${i}-status { font-size: .75rem; color: var(--muted-foreground); }
.${i}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${i}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${i}-tile:hover { border-color: var(--primary); }
.${i}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${i}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${i}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${i}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${i}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${i}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${i}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${i}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${i}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${i}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${i}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${i}-picker-item[data-resident="true"] { opacity: .6; }
.${i}-picker-text { flex: 1 1 auto; min-width: 0; }
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
.${i}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${i}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${i}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${i}-room-screen > .${i}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${i}-room-screen .${i}-chat-scene { pointer-events: none; }
.${i}-room-screen .${i}-chat-head {
  align-items: center;
}
.${i}-room-screen .${i}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${i}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${i}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${i}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${i}-room-star > span:nth-child(2) { flex: 1; }
.${i}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${i}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${i}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${i}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${i}-chat, .${i}-chat[data-open="true"] { transition: none; }
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
.${i}-chat > .${i}-chat-stage,
.${i}-chat > .${i}-chat-activities,
.${i}-chat > .${i}-chat-vn,
.${i}-chat > .${i}-chat-confirm,
.${i}-chat > .${i}-error,
.${i}-chat > .${i}-room-error,
.${i}-chat > .${i}-composer,
.${i}-chat > .${i}-chat-ended { position: relative; z-index: 1; }
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
.${i}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${i}-chat-head > * { pointer-events: auto; }
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
.${i}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${i}-chat-menu-anchor { position: relative; display: inline-flex; }
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
.${i}-chat-menu-button {
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
.${i}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${i}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${i}-chat-tool:hover {
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
.${i}-chat-menu {
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
.${i}-chat-menu-note {
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
.${i}-chat-menu .${i}-button { width: 100%; justify-content: flex-start; text-align: left; }
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
.${i}-chat-debug {
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
.${i}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${i}-chat-end > .${i}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${i}-chat-end > .${i}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${i}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about \u2014 a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button \u2014 and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${i}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${i}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${i}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${i}-image-recommendation { color: #d68a18; }
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
.${i}-chat[data-ended="true"] .${i}-composer { display: none; }
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
.${i}-chat[data-greeting="writing"] .${i}-composer { display: none; }
.${i}-chat[data-greeting="failed"] .${i}-composer { display: none; }
.${i}-chat-ended {
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
.${i}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${i}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${i}-chat-scene-placeholder {
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
.${i}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${i}-chat-vignette {
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
.${i}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${i}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${i}-chat-activity {
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
.${i}-chat-vn {
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
.${i}-chat-figure {
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
.${i}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${i}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${i}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${i}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
.${i}-sprite-editor { min-width: 0; border-top: 1px solid var(--border); padding: 1rem .125rem .25rem; margin-top: .625rem; display: grid; gap: .875rem; }
.${i}-sprite-heading, .${i}-sprite-section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .5rem 1rem; }
.${i}-sprite-heading h3 { margin: 0; font-size: 1.1rem; }
.${i}-sprite-heading p { margin: .25rem 0 0; color: var(--muted-foreground); font-size: .8125rem; }
.${i}-sprite-count { border: 1px solid var(--border); border-radius: 99rem; padding: .25rem .625rem; white-space: nowrap; font-size: .75rem; }
.${i}-sprite-views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.${i}-sprite-view { display: grid; gap: .2rem; min-width: 0; text-align: left; border: 1px solid var(--border); border-radius: .7rem; padding: .7rem .8rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; }
.${i}-sprite-view span { color: var(--muted-foreground); font-size: .75rem; }
.${i}-sprite-view[data-active="true"], .${i}-sprite-choice[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--popover)); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-sprite-section-head { color: var(--foreground); font-size: .8125rem; }
.${i}-sprite-section-head span { color: var(--muted-foreground); }
.${i}-sprite-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: .5rem; }
.${i}-sprite-choice { display: grid; justify-items: center; gap: .15rem; min-width: 0; border: 1px solid var(--border); border-radius: .65rem; padding: .4rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; text-transform: capitalize; }
.${i}-sprite-choice-art { display: grid; place-items: center; width: 100%; height: 6rem; border-radius: .4rem; background: color-mix(in srgb, var(--muted) 75%, transparent); color: var(--muted-foreground); font-size: 1.3rem; overflow: hidden; }
.${i}-sprite-choice-art img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${i}-sprite-choice small { color: var(--muted-foreground); font-size: .6875rem; text-transform: none; }
.${i}-sprite-selected { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem .75rem; font-size: .8125rem; text-transform: capitalize; }
.${i}-sprite-selected span { color: var(--muted-foreground); text-transform: none; }
.${i}-sprite-editor label { display: grid; gap: .25rem; font-size: .8125rem; }
.${i}-sprite-editor label.${i}-row { display: flex; align-items: center; }
.${i}-sprite-editor textarea { min-height: 5rem; }
.${i}-sprite-actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.${i}-sprite-candidate { display: grid; gap: .75rem; border: 1px solid var(--border); border-radius: .7rem; padding: .75rem; background: var(--popover); }
.${i}-sprite-candidate-views { display: flex; flex-wrap: wrap; gap: .75rem; }
.${i}-sprite-candidate-views > div { display: grid; gap: .25rem; justify-items: center; flex: 0 1 12rem; min-width: 0; font-size: .75rem; color: var(--muted-foreground); }
.${i}-sprite-candidate-views img { display: block; width: 100%; height: 14rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${i}-sprite-mirrored { transform: scaleX(-1); }
.${i}-sprite-more { border-top: 1px solid var(--border); padding-top: .5rem; }
.${i}-sprite-more summary { cursor: pointer; font-size: .8125rem; }
.${i}-sprite-more > .${i}-row { margin-top: .75rem; }
.${i}-sprite-view:focus-visible, .${i}-sprite-choice:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
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
.${i}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${i}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${i}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${i}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${i}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${i}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${i}-chat-cast-person > .${i}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${i}-chat-cast-person > span:not(.${i}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${i}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${i}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${i}-chat-cast-rest .${i}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${i}-room-screen .${i}-chat-activities { display: none; }
.${i}-room-screen .${i}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${i}-room-screen .${i}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${i}-room-screen .${i}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${i}-chat-scene-place {
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
.${i}-chat-log {
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
.${i}-chat-tab { display: flex; justify-content: center; }
.${i}-chat-history-toggle {
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
.${i}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${i}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${i}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${i}-chat-history-toggle[aria-expanded="true"] {
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
.${i}-chat-vn-card {
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
.${i}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${i}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${i}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${i}-chat-vn-name {
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
.${i}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${i}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${i}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${i}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${i}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
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
.${i}-chat-vn-label {
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
.${i}-chat-vn-asides {
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
.${i}-chat-vn-aside {
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
.${i}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${i}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${i}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${i}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${i}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${i}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${i}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${i}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${i}-chat-vn-aside[data-register="whisper"] .${i}-chat-vn-aside-text { font-style: italic; }
.${i}-chat-vn-beat {
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
.${i}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${i}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${i}-chat-md-link:hover { opacity: .85; }
.${i}-chat-md-highlight {
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
.${i}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${i}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${i}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${i}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${i}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${i}-chat-vn-button:disabled {
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
.${i}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${i}-chat-spinner {
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
.${i}-visually-hidden {
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
.${i}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
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
.${i}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${i}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${i}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said \u2014 it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${i}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${i}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
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
.${i}-chat-mode-button {
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
.${i}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${i}-chat-mode-button svg { width: 1rem; height: 1rem; }
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
.${i}-chat-modes {
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
.${i}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${i}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${i}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${i}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${i}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${i}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${i}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${i}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave \u2014 see showLeave \u2014 and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${i}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${i}-chat-modes-foot > .${i}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it \u2014 the draft belongs to the drawer, not to this box.
*/
.${i}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${i}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${i}-textarea {
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
.${i}-composer-row { display: flex; }
.${i}-composer-row > .${i}-claim,
.${i}-composer-row > .${i}-chat-input { flex: 1 1 auto; min-width: 0; }
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
.${i}-chat-input {
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
.${i}-chat-input:focus-within {
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
.${i}-chat-input > .${i}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${i}-chat-input > .${i}-textarea {
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
.${i}-chat-input > .${i}-hint { flex: 1 1 auto; min-width: 0; }
.${i}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${i}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-send:disabled { cursor: default; opacity: .45; }
.${i}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${i}-chat-send svg { width: 1rem; height: 1rem; }
.${i}-room-screen .${i}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${i}-room-screen .${i}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${i}-room-screen .${i}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${i}-room-screen .${i}-chat-pending { align-items: center; gap: .5rem; }
.${i}-room-screen .${i}-chat-pending-label { font-size: .75rem; }
.${i}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${i}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${i}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${i}-room-mode:disabled { opacity: .5; cursor: default; }
.${i}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${i}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${i}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${i}-room-error .${i}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${i}-room-screen .${i}-chat[data-opening-error="true"] .${i}-chat-vn { display: none; }
.${i}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${i}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${i}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${i}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${i}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${i}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${i}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${i}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${i}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${i}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${i}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${i}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${i}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${i}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${i}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${i}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${i}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${i}-notice-author { font-weight: 600; color: var(--foreground); }
.${i}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${i}-notice-input {
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
.${i}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${i}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${i}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty \u2014 dashed rather than solid \u2014 so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${i}-place-thumb[data-empty="true"] { border-style: dashed; }
.${i}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${i}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${i}-place-body .${i}-row { margin-top: 0; }
.${i}-place-body .${i}-file { font-size: .625rem; }
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
.${i}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${i}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${i}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${i}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${i}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${i}-venue-body .${i}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${i}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${i}-venue-page, .${i}-venue-editor-page, .${i}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${i}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${i}-venue-hero > .${i}-venue-picture,
.${i}-venue-hero > .${i}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${i}-venue-context, .${i}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${i}-venue-context p, .${i}-venue-card p { margin: 0; }
.${i}-venue-context { align-self: center; }
.${i}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${i}-venue-card .${i}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${i}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${i}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${i}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${i}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${i}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${i}-venue-hero { grid-template-columns: 1fr; }
  .${i}-venue-page .${i}-button,
  .${i}-venue-editor-page .${i}-button,
  .${i}-venue-proposal-page .${i}-button { min-height: 2.5rem; }
}
/* Villages' current UI language: dark navy, blue glass surfaces, violet focus.
   These scoped values can become a selectable theme palette in a later release. */
.${i}-root[data-venue-view="true"] {
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
.${i}-root[data-venue-view="true"] > .${i}-header {
  grid-column: 2; grid-row: 1; align-items: center; padding: 1.25rem 1.5rem .75rem;
}
.${i}-root[data-venue-view="true"] .${i}-title { font-size: clamp(1.35rem, 2.4cqw, 2rem); font-weight: 700; }
.${i}-root[data-venue-view="true"] .${i}-subtitle { color: var(--venue-muted); font-size: .88rem; }
.${i}-root[data-venue-view="true"] .${i}-header .${i}-button,
.${i}-venue-back {
  border: 1px solid #6478c1; border-radius: .7rem; background: #142653;
  color: var(--venue-text); padding: .65rem .9rem; font: inherit; cursor: pointer;
}
.${i}-root[data-venue-view="true"] .${i}-header .${i}-button:hover,
.${i}-venue-back:hover { border-color: #aa92ff; background: #203774; }
.${i}-root[data-venue-view="true"] > .${i}-venue-page { display: contents; }
.${i}-venue-zones {
  grid-column: 1; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: .65rem;
  min-height: 0; overflow-y: auto; padding: 1rem .65rem;
  border-right: 1px solid #314782;
  background: radial-gradient(circle at 30% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${i}-venue-back { min-height: 2.7rem; margin: 0 .1rem 1rem; }
.${i}-venue-zone-tab {
  display: flex; align-items: center; gap: .65rem; min-width: 0; width: 100%;
  border: 1px solid transparent; border-radius: .72rem; padding: .45rem;
  background: transparent; color: var(--venue-text); text-align: left; font: inherit; cursor: pointer;
}
.${i}-venue-zone-tab:hover { background: #253b75; }
.${i}-venue-zone-tab[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  box-shadow: 0 0 0 2px #8756ff, 0 0 1.1rem #683cf977;
}
.${i}-venue-zone-tab:focus-visible, .${i}-venue-back:focus-visible,
.${i}-venue-visit:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${i}-venue-zone-thumb {
  flex: 0 0 3.4rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
  overflow: hidden; border: 1px solid #5570b0; border-radius: .42rem; background: #18254d;
}
.${i}-venue-zone-thumb img { width: 100%; height: 100%; object-fit: cover; }
.${i}-venue-zone-thumb > span { font-size: 1.5rem; color: #b5c3ec; }
.${i}-venue-zone-copy { min-width: 0; }
.${i}-venue-zone-copy strong, .${i}-venue-zone-copy small { display: block; overflow-wrap: anywhere; }
.${i}-venue-zone-copy strong { font-size: .78rem; line-height: 1.3; }
.${i}-venue-zone-copy small { color: var(--venue-muted); font-size: .68rem; line-height: 1.35; }
.${i}-venue-zone-content {
  grid-column: 2; grid-row: 2; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 1fr);
  align-items: start; gap: 1rem; min-width: 0; padding: .75rem 1.5rem 1.5rem;
}
.${i}-venue-zone-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.${i}-venue-artwork { overflow: hidden; border: 1px solid var(--venue-border); border-radius: .85rem; background: #0c1732; }
.${i}-venue-artwork img, .${i}-venue-artwork-empty {
  display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover;
}
.${i}-venue-artwork-empty { display: grid; place-items: center; color: var(--venue-muted); text-align: center; }
.${i}-venue-about, .${i}-venue-zone-context {
  min-width: 0; border: 1px solid var(--venue-border); border-radius: .8rem;
  background: linear-gradient(145deg, #142753, #101e42); padding: 1rem 1.15rem;
}
.${i}-venue-about h2, .${i}-venue-zone-context h2 { margin: 0 0 .55rem; font-size: 1.2rem; }
.${i}-venue-about p, .${i}-venue-zone-context p { margin: 0; color: var(--venue-muted); line-height: 1.6; }
.${i}-venue-more { margin-top: 1rem; border: 1px solid var(--venue-border); border-radius: .6rem; padding: .7rem .9rem; }
.${i}-venue-more summary { cursor: pointer; }
.${i}-venue-more p { margin-top: .65rem; }
.${i}-venue-zone-context { display: flex; flex-direction: column; min-height: min(31rem, 63cqh); }
.${i}-venue-kicker { color: #b9c5ff; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.${i}-venue-zone-stat { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid #29447f; margin-top: 1.1rem; padding: 1rem 0 0; }
.${i}-venue-zone-stat span { color: var(--venue-muted); }
.${i}-venue-zone-stat strong { font-weight: 500; text-align: right; }
.${i}-venue-zone-guidance { margin-top: 1rem !important; font-size: .85rem; }
.${i}-venue-visit {
  width: 100%; min-height: 3.25rem; margin-top: auto; border: 0; border-radius: .55rem;
  background: linear-gradient(100deg, #3156e8, var(--venue-accent));
  color: white; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
}
.${i}-venue-visit:disabled { opacity: .48; cursor: default; }
.${i}-venue-zone-content > .${i}-button { grid-column: 2; justify-self: start; border-color: var(--venue-border); background: var(--venue-panel); color: var(--venue-text); }
.${i}-venue-zone-content > .${i}-error { grid-column: 1 / -1; }
@container (max-width: 48rem) {
  .${i}-root[data-venue-view="true"] { display: flex; flex-direction: column; }
  .${i}-root[data-venue-view="true"] > .${i}-header { order: 0; padding: 1rem; }
  .${i}-root[data-venue-view="true"] > .${i}-venue-page { order: 1; display: flex; flex-direction: column; margin: 0; }
  .${i}-venue-zones { order: 0; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: .7rem; border-right: 0; border-bottom: 1px solid #314782; }
  .${i}-venue-back { flex: 0 0 auto; margin: 0; }
  .${i}-venue-zone-tab { flex: 0 0 11rem; }
  .${i}-venue-zone-content { order: 2; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 1rem; }
  .${i}-venue-zone-main, .${i}-venue-zone-context { width: 100%; box-sizing: border-box; }
  .${i}-venue-zone-context { min-height: 0; gap: .25rem; }
  .${i}-venue-visit { margin-top: 1rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${i}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${i}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${i}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${i}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${i}-story-scope { color: var(--primary); }
/* Villagers \u2192 Memories: a calm library, not a diagnostic table. */
.${i}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${i}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${i}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${i}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${i}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${i}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${i}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${i}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${i}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${i}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${i}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${i}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${i}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${i}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${i}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${i}-memory-layers strong { font-size: .7rem; }
.${i}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${i}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${i}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${i}-memory-health > div { flex: 1; min-width: 0; }
.${i}-memory-health strong { font-size: .72rem; }
.${i}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${i}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${i}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${i}-memory-toolbar input, .${i}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${i}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${i}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${i}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${i}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${i}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${i}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${i}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${i}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${i}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${i}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${i}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${i}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${i}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${i}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${i}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${i}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${i}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${i}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${i}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${i}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${i}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${i}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${i}-memory-reinforced, .${i}-memory-footnote, .${i}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${i}-memory-card-actions button, .${i}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${i}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${i}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${i}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${i}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${i}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${i}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${i}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${i}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${i}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${i}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${i}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${i}-memory-hero { grid-template-columns: 1fr; }
  .${i}-memory-layers { grid-template-columns: 1fr; }
  .${i}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${i}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${i}-memory-section-head > span { display: none; }
}
.${i}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${i}-wish-card p { margin: 0; }
.${i}-wish-card p + p { margin-top: .25rem; }
.${i}-wish-text { color: var(--foreground); font-weight: 600; }
.${i}-wish-tell { color: var(--muted-foreground); }
.${i}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
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
.${i}-agenda-notes { margin: 0 0 .625rem; }
.${i}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${i}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${i}-agenda-notes > summary::marker { content: ""; }
.${i}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${i}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${i}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${i}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

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
.${i}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${i}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${i}-week-toggle::-webkit-details-marker { display: none; }
.${i}-week-toggle::marker { content: ""; }
.${i}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${i}-week-toggle:hover > .${i}-week-head,
.${i}-week[open] > .${i}-week-toggle > .${i}-week-head { color: var(--primary); }
.${i}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${i}-agenda-list { display: grid; gap: .5rem; }
.${i}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${i}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${i}-agenda-switch input { accent-color: var(--primary); }
.${i}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${i}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${i}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${i}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${i}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${i}-agenda-compare section { min-width: 0; }
.${i}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${i}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${i}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${i}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${i}-agenda-blocks strong { font-weight: 600; }
@container ${i} (max-width: 35rem) {
  .${i}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${i}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${i}-agenda-blocks time { grid-row: auto; }
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
.${i}-home {
  gap: calc(var(--${i}-gap) * .75);
  padding: calc(var(--${i}-pad) * .8);
  overflow-y: auto;
}
.${i}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${i}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${i}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${i}-setup-map-viewport > .${i}-stage:not(.${i}-stage-compact) { width: 100%; flex: none; border: 0; }
.${i}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${i}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${i}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${i}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${i}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${i}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
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
.${i}-home-full {
  --${i}-map-wood: .75rem;
  --${i}-map-mat: .5rem;
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
.${i}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${i}-map-wood) + var(--${i}-map-mat) + 1px);
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
.${i}-home-full .${i}-stage {
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
.${i}-home-full .${i}-stage:not([data-shaped="true"]) { width: 100%; }
.${i}-home-full .${i}-canvas {
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
.${i}-home-full .${i}-stage::before,
.${i}-home-full .${i}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${i}-home-full .${i}-stage::before {
  inset: calc(-1 * (var(--${i}-map-wood) + var(--${i}-map-mat)));
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
.${i}-home-full .${i}-stage::after {
  inset: calc(-1 * var(--${i}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
.${i}-places-picker { position: relative; pointer-events: auto; }
.${i}-places-list {
  position: absolute; top: calc(100% + .375rem); left: 0; z-index: 10;
  display: flex; flex-direction: column; gap: .375rem;
  min-width: min(19rem, 80vw); max-width: min(24rem, 90vw); max-height: 60vh; overflow: auto;
  padding: .5rem; border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${i}-places-list-row { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${i}-places-list-name { flex: 1 1 100%; font-size: .8125rem; font-weight: 600; }
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${i}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${i}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${i}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${i}-notice .${i}-status,
.${i}-notice .${i}-error {
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
.${i}-news { position: relative; }
.${i}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${i}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${i}-news-toggle::-webkit-details-marker { display: none; }
.${i}-news-toggle::marker { content: ""; }
.${i}-news[open] > .${i}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${i}-news-panel {
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
.${i}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${i}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${i}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${i}-mapbar-title { font-size: .8125rem; font-weight: 600; }
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
.${i}-stage {
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
.${i}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${i}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${i}-canvas { position: absolute; inset: 0; }
.${i}-stage[data-empty="true"] .${i}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${i}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${i}-canvas[data-placing="true"] { cursor: crosshair; }
.${i}-canvas[data-dragging="true"] { cursor: grabbing; }
.${i}-stage[data-framing="true"] .${i}-canvas { cursor: grab; touch-action: none; }
.${i}-stage[data-framing="true"] .${i}-canvas[data-dragging="true"] { cursor: grabbing; }
.${i}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${i}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${i}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${i}-zoom-button:disabled { opacity: .5; cursor: default; }
.${i}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${i}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${i}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${i}-pin:hover { color: var(--primary); }
.${i}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${i}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${i}-pin[data-tone="player"] { border-color: var(--primary); }
.${i}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read \u2014 there is nothing behind it to press yet.
*/
.${i}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${i}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
.${i}-pin[data-kind="person"] .${i}-pin-tack { display: none; }
/*
  A thumbtack, because that is what the thing on a map is: something pushed
  through the paper to say a building is here. Drawn rather than taken from a
  font or an emoji, so it is the same tack on every machine the Engine runs on.
*/
.${i}-pin-tack { flex: 0 0 auto; width: 1rem; height: 1rem; color: var(--destructive, #e5484d); }
.${i}-pin-tack svg { display: block; width: 100%; height: 100%; fill: currentColor; }
.${i}-pin[data-tone="empty"] .${i}-pin-tack { color: var(--muted-foreground); }
.${i}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${i}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
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
.${i}-pin-resume {
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
.${i}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${i}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${i}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${i}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${i}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${i}-overlay-head > .${i}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${i}-setup-root {
  box-sizing: border-box; container-type: inline-size; overflow-x: hidden; overflow-y: auto;
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${i}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${i}-setup-body { flex: 0 0 auto; min-height: 0; }
.${i}-setup-body > .${i}-side { flex: 1 1 34rem; }
.${i}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${i}-setup-visual > .${i}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
.${i}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${i}-setup-footer > .${i}-button { flex: 1 1 0; min-width: 0; }
.${i}-setup-footer > .${i}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${i}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${i}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${i}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${i}-setup-rail-step[data-done="true"] { opacity: 1; }
.${i}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${i}-setup-rail-step[data-active="true"] .${i}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${i}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${i}-setup-body {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: stretch; color: var(--foreground);
}
.${i}-setup-body > .${i}-side { flex-basis: 35rem; min-height: 0; }
.${i}-setup-body .${i}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${i}-setup-body .${i}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${i}-setup-body .${i}-field { margin-top: .15rem; }
.${i}-setup-body[data-step="1"] .${i}-overlay { height: 100%; min-height: 0; overflow: hidden; }
.${i}-setup-body .${i}-search,
.${i}-setup-body .${i}-textarea,
.${i}-setup-body .${i}-select,
.${i}-setup-body .${i}-notice-input {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${i}-setup-beginning-textarea { min-height: 4.5rem; }
.${i}-setup-form-field { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .6rem; align-items: start; }
.${i}-setup-form-field > .${i}-label { padding-top: .55rem; }
.${i}-setup-form-field > .${i}-hint { grid-column: 2; }
.${i}-setup-place-spaces { display: grid; gap: .65rem; }
.${i}-setup-place-space { display: grid; gap: .4rem; border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .7rem; }
.${i}-setup-place-space h4 { margin: 0; color: #f5f5ff; font-size: 1rem; }
.${i}-setup-advanced {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .55rem .65rem;
}
.${i}-setup-advanced > summary { cursor: pointer; }
.${i}-setup-advanced .${i}-reason-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.${i}-setup-advanced .${i}-label { min-width: 0; }
.${i}-setup-review-card {
  display: grid; gap: .3rem; border: 1px solid #5265ac; border-radius: .85rem;
  background: #1c254b; padding: .65rem;
}
.${i}-setup-review-card h3 { margin: 0; color: #f5f5ff; font-size: .9rem; }
.${i}-setup-review-card p { margin: 0; }
.${i}-setup-body .${i}-setup-venue-card {
  border-color: #5265ac; border-radius: .85rem; background: #1c254b; color: #f0f2ff;
}
.${i}-setup-body .${i}-setup-venue-card[data-selected="true"] {
  border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff;
}
.${i}-setup-body .${i}-setup-map-shell {
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${i}-setup-body .${i}-step[data-clickable="true"] {
  border-color: #5265ac; border-radius: .65rem; background: #1c254b; color: #d3ddfa; padding: .4rem .7rem;
}
.${i}-setup-body .${i}-step[data-active="true"] {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff; color: #f5f5ff;
}
.${i}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${i}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${i}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${i}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${i}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${i}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${i}-scenario-option strong { font-size: max(.72rem, 13px); }
.${i}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${i}-scenario-art-panel {
  position: relative; flex: 1 1 12rem; min-width: 0; min-height: 8rem;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${i}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${i}-scenario-art-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #d3ddfa; font-size: 2rem;
}
.${i}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${i}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${i}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${i}-scenario-art-content strong { font-weight: 500; }
/* World setup uses the same indigo panels and borders as Identity and Persona. */
.${i}-lore-picker {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .65rem;
}
.${i}-lore-selected { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 5rem; overflow-y: auto; margin: .4rem 0; }
.${i}-lore-chip {
  display: inline-flex; align-items: center; gap: .3rem; max-width: 100%; padding: .15rem .25rem .15rem .5rem;
  border: 1px solid #6684d4; border-radius: 999px; background: #303d85; color: #f0f2ff; font-size: .72rem;
}
.${i}-lore-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-lore-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${i}-lore-chip button:focus-visible { outline: 2px solid #f2d6ff; border-radius: 50%; }
.${i}-lore-options > summary { cursor: pointer; list-style-position: inside; }
.${i}-lore-options > .${i}-search { width: 100%; box-sizing: border-box; margin: .5rem 0; }
.${i}-lore-results { display: grid; gap: .15rem; max-height: 12rem; overflow-y: auto; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${i}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${i}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${i}-identity-picker-head > .${i}-label { flex: 0 0 auto; }
.${i}-identity-picker-head > .${i}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${i}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${i}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${i}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${i}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${i}-identity-card-face, .${i}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${i}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${i}-identity-card-face > img, .${i}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${i}-identity-card-face svg, .${i}-identity-preview-face svg { width: 55%; height: 55%; }
.${i}-identity-card strong, .${i}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${i}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${i}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${i}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${i}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${i}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${i}-identity-preview-copy p { margin: .12rem 0; }
.${i}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${i}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${i}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${i}-identity-details dd { margin: 0; }
.${i}-identity-context { color: #bdc8ed; }
.${i}-connections-compact { min-height: 0; }
.${i}-connections-compact > .${i}-hint { margin: 0; }
.${i}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${i}-connections-grid > .${i}-field { min-width: 0; }
.${i}-connections-grid .${i}-select { width: 100%; }
.${i}-connections-grid .${i}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${i}-scenario-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (max-width: 70rem) {
  .${i}-setup-body { flex-wrap: wrap; }
  .${i}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${i}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${i}-setup-body > .${i}-side { flex-basis: 25rem; }
  .${i}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${i}-setup-body { flex: none; }
  .${i}-setup-body > .${i}-side,
  .${i}-setup-visual { flex: 1 1 100%; }
  .${i}-setup-body[data-step="1"] .${i}-overlay { height: auto; overflow: visible; }
  .${i}-identity-preview { max-height: none; }
  .${i}-connections-grid { grid-template-columns: 1fr; }
  .${i}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${i}-setup-advanced .${i}-reason-options { grid-template-columns: 1fr; }
  .${i}-scenario-art-panel { flex: none; height: 18rem; }
  .${i}-setup-form-field { grid-template-columns: 1fr; }
  .${i}-setup-form-field > .${i}-hint { grid-column: 1; }
}
.${i}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute \u2014 a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${i}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${i}-step[data-clickable="true"] { cursor: pointer; }
.${i}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${i}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${i}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${i}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${i}-home-row[data-selected="true"] { border-color: var(--primary); }
.${i}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${i}-home-index {
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
.${i}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${i}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${i}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${i}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${i}-spacer { flex: 1 1 auto; }
.${i}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

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
${i} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${i};
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
${i}:fullscreen {
  background: var(--background);
  --${i}-safe-top: env(safe-area-inset-top, 0px);
  --${i}-safe-right: env(safe-area-inset-right, 0px);
  --${i}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${i}-safe-left: env(safe-area-inset-left, 0px);
}
${i}:fullscreen .${i}-root {
  padding:
    calc(var(--${i}-pad) + var(--${i}-safe-top))
    calc(var(--${i}-pad) + var(--${i}-safe-right))
    calc(var(--${i}-pad) + var(--${i}-safe-bottom))
    calc(var(--${i}-pad) + var(--${i}-safe-left));
}
${i}:fullscreen .${i}-home-full {
  padding:
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-top))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-right))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-bottom))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-left));
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
.${i}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${i}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${i}-pad) * 2) var(--${i}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${i}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${i}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${i}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${i}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
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
  .${i}-button,
  .${i}-select,
  .${i}-search,
  .${i}-notice-input,
  .${i}-macro,
  .${i}-chat-mode-button,
  .${i}-chat-send,
  .${i}-step[data-clickable="true"],
  .${i}-zoom-button,
  .${i}-remove { min-height: 2.25rem; }
  .${i}-icon-button,
  .${i}-chat-mode-button,
  .${i}-chat-send { min-width: 2.25rem; }
  .${i}-zoom-button,
  .${i}-icon-button,
  .${i}-chat-mode-button,
  .${i}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${i}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${i}-textarea { min-height: 4.5rem; }
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
@container ${i} (max-width: 44rem) {
  .${i}-chat { padding: .625rem; }
  .${i}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${i}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${i}-room-screen > .${i}-chat { overflow-y: auto; }
  .${i}-room-screen .${i}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${i}-room-screen .${i}-chat-cast { height: 100%; max-height: none; }
  .${i}-room-screen .${i}-chat-cast-person,
  .${i}-room-screen .${i}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(4rem, 100%); }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${i}-room-screen .${i}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${i}-room-screen .${i}-chat > .${i}-composer { flex: 0 0 auto; }
  .${i}-room-screen .${i}-chat > .${i}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${i} (max-width: 55rem) and (max-height: 32rem) {
  .${i}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${i} (max-height: 30rem) {
  .${i}-chat { gap: .5rem; padding: .625rem; }
  .${i}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${i}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${i}-chat-scene-place { display: none; }
  .${i}-chat-log { gap: .375rem; }
  .${i}-chat-vn-portrait { display: none; }
  .${i}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${i} (min-width: 34rem) and (max-height: 30rem) {
  .${i}-room-screen .${i}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${i}-room-screen .${i}-chat-cast-person { font-size: .5625rem; }
  .${i}-room-screen .${i}-chat-vn,
  .${i}-room-screen .${i}-chat > .${i}-row,
  .${i}-room-screen .${i}-chat > .${i}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${i}-room-screen .${i}-chat-vn { margin-top: auto; }
}
@container ${i} (max-width: 34rem) {
  .${i}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${i}-chat-menu { max-width: 88cqw; }
  .${i}-chat-modes { max-width: 88cqw; }
  .${i}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${i}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${i} (max-width: 34rem) and (max-height: 32rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(3.25rem, 100%); }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 3.5rem; }
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
@container ${i} (max-height: 22rem) {
  .${i}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${i}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${i}-chat-vn-name { font-size: .8125rem; }
}

@container ${i} (max-width: 44rem) {
  .${i}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
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
.${i}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${i}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${i}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${i}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${i}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${i}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${i}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${i}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${i}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences \u2014 it decides how the
    whole roleplay reads \u2014 and a dropdown hides the consequences behind a click. */
.${i}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${i}-choice:hover { border-color: var(--primary); }
.${i}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${i}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${i}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${i}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${i}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${i}-var-option:hover { border-color: var(--primary); }
.${i}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${i}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${i}-var-list {
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
.${i}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${i}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${i}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${i}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${i}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${i}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${i}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
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
.${i}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${i}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${i}-tracker[data-compact="true"] .${i}-tracker-label { display: none; }
.${i}-tracker[data-open="true"] .${i}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own \u2014 only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${i}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${i}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${i}-panel-view-key { color: var(--muted-foreground); }
.${i}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
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
.${i}-tracker { position: relative; display: inline-flex; align-items: center; }
.${i}-tracker svg { width: 1rem; height: 1rem; }
.${i}-tracker[data-state="done"] { opacity: .7; }
.${i}-spin { animation: ${i}-spin .9s linear infinite; }
@keyframes ${i}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${i}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${i}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${i}-home-full[data-mobile="true"] .${i}-room { min-height: 0; padding: calc(var(--${i}-map-wood) + var(--${i}-map-mat) + 1px); }
.${i}-home-full[data-mobile="true"] .${i}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${i}-home-full[data-mobile="true"] .${i}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${i}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${i}-stage[data-mobile="true"] .${i}-canvas { overflow: hidden; }
.${i}-stage[data-mobile="true"] .${i}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${i}-stage[data-mobile="true"][data-empty="true"] .${i}-canvas { background: var(--background); }
.${i}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${i}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${i}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${i}-home-bar .${i}-button { min-height: 2.5rem; }
.${i}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${i}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${i}-mobile-board-button, .${i}-mobile-menu-button, .${i}-home-bar .${i}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${i}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${i}-mobile-board-button:disabled { opacity: .55; }
.${i}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${i}-home-bar .${i}-news-toggle { position: relative; }
.${i}-home-bar .${i}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${i}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${i}-home-bar .${i}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${i}-home-full[data-mobile="false"] .${i}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${i}-home-full[data-mobile="false"] .${i}-mobile-clock { font-size: .75rem; }
.${i}-stage[data-mobile="true"] .${i}-pin-holder { z-index: 2; }
.${i}-stage .${i}-pin-holder[data-selected="true"] { z-index: 7; }
.${i}-home-full .${i}-pin[data-kind="place"], .${i}-stage[data-mobile="true"] .${i}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${i}-home-full .${i}-pin-photo-card, .${i}-stage[data-mobile="true"] .${i}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${i}-stage[data-mobile="true"] .${i}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${i}-home-full .${i}-pin-photo, .${i}-stage[data-mobile="true"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${i}-home-full .${i}-pin-photo img, .${i}-stage[data-mobile="true"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-home-full .${i}-pin-photo-tack, .${i}-stage[data-mobile="true"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-home-full .${i}-pin-name, .${i}-stage[data-mobile="true"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${i}-stage[data-mobile="true"] .${i}-pin[data-kind="person"] { max-width: 7rem; }
.${i}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${i}-pin-photo-card { transition: none; }
.${i}-stage[data-mobile="true"] .${i}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${i}-sectioned-menu .${i}-menu-nav { display: none; }
.${i}-mobile-menu-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .5rem; }
.${i}-mobile-menu-nav .${i}-button { min-height: 2.75rem; text-align: left; }
.${i}-mobile-menu-nav .${i}-status { grid-column: 1 / -1; margin: 0; line-height: 1.45; }
.${i}-sectioned-menu[data-section="index"] > .${i}-panel, .${i}-sectioned-menu[data-section="index"] > .${i}-menu-body { display: none; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-overlay { border: .8rem solid #9e6835; border-radius: .5rem; background: repeating-linear-gradient(90deg, #ba854d 0 21px, #a9733d 21px 24px); box-shadow: inset 0 0 0 2px #6b3d1e, 0 .5rem 1rem #0005; padding: .8rem; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-notice-row { border: 1px solid #d9c69c; background: #fff7db; color: #33281d; padding: .6rem; box-shadow: 1px 2px 3px #0005; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-notice-author { color: #33281d; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-overlay-head > .${i}-panel-title { color: #2e2116; font-size: 1rem; }
.${i}-sectioned-menu[data-mobile="false"] .${i}-mobile-menu-nav { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
.${i}-sectioned-menu[data-mobile="false"] .${i}-mobile-menu-nav .${i}-button { min-height: 2.5rem; }
.${i}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${i}-setup-map-viewport:has(> .${i}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${i}-setup-map-viewport > .${i}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${i}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${i}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${i}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${i}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${i}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${i}-setup-venue-card img, .${i}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${i}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${i}-pin-photo-card { transition: none; } }
.${i}-setup-venue-card strong, .${i}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${i}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${i}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${i}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${i}-settle 2.5s ease-in-out infinite; }
@keyframes ${i}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${i}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${i}-root.${i}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${i}-room-screen .${i}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${i}-room-screen .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${i}-room-screen .${i}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${i}-room-screen .${i}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${i}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${i}-room-screen .${i}-chat-history-toggle { min-height: 2rem; }
.${i}-room-screen .${i}-composer { min-width: 0; }
.${i}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${i}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${i}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${i}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${i}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${i}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${i}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${i}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${i}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${i}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${i}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${i}-room-mode-toggle:focus-visible, .${i}-room-mode-menu button:focus-visible, .${i}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${i}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${i}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${i}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${i}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${i}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${i}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${i}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${i} (max-width: 44rem) { .${i}-room-screen .${i}-chat-vn { width: 100%; padding: .45rem; } .${i}-room-screen .${i}-chat-vn-asides { width: min(85%, 22rem); } .${i}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${i} (min-width: 34rem) and (max-height: 30rem) { .${i}-room-screen .${i}-chat-vn { width: 64%; align-self: flex-end; } }
.${i}-room-screen[data-mobile="true"] .${i}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${i}-room-screen[data-mobile="true"] .${i}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${i}-room-screen[data-mobile="true"] .${i}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-memory-backdrop { padding: .5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

/* Venue visits use a single shallow reading dock so the stage owns the remaining height. */
.${i}-room-screen > .${i}-chat { gap: 0; padding: 0; overflow: hidden; }
.${i}-room-screen .${i}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${i}-room-screen .${i}-chat-vignette { opacity: .45; }
.${i}-room-screen .${i}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${i}-room-place, .${i}-room-actions-trigger, .${i}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${i}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${i}-room-screen .${i}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${i}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${i}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${i}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${i}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${i}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${i}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${i}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${i}-room-screen .${i}-room-stars, .${i}-room-screen[data-mobile="true"] .${i}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${i}-room-screen .${i}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${i}-room-screen .${i}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${i}-room-screen .${i}-chat-cast-person,
.${i}-room-screen .${i}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${i}-room-screen .${i}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${i}-room-screen .${i}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${i}-room-screen .${i}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(8rem, 80%); }
.${i}-room-screen .${i}-chat-cast-person > span:not(.${i}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${i}-room-screen .${i}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${i}-room-screen .${i}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${i}-room-screen .${i}-chat[data-opening-error="true"] .${i}-chat-vn { display: flex; }
.${i}-room-screen .${i}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${i}-room-screen .${i}-chat-vn-row { padding: 0; }
.${i}-room-screen .${i}-chat-vn-column { gap: .18rem; }
.${i}-room-screen .${i}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${i}-room-screen .${i}-chat-vn-text,
.${i}-room-screen .${i}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${i}-room-screen .${i}-chat-vn-name,
.${i}-room-screen .${i}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${i}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${i}-room-panel-tools .${i}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${i}-room-panel-tools .${i}-chat-vn-counter { justify-self: center; }
.${i}-room-panel-tools .${i}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${i}-room-panel-tools .${i}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${i}-room-screen .${i}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${i}-room-screen .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${i}-room-screen .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${i}-room-screen .${i}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${i}-room-screen .${i}-chat-input > .${i}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${i}-room-actions-trigger:focus-visible, .${i}-room-actions-menu button:focus-visible, .${i}-room-notices-trigger:focus-visible, .${i}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${i} (max-width: 44rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${i}-room-screen .${i}-chat-cast-person, .${i}-room-screen .${i}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 100%; }
  .${i}-room-screen .${i}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${i}-room-screen .${i}-chat-vn-asides, .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${i}-room-screen .${i}-chat-vn-asides[data-side="left"], .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${i} (max-height: 30rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${i}-room-screen .${i}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${i}-room-screen .${i}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${i} (max-width: 44rem) and (min-height: 40rem) {
  .${i}-room-screen .${i}-chat-vn-asides, .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
@media (prefers-reduced-motion: reduce) { .${i}-room-screen .${i}-chat-cast-person { transition: none; } }
`;function I0(){let e=document.getElementById(O0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=O0,t.textContent=D2,document.head.appendChild(t)}var _2="marinara_admin_secret";function n1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(_2)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var H2="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function i1(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${H2} (${o})`):new Error(o)}async function V(e,t){let a=await fetch(`${N2}${e}`,{...t,headers:n1(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw i1(n,a.status,`The village replied ${a.status}.`);return y0(n)}async function Lp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:n1(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw i1(n,a.status,`The Engine replied ${a.status}.`);return n}var so=e=>typeof e=="number"&&Number.isFinite(e);function jp(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:s,srcHeight:c}=a;if(so(n)&&so(o)&&so(s)&&so(c))return s<=0||c<=0||n<0||o<0||n+s>1.001||o+c>1.001?null:{srcX:n,srcY:o,srcWidth:s,srcHeight:c};let{zoom:u,offsetX:h,offsetY:g,fullImage:$}=a;return!so(u)||u<=0||!so(h)||!so(g)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:u,offsetX:h,offsetY:g}:{zoom:u,offsetX:h,offsetY:g,fullImage:$}}function I2(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function U2(e,t){if(e.length===0)return{};let a=await Lp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let s=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";s.length>0&&c.length>0&&(n[s]={url:c,crop:jp(o.avatarCrop)})}return n}async function q2(e,t){let a=e.trim();if(a.length===0)return null;let n=await Lp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:jp(n.avatarCrop)}}function B2(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:s,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function U(e,t){return e instanceof Error&&e.message?e.message:t}function Rr(e){let t=U(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function U0(e){try{let{session:t}=await V("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function q0(e,t){try{let{visit:a}=await V(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return x0(a,t)?a:null}catch{return null}}function B0(e){let t=U(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function _u(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Mr(e,t){return o1(f0(e),t)}function o1(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return L2(n,o)}})}function L2(e,t){let a=o1(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function j2(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Or(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var r1=["residence","workplace","gathering","other"];function gn(e){return e.classes?.length?e.classes:Or(e)?["residence"]:["other"]}function L0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Hu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function ot(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function j0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let s=gn(e),c=(u,h)=>{let g=s.map($=>$===u?{...ot(e,$),...h}:ot(e,$));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:u=>o({...e,name:u.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:u=>o({...e,form:u.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[u]??"",disabled:t&&Hu(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[u]:h.target.value===""?null:Number(h.target.value)}})})]},u))}),t&&Hu(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:r1.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(u),disabled:t||!s.includes(u)&&s.length>=2,onChange:h=>{let g=h.target.checked?[...s,u]:s.filter($=>$!==u);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map($=>ot(e,$))})}})," ",u]},u))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:u=>o({...e,residenceCapacity:Number(u.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(u.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],u.characterId]:(e.workerIds??[]).filter(g=>g!==u.characterId)})})," ",u.name]},u.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(u=>!n||n.includes(u)).map(u=>{let h=ot(e,u);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[u," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(u,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>c(u,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(u,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(u,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,$)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:x.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:x.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(u,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(u,{state:{...h.state,features:[...h.state.features,{id:Cu(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},u)})]})}function qp(e){return e.filter(t=>Or(t))}function In(e){return e.filter(t=>!Or(t)||gn(t).some(a=>a!=="residence"))}function G2(e,t){let a=qp(e);return a.length!==t.length?!1:t.every((n,o)=>{let s=a[o];return s.id===n.id&&s.name===n.name&&(s.form??"Home")===n.form&&s.occupancy.playerHome===n.isPlayerHome&&s.occupancy.residentCharacterId===n.characterId&&s.description===n.description&&Math.abs((s.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((s.presentation.y??-1)-(n.y??-1))<1e-4})}function Y2(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let s=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...ot(s??{id:o.id,name:o.name,description:o.description,category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:s?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:s?.improvements??[null,null],description:o.description,category:s?.category??"",presentation:{image:s?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:s?.capabilities??[],state:s?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!Or(o))]}function ol(){return Math.random().toString(36).slice(2,10)}function lo(e){return Math.round(e*1e4)/1e4}var X2=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),s1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),Q2=6e4,Z2=700;function G0(e){return`${X2.format(e)} \xB7 ${s1.format(e)}`}function K2(){let[e,t]=(0,m.useState)(()=>G0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(G0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function J2(){let[e,t]=K2().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function F2({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(J2,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:P2(e)})]})}function P2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function Y0(e){return e?.closest(i)??null}function W2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(Y0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let s=Y0(o.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function eS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let u=()=>s(c.open);return c.addEventListener("toggle",u),()=>c.removeEventListener("toggle",u)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=u=>{!(u.target instanceof Node)||n.current?.contains(u.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function l1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function tS(e){return e.length>0?l1(e,!0):"Empty house"}function X0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function Q0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function aS(e,t){return t.length>0?l1(t,!0):e.name||"An empty house"}function rl(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var nS=.028;function sl(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Mp(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var Z0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Op(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Vp(e,t,a){return e<t?t:e>a?a:e}function iS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),u=e.width*c,h=e.height*c;return{left:(t.width-u)/2,top:(t.height-h)/2,width:u,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,s=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:o,height:s}}function oS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Ou(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Dp({src:e,alt:t,pins:a,placing:n,view:o,shape:s,zoom:c,onPlace:u,onView:h,onDismiss:g,compact:$,fitToRoom:x,mobile:f,photoPins:b,children:C}){let k=u!==void 0,M=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,S]=(0,m.useState)(null),[O,F]=(0,m.useState)(null),[H,j]=(0,m.useState)(null),ve=(0,m.useRef)(null),X=(0,m.useRef)(new Map),_e=(0,m.useRef)(null),[rt,mt]=(0,m.useState)(null),[$i,Xt]=(0,m.useState)(null),pt=(0,m.useRef)(null),q=(0,m.useRef)(null),oe=(0,m.useRef)(!1),[Xe,aa]=(0,m.useState)(null),ce=(0,m.useMemo)(()=>Xe?{...o,...Xe}:o,[Xe,o]),re=e?v?.src===e?v:null:s,Dt={zoom:re&&O?zu(re,O):1,centerX:.5,centerY:.5},Ra=H??Dt,Z=(0,m.useMemo)(()=>f?re&&O?Tp(re,O,Ra):null:e?v&&v.src===e&&O?iS(v,O,ce):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[v,O,ce,f,re,Ra,e]);(0,m.useEffect)(()=>{j(null),ve.current=null,X.current.clear(),_e.current=null},[e,O?.width,O?.height]);let fa=s?x&&rt?{width:`${rt.width}px`,height:`${rt.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,gt=(0,m.useCallback)(()=>{let A=y.current;if(!A)return;let B=A.getBoundingClientRect();B.width===0||B.height===0||F(de=>de&&de.width===B.width&&de.height===B.height?de:{width:B.width,height:B.height})},[]);(0,m.useEffect)(()=>{let A=y.current;if(!A||typeof ResizeObserver>"u")return;let B=new ResizeObserver(()=>gt());return B.observe(A),()=>B.disconnect()},[gt]);let _t=(0,m.useCallback)(()=>{let A=w.current?.parentElement;if(!A||!s)return;let B=A.getBoundingClientRect(),de=getComputedStyle(A),$e=Qe=>Number.parseFloat(de.getPropertyValue(Qe))||0,Se=B.width-$e("padding-left")-$e("padding-right"),te=B.height-$e("padding-top")-$e("padding-bottom"),st=s.width/s.height,Q=Math.min(Se,te*st);Q>0&&mt(Qe=>Qe&&Math.abs(Qe.width-Q)<.5?Qe:{width:Q,height:Q/st})},[s]);(0,m.useLayoutEffect)(()=>{if(!x||(_t(),typeof ResizeObserver>"u"))return;let A=w.current?.parentElement;if(!A)return;let B=new ResizeObserver(()=>_t());return B.observe(A),()=>B.disconnect()},[x,_t]);let ge=(0,m.useCallback)(A=>{if(!k||!u||!Z)return;let B=A.currentTarget.getBoundingClientRect(),de=(A.clientX-B.left-Z.left)/Z.width,$e=(A.clientY-B.top-Z.top)/Z.height;if(!(de>=0&&de<=1)||!($e>=0&&$e<=1))return;let te=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(lo(de),lo($e),{width:Z.width,height:Z.height,photoWidth:te?.width??58,photoHeight:te?.height??58})},[u,k,Z]),Ke=(0,m.useCallback)(A=>{if(!M||!Z||!h||ce.fit!=="cover")return;let B=A.currentTarget.getBoundingClientRect();pt.current={x:A.clientX,y:A.clientY,focusX:ce.focusX,focusY:ce.focusY,spanX:B.width-Z.width,spanY:B.height-Z.height},aa({focusX:ce.focusX,focusY:ce.focusY}),A.currentTarget.setPointerCapture(A.pointerId),A.preventDefault()},[M,ce.focusX,ce.focusY,ce.fit,h,Z]),ie=(0,m.useCallback)(A=>{let B=pt.current;if(!B)return;let de=B.spanX===0?B.focusX:B.focusX+(A.clientX-B.x)/B.spanX*100,$e=B.spanY===0?B.focusY:B.focusY+(A.clientY-B.y)/B.spanY*100;aa({focusX:lo(Vp(de,0,100)),focusY:lo(Vp($e,0,100))})},[]),ft=(0,m.useCallback)(A=>{if(!pt.current)return;pt.current=null,A.currentTarget.hasPointerCapture(A.pointerId)&&A.currentTarget.releasePointerCapture(A.pointerId);let B=Xe;aa(null),B&&h&&h({...o,...B})},[Xe,h,o]),Ma=(0,m.useCallback)(A=>{!h||!c||h({...o,zoom:lo(Vp(A,c.min,c.max))})},[h,o,c]),Qt=()=>{let A=[...X.current.values()];if(A.length===0){_e.current=null;return}let B=A[0],de=A[1];_e.current={view:ve.current??Ra,x:de?(B.x+de.x)/2:B.x,y:de?(B.y+de.y)/2:B.y,distance:de?Math.hypot(B.x-de.x,B.y-de.y):1}},Oa=A=>{if(!f||A.pointerType!=="touch"||(A.isPrimary&&(X.current.clear(),oe.current=!1),!y.current)||A.target instanceof Element&&A.target.closest(`.${i}-doors, .${i}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let B=y.current.getBoundingClientRect();X.current.set(A.pointerId,{x:A.clientX-B.left,y:A.clientY-B.top}),X.current.size>1&&(oe.current=!0),Qt()},$t=A=>{if(!f||!X.current.has(A.pointerId)||!re||!O||!y.current)return;let B=y.current.getBoundingClientRect();X.current.set(A.pointerId,{x:A.clientX-B.left,y:A.clientY-B.top});let de=[...X.current.values()],$e=de[0],Se=de[1],te=Se?($e.x+Se.x)/2:$e.x,st=Se?($e.y+Se.y)/2:$e.y,Q=Se?Math.hypot($e.x-Se.x,$e.y-Se.y):1,Qe=_e.current;if(!Qe||!k0(Qe,{x:te,y:st,distance:Q})&&!oe.current)return;oe.current||g?.(),oe.current=!0;let Qa=E0(re,O,Qe.view,{x:Qe.x,y:Qe.y},{x:te,y:st},Se&&Qe.distance>0?Q/Qe.distance:1);ve.current=Qa,j(Qa)},fn=(A,B=!1)=>{if(!f||!X.current.has(A.pointerId))return;let de=!B&&X.current.size===1&&!oe.current;if(X.current.delete(A.pointerId),X.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),Qt(),!de||!(A.target instanceof Element))return;let $e=A.target.closest(`.${i}-pin`)?.dataset.pinId,Se=$e?a.find(te=>te.id===$e):null;if(Se?.onSelect){oe.current=!0,Se.onSelect();return}if(!(!A.target.closest(`.${i}-canvas`)||A.target.closest("button")))if(k&&n&&u&&Z){let te=y.current.getBoundingClientRect(),st=(A.clientX-te.left-Z.left)/Z.width,Q=(A.clientY-te.top-Z.top)/Z.height;if(st>=0&&st<=1&&Q>=0&&Q<=1){oe.current=!0;let At=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(lo(st),lo(Q),{width:Z.width,height:Z.height,photoWidth:At?.width??72,photoHeight:At?.height??72})}}else g&&(oe.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${i}-stage${$?` ${i}-stage-compact`:""}`,style:fa,"data-shaped":s?"true":"false","data-framing":M&&ce.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:A=>{if(f){Oa(A);return}oe.current=!1,q.current=A.pointerType==="touch"?{x:A.clientX,y:A.clientY}:null},onPointerMoveCapture:A=>{if(f){$t(A);return}let B=q.current;B&&(Math.abs(A.clientX-B.x)>8||Math.abs(A.clientY-B.y)>8)&&(oe.current=!0)},onPointerUpCapture:f?fn:void 0,onPointerCancelCapture:A=>{f&&fn(A,!0),q.current&&(oe.current=!0)},onClickCapture:A=>{oe.current&&(oe.current=!1,A.preventDefault(),A.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:y,className:`${i}-canvas`,"data-placing":k&&n?"true":"false","data-dragging":Xe?"true":"false",onClick:k&&n?ge:g?()=>g():void 0,onPointerDown:M?Ke:void 0,onPointerMove:M?ie:void 0,onPointerUp:M?ft:void 0,onPointerCancel:M?ft:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&Z?{position:"absolute",left:Z.left,top:Z.top,width:Z.width,height:Z.height,objectFit:"fill"}:oS(ce),src:e,alt:t,draggable:!1,onLoad:A=>{let{naturalWidth:B,naturalHeight:de}=A.currentTarget;B<=0||de<=0||(S({src:e,width:B,height:de}),gt())},onError:()=>Xt(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&Z?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:Z.left,top:Z.top,width:Z.width,height:Z.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&$i===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,Z?a.map(A=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":A.selected?"true":"false",style:{left:`${Z.left+A.x*Z.width}px`,top:`${Z.top+(A.y+(f&&A.kind!=="person"?0:A.dy??0))*Z.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":A.id,"data-tone":A.tone,"data-kind":A.kind??"place","data-selected":A.selected?"true":"false","aria-expanded":A.doors?!0:void 0,disabled:A.onSelect===void 0,title:A.text,onClick:B=>{B.stopPropagation(),A.onSelect?.()},children:(f||b)&&A.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${z0(f?C0(Ra.zoom,Dt.zoom):S2,A.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[A.image?(0,r.jsx)("img",{src:A.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:A.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:A.text})]})}),A.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${A.text} off the map`,onClick:B=>{B.stopPropagation(),A.onRemove?.()},children:"\xD7"}):null,A.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:B=>{B.stopPropagation(),A.onResume?.()},children:"DEBUG: Resume Chat"}):null]},A.id)):null]}),Z?a.filter(A=>A.doors!==void 0&&A.doors.length>0).map(A=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${O?kp(Z,O,A).left:Z.left+A.x*Z.width}px`,top:`${O?kp(Z,O,A).top:Z.top+(A.y+(A.dy??0))*Z.height}px`},children:A.doors?.map(B=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:de=>{de.stopPropagation(),B.onSelect()},children:B.label},B.label))},`doors:${A.id}`)):null,M&&c&&ce.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:ce.zoom>=c.max,onClick:()=>Ma(ce.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:ce.zoom<=c.min,onClick:()=>Ma(ce.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:ce.focusX===50&&ce.focusY===50&&ce.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function co(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function rS({scenario:e}){let t=k2(e),[a,n]=(0,m.useState)(null);return(0,r.jsxs)("div",{className:`${i}-scenario-art-panel`,children:[a===t?(0,r.jsx)("span",{className:`${i}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,r.jsx)("img",{src:t,alt:`${uo(e).label} village scene`,onError:()=>n(t)}),(0,r.jsxs)("div",{className:`${i}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:uo(e).description})]})]})}function sS({label:e,choices:t,selectedId:a,onSelect:n,disabled:o,emptyMessage:s}){return t.length?(0,r.jsx)("div",{className:`${i}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,r.jsxs)("button",{type:"button",className:`${i}-identity-card`,"aria-pressed":a===c.id,disabled:o,onClick:()=>n(c.id),children:[(0,r.jsx)(ho,{portrait:c.portrait,name:c.name,className:`${i}-identity-card-face`,glyph:"person"}),(0,r.jsx)("strong",{children:c.name}),c.hint?(0,r.jsx)("small",{children:c.hint}):null]},c.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:s})}function lS({value:e}){return(0,r.jsxs)("section",{className:`${i}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,r.jsx)(ho,{portrait:e.portrait,name:e.name,className:`${i}-identity-preview-face`,glyph:"person"}),(0,r.jsxs)("div",{className:`${i}-identity-preview-copy`,children:[(0,r.jsx)("h3",{children:e.name}),e.overview?(0,r.jsx)("p",{className:`${i}-identity-overview`,children:e.overview}):null,e.details.length?(0,r.jsx)("dl",{className:`${i}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:t}),(0,r.jsx)("dd",{children:a})]},t))}):null,(0,r.jsx)("p",{className:`${i}-identity-context`,children:e.context})]})]})}function K0(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let n=a.lastIndexOf(" ",t),o=a.indexOf(" ",t);return`${a.slice(0,n>0?n:o>0?o:a.length).trimEnd()}\u2026`}function J0(e){return e.avatarPath?{url:e.avatarPath,crop:jp(e.avatarCrop)}:void 0}function cS({personas:e,draft:t,onDraft:a,disabled:n}){let[o,s]=(0,m.useState)(""),[c,u]=(0,m.useState)(null),[h,g]=(0,m.useState)(""),$=e?.find(k=>k.id===t),x=$?.id,f=o.trim().toLocaleLowerCase(),b=(e??[]).filter(k=>!f||`${k.name} ${k.summary}`.toLocaleLowerCase().includes(f)).sort((k,M)=>k.name.localeCompare(M.name,void 0,{sensitivity:"base"})).map(k=>({id:k.id,name:k.name,portrait:J0(k),hint:k.summary}));(0,m.useEffect)(()=>{if(u(null),g(""),!t||!x)return;let k=new AbortController;return V(`/personas/${encodeURIComponent(t)}`,{signal:k.signal}).then(M=>{k.signal.aborted||u(M.persona)}).catch(M=>{k.signal.aborted||g(U(M,"This Persona could not be read."))}),()=>k.abort()},[t,x]);let C=c&&c.id===t?{id:c.id,name:c.name,portrait:J0(c),overview:K0(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,k])=>k.trim()).map(([k,M])=>({label:k,text:K0(M,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,r.jsxs)("div",{className:`${i}-founding-persona`,children:[(0,r.jsxs)("div",{className:`${i}-identity-picker-head`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-persona-search`,children:"Who are you?"}),(0,r.jsx)("input",{id:`${i}-setup-persona-search`,className:`${i}-search`,type:"search",value:o,placeholder:"Search Personas",onChange:k=>s(k.target.value),disabled:n||e===null})]}),(0,r.jsx)(sS,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:n,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):C?(0,r.jsx)(lS,{value:C}):h?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:h}):$?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function uS({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:s,storedMissing:c,disabled:u}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?s:""),$=c&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:u||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function F0({books:e,error:t,selected:a,onChange:n,disabled:o}){let[s,c]=(0,m.useState)(""),u=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),g=a.filter(b=>!u.has(b)),x=[...h,...g.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),f=x.slice(0,50);return(0,r.jsxs)("fieldset",{className:`${i}-field ${i}-lore-picker`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,r.jsx)("div",{className:`${i}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,r.jsxs)("span",{className:`${i}-lore-chip`,children:[(0,r.jsxs)("span",{children:[u.get(b)?.name??b,e===null?" (checking)":u.has(b)?u.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,r.jsx)("button",{type:"button","aria-label":`Remove ${u.get(b)?.name??b}`,disabled:o,onClick:()=>n(a.filter(C=>C!==b)),children:"\xD7"})]},b)):(0,r.jsx)("span",{className:`${i}-hint`,children:"No lorebooks selected."})}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,(0,r.jsxs)("details",{className:`${i}-lore-options`,children:[(0,r.jsxs)("summary",{className:`${i}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,r.jsx)("input",{type:"search",className:`${i}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,r.jsxs)("div",{className:`${i}-lore-results`,children:[f.map(b=>{let C=a.includes(b.id),k=g.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:C,disabled:o||!b.enabled&&!C||!C&&a.length>=24,onChange:()=>n(C?a.filter(M=>M!==b.id):[...a,b.id])}),b.name,k?` (${k})`:""]},b.id)}),e!==null&&x.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No matching lorebooks."}):null,x.length>f.length?(0,r.jsx)("p",{className:`${i}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function dS({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:s,onSelect:c,lockedIds:u,showDescriptions:h,onGenerateDescription:g}){let $=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((x,f)=>{let b=u?.has(x.id)??!1,C=t.find(k=>k.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":x.id===n?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${f+1}`,onChange:k=>o(x.id,{characterId:k.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(k=>{let M=k.id!==x.characterId&&$.has(k.id);return(0,r.jsx)("option",{value:k.id,disabled:M,children:M?`${k.name} \u2014 already housed`:k.name},k.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:k=>o(x.id,{name:k.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:k=>o(x.id,{form:k.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${f+1}`,onChange:k=>o(x.id,{description:k.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||b,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||b,"aria-label":`Take home ${f+1} off the map`,onClick:()=>s(x.id),children:"\xD7"}),b?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function P0({id:e,label:t,hint:a,options:n,value:o,disabled:s,onChange:c}){let u=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:s,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),u?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function _p({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[n,o]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let M=!1;return(async()=>{try{let[w,y]=await Promise.all([V("/connections"),Lp("/api/connections")]);if(M)return;o(w),c(B2(Array.isArray(y)?y:[]))}catch(w){M||h(U(w,"This agent's connections could not be read."))}})(),()=>{M=!0}},[]);let x=(0,m.useCallback)(async M=>{$(!0),h("");try{o(await V("/connections",{method:"PUT",body:JSON.stringify(M)}))}catch(w){h(U(w,"That connection could not be saved."))}finally{$(!1)}},[]),f=s.filter(M=>M.category==="language"),b=s.filter(M=>M.category==="image_generation"),C=b.some(M=>M.defaultForAgents),k=n!==null&&(n.imageConnectionId===Ap||b.length===0||n.imageConnectionId.length===0&&!C);return(0,m.useEffect)(()=>{if(!e)return;let M=n?.systemConnectionId??"",w=n?.narrationConnectionId??"";n?M.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!f.some(y=>y.id===M)||!f.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,n,f]),(0,m.useEffect)(()=>{t?.(k)},[k,t]),(0,r.jsxs)("div",{className:`${i}-field ${a?`${i}-connections-compact`:""}`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),a?(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),n?(0,r.jsxs)("div",{className:a?`${i}-connections-grid`:"",children:[(0,r.jsx)(P0,{id:`${i}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:n.systemConnectionId,disabled:g,onChange:M=>{x({systemConnectionId:M})}}),(0,r.jsx)(P0,{id:`${i}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:n.narrationConnectionId,disabled:g,onChange:M=>{x({narrationConnectionId:M})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:n.imageConnectionId,disabled:g,onChange:M=>{x({imageConnectionId:M.target.value})},children:[(0,r.jsx)("option",{value:Ap,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),n.imageConnectionId.length>0&&n.imageConnectionId!==Ap&&!b.some(M=>M.id===n.imageConnectionId)?(0,r.jsx)("option",{value:n.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(M=>(0,r.jsx)("option",{value:M.id,children:M.name},M.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,r.jsxs)(r.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):u.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:u}):null]})}function c1(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,s]=(0,m.useState)(!1),[c,u]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return V("/narration").then($=>{g||t($)}).catch($=>{g||n(U($,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{s(!0),u(!1),n("");try{let $=await V("/narration",{method:"PUT",body:JSON.stringify(g)});return t($),u(!0),$}catch($){return n(U($,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function hS(){let{view:e,error:t,busy:a,saved:n,save:o}=c1(),[s,c]=(0,m.useState)(null),u=s??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:u,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.styleInstructions,onClick:()=>{o({styleInstructions:u}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function mS(){let{view:e,error:t,busy:a,saved:n,save:o}=c1(),[s,c]=(0,m.useState)(null),u=s??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:u,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.replyGuidance,onClick:()=>{o({replyGuidance:u}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function ho({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:I2(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function pS({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(ho,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function W0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function gS(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,f)=>{let b=C=>{let k=Vu.indexOf(C);return k<0?Vu.length:k};return b(x.label)-b(f.label)||x.label.localeCompare(f.label)||x.view.localeCompare(f.view)}),n=512,o=768,s=2,c=document.createElement("canvas");c.width=s*n,c.height=Math.ceil(a.length/s)*o;let u=c.getContext("2d");if(!u)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let f=a[x],b=new Image;b.src=f.url,await b.decode();let C=x%s*n,k=Math.floor(x/s)*o,M=Math.min(n/b.naturalWidth,o/b.naturalHeight),w=Math.round(b.naturalWidth*M),y=Math.round(b.naturalHeight*M);u.drawImage(b,C+Math.floor((n-w)/2),k+o-y,w,y),h.push({view:f.view,expression:f.label,x:C,y:k,width:n,height:o})}let g=await new Promise((x,f)=>c.toBlob(b=>b?x(b):f(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";W0(`${$}-sprites.png`,g),W0(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function fS({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[s,c]=(0,m.useState)("neutral"),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(""),[x,f]=(0,m.useState)(!0),[b,C]=(0,m.useState)(null),[k,M]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,S]=(0,m.useState)(""),[O,F]=(0,m.useState)(""),H=(0,m.useRef)(null),j=e.sprite?.images??[],ve=j.filter(q=>q.view===n),X=j.some(q=>q.view==="front"&&q.label==="neutral"),_e=ve.some(q=>q.label==="neutral"),rt=s==="custom"?u.trim().toLowerCase().replace(/\s+/g,"_"):s,mt=ve.find(q=>q.label===rt),$i=[...Vu,...j.map(q=>q.label).filter(q=>!Vu.includes(q))].filter((q,oe,Xe)=>Xe.indexOf(q)===oe);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),S(""),V(`${a}/source`).then(q=>M(q.sprites)).catch(()=>M([]))},[a]);async function Xt(q){y(!0),S(""),F("");try{await q()}catch(oe){S(U(oe,"The sprite could not be prepared."))}finally{y(!1)}}function pt(){if(!/^[a-z0-9_-]{1,40}$/.test(rt))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!X)throw new Error("Approve the front neutral sprite first.");if(rt!=="neutral"&&!_e)throw new Error(`Approve the ${n} neutral sprite first.`);return rt}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[j.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(q=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===q,"data-active":n===q?"true":"false",disabled:w,onClick:()=>{o(q),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:q==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[j.filter(oe=>oe.view===q).length," approved \xB7"," ",q==="front"?"front":"side, mirrored left or right"]})]},q))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[$i.map(q=>{let oe=ve.find(Xe=>Xe.label===q);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":s===q?"true":"false","aria-pressed":s===q,disabled:w,onClick:()=>{c(q),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:oe?(0,r.jsx)("img",{src:oe.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:q}),(0,r.jsx)("small",{children:oe?"Approved":"Open"})]},q)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":s==="custom"?"true":"false","aria-pressed":s==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),s==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:u,maxLength:40,disabled:w,onChange:q=>{h(q.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",rt||"custom"]}),(0,r.jsx)("span",{children:mt?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!X?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,rt!=="neutral"&&!_e?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:q=>$(q.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:q=>f(q.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!X||rt!=="neutral"&&!_e,onClick:()=>{Xt(async()=>{let q=pt(),oe=await V(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:q,appearance:g,useReference:x})});C({view:n,label:q,image:oe.image}),F(`Candidate: ${oe.width} \xD7 ${oe.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${n} ${rt||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!X||rt!=="neutral"&&!_e,onClick:()=>H.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:H,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:q=>{Xt(async()=>{let oe=pt(),Xe=q.target.files?.[0];Xe&&C({view:n,label:oe,image:await sl(Xe)}),q.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:b.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{Xt(async()=>{let q=await V(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(q),C(null),F(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,k.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:k.map(q=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||q.expression!=="neutral"&&!_e,onClick:()=>{Xt(async()=>{let oe=await V(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:q.expression})});t(oe),F(`${q.expression} copied to this Village.`)})},children:q.expression},q.expression))})]}):null,j.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:q=>{Xt(async()=>t(await V(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:q.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:q=>{Xt(async()=>t(await V(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(q.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{Xt(()=>gS(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,v?(0,r.jsx)("p",{role:"alert",children:v}):null]})}function bS({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,s]=(0,m.useState)(e.improvement?.description??""),[c,u]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[f,b]=(0,m.useState)(""),C=M=>{x(!0),b(""),t(M,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>b(U(w,"That Venue request could not be decided."))).finally(()=>x(!1))},k=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:M=>n(M.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:M=>s(M.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:M=>u(Number(M.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:M=>g(Number(M.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$||!a.trim()||!o.trim(),onClick:()=>C(!0),children:k?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$,onClick:()=>C(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function vS({room:e,nameColors:t,speechColors:a,picture:n,draft:o,mode:s,targetId:c,busy:u,error:h,greetingNotice:g,ruling:$,open:x,ended:f,playerName:b,playerPortrait:C,portraits:k,sprites:M,onDraft:w,onMode:y,onTarget:v,onSend:S,onViewVenue:O,onEnterPrivate:F,privateSpaceOwnerName:H,onEnd:j,onLeavePending:ve,endFailed:X,onRetryGreeting:_e,onContinueWithoutGreeting:rt,notices:mt,onDismissNotice:$i,debugDiscardEnabled:Xt,onDebugDiscard:pt,onUseMailbox:q}){let[oe,Xe]=(0,m.useState)(0),[aa,ce]=(0,m.useState)(!1),[re,Dt]=(0,m.useState)(!1),[Ra,Z]=(0,m.useState)(!1),[fa,gt]=(0,m.useState)(!1),[_t,ge]=(0,m.useState)(null),Ke=(0,m.useRef)(null),ie=(0,m.useRef)(null),ft=(0,m.useRef)(null),Ma=(0,m.useRef)(null),Qt=(0,m.useRef)(null),Oa=(0,m.useRef)(null),$t=(0,m.useRef)(null),fn=(0,m.useRef)(null),A=(0,m.useRef)(null),B=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(mt.map(J=>J.id)),ue=mt.some(J=>J.kind==="memory"&&!B.current.has(J.id));B.current=E,ue?Z(!0):mt.length===0&&Z(!1)},[mt,e.id]),(0,m.useEffect)(()=>{aa&&window.requestAnimationFrame(()=>Oa.current?.focus())},[aa]),(0,m.useEffect)(()=>{if(!re)return;let E=J=>{fn.current?.contains(J.target)||Dt(!1)},ue=J=>{J.key==="Escape"&&Dt(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",ue),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",ue)}},[re]),(0,m.useEffect)(()=>{if(!fa)return;let E=J=>{Ma.current?.contains(J.target)||gt(!1)},ue=J=>{J.key==="Escape"&&gt(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",ue),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",ue)}},[fa]);let de=(0,m.useCallback)(()=>{ge(null),window.requestAnimationFrame(()=>Ke.current?.focus())},[]);(0,m.useEffect)(()=>{if(!_t)return;window.requestAnimationFrame(()=>ie.current?.focus());let E=ue=>{if(ue.key==="Tab"){ue.preventDefault(),ie.current?.focus();return}ue.key==="Escape"&&(ue.preventDefault(),de())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[de,_t]);let $e=(0,m.useMemo)(()=>{let E=[],ue=new Map;for(let J of e.lines){if(J.kind!=="side"&&J.kind!=="whisper"||!J.asideFor)continue;let Je=ue.get(J.asideFor)??[];Je.push({register:J.kind,text:J.content,...J.targetId?{target:e.participants.find(Ht=>Ht.characterId===J.targetId)?.name??J.targetId}:{},speakerId:J.speakerId,name:J.name,expression:J.expression,gazeAt:J.gazeAt}),ue.set(J.asideFor,Je)}for(let J of e.lines){if(J.kind==="side"||J.kind==="whisper")continue;let Je=J.speakerId.length===0,Ht=g0(J.content,J.beats??null);Ht.paragraphs.forEach((et,bn)=>{E.push({key:`${E.length}`,speakerId:Je?"":J.speakerId,name:Je?b:J.name,player:Je,text:et,asides:[...Ht.asides[bn]??[],...bn===Ht.paragraphs.length-1?ue.get(J.id??"")??[]:[]],...J.kind?{register:J.kind==="narration"?"narration":"speech"}:{},...J.expression?{expression:J.expression}:{},...J.gazeAt?{gazeAt:J.gazeAt}:{}})})}return E},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{Xe(E=>$0(A.current,e.id,$e.length,E)),A.current={roomId:e.id,stepCount:$e.length}},[e.id,$e.length]);let Se=Math.min(oe,Math.max(0,$e.length-1)),te=$e[Se],st=Se>0,Q=Se<$e.length-1,Qe=!f&&e.status==="active"&&!Q,At=(0,m.useCallback)(()=>{let E=ft.current;if(!E)return;let ue=window.getComputedStyle(E),J=Number.parseFloat(ue.lineHeight),Je=Number.parseFloat(ue.paddingTop)+Number.parseFloat(ue.paddingBottom),Ht=Math.ceil(J+Je),et=Math.ceil(J*2+Je);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,Ht),et)}px`,E.style.overflowY=E.scrollHeight>et+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{At()},[Qe,o,At]),(0,m.useEffect)(()=>{let E=ft.current?.parentElement;if(!E)return;let ue=E.clientWidth,J=new ResizeObserver(()=>{E.clientWidth!==ue&&(ue=E.clientWidth,At())});return J.observe(E),()=>J.disconnect()},[Qe,At]);let Qa=()=>{!Qe||u||s!=="conclude"&&!o.trim()||s==="fulfill"&&!c||(gt(!1),S())};(0,m.useLayoutEffect)(()=>{$t.current&&($t.current.scrollTop=0)},[Se,e.id]);let xi=te?.register??(te===void 0||te.speakerId==="__venue_scene__"?"narration":te.player||p0(te.text)==="speech"?"speech":"narration"),ll=te===void 0?void 0:te.player?C:k[te.speakerId],Rt=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Vr=e.status==="closed"&&Rt.length===0?e.participants:Rt,Un=Vr.find(E=>E.characterId===te?.speakerId),Dr=E=>_u(a[E]),na=E=>_u(t[E]),Ni=Vr.slice(0,4),mo=Vr.filter(E=>!Ni.some(ue=>ue.characterId===E.characterId)),po=Ni.findIndex(E=>E.characterId===Un?.characterId)>=2?"left":"right",Iu=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":x?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${Rt.length?Rt.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:n?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:n,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${i}-chat-head`,children:[(0,r.jsx)("span",{className:`${i}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:fn,className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-actions-trigger`,onClick:()=>Dt(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":re,children:"\xB7\xB7\xB7"}),re?(0,r.jsxs)("span",{className:`${i}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Dt(!1),O()},disabled:u,children:"View Venue"}),F?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{Dt(!1),F()},disabled:u,children:["Enter ",H??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Dt(!1),j()},disabled:u,children:f?"Return to map":"End visit now"}),X||e.status==="closing"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Dt(!1),ve()},children:"Leave with memory pending"}):null,Xt&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Dt(!1),pt()},disabled:u,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,mt.length>0?(0,r.jsxs)("div",{className:`${i}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${i}-room-notices-trigger`,onClick:()=>Z(E=>!E),"aria-expanded":Ra,"aria-label":`${mt.length} village ${mt.length===1?"notice":"notices"}`,children:["\u2726 ",mt.length]}),Ra?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:mt.map(E=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:ue=>{Ke.current=ue.currentTarget,ge(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,r.jsx)("span",{children:E.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{_t?.id===E.id&&ge(null),$i(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,_t?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&de()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:_t.text}),(0,r.jsx)("button",{ref:ie,type:"button",onClick:de,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:_t.detail})]})}):null,Rt.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:Rt.map(E=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:Ni.map((E,ue)=>{let J=M[E.characterId],Je=E.characterId===Un?.characterId,Ht=te?.asides.find(qn=>qn.speakerId===E.characterId),et=Je?te?.expression??"neutral":Ht?.expression??"neutral",bn=Je?te?.gazeAt:Ht?.gazeAt??(E.characterId===te?.gazeAt?Un?.characterId:void 0),Si=Ni.findIndex(qn=>qn.characterId===bn),Ti=S0(J?.images??[],et,N0(ue,Si));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":E.characterId===Un?.characterId?"true":"false","data-sprite":Ti?"true":"false",children:[Ti?(0,r.jsx)("img",{src:Ti.image.url,alt:"","data-framing":J?.framing.mode??"full","data-facing":Ti.mirrored?"left":"right"}):(0,r.jsx)(ho,{portrait:k[E.characterId],name:E.name,className:`${i}-avatar`}),(0,r.jsx)("span",{style:na(E.characterId),children:E.name})]},E.characterId)})}),mo.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:mo.map(E=>(0,r.jsxs)("span",{children:[(0,r.jsx)(ho,{portrait:k[E.characterId],name:E.name,className:`${i}-avatar`}),(0,r.jsx)("span",{style:na(E.characterId),children:E.name})]},E.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[aa?(0,r.jsx)("div",{ref:Oa,className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(ce(!1),window.requestAnimationFrame(()=>Qt.current?.focus()))},children:e.lines.map((E,ue)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{style:E.role==="assistant"&&E.kind!=="narration"?na(E.speakerId):void 0,children:[E.role==="user"?b:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,r.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?Dr(E.speakerId):void 0,children:Mr(E.content,`history-${ue}-`)})]},E.id??ue))}):null,te&&te.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"data-side":po,"aria-live":"polite",children:te.asides.map((E,ue)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":E.register,children:[(0,r.jsx)(ho,{portrait:E.speakerId?k[E.speakerId]:ll,name:E.name??te.name,glyph:te.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,style:na(E.speakerId??te.speakerId),children:E.name??te.name}),E.register==="whisper"&&E.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,style:Dr(E.speakerId??te.speakerId),children:Mr(E.text,`vn-aside-${ue}-`)})]})]},`${ue}-${E.register}`))}):null,(0,r.jsx)("div",{className:`${i}-chat-vn-card`,"data-register":xi,children:(0,r.jsx)("div",{className:`${i}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[xi==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,style:te?.player?void 0:na(te?.speakerId??""),children:te?.name??""}),(0,r.jsxs)("div",{ref:$t,className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[te?xi==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Mr(te.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,style:te.player?void 0:Dr(te.speakerId),children:Mr(te.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:Rt.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&u?Iu:null]})]})})}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:Qt,type:"button",className:`${i}-chat-history-toggle`,"aria-label":"History","aria-expanded":aa,onClick:()=>ce(E=>!E),children:aa?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${Se+1} / ${Math.max(1,$e.length)}`}),(0,r.jsxs)("span",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Xe(Se-1),disabled:!st,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),Q?(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Xe(Se+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,r.jsx)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:j,disabled:u,children:"Return to map"}):null]})]}),h&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:h}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:j,disabled:u,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:_e,disabled:u,children:"Retry opening"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:rt,disabled:u,children:"Continue without opening"}):null]}):null,g?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:g})}):null,$?(0,r.jsx)("p",{className:`${i}-empty`,children:$}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,Qe&&s==="fulfill"&&Rt.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Qe?(0,r.jsxs)("div",{className:`${i}-composer`,children:[s==="fulfill"&&Rt.length>0?(0,r.jsxs)("select",{value:c,onChange:E=>v(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:u||f||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),Rt.map(E=>(0,r.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{ref:Ma,className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>gt(E=>!E),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":fa,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),fa?(0,r.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===E,disabled:u||E==="fulfill"&&Rt.length===0,onClick:()=>{y(E),gt(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),q?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:q,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{ref:ft,className:`${i}-textarea`,rows:1,value:o,onChange:E=>w(E.target.value),onKeyDown:E=>{w0(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),Qa())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:u||f||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:Qa,disabled:u||f||e.status!=="active"||s!=="conclude"&&o.trim().length===0||s==="fulfill"&&!c,"aria-label":u?"Sending":"Send",title:u?"Sending":"Send",children:u?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,r.jsx)("div",{className:`${i}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:h})}):null]})]})}var e1="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function yS({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};l();let d=new ResizeObserver(l);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[s,c]=(0,m.useState)(null),[u,h]=(0,m.useState)(null),[g,$]=(0,m.useState)(0),[x,f]=(0,m.useState)("residents"),[b,C]=(0,m.useState)(null),[k,M]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,S]=(0,m.useState)(0),[O,F]=(0,m.useState)(0),[H,j]=(0,m.useState)(null),[ve,X]=(0,m.useState)(!1),[_e,rt]=(0,m.useState)(""),[mt,$i]=(0,m.useState)(""),[Xt,pt]=(0,m.useState)(""),[q,oe]=(0,m.useState)(null),[Xe,aa]=(0,m.useState)(!1),[ce,re]=(0,m.useState)("home"),[Dt,Ra]=(0,m.useState)(null),[Z,fa]=(0,m.useState)("view"),[gt,_t]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(gt==="exterior")return;let l=n?.settings.venues.find(p=>p.id===Dt);(gt.startsWith("class:")?l&&gn(l).includes(gt.slice(6)):l&&gt.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(gt.slice(8))&&l.privateSpaces?.some(p=>p.ownerId===gt.slice(8)))||_t("exterior")},[n,Dt,gt]);let[ge,Ke]=(0,m.useState)(null),[ie,ft]=(0,m.useState)(null),[Ma,Qt]=(0,m.useState)(!1),[Oa,$t]=(0,m.useState)(""),[fn,A]=(0,m.useState)(""),[B,de]=(0,m.useState)(""),[$e,Se]=(0,m.useState)(null),[te,st]=(0,m.useState)(!1),[Q,Qe]=(0,m.useState)("village"),[At,Qa]=(0,m.useState)("index"),[xi,ll]=(0,m.useState)({}),[Rt,Vr]=(0,m.useState)(null),[Un,Dr]=(0,m.useState)({}),[na,Ni]=(0,m.useState)({}),[mo,po]=(0,m.useState)(""),[Iu,E]=(0,m.useState)(null),[ue,J]=(0,m.useState)(""),[Je,Ht]=(0,m.useState)(""),[et,bn]=(0,m.useState)(""),[Si,Ti]=(0,m.useState)(null),[qn,Gp]=(0,m.useState)(""),[cl,Yp]=(0,m.useState)([]),[Uu,Xp]=(0,m.useState)(1600),[Va,Qp]=(0,m.useState)([]),[go,Zp]=(0,m.useState)(1600),[qu,h1]=(0,m.useState)(null),[Kp,Jp]=(0,m.useState)(""),[ul,fo]=(0,m.useState)([]),[Fp,m1]=(0,m.useState)(""),[ba,dl]=(0,m.useState)([]),[ki,Zt]=(0,m.useState)(!1),[hl,Ei]=(0,m.useState)(!1),[p1,Bu]=(0,m.useState)(null),[g1,Lu]=(0,m.useState)(null),[ml,ju]=(0,m.useState)(null),[pl,Pp]=(0,m.useState)(""),[Ae,gl]=(0,m.useState)(0),[Za,Wp]=(0,m.useState)(""),[xt,eg]=(0,m.useState)(""),[vn,tg]=(0,m.useState)("rebuild"),[va,Gu]=(0,m.useState)(uo("rebuild").premise),[_r,ag]=(0,m.useState)(""),[f1,b1]=(0,m.useState)(Cp),[yn,ng]=(0,m.useState)([]),[v1,fl]=(0,m.useState)([]),[je,Ci]=(0,m.useState)([]),[Hr,Da]=(0,m.useState)(null),[y1,ig]=(0,m.useState)(0),[og,Yu]=(0,m.useState)(!1),[Xu,zi]=(0,m.useState)(null),[Ir,Bn]=(0,m.useState)(null),[Ka,bl]=(0,m.useState)(!1),[rg,Qu]=(0,m.useState)(""),[vl,sg]=(0,m.useState)(V0),[Re,Ai]=(0,m.useState)("generate"),[w1,Zu]=(0,m.useState)(""),[yl,Ku]=(0,m.useState)(null),[$1,lg]=(0,m.useState)(""),[Ur,Ju]=(0,m.useState)(null),[bo,Fu]=(0,m.useState)(""),[vo,Pu]=(0,m.useState)(""),qr=JSON.stringify({scenario:vn,premise:va.trim(),direction:_r.trim(),setting:xt.trim(),lorebooks:Va,loreBudget:go}),Wu=(0,m.useRef)(qr);(0,m.useEffect)(()=>{Wu.current!==qr&&!n?.isFounded&&Bn(null),Wu.current=qr},[qr,n?.isFounded]);let ed=JSON.stringify({setting:xt.trim(),worldFacts:n?.isFounded?yn:null,lorebooks:Va,structure:bo,negative:vo,options:vl}),[It,Br]=(0,m.useState)(!1),[cg,wl]=(0,m.useState)(""),[td,x1]=(0,m.useState)("Connections are still loading."),[ug,dg]=(0,m.useState)(!1),[N1,Lr]=(0,m.useState)(!1),[hg,fe]=(0,m.useState)(""),[S1,$l]=(0,m.useState)(!1),[xl,Nl]=(0,m.useState)(""),[_a,ad]=(0,m.useState)(null),[nd,jr]=(0,m.useState)(null),[T1,id]=(0,m.useState)(!1),[Ja,yo]=(0,m.useState)(""),[mg,Ln]=(0,m.useState)(null),wo=n?.settings.townMapView??Ou("cover"),pg=n?_a?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,gg=n?Re==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Ur&&yl===Re?Ur:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,k1=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Sl=_a?_a.image:xl||null,Ri=Re==="none"?null:Re==="existing"?xl||null:yl===Re&&(Re!=="generate"||$1===ed)&&w1||null,Tl=_a!==null||T1,Gr=Tl?nd??wo:wo,od=_a?Op(_a.size):null,[Yr,Oe]=(0,m.useState)(""),[Ut,K]=(0,m.useState)(""),[D,Y]=(0,m.useState)(!1),[I,Le]=(0,m.useState)(null),[E1,Xr]=(0,m.useState)(!1),[C1,Ha]=(0,m.useState)(!1),[Qr,wn]=(0,m.useState)(""),[Zr,kl]=(0,m.useState)("chat"),[Kr,rd]=(0,m.useState)(""),[z1,fg]=(0,m.useState)(""),[A1,Ia]=(0,m.useState)([]),Ua=(0,m.useRef)(new Set),[sd,R1]=(0,m.useState)(!1),bg=(0,m.useRef)(0),$o=(0,m.useRef)(0),vg=(0,m.useRef)(""),[ld,xo]=(0,m.useState)(""),[qa,tt]=(0,m.useState)(!1),No=(0,m.useRef)(!1),Mi=(0,m.useRef)(null),Jr=(0,m.useRef)(null),qt=(0,m.useRef)(null),So=(0,m.useCallback)(l=>{let d=[];for(let p of l)Ua.current.has(p.id)||(Ua.current.add(p.id),d.push(p));d.length>0&&Ia(p=>[...p,...d])},[]),Fr=(0,m.useRef)(!1),[M1,lt]=(0,m.useState)(""),[O1,Oi]=(0,m.useState)(""),[Pr,To]=(0,m.useState)(!1),[El,cd]=(0,m.useState)(""),yg=(0,m.useRef)(""),Cl=(0,m.useRef)(!1),[zl,wg]=(0,m.useState)(!1),ud=(0,m.useRef)(null),dd=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=dd.current,d=ud.current;l===null||!d||(dd.current=null,d.focus(),d.setSelectionRange(l,l))},[Je]);let Al=(0,m.useCallback)(async(l=!1)=>{if(Cl.current)return null;Cl.current=!0;let d=setTimeout(()=>wg(!0),Z2);try{let p=await V("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(d),wg(!1),Cl.current=!1}},[]),$g=(0,m.useCallback)(async()=>{let l=n?.happenings[0]?.id??"";cd("Writing...");let d=await Al(!0);if(!d){cd("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}cd((d.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,Al]),Te=(0,m.useCallback)(async(l={})=>{try{let d=await V("",{signal:l.signal});o(d),Oe("")}catch(d){if(l.signal?.aborted||l.quiet)return;o(null),Oe(U(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=n?.village.nextTransitionAt??"";l.length===0||l===yg.current||(yg.current=l,n?.isFounded&&Al())},[n,Al]);let Fa=(0,m.useCallback)(async l=>{try{let d=await V("/catalog",{signal:l});c(d.characters),Oe("")}catch(d){if(l?.aborted)return;Oe(U(d,"Could not read your character library."))}},[]),ko=(0,m.useCallback)(async l=>{try{let d=await V("/personas",{signal:l});Ti(d.personas)}catch(d){if(l?.aborted)return;Ti([]),Oe(U(d,"Could not read your Personas."))}},[]),Eo=(0,m.useCallback)(async l=>{try{let d=await V("/lorebooks",{signal:l});h1(d.books),Jp("")}catch(d){if(l?.aborted)return;Jp(U(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),xg=(0,m.useCallback)(async l=>{try{let d=await V("/story?offset=0&limit=50",{signal:l});h(d.entries),$(d.total)}catch(d){if(l?.aborted)return;h(null),Oe(U(d,"Could not read the village story."))}},[]),Rl=(0,m.useCallback)(async l=>{try{let d=await V("/memories",{signal:l});C(d),Oe("")}catch(d){if(l?.aborted)return;C(null),Oe(U(d,"Could not read villager memories."))}},[]),V1=(0,m.useCallback)(async(l,d)=>{let p=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){Y(!0);try{await V(`/memories/${l}/${encodeURIComponent(d)}`,{method:"DELETE"}),await Rl()}catch(N){Oe(U(N,"That memory could not be removed."))}finally{Y(!1)}}},[Rl]),D1=(0,m.useCallback)(async l=>{Y(!0);try{let d=await V(`/story/${encodeURIComponent(l)}`,{method:"DELETE"});h(d.entries),$(d.total),Oe("")}catch(d){Oe(U(d,"That memory could not be removed."))}finally{Y(!1)}},[]),_1=(0,m.useCallback)(async()=>{let l=u?.length??0;try{let d=await V(`/story?offset=${l}&limit=50`);h(p=>[...p??[],...d.entries]),$(d.total)}catch(d){Oe(U(d,"Could not read more memories."))}},[u]),Ml=(0,m.useCallback)(async l=>{try{let d=await V("/agendas",{signal:l});oe(d.villagers)}catch(d){if(l?.aborted)return;oe(null),Oe(U(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(ce!=="menu"||Q!=="agendas"&&Q!=="schedules"||!q?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Ml()},5e3);return()=>window.clearInterval(l)},[q,Ml,Q,ce]);let H1=(0,m.useCallback)(async l=>{Y(!0);try{let d=await V(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});oe(d.villagers),Oe("")}catch(d){Oe(U(d,"That villager could not be asked again."))}finally{Y(!1)}},[]),I1=(0,m.useCallback)(async(l,d)=>{Y(!0);try{let p=await V(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});oe(p.villagers),Oe("")}catch(p){Oe(U(p,"That wish completion could not be corrected."))}finally{Y(!1)}},[]),U1=(0,m.useCallback)(async(l,d)=>{Y(!0);try{let p=await V(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});oe(p.villagers),Oe("")}catch(p){Oe(U(p,"Schedule use could not be changed."))}finally{Y(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Te({signal:l.signal}),()=>l.abort()},[Te]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Te({quiet:!0})},d=setInterval(()=>{document.hidden||Cl.current||Te({quiet:!0})},Q2);return document.addEventListener("visibilitychange",l),()=>{clearInterval(d),document.removeEventListener("visibilitychange",l)}},[Te]),(0,m.useEffect)(()=>{if(!I?.id||I.status==="closed"||ce!=="room")return;vg.current!==I.id?(vg.current=I.id,$o.current=Date.parse(I.lastActivityAt||I.startedAt)||Date.now()):$o.current=Math.max($o.current,Date.parse(I.lastActivityAt||I.startedAt)||0);let l=!1,d=_=>{l||Ar(I.id,qt.current)||(Le(null),Ha(!1),Ia([]),Ua.current.clear(),xo(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),re("home"),Te())},p=(_=!1)=>{Ar(I.id,qt.current)||V("/rooms/active").then(async({session:L})=>{if(l||Ar(I.id,qt.current))return;if(L?.id===I.id){_&&(await V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})}),$o.current=Date.now());return}let be=await V(`/rooms/archive/${encodeURIComponent(I.id)}`).catch(()=>null);l||Ar(I.id,qt.current)||d(be?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(L=>{let be=Rr(L);be&&d(be)})},N=_=>{if(!Ar(I.id,qt.current)){if(Date.now()-$o.current>=30*6e4){_.cancelable&&_.preventDefault(),_.stopImmediatePropagation(),p(!0);return}$o.current=Date.now(),!(Date.now()-bg.current<15e3)&&(bg.current=Date.now(),V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})}).catch(L=>{let be=Rr(L);be?d(be):p()}))}},z=()=>p();window.addEventListener("focus",z),document.addEventListener("visibilitychange",z);for(let _ of["pointerdown","keydown","input","scroll"])window.addEventListener(_,N,!0);return()=>{l=!0,window.removeEventListener("focus",z),document.removeEventListener("visibilitychange",z);for(let _ of["pointerdown","keydown","input","scroll"])window.removeEventListener(_,N,!0)}},[I?.id,I?.status,I?.lastActivityAt,I?.startedAt,ce,Te]),(0,m.useEffect)(()=>{let l=new AbortController;return V("/rooms/active",{signal:l.signal}).then(({session:d,debugDiscardEnabled:p})=>{R1(p),!(l.signal.aborted||!d)&&(Le(d),kl("chat"),Ha(!0),re("room"),d.status==="opening"&&(tt(!0),V("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{l.signal.aborted||Le(N)}).catch(async N=>{if(l.signal.aborted)return;let z=await U0(d.id);l.signal.aborted||(z?Le(z):lt(B0(N)))}).finally(()=>{l.signal.aborted||tt(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(Q!=="chatlogs"||!n?.isFounded)return;let l=new AbortController,d=new URLSearchParams;return _e&&d.set("venueId",_e),mt&&d.set("characterId",mt),d.set("offset",String(v)),d.set("limit","20"),M(null),V(`/rooms/archive?${d.toString()}`,{signal:l.signal}).then(({visits:p,total:N})=>{l.signal.aborted||(M(p),y(N),pt(""))}).catch(p=>{l.signal.aborted||pt(U(p,"Venue visits could not be read."))}),()=>l.abort()},[_e,mt,v,O,Q,n?.isFounded]);let hd=(0,m.useCallback)(async l=>{try{let d=await V(`/rooms/archive/${encodeURIComponent(l)}`);j(d.visit),pt("")}catch(d){pt(U(d,"That visit could not be read."))}},[]),q1=(0,m.useCallback)(async l=>{Y(!0);try{await V(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await hd(l),F(d=>d+1),pt("")}catch(d){pt(U(d,"Memory filing is still pending."))}finally{Y(!1)}},[hd]),Ng=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){Y(!0);try{await V(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),j(null),S(0),F(d=>d+1),pt("")}catch(d){pt(U(d,"Visit transcripts could not be deleted."))}finally{Y(!1)}}},[]);(0,m.useEffect)(()=>{if(!Xe)return;let l=new AbortController;return Fa(l.signal),()=>l.abort()},[Xe,Fa]);let Sg=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Sg===null)return;let l=new AbortController;return(async()=>{try{let d=await V("/town-map",{signal:l.signal});Nl(d.image)}catch{l.signal.aborted||Nl("")}})(),()=>l.abort()},[Sg]);let B1=(0,m.useCallback)(async l=>{Y(!0);try{o(await V("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),Oe(""),await Fa()}catch(d){Oe(U(d,"That character could not move in."))}finally{Y(!1)}},[Fa]),L1=(0,m.useCallback)(async l=>{Y(!0);try{o(await V(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),Oe(""),s&&await Fa()}catch(d){Oe(U(d,"That villager could not leave."))}finally{Y(!1)}},[s,Fa]),j1=(0,m.useCallback)(async l=>{po(l);try{let d=await V(`/villagers/${encodeURIComponent(l)}/refresh`);Ni(p=>({...p,[l]:d})),Oe("")}catch(d){Oe(U(d,"That villager's card could not be compared."))}finally{po("")}},[]),G1=(0,m.useCallback)(async l=>{po(l);try{o(await V(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Ni(d=>{let p={...d};return delete p[l],p}),Oe("")}catch(d){Oe(U(d,"That villager's card could not be refreshed."))}finally{po("")}},[]),ct=(0,m.useCallback)(l=>{Qa(l==="noticeboard"?"noticeboard":l==="general"?"general":l==="replyGuidance"||l==="story"||l==="chatlogs"||l==="agendas"||l==="schedules"?"debug":"village"),K(""),st(!1),l==="villagers"&&Fa(),l==="villagers"&&(ce!=="menu"||Q!=="villagers")&&f("residents"),l==="village"&&ko(),l==="village"&&Eo(),l==="story"&&xg(),(l==="agendas"||l==="schedules")&&Ml(),l==="village"&&(ce!=="menu"||Q!=="village")&&n&&(Ht(n.settings.promptKnowledge),bn(n.settings.playerPersonaId),Gp(n.settings.setting),Yp(n.settings.selectedLorebookIds),Xp(n.settings.loreTokenBudget),fo(In(n.settings.venues).map(p=>({...p})))),Qe(l),re("menu")},[Ml,Fa,Eo,ko,xg,Q,ce,n]),md=(0,m.useCallback)(()=>{aa(!1),K(""),Se(null),st(!1),re("home")},[]),Y1=(0,m.useCallback)(async()=>{if(!(!I||qa)){if(!I.id||I.status==="closed"||Pr){qt.current=null,Ha(!1),Le(null),Ia([]),Ua.current.clear(),wn(""),Oi(""),re("home"),Te();return}tt(!0),lt(""),X(!1),Le({...I,status:"closing"}),qt.current={roomId:I.id,submissionId:""};try{let l=await V("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:I.id})});if(No.current)return;Le(l.session),To(!0),So(l.recordEvents??[]),wn(""),Oi(""),Te()}catch(l){if(No.current)return;qt.current=null;let d=Rr(l);if(d){Le(null),Ha(!1),Ia([]),Ua.current.clear(),xo(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),re("home"),Te();return}lt(U(l,"You could not leave the venue.")),X(!0)}finally{tt(!1)}}},[Te,So,I,qa,Pr]),X1=(0,m.useCallback)(async()=>{if(!I?.id||I.status!=="active"||qa||Fr.current)return;let l=Jr.current??Cu();Jr.current=l,qt.current={roomId:I.id,submissionId:l},tt(!0),lt(""),X(!1);try{let d=await V("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:I.id,submissionId:l,message:Qr}),signal:AbortSignal.timeout(3e5)});Le(d.session),To(!0),So(d.recordEvents??[]),Jr.current=null,wn(""),Te()}catch(d){let p=await q0(I.id,l);if(p){Le(p),To(!0),wn(""),lt(""),X(!1),Jr.current=null,Te();return}qt.current=null;let N=Rr(d);if(N){Le(null),Ha(!1),Ia([]),Ua.current.clear(),xo(N==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),re("home"),Te();return}lt(U(d,"The scene could not end yet.")),X(!0)}finally{tt(!1)}},[Te,So,I,qa,Qr]),Q1=(0,m.useCallback)(async()=>{if(!(!I?.id||No.current)){No.current=!0,tt(!0);try{await V("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:I.id})}),qt.current=null,Ha(!1),Le(null),Ia([]),Ua.current.clear(),re("home"),X(!1),Te()}catch(l){lt(U(l,"The visit could not be left yet.")),No.current=!1}finally{tt(!1)}}},[Te,I]),Z1=(0,m.useCallback)(async()=>{if(!(!I?.id||!sd||qa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){tt(!0);try{await V("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:I.id})}),Le(null),Ha(!1),Ia([]),Ua.current.clear(),wn(""),re("home"),Te()}catch(l){lt(U(l,"The debug discard failed."))}finally{tt(!1)}}},[I,sd,qa,Te]),K1=(0,m.useCallback)(async()=>{let l=Qr.trim();if(I===null||!I.id||Pr||qa||Fr.current||l.length===0)return;Fr.current=!0;let d=Mi.current??Cu();Mi.current=d;let p=I;try{await V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})})}catch(z){Fr.current=!1;let _=Rr(z);_?(Le(null),Ha(!1),Ia([]),Ua.current.clear(),xo(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),re("home"),Te()):lt(U(z,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};tt(!0),lt(""),wn(""),Le({...I,lines:[...I.lines,N]}),qt.current={roomId:I.id,submissionId:d};try{let z=await V("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:I.id,message:l,mode:Zr,targetId:Zr==="fulfill"?Kr:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});Le(z.session),To(z.session.status==="closed"),z.session.status!=="closed"&&(qt.current=null),So(z.recordEvents??[]),Kr&&!z.session.activeIds.includes(Kr)&&rd(""),fg(z.verdict?.reason??""),kl("chat"),Mi.current=null,Oi(""),Te()}catch(z){let _=await q0(I.id,d);if(_){Le(_),To(!0),lt(""),Mi.current=null,Oi(""),Te();return}qt.current=null;let L=Rr(z);if(L){Le(null),Ha(!1),Ia([]),Ua.current.clear(),xo(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),re("home"),Te();return}Le(p),wn(l),lt(U(z,"That line could not be sent."))}finally{Fr.current=!1,tt(!1)}},[Te,So,I,qa,Qr,Pr,Zr,Kr]),J1=(0,m.useCallback)(l=>(n?.villagers??[]).filter(d=>d.place?.id===l),[n]),Ol=(0,m.useCallback)(l=>{Se(null),st(!1),Ra(l.id),fa("view"),_t("exterior"),Ke(null),ft(null),re("venue")},[]),pd=(0,m.useCallback)(async l=>{tt(!0),lt(""),Oi("");try{let d=await V("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Le(d.session),Te()}catch(d){let p=await U0(l);p?Le(p):lt(B0(d))}finally{tt(!1)}},[Te]),F1=(0,m.useCallback)(async l=>{tt(!0);try{let{session:d}=await V("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Le(d),Oi(d.lines.length===0?"The opening failed. You can start the conversation now.":""),lt("")}catch(d){lt(U(d,"The visit could not continue. Retry or leave the venue."))}finally{tt(!1)}},[]),Vl=(0,m.useCallback)(async(l,d,p="",N)=>{No.current=!1,qt.current=null,Se(null),st(!1),Ln(null),wn(""),To(!1),lt(""),Oi(""),Ia([]),Ua.current.clear(),tt(!0),Le({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ha(!0),re("room");try{let{session:z}=await V("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:d,privateOwnerId:p,entryArea:N}),signal:AbortSignal.timeout(2e4)});Le(z),kl("chat"),rd(""),fg(""),xo(""),Ha(!0),Te(),z.status==="opening"&&await pd(z.id)}catch(z){lt(U(z,"That room could not be opened. Retry or leave the venue."))}finally{tt(!1)}},[pd,Te]),Tg=(0,m.useCallback)(l=>{st(!1),Se(l.id),re("home")},[]),kg=(0,m.useCallback)(()=>{Ra(null),fa("view"),_t("exterior"),Ke(null),ft(null),Se(null),re("home")},[]),P1=(0,m.useCallback)(async()=>{Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Je,playerPersonaId:et,setting:qn,selectedLorebookIds:cl,loreTokenBudget:Uu})}))}catch(l){K(U(l,"Those settings could not be saved."))}finally{Y(!1)}},[Je,cl,Uu,et,qn]),W1=(0,m.useCallback)(async l=>{Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(d){K(U(d,"That could not be saved."))}finally{Y(!1)}},[]),e$=(0,m.useCallback)(async l=>{let d=n?.settings.characterSpeechColors??!0;o(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:l}}),Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(p){o(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:d}}),K(U(p,"Character speech colors could not be saved."))}finally{Y(!1)}},[n?.settings.characterSpeechColors]),Eg=(0,m.useCallback)(async l=>{Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),F(d=>d+1)}catch(d){K(U(d,"Visit retention could not be saved."))}finally{Y(!1)}},[]),t$=(0,m.useCallback)(async()=>{if(!(n&&In(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){Y(!0),K("");try{let l=await V("/bootstrap",{method:"POST"});fo(l.places.map(d=>({id:ol(),name:d.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){K(U(l,"The village did not suggest any places."))}finally{Y(!1)}}},[n]),a$=(0,m.useCallback)(async()=>{if(xt.trim().length===0){fe("Describe what the village is like before generating its map.");return}Br(!0),fe("");try{let l=await V("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:bo===n?.settings.townMapLayoutPrompt?void 0:bo,negative:vo===n?.settings.townMapNegativePrompt?void 0:vo,setting:xt,options:vl,selectedLorebookIds:Va,scenarioImprint:n?.isFounded?{origin:"",worldFacts:yn,openingConditions:[],visualCues:[]}:null})}),d=await Mp(l.image);if(d.width!==l.width||d.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Zu(l.image),Ku("generate"),lg(ed),Ju(d),Ai("generate")}catch(l){fe(U(l,"The village map could not be generated."))}finally{Br(!1)}},[Va,vo,bo,xt,vl,ed,yn,n?.isFounded,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),n$=(0,m.useCallback)(async()=>{fe(""),Y(!0);try{let l=await V("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:xt,selectedLorebookIds:Va,loreTokenBudget:go})});fl(l.names)}catch(l){fe(U(l,"The village could not suggest names for the public venue."))}finally{Y(!1)}},[Va,go,xt]),i$=(0,m.useCallback)(async l=>{if(!l||!n)return;fe("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>d){let p=N=>Math.round(N/1e5)/10;fe(`That picture is ${p(l.size)} MB and a village map holds ${p(d)} MB. Choose a smaller copy.`);return}Br(!0);try{let p=await sl(l),N=await Mp(p);Zu(p),Ku("upload"),Ju(N),Ai("upload")}catch(p){fe(U(p,"That picture could not be used as the village map."))}finally{Br(!1)}},[n]),Cg=(0,m.useCallback)(async l=>{if(!l||!n)return;K("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>d){let p=N=>Math.round(N/1e5)/10;K(`That picture is ${p(l.size)} MB and the village map holds ${p(d)} MB. Try a smaller copy.`);return}Y(!0);try{let p=await sl(l),N=await Mp(p);ad({image:p,size:N}),jr(Ou("cover"))}catch(p){K(U(p,"That picture could not be used as the town map."))}finally{Y(!1)}},[n]),zg=(0,m.useCallback)(async()=>{if(!n)return;let l=_a?_a.image:xl;Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:l,townMapView:nd??n.settings.townMapView})})),Nl(l),ad(null),jr(null),id(!1)}catch(d){K(U(d,"The town map could not be saved."))}finally{Y(!1)}},[n,nd,xl,_a]),Dl=(0,m.useCallback)(()=>{ad(null),jr(null),id(!1),K("")},[]),Ag=(0,m.useCallback)(async()=>{Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Nl(""),Dl()}catch(l){K(U(l,"The town map could not be taken down."))}finally{Y(!1)}},[Dl]),o$=(0,m.useCallback)(async(l,d,p="")=>{if(!Ja){yo(l),Ln(null),K("");try{o(await V("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:d,privateOwnerId:p})}))}catch(N){Ln({id:l,text:U(N,"That place could not be drawn.")})}finally{yo("")}}},[Ja]),r$=(0,m.useCallback)(async(l,d,p,N="")=>{if(!(!d||!n||Ja)){yo(l),Ln(null),K("");try{let z=L=>Math.round(L/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){Ln({id:l,text:`That picture is ${z(d.size)} MB and a place holds ${z(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let _=await sl(d);o(await V("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:_,spaceClass:p,privateOwnerId:N})}))}catch(z){Ln({id:l,text:U(z,"That picture could not be kept.")})}finally{yo("")}}},[Ja,n]),s$=(0,m.useCallback)(async(l,d,p="")=>{if(!Ja){yo(l),Ln(null),K("");try{o(await V("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:d,privateOwnerId:p})}))}catch(N){Ln({id:l,text:U(N,"That picture could not be taken away.")})}finally{yo("")}}},[Ja]),l$=n?.settings.maxPlaces??48,Co=n?.settings.setupMaxVillagerCount??zp,Rg=(n?.settings.homeBuildings??[]).map(l=>({...l,name:n?.settings.homeBuildingNames?.[l.kind]??l.name})),c$=n&&!n.isFounded?1+Co:l$,_l=Math.max(0,c$-In(n?.settings.venues??[]).length),u$=(n?.settings.venues.length??0)+ul.filter(l=>!n?.settings.venues.some(d=>d.id===l.id)).length,Wr=(0,m.useCallback)(l=>{let d=qp(l);dl(d.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Bu(d[0]?.id??null),Zt(!1)},[]),Mg=(0,m.useCallback)(()=>{K(""),n&&Wr(n.settings.venues),Qa("village"),Qe("homes"),re("menu")},[Wr,n]),Og=(0,m.useCallback)((l,d)=>{if(K(""),ba.length>=_l||ba.length>=1+Co)return;let p=ol(),N=ba.length===0;dl(z=>[...z,{id:p,name:N?"Your residence":`Residence ${z.length+1}`,form:"Home",description:"",x:l,y:d,building:null,isPlayerHome:N,characterId:null}]),Bu(p)},[ba.length,_l,Co]),d$=(0,m.useCallback)((l,d,p)=>{let N=je.find(_=>_.category==="public-center"),z=Xu??(hl?N?.id:void 0);if(T0({x:l,y:d},je.filter(_=>_.id!==z).map(_=>_.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Qu("That photograph would cover another venue. Place it a little to the side.");return}if(Qu(""),z)Ci(_=>_.map(L=>L.id===z?{...L,presentation:{...L.presentation,x:l,y:d}}:L)),Da(z);else if(hl){let _=_0(ol(),"gathering",l,d);Ci(L=>[...L,_]),Da(_.id)}else if(ki){let _=je.filter(be=>be.classes?.includes("residence"));if(_.length>=1+Co)return;let L=_0(ol(),"residence",l,d,_.length===0,_.length+1);Ci(be=>[...be,L]),Da(L.id)}zi(null),Zt(!1),Ei(!1)},[Xu,ki,hl,Co,je]),Vi=(0,m.useCallback)((l,d)=>{Ci(p=>p.map(N=>N.id===l?d(N):N))},[]),h$=(0,m.useCallback)(l=>{Ci(d=>{let p=d.filter(N=>N.id!==l);if(!p.some(N=>N.occupancy.playerHome)){let N=p.findIndex(z=>z.classes?.includes("residence"));N>=0&&(p[N]={...p[N],occupancy:{...p[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),Da(d=>d===l?null:d)},[]),m$=(0,m.useCallback)((l,d)=>{Og(l,d),Zt(!1),re("menu")},[Og]),Vg=(0,m.useCallback)((l,d)=>{n?.settings.venues.some(p=>p.id===l&&p.occupancy.residentCharacterId)||dl(p=>p.map(N=>N.id===l?{...N,...d}:N))},[n]),p$=(0,m.useCallback)(l=>{if(n?.settings.venues.some(d=>d.id===l&&d.occupancy.residentCharacterId)){K("Move the resident to another venue before removing this home.");return}dl(d=>{let p=d.filter(N=>N.id!==l);return p.length>0&&!p.some(N=>N.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),g$=(0,m.useCallback)(async()=>{if(n){if(ba.some(l=>!l.description.trim())){K("Review a description for every home before saving.");return}Y(!0),K("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({venues:Y2(n.settings.venues,ba),venueScope:"homes"})})),Zt(!1)}catch(l){K(U(l,"Those homes could not be saved."))}finally{Y(!1)}}},[ba,n]),f$=async l=>{if(!n)return;let d=n.villagers.find(N=>N.characterId===l.characterId)?.name,p=l.isPlayerHome?`${co(n)}'s home`:d?`${d}'s home`:X0(Rg,l.building).name;Y(!0),K("");try{let N=await V("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:p,homeKind:l.building}]})});Vg(l.id,{description:N.descriptions[l.id]??""})}catch(N){K(U(N,"The home description could not be generated. You can write it by hand."))}finally{Y(!1)}},b$=l=>{if(n?.isFounded||l===vn)return;let d=uo(vn).premise,p=!!va.trim()&&va!==d;tg(l),p||Gu(uo(l).premise),ag(""),fe("")},es=(0,m.useCallback)((l,d)=>{K(""),fe(""),dg(!1),Lr(!1),$l(!1),aa(!1),J(""),gl(0),Wp(l?"":d?.village.name??""),eg(l?"":d?.village.setting??"");let p=l?"":d?.settings.foundingReason??"",N=Hp.some(Ao=>Ao.value===p),z=N?p:p?"custom":"rebuild",_=T2[p]??p,L=d?.settings.foundingDetails??"",be=[_,L].filter(Boolean).join(" "),ya=be.length>(d?.settings.foundingDetailsMaxLength??500),zo=d?.isFounded?L:p&&!N?ya?L:be:l||!p?uo(z).premise:L,vd=l?"":d?.isFounded?d.settings.foundingGuidance??"":[ya?_:"",d?.settings.foundingGuidance??""].filter(Boolean).join(" ");tg(z),Gu(zo),ag(z==="none"?"":vd),b1(l?Cp():d?.settings.scenarioImprint??Cp()),ng(l?[]:d?.settings.worldFacts??[]),fl([]);let wa=l||!d?[]:d.settings.venues.filter(Ao=>Ao.classes?.includes("residence")||Ao.category==="public-center");Ci(wa),Da(wa[0]?.id??null),zi(null),Bn(null),Qu(""),Qp(l?[]:d?.settings.selectedLorebookIds??[]),Zp(l?1600:d?.settings.loreTokenBudget??1600),sg({...V0}),Ai(l?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Zu(""),Ku(null),lg(""),Ju(null),Fu(d?.settings.townMapLayoutPrompt??""),Pu(d?.settings.townMapNegativePrompt??""),Br(!1),bn(l?"":d?.settings.playerPersonaId??""),ko(),Eo(),Wr(l||!d?[]:d.settings.venues),re("setup")},[Eo,ko,Wr]),Dg=(0,m.useCallback)(l=>{if(Ae===0&&l>0){if(Za.trim().length===0){fe("Give the village a name before continuing.");return}if(xt.trim().length===0){fe("Describe what the village is like before continuing.");return}if(!n?.isFounded&&!va.trim()){fe("Describe the village's first day before continuing.");return}}if(Ae===1&&l>1){if(!et.trim()){fe("Choose the Persona who lives in this village.");return}if(!Si?.some(d=>d.id===et)){fe("That Persona is no longer in your library. Choose another one to continue.");return}if(td.length>0){fe(td);return}if(ug){Lr(!0);return}}if(Ae===2&&l>2&&Re!=="none"&&!Ri){fe(Re==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ae===3&&l>3){let d=je.filter(L=>L.classes?.includes("residence")),p=d.filter(L=>!L.occupancy.playerHome),N=p.length;if(!d.some(L=>L.occupancy.playerHome)||N<D0||N>zp||!je.some(L=>L.category==="public-center")){fe("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let z=p.map(L=>L.occupancy.residentCharacterId).filter(Boolean);if(z.length!==p.length||new Set(z).size!==z.length){fe("Assign a different villager to each villager Residence before review.");return}let _=je.map(L=>({venue:L,field:L.name.trim()?L.form?.trim()?L.description.trim()?L.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:L})=>L);if(_){Da(_.venue.id),fe(`Complete ${_.field.replaceAll("-"," ")} for ${_.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${_.field}`)?.focus(),0);return}}Lr(!1),fe(""),gl(l),l===1&&ko(),l===0&&Eo(),l===3&&Fa(),Zt(!1),Ei(!1),zi(null)},[td,je,ug,Fa,ko,Eo,et,Si,Re,Ri,Za,va,n?.isFounded,xt,Ae,e]),v$=(0,m.useCallback)(()=>{Lr(!1),fe(""),gl(2),Zt(!1),Ei(!1)},[]),y$=(0,m.useCallback)(()=>{Lr(!1),fe("")},[]),ye=je.find(l=>l.id===Hr)??null,ts=ye?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{ig(0),Yu(!1)},[Hr,ts]),(0,m.useEffect)(()=>{if(!Hr||ye?.form?.trim()||og)return;let l=window.setInterval(()=>ig(d=>(d+1)%5),4e3);return()=>window.clearInterval(l)},[Hr,ye?.form,og]);let gd=ye?ot(ye,ye.category==="public-center"?"gathering":"residence"):null,w$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),$$=async(l,d)=>{if(Ka)return;if(!(d==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){Da(l.id),fe(`Add an ${d} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${d}-description`)?.focus(),0);return}let N=qr;bl(!0),fe("");try{let z=await V("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:w$(l),area:d,villageName:Za,setting:xt,foundingDetails:va,scenarioImprint:n?.isFounded?f1:null,worldFacts:n?.isFounded?yn:[],selectedLorebookIds:Va})});Wu.current===N&&Bn({venueId:l.id,area:d,image:z})}catch(z){fe(U(z,"Venue art could not be generated."))}finally{bl(!1)}},x$=async(l,d,p)=>{if(!(!p||Ka)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){fe("That venue image is too large. Choose a smaller file.");return}bl(!0),fe("");try{let N=await V("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await sl(p)})});Bn({venueId:l.id,area:d,image:N})}catch(N){fe(U(N,"That venue image could not be uploaded."))}finally{bl(!1)}}},N$=()=>{if(!Ir)return;let{venueId:l,area:d,image:p}=Ir;Vi(l,N=>d==="exterior"?{...N,presentation:{...N.presentation,image:p}}:{...N,spaces:[{...ot(N,N.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),Bn(null)},_g=(0,m.useCallback)(()=>{if(Za.trim().length===0)return"Give the village a name.";if(et.trim().length===0)return"Choose the Persona who lives in this village.";if(!n?.isFounded&&!va.trim())return"Describe the village's first day.";let l=yn.map(z=>z.trim()).filter(Boolean);if(n?.isFounded&&(l.length>4||l.some(z=>z.length>160)))return"Use at most four current world facts of 160 characters each.";if(xt.trim().length===0)return"Describe what the village is like.";if(Re!=="none"&&!Ri)return"Choose, generate, or upload the village map.";let d=je.filter(z=>z.classes?.includes("residence")),p=d.filter(z=>!z.occupancy.playerHome);if(p.length<D0||p.length>zp)return"Place one to three homes for initial villagers.";if(!d.some(z=>z.occupancy.playerHome))return"One Residence has to be yours.";if(je.some(z=>!z.name.trim()||!z.form?.trim()||!z.description.trim()||!z.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=p.map(z=>z.occupancy.residentCharacterId).filter(z=>z!==null);return N.length!==p.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":je.filter(z=>z.category==="public-center").length!==1?"Place one Gathering Place.":""},[je,et,Re,Ri,Za,va,n?.isFounded,yn,xt]),S$=(0,m.useCallback)(async()=>{let l=_g();if(l){let d=je.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(d){let p=d.name.trim()?d.form?.trim()?d.description.trim()?"interior-description":"exterior-description":"form":"venue-name";Da(d.id),gl(3),window.setTimeout(()=>e.querySelector(`#${i}-setup-${p}`)?.focus(),0)}fe(l);return}Y(!0),fe("");try{let d=await V("/setup",{method:"POST",body:JSON.stringify({name:Za.trim(),setting:xt.trim(),foundingReason:n?.isFounded?n.settings.foundingReason:vn,foundingDetails:n?.isFounded?n.settings.foundingDetails:va.trim(),foundingGuidance:n?.isFounded?n.settings.foundingGuidance:_r.trim(),scenarioImprint:n?.isFounded?n.settings.scenarioImprint:null,worldFacts:n?.isFounded?yn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:Va,loreTokenBudget:go,playerPersonaId:et,townMapImage:Ri??"",townMapView:Re==="existing"?wo:Ou("cover"),venues:je})});o(d),Zt(!1),re(!n?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){fe(U(d,"The village could not be founded."))}finally{Y(!1)}},[e,je,n?.isFounded,n?.settings.foundingReason,n?.settings.foundingDetails,n?.settings.foundingGuidance,n?.settings.scenarioImprint,et,wo,_g,Re,Ri,Za,vn,va,_r,yn,Va,go,xt]),T$=(0,m.useCallback)(async()=>{Y(!0),K("");try{let l=await V("/setup/reset",{method:"POST"});o(l),c(null),es(!0,l)}catch(l){K(U(l,"The village could not be reset."))}finally{Y(!1),$l(!1)}},[es]),Hg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||Hg.current||(Hg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&re("preparing"):es(!1,n))},[es,n]),(0,m.useEffect)(()=>{if(ce!=="preparing")return;let l=!1,d=async()=>{try{let N=await V("/setup/preparation");if(l)return;o(N),wl(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&re("home")}catch(N){l||wl(U(N,"Preparation status could not be read."))}};d();let p=window.setInterval(()=>{d()},2500);return()=>{l=!0,window.clearInterval(p)}},[ce]);let k$=(0,m.useCallback)(async()=>{wl("");try{o(await V("/setup/preparation/retry",{method:"POST"}))}catch(l){wl(U(l,"Preparation could not be retried."))}},[]),E$=(0,m.useCallback)(()=>{Ke({id:ol(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),C$=(0,m.useCallback)(async l=>{Y(!0),K("");try{let d=n?.settings.venues.some(_=>_.id===l.id)??!1,p=gn(l).map(_=>ot(l,_)),N=await V(d?`/locations/venue/${encodeURIComponent(l.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:l.name,form:l.form,classes:l.classes,residenceCapacity:l.residenceCapacity,spaces:p,workerIds:l.workerIds??[],presentation:{x:l.presentation.x,y:l.presentation.y},category:l.category,description:p[0]?.description??l.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),z=In(N.settings.venues).find(_=>d?_.id===l.id:_.name.toLowerCase()===l.name.trim().toLowerCase());o(N),Ke(null),fo(_=>{let L=_.map(be=>be.id===l.id&&z?z:be);return[...L,...In(N.settings.venues).filter(be=>!L.some(ya=>ya.id===be.id))]})}catch(d){K(U(d,"That place could not be saved."))}finally{Y(!1)}},[n]),z$=(0,m.useCallback)(async l=>{let d=n?.settings.venues.find(p=>p.id===l);if(!d){fo(p=>p.filter(N=>N.id!==l));return}Y(!0),K("");try{let p=await V(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){K(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,z=N||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${N} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(z))return;let _=await V(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(_),fo(L=>L.filter(be=>be.id!==l))}catch(p){K(U(p,"That place could not be removed."))}finally{Y(!1)}},[n]),Ig=(0,m.useCallback)(async(l,d)=>{Y(!0),K("");try{let p=xi[l.id]??l.venueDraft,N=await V(`/venue-requests/${encodeURIComponent(l.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(p):void 0});if(o(N),d){let z=new Set(ul.map(_=>_.id));fo(_=>[..._,...In(N.settings.venues).filter(L=>!z.has(L.id))])}ll(z=>{let _={...z};return delete _[l.id],_})}catch(p){K(U(p,d?"That venue could not be approved.":"That request could not be denied."))}finally{Y(!1)}},[xi,ul]),A$=(0,m.useCallback)(l=>{let d=ud.current,p=d?.selectionStart??Je.length,N=d?.selectionEnd??p;dd.current=p+l.length,Ht(`${Je.slice(0,p)}${l}${Je.slice(N)}`)},[Je]),Ug=(0,m.useCallback)(async()=>{let l=pl.trim();if(l.length!==0){Y(!0),K("");try{o(await V("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Pp("")}catch(d){K(U(d,"That notice could not be pinned up."))}finally{Y(!1)}}},[pl]),R$=(0,m.useCallback)(async l=>{Y(!0),K("");try{o(await V(`/noticeboard/${l}`,{method:"DELETE"}))}catch(d){K(U(d,"That notice could not be taken down."))}finally{Y(!1)}},[]),Hl=ue.trim().toLowerCase(),fd=(s??[]).filter(l=>Hl.length===0||l.name.toLowerCase().includes(Hl)||l.comment.toLowerCase().includes(Hl)||l.tags.some(d=>d.toLowerCase().includes(Hl))),qg=[...(n?.villagers??[]).map(l=>l.characterId),...Xe?fd.map(l=>l.id):[]].join(`
`),Bg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=qg.split(`
`).filter(p=>p.length>0&&!Bg.current.has(p));if(l.length===0)return;for(let p of l)Bg.current.add(p);let d=new AbortController;return(async()=>{try{let p=await U2(l,d.signal);d.signal.aborted||Dr(N=>({...N,...p}))}catch{}})(),()=>d.abort()},[qg]);let bd=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(E(null),bd.length===0)return;let l=new AbortController;return(async()=>{try{let d=await q2(bd,l.signal);l.signal.aborted||E(d)}catch{}})(),()=>l.abort()},[bd]);let ia=(0,m.useCallback)(l=>l?s?.find(d=>d.id===l)?.name??n?.villagers.find(d=>d.characterId===l)?.name??"":"",[s,n]),M$=(()=>{let l=n?.settings.venues??[],d=[],p=new Map;for(let N of n?.villagers??[]){let z=N.place?.id;if(!z)continue;let _=p.get(z);_?_.push(N):p.set(z,[N])}for(let N of l){let z=rl(N);if(!z)continue;let _=N.occupancy.residentCharacterId,L=Or(N),be=N.occupancy.playerHome?co(n):ia(_);d.push({id:N.id,x:z.x,y:z.y,text:L?tS(be):N.name,image:N.presentation.image?.url??null,tone:L?Q0({isPlayerHome:N.occupancy.playerHome,occupant:_}):"venue",selected:$e===N.id,doors:$e===N.id?[{label:"View venue",onSelect:()=>Ol(N)},{label:"Visit",onSelect:()=>{Vl(N)}}]:void 0,onSelect:()=>Tg(N)}),(p.get(N.id)??[]).forEach((ya,zo)=>{d.push({id:`villager:${ya.characterId}`,x:z.x,y:z.y,dy:nS*(zo+1),text:ya.name,tone:"resident",kind:"person"})})}return d})(),O$=je.flatMap(l=>{let d=rl(l);return d?[{id:l.id,x:d.x,y:d.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>Da(l.id)}]:[]});if(ce==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[I?(0,r.jsx)(vS,{room:I,nameColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:V2(n?.settings.venues??[],I),draft:Qr,mode:Zr,targetId:Kr,busy:qa,error:M1,greetingNotice:O1,ruling:z1,open:C1,ended:Pr,playerName:co(n),playerPortrait:Iu??void 0,portraits:Un,sprites:Object.fromEntries((n?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{Mi.current=null,Jr.current=null,wn(l)},onMode:l=>{Mi.current=null,kl(l)},onTarget:l=>{Mi.current=null,rd(l)},onSend:()=>{Zr==="conclude"?X1():K1()},onViewVenue:()=>{Ra(I.placeId),Ke(null),re("venue"),Te()},onEnterPrivate:I.area==="shared"&&I.privateAccessOwnerId?()=>{tt(!0),V("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:I.id,ownerId:I.privateAccessOwnerId})}).then(({session:l})=>{Le(l),Te()}).catch(l=>lt(U(l,"That private space could not be entered."))).finally(()=>tt(!1))}:void 0,privateSpaceOwnerName:ia(I.privateAccessOwnerId),onEnd:()=>{Y1()},notices:A1,onDismissNotice:l=>Ia(d=>d.filter(p=>p.id!==l)),debugDiscardEnabled:sd,onDebugDiscard:()=>{Z1()},onLeavePending:()=>{Q1()},endFailed:ve,onRetryGreeting:()=>{if(I.id)pd(I.id);else{let l=n?.settings.venues.find(d=>d.id===I.placeId);l&&Vl(l)}},onContinueWithoutGreeting:()=>{I.id&&F1(I.id)},onUseMailbox:n?.settings.venues.some(l=>l.id===I.placeId&&l.occupancy.playerHome&&(!I.spaceClass||I.spaceClass==="residence"))?()=>Xr(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:md,children:"Back to village"}),E1&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>Xr(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Xr(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:l.title}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[ia(d.characterId),":"]})," ",d.reply]},d.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,r.jsx)(bS,{entry:l,onDecide:async(d,p)=>{o(await V(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...p})}))}}):null,l.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,r.jsx)("p",{children:l.venueDraft.classes.map(d=>d[0].toUpperCase()+d.slice(1)).join(" / ")}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Xr(!1),ct("venueRequests")},children:"Review request"})]},l.id)),n.upgradeRequests.map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Xr(!1),ct("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(ce==="venue"){let l=(n?.settings.venues??[]).find(T=>T.id===Dt)??null;if(!n||!l)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:kg,children:"Back to map"})]})});let d=J1(l.id),p=gn(l),N=l.occupancy.homeKind?X0(Rg,l.occupancy.homeKind).name:"",z=l.occupancy.playerHome?co(n):ia(l.occupancy.residentCharacterId),_=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),L=p.includes("residence")&&_.length>0,be=I?.placeId===l.id&&(I.area==="shared"||I.area==="private"),ya=I?.placeId===l.id&&I.area==="private"?I.privateOwnerId:"",zo=l.occupancy.playerHome||l.playerSeenShared||be,vd=(l.privateSpaces??[]).filter(T=>l.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===ya),wa=I?.status!=="closed"&&I?.id?I:null,Ao=(l.playerInvitations??[]).some(T=>_.includes(T.residentId)),yd=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:p[0],ownerId:"",image:l.presentation.image,description:l.form||N||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...p.map(T=>{let W=ot(l,T),G=T==="residence",P=G?!zo:!l.playerSeenPublic&&!(wa?.placeId===l.id&&wa.area==="public"),He=!G||!L||l.occupancy.playerHome||Ao;return{key:`class:${T}`,label:p.length===1?"Interior":`${T[0].toUpperCase()}${T.slice(1)} interior`,subtitle:G?"Shared living space":`${T[0].toUpperCase()}${T.slice(1)} space`,area:G?"shared":"public",spaceClass:T,ownerId:"",image:P?null:W.image,description:P?"":W.description,state:P?void 0:W.state,locked:P,canEnter:He,accessLabel:He?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(T=>_.includes(T.ownerId)).map(T=>{let W=ia(T.ownerId),G=!l.playerSeenPrivateIds?.includes(T.ownerId)&&T.ownerId!==ya,P=(l.playerInvitations??[]).some(He=>He.scope==="private"&&He.ownerId===T.ownerId&&He.residentId===T.ownerId);return{key:`private:${T.ownerId}`,label:`${W}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:T.ownerId,image:G?null:T.image,description:G?"":T.description,state:G?void 0:T.state,locked:G,canEnter:P,accessLabel:P?"Owner's invitation available":"Owner's invitation required",adaptationPending:!G&&T.adaptationPending}})],se=yd.find(T=>T.key===gt)??yd[0],Il=wa?.placeId===l.id&&wa.area===se.area&&(se.area==="outside"||wa.spaceClass===se.spaceClass)&&(se.area!=="private"||wa.privateOwnerId===se.ownerId),wd=(T,W,G,P="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),W?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:W.url,alt:`${T} at ${l.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ja||D,onClick:()=>{o$(l.id,G,P)},children:W?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Ja||D,onChange:He=>{let as=He.target.files?.[0];He.target.value="",r$(l.id,as,G,P)}}),W?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ja||D,onClick:()=>{s$(l.id,G,P)},children:"Remove image"}):null]})]},P||G||"exterior"),Ro=T=>({name:T.name,form:T.form,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(W=>{let G=ot(T,W);return{description:G.description,condition:G.state.condition,items:G.state.items,publicFacts:G.state.publicFacts,features:G.state.features.map(({id:P,text:He,locked:as})=>({id:P,text:He,locked:as}))}}),privateSpaces:T.privateSpaces?.map(W=>({ownerId:W.ownerId,description:W.description,condition:W.state.condition,items:W.state.items,publicFacts:W.state.publicFacts,features:W.state.features.map(({id:G,text:P,locked:He})=>({id:G,text:P,locked:He}))}))}),V$=!!(ge&&JSON.stringify(Ro(ge))!==JSON.stringify(Ro(l))),D$=!!(ie&&(JSON.stringify(ie.classes)!==JSON.stringify(p)||ie.capacity!==(l.residenceCapacity??1)||ie.slot!==0||ie.title||ie.description||ie.extraBeds)),_$=()=>{(Z==="edit"&&V$||Z==="proposal"&&D$)&&!window.confirm("Discard your unsaved changes?")||(fa("view"),Ke(null),ft(null),$t(""),A(""))},Lg=(T,W)=>{o(T);let G=T.settings.venues.find(P=>P.id===l.id);G&&Ke(structuredClone(G)),A(W)},H$=async()=>{if(ge){if(L){let T=Ro(ge),W=Ro(l),G=p.indexOf("residence");if((G>=0&&JSON.stringify(T.spaces[G])!==JSON.stringify(W.spaces[G])||JSON.stringify(T.privateSpaces)!==JSON.stringify(W.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Qt(!0),$t(""),A("");try{let T=p.map(P=>ot(L&&P==="residence"?l:ge,P)),W=T[0],G=await V(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:ge.name,form:ge.form,description:L?l.description:W?.description??ge.description,spaces:T,workerIds:ge.workerIds??[],presentation:{x:ge.presentation.x,y:ge.presentation.y},state:L?l.state:{condition:W?.state.condition??"",furniture:W?.state.items??[],publicFacts:W?.state.publicFacts??[],features:W?.state.features??[]}})});Lg(G,"Venue details saved.")}catch(T){$t(U(T,"The Venue could not be saved."))}finally{Qt(!1)}}},jg=async(T,W="")=>{if(!ge)return;let G=T==="private"?ge.privateSpaces?.find(He=>He.ownerId===W):ot(ge,"residence");if(!G)return;let P=structuredClone(ge);if(T==="shared"?P.spaces=P.spaces?.map(He=>He.venueClass==="residence"?ot(l,"residence"):He):P.privateSpaces=P.privateSpaces?.map(He=>He.ownerId===W?l.privateSpaces?.find(as=>as.ownerId===W)??He:He),!(JSON.stringify(Ro(P))!==JSON.stringify(Ro(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Qt(!0),$t(""),A("");try{let He=await V(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:W,description:G.description,state:G.state})});Lg(He,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(He){$t(U(He,"That room edit could not be proposed."))}finally{Qt(!1)}}},Gg=aS(l,z);return(0,r.jsxs)("div",{className:`${i}-root`,"data-venue-view":Z==="view"?"true":void 0,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Z==="view"?Gg:`${Z==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Gg}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:Z==="view"?l.form||N||(d.length===0?"Nobody is here right now":`Villagers here: ${d.map(T=>T.name).join(", ")}`):Z==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:Z==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ke(structuredClone(l)),$t(""),A(""),fa("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{ft({classes:p,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),$t(""),A(""),fa("proposal")},children:"Propose Change"}),wa?.placeId===l.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>re("room"),children:"Return to scene"}):null]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:_$,children:Z==="edit"?"Close Editor":"Exit Change Proposal"})})]}),Z==="view"?(0,r.jsxs)("main",{className:i+"-venue-page","aria-label":"View Venue",children:[(0,r.jsxs)("nav",{className:i+"-venue-zones","aria-label":"Venue zones",children:[(0,r.jsx)("button",{type:"button",className:i+"-venue-back",onClick:kg,children:"\u2190 Back to map"}),yd.map(T=>(0,r.jsxs)("button",{type:"button",className:i+"-venue-zone-tab","data-active":se.key===T.key?"true":"false","aria-current":se.key===T.key?"page":void 0,onClick:()=>_t(T.key),children:[(0,r.jsx)("span",{className:i+"-venue-zone-thumb",children:T.image&&!T.locked?(0,r.jsx)("img",{src:T.image.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:T.locked?"\u25C8":"\u2302"})}),(0,r.jsxs)("span",{className:i+"-venue-zone-copy",children:[(0,r.jsx)("strong",{children:T.label}),(0,r.jsx)("small",{children:T.subtitle})]})]},T.key))]}),(0,r.jsxs)("div",{className:i+"-venue-zone-content",children:[(0,r.jsxs)("section",{className:i+"-venue-zone-main","aria-label":se.label,children:[(0,r.jsx)("div",{className:i+"-venue-artwork",children:se.image&&!se.locked?(0,r.jsx)("img",{src:se.image.url,alt:se.label+" at "+l.name}):(0,r.jsx)("div",{className:i+"-venue-artwork-empty",children:se.locked?"Area not discovered yet":"No image for this area yet"})}),(0,r.jsxs)("section",{className:i+"-venue-about",children:[(0,r.jsx)("h2",{children:"About this area"}),se.locked?(0,r.jsx)("p",{children:"This area has not been discovered yet."}):(0,r.jsx)("p",{children:se.description||"No description has been added for this area yet."}),se.adaptationPending?(0,r.jsx)("p",{children:"This room is still being adapted after a move."}):null,se.locked?null:(0,r.jsxs)("details",{className:i+"-venue-more",children:[(0,r.jsx)("summary",{children:"Show more details"}),se.state?.condition?(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Condition:"})," ",se.state.condition]}):null,se.state?.items.length?(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Present items:"})," ",se.state.items.join(", ")]}):null,se.state?.publicFacts.length?(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Established facts:"})," ",se.state.publicFacts.join(" \xB7 ")]}):null,se.state?.features.length?(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Defining features:"})," ",se.state.features.map(T=>T.text).join(" \xB7 ")]}):null,se.area==="outside"&&n.village.setting?(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Village:"})," ",n.village.setting]}):null,(l.editProposals??[]).filter(T=>se.area==="shared"?T.target==="shared":se.area==="private"&&T.target==="private"&&T.ownerId===se.ownerId).map(T=>(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Proposed room edit:"})," ",T.declined?"declined or stale":"approved by "+T.approvedIds.length+" of "+T.requiredIds.length+" residents"]},T.id))]})]})]}),(0,r.jsxs)("aside",{className:i+"-venue-zone-context",children:[(0,r.jsx)("span",{className:i+"-venue-kicker",children:"Zone"}),(0,r.jsx)("h2",{children:se.label}),(0,r.jsx)("p",{children:se.subtitle}),(0,r.jsxs)("div",{className:i+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Occupancy"}),(0,r.jsx)("strong",{children:p.includes("residence")?Hu(l)+" / "+L0(l)+" residents":d.length+" here now"})]}),(0,r.jsxs)("div",{className:i+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Accessibility"}),(0,r.jsx)("strong",{children:se.accessLabel})]}),se.locked&&!se.canEnter?(0,r.jsx)("p",{className:i+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,wa&&!Il?(0,r.jsx)("p",{className:i+"-venue-zone-guidance",children:"Finish the active visit before entering another area."}):null,(0,r.jsx)("button",{type:"button",className:i+"-venue-visit",disabled:qa||!Il&&(!!wa||!se.canEnter),onClick:()=>Il?re("room"):void Vl(l,se.spaceClass,se.ownerId,se.area),children:qa?"Opening visit\u2026":Il?"Return to scene \u2192":"Visit this area \u2192"})]}),se.area==="outside"&&p.includes("residence")&&!l.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:i+"-button",onClick:()=>{V("/locations/venue/"+encodeURIComponent(l.id)+"/player-move",{method:"POST"}).then(o).catch(T=>$t(U(T,"The move could not be requested.")))},children:"Request to live here"}):null,Oa?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:Oa}):null]})]}):Z==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[wd("Exterior image",l.presentation.image),p.filter(T=>T!=="residence"||zo).map(T=>wd(T==="residence"?"Shared Residence image":`${T} space image`,ot(l,T).image,T)),vd.map(T=>wd(`${ia(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Ja===l.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,mg?.id===l.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:mg.text}):null,ge?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(j0,{draft:ge,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!L||be),onChange:Ke}),L?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ma||!ge.name.trim(),onClick:()=>{H$()},children:"Save Venue details"}),L&&be?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ma||!ot(ge,"residence").description.trim(),onClick:()=>{jg("shared")},children:"Propose shared room edit"}):null]}),L&&!be?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,ya&&ge?.privateSpaces?.filter(T=>T.ownerId===ya).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",ia(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:W=>Ke(G=>G&&{...G,privateSpaces:G.privateSpaces?.map(P=>P.ownerId===T.ownerId?{...P,description:W.target.value}:P)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:W=>Ke(G=>G&&{...G,privateSpaces:G.privateSpaces?.map(P=>P.ownerId===T.ownerId?{...P,state:{...P.state,condition:W.target.value}}:P)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:W=>Ke(G=>G&&{...G,privateSpaces:G.privateSpaces?.map(P=>P.ownerId===T.ownerId?{...P,state:{...P.state,items:W.target.value.split(`
`)}}:P)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:W=>Ke(G=>G&&{...G,privateSpaces:G.privateSpaces?.map(P=>P.ownerId===T.ownerId?{...P,state:{...P.state,publicFacts:W.target.value.split(`
`)}}:P)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ma||!T.description.trim(),onClick:()=>{jg("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),L&&(l.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:B,onChange:T=>de(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==l.id&&gn(T).includes("residence")&&Hu(T)<L0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(l.residentIds??[]).map(T=>{let W=n.residences.find(G=>G.characterId===T&&G.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:ia(T)}),W?(0,r.jsx)("span",{className:`${i}-hint`,children:W.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!B||Ma,onClick:()=>{Qt(!0),V("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:B})}).then(o).catch(G=>$t(U(G,"The move could not be requested."))).finally(()=>Qt(!1))},children:"Ask to move"})]},T)})]}):null,fn?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:fn}):null,Oa?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Oa}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ie?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:r1.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:ie.classes.includes(T),disabled:!ie.classes.includes(T)&&ie.classes.length>=2,onChange:W=>ft(G=>G&&{...G,classes:W.target.checked?[...G.classes,T]:G.classes.filter(P=>P!==T)})})," ",T]},T))})]}),ie.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:ie.capacity,onChange:T=>ft({...ie,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:ie.slot,onChange:T=>ft({...ie,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:ie.title,onChange:T=>ft({...ie,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),ie.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:ie.description,onChange:T=>ft({...ie,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:ie.extraBeds,onChange:T=>ft({...ie,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ma||ie.classes.length<1||ie.title.trim().length>0&&!ie.description.trim(),onClick:()=>{Qt(!0),$t(""),V(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ie.classes,capacity:ie.capacity,...ie.title.trim()?{slot:ie.slot,improvement:{title:ie.title,description:ie.description,extraBeds:ie.extraBeds}}:{},title:ie.title||`Change ${l.name}`,detail:ie.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(T=>{o(T),ft(null),A("Proposal submitted.")}).catch(T=>$t(U(T,"The proposal could not be saved."))).finally(()=>Qt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:fn||"Proposal submitted."}),Oa?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Oa}):null]})})]})}if(ce==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":At,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[At]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:At!=="index"?()=>Qa("index"):md,children:At!=="index"?"Back to menu":"Back to the village"})})]}),Yr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Yr}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:At==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ct("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ct("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ct("story"),children:"DEBUG Settings"})]}):At==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([l,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":Q===l,onClick:()=>l==="homes"?Mg():ct(l),children:d},l))}):At==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([l,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":Q===l,onClick:()=>ct(l),children:d},l)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||D||zl,onClick:()=>{$g()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:e1}),El?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:El}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="villagers","data-active":Q==="villagers"?"true":"false",disabled:!n||D,onClick:()=>ct("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="noticeboard","data-active":Q==="noticeboard"?"true":"false",disabled:!n||D,onClick:()=>ct("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="venueRequests","data-active":Q==="venueRequests"?"true":"false",disabled:!n||D,onClick:()=>ct("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="homes","data-active":Q==="homes"?"true":"false",disabled:!n||D,onClick:Mg,children:`Homes (${qp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="map","data-active":Q==="map"?"true":"false",disabled:!n||D,onClick:()=>ct("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="village","data-active":Q==="village"?"true":"false",onClick:()=>ct("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="general","data-active":Q==="general"?"true":"false",onClick:()=>ct("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="replyGuidance","data-active":Q==="replyGuidance"?"true":"false",disabled:!n||D,onClick:()=>ct("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="story","data-active":Q==="story"?"true":"false",disabled:!n||D,onClick:()=>ct("story"),children:`DEBUG: Village Story (${u?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="chatlogs","data-active":Q==="chatlogs"?"true":"false",disabled:!n||D,onClick:()=>ct("chatlogs"),children:`DEBUG: Venue Visits (${k?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="agendas","data-active":Q==="agendas"?"true":"false",disabled:!n||D,onClick:()=>ct("agendas"),children:`DEBUG: Villager Wishes (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Q==="schedules","data-active":Q==="schedules"?"true":"false",disabled:!n||D,onClick:()=>ct("schedules"),children:`Villager Agendas (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||D||zl,onClick:()=>{$g()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:e1}),El?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:El}):null]})]}),Q==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(_p,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-row`,htmlFor:`${i}-speech-colors`,children:[(0,r.jsx)("input",{id:`${i}-speech-colors`,type:"checkbox",checked:n.settings.characterSpeechColors,disabled:D,onChange:l=>{e$(l.target.checked)}}),(0,r.jsx)("span",{children:"Character chat colors"})]}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:D,onChange:l=>{W1(l.target.value)},children:n.settings.storyPaces.map(l=>(0,r.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,r.jsx)("span",{className:`${i}-hint`,children:j2(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:D,onChange:l=>{let d=l.target.value;Eg({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:l=>{let d=Number(l.target.value);d!==n.settings.visitRetention.value&&Eg({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!n,onClick:()=>es(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:S1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:D,onClick:()=>{T$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>$l(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!n,onClick:()=>$l(!0),children:"Reset the village and start over"})})]}),Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]}):Q==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(hS,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),Sl?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:Sl,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:D,"aria-label":"Choose a town map picture",onChange:l=>{let d=l.target.files?.[0];l.target.value="",Cg(d)}}),_a?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{zg()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:Dl,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Ag()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:qn,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>Gp(l.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,r.jsx)(F0,{books:qu,error:Kp,selected:cl,onChange:Yp,disabled:D}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:Uu,disabled:D,onChange:l=>Xp(Number(l.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:E$,disabled:D||u$>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:Fp,onChange:l=>m1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(l=>`${l.name} ${l.form??""} ${gn(l).join(" ")}`.toLowerCase().includes(Fp.toLowerCase())).map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[l.form,gn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),gn(l).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ol(l),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke(structuredClone(l)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{z$(l.id)},"aria-label":`Delete ${l.name}`,disabled:D,children:"\xD7"})]})]},l.id))}),ge?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(l=>l.id===ge.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(j0,{draft:ge,existing:n.settings.venues.some(l=>l.id===ge.id),villagers:n.villagers,onChange:Ke}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!ge.name.trim()||!gn(ge).every(l=>ot(ge,l).description.trim()),onClick:()=>{C$(ge)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{t$()},disabled:D,children:"Suggest Venues"})}),ul.filter(l=>!n.settings.venues.some(d=>d.id===l.id)).map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:l.form}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke(l),children:"Review suggestion"})]},l.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:ud,className:`${i}-preset`,value:Je,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>Ht(l.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(l=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>A$(l.token),children:l.token},l.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(uS,{idPrefix:"settings",personas:Si,draft:et,onDraft:bn,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:D}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{P1()},disabled:D,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ht(n.settings.defaultPromptKnowledge)},disabled:D,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Je===n.settings.promptKnowledge&&et===n.settings.playerPersonaId&&qn===n.settings.setting&&JSON.stringify(cl)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[Q==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${i}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>f("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[n?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{f("memories"),C(null),Rl()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>aa(l=>!l),disabled:D,children:Xe?"Close the list":"Add a villager"})}),Xe?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:ue,onChange:l=>J(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),s===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):fd.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:fd.map(l=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,r.jsx)(ho,{portrait:Un[l.id],name:l.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:l.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:l.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{B1(l.id)},disabled:D||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(l=>(0,r.jsx)(pS,{villager:l,portrait:Un[l.characterId],selected:!1,onSelect:!l.place||I!==null?void 0:()=>{let d=n.settings.venues.find(p=>p.id===l.place?.id);d&&Tg(d)}},l.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(l=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:l.name}),l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,na[l.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:na[l.characterId].changed?`New card: ${na[l.characterId].proposed?.name??"unavailable"}`:na[l.characterId].sourceAvailable?`Snapshot revision ${na[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Vr(Rt===l.characterId?null:l.characterId),"aria-expanded":Rt===l.characterId,children:Rt===l.characterId?"Close sprite studio":`Sprites \xB7 ${l.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{j1(l.characterId)},disabled:D||mo.length>0,children:"Compare card"}),na[l.characterId]?.changed&&na[l.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{G1(l.characterId)},disabled:D||mo.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{L1(l.characterId)},disabled:D||mo.length>0,children:"Move out"})]})]}),Rt===l.characterId?(0,r.jsx)(fS,{villager:l,onSaved:o}):null]},l.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(A2,{library:b,busy:D,onRefresh:()=>{C(null),Rl()},onForget:(l,d)=>{V1(l,d)}})]}):null,Q==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((l,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[l.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{R$(d)},disabled:D,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${d}:${l.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:pl,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Pp(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Ug())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ug()},disabled:D||pl.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,Q==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(l=>{let d=xi[l.id]??l.venueDraft,p=N=>ll(z=>({...z,[l.id]:{...d,...N}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:l.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:N=>p({name:N.target.value})}),(0,r.jsxs)("select",{className:`${i}-notice-input`,value:d.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:N=>p({classes:[N.target.value]}),children:[(0,r.jsx)("option",{value:"residence",children:"Residence"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:N=>p({description:N.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!d.name.trim(),onClick:()=>{Y(!0),K(""),V("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:d.name,classes:d.classes}]})}).then(N=>p({description:N.descriptions[l.id]??""})).catch(N=>K(U(N,"The description draft could not be generated."))).finally(()=>Y(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!d.name.trim()||d.classes.length===0||!d.description?.trim(),onClick:()=>{Ig(l,!0)},children:d.name!==l.venueDraft.name||JSON.stringify(d.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Ig(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:l.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Y(!0),K(""),V(`/venue-upgrades/${encodeURIComponent(l.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>K(U(p,"The upgrade request could not be decided."))).finally(()=>Y(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},l.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(l=>l.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(l=>l.status!=="current").map(l=>{let d=ia(l.characterId),p=n.settings.venues.find(N=>N.id===l.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${p}`}),l.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Y(!0),K(""),V("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(N=>K(U(N,"The move could not be completed."))).finally(()=>Y(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(N=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Y(!0),K(""),V(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(z=>K(U(z,"The move request could not be decided."))).finally(()=>Y(!1))},children:N?"Approve move":"Deny"},String(N)))]},l.characterId)}),Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]}):null,Q==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||ba.length>=_l,onClick:()=>{Zt(!0),md()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${ba.length} of at most ${_l}`})]}),ba.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(dS,{homes:ba,villagers:(n?.villagers??[]).map(l=>({id:l.characterId,name:l.name})),disabled:D,selectedId:p1,onPatch:Vg,onRemove:p$,onSelect:Bu,showDescriptions:!0,onGenerateDescription:l=>{f$(l)},lockedIds:new Set(n.settings.venues.filter(l=>l.occupancy.residentCharacterId).map(l=>l.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{g$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>Wr(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:G2(n.settings.venues,ba)?"No unsaved changes.":"Unsaved changes."})]})]}):null,Q==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Dp,{src:Sl,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(l=>{let d=rl(l);if(!d)return[];let p=l.occupancy.residentCharacterId?ia(l.occupancy.residentCharacterId):l.occupancy.playerHome?co(n):"";return[{id:l.id,x:d.x,y:d.y,text:p?`${l.name||"Home"} \xB7 ${p}`:l.name,tone:Or(l)?Q0({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>Lu(l.id)}]}),placing:ml!==null,view:Gr,shape:pg,zoom:k1,onView:Tl?jr:void 0,onPlace:ml?(l,d)=>{let p=ml;Y(!0),K(""),V(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:l,y:d}})}).then(o).catch(N=>K(U(N,"The venue could not be placed."))).finally(()=>{Y(!1),ju(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(l=>{let d=l.occupancy.residentCharacterId?ia(l.occupancy.residentCharacterId):l.occupancy.playerHome?co(n):"",p=!!l.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":g1===l.id,onClick:()=>Lu(l.id),children:l.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:rl(l)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||p,onClick:()=>{Lu(l.id),ju(l.id)},children:rl(l)?"Move pin":"Place pin"})]},l.id)}),ml?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ju(null),children:"Cancel pin placement"}):null,Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]}),Tl?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:Z0.map(l=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Gr.fit===l.fit?"true":"false","aria-pressed":Gr.fit===l.fit,onClick:()=>jr({...Gr,fit:l.fit}),children:l.label},l.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:Z0.find(l=>l.fit===Gr.fit)?.help})]}):null,od?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":od.tone,children:od.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:D,"aria-label":"Choose a town map picture",onChange:l=>{let d=l.target.files?.[0];l.target.value="",Cg(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Ag()},children:"Remove background image"}):null]}),Tl?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{zg()},children:_a?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:Dl,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>id(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),In(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:In(n.settings.venues).map(l=>(0,r.jsxs)("li",{className:`${i}-place`,children:[l.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:l.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:l.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Ol(l)},children:"View Venue"})})]})]},l.id))})]})]}):null,Q==="replyGuidance"?(0,r.jsx)(mS,{}):null,Q==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),u===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):C2(u).map(l=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:l.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:l.entries.map(d=>{let p=Ip(d),N=d.actors.map(z=>z.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${N}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:D,onClick:()=>{D1(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${l.label}:${l.entries[0]?.id??""}`)),u&&u.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{_1()},children:["Load more memories (",u.length," of ",g,")"]}):null]}):null,Q==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:_e,onChange:l=>{rt(l.target.value),S(0),j(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(l=>(0,r.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:mt,onChange:l=>{$i(l.target.value),S(0),j(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(l=>(0,r.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||w===0,onClick:()=>{Ng()},children:"Delete all completed logs"}),Xt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Xt}):null,k===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):k.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):k.map(l=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[l.placeName," \xB7 ",Du(l.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[l.participants.map(d=>d.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{hd(l.id)},children:H?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{q1(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Ng(l.id)},children:"Delete log"})]}),H?.id===l.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${i}-story`,children:H.lines.map((d,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[(0,r.jsx)("span",{style:n?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?_u(n.villagers.find(N=>N.characterId===d.speakerId)?.nameColor):void 0,children:d.name||co(n)})," \xB7 ",Du(d.at)]}),(0,r.jsx)("span",{style:n?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?_u(n.villagers.find(N=>N.characterId===d.speakerId)?.dialogueColor):void 0,children:Mr(d.content,`venue-${l.id}-${p}-`)}),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(N=>H.participants.find(z=>z.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${l.id}:${p}`))}),(H.submissions??[]).some(d=>d.recollections?.length)?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.submissions??[]).flatMap(d=>(d.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,H.memoryReview&&H.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,open:H.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${H.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[`${H.memoryReview?.attempts??0} review attempts`,H.memoryReview?.error?` \xB7 Last error: ${H.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.memoryReview?.decisions??[]).map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:`${d.action==="promote"?"Promoted":"Rejected"}${d.category?` \xB7 ${a1[d.category]}`:""}`}),d.text?(0,r.jsx)("p",{children:d.text}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:d.reason}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${d.recollectionIds.join(", ")}`})]},d.id))})]})]}):null]}):null]},l.id)),w>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v===0,onClick:()=>{S(Math.max(0,v-20)),j(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v+20>=w,onClick:()=>{S(v+20),j(null)},children:"Next"})]}):null]}):null,Q==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:q.map(l=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[l.name,l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:l.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${O2(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),l.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:l.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{I1(l.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},l.characterId))})]}):null,Q==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:q.map(l=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Rp(l)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[l.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:D,onChange:d=>{U1(l.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{H1(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Rp(l)?" Earlier hours retain the previous plan.":""]}):Rp(l)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:l.days.map(d=>{let p=d.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[d.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[d.weekday]:void 0)??l.agenda?.week?.[d.weekday]??[],N=l.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((z,_)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[H0(z.startMinute),"\u2013",H0(z.endMinute)]}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{children:z.venueId?R2(n?.settings.venues??[],z.venueId):"Home"}),(0,r.jsx)("span",{children:z.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:z.status==="idle"?"Available":z.status==="dnd"?"Busy":z.status==="offline"?"Offline":"Online"})]},`${z.startMinute}-${z.endMinute}-${_}`))})]}),l.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:N.map((z,_)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:z.time}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:z.status||"No availability set"})]},`${z.time}-${_}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},l.characterId))})]}):null,Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]})]});if(ce==="preparing"){let l=n?.foundingPreparation,d=n?.villagers.length??0,p=l?.completedIds.length??0,N=n?.villagers.find(be=>be.characterId===l?.currentId)?.name,z=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",_=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,L=l?.status==="pending"&&Number.isFinite(_)?Math.max(0,Math.floor((Date.now()-_)/1e3)):null;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${d} villagers ready`}),l?.status==="pending"&&l.stage?(0,r.jsxs)("p",{children:[z,N?` for ${N}`:"","."]}):null,l?.attempt?(0,r.jsx)("p",{children:`Attempt ${l.attempt} of 3${L!==null?` \xB7 ${L}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,r.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,r.jsx)("p",{className:`${i}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:l.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{k$()},children:"Retry this villager"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(_p,{})]})]}):null,cg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:cg}):null]})})}if(ce==="setup"){let l=(s??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsx)("div",{className:`${i}-root ${i}-home ${i}-setup-root`,children:(0,r.jsxs)("div",{className:`${i}-home-body ${i}-setup-body`,"data-step":Ae,children:[(0,r.jsx)("aside",{className:`${i}-setup-rail`,"aria-label":"Founding progress",children:Ru.map((d,p)=>(0,r.jsxs)("div",{className:`${i}-setup-rail-step`,"data-active":p===Ae?"true":"false","data-done":p<Ae?"true":"false","aria-current":p===Ae?"step":void 0,children:[(0,r.jsx)("span",{className:`${i}-setup-rail-number`,children:p+1}),(0,r.jsx)("span",{children:d})]},d))}),(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${i}-setup-kicker`,children:["Step ",Ae+1," of ",Ru.length," \xB7 ",Ru[Ae]]}),Ae===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Za,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:D,onChange:d=>Wp(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${i}-scenario-options`,children:Hp.filter(d=>d.value!=="custom"||n?.isFounded&&vn==="custom").map(d=>(0,r.jsxs)("label",{className:`${i}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-scenario`,checked:vn===d.value,disabled:D||n?.isFounded,onChange:()=>b$(d.value)}),(0,r.jsx)("span",{className:`${i}-scenario-icon`,"aria-hidden":"true",children:d.icon}),(0,r.jsx)("strong",{children:d.label}),(0,r.jsx)("small",{children:d.description})]},d.value))})]}),n?.isFounded?(0,r.jsx)("p",{className:`${i}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ae===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(cS,{personas:Si,draft:et,onDraft:bn,disabled:D}),(0,r.jsx)(_p,{onSetupProblem:x1,onImageWarningChange:dg,compact:!0}),N1?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:y$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:v$,children:"I understand, continue"})]})]}):null]}):null,Ae===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:xt,maxLength:n?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:D||It,onChange:d=>{eg(d.target.value),fl([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:"Day 1 record"}),(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.foundingDetails||"This village has no recorded first-day description."}),(0,r.jsx)("span",{className:`${i}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:"What happens on the village's first day?"}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:va,maxLength:n?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:D,onChange:d=>Gu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${i}-world-facts`,className:`${i}-textarea`,value:yn.join(`
`),disabled:D,placeholder:"One stable fact per line, up to four.",onChange:d=>ng(d.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,r.jsx)(F0,{books:qu,error:Kp,selected:Va,onChange:d=>{Qp(d),fl([])},disabled:D}),(0,r.jsxs)("details",{className:`${i}-field`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced lore settings"}),(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:go,disabled:D,onChange:d=>Zp(Number(d.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ae===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Re==="generate"?"true":"false","aria-pressed":Re==="generate",disabled:It,onClick:()=>Ai("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Re==="upload"?"true":"false","aria-pressed":Re==="upload",disabled:It,onClick:()=>Ai("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Re==="none"?"true":"false","aria-pressed":Re==="none",disabled:It,onClick:()=>Ai("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Re==="existing"?"true":"false","aria-pressed":Re==="existing",disabled:It,onClick:()=>Ai("existing"),children:"Keep current map"}):null]}),Re==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced map elements"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,p])=>(0,r.jsxs)("label",{className:`${i}-label`,children:[p,(0,r.jsxs)("select",{className:`${i}-select`,value:vl[d],disabled:It,onChange:N=>sg(z=>({...z,[d]:N.target.value})),children:[(0,r.jsx)("option",{value:"auto",children:"Auto"}),(0,r.jsx)("option",{value:"include",children:"Include"}),(0,r.jsx)("option",{value:"exclude",children:"Exclude"})]})]},d))})]}),(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Testing prompt controls"}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:bo,maxLength:1500,disabled:It,onChange:d=>Fu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:vo,maxLength:1500,disabled:It,onChange:d=>Pu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:It||bo===n?.settings.townMapLayoutPrompt&&vo===n?.settings.townMapNegativePrompt,onClick:()=>{Fu(n?.settings.townMapLayoutPrompt??""),Pu(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:It||xt.trim().length===0,onClick:()=>{a$()},children:It?"Generating map\u2026":yl==="generate"?"Generate again":"Generate map"})})]}):null,Re==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:It,"aria-label":"Choose a village map image",onChange:d=>{let p=d.target.files?.[0];d.target.value="",i$(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,Re==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Ur&&Re!=="none"&&yl===Re&&gg?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Op(Ur).tone,children:Op(Ur).text}):null]}):null,Ae===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ka||je.filter(d=>d.classes?.includes("residence")).length>=1+Co,onClick:()=>{Zt(!0),Ei(!1),zi(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ka||je.some(d=>d.category==="public-center"),onClick:()=>{Zt(!1),Ei(!0),zi(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ka||je.length===0,onClick:()=>{Ci([]),Da(null),Bn(null),zi(null),Zt(!1),Ei(!1)},children:"Reset all venues"})]}),rg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:rg}):null,(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:je.map(d=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":d.id===Hr?"true":"false",onClick:()=>Da(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":ia(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),ye&&gd?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[ye.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",ye.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{zi(ye.id),Zt(!1),Ei(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>h$(ye.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{id:`${i}-setup-venue-name`,className:`${i}-notice-input`,value:ye.name,maxLength:100,onChange:d=>Vi(ye.id,p=>({...p,name:d.target.value}))})]}),ye.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ka,onClick:()=>{n$()},children:"Suggest three names"}),v1.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Vi(ye.id,p=>({...p,name:d})),children:d},d))]}):null,(0,r.jsxs)("p",{className:`${i}-hint`,children:["Class: ",ts==="gathering"?"Gathering":"Residence"]}),(0,r.jsxs)("div",{className:`${i}-setup-form-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-form`,children:"Form"}),(0,r.jsx)("textarea",{id:`${i}-setup-form`,className:`${i}-textarea`,rows:2,value:ye.form??"",maxLength:240,placeholder:E2[ts][y1],onFocus:()=>Yu(!0),onBlur:()=>Yu(!1),onChange:d=>{Vi(ye.id,p=>({...p,form:d.target.value})),fe("")}}),(0,r.jsx)("small",{className:`${i}-hint`,children:"What the Venue actually is"})]}),ye.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:ye.occupancy.residentCharacterId??"",disabled:ye.occupancy.playerHome,onChange:d=>Vi(ye.id,p=>({...p,residentIds:d.target.value?[d.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:ye.occupancy.playerHome?"You":"Choose a villager"}),l.map(d=>(0,r.jsx)("option",{value:d.id,disabled:je.some(p=>p.id!==ye.id&&p.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsx)("div",{className:`${i}-setup-place-spaces`,children:["exterior","interior"].map(d=>{let p=d==="exterior",N=p?"Exterior":"Interior",z=p?ye.presentation.image:gd.image;return(0,r.jsxs)("section",{className:`${i}-setup-place-space`,children:[(0,r.jsx)("h4",{children:N}),(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-${d}-description`,children:[N," Description \xB7 required"]}),(0,r.jsx)("textarea",{id:`${i}-setup-${d}-description`,className:`${i}-textarea`,value:p?ye.description:gd.description,maxLength:1e3,onChange:_=>{let L=_.target.value;Vi(ye.id,be=>p?{...be,description:L}:{...be,spaces:[{...ot(be,ts),description:L}]}),fe(""),Bn(null)}}),(0,r.jsxs)("span",{className:`${i}-label`,children:[N," Image \xB7 optional"]}),z?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:z.url,alt:`${d} of ${ye.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ka,onClick:()=>{$$(ye,d)},children:z?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Ka,"aria-label":`Upload ${d} image for ${ye.name}`,onChange:_=>{let L=_.target.files?.[0];_.target.value="",x$(ye,d,L)}}),z?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Vi(ye.id,_=>p?{..._,presentation:{..._.presentation,image:null}}:{..._,spaces:[{...ot(_,ts),image:null}]}),children:"Remove image"}):null]}),Ir?.venueId===ye.id&&Ir.area===d?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:Ir.image.url,alt:`New ${d} image preview`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:N$,children:"Use this image"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Bn(null),children:"Discard"})]}):null]},d)})})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),s===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ae===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Village Beginning"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:Za.trim()})," \xB7 ",xt.trim()]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",Si?.find(d=>d.id===et)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",uo(vn).label]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Day 1:"})," ",va||"No first-day description was recorded."]}),_r?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Original founding direction:"})," ",_r]}):null]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Map and lore"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",Re==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",Va.map(d=>qu?.find(p=>p.id===d)?.name??d).join(", ")||"None"]})]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Starting places"}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:je.map(d=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":ia(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),je.map(d=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]})]}):null,hg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:hg}):null,Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null]})}),(0,r.jsxs)("div",{className:`${i}-setup-visual`,children:[Ae<=1?(0,r.jsx)(rS,{scenario:vn}):(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(Dp,{src:Ri,alt:`A map of ${Za.trim()||"your new village"}.`,pins:Ae<3?[]:O$,placing:Ae===3&&(ki||hl||Xu!==null),view:Re==="existing"?wo:Ou("cover"),shape:gg,onPlace:Ae===3?d$:void 0,compact:Ae<2,mobile:t&&Ae>=2,photoPins:Ae>=3})})}),(0,r.jsxs)("nav",{className:`${i}-setup-footer`,"aria-label":"Founding navigation",children:[Ae>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||It||Ka,onClick:()=>Dg(Ae-1),children:"\u2190 Back"}):null,Ae<Ru.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:D||It||Ka,onClick:()=>Dg(Ae+1),children:"Next \u2192"}):(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:D||It||!n,onClick:()=>{S$()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Zt(!1),re("home")},children:"Show me the village"}):null]})]})]})})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(F2,{weather:n?.village.weather??""}),!t&&n?.isFounded&&In(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":te,"aria-controls":`${i}-places-list`,disabled:D,onClick:()=>{Se(null),st(l=>!l)},children:"Places"}),te?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(l=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:l.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ol(l),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Vl(l)},children:"Visit"})]},l.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||D,onClick:()=>ct("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(eS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:D||!n,onClick:()=>{Qa("index"),re("menu")},children:"\u2630"}),t?null:(0,r.jsx)(W2,{}),ki?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Zt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(Dp,{src:Sl,alt:`A map of ${n?.village.name??"the village"}.`,pins:M$,placing:ki,view:wo,shape:pg,onPlace:m$,onDismiss:()=>{Se(null),st(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Yr||Ut||ki||zl||ld?(0,r.jsxs)("div",{className:`${i}-notice`,children:[Yr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Yr}):null,Ut?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ut}):null,ki?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,zl?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,ld?(0,r.jsx)("p",{className:`${i}-status`,children:ld}):null]}):null})})})]})}var Bp=class extends HTMLElement{connectedCallback(){I0(),this.__root??(this.__root=(0,t1.createRoot)(this)),this.__root.render((0,r.jsx)(Up,{element:this,children:(0,r.jsx)(wS,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),I0()})}};function wS({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(SS,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(NS,{props:e.capabilityProps??{}}):(0,r.jsx)(yS,{element:e})}function $S(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var xS="marinara-active-chat-id";function u1(){try{window.localStorage.removeItem(xS)}catch{}window.location.reload()}function d1(e,t){let[a,n]=(0,m.useState)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let u=await V(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(u??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function NS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=d1(t,a&&t.length>0),[u,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!u)return;let b=k=>{g.current?.contains(k.target)||h(!1)},C=k=>{k.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",C)}},[u]),!a||!c||s===null)return null;let $=s.name||"your villager",x=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":u,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":u,title:f,"aria-label":f,children:[(0,r.jsx)($S,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),u?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),s.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:u1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function SS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=d1(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=n.name||"this villager",c=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:u1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Bp);
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
