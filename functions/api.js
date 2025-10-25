function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

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
		const base64 = arrayBufferToBase64(arrayBuffer);
		const mimeType = audioFileBlob.type || 'audio/wav';
		const audioDataUrl = `data:${mimeType};base64,${base64}`;

		const payload = {
			audio_input: audioDataUrl,
			language: formData.get("language"),
			output_format: formData.get("output_format"),
			use_itn: formData.get("use_itn") === 'true',
			merge_vad: formData.get("merge_vad") === 'true',
			merge_length: parseFloat(formData.get("merge_length")),
			ban_emo_unk: formData.get("ban_emo_unk") === 'true',
		};

		const hfResponse = await fetch(HF_API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ data: [payload] }),
		});

		if (!hfResponse.ok) {
			const errorText = await hfResponse.text();
			let detail = errorText;
			try {
				const errorJson = JSON.parse(errorText);
				if (errorJson.error) {
					detail = errorJson.error;
				}
			} catch (e) { }
			throw new Error(`Hugging Face API Error: ${hfResponse.status} - ${detail}`);
		}

		const hfResult = await hfResponse.json();

		return new Response(JSON.stringify(hfResult), {
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error("Cloudflare Function Error:", error.message);
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