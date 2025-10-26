const HF_HOSTNAME = 'choultion-rudas-sensevoice.hf.space';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': url.origin,
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
						'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
						'Access-Control-Max-Age': '86400',
						'Vary': 'Origin',
					},
				});
			}

			const targetPath = url.pathname.replace('/api', '');
			const targetUrl = new URL(targetPath + url.search, `httpshttps://${HF_HOSTNAME}`);

			const hfHeaders = new Headers(request.headers);
			hfHeaders.set('Host', HF_HOSTNAME);
			hfHeaders.set('Referer', `https://${HF_HOSTNAME}/`);

			const hfResponse = await fetch(targetUrl.toString(), {
				method: request.method,
				headers: hfHeaders,
				body: (request.method === 'GET' || request.method === 'HEAD') ? null : request.body,
				redirect: 'follow',
			});

			const responseHeaders = new Headers(hfResponse.headers);
			responseHeaders.set('Access-Control-Allow-Origin', url.origin);
			responseHeaders.set('Access-Control-Expose-Headers', '*');
			responseHeaders.append('Vary', 'Origin');

			return new Response(hfResponse.body, {
				status: hfResponse.status,
				statusText: hfResponse.statusText,
				headers: responseHeaders,
			});
		}

		return env.ASSETS.fetch(request);
	}
};