
import WebSocket from "ws";
import anzip from "anzip";
import crypto from "crypto";
import { writeFile, readFile, existsSync } from "fs";
import { promisify } from "util";
import { spawn } from "child_process";

class CommunicationModel {

	constructor(inventory) {
        this.componentId =
          process.env.SCREENCRASH_COMPONENT_ID ||
          crypto.randomBytes(8).toString('hex');
		this.coreConnection = null;
		this.connections = [];
		this.inventory = inventory;
		this._setupInventoryEvents();
		this._setupCoreSocket();

		try {
			this.reloadInventory();
		} catch(e) {
			console.log(`Failed to load static data`);
		}
	}

	_setupInventoryEvents() {
		this.inventory.addEventListener("added_item", this._sendItemsUpdate.bind(this));
		this.inventory.addEventListener("removed_item", this._sendItemsUpdate.bind(this));
		this.inventory.addEventListener("changed_money", this._sendMoneyUpdate.bind(this));
		this.inventory.addEventListener("achievement", this._sendAchievementUpdate.bind(this));
		this.inventory.addEventListener("achievement_reached", this._sendAchievementReachedUpdate.bind(this));
	}

	_setupCoreSocket() {
		const addr = `ws://${process.env.SCREENCRASH_CORE || 'localhost:8001'}/`;
		this.coreConnection = new WebSocket(addr);
		this.coreConnection.onopen = () => {
			console.log(`Connected to core`);
			this._sendToCore({
				type: 'announce',
				client: 'inventory',
				channel: 1
			});
		}
		this.coreConnection.onmessage = (event) => {
			this.handleMessage(event.data);
		};
		this.coreConnection.onclose = () => {
			console.log(`Lost connection to core, reconnecting in 2s...`);
			setTimeout(this._setupCoreSocket.bind(this), 2000);
		};
		this.coreConnection.onerror = () => {
			console.log(`Error on core socket. Closing connection...`);
		};
	}

	_sendItemsUpdate() {
		this._sendToAll({ messageType: "items", items: this.inventory.getCurrentItems() });
	}

	_sendMoneyUpdate() {
		this._sendToAll({ messageType: "money", money: this.inventory.getCurrentMoney() });
	}

	_sendAchievementUpdate(event) {
		const achievement = event.data;
		this._sendToAll({ messageType: "achievement", achievement: achievement });
		this._sendToAll({ messageType: "achievements", achievements: this.inventory.getCurrentAchievements() });
	}

	_sendAchievementReachedUpdate(event) {
		const achievement = event.data;
		this._sendToAll({ messageType: "achievement_reached", achievement: achievement });
	}

	_sendToCore(data) {
		if (this.coreConnection !== null) {
			this.coreConnection.send(JSON.stringify(data));
		}
	}

	_sendToAll(data) {
		this._sendToCore(data);
		for (const conn of this.connections) {
			conn.send(JSON.stringify(data));
		}
	}

	_sendInitialState(sock) {
		sock.send(JSON.stringify({
			messageType: "items",
			items: this.inventory.getCurrentItems()
		}));
		sock.send(JSON.stringify({
			messageType: "money",
			money: this.inventory.getCurrentMoney()
		}));
		sock.send(JSON.stringify({
			messageType: "achievements",
			achievements: this.inventory.getCurrentAchievements()
		}));
	}

	_handleComponentInfoRequest() {
		this._sendToCore({
			messageType: "component_info",
            componentId: this.componentId,
            componentName: "inventory",
            status: "online"
		});
	}

	async _getHashFor(filePath) {
		const readFilePromise = promisify(readFile);
		const data = await readFilePromise(filePath);
		const checksum = crypto.createHash("md5").update(data).digest("hex");
		return checksum;
	}

	async _handleReportChecksumsRequest() {
		const files = {};
		if (existsSync("public/inventory-data.zip")) {
			const hash = await this._getHashFor("public/inventory-data.zip");
			files["inventory-data.zip"] = hash;
		}
		this._sendToCore({ messageType: "file_checksums", files });
	}

	async _syncFile(filepath, data) {
		let filename = filepath.split("/").reverse()[0];
		if (filename === "inventory-data.zip") {
			const writeFilePromise = promisify(writeFile);
			const buffer = Buffer.from(data, "base64");
			const zipPath = "public/inventory-data.zip";
			await writeFilePromise(zipPath, buffer);
			await anzip(zipPath, { outputPath: "public/inventory-data", outputContent: true });
			console.log(`Synced resources`);
		}
		else {
			console.log(`Got resource which isn't inventory-data.zip. Skipping to sync...`);
		}
	}

	addConnection(sock) {
		this.connections.push(sock);

		sock.on("message", (msg) => this.handleMessage(msg));
		sock.on("close", () => this.removeConnection(sock));
		this._sendInitialState(sock);
	}

	removeConnection(sock) {
		const index = this.connections.indexOf(sock);
		if (index >= 0) {
			this.connections.splice(index, 1);
		}
	}

	handleMessage(message_data) {
		try {
			const message = JSON.parse(message_data);
			console.log(`Handling command ${message.command}`);
			switch(message.command) {
                case "req_component_info":
                    this._handleComponentInfoRequest();
                    break;
				case "report_checksums":
					this._handleReportChecksumsRequest();
					break;
				case "file":
					this._syncFile(message.path, message.data);
					break;
				case "buy":
					this.inventory.buy(message.item);
					break;
				case "sell":
					this.inventory.sell(message.item);
					break;
				case "add":
					this.inventory.add(message.item);
					break;
				case "remove":
					this.inventory.remove(message.item);
					break;
				case "change_money":
					this.inventory.changeMoney(message.amount);
					break;
				case "enable_achievement":
					this.inventory.enableAchievement(message.achievement);
					break;
				case "setup":
				case "reset":
					this.inventory.reset();
					this.reloadInventory();
					break;
				case "restart":
					this.restart();
				default:
					console.log(`Unhandled command ${message.command}`);
			}
		}
		catch(e) {
			console.log(`Got error when handling cmd: ${e}`);
		}
	}

	reloadInventory() {
		this.inventory.loadStaticDataFrom("public/inventory-data/inventory-data.json");
	}

	async restart() {
		// Sneaky hack. This will force nodemon to reload.
		const writeFilePromise = promisify(writeFile);
		await writeFilePromise("tmp.restart.js", `Restarting app at ${new Date().toISOString()}`);
	}

}

export { CommunicationModel };