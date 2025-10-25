export async function onRequestPost(context) {
	const HF_API_URL = "https://choultion-rudas-sensevoice.hf.space/run/model_inference/";

	try {
		const browserPayload = await context.request.json();

		const hfResponse = await fetch(HF_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
			},
			body: JSON.stringify({ data: [browserPayload] }),
		});

		if (!hfResponse.ok) {
			const errorText = await hfResponse.text();
			throw new Error(`Hugging Face API Error: ${hfResponse.status} - ${errorText}`);
		}

		const hfResult = await hfResponse.json();
		return new Response(JSON.stringify(hfResult), {
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export async function onRequestOptions(context) {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}