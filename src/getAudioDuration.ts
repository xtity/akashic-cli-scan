import * as fs from "fs";
import * as path from "path";
import * as aacDuration from "aac-duration";
import * as musicMetaData from "musicmetadata";

export function getAudioDuration(filepath: string): Promise<number> {
	var ext = path.extname(filepath);
	switch (ext) {
	case ".aac":
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
	default:
		return Promise.reject<number>(new Error("Unsupported format: " + ext));
	}
}
