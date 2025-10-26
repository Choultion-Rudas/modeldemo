export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
						'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'content-type',
						'Access-Control-Max-Age': '86400',
						'Vary': 'Origin'
					}
				});
			}

			const target = new URL(
				url.pathname.replace(/^\/api/, '') + url.search,
				'https://choultion-rudas-sensevoice.hf.space'
			);

			const upstream = await fetch(target.toString(), {
				method: request.method,
				headers: request.headers,
				body: (request.method === 'GET' || request.method === 'HEAD') ? undefined : request.body,
				redirect: 'follow'
			});

			const h = new Headers(upstream.headers);
			h.set('Access-Control-Allow-Origin', '*');
			h.append('Vary', 'Origin');

			return new Response(upstream.body, {
				status: upstream.status,
				statusText: upstream.statusText,
				headers: h
			});
		}

		return env.ASSETS.fetch(request);
	}
};