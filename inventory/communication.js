
class CommunicationModel {

	constructor(inventory) {
		this.connections = [];
		this.inventory = inventory;
		this._setupInventoryEvents();
		this._setupCoreSocket();
	}

	_setupInventoryEvents() {
		this.inventory.addEventListener("added_item", this._sendItemsUpdate.bind(this));
		this.inventory.addEventListener("removed_item", this._sendItemsUpdate.bind(this));
		this.inventory.addEventListener("changed_money", this._sendMoneyUpdate.bind(this));
		this.inventory.addEventListener("achievement", this._sendAchievementUpdate.bind(this));
		this.inventory.addEventListener("achievement_reached", this._sendAchievementReachedUpdate.bind(this));
	}

	_setupCoreSocket() {
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

	_sendToAll(data) {
		for (const conn of this.connections) {
			conn.send(JSON.stringify(data));
		}
	}

	addConnection(sock) {
		this.connections.push(sock);

		sock.on("message", this.handleMessage.bind(this, sock));

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

	handleMessage(sock, message_data) {
		console.log(`Got message ${message_data}`);
		try {
			const message = JSON.parse(message_data);
			switch(message.cmd) {
				case "file":
					console.log("Got file command. TODO: Implement.");
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
				case "reset":
					this.inventory.reset();
					break;
				default:
					console.log(`Unhandled command ${message.cmd}`);
			}
		}
		catch(e) {
			console.log(`Got error when handling cmd: ${e}`);
		}
	}

}

export { CommunicationModel };