import vm from "vm";
import fs from "fs";
import https from "https";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { load } from "cheerio";

class Bard {
	private axios: AxiosInstance;
	private cookies: string = "";

	constructor(cookies: string) {
		this.cookies = cookies;

		const agent = new https.Agent({
			rejectUnauthorized: false,
		});

		let axiosOptions: AxiosRequestConfig = {
			httpsAgent: agent,
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.5",
				"Accept-Encoding": "gzip, deflate, br",
				Connection: "keep-alive",
				"Upgrade-Insecure-Requests": "1",
				"Sec-Fetch-Dest": "document",
				"Sec-Fetch-Mode": "navigate",
				"Sec-Fetch-Site": "none",
				"Sec-Fetch-User": "?1",
				TE: "trailers",
			},
		};

		if (!axiosOptions.proxy) delete axiosOptions.proxy;
		this.axios = axios.create(axiosOptions);
	}

	private Wait(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	private Random(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private ParseResponse(text: string) {
		let resData: {
			r: string;
			c: string;
			rc: string;
			responses: string[];
		} = {
			r: "",
			c: "",
			rc: "",
			responses: [],
		};

		try {
			let parseData = (data: string) => {
				if (typeof data === "string") {
					if (data?.startsWith("c_")) {
						resData.c = data;
						return;
					}
					if (data?.startsWith("r_")) {
						resData.r = data;
						return;
					}
					if (data?.startsWith("rc_")) {
						resData.rc = data;
						return;
					}
					resData.responses.push(data);
				}
				if (Array.isArray(data)) {
					data.forEach((item) => {
						parseData(item);
					});
				}
			};
			try {
				const lines = text.split("\n");
				for (let i in lines) {
					const line = lines[i];
					if (line.includes("wrb.fr")) {
						let data = JSON.parse(line);
						let responsesData = JSON.parse(data[0][2]);
						responsesData.forEach((response: any) => {
							parseData(response);
						});
					}
				}
			} catch (e: any) {
				throw new Error(`Error parsing response: make sure you are using the correct cookie, copy the value of "__Secure-1PSID" cookie and set it like this: \n\nnew Bard("__Secure-1PSID=<COOKIE_VALUE>")\n\nAlso using a US proxy is recommended.\n\nIf this error persists, please open an issue on github.\nhttps://github.com/PawanOsman/GoogleBard`);
			}
		} catch (err) {
			throw new Error(`Error parsing response: make sure you are using the correct cookie, copy the value of "__Secure-1PSID" cookie and set it like this: \n\nnew Bard("__Secure-1PSID=<COOKIE_VALUE>")\n\nAlso using a US proxy is recommended.\n\nIf this error persists, please open an issue on github.\nhttps://github.com/PawanOsman/GoogleBard`);
		}

		return resData;
	}

	private async GetRequestParams() {
		try {
			const response = await this.axios.get("https://bard.google.com", {
				headers: {
					Cookie: this.cookies,
				},
			});
			let $ = load(response.data);
			let script = $("script[data-id=_gd]").html();
			script = script.replace("window.WIZ_global_data", "googleData");
			const context = { googleData: { cfb2h: "", SNlM0e: "" } };
			vm.createContext(context);
			vm.runInContext(script, context);
			const at = context.googleData.SNlM0e;
			const bl = context.googleData.cfb2h;
			return { at, bl };
		} catch (e: any) {
			throw new Error(`Error parsing response: make sure you are using the correct cookie, copy the value of "__Secure-1PSID" cookie and set it like this: \n\nnew Bard("__Secure-1PSID=<COOKIE_VALUE>")\n\nAlso using a US proxy is recommended.\n\nIf this error persists, please open an issue on github.\nhttps://github.com/PawanOsman/GoogleBard`);
		}
	}

	public async ask(prompt: string, conversationId?: string) {
		let resData = await this.send(prompt, conversationId);
		return resData[3];
	}

	public async askStream(data: (arg0: string) => void, prompt: string, conversationId?: string) {
		let resData = await this.send(prompt, conversationId);
		if (!resData) return "";
		if (!resData[3]) return "";
		let responseChunks = resData[3].split(" ");
		for await (let chunk of responseChunks) {
			if (chunk === "") continue;
			data(`${chunk} `);
			await this.Wait(this.Random(25, 250)); // simulate typing
		}
		return resData[3];
	}

	private async send(prompt: string, conversationId?: string) {
		try {
			let { at, bl } = await this.GetRequestParams();
			const response = await this.axios.post(
				"https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
				new URLSearchParams({
					at: at,
					"f.req": JSON.stringify([null, `[[${JSON.stringify(prompt)}],null,${JSON.stringify(['','',''])}]`]),
				}),
				{
					headers: {
						Cookie: this.cookies,
					},
					params: {
						bl: bl,
						rt: "c",
						_reqid: "0",
					},
				},
			);

			let parsedResponse = this.ParseResponse(response.data);

			return parsedResponse.responses;
		} catch (e: any) {
			console.log(e.message);
		}
	}
}

export default Bard;
