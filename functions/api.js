export async function onRequestPost(context) {
	const SPACE_URL = "https://choultion-rudas-sensevoice.hf.space";

	try {
		const browserPayload = await context.request.json();
		const {
			audio_input,
			language,
			output_format,
			use_itn,
			merge_vad,
			merge_length,
			ban_emo_unk,
		} = browserPayload;

		const match = /^data:(.*?);base64,(.*)$/.exec(audio_input || "");
		if (!match) {
			throw new Error("音频数据不是一个有效的 Data URL");
		}
		const mimeType = match[1];
		const base64Data = match[2];
		const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
		const fileExtension = mimeType.split("/")[1] || "wav";
		const audioFile = new File([fileBytes], `audio.${fileExtension}`, { type: mimeType });

		const formData = new FormData();
		formData.append("files", audioFile, audioFile.name);

		const uploadResponse = await fetch(`${SPACE_URL}/upload`, {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			throw new Error(`上传文件到 Hugging Face Space 失败: ${uploadResponse.status} - ${errorText}`);
		}

		const uploadResult = await uploadResponse.json();
		if (!uploadResult || !uploadResult.files || !uploadResult.files[0]) {
			throw new Error("Hugging Face Space 的 /upload 端点返回了无效的数据");
		}
		const uploadedFileInfo = uploadResult.files[0];

		const predictPayload = {
			data: [
				{
					path: uploadedFileInfo.path,
					url: uploadedFileInfo.url,
					orig_name: uploadedFileInfo.name,
					mime_type: mimeType,
					size: audioFile.size
				},
				language,
				output_format,
				use_itn,
				merge_vad,
				merge_length,
				ban_emo_unk,
			],
		};

		const hfResponse = await fetch(`${SPACE_URL}/api/predict/model_inference`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(predictPayload),
		});

		if (!hfResponse.ok) {
			const errorText = await hfResponse.text();
			throw new Error(`调用 Hugging Face API 失败: ${hfResponse.status} - ${errorText}`);
		}

		const hfResult = await hfResponse.json();
		return new Response(JSON.stringify(hfResult), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});

	} catch (error) {
		return new Response(JSON.stringify({ error: String(error?.message || error) }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
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