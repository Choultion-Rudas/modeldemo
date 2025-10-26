export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': '*',
					}
				});
			}

			const targetPath = url.pathname.replace(/^\/api/, '');
			const targetUrl = new URL(targetPath + url.search, 'https://choultion-rudas-sensevoice.hf.space');

			const hfHeaders = new Headers(request.headers);
			hfHeaders.set('Host', 'choultion-rudas-sensevoice.hf.space');
			hfHeaders.set('Origin', 'https://choultion-rudas-sensevoice.hf.space');

			const hfRequest = new Request(targetUrl.toString(), {
				method: request.method,
				headers: hfHeaders,
				body: request.body,
				redirect: 'follow'
			});

			const hfResponse = await fetch(hfRequest);

			const response = new Response(hfResponse.body, {
				status: hfResponse.status,
				statusText: hfResponse.statusText,
				headers: hfResponse.headers
			});

			response.headers.set('Access-Control-Allow-Origin', '*');

			return response;
		}

		return env.ASSETS.fetch(request);
	}
};