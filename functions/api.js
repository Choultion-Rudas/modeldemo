export async function onRequestPost(context) {
	const HF_API_URL = "https://choultion-rudas-sensevoice.hf.space/run/model_inference";

	try {
		const formData = await context.request.formData();
		const audioFileBlob = formData.get("audio_file");

		if (!audioFileBlob) {
			return new Response(JSON.stringify({ error: "Audio file is required." }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const arrayBuffer = await audioFileBlob.arrayBuffer();
		const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
		const mimeType = audioFileBlob.type || 'audio/wav';
		const audioDataUrl = `data:${mimeType};base64,${base64}`;

		const payload = {
			"data": [
				audioDataUrl,
				formData.get("language"),
				formData.get("output_format"),
				formData.get("use_itn") === 'true',
				formData.get("merge_vad") === 'true',
				parseFloat(formData.get("merge_length")),
				formData.get("ban_emo_unk") === 'true',
			]
		};

		const hfResponse = await fetch(HF_API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!hfResponse.ok) {
			const errorText = await hfResponse.text();
			throw new Error(`Hugging Face API Error: ${hfResponse.status} ${errorText}`);
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