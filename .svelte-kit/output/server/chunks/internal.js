import{c as b,s as x,v as h,m as _}from"./ssr.js";import{a as k}from"./ssr2.js";let f="",m=f;const p={base:f,assets:m};function S(t){f=t.base,m=t.assets}function j(){f=p.base,m=p.assets}function q(t){m=p.assets=t}let w={},C={};function z(t){}function B(t){w=t}function I(t){C=t}let O=null;function P(t){O=t}function R(t){}let U=!1;function D(){}function H(){U=!0}const E=b((t,e,n,v)=>{let{stores:s}=e,{page:l}=e,{constructors:i}=e,{components:a=[]}=e,{form:d}=e,{data_0:c=null}=e,{data_1:u=null}=e;x("__svelte__",s),k(s.page.notify),e.stores===void 0&&n.stores&&s!==void 0&&n.stores(s),e.page===void 0&&n.page&&l!==void 0&&n.page(l),e.constructors===void 0&&n.constructors&&i!==void 0&&n.constructors(i),e.components===void 0&&n.components&&a!==void 0&&n.components(a),e.form===void 0&&n.form&&d!==void 0&&n.form(d),e.data_0===void 0&&n.data_0&&c!==void 0&&n.data_0(c),e.data_1===void 0&&n.data_1&&u!==void 0&&n.data_1(u);let r,g,y=t.head;do r=!0,t.head=y,s.page.set(l),g=`  ${i[1]?`${h(i[0]||_,"svelte:component").$$render(t,{data:c,this:a[0]},{this:o=>{a[0]=o,r=!1}},{default:()=>`${h(i[1]||_,"svelte:component").$$render(t,{data:u,form:d,this:a[1]},{this:o=>{a[1]=o,r=!1}},{})}`})}`:`${h(i[0]||_,"svelte:component").$$render(t,{data:c,form:d,this:a[0]},{this:o=>{a[0]=o,r=!1}},{})}`} `;while(!r);return g}),L={app_dir:"_app",app_template_contains_nonce:!1,csp:{mode:"auto",directives:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hash_routing:!1,hooks:null,preload_strategy:"modulepreload",root:E,service_worker:!1,templates:{app:({head:t,body:e,assets:n,nonce:v,env:s})=>`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="`+n+`/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Clean My Mac</title>
		`+t+`
	</head>
	<body>
		<div>`+e+`</div>
		`+n+`
	</body>
</html> `,error:({status:t,message:e})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+e+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+t+`</span>
			<div class="message">
				<h1>`+e+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"1y81ou1"};async function N(){return{handle:void 0,handleFetch:void 0,handleError:void 0,init:void 0,reroute:void 0,transport:void 0}}export{m as a,f as b,O as c,L as d,z as e,U as f,B as g,N as h,I as i,P as j,q as k,D as l,R as m,H as n,S as o,w as p,j as r,C as s};
