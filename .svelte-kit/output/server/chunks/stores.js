import{g as p}from"./ssr.js";import"./exports.js";import{o as i}from"./ssr2.js";const b=/[&"<]/g,d=/[&<]/g;function x(t,s=!1){const e=String(t),n=s?b:d;n.lastIndex=0;let a="",r=0;for(;n.test(e);){const o=n.lastIndex-1,c=e[o];a+=e.substring(r,o)+(c==="&"?"&amp;":c==='"'?"&quot;":"&lt;"),r=o+1}return a+e.substring(r)}function g(t,s=JSON.parse){try{return s(sessionStorage[t])}catch{}}const m="sveltekit:snapshot",S="sveltekit:scroll",_=i.toString().includes("$$")||/function \w+\(\) \{\}/.test(i.toString());_&&new URL("https://example.com");var u;(u=g(S))!=null;var l;(l=g(m))!=null;const f=()=>{const t=p("__svelte__");return{page:{subscribe:t.page.subscribe},navigating:{subscribe:t.navigating.subscribe},updated:t.updated}},R={subscribe(t){return f().page.subscribe(t)}};export{x as e,R as p};
