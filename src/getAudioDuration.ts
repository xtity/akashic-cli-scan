import * as fs from "fs";
import * as path from "path";
import * as aacDuration from "aac-duration";
import * as musicMetaData from "musicmetadata";
import { mp4Inspector } from "thumbcoil";

export function getAudioDuration(filepath: string): Promise<number> {
	var ext = path.extname(filepath);
	switch (ext) {
	case ".aac":
		console.warn("[deprecated] " + path.basename(filepath) + " uses deprecated format. Use MP4(AAC) instead of AAC.");
		var d: number;
		try {
			d = aacDuration(filepath);
		} catch (e) {
			return Promise.reject<number>(e);
		}

		return Promise.resolve(d);
	case ".ogg":
		return new Promise((resolve, reject) => {
			musicMetaData(fs.createReadStream(filepath), { duration: true }, (err: any, metadata: MM.Metadata) => {
				if (err) {
					return reject(err);
				}
				resolve(metadata.duration);
			});
		});
	case ".mp4":
		var n: number;
		try {
			var data = fs.readFileSync(filepath);
			var moov = mp4Inspector.inspect(data).filter((o: any) => o.type === "moov")[0]; // 必須BOXなので必ず1つある
			var mvhd = moov.boxes.filter((o: any) => o.type === "mvhd")[0]; // MoVie HeaDer。moov直下の必須フィールドなので必ず1つある
			n = mvhd.duration / mvhd.timescale;
		} catch (e) {
			return Promise.reject<number>(e);
		}

		return Promise.resolve(n);
	default:
		return Promise.reject<number>(new Error("Unsupported format: " + ext));
	}
}
