
import { readFileSync } from "fs";

class InventoryEvent extends Event {

    constructor(type, data) {
        super(type);
        this.data = data;
    }

}

class Inventory extends EventTarget {

    constructor() {
        super();
        this.staticData = { items: [], achievements: {} };
        this.money = 0;
        this.items = [];
        this.achievements = [];
        this.getAchievement = this.getAchievement.bind(this);
    }

    _add(item) {
        if (item) {
            this.items.push(item);
            this.dispatchEvent(new InventoryEvent("added_item", item));
        }
    }

    _remove(item) {
        const index = this.items.indexOf(item);
        if (index >= 0) {
            this.items.splice(index, 1);
            this.dispatchEvent(new InventoryEvent("removed_item", item));
            return true;
        }
        return false;
    }

    _findItem(itemName) {
        const matchingItems = this.staticData.items.filter(item => item.name === itemName);
        return matchingItems.length > 0 ? matchingItems[0] : undefined;
    }

    _countItem(itemName) {
        return this.items.filter(item => item === itemName).length;
    }

    loadStaticDataFrom(resourceFile) {
        this.staticData = JSON.parse(readFileSync(resourceFile));
    }

    reset() {
        this.staticData = { items: [], achievements: {} };
        this.items = [];
        this.achievements = [];
        this.money = 0;
    }

    getCurrentMoney() {
        return this.money;
    }

    getAvailableItems() {
        return this.staticData.items;
    }

    getCurrentItems() {
        return this.items;
    }

    getAchievement(name) {
        return { ...this.staticData.achievements[name], name: name };
    }

    getAvailableAchievements() {
        return Object.keys(this.staticData.achievements).map(this.getAchievement);
    }

    getCurrentAchievements() {
        return this.achievements.map(this.getAchievement);
    }

    changeMoney(amount) {
        this.money += amount;
        this.dispatchEvent(new InventoryEvent("changed_money", this.money));
    }

    buy(itemName) {
        const item = this._findItem(itemName);
        if (item.cost > this.money) {
            return false;
        }
        this._add(item.name);
        this.changeMoney(-item.cost);
        this.checkAchievements();
    }

    sell(itemName) {
        const item = this._findItem(itemName);
        if (this._remove(item.name)) {
            this.changeMoney(item.cost);
            this.checkAchievements();
        }
    }

    add(itemName) {
        const item = this._findItem(itemName);
        this._add(item.name);
        this.checkAchievements();
    }

    remove(itemName) {
        const item = this._findItem(itemName);
        if (this._remove(item.name)) {
            this.checkAchievements();
        }
    }

    enableAchievement(name) {
        const achievement = this.getAchievement(name);
        if (achievement && !this.achievements.includes(name)) {
            this.achievements.push(name);
            this.dispatchEvent(new InventoryEvent("achievement", achievement));
        }
    };

    checkAchievements() {
        for (const achievementName in this.staticData.achievements) {
            const achievement = this.getAchievement(achievementName);
            if (!this.achievements.includes(achievementName) && this.checkAchievement(achievement)) {
                this.dispatchEvent(new InventoryEvent("achievement_reached", achievementName));
            }
        }
    }

    checkAchievement(achievement) {
        if (!achievement.requirements) {
            // Some achievements can only be manually triggered
            return false;
        }

        for (const req of achievement.requirements) {
            if (req.items && req.amount) {
                if (req.items.reduce((sum, x) => sum + this._countItem(x), 0) >= req.amount) {
                    return true;
                }
            } else if (req.item && req.amount) {
                if (this._countItem(req.item) >= req.amount) {
                    return true;
                }
            }
        }

        return false;
    };

}

export { Inventory };
