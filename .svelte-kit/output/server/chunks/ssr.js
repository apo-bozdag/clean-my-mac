function m(){}function _(n){return n()}function $(){return Object.create(null)}function b(n){n.forEach(_)}function h(n,e){return n!=n?e==e:n!==e||n&&typeof n=="object"||typeof n=="function"}function w(n,...e){if(n==null){for(const r of e)r(void 0);return m}const t=n.subscribe(...e);return t.unsubscribe?()=>t.unsubscribe():t}let u;function f(n){u=n}function l(){if(!u)throw new Error("Function called outside component initialization");return u}function y(n,e){return l().$$.context.set(n,e),e}function x(n){return l().$$.context.get(n)}const g={$$render:()=>""};function v(n,e){if(!n||!n.$$render)throw e==="svelte:component"&&(e+=" this={...}"),new Error(`<${e}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${e}>.`);return n}let a;function j(n){function e(t,r,s,o,i){const c=u,d={on_destroy:a,context:new Map(i||(c?c.$$.context:[])),on_mount:[],before_update:[],after_update:[],callbacks:$()};f({$$:d});const p=n(t,r,s,o);return f(c),p}return{render:(t={},{$$slots:r={},context:s=new Map}={})=>{a=[];const o={title:"",head:"",css:new Set},i=e(o,t,{},r,s);return b(a),{html:i,css:{code:Array.from(o.css).map(c=>c.code).join(`
`),map:null},head:o.title+o.head}},$$render:e}}export{w as a,h as b,j as c,x as g,g as m,m as n,y as s,v};
