import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/video-quiz.server-WC5XEOWy.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function getTranscript(videoId, accessToken) {
	const headers = { Authorization: `Bearer ${accessToken}` };
	const captionsResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${encodeURIComponent(videoId)}`, { headers });
	if (!captionsResponse.ok) throw new Error(`YouTube no pudo listar los subtítulos (error ${captionsResponse.status}).`);
	const tracks = (await captionsResponse.json()).items ?? [];
	const track = tracks.find((item) => item.snippet?.language?.startsWith("en")) ?? tracks[0];
	if (!track) throw new Error("No se encontraron subtítulos para este video en tu cuenta de YouTube.");
	const downloadResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${encodeURIComponent(track.id)}?tfmt=srt`, { headers });
	if (!downloadResponse.ok) throw new Error(`YouTube no permitió descargar los subtítulos (error ${downloadResponse.status}). Confirma que tu cuenta administra este video.`);
	const transcript = (await downloadResponse.text()).replace(/<[^>]*>/g, " ").split(/\r?\n/).filter((line) => !/^\s*\d+\s*$/.test(line) && !/^\s*\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/.test(line)).join(" ").replace(/\s+/g, " ").trim();
	if (transcript.length < 40) throw new Error("La API de YouTube no devolvió suficiente texto de subtítulos.");
	return transcript.slice(0, 12e3);
}
var generateVideoQuiz_createServerFn_handler = createServerRpc({
	id: "1776434df495e240b061b120199423c9eeb9d7dd2f7eb4d70adfefd9f854e768",
	name: "generateVideoQuiz",
	filename: "src/lib/video-quiz.server.ts"
}, (opts) => generateVideoQuiz.__executeServer(opts));
var generateVideoQuiz = createServerFn({ method: "POST" }).validator((data) => {
	if (!/^[\w-]{11}$/.test(data.videoId)) throw new Error("El ID del video de YouTube no es válido.");
	if (typeof data.accessToken !== "string" || !data.accessToken.trim() || data.accessToken.length > 5e3) throw new Error("Conecta tu cuenta de Google para leer los subtítulos del video.");
	return {
		videoId: data.videoId,
		accessToken: data.accessToken.trim()
	};
}).handler(generateVideoQuiz_createServerFn_handler, async ({ data }) => getTranscript(data.videoId, data.accessToken));
//#endregion
export { generateVideoQuiz_createServerFn_handler };
