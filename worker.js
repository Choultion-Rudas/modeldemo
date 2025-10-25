const HF_HOST = "choultion-rudas-sensevoice.hf.space";
const HF_URL_BASE = `https://${HF_HOST}`;

export default {
	async fetch(request) {
		const url = new URL(request.url);

		const hfUrl = new URL(url.pathname + url.search, HF_URL_BASE);

		const hfHeaders = new Headers(request.headers);
		hfHeaders.set('Host', HF_HOST);
		hfHeaders.set('Origin', HF_URL_BASE);
		hfHeaders.set('Referer', HF_URL_BASE + '/');

		const hfRequest = new Request(hfUrl.toString(), {
			method: request.method,
			headers: hfHeaders,
			body: request.body,
			redirect: 'follow'
		});

		const hfResponse = await fetch(hfRequest);

		const response = new Response(hfResponse.body, hfResponse);
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

		return response;
	}
};